import React, { useState } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Box, 
  IconButton, 
  Menu, 
  MenuItem, 
  Avatar,
  Tooltip,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import DashboardIcon from '@mui/icons-material/Dashboard';
import BarChartIcon from '@mui/icons-material/BarChart';
import LogoutIcon from '@mui/icons-material/Logout';
import LoginIcon from '@mui/icons-material/Login';
import Logo from './Logo';

// Helper function to detect if text is English
const isEnglishText = (text) => {
  return /^[A-Za-z0-9\s.,!?@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]*$/.test(text);
};

const Navbar = () => {
  const { isAuthenticated, isAdmin, logout, user } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNavigate = (path) => {
    navigate(path);
    handleClose();
  };

  return (
    <AppBar 
      position="static" 
      elevation={0}
      sx={{ 
        borderBottom: `1px solid ${theme.palette.divider}`,
        background: 'linear-gradient(to right, #3f51b5, #5c6bc0)',
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Logo />
        </Box>
        
        <Typography 
          variant="h6" 
          component="div" 
          sx={{ 
            fontWeight: 600,
            textAlign: 'center',
            flexGrow: 1,
            display: { xs: 'none', sm: 'block' }
          }}
        >
          سیستم نظرسنجی کارمند نمونه گروه صنعتی معدنی زرین
        </Typography>
        
        <Box>
          {isAuthenticated ? (
            <>
              {isMobile ? (
                <>
                  <IconButton
                    size="large"
                    aria-label="account of current user"
                    aria-controls="menu-appbar"
                    aria-haspopup="true"
                    onClick={handleMenu}
                    color="inherit"
                  >
                    <AccountCircleIcon />
                  </IconButton>
                  <Menu
                    id="menu-appbar"
                    anchorEl={anchorEl}
                    anchorOrigin={{
                      vertical: 'bottom',
                      horizontal: 'right',
                    }}
                    keepMounted
                    transformOrigin={{
                      vertical: 'top',
                      horizontal: 'right',
                    }}
                    open={open}
                    onClose={handleClose}
                  >
                    {isAdmin && (
                      <MenuItem onClick={() => handleNavigate('/admin')}>
                        <DashboardIcon sx={{ mr: 1 }} /> پنل مدیریت
                      </MenuItem>
                    )}
                    <MenuItem onClick={() => handleNavigate('/results')}>
                      <BarChartIcon sx={{ mr: 1 }} /> نتایج
                    </MenuItem>
                    <MenuItem onClick={handleLogout}>
                      <LogoutIcon sx={{ mr: 1 }} /> خروج
                    </MenuItem>
                  </Menu>
                </>
              ) : (
                <Box sx={{ display: 'flex', gap: 1 }}>
                  {isAdmin && (
                    <Button 
                      color="inherit" 
                      onClick={() => navigate('/admin')}
                      startIcon={<DashboardIcon />}
                      sx={{ 
                        borderRadius: 2,
                        '&:hover': {
                          backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        }
                      }}
                    >
                      پنل مدیریت
                    </Button>
                  )}
                  <Button 
                    color="inherit" 
                    onClick={() => navigate('/results')}
                    startIcon={<BarChartIcon />}
                    sx={{ 
                      borderRadius: 2,
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      }
                    }}
                  >
                    نتایج
                  </Button>
                  <Button 
                    color="inherit" 
                    onClick={handleLogout}
                    startIcon={<LogoutIcon />}
                    sx={{ 
                      borderRadius: 2,
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      }
                    }}
                  >
                    خروج
                  </Button>
                </Box>
              )}
            </>
          ) : (
            <Button 
              color="inherit" 
              onClick={() => navigate('/login')}
              startIcon={<LoginIcon />}
              sx={{ 
                borderRadius: 2,
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                }
              }}
            >
              ورود
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar; 