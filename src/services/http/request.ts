import { apiUrl } from "./api-url";

export type JsonRequestOptions = RequestInit & { path: `/${string}` };

export function jsonHeaders(headers?: HeadersInit): Headers {
  const result = new Headers(headers);
  result.set("Accept", "application/json");
  return result;
}

export async function requestJson({ path, headers, ...init }: JsonRequestOptions): Promise<Response> {
  return fetch(apiUrl(path), { ...init, headers: jsonHeaders(headers) });
}
