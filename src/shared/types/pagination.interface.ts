export interface PaginationResult<T> {
  data: T[]; // Array of items for the current page
  currentPage: number;
  totalPages: number;
  totalCount: number;
  pageSize: number; // Number of items per page
  hasNextPage: boolean; // Indicates if there is a next page
  hasPreviousPage: boolean; // Indicates if there is a previous page
}
