import type { ConflictStatus } from "@/api/projects.api";
import type { ChipProps } from "@mui/material";

export function formatCurrency(value?: number | null) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value ?? 0);
}

export function getConflictColor(status?: ConflictStatus): ChipProps["color"] {
  if (status === "CONFLICT_DETECTED") {
    return "error";
  }

  if (status === "PENDING") {
    return "warning";
  }

  return "success";
}
