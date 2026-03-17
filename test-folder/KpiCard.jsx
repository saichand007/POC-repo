import { Box, Typography, Skeleton } from '@mui/material'

/**
 * KpiCard
 * label:   string
 * value:   string | number
 * color:   MUI color token e.g. 'error.main', 'success.main'
 * loading: bool
 */
export default function KpiCard({ label, value, color, loading = false }) {
  return (
    <Box>
      <Typography
        variant="caption"
        color="text.secondary"
        display="block"
        sx={{ mb: 0.5, whiteSpace: 'nowrap' }}
      >
        {label}
      </Typography>
      {loading ? (
        <Skeleton width={48} height={28} />
      ) : (
        <Typography
          variant="h5"
          fontWeight={600}
          lineHeight={1}
          sx={{ color: color ?? 'text.primary' }}
        >
          {value ?? '—'}
        </Typography>
      )}
    </Box>
  )
}
