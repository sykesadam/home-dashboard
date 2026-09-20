import type { ReactNode } from "react";
import { cn } from "#/lib/utils";

export function Panel({
	className,
	children,
}: {
	className?: string;
	children: ReactNode;
}) {
	return (
		<div
			className={cn("p-2 rounded-lg bg-card flex flex-col gap-1", className)}
		>
			{children}
		</div>
	);
}

export function PanelTitle({
	className,
	children,
}: {
	className?: string;
	children: ReactNode;
}) {
	return (
		<h2 className={cn("text-muted-foreground font-medium text-sm", className)}>
			{children}
		</h2>
	);
}
