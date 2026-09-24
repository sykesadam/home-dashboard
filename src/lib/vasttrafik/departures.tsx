import { useSuspenseQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { Button } from "#/components/ui/button";
import {
	Card,
	CardAction,
	CardContent,
	CardHeader,
	CardTitle,
} from "#/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "#/components/ui/dialog";
import { DepartureRow } from "./departure-row";
import { DepartureSearch } from "./departure-search";
import { departuresQuery } from "./query";

export function Departures({ className }: { className?: string }) {
	const { data } = useSuspenseQuery(departuresQuery);
	const results = data.results;

	return (
		<Card className={className} size="sm">
			<CardHeader>
				<CardTitle>Avgångar - Olskrokstorget</CardTitle>
				<Dialog>
					<DialogTrigger
						nativeButton={false}
						render={
							<CardAction>
								<Button type="button" variant="ghost" size="icon">
									<Search className="size-4" />
								</Button>
							</CardAction>
						}
					/>
					<DialogContent className="sm:max-w-lg">
						<DialogHeader>
							<DialogTitle>Sök avgångar från Olskrokstorget</DialogTitle>
						</DialogHeader>
						<DepartureSearch />
					</DialogContent>
				</Dialog>
			</CardHeader>

			<CardContent className="min-h-0">
				<div className="h-full overflow-y-auto">
					{results.map((item) => (
						<DepartureRow key={item.serviceJourney.gid} item={item} />
					))}
				</div>
			</CardContent>
		</Card>
	);
}
