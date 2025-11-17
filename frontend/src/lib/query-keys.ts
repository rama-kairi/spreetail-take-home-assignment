/**
 * Centralized query key management for TanStack Query.
 *
 * Using hierarchical query keys for better cache invalidation:
 * - ["files"] - All files
 * - ["files", fileId] - Specific file
 * - ["threads"] - All threads
 * - ["threads", threadId] - Specific thread
 * - ["summaries"] - All summaries
 * - ["summaries", summaryId] - Specific summary
 * - ["task-status", taskId] - Task status
 */

export const queryKeys = {
	// Files
	files: {
		all: ["files"] as const,
		detail: (fileId: string) => ["files", fileId] as const,
	},

	// Threads
	threads: {
		all: ["threads"] as const,
		detail: (threadId: string) => ["threads", threadId] as const,
		byFile: (fileId: string) => ["threads", "file", fileId] as const,
	},

	// Summaries
	summaries: {
		all: ["summaries"] as const,
		detail: (summaryId: string) => ["summaries", summaryId] as const,
		byThread: (threadId: string) => ["summaries", "thread", threadId] as const,
	},

	// Task Status
	taskStatus: {
		detail: (taskId: string) => ["task-status", taskId] as const,
	},

	// Health Check
	health: {
		check: ["health"] as const,
	},
} as const;
