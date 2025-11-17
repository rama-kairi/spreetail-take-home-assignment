import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface RejectDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onConfirm: (reason: string) => void;
}

export function RejectDialog({
	open,
	onOpenChange,
	onConfirm,
}: RejectDialogProps) {
	const [reason, setReason] = useState("");
	const [error, setError] = useState("");

	const handleConfirm = () => {
		if (!reason.trim()) {
			setError("Reason for rejection is required");
			return;
		}
		onConfirm(reason);
		setReason("");
		setError("");
	};

	const handleCancel = () => {
		setReason("");
		setError("");
		onOpenChange(false);
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Reject Summary</DialogTitle>
					<DialogDescription>
						Are you sure you want to reject this summary?
					</DialogDescription>
				</DialogHeader>
				<div className="space-y-4 py-4">
					<div className="space-y-2">
						<Label htmlFor="reason">
							Reason for Rejection <span className="text-destructive">*</span>
						</Label>
						<Textarea
							id="reason"
							value={reason}
							onChange={(e) => {
								setReason(e.target.value);
								setError("");
							}}
							placeholder="Please provide a reason for rejecting this summary..."
							className="min-h-[100px]"
						/>
						{error && (
							<Alert variant="destructive">
								<AlertDescription>{error}</AlertDescription>
							</Alert>
						)}
						<p className="text-xs text-muted-foreground">
							* This field is required
						</p>
					</div>
				</div>
				<DialogFooter>
					<Button variant="outline" onClick={handleCancel}>
						Cancel
					</Button>
					<Button variant="destructive" onClick={handleConfirm}>
						Reject
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
