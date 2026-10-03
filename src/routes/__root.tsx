import { TanStackDevtools } from "@tanstack/react-devtools";
import type { QueryClient } from "@tanstack/react-query";
import {
	createRootRouteWithContext,
	HeadContent,
	Scripts,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { BouncingClock } from "#/components/bouncing-clock";
import { ThemeProvider } from "#/components/theme-provider";
import TanStackQueryDevtools from "../integrations/tanstack-query/devtools";
import { useBouncingClockSetting } from "../lib/bouncing-clock-setting";
import { useIdleQueryPause } from "../lib/idle-query-pause";
import { useKeepAwakeSetting, useScreenWakeLock } from "../lib/keep-awake";
import { useIdle } from "../lib/use-idle";
import appCss from "../styles.css?url";

interface MyRouterContext {
	queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
	head: () => ({
		meta: [
			{
				charSet: "utf-8",
			},
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1",
			},
			{
				title: "Hemma",
			},
		],
		links: [
			{
				rel: "stylesheet",
				href: appCss,
			},
		],
	}),
	shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
	const [keepAwake] = useKeepAwakeSetting();
	const [bouncingClockEnabled] = useBouncingClockSetting();
	const idle = useIdle();

	// Keep-awake wins outright: screen stays on and the dashboard stays
	// visible, clock or no. Otherwise, if the bouncing-clock setting is on,
	// hold the wake lock too so the screen doesn't blank before the clock
	// gets a chance to show — it only actually appears once idle.
	useScreenWakeLock(keepAwake || bouncingClockEnabled);
	const showClock = !keepAwake && bouncingClockEnabled && idle;

	// Queries go quiet once idle, same as the screen would on its own —
	// unless keep-awake is on, in which case the dashboard (and its data)
	// should always stay live.
	useIdleQueryPause(idle && !keepAwake);

	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				<HeadContent />
			</head>
			<body className="font-sans antialiased h-screen selection:bg-[rgba(79,184,178,0.24)]">
				<ThemeProvider defaultTheme="system" storageKey="theme">
					{showClock ? <BouncingClock /> : children}
				</ThemeProvider>

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
				<Scripts />
			</body>
		</html>
	);
}
