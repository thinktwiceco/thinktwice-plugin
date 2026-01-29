/**
 * Formats milliseconds into a human-readable duration string
 * Example: 61000 -> "1 minute"
 * Example: 3661000 -> "1 hour"
 */
export function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) return `${days} day${days > 1 ? "s" : ""}`
  if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""}`
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? "s" : ""}`
  return `${seconds} second${seconds !== 1 ? "s" : ""}`
}
