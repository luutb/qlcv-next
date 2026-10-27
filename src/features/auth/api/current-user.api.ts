import { ApiProblem, parseApiResponse } from "@/services/http";
import { authEndpoints } from "@/services/endpoints";
import { authorizedRequest } from "@/features/auth/api/authorized-request";
import { CurrentUser, isCurrentUser } from "@/features/auth/model/current-user";

type CurrentUserEnvelope = { data: unknown };

/** Fetches the sole canonical product identity endpoint: GET /users/me. */
export async function getCurrentUser(signal?: AbortSignal): Promise<CurrentUser> {
  const response = await authorizedRequest({ path: authEndpoints.currentUser, method: "GET", signal });
  const payload = await parseApiResponse<CurrentUserEnvelope>(response);

  if (!isCurrentUser(payload.data)) {
    throw new ApiProblem({
      title: "Phản hồi hồ sơ không hợp lệ",
      detail: "Máy chủ không trả về current user theo contract đã chốt.",
      status: response.status,
      code: "CURRENT_USER_RESPONSE_INVALID",
    });
  }

  return payload.data;
}
