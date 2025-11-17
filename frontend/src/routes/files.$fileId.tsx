import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";
import { ArrowLeft, FileText } from "lucide-react";
import { useEffect } from "react";
import { ErrorBoundary, useConfirmDialog, ThemeToggle } from "@/components/common";
import { ThreadDetail, ThreadList } from "@/components/threads";
import { Button } from "@/components/ui/button";
import { useThreadsWithSummaries } from "@/hooks/threads";
import { useCreateSummary, useUpdateSummary, useApproveSummary, useRejectSummary, useUndoSummary } from "@/hooks/summaries";
import { useFile } from "@/hooks/files";
import { showError, showSuccess } from "@/lib/toast";
import type { Thread } from "@/lib/mock-data";

const searchSchema = z.object({
	tab: z.enum(["summary", "messages", "context"]).optional().catch("summary"),
	threadId: z.string().optional(),
});

export const Route = createFileRoute("/files/$fileId")({
	component: FileThreadsView,
	validateSearch: searchSchema,
	errorComponent: ErrorComponent,
});

function ErrorComponent({ error }: { error: Error }) {
	return (
		<ErrorBoundary>
			<div className="min-h-screen bg-background flex items-center justify-center p-4">
				<div className="text-center space-y-4">
					<h1 className="text-2xl font-bold">Error Loading Threads</h1>
					<p className="text-muted-foreground">{error.message}</p>
				</div>
			</div>
		</ErrorBoundary>
	);
}

function FileThreadsView() {
	const { fileId } = Route.useParams();
	const search = Route.useSearch();
	const navigate = Route.useNavigate();
	// Fetch file details to get the actual file name
	const { data: fileData } = useFile(fileId);
	// Use SSE for real-time updates (no polling needed)
	const { data: threadsData, isLoading } = useThreadsWithSummaries(fileId);
	const createSummaryMutation = useCreateSummary();
	const updateSummaryMutation = useUpdateSummary();
	const approveSummaryMutation = useApproveSummary();
	const rejectSummaryMutation = useRejectSummary();
	const undoSummaryMutation = useUndoSummary();
	const { confirm: confirmDialog, dialog: confirmDialogElement } =
		useConfirmDialog();

	const threads: Thread[] = threadsData?.threads || [];

	// Get threadId from URL, or use first thread as default
	const urlThreadId = search.threadId;
	const defaultThreadId = threads[0]?.thread_id;

	// Determine selected thread: URL param > default thread
	const selectedThreadId = urlThreadId || defaultThreadId;

	// Get tab from URL, default to "summary"
	const activeTab = search.tab || "summary";

	// Handler to update tab in URL
	const handleTabChange = (tab: string) => {
		navigate({
			search: (prev) => ({
				...prev,
				tab: tab as "summary" | "messages" | "context",
			}),
		});
	};

	// Handler to update thread selection in URL
	const handleThreadSelect = (threadId: string) => {
		navigate({
			search: (prev) => ({
				...prev,
				threadId,
			}),
		});
	};

	// Set default tab and thread in URL if not present
	useEffect(() => {
		if (threads.length > 0) {
			const updates: Partial<z.infer<typeof searchSchema>> = {};
			let needsUpdate = false;

			// Set default tab if not present
			if (!search.tab) {
				updates.tab = "summary";
				needsUpdate = true;
			}

			// Set default thread if not present
			if (!search.threadId && defaultThreadId) {
				updates.threadId = defaultThreadId;
				needsUpdate = true;
			}

			// Update URL if needed
			if (needsUpdate) {
				navigate({
					search: (prev) => ({
						...prev,
						...updates,
					}),
					replace: true, // Use replace to avoid adding to history
				});
			}
		}
	}, [threads, search.tab, search.threadId, defaultThreadId, navigate]);

	// Validate threadId from URL - if invalid, reset to first thread
	useEffect(() => {
		if (urlThreadId && threads.length > 0) {
			const threadExists = threads.some((t) => t.thread_id === urlThreadId);
			if (!threadExists && defaultThreadId) {
				// Thread from URL doesn't exist, reset to first thread
				navigate({
					search: (prev) => ({
						...prev,
						threadId: defaultThreadId,
					}),
					replace: true,
				});
			}
		}
	}, [urlThreadId, threads, defaultThreadId, navigate]);

	const selectedThread = threads.find((t) => t.thread_id === selectedThreadId);

	const handleSummaryUpdate = async (threadId: string, summary: string) => {
		const thread = threads.find((t) => t.thread_id === threadId);
		if (!thread?.summary?.id) {
			showError("Summary not found");
			return;
		}

		try {
			await updateSummaryMutation.mutateAsync({
				summary_id: thread.summary.id,
				edited_summary: summary,
			});
			showSuccess("Summary updated successfully");
		} catch (error) {
			showError("Failed to update summary");
		}
	};

	const handleApprove = async (threadId: string, remarks: string) => {
		const thread = threads.find((t) => t.thread_id === threadId);
		if (!thread?.summary?.id) {
			showError("Summary not found");
			return;
		}

		try {
			await approveSummaryMutation.mutateAsync({
				summary_id: thread.summary.id,
				remarks,
			});
			showSuccess("Summary approved successfully");
		} catch (error) {
			showError("Failed to approve summary");
		}
	};

	const handleReject = async (threadId: string, reason: string) => {
		const thread = threads.find((t) => t.thread_id === threadId);
		if (!thread?.summary?.id) {
			showError("Summary not found");
			return;
		}

		try {
			await rejectSummaryMutation.mutateAsync({
				summary_id: thread.summary.id,
				reason,
			});
			showSuccess("Summary rejected");
		} catch (error) {
			showError("Failed to reject summary");
		}
	};

	const handleRegenerate = async (threadId: string) => {
		try {
			await createSummaryMutation.mutateAsync({ thread_id: threadId });
			showSuccess("Summary regenerated successfully");
		} catch (error) {
			showError(
				`Failed to regenerate summary: ${error instanceof Error ? error.message : "Unknown error"}`,
			);
		}
	};

	const handleUndo = async (threadId: string) => {
		const thread = threads.find((t) => t.thread_id === threadId);
		if (!thread?.summary?.id) {
			showError("Summary not found");
			return;
		}

		try {
			await undoSummaryMutation.mutateAsync(thread.summary.id);
			showSuccess("Summary action undone successfully");
		} catch (error) {
			showError("Failed to undo summary action");
		}
	};

	return (
		<>
			{confirmDialogElement}
			<div className="h-screen flex flex-col bg-background overflow-hidden">
			{/* Fixed Header */}
			<header className="flex-shrink-0 border-b bg-card/50 backdrop-blur-sm">
				<div className="px-4 py-3">
					<div className="flex items-center justify-between gap-3">
						<div className="flex items-center gap-3">
							<Link to="/">
								<Button variant="ghost" size="sm" className="gap-2">
									<ArrowLeft className="h-4 w-4" />
									Back
								</Button>
							</Link>
							<div className="h-4 w-px bg-border" />
							<div className="flex items-center gap-2">
								<FileText className="h-4 w-4 text-muted-foreground" />
								<div>
									<h1 className="text-sm font-semibold leading-none">
										{fileData?.file_name || fileId}
									</h1>
									<p className="text-xs text-muted-foreground mt-0.5">
										{threads.length} {threads.length === 1 ? "thread" : "threads"}
									</p>
								</div>
							</div>
						</div>
						<ThemeToggle />
					</div>
				</div>
			</header>

			{/* Main Content Area - Fixed height, flex layout */}
			<div className="flex-1 flex overflow-hidden min-h-0">
				{/* Fixed Left Sidebar - Thread List */}
				<div className="flex-shrink-0 w-80 border-r bg-muted/30 flex flex-col h-full overflow-hidden">
					<ThreadList
						threads={threads}
						selectedThreadId={selectedThreadId}
						onThreadSelect={handleThreadSelect}
					/>
				</div>

				{/* Right Detail View - Scrollable */}
				<div className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
					{selectedThread ? (
						<ThreadDetail
							thread={selectedThread}
							threads={threads}
							onSummaryUpdate={handleSummaryUpdate}
							onApprove={handleApprove}
							onReject={handleReject}
							onRegenerate={handleRegenerate}
							onUndo={handleUndo}
							isRegenerating={createSummaryMutation.isPending}
							activeTab={activeTab}
							onTabChange={handleTabChange}
						/>
					) : (
						<div className="flex-1 flex items-center justify-center">
							<p className="text-muted-foreground">
								Select a thread to view details
							</p>
						</div>
					)}
				</div>
			</div>
		</div>
		</>
	);
}
