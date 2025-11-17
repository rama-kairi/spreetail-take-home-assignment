import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { ErrorBoundary } from "@/components/common";

export const Route = createRootRoute({
	component: RootComponent,
	errorComponent: ErrorComponent,
});

function RootComponent() {
	return (
		<ErrorBoundary>
			<Outlet />
			{import.meta.env.DEV && <TanStackRouterDevtools />}
		</ErrorBoundary>
	);
}

function ErrorComponent({ error }: { error: Error }) {
	return (
		<ErrorBoundary
			fallback={
				<div className="min-h-screen bg-background flex items-center justify-center p-4">
					<div className="text-center space-y-4">
						<h1 className="text-2xl font-bold">Route Error</h1>
						<p className="text-muted-foreground">{error.message}</p>
					</div>
				</div>
			}
		>
			<Outlet />
		</ErrorBoundary>
	);
}
