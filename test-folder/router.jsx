import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Box, CircularProgress } from '@mui/material'

import AppShell from '@components/common/AppShell'
import ErrorBoundary from '@components/common/ErrorBoundary'

const FileProcessingPage = lazy(() => import('@pages/FileProcessingPage'))
const RCAAnalysisPage    = lazy(() => import('@pages/RCAAnalysisPage'))
const NotFoundPage       = lazy(() => import('@pages/NotFoundPage'))

function PageLoader() {
  return (
    <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <CircularProgress size={28} thickness={3} />
    </Box>
  )
}

function Page({ component: Component }) {
  return (
    <ErrorBoundary>
      <Suspense fallback={<PageLoader />}>
        <Component />
      </Suspense>
    </ErrorBoundary>
  )
}

export default function AppRouter() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<Navigate to="/files" replace />} />
        <Route path="/files"       element={<Page component={FileProcessingPage} />} />
        <Route path="/rca/:fileId" element={<Page component={RCAAnalysisPage} />} />
        <Route path="/rca"         element={<Navigate to="/files" replace />} />
        <Route path="*"            element={<Page component={NotFoundPage} />} />
      </Route>
    </Routes>
  )
}
