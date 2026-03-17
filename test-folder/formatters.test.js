import { formatDate, formatBytes, formatNumber, truncate } from '@utils/formatters'

describe('formatters', () => {
  describe('formatDate', () => {
    it('returns — for null/undefined', () => {
      expect(formatDate(null)).toBe('—')
      expect(formatDate(undefined)).toBe('—')
    })

    it('returns "just now" for very recent dates', () => {
      expect(formatDate(new Date().toISOString())).toBe('just now')
    })

    it('returns minutes ago for dates within an hour', () => {
      const d = new Date(Date.now() - 5 * 60_000).toISOString()
      expect(formatDate(d)).toBe('5m ago')
    })

    it('returns hours ago for dates within a day', () => {
      const d = new Date(Date.now() - 3 * 3_600_000).toISOString()
      expect(formatDate(d)).toBe('3h ago')
    })
  })

  describe('formatBytes', () => {
    it('handles 0 bytes', () => {
      expect(formatBytes(0)).toBe('0 B')
    })

    it('formats kilobytes', () => {
      const result = formatBytes(1024)
      expect(result).toContain('KB')
      expect(result).toContain('1')
    })

    it('formats megabytes', () => {
      const result = formatBytes(1024 * 1024)
      expect(result).toContain('MB')
      expect(result).toContain('1')
    })
  })

  describe('formatNumber', () => {
    it('returns — for null', () => {
      expect(formatNumber(null)).toBe('—')
    })

    it('formats numbers with commas', () => {
      expect(formatNumber(48320)).toBe('48,320')
    })
  })

  describe('truncate', () => {
    it('returns empty string for falsy input', () => {
      expect(truncate('')).toBe('')
    })

    it('does not truncate short strings', () => {
      expect(truncate('short', 80)).toBe('short')
    })

    it('truncates long strings with ellipsis', () => {
      const s = 'A'.repeat(100)
      const result = truncate(s, 80)
      expect(result.endsWith('…')).toBe(true)
      expect(result.length).toBeLessThanOrEqual(81)
    })
  })
})
