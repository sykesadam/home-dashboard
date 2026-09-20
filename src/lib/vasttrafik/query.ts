import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { request } from "../utils";
import type { Departures } from "./types";

const tokenCache = { token: null, expiresAt: 0 };

async function getVasttrafikToken() {
	const now = Date.now() / 1000;
	if (tokenCache.token && now < tokenCache.expiresAt - 30) {
		return tokenCache.token;
	}

	const credentials = `${process.env.VASTTRAFIK_CLIENT_ID}:${process.env.VASTTRAFIK_CLIENT_SECRET}`;
	const auth = Buffer.from(credentials).toString("base64");

	const res = await fetch("https://ext-api.vasttrafik.se/token", {
		method: "POST",
		headers: {
			Authorization: `Basic ${auth}`,
			"Content-Type": "application/x-www-form-urlencoded",
		},
		body: new URLSearchParams({ grant_type: "client_credentials" }),
	});
	if (!res.ok) {
		throw new Error(`Västtrafik token request failed: ${res.status}`);
	}
	const data = await res.json();

	tokenCache.token = data.access_token;
	tokenCache.expiresAt = now + (data.expires_in ?? 3600);
	return tokenCache.token;
}

async function fetchDepartures() {
	const token = await getVasttrafikToken();
	const data = await request<Departures>(
		{
			endpoint: `https://ext-api.vasttrafik.se/pr/v4/stop-areas/${process.env.VASTTRAFIK_STOP_ID}/departures`,
			searchParams: {
				limit: String(process.env.VASTTRAFIK_LIMIT),
			},
		},
		{
			headers: { Authorization: `Bearer ${token}` },
		},
	);

	console.log("data", data);

	return data;

	// return data.results.map((dep) => {
	// 	const journey = dep.serviceJourney ?? {};
	// 	const line = journey.line ?? {};
	// 	const planned = dep.plannedTime;
	// 	const estimated = dep.estimatedTime ?? planned;
	// 	return {
	// 		line: line.shortName ?? "?",
	// 		direction: journey.direction ?? "",
	// 		planned,
	// 		estimated,
	// 		cancelled: dep.isCancelled ?? false,
	// 	};
	// });
}

export const getDeparturesFn = createServerFn().handler(fetchDepartures);

export const departuresQuery = queryOptions({
	queryKey: ["transit", "departures"],
	queryFn: getDeparturesFn,
	refetchInterval: 60_000, // poll every 60s, same cadence as before
	staleTime: 30_000, // treat data as fresh for 30s — avoids duplicate fetches if multiple components mount this query around the same time
});
