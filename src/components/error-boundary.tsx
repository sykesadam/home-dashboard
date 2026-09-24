import { QueryErrorResetBoundary } from "@tanstack/react-query";
import { AlertTriangle, Loader2, RotateCw } from "lucide-react";
import { Component, type ReactNode, Suspense } from "react";
import { Button } from "#/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "#/components/ui/card";
import { cn } from "#/lib/utils";

type FallbackRender = (props: { error: Error; reset: () => void }) => ReactNode;

type ErrorBoundaryProps = {
	fallback: FallbackRender;
	onReset?: () => void;
	children: ReactNode;
};

// React still has no hook for this, so a class it is
export class ErrorBoundary extends Component<
	ErrorBoundaryProps,
	{ error: Error | null }
> {
	state = { error: null as Error | null };

	static getDerivedStateFromError(error: unknown) {
		return {
			error: error instanceof Error ? error : new Error(String(error)),
		};
	}

	componentDidCatch(error: unknown) {
		console.error(error);
	}

	reset = () => {
		this.props.onReset?.();
		this.setState({ error: null });
	};

	render() {
		const { error } = this.state;
		if (error) return this.props.fallback({ error, reset: this.reset });
		return this.props.children;
	}
}

// Resets failed queries on retry so useSuspenseQuery refetches instead of
// re-throwing the cached error
export function QueryErrorBoundary({
	fallback,
	children,
}: {
	fallback: FallbackRender;
	children: ReactNode;
}) {
	return (
		<QueryErrorResetBoundary>
			{({ reset }) => (
				<ErrorBoundary onReset={reset} fallback={fallback}>
					{children}
				</ErrorBoundary>
			)}
		</QueryErrorResetBoundary>
	);
}

export function ErrorMessage({
	error,
	reset,
	className,
}: {
	error: Error;
	reset: () => void;
	className?: string;
}) {
	return (
		<div
			className={cn(
				"flex flex-col items-center justify-center gap-2 text-center",
				className,
			)}
		>
			<AlertTriangle className="size-6 text-destructive" />
			<p className="text-sm text-muted-foreground">Något gick fel</p>
			<p className="text-xs text-muted-foreground/70 line-clamp-3 break-all">
				{error.message}
			</p>
			<Button type="button" variant="outline" size="sm" onClick={reset}>
				<RotateCw />
				Försök igen
			</Button>
		</div>
	);
}

// Wraps a dashboard card: a failing or loading widget only affects its own
// grid cell, not the rest of the dashboard
export function WidgetBoundary({
	title,
	className,
	children,
}: {
	title: string;
	className?: string;
	children: ReactNode;
}) {
	return (
		<QueryErrorBoundary
			fallback={({ error, reset }) => (
				<Card className={className} size="sm">
					<CardHeader>
						<CardTitle>{title}</CardTitle>
					</CardHeader>
					<CardContent className="grow flex items-center justify-center">
						<ErrorMessage error={error} reset={reset} />
					</CardContent>
				</Card>
			)}
		>
			<Suspense
				fallback={
					<Card className={className} size="sm">
						<CardHeader>
							<CardTitle>{title}</CardTitle>
						</CardHeader>
						<CardContent className="grow flex items-center justify-center">
							<Loader2 className="animate-spin text-muted-foreground" />
						</CardContent>
					</Card>
				}
			>
				{children}
			</Suspense>
		</QueryErrorBoundary>
	);
}
