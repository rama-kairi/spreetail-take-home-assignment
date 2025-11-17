import { toast } from "sonner";

/**
 * Show a success toast notification.
 */
export function showSuccess(message: string) {
	toast.success(message);
}

/**
 * Show an error toast notification.
 */
export function showError(message: string) {
	toast.error(message);
}

/**
 * Show an info toast notification.
 */
export function showInfo(message: string) {
	toast.info(message);
}

/**
 * Show a warning toast notification.
 */
export function showWarning(message: string) {
	toast.warning(message);
}
