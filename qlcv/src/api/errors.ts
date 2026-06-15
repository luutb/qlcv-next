import { ApiError } from "./client";

export type ApiErrorCode =
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
  const code = payload?.error_code ?? payload?.code;
  return isKnownApiErrorCode(code) ? code : undefined;
}

export function getApiErrorDetails<TDetails>(error: unknown): TDetails | undefined {
  return getApiErrorPayload(error)?.details as TDetails | undefined;
}

export function getUserFacingErrorMessage(error: unknown): string {
  const payload = getApiErrorPayload(error);
  const code = payload?.error_code ?? payload?.code;

  if (isKnownApiErrorCode(code)) {
    return ERROR_MESSAGES[code];
  }

  if (payload?.detail) {
    return payload.detail;
  }

  if (payload?.message) {
    return payload.message;
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
