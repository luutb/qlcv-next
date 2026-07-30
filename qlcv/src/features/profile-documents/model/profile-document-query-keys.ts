import type { ProfileDocumentEntityType } from "@/api/profile-documents.api";

export const profileDocumentQueryKeys = {
  all: ["profile-documents"] as const,
  entity: (entityType: ProfileDocumentEntityType, entityId: string) =>
    [...profileDocumentQueryKeys.all, entityType, entityId] as const,
};
