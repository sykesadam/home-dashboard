import { useEffect, useRef } from "react";

const COLORS = [
	"#f87171", // red
	"#fb923c", // orange
	"#facc15", // yellow
	"#4ade80", // green
	"#38bdf8", // sky
	"#a78bfa", // violet
	"#f472b6", // pink
];

const SPEED_PX_PER_SEC = 120;

const TIME_FORMATTER = new Intl.DateTimeFormat("sv-SE", {
	hour: "2-digit",
	minute: "2-digit",
});

function randomColor(exclude: string) {
	const choices = COLORS.filter((color) => color !== exclude);
	return choices[Math.floor(Math.random() * choices.length)] ?? COLORS[0];
}

/**
 * A DVD-logo-style bouncing clock, shown full-screen in place of the
 * dashboard once the kiosk has sat idle with the "bouncing clock" setting
 * on — the caller swaps this in for the dashboard entirely rather than
 * layering it on top, so none of the dashboard's widgets are left mounted
 * doing background work while nobody's looking. Changes color each time it
 * hits an edge.
 */
export function BouncingClock() {
	const boxRef = useRef<HTMLDivElement>(null);
	const timeRef = useRef<HTMLSpanElement>(null);

	useEffect(() => {
		const box = boxRef.current;
		if (!box) return;

		// Measured once (and on resize) instead of inside `tick` — reading
		// offsetWidth/offsetHeight every frame right after writing
		// box.style.transform the frame before forces a synchronous layout
		// on every single animation frame.
		let boxWidth = box.offsetWidth;
		let boxHeight = box.offsetHeight;
		const measure = () => {
			boxWidth = box.offsetWidth;
			boxHeight = box.offsetHeight;
		};
		window.addEventListener("resize", measure);
		// The box's own size changes after mount too (web font swapping in,
		// digits changing width), so re-measure whenever it does.
		const observer = new ResizeObserver(measure);
		observer.observe(box);

		let x = Math.random() * Math.max(window.innerWidth - boxWidth, 0);
		let y = Math.random() * Math.max(window.innerHeight - boxHeight, 0);
		let dx = Math.random() < 0.5 ? -1 : 1;
		let dy = Math.random() < 0.5 ? -1 : 1;
		let color = randomColor("");
		box.style.color = color;
		box.style.transform = `translate(${x}px, ${y}px)`;

		let lastFrameTime = performance.now();
		let frame: number;

		const tick = (now: number) => {
			const deltaSeconds = (now - lastFrameTime) / 1000;
			lastFrameTime = now;

			const maxX = Math.max(window.innerWidth - boxWidth, 0);
			const maxY = Math.max(window.innerHeight - boxHeight, 0);

			x += dx * SPEED_PX_PER_SEC * deltaSeconds;
			y += dy * SPEED_PX_PER_SEC * deltaSeconds;

			let bounced = false;
			if (x <= 0) {
				x = 0;
				dx = 1;
				bounced = true;
			} else if (x >= maxX) {
				x = maxX;
				dx = -1;
				bounced = true;
			}
			if (y <= 0) {
				y = 0;
				dy = 1;
				bounced = true;
			} else if (y >= maxY) {
				y = maxY;
				dy = -1;
				bounced = true;
			}

			if (bounced) {
				color = randomColor(color);
				box.style.color = color;
			}

			box.style.transform = `translate(${x}px, ${y}px)`;
			frame = requestAnimationFrame(tick);
		};

		frame = requestAnimationFrame(tick);
		return () => {
			cancelAnimationFrame(frame);
			window.removeEventListener("resize", measure);
			observer.disconnect();
		};
	}, []);

	useEffect(() => {
		const update = () => {
			if (timeRef.current) {
				timeRef.current.textContent = TIME_FORMATTER.format(new Date());
			}
		};
		update();
		const id = setInterval(update, 1000);
		return () => clearInterval(id);
	}, []);

	return (
		<div
			ref={boxRef}
			aria-hidden
			className="fixed top-0 left-0 w-max select-none whitespace-nowrap font-heading text-7xl font-semibold tabular-nums will-change-transform"
		>
			{/* Rendered with the time already in it (not filled in by an effect) so
			    the box has its real size when the animation effect first measures
			    it. Only ever mounted client-side, so no hydration mismatch. */}
			<span ref={timeRef}>{TIME_FORMATTER.format(new Date())}</span>
		</div>
	);
}
