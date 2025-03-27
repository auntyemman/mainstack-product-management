import { ApiResponse } from '../types/api_response.type';
import { PaginationResult } from '../types/pagination.interface';

// export const successResponse = <T = null>(
//   message: string,
//   data?: T, // data is optional
// ): AppResponse<T> => {
//   return {
//     status: 'success',
//     message,
//     data: data ?? null, // If data is not provided, default it to null
//   };
// };

export const successResponse = <T>(
  message: string,
  data: T[] | PaginationResult<T>,
  error?: any
): ApiResponse<T> => {
  return new ApiResponse(
    message,
    Array.isArray(data) ? { data } : data, // Wrap non-paginated data inside `data`
    error
  );
};

// export const errorResponse = (
//   message: string,
//   error: any = null,
// ): AppResponse<null> => {
//   return {
//     status: 'error',
//     message,
//     error,
//   };
// };