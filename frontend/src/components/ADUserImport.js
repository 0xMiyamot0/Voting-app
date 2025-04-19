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
    Chip,
    Select,
    MenuItem,
    FormControl,
    InputLabel
} from '@mui/material';
import {
    Folder as FolderIcon,
    ArrowBack as ArrowBackIcon,
    Delete as DeleteIcon,
    Person as PersonIcon,
    Business as BusinessIcon
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
    const [openGroupDialog, setOpenGroupDialog] = useState(false);
    const [selectedTargetGroup, setSelectedTargetGroup] = useState('');
    const [availableGroups] = useState([
        { name: 'zmg', label: 'زرین معدن آسیا' },
        { name: 'airmat', label: 'آیرمت' },
        { name: 'bazargani', label: 'بازرگانی' },
        { name: 'etemad', label: 'اعتماد ایرانیان' },
        { name: 'flat', label: 'فلات زرین کیمیا' },
        { name: 'lead', label: 'سرب و روی ایرانیان' },
        { name: 'it', label: 'فناوری اطلاعات' },
        { name: 'gostaresh', label: 'گسترش روی ایرانیان' },
        { name: 'kimia', label: 'کیمیای زنجان گستران' },
        { name: 'legal', label: 'واحد حقوقی' },
        { name: 'mahdiabad', label: 'مهدی آباد' },
        { name: 'middleeast', label: 'خاورمیانه' },
        { name: 'management', label: 'مدیریت' },
        { name: 'office', label: 'مسئولین دفاتر' },
        { name: 'simin', label: 'سیمین معدن' },
        { name: 'procurement', label: 'تدارکات' },
        { name: 'zobgaran', label: 'ذوبگران رنگین فلز' },
        { name: 'caspian', label: 'زرین روی کاسپین' },
        { name: 'transport', label: 'زرین ترابر' },
        { name: 'other', label: 'سایر' }
    ]);

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
        if (!selectedTargetGroup) {
            setOpenGroupDialog(true);
            return;
        }

        try {
            setLoading(true);
            setError('');
            const response = await axios.post('/api/import-ad-users', {
                users: users.filter(user => selectedUsers.includes(user.username)),
                target_group: selectedTargetGroup
            });
            setSuccess(response.data.message);
            setSelectedUsers([]);
            setSelectedTargetGroup('');
            setOpenGroupDialog(false);
        } catch (err) {
            setError(err.response?.data?.error || 'خطا در وارد کردن کاربران');
        } finally {
            setLoading(false);
        }
    };

    const handleGroupSelect = () => {
        if (!selectedTargetGroup) {
            setError('لطفا یک گروه را انتخاب کنید');
            return;
        }
        handleImport();
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
                    onClick={handleDeleteDialogOpen}
                    disabled={loading}
                    sx={{
                        borderRadius: 2,
                        padding: '8px 24px'
                    }}
                >
                    حذف تمام کاربران
                </Button>
            </Box>

            {!selectedOU && (
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

            {selectedOU && users.length > 0 && (
                <Card sx={{ borderRadius: 2, boxShadow: 3, mt: 3 }}>
                    <CardContent>
                        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
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
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <FormControl sx={{ minWidth: 200 }}>
                                    <InputLabel>انتخاب دسته‌بندی</InputLabel>
                                    <Select
                                        value={selectedTargetGroup}
                                        onChange={(e) => setSelectedTargetGroup(e.target.value)}
                                        label="انتخاب دسته‌بندی"
                                        sx={{ 
                                            backgroundColor: 'white',
                                            borderRadius: 2
                                        }}
                                    >
                                        {availableGroups.map((group) => (
                                            <MenuItem key={group.name} value={group.name}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <BusinessIcon sx={{ fontSize: 20 }} />
                                                    <Typography>{group.label}</Typography>
                                                </Box>
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                                <Button
                                    variant="contained"
                                    onClick={handleImport}
                                    disabled={!selectedTargetGroup || selectedUsers.length === 0}
                                    sx={{
                                        backgroundColor: '#1a237e',
                                        '&:hover': {
                                            backgroundColor: '#0d47a1'
                                        },
                                        borderRadius: 2,
                                        padding: '8px 24px'
                                    }}
                                >
                                    {loading ? <CircularProgress size={24} /> : 'وارد کردن کاربران'}
                                </Button>
                            </Box>
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
                                                        setSelectedUsers(users.map(user => user.username));
                                                    } else {
                                                        setSelectedUsers([]);
                                                    }
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell>نام کاربری</TableCell>
                                        <TableCell>نام</TableCell>
                                        <TableCell>نام خانوادگی</TableCell>
                                        <TableCell>ایمیل</TableCell>
                                        <TableCell>دسته‌بندی</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {users.map((user) => (
                                        <TableRow key={user.username}>
                                            <TableCell padding="checkbox">
                                                <Checkbox
                                                    checked={selectedUsers.includes(user.username)}
                                                    onChange={() => handleUserSelect(user.username)}
                                                />
                                            </TableCell>
                                            <TableCell>{user.username}</TableCell>
                                            <TableCell>{user.firstName}</TableCell>
                                            <TableCell>{user.lastName}</TableCell>
                                            <TableCell>{user.email}</TableCell>
                                            <TableCell>
                                                {user.department ? (
                                                    <Chip
                                                        label={availableGroups.find(g => g.name === user.department)?.label || user.department}
                                                        color="primary"
                                                        size="small"
                                                        sx={{ borderRadius: 1 }}
                                                    />
                                                ) : (
                                                    <Chip
                                                        label="بدون دسته‌بندی"
                                                        color="default"
                                                        size="small"
                                                        sx={{ borderRadius: 1 }}
                                                    />
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </CardContent>
                </Card>
            )}

            {/* Group Selection Dialog */}
            <Dialog 
                open={openGroupDialog} 
                onClose={() => setOpenGroupDialog(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>انتخاب گروه</DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ mb: 2 }}>
                        لطفا گروهی که می‌خواهید کاربران در آن قرار بگیرند را انتخاب کنید.
                    </DialogContentText>
                    <Grid container spacing={2}>
                        {availableGroups.map((group) => (
                            <Grid item xs={12} sm={6} key={group.name}>
                                <Card 
                                    onClick={() => setSelectedTargetGroup(group.name)}
                                    sx={{
                                        cursor: 'pointer',
                                        border: selectedTargetGroup === group.name ? '2px solid #1a237e' : '1px solid rgba(0,0,0,0.12)',
                                        borderRadius: 2,
                                        p: 2,
                                        transition: 'all 0.2s',
                                        '&:hover': {
                                            transform: 'translateY(-2px)',
                                            boxShadow: 2
                                        }
                                    }}
                                >
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <FolderIcon sx={{ color: '#1a237e' }} />
                                        <Typography>{group.label}</Typography>
                                    </Box>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenGroupDialog(false)}>انصراف</Button>
                    <Button 
                        onClick={handleGroupSelect}
                        variant="contained"
                        disabled={!selectedTargetGroup}
                        sx={{
                            backgroundColor: '#1a237e',
                            '&:hover': {
                                backgroundColor: '#0d47a1'
                            }
                        }}
                    >
                        تایید و وارد کردن
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ADUserImport; 