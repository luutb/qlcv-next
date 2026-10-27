import { apiUrl, createIdempotencyKey, parseApiResponse } from "@/services/http";
import type { Label, LabelAssignment, LabelRequestOptions } from "./label.types";

type ListResponse<T> = { data: T[] };
type LegacyLabel = { id?: string | number; name?: string; title?: string; color?: string; label_type?: Label["label_type"]; is_system?: boolean; description?: string };
type LegacyLabelsResponse = { custom_labels?: LegacyLabel[]; system_labels?: Record<string, LegacyLabel[]> };

function normalizeLabel(value: LegacyLabel): Label | null {
  const id = value.id === undefined || value.id === null ? "" : String(value.id);
  const title = value.title ?? value.name ?? "";
  if (!id || !title) return null;
  return { id, title, color: value.color ?? "#64748b", label_type: value.label_type ?? "NORMAL", is_archived: false, is_system: value.is_system, description: value.description };
}

/**
 * The deployed backend still returns { custom_labels, system_labels }, while
 * the canonical frontend contract is { data: Label[] }. Normalize at the
 * service boundary so render code never maps an absent collection.
 */
function normalizeList(payload: unknown): ListResponse<Label> {
  if (!payload || typeof payload !== "object") return { data: [] };
  const candidate = payload as ListResponse<unknown> & LegacyLabelsResponse;
  if (Array.isArray(candidate.data)) return { data: candidate.data as Label[] };
  const legacy = [
    ...(candidate.custom_labels ?? []),
    ...Object.values(candidate.system_labels ?? {}).flat(),
  ].map(normalizeLabel).filter((label): label is Label => label !== null);
  return { data: legacy };
}

function headers(options: LabelRequestOptions, isWrite = false): HeadersInit {
  return {
    ...(options.accessToken ? { Authorization: `Bearer ${options.accessToken}` } : {}),
    ...(isWrite ? { "Content-Type": "application/json", "Idempotency-Key": createIdempotencyKey() } : {}),
  };
}

function url(path: string): string {
  return apiUrl(path as `/${string}`);
}

export const labelsApi = {
  list: async (options: LabelRequestOptions = {}) =>
    normalizeList(await parseApiResponse<unknown>(await fetch(url("/labels"), { headers: headers(options), signal: options.signal }))),
  create: async (input: { title: string; color: string; description: string; label_type: Label["label_type"] }, options: LabelRequestOptions) =>
    parseApiResponse<unknown>(await fetch(url("/labels"), { method: "POST", headers: headers(options, true), body: JSON.stringify({ name: input.title, label_type: input.label_type, color: input.color, bg_color: input.color + "18", text_color: input.color, description: input.description, category: "custom" }) })),
  update: async (id: string, input: { title: string; color: string; description: string; label_type: Label["label_type"] }, options: LabelRequestOptions) =>
    parseApiResponse<unknown>(await fetch(url(`/labels/${id}`), { method: "PUT", headers: headers(options, true), body: JSON.stringify({ name: input.title, label_type: input.label_type, color: input.color, bg_color: input.color + "18", text_color: input.color, description: input.description }) })),
  remove: async (id: string, options: LabelRequestOptions) =>
    parseApiResponse<unknown>(await fetch(url(`/labels/${id}`), { method: "DELETE", headers: headers(options, true) })),
  assignments: async (_entityType: LabelAssignment["entity_type"], entityId: string, options: LabelRequestOptions = {}) => {
    const result = await parseApiResponse<LegacyLabelsResponse>(await fetch(url(`/tasks/${entityId}/labels`), { headers: headers(options), signal: options.signal }));
    return { data: (result.custom_labels ?? []).map(normalizeLabel).filter((label): label is Label => label !== null).map(label => ({ id: label.id, label_id: label.id, entity_type: "task" as const, entity_id: entityId, label })) };
  },
  setTaskLabels: async (taskId: string, labelIds: string[], options: LabelRequestOptions) =>
    parseApiResponse<unknown>(await fetch(url(`/tasks/${taskId}/labels`), { method: "PUT", headers: headers(options, true), body: JSON.stringify({ custom_labels: labelIds.map(Number) }) })),
};
