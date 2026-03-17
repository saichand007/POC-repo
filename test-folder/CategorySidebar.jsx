import {
  Box, Stack, Typography, Tooltip,
  Skeleton, Divider, Button, useTheme, alpha,
} from '@mui/material'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty'
import EditNoteIcon from '@mui/icons-material/EditNote'

import { useCategories } from '@hooks/useRcaQueries'

// ── Tiny stat pill ─────────────────────────────────────────────────────────
function StatPill({ count, color, Icon, tooltip }) {
  const theme = useTheme()
  return (
    <Tooltip title={`${tooltip}: ${count}`} placement="right" arrow>
      <Stack
        direction="row"
        alignItems="center"
        gap={0.3}
        sx={{
          px: 0.75, py: 0.15,
          borderRadius: 10,
          bgcolor: alpha(theme.palette[color].main, 0.1),
          color: `${color}.main`,
          fontSize: 10,
          fontWeight: 600,
          cursor: 'default',
          minWidth: 28,
          justifyContent: 'center',
          lineHeight: 1.6,
        }}
      >
        <Icon sx={{ fontSize: 10 }} />
        <span>{count}</span>
      </Stack>
    </Tooltip>
  )
}

// ── Single category row ────────────────────────────────────────────────────
function CategoryRow({ cat, isSelected, onClick }) {
  const theme = useTheme()
  return (
    <Box
      onClick={onClick}
      sx={{
        mx: 0.75, px: 1.5, py: 1,
        borderRadius: 1.5,
        cursor: 'pointer',
        mb: 0.25,
        bgcolor: isSelected ? alpha(theme.palette.primary.main, 0.08) : 'transparent',
        transition: 'background .12s',
        '&:hover': {
          bgcolor: isSelected
            ? alpha(theme.palette.primary.main, 0.1)
            : 'action.hover',
        },
      }}
    >
      {/* Name row */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={0.6}>
        <Typography
          variant="body2"
          fontWeight={isSelected ? 600 : 400}
          color={isSelected ? 'primary.main' : 'text.primary'}
          sx={{ fontSize: 13, lineHeight: 1.3 }}
          noWrap
        >
          {cat.name}
        </Typography>
        <Typography
          variant="caption"
          fontWeight={600}
          color={isSelected ? 'primary.main' : 'text.secondary'}
          sx={{ ml: 1, flexShrink: 0 }}
        >
          {cat.total}
        </Typography>
      </Stack>

      {/* Stat pills row */}
      <Stack direction="row" gap={0.5} flexWrap="wrap">
        <StatPill count={cat.pending}   color="warning" Icon={HourglassEmptyIcon} tooltip="Pending review" />
        <StatPill count={cat.approved}  color="success" Icon={CheckCircleIcon}    tooltip="Approved" />
        <StatPill count={cat.corrected} color="info"    Icon={EditNoteIcon}        tooltip="Corrected" />
      </Stack>
    </Box>
  )
}

// ── Sidebar ────────────────────────────────────────────────────────────────
export default function CategorySidebar({ fileId, selectedCategory, onSelectCategory }) {
  const { data: categories = [], isLoading } = useCategories(fileId)

  // Aggregate totals for the "All" row
  const allStats = categories.reduce(
    (acc, c) => ({
      total:     acc.total     + c.total,
      pending:   acc.pending   + c.pending,
      approved:  acc.approved  + c.approved,
      corrected: acc.corrected + c.corrected,
    }),
    { total: 0, pending: 0, approved: 0, corrected: 0 }
  )

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>

      {/* Header */}
      <Box sx={{ px: 2, pt: 1.5, pb: 1, borderBottom: '1px solid', borderColor: 'divider', flexShrink: 0 }}>
        <Typography variant="overline" color="text.secondary" display="block">
          Error categories
        </Typography>
      </Box>

      {/* List */}
      <Box sx={{ flex: 1, overflowY: 'auto', py: 0.75 }}>
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Box key={i} sx={{ px: 2, py: 0.75 }}>
              <Skeleton height={40} sx={{ borderRadius: 1.5 }} />
            </Box>
          ))
        ) : (
          <>
            {/* All categories row */}
            <CategoryRow
              cat={{ name: 'All categories', ...allStats }}
              isSelected={selectedCategory === null}
              onClick={() => onSelectCategory(null)}
            />

            <Divider sx={{ my: 0.75, mx: 1.5 }} />

            {/* Per-category rows */}
            {categories.map((cat) => (
              <CategoryRow
                key={cat.name}
                cat={cat}
                isSelected={selectedCategory === cat.name}
                onClick={() => onSelectCategory(cat.name)}
              />
            ))}
          </>
        )}
      </Box>

      {/* Footer */}
      <Box sx={{ borderTop: '1px solid', borderColor: 'divider', p: 1, display: 'flex', gap: 0.75, flexShrink: 0 }}>
        <Button
          size="small"
          variant="outlined"
          fullWidth
          sx={{ fontSize: 11, py: 0.5, borderRadius: 1.5 }}
          onClick={() => onSelectCategory(null)}
        >
          Show all
        </Button>
      </Box>
    </Box>
  )
}
