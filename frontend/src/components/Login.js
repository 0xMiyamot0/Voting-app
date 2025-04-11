import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  IconButton,
  InputAdornment,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import RefreshIcon from '@mui/icons-material/Refresh';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { useAuth } from '../context/AuthContext';
import Logo from './Logo';
import AnimatedPage from './AnimatedPage';
import { motion } from 'framer-motion';

// Helper function to detect if text is English
const isEnglishText = (text) => {
  return /^[A-Za-z0-9\s.,!?@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]*$/.test(text);
};

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [captchaText, setCaptchaText] = useState('');
  const [captchaInput, setCaptchaInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  const theme = useTheme();

  // Generate random CAPTCHA text
  const generateCaptcha = () => {
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaText(result);
  };

  // Generate initial CAPTCHA on component mount
  useEffect(() => {
    generateCaptcha();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Verify CAPTCHA
    if (captchaInput.toLowerCase() !== captchaText.toLowerCase()) {
      setError('کد امنیتی اشتباه است');
      generateCaptcha(); // Generate new CAPTCHA on failure
      setCaptchaInput(''); // Clear CAPTCHA input
      return;
    }

    try {
      const success = await login(username, password);
      if (success) {
        navigate('/');
      } else {
        setError('نام کاربری یا رمز عبور اشتباه است');
      }
    } catch (err) {
      setError('خطا در ورود به سیستم');
    }
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <AnimatedPage>
      <Box sx={{
        minHeight: 'calc(100vh - 64px)',
        width: '100%',
        position: 'absolute',
        top: 64,
        left: 0,
        right: 0,
        bottom: 0,
        background: `url('/pattern.jpg')`,
        backgroundPosition: 'center',
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          zIndex: 0,
        }
      }}>
        <Container maxWidth="sm" sx={{
          position: 'relative',
          zIndex: 1
        }}>
          <Box sx={{ 
            position: 'relative',
            zIndex: 1
          }}>
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Paper 
                elevation={3} 
                sx={{ 
                  p: 4, 
                  textAlign: 'center',
                  borderRadius: 3,
                  background: 'linear-gradient(to bottom, #ffffff, #f8f9fa)',
                  border: `1px solid ${theme.palette.divider}`,
                }}
              >
                <motion.div
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <Logo />
                </motion.div>
                <motion.div
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <Typography 
                    variant="h4" 
                    component="h1" 
                    gutterBottom
                    sx={{ 
                      fontWeight: 600,
                      color: theme.palette.primary.main,
                      mb: 3,
                      textAlign: 'center',
                      width: '100%',
                      display: 'block'
                    }}
                  >
                    ورود به سیستم
                  </Typography>
                </motion.div>
                {error && (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Typography 
                      color="error" 
                      align="center" 
                      gutterBottom
                      sx={{ 
                        bgcolor: 'rgba(244, 67, 54, 0.1)',
                        p: 1,
                        borderRadius: 1,
                        mb: 2
                      }}
                    >
                      {error}
                    </Typography>
                  </motion.div>
                )}
                <form onSubmit={handleSubmit}>
                  <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    <TextField
                      fullWidth
                      //label="Username"
                      placeholder="Enter your username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      margin="normal"
                      required
                      dir="rtl"
                      variant="outlined"
                      sx={{ 
                        mb: 2,
                        '& .MuiInputBase-input': {
                          textAlign: 'left',
                          padding: '12px 16px',
                          fontSize: '1rem',
                          transition: 'all 0.2s ease-in-out',
                        },
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '12px',
                          backgroundColor: 'rgba(255, 255, 255, 0.9)',
                          transition: 'all 0.2s ease-in-out',
                          '&:hover': {
                            backgroundColor: 'rgba(255, 255, 255, 1)',
                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                          },
                          '&.Mui-focused': {
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                          }
                        },
                        '& .MuiInputLabel-root': {
                          fontSize: '0.95rem',
                          color: theme.palette.text.secondary,
                          textAlign: 'left',
                          left: '14px',
                          right: 'auto'
                        }
                      }}
                    />
                  </motion.div>
                  <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    <TextField
                      fullWidth
                      //abel="Password"
                      placeholder="Enter your password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      margin="normal"
                      required
                      dir="rtl"
                      variant="outlined"
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              aria-label="toggle password visibility"
                              onClick={handleTogglePasswordVisibility}
                              edge="end"
                              sx={{
                                color: theme.palette.text.secondary,
                                '&:hover': {
                                  color: theme.palette.primary.main,
                                }
                              }}
                            >
                              {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                            </IconButton>
                          </InputAdornment>
                        )
                      }}
                      sx={{ 
                        mb: 2,
                        '& .MuiInputBase-input': {
                          textAlign: 'left',
                          padding: '12px 16px',
                          fontSize: '1rem',
                          transition: 'all 0.2s ease-in-out',
                        },
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '12px',
                          backgroundColor: 'rgba(255, 255, 255, 0.9)',
                          transition: 'all 0.2s ease-in-out',
                          '&:hover': {
                            backgroundColor: 'rgba(255, 255, 255, 1)',
                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                          },
                          '&.Mui-focused': {
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                          }
                        },
                        '& .MuiInputLabel-root': {
                          fontSize: '0.95rem',
                          color: theme.palette.text.secondary,
                          textAlign: 'left',
                          left: '14px',
                          right: 'auto'
                        }
                      }}
                    />
                  </motion.div>
                  <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.6 }}
                  >
                    <Box sx={{ 
                      mt: 2, 
                      mb: 2, 
                      p: 2, 
                      bgcolor: theme.palette.background.default,
                      borderRadius: 2,
                      fontFamily: 'monospace',
                      fontSize: '1.2rem',
                      letterSpacing: '3px',
                      userSelect: 'none',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      border: `1px solid ${theme.palette.divider}`,
                    }}>
                      <Typography 
                        sx={{ 
                          fontFamily: 'monospace',
                          textAlign: 'left',
                          direction: 'ltr'
                        }}
                      >
                        {captchaText}
                      </Typography>
                      <IconButton 
                        onClick={generateCaptcha}
                        size="small"
                        sx={{ color: theme.palette.primary.main }}
                      >
                        <RefreshIcon />
                      </IconButton>
                    </Box>
                    <TextField
                      fullWidth
                      //label="Security Code"
                      placeholder="Enter the code shown above"
                      value={captchaInput}
                      onChange={(e) => setCaptchaInput(e.target.value)}
                      margin="normal"
                      required
                      dir="rtl"
                      variant="outlined"
                      sx={{ 
                        mb: 2,
                        '& .MuiInputBase-input': {
                          textAlign: 'left',
                          padding: '12px 16px',
                          fontSize: '1rem',
                          transition: 'all 0.2s ease-in-out',
                        },
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '12px',
                          backgroundColor: 'rgba(255, 255, 255, 0.9)',
                          transition: 'all 0.2s ease-in-out',
                          '&:hover': {
                            backgroundColor: 'rgba(255, 255, 255, 1)',
                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                          },
                          '&.Mui-focused': {
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                          }
                        },
                        '& .MuiInputLabel-root': {
                          fontSize: '0.95rem',
                          color: theme.palette.text.secondary,
                          textAlign: 'left',
                          left: '14px',
                          right: 'auto'
                        }
                      }}
                    />
                  </motion.div>
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.7 }}
                  >
                    <Button
                      type="submit"
                      fullWidth
                      variant="contained"
                      color="primary"
                      size="large"
                      sx={{ 
                        mt: 3, 
                        mb: 2,
                        py: 1.5,
                        borderRadius: 2,
                        fontWeight: 600,
                        fontSize: '1rem',
                        boxShadow: '0 4px 14px 0 rgba(63, 81, 181, 0.39)',
                        '&:hover': {
                          boxShadow: '0 6px 20px 0 rgba(63, 81, 181, 0.5)',
                        }
                      }}
                    >
                      ورود
                    </Button>
                  </motion.div>
                </form>
              </Paper>
            </motion.div>
          </Box>
        </Container>
      </Box>
    </AnimatedPage>
  );
}

export default Login; 