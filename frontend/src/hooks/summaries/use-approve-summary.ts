import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api, fetchWithValidation } from "@/lib/api";
import { type Summary, summarySchema } from "@/lib/schemas";
import { queryKeys } from "@/lib/query-keys";

interface ApproveSummaryData {
	summary_id: string;
	remarks: string;
}

async function approveSummary(data: ApproveSummaryData): Promise<Summary> {
	return fetchWithValidation(
		api
			.post(`summaries/${data.summary_id}/approve`, {
				json: { remarks: data.remarks },
			})
			.json(),
		summarySchema,
	);
}

export function useApproveSummary() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: approveSummary,
		onSuccess: (data) => {
			// Update summary in cache
			queryClient.setQueryData(queryKeys.summaries.detail(data.id), data);
			// Invalidate related queries
			queryClient.invalidateQueries({ queryKey: queryKeys.threads.all });
			queryClient.invalidateQueries({ queryKey: queryKeys.summaries.all });
		},
	});
}
