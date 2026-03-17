/**
 * src/utils/formatters.js
 * Shared formatting helpers
 */

/** Format an ISO date string to a human-readable relative or absolute format */
export function formatDate(isoString) {
  if (!isoString) return '—'
  const date = new Date(isoString)
  if (isNaN(date)) return isoString

  const now = new Date()
  const diffMs = now - date
  const diffMin = Math.floor(diffMs / 60_000)
  const diffHr = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHr / 24)

  if (diffMin < 1)   return 'just now'
  if (diffMin < 60)  return `${diffMin}m ago`
  if (diffHr < 24)   return `${diffHr}h ago`
  if (diffDay < 7)   return `${diffDay}d ago`

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

/** Format bytes to human-readable string */
export function formatBytes(bytes, decimals = 1) {
  if (!bytes || bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`
}

/** Format a number with thousand separators */
export function formatNumber(value) {
  if (value == null) return '—'
  return Number(value).toLocaleString('en-US')
}

/** Truncate a string to maxLength with ellipsis */
export function truncate(str, maxLength = 80) {
  if (!str) return ''
  return str.length <= maxLength ? str : str.slice(0, maxLength).trimEnd() + '…'
}
