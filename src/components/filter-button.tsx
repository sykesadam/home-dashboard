import { cn } from "cn";

// Segmented pill buttons; put several side by side in a grid
export function FilterButton({
	active,
	onClick,
	color,
	children,
}: {
	active: boolean;
	onClick: () => void;
	color?: string;
	children: React.ReactNode;
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			aria-pressed={active}
			className={cn(
				"inline-flex justify-center text-center first:rounded-l-full last:rounded-r-full items-center gap-1.5 px-3 py-1 text-xs font-medium transition-colors",
				active
					? "bg-primary text-primary-foreground"
					: "bg-muted text-muted-foreground hover:bg-muted/70",
			)}
		>
			{color && (
				<span
					className="size-2 rounded-full"
					style={{ backgroundColor: color }}
				/>
			)}
			{children}
		</button>
	);
}
