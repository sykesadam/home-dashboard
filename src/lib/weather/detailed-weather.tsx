import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { ArrowDown, ArrowUp, CloudRain, SunIcon, WindIcon } from "lucide-react";
import { WEATHER_CODES } from "./constants";
import { WeatherIcon } from "./icons";
import { getDetailedWeatherQuery } from "./query";

const DAY_FORMATTER = new Intl.DateTimeFormat("sv-SE", { weekday: "short" });

export function DetailedWeather() {
	const queryClient = useQueryClient();
	const { data } = useSuspenseQuery(getDetailedWeatherQuery(queryClient));
	const { daily, daily_units } = data;

	const hasFullDetail = daily.uv_index_max !== undefined;
	const days = Array.from({ length: 7 });

	return (
		<div className="flex flex-col gap-4">
			<div className="flex items-center gap-4">
				<WeatherIcon
					condition={data.current_weather.weathercode}
					className="size-16"
				/>
				<div>
					<div className="text-5xl font-medium text-accent-weather">
						{data.current_weather.temperature}
						{data.current_weather_units.temperature}
					</div>
					<div className="text-muted-foreground text-sm">
						{WEATHER_CODES[data.current_weather.weathercode] || "Okänd väder"}
					</div>
				</div>
			</div>

			<div className="grid grid-cols-3 gap-3 text-sm text-muted-foreground">
				<div className="flex items-center gap-1 whitespace-nowrap">
					<WindIcon className="size-4" />
					{data.current_weather.windspeed}
					{data.current_weather_units.windspeed}
				</div>
				<div className="flex items-center gap-1">
					<SunIcon className="size-4" />
					{hasFullDetail ? (
						`UV ${daily.uv_index_max?.[0]}`
					) : (
						<span className="h-4 w-10 rounded bg-muted animate-pulse" />
					)}
				</div>
				<div className="flex items-center gap-1 whitespace-nowrap">
					<CloudRain className="size-4" />
					{daily.precipitation_probability_max[0]}%
				</div>
			</div>

			<div className="flex flex-col divide-y divide-border">
				{days.map((_, i) => {
					const date = daily.time[i];
					if (!date) {
						return (
							// biome-ignore lint/suspicious/noArrayIndexKey: from array
							<div key={i} className="flex items-center gap-3 py-2">
								<div className="h-4 w-full rounded bg-muted animate-pulse" />
							</div>
						);
					}
					return (
						<div key={date} className="flex items-center gap-3 py-2">
							<span className="w-10 text-sm font-medium capitalize">
								{i === 0 ? "Idag" : DAY_FORMATTER.format(new Date(date))}
							</span>
							<WeatherIcon
								condition={daily.weathercode[i]}
								className="size-6 shrink-0"
							/>
							<span className="flex-1 text-sm text-muted-foreground truncate">
								{WEATHER_CODES[daily.weathercode[i]] || "Okänd väder"}
							</span>
							<span className="flex items-center gap-1 text-sm text-muted-foreground">
								<CloudRain className="size-3.5 shrink-0" />
								{daily.precipitation_probability_max[i]}%
							</span>
							<span className="w-12 text-right text-sm flex items-center justify-end gap-0.5 whitespace-nowrap">
								<ArrowUp className="size-3.5 shrink-0" />
								{daily.temperature_2m_max[i]}
								{daily_units.temperature_2m_max}
							</span>
							<span className="w-12 text-right text-sm text-muted-foreground flex items-center justify-end gap-0.5 whitespace-nowrap">
								<ArrowDown className="size-3.5 shrink-0" />
								{daily.temperature_2m_min[i]}
								{daily_units.temperature_2m_min}
							</span>
						</div>
					);
				})}
			</div>
		</div>
	);
}
