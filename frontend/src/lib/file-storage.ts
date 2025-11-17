import type { UploadedFile } from "@/lib/mock-data";

const STORAGE_KEY = "ce_uploaded_files";
const TASK_MAP_KEY = "ce_file_task_map";
const FILES_DELETED_KEY = "ce_files_deleted"; // Track if user has explicitly deleted files

export function saveFilesToStorage(files: UploadedFile[]): void {
	try {
		// Convert Date objects to ISO strings for storage
		const filesToStore = files.map((file) => ({
			...file,
			uploadedAt: file.uploadedAt.toISOString(),
		}));
		localStorage.setItem(STORAGE_KEY, JSON.stringify(filesToStore));
	} catch (error) {
		console.error("Failed to save files to localStorage:", error);
	}
}

export function loadFilesFromStorage(): UploadedFile[] {
	try {
		const stored = localStorage.getItem(STORAGE_KEY);
		if (!stored) {
			return [];
		}
		const files = JSON.parse(stored) as Array<
			Omit<UploadedFile, "uploadedAt"> & { uploadedAt: string }
		>;
		// Convert ISO strings back to Date objects
		return files.map((file) => ({
			...file,
			uploadedAt: new Date(file.uploadedAt),
		}));
	} catch (error) {
		console.error("Failed to load files from localStorage:", error);
		return [];
	}
}

export function removeFileFromStorage(fileId: string): void {
	const files = loadFilesFromStorage();
	const updated = files.filter((f) => f.id !== fileId);
	saveFilesToStorage(updated);
	// Mark that files have been explicitly deleted
	if (updated.length === 0) {
		localStorage.setItem(FILES_DELETED_KEY, "true");
	}
}

export function hasFilesBeenDeleted(): boolean {
	return localStorage.getItem(FILES_DELETED_KEY) === "true";
}

export function clearFilesDeletedFlag(): void {
	localStorage.removeItem(FILES_DELETED_KEY);
}

export function saveTaskMapToStorage(taskMap: Map<string, string>): void {
	try {
		const mapArray = Array.from(taskMap.entries());
		localStorage.setItem(TASK_MAP_KEY, JSON.stringify(mapArray));
	} catch (error) {
		console.error("Failed to save task map to localStorage:", error);
	}
}

export function loadTaskMapFromStorage(): Map<string, string> {
	try {
		const stored = localStorage.getItem(TASK_MAP_KEY);
		if (!stored) {
			return new Map();
		}
		const mapArray = JSON.parse(stored) as Array<[string, string]>;
		return new Map(mapArray);
	} catch (error) {
		console.error("Failed to load task map from localStorage:", error);
		return new Map();
	}
}
