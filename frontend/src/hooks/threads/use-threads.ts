import { useQuery } from "@tanstack/react-query";
import { api, fetchWithValidation } from "@/lib/api";
import { type ThreadsResponse, threadsResponseSchema } from "@/lib/schemas";

async function fetchThreads(): Promise<ThreadsResponse> {
	return fetchWithValidation(api.get("threads").json(), threadsResponseSchema);
}

export function useThreads() {
	return useQuery({
		queryKey: ["threads"],
		queryFn: fetchThreads,
		staleTime: 1000 * 60 * 5, // 5 minutes
	});
}
