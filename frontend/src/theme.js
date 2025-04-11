import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  direction: 'rtl',
  palette: {
    primary: {
      main: '#3f51b5', // Indigo
      light: '#757de8',
      dark: '#002984',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#f50057', // Pink
      light: '#ff4081',
      dark: '#bb002f',
      contrastText: '#ffffff',
    },
    background: {
      default: '#f5f7fa',
      paper: '#ffffff',
    },
    text: {
      primary: '#2c3e50',
      secondary: '#546e7a',
    },
    error: {
      main: '#f44336',
    },
    warning: {
      main: '#ff9800',
    },
    info: {
      main: '#2196f3',
    },
    success: {
      main: '#4caf50',
    },
  },
  typography: {
    fontFamily: '"IRANSansXFaNum", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 500,
      fontSize: '2.5rem',
      textAlign: 'right',
    },
    h2: {
      fontWeight: 500,
      fontSize: '2rem',
      textAlign: 'right',
    },
    h3: {
      fontWeight: 500,
      fontSize: '1.75rem',
      textAlign: 'right',
    },
    h4: {
      fontWeight: 500,
      fontSize: '1.5rem',
      textAlign: 'right',
    },
    h5: {
      fontWeight: 500,
      fontSize: '1.25rem',
      textAlign: 'right',
    },
    h6: {
      fontWeight: 500,
      fontSize: '1rem',
      textAlign: 'right',
    },
    body1: {
      textAlign: 'right',
    },
    body2: {
      textAlign: 'right',
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '8px 16px',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
          },
        },
        contained: {
          '&:hover': {
            boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.15)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.05)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.08)',
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          textAlign: 'right',
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: {
          textAlign: 'right',
        },
      },
    },
    MuiTypography: {
      styleOverrides: {
        root: {
          '&.english-text': {
            textAlign: 'left',
            direction: 'ltr',
            fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
          },
        },
      },
    },
  },
});

export default theme; 