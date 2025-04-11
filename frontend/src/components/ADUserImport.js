import React, { useState } from 'react';
import {
    Box,
    Button,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    CircularProgress,
    Alert,
    Checkbox,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    IconButton,
    ListItemIcon,
    Divider,
    Card,
    CardContent,
    Grid,
    Chip
} from '@mui/material';
import {
    Folder as FolderIcon,
    ArrowBack as ArrowBackIcon,
    Delete as DeleteIcon,
    Person as PersonIcon
} from '@mui/icons-material';
import axios from 'axios';

const ADUserImport = () => {
    const [ous, setOUs] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [selectedOU, setSelectedOU] = useState(null);

    const fetchOUs = async () => {
        try {
            setLoading(true);
            setError('');
            const response = await axios.post('/api/fetch-ous');
            setOUs(response.data.ous);
            setSuccess('لیست OUها با موفقیت دریافت شد');
        } catch (err) {
            setError(err.response?.data?.error || 'خطا در دریافت لیست OUها');
        } finally {
            setLoading(false);
        }
    };

    const fetchOUUsers = async (ouName) => {
        try {
            setLoading(true);
            setError('');
            const response = await axios.post('/api/fetch-ou-users', { ou_name: ouName });
            setUsers(response.data.users);
            setSelectedOU(ouName);
            setSuccess(`لیست کاربران OU ${ouName} با موفقیت دریافت شد`);
        } catch (err) {
            setError(err.response?.data?.error || 'خطا در دریافت لیست کاربران');
        } finally {
            setLoading(false);
        }
    };

    const handleOUClick = (ouName) => {
        fetchOUUsers(ouName);
    };

    const handleBackToOUs = () => {
        setSelectedOU(null);
        setUsers([]);
        setSelectedUsers([]);
    };

    const handleUserSelect = (username) => {
        setSelectedUsers(prev => {
            if (prev.includes(username)) {
                return prev.filter(u => u !== username);
            } else {
                return [...prev, username];
            }
        });
    };

    const handleImport = async () => {
        try {
            setLoading(true);
            setError('');
            const response = await axios.post('/api/import-ad-users', {
                users: users.filter(user => selectedUsers.includes(user.username))
            });
            setSuccess(response.data.message);
            setSelectedUsers([]);
        } catch (err) {
            setError(err.response?.data?.error || 'خطا در وارد کردن کاربران');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteDialogOpen = () => {
        setDeleteDialogOpen(true);
    };

    const handleDeleteDialogClose = () => {
        setDeleteDialogOpen(false);
    };

    const deleteAllADUsers = async () => {
        if (!window.confirm('آیا از حذف تمام کاربران وارد شده اطمینان دارید؟')) {
            return;
        }
        try {
            setLoading(true);
            setError('');
            const response = await axios.post('/api/delete-ad-users');
            setSuccess(response.data.message);
            handleDeleteDialogClose();
            setUsers([]);
            setSelectedUsers([]);
            setSelectedOU(null);
        } catch (err) {
            setError(err.response?.data?.error || 'خطا در حذف کاربران');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ p: 3, maxWidth: '1200px', margin: '0 auto' }}>
            <Typography variant="h5" gutterBottom sx={{ 
                fontWeight: 'bold',
                color: '#1a237e',
                marginBottom: '2rem'
            }}>
                مدیریت کاربران Active Directory
            </Typography>

            {error && (
                <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                    {error}
                </Alert>
            )}

            {success && (
                <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>
                    {success}
                </Alert>
            )}

            <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
                <Button
                    variant="contained"
                    onClick={fetchOUs}
                    disabled={loading}
                    sx={{
                        backgroundColor: '#1a237e',
                        '&:hover': {
                            backgroundColor: '#0d47a1'
                        },
                        borderRadius: 2,
                        padding: '8px 24px'
                    }}
                >
                    {loading ? <CircularProgress size={24} /> : 'دریافت لیست OUها'}
                </Button>
                <Button
                    variant="outlined"
                    color="error"
                    onClick={deleteAllADUsers}
                    disabled={loading}
                    sx={{
                        borderRadius: 2,
                        padding: '8px 24px'
                    }}
                >
                    حذف تمام کاربران
                </Button>
            </Box>

            {selectedOU ? (
                <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
                    <CardContent>
                        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
                            <IconButton 
                                onClick={handleBackToOUs}
                                sx={{ 
                                    backgroundColor: '#f5f5f5',
                                    '&:hover': { backgroundColor: '#e0e0e0' }
                                }}
                            >
                                <ArrowBackIcon />
                            </IconButton>
                            <Typography variant="h6" sx={{ color: '#1a237e' }}>
                                کاربران OU: {selectedOU}
                            </Typography>
                        </Box>

                        <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 2 }}>
                            <Table>
                                <TableHead>
                                    <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                                        <TableCell padding="checkbox">
                                            <Checkbox
                                                checked={selectedUsers.length === users.length}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setSelectedUsers(users.map(u => u.username));
                                                    } else {
                                                        setSelectedUsers([]);
                                                    }
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>نام کاربری</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>نام</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {users.map((user) => (
                                        <TableRow 
                                            key={user.username}
                                            sx={{ 
                                                '&:hover': { backgroundColor: '#f8f9fa' },
                                                transition: 'background-color 0.2s'
                                            }}
                                        >
                                            <TableCell padding="checkbox">
                                                <Checkbox
                                                    checked={selectedUsers.includes(user.username)}
                                                    onChange={() => handleUserSelect(user.username)}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <PersonIcon sx={{ color: '#666' }} />
                                                    {user.username}
                                                </Box>
                                            </TableCell>
                                            <TableCell>{user.name}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>

                        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                            <Button
                                variant="contained"
                                onClick={handleImport}
                                disabled={loading || selectedUsers.length === 0}
                                sx={{
                                    backgroundColor: '#1a237e',
                                    '&:hover': {
                                        backgroundColor: '#0d47a1'
                                    },
                                    borderRadius: 2,
                                    padding: '8px 24px'
                                }}
                            >
                                وارد کردن کاربران انتخاب شده
                            </Button>
                        </Box>
                    </CardContent>
                </Card>
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
                                    لیست OUها
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
                                            <FolderIcon sx={{ 
                                                color: '#1a237e',
                                                fontSize: 40,
                                                mb: 1
                                            }} />
                                            <Typography 
                                                variant="subtitle1" 
                                                sx={{ 
                                                    fontWeight: 500,
                                                    color: '#1a237e'
                                                }}
                                            >
                                                {ou.name}
                                            </Typography>
                                        </Card>
                                    ))}
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            )}
        </Box>
    );
};

export default ADUserImport; 