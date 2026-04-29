export type TaskStatus = 'ACTIVE' | 'REJECTED' | 'DONE';
export type StepStatus = 'PROCESSING' | 'PENDING_APPROVAL';

type Option<T extends string> = {
  value: T | '';
  label: string;
};

export const STATUS_OPTIONS: Option<TaskStatus>[] = [
  { value: '', label: 'Tất cả trạng thái' },
  { value: 'ACTIVE', label: 'Đang xử lý' },
  { value: 'REJECTED', label: 'Bị từ chối' },
  { value: 'DONE', label: 'Hoàn thành' },
];

export const STEP_STATUS_OPTIONS: Option<StepStatus>[] = [
  { value: '', label: 'Tất cả tiến độ' },
  { value: 'PROCESSING', label: 'Đang xử lý' },
  { value: 'PENDING_APPROVAL', label: 'Chờ duyệt' },
];

export const TASK_STATUS_LABEL: Record<string, string> = {
  ACTIVE: 'Đang xử lý',
  REJECTED: 'Bị từ chối',
  DONE: 'Hoàn thành',
};

export const STEP_STATUS_LABEL: Record<string, string> = {
  PROCESSING: 'Đang xử lý',
  PENDING_APPROVAL: 'Chờ duyệt',
};

export const TASK_STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  ACTIVE: { bg: '#EFF6FF', color: '#1D4ED8' },
  REJECTED: { bg: '#FEF2F2', color: '#B91C1C' },
  DONE: { bg: '#ECFDF5', color: '#047857' },
};

export const STEP_STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  PROCESSING: { bg: '#FEF3C7', color: '#B45309' },
  PENDING_APPROVAL: { bg: '#F3E8FF', color: '#7E22CE' },
};
