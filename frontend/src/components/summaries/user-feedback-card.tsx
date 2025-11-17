import { RotateCcw, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

interface UserFeedbackCardProps {
	status: "approved" | "rejected";
	comment: string;
	userName?: string;
	onUndo: () => void;
}

export function UserFeedbackCard({
	status,
	comment,
	userName = "System User",
	onUndo,
}: UserFeedbackCardProps) {
	const isApproved = status === "approved";

	return (
		<Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
			<CardHeader>
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<div className="p-2 rounded-lg bg-primary/10">
							<User className="h-5 w-5 text-primary" />
						</div>
						<div>
							<CardTitle className="text-lg">
								{isApproved ? "Approved" : "Rejected"}
							</CardTitle>
							<CardDescription>
								{isApproved
									? "Summary has been approved"
									: "Summary has been rejected"}
							</CardDescription>
						</div>
					</div>
					<Badge
						variant={isApproved ? "default" : "destructive"}
						className="gap-1"
					>
						{isApproved ? "Approved" : "Rejected"}
					</Badge>
				</div>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="space-y-2">
					<p className="text-sm font-medium text-muted-foreground">
						{isApproved ? "Remarks" : "Reason"}
					</p>
					<div className="p-3 rounded-lg bg-muted/50 border">
						<p className="text-sm whitespace-pre-wrap">{comment}</p>
					</div>
				</div>
				<div className="flex items-center justify-between pt-2 border-t">
					<div className="flex items-center gap-2 text-sm text-muted-foreground">
						<User className="h-4 w-4" />
						<span>{userName}</span>
					</div>
					<Button variant="outline" size="sm" onClick={onUndo}>
						<RotateCcw className="mr-1.5 h-4 w-4" />
						Undo
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}
