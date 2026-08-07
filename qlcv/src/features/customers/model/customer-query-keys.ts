export const customerQueryKeys = {
  all: ["customers"] as const,
  lists: () => [...customerQueryKeys.all, "list"] as const,
  list: (query: Record<string, unknown>) => [...customerQueryKeys.lists(), query] as const,
  details: () => [...customerQueryKeys.all, "detail"] as const,
  detail: (id: string) => [...customerQueryKeys.details(), id] as const,
  conflicts: (id: string) => [...customerQueryKeys.detail(id), "conflicts"] as const,
};
