import {
	AlertCircle,
	CheckCircle2,
	Clock,
	Tag,
	TrendingDown,
	TrendingUp,
	User,
	XCircle,
	Zap,
} from "lucide-react";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import type { Thread } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

interface SummaryHighlightsProps {
	thread: Thread;
}

interface StructuredData {
	issue_summary?: string;
	key_details?: {
		order_id?: string;
		product?: string;
		customer_name?: string | null;
		customer_email?: string | null;
		order_date?: string | null;
		order_status?: string | null;
		ticket_ids?: string[];
	};
	context_extraction?: {
		issue_type?: string;
		customer_sentiment?: string;
		urgency_level?: string;
		customer_intent?: string;
		key_phrases?: string[];
	};
	resolution_status?: string;
	confidence_scores?: {
		issue_type?: number;
		customer_sentiment?: number;
		urgency_level?: number;
		customer_intent?: number;
		resolution_status?: number;
	} | null;
}

export function SummaryHighlights({ thread }: SummaryHighlightsProps) {
	// Parse structured data from summary
	let structuredData: StructuredData | null = null;
	if (thread.summary) {
		try {
			// Try to get structured_data from the summary if available
			const summaryData = thread.summary as {
				structured_data?: StructuredData;
			} | null;
			if (summaryData?.structured_data) {
				structuredData = summaryData.structured_data;
			}
		} catch (error) {
			console.error("Failed to parse structured data:", error);
		}
	}

	const context = structuredData?.context_extraction;
	const keyDetails = structuredData?.key_details;
	const resolutionStatus = structuredData?.resolution_status || "pending";
	const confidenceScores = structuredData?.confidence_scores;

	const getUrgencyColor = (urgency?: string) => {
		switch (urgency?.toLowerCase()) {
			case "urgent":
				return "destructive";
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

	const getUrgencyIcon = (urgency?: string) => {
		switch (urgency?.toLowerCase()) {
			case "urgent":
			case "high":
				return <AlertCircle className="h-4 w-4" />;
			case "medium":
				return <Clock className="h-4 w-4" />;
			case "low":
				return <CheckCircle2 className="h-4 w-4" />;
			default:
				return <Clock className="h-4 w-4" />;
		}
	};

	const getSentimentColor = (sentiment?: string) => {
		switch (sentiment?.toLowerCase()) {
			case "negative":
				return "destructive";
			case "neutral":
				return "secondary";
			case "positive":
				return "default";
			default:
				return "secondary";
		}
	};

	const getSentimentIcon = (sentiment?: string) => {
		switch (sentiment?.toLowerCase()) {
			case "negative":
				return <TrendingDown className="h-4 w-4" />;
			case "positive":
				return <TrendingUp className="h-4 w-4" />;
			default:
				return <Clock className="h-4 w-4" />;
		}
	};

	const getResolutionColor = (status?: string) => {
		switch (status?.toLowerCase()) {
			case "resolved":
				return "default";
			case "partially resolved":
				return "default";
			case "escalated":
				return "destructive";
			case "pending":
				return "secondary";
			default:
				return "secondary";
		}
	};

	const getConfidenceStyles = (score?: number) => {
		if (!score && score !== 0) return null;
		if (score >= 80) {
			return {
				bgColor: "bg-green-500",
				textColor: "text-white",
			};
		}
		if (score >= 60) {
			return {
				bgColor: "bg-blue-500",
				textColor: "text-white",
			};
		}
		if (score >= 40) {
			return {
				bgColor: "bg-yellow-500",
				textColor: "text-yellow-900 dark:text-yellow-950",
			};
		}
		return {
			bgColor: "bg-orange-500",
			textColor: "text-white",
		};
	};

	const getConfidenceLevel = (s: number) => {
		if (s >= 80) return "Very High";
		if (s >= 60) return "High";
		if (s >= 40) return "Medium";
		return "Low";
	};

	const ConfidenceBadge = ({ score }: { score?: number }) => {
		if (!score && score !== 0) return null;
		const styles = getConfidenceStyles(score);
		if (!styles) return null;

		return (
			<div
				className={cn(
					"flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-semibold ml-auto flex-shrink-0",
					styles.bgColor,
					styles.textColor,
				)}
			>
				{Math.round(score)}
			</div>
		);
	};

	return (
		<TooltipProvider>
			<Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent h-full flex flex-col">
				<CardHeader className="pb-3 flex-shrink-0">
					<div className="flex items-center gap-2">
						<Zap className="h-5 w-5 text-primary" />
						<CardTitle className="text-lg">Quick Insights</CardTitle>
					</div>
				</CardHeader>
				<CardContent className="space-y-3 flex-1 overflow-y-auto min-h-0">
					{/* Urgency Level */}
					<div className="space-y-1.5">
						<p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
							Priority
						</p>
						{confidenceScores?.urgency_level !== undefined &&
						confidenceScores?.urgency_level !== null ? (
							<Tooltip>
								<TooltipTrigger asChild>
									<Badge
										variant={
											getUrgencyColor(
												context?.urgency_level,
											) as BadgeProps["variant"]
										}
										className="gap-1.5 w-full justify-start py-1.5 pr-2 cursor-help"
									>
										<div className="[&>svg]:h-3.5 [&>svg]:w-3.5">
											{getUrgencyIcon(context?.urgency_level)}
										</div>
										<span className="capitalize flex-1 text-xs">
											{context?.urgency_level || "Medium"}
										</span>
										<ConfidenceBadge score={confidenceScores?.urgency_level} />
									</Badge>
								</TooltipTrigger>
								<TooltipContent>
									<p className="text-xs font-semibold">
										Confidence: {Math.round(confidenceScores.urgency_level)}% (
										{getConfidenceLevel(confidenceScores.urgency_level)})
									</p>
									<p className="text-xs text-background/80 mt-1">
										AI confidence for priority level
									</p>
								</TooltipContent>
							</Tooltip>
						) : (
							<Badge
								variant={
									getUrgencyColor(
										context?.urgency_level,
									) as BadgeProps["variant"]
								}
								className="gap-1.5 w-full justify-start py-1.5 pr-2"
							>
								<div className="[&>svg]:h-3.5 [&>svg]:w-3.5">
									{getUrgencyIcon(context?.urgency_level)}
								</div>
								<span className="capitalize flex-1 text-xs">
									{context?.urgency_level || "Medium"}
								</span>
							</Badge>
						)}
					</div>

					{/* Issue Type */}
					<div className="space-y-1.5">
						<p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
							Issue Type
						</p>
						{confidenceScores?.issue_type !== undefined &&
						confidenceScores?.issue_type !== null ? (
							<Tooltip>
								<TooltipTrigger asChild>
									<Badge
										variant="outline"
										className="gap-1.5 w-full justify-start py-1.5 pr-2 cursor-help"
									>
										<Tag className="h-3.5 w-3.5" />
										<span className="capitalize text-xs flex-1">
											{context?.issue_type || thread.topic || "Unknown"}
										</span>
										<ConfidenceBadge score={confidenceScores?.issue_type} />
									</Badge>
								</TooltipTrigger>
								<TooltipContent>
									<p className="text-xs font-semibold">
										Confidence: {Math.round(confidenceScores.issue_type)}% (
										{getConfidenceLevel(confidenceScores.issue_type)})
									</p>
									<p className="text-xs text-background/80 mt-1">
										AI confidence for issue type
									</p>
								</TooltipContent>
							</Tooltip>
						) : (
							<Badge
								variant="outline"
								className="gap-1.5 w-full justify-start py-1.5 pr-2"
							>
								<Tag className="h-3.5 w-3.5" />
								<span className="capitalize text-xs flex-1">
									{context?.issue_type || thread.topic || "Unknown"}
								</span>
							</Badge>
						)}
					</div>

					{/* Customer Intent */}
					<div className="space-y-1.5">
						<p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
							Customer Intent
						</p>
						{confidenceScores?.customer_intent !== undefined &&
						confidenceScores?.customer_intent !== null ? (
							<Tooltip>
								<TooltipTrigger asChild>
									<Badge
										variant="outline"
										className="gap-1.5 w-full justify-start py-1.5 pr-2 cursor-help"
									>
										<User className="h-3.5 w-3.5" />
										<span className="capitalize text-xs flex-1">
											{context?.customer_intent || "Status Inquiry"}
										</span>
										<ConfidenceBadge
											score={confidenceScores?.customer_intent}
										/>
									</Badge>
								</TooltipTrigger>
								<TooltipContent>
									<p className="text-xs font-semibold">
										Confidence: {Math.round(confidenceScores.customer_intent)}%
										({getConfidenceLevel(confidenceScores.customer_intent)})
									</p>
									<p className="text-xs text-background/80 mt-1">
										AI confidence for customer intent
									</p>
								</TooltipContent>
							</Tooltip>
						) : (
							<Badge
								variant="outline"
								className="gap-1.5 w-full justify-start py-1.5 pr-2"
							>
								<User className="h-3.5 w-3.5" />
								<span className="capitalize text-xs flex-1">
									{context?.customer_intent || "Status Inquiry"}
								</span>
							</Badge>
						)}
					</div>

					{/* Customer Sentiment */}
					<div className="space-y-1.5">
						<p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
							Sentiment
						</p>
						{confidenceScores?.customer_sentiment !== undefined &&
						confidenceScores?.customer_sentiment !== null ? (
							<Tooltip>
								<TooltipTrigger asChild>
									<Badge
										variant={
											getSentimentColor(
												context?.customer_sentiment,
											) as BadgeProps["variant"]
										}
										className="gap-1.5 w-full justify-start py-1.5 pr-2 cursor-help"
									>
										<div className="[&>svg]:h-3.5 [&>svg]:w-3.5">
											{getSentimentIcon(context?.customer_sentiment)}
										</div>
										<span className="capitalize flex-1 text-xs">
											{context?.customer_sentiment || "Neutral"}
										</span>
										<ConfidenceBadge
											score={confidenceScores?.customer_sentiment}
										/>
									</Badge>
								</TooltipTrigger>
								<TooltipContent>
									<p className="text-xs font-semibold">
										Confidence:{" "}
										{Math.round(confidenceScores.customer_sentiment)}% (
										{getConfidenceLevel(confidenceScores.customer_sentiment)})
									</p>
									<p className="text-xs text-background/80 mt-1">
										AI confidence for customer sentiment
									</p>
								</TooltipContent>
							</Tooltip>
						) : (
							<Badge
								variant={
									getSentimentColor(
										context?.customer_sentiment,
									) as BadgeProps["variant"]
								}
								className="gap-1.5 w-full justify-start py-1.5 pr-2"
							>
								<div className="[&>svg]:h-3.5 [&>svg]:w-3.5">
									{getSentimentIcon(context?.customer_sentiment)}
								</div>
								<span className="capitalize flex-1 text-xs">
									{context?.customer_sentiment || "Neutral"}
								</span>
							</Badge>
						)}
					</div>

					{/* Resolution Status */}
					<div className="space-y-1.5">
						<p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
							Resolution Status
						</p>
						{confidenceScores?.resolution_status !== undefined &&
						confidenceScores?.resolution_status !== null ? (
							<Tooltip>
								<TooltipTrigger asChild>
									<Badge
										variant={
											getResolutionColor(
												resolutionStatus,
											) as BadgeProps["variant"]
										}
										className="gap-1.5 w-full justify-start py-1.5 pr-2 cursor-help"
									>
										{resolutionStatus.toLowerCase() === "resolved" ? (
											<CheckCircle2 className="h-3.5 w-3.5" />
										) : resolutionStatus.toLowerCase() ===
											"partially resolved" ? (
											<CheckCircle2 className="h-3.5 w-3.5" />
										) : resolutionStatus.toLowerCase() === "escalated" ? (
											<XCircle className="h-3.5 w-3.5" />
										) : (
											<Clock className="h-3.5 w-3.5" />
										)}
										<span className="capitalize flex-1 text-xs">
											{resolutionStatus}
										</span>
										<ConfidenceBadge
											score={confidenceScores?.resolution_status}
										/>
									</Badge>
								</TooltipTrigger>
								<TooltipContent>
									<p className="text-xs font-semibold">
										Confidence: {Math.round(confidenceScores.resolution_status)}
										% ({getConfidenceLevel(confidenceScores.resolution_status)})
									</p>
									<p className="text-xs text-background/80 mt-1">
										AI confidence for resolution status
									</p>
								</TooltipContent>
							</Tooltip>
						) : (
							<Badge
								variant={
									getResolutionColor(resolutionStatus) as BadgeProps["variant"]
								}
								className="gap-1.5 w-full justify-start py-1.5 pr-2"
							>
								{resolutionStatus.toLowerCase() === "resolved" ? (
									<CheckCircle2 className="h-3.5 w-3.5" />
								) : resolutionStatus.toLowerCase() === "partially resolved" ? (
									<CheckCircle2 className="h-3.5 w-3.5" />
								) : resolutionStatus.toLowerCase() === "escalated" ? (
									<XCircle className="h-3.5 w-3.5" />
								) : (
									<Clock className="h-3.5 w-3.5" />
								)}
								<span className="capitalize flex-1 text-xs">
									{resolutionStatus}
								</span>
							</Badge>
						)}
					</div>

					{/* Stats */}
					<div className="space-y-3 pt-2 border-t">
						{keyDetails?.ticket_ids && keyDetails.ticket_ids.length > 0 && (
							<div className="flex items-center justify-between text-sm">
								<div className="flex items-center gap-2 text-muted-foreground">
									<Tag className="h-4 w-4" />
									<span>Tickets</span>
								</div>
								<Badge variant="outline">{keyDetails.ticket_ids.length}</Badge>
							</div>
						)}

						<div className="flex items-center justify-between text-sm">
							<div className="flex items-center gap-2 text-muted-foreground">
								<User className="h-4 w-4" />
								<span>Messages</span>
							</div>
							<Badge variant="outline">{thread.messages.length}</Badge>
						</div>
					</div>
				</CardContent>
			</Card>
		</TooltipProvider>
	);
}
