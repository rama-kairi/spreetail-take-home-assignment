import {
	AlertCircle,
	CheckCircle2,
	Clock,
	Package,
	Search,
	XCircle,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Thread } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

interface ThreadListProps {
	threads: Thread[];
	selectedThreadId?: string;
	onThreadSelect: (threadId: string) => void;
}

export function ThreadList({
	threads,
	selectedThreadId,
	onThreadSelect,
}: ThreadListProps) {
	const [searchQuery, setSearchQuery] = useState("");

	// Get priority order for sorting (urgent > high > medium > low)
	const getPriorityOrder = (priority?: string): number => {
		switch (priority?.toLowerCase()) {
			case "urgent":
				return 0;
			case "high":
				return 1;
			case "medium":
				return 2;
			case "low":
				return 3;
			default:
				return 2; // Default to medium
		}
	};

	// Get priority badge color
	const getPriorityColor = (priority?: string) => {
		switch (priority?.toLowerCase()) {
			case "urgent":
			case "high":
				return "destructive";
			case "medium":
				return "default";
			case "low":
				return "secondary";
			default:
				return "secondary";
		}
	};

	// Get priority icon
	const getPriorityIcon = (priority?: string) => {
		switch (priority?.toLowerCase()) {
			case "urgent":
			case "high":
				return <AlertCircle className="h-3 w-3" />;
			case "medium":
				return <Clock className="h-3 w-3" />;
			case "low":
				return <CheckCircle2 className="h-3 w-3" />;
			default:
				return <Clock className="h-3 w-3" />;
		}
	};

	// Get resolution status badge
	const getResolutionBadge = (thread: Thread) => {
		const resolutionStatus = (thread.summary as any)?.structured_data?.resolution_status;
		const summaryStatus = thread.summary?.status;

		// Show "Review" if summary status is pending, otherwise show summary status or resolution status
		if (summaryStatus === "pending" || !summaryStatus) {
			return (
				<Badge variant="secondary" className="text-xs px-2 py-0.5 gap-1">
					<Clock className="h-3 w-3" />
					Review
				</Badge>
			);
		}

		if (summaryStatus === "approved") {
			return (
				<Badge variant="default" className="text-xs px-2 py-0.5 gap-1">
					<CheckCircle2 className="h-3 w-3" />
					Approved
				</Badge>
			);
		}

		if (summaryStatus === "rejected") {
			return (
				<Badge variant="destructive" className="text-xs px-2 py-0.5 gap-1">
					<XCircle className="h-3 w-3" />
					Rejected
				</Badge>
			);
		}

		if (!resolutionStatus) {
			return (
				<Badge variant="secondary" className="text-xs px-2 py-0.5 gap-1">
					<Clock className="h-3 w-3" />
					Review
				</Badge>
			);
		}

		const status = resolutionStatus.toLowerCase();
		if (status === "resolved") {
			return (
				<Badge variant="default" className="text-xs px-2 py-0.5 gap-1">
					<CheckCircle2 className="h-3 w-3" />
					Resolved
				</Badge>
			);
		}
		if (status === "partially resolved") {
			return (
				<Badge variant="default" className="text-xs px-2 py-0.5 gap-1">
					<CheckCircle2 className="h-3 w-3" />
					Partial
				</Badge>
			);
		}
		if (status === "escalated") {
			return (
				<Badge variant="destructive" className="text-xs px-2 py-0.5 gap-1">
					<XCircle className="h-3 w-3" />
					Escalated
				</Badge>
			);
		}
		return (
			<Badge variant="secondary" className="text-xs px-2 py-0.5 gap-1">
				<Clock className="h-3 w-3" />
				Review
			</Badge>
		);
	};

	// Filter and sort threads
	const filteredAndSortedThreads = useMemo(() => {
		// Filter threads based on search query
		let filtered = threads.filter((thread) => {
			if (!searchQuery.trim()) return true;
			const query = searchQuery.toLowerCase();
			return (
				thread.order_id.toLowerCase().includes(query) ||
				thread.product.toLowerCase().includes(query) ||
				thread.topic.toLowerCase().includes(query) ||
				thread.subject.toLowerCase().includes(query)
			);
		});

		// Sort by priority (urgent first)
		return filtered.sort((a, b) => {
			const priorityA = (a.summary as any)?.structured_data?.context_extraction?.urgency_level;
			const priorityB = (b.summary as any)?.structured_data?.context_extraction?.urgency_level;
			return getPriorityOrder(priorityA) - getPriorityOrder(priorityB);
		});
	}, [threads, searchQuery]);

	// Count threads by status
	const statusCounts = {
		review: threads.filter((t) => !t.summary || t.summary.status === "pending")
			.length,
		approved: threads.filter((t) => t.summary?.status === "approved").length,
		rejected: threads.filter((t) => t.summary?.status === "rejected").length,
	};

	return (
		<div className="h-full flex flex-col">
			{/* Fixed Header - Matching right side height */}
			<div className="flex-shrink-0 border-b bg-card/50 px-4 py-3">
				{/* Status Badges - Square, full width, no gaps */}
				<div className="flex items-stretch mb-3 w-full">
					<Badge
						variant="secondary"
						className="gap-1 text-xs flex-1 justify-center rounded-none bg-muted/60 hover:bg-muted/80 border-0 py-2"
					>
						<Clock className="h-3 w-3" />
						{statusCounts.review}
					</Badge>
					<Badge className="gap-1 text-xs flex-1 justify-center rounded-none bg-primary/20 hover:bg-primary/30 border-0 py-2 text-primary">
						<CheckCircle2 className="h-3 w-3" />
						{statusCounts.approved}
					</Badge>
					<Badge
						variant="destructive"
						className="gap-1 text-xs flex-1 justify-center rounded-none bg-destructive/20 hover:bg-destructive/30 border-0 py-2 text-destructive"
					>
						<XCircle className="h-3 w-3" />
						{statusCounts.rejected}
					</Badge>
				</div>

				{/* Search Bar */}
				<div className="relative">
					<Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
					<Input
						type="text"
						placeholder="Search threads..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="pl-8 h-9 text-sm"
					/>
				</div>
			</div>

			{/* Scrollable Thread List */}
			<ScrollArea className="flex-1 min-h-0">
				<div className="p-2 space-y-1.5">
					{filteredAndSortedThreads.length === 0 ? (
						<div className="p-4 text-center text-sm text-muted-foreground">
							No threads found matching "{searchQuery}"
						</div>
					) : (
						filteredAndSortedThreads.map((thread) => {
							const priority = (thread.summary as any)?.structured_data?.context_extraction?.urgency_level;
							const issueType = (thread.summary as any)?.structured_data?.context_extraction?.issue_type;

							return (
								<Card
									key={thread.thread_id}
									className={cn(
										"cursor-pointer transition-all hover:bg-muted/50",
										selectedThreadId === thread.thread_id &&
											"border-primary bg-primary/5 shadow-sm",
									)}
									onClick={() => onThreadSelect(thread.thread_id)}
								>
									<CardContent className="p-3">
										<div className="space-y-2">
											{/* Header: Order ID and Priority */}
											<div className="flex items-start justify-between gap-2">
												<div className="flex-1 min-w-0">
													<p className="font-semibold text-sm truncate">
														Order #{thread.order_id}
													</p>
												</div>
												{priority && (
													<Badge
														variant={getPriorityColor(priority) as any}
														className="text-xs px-1.5 py-0.5 gap-1 flex-shrink-0"
													>
														{getPriorityIcon(priority)}
														<span className="capitalize">{priority}</span>
													</Badge>
												)}
											</div>

											{/* Product and Issue Type */}
											<div className="flex items-center gap-2 text-xs text-muted-foreground">
												<Package className="h-3.5 w-3.5 flex-shrink-0" />
												<span className="font-medium truncate">{thread.product}</span>
											</div>

											{/* Issue Type or Topic */}
											{issueType ? (
												<p className="text-xs text-muted-foreground line-clamp-1">
													{issueType}
												</p>
											) : (
												<p className="text-xs text-muted-foreground line-clamp-1">
													{thread.topic}
												</p>
											)}

											{/* Footer: Resolution Status */}
											<div className="flex items-center justify-between pt-1 border-t">
												{getResolutionBadge(thread)}
												<span className="text-xs text-muted-foreground">
													{thread.messages.length} msg
												</span>
											</div>
										</div>
									</CardContent>
								</Card>
							);
						})
					)}
				</div>
			</ScrollArea>
		</div>
	);
}
