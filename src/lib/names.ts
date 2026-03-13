export function getInitials(
  name: string | null | undefined,
  count?: number,
): string {
  if (!name || typeof name !== 'string') {
    return ''
  }

  const initials = name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0].toUpperCase())

  return count && count > 0
    ? initials.slice(0, count).join('')
    : initials.join('')
}
