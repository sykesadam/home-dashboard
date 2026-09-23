import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { ModeToggle } from "#/components/mode-toggle";
import { buttonVariants } from "#/components/ui/button";
import { Label } from "#/components/ui/label";

export const Route = createFileRoute("/settings")({
	component: RouteComponent,
});

function RouteComponent() {
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
		</div>
	);
}
