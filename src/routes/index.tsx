import { createFileRoute, Link } from "@tanstack/react-router";
import { Settings } from "lucide-react";
import { Hero } from "#/components/hero";
import { buttonVariants } from "#/components/ui/button";
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
		<main className="h-full flex flex-col relative">
			<Link
				to="/settings"
				className={buttonVariants({
					size: "icon-lg",
					variant: "ghost",
					class: "absolute top-2 right-2 z-10",
				})}
			>
				<Settings />
			</Link>
			<Hero />
			<div className="grid grid-cols-4 gap-4 pt-0 p-4 grid-rows-2 min-h-0">
				<CurrentWeather className="col-span-1" />
				<Departures className="h-full col-span-2" />
			</div>
		</main>
	);
}

// function Sortable({
// 	id,
// 	index,
// 	children,
// 	className,
// }: {
// 	id: number;
// 	index: number;
// 	children: ReactNode;
// 	className?: string;
// }) {
// 	const { ref } = useSortable({ id, index });

// 	return (
// 		<div ref={ref} className={className}>
// 			{children}
// 		</div>
// 	);
// }
