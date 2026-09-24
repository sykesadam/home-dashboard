import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { ArrowLeft, MapPin } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "#/components/ui/button";
import { Input } from "#/components/ui/input";
import { DepartureRow } from "./departure-row";
import { departuresTowardsQuery, searchStopAreasQuery } from "./query";
import type { Location } from "./types";

function useDebouncedValue<T>(value: T, delayMs: number) {
	const [debounced, setDebounced] = useState(value);
	useEffect(() => {
		const id = setTimeout(() => setDebounced(value), delayMs);
		return () => clearTimeout(id);
	}, [value, delayMs]);
	return debounced;
}

const Skeleton = () => (
	<div className="flex flex-col gap-2">
		{Array.from({ length: 5 }).map((_, i) => (
			// biome-ignore lint/suspicious/noArrayIndexKey: from array
			<div key={i} className="h-8 w-full rounded bg-muted animate-pulse" />
		))}
	</div>
);

export function DepartureSearch() {
	const [destination, setDestination] = useState<Location | null>(null);

	return destination ? (
		<DeparturesTowards
			destination={destination}
			onBack={() => setDestination(null)}
		/>
	) : (
		<StopAreaSearch onSelect={setDestination} />
	);
}

function StopAreaSearch({
	onSelect,
}: {
	onSelect: (location: Location) => void;
}) {
	const [text, setText] = useState("");
	const q = useDebouncedValue(text.trim(), 300);
	const { data, isFetching, isError } = useQuery({
		...searchStopAreasQuery(q),
		placeholderData: keepPreviousData,
	});

	return (
		<div className="flex flex-col gap-3">
			<Input
				autoFocus
				placeholder="Vart vill du åka?"
				value={text}
				onChange={(e) => setText(e.target.value)}
			/>
			<div className="flex flex-col max-h-96 overflow-y-auto">
				{q.length < 2 ? null : isError ? (
					<p className="text-sm text-destructive py-2">
						Kunde inte söka hållplatser.
					</p>
				) : !data && isFetching ? (
					<Skeleton />
				) : data?.results.length === 0 ? (
					<p className="text-sm text-muted-foreground py-2">
						Inga hållplatser hittades.
					</p>
				) : (
					data?.results.map((location) => (
						<button
							key={location.gid}
							type="button"
							onClick={() => onSelect(location)}
							className="flex items-center gap-2 py-2 px-1 text-left text-base border-b border-muted hover:bg-muted/50 rounded-xs"
						>
							<MapPin className="size-4 shrink-0 text-muted-foreground" />
							{location.name}
						</button>
					))
				)}
			</div>
		</div>
	);
}

function DeparturesTowards({
	destination,
	onBack,
}: {
	destination: Location;
	onBack: () => void;
}) {
	const { data, isPending, isError } = useQuery(
		departuresTowardsQuery(destination.gid),
	);

	return (
		<div className="flex flex-col gap-3">
			<div className="flex items-center gap-2">
				<Button type="button" variant="ghost" size="icon" onClick={onBack}>
					<ArrowLeft className="size-4" />
				</Button>
				<span className="text-base font-medium">Mot {destination.name}</span>
			</div>
			<div className="flex flex-col max-h-96 overflow-y-auto">
				{isPending ? (
					<Skeleton />
				) : isError ? (
					<p className="text-sm text-destructive py-2">
						Kunde inte hämta avgångar.
					</p>
				) : data.results.length === 0 ? (
					<p className="text-sm text-muted-foreground py-2">
						Inga avgångar mot {destination.name} just nu.
					</p>
				) : (
					data.results.map((item) => (
						<DepartureRow key={item.detailsReference} item={item} />
					))
				)}
			</div>
		</div>
	);
}
