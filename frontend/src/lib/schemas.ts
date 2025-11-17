import { z } from "zod";

// Example schemas for API responses
export const healthCheckSchema = z.object({
	status: z.string(),
});

export const threadSchema = z.object({
	thread_id: z.string(),
	topic: z.string(),
	subject: z.string(),
	initiated_by: z.enum(["customer", "company"]),
	order_id: z.string(),
	product: z.string(),
	messages: z.array(
		z.object({
			id: z.string(),
			sender: z.enum(["customer", "company"]),
			timestamp: z.string(),
			body: z.string(),
		}),
	),
});

export const threadsResponseSchema = z.object({
	version: z.string(),
	generated_at: z.string(),
	description: z.string(),
	threads: z.array(threadSchema),
});

const structuredDataSchema = z.object({
	issue_summary: z.string().optional(),
	key_details: z.object({
		order_id: z.string().optional(),
		product: z.string().optional(),
		customer_name: z.string().nullable().optional(),
		customer_email: z.string().nullable().optional(),
		order_date: z.string().nullable().optional(),
		order_status: z.string().nullable().optional(),
		ticket_ids: z.array(z.string()).optional(),
	}).optional(),
	context_extraction: z.object({
		issue_type: z.string().optional(),
		customer_sentiment: z.string().optional(),
		urgency_level: z.string().optional(),
		customer_intent: z.string().optional(),
		key_phrases: z.array(z.string()).optional(),
	}).optional(),
	resolution_status: z.string().optional(),
	full_summary_text: z.string().optional(),
	confidence_scores: z.object({
		issue_type: z.number().min(0).max(100).optional(),
		customer_sentiment: z.number().min(0).max(100).optional(),
		urgency_level: z.number().min(0).max(100).optional(),
		customer_intent: z.number().min(0).max(100).optional(),
		resolution_status: z.number().min(0).max(100).optional(),
	}).nullable().optional(),
}).nullable().optional();

export const summarySchema = z.object({
	id: z.string(),
	thread_id: z.string(),
	original_summary: z.string(),
	edited_summary: z.string().nullable(),
	status: z.enum(["pending", "approved", "rejected"]),
	approved_by: z.string().nullable(),
	approved_at: z.string().nullable(),
	remarks: z.string().nullable().optional(),
	rejection_reason: z.string().nullable().optional(),
	created_at: z.string(),
	updated_at: z.string(),
	structured_data: structuredDataSchema,
});

export const fileModelSchema = z.object({
	id: z.string(),
	file_name: z.string(),
	total_threads: z.number(),
	processed_threads: z.number(),
	uploaded_at: z.string(),
	created_at: z.string(),
	updated_at: z.string(),
	progress: z.number(),
});

export const fileUploadResponseSchema = z.object({
	file_id: z.string(),
	file_name: z.string(),
	total_threads: z.number(),
	status: z.enum(["processing", "completed"]),
	message: z.string(),
});

export const filesArraySchema = z.array(fileModelSchema);
export const summariesArraySchema = z.array(summarySchema);

// Type exports
export type HealthCheck = z.infer<typeof healthCheckSchema>;
export type Thread = z.infer<typeof threadSchema>;
export type ThreadsResponse = z.infer<typeof threadsResponseSchema>;
export type Summary = z.infer<typeof summarySchema>;
export type FileModel = z.infer<typeof fileModelSchema>;
export type FileUploadResponse = z.infer<typeof fileUploadResponseSchema>;
