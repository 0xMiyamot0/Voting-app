import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/Login';
import AdminPanel from './components/AdminPanel';
import Voting from './components/Voting';
import Results from './components/Results';
import Navbar from './components/Navbar';
import './fonts.css';

const theme = createTheme({
  direction: 'rtl',
  typography: {
    fontFamily: 'IRANSansXFaNum, Arial',
    h1: { fontFamily: 'IRANSansXFaNum, Arial' },
    h2: { fontFamily: 'IRANSansXFaNum, Arial' },
    h3: { fontFamily: 'IRANSansXFaNum, Arial' },
    h4: { fontFamily: 'IRANSansXFaNum, Arial' },
    h5: { fontFamily: 'IRANSansXFaNum, Arial' },
    h6: { fontFamily: 'IRANSansXFaNum, Arial' },
    body1: { fontFamily: 'IRANSansXFaNum, Arial' },
    body2: { fontFamily: 'IRANSansXFaNum, Arial' },
    button: { fontFamily: 'IRANSansXFaNum, Arial' },
    caption: { fontFamily: 'IRANSansXFaNum, Arial' },
    overline: { fontFamily: 'IRANSansXFaNum, Arial' },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          fontFamily: 'IRANSansXFaNum, Arial',
        },
      },
    },
  },
});

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  return isAuthenticated ? children : <Navigate to="/login" />;
};

const AdminRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  return isAuthenticated && isAdmin ? children : <Navigate to="/" />;
};

function App() {
  return (
    <ThemeProvider theme={theme}>
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