import { focusManager } from "@tanstack/react-query";
import { useEffect } from "react";

// Keep this in sync with the swayidle timeout in ~/.config/labwc/autostart
// on the Pi — the goal is for queries to go quiet at (roughly) the same
// moment the touchscreen powers off.
const IDLE_TIMEOUT_MS = 2 * 60 * 1000;

const ACTIVITY_EVENTS = [
	"pointerdown",
	"pointermove",
	"touchstart",
	"keydown",
	"wheel",
] as const;

/**
 * Powering off the kiosk's display (DPMS/wlopm) doesn't fire any browser
 * visibility or focus event — as far as the page knows, it's still in the
 * foreground. Left alone, every `refetchInterval` query keeps polling APIs
 * for a screen nobody can see.
 *
 * This mirrors the screen's own idle timeout in JS: after IDLE_TIMEOUT_MS of
 * no touch/mouse/key activity, it marks TanStack Query's global focus state
 * as unfocused, which pauses refetchInterval and refetchOnWindowFocus for
 * every query in the app. Any activity (i.e. the "tap to wake") immediately
 * marks it focused again, resuming normal polling.
 */
export function useIdleQueryPause(options: { disabled?: boolean } = {}) {
	const { disabled = false } = options;

	useEffect(() => {
		// "Keep screen awake" is on — the screen won't sleep, so don't pause
		// queries either.
		if (disabled) {
			focusManager.setFocused(true);
			return;
		}

		let timer: ReturnType<typeof setTimeout>;

		const goIdle = () => focusManager.setFocused(false);

		const markActive = () => {
			focusManager.setFocused(true);
			clearTimeout(timer);
			timer = setTimeout(goIdle, IDLE_TIMEOUT_MS);
		};

		for (const event of ACTIVITY_EVENTS) {
			window.addEventListener(event, markActive, { passive: true });
		}
		markActive();

		return () => {
			clearTimeout(timer);
			for (const event of ACTIVITY_EVENTS) {
				window.removeEventListener(event, markActive);
			}
			// Hand control back to TanStack Query's own focus/visibility detection
			focusManager.setFocused(undefined);
		};
	}, [disabled]);
}
