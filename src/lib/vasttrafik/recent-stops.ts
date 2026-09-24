import { useCallback, useEffect, useState } from "react";

export type RecentStop = { gid: string; name: string };

const STORAGE_KEY = "departure-search:recent";
const MAX_RECENT = 6;

function readRecent(): RecentStop[] {
	try {
		const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
		return Array.isArray(parsed)
			? parsed.filter(
					(s): s is RecentStop =>
						typeof s?.gid === "string" && typeof s?.name === "string",
				)
			: [];
	} catch {
		return [];
	}
}

function writeRecent(stops: RecentStop[]) {
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(stops));
	} catch {
		// Storage full or blocked; recents are a convenience, so ignore
	}
}

export function useRecentStops() {
	// Read after mount so server and client render the same markup
	const [recent, setRecent] = useState<RecentStop[]>([]);
	useEffect(() => setRecent(readRecent()), []);

	const update = useCallback(
		(fn: (stops: RecentStop[]) => RecentStop[]) =>
			setRecent((prev) => {
				const next = fn(prev);
				writeRecent(next);
				return next;
			}),
		[],
	);

	// Most recent first, no duplicates
	const add = useCallback(
		({ gid, name }: RecentStop) =>
			update((stops) =>
				[{ gid, name }, ...stops.filter((s) => s.gid !== gid)].slice(
					0,
					MAX_RECENT,
				),
			),
		[update],
	);

	const remove = useCallback(
		(gid: string) => update((stops) => stops.filter((s) => s.gid !== gid)),
		[update],
	);

	return { recent, add, remove };
}
