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

export function extractErrorMessage(err: unknown): string | undefined {
  if (err && typeof err === 'object' && 'response' in err) {
    const resp = (err as { response?: { data?: { code?: string; message?: string } } }).response;
    const code = resp?.data?.code;
    if (code && ERROR_MESSAGES[code]) return ERROR_MESSAGES[code];
    return resp?.data?.message;
  }
  return undefined;
}
