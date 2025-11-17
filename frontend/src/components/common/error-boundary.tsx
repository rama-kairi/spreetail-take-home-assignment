import { Component, type ReactNode } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface ErrorBoundaryProps {
	children: ReactNode;
	fallback?: ReactNode;
	onReset?: () => void;
}

interface ErrorBoundaryState {
	hasError: boolean;
	error: Error | null;
	errorInfo: { componentStack: string } | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
	constructor(props: ErrorBoundaryProps) {
		super(props);
		this.state = {
			hasError: false,
			error: null,
			errorInfo: null,
		};
	}

	static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
		return {
			hasError: true,
			error,
		};
	}

	componentDidCatch(error: Error, errorInfo: { componentStack: string }) {
		console.error("ErrorBoundary caught an error:", error, errorInfo);
		this.setState({
			error,
			errorInfo,
		});
	}

	handleReset = () => {
		this.setState({
			hasError: false,
			error: null,
			errorInfo: null,
		});
		if (this.props.onReset) {
			this.props.onReset();
		}
	};

	render() {
		if (this.state.hasError) {
			if (this.props.fallback) {
				return this.props.fallback;
			}

			return (
				<div className="min-h-screen bg-background flex items-center justify-center p-4">
					<Card className="w-full max-w-2xl">
						<CardHeader>
							<div className="flex items-center gap-2">
								<AlertCircle className="h-5 w-5 text-destructive" />
								<CardTitle>Something went wrong</CardTitle>
							</div>
							<CardDescription>
								An unexpected error occurred. Please try again or contact support if the problem persists.
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							{this.state.error && (
								<Alert variant="destructive">
									<AlertTitle>Error Details</AlertTitle>
									<AlertDescription className="font-mono text-sm">
										{this.state.error.message || "Unknown error"}
									</AlertDescription>
								</Alert>
							)}

							{import.meta.env.DEV && this.state.errorInfo && (
								<details className="text-sm">
									<summary className="cursor-pointer text-muted-foreground mb-2">
										Stack Trace (Dev Only)
									</summary>
									<pre className="bg-muted p-4 rounded-md overflow-auto text-xs">
										{this.state.errorInfo.componentStack}
									</pre>
								</details>
							)}

							<div className="flex gap-2">
								<Button onClick={this.handleReset} variant="default">
									<RefreshCw className="mr-2 h-4 w-4" />
									Try Again
								</Button>
								<Button
									onClick={() => window.location.reload()}
									variant="outline"
								>
									Reload Page
								</Button>
							</div>
						</CardContent>
					</Card>
				</div>
			);
		}

		return this.props.children;
	}
}
