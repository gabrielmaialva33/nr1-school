export interface PaginationMeta {
  total: number
  current_page: number
  per_page: number
  last_page: number
  first_page: number
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: PaginationMeta
}
