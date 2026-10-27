import type { SubscriptionStatus } from "./tenant-contracts";
export const subscriptionLabels: Record<SubscriptionStatus, string> = { TRIALING: "Dùng thử", ACTIVE: "Đang sử dụng", PAUSED: "Tạm dừng", CANCELLED: "Đã hủy", EXPIRED: "Hết hạn" };
export function resourceCount(value: number | null) { return value === null ? "Chưa đo được" : value.toLocaleString("vi-VN"); }
export function storageSize(bytes: number | null) {
  if (bytes === null) return "Chưa đo được";
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB", "PB"];
  const scale = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / 1024 ** scale).toLocaleString("vi-VN", { maximumFractionDigits: 2 })} ${units[scale]}`;
}
export function planPrice(amount: string | null, currency: string | null) {
  if (amount === null || currency === null) return "Chưa cấu hình phí";
  const [whole, fraction] = amount.split(".");
  return `${whole.replace(/\B(?=(\d{3})+(?!\d))/g, ".")}${fraction ? `,${fraction}` : ""} ${currency}`;
}
export function quotaPercent(used: number | null, limit: number | null) {
  if (used === null || limit === null) return null;
  return limit === 0 ? used > 0 ? 100 : 0 : Math.min(100, used / limit * 100);
}
