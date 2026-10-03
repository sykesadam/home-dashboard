import { useSyncExternalStore } from "react";

/**
 * Creates a boolean setting persisted to localStorage and kept in sync
 * across components (and other tabs/windows, via the `storage` event).
 * Returns a `useXSetting()` hook à la `useState`, backed by that storage.
 */
export function createSyncedBooleanSetting(storageKey: string) {
	function readStored(): boolean {
		if (typeof window === "undefined") return false;
		try {
			return window.localStorage.getItem(storageKey) === "true";
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

	function set(next: boolean) {
		cached = next;
		try {
			window.localStorage.setItem(storageKey, String(next));
		} catch {
			// localStorage unavailable — setting just won't survive a reload
		}
		emit();
	}

	if (typeof window !== "undefined") {
		// Picks up the setting changing in another tab/window
		window.addEventListener("storage", (event) => {
			if (event.key === storageKey) {
				cached = readStored();
				emit();
			}
		});
	}

	return function useSyncedBooleanSetting() {
		const enabled = useSyncExternalStore(
			subscribe,
			getSnapshot,
			getServerSnapshot,
		);
		return [enabled, set] as const;
	};
}
