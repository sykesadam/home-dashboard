import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { request } from "../utils";

// Local Hue bridge, v1 API.
// Get a username by pressing the bridge link button, then:
//   curl.exe -X POST http://<bridge-ip>/api -d '{\"devicetype\":\"home-dashboard\"}'

export type HueKind = "light" | "group";

export type HueTarget = {
	kind: HueKind;
	id: string;
	name: string;
	on: boolean;
	reachable: boolean;
	bri: number | null; // 1-254, null for on/off-only lights
	colormode: "hs" | "xy" | "ct" | null;
	hue: number | null; // 0-65535
	sat: number | null; // 0-254
	ct: number | null; // mireds, 153 (cold) - 500 (warm)
	supportsColor: boolean;
	supportsCt: boolean;
};

export type HueData = { rooms: HueTarget[]; lights: HueTarget[] };

type HueLightState = {
	on: boolean;
	bri?: number;
	hue?: number;
	sat?: number;
	ct?: number;
	colormode?: "hs" | "xy" | "ct";
};

type HueLightsPayload = Record<
	string,
	{ name: string; state: HueLightState & { reachable?: boolean } }
>;

type HueGroupsPayload = Record<
	string,
	{
		name: string;
		type: string;
		lights: string[];
		state: { any_on: boolean };
		action: HueLightState;
	}
>;

// Skip the Entertainment/LightGroup entries that apps create behind the scenes
const ROOM_TYPES = new Set(["Room", "Zone"]);

const hueUpdateSchema = z.object({
	on: z.boolean().optional(),
	bri: z.number().int().min(1).max(254).optional(),
	hue: z.number().int().min(0).max(65535).optional(),
	sat: z.number().int().min(0).max(254).optional(),
	ct: z.number().int().min(153).max(500).optional(),
});

export type HueUpdate = z.infer<typeof hueUpdateSchema>;

const setHueInputSchema = z.object({
	kind: z.enum(["light", "group"]),
	id: z.string().regex(/^\d+$/),
	update: hueUpdateSchema,
});

function apiUrl(path: string) {
	return `http://${process.env.HUE_BRIDGE_IP}/api/${process.env.HUE_USERNAME}/${path}`;
}

function toTarget(
	kind: HueKind,
	id: string,
	name: string,
	on: boolean,
	state: HueLightState,
	reachable = true,
): HueTarget {
	return {
		kind,
		id,
		name,
		on,
		reachable,
		bri: state.bri ?? null,
		colormode: state.colormode ?? null,
		hue: state.hue ?? null,
		sat: state.sat ?? null,
		ct: state.ct ?? null,
		supportsColor: state.hue != null,
		supportsCt: state.ct != null,
	};
}

const byName = (a: HueTarget, b: HueTarget) =>
	a.name.localeCompare(b.name, "sv");

async function fetchHue(): Promise<HueData> {
	const [lights, groups] = await Promise.all([
		request<HueLightsPayload>(apiUrl("lights"), { method: "GET" }),
		request<HueGroupsPayload>(apiUrl("groups"), { method: "GET" }),
	]);

	return {
		rooms: Object.entries(groups)
			.filter(([, g]) => ROOM_TYPES.has(g.type) && g.lights.length > 0)
			.map(([id, g]) => toTarget("group", id, g.name, g.state.any_on, g.action))
			.sort(byName),
		lights: Object.entries(lights)
			.map(([id, l]) =>
				toTarget("light", id, l.name, l.state.on, l.state, l.state.reachable),
			)
			.sort(byName),
	};
}

export const getHueFn = createServerFn().handler(fetchHue);

export const setHueFn = createServerFn({ method: "POST" })
	.inputValidator(setHueInputSchema)
	.handler(async ({ data }) => {
		const path =
			data.kind === "light"
				? `lights/${data.id}/state`
				: `groups/${data.id}/action`;
		// The bridge answers 200 with [{ error: ... }] on failure
		const result = await request<Array<{ error?: { description: string } }>>(
			apiUrl(path),
			{ method: "PUT", body: JSON.stringify(data.update) },
		);
		const error = result.find((r) => r.error)?.error;
		if (error) throw new Error(`Hue: ${error.description}`);
	});

export const hueQuery = queryOptions({
	queryKey: ["hue"],
	queryFn: getHueFn,
	// Picks up changes made from the Hue app or physical switches
	refetchInterval: 10_000,
});
