import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

interface MarkdownRendererProps {
	content: string;
	className?: string;
}

export function MarkdownRenderer({
	content,
	className,
}: MarkdownRendererProps) {
	return (
		<div
			className={cn(
				"prose prose-sm max-w-none",
				// Headings
				"prose-headings:font-semibold prose-headings:text-foreground prose-headings:mt-6 prose-headings:mb-4",
				"prose-h1:text-2xl prose-h1:font-bold prose-h1:border-b prose-h1:border-border prose-h1:pb-2",
				"prose-h2:text-xl prose-h2:font-semibold prose-h2:mt-6 prose-h2:mb-3",
				"prose-h3:text-lg prose-h3:font-semibold prose-h3:mt-4 prose-h3:mb-2",
				// Paragraphs
				"prose-p:text-foreground prose-p:leading-relaxed prose-p:my-3",
				// Strong/Bold
				"prose-strong:text-foreground prose-strong:font-semibold",
				// Lists
				"prose-ul:text-foreground prose-ol:text-foreground prose-li:text-foreground",
				"prose-ul:my-4 prose-ol:my-4 prose-li:my-2",
				"prose-ul:list-disc prose-ol:list-decimal",
				"prose-li:pl-2",
				// Blockquotes
				"prose-blockquote:border-l-4 prose-blockquote:border-l-primary prose-blockquote:text-muted-foreground prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:my-4",
				// Code
				"prose-code:text-foreground prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:font-mono",
				"prose-pre:bg-muted prose-pre:text-foreground prose-pre:p-4 prose-pre:rounded-lg prose-pre:overflow-x-auto prose-pre:my-4",
				"prose-pre:border prose-pre:border-border",
				// Links
				"prose-a:text-primary prose-a:underline hover:prose-a:text-primary/80",
				// Horizontal rules
				"prose-hr:border-border prose-hr:my-6",
				className,
			)}
		>
			<ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
		</div>
	);
}
