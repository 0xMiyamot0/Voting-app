import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Box,
  CircularProgress,
  Card,
  CardContent,
  Grid,
  Alert,
  LinearProgress,
  Fade,
  Zoom,
  Chip,
  Avatar,
  Button,
  Snackbar,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  BarChart as BarChartIcon,
  People as PeopleIcon,
  HowToVote as VoteIcon,
  Error as ErrorIcon,
  CloudUpload as CloudUploadIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Results from './Results';
import ADUserImport from './ADUserImport';
import OUList from './OUList';

function AdminPanel() {
  const { isAdmin } = useAuth();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [totalVotes, setTotalVotes] = useState(0);
  const [totalVoters, setTotalVoters] = useState(0);
  const [tabValue, setTabValue] = useState(0);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  const fetchResults = async () => {
    try {
      const response = await axios.get('/api/results');
      const data = response.data;
      
      // Calculate total votes
      const votes = data.reduce((sum, emp) => sum + emp.votes, 0);
      setTotalVotes(votes);
      
      // Calculate total voters (assuming each voter votes for 3 employees)
      setTotalVoters(Math.floor(votes / 3));
      
      setResults(data);
      setLoading(false);
    } catch (error) {
      setError('خطا در دریافت نتایج رای‌گیری');
      setOpenSnackbar(true);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchResults();
    }
  }, [isAdmin]);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleFileUpload = async () => {
    if (!selectedFile) {
      setError('Please select a file first');
      setOpenSnackbar(true);
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await axios.post('http://localhost:5000/api/upload-voters', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      setSuccess(response.data.message);
      setOpenSnackbar(true);
      setSelectedFile(null);
      // Reset file input
      document.getElementById('file-upload').value = '';
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to upload file');
      setOpenSnackbar(true);
    }
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
    setError('');
    setSuccess('');
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleDeleteVotes = async () => {
    try {
      setLoading(true);
      await axios.post('/api/delete-votes');
      setSuccess('تمام رای‌ها با موفقیت حذف شدند');
      setOpenSnackbar(true);
      fetchResults(); // Refresh results
      setOpenDeleteDialog(false);
    } catch (error) {
      setError('خطا در حذف رای‌ها');
      setOpenSnackbar(true);
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) {
    return (
      <Container maxWidth="md">
        <Fade in={true} timeout={500}>
          <Box sx={{ mt: 4 }}>
            <Alert severity="error" icon={<ErrorIcon />}>
              شما دسترسی به پنل مدیریت را ندارید.
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
            در حال بارگذاری نتایج رای‌گیری...
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="h4" gutterBottom>
        پنل مدیریت
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="admin tabs">
          <Tab label="نتایج" />
          <Tab label="وارد کردن کاربران از AD" />
          <Tab label="لیست واحدهای سازمانی" />
        </Tabs>
      </Box>

      <Box sx={{ mt: 3 }}>
        {tabValue === 0 && (
          <>
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">
                تعداد کل رای‌ها: {totalVotes} | تعداد رای‌دهندگان: {totalVoters}
              </Typography>
              <Button
                variant="contained"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={() => setOpenDeleteDialog(true)}
              >
                حذف تمام رای‌ها
              </Button>
            </Box>
            <Results />
          </>
        )}
        {tabValue === 1 && <ADUserImport />}
        {tabValue === 2 && <OUList />}
      </Box>

      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
      >
        <DialogTitle>تایید حذف رای‌ها</DialogTitle>
        <DialogContent>
          <Typography>
            آیا مطمئن هستید که می‌خواهید تمام رای‌ها را حذف کنید؟ این عمل قابل بازگشت نیست.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>انصراف</Button>
          <Button onClick={handleDeleteVotes} color="error" variant="contained">
            حذف
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={error ? 'error' : 'success'}
          sx={{ width: '100%' }}
        >
          {error || success}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default AdminPanel; 