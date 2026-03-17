import { useState } from 'react'
import {
  Box, Stack, Typography, TextField,
  Button, IconButton, Tooltip,
} from '@mui/material'
import EditNoteIcon from '@mui/icons-material/EditNote'

export default function AISolutionCell({ row, onSave, disabled = false }) {
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(row.original.aiSolution ?? '')

  const commit = () => {
    if (value.trim() !== row.original.aiSolution) {
      onSave(row.original.id, value.trim())
    }
    setEditing(false)
  }

  const cancel = () => {
    setValue(row.original.aiSolution ?? '')
    setEditing(false)
  }

  if (editing) {
    return (
      <Box sx={{ py: 0.25 }}>
        {row.original.originalValue && (
          <Typography
            variant="caption"
            sx={{ textDecoration: 'line-through', color: 'text.disabled', display: 'block', mb: 0.5 }}
          >
            {row.original.originalValue}
          </Typography>
        )}
        <TextField
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); commit() }
            if (e.key === 'Escape') cancel()
          }}
          multiline
          minRows={2}
          maxRows={5}
          fullWidth
          autoFocus
          size="small"
          sx={{
            mb: 0.75,
            '& .MuiOutlinedInput-root': {
              fontSize: 12,
              '& fieldset': { borderColor: 'primary.main', borderWidth: 1.5 },
              boxShadow: '0 0 0 3px rgba(21,88,214,.1)',
            },
          }}
        />
        <Stack direction="row" gap={0.75}>
          <Button
            size="small"
            variant="contained"
            onClick={commit}
            sx={{ fontSize: 11, py: 0.35, px: 1.25, minWidth: 0, borderRadius: 1 }}
          >
            Save
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={cancel}
            sx={{ fontSize: 11, py: 0.35, px: 1.25, minWidth: 0, borderRadius: 1 }}
          >
            Cancel
          </Button>
        </Stack>
      </Box>
    )
  }

  return (
    <Box>
      {row.original.originalValue && (
        <Typography
          variant="caption"
          sx={{ textDecoration: 'line-through', color: 'text.disabled', display: 'block', mb: 0.25 }}
        >
          {row.original.originalValue}
        </Typography>
      )}
      <Stack direction="row" alignItems="flex-start" gap={0.5}>
        <Typography
          variant="body2"
          fontWeight={500}
          sx={{ flex: 1, fontSize: 12, lineHeight: 1.5, color: 'success.main' }}
        >
          {value}
        </Typography>
        {!disabled && (
          <Tooltip title="Edit AI solution (Enter to save, Esc to cancel)">
            <IconButton
              size="small"
              onClick={() => setEditing(true)}
              sx={{
                width: 22, height: 22, flexShrink: 0, mt: 0.1,
                '&:hover': { bgcolor: 'primary.50', color: 'primary.main' },
              }}
            >
              <EditNoteIcon sx={{ fontSize: 15 }} />
            </IconButton>
          </Tooltip>
        )}
      </Stack>
    </Box>
  )
}
