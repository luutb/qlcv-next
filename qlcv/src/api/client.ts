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

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
const TOKEN_STORAGE_KEY = "access_token";

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
  const method = options.method ?? "GET";
  const url = buildUrl(path, options.query);
  const headers = new Headers(options.headers);
  const token = getAccessToken();

  headers.set("Accept", "application/json");

  const isFormData = typeof FormData !== "undefined" && options.body instanceof FormData;
  const isBodyInit = isFormData || isBodyInitValue(options.body);

  if (options.body !== undefined && !isFormData && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  if (method !== "GET" && !headers.has("Idempotency-Key")) {
    headers.set("Idempotency-Key", options.idempotencyKey ?? createIdempotencyKey());
  }

  const response = await fetch(url, {
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

  const payload = await parseResponse(response, options.responseType);

  if (response.status === 401) {
    clearAccessToken();
    if (typeof window !== "undefined") {
      window.location.assign("/login");
    }
  }

  if (!response.ok) {
    throw new ApiError(getErrorMessage(payload, response.status), response.status, payload);
  }

  return payload as TResponse;
}

function buildUrl(path: string, query?: QueryParams): string {
  const normalizedBaseUrl = API_BASE_URL.replace(/\/$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
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

  const contentType = response.headers.get("content-type");
  if (!contentType?.includes("application/json")) {
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
  if (payload && typeof payload === "object" && "detail" in payload) {
    return String((payload as { detail: unknown }).detail);
  }

  if (payload && typeof payload === "object" && "message" in payload) {
    return String((payload as { message: unknown }).message);
  }

  return `Request failed with status ${status}`;
}
