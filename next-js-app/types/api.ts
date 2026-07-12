export type ApiResponse<T> = {
  success: boolean;
  data: T;
  message?: string;
};

export type PageResponse<T> = {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
};

export type SliceResponse<T> = {
  content: T[];
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
  hasNext: boolean;
};