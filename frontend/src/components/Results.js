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
    Chip,
    Avatar,
    Alert,
    Container,
    Zoom,
    Button,
    IconButton,
    Tooltip
} from '@mui/material';
import {
    BarChart as BarChartIcon,
    People as PeopleIcon,
    HowToVote as VoteIcon,
    Refresh as RefreshIcon
} from '@mui/icons-material';
import axios from 'axios';

function Results() {
    const [results, setResults] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [totalVotes, setTotalVotes] = useState(0);
    const [totalVoters, setTotalVoters] = useState(0);

    const fetchResults = async () => {
        setLoading(true);
        setError('');
        try {
            // Fetch results
            const resultsResponse = await axios.get('/api/results');
            setResults(resultsResponse.data);
            
            // Calculate total votes
            const total = resultsResponse.data.reduce((sum, emp) => sum + emp.votes, 0);
            setTotalVotes(total);
            
            // Fetch total voters
            const votersResponse = await axios.get('/api/voters-count');
            setTotalVoters(votersResponse.data.count);
        } catch (err) {
            setError(err.response?.data?.error || 'خطا در دریافت نتایج');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchResults();
    }, []);

    const handleRefresh = () => {
        fetchResults();
    };

    return (
        <Container maxWidth="lg">
            <Zoom in={true} timeout={500}>
                <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                        <Typography variant="h4" sx={{ display: 'flex', alignItems: 'center' }}>
                            <BarChartIcon sx={{ mr: 2, color: 'primary.main' }} />
                            داشبورد نتایج رای‌گیری
                        </Typography>
                        <Tooltip title="به‌روزرسانی نتایج">
                            <IconButton onClick={handleRefresh} color="primary">
                                <RefreshIcon />
                            </IconButton>
                        </Tooltip>
                    </Box>

                    <Grid container spacing={3} sx={{ mb: 4 }}>
                        <Grid item xs={12} md={6}>
                            <Card elevation={3}>
                                <CardContent>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                        <VoteIcon sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                                        <Box>
                                            <Typography variant="h6" color="text.secondary">
                                                مجموع آراء
                                            </Typography>
                                            <Typography variant="h3">
                                                {totalVotes}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Card elevation={3}>
                                <CardContent>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                        <PeopleIcon sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                                        <Box>
                                            <Typography variant="h6" color="text.secondary">
                                                تعداد رای‌دهندگان
                                            </Typography>
                                            <Typography variant="h3">
                                                {totalVoters}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {totalVoters > 0 
                                                    ? `مشارکت: ${((totalVotes / (totalVoters * 3)) * 100).toFixed(1)}%`
                                                    : 'بدون رای‌دهنده'}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>

                    <Card elevation={3}>
                        <CardContent>
                            <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
                                نتایج تفصیلی
                            </Typography>
                            {error && (
                                <Alert severity="error" sx={{ mb: 2 }}>
                                    {error}
                                </Alert>
                            )}
                            {loading ? (
                                <Box sx={{ width: '100%', mt: 2 }}>
                                    <LinearProgress />
                                </Box>
                            ) : (
                                <TableContainer>
                                    <Table>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>رتبه</TableCell>
                                                <TableCell>کارمند</TableCell>
                                                <TableCell>دپارتمان</TableCell>
                                                <TableCell align="right">تعداد آراء</TableCell>
                                                <TableCell align="right">درصد</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {results.map((employee, index) => (
                                                <TableRow 
                                                    key={employee.id} 
                                                    hover
                                                    sx={{
                                                        backgroundColor: index < 3 ? 'action.hover' : 'inherit'
                                                    }}
                                                >
                                                    <TableCell>
                                                        <Chip
                                                            label={`#${index + 1}`}
                                                            color={index < 3 ? 'primary' : 'default'}
                                                            variant={index < 3 ? 'filled' : 'outlined'}
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                            <Avatar 
                                                                sx={{ 
                                                                    bgcolor: index < 3 ? 'primary.main' : 'grey.400',
                                                                    mr: 2 
                                                                }}
                                                            >
                                                                {employee.name.charAt(0)}
                                                            </Avatar>
                                                            {employee.name}
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell>{employee.department}</TableCell>
                                                    <TableCell align="right">{employee.votes}</TableCell>
                                                    <TableCell align="right">
                                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                                                            <Box sx={{ width: '100%', maxWidth: 100, mr: 2 }}>
                                                                <LinearProgress
                                                                    variant="determinate"
                                                                    value={totalVotes > 0 ? (employee.votes / totalVotes) * 100 : 0}
                                                                    sx={{ 
                                                                        height: 8, 
                                                                        borderRadius: 4,
                                                                        backgroundColor: 'grey.200',
                                                                        '& .MuiLinearProgress-bar': {
                                                                            backgroundColor: index < 3 ? 'primary.main' : 'grey.500'
                                                                        }
                                                                    }}
                                                                />
                                                            </Box>
                                                            {totalVotes > 0
                                                                ? `${((employee.votes / totalVotes) * 100).toFixed(1)}%`
                                                                : '0%'}
                                                        </Box>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            )}
                        </CardContent>
                    </Card>
                </Box>
            </Zoom>
        </Container>
    );
}

export default Results; 