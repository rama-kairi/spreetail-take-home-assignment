import {
	Building2,
	CheckCircle2,
	Clock,
	FileText,
	Info,
	Mail,
	Package,
	RefreshCw,
	Save,
	Sparkles,
	User,
	XCircle,
	Eye,
	Edit,
	Loader2,
} from "lucide-react";
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import type { Thread } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { ApproveDialog, RejectDialog, SummaryHighlights, UserFeedbackCard } from "@/components/summaries";
import { MarkdownRenderer } from "@/components/common";

interface ThreadDetailProps {
	thread: Thread;
	threads: Thread[];
	onSummaryUpdate: (threadId: string, summary: string) => void;
	onApprove: (threadId: string, remarks: string) => void;
	onReject: (threadId: string, reason: string) => void;
	onRegenerate: (threadId: string) => void;
	onUndo: (threadId: string) => void;
	isRegenerating?: boolean;
	activeTab?: string;
	onTabChange?: (tab: string) => void;
}

export function ThreadDetail({
	thread,
	threads: _threads,
	onSummaryUpdate,
	onApprove,
	onReject,
	onRegenerate,
	onUndo,
	isRegenerating = false,
	activeTab: controlledActiveTab,
	onTabChange,
}: ThreadDetailProps) {
	const summaryStatus = thread.summary?.status;
	const isApprovedOrRejected = summaryStatus === "approved" || summaryStatus === "rejected";
	const [editedSummary, setEditedSummary] = useState(
		thread.summary?.edited_summary || thread.summary?.original_summary || "",
	);
	const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
	const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
	const [isEditing, setIsEditing] = useState(false);

	// Use controlled tab from URL if provided, otherwise use local state
	const [localActiveTab, setLocalActiveTab] = useState("summary");
	const activeTab = controlledActiveTab ?? localActiveTab;

	// Handler for tab changes - update URL if callback provided, otherwise update local state
	const handleTabChange = (tab: string) => {
		if (onTabChange) {
			onTabChange(tab);
		} else {
			setLocalActiveTab(tab);
		}
	};

	// Update edited summary when thread summary changes (from polling)
	useEffect(() => {
		const newSummary = thread.summary?.edited_summary || thread.summary?.original_summary || "";
		if (newSummary && newSummary !== editedSummary) {
			setEditedSummary(newSummary);
		}
	}, [thread.summary, editedSummary]);

	const formatTimestamp = (timestamp: string) => {
		return new Intl.DateTimeFormat("en-US", {
			month: "short",
			day: "numeric",
			year: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		}).format(new Date(timestamp));
	};

	const getStatusBadge = () => {
		if (!thread.summary) {
			return (
				<Badge variant="secondary" className="gap-1">
					<Clock className="h-3 w-3" />
					No Summary
				</Badge>
			);
		}
		switch (thread.summary.status) {
			case "pending":
				return (
					<Badge variant="secondary" className="gap-1">
						<Clock className="h-3 w-3" />
						Pending Review
					</Badge>
				);
			case "approved":
				return (
					<Badge className="gap-1">
						<CheckCircle2 className="h-3 w-3" />
						Approved
					</Badge>
				);
			case "rejected":
				return (
					<Badge variant="destructive" className="gap-1">
						<XCircle className="h-3 w-3" />
						Rejected
					</Badge>
				);
			default:
				return <Badge variant="outline">Unknown</Badge>;
		}
	};

	const handleSave = () => {
		onSummaryUpdate(thread.thread_id, editedSummary);
		setIsEditing(false);
	};

	const handleToggleEdit = () => {
		if (isEditing) {
			// Save when exiting edit mode
			handleSave();
		} else {
			setIsEditing(true);
		}
	};

	return (
		<Tabs
			value={activeTab}
			onValueChange={handleTabChange}
			className="h-full w-full flex flex-col overflow-hidden relative"
		>
			{/* Header Section - Fixed */}
			<div className="flex-shrink-0 border-b bg-background px-3 py-3">
				<div className="flex items-start justify-between gap-4">
					<div className="flex-1 space-y-2">
						<div className="flex items-center gap-3">
							<div className="p-2 rounded-lg bg-primary/10">
								<Mail className="h-5 w-5 text-primary" />
							</div>
							<div className="flex-1">
								<h1 className="text-lg font-semibold tracking-tight">
									{thread.subject}
								</h1>
								{/* Stats Badges - Replaces description */}
								<div className="flex flex-wrap items-center gap-2 mt-2">
									<Badge variant="outline" className="gap-1.5">
										<Package className="h-3.5 w-3.5" />
										{thread.product}
									</Badge>
									<Badge variant="outline" className="gap-1.5">
										{thread.initiated_by === "customer" ? (
											<User className="h-3.5 w-3.5" />
										) : (
											<Building2 className="h-3.5 w-3.5" />
										)}
										<span className="capitalize">{thread.initiated_by}</span>
									</Badge>
									<Badge variant="outline" className="gap-1.5">
										<Mail className="h-3.5 w-3.5" />
										{thread.messages.length}{" "}
										{thread.messages.length === 1 ? "message" : "messages"}
									</Badge>
								</div>
							</div>
						</div>
					</div>
					{/* Tabs on the right side */}
					<TabsList className="h-auto p-1 bg-muted/50 flex-shrink-0">
						<TabsTrigger
							value="summary"
							className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-md data-[state=active]:shadow-primary/20"
						>
							<Sparkles className="h-4 w-4" />
							Summary
							{thread.summary && (
								<Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
									{thread.summary.status === "pending"
										? "Review"
										: thread.summary.status}
								</Badge>
							)}
						</TabsTrigger>
						<TabsTrigger
							value="messages"
							className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-md data-[state=active]:shadow-primary/20"
						>
							<Mail className="h-4 w-4" />
							Messages
							<Badge variant="outline" className="ml-1 h-5 px-1.5 text-xs">
								{thread.messages.length}
							</Badge>
						</TabsTrigger>
						<TabsTrigger
							value="context"
							className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-md data-[state=active]:shadow-primary/20"
						>
							<Info className="h-4 w-4" />
							CRM Context
						</TabsTrigger>
					</TabsList>
				</div>
			</div>

			{/* Tabs Content Area */}
			<div className="flex-1 flex flex-col overflow-hidden min-h-0 relative">
				{/* Right Column - Fixed Highlights Card (only visible on summary tab) */}
				{activeTab === "summary" && (
					<div className="hidden lg:block absolute right-6 top-[10px] bottom-[calc(52px+10px)] w-[350px] z-10 pointer-events-none">
						<div className="h-full pointer-events-auto">
							<SummaryHighlights thread={thread} />
						</div>
					</div>
				)}

				{/* Scrollable Tab Content */}
				<ScrollArea className="flex-1 min-h-0">
					<div className="p-3 pb-32 space-y-6">
						{/* Summary Tab - Two Column Layout */}
						<TabsContent value="summary" className="space-y-6">
							{/* Left Column - Summary Content (with right margin for fixed card) */}
							<div className="space-y-4 lg:mr-[370px]">
									<Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
										<CardHeader>
											<div className="flex items-center justify-between">
												<div className="flex items-center gap-2">
													<div className="p-2 rounded-lg bg-primary/10">
														<Sparkles className="h-5 w-5 text-primary" />
													</div>
													<div>
														<CardTitle className="text-lg">
															AI-Generated Summary
														</CardTitle>
														<CardDescription>
															Review and edit the summary before approval
														</CardDescription>
													</div>
												</div>
												{!isApprovedOrRejected && (
													<div className="flex items-center gap-2">
														<Button
															variant="outline"
															size="sm"
															onClick={handleToggleEdit}
														>
															{isEditing ? (
																<>
																	<Eye className="mr-1.5 h-4 w-4" />
																	Preview
																</>
															) : (
																<>
																	<Edit className="mr-1.5 h-4 w-4" />
																	Edit
																</>
															)}
														</Button>
														<Button
															variant="outline"
															size="sm"
															onClick={() => onRegenerate(thread.thread_id)}
															disabled={isRegenerating}
														>
															{isRegenerating ? (
																<>
																	<Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
																	Generating...
																</>
															) : (
																<>
																	<RefreshCw className="mr-1.5 h-4 w-4" />
																	{thread.summary ? "Regenerate Summary" : "Generate Summary"}
																</>
															)}
														</Button>
														{isEditing && (
															<Button variant="outline" size="sm" onClick={handleSave}>
																<Save className="mr-1.5 h-4 w-4" />
																Save Draft
															</Button>
														)}
													</div>
												)}
											</div>
										</CardHeader>
										<CardContent className="space-y-4">
											{isEditing ? (
												<Textarea
													value={editedSummary}
													onChange={(e) => setEditedSummary(e.target.value)}
													className="min-h-[400px] font-mono text-sm leading-relaxed resize-none"
													placeholder="Summary will appear here... (Markdown supported)"
												/>
											) : (
												<div className="min-h-[400px] p-4 rounded-lg border bg-muted/30">
													{editedSummary ? (
														<MarkdownRenderer content={editedSummary} />
													) : (
														<div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center space-y-4">
															<div className="p-4 rounded-full bg-primary/10">
																<Loader2 className="h-8 w-8 text-primary animate-spin" />
															</div>
															<div className="space-y-2">
																<p className="text-foreground font-medium">
																	Generating AI Summary
																</p>
																<p className="text-muted-foreground text-sm max-w-md">
																	The AI is analyzing this thread and generating a summary.
																	This may take a few moments. You can view the messages
																	in the meantime.
																</p>
															</div>
															<Button
																variant="outline"
																size="sm"
																onClick={() => onRegenerate(thread.thread_id)}
																disabled={isRegenerating}
																className="mt-4"
															>
																{isRegenerating ? (
																	<>
																		<Loader2 className="mr-2 h-4 w-4 animate-spin" />
																		Generating...
																	</>
																) : (
																	<>
																		<RefreshCw className="mr-2 h-4 w-4" />
																		Generate Summary Now
																	</>
																)}
															</Button>
														</div>
													)}
												</div>
											)}
										</CardContent>
									</Card>

									{/* User Feedback Card - Show when approved or rejected */}
									{isApprovedOrRejected && thread.summary && (
										<UserFeedbackCard
											status={summaryStatus as "approved" | "rejected"}
											comment={
												summaryStatus === "approved"
													? thread.summary.remarks || ""
													: thread.summary.rejection_reason || ""
											}
											userName={thread.summary.approved_by || "System User"}
											onUndo={() => onUndo(thread.thread_id)}
										/>
									)}
								</div>
						</TabsContent>

						{/* Messages Tab */}
						<TabsContent value="messages">
							<Card className="border-2">
								<CardHeader className="pb-4">
									<div className="flex items-center justify-between">
										<div className="flex items-center gap-2">
											<Mail className="h-5 w-5 text-muted-foreground" />
											<CardTitle className="text-lg">Conversation</CardTitle>
										</div>
										<Badge variant="outline" className="gap-1">
											{thread.messages.length}{" "}
											{thread.messages.length === 1 ? "message" : "messages"}
										</Badge>
									</div>
								</CardHeader>
								<CardContent>
									<div className="space-y-6">
										{thread.messages.map((message, index) => (
											<div
												key={message.id}
												className={cn(
													"relative group",
													index !== thread.messages.length - 1 &&
														"pb-6 border-b border-dashed",
												)}
											>
												<div className="flex gap-4">
													{/* Avatar */}
													<div
														className={cn(
															"flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium",
															message.sender === "customer"
																? "bg-primary/10 text-primary"
																: "bg-muted text-muted-foreground",
														)}
													>
														{message.sender === "customer" ? (
															<User className="h-5 w-5" />
														) : (
															<Building2 className="h-5 w-5" />
														)}
													</div>

													{/* Message Content */}
													<div className="flex-1 min-w-0">
														<div className="flex items-center gap-3 mb-2">
															<span className="font-semibold text-sm">
																{message.sender === "customer"
																	? "Customer"
																	: "Support Team"}
															</span>
															<span className="text-xs text-muted-foreground flex items-center gap-1">
																<Clock className="h-3 w-3" />
																{formatTimestamp(message.timestamp)}
															</span>
														</div>
														<div
															className={cn(
																"prose prose-sm max-w-none text-sm leading-relaxed",
																"text-foreground whitespace-pre-wrap break-words",
															)}
														>
															{message.body}
														</div>
													</div>
												</div>
											</div>
										))}
									</div>
								</CardContent>
							</Card>
						</TabsContent>

						{/* CRM Context Tab */}
						<TabsContent value="context" className="mt-0">
							<Card>
								<CardHeader>
									<div className="flex items-center gap-2">
										<Info className="h-5 w-5 text-muted-foreground" />
										<CardTitle className="text-lg">CRM Context</CardTitle>
									</div>
									<CardDescription>
										Detailed information about this customer interaction
									</CardDescription>
								</CardHeader>
								<CardContent>
									<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
										<div className="space-y-4">
											<div>
												<p className="text-sm font-medium text-muted-foreground mb-1">
													Order Information
												</p>
												<div className="space-y-2">
													<div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
														<span className="text-sm text-muted-foreground">
															Order ID
														</span>
														<span className="text-sm font-mono font-semibold">
															{thread.order_id}
														</span>
													</div>
													<div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
														<span className="text-sm text-muted-foreground">
															Product
														</span>
														<div className="flex items-center gap-2">
															<Package className="h-4 w-4 text-muted-foreground" />
															<span className="text-sm font-semibold">
																{thread.product}
															</span>
														</div>
													</div>
												</div>
											</div>

											<div>
												<p className="text-sm font-medium text-muted-foreground mb-1">
													Thread Details
												</p>
												<div className="space-y-2">
													<div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
														<span className="text-sm text-muted-foreground">
															Topic
														</span>
														<span className="text-sm font-semibold">
															{thread.topic}
														</span>
													</div>
													<div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
														<span className="text-sm text-muted-foreground">
															Initiated By
														</span>
														<div className="flex items-center gap-2">
															{thread.initiated_by === "customer" ? (
																<User className="h-4 w-4 text-muted-foreground" />
															) : (
																<Building2 className="h-4 w-4 text-muted-foreground" />
															)}
															<span className="text-sm font-semibold capitalize">
																{thread.initiated_by}
															</span>
														</div>
													</div>
													<div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
														<span className="text-sm text-muted-foreground">
															Message Count
														</span>
														<div className="flex items-center gap-2">
															<Mail className="h-4 w-4 text-muted-foreground" />
															<span className="text-sm font-semibold">
																{thread.messages.length} messages
															</span>
														</div>
													</div>
												</div>
											</div>
										</div>

										<div className="space-y-4">
											<div>
												<p className="text-sm font-medium text-muted-foreground mb-1">
													Summary Status
												</p>
												<div className="p-3 rounded-lg bg-muted/50">
													<div className="flex items-center justify-between">
														<span className="text-sm text-muted-foreground">
															Status
														</span>
														{getStatusBadge()}
													</div>
												</div>
											</div>

											<div>
												<p className="text-sm font-medium text-muted-foreground mb-1">
													Thread Metadata
												</p>
												<div className="space-y-2">
													<div className="p-3 rounded-lg bg-muted/50">
														<p className="text-sm text-muted-foreground mb-1">
															Subject
														</p>
														<p className="text-sm font-semibold">
															{thread.subject}
														</p>
													</div>
													<div className="p-3 rounded-lg bg-muted/50">
														<p className="text-sm text-muted-foreground mb-1">
															Thread ID
														</p>
														<p className="text-sm font-mono font-semibold">
															{thread.thread_id}
														</p>
													</div>
												</div>
											</div>
										</div>
									</div>
								</CardContent>
							</Card>
						</TabsContent>
					</div>
				</ScrollArea>
			</div>

			{/* Sticky Action Bar - Fixed at Bottom - Only show when not approved/rejected */}
			{!isApprovedOrRejected && (
				<div className="absolute bottom-0 left-0 right-0 border-t bg-background/95 backdrop-blur-sm">
					<div className="px-4 py-2">
						<div className="flex items-center justify-between gap-3">
							<span className="text-xs text-muted-foreground">Review and take action</span>
							<div className="flex gap-2">
								<Button
									variant="outline"
									size="sm"
									onClick={() => setIsRejectDialogOpen(true)}
									disabled={!thread.summary}
									className="h-8"
								>
									<XCircle className="mr-1.5 h-3.5 w-3.5" />
									Reject
								</Button>
								<Button
									size="sm"
									onClick={() => setIsApproveDialogOpen(true)}
									disabled={!thread.summary}
									className="h-8"
								>
									<CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
									Approve & Save
								</Button>
							</div>
						</div>
					</div>
				</div>
			)}

			{/* Dialogs */}
			<ApproveDialog
				open={isApproveDialogOpen}
				onOpenChange={setIsApproveDialogOpen}
				onConfirm={(remarks) => {
					onApprove(thread.thread_id, remarks);
					setIsApproveDialogOpen(false);
				}}
			/>
			<RejectDialog
				open={isRejectDialogOpen}
				onOpenChange={setIsRejectDialogOpen}
				onConfirm={(reason) => {
					onReject(thread.thread_id, reason);
					setIsRejectDialogOpen(false);
				}}
			/>
		</Tabs>
	);
}
