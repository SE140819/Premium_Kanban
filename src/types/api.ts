export interface ApiError {
  status: number;
  message: string;
  details?: any;
}

export interface ApiResponse<T> {
  data: T | null;
  error: ApiError | null;
}
