import React, { useState, useEffect, useContext } from 'react';
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
  Rating,
  Paper,
  Divider,
  Stepper,
  Step,
  StepLabel,
  useTheme,
  useMediaQuery,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  DialogContentText,
} from '@mui/material';
import {
  HowToVote as VoteIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Logout as LogoutIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  ArrowForward as ArrowForwardIcon,
  ArrowBack as ArrowBackIcon,
  Star as StarIcon,
  EmojiEvents as EmojiEventsIcon,
  Close as CloseIcon,
  Edit as EditIcon,
  StarBorder as StarBorderIcon,
  StarHalf as StarHalfIcon,
  ExpandMore as ExpandMoreIcon,
  Folder as FolderIcon,
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

const CRITERIA = [
  { id: 1, name: 'حسن رفتار و حفظ شئونات', icon: <PersonIcon /> },
  { id: 2, name: 'همکاری و مهارت های ارتباطی', icon: <PersonIcon /> },
  { id: 3, name: 'دانش و علاقه به یادگیری', icon: <PersonIcon /> },
  { id: 4, name: 'کیفیت کار و سرعت عمل', icon: <PersonIcon /> },
  { id: 5, name: 'پیشبرد به موقع کارهای محوله', icon: <PersonIcon /> },
  { id: 6, name: 'مسئولیت پذیری و جدیت در کار', icon: <PersonIcon /> },
];

// Custom Rating Component
const CustomRating = ({ value, onChange, max = 5 }) => {
  const [hover, setHover] = useState(-1);
  const [hoverLabel, setHoverLabel] = useState('');
  
  const ratingLabels = {
    5: 'عالی',
    4: 'خوب',
    3: 'متوسط',
    2: 'ضعیف',
    1: 'بد'
  };
  
  const handleMouseMove = (event, index) => {
    const ratingValue = max - index;
    setHover(ratingValue);
    setHoverLabel(ratingLabels[ratingValue]);
  };
  
  const handleMouseLeave = () => {
    setHover(-1);
    setHoverLabel('');
  };
  
  const handleClick = (index) => {
    const ratingValue = max - index;
    onChange(null, ratingValue);
  };
  
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        {[...Array(max)].map((_, index) => {
          const ratingValue = max - index;
          const isFilled = hover >= ratingValue || value >= ratingValue;
          
          return (
            <Box
              key={index}
              sx={{ 
                position: 'relative',
                display: 'inline-block',
                cursor: 'pointer',
                '&:hover': {
                  '& .star-icon': {
                    transform: 'scale(1.1)',
                  }
                }
              }}
              onMouseMove={(e) => handleMouseMove(e, index)}
              onMouseLeave={handleMouseLeave}
              onClick={() => handleClick(index)}
            >
              <StarIcon 
                className="star-icon"
                sx={{ 
                  fontSize: '2rem',
                  color: isFilled ? '#FFD700' : 'rgba(0,0,0,0.26)',
                  transition: 'all 0.2s ease',
                  position: 'relative',
                  zIndex: 1
                }} 
              />
            </Box>
          );
        })}
      </Box>
      {hoverLabel && (
        <Typography 
          variant="body2" 
          sx={{ 
            color: '#666',
            minHeight: '20px',
            fontWeight: 500
          }}
        >
          {hoverLabel}
        </Typography>
      )}
    </Box>
  );
};

function Voting() {
  const { isAuthenticated, logout, isAdmin } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [groupedEmployees, setGroupedEmployees] = useState({});
  const [ratings, setRatings] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [hasVoted, setHasVoted] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeStep, setActiveStep] = useState(0);
  const [currentEmployeeIndex, setCurrentEmployeeIndex] = useState(0);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [ous, setOUs] = useState([
    { name: 'zmg', label: 'زرین معدن آسیا', logo: '/logos/zmg.webp', active_users: 0 },
    { name: 'airma', label: 'آیرما', logo: '/logos/airma.webp', active_users: 0 },
    { name: 'bazargani', label: 'بازرگانی', logo: '/logos/bazargani.webp', active_users: 0 },
    { name: 'etemad', label: 'اعتماد ایرانیان', logo: '/logos/etemad.webp', active_users: 0 },
    { name: 'flat', label: 'فلات زرین کیمیا', logo: '/logos/flat.webp', active_users: 0 },
    { name: 'lead', label: 'سرب و روی ایرانیان', logo: '/logos/lead.webp', active_users: 0 },
    { name: 'it', label: 'فناوری اطلاعات', logo: '/logos/it.webp', active_users: 0 },
    { name: 'gostaresh', label: 'گسترش روی ایرانیان', logo: '/logos/gostaresh.webp', active_users: 0 },
    { name: 'kimia', label: 'کیمیای زنجان گستران', logo: '/logos/kimia.webp', active_users: 0 },
    { name: 'legal', label: 'واحد حقوقی', logo: '/logos/legal.webp', active_users: 0 },
    { name: 'mahdiabad', label: 'مهدی آباد', logo: '/logos/mahdiabad.webp', active_users: 0 },
    { name: 'middleeast', label: 'خاورمیانه', logo: '/logos/middleeast.webp', active_users: 0 },
    { name: 'management', label: 'مدیریت', logo: '/logos/management.webp', active_users: 0 },
    { name: 'office', label: 'مسئولین دفاتر', logo: '/logos/office.webp', active_users: 0 },
    { name: 'simin', label: 'سیمین معدن', logo: '/logos/simin.webp', active_users: 0 },
    { name: 'procurement', label: 'تدارکات', logo: '/logos/procurement.webp', active_users: 0 },
    { name: 'zobgaran', label: 'ذوبگران رنگین فلز', logo: '/logos/zobgaran.webp', active_users: 0 },
    { name: 'caspian', label: 'زرین روی کاسپین', logo: '/logos/caspian.webp', active_users: 0 },
    { name: 'transport', label: 'زرین ترابر', logo: '/logos/transport.webp', active_users: 0 },
    { name: 'other', label: 'سایر', logo: '/logos/other.webp', active_users: 0 }
  ]);
  const [selectedOU, setSelectedOU] = useState(null);
  const [openAddEmployeeDialog, setOpenAddEmployeeDialog] = useState(false);
  const [newEmployee, setNewEmployee] = useState({ name: '', position: '' });
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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
        // Group employees by OU (stored in department field)
        const grouped = response.data.reduce((acc, emp) => {
          const ou = emp.department || 'other';
          if (!acc[ou]) {
            acc[ou] = [];
          }
          acc[ou].push(emp);
          return acc;
        }, {});
        setGroupedEmployees(grouped);
        
        // Update active_users count for each OU
        const updatedOUs = [...ous];
        updatedOUs.forEach(ou => {
          const ouName = ou.name.toLowerCase();
          ou.active_users = grouped[ouName]?.length || 0;
        });
        setOUs(updatedOUs);
        
        // Initialize ratings for each employee
        const initialRatings = {};
        response.data.forEach(emp => {
          initialRatings[emp.id] = {};
          CRITERIA.forEach(criteria => {
            initialRatings[emp.id][criteria.id] = 0;
          });
        });
        setRatings(initialRatings);
      } else {
        setError('داده‌های دریافتی از سرور نامعتبر است');
        setOpenSnackbar(true);
      }
      setLoading(false);
    } catch (error) {
      setError('خطا در دریافت اطلاعات کارمندان: ' + (error.response?.data?.message || error.message));
      setOpenSnackbar(true);
      setLoading(false);
    }
  };

  const handleOUClick = (ouName) => {
    setSelectedOU(ouName);
    // Filter employees for the selected OU
    const ouEmployees = employees.filter(emp => emp.department === ouName);
    setGroupedEmployees({ [ouName]: ouEmployees });
  };

  const handleBackToOUs = () => {
    setSelectedOU(null);
  };

  const handleAddEmployee = () => {
    if (!newEmployee.name.trim()) {
      setError('لطفاً نام کارمند را وارد کنید');
      setOpenSnackbar(true);
      return;
    }

    // Create a new employee object
    const employee = {
      id: Date.now().toString(), // Generate a unique ID
      name: newEmployee.name,
      position: newEmployee.position,
      department: selectedOU
    };

    // Add the new employee to the employees list
    setEmployees(prev => [...prev, employee]);

    // Update the grouped employees
    setGroupedEmployees(prev => {
      const updated = { ...prev };
      if (!updated[selectedOU]) {
        updated[selectedOU] = [];
      }
      updated[selectedOU].push(employee);
      return updated;
    });

    // Update the OU active_users count
    setOUs(prev => {
      return prev.map(ou => {
        if (ou.name === selectedOU) {
          return { ...ou, active_users: ou.active_users + 1 };
        }
        return ou;
      });
    });

    // Initialize ratings for the new employee
    setRatings(prev => {
      const updated = { ...prev };
      updated[employee.id] = {};
      CRITERIA.forEach(criteria => {
        updated[employee.id][criteria.id] = 0;
      });
      return updated;
    });

    // Reset the form and close the dialog
    setNewEmployee({ name: '', position: '' });
    setOpenAddEmployeeDialog(false);
    setSuccess('کارمند جدید با موفقیت اضافه شد');
    setOpenSnackbar(true);
  };

  const checkVotingStatus = async () => {
    try {
      const response = await axios.get('/api/check-auth', {
        withCredentials: true,
        timeout: 5000 // 5 second timeout
      });
      setHasVoted(response.data.has_voted);
    } catch (error) {
      if (error.code === 'ECONNABORTED') {
        setError('خطا در اتصال به سرور: زمان انتظار به پایان رسید');
      } else if (error.response) {
        setError('خطا در بررسی وضعیت رای‌دهی: ' + (error.response.data?.error || error.response.statusText));
      } else if (error.request) {
        setError('خطا در اتصال به سرور: سرور در دسترس نیست');
      } else {
        setError('خطا در بررسی وضعیت رای‌دهی: ' + error.message);
      }
      setOpenSnackbar(true);
    }
  };

  const handleRatingChange = (employeeId, criteriaId, newValue) => {
    setRatings(prev => ({
      ...prev,
      [employeeId]: {
        ...prev[employeeId],
        [criteriaId]: newValue
      }
    }));
  };

  const isRatingComplete = (employeeId) => {
    if (!ratings[employeeId]) return false;
    return Object.values(ratings[employeeId]).every(rating => rating > 0);
  };

  const handleSubmit = async () => {
    if (!selectedEmployee || !isRatingComplete(selectedEmployee.id)) {
      setError('لطفاً برای تمام معیارها امتیاز دهید');
      setOpenSnackbar(true);
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/api/vote', {
        employeeId: selectedEmployee.id,
        ratings: ratings[selectedEmployee.id]
      }, {
        withCredentials: true
      });
      
      if (response.data.message) {
        setSuccess('رای شما با موفقیت ثبت شد!');
        setHasVoted(true);
        if (isAdmin) {
          setRatings(prev => ({
            ...prev,
            [selectedEmployee.id]: {}
          }));
          setOpenSnackbar(true);
          setOpenDialog(false);
        } else {
          setRatings({});
          setOpenSnackbar(true);
        }
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

  const handleOpenDialog = (employee) => {
    setSelectedEmployee(employee);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setSelectedEmployee(null);
    setOpenDialog(false);
  };

  const isEmployeeRatingComplete = (employeeId) => {
    if (!ratings[employeeId]) return false;
    return Object.values(ratings[employeeId]).every(rating => rating > 0);
  };

  const getProgressPercentage = () => {
    if (employees.length === 0) return 0;
    const completedCount = employees.filter(emp => isEmployeeRatingComplete(emp.id)).length;
    return Math.round((completedCount / employees.length) * 100);
  };

  if (!isAuthenticated) {
    return (
      <Container maxWidth="md">
        <Fade in={true} timeout={500}>
          <Box sx={{ mt: 4 }}>
            <Alert severity="error" icon={<ErrorIcon />}>
              لطفاً برای رای دادن وارد شوید
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
            در حال بارگذاری...
          </Typography>
        </Box>
      </Container>
    );
  }

  if (hasVoted && !isAdmin) {
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
                background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
                borderRadius: 3,
                boxShadow: '0 8px 24px rgba(0,0,0,0.05)'
              }}
            >
              <Box sx={{ 
                width: 80, 
                height: 80, 
                borderRadius: '50%', 
                backgroundColor: 'rgba(16, 124, 16, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 24px'
              }}>
                <CheckCircleIcon sx={{ fontSize: 60, color: '#107C10' }} />
              </Box>
              <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, color: '#107C10' }}>
                با تشکر از رای شما!
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph sx={{ mb: 4 }}>
                رای شما با موفقیت ثبت شد. نتایج پس از پایان زمان رای‌گیری قابل مشاهده خواهد بود.
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 3 }}>
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
      <Box sx={{ mt: 4, mb: 6 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Paper 
            elevation={0} 
            sx={{ 
              p: 3, 
              mb: 4, 
              borderRadius: 3,
              background: 'linear-gradient(135deg, #0078D4 0%, #106EBE 100%)',
              color: 'white',
              boxShadow: '0 8px 24px rgba(0,120,212,0.15)'
            }}
          >
            <Box sx={{ textAlign: 'center', mb: 2 }}>
              <VoteIcon sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
                ارزیابی کارمندان
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                برای ارزیابی هر کارمند، روی دکمه رای دادن کلیک کنید
              </Typography>
            </Box>
          </Paper>

          {selectedOU ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <IconButton 
                    onClick={handleBackToOUs}
                    sx={{ 
                      backgroundColor: '#f5f5f5',
                      '&:hover': { backgroundColor: '#e0e0e0' },
                      mr: 2
                    }}
                  >
                    <ArrowBackIcon />
                  </IconButton>
                  <Typography variant="h6" sx={{ color: '#1a237e' }}>
                    کارمندان {ous.find(ou => ou.name === selectedOU)?.label}
                  </Typography>
                </Box>
                {isAdmin && (
                  <Button
                    variant="contained"
                    onClick={() => setOpenAddEmployeeDialog(true)}
                    startIcon={<PersonIcon />}
                    sx={{
                      backgroundColor: '#0078D4',
                      '&:hover': { backgroundColor: '#106EBE' },
                      borderRadius: 2,
                      boxShadow: '0 4px 12px rgba(0,120,212,0.2)'
                    }}
                  >
                    افزودن کارمند جدید
                  </Button>
                )}
              </Box>

              <Grid container spacing={3}>
                {groupedEmployees[selectedOU]?.map((employee) => (
                  <Grid item xs={12} sm={6} md={4} key={employee.id}>
                    <Card 
                      elevation={0}
                      sx={{ 
                        p: 3,
                        borderRadius: 3,
                        border: '1px solid rgba(0,0,0,0.08)',
                        background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.05)',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: '0 12px 28px rgba(0,0,0,0.1)',
                        }
                      }}
                    >
                      <Box sx={{ 
                        display: 'flex', 
                        flexDirection: 'column',
                        alignItems: 'center',
                        textAlign: 'center',
                        mb: 3
                      }}>
                        <Box sx={{ 
                          width: '100%',
                          height: 120,
                          borderRadius: 2,
                          background: 'linear-gradient(135deg, #0078D4 0%, #106EBE 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mb: 2,
                          boxShadow: '0 8px 24px rgba(0,120,212,0.2)'
                        }}>
                          <Typography variant="h3" sx={{ color: 'white', fontWeight: 600 }}>
                            {employee.name}
                          </Typography>
                        </Box>
                        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                          {employee.position}
                        </Typography>
                        <Button
                          variant="contained"
                          fullWidth
                          startIcon={isRatingComplete(employee.id) ? <EditIcon /> : <VoteIcon />}
                          onClick={() => handleOpenDialog(employee)}
                          sx={{
                            backgroundColor: isRatingComplete(employee.id) ? '#107C10' : '#0078D4',
                            '&:hover': {
                              backgroundColor: isRatingComplete(employee.id) ? '#0C5E0C' : '#106EBE',
                            },
                            py: 1.5,
                            borderRadius: 2,
                            boxShadow: isRatingComplete(employee.id) 
                              ? '0 4px 12px rgba(16,124,16,0.2)' 
                              : '0 4px 12px rgba(0,120,212,0.2)'
                          }}
                        >
                          {isRatingComplete(employee.id) ? 'ویرایش رای' : 'رای دادن'}
                        </Button>
                      </Box>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          ) : (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Card sx={{ 
                  borderRadius: 2,
                  boxShadow: 3,
                  height: '100%'
                }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ 
                      mb: 2,
                      color: '#1a237e',
                      fontWeight: 'bold'
                    }}>
                      لیست گروه‌های شرکت زرین معدن آسیا
                    </Typography>
                    <Box sx={{ 
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                      gap: 2,
                      padding: 1
                    }}>
                      {ous.map((ou) => (
                        <Card
                          key={ou.name}
                          sx={{ 
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            '&:hover': { 
                              transform: 'translateY(-4px)',
                              boxShadow: 4,
                              backgroundColor: '#f5f5f5'
                            },
                            height: '100px',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                            textAlign: 'center',
                            padding: 2,
                            background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
                            border: '1px solid rgba(0,0,0,0.08)'
                          }}
                          onClick={() => handleOUClick(ou.name)}
                        >
                          <Box sx={{ 
                            display: 'flex', 
                            flexDirection: 'column', 
                            alignItems: 'center',
                            gap: 0.5
                          }}>
                            <Box
                              component="img"
                              src={ou.logo}
                              alt={ou.label}
                              sx={{
                                width: 32,
                                height: 32,
                                objectFit: 'contain',
                                mb: 0.5
                              }}
                            />
                            <Typography 
                              variant="subtitle2" 
                              sx={{ 
                                fontWeight: 500,
                                color: '#1a237e',
                                fontSize: '0.9rem'
                              }}
                            >
                              {ou.label}
                            </Typography>
                          </Box>
                        </Card>
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
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

      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            overflow: 'hidden'
          }
        }}
      >
        {selectedEmployee && (
          <>
            <Box sx={{ 
              background: 'linear-gradient(135deg, #0078D4 0%, #106EBE 100%)',
              p: 4,
              color: 'white',
              position: 'relative',
              textAlign: 'center'
            }}>
              <IconButton 
                onClick={handleCloseDialog} 
                size="small"
                sx={{ 
                  position: 'absolute',
                  top: 16,
                  right: 16,
                  color: 'white',
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.1)'
                  }
                }}
              >
                <CloseIcon />
              </IconButton>
              
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                {selectedEmployee.name}
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 500 }}>
                {selectedEmployee.position}
              </Typography>
            </Box>
            
            <DialogContent sx={{ p: 4 }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, textAlign: 'center' }}>
                لطفا معیارهای زیر را ارزیابی کنید
              </Typography>
              <Grid container spacing={3}>
                {CRITERIA.map((criteria) => (
                  <Grid item xs={12} key={criteria.id}>
                    <Paper 
                      elevation={0}
                      sx={{ 
                        p: 3,
                        borderRadius: 2,
                        border: '1px solid rgba(0,0,0,0.08)',
                        background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                          transform: 'translateY(-2px)'
                        }
                      }}
                    >
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, textAlign: 'center' }}>
                          {criteria.name}
                        </Typography>
                        <CustomRating
                          value={ratings[selectedEmployee.id]?.[criteria.id] || 0}
                          onChange={(event, newValue) => {
                            handleRatingChange(selectedEmployee.id, criteria.id, newValue);
                          }}
                        />
                      </Box>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </DialogContent>
            <Box sx={{ 
              p: 3, 
              borderTop: '1px solid rgba(0,0,0,0.08)',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 2
            }}>
              <Button 
                onClick={handleCloseDialog} 
                sx={{ 
                  color: 'text.secondary',
                  '&:hover': {
                    backgroundColor: 'rgba(0,0,0,0.04)'
                  }
                }}
              >
                انصراف
              </Button>
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={!isRatingComplete(selectedEmployee.id)}
                sx={{
                  backgroundColor: '#0078D4',
                  '&:hover': {
                    backgroundColor: '#106EBE',
                  },
                  '&.Mui-disabled': {
                    backgroundColor: '#F3F2F1',
                    color: '#A19F9D',
                  },
                  px: 4,
                  py: 1
                }}
              >
                ثبت رای
              </Button>
            </Box>
          </>
        )}
      </Dialog>

      {/* Dialog for adding new employee */}
      <Dialog open={openAddEmployeeDialog} onClose={() => setOpenAddEmployeeDialog(false)}>
        <DialogTitle>افزودن کارمند جدید</DialogTitle>
        <DialogContent>
          <DialogContentText>
            لطفا اطلاعات کارمند جدید را وارد کنید.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="نام کارمند"
            type="text"
            fullWidth
            variant="outlined"
            value={newEmployee.name}
            onChange={(e) => setNewEmployee(prev => ({ ...prev, name: e.target.value }))}
          />
          <TextField
            margin="dense"
            label="سمت"
            type="text"
            fullWidth
            variant="outlined"
            value={newEmployee.position}
            onChange={(e) => setNewEmployee(prev => ({ ...prev, position: e.target.value }))}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddEmployeeDialog(false)}>انصراف</Button>
          <Button onClick={handleAddEmployee} variant="contained" color="primary">
            افزودن
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default Voting; 