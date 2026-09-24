import { Delete, Space } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "#/lib/utils";

const ROWS = [
	["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"],
	["q", "w", "e", "r", "t", "y", "u", "i", "o", "p", "å"],
	["a", "s", "d", "f", "g", "h", "j", "k", "l", "ö", "ä"],
	["z", "x", "c", "v", "b", "n", "m", "-", "."],
];

function Key({
	onPress,
	className,
	children,
	label,
}: {
	onPress: () => void;
	className?: string;
	children: ReactNode;
	label?: string;
}) {
	return (
		<button
			type="button"
			aria-label={label}
			// Keep focus (and the caret) in the input instead of on the key
			onPointerDown={(e) => e.preventDefault()}
			onClick={onPress}
			className={cn(
				"h-11 flex-1 min-w-0 rounded-md bg-muted text-base font-medium select-none flex items-center justify-center transition-colors active:bg-accent active:scale-95 touch-manipulation",
				className,
			)}
		>
			{children}
		</button>
	);
}

export function OnScreenKeyboard({
	onInput,
	onBackspace,
	className,
}: {
	onInput: (char: string) => void;
	onBackspace: () => void;
	className?: string;
}) {
	return (
		<div className={cn("flex flex-col gap-1.5", className)}>
			{ROWS.map((row, i) => (
				<div key={row[0]} className="flex gap-1.5">
					{row.map((char) => (
						<Key key={char} onPress={() => onInput(char)}>
							{char}
						</Key>
					))}
					{i === ROWS.length - 1 && (
						<Key onPress={onBackspace} label="Radera" className="flex-[2]">
							<Delete className="size-5" />
						</Key>
					)}
				</div>
			))}
			<div className="flex justify-center">
				<Key
					onPress={() => onInput(" ")}
					label="Mellanslag"
					className="flex-none w-1/2"
				>
					<Space className="size-5" />
				</Key>
			</div>
		</div>
	);
}
