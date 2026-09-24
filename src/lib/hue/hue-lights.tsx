import {
	useMutation,
	useQueryClient,
	useSuspenseQuery,
} from "@tanstack/react-query";
import { Lightbulb, LightbulbOff, Power } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { FilterButton } from "#/components/filter-button";
import { Button } from "#/components/ui/button";
import { Card, CardContent, CardHeader } from "#/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "#/components/ui/dialog";
import { Slider } from "#/components/ui/slider";
import { cn } from "../utils";
import {
	type HueData,
	type HueKind,
	type HueTarget,
	type HueUpdate,
	hueQuery,
	setHueFn,
} from "./query";

const LONG_PRESS_MS = 500;

const TABS = [
	{ key: "lights", label: "Lampor" },
	{ key: "rooms", label: "Rum" },
] as const;

type Tab = (typeof TABS)[number]["key"];
type TargetRef = { kind: HueKind; id: string };

const WHITE_PRESETS: Array<{ label: string; update: HueUpdate }> = [
	{ label: "Kall", update: { ct: 153 } },
	{ label: "Neutral", update: { ct: 250 } },
	{ label: "Varm", update: { ct: 370 } },
	{ label: "Mysig", update: { ct: 454 } },
];

const COLOR_PRESETS: Array<{ label: string; update: HueUpdate }> = [
	{ label: "Röd", update: { hue: 0, sat: 254 } },
	{ label: "Orange", update: { hue: 5500, sat: 254 } },
	{ label: "Gul", update: { hue: 10500, sat: 254 } },
	{ label: "Grön", update: { hue: 25500, sat: 254 } },
	{ label: "Blå", update: { hue: 46920, sat: 254 } },
	{ label: "Lila", update: { hue: 50000, sat: 254 } },
	{ label: "Rosa", update: { hue: 56100, sat: 254 } },
];

// Mireds 153 (cold) -> 500 (warm), approximated as a blend between two whites
function ctToCss(ct: number) {
	const t = Math.min(1, Math.max(0, (ct - 153) / (500 - 153)));
	const mix = (a: number, b: number) => Math.round(a + (b - a) * t);
	return `rgb(${mix(220, 255)}, ${mix(232, 170)}, ${mix(255, 90)})`;
}

function hsToCss(hue: number, sat: number) {
	return `hsl(${Math.round((hue / 65535) * 360)}, ${Math.round((sat / 254) * 100)}%, 55%)`;
}

function toCss(t: Pick<HueTarget, "colormode" | "hue" | "sat" | "ct">) {
	if (t.colormode === "ct" && t.ct != null) return ctToCss(t.ct);
	if (t.hue != null && t.sat != null) return hsToCss(t.hue, t.sat);
	return ctToCss(370);
}

function presetToCss(update: HueUpdate) {
	return update.ct != null
		? ctToCss(update.ct)
		: hsToCss(update.hue ?? 0, update.sat ?? 254);
}

function toPercent(bri: number) {
	return Math.max(1, Math.round((bri / 254) * 100));
}

function statusLabel(t: HueTarget) {
	if (!t.reachable) return "Ej nåbar";
	if (!t.on) return "Av";
	return t.bri != null ? `${toPercent(t.bri)}%` : "På";
}

function applyUpdate(t: HueTarget, update: HueUpdate): HueTarget {
	const colormode =
		update.ct != null ? "ct" : update.hue != null ? "hs" : t.colormode;
	return { ...t, ...update, colormode };
}

function useSetHue() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (vars: TargetRef & { update: HueUpdate }) =>
			setHueFn({ data: vars }),
		// Optimistic, so the widget reacts instantly on a touch screen
		onMutate: async ({ kind, id, update }) => {
			await queryClient.cancelQueries({ queryKey: hueQuery.queryKey });
			const previous = queryClient.getQueryData(hueQuery.queryKey);
			queryClient.setQueryData(
				hueQuery.queryKey,
				(old): HueData | undefined => {
					if (!old) return old;
					const patch = (list: HueTarget[]) =>
						list.map((t) =>
							t.kind === kind && t.id === id ? applyUpdate(t, update) : t,
						);
					return { rooms: patch(old.rooms), lights: patch(old.lights) };
				},
			);
			return { previous };
		},
		onError: (_error, _vars, context) => {
			if (context?.previous) {
				queryClient.setQueryData(hueQuery.queryKey, context.previous);
			}
		},
		// Refetch so rooms and their lights catch up with each other
		onSettled: () =>
			queryClient.invalidateQueries({ queryKey: hueQuery.queryKey }),
	});
}

// Tap runs onClick, holding for LONG_PRESS_MS runs onLongPress instead
function useLongPress(onLongPress: () => void, onClick: () => void) {
	const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
	const fired = useRef(false);

	const cancel = () => clearTimeout(timer.current);
	useEffect(() => () => clearTimeout(timer.current), []);

	return {
		onPointerDown: () => {
			fired.current = false;
			cancel();
			timer.current = setTimeout(() => {
				fired.current = true;
				onLongPress();
			}, LONG_PRESS_MS);
		},
		onPointerUp: cancel,
		onPointerLeave: cancel,
		onPointerCancel: cancel,
		onClick: () => {
			if (fired.current) {
				fired.current = false;
				return;
			}
			onClick();
		},
		// Stop the browser's own long-press menu on touch screens
		onContextMenu: (e: React.MouseEvent) => e.preventDefault(),
	};
}

export function HueLights({ className }: { className?: string }) {
	const { data } = useSuspenseQuery(hueQuery);
	const setHue = useSetHue();
	const [tab, setTab] = useState<Tab>("lights");
	const [open, setOpen] = useState(false);
	// Kept after closing so the dialog doesn't go blank while animating out
	const [selected, setSelected] = useState<TargetRef | null>(null);

	const items = data[tab];
	const target = selected
		? [...data.rooms, ...data.lights].find(
				(t) => t.kind === selected.kind && t.id === selected.id,
			)
		: undefined;

	return (
		<Card className={cn("h-full", className)} size="sm">
			<CardHeader>
				<div className="grid grid-cols-2">
					{TABS.map((t) => (
						<FilterButton
							key={t.key}
							active={tab === t.key}
							onClick={() => setTab(t.key)}
						>
							{t.label}
						</FilterButton>
					))}
				</div>
			</CardHeader>
			<CardContent className="min-h-0 grow">
				<ul className="h-full overflow-y-auto grid grid-cols-2 content-start gap-x-2 gap-y-4 p-1.5 -m-1.5">
					{items.map((t) => (
						<HueRow
							key={`${t.kind}-${t.id}`}
							target={t}
							onToggle={() =>
								setHue.mutate({ kind: t.kind, id: t.id, update: { on: !t.on } })
							}
							onOpen={() => {
								setSelected({ kind: t.kind, id: t.id });
								setOpen(true);
							}}
						/>
					))}
				</ul>
			</CardContent>

			<Dialog open={open} onOpenChange={setOpen}>
				<DialogContent className="sm:max-w-md">
					{target && (
						<>
							<DialogHeader>
								<DialogTitle>{target.name}</DialogTitle>
							</DialogHeader>
							<HueControls
								key={`${target.kind}-${target.id}`}
								target={target}
								onChange={(update) =>
									setHue.mutate({ kind: target.kind, id: target.id, update })
								}
							/>
						</>
					)}
				</DialogContent>
			</Dialog>
		</Card>
	);
}

function HueRow({
	target,
	onToggle,
	onOpen,
}: {
	target: HueTarget;
	onToggle: () => void;
	onOpen: () => void;
}) {
	const pressHandlers = useLongPress(onOpen, onToggle);
	const color = toCss(target);
	const lit = target.on && target.reachable;

	return (
		<li className="flex min-w-0 flex-col items-center gap-2 text-center">
			<button
				type="button"
				aria-pressed={target.on}
				aria-label={`${target.name}: ${target.on ? "tänd" : "släckt"}. Håll in för inställningar`}
				disabled={!target.reachable}
				className={cn(
					"size-12 shrink-0 rounded-full flex items-center justify-center select-none outline-none transition-[transform,background-color,box-shadow] active:scale-90 focus-visible:ring-2 focus-visible:ring-ring/30 disabled:opacity-50 [-webkit-touch-callout:none]",
					!lit && "bg-muted text-muted-foreground",
				)}
				style={
					lit
						? {
								backgroundColor: color,
								color: "#1a1a1a",
								boxShadow: `0 0 0 3px color-mix(in oklab, ${color} 35%, transparent), 0 0 8px color-mix(in oklab, ${color} 60%, transparent)`,
							}
						: undefined
				}
				{...pressHandlers}
			>
				{lit ? (
					<Lightbulb className="size-6" />
				) : (
					<LightbulbOff className="size-6" />
				)}
			</button>
			<div className="w-full min-w-0 leading-tight">
				<div className="truncate font-medium" title={target.name}>
					{target.name}
				</div>
				<div className="text-muted-foreground tabular-nums">
					{statusLabel(target)}
				</div>
			</div>
		</li>
	);
}

function HueControls({
	target,
	onChange,
}: {
	target: HueTarget;
	onChange: (update: HueUpdate) => void;
}) {
	// Local values while dragging; the bridge only gets the value on release
	// (room commands are rate limited to about one per second)
	const [bri, setBri] = useState(target.bri ?? 254);
	const [hue, setHueValue] = useState(target.hue ?? 0);

	useEffect(() => {
		if (target.bri != null) setBri(target.bri);
	}, [target.bri]);
	useEffect(() => {
		if (target.hue != null) setHueValue(target.hue);
	}, [target.hue]);

	const presets = [
		...(target.supportsCt ? WHITE_PRESETS : []),
		...(target.supportsColor ? COLOR_PRESETS : []),
	];

	return (
		<div className="flex flex-col gap-6 pt-2">
			<div className="flex items-center justify-between">
				<span className="text-4xl font-medium text-accent-foreground">
					{target.on
						? target.bri != null
							? `${toPercent(bri)}%`
							: "På"
						: "Av"}
				</span>
				<Button
					type="button"
					size="icon-lg"
					variant={target.on ? "default" : "outline"}
					className="size-12 rounded-full"
					aria-pressed={target.on}
					aria-label={target.on ? "Släck" : "Tänd"}
					onClick={() => onChange({ on: !target.on })}
				>
					<Power className="size-5" />
				</Button>
			</div>

			{target.bri != null && (
				<section className="flex flex-col gap-2">
					<h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
						Ljusstyrka
					</h3>
					<Slider
						aria-label="Ljusstyrka"
						min={1}
						max={254}
						value={bri}
						onValueChange={(value) => setBri(value)}
						onValueCommitted={(value) => onChange({ on: true, bri: value })}
					/>
				</section>
			)}

			{presets.length > 0 && (
				<section className="flex flex-col gap-3">
					<h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
						Färg
					</h3>
					<div className="grid grid-cols-6 gap-2">
						{presets.map((preset) => (
							<button
								key={preset.label}
								type="button"
								aria-label={preset.label}
								title={preset.label}
								onClick={() => onChange({ on: true, ...preset.update })}
								className="aspect-square rounded-full ring-1 ring-foreground/10 transition-transform active:scale-90 outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
								style={{ backgroundColor: presetToCss(preset.update) }}
							/>
						))}
					</div>
					{target.supportsColor && (
						<Slider
							aria-label="Nyans"
							min={0}
							max={65535}
							value={hue}
							onValueChange={(value) => setHueValue(value)}
							onValueCommitted={(value) =>
								onChange({ on: true, hue: value, sat: 254 })
							}
							indicatorClassName="bg-transparent"
							trackStyle={{
								background:
									"linear-gradient(to right, hsl(0 100% 55%), hsl(60 100% 55%), hsl(120 100% 55%), hsl(180 100% 55%), hsl(240 100% 55%), hsl(300 100% 55%), hsl(360 100% 55%))",
							}}
						/>
					)}
				</section>
			)}
		</div>
	);
}
