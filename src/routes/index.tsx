import { createFileRoute, Link } from "@tanstack/react-router";
import { Settings } from "lucide-react";
import { WidgetBoundary } from "#/components/error-boundary";
import { Hero } from "#/components/hero";
import { buttonVariants } from "#/components/ui/button";
import { calendarQueryOptions } from "#/lib/calendar/query";
import { UpcomingEvents } from "#/lib/calendar/upcoming-events";
import { HueLights } from "#/lib/hue/hue-lights";
import { hueQuery } from "#/lib/hue/query";
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
		context.queryClient.query(hueQuery);
	},
});

// Shared by each widget and its error/loading fallback so they occupy the same cell
const LAYOUT = {
	hue: "col-span-3 row-span-7",
	weather: "col-start-1 col-span-3 row-span-5",
	departures: "row-start-1 col-start-4 col-span-6 row-span-12",
	calendar: "row-start-1 col-start-10 col-span-3 row-span-6",
};

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
				<WidgetBoundary title="Lampor" className={LAYOUT.hue}>
					<HueLights className={LAYOUT.hue} />
				</WidgetBoundary>
				<WidgetBoundary title="Väder" className={LAYOUT.weather}>
					<CurrentWeather className={LAYOUT.weather} />
				</WidgetBoundary>
				<WidgetBoundary title="Avgångar" className={LAYOUT.departures}>
					<Departures className={LAYOUT.departures} />
				</WidgetBoundary>
				<WidgetBoundary title="Kalender" className={LAYOUT.calendar}>
					<UpcomingEvents className={LAYOUT.calendar} />
				</WidgetBoundary>
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
