export type Actions = {
  view?: boolean;
  edit?: boolean;
  delete?: boolean;
  download?: boolean;
  lock?: boolean;
  restore?: boolean;
  move?: boolean;
  assign?: boolean;
  override_conflict?: boolean;
};

export type Pagination = {
  total: number;
  limit: number;
  offset: number;
  count: number;
};

export type PaginatedResponse<T> = {
  data: T[];
  pagination: Pagination;
};

export type MessageResponse = {
  message: string;
};

export type ListQuery = {
  limit?: number;
  offset?: number;
};
