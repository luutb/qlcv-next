import { apiRequest, clearAccessToken, setAccessToken } from "./client";

const USER_STORAGE_KEY = "auth_user";

export type LoginRequest = {
  username: string;
  password: string;
  totp_code?: string;
};

export type LoginResponse = {
  access_token?: string;
  token?: string;
  user?: AuthUser;
};

export type AuthUser = {
  id: string;
  organization_id?: string;
  username: string;
  email: string;
  role?: string;
  is_active?: boolean;
  mfa_enabled?: boolean;
  version?: number;
  tenant_plan?: string;
  enabled_feature_flags?: string[];
};

export type EnableMfaResponse = {
  secret?: string;
  otpauth_url?: string;
  qr_code_uri?: string;
  qr_code?: string;
  message?: string;
  [key: string]: unknown;
};

export type DisableMfaRequest = {
  totp_code: string;
};

export async function login(payload: LoginRequest): Promise<LoginResponse> {
  const response = await apiRequest<LoginResponse, LoginRequest>("/auth/login", {
    method: "POST",
    body: payload,
  });
  const token = response.access_token ?? response.token;

  if (token) {
    setAccessToken(token);
  }

  if (response.user) {
    setStoredUser(response.user);
  }

  return response;
}

export function getAuthMe(signal?: AbortSignal) {
  return apiRequest<AuthUser>("/auth/me", { signal });
}

export function enableMfa() {
  return apiRequest<EnableMfaResponse>("/auth/mfa/enable", {
    method: "POST",
  });
}

export function disableMfa(payload: DisableMfaRequest) {
  return apiRequest<AuthUser, DisableMfaRequest>("/auth/mfa/disable", {
    method: "POST",
    body: payload,
  });
}

export function logout(): void {
  clearAccessToken();
  clearStoredUser();
  if (typeof window !== "undefined") {
    window.location.assign("/login");
  }
}

function setStoredUser(user: AuthUser): void {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  }
}

function clearStoredUser(): void {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(USER_STORAGE_KEY);
  }
}
