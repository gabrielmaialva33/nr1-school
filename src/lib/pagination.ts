import type { PaginationMeta } from '@/types/api'

export function createPaginationMeta(
  total: number,
  currentPage: number,
  perPage: number,
): PaginationMeta {
  const lastPage = Math.max(1, Math.ceil(total / perPage))

  return {
    total,
    current_page: Math.min(currentPage, lastPage),
    per_page: perPage,
    last_page: lastPage,
    first_page: 1,
  }
}
