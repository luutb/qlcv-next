import { ApiProblem, apiUrl } from "@/services/http";
import { clearSession, getAccessToken } from "@/features/auth/model/session";

export type AuthorizedRequestOptions = RequestInit & {
  /** A relative API path such as `/users/me`, never an arbitrary URL. */
  path: `/${string}`;
};

/**
 * Browser-only API transport for endpoints authenticated by the stored access
 * token. It deliberately does not decide authorization: 403 is returned to
 * the caller and must be rendered as a forbidden state.
 */
export async function authorizedRequest({ path, ...init }: AuthorizedRequestOptions): Promise<Response> {
  const accessToken = getAccessToken();
  if (!accessToken) {
    throw new ApiProblem({
      title: "Phiên đăng nhập đã hết hạn",
      detail: "Vui lòng đăng nhập lại để tiếp tục.",
      status: 401,
      code: "UNAUTHORIZED",
    });
  }

  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${accessToken}`);

  const response = await fetch(apiUrl(path), { ...init, headers });
  if (response.status === 401) clearSession();

  return response;
}
