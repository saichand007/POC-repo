import { useRef, useState } from 'react'
import {
  Box, Button, MenuItem, Select, Stack, Typography,
  LinearProgress, Alert, FormControl, InputLabel,
} from '@mui/material'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import { useUploadFile } from '@hooks/useRcaQueries'

const CLIENTS = ['BlackRock', 'Vanguard', 'Fidelity', 'JP Morgan', 'Goldman Sachs']
const ACCEPT = '.csv,.xlsx,.json'

export default function FileUploadZone() {
  const inputRef = useRef(null)
  const [client, setClient] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const [progress, setProgress] = useState(0)
  const [successMsg, setSuccessMsg] = useState('')
  const uploadMutation = useUploadFile()

  const handleFiles = (files) => {
    const file = files[0]
    if (!file) return
    if (!client) { alert('Please select a client first.'); return }

    const formData = new FormData()
    formData.append('file', file)
    formData.append('client', client)

    setProgress(0)
    setSuccessMsg('')

    uploadMutation.mutate(
      { formData, onProgress: setProgress },
      {
        onSuccess: () => {
          setSuccessMsg(`${file.name} uploaded — AI agent is processing`)
          setProgress(0)
          setClient('')
          if (inputRef.current) inputRef.current.value = ''
        },
        onError: () => setProgress(0),
      }
    )
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    handleFiles(e.dataTransfer.files)
  }

  return (
    <Box>
      {successMsg && (
        <Alert severity="success" onClose={() => setSuccessMsg('')} sx={{ mb: 2 }}>
          {successMsg}
        </Alert>
      )}
      {uploadMutation.isError && (
        <Alert severity="error" onClose={() => uploadMutation.reset()} sx={{ mb: 2 }}>
          {uploadMutation.error?.message ?? 'Upload failed'}
        </Alert>
      )}

      <Box
        onClick={() => !uploadMutation.isPending && inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        sx={{
          border: '1.5px dashed',
          borderColor: dragOver ? 'primary.main' : 'grey.300',
          borderRadius: 2,
          bgcolor: dragOver ? 'primary.50' : 'background.paper',
          px: 3, py: 2.5,
          display: 'flex',
          alignItems: 'center',
          gap: 3,
          cursor: uploadMutation.isPending ? 'not-allowed' : 'pointer',
          transition: 'border-color .15s, background .15s',
          '&:hover': { borderColor: 'primary.main', bgcolor: 'primary.50' },
        }}
      >
        <Box
          sx={{
            width: 44, height: 44, borderRadius: 2, flexShrink: 0,
            bgcolor: 'primary.50', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <CloudUploadIcon sx={{ color: 'primary.main', fontSize: 22 }} />
        </Box>

        <Box sx={{ flex: 1 }}>
          <Typography variant="body2" fontWeight={500}>
            Upload client data file
          </Typography>
          <Typography variant="caption" color="text.secondary">
            CSV · XLSX · JSON &nbsp;·&nbsp; max 50 MB &nbsp;·&nbsp; drag & drop or click to browse
          </Typography>
          {uploadMutation.isPending && (
            <Box sx={{ mt: 1 }}>
              <LinearProgress variant="determinate" value={progress} sx={{ borderRadius: 1 }} />
              <Typography variant="caption" color="primary.main" sx={{ mt: 0.5, display: 'block' }}>
                Uploading… {progress}%
              </Typography>
            </Box>
          )}
        </Box>

        {/* Client selector + button — stop propagation so click doesn't re-trigger input */}
        <Stack direction="row" gap={1.5} alignItems="center" onClick={(e) => e.stopPropagation()}>
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel sx={{ fontSize: 13 }}>Select client</InputLabel>
            <Select
              value={client}
              label="Select client"
              onChange={(e) => setClient(e.target.value)}
              sx={{ fontSize: 13, borderRadius: 1.5 }}
            >
              {CLIENTS.map((c) => (
                <MenuItem key={c} value={c} sx={{ fontSize: 13 }}>
                  {c}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button
            variant="contained"
            size="small"
            disabled={!client || uploadMutation.isPending}
            onClick={() => inputRef.current?.click()}
            sx={{ whiteSpace: 'nowrap', borderRadius: 1.5, px: 2 }}
          >
            {uploadMutation.isPending ? 'Uploading…' : 'Upload & run AI'}
          </Button>
        </Stack>
      </Box>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        style={{ display: 'none' }}
        onChange={(e) => handleFiles(e.target.files)}
      />
    </Box>
  )
}
