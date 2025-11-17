import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";

async function deleteFile(fileId: string): Promise<void> {
	await api.delete(`files/${fileId}`);
}

export function useDeleteFile() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: deleteFile,
		onSuccess: (_, fileId) => {
			// Remove deleted file from cache
			queryClient.removeQueries({ queryKey: queryKeys.files.detail(fileId) });
			// Invalidate files and threads queries after deletion
			queryClient.invalidateQueries({ queryKey: queryKeys.files.all });
			queryClient.invalidateQueries({ queryKey: queryKeys.threads.all });
		},
	});
}
