import { FileJson, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { showError } from "@/lib/toast";
import { cn } from "@/lib/utils";

interface UploadDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onFileSelect: (file: File) => void;
}

export function UploadDialog({
	open,
	onOpenChange,
	onFileSelect,
}: UploadDialogProps) {
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [isDragging, setIsDragging] = useState(false);

	const handleFileSelect = async (file: File) => {
		if (file.type === "application/json" || file.name.endsWith(".json")) {
			// Close dialog immediately - don't wait for upload
			onOpenChange(false);
			// Reset file input
			if (fileInputRef.current) {
				fileInputRef.current.value = "";
			}
			// Trigger upload (non-blocking)
			onFileSelect(file);
		} else {
			showError("Please upload a valid JSON file");
		}
	};

	const handleDragOver = (e: React.DragEvent) => {
		e.preventDefault();
		setIsDragging(true);
	};

	const handleDragLeave = (e: React.DragEvent) => {
		e.preventDefault();
		setIsDragging(false);
	};

	const handleDrop = (e: React.DragEvent) => {
		e.preventDefault();
		setIsDragging(false);

		const file = e.dataTransfer.files[0];
		if (file) {
			handleFileSelect(file);
		}
	};

	const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			handleFileSelect(file);
		}
		// Reset the input value so the same file can be selected again if needed
		e.target.value = "";
	};

	const handleBrowseClick = (e?: React.MouseEvent) => {
		e?.stopPropagation();
		e?.preventDefault();
		fileInputRef.current?.click();
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Upload Email Threads</DialogTitle>
					<DialogDescription>
						Upload a JSON file containing email threads to begin processing and
						summarization
					</DialogDescription>
				</DialogHeader>
				<div className="space-y-4 py-4">
					{/* biome-ignore lint/a11y/useSemanticElements: div needed for drag-and-drop functionality */}
					<div
						role="button"
						tabIndex={0}
						onDragOver={handleDragOver}
						onDragLeave={handleDragLeave}
						onDrop={handleDrop}
						onClick={(e) => {
							// Only open file dialog if clicking directly on the div, not on child elements
							if (e.target === e.currentTarget) {
								handleBrowseClick(e);
							}
						}}
						onKeyDown={(e) => {
							if (e.key === "Enter" || e.key === " ") {
								e.preventDefault();
								handleBrowseClick();
							}
						}}
						className={cn(
							"w-full border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer",
							isDragging
								? "border-primary bg-primary/5"
								: "border-border hover:border-primary/50",
						)}
					>
						<div className="flex flex-col items-center justify-center space-y-4">
							<div
								className={cn(
									"p-4 rounded-full transition-colors",
									isDragging ? "bg-primary/10" : "bg-muted",
								)}
							>
								<FileJson className="h-8 w-8 text-muted-foreground" />
							</div>
							<div className="space-y-2">
								<p className="text-sm font-medium">
									Drag & drop JSON file here
								</p>
								<p className="text-xs text-muted-foreground">
									or click to browse
								</p>
							</div>
							<Button
								type="button"
								variant="outline"
								size="sm"
								onClick={handleBrowseClick}
							>
								<Upload className="mr-2 h-4 w-4" />
								Browse Files
							</Button>
						</div>
					</div>
					<p className="text-xs text-center text-muted-foreground">
						Supported format: JSON (.json)
					</p>
					<Input
						ref={fileInputRef}
						type="file"
						accept=".json,application/json"
						onChange={handleFileInputChange}
						className="hidden"
					/>
				</div>
			</DialogContent>
		</Dialog>
	);
}
