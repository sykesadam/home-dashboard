import { useEffect, useRef } from "react";
import { createSyncedBooleanSetting } from "./synced-setting";

/** Reads/writes the "keep screen awake" setting, kept in sync across components and tabs. */
export const useKeepAwakeSetting =
	createSyncedBooleanSetting("keep-screen-awake");

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
