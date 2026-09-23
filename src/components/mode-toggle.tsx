import { Monitor, Moon, Sun } from "lucide-react";
import { type Theme, useTheme } from "@/components/theme-provider";

import { ToggleGroup, ToggleGroupItem } from "./ui/toggle-group";

export function ModeToggle() {
	const { theme, setTheme } = useTheme();

	return (
		<ToggleGroup
			variant="outline"
			value={[theme]}
			onValueChange={(value) => {
				// Clicking the active item emits "", so ignore it to keep one always selected
				if (value) setTheme(value[0] as Theme);
			}}
			aria-label="Theme"
		>
			<ToggleGroupItem value="light" aria-label="Light theme">
				<Sun className="h-4 w-4" />
			</ToggleGroupItem>
			<ToggleGroupItem value="dark" aria-label="Dark theme">
				<Moon className="h-4 w-4" />
			</ToggleGroupItem>
			<ToggleGroupItem value="system" aria-label="System theme">
				<Monitor className="h-4 w-4" />
			</ToggleGroupItem>
		</ToggleGroup>
	);
}
