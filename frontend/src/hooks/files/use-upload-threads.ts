import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api, fetchWithValidation } from "@/lib/api";
import { fileUploadResponseSchema, type FileUploadResponse } from "@/lib/schemas";
import { queryKeys } from "@/lib/query-keys";

async function uploadFile(file: File): Promise<FileUploadResponse> {
	const formData = new FormData();
	formData.append("file", file);

	// Use ky with FormData - ky automatically handles Content-Type header with boundary
	// Don't set Content-Type manually - ky will set multipart/form-data with boundary automatically
	return fetchWithValidation(
		api.post("files/upload", {
			body: formData,
			// Explicitly don't set Content-Type - ky handles it automatically for FormData
		}).json(),
		fileUploadResponseSchema,
	);
}

export function useUploadThreads() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: uploadFile,
		onSuccess: () => {
			// Invalidate queries - TanStack Query will automatically refetch active queries
			// SSE will also update cache in real-time
			queryClient.invalidateQueries({ queryKey: queryKeys.files.all });
			queryClient.invalidateQueries({ queryKey: queryKeys.threads.all });
		},
		onError: (error) => {
			console.error("Upload error:", error);
		},
	});
}
