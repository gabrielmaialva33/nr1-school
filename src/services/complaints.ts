import { apiJson } from '@/lib/api-client'

export type ComplaintStatus =
  | 'received'
  | 'under_review'
  | 'investigating'
  | 'resolved'
  | 'dismissed'

export interface Complaint {
  id: string
  school_id: string
  protocol_number: string
  category: string
  sector_reported: string
  description: string
  is_anonymous: boolean
  status: ComplaintStatus
  resolution_description: string | null
  assigned_to: string
  created_at: string
}

export interface PaginationMeta {
  total: number
  current_page: number
  per_page: number
  last_page: number
  first_page: number
}

export interface ComplaintsResponse {
  data: Complaint[]
  meta: PaginationMeta
}

export interface ComplaintFilters {
  search: string
  status: ComplaintStatus | 'all'
  page: number
  per_page: number
}

export async function fetchComplaints(filters: ComplaintFilters) {
  const params = new URLSearchParams({
    page: String(filters.page),
    per_page: String(filters.per_page),
  })
  if (filters.search.trim()) params.set('search', filters.search.trim())
  if (filters.status !== 'all') params.set('status', filters.status)

  return apiJson<ComplaintsResponse>(`/api/complaints?${params.toString()}`)
}

export async function fetchComplaintStats() {
  const payload = await apiJson<ComplaintsResponse>('/api/complaints?page=1&per_page=1000')
  const all = payload.data

  const reviewingCount = all.filter(
    complaint => complaint.status === 'under_review' || complaint.status === 'investigating',
  ).length
  const resolvedCount = all.filter(complaint => complaint.status === 'resolved').length
  const anonymousCount = all.filter(complaint => complaint.is_anonymous).length

  return {
    total: payload.meta.total,
    reviewing: reviewingCount,
    resolved: resolvedCount,
    anonymous: anonymousCount,
  }
}
