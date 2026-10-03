import { useEffect, useRef, useSyncExternalStore } from "react";

const STORAGE_KEY = "keep-screen-awake";

function readStored(): boolean {
	if (typeof window === "undefined") return false;
	try {
		return window.localStorage.getItem(STORAGE_KEY) === "true";
	} catch {
		return false;
	}
}

type Listener = () => void;
const listeners = new Set<Listener>();
let cached = readStored();

function emit() {
	for (const listener of listeners) listener();
}

function subscribe(listener: Listener) {
	listeners.add(listener);
	return () => listeners.delete(listener);
}

function getSnapshot() {
	return cached;
}

function getServerSnapshot() {
	return false;
}

function setKeepAwake(next: boolean) {
	cached = next;
	try {
		window.localStorage.setItem(STORAGE_KEY, String(next));
	} catch {
		// localStorage unavailable — setting just won't survive a reload
	}
	emit();
}

if (typeof window !== "undefined") {
	// Picks up the setting changing in another tab/window
	window.addEventListener("storage", (event) => {
		if (event.key === STORAGE_KEY) {
			cached = readStored();
			emit();
		}
	});
}

/** Reads/writes the "keep screen awake" setting, kept in sync across components and tabs. */
export function useKeepAwakeSetting() {
	const enabled = useSyncExternalStore(
		subscribe,
		getSnapshot,
		getServerSnapshot,
	);
	return [enabled, setKeepAwake] as const;
}

/**
 * Holds a Screen Wake Lock while `enabled` is true, telling the OS not to
 * blank/sleep the display — this is what actually keeps the Pi's touchscreen
 * on instead of letting swayidle's timeout turn it off.
 *
 * Requires a secure context: https, or http://localhost. If the kiosk points
 * Firefox at a LAN IP over plain http, the Wake Lock API won't exist and this
 * silently does nothing (logs a warning) — point it at localhost instead.
 */
export function useScreenWakeLock(enabled: boolean) {
	const lockRef = useRef<WakeLockSentinel | null>(null);

	useEffect(() => {
		if (!enabled) return;
		if (!("wakeLock" in navigator)) {
			console.warn(
				"Screen Wake Lock API unavailable (needs https:// or http://localhost) — can't keep the screen on from here.",
			);
			return;
		}

		let cancelled = false;

		const acquire = async () => {
			try {
				const lock = await navigator.wakeLock.request("screen");
				if (cancelled) {
					lock.release();
					return;
				}
				lockRef.current = lock;
				lock.addEventListener("release", () => {
					lockRef.current = null;
				});
			} catch (error) {
				console.warn("Failed to acquire screen wake lock:", error);
			}
		};

		acquire();

		// The browser releases the lock when the page is hidden; grab it back
		// as soon as it's visible again (still enabled).
		const onVisibilityChange = () => {
			if (document.visibilityState === "visible" && !lockRef.current) {
				acquire();
			}
		};
		document.addEventListener("visibilitychange", onVisibilityChange);

		return () => {
			cancelled = true;
			document.removeEventListener("visibilitychange", onVisibilityChange);
			lockRef.current?.release();
			lockRef.current = null;
		};
	}, [enabled]);
}
