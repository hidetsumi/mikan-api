export type PaginationParams = {
  offset?: number;
  limit?: number;
};

export type PaginationResult<T> = {
  data: T;
  total: number;
};
