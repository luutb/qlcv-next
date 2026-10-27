import { authEndpoints } from "@/services/endpoints";
import { ApiProblem, parseApiResponse } from "@/services/http";
import { requestJson } from "@/services/http/request";
import { clearSession, getStoredAccessToken } from "../model/session";

type LoginResponse = {
  access_token?: string;
  token?: string;
  data?: {
    access_token?: string;
    token?: string;
  };
};

export type LoginInput = {
  username: string;
  tenant_slug?: string;
  password: string;
  totp_code?: string;
};

export async function login(input: LoginInput): Promise<{ accessToken: string }> {
  const response = await requestJson({ path: authEndpoints.login, method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const payload = await parseApiResponse<LoginResponse>(response);
  const accessToken = payload.access_token ?? payload.token ?? payload.data?.access_token ?? payload.data?.token;

  if (!accessToken) {
    throw new ApiProblem({
      title: "Phản hồi đăng nhập không hợp lệ",
      detail: "Không tìm thấy access token trong phản hồi từ máy chủ.",
      status: response.status,
      code: "AUTH_RESPONSE_INVALID",
    });
  }

  return { accessToken };
}

/** Always clear browser state; report whether server revocation succeeded. */
export async function logout(): Promise<boolean> {
  const token = getStoredAccessToken();
  try {
    if (!token) return true;
    const response = await requestJson({
      path: authEndpoints.logout,
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(8000),
    });
    return response.ok || response.status === 401;
  } catch {
    return false;
  } finally {
    clearSession();
  }
}
