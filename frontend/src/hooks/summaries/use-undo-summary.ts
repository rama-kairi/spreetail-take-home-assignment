import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api, fetchWithValidation } from "@/lib/api";
import { type Summary, summarySchema } from "@/lib/schemas";
import { queryKeys } from "@/lib/query-keys";

async function undoSummary(summary_id: string): Promise<Summary> {
	return fetchWithValidation(
		api.post(`summaries/${summary_id}/undo`).json(),
		summarySchema,
	);
}

export function useUndoSummary() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: undoSummary,
		onSuccess: (data) => {
			// Update summary in cache
			queryClient.setQueryData(queryKeys.summaries.detail(data.id), data);
			queryClient.setQueryData(queryKeys.summaries.byThread(data.thread_id), data);
			// Invalidate related queries
			queryClient.invalidateQueries({ queryKey: queryKeys.threads.all });
			queryClient.invalidateQueries({ queryKey: queryKeys.summaries.all });
		},
	});
}
