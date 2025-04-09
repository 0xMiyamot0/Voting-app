import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Alert,
  Snackbar,
  Card,
  CardContent,
  Grid,
  Avatar,
  Chip,
  LinearProgress,
  Fade,
  Zoom,
  Fab,
  IconButton,
  Tooltip,
  Button,
} from '@mui/material';
import {
  HowToVote as VoteIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Logout as LogoutIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

// Configure axios to include credentials
axios.defaults.withCredentials = true;

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.5,
      ease: "easeOut"
    }
  })
};

function Voting() {
  const { isAuthenticated, logout } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [hasVoted, setHasVoted] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      fetchEmployees();
      checkVotingStatus();
    }
  }, [isAuthenticated]);

  const fetchEmployees = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/employees', {
        withCredentials: true
      });
      if (Array.isArray(response.data)) {
        setEmployees(response.data);
      } else {
        setError('داده‌های دریافتی نامعتبر است');
        setOpenSnackbar(true);
      }
      setLoading(false);
    } catch (error) {
      setError('خطا در دریافت لیست کارمندان: ' + error.message);
      setOpenSnackbar(true);
      setLoading(false);
    }
  };

  const checkVotingStatus = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/check-auth', {
        withCredentials: true
      });
      setHasVoted(response.data.has_voted);
    } catch (error) {
      console.error('Error checking voting status:', error);
    }
  };

  const handleToggle = (employeeId) => {
    setSelectedEmployees((prev) => {
      if (prev.includes(employeeId)) {
        return prev.filter((id) => id !== employeeId);
      } else if (prev.length < 3) {
        return [...prev, employeeId];
      }
      return prev;
    });
  };

  const handleSubmit = async () => {
    if (selectedEmployees.length !== 3) {
      setError('لطفا دقیقا 3 کارمند را انتخاب کنید');
      setOpenSnackbar(true);
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/api/vote', {
        employee_ids: selectedEmployees,
      }, {
        withCredentials: true
      });
      
      if (response.data.message) {
        setSuccess('رای شما با موفقیت ثبت شد!');
        setHasVoted(true);
        setSelectedEmployees([]);
        setOpenSnackbar(true);
      }
    } catch (error) {
      setError(error.response?.data?.error || 'خطا در ثبت رای');
      setOpenSnackbar(true);
    }
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
    setError('');
    setSuccess('');
  };

  const handleLogout = async () => {
    await logout();
    window.location.href = 'https://zimg.co';
  };

  // Group employees by department
  const groupedEmployees = employees.reduce((acc, employee) => {
    if (!acc[employee.department]) {
      acc[employee.department] = [];
    }
    acc[employee.department].push(employee);
    return acc;
  }, {});

  if (!isAuthenticated) {
    return (
      <Container maxWidth="md">
        <Fade in={true} timeout={500}>
          <Box sx={{ mt: 4 }}>
            <Alert severity="error" icon={<ErrorIcon />}>
              لطفا برای رای دادن وارد شوید
            </Alert>
          </Box>
        </Fade>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container maxWidth="md">
        <Box sx={{ mt: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <LinearProgress sx={{ width: '100%', mb: 2 }} />
          <Typography variant="body1" color="text.secondary">
            در حال بارگذاری لیست کارمندان...
          </Typography>
        </Box>
      </Container>
    );
  }

  if (hasVoted) {
    return (
      <Container maxWidth="md">
        <Fade in={true} timeout={500}>
          <Box sx={{ mt: 4 }}>
            <Card 
              elevation={0}
              sx={{ 
                p: 4, 
                textAlign: 'center',
                border: '1px solid rgba(0,0,0,0.08)',
                background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)'
              }}
            >
              <CheckCircleIcon sx={{ fontSize: 60, mb: 2, color: '#107C10' }} />
              <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
                با تشکر از رای شما!
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                رای شما با موفقیت ثبت شد. نتایج پس از پایان زمان رای‌گیری قابل مشاهده خواهد بود.
              </Typography>
              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center', gap: 2 }}>
                <Chip
                  icon={<VoteIcon />}
                  label="رای ثبت شد"
                  color="success"
                  sx={{ 
                    borderRadius: 2,
                    backgroundColor: '#107C10',
                    color: 'white',
                    '& .MuiChip-icon': { color: 'white' }
                  }}
                />
                <Button
                  variant="outlined"
                  onClick={handleLogout}
                  startIcon={<LogoutIcon />}
                  sx={{
                    borderColor: '#0078D4',
                    color: '#0078D4',
                    '&:hover': {
                      borderColor: '#106EBE',
                      backgroundColor: 'rgba(0,120,212,0.04)'
                    }
                  }}
                >
                  خروج از حساب کاربری
                </Button>
              </Box>
            </Card>
          </Box>
        </Fade>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Box sx={{ mb: 4, textAlign: 'center' }}>
            <VoteIcon sx={{ fontSize: 40, color: '#0078D4', mb: 1 }} />
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
              رای‌گیری برای بهترین کارمندان
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              لطفا 3 کارمند برتر را انتخاب کنید
            </Typography>
            <Chip
              label={`${selectedEmployees.length}/3 انتخاب شده`}
              color={selectedEmployees.length === 3 ? 'success' : 'default'}
              sx={{ 
                borderRadius: 2,
                backgroundColor: selectedEmployees.length === 3 ? '#107C10' : '#F3F2F1',
                color: selectedEmployees.length === 3 ? 'white' : '#323130'
              }}
            />
          </Box>

          {Object.entries(groupedEmployees).map(([department, deptEmployees], deptIndex) => (
            <Box key={department} sx={{ mb: 4 }}>
              <Typography 
                variant="h6" 
                sx={{ 
                  mb: 2, 
                  color: '#0078D4',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}
              >
                <BusinessIcon />
                {department}
              </Typography>
              <Grid container spacing={2}>
                <AnimatePresence>
                  {deptEmployees.map((employee, index) => (
                    <Grid item xs={12} sm={6} md={4} key={employee.id}>
                      <motion.div
                        custom={index + deptIndex * 6}
                        variants={itemVariants}
                        initial="hidden"
                        animate="visible"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Card
                          elevation={0}
                          sx={{
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            border: '1px solid',
                            borderColor: selectedEmployees.includes(employee.id) ? '#0078D4' : 'rgba(0,0,0,0.08)',
                            backgroundColor: selectedEmployees.includes(employee.id) ? 'rgba(0,120,212,0.04)' : 'white',
                            '&:hover': {
                              transform: 'translateY(-4px)',
                              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                              borderColor: '#0078D4',
                            },
                          }}
                          onClick={() => handleToggle(employee.id)}
                        >
                          <CardContent sx={{ p: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <Avatar 
                                sx={{ 
                                  bgcolor: selectedEmployees.includes(employee.id) ? '#0078D4' : '#F3F2F1',
                                  color: selectedEmployees.includes(employee.id) ? 'white' : '#323130',
                                  width: 48,
                                  height: 48
                                }}
                              >
                                <PersonIcon />
                              </Avatar>
                              <Box sx={{ flex: 1 }}>
                                <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                                  {employee.name}
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <BusinessIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                                  <Typography variant="body2" color="text.secondary">
                                    {employee.department}
                                  </Typography>
                                </Box>
                              </Box>
                              <Tooltip title={selectedEmployees.includes(employee.id) ? "انتخاب شده" : "انتخاب نشده"}>
                                <IconButton
                                  sx={{
                                    color: selectedEmployees.includes(employee.id) ? '#0078D4' : 'text.secondary',
                                    '&:hover': {
                                      backgroundColor: 'rgba(0,120,212,0.04)'
                                    }
                                  }}
                                >
                                  {selectedEmployees.includes(employee.id) ? <CheckCircleIcon /> : <PersonIcon />}
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </CardContent>
                        </Card>
                      </motion.div>
                    </Grid>
                  ))}
                </AnimatePresence>
              </Grid>
            </Box>
          ))}

          <Fab
            variant="extended"
            color="primary"
            onClick={handleSubmit}
            disabled={selectedEmployees.length !== 3}
            sx={{
              position: 'fixed',
              bottom: 32,
              right: 32,
              zIndex: 1000,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              backgroundColor: '#0078D4',
              '&:hover': {
                backgroundColor: '#106EBE',
              },
              '&.Mui-disabled': {
                backgroundColor: '#F3F2F1',
                color: '#A19F9D',
              }
            }}
            component={motion.div}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <VoteIcon />
            ثبت رای
          </Fab>
        </motion.div>
      </Box>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={error ? 'error' : 'success'}
          sx={{ 
            width: '100%',
            backgroundColor: error ? '#FDE7E9' : '#DFF6DD',
            color: error ? '#A4262C' : '#107C10',
            '& .MuiAlert-icon': {
              color: error ? '#A4262C' : '#107C10',
            }
          }}
        >
          {error || success}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default Voting; 