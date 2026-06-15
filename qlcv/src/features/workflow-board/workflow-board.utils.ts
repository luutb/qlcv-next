import type { ConflictStatus } from "@/api/projects.api";
import type { MacroColumnKey } from "@/api/workflow.api";

export const MACRO_COLUMN_TITLES: Record<MacroColumnKey, string> = {
  INTAKE: "Intake",
  IN_PROGRESS: "In Progress",
  BILLING: "Billing",
  ARCHIVED: "Archived",
};

export const CONFLICT_LABELS: Record<ConflictStatus, string> = {
  CLEARED: "Cleared",
  PENDING: "Pending",
  CONFLICT_DETECTED: "Conflict detected",
  OVERRIDDEN_CLEARED: "Override cleared",
};

export function formatCurrency(value?: number | null) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value ?? 0);
}

export function getConflictColor(status?: ConflictStatus) {
  if (status === "CONFLICT_DETECTED") {
    return "red";
  }

  if (status === "PENDING") {
    return "gold";
  }

  return "green";
}
