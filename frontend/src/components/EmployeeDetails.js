import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Card,
    CardContent,
    Grid,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    LinearProgress,
    Avatar,
    Alert,
    Container,
    Button,
    Rating,
    Divider,
    useTheme
} from '@mui/material';
import {
    ArrowBack as ArrowBackIcon,
    Star as StarIcon
} from '@mui/icons-material';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function EmployeeDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated, isAdmin } = useAuth();
    const [employee, setEmployee] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const theme = useTheme();

    useEffect(() => {
        if (isAuthenticated && isAdmin) {
            fetchEmployeeDetails();
        }
    }, [isAuthenticated, isAdmin]);

    const fetchEmployeeDetails = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`/api/employee/${id}/ratings`, {
                withCredentials: true
            });
            setEmployee(response.data);
        } catch (err) {
            setError('خطا در دریافت اطلاعات: ' + (err.response?.data?.message || err.message));
        } finally {
            setLoading(false);
        }
    };

    if (!isAuthenticated || !isAdmin) {
        return (
            <Container maxWidth="md">
                <Box sx={{ mt: 4 }}>
                    <Alert severity="error">
                        دسترسی به این صفحه فقط برای مدیران امکان‌پذیر است
                    </Alert>
                </Box>
            </Container>
        );
    }

    if (loading) {
        return (
            <Container maxWidth="md">
                <Box sx={{ mt: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <LinearProgress sx={{ width: '100%', mb: 2 }} />
                    <Typography variant="body1" color="text.secondary">
                        در حال بارگذاری اطلاعات...
                    </Typography>
                </Box>
            </Container>
        );
    }

    if (!employee) {
        return (
            <Container maxWidth="md">
                <Box sx={{ mt: 4 }}>
                    <Alert severity="error">
                        اطلاعات کارمند یافت نشد
                    </Alert>
                </Box>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg">
            <Box sx={{ mb: 4 }}>
                <Button
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate('/results')}
                    sx={{ mb: 2 }}
                >
                    بازگشت به نتایج
                </Button>

                <Card elevation={3}>
                    <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                            <Avatar
                                sx={{ width: 64, height: 64, mr: 2, bgcolor: 'primary.main' }}
                            >
                                {employee.name.charAt(0)}
                            </Avatar>
                            <Box>
                                <Typography variant="h5">
                                    {employee.name}
                                </Typography>
                                <Typography variant="subtitle1" color="text.secondary">
                                    {employee.department}
                                </Typography>
                            </Box>
                        </Box>

                        <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                                <Card variant="outlined">
                                    <CardContent>
                                        <Typography variant="h6" gutterBottom>
                                            آمار کلی
                                        </Typography>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                            <Typography>تعداد آراء:</Typography>
                                            <Typography>{employee.votes}</Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                            <Typography>میانگین امتیاز:</Typography>
                                            <Typography>{employee.averageRating.toFixed(1)}</Typography>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                        </Grid>

                        <Divider sx={{ my: 4 }} />

                        <Typography variant="h6" gutterBottom>
                            جزئیات امتیازات
                        </Typography>
                        <TableContainer component={Paper} variant="outlined">
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>رای‌دهنده</TableCell>
                                        <TableCell>امتیاز</TableCell>
                                        <TableCell>تاریخ</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {employee.ratings.map((rating, index) => (
                                        <TableRow key={index}>
                                            <TableCell>{rating.voterName}</TableCell>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                    <Rating
                                                        value={rating.score}
                                                        max={6}
                                                        readOnly
                                                        size="small"
                                                        icon={<StarIcon fontSize="inherit" />}
                                                        emptyIcon={<StarIcon fontSize="inherit" />}
                                                        sx={{
                                                            '& .MuiRating-iconFilled': {
                                                                color: '#FFD700',
                                                            },
                                                            '& .MuiRating-iconEmpty': {
                                                                color: 'rgba(0,0,0,0.26)',
                                                            },
                                                        }}
                                                    />
                                                    <Typography variant="body2" sx={{ ml: 1 }}>
                                                        {rating.score}
                                                    </Typography>
                                                </Box>
                                            </TableCell>
                                            <TableCell>{new Date(rating.date).toLocaleString('fa-IR')}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </CardContent>
                </Card>
            </Box>
        </Container>
    );
}

export default EmployeeDetails; 