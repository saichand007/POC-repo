import { Chip } from '@mui/material'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty'
import CancelIcon from '@mui/icons-material/Cancel'
import EditNoteIcon from '@mui/icons-material/EditNote'

const CONFIG = {
  pending:   { label: 'Pending',   color: 'warning', Icon: HourglassEmptyIcon },
  approved:  { label: 'Approved',  color: 'success', Icon: CheckCircleIcon },
  rejected:  { label: 'Rejected',  color: 'error',   Icon: CancelIcon },
  corrected: { label: 'Corrected', color: 'info',    Icon: EditNoteIcon },
}

export default function StatusBadge({ status }) {
  const { label, color, Icon } = CONFIG[status] ?? CONFIG.pending
  return (
    <Chip
      icon={<Icon sx={{ fontSize: '13px !important' }} />}
      label={label}
      size="small"
      color={color}
      variant="outlined"
      sx={{
        fontSize: 11,
        fontWeight: 500,
        height: 22,
        '& .MuiChip-icon': { ml: '6px' },
      }}
    />
  )
}
