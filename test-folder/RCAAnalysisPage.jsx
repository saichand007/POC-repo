import { useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  Box, Stack, Typography, Chip, Alert, Button,
  IconButton, Tooltip, Paper,
} from '@mui/material'
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt'
import ThumbDownAltIcon from '@mui/icons-material/ThumbDownAlt'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import { MaterialReactTable, useMaterialReactTable } from 'material-react-table'

import PageHeader from '@components/common/PageHeader'
import StatusBadge from '@components/common/StatusBadge'
import ExpandableCell from '@components/common/ExpandableCell'
import FileInfoHeader from '@components/rca/FileInfoHeader'
import CategorySidebar from '@components/rca/CategorySidebar'
import AISolutionCell from '@components/rca/AISolutionCell'
import ApproveCategoryDialog from '@components/rca/ApproveCategoryDialog'
import {
  useFileDetail,
  useErrors,
  useApproveError,
  useRejectError,
  useCorrectError,
  useBulkUpdate,
  useApproveCategory,
  useCategories,
} from '@hooks/useRcaQueries'

export default function RCAAnalysisPage() {
  const { fileId } = useParams()

  const [selectedCategory, setSelectedCategory] = useState(null)
  const [rowSelection, setRowSelection]         = useState({})
  const [approveDlgOpen, setApproveDlgOpen]     = useState(false)

  // ── Queries ──────────────────────────────────────────────────────────────
  const fileQuery = useFileDetail(fileId)
  const errorsQuery = useErrors(fileId, selectedCategory ? { category: selectedCategory } : {})
  const categoriesQuery = useCategories(fileId)

  const errors = errorsQuery.data?.items ?? []

  // ── Mutations ─────────────────────────────────────────────────────────────
  const approveMutation      = useApproveError(fileId)
  const rejectMutation       = useRejectError(fileId)
  const correctMutation      = useCorrectError(fileId)
  const bulkMutation         = useBulkUpdate(fileId)
  const approveCatMutation   = useApproveCategory(fileId)

  const refreshAll = () => {
    fileQuery.refetch()
    errorsQuery.refetch()
    categoriesQuery.refetch()
  }

  // ── Pending count for the current category/all ───────────────────────────
  const pendingInSelection = useMemo(() => {
    const cats = categoriesQuery.data ?? []
    if (!selectedCategory) return cats.reduce((s, c) => s + c.pending, 0)
    return cats.find((c) => c.name === selectedCategory)?.pending ?? 0
  }, [categoriesQuery.data, selectedCategory])

  // ── Columns ───────────────────────────────────────────────────────────────
  const columns = useMemo(
    () => [
      {
        id: 'seq',
        header: '#',
        size: 48,
        enableSorting: false,
        enableColumnFilter: false,
        Cell: ({ row }) => (
          <Typography variant="caption" color="text.disabled" fontWeight={500}>
            {row.index + 1}
          </Typography>
        ),
      },
      {
        accessorKey: 'category',
        header: 'Category',
        size: 130,
        filterVariant: 'select',
        Cell: ({ cell }) => (
          <Chip
            label={cell.getValue()}
            size="small"
            sx={{
              fontSize: 11,
              height: 20,
              bgcolor: 'grey.100',
              color: 'text.secondary',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1,
              fontWeight: 500,
            }}
          />
        ),
      },
      {
        accessorKey: 'errorDescription',
        header: 'Error description',
        size: 230,
        Cell: ({ cell }) => (
          <ExpandableCell text={cell.getValue()} maxLines={2} color="text.primary" />
        ),
      },
      {
        accessorKey: 'aiSolution',
        header: 'AI solution',
        size: 210,
        enableColumnFilter: false,
        Cell: ({ row }) => (
          <AISolutionCell
            row={row}
            onSave={(id, correctedValue) =>
              correctMutation.mutate({ errorId: id, correctedValue })
            }
            disabled={row.original.status === 'approved'}
          />
        ),
      },
      {
        accessorKey: 'aiAnalysis',
        header: 'AI analysis',
        size: 230,
        Cell: ({ cell }) => (
          <ExpandableCell text={cell.getValue()} maxLines={2} />
        ),
      },
      {
        accessorKey: 'dataSource',
        header: 'Data source',
        size: 160,
        Cell: ({ cell }) => (
          <Typography variant="body2" fontSize={12} color="text.secondary" lineHeight={1.5}>
            {cell.getValue()}
          </Typography>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        size: 108,
        filterVariant: 'select',
        filterSelectOptions: ['pending', 'approved', 'rejected', 'corrected'],
        Cell: ({ cell }) => <StatusBadge status={cell.getValue()} />,
      },
      {
        id: 'actions',
        header: 'Actions',
        size: 120,
        enableSorting: false,
        enableColumnFilter: false,
        Cell: ({ row }) => {
          const { id, status } = row.original
          const busy = approveMutation.isPending || rejectMutation.isPending

          return (
            <Stack direction="row" gap={0.5} alignItems="center" flexWrap="wrap">
              {(status === 'pending' || status === 'corrected') && (
                <>
                  <Tooltip title="Approve">
                    <IconButton
                      size="small"
                      disabled={busy}
                      onClick={() => approveMutation.mutate({ errorId: id })}
                      sx={{
                        width: 28, height: 28, border: '1px solid',
                        borderColor: 'success.light', bgcolor: 'success.50',
                        color: 'success.main', borderRadius: 1.5,
                        '&:hover': { bgcolor: 'success.100' },
                      }}
                    >
                      <ThumbUpAltIcon sx={{ fontSize: 14 }} />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Reject">
                    <IconButton
                      size="small"
                      disabled={busy}
                      onClick={() => rejectMutation.mutate({ errorId: id })}
                      sx={{
                        width: 28, height: 28, border: '1px solid',
                        borderColor: 'error.light', bgcolor: 'error.50',
                        color: 'error.main', borderRadius: 1.5,
                        '&:hover': { bgcolor: 'error.100' },
                      }}
                    >
                      <ThumbDownAltIcon sx={{ fontSize: 14 }} />
                    </IconButton>
                  </Tooltip>
                </>
              )}
              {status === 'approved' && (
                <Button
                  size="small"
                  color="warning"
                  variant="outlined"
                  onClick={() => rejectMutation.mutate({ errorId: id })}
                  sx={{ fontSize: 11, py: 0.25, px: 1, borderRadius: 1, minWidth: 0, height: 26 }}
                >
                  Reject
                </Button>
              )}
              {status === 'rejected' && (
                <Button
                  size="small"
                  color="success"
                  variant="outlined"
                  onClick={() => approveMutation.mutate({ errorId: id })}
                  sx={{ fontSize: 11, py: 0.25, px: 1, borderRadius: 1, minWidth: 0, height: 26 }}
                >
                  Approve
                </Button>
              )}
            </Stack>
          )
        },
      },
    ],
    [approveMutation, rejectMutation, correctMutation]
  )

  // ── MRT table ─────────────────────────────────────────────────────────────
  const table = useMaterialReactTable({
    columns,
    data: errors,
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    state: {
      rowSelection,
      isLoading: errorsQuery.isLoading,
      showProgressBars: errorsQuery.isFetching && !errorsQuery.isLoading,
    },
    enableGlobalFilter: true,
    enableColumnFilters: true,
    enableSorting: true,
    enableHiding: true,
    enableDensityToggle: true,
    enableStickyHeader: true,
    initialState: { density: 'compact', pagination: { pageSize: 20 } },
    paginationDisplayMode: 'pages',
    muiTableContainerProps: { sx: { maxHeight: 'calc(100vh - 380px)' } },
    muiSearchTextFieldProps: { placeholder: 'Search errors, categories…', size: 'small' },
    muiTablePaperProps: {
      elevation: 0,
      sx: { border: '1px solid', borderColor: 'divider', borderRadius: 2, overflow: 'hidden' },
    },
    muiTableHeadCellProps: {
      sx: {
        fontWeight: 600, fontSize: 11, textTransform: 'uppercase',
        letterSpacing: '.04em', color: 'text.secondary',
        bgcolor: 'grey.50', borderBottom: '1px solid', borderColor: 'divider', py: 1.25,
      },
    },
    muiTableBodyCellProps: {
      sx: {
        py: 0.875, px: 1.25,
        borderBottom: '1px solid', borderColor: 'divider',
        verticalAlign: 'top',
      },
    },
    muiTableBodyRowProps: ({ row }) => ({
      sx: {
        '&:hover td': { bgcolor: 'grey.50' },
        ...(row.getIsSelected() ? { '& td': { bgcolor: 'primary.50' } } : {}),
      },
    }),
    muiPaginationProps: {
      rowsPerPageOptions: [10, 20, 50, 100],
      showFirstButton: true,
      showLastButton: true,
    },

    // ── Custom top toolbar ──────────────────────────────────────────────────
    renderTopToolbarCustomActions: ({ table }) => {
      const selectedRows = table.getSelectedRowModel().rows
      const hasSelection = selectedRows.length > 0

      return (
        <Stack direction="row" alignItems="center" gap={1} flexWrap="wrap">
          {/* Approve category / all button */}
          <Button
            size="small"
            variant="contained"
            color="success"
            startIcon={<CheckCircleOutlineIcon sx={{ fontSize: 15 }} />}
            onClick={() => setApproveDlgOpen(true)}
            disabled={pendingInSelection === 0}
            sx={{ fontSize: 12, borderRadius: 1.5, boxShadow: 'none', '&:hover': { boxShadow: 'none' } }}
          >
            Approve {selectedCategory ? `"${selectedCategory}"` : 'all'} ({pendingInSelection})
          </Button>

          {/* Bulk row actions */}
          {hasSelection && (
            <>
              <Chip
                label={`${selectedRows.length} selected`}
                size="small"
                color="primary"
                variant="outlined"
                sx={{ fontWeight: 600, fontSize: 11 }}
              />
              <Button
                size="small"
                color="success"
                variant="outlined"
                startIcon={<ThumbUpAltIcon sx={{ fontSize: 14 }} />}
                onClick={() => {
                  const ids = selectedRows.map((r) => r.original.id)
                  bulkMutation.mutate({ errorIds: ids, status: 'approved' })
                  table.resetRowSelection()
                }}
                sx={{ fontSize: 12, borderRadius: 1.5 }}
              >
                Approve selected
              </Button>
              <Button
                size="small"
                color="error"
                variant="outlined"
                startIcon={<ThumbDownAltIcon sx={{ fontSize: 14 }} />}
                onClick={() => {
                  const ids = selectedRows.map((r) => r.original.id)
                  bulkMutation.mutate({ errorIds: ids, status: 'rejected' })
                  table.resetRowSelection()
                }}
                sx={{ fontSize: 12, borderRadius: 1.5 }}
              >
                Reject selected
              </Button>
            </>
          )}
        </Stack>
      )
    },
  })

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

      <PageHeader
        crumbs={[
          { label: 'File processing', to: '/files' },
          { label: fileQuery.data?.fileName ?? 'RCA analysis', to: `/rca/${fileId}` },
        ]}
      />

      <Box
        sx={{
          flex: 1,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          p: 2.5,
          gap: 0,
        }}
      >

        {/* File info header */}
        <FileInfoHeader
          fileInfo={fileQuery.data}
          isLoading={fileQuery.isLoading}
          isFetching={fileQuery.isFetching || errorsQuery.isFetching}
          onRefresh={refreshAll}
        />

        {errorsQuery.isError && (
          <Alert
            severity="error"
            sx={{ mb: 2 }}
            action={<Button size="small" onClick={() => errorsQuery.refetch()}>Retry</Button>}
          >
            {errorsQuery.error?.message ?? 'Failed to load errors'}
          </Alert>
        )}

        {/* Two-column layout: sidebar + table */}
        <Box sx={{ flex: 1, display: 'flex', gap: 2, overflow: 'hidden', minHeight: 0 }}>

          {/* Sidebar */}
          <Paper
            elevation={0}
            sx={{
              width: 232,
              flexShrink: 0,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <CategorySidebar
              fileId={fileId}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
            />
          </Paper>

          {/* Table */}
          <Box sx={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <MaterialReactTable table={table} />
          </Box>

        </Box>
      </Box>

      {/* Approve category dialog */}
      <ApproveCategoryDialog
        open={approveDlgOpen}
        onClose={() => setApproveDlgOpen(false)}
        onConfirm={(comment) => approveCatMutation.mutate({ category: selectedCategory, comment })}
        categoryName={selectedCategory}
        pendingCount={pendingInSelection}
        isLoading={approveCatMutation.isPending}
      />

    </Box>
  )
}
