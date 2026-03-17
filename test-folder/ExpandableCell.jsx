import { useState } from 'react'
import { Box, Typography } from '@mui/material'

export default function ExpandableCell({ text, maxLines = 2, color = 'text.secondary', fontSize = 12 }) {
  const [expanded, setExpanded] = useState(false)
  const isLong = text && text.length > 90

  return (
    <Box>
      <Typography
        component="div"
        sx={{
          fontSize,
          lineHeight: 1.55,
          color,
          ...(isLong && !expanded
            ? {
                display: '-webkit-box',
                WebkitLineClamp: maxLines,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }
            : {}),
        }}
      >
        {text}
      </Typography>
      {isLong && (
        <Typography
          component="span"
          sx={{
            fontSize: 11,
            color: 'primary.main',
            cursor: 'pointer',
            mt: 0.25,
            display: 'inline-block',
            '&:hover': { textDecoration: 'underline' },
          }}
          onClick={() => setExpanded((e) => !e)}
        >
          {expanded ? 'less ▲' : 'more ▼'}
        </Typography>
      )}
    </Box>
  )
}
