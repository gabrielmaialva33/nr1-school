import { toAbsoluteUrl } from '@/lib/helpers'

export function mockApi(pathname: string): string {
  return toAbsoluteUrl(pathname)
}
