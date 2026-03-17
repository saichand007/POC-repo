import { Component } from 'react'
import {
  Box, Typography, Button, Paper, Stack,
} from '@mui/material'
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline'
import RefreshIcon from '@mui/icons-material/Refresh'

/**
 * ErrorBoundary
 * Catches render errors in any child subtree and shows a graceful fallback.
 * Usage:
 *   <ErrorBoundary>
 *     <YourComponent />
 *   </ErrorBoundary>
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo })
    // Wire up to your error monitoring (Sentry, Datadog, etc.)
    if (process.env.NODE_ENV === 'production') {
      // window.Sentry?.captureException(error, { extra: errorInfo })
      console.error('[ErrorBoundary]', error, errorInfo)
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
  }

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 4,
          bgcolor: 'background.default',
        }}
      >
        <Paper
          elevation={0}
          sx={{
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 3,
            p: 4,
            maxWidth: 480,
            width: '100%',
            textAlign: 'center',
          }}
        >
          <Box
            sx={{
              width: 56, height: 56, borderRadius: '50%',
              bgcolor: 'error.50', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              mx: 'auto', mb: 2.5,
            }}
          >
            <ErrorOutlineIcon sx={{ fontSize: 28, color: 'error.main' }} />
          </Box>

          <Typography variant="h6" fontWeight={600} mb={1}>
            Something went wrong
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3} lineHeight={1.7}>
            An unexpected error occurred in this section. Your other work is unaffected.
          </Typography>

          {process.env.NODE_ENV !== 'production' && this.state.error && (
            <Paper
              elevation={0}
              sx={{
                bgcolor: 'grey.50', border: '1px solid', borderColor: 'divider',
                borderRadius: 1.5, p: 2, mb: 3, textAlign: 'left',
              }}
            >
              <Typography
                variant="caption"
                fontFamily="monospace"
                color="error.main"
                component="pre"
                sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', m: 0 }}
              >
                {this.state.error.toString()}
              </Typography>
            </Paper>
          )}

          <Stack direction="row" gap={1.5} justifyContent="center">
            <Button
              variant="contained"
              size="small"
              startIcon={<RefreshIcon />}
              onClick={this.handleReset}
              sx={{ borderRadius: 1.5 }}
            >
              Try again
            </Button>
            <Button
              variant="outlined"
              size="small"
              onClick={() => window.location.assign('/files')}
              sx={{ borderRadius: 1.5 }}
            >
              Go to dashboard
            </Button>
          </Stack>
        </Paper>
      </Box>
    )
  }
}
