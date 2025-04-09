import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const { isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          سیستم رای‌گیری
        </Typography>
        <Box>
          {isAuthenticated ? (
            <>
              {isAdmin && (
                <Button color="inherit" onClick={() => navigate('/admin')}>
                  پنل مدیریت
                </Button>
              )}
              <Button color="inherit" onClick={() => navigate('/results')}>
                نتایج
              </Button>
              <Button color="inherit" onClick={handleLogout}>
                خروج
              </Button>
            </>
          ) : (
            <Button color="inherit" onClick={() => navigate('/login')}>
              ورود
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar; 