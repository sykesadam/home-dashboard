import {
	createRouter as createTanStackRouter,
	type ErrorComponentProps,
	Link,
	useRouter,
} from "@tanstack/react-router";
import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query";
import { Loader2 } from "lucide-react";
import { ErrorMessage } from "./components/error-boundary";
import { buttonVariants } from "./components/ui/button";
import { getContext } from "./integrations/tanstack-query/root-provider";
import { routeTree } from "./routeTree.gen";

function PendingComponent() {
	return (
		<div className="flex w-full justify-center h-full items-center">
			<Loader2 className="animate-spin" />
		</div>
	);
}

// Last resort for errors outside a WidgetBoundary (loaders, route components)
function ErrorComponent({ error, reset }: ErrorComponentProps) {
	const router = useRouter();

	return (
		<ErrorMessage
			className="h-full p-4"
			error={error instanceof Error ? error : new Error(String(error))}
			reset={() => {
				reset();
				router.invalidate();
			}}
		/>
	);
}

function NotFoundComponent() {
	return (
		<div className="flex flex-col gap-2 w-full h-full justify-center items-center">
			<p className="text-muted-foreground">Sidan hittades inte</p>
			<Link to="/" className={buttonVariants({ variant: "outline" })}>
				Tillbaka
			</Link>
		</div>
	);
}

export function getRouter() {
	const context = getContext();

	const router = createTanStackRouter({
		routeTree,
		context,
		scrollRestoration: true,
		defaultPreload: "viewport",
		defaultPreloadStaleTime: 0,
		defaultPendingMs: 150,
		defaultPendingComponent: PendingComponent,
		defaultErrorComponent: ErrorComponent,
		defaultNotFoundComponent: NotFoundComponent,
	});

	setupRouterSsrQueryIntegration({ router, queryClient: context.queryClient });

	return router;
}

declare module "@tanstack/react-router" {
	interface Register {
		router: ReturnType<typeof getRouter>;
	}
}
