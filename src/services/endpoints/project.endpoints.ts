export const projectEndpoints = {
  collection: "/projects",
  byId: (projectId: string) => `/projects/${projectId}` as const,
} as const;
