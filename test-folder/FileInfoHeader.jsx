import {
  Box, Stack, Typography, Chip, Divider,
  IconButton, Button, Tooltip, Avatar, Skeleton,
} from '@mui/material'
import RefreshIcon from '@mui/icons-material/Refresh'
import DownloadIcon from '@mui/icons-material/Download'
import FileUploadIcon from '@mui/icons-material/FileUpload'
import FolderOpenIcon from '@mui/icons-material/FolderOpen'

import KpiCard from '@components/common/KpiCard'
import { filesApi } from '@api'
import { formatDate } from '@utils/formatters'

export default function FileInfoHeader({ fileInfo, isLoading, isFetching, onRefresh }) {
  const handleExport = async () => {
    if (!fileInfo) return
    try {
      const blob = await filesApi.exportCsv(fileInfo.id)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${fileInfo.fileName.replace(/\.[^/.]+$/, '')}_rca_export.csv`
      a.click()
      URL.revokeObjectURL(url)
    } catch (e) {
      console.error('Export failed', e)
    }
  }

  const handleDownload = async () => {
    if (!fileInfo) return
    try {
      const blob = await filesApi.download(fileInfo.id)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = fileInfo.fileName
      a.click()
      URL.revokeObjectURL(url)
    } catch (e) {
      console.error('Download failed', e)
    }
  }

  return (
    <Box
      sx={{
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        px: 2.5,
        py: 1.5,
        mb: 2,
        flexShrink: 0,
      }}
    >
      {/* Row 1: file name + action buttons */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1.5}>
        <Stack direction="row" alignItems="center" gap={1.5}>
          <Avatar
            variant="rounded"
            sx={{
              width: 38, height: 38, flexShrink: 0,
              bgcolor: 'primary.50', color: 'primary.main',
            }}
          >
            <FolderOpenIcon sx={{ fontSize: 20 }} />
          </Avatar>
          <Box>
            {isLoading ? (
              <Skeleton width={220} height={18} />
            ) : (
              <Typography variant="subtitle1" fontWeight={600} lineHeight={1.3}>
                {fileInfo?.fileName}
              </Typography>
            )}
            {isLoading ? (
              <Skeleton width={160} height={14} sx={{ mt: 0.25 }} />
            ) : (
              <Typography variant="caption" color="text.secondary">
                {fileInfo?.client} &nbsp;·&nbsp; {formatDate(fileInfo?.uploadedAt)} &nbsp;·&nbsp; {fileInfo?.fileSize}
              </Typography>
            )}
          </Box>
          <Chip
            label="Complete"
            size="small"
            color="success"
            variant="outlined"
            sx={{ ml: 0.5, fontWeight: 500, fontSize: 11, height: 22 }}
          />
        </Stack>

        <Stack direction="row" alignItems="center" gap={0.75}>
          <Tooltip title="Refresh">
            <IconButton size="small" onClick={onRefresh} disabled={isFetching}>
              <RefreshIcon
                fontSize="small"
                sx={{
                  fontSize: 17,
                  animation: isFetching ? 'spin 1s linear infinite' : 'none',
                  '@keyframes spin': { to: { transform: 'rotate(360deg)' } },
                }}
              />
            </IconButton>
          </Tooltip>
          <Tooltip title="Download original file">
            <IconButton size="small" onClick={handleDownload}>
              <DownloadIcon sx={{ fontSize: 17 }} />
            </IconButton>
          </Tooltip>
          <Button
            size="small"
            variant="outlined"
            startIcon={<FileUploadIcon sx={{ fontSize: 15 }} />}
            onClick={handleExport}
            sx={{ fontSize: 12, borderRadius: 1.5 }}
          >
            Export CSV
          </Button>
        </Stack>
      </Stack>

      <Divider />

      {/* Row 2: KPI stats */}
      <Stack direction="row" gap={4} mt={1.5} flexWrap="wrap">
        <KpiCard label="Total records" value={fileInfo?.totalRecords?.toLocaleString()} loading={isLoading} />
        <KpiCard label="Total errors"  value={fileInfo?.totalErrors?.toLocaleString()}  loading={isLoading} color="error.main" />
        <KpiCard label="Approved"      value={fileInfo?.approvedCount?.toLocaleString()} loading={isLoading} color="success.main" />
        <KpiCard label="Pending"       value={fileInfo?.pendingCount?.toLocaleString()}  loading={isLoading} color="warning.main" />
        <KpiCard label="Corrected"     value={fileInfo?.correctedCount?.toLocaleString()} loading={isLoading} color="info.main" />
        <KpiCard label="Rejected"      value={fileInfo?.rejectedCount?.toLocaleString()}  loading={isLoading} color="error.light" />
      </Stack>
    </Box>
  )
}
