export { cn } from "cn";

type URLObj = { endpoint: string; searchParams: Record<string, string> };

function createUrl(urlObj: URLObj) {
	const url = new URL(urlObj.endpoint);
	Object.entries(urlObj.searchParams).forEach(([key, val]) => {
		url.searchParams.set(key, val);
	});
	return url;
}

export class RequestError extends Error {
	status?: number;
	url: string;

	constructor(
		message: string,
		opts: { status?: number; url: string; cause?: unknown },
	) {
		super(message, { cause: opts.cause });
		this.name = "RequestError";
		this.status = opts.status;
		this.url = opts.url;
	}
}

export async function request<T>(
	url: string | URLObj,
	opts: RequestInit,
): Promise<T> {
	const endpoint = typeof url === "string" ? url : createUrl(url);
	const urlStr = endpoint.toString();

	let response: Response;
	try {
		response = await fetch(endpoint, opts);
	} catch (error) {
		// fetch itself only throws on network-level failures (DNS, CORS, offline, etc.)
		throw new RequestError(`Network error while requesting ${urlStr}`, {
			url: urlStr,
			cause: error,
		});
	}

	if (!response.ok) {
		// try to grab a body for debugging, but don't let that throw mask the real error
		const body = await response.text().catch(() => undefined);
		throw new RequestError(
			`Request failed with status ${response.status}: ${urlStr}`,
			{
				status: response.status,
				url: urlStr,
				cause: body,
			},
		);
	}

	try {
		return (await response.json()) as T;
	} catch (error) {
		throw new RequestError(`Failed to parse JSON from ${urlStr}`, {
			url: urlStr,
			cause: error,
		});
	}
}
