import { PaginationResult } from './pagination.interface';

export class ApiResponse<T> {
  status: string;
  message: string;
  data: { data: T[] } | PaginationResult<T>;
  error?: any;

  constructor(
    message: string,
    data: { data: T[] } | PaginationResult<T>,
    error?: any,
  ) {
    this.status = error ? 'error' : 'success';
    this.message = message;
    this.data = data;
    this.error = error;
  }
}
