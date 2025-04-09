import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Link,
  Box,
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import Logo from './Logo';
import AnimatedPage from './AnimatedPage';
import { motion } from 'framer-motion';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

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

  return (
    <AnimatedPage>
      <Container maxWidth="sm">
        <Box sx={{ mt: 8 }}>
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
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
                <Typography variant="h4" component="h1" gutterBottom>
                  ورود به سیستم
                </Typography>
              </motion.div>
              {error && (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <Typography color="error" align="center" gutterBottom>
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
                    label="نام کاربری"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    margin="normal"
                    required
                    dir="rtl"
                  />
                </motion.div>
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <TextField
                    fullWidth
                    label="رمز عبور"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    margin="normal"
                    required
                    dir="rtl"
                  />
                </motion.div>
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    color="primary"
                    sx={{ mt: 3, mb: 2 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    ورود
                  </Button>
                </motion.div>
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.7 }}
                >
                  <Typography align="center" sx={{ mb: 1 }}>
                    <Link component={RouterLink} to="/forgot-password">
                      فراموشی رمز عبور
                    </Link>
                  </Typography>
                </motion.div>
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.8 }}
                >
                  <Typography align="center">
                    حساب کاربری ندارید؟{' '}
                    <Link component={RouterLink} to="/register">
                      ثبت‌نام
                    </Link>
                  </Typography>
                </motion.div>
              </form>
            </Paper>
          </motion.div>
        </Box>
      </Container>
    </AnimatedPage>
  );
}

export default Login; 