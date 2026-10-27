const defaultApiBaseUrl = "http://localhost:8080/api/v1";

function normalizeBaseUrl(value: string | undefined): string {
  const normalized = value?.trim().replace(/\/$/, "");
  return normalized || defaultApiBaseUrl;
}

export const environment = {
  apiBaseUrl: normalizeBaseUrl(process.env.NEXT_PUBLIC_API_BASE_URL),
  appName: process.env.NEXT_PUBLIC_APP_NAME?.trim() || "QLCV Next",
  isProduction: process.env.NODE_ENV === "production",
} as const;

/** Public runtime config only. Never put secrets in NEXT_PUBLIC_* variables. */
export type PublicEnvironment = typeof environment;
