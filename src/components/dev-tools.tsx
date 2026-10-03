import { TanStackDevtools } from "@tanstack/react-devtools";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import TanStackQueryDevtools from "../integrations/tanstack-query/devtools";

// Split into its own module so it can be lazy-loaded only in dev (see
// __root.tsx) — these panels subscribe to router/query state and re-render
// on every background poll, which isn't a cost worth paying in production,
// especially on a Pi.
export default function DevTools() {
	return (
		<TanStackDevtools
			config={{
				position: "bottom-right",
			}}
			plugins={[
				{
					name: "Tanstack Router",
					render: <TanStackRouterDevtoolsPanel />,
				},
				TanStackQueryDevtools,
			]}
		/>
	);
}
