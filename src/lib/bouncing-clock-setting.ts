import { createSyncedBooleanSetting } from "./synced-setting";

/** Reads/writes the "bouncing clock" setting, kept in sync across components and tabs. */
export const useBouncingClockSetting =
	createSyncedBooleanSetting("bouncing-clock");
