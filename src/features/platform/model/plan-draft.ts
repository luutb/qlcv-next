import type { PlanInput, PlatformPlan } from "./tenant-contracts";
import { readPlanFeatures, type PlanFeature } from "./plan-features";
export type PlanDraft = { features: PlanFeature[]; code: string; name: string; description: string; is_active: boolean; priced: boolean; price: string; currency: string; interval: "MONTHLY" | "YEARLY"; members: string; projects: string; storage_gb: string };
export function planDraft(plan?: PlatformPlan): PlanDraft {
  return { features: [...(plan?.features ?? [])], code: plan?.code ?? "", name: plan?.name ?? "", description: plan?.description ?? "", is_active: plan?.is_active ?? true, priced: plan?.price_amount !== null && plan?.price_amount !== undefined, price: plan?.price_amount ?? "", currency: plan?.currency ?? "VND", interval: plan?.billing_interval ?? "MONTHLY", members: plan?.limits.members?.toString() ?? "", projects: plan?.limits.projects?.toString() ?? "", storage_gb: plan?.limits.storage_bytes === undefined || plan.limits.storage_bytes === null ? "" : String(plan.limits.storage_bytes / 1024 ** 3) };
}
export function validatePlanDraft(draft: PlanDraft): { errors: Partial<Record<keyof PlanDraft, string>>; input: PlanInput | null } {
  const errors: Partial<Record<keyof PlanDraft, string>> = {};
  try { readPlanFeatures(draft.features); } catch { errors.features = "Chọn các tính năng hợp lệ, không trùng lặp."; }
  const code = draft.code.trim(), name = draft.name.trim();
  if (!/^[A-Z0-9][A-Z0-9_-]{1,63}$/.test(code)) errors.code = "Dùng 2–64 chữ in hoa, chữ số, dấu _ hoặc -.";
  if (!name || [...name].length > 200) errors.name = "Nhập tên gói từ 1 đến 200 ký tự.";
  if ([...draft.description].length > 2000) errors.description = "Mô tả tối đa 2.000 ký tự.";
  if (draft.priced && !/^(0|[1-9]\d{0,15})(\.\d{1,2})?$/.test(draft.price.trim())) errors.price = "Nhập phí không âm, tối đa 16 chữ số và 2 số thập phân; dùng dấu chấm, không thêm số 0 đầu.";
  if (draft.priced && !/^[A-Z]{3}$/.test(draft.currency.trim())) errors.currency = "Nhập mã tiền tệ 3 chữ cái, ví dụ VND.";
  const limits: { members: number | null; projects: number | null; storage_bytes: number | null } = { members: null, projects: null, storage_bytes: null };
  for (const key of ["members", "projects"] as const) {
    const value = draft[key].trim();
    if (value) {
      if (!/^\d+$/.test(value) || !Number.isSafeInteger(Number(value)) || Number(value) > 2147483647) errors[key] = "Nhập số nguyên từ 0 đến 2.147.483.647 hoặc để trống.";
      else limits[key] = Number(value);
    }
  }
  if (draft.storage_gb.trim()) {
    const gb = Number(draft.storage_gb), bytes = Math.round(gb * 1024 ** 3);
    if (!Number.isFinite(gb) || gb < 0 || !Number.isSafeInteger(bytes)) errors.storage_gb = "Nhập dung lượng không âm trong phạm vi cho phép.";
    else limits.storage_bytes = bytes;
  }
  if (Object.keys(errors).length) return { errors, input: null };
  return { errors, input: { features: [...draft.features], code, name, description: draft.description.trim(), is_active: draft.is_active, price_amount: draft.priced ? draft.price.trim() : null, currency: draft.priced ? draft.currency.trim() : null, billing_interval: draft.priced ? draft.interval : null, limits } };
}
