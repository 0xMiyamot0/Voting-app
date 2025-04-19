import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Container,
    Paper,
    Grid,
    Card,
    CardContent,
    Rating,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    useTheme,
    useMediaQuery,
    IconButton,
    Tooltip,
    Divider,
    LinearProgress,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Snackbar,
    Alert,
    TableSortLabel
} from '@mui/material';
import {
    BarChart as BarChartIcon,
    People as PeopleIcon,
    HowToVote as VoteIcon,
    Refresh as RefreshIcon,
    Star as StarIcon,
    TrendingUp as TrendingUpIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { toJalaali } from 'jalaali-js';

const Results = () => {
    const { isAuthenticated, isAdmin } = useAuth();
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [employeeDetails, setEmployeeDetails] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedMonth, setSelectedMonth] = useState('');
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const criteriaLabels = {
        '1': 'تعهد کاری',
        '2': 'مسئولیت پذیری',
        '3': 'خلاقیت و نوآوری',
        '4': 'کار تیمی',
        '5': 'انضباط کاری',
        '6': 'مهارت های فنی'
    };

    const persianMonths = [
        { value: '1', label: 'فروردین' },
        { value: '2', label: 'اردیبهشت' },
        { value: '3', label: 'خرداد' },
        { value: '4', label: 'تیر' },
        { value: '5', label: 'مرداد' },
        { value: '6', label: 'شهریور' },
        { value: '7', label: 'مهر' },
        { value: '8', label: 'آبان' },
        { value: '9', label: 'آذر' },
        { value: '10', label: 'دی' },
        { value: '11', label: 'بهمن' },
        { value: '12', label: 'اسفند' }
    ];

    useEffect(() => {
        // Set current Persian month as default
        const currentDate = new Date();
        const jalaliDate = toJalaali(currentDate.getFullYear(), currentDate.getMonth() + 1, currentDate.getDate());
        setSelectedMonth(jalaliDate.jm.toString());
    }, []);

    useEffect(() => {
        fetchResults();
    }, [selectedMonth]);

    const fetchResults = async () => {
        try {
            const response = await axios.get('/api/results', {
                params: {
                    month: selectedMonth
                }
            });
            setResults(response.data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleEmployeeClick = async (employee) => {
        if (!isAdmin) return;
        
        setSelectedEmployee(employee);
        try {
            const response = await axios.get(`/api/employee/${employee.id}/ratings`);
            setEmployeeDetails(response.data);
            setOpenDialog(true);
        } catch (err) {
            setError('خطا در دریافت جزئیات: ' + (err.response?.data?.message || err.message));
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const jalaliDate = toJalaali(date.getFullYear(), date.getMonth() + 1, date.getDate());
        return `${jalaliDate.jy}/${jalaliDate.jm}/${jalaliDate.jd}`;
    };

    if (!isAuthenticated) {
        return (
            <Container maxWidth="lg">
                <Paper sx={{ p: 3, mt: 3, textAlign: 'center' }}>
                    <Typography variant="h6" color="error">
                        لطفاً برای مشاهده نتایج وارد شوید
                    </Typography>
                </Paper>
            </Container>
        );
    }

    if (loading) {
        return (
            <Container maxWidth="lg">
                <Box sx={{ width: '100%', mt: 3 }}>
                    <LinearProgress />
                </Box>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg">
            <Box sx={{ mb: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                        نتایج رای‌گیری
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <FormControl sx={{ minWidth: 120 }}>
                            <InputLabel>ماه</InputLabel>
                            <Select
                                value={selectedMonth}
                                onChange={(e) => setSelectedMonth(e.target.value)}
                                label="ماه"
                                sx={{ 
                                    '& .MuiSelect-select': { 
                                        textAlign: 'right',
                                        paddingRight: '14px'
                                    }
                                }}
                            >
                                <MenuItem value="">
                                    <em>همه ماه‌ها</em>
                                </MenuItem>
                                {persianMonths.map((month) => (
                                    <MenuItem key={month.value} value={month.value}>
                                        {month.label}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <Tooltip title="به‌روزرسانی نتایج">
                            <IconButton onClick={fetchResults} color="primary">
                                <RefreshIcon />
                            </IconButton>
                        </Tooltip>
                    </Box>
                </Box>

                <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid item xs={12} md={4}>
                        <Card elevation={3} sx={{ height: '100%' }}>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                    <PeopleIcon color="primary" sx={{ fontSize: 40, mr: 2 }} />
                                    <Box>
                                        <Typography variant="h6" color="text.secondary">
                                            تعداد شرکت‌کنندگان
                                        </Typography>
                                        <Typography variant="h4">
                                            {results.length}
                                        </Typography>
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Card elevation={3} sx={{ height: '100%' }}>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                    <VoteIcon color="primary" sx={{ fontSize: 40, mr: 2 }} />
                                    <Box>
                                        <Typography variant="h6" color="text.secondary">
                                            مجموع آراء
                                        </Typography>
                                        <Typography variant="h4">
                                            {results.reduce((sum, r) => sum + Math.floor(r.votes), 0)}
                                        </Typography>
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Card elevation={3} sx={{ height: '100%' }}>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                    <TrendingUpIcon color="primary" sx={{ fontSize: 40, mr: 2 }} />
                                    <Box>
                                        <Typography variant="h6" color="text.secondary">
                                            میانگین امتیاز
                                        </Typography>
                                        <Typography variant="h4">
                                            {(results.reduce((sum, r) => sum + r.votes, 0) / results.length).toFixed(1)}
                                        </Typography>
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                <Paper elevation={3} sx={{ p: 3 }}>
                    <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>
                        رتبه‌بندی کارکنان
                    </Typography>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>رتبه</TableCell>
                                    <TableCell>نام</TableCell>
                                    <TableCell>دپارتمان</TableCell>
                                    <TableCell>تعداد رای</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {results.map((result, index) => (
                                    <TableRow 
                                        key={result.id} 
                                        hover 
                                        onClick={() => handleEmployeeClick(result)}
                                        style={{ cursor: isAdmin ? 'pointer' : 'default' }}
                                        sx={{ 
                                            '&:nth-of-type(odd)': { backgroundColor: 'action.hover' },
                                            '&:hover': { backgroundColor: 'action.selected' }
                                        }}
                                    >
                                        <TableCell>
                                            <Chip 
                                                label={index + 1} 
                                                color="default" 
                                                variant="outlined"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                                                {result.name}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Chip 
                                                label={result.department} 
                                                variant="outlined" 
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                <VoteIcon sx={{ fontSize: 20, mr: 1, color: 'primary.main' }} />
                                                <Typography>
                                                    {Math.floor(result.votes)}
                                                </Typography>
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>
            </Box>

            {isAdmin && (
                <Dialog 
                    open={openDialog} 
                    onClose={() => setOpenDialog(false)}
                    maxWidth="md"
                    fullWidth
                >
                    <DialogTitle>
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                            جزئیات امتیازات {selectedEmployee?.name}
                        </Typography>
                    </DialogTitle>
                    <DialogContent>
                        {employeeDetails && (
                            <Box>
                                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                                    میانگین امتیازات به تفکیک معیار
                                </Typography>
                                <Grid container spacing={2} sx={{ mb: 4 }}>
                                    {Object.entries(employeeDetails.criteriaAverages).map(([criteria, average]) => (
                                        <Grid item xs={12} sm={6} key={criteria}>
                                            <Paper elevation={2} sx={{ p: 2 }}>
                                                <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
                                                    {criteriaLabels[criteria]}
                                                </Typography>
                                                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                                                    <Rating value={average} precision={0.1} readOnly />
                                                    <Typography variant="body2" sx={{ mr: 1, color: 'text.secondary' }}>
                                                        {average.toFixed(1)}
                                                    </Typography>
                                                </Box>
                                            </Paper>
                                        </Grid>
                                    ))}
                                </Grid>

                                <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                                    جزئیات رای‌ها
                                </Typography>
                                <TableContainer component={Paper} elevation={2}>
                                    <Table>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>تاریخ</TableCell>
                                                <TableCell>معیارها</TableCell>
                                                <TableCell>میانگین</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {employeeDetails.ratings.map((rating, index) => (
                                                <TableRow key={index}>
                                                    <TableCell>{formatDate(rating.date)}</TableCell>
                                                    <TableCell>
                                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                                            {Object.entries(rating.criteriaRatings).map(([criteria, score]) => (
                                                                <Box key={criteria} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                    <Typography variant="body2" sx={{ minWidth: 150 }}>
                                                                        {criteriaLabels[criteria]}:
                                                                    </Typography>
                                                                    <Rating 
                                                                        value={score} 
                                                                        size="small" 
                                                                        readOnly 
                                                                        precision={0.5}
                                                                    />
                                                                    <Typography variant="body2" color="text.secondary">
                                                                        {score.toFixed(1)}
                                                                    </Typography>
                                                                </Box>
                                                            ))}
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                            <Rating 
                                                                value={rating.averageScore} 
                                                                precision={0.1} 
                                                                readOnly 
                                                                size="small"
                                                            />
                                                            <Typography variant="body2" color="text.secondary">
                                                                {rating.averageScore.toFixed(1)}
                                                            </Typography>
                                                        </Box>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </Box>
                        )}
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setOpenDialog(false)} color="primary">
                            بستن
                        </Button>
                    </DialogActions>
                </Dialog>
            )}
        </Container>
    );
};

export default Results; 