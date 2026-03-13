export function uid(): string {
  return (Date.now() + Math.floor(Math.random() * 1000)).toString()
}
