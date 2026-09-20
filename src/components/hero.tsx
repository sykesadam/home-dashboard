import { useEffect, useState } from "react";

const findTime = () => {
	return new Date().toLocaleTimeString("sv-SE", {
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit",
	});
};

function Time() {
	const [time, setTime] = useState<string | null>(null);

	useEffect(() => {
		setTime(findTime()); // set real value immediately after mount
		const id = setInterval(() => setTime(findTime()), 1000);
		return () => clearInterval(id); // cleanup, no leaked intervals
	}, []);

	return (
		<time
			className="font-mono tabular-nums text-7xl font-medium"
			suppressHydrationWarning
		>
			{time ?? "--:--:--"}
		</time>
	);
}

const findDate = () => {
	return new Date().toLocaleDateString("sv-SE", {
		weekday: "long",
		day: "numeric",
		month: "long",
	});
};

function DateLine() {
	const [dateLine, setDateLine] = useState<string>(findDate());

	useEffect(() => {
		setDateLine(findDate());
		const id = setInterval(() => setDateLine(findDate()), 10_000);
		return () => clearInterval(id);
	}, []);

	return (
		<div className="text-right text-muted-foreground">
			<div className="capitalize text-lg" suppressHydrationWarning>
				{dateLine}
			</div>
			<div className="mt-1">Göteborg</div>
		</div>
	);
}

export function Hero() {
	return (
		<header className="flex items-end justify-between gap-6 flex-wrap p-4">
			<Time />
			<DateLine />
		</header>
	);
}
