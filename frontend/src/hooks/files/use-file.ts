import { useQuery } from "@tanstack/react-query";
import { api, fetchWithValidation } from "@/lib/api";
import { fileModelSchema, type FileModel } from "@/lib/schemas";
import { queryKeys } from "@/lib/query-keys";
import { useSSE } from "@/hooks/common";

async function fetchFile(fileId: string): Promise<FileModel> {
	return fetchWithValidation(
		api.get(`files/${fileId}`).json(),
		fileModelSchema,
	);
}

export function useFile(fileId: string) {
	// Use SSE for real-time updates for this specific file
	useSSE({ fileId, enabled: !!fileId });

	return useQuery({
		queryKey: queryKeys.files.detail(fileId),
		queryFn: () => fetchFile(fileId),
		enabled: !!fileId, // Only fetch if fileId is provided
		staleTime: 1000 * 60 * 5, // 5 minutes - SSE will update cache directly
		refetchOnWindowFocus: false, // SSE handles updates
	});
}
