import { useQuery } from "@tanstack/react-query";
import { api, fetchWithValidation } from "@/lib/api";
import { filesArraySchema, type FileModel } from "@/lib/schemas";
import { queryKeys } from "@/lib/query-keys";
import { useSSE } from "@/hooks/common";

// Re-export FileModel as File for backward compatibility
export type File = FileModel;

async function fetchFiles(): Promise<FileModel[]> {
	return fetchWithValidation(api.get("files/").json(), filesArraySchema);
}

export function useFiles() {
	// Use SSE for real-time updates instead of polling
	useSSE({ enabled: true });

	return useQuery({
		queryKey: queryKeys.files.all,
		queryFn: fetchFiles,
		staleTime: 1000 * 30, // 30 seconds - SSE will update cache directly
		refetchOnWindowFocus: false, // SSE handles updates
	});
}
