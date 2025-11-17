import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api, fetchWithValidation } from "@/lib/api";
import { type Summary, summarySchema } from "@/lib/schemas";
import { queryKeys } from "@/lib/query-keys";

interface UpdateSummaryData {
	summary_id: string;
	edited_summary: string;
}

async function updateSummary(data: UpdateSummaryData): Promise<Summary> {
	return fetchWithValidation(
		api
			.put(`summaries/${data.summary_id}`, {
				json: { edited_summary: data.edited_summary },
			})
			.json(),
		summarySchema,
	);
}

export function useUpdateSummary() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: updateSummary,
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
