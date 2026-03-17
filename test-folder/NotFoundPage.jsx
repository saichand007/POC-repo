import { useNavigate } from 'react-router-dom'
import {
  Box, Typography, Button, Stack, Paper,
} from '@mui/material'
import FolderOpenIcon from '@mui/icons-material/FolderOpen'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'

export default function NotFoundPage() {
  const navigate = useNavigate()

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
          p: 5,
          maxWidth: 400,
          width: '100%',
          textAlign: 'center',
        }}
      >
        <Typography
          variant="h1"
          fontWeight={700}
          sx={{ fontSize: '4rem', color: 'grey.200', lineHeight: 1, mb: 1 }}
        >
          404
        </Typography>

        <Box
          sx={{
            width: 52, height: 52, borderRadius: '50%',
            bgcolor: 'primary.50', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            mx: 'auto', mb: 2,
          }}
        >
          <FolderOpenIcon sx={{ fontSize: 24, color: 'primary.main' }} />
        </Box>

        <Typography variant="h6" fontWeight={600} mb={1}>
          Page not found
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={3.5} lineHeight={1.7}>
          The page you are looking for doesn't exist or has been moved.
        </Typography>

        <Stack direction="row" gap={1.5} justifyContent="center">
          <Button
            variant="outlined"
            size="small"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(-1)}
            sx={{ borderRadius: 1.5 }}
          >
            Go back
          </Button>
          <Button
            variant="contained"
            size="small"
            onClick={() => navigate('/files')}
            sx={{ borderRadius: 1.5 }}
          >
            File processing
          </Button>
        </Stack>
      </Paper>
    </Box>
  )
}
