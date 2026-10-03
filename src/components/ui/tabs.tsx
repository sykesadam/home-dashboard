import { Tabs as TabsPrimitive } from "@base-ui/react/tabs";
import { cn } from "cn";

function Tabs({ className, ...props }: TabsPrimitive.Root.Props) {
	return (
		<TabsPrimitive.Root
			data-slot="tabs"
			className={cn("flex flex-col gap-3", className)}
			{...props}
		/>
	);
}

function TabsList({ className, ...props }: TabsPrimitive.List.Props) {
	return (
		<TabsPrimitive.List
			data-slot="tabs-list"
			className={cn(
				"relative inline-flex w-fit items-center gap-1 rounded-md bg-muted p-0.5 text-muted-foreground",
				className,
			)}
			{...props}
		/>
	);
}

function TabsTab({ className, ...props }: TabsPrimitive.Tab.Props) {
	return (
		<TabsPrimitive.Tab
			data-slot="tabs-tab"
			className={cn(
				"inline-flex items-center justify-center whitespace-nowrap rounded-[calc(var(--radius-md)-2px)] px-2.5 py-1 text-xs font-medium transition-colors outline-none select-none data-active:bg-background data-active:text-foreground data-active:shadow-sm",
				className,
			)}
			{...props}
		/>
	);
}

function TabsPanel({ className, ...props }: TabsPrimitive.Panel.Props) {
	return (
		<TabsPrimitive.Panel
			data-slot="tabs-panel"
			className={cn("outline-none", className)}
			{...props}
		/>
	);
}

export { Tabs, TabsList, TabsPanel, TabsTab };
