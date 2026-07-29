import { ApiError } from "./client";

export type ApiErrorCode =
  | "NETWORK_ERROR"
  | "BAD_REQUEST"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "LOCKED"
  | "VERSION_CONFLICT"
  | "INVALID_CREDENTIALS"
  | "INVALID_MFA_TOKEN"
  | "ERR_WORKFLOW_TEMPLATE_NOT_FOUND"
  | "ERR_WORKFLOW_TEMPLATE_INACTIVE"
  | "ERR_WORKFLOW_STEP_INVALID"
  | "ERR_WORKFLOW_STEP_TEMPLATE_MISMATCH"
  | "ERR_WORKFLOW_FINANCIAL_BLOCKED"
  | "ERR_PROJECT_CONFLICT_BLOCKED"
  | "ERR_PAYMENT_AMOUNT_INVALID"
  | "ERR_CONFLICT_OVERRIDE_JUSTIFICATION_TOO_SHORT";

export type WorkflowFinancialBlockedDetails = {
  required_amount?: number;
  current_paid?: number;
  incoming_payment_confirmation?: number;
  new_total_paid?: number;
  remaining_amount?: number;
  payment_label?: string;
};

export type ApiErrorPayload = {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  error_code?: ApiErrorCode;
  code?: ApiErrorCode | string;
  message?: string;
  details?: unknown;
};

const ERROR_MESSAGES: Record<ApiErrorCode, string> = {
  NETWORK_ERROR: "Không kết nối được backend tại localhost:8080",
  BAD_REQUEST: "Dữ liệu gửi lên không hợp lệ.",
  UNAUTHORIZED: "Phiên đăng nhập không hợp lệ hoặc đã hết hạn.",
  FORBIDDEN: "Bạn không có quyền thực hiện thao tác này.",
  LOCKED: "Dữ liệu đang bị khóa và chưa thể thay đổi.",
  VERSION_CONFLICT: "Dữ liệu đã thay đổi. Vui lòng tải lại trước khi tiếp tục.",
  INVALID_CREDENTIALS: "Sai tên đăng nhập hoặc mật khẩu.",
  INVALID_MFA_TOKEN: "Mã MFA không hợp lệ.",
  ERR_WORKFLOW_TEMPLATE_NOT_FOUND: "Workflow template không tồn tại.",
  ERR_WORKFLOW_TEMPLATE_INACTIVE: "Workflow template đã bị tắt.",
  ERR_WORKFLOW_STEP_INVALID: "Workflow step không hợp lệ.",
  ERR_WORKFLOW_STEP_TEMPLATE_MISMATCH: "Step không thuộc workflow của project.",
  ERR_WORKFLOW_FINANCIAL_BLOCKED: "Cần xác nhận thanh toán trước khi chuyển bước.",
  ERR_PROJECT_CONFLICT_BLOCKED: "Project đang bị conflict, không được chuyển bước.",
  ERR_PAYMENT_AMOUNT_INVALID: "Số tiền thanh toán không hợp lệ.",
  ERR_CONFLICT_OVERRIDE_JUSTIFICATION_TOO_SHORT: "Lý do ghi đè conflict quá ngắn.",
};

export function getApiErrorPayload(error: unknown): ApiErrorPayload | null {
  if (!(error instanceof ApiError) || !error.payload || typeof error.payload !== "object") {
    return null;
  }

  return error.payload as ApiErrorPayload;
}

export function getApiErrorCode(error: unknown): ApiErrorCode | undefined {
  const payload = getApiErrorPayload(error);
  const payloadCode = payload?.error_code ?? payload?.code;
  if (isKnownApiErrorCode(payloadCode)) {
    return payloadCode;
  }

  return (
    statusToCode(payload?.status) ??
    statusToCode(error instanceof ApiError ? error.status : undefined)
  );
}

export function getApiErrorDetails<TDetails>(error: unknown): TDetails | undefined {
  return getApiErrorPayload(error)?.details as TDetails | undefined;
}

export function getUserFacingErrorMessage(error: unknown): string {
  const payload = getApiErrorPayload(error);
  const code = getApiErrorCode(error);

  if (payload?.detail) {
    return payload.detail;
  }

  if (payload?.message) {
    return payload.message;
  }

  if (isKnownApiErrorCode(code)) {
    return ERROR_MESSAGES[code];
  }

  if (error instanceof ApiError) {
    const statusCode = statusToCode(error.status);
    if (statusCode) {
      return ERROR_MESSAGES[statusCode];
    }
  }

  if (payload?.title && payload?.status) {
    return `${payload.title} (${payload.status})`;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Có lỗi xảy ra. Vui lòng thử lại.";
}

export function getDebugErrorInfo(error: unknown): string | undefined {
  const payload = getApiErrorPayload(error);
  if (!payload) {
    return undefined;
  }

  const parts = [
    payload.status ? `status=${payload.status}` : undefined,
    payload.code ? `code=${payload.code}` : undefined,
    payload.type ? `type=${payload.type}` : undefined,
  ].filter(Boolean);

  return parts.length ? parts.join(" ") : undefined;
}

function isKnownApiErrorCode(code: unknown): code is ApiErrorCode {
  return typeof code === "string" && code in ERROR_MESSAGES;
}

function statusToCode(status: unknown): ApiErrorCode | undefined {
  switch (status) {
    case 400:
      return "BAD_REQUEST";
    case 401:
      return "UNAUTHORIZED";
    case 403:
      return "FORBIDDEN";
    case 423:
      return "LOCKED";
    case 428:
      return "VERSION_CONFLICT";
    default:
      return undefined;
  }
}
