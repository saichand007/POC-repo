import { useState } from 'react'
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Typography, Stack,
  Avatar, Divider, Alert, CircularProgress,
} from '@mui/material'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'

export default function ApproveCategoryDialog({
  open,
  onClose,
  onConfirm,
  categoryName,
  pendingCount,
  isLoading,
}) {
  const [comment, setComment] = useState('')

  const handleConfirm = () => {
    onConfirm(comment.trim())
    setComment('')
  }

  const handleClose = () => {
    setComment('')
    onClose()
  }

  return (
    <Dialog
      open={open}
      onClose={!isLoading ? handleClose : undefined}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: 2.5 } }}
    >
      <DialogTitle sx={{ pb: 1.5 }}>
        <Stack direction="row" alignItems="center" gap={1.5}>
          <Avatar sx={{ bgcolor: 'success.50', width: 38, height: 38 }}>
            <CheckCircleOutlineIcon sx={{ color: 'success.main', fontSize: 22 }} />
          </Avatar>
          <Stack>
            <Typography variant="subtitle1" fontWeight={600} lineHeight={1.3}>
              Approve entire category
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {categoryName ?? 'All categories'}
            </Typography>
          </Stack>
        </Stack>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ pt: 2.5, pb: 1.5 }}>
        <Alert severity="info" sx={{ mb: 2.5 }}>
          This will approve{' '}
          <strong>{pendingCount?.toLocaleString()}</strong> pending error
          {pendingCount !== 1 ? 's' : ''} in{' '}
          <strong>{categoryName ?? 'all categories'}</strong>.
          Each row can still be individually rejected afterwards.
        </Alert>

        <TextField
          label="Reviewer comment (optional)"
          placeholder="e.g. Verified against Bloomberg — corrections are accurate"
          multiline
          rows={3}
          fullWidth
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          disabled={isLoading}
          helperText="This comment will be attached to all approved records"
        />
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        <Button
          onClick={handleClose}
          variant="outlined"
          disabled={isLoading}
          sx={{ borderRadius: 1.5 }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          color="success"
          disabled={isLoading || pendingCount === 0}
          startIcon={
            isLoading ? (
              <CircularProgress size={14} color="inherit" />
            ) : (
              <CheckCircleOutlineIcon />
            )
          }
          sx={{ borderRadius: 1.5, minWidth: 160 }}
        >
          {isLoading ? 'Approving…' : `Approve ${pendingCount?.toLocaleString()} errors`}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
