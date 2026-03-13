import { toAbsoluteUrl } from '@/lib/asset-path'

export function mockApi(pathname: string): string {
  return toAbsoluteUrl(pathname)
}
