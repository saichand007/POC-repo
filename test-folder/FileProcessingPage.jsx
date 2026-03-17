import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box, Stack, Typography, Chip, IconButton,
  Tooltip, LinearProgress, Alert, Button,
} from '@mui/material'
import VisibilityIcon from '@mui/icons-material/Visibility'
import DownloadIcon from '@mui/icons-material/Download'
import RefreshIcon from '@mui/icons-material/Refresh'
import { MaterialReactTable, useMaterialReactTable } from 'material-react-table'

import PageHeader from '@components/common/PageHeader'
import KpiCard from '@components/common/KpiCard'
import FileUploadZone from '@components/fileProcessing/FileUploadZone'
import { useFiles } from '@hooks/useRcaQueries'
import { filesApi } from '@api'
import { formatDate } from '@utils/formatters'

const STATUS_COLOR = {
  complete:   'success',
  processing: 'warning',
  queued:     'info',
  failed:     'error',
}

export default function FileProcessingPage() {
  const navigate = useNavigate()
  const [globalFilter, setGlobalFilter] = useState('')

  const { data, isLoading, isFetching, isError, error, refetch } = useFiles()
  const files = data?.items ?? []

  // ── KPI aggregates ──────────────────────────────────────────────────────
  const kpis = useMemo(() => {
    const total      = files.length
    const processing = files.filter((f) => f.status === 'processing').length
    const complete   = files.filter((f) => f.status === 'complete').length
    const errors     = files.reduce((s, f) => s + (f.totalErrors ?? 0), 0)
    return { total, processing, complete, errors }
  }, [files])

  // ── Download helper ─────────────────────────────────────────────────────
  const handleDownload = async (file) => {
    try {
      const blob = await filesApi.download(file.id)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = file.fileName
      a.click()
      URL.revokeObjectURL(url)
    } catch (e) {
      console.error('Download failed', e)
    }
  }

  // ── Columns ─────────────────────────────────────────────────────────────
  const columns = useMemo(() => [
    {
      accessorKey: 'fileName',
      header: 'File name',
      size: 260,
      Cell: ({ row }) => (
        <Box>
          <Typography variant="body2" fontWeight={500} color="text.primary" noWrap sx={{ maxWidth: 240 }}>
            {row.original.fileName}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {row.original.client}
          </Typography>
        </Box>
      ),
    },
    {
      accessorKey: 'fileSize',
      header: 'Size',
      size: 80,
      Cell: ({ cell }) => (
        <Typography variant="body2" color="text.secondary">
          {cell.getValue()}
        </Typography>
      ),
    },
    {
      accessorKey: 'totalRecords',
      header: 'Records',
      size: 90,
      Cell: ({ cell }) => (
        <Typography variant="body2" color="text.secondary">
          {cell.getValue()?.toLocaleString() ?? '—'}
        </Typography>
      ),
    },
    {
      accessorKey: 'uploadedAt',
      header: 'Uploaded',
      size: 140,
      Cell: ({ cell }) => (
        <Typography variant="body2" color="text.secondary">
          {formatDate(cell.getValue())}
        </Typography>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      size: 120,
      filterVariant: 'select',
      filterSelectOptions: ['complete', 'processing', 'queued', 'failed'],
      Cell: ({ cell }) => {
        const s = cell.getValue()
        return (
          <Chip
            label={s?.charAt(0).toUpperCase() + s?.slice(1)}
            size="small"
            color={STATUS_COLOR[s] ?? 'default'}
            variant="outlined"
            sx={{ fontSize: 11, fontWeight: 500, height: 22 }}
          />
        )
      },
    },
    {
      id: 'progress',
      header: 'Progress',
      size: 140,
      enableSorting: false,
      enableColumnFilter: false,
      Cell: ({ row }) => {
        const { status, totalErrors } = row.original
        if (status === 'processing') {
          return (
            <Box sx={{ minWidth: 100 }}>
              <LinearProgress sx={{ borderRadius: 1, mb: 0.5 }} />
              <Typography variant="caption" color="text.secondary">Processing…</Typography>
            </Box>
          )
        }
        if (status === 'complete') {
          return (
            <Box sx={{ minWidth: 100 }}>
              <LinearProgress variant="determinate" value={100} color="success" sx={{ borderRadius: 1, mb: 0.5 }} />
              <Typography variant="caption" color={totalErrors ? 'error.main' : 'success.main'} fontWeight={500}>
                {totalErrors ? `${totalErrors.toLocaleString()} errors` : 'No errors'}
              </Typography>
            </Box>
          )
        }
        return <Typography variant="caption" color="text.disabled">Queued</Typography>
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      size: 90,
      enableSorting: false,
      enableColumnFilter: false,
      muiTableHeadCellProps: { align: 'center' },
      muiTableBodyCellProps: { align: 'center' },
      Cell: ({ row }) => {
        const { id, status } = row.original
        return (
          <Stack direction="row" gap={0.5} justifyContent="center">
            {status === 'complete' && (
              <Tooltip title="View RCA analysis">
                <IconButton
                  size="small"
                  onClick={() => navigate(`/rca/${id}`)}
                  sx={{
                    border: '1px solid',
                    borderColor: 'primary.light',
                    bgcolor: 'primary.50',
                    color: 'primary.main',
                    borderRadius: 1.5,
                    '&:hover': { bgcolor: 'primary.100' },
                  }}
                >
                  <VisibilityIcon sx={{ fontSize: 15 }} />
                </IconButton>
              </Tooltip>
            )}
            <Tooltip title="Download file">
              <IconButton
                size="small"
                onClick={() => handleDownload(row.original)}
                sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1.5 }}
              >
                <DownloadIcon sx={{ fontSize: 15 }} />
              </IconButton>
            </Tooltip>
          </Stack>
        )
      },
    },
  ], [navigate])

  // ── MRT instance ────────────────────────────────────────────────────────
  const table = useMaterialReactTable({
    columns,
    data: files,
    state: {
      isLoading,
      showProgressBars: isFetching && !isLoading,
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
    enableGlobalFilter: true,
    enableColumnFilters: true,
    enableSorting: true,
    enableHiding: true,
    enableDensityToggle: true,
    initialState: { density: 'compact', pagination: { pageSize: 20 } },
    paginationDisplayMode: 'pages',
    muiSearchTextFieldProps: {
      placeholder: 'Search files, clients…',
      size: 'small',
    },
    muiTablePaperProps: {
      elevation: 0,
      sx: { border: '1px solid', borderColor: 'divider', borderRadius: 2 },
    },
    muiTableHeadCellProps: {
      sx: {
        fontWeight: 600, fontSize: 11, textTransform: 'uppercase',
        letterSpacing: '.04em', color: 'text.secondary',
        bgcolor: 'grey.50', borderBottom: '1px solid', borderColor: 'divider',
        py: 1.25,
      },
    },
    muiTableBodyCellProps: {
      sx: { py: 1, px: 1.5, borderBottom: '1px solid', borderColor: 'divider' },
    },
    muiTableBodyRowProps: {
      sx: { '&:hover td': { bgcolor: 'grey.50' } },
    },
    muiPaginationProps: {
      rowsPerPageOptions: [10, 20, 50],
      showFirstButton: true,
      showLastButton: true,
    },
    renderTopToolbarCustomActions: () => (
      <Stack direction="row" alignItems="center" gap={1}>
        <Tooltip title="Refresh">
          <IconButton
            size="small"
            onClick={() => refetch()}
            disabled={isFetching}
          >
            <RefreshIcon
              fontSize="small"
              sx={{
                animation: isFetching ? 'spin 1s linear infinite' : 'none',
                '@keyframes spin': { to: { transform: 'rotate(360deg)' } },
              }}
            />
          </IconButton>
        </Tooltip>
        {isFetching && !isLoading && (
          <Typography variant="caption" color="text.secondary">
            Polling…
          </Typography>
        )}
      </Stack>
    ),
  })

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <PageHeader
        crumbs={[{ label: 'File processing', to: '/files' }]}
      />

      <Box sx={{ flex: 1, overflow: 'auto', p: 2.5, display: 'flex', flexDirection: 'column', gap: 2 }}>

        {isError && (
          <Alert severity="error" action={<Button size="small" onClick={() => refetch()}>Retry</Button>}>
            {error?.message ?? 'Failed to load files'}
          </Alert>
        )}

        {/* Upload */}
        <FileUploadZone />

        {/* KPIs */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 1.5,
          }}
        >
          {[
            { label: 'Total files',   value: kpis.total,                                    color: undefined },
            { label: 'Processing',    value: kpis.processing,                               color: 'warning.main' },
            { label: 'Complete',      value: kpis.complete,                                 color: 'success.main' },
            { label: 'Total errors',  value: kpis.errors.toLocaleString(),                  color: 'error.main' },
          ].map((k) => (
            <Box
              key={k.label}
              sx={{
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
                p: 2,
              }}
            >
              <KpiCard label={k.label} value={k.value} color={k.color} loading={isLoading} />
            </Box>
          ))}
        </Box>

        {/* File table */}
        <MaterialReactTable table={table} />

      </Box>
    </Box>
  )
}
