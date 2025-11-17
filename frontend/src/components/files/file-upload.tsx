import { FileJson, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { showError } from "@/lib/toast";
import { cn } from "@/lib/utils";

interface FileUploadProps {
	onFileSelect: (file: File) => void;
	disabled?: boolean;
}

export function FileUpload({ onFileSelect, disabled }: FileUploadProps) {
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [isDragging, setIsDragging] = useState(false);

	const handleFileSelect = (file: File) => {
		if (file.type === "application/json" || file.name.endsWith(".json")) {
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
		<Card className="w-full max-w-2xl mx-auto">
			<CardContent className="p-12">
				<div className="flex flex-col items-center justify-center space-y-6">
					<div className="p-4 rounded-full bg-muted">
						<FileJson className="h-12 w-12 text-muted-foreground" />
					</div>
					<div className="text-center space-y-2">
						<h2 className="text-2xl font-bold">Upload Email Threads</h2>
						<p className="text-muted-foreground">
							Upload a JSON file containing email threads to begin processing
							and summarization
						</p>
					</div>

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
							"w-full border-2 border-dashed rounded-lg p-12 text-center transition-colors cursor-pointer",
							isDragging
								? "border-primary bg-primary/5"
								: "border-border hover:border-primary/50",
							disabled && "opacity-50 cursor-not-allowed",
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
							<p className="text-lg font-medium">Drag & drop JSON file here</p>
							<p className="text-sm text-muted-foreground">
								or click to browse
							</p>
							<Button
								type="button"
								onClick={handleBrowseClick}
								disabled={disabled}
								variant="outline"
							>
								<Upload className="mr-2 h-4 w-4" />
								Browse Files
							</Button>
						</div>
					</div>

					<p className="text-sm text-muted-foreground">
						Supported format: JSON (.json)
					</p>

					<Input
						ref={fileInputRef}
						type="file"
						accept=".json,application/json"
						onChange={handleFileInputChange}
						className="hidden"
						disabled={disabled}
					/>
				</div>
			</CardContent>
		</Card>
	);
}
