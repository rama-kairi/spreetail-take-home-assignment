import {
	AlertCircle,
	CheckCircle2,
	Eye,
	FileUp,
	Loader2,
	MoreVertical,
	Trash2,
} from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import type { UploadedFile } from "@/lib/mock-data";
import { UploadDialog } from "@/components/files";

interface FileTableProps {
	files: UploadedFile[];
	onFileClick: (fileId: string) => void;
	onFileDelete: (fileId: string) => void;
	onFileUpload: (file: File) => void;
}

export function FileTable({
	files,
	onFileClick,
	onFileDelete,
	onFileUpload,
}: FileTableProps) {
	const [uploadDialogOpen, setUploadDialogOpen] = useState(false);

	const getStatusBadge = (status: UploadedFile["status"]) => {
		switch (status) {
			case "processing":
				return (
					<Badge variant="secondary" className="gap-1">
						<Loader2 className="h-3 w-3 animate-spin" />
						Processing
					</Badge>
				);
			case "completed":
				return (
					<Badge className="gap-1">
						<CheckCircle2 className="h-3 w-3" />
						Completed
					</Badge>
				);
			case "error":
				return (
					<Badge variant="destructive" className="gap-1">
						<AlertCircle className="h-3 w-3" />
						Error
					</Badge>
				);
			default:
				return <Badge variant="outline">Unknown</Badge>;
		}
	};

	const formatDate = (date: Date) => {
		return new Intl.DateTimeFormat("en-US", {
			month: "short",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		}).format(date);
	};

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h1 className="text-4xl font-bold tracking-tight flex items-center gap-2">
					<FileUp className="h-8 w-8" />
					Email Thread Summarization
				</h1>
				<Button onClick={() => setUploadDialogOpen(true)}>
					<FileUp className="mr-2 h-4 w-4" />
					Add New File
				</Button>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Uploaded Files</CardTitle>
				</CardHeader>
				<CardContent>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>File Name</TableHead>
								<TableHead>Status</TableHead>
								<TableHead>Total Threads</TableHead>
								<TableHead>Processed</TableHead>
								<TableHead>Uploaded At</TableHead>
								<TableHead className="text-right">Actions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{files.length === 0 ? (
								<TableRow>
									<TableCell colSpan={6} className="text-center py-8">
										No files uploaded yet
									</TableCell>
								</TableRow>
							) : (
								files.map((file) => (
									<TableRow
										key={file.id}
										className="cursor-pointer hover:bg-muted/50"
										onClick={() => onFileClick(file.id)}
									>
										<TableCell className="font-medium">
											{file.fileName}
										</TableCell>
										<TableCell>
											<div className="space-y-2">
												{getStatusBadge(file.status)}
												{file.status === "processing" && (
													<div className="space-y-1">
														<Progress
															value={file.progress || 0}
															className="w-32 h-2"
														/>
														{file.totalThreads > 0 && (
															<p className="text-xs text-muted-foreground">
																{file.processedThreads} / {file.totalThreads} threads
															</p>
														)}
													</div>
												)}
											</div>
										</TableCell>
										<TableCell>
											{file.totalThreads > 0 ? file.totalThreads : "-"}
										</TableCell>
										<TableCell>
											{file.totalThreads > 0
												? `${file.processedThreads}/${file.totalThreads}`
												: "-"}
										</TableCell>
										<TableCell>{formatDate(file.uploadedAt)}</TableCell>
										<TableCell className="text-right">
											<DropdownMenu>
												<DropdownMenuTrigger asChild>
													<Button
														variant="ghost"
														size="icon"
														onClick={(e) => e.stopPropagation()}
													>
														<MoreVertical className="h-4 w-4" />
													</Button>
												</DropdownMenuTrigger>
												<DropdownMenuContent align="end">
													<DropdownMenuItem
														onClick={(e) => {
															e.stopPropagation();
															onFileClick(file.id);
														}}
													>
														<Eye className="mr-2 h-4 w-4" />
														View Threads
													</DropdownMenuItem>
													<DropdownMenuItem
														variant="destructive"
														onClick={(e) => {
															e.stopPropagation();
															onFileDelete(file.id);
														}}
													>
														<Trash2 className="mr-2 h-4 w-4" />
														Delete
													</DropdownMenuItem>
												</DropdownMenuContent>
											</DropdownMenu>
										</TableCell>
									</TableRow>
								))
							)}
						</TableBody>
					</Table>
				</CardContent>
			</Card>

			<UploadDialog
				open={uploadDialogOpen}
				onOpenChange={setUploadDialogOpen}
				onFileSelect={onFileUpload}
			/>
		</div>
	);
}
