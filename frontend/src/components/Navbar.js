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
  useMediaQuery,
  Container,
  Stack,
  alpha,
  Badge
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { 
  AccountCircle as AccountCircleIcon,
  Dashboard as DashboardIcon,
  BarChart as BarChartIcon,
  Logout as LogoutIcon,
  Login as LoginIcon,
  HowToVote as VoteIcon,
  AdminPanelSettings as AdminPanelSettingsIcon,
  Info as InfoIcon,
  Home as HomeIcon,
  Menu as MenuIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import Logo from './Logo';

// Helper function to detect if text is English
const isEnglishText = (text) => {
  return /^[A-Za-z0-9\s.,!?@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]*$/.test(text);
};

const menuItems = [
  { name: 'رای‌دهی', path: '/voting' },
  { name: 'نتایج', path: '/results' },
  { name: 'درباره', path: '/about' }
];

const Navbar = () => {
  const { isAuthenticated, isAdmin, logout, user } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileMenuAnchor, setMobileMenuAnchor] = useState(null);
  const open = Boolean(anchorEl);
  const mobileMenuOpen = Boolean(mobileMenuAnchor);

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

  const handleMobileMenu = (event) => {
    setMobileMenuAnchor(event.currentTarget);
  };

  const handleMobileMenuClose = () => {
    setMobileMenuAnchor(null);
  };

  const handleNavigate = (path) => {
    navigate(path);
    handleClose();
    handleMobileMenuClose();
  };

  return (
    <AppBar 
      position="sticky" 
      elevation={0}
      sx={{ 
        background: 'transparent',
        backdropFilter: 'blur(8px)',
        borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        py: 1
      }}
    >
      <Container maxWidth="lg">
        <Toolbar disableGutters sx={{ justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Logo />
            {!isMobile && (
              <Stack direction="row" spacing={3}>
                {menuItems.map((item) => (
                  <Button
                    key={item.name}
                    component={Link}
                    to={item.path}
                    startIcon={item.icon}
                    sx={{
                      color: 'text.primary',
                      gap: 1,
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.08),
                      },
                    }}
                  >
                    {item.name}
                  </Button>
                ))}
              </Stack>
            )}
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {isMobile ? (
              <>
                {isAuthenticated && (
                  <Typography variant="subtitle2" sx={{ color: 'text.secondary', mr: 1 }}>
                    {user?.name}
                  </Typography>
                )}
                <IconButton
                  size="large"
                  onClick={handleMobileMenu}
                  color="inherit"
                  sx={{ color: 'text.primary' }}
                >
                  <MenuIcon />
                </IconButton>
                <Menu
                  anchorEl={mobileMenuAnchor}
                  open={mobileMenuOpen}
                  onClose={handleMobileMenuClose}
                  PaperProps={{
                    sx: {
                      mt: 1.5,
                      minWidth: 200,
                      borderRadius: 2,
                      boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                    }
                  }}
                >
                  {menuItems.map((item) => (
                    <MenuItem
                      key={item.name}
                      component={Link}
                      to={item.path}
                      onClick={handleMobileMenuClose}
                      sx={{
                        py: 1.5,
                        px: 2,
                        '&:hover': {
                          backgroundColor: alpha(theme.palette.primary.main, 0.08),
                        },
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        {item.icon}
                        <Typography>{item.name}</Typography>
                      </Box>
                    </MenuItem>
                  ))}
                  {isAuthenticated && (
                    <>
                      {isAdmin && (
                        <MenuItem
                          component={Link}
                          to="/admin"
                          onClick={handleMobileMenuClose}
                          sx={{
                            py: 1.5,
                            px: 2,
                            '&:hover': {
                              backgroundColor: alpha(theme.palette.primary.main, 0.08),
                            },
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <AdminPanelSettingsIcon sx={{ fontSize: 24 }} />
                            <Typography>پنل مدیریت</Typography>
                          </Box>
                        </MenuItem>
                      )}
                      <MenuItem
                        onClick={handleLogout}
                        sx={{
                          py: 1.5,
                          px: 2,
                          '&:hover': {
                            backgroundColor: alpha(theme.palette.error.main, 0.08),
                          },
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <LogoutIcon sx={{ fontSize: 24 }} />
                          <Typography>خروج</Typography>
                        </Box>
                      </MenuItem>
                    </>
                  )}
                </Menu>
              </>
            ) : (
              <>
                {isAuthenticated ? (
                  <>
                    <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                      {user?.name}
                    </Typography>
                    {isAdmin && (
                      <Button
                        variant="contained"
                        onClick={() => navigate('/admin')}
                        sx={{
                          borderRadius: 2,
                          backgroundColor: 'primary.main',
                          color: 'white',
                          '&:hover': {
                            backgroundColor: 'primary.dark',
                          },
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                          transition: 'all 0.3s ease',
                          '&:active': {
                            transform: 'scale(0.98)',
                          },
                        }}
                      >
                        پنل مدیریت
                      </Button>
                    )}
                    <Tooltip title="پروفایل کاربری">
                      <IconButton
                        onClick={handleMenu}
                        sx={{
                          width: 40,
                          height: 40,
                          backgroundColor: alpha(theme.palette.primary.main, 0.1),
                          '&:hover': {
                            backgroundColor: alpha(theme.palette.primary.main, 0.2),
                          },
                        }}
                      >
                        <PersonIcon />
                      </IconButton>
                    </Tooltip>
                    <Menu
                      anchorEl={anchorEl}
                      open={open}
                      onClose={handleClose}
                      PaperProps={{
                        sx: {
                          mt: 1.5,
                          minWidth: 200,
                          borderRadius: 2,
                          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                        }
                      }}
                    >
                      <MenuItem
                        onClick={handleLogout}
                        sx={{
                          py: 1.5,
                          px: 2,
                          '&:hover': {
                            backgroundColor: alpha(theme.palette.error.main, 0.08),
                          },
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <LogoutIcon sx={{ fontSize: 24 }} />
                          <Typography>خروج</Typography>
                        </Box>
                      </MenuItem>
                    </Menu>
                  </>
                ) : (
                  <Button
                    variant="contained"
                    onClick={() => navigate('/login')}
                    startIcon={<LoginIcon sx={{ fontSize: 20 }} />}
                    sx={{
                      borderRadius: 2,
                      backgroundColor: 'primary.main',
                      '&:hover': {
                        backgroundColor: 'primary.dark',
                      },
                    }}
                  >
                    ورود
                  </Button>
                )}
              </>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar; 