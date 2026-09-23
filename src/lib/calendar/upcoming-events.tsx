import { useSuspenseQuery } from "@tanstack/react-query";
import { cn } from "cn";
import { CalendarOff } from "lucide-react";
import { useState } from "react";
import { Card, CardContent, CardHeader } from "#/components/ui/card";
import { type CalendarEvent, calendarQueryOptions } from "./query";

// Show everything within this many days (today included)...
const WINDOW_DAYS = 3;
// ...or, if that window is empty, this many upcoming events beyond it
const FALLBACK_EVENTS_COUNT = 3;

const ALL = "all";
const DAY_MS = 24 * 60 * 60 * 1000;

// All-day events come as "YYYY-MM-DD", timed events as ISO timestamps
function toDate(e: CalendarEvent) {
	return e.allDay ? new Date(`${e.start}T00:00:00`) : new Date(e.start);
}

function startOfDay(d: Date) {
	const x = new Date(d);
	x.setHours(0, 0, 0, 0);
	return x;
}

function dayLabel(d: Date, now: Date) {
	const diff = Math.round(
		(startOfDay(d).getTime() - startOfDay(now).getTime()) / DAY_MS,
	);
	if (diff === 0) return "Idag";
	if (diff === 1) return "Imorgon";
	return d.toLocaleDateString("sv-SE", {
		weekday: "long",
		day: "numeric",
		month: "long",
	});
}

function timeLabel(e: CalendarEvent) {
	if (e.allDay) return "Heldag";
	return toDate(e).toLocaleTimeString("sv-SE", {
		hour: "2-digit",
		minute: "2-digit",
	});
}

// Everything in the next few days, or else the next few events overall.
// Events arrive sorted by start time.
function selectEvents(events: CalendarEvent[], now: Date) {
	const windowEnd = startOfDay(now);
	windowEnd.setDate(windowEnd.getDate() + WINDOW_DAYS);

	const inWindow = events.filter((e) => toDate(e) < windowEnd);
	return inWindow.length > 0
		? inWindow
		: events.slice(0, FALLBACK_EVENTS_COUNT);
}

function groupByDay(events: CalendarEvent[], now: Date) {
	const groups = new Map<string, { label: string; events: CalendarEvent[] }>();
	for (const e of events) {
		const d = toDate(e);
		const key = d.toLocaleDateString("sv-SE"); // YYYY-MM-DD
		const group = groups.get(key) ?? { label: dayLabel(d, now), events: [] };
		group.events.push(e);
		groups.set(key, group);
	}
	return [...groups.entries()];
}

function FilterButton({
	active,
	onClick,
	color,
	children,
}: {
	active: boolean;
	onClick: () => void;
	color?: string;
	children: React.ReactNode;
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			aria-pressed={active}
			className={cn(
				"inline-flex justify-center text-center first:rounded-l-full last:rounded-r-full items-center gap-1.5 px-3 py-1 text-xs font-medium transition-colors",
				active
					? "bg-primary text-primary-foreground"
					: "bg-muted text-muted-foreground hover:bg-muted/70",
			)}
		>
			{color && (
				<span
					className="size-2 rounded-full"
					style={{ backgroundColor: color }}
				/>
			)}
			{children}
		</button>
	);
}

export function UpcomingEvents({ className }: { className?: string }) {
	const { data } = useSuspenseQuery(calendarQueryOptions);
	const [selected, setSelected] = useState<string>(ALL);

	const now = new Date();
	// Filter first, then pick window/fallback, so each person gets their own
	// "next 3 events" when they have nothing in the coming days
	const filtered =
		selected === ALL
			? data.events
			: data.events.filter((e) => e.owner === selected);
	const days = groupByDay(selectEvents(filtered, now), now);

	return (
		<Card className={cn("h-full", className)} size="sm">
			<CardHeader>
				{/* <CardTitle>Kalender</CardTitle> */}
				<div className="grid grid-cols-3">
					<FilterButton
						active={selected === ALL}
						onClick={() => setSelected(ALL)}
					>
						Alla
					</FilterButton>
					{data.owners.map((o) => (
						<FilterButton
							key={o.name}
							active={selected === o.name}
							onClick={() => setSelected(o.name)}
							color={o.color}
						>
							{o.name}
						</FilterButton>
					))}
				</div>
			</CardHeader>
			<CardContent className="flex grow flex-col gap-4">
				{days.length > 0 ? (
					<div className="flex flex-col gap-4">
						{days.map(([key, day]) => (
							<section key={key} className="flex flex-col gap-2">
								<h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground first-letter:uppercase">
									{day.label}
								</h3>
								<ul className="flex flex-col gap-2">
									{day.events.map((e) => (
										<li
											key={`${e.owner}-${e.start}-${e.summary}`}
											className="flex items-baseline gap-3"
										>
											<span className="w-14 shrink-0 text-sm tabular-nums text-muted-foreground">
												{timeLabel(e)}
											</span>
											<div
												className="min-w-0 grow border-l-4 pl-3"
												style={{ borderLeftColor: e.color }}
											>
												<div className="truncate font-medium">{e.summary}</div>
												{selected === ALL && (
													<div className="text-sm text-muted-foreground">
														{e.owner}
													</div>
												)}
											</div>
										</li>
									))}
								</ul>
							</section>
						))}
					</div>
				) : (
					<div className="flex grow flex-col items-center justify-center gap-4">
						<CalendarOff size={48} />
					</div>
				)}
			</CardContent>
		</Card>
	);
}
