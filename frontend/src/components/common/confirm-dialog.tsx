import { useState } from "react";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ConfirmDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	title: string;
	description: string;
	confirmLabel?: string;
	cancelLabel?: string;
	onConfirm: () => void;
	variant?: "default" | "destructive";
}

export function ConfirmDialog({
	open,
	onOpenChange,
	title,
	description,
	confirmLabel = "Confirm",
	cancelLabel = "Cancel",
	onConfirm,
	variant = "default",
}: ConfirmDialogProps) {
	const handleConfirm = () => {
		onConfirm();
		onOpenChange(false);
	};

	return (
		<AlertDialog open={open} onOpenChange={onOpenChange}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>{title}</AlertDialogTitle>
					<AlertDialogDescription>{description}</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>{cancelLabel}</AlertDialogCancel>
					<AlertDialogAction
						onClick={handleConfirm}
						className={
							variant === "destructive"
								? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
								: undefined
						}
					>
						{confirmLabel}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}

/**
 * Hook to show a confirmation dialog.
 * Returns a function that shows the dialog and returns a promise that resolves to true/false.
 */
export function useConfirmDialog() {
	const [open, setOpen] = useState(false);
	const [config, setConfig] = useState<{
		title: string;
		description: string;
		confirmLabel?: string;
		cancelLabel?: string;
		variant?: "default" | "destructive";
		resolve: (value: boolean) => void;
	} | null>(null);

	const confirm = (
		title: string,
		description: string,
		options?: {
			confirmLabel?: string;
			cancelLabel?: string;
			variant?: "default" | "destructive";
		},
	): Promise<boolean> => {
		return new Promise((resolve) => {
			setConfig({
				title,
				description,
				confirmLabel: options?.confirmLabel,
				cancelLabel: options?.cancelLabel,
				variant: options?.variant,
				resolve,
			});
			setOpen(true);
		});
	};

	const handleConfirm = () => {
		if (config) {
			config.resolve(true);
			setConfig(null);
		}
		setOpen(false);
	};

	const handleCancel = () => {
		if (config) {
			config.resolve(false);
			setConfig(null);
		}
		setOpen(false);
	};

	const dialog = config ? (
		<ConfirmDialog
			open={open}
			onOpenChange={setOpen}
			title={config.title}
			description={config.description}
			confirmLabel={config.confirmLabel}
			cancelLabel={config.cancelLabel}
			variant={config.variant}
			onConfirm={handleConfirm}
		/>
	) : null;

	return { confirm, dialog };
}
