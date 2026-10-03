import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { ModeToggle } from "#/components/mode-toggle";
import { buttonVariants } from "#/components/ui/button";
import { Label } from "#/components/ui/label";
import { Switch } from "#/components/ui/switch";
import { useBouncingClockSetting } from "#/lib/bouncing-clock-setting";
import { useKeepAwakeSetting } from "#/lib/keep-awake";

export const Route = createFileRoute("/settings")({
	component: RouteComponent,
});

function RouteComponent() {
	const [keepAwake, setKeepAwake] = useKeepAwakeSetting();
	const [bouncingClock, setBouncingClock] = useBouncingClockSetting();

	return (
		<div className="flex flex-col gap-4 mx-auto py-12 px-10 max-w-lg">
			<div className="flex items-center -ml-8">
				<Link
					to="/"
					className={buttonVariants({ variant: "ghost", size: "icon-lg" })}
				>
					<ArrowLeft />
				</Link>

				<h1 className="font-medium text-2xl">Settings</h1>
			</div>

			<div className="flex flex-col gap-2">
				<Label>Change color mode</Label>
				<ModeToggle />
			</div>

			<div className="flex items-center justify-between gap-4">
				<div className="flex flex-col gap-0.5">
					<Label htmlFor="keep-awake">Keep screen awake</Label>
					<p className="text-sm text-muted-foreground">
						Prevents the touchscreen from sleeping. Off saves power and lets
						tap-to-wake work as usual.
					</p>
				</div>
				<Switch
					id="keep-awake"
					checked={keepAwake}
					onCheckedChange={setKeepAwake}
				/>
			</div>

			<div className="flex items-center justify-between gap-4">
				<div className="flex flex-col gap-0.5">
					<Label htmlFor="bouncing-clock">Bouncing clock when idle</Label>
					<p className="text-sm text-muted-foreground">
						When the screen would otherwise sleep, show a bouncing clock
						instead. Ignored while "Keep screen awake" is on.
					</p>
				</div>
				<Switch
					id="bouncing-clock"
					checked={bouncingClock}
					onCheckedChange={setBouncingClock}
				/>
			</div>
		</div>
	);
}
