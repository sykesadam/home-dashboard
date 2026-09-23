import { useSuspenseQuery } from "@tanstack/react-query";
import {
	ArrowDown,
	ArrowUp,
	CloudRain,
	Maximize2,
	WindIcon,
	X,
} from "lucide-react";
import { Button } from "#/components/ui/button";
import {
	Card,
	CardAction,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "#/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "#/components/ui/dialog";
import { cn } from "../utils";
import { WEATHER_CODES } from "./constants";
import { DetailedWeather } from "./detailed-weather";
import { WeatherIcon } from "./icons";
import { currentWeatherQuery } from "./query";

export function CurrentWeather({ className }: { className?: string }) {
	const { data } = useSuspenseQuery(currentWeatherQuery);

	const currentWeather = data.current_weather;
	const currentWeatherUnits = data.current_weather_units;
	const condition = WEATHER_CODES[currentWeather.weathercode] || "Okänd väder";

	const dailyWeatherHigh = data.daily.temperature_2m_max[0];
	const dailyWeatherLow = data.daily.temperature_2m_min[0];
	const dailyWeatherPrecipChance = data.daily.precipitation_probability_max[0];
	const dailyWeatherUnits = data.daily_units;

	return (
		<Card className={cn("h-full", className)} size="sm">
			<CardHeader>
				<CardTitle>Väder</CardTitle>
				<Dialog>
					<DialogTrigger
						nativeButton={false}
						render={
							<CardAction>
								<Button type="button" variant="ghost" size="icon">
									<Maximize2 />
								</Button>
							</CardAction>
						}
					/>
					<DialogContent className="sm:max-w-lg">
						<DialogHeader>
							<DialogTitle>Väder</DialogTitle>
						</DialogHeader>
						<DetailedWeather />
					</DialogContent>
				</Dialog>
				{/* <Dialog.Portal>
						<Dialog.Popup className="dialog-popup fixed left-1/2 top-1/2 w-[min(90vw,480px)] max-h-[85vh] overflow-y-auto -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-surface p-6 shadow-xl">
							<div className="flex items-center justify-between mb-2">
								<Dialog.Close
									render={
										<button
											type="button"
											className="rounded-full p-1 hover:bg-muted"
										/>
									}
								>
									<X className="size-4" />
								</Dialog.Close>
							</div>
						</Dialog.Popup>
					</Dialog.Portal>
				</Dialog> */}
			</CardHeader>

			<CardContent className="grow flex items-center">
				<div className="flex gap-4 items-center">
					<WeatherIcon
						condition={currentWeather.weathercode}
						className="size-12 shrink-0"
						aria-title={condition}
					/>
					<div>
						<span className="font-medium text-accent-foreground text-4xl">
							{currentWeather.temperature}
							{currentWeatherUnits.temperature}
						</span>
						<div className="text-muted-foreground text-sm">
							{WEATHER_CODES[data.current_weather.weathercode] || "Okänd väder"}
						</div>
					</div>
				</div>
			</CardContent>
			<CardFooter className="mt-auto text-muted-foreground grid grid-cols-2 gap-x-3">
				<span className="flex items-center whitespace-nowrap">
					<ArrowUp className="size-4 inline-block" />
					{dailyWeatherHigh}
					{dailyWeatherUnits.temperature_2m_max}
				</span>
				<span className="flex items-center gap-0.5 whitespace-nowrap">
					<CloudRain className="size-4 inline-block" />
					Regn {dailyWeatherPrecipChance}%
				</span>
				<span className="flex items-center whitespace-nowrap">
					<ArrowDown className="size-4 inline-block " />
					{dailyWeatherLow}
					{dailyWeatherUnits.temperature_2m_min}
				</span>
				<span className="flex items-center gap-0.5">
					<WindIcon className="size-4 inline-block" />
					{currentWeather.windspeed} {currentWeatherUnits.windspeed}
				</span>
			</CardFooter>
		</Card>
	);
}
