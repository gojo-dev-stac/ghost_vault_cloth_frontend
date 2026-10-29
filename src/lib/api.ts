/**
 * api.ts — the browser client for the Django REST API.
 * Stores the JWT pair, attaches `Authorization: Bearer …`, refreshes the
 * access token once on a 401, and turns DRF error bodies into readable messages.
 */

export const API_URL = (import.meta.env["VITE_API_URL"] ?? "http://localhost:8000/api").replace(
  /\/+$/,
  "",
);

const ACCESS_KEY = "ghost.access";
const REFRESH_KEY = "ghost.refresh";

export type Tokens = { access: string; refresh: string };

/** Thrown for any non-2xx response; `message` is ready to show in a toast. */
export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly data: unknown = null,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// --- token storage -----------------------------------------------------------

const storage = () => (typeof window === "undefined" ? null : window.localStorage);

function read(key: string): string | null {
  try {
    return storage()?.getItem(key) ?? null;
  } catch {
    return null;
  }
}

export const getAccessToken = () => read(ACCESS_KEY);
export const getRefreshToken = () => read(REFRESH_KEY);
export const hasSession = () => !!getRefreshToken();

/** Fired on window when the server says this account was rejected (session already cleared). */
export const ACCOUNT_REJECTED_EVENT = "ghost:account-rejected";

/** True when an API error means "this account was rejected". */
export const isRejectedError = (err: unknown) =>
  err instanceof ApiError && (err.data as { code?: unknown } | null)?.code === "account_rejected";

let rejectedNotice = false;

/** Whether the last session ended because the account was rejected (read by the login screen). */
export const wasAccountRejected = () => rejectedNotice;
export const clearAccountRejected = () => {
  rejectedNotice = false;
};

function accountRejected() {
  rejectedNotice = true;
  setTokens(null);
  if (typeof window !== "undefined") window.dispatchEvent(new Event(ACCOUNT_REJECTED_EVENT));
}

/** Fired on window when the signed-in session expired (the refresh token was refused). */
export const SESSION_EXPIRED_EVENT = "ghost:session-expired";

let expiredNotice = false;

/** Whether the last session ended because it expired (read by the login screen). */
export const wasSessionExpired = () => expiredNotice;
export const clearSessionExpired = () => {
  expiredNotice = false;
};

function sessionExpired() {
  expiredNotice = true;
  setTokens(null);
  if (typeof window !== "undefined") window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
}

const listeners = new Set<(signedIn: boolean) => void>();

/** Subscribe to sign-in / sign-out; returns an unsubscribe function. */
export function onAuthChange(cb: (signedIn: boolean) => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

export function setTokens(tokens: Tokens | null) {
  const s = storage();
  if (!s) return;
  const wasSignedIn = hasSession();
  try {
    if (tokens) {
      s.setItem(ACCESS_KEY, tokens.access);
      s.setItem(REFRESH_KEY, tokens.refresh);
    } else {
      s.removeItem(ACCESS_KEY);
      s.removeItem(REFRESH_KEY);
    }
  } catch {
    /* storage unavailable (private mode); the session just won't persist */
  }
  // Notify only on sign-in / sign-out, not on routine token refreshes.
  if (wasSignedIn !== !!tokens) listeners.forEach((cb) => cb(!!tokens));
}

// --- errors ------------------------------------------------------------------

/** Flatten a DRF error body ({detail}, {field: [msg]}, [msg]) into one sentence. */
function errorMessage(data: unknown, status: number): string {
  const collect = (v: unknown): string[] => {
    if (typeof v === "string") return [v];
    if (Array.isArray(v)) return v.flatMap(collect);
    if (v && typeof v === "object") {
      const o = v as Record<string, unknown>;
      if ("detail" in o) return collect(o["detail"]);
      return Object.values(o).flatMap(collect);
    }
    return [];
  };
  const messages = collect(data);
  if (messages.length) return messages.join(" ");
  if (status === 429) return "Too many attempts. Please wait a minute and try again.";
  if (status >= 500) return "The server had a problem. Please try again.";
  return "Something went wrong";
}

// --- requests ----------------------------------------------------------------

let refreshing: Promise<boolean> | null = null;

/** Swap the refresh token for a new pair; concurrent callers share one request. */
function refreshTokens(): Promise<boolean> {
  const refresh = getRefreshToken();
  if (!refresh) return Promise.resolve(false);
  refreshing ??= fetch(`${API_URL}/auth/token/refresh/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh }),
  })
    .then(async (res) => {
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { code?: unknown } | null;
        if (body?.code === "account_rejected") accountRejected();
        else sessionExpired();
        return false;
      }
      const data = (await res.json()) as Tokens;
      setTokens({ access: data.access, refresh: data.refresh ?? refresh });
      return true;
    })
    .catch(() => false)
    .finally(() => {
      refreshing = null;
    });
  return refreshing;
}

type Options = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  /** Send the access token (default true when signed in). */
  auth?: boolean;
};

/** Call the API: `api<Product[]>("/products/")`, `api("/orders/", { method: "POST", body })`. */
export async function api<T = unknown>(path: string, opts: Options = {}): Promise<T> {
  const { method = "GET", body, auth = true } = opts;

  const send = () => {
    const headers: Record<string, string> = { Accept: "application/json" };
    if (body !== undefined) headers["Content-Type"] = "application/json";
    const token = auth ? getAccessToken() : null;
    if (token) headers["Authorization"] = `Bearer ${token}`;
    return fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body === undefined ? null : JSON.stringify(body),
    });
  };

  let res: Response;
  try {
    const sentToken = auth && !!getAccessToken();
    res = await send();
    const rejected =
      res.status === 401 &&
      (
        (await res
          .clone()
          .json()
          .catch(() => null)) as { code?: unknown } | null
      )?.code === "account_rejected";
    if (rejected && sentToken) {
      accountRejected(); // the account was rejected: end the session, don't try to refresh
    } else if (res.status === 401 && sentToken) {
      // Expired access token: refresh and retry. If the refresh fails the session
      // is cleared, and the retry goes out anonymously (public pages keep working).
      await refreshTokens();
      res = await send();
    }
  } catch {
    throw new ApiError("Can't reach the GHOST server. Check your connection and try again.", 0);
  }

  if (res.status === 204 || res.status === 205) return undefined as T;
  const data: unknown = await res.json().catch(() => null);
  if (!res.ok) throw new ApiError(errorMessage(data, res.status), res.status, data);
  return data as T;
}
