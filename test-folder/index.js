import { createTheme, alpha } from '@mui/material/styles'

const BASE_FONT = '"IBM Plex Sans", system-ui, -apple-system, sans-serif'

const palette = {
  primary:   { main: '#1558D6', light: '#4A7DE8', dark: '#0D47BA', contrastText: '#fff' },
  secondary: { main: '#0D7A4E', light: '#3B9E72', dark: '#085C3A', contrastText: '#fff' },
  error:     { main: '#C42B2B', light: '#E05555', dark: '#991F1F' },
  warning:   { main: '#B45309', light: '#D97706', dark: '#854D0E' },
  info:      { main: '#0369A1', light: '#0EA5E9', dark: '#075985' },
  success:   { main: '#0D7A4E', light: '#3B9E72', dark: '#085C3A' },
  grey: {
    50: '#F8F9FB', 100: '#F1F3F6', 200: '#E2E6EA',
    300: '#CBD2D9', 400: '#9AA5B1', 500: '#6B7684',
    600: '#52606D', 700: '#3D4F5C', 800: '#243B53', 900: '#102A43',
  },
  background: { default: '#F8F9FB', paper: '#FFFFFF' },
  text: { primary: '#1A2332', secondary: '#52606D', disabled: '#9AA5B1' },
  divider: 'rgba(0,0,0,0.08)',
}

const theme = createTheme({
  palette,

  typography: {
    fontFamily: BASE_FONT,
    fontSize: 13,
    h1: { fontSize: '2rem',   fontWeight: 600, lineHeight: 1.2 },
    h2: { fontSize: '1.5rem', fontWeight: 600, lineHeight: 1.3 },
    h3: { fontSize: '1.25rem',fontWeight: 600, lineHeight: 1.3 },
    h4: { fontSize: '1.1rem', fontWeight: 600, lineHeight: 1.4 },
    h5: { fontSize: '1rem',   fontWeight: 600, lineHeight: 1.4 },
    h6: { fontSize: '.9rem',  fontWeight: 600, lineHeight: 1.4 },
    subtitle1: { fontSize: '0.9rem', fontWeight: 500, lineHeight: 1.5 },
    subtitle2: { fontSize: '0.8rem', fontWeight: 500, lineHeight: 1.5 },
    body1:     { fontSize: '0.875rem', lineHeight: 1.6 },
    body2:     { fontSize: '0.8125rem', lineHeight: 1.6 },
    caption:   { fontSize: '0.75rem',  lineHeight: 1.5 },
    overline:  { fontSize: '0.7rem', fontWeight: 600, letterSpacing: '.08em', textTransform: 'uppercase' },
    button:    { fontWeight: 500, textTransform: 'none', letterSpacing: 0 },
  },

  shape: { borderRadius: 8 },

  shadows: [
    'none',
    '0 1px 2px rgba(0,0,0,0.06)',
    '0 1px 4px rgba(0,0,0,0.08)',
    '0 2px 8px rgba(0,0,0,0.08)',
    '0 4px 12px rgba(0,0,0,0.08)',
    '0 4px 16px rgba(0,0,0,0.10)',
    ...Array(19).fill('none'),
  ],

  components: {
    MuiCssBaseline: {
      styleOverrides: {
        '*': { boxSizing: 'border-box' },
        'html, body, #root': { height: '100%' },
        '#root-loader': { display: 'none' },
        '::-webkit-scrollbar': { width: 6, height: 6 },
        '::-webkit-scrollbar-track': { background: 'transparent' },
        '::-webkit-scrollbar-thumb': { background: '#CBD2D9', borderRadius: 3 },
        '::-webkit-scrollbar-thumb:hover': { background: '#9AA5B1' },
      },
    },

    MuiButton: {
      defaultProps: { disableElevation: true, size: 'small' },
      styleOverrides: {
        root: { borderRadius: 7, fontWeight: 500, fontSize: 13 },
        sizeSmall: { padding: '5px 12px', fontSize: 12 },
        sizeMedium: { padding: '7px 16px' },
      },
    },

    MuiIconButton: {
      defaultProps: { size: 'small' },
      styleOverrides: {
        root: { borderRadius: 7 },
        sizeSmall: { padding: 5 },
      },
    },

    MuiChip: {
      styleOverrides: {
        root: { fontWeight: 500, fontSize: 11 },
        sizeSmall: { height: 22, fontSize: 11 },
      },
    },

    MuiPaper: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: { backgroundImage: 'none' },
        outlined: { borderColor: palette.divider },
      },
    },

    MuiCard: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: { border: `1px solid ${palette.divider}`, borderRadius: 12 },
      },
    },

    MuiTextField: {
      defaultProps: { size: 'small', variant: 'outlined' },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 7,
            fontSize: 13,
            '& fieldset': { borderColor: '#CBD2D9' },
            '&:hover fieldset': { borderColor: '#9AA5B1' },
            '&.Mui-focused fieldset': { borderColor: palette.primary.main, borderWidth: 1.5 },
          },
        },
      },
    },

    MuiSelect: {
      defaultProps: { size: 'small' },
      styleOverrides: {
        root: { borderRadius: 7, fontSize: 13 },
      },
    },

    MuiDialog: {
      styleOverrides: {
        paper: { borderRadius: 14 },
      },
    },

    MuiTooltip: {
      defaultProps: { arrow: true, placement: 'top' },
      styleOverrides: {
        tooltip: {
          fontSize: 11,
          backgroundColor: palette.grey[800],
          borderRadius: 5,
          padding: '4px 8px',
        },
        arrow: { color: palette.grey[800] },
      },
    },

    MuiTableCell: {
      styleOverrides: {
        head: {
          fontWeight: 600,
          fontSize: 11,
          textTransform: 'uppercase',
          letterSpacing: '.04em',
          color: palette.text.secondary,
          backgroundColor: palette.grey[50],
          borderBottom: `1px solid ${palette.divider}`,
          padding: '9px 12px',
          whiteSpace: 'nowrap',
        },
        body: {
          fontSize: 13,
          borderBottom: `1px solid ${palette.divider}`,
          padding: '9px 12px',
          verticalAlign: 'top',
        },
      },
    },

    MuiLinearProgress: {
      styleOverrides: {
        root: { borderRadius: 2, height: 4 },
      },
    },

    MuiAlert: {
      styleOverrides: {
        root: { borderRadius: 8, fontSize: 13 },
        standard: { border: '1px solid' },
      },
    },

    MuiDivider: {
      styleOverrides: {
        root: { borderColor: palette.divider },
      },
    },

    MuiBadge: {
      styleOverrides: {
        badge: { fontWeight: 600, fontSize: 10 },
      },
    },
  },
})

export default theme
