import { v4 as uuidv4 } from "uuid";

export type ProblemDetails = { type?: string; title: string; status: number; detail?: string; code?: string; meta?: Record<string, unknown> };
export class ApiProblem extends Error { constructor(public readonly problem: ProblemDetails) { super(problem.detail ?? problem.title); this.name = "ApiProblem"; } }
export function getSafeApiErrorMessage(error: unknown, fallback: string): string {
  if (!(error instanceof ApiProblem)) return fallback;
  const { status, code } = error.problem;
  if (status === 401 || code === "INVALID_CREDENTIALS" || code === "UNAUTHORIZED") return "Phiên đăng nhập không hợp lệ hoặc đã hết hạn.";
  if (status === 403 || code === "FORBIDDEN" || code === "TENANT_VIOLATION") return "Bạn không có quyền thực hiện thao tác này.";
  if (status === 404 || code === "NOT_FOUND") return "Dữ liệu không tồn tại hoặc không còn truy cập được.";
  if (status === 409) return "Dữ liệu vừa thay đổi. Vui lòng tải lại và thử lại.";
  if (status === 423 || code === "BILLING_LOCK_ACTIVE" || code === "LOCKED") return "Dữ liệu đang bị khóa và chưa thể chỉnh sửa.";
  if (status === 428 || code === "VERSION_CONFLICT") return "Dữ liệu đã thay đổi. Vui lòng tải lại trước khi tiếp tục.";
  if (status >= 500) return "Máy chủ đang gặp sự cố. Vui lòng thử lại sau.";
  return fallback;
}
export function createIdempotencyKey(): string {
  return uuidv4();
}
export async function parseApiResponse<T>(response: Response): Promise<T> {
  if (response.ok) return response.json() as Promise<T>;
  if (response.status === 401 && typeof window !== "undefined") {
    window.dispatchEvent(new Event("qlcv:unauthorized"));
  }
  const fallback: ProblemDetails = { title: "Yêu cầu không thành công", status: response.status };
  const payload: unknown = await response.json().catch(() => null);
  const record = payload && typeof payload === "object" ? payload as Record<string, unknown> : {};
  const nested = record.error && typeof record.error === "object" ? record.error as Record<string, unknown> : {};
  throw new ApiProblem({
    ...fallback,
    title: typeof record.title === "string" ? record.title : fallback.title,
    ...(typeof record.code === "string" ? { code: record.code } : typeof nested.code === "string" ? { code: nested.code } : {}),
    ...(typeof record.detail === "string" ? { detail: record.detail } : {}),
    ...(typeof record.type === "string" ? { type: record.type } : {}),
    ...(record.meta && typeof record.meta === "object" && !Array.isArray(record.meta) ? { meta: record.meta as Record<string, unknown> } : {}),
  });
}
