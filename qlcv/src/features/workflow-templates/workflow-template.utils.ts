import type { MacroColumnKey } from "@/api/workflow.api";

export const MACRO_COLUMN_TITLES: Record<MacroColumnKey, string> = {
  INTAKE: "Intake",
  IN_PROGRESS: "In Progress",
  BILLING: "Billing",
  ARCHIVED: "Archived",
};
