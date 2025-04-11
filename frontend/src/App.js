import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/Login';
import AdminPanel from './components/AdminPanel';
import Voting from './components/Voting';
import Results from './components/Results';
import Navbar from './components/Navbar';
import './fonts.css';
import theme from './theme';

// Extend the theme with RTL support and custom font
const extendedTheme = {
  ...theme,
  direction: 'rtl',
  typography: {
    ...theme.typography,
    fontFamily: 'IRANSansXFaNum, Roboto, Arial',
    h1: { fontFamily: 'IRANSansXFaNum, Roboto, Arial', textAlign: 'right' },
    h2: { fontFamily: 'IRANSansXFaNum, Roboto, Arial', textAlign: 'right' },
    h3: { fontFamily: 'IRANSansXFaNum, Roboto, Arial', textAlign: 'right' },
    h4: { fontFamily: 'IRANSansXFaNum, Roboto, Arial', textAlign: 'right' },
    h5: { fontFamily: 'IRANSansXFaNum, Roboto, Arial', textAlign: 'right' },
    h6: { fontFamily: 'IRANSansXFaNum, Roboto, Arial', textAlign: 'right' },
    body1: { fontFamily: 'IRANSansXFaNum, Roboto, Arial', textAlign: 'right' },
    body2: { fontFamily: 'IRANSansXFaNum, Roboto, Arial', textAlign: 'right' },
    button: { fontFamily: 'IRANSansXFaNum, Roboto, Arial' },
    caption: { fontFamily: 'IRANSansXFaNum, Roboto, Arial', textAlign: 'right' },
    overline: { fontFamily: 'IRANSansXFaNum, Roboto, Arial', textAlign: 'right' },
  },
  components: {
    ...theme.components,
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          fontFamily: 'IRANSansXFaNum, Roboto, Arial',
          backgroundColor: theme.palette.background.default,
          direction: 'rtl',
        },
        // Add global styles for English text
        '.english-text': {
          direction: 'ltr',
          textAlign: 'left',
          fontFamily: 'Roboto, Arial, sans-serif',
        },
        // Add global styles for Persian text
        '.persian-text': {
          direction: 'rtl',
          textAlign: 'right',
          fontFamily: 'IRANSansXFaNum, Arial, sans-serif',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: theme.palette.primary.main,
          boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.1)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 600,
        },
        contained: {
          boxShadow: '0 4px 14px 0 rgba(63, 81, 181, 0.39)',
          '&:hover': {
            boxShadow: '0 6px 20px 0 rgba(63, 81, 181, 0.5)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.08)',
          border: `1px solid ${theme.palette.divider}`,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.05)',
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
    MuiInputLabel: {
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
            fontFamily: 'Roboto, Arial, sans-serif',
          },
          '&.persian-text': {
            textAlign: 'right',
            direction: 'rtl',
            fontFamily: 'IRANSansXFaNum, Arial, sans-serif',
          },
        },
      },
    },
  },
};

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        backgroundColor: extendedTheme.palette.background.default
      }}>
        <div style={{ 
          width: '50px', 
          height: '50px', 
          border: `5px solid ${extendedTheme.palette.primary.light}`,
          borderTop: `5px solid ${extendedTheme.palette.primary.main}`,
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }
  
  return isAuthenticated ? children : <Navigate to="/login" />;
};

const AdminRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        backgroundColor: extendedTheme.palette.background.default
      }}>
        <div style={{ 
          width: '50px', 
          height: '50px', 
          border: `5px solid ${extendedTheme.palette.primary.light}`,
          borderTop: `5px solid ${extendedTheme.palette.primary.main}`,
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }
  
  return isAuthenticated && isAdmin ? children : <Navigate to="/" />;
};

function App() {
  return (
    <ThemeProvider theme={extendedTheme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Navbar />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminPanel />
                </AdminRoute>
              }
            />
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <Voting />
                </PrivateRoute>
              }
            />
            <Route
              path="/results"
              element={
                <PrivateRoute>
                  <Results />
                </PrivateRoute>
              }
            />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App; 