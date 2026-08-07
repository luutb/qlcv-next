import { PROJECTS, STEPS, TODAY } from "./work-board.fixtures";
import type { CreateDraft, WorkDraft, WorkIssue, WorkStepId } from "./work-board.types";

export function projectFor(issue: WorkIssue) {
  return PROJECTS.find((project) => project.id === issue.projectId) ?? {
    id: issue.projectId,
    name: issue.projectId,
    customer: "",
  };
}

export function stepFor(id: string) {
  return STEPS.find((step) => step.id === id) ?? STEPS[0];
}

export function dueState(due: string) {
  const diff = dayDiff(due);
  if (diff < 0) return "overdue";
  if (diff <= 1) return "soon";
  return "normal";
}

export function dayDiff(due: string) {
  const date = new Date(`${due}T00:00:00`);
  return Math.round((date.getTime() - TODAY.getTime()) / 86400000);
}

export function parseLabels(raw: string) {
  return raw
    .split(",")
    .map((label) => label.trim())
    .filter(Boolean);
}

export function issueToDraft(issue: WorkIssue): WorkDraft {
  return {
    title: issue.title,
    projectId: issue.projectId,
    step: issue.step,
    status: issue.status,
    assignee: issue.assignee,
    due: issue.due,
    labels: issue.labels.join(", "),
    description: issue.description,
  };
}

export function defaultCreateDraft(step: WorkStepId = "intake"): CreateDraft {
  return {
    title: "",
    projectId: PROJECTS[0].id,
    step,
    status: "TODO",
    assignee: "Lan",
    due: "2026-06-21",
    labels: "",
    description: "",
  };
}
