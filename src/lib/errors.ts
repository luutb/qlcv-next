export const ERROR_MESSAGES: Record<string, string> = {
  ROLE_NOT_ALLOWED: 'Bạn không có quyền thực hiện bước này',
  NOT_ASSIGNED: 'Bạn chưa được phân công cho hồ sơ này',
  PAYMENT_REQUIRED: 'Cần xác nhận thanh toán trước khi chuyển bước',
  FILE_REQUIRED: 'Cần upload tài liệu trước khi chuyển bước',
  STEP_MISMATCH: 'Bước hiện tại không khớp, vui lòng tải lại trang',
  FORBIDDEN: 'Bạn không có quyền thực hiện thao tác này',
  AMOUNT_EXCEEDED: 'Số tiền vượt quá tổng tiền hồ sơ',
  APPROVAL_REQUIRED: 'Bước này yêu cầu phê duyệt. Vui lòng phê duyệt hoặc từ chối.',
  NOT_APPROVAL_STEP: 'Bước này không yêu cầu phê duyệt',
  TASK_ALREADY_DONE: 'Hồ sơ đã hoàn thành',
  STEP_PENDING_APPROVAL: 'Bước này đang chờ phê duyệt. Vui lòng chờ quản lý duyệt.',
  STEP_NOT_PENDING: 'Bước này chưa ở trạng thái chờ duyệt',
  CUSTOMER_NOT_FOUND: 'Không tìm thấy khách hàng',
  CONTRACT_NOT_FOUND: 'Không tìm thấy hợp đồng',
};

const DEFAULT_ERROR_MESSAGE = 'An unexpected error occurred';
const DEFAULT_ERROR_CODE = 'UNKNOWN_ERROR';

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null;
}

function readString(record: UnknownRecord | undefined, key: string): string | undefined {
  const value = record?.[key];
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}

function getResponseData(error: unknown): UnknownRecord | undefined {
  if (!isRecord(error) || !isRecord(error.response)) return undefined;
  return isRecord(error.response.data) ? error.response.data : undefined;
}

export class ApiClientError extends Error {
  readonly code: string;
  readonly details: unknown;
  readonly status?: number;

  constructor(
    message: string,
    options: {
      code?: string;
      cause?: unknown;
      details?: unknown;
      status?: number;
    } = {}
  ) {
    super(message);
    this.name = 'ApiClientError';
    this.code = options.code ?? DEFAULT_ERROR_CODE;
    this.details = options.details ?? null;
    this.status = options.status;
    Object.defineProperty(this, 'cause', {
      configurable: true,
      enumerable: false,
      value: options.cause,
      writable: false,
    });
  }
}

export function normalizeApiError(error: unknown): ApiClientError {
  if (error instanceof ApiClientError) return error;

  const errorRecord = isRecord(error) ? error : undefined;
  const responseRecord = errorRecord && isRecord(errorRecord.response)
    ? errorRecord.response
    : undefined;
  const responseData = getResponseData(error);
  const statusValue = responseRecord?.status;

  return new ApiClientError(
    readString(responseData, 'message')
      ?? readString(errorRecord, 'message')
      ?? (error instanceof Error && error.message ? error.message : DEFAULT_ERROR_MESSAGE),
    {
      code: readString(responseData, 'code') ?? readString(errorRecord, 'code'),
      details: responseData && 'details' in responseData ? responseData.details : null,
      status: typeof statusValue === 'number' ? statusValue : undefined,
      cause: error,
    }
  );
}

export function extractErrorMessage(err: unknown): string | undefined {
  const responseData = getResponseData(err);
  const code = err instanceof ApiClientError
    ? err.code
    : readString(responseData, 'code');
  if (code && ERROR_MESSAGES[code]) return ERROR_MESSAGES[code];

  return readString(responseData, 'message')
    ?? (err instanceof Error && err.message ? err.message : undefined);
}
