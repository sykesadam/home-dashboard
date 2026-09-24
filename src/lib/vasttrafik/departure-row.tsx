import { cn } from "../utils";
import type { Result } from "./types";

function minutesUntil(isoString: string) {
	const diffMs = new Date(isoString).getTime() - Date.now();
	return Math.max(0, Math.round(diffMs / 60000));
}

const getEtaLabel = (isCancelled: boolean, estimated: string) => {
	const mins = minutesUntil(estimated);

	return isCancelled ? "Inställd" : mins === 0 ? "Nu" : `${mins} min`;
};
const getEtaClass = (isCancelled: boolean, estimated: string) => {
	const mins = minutesUntil(estimated);

	return !isCancelled && mins === 0 ? "text-destructive" : "";
};

export function DepartureRow({ item }: { item: Result }) {
	const time = item.estimatedTime ?? item.plannedTime;

	return (
		<div className="departure text-base flex items-center gap-2 py-2 border-b border-muted">
			<span
				style={{
					backgroundColor: item.serviceJourney.line.backgroundColor,
					color: item.serviceJourney.line.foregroundColor,
					borderColor: item.serviceJourney.line.borderColor,
				}}
				className="shrink-0 rounded-xs border font-black font-mono tabular-nums size-6 flex items-center justify-center text-sm"
			>
				{item.serviceJourney.line.shortName}
			</span>
			<span
				className={cn(
					"mr-auto ",
					item.isCancelled ? "text-destructive line-through" : "",
				)}
			>
				{item.serviceJourney.direction}
			</span>
			<div>
				<span className={cn(getEtaClass(item.isCancelled, time))}>
					{getEtaLabel(item.isCancelled, time)}
				</span>
				<span className="text-muted-foreground text-sm">
					{" "}
					({new Date(time).toLocaleTimeString("sv-SE", { timeStyle: "short" })})
				</span>
			</div>
		</div>
	);
}
