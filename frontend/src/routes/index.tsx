import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ErrorBoundary } from "@/components/common";
import { FileTable, FileUpload } from "@/components/files";
import { useUploadThreads, useFiles, useDeleteFile, type File } from "@/hooks/files";
import { showError, showSuccess } from "@/lib/toast";
import { useConfirmDialog } from "@/components/common";

export const Route = createFileRoute("/")({
	component: Home,
	errorComponent: ErrorComponent,
});

function ErrorComponent({ error }: { error: Error }) {
	return (
		<ErrorBoundary>
			<div className="min-h-screen bg-background flex items-center justify-center p-4">
				<div className="text-center space-y-4">
					<h1 className="text-2xl font-bold">Error Loading Files</h1>
					<p className="text-muted-foreground">{error.message}</p>
				</div>
			</div>
		</ErrorBoundary>
	);
}

function Home() {
	const navigate = useNavigate();
	const { data: filesData, isLoading } = useFiles();
	const uploadMutation = useUploadThreads();
	const deleteMutation = useDeleteFile();
	const { confirm: confirmDialog, dialog: confirmDialogElement } =
		useConfirmDialog();

	const handleFileUpload = async (file: File) => {
		try {
			const response = await uploadMutation.mutateAsync(file);
			console.log("Upload successful:", response);
			// No need for manual refetch - TanStack Query will automatically refetch
			// active queries after invalidation in the mutation's onSuccess
		} catch (error) {
			console.error("Upload failed:", error);
			showError(
				`Failed to upload file: ${error instanceof Error ? error.message : "Unknown error"}`,
			);
		}
	};

	const handleFileClick = (fileId: string) => {
		// Navigate to threads view for this file
		navigate({ to: "/files/$fileId", params: { fileId } });
	};

	const handleFileDelete = async (fileId: string) => {
		const confirmed = await confirmDialog(
			"Delete File",
			"Are you sure you want to delete this file and all its threads? This action cannot be undone.",
			{
				confirmLabel: "Delete",
				cancelLabel: "Cancel",
				variant: "destructive",
			},
		);

		if (confirmed) {
			try {
				await deleteMutation.mutateAsync(fileId);
				showSuccess("File deleted successfully");
			} catch (error) {
				showError("Failed to delete file. Please try again.");
			}
		}
	};

	// Convert File API model to UploadedFile format for FileTable component
	const files: Array<{
		id: string;
		fileName: string;
		status: "processing" | "completed" | "error";
		totalThreads: number;
		processedThreads: number;
		uploadedAt: Date;
		progress: number;
	}> =
		filesData?.map((f) => ({
			id: f.id,
			fileName: f.file_name,
			status:
				f.progress >= 100
					? ("completed" as const)
					: f.progress > 0
						? ("processing" as const)
						: ("processing" as const),
			totalThreads: f.total_threads,
			processedThreads: f.processed_threads,
			uploadedAt: new Date(f.uploaded_at),
			progress: f.progress,
		})) || [];

	if (isLoading) {
		return (
			<div className="min-h-screen bg-background p-8">
				<div className="mx-auto max-w-6xl">
					<div className="flex items-center justify-center min-h-[80vh]">
						<p className="text-muted-foreground">Loading files...</p>
					</div>
				</div>
			</div>
		);
	}

	return (
		<>
			{confirmDialogElement}
			<div className="min-h-screen bg-background p-8">
			<div className="mx-auto max-w-6xl">
				{files.length === 0 ? (
					<div className="flex flex-col items-center justify-center min-h-[80vh] space-y-6">
						<FileUpload onFileSelect={handleFileUpload} />
					</div>
				) : (
					<FileTable
						files={files}
						onFileClick={handleFileClick}
						onFileDelete={handleFileDelete}
						onFileUpload={handleFileUpload}
					/>
				)}
			</div>
		</div>
		</>
	);
}
