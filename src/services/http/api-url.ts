import { environment } from "@/config/environment";

export function apiUrl(path: `/${string}`): string {
  return `${environment.apiBaseUrl}${path}`;
}
