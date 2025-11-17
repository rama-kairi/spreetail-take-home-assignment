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

interface ApproveDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onConfirm: (remarks: string) => void;
}

export function ApproveDialog({
	open,
	onOpenChange,
	onConfirm,
}: ApproveDialogProps) {
	const [remarks, setRemarks] = useState("");
	const [error, setError] = useState("");

	const handleConfirm = () => {
		if (!remarks.trim()) {
			setError("Remarks are required for approval");
			return;
		}
		onConfirm(remarks);
		setRemarks("");
		setError("");
	};

	const handleCancel = () => {
		setRemarks("");
		setError("");
		onOpenChange(false);
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Approve Summary</DialogTitle>
					<DialogDescription>
						Please add remarks before approving this summary.
					</DialogDescription>
				</DialogHeader>
				<div className="space-y-4 py-4">
					<div className="space-y-2">
						<Label htmlFor="remarks">
							Add Remarks <span className="text-destructive">*</span>
						</Label>
						<Textarea
							id="remarks"
							value={remarks}
							onChange={(e) => {
								setRemarks(e.target.value);
								setError("");
							}}
							placeholder="Add any notes or remarks about this approval..."
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
					<Button onClick={handleConfirm}>Approve</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
