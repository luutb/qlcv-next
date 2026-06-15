import { apiRequest } from "./client";

export const METADATA_ENTITIES = [
  "customers",
  "projects",
  "documents",
  "time_entries",
  "invoices",
  "workflow_templates",
  "workflow_steps",
  "project_payments",
] as const;

export type MetadataEntity = (typeof METADATA_ENTITIES)[number];

export type MetadataField = {
  key: string;
  type: "UUID" | "TEXT" | "NUMBER" | "DATE" | "BOOLEAN" | string;
  sortable?: boolean;
  filterable?: boolean;
  required: boolean;
};

export type MetadataSchema = {
  entity: MetadataEntity;
  columns: MetadataField[];
};

export function getMetadataSchema(entity: MetadataEntity, signal?: AbortSignal) {
  return apiRequest<MetadataSchema>(`/api/v1/metadata/schemas/${entity}`, { signal });
}
