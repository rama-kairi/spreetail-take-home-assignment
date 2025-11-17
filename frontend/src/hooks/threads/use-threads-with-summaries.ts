import { useQuery } from "@tanstack/react-query";
import { api, fetchWithValidation } from "@/lib/api";
import { type ThreadsResponse, threadsResponseSchema, type Summary, summariesArraySchema } from "@/lib/schemas";
import { queryKeys } from "@/lib/query-keys";
import { useSSE } from "@/hooks/common";
import type { Thread } from "@/lib/mock-data";

async function fetchSummaries(): Promise<Summary[]> {
	return fetchWithValidation(
		api.get("summaries").json(),
		summariesArraySchema,
	);
}

export function useThreadsWithSummaries(fileId?: string) {
	// Use SSE for real-time updates instead of polling
	useSSE({ fileId, enabled: true });

	const { data: threadsData, isLoading: threadsLoading } = useQuery({
		queryKey: fileId ? queryKeys.threads.byFile(fileId) : queryKeys.threads.all,
		queryFn: async () => {
			// Add file_id as query parameter if provided
			const url = fileId ? `threads?file_id=${encodeURIComponent(fileId)}` : "threads";
			return fetchWithValidation(api.get(url).json(), threadsResponseSchema);
		},
		staleTime: 1000 * 30, // 30 seconds - SSE will update cache directly
		refetchOnWindowFocus: false, // SSE handles updates
		enabled: true, // Always enabled, but will filter by fileId if provided
	});

	const { data: summaries, isLoading: summariesLoading } = useQuery({
		queryKey: queryKeys.summaries.all,
		queryFn: fetchSummaries,
		staleTime: 1000 * 30, // 30 seconds - SSE will update cache directly
		refetchOnWindowFocus: false, // SSE handles updates
	});

	// Merge summaries with threads
	const threadsWithSummaries: Thread[] = threadsData?.threads.map((thread) => {
		const summary = summaries?.find((s) => s.thread_id === thread.thread_id);
		return {
			...thread,
			summary: summary || undefined,
		};
	}) || [];

	return {
		data: { threads: threadsWithSummaries },
		isLoading: threadsLoading || summariesLoading,
	};
}
