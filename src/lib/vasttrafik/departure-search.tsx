import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { ArrowLeft, Clock, MapPin, X } from "lucide-react";
import { useEffect, useState } from "react";
import { OnScreenKeyboard } from "#/components/on-screen-keyboard";
import { Button } from "#/components/ui/button";
import { Input } from "#/components/ui/input";
import { DepartureRow } from "./departure-row";
import { departuresTowardsQuery, searchStopAreasQuery } from "./query";
import { type RecentStop, useRecentStops } from "./recent-stops";

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
	const [destination, setDestination] = useState<RecentStop | null>(null);
	const { recent, add, remove } = useRecentStops();

	const select = (stop: RecentStop) => {
		add(stop);
		setDestination(stop);
	};

	return destination ? (
		<DeparturesTowards
			destination={destination}
			onBack={() => setDestination(null)}
		/>
	) : (
		<StopAreaSearch recent={recent} onRemoveRecent={remove} onSelect={select} />
	);
}

function StopAreaSearch({
	recent,
	onRemoveRecent,
	onSelect,
}: {
	recent: RecentStop[];
	onRemoveRecent: (gid: string) => void;
	onSelect: (stop: RecentStop) => void;
}) {
	const [text, setText] = useState("");
	const q = useDebouncedValue(text.trim(), 300);
	const { data, isFetching, isError } = useQuery({
		...searchStopAreasQuery(q),
		placeholderData: keepPreviousData,
	});

	return (
		<div className="flex flex-col gap-3">
			<div className="relative">
				<Input
					autoFocus
					// On-screen keyboard below replaces the device keyboard
					inputMode="none"
					placeholder="Vart vill du åka?"
					value={text}
					onChange={(e) => setText(e.target.value)}
					className="h-10 text-base pr-10"
				/>
				{text && (
					<Button
						type="button"
						variant="ghost"
						size="icon"
						aria-label="Rensa"
						onClick={() => setText("")}
						className="absolute right-1.5 top-1/2 -translate-y-1/2"
					>
						<X className="size-4" />
					</Button>
				)}
			</div>
			<div className="flex flex-col h-56 overflow-y-auto">
				{q.length < 2 ? (
					<RecentStops
						recent={recent}
						onSelect={onSelect}
						onRemove={onRemoveRecent}
					/>
				) : isError ? (
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
			<OnScreenKeyboard
				onInput={(char) => setText((t) => t + char)}
				onBackspace={() => setText((t) => t.slice(0, -1))}
			/>
		</div>
	);
}

function RecentStops({
	recent,
	onSelect,
	onRemove,
}: {
	recent: RecentStop[];
	onSelect: (stop: RecentStop) => void;
	onRemove: (gid: string) => void;
}) {
	if (recent.length === 0) {
		return (
			<p className="text-sm text-muted-foreground py-2">
				Sök efter en hållplats för att se avgångar dit.
			</p>
		);
	}

	return (
		<>
			<h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground pb-1">
				Senaste sökningar
			</h3>
			{recent.map((stop) => (
				<div
					key={stop.gid}
					className="flex items-center border-b border-muted hover:bg-muted/50 rounded-xs"
				>
					<button
						type="button"
						onClick={() => onSelect(stop)}
						className="flex grow items-center gap-2 py-2 px-1 text-left text-base"
					>
						<Clock className="size-4 shrink-0 text-muted-foreground" />
						{stop.name}
					</button>
					<Button
						type="button"
						variant="ghost"
						size="icon"
						aria-label={`Ta bort ${stop.name}`}
						onClick={() => onRemove(stop.gid)}
					>
						<X className="size-4 text-muted-foreground" />
					</Button>
				</div>
			))}
		</>
	);
}

function DeparturesTowards({
	destination,
	onBack,
}: {
	destination: RecentStop;
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
