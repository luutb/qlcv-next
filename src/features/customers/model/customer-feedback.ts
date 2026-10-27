import { ApiProblem, getSafeApiErrorMessage } from "@/services/http";
export function customerError(error: unknown, fallback: string) {
  if (error instanceof ApiProblem) {
    if (error.problem.code === "CUSTOMER_HAS_TASKS") return "Khách hàng đã gắn với công việc. Chưa thể lưu trữ để bảo toàn hồ sơ liên quan.";
    if (error.problem.code === "CUSTOMER_ARCHIVED") return "Khách hàng đã được lưu trữ. Hãy khôi phục trước khi chỉnh sửa.";
    if (["BAD_REQUEST", "VALIDATION_ERROR"].includes(error.problem.code ?? "")) return "Thông tin chưa hợp lệ. Kiểm tra tên, email và độ dài các trường.";
  }
  return getSafeApiErrorMessage(error, fallback);
}
