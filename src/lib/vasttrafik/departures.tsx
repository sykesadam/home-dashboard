import { useSuspenseQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { Panel, PanelTitle } from "#/components/panel";
import { Button } from "#/components/ui/button";
import {
	Card,
	CardAction,
	CardContent,
	CardHeader,
	CardTitle,
} from "#/components/ui/card";
import { ScrollArea } from "#/components/ui/scroll-area";
import { cn } from "../utils";
import { departuresQuery } from "./query";

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

export function Departures({ className }: { className?: string }) {
	const { data } = useSuspenseQuery(departuresQuery);
	const results = data.results;

	return (
		<Card className={className} size="sm">
			<CardHeader>
				<CardTitle>Avgångar - Olskrokstorget</CardTitle>
				<CardAction>
					<Button type="button" variant="ghost" size="icon">
						<Search className="size-4" />
					</Button>
				</CardAction>
			</CardHeader>

			<CardContent className="min-h-0">
				<div className="scroll-fade h-full overflow-y-auto">
					{results.map((item) => (
						<div
							key={item.serviceJourney.gid}
							className="departure text-base flex items-center gap-2 py-2 border-b border-muted"
						>
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
								<span
									className={cn(
										getEtaClass(
											item.isCancelled,
											item.estimatedTime ?? item.plannedTime,
										),
									)}
								>
									{getEtaLabel(
										item.isCancelled,
										item.estimatedTime ?? item.plannedTime,
									)}
								</span>
								<span className="text-muted-foreground text-sm">
									{" "}
									(
									{new Date(
										item.estimatedTime ?? item.plannedTime,
									).toLocaleTimeString("sv-SE", { timeStyle: "short" })}
									)
								</span>
							</div>
						</div>
					))}
				</div>
			</CardContent>
		</Card>
	);
}
