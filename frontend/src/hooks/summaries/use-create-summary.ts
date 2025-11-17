import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { api, fetchWithValidation } from "@/lib/api";
import { type Summary, summarySchema } from "@/lib/schemas";
import { queryKeys } from "@/lib/query-keys";

const createSummarySchema = z.object({
	thread_id: z.string(),
});

async function createSummary(
	data: z.infer<typeof createSummarySchema>,
): Promise<Summary> {
	return fetchWithValidation(
		api
			.post(`summaries/threads/${data.thread_id}/summarize`, {
				json: data,
			})
			.json(),
		summarySchema,
	);
}

export function useCreateSummary() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: createSummary,
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
