import type { QueryClient } from "@tanstack/react-query";
import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { logRequest, request } from "../utils";

// --- Lightweight: just today, for the widget ---
type CurrentWeatherPayload = {
	current_weather: {
		temperature: number;
		weathercode: number;
		windspeed: number;
	};
	current_weather_units: { temperature: string; windspeed: string };
	daily: {
		time: string[];
		weathercode: number[];
		temperature_2m_max: number[];
		temperature_2m_min: number[];
		precipitation_probability_max: number[];
	};
	daily_units: {
		temperature_2m_max: string;
		temperature_2m_min: string;
		precipitation_probability_max: string;
	};
};

// --- Full: 7 days + extra fields, for the dialog ---
// Sunrise/sunset/uv/max-wind/hourly are optional because the placeholder
// (seeded from the lightweight query) won't have them yet.
type DetailedWeatherPayload = CurrentWeatherPayload & {
	daily: CurrentWeatherPayload["daily"] & {
		sunrise?: string[];
		sunset?: string[];
		uv_index_max?: number[];
		windspeed_10m_max?: number[];
	};
	hourly?: HourlyWeather;
	hourly_units?: {
		temperature_2m: string;
	};
};

export type HourlyWeather = {
	time: string[];
	weathercode: number[];
	temperature_2m: number[];
	precipitation_probability: number[];
};

async function fetchCurrentWeather(): Promise<CurrentWeatherPayload> {
	logRequest("weather", "current weather");

	return request<CurrentWeatherPayload>(
		{
			endpoint: "https://api.open-meteo.com/v1/forecast",
			searchParams: {
				latitude: process.env.LATITUDE,
				longitude: process.env.LONGITUDE,
				current_weather: "True",
				daily:
					"weathercode,temperature_2m_max,temperature_2m_min,precipitation_probability_max",
				forecast_days: "1",
				timezone: process.env.TIMEZONE,
			},
		},
		{ method: "GET" },
	);
}

/** Keeps only the hours whose ISO timestamp satisfies `predicate`. */
export function filterHourly(
	hourly: HourlyWeather,
	predicate: (time: string) => boolean,
): HourlyWeather {
	const indices = hourly.time.reduce<number[]>((acc, time, i) => {
		if (predicate(time)) acc.push(i);
		return acc;
	}, []);
	return {
		time: indices.map((i) => hourly.time[i]),
		weathercode: indices.map((i) => hourly.weathercode[i]),
		temperature_2m: indices.map((i) => hourly.temperature_2m[i]),
		precipitation_probability: indices.map(
			(i) => hourly.precipitation_probability[i],
		),
	};
}

// Open-Meteo returns hourly data for the whole 7-day window (same length as
// `daily`) — trim it down to just today's hours so the dialog only has to
// deal with "today's hourly forecast", and so we're not shipping 168 hours
// of data to the client for 24 of them to ever be shown.
function filterHourlyToToday(
	hourly: HourlyWeather,
	today: string | undefined,
): HourlyWeather {
	if (!today) return hourly;
	return filterHourly(hourly, (time) => time.startsWith(today));
}

async function fetchDetailedWeather(): Promise<DetailedWeatherPayload> {
	logRequest("weather", "detailed weather");

	const payload = await request<DetailedWeatherPayload>(
		{
			endpoint: "https://api.open-meteo.com/v1/forecast",
			searchParams: {
				latitude: process.env.LATITUDE,
				longitude: process.env.LONGITUDE,
				current_weather: "True",
				daily: [
					"weathercode",
					"temperature_2m_max",
					"temperature_2m_min",
					"precipitation_probability_max",
					"sunrise",
					"sunset",
					"uv_index_max",
					"windspeed_10m_max",
				].join(","),
				hourly: [
					"weathercode",
					"temperature_2m",
					"precipitation_probability",
				].join(","),
				forecast_days: "7",
				timezone: process.env.TIMEZONE,
			},
		},
		{ method: "GET" },
	);

	return {
		...payload,
		hourly: payload.hourly
			? filterHourlyToToday(payload.hourly, payload.daily.time[0])
			: undefined,
	};
}

export const getCurrentWeatherFn =
	createServerFn().handler(fetchCurrentWeather);
export const getDetailedWeatherFn =
	createServerFn().handler(fetchDetailedWeather);

export const currentWeatherQuery = queryOptions({
	queryKey: ["weather", "current"],
	queryFn: getCurrentWeatherFn,
	refetchInterval: 60_000 * 10,
});

// Builds a "day 0 only" DetailedWeatherPayload out of the lightweight
// current-weather response, so the dialog has something instant to render.
function toDetailedPlaceholder(
	current: CurrentWeatherPayload,
): DetailedWeatherPayload {
	return {
		...current,
		daily: { ...current.daily }, // sunrise/sunset/uv/wind stay undefined
	};
}

// Factory instead of a plain constant: it needs the queryClient in closure
// to read the current-weather cache for `initialData`.
export function getDetailedWeatherQuery(queryClient: QueryClient) {
	return queryOptions({
		queryKey: ["weather", "detailed"],
		queryFn: getDetailedWeatherFn,
		refetchInterval: 60_000 * 15,
		initialData: () => {
			const current = queryClient.getQueryData(currentWeatherQuery.queryKey);
			return current ? toDetailedPlaceholder(current) : undefined;
		},
		// Reuse current-weather's fetch time (or 0 if we have nothing) so this
		// placeholder is immediately treated as stale and triggers a real
		// background fetch for the full 7-day payload.
		initialDataUpdatedAt: () =>
			queryClient.getQueryState(currentWeatherQuery.queryKey)?.dataUpdatedAt,
	});
}
