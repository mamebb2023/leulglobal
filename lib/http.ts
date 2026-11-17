import "server-only";

function hostOf(url: string): string {
  try {
    return new URL(url).host;
  } catch {
    return "provider";
  }
}

export class HttpError extends Error {
  constructor(
    public readonly status: number,
    url: string,
  ) {
    // Never include query strings: they can carry API keys.
    super(`HTTP ${status} from ${hostOf(url)}`);
    this.name = "HttpError";
  }
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function fetchJson<T = unknown>(
  url: string,
  init: RequestInit = {},
  opts: { retries?: number; timeoutMs?: number } = {},
): Promise<T> {
  const { retries = 2, timeoutMs = 10_000 } = opts;
  let lastErr: unknown;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, {
        ...init,
        signal: AbortSignal.timeout(timeoutMs),
        cache: "no-store",
      });
      if (!res.ok) throw new HttpError(res.status, url);
      return (await res.json()) as T;
    } catch (e) {
      // Wrap network/abort errors so a URL carrying a key never surfaces in logs.
      const err =
        e instanceof HttpError
          ? e
          : new Error(`network error contacting ${hostOf(url)}`, { cause: e });
      lastErr = err;

      const retryable =
        !(err instanceof HttpError) || err.status === 429 || err.status >= 500;
      if (!retryable || attempt === retries) break;
      await sleep(500 * 2 ** attempt);
    }
  }

  throw lastErr instanceof Error ? lastErr : new Error("request failed");
}
