export const TASK_STATUS = {
  ACTIVE: 'ACTIVE',
  DONE: 'DONE',
  REJECTED: 'REJECTED',
} as const;

export type TaskStatus = (typeof TASK_STATUS)[keyof typeof TASK_STATUS];

export const TASK_STATUS_LABEL: Record<TaskStatus, string> = {
  [TASK_STATUS.ACTIVE]: 'Đang xử lý',
  [TASK_STATUS.DONE]: 'Hoàn thành',
  [TASK_STATUS.REJECTED]: 'Từ chối',
};

export const TASK_STATUS_COLOR: Record<TaskStatus, string> = {
  [TASK_STATUS.ACTIVE]: '#4F46E5',
  [TASK_STATUS.DONE]: '#059669',
  [TASK_STATUS.REJECTED]: '#DC2626',
};

/** Soft bg + text color cho status chip hiện đại */
export const TASK_STATUS_STYLE: Record<TaskStatus, { bg: string; color: string }> = {
  [TASK_STATUS.ACTIVE]: { bg: '#EEF2FF', color: '#4338CA' },
  [TASK_STATUS.DONE]: { bg: '#ECFDF5', color: '#047857' },
  [TASK_STATUS.REJECTED]: { bg: '#FEF2F2', color: '#B91C1C' },
};

export const STATUS_OPTIONS = [
  { value: '', label: 'Tất cả' },
  ...Object.entries(TASK_STATUS_LABEL).map(([value, label]) => ({
    value,
    label,
  })),
];

// ── Step Status ──

export const STEP_STATUS = {
  PROCESSING: 'PROCESSING',
  PENDING_APPROVAL: 'PENDING_APPROVAL',
} as const;

export const STEP_STATUS_LABEL: Record<string, string> = {
  [STEP_STATUS.PROCESSING]: 'Đang xử lý',
  [STEP_STATUS.PENDING_APPROVAL]: 'Chờ duyệt',
};

export const STEP_STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  [STEP_STATUS.PROCESSING]: { bg: '#EEF2FF', color: '#4338CA' },
  [STEP_STATUS.PENDING_APPROVAL]: { bg: '#FFF7ED', color: '#C2410C' },
};

export const STEP_STATUS_OPTIONS = [
  { value: '', label: 'Tất cả' },
  { value: STEP_STATUS.PROCESSING, label: STEP_STATUS_LABEL[STEP_STATUS.PROCESSING] },
  { value: STEP_STATUS.PENDING_APPROVAL, label: STEP_STATUS_LABEL[STEP_STATUS.PENDING_APPROVAL] },
];

// ── Contract Status ──

export const CONTRACT_STATUS_LABEL: Record<string, string> = {
  draft: 'Nháp',
  signed: 'Đã ký',
  active: 'Hiệu lực',
  expired: 'Hết hạn',
  cancelled: 'Đã hủy',
};

export const CONTRACT_STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  draft: { bg: '#F1F5F9', color: '#64748B' },
  signed: { bg: '#EEF2FF', color: '#4338CA' },
  active: { bg: '#ECFDF5', color: '#047857' },
  expired: { bg: '#FFF7ED', color: '#C2410C' },
  cancelled: { bg: '#FEF2F2', color: '#B91C1C' },
};

