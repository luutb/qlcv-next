export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export type QueryParamValue =
  | string
  | number
  | boolean
  | readonly string[]
  | readonly number[]
  | null
  | undefined;

export type QueryParams = Record<string, QueryParamValue>;

export type ApiRequestOptions<TBody = unknown> = {
  method?: HttpMethod;
  body?: TBody;
  query?: QueryParams;
  headers?: HeadersInit;
  idempotencyKey?: string;
  signal?: AbortSignal;
  responseType?: "json" | "blob" | "text";
};

export type DownloadResult = {
  blob: Blob;
  filename?: string;
};

export class ApiError extends Error {
  status: number;
  payload: unknown;

  constructor(message: string, status: number, payload: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
  }
}

export class SessionExpiredError extends ApiError {
  constructor(message: string, payload: unknown) {
    super(message, 401, payload);
    this.name = "SessionExpiredError";
  }
}

export class ForbiddenError extends ApiError {
  constructor(message: string, payload: unknown) {
    super(message, 403, payload);
    this.name = "ForbiddenError";
  }
}

export class LockedError extends ApiError {
  constructor(message: string, payload: unknown) {
    super(message, 423, payload);
    this.name = "LockedError";
  }
}

export class VersionConflictError extends ApiError {
  constructor(message: string, payload: unknown) {
    super(message, 428, payload);
    this.name = "VersionConflictError";
  }
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
const API_VERSION_PREFIX = "/api/v1";
const TOKEN_STORAGE_KEY = "access_token";
const USER_STORAGE_KEY = "auth_user";

export function getAccessToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem(TOKEN_STORAGE_KEY);
}

export function setAccessToken(token: string): void {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(TOKEN_STORAGE_KEY, token);
  }
}

export function clearAccessToken(): void {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(TOKEN_STORAGE_KEY);
  }
}

export function createIdempotencyKey(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export async function apiRequest<TResponse, TBody = unknown>(
  path: string,
  options: ApiRequestOptions<TBody> = {},
): Promise<TResponse> {
  const response = await performRequest(path, options);

  const payload = await parseResponse(response, options.responseType);

  if (!response.ok) {
    if (response.status === 401 && !isAuthLoginPath(path)) {
      expireBrowserSession();
    }

    throw createApiError(response.status, payload);
  }

  return payload as TResponse;
}

export async function downloadRequest<TBody = unknown>(
  path: string,
  options: ApiRequestOptions<TBody> = {},
): Promise<DownloadResult> {
  const response = await performRequest(path, options);

  if (!response.ok) {
    const payload = await parseResponse(response, "json");
    if (response.status === 401 && !isAuthLoginPath(path)) {
      expireBrowserSession();
    }

    throw createApiError(response.status, payload);
  }

  return {
    blob: await response.blob(),
    filename: parseContentDispositionFilename(response.headers.get("content-disposition")),
  };
}

async function performRequest<TBody = unknown>(
  path: string,
  options: ApiRequestOptions<TBody> = {},
): Promise<Response> {
  const method = options.method ?? "GET";
  const url = buildUrl(path, options.query);
  const headers = new Headers(options.headers);
  const token = getAccessToken();

  headers.set("Accept", "application/json");

  const isFormData = typeof FormData !== "undefined" && options.body instanceof FormData;
  const isSearchParams =
    typeof URLSearchParams !== "undefined" && options.body instanceof URLSearchParams;
  const isBodyInit = isFormData || isSearchParams || isBodyInitValue(options.body);

  if (options.body !== undefined && !headers.has("Content-Type")) {
    if (isFormData) {
      // Browser will set multipart boundary automatically.
    } else if (isSearchParams) {
      headers.set("Content-Type", "application/x-www-form-urlencoded");
    } else {
      headers.set("Content-Type", "application/json");
    }
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  if (method !== "GET" && !headers.has("Idempotency-Key")) {
    headers.set("Idempotency-Key", options.idempotencyKey ?? createIdempotencyKey());
  }

  try {
    return await fetch(url, {
      method,
      headers,
      body:
        options.body === undefined
          ? undefined
          : isBodyInit
            ? (options.body as BodyInit)
            : JSON.stringify(options.body),
      signal: options.signal,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw error;
    }

    throw new ApiError("Không kết nối được backend tại localhost:8080", 0, {
      message: "Không kết nối được backend tại localhost:8080",
      code: "NETWORK_ERROR",
    });
  }
}

function buildUrl(path: string, query?: QueryParams): string {
  const normalizedBaseUrl = API_BASE_URL.replace(/\/$/, "");
  const normalizedPath = normalizePathForBase(path, normalizedBaseUrl);
  const url = new URL(`${normalizedBaseUrl}${normalizedPath}`, windowOrigin());

  Object.entries(query ?? {}).forEach(([key, value]) => {
    if (value === null || value === undefined || value === "") {
      return;
    }

    if (Array.isArray(value)) {
      value.forEach((item) => url.searchParams.append(key, String(item)));
      return;
    }

    url.searchParams.set(key, String(value));
  });

  return url.toString();
}

function normalizePathForBase(path: string, baseUrl: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  if (!baseUrl.endsWith(API_VERSION_PREFIX)) {
    return normalizedPath;
  }

  if (normalizedPath === API_VERSION_PREFIX) {
    return "";
  }

  if (normalizedPath.startsWith(`${API_VERSION_PREFIX}/`)) {
    return normalizedPath.slice(API_VERSION_PREFIX.length);
  }

  return normalizedPath;
}

function windowOrigin(): string {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  return "http://localhost";
}

async function parseResponse(
  response: Response,
  responseType: ApiRequestOptions["responseType"] = "json",
): Promise<unknown> {
  if (response.status === 204) {
    return null;
  }

  if (responseType === "blob") {
    return response.blob();
  }

  if (responseType === "text") {
    return response.text();
  }

  const contentType = response.headers.get("content-type")?.toLowerCase() ?? "";
  if (!contentType.includes("application/json") && !contentType.includes("+json")) {
    return response.text();
  }

  return response.json();
}

function isBodyInitValue(body: unknown): body is BodyInit {
  if (!body) {
    return false;
  }

  return (
    (typeof Blob !== "undefined" && body instanceof Blob) ||
    (typeof ArrayBuffer !== "undefined" && body instanceof ArrayBuffer) ||
    (typeof URLSearchParams !== "undefined" && body instanceof URLSearchParams) ||
    (typeof ReadableStream !== "undefined" && body instanceof ReadableStream)
  );
}

function getErrorMessage(payload: unknown, status: number): string {
  if (typeof payload === "string" && payload.trim()) {
    return payload;
  }

  if (payload && typeof payload === "object" && "detail" in payload) {
    return String((payload as { detail: unknown }).detail);
  }

  if (payload && typeof payload === "object" && "message" in payload) {
    return String((payload as { message: unknown }).message);
  }

  return `Request failed with status ${status}`;
}

function isAuthLoginPath(path: string): boolean {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return normalizedPath === "/auth/login" || normalizedPath === "/api/v1/auth/login";
}

function createApiError(status: number, payload: unknown): ApiError {
  const message = getErrorMessage(payload, status);

  switch (status) {
    case 401:
      return new SessionExpiredError(message, payload);
    case 403:
      return new ForbiddenError(message, payload);
    case 423:
      return new LockedError(message, payload);
    case 428:
      return new VersionConflictError(message, payload);
    default:
      return new ApiError(message, status, payload);
  }
}

function expireBrowserSession(): void {
  clearAccessToken();

  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(USER_STORAGE_KEY);
  if (window.location.pathname === "/login") {
    return;
  }

  const returnUrl = `${window.location.pathname}${window.location.search}${window.location.hash}`;
  const loginUrl = new URL("/login", window.location.origin);
  loginUrl.searchParams.set("expired", "1");
  loginUrl.searchParams.set("returnUrl", returnUrl);
  window.location.assign(`${loginUrl.pathname}${loginUrl.search}`);
}

function parseContentDispositionFilename(value: string | null): string | undefined {
  if (!value) {
    return undefined;
  }

  const utf8Match = value.match(/filename\*=UTF-8''([^;]+)/i);
  if (utf8Match?.[1]) {
    return decodeURIComponent(utf8Match[1]);
  }

  const asciiMatch = value.match(/filename="?([^";]+)"?/i);
  return asciiMatch?.[1];
}
