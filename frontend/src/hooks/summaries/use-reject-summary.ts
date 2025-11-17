import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api, fetchWithValidation } from "@/lib/api";
import { type Summary, summarySchema } from "@/lib/schemas";
import { queryKeys } from "@/lib/query-keys";

interface RejectSummaryData {
	summary_id: string;
	reason: string;
}

async function rejectSummary(data: RejectSummaryData): Promise<Summary> {
	return fetchWithValidation(
		api
			.post(`summaries/${data.summary_id}/reject`, {
				json: { reason: data.reason },
			})
			.json(),
		summarySchema,
	);
}

export function useRejectSummary() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: rejectSummary,
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
