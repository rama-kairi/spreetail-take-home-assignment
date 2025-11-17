import { useQueries } from "@tanstack/react-query";
import { api } from "@/lib/api";

interface TaskStatus {
	status: "processing" | "completed" | "failed";
	total: number;
	processed: number;
	failed: number;
	started_at: string;
	completed_at: string | null;
}

async function fetchTaskStatus(taskId: string): Promise<TaskStatus> {
	return api.get(`threads/task/${taskId}/status`).json<TaskStatus>();
}

export function useMultipleTaskStatus(taskIds: string[]) {
	return useQueries({
		queries: taskIds.map((taskId) => ({
			queryKey: ["task-status", taskId],
			queryFn: () => fetchTaskStatus(taskId),
			enabled: !!taskId,
			refetchInterval: (query) => {
				const data = query.state.data;
				if (data?.status === "processing") {
					return 2000; // Poll every 2 seconds while processing
				}
				return false; // Stop polling when completed or failed
			},
		})),
	});
}
