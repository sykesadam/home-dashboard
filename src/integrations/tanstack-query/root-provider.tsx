import { QueryClient } from "@tanstack/react-query";

export function getContext() {
	const queryClient = new QueryClient({
		defaultOptions: {
			queries: {
				// While the bouncing clock is up, the dashboard is unmounted and
				// every query is inactive. With the 5 min default, anything idle
				// longer than that is evicted, so tapping back in shows every
				// widget's loading state again. Keep old data around so it's shown
				// instantly while the refetch happens in the background.
				gcTime: 24 * 60 * 60 * 1000,
			},
		},
	});

	return {
		queryClient,
	};
}
export default function TanstackQueryProvider() {}
