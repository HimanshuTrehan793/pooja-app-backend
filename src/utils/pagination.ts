export interface PaginationResult {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  nextPage?: number;
  prevPage?: number;
  pageSize: number;
}

export function calculatePagination(
  count: number,
  page: number,
  pageSize: number
): PaginationResult {
  const totalPages = Math.ceil(count / pageSize);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  return {
    totalItems: count,
    totalPages,
    currentPage: page,
    pageSize,
    nextPage: hasNextPage ? page + 1 : undefined,
    prevPage: hasPrevPage ? page - 1 : undefined,
  };
}
