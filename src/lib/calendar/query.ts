import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import ical from "node-ical"; // >= 0.20 (has expandRecurringEvent)
import { CALENDARS } from "./config";

export type CalendarEvent = {
	summary: string;
	start: string;
	allDay: boolean;
	owner: string;
	color: string;
};

export type CalendarOwner = { name: string; color: string };

export type CalendarData = {
	owners: CalendarOwner[];
	events: CalendarEvent[];
};

// Internal shape: same as CalendarEvent plus a real timestamp for sorting/filtering
type CachedEvent = CalendarEvent & { startsAt: number };

const DEFAULT_COLOR = "#7FA8D9";
// How far ahead we fetch. Must be well beyond the UI's "next few days"
// window so the fallback has something to find.
const LOOKAHEAD_DAYS = 90;
const CACHE_TTL_MS = 5 * 60 * 1000;
const REFRESH_MS = 60 * 1000;

// Server-side cache of ALL events in the lookahead window
// (lives in the server process, shared across requests)
let calendarCache: { data: CachedEvent[]; at: number } | null = null;

async function fetchSource(
	source: (typeof CALENDARS)[number],
	start: Date,
	end: Date,
): Promise<CachedEvent[]> {
	const res = await fetch(source.url, { signal: AbortSignal.timeout(10_000) });
	if (!res.ok) throw new Error(`HTTP ${res.status}`);

	const parsed = ical.sync.parseICS(await res.text());
	const events: CachedEvent[] = [];

	for (const item of Object.values(parsed)) {
		if (!item || item.type !== "VEVENT") continue;

		// Expands RRULEs, applies EXDATEs and overridden instances
		const occurrences = ical.expandRecurringEvent(item, {
			from: start,
			to: end,
			includeOverrides: true,
			excludeExdates: true,
		});

		for (const occ of occurrences) {
			events.push({
				summary: String(occ.summary ?? "Namnlös händelse"),
				// All-day events as plain dates, timed events as ISO timestamps
				start: occ.isFullDay
					? occ.start.toLocaleDateString("sv-SE") // YYYY-MM-DD
					: occ.start.toISOString(),
				allDay: occ.isFullDay,
				owner: source.name,
				color: source.color ?? DEFAULT_COLOR,
				startsAt: occ.start.getTime(),
			});
		}
	}

	console.log(
		`[calendar] ${source.name}: ${events.length} occurrences between ${start.toISOString()} and ${end.toISOString()}`,
	);
	return events;
}

async function loadAllEvents(): Promise<CachedEvent[]> {
	const now = Date.now();
	if (calendarCache && now - calendarCache.at < CACHE_TTL_MS) {
		return calendarCache.data;
	}

	// Start of today (set TZ=Europe/Stockholm in the server env)
	const start = new Date();
	start.setHours(0, 0, 0, 0);
	const end = new Date(start);
	end.setDate(end.getDate() + LOOKAHEAD_DAYS);

	const results = await Promise.allSettled(
		CALENDARS.map((source) => fetchSource(source, start, end)),
	);

	const events: CachedEvent[] = [];
	results.forEach((result, i) => {
		if (result.status === "fulfilled") {
			events.push(...result.value);
		} else {
			console.warn(
				`Failed to fetch calendar ${CALENDARS[i].name}:`,
				result.reason,
			);
		}
	});

	events.sort((a, b) => a.startsAt - b.startsAt);

	// Don't cache a total failure, or an outage would stick for 5 minutes
	if (results.some((r) => r.status === "fulfilled")) {
		calendarCache = { data: events, at: now };
	}
	return events;
}

export const getCalendarEvents = createServerFn({ method: "GET" }).handler(
	async (): Promise<CalendarData> => {
		const all = await loadAllEvents();

		// Filter at read time so cached events that have since passed drop off
		const now = Date.now();
		const startOfToday = new Date();
		startOfToday.setHours(0, 0, 0, 0);

		const events = all
			.filter((e) => e.startsAt >= (e.allDay ? startOfToday.getTime() : now))
			.map(({ summary, start, allDay, owner, color }) => ({
				summary,
				start,
				allDay,
				owner,
				color,
			}));

		// Sent separately so people with no upcoming events still get a toggle
		const owners = CALENDARS.map(({ name, color }) => ({
			name,
			color: color ?? DEFAULT_COLOR,
		}));

		return { owners, events };
	},
);

export const calendarQueryOptions = queryOptions({
	queryKey: ["calendar-events"],
	queryFn: () => getCalendarEvents(),
	// Cheap to poll: the server answers from its own 5 min cache
	staleTime: REFRESH_MS,
	refetchInterval: REFRESH_MS,
});
