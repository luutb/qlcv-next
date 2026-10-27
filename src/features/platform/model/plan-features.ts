export const PLAN_FEATURES = [
  { key: "projects", label: "Dự án và mốc dự án" },
  { key: "tasks", label: "Công việc và phân công" },
  { key: "customers", label: "Khách hàng" },
  { key: "teams", label: "Đội nhóm và tổng quan nhân sự" },
  { key: "labels", label: "Nhãn công việc" },
  { key: "documents", label: "Tài liệu và tải hồ sơ" },
  { key: "finance", label: "Số liệu tài chính và hợp đồng" },
  { key: "time-entries", label: "Thời gian làm việc" },
  { key: "reports", label: "Báo cáo" },
  { key: "audit", label: "Nhật ký hoạt động" },
  { key: "users", label: "Quản lý nhân viên" },
  { key: "settings", label: "Cấu hình đơn vị" },
] as const;
export type PlanFeature = typeof PLAN_FEATURES[number]["key"];
export function isPlanFeature(value: unknown): value is PlanFeature {
  return PLAN_FEATURES.some((feature) => feature.key === value);
}
export function readPlanFeatures(value: unknown): PlanFeature[] {
  if (!Array.isArray(value) || !value.every(isPlanFeature) || new Set(value).size !== value.length) throw new Error("Danh sách tính năng gói không hợp lệ.");
  return value;
}
