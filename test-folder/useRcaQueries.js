import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

import { categoriesApi, errorsApi, filesApi } from '@api'

// ─────────────────────────────────────────────────────────────────────────────
// Query keys — centralised to avoid typos across the app
// ─────────────────────────────────────────────────────────────────────────────
export const QueryKeys = {
  files: {
    all: ['files'],
    list: (params) => ['files', 'list', params],
    detail: (id) => ['files', 'detail', id],
  },
  categories: {
    byFile: (fileId) => ['categories', fileId],
  },
  errors: {
    byFile: (fileId, filters) => ['errors', fileId, filters],
  },
}

// ─────────────────────────────────────────────────────────────────────────────
// Files hooks
// ─────────────────────────────────────────────────────────────────────────────
export function useFiles(params = {}) {
  return useQuery({
    queryKey: QueryKeys.files.list(params),
    queryFn: () => filesApi.getAll(params),
    // Smart polling: stop when all files are in a terminal state
    refetchInterval: (query) => {
      const items = query.state.data?.items ?? []
      const hasActive = items.some((f) => f.status === 'processing' || f.status === 'queued')
      return hasActive ? 5_000 : false
    },
    staleTime: 3_000,
  })
}

export function useFileDetail(fileId, options = {}) {
  return useQuery({
    queryKey: QueryKeys.files.detail(fileId),
    queryFn: () => filesApi.getById(fileId),
    enabled: !!fileId,
    staleTime: 15_000,
    ...options,
  })
}

export function useUploadFile() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ formData, onProgress }) => filesApi.upload(formData, onProgress),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QueryKeys.files.all })
    },
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// Categories hooks
// ─────────────────────────────────────────────────────────────────────────────
export function useCategories(fileId) {
  return useQuery({
    queryKey: QueryKeys.categories.byFile(fileId),
    queryFn: () => categoriesApi.getByFile(fileId),
    enabled: !!fileId,
    refetchInterval: 15_000,
    staleTime: 10_000,
  })
}

export function useApproveCategory(fileId) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ category, comment }) =>
      categoriesApi.approveAll(fileId, category ?? 'all', { comment }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QueryKeys.errors.byFile(fileId) })
      queryClient.invalidateQueries({ queryKey: QueryKeys.categories.byFile(fileId) })
      queryClient.invalidateQueries({ queryKey: QueryKeys.files.detail(fileId) })
    },
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// Errors hooks
// ─────────────────────────────────────────────────────────────────────────────
export function useErrors(fileId, filters = {}) {
  return useQuery({
    queryKey: QueryKeys.errors.byFile(fileId, filters),
    queryFn: () => errorsApi.getByFile(fileId, filters),
    enabled: !!fileId,
    refetchInterval: (query) => {
      const items = query.state.data?.items ?? []
      const hasPending = items.some((e) => e.status === 'pending')
      return hasPending ? 10_000 : false
    },
    staleTime: 5_000,
    keepPreviousData: true,
  })
}

function useErrorMutation(mutationFn, fileId) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn,
    onSuccess: () => {
      // Invalidate all error pages for this file + categories + file detail
      queryClient.invalidateQueries({ queryKey: ['errors', fileId] })
      queryClient.invalidateQueries({ queryKey: QueryKeys.categories.byFile(fileId) })
      queryClient.invalidateQueries({ queryKey: QueryKeys.files.detail(fileId) })
    },
  })
}

export function useApproveError(fileId) {
  return useErrorMutation(
    ({ errorId, comment }) => errorsApi.approve(errorId, { comment }),
    fileId
  )
}

export function useRejectError(fileId) {
  return useErrorMutation(
    ({ errorId, comment }) => errorsApi.reject(errorId, { comment }),
    fileId
  )
}

export function useCorrectError(fileId) {
  return useErrorMutation(
    ({ errorId, correctedValue }) => errorsApi.correct(errorId, { correctedValue }),
    fileId
  )
}

export function useBulkUpdate(fileId) {
  return useErrorMutation(
    ({ errorIds, status, comment }) => errorsApi.bulkUpdate({ errorIds, status, comment }),
    fileId
  )
}
