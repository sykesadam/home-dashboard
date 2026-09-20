import { DragDropProvider } from "@dnd-kit/react";
import { useSortable } from "@dnd-kit/react/sortable";
import { createFileRoute } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Hero } from "#/components/hero";
import { Departures } from "#/lib/vasttrafik/departures";
import { CurrentWeather } from "#/lib/weather/current-weather";
import { currentWeatherQuery } from "#/lib/weather/query";

export const Route = createFileRoute("/")({
	component: App,
	loader: async ({ context }) => {
		context.queryClient.query(currentWeatherQuery);
	},
});

function App() {
	return (
		<main className="h-full flex flex-col">
			<Hero />
			<div className="grid grid-cols-4 grow gap-4 p-4 grid-rows-2 min-h-0">
				<DragDropProvider
					onDragEnd={(event) => {
						console.log("event", event);
					}}
				>
					<Sortable id={0} index={0} className="col-span-1">
						<CurrentWeather />
					</Sortable>
					<Sortable id={1} index={1} className="col-span-2">
						<Departures className="h-full" />
					</Sortable>
				</DragDropProvider>
			</div>
		</main>
	);
}

function Sortable({
	id,
	index,
	children,
	className,
}: {
	id: number;
	index: number;
	children: ReactNode;
	className?: string;
}) {
	const { ref } = useSortable({ id, index });

	return (
		<div ref={ref} className={className}>
			{children}
		</div>
	);
}
