import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";

interface SSEEvent {
	type: "connected" | "file_progress" | "task_status" | "error";
	file_id?: string;
	task_id?: string;
	processed_threads?: number;
	total_threads?: number;
	progress?: number;
	status?: "processing" | "completed" | "failed";
	message?: string;
	[key: string]: unknown;
}

interface UseSSEOptions {
	fileId?: string;
	taskId?: string;
	enabled?: boolean;
	onEvent?: (event: SSEEvent) => void;
}

/**
 * Hook for Server-Sent Events (SSE) to replace polling.
 *
 * @param options - SSE configuration options
 * @returns Connection status and error state
 */
export function useSSE(options: UseSSEOptions = {}) {
	const { fileId, taskId, enabled = true, onEvent } = options;
	const queryClient = useQueryClient();
	const [isConnected, setIsConnected] = useState(false);
	const [error, setError] = useState<Error | null>(null);
	const eventSourceRef = useRef<EventSource | null>(null);

	useEffect(() => {
		if (!enabled) {
			return;
		}

		// Build SSE URL
		const params = new URLSearchParams();
		if (fileId) params.append("file_id", fileId);
		if (taskId) params.append("task_id", taskId);

		const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000/api";
		const url = `${apiUrl}/events/stream?${params.toString()}`;

		// Create EventSource connection
		const eventSource = new EventSource(url);
		eventSourceRef.current = eventSource;

		eventSource.onopen = () => {
			setIsConnected(true);
			setError(null);
		};

		eventSource.onmessage = (event) => {
			try {
				const data: SSEEvent = JSON.parse(event.data);

				// Handle different event types
				switch (data.type) {
					case "connected":
						setIsConnected(true);
						break;

					case "file_progress":
						// Update query cache with new progress
						if (data.file_id) {
							queryClient.setQueryData(
								queryKeys.files.all,
								(old: unknown) => {
									if (!old || !Array.isArray(old)) return old;
									return old.map((file: { id: string; progress?: number; processed_threads?: number; total_threads?: number }) => {
										if (file.id === data.file_id) {
											return {
												...file,
												progress: data.progress ?? file.progress,
												processed_threads: data.processed_threads ?? file.processed_threads,
												total_threads: data.total_threads ?? file.total_threads,
											};
										}
										return file;
									});
								},
							);

							// Also update individual file query if it exists
							queryClient.setQueryData(
								queryKeys.files.detail(data.file_id),
								(old: unknown) => {
									if (!old) return old;
									return {
										...old,
										progress: data.progress,
										processed_threads: data.processed_threads,
										total_threads: data.total_threads,
									};
								},
							);
						}
						break;

					case "task_status":
						// Update task status query cache
						if (data.task_id) {
							queryClient.setQueryData(
								queryKeys.taskStatus.detail(data.task_id),
								data,
							);
						}
						break;

					case "error":
						setError(new Error(data.message || "Unknown error"));
						break;
				}

				// Call custom event handler if provided
				if (onEvent) {
					onEvent(data);
				}
			} catch (err) {
				console.error("Error parsing SSE event:", err);
				setError(err instanceof Error ? err : new Error("Failed to parse SSE event"));
			}
		};

		eventSource.onerror = (err) => {
			console.error("SSE connection error:", err);
			setIsConnected(false);
			setError(new Error("SSE connection failed"));

			// Attempt to reconnect after 3 seconds
			setTimeout(() => {
				if (eventSourceRef.current?.readyState === EventSource.CLOSED) {
					eventSourceRef.current = null;
					// Trigger re-render to reconnect
					setIsConnected(false);
				}
			}, 3000);
		};

		// Cleanup on unmount
		return () => {
			eventSource.close();
			eventSourceRef.current = null;
			setIsConnected(false);
		};
	}, [fileId, taskId, enabled, queryClient, onEvent]);

	return {
		isConnected,
		error,
	};
}
