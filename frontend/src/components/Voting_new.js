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
  CircularProgress
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
  Group as GroupIcon,
  Assessment as AssessmentIcon,
  Send as SendIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

// Configure axios to include credentials
axios.defaults.withCredentials = true;

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

  { id: 'behavior', label: '?????????? ?? ?????????? ????????', description: '???????? ?????????? ???? ?????????????? ?? ?????????? ???????? ????????????' },
  { id: 'communication', label: '??????????????????? ??????????????', description: '?????????????? ?????????????? ???????????? ???????? ???? ?????????????? ?? ????????????' },
  { id: 'responsibility', label: '???????????????????????????', description: '???????? ???? ?????????? ?? ?????????? ???? ???????? ??????????' },
  { id: 'initiative', label: '???????????? ?? ????????????', description: '?????????????? ?????????? ?????????????????????? ?????????????? ?? ?????????????? ????????????????? ????????' },
  { id: 'teamwork', label: '?????? ????????', description: '?????????????? ???????????? ???? ?????? ?? ???????????? ???? ??????????????????? ??????????' },
  { id: 'performance', label: '???????????? ?? ?????????????????', description: '?????????? ?? ???????? ?????? ?????????? ?????? ?? ?????????????? ???? ??????????' }
];

// Define steps array at the top level

  { id: 1, name: '?????? ?????????? ?? ?????? ????????????', icon: <PersonIcon /> },
  { id: 2, name: '???????????? ?? ?????????? ?????? ??????????????', icon: <PersonIcon /> },
  { id: 3, name: '???????? ?? ?????????? ???? ??????????????', icon: <PersonIcon /> },
  { id: 4, name: '?????????? ?????? ?? ???????? ??????', icon: <PersonIcon /> },
  { id: 5, name: '???????????? ???? ???????? ???????????? ??????????', icon: <PersonIcon /> },
  { id: 6, name: '?????????????? ?????????? ?? ???????? ???? ??????', icon: <PersonIcon /> },
];

  { id: 'behavior', label: '?????????? ?? ?????????? ????????', description: '???????? ?????????? ???? ?????????????? ?? ?????????? ???????? ????????????' },
  { id: 'communication', label: '??????????????????? ??????????????', description: '?????????????? ?????????????? ???????????? ???????? ???? ?????????????? ?? ????????????' },
  { id: 'responsibility', label: '???????????????????????????', description: '???????? ???? ?????????? ?? ?????????? ???? ???????? ??????????' },
  { id: 'initiative', label: '???????????? ?? ????????????', description: '?????????????? ?????????? ?????????????????????? ?????????????? ?? ?????????????? ????????????????? ????????' },
  { id: 'teamwork', label: '?????? ????????', description: '?????????????? ???????????? ???? ?????? ?? ???????????? ???? ??????????????????? ??????????' },
  { id: 'performance', label: '???????????? ?? ?????????????????', description: '?????????? ?? ???????? ?????? ?????????? ?????? ?? ?????????????? ???? ??????????' }
];


// Custom Rating Component
  
    5: '????????',
    4: '??????',
    3: '??????????',
    2: '????????',
    1: '????'
  };
  
    setHover(ratingValue);
    setHoverLabel(ratingLabels[ratingValue]);
  };
  
    setHover(-1);
    setHoverLabel('');
  };
  
    onChange(null, ratingValue);
  };
  
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        {[...Array(max)].map((_, index) => {
          
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
    { name: '???????? ???????? ????????', label: '???????? ???????? ????????', logo: '/logos/zmg.webp', active_users: 0 },
    { name: '??????????', label: '??????????', logo: '/logos/airma.webp', active_users: 0 },
    { name: '????????????????', label: '????????????????', logo: '/logos/trading.webp', active_users: 0 },
    { name: '???????????? ????????????????', label: '???????????? ????????????????', logo: '/logos/etemad.webp', active_users: 0 },
    { name: '???????? ???????? ??????????', label: '???????? ???????? ??????????', logo: '/logos/flat.webp', active_users: 0 },
    { name: '?????? ?? ?????? ????????????????', label: '?????? ?? ?????? ????????????????', logo: '/logos/lead.webp', active_users: 0 },
    { name: '???????????? ??????????????', label: '???????????? ??????????????', logo: '/logos/it.webp', active_users: 0 },
    { name: '?????????? ?????? ????????????????', label: '?????????? ?????? ????????????????', logo: '/logos/gostaresh.webp', active_users: 0 },
    { name: '???????????? ?????????? ????????????', label: '???????????? ?????????? ????????????', logo: '/logos/kimia.webp', active_users: 0 },
    { name: '???????? ??????????', label: '???????? ??????????', logo: '/logos/legal.webp', active_users: 0 },
    { name: '???????? ????????', label: '???????? ????????', logo: '/logos/mahdiabad.webp', active_users: 0 },
    { name: '??????????????????', label: '??????????????????', logo: '/logos/middleeast.webp', active_users: 0 },
    { name: '?????????????? ??????????', label: '?????????????? ??????????', logo: '/logos/office.webp', active_users: 0 },
    { name: '?????????? ????????', label: '?????????? ????????', logo: '/logos/simin.webp', active_users: 0 },
    { name: '????????', label: '????????', logo: '/logos/shares.webp', active_users: 0 },
    { name: '??????????????', label: '??????????????', logo: '/logos/procurement.webp', active_users: 0 },
    { name: '?????????????? ?????????? ??????', label: '?????????????? ?????????? ??????', logo: '/logos/zobgaran.webp', active_users: 0 },
    { name: '???????? ?????? ????????????', label: '???????? ?????? ????????????', logo: '/logos/caspian.webp', active_users: 0 },
    { name: '???????? ??????????', label: '???????? ??????????', logo: '/logos/transport.webp', active_users: 0 },
    { name: '?????????? ?????? ????????', label: '?????????? ?????? ????????', logo: '/logos/nonferrous.webp', active_users: 0 }
  ]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchEmployees();
      checkVotingStatus();
    }
  }, [isAuthenticated]);

    try {
      setLoading(true);
      setEmployees(employeesData);

      // Group employees by department (OU)
      employeesData.forEach(employee => {
        if (!grouped[employee.department]) {
          grouped[employee.department] = [];
        }
        grouped[employee.department].push(employee);
      });
      setGroupedEmployees(grouped);

      // Update OU active_users count
      updatedOUs.forEach(ou => {
        ou.active_users = grouped[ou.name]?.length || 0;
      });
      setOus(updatedOUs);

      // Initialize ratings for each employee
      employeesData.forEach(employee => {
        initialRatings[employee.id] = {};
          initialRatings[employee.id][criterion.id] = 0;
        });
      });
      setRatings(initialRatings);
      setLoading(false);
    } catch (err) {
      setError('?????? ???? ???????????? ?????????????? ????????????????');
      setLoading(false);
    }
  };

    setSelectedOU(ouName);
    setCurrentEmployeeIndex(0);
    setActiveStep(1);
  };

    setSelectedOU(null);
  };

    if (!newEmployee.name.trim()) {
      setError('???????? ?????? ???????????? ???? ???????? ????????');
      setOpenSnackbar(true);
      return;
    }

    // Create a new employee object
      id: Date.now().toString(), // Generate a unique ID
      name: newEmployee.name,
      position: newEmployee.position,
      department: selectedOU
    };

    // Add the new employee to the employees list
    setEmployees(prev => [...prev, employee]);

    // Update the grouped employees
    setGroupedEmployees(prev => {
      if (!updated[selectedOU]) {
        updated[selectedOU] = [];
      }
      updated[selectedOU].push(employee);
      return updated;
    });

    // Update the OU active_users count
    setOus(prev => {
      return prev.map(ou => {
        if (ou.name === selectedOU) {
          return { ...ou, active_users: ou.active_users + 1 };
        }
        return ou;
      });
    });

    // Initialize ratings for the new employee
    setRatings(prev => {
      updated[employee.id] = {};
        updated[employee.id][criterion.id] = 0;
      });
      return updated;
    });

    // Reset the form and close the dialog
    setNewEmployee({ name: '', position: '' });
    setOpenAddEmployeeDialog(false);
    setSuccess('???????????? ???????? ???? ???????????? ?????????? ????');
    setOpenSnackbar(true);
  };

    try {
        withCredentials: true
      });
      setHasVoted(response.data.has_voted);
    } catch (error) {
      console.error('Error checking voting status:', error);
    }
  };

    setRatings(prev => ({
      ...prev,
      [employeeId]: {
        ...prev[employeeId],
        [criterionId]: value
      }
    }));
  };

    if (!ratings[employeeId]) return false;
    return Object.values(ratings[employeeId]).every(rating => rating > 0);
  };

    try {
      setLoading(true);
      
      Object.keys(ratings).forEach(employeeId => {
        
        if (hasRated) {
          votes.push({
            employee_id: parseInt(employeeId),
            ratings: employeeRatings
          });
        }
      });

      if (votes.length === 0) {
        setError('???????? ?????????? ???????? ???? ???????????? ?????????????????? ????????');
        setLoading(false);
        return;
      }

      await axios.post('http://localhost:5000/api/vote', { votes });
      
      setSuccess('??????????????? ?????? ???? ???????????? ?????? ????');
      setSnackbarMessage('??????????????? ?????? ???? ???????????? ?????? ????');
      setSnackbarSeverity('success');
      setOpenSnackbar(true);
      
      if (!isAdmin) {
        setTimeout(() => {
          navigate('/thank-you');
        }, 2000);
      } else {
        // Reset form for admin users
        setRatings({});
        setCurrentEmployeeIndex(0);
        setActiveStep(0);
        setSelectedOU(null);
      }
      
      setLoading(false);
    } catch (err) {
      setError('?????? ???? ?????? ?????????????');
      setSnackbarMessage('?????? ???? ?????? ?????????????');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
      setLoading(false);
    }
  };

    setOpenSnackbar(false);
  };

    await logout();
    window.location.href = 'https://zimg.co';
  };

    setSelectedEmployee(employee);
    setOpenDialog(true);
  };

    setSelectedEmployee(null);
    setOpenDialog(false);
  };

    if (!ratings[employeeId]) return false;
    return Object.values(ratings[employeeId]).every(rating => rating > 0);
  };

    if (!selectedOU || !groupedEmployees[selectedOU]) return 0;
    return ((currentEmployeeIndex + 1) / groupedEmployees[selectedOU].length) * 100;
  };

    if (!selectedOU || !groupedEmployees[selectedOU]) return null;
    return groupedEmployees[selectedOU][currentEmployeeIndex];
  };

    switch (step) {
      case 0:
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main', mb: 4 }}>
              ?????????????? ?????????????? ????????????????
            </Typography>
            
            <Grid container spacing={3}>
                <Grid item xs={12} md={6} key={criterion.id}>
                  <Card sx={{ 
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'transform 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-5px)'
                    }
                  }}>
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <AssessmentIcon sx={{ color: 'primary.main', mr: 1, fontSize: 28 }} />
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {criterion.label}
                        </Typography>
                      </Box>
                      <Typography variant="body1" color="text.secondary">
                        {criterion.description}
                      </Typography>
                      <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                          ??????????????????:
                        </Typography>
                        <Rating
                          value={3}
                          readOnly
                          precision={1}
                          dir="ltr"
                          icon={<StarIcon fontSize="inherit" sx={{ color: 'primary.main' }} />}
                          emptyIcon={<StarBorderIcon fontSize="inherit" sx={{ color: 'primary.light', opacity: 0.5 }} />}
                        />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
            
            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                color="primary"
                endIcon={<ArrowForwardIcon />}
                onClick={() => setActiveStep(1)}
                sx={{ px: 4, py: 1.5, borderRadius: 2 }}
              >
                ???????? ??????????????
              </Button>
            </Box>
          </Box>
        );
      
      case 1:
        if (!currentEmployee) return null;
        
        return (
          <Box sx={{ p: 3 }}>
            <Box sx={{ mb: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box
                  component="img"
                  src={ous.find(ou => ou.name === selectedOU)?.logo}
                  alt={selectedOU}
                  sx={{ width: 40, height: 40, objectFit: 'contain', mr: 2 }}
                />
                <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                  {selectedOU}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Typography variant="body1" sx={{ mr: 2 }}>
                  ????????????:
                </Typography>
                <Box sx={{ flexGrow: 1, height: 10, bgcolor: 'background.paper', borderRadius: 5, overflow: 'hidden' }}>
                  <Box 
                    sx={{ 
                      height: '100%', 
                      width: `${getProgressPercentage()}%`, 
                      bgcolor: 'primary.main',
                      transition: 'width 0.5s ease'
                    }} 
                  />
                </Box>
                <Typography variant="body2" sx={{ ml: 2, color: 'text.secondary' }}>
                  {currentEmployeeIndex + 1} ???? {groupedEmployees[selectedOU]?.length || 0}
                </Typography>
              </Box>
            </Box>
            
            <Card sx={{ mb: 4, borderRadius: 3, overflow: 'hidden' }}>
              <Box sx={{ 
                p: 3, 
                bgcolor: 'primary.main', 
                color: 'white',
                display: 'flex',
                alignItems: 'center'
              }}>
                <Avatar 
                  sx={{ 
                    width: 60, 
                    height: 60, 
                    bgcolor: 'white', 
                    color: 'primary.main',
                    fontSize: '1.5rem',
                    mr: 2
                  }}
                >
                  {currentEmployee.name.charAt(0)}
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {currentEmployee.name}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    {currentEmployee.department}
                  </Typography>
                </Box>
              </Box>
              
              <CardContent sx={{ p: 3 }}>
                <Grid container spacing={3}>
                    <Grid item xs={12} key={criterion.id}>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                          {criterion.label}
                        </Typography>
                        <Rating
                          value={ratings[currentEmployee.id]?.[criterion.id] || 0}
                          onChange={(event, newValue) => {
                            handleRatingChange(currentEmployee.id, criterion.id, newValue);
                          }}
                          precision={1}
                          dir="ltr"
                          icon={<StarIcon fontSize="large" sx={{ color: 'primary.main' }} />}
                          emptyIcon={<StarBorderIcon fontSize="large" sx={{ color: 'primary.light', opacity: 0.5 }} />}
                          sx={{ fontSize: '2rem' }}
                        />
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Button
                variant="outlined"
                color="primary"
                startIcon={<ArrowBackIcon />}
                onClick={() => setActiveStep(0)}
                sx={{ px: 4, py: 1.5, borderRadius: 2 }}
              >
                ????????
              </Button>
              
              <Button
                variant="contained"
                color="primary"
                endIcon={<ArrowForwardIcon />}
                onClick={() => setActiveStep(2)}
                disabled={currentEmployeeIndex === (groupedEmployees[selectedOU]?.length || 0) - 1 && activeStep === EVALUATION_STEPS.length - 1}
                sx={{ px: 4, py: 1.5, borderRadius: 2 }}
              >
                {currentEmployeeIndex === (groupedEmployees[selectedOU]?.length || 0) - 1 ? '???????? ??????????' : '????????'}
              </Button>
            </Box>
          </Box>
        );
      
      case 2:
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main', mb: 4 }}>
              ???????? ?? ?????????? ??????????
            </Typography>
            
            <Typography variant="body1" sx={{ mb: 3 }}>
              ???????? ??????????????????????? ?????? ???? ???????? ???????? ?? ???? ???????? ???????????????? ??????????? ???? ?????? ????????.
            </Typography>
            
            <Paper sx={{ p: 3, mb: 4, borderRadius: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                ?????????? ?????????????????????
              </Typography>
              
              <Divider sx={{ mb: 3 }} />
              
              {Object.keys(ratings).map(employeeId => {
                if (!employee) return null;
                
                
                if (!hasRated) return null;
                
                return (
                  <Box key={employeeId} sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Avatar 
                        sx={{ 
                          width: 40, 
                          height: 40, 
                          bgcolor: 'primary.main', 
                          color: 'white',
                          mr: 2
                        }}
                      >
                        {employee.name.charAt(0)}
                      </Avatar>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        {employee.name}
                      </Typography>
                    </Box>
                    
                    <Grid container spacing={2}>
                        if (rating === 0) return null;
                        
                        return (
                          <Grid item xs={12} sm={6} key={criterion.id}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Typography variant="body2" sx={{ minWidth: 150 }}>
                                {criterion.label}:
                              </Typography>
                              <Rating
                                value={rating}
                                readOnly
                                precision={1}
                                dir="ltr"
                                icon={<StarIcon fontSize="small" sx={{ color: 'primary.main' }} />}
                                emptyIcon={<StarBorderIcon fontSize="small" sx={{ color: 'primary.light', opacity: 0.5 }} />}
                              />
                            </Box>
                          </Grid>
                        );
                      })}
                    </Grid>
                    
                    <Divider sx={{ mt: 2 }} />
                  </Box>
                );
              })}
            </Paper>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Button
                variant="outlined"
                color="primary"
                startIcon={<ArrowBackIcon />}
                onClick={() => setActiveStep(1)}
                sx={{ px: 4, py: 1.5, borderRadius: 2 }}
              >
                ????????????
              </Button>
              
              <Button
                variant="contained"
                color="primary"
                endIcon={<SendIcon />}
                onClick={handleSubmit}
                disabled={loading}
                sx={{ px: 4, py: 1.5, borderRadius: 2 }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : '?????? ?????????????'}
              </Button>
            </Box>
          </Box>
        );
      
      default:
        return null;
    }
  };

  if (!isAuthenticated) {
    return (
      <Container maxWidth="md">
        <Fade in={true} timeout={500}>
          <Box sx={{ mt: 4 }}>
            <Alert severity="error" icon={<ErrorIcon />}>
              ???????? ???????? ?????? ???????? ???????? ????????
            </Alert>
          </Box>
        </Fade>
      </Container>
    );
  }

  if (loading && !selectedOU) {
    return (
      <Container maxWidth="md">
        <Box sx={{ mt: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <CircularProgress sx={{ mb: 2 }} />
          <Typography variant="body1" color="text.secondary">
            ???? ?????? ????????????????...
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
                ???? ???????? ???? ?????? ??????!
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph sx={{ mb: 4 }}>
                ?????? ?????? ???? ???????????? ?????? ????. ?????????? ???? ???? ?????????? ???????? ????????????????? ???????? ???????????? ?????????? ??????.
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 3 }}>
                <Chip
                  icon={<VoteIcon />}
                  label="?????? ?????? ????"
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
                  ???????? ???? ???????? ????????????
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
                ?????????????? ????????????????
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                ???????? ?????????????? ???? ?????????????? ?????? ???????? ?????? ???????? ???????? ????????
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
                    ???????????????? {selectedOU}
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
                    ???????????? ???????????? ????????
                  </Button>
                )}
              </Box>

              <Grid container spacing={3}>
                {groupedEmployees[selectedOU].map((employee) => (
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
                          {isRatingComplete(employee.id) ? '???????????? ??????' : '?????? ????????'}
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
                      ???????? ???????????????
                    </Typography>
                    <Box sx={{ 
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
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
                            padding: 2
                          }}
                          onClick={() => handleOUClick(ou.name)}
                        >
                          <Box sx={{ 
                            display: 'flex', 
                            flexDirection: 'column', 
                            alignItems: 'center',
                            gap: 1
                          }}>
                            <Box
                              component="img"
                              src={ou.logo}
                              alt={ou.label}
                              sx={{
                                width: 40,
                                height: 40,
                                objectFit: 'contain',
                                mb: 1
                              }}
                            />
                            <Typography 
                              variant="subtitle1" 
                              sx={{ 
                                fontWeight: 500,
                                color: '#1a237e'
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
                ???????? ???????????????? ?????? ???? ?????????????? ????????
              </Typography>
              <Grid container spacing={3}>
                  <Grid item xs={12} key={criterion.id}>
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
                          {criterion.label}
                        </Typography>
                        <CustomRating
                          value={ratings[selectedEmployee.id]?.[criterion.id] || 0}
                          onChange={(event, newValue) => {
                            handleRatingChange(selectedEmployee.id, criterion.id, newValue);
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
                ????????????
              </Button>
              <Button
                variant="contained"
                onClick={() => setActiveStep(2)}
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
                ???????? ??????????
              </Button>
            </Box>
          </>
        )}
      </Dialog>

      {/* Dialog for adding new employee */}
      <Dialog open={openAddEmployeeDialog} onClose={() => setOpenAddEmployeeDialog(false)}>
        <DialogTitle>???????????? ???????????? ????????</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ???????? ?????????????? ???????????? ???????? ???? ???????? ????????.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="?????? ????????????"
            type="text"
            fullWidth
            variant="outlined"
            value={newEmployee.name}
            onChange={(e) => setNewEmployee(prev => ({ ...prev, name: e.target.value }))}
          />
          <TextField
            margin="dense"
            label="??????"
            type="text"
            fullWidth
            variant="outlined"
            value={newEmployee.position}
            onChange={(e) => setNewEmployee(prev => ({ ...prev, position: e.target.value }))}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddEmployeeDialog(false)}>????????????</Button>
          <Button onClick={handleAddEmployee} variant="contained" color="primary">
            ????????????
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default Voting; 
