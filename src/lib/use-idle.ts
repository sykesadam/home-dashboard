import { useEffect, useState } from "react";

// Keep this in sync with the swayidle timeout in ~/.config/labwc/autostart
// on the Pi — the goal is for queries to go quiet (via useIdleQueryPause)
// and the bouncing clock to appear at roughly the same moment the
// touchscreen would power off.
export const IDLE_TIMEOUT_MS = 2 * 60 * 1000;

const ACTIVITY_EVENTS = [
	"pointerdown",
	"pointermove",
	"touchstart",
	"keydown",
	"wheel",
] as const;

/**
 * Reports true once no touch/mouse/key activity has happened for
 * `timeoutMs` (defaults to IDLE_TIMEOUT_MS).
 */
export function useIdle(timeoutMs: number = IDLE_TIMEOUT_MS) {
	const [idle, setIdle] = useState(false);

	useEffect(() => {
		let timer: ReturnType<typeof setTimeout>;

		const goIdle = () => setIdle(true);

		const markActive = () => {
			setIdle(false);
			clearTimeout(timer);
			timer = setTimeout(goIdle, timeoutMs);
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
		};
	}, [timeoutMs]);

	return idle;
}
