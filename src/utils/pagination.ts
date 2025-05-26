export interface PaginationResult {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  nextPage?: number;
  prevPage?: number;
}

export function calculatePagination(
  count: number,
  page: number,
  pageSize: number
): PaginationResult {
  const totalPages = Math.ceil(count / pageSize);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  const nextPage = hasNextPage ? page + 1 : undefined;
  const prevPage = hasPrevPage ? page - 1 : undefined;

  return {
    totalItems: count,
    totalPages,
    currentPage: page,
    nextPage,
    prevPage,
  };
}
