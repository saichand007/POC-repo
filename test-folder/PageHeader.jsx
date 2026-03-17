import { Box, Breadcrumbs, Typography, Link as MuiLink } from '@mui/material'
import { Link } from 'react-router-dom'
import NavigateNextIcon from '@mui/icons-material/NavigateNext'

/**
 * PageHeader
 * crumbs: [{ label, to }]   — last item is the current page (no link)
 * actions: ReactNode         — right side slot
 */
export default function PageHeader({ crumbs = [], actions }) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        px: 3,
        py: 1.25,
        bgcolor: 'background.paper',
        borderBottom: '1px solid',
        borderColor: 'divider',
        flexShrink: 0,
      }}
    >
      <Breadcrumbs
        separator={<NavigateNextIcon sx={{ fontSize: 14 }} />}
        sx={{ '& .MuiBreadcrumbs-ol': { flexWrap: 'nowrap' } }}
      >
        {crumbs.map((c, i) =>
          i < crumbs.length - 1 ? (
            <MuiLink
              key={c.to}
              component={Link}
              to={c.to}
              underline="hover"
              color="text.secondary"
              sx={{ fontSize: 13 }}
            >
              {c.label}
            </MuiLink>
          ) : (
            <Typography key={c.label} sx={{ fontSize: 13, fontWeight: 500, color: 'text.primary' }}>
              {c.label}
            </Typography>
          )
        )}
      </Breadcrumbs>

      {actions && <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>{actions}</Box>}
    </Box>
  )
}
