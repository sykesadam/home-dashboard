import { focusManager } from "@tanstack/react-query";
import { useEffect } from "react";

/**
 * Powering off the kiosk's display (DPMS/wlopm) doesn't fire any browser
 * visibility or focus event — as far as the page knows, it's still in the
 * foreground. Left alone, every `refetchInterval` query keeps polling APIs
 * for a screen nobody can see.
 *
 * Marks TanStack Query's global focus state as unfocused while
 * `shouldPause` is true, which pauses refetchInterval and
 * refetchOnWindowFocus for every query; the caller decides when that should
 * be (e.g. idle, but not when "keep screen awake" is on). Any activity
 * flipping it back resumes normal polling.
 */
export function useIdleQueryPause(shouldPause: boolean) {
	useEffect(() => {
		focusManager.setFocused(!shouldPause);
	}, [shouldPause]);

	useEffect(() => {
		return () => {
			// Hand control back to TanStack Query's own focus/visibility detection
			focusManager.setFocused(undefined);
		};
	}, []);
}
