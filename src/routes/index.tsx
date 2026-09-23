import { createFileRoute, Link } from "@tanstack/react-router";
import { Settings } from "lucide-react";
import { Hero } from "#/components/hero";
import { buttonVariants } from "#/components/ui/button";
import { calendarQueryOptions } from "#/lib/calendar/query";
import { UpcomingEvents } from "#/lib/calendar/upcoming-events";
import { Departures } from "#/lib/vasttrafik/departures";
import { departuresQuery } from "#/lib/vasttrafik/query";
import { CurrentWeather } from "#/lib/weather/current-weather";
import { currentWeatherQuery } from "#/lib/weather/query";

export const Route = createFileRoute("/")({
	component: App,
	loader: async ({ context }) => {
		context.queryClient.query(currentWeatherQuery);
		context.queryClient.query(departuresQuery);
		context.queryClient.query(calendarQueryOptions);
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
			<div className="grid grid-cols-12 gap-4 pt-0 p-4 grid-rows-12 min-h-0">
				<CurrentWeather className="col-span-3 row-span-5" />
				<Departures className="h-full col-span-6 row-span-12" />
				<UpcomingEvents className="col-start-1 col-span-3 row-span-7" />
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
