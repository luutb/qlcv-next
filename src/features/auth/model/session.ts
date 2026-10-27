const ACCESS_TOKEN_KEY = "qlcv.access-token";
export const SESSION_CHANGE_EVENT = "qlcv:session-change";

export function subscribeToSession(listener: () => void): () => void {
  window.addEventListener(SESSION_CHANGE_EVENT, listener);
  window.addEventListener("storage", listener);
  return () => {
    window.removeEventListener(SESSION_CHANGE_EVENT, listener);
    window.removeEventListener("storage", listener);
  };
}

export function getTokenExpiresAt(token: string): number | null {
  try {
    const payload = token.split(".")[1];
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const decoded = JSON.parse(atob(normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=")));
    return typeof decoded.exp === "number" && Number.isFinite(decoded.exp) ? decoded.exp * 1000 : null;
  } catch { return null; }
}

export function safeReturnPath(value: string | null): string {
  if (!value || !value.startsWith("/") || value.startsWith("//") || /[\\\x00-\x20]/.test(value)) return "/";
  try {
    const target = new URL(value, "https://workspace.local");
    if (target.origin !== "https://workspace.local" || target.pathname === "/login") return "/";
    return `${target.pathname}${target.search}${target.hash}`;
  } catch { return "/"; }
}

export function saveAccessToken(accessToken: string): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  window.dispatchEvent(new Event(SESSION_CHANGE_EVENT));
}

export function getStoredAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getAccessToken(): string | null {
  const token = getStoredAccessToken();
  if (token && (getTokenExpiresAt(token) ?? Infinity) <= Date.now()) return null;
  return token;
}

export function clearSession(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(ACCESS_TOKEN_KEY);
  window.dispatchEvent(new Event(SESSION_CHANGE_EVENT));
}
