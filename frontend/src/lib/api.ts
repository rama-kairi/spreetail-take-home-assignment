import ky from "ky";

// Create a configured Ky instance for API requests
export const api = ky.create({
	prefixUrl: import.meta.env.VITE_API_URL || "http://localhost:8000/api",
	// Don't set Content-Type header by default - ky will set it automatically
	// For JSON requests, ky sets application/json
	// For FormData, ky sets multipart/form-data with boundary automatically
	timeout: 30000,
	retry: {
		limit: 2,
		methods: ["get", "put", "head", "delete", "options", "trace"],
		statusCodes: [408, 413, 429, 500, 502, 503, 504],
	},
	hooks: {
		beforeRequest: [
			(request) => {
				// Only set Content-Type for non-FormData requests
				// ky automatically handles FormData and sets the correct Content-Type with boundary
				if (!(request.body instanceof FormData)) {
					// Set Content-Type for JSON requests if not already set
					if (!request.headers.has("Content-Type")) {
						request.headers.set("Content-Type", "application/json");
					}
				}
			},
		],
		beforeError: [
			async (error) => {
				const { response } = error;
				if (response?.body) {
					try {
						const body = await response.json();
						error.message = body.message || body.detail || error.message;
					} catch {
						// Ignore JSON parse errors
					}
				}
				return error;
			},
		],
	},
});

// Type-safe API helper with Zod validation
export async function fetchWithValidation<T>(
	request: Promise<unknown>,
	schema: import("zod").ZodSchema<T>,
): Promise<T> {
	const data = await request;
	return schema.parse(data);
}
