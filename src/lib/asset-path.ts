export function toAbsoluteUrl(pathname: string): string {
  const baseUrl = import.meta.env.BASE_URL || '/'
  const normalizedBaseUrl =
    baseUrl === '/' ? '/' : `/${baseUrl.replace(/^\/+|\/+$/g, '')}/`
  const normalizedPath = pathname.replace(/^\/+/, '')

  if (!normalizedPath) {
    return normalizedBaseUrl
  }

  return normalizedBaseUrl === '/'
    ? `/${normalizedPath}`
    : `${normalizedBaseUrl}${normalizedPath}`
}
