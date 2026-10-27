import type { PlanDraft } from "./plan-draft";

// Suggested starting points, not persisted plans or approved pricing.
export const planPresets = [
  { code: "BASIC", name: "Cơ bản", members: "10", projects: "20", storage_gb: "5" },
  { code: "TEAM", name: "Nhóm", members: "30", projects: "100", storage_gb: "50" },
  { code: "BUSINESS", name: "Doanh nghiệp", members: "100", projects: "500", storage_gb: "200" },
] satisfies Partial<PlanDraft>[];

export const quotaChoices = {
  members: [5, 10, 20, 30, 50, 100, 200],
  projects: [10, 20, 50, 100, 200, 500, 1000],
  storage_gb: [1, 5, 10, 20, 50, 100, 200, 500, 1000],
};
