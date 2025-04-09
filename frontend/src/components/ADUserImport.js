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
    FormControlLabel,
    FormGroup
} from '@mui/material';
import axios from 'axios';

const ADUserImport = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [selectedUsers, setSelectedUsers] = useState([]);

    const fetchADUsers = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await axios.post('/api/fetch-ad-users');
            setUsers(response.data.users);
            setSelectedUsers(new Array(response.data.users.length).fill(true));
        } catch (err) {
            setError('خطا در دریافت اطلاعات کاربران از Active Directory');
            console.error(err);
        }
        setLoading(false);
    };

    const handleSelectAll = (event) => {
        setSelectedUsers(new Array(users.length).fill(event.target.checked));
    };

    const handleSelectUser = (index) => {
        const newSelected = [...selectedUsers];
        newSelected[index] = !newSelected[index];
        setSelectedUsers(newSelected);
    };

    const importUsers = async () => {
        setLoading(true);
        setError('');
        setSuccess('');
        
        const usersToImport = users.filter((_, index) => selectedUsers[index]);
        
        try {
            const response = await axios.post('/api/import-ad-users', {
                users: usersToImport
            });
            setSuccess(response.data.message);
            setUsers([]);
            setSelectedUsers([]);
        } catch (err) {
            setError('خطا در وارد کردن کاربران');
            console.error(err);
        }
        setLoading(false);
    };

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
                وارد کردن کاربران از Active Directory
            </Typography>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            {success && (
                <Alert severity="success" sx={{ mb: 2 }}>
                    {success}
                </Alert>
            )}

            <Box sx={{ mb: 2 }}>
                <Button
                    variant="contained"
                    onClick={fetchADUsers}
                    disabled={loading}
                    sx={{ mr: 2 }}
                >
                    دریافت کاربران از AD
                </Button>
                {users.length > 0 && (
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={importUsers}
                        disabled={loading || !selectedUsers.some(selected => selected)}
                    >
                        وارد کردن کاربران انتخاب شده
                    </Button>
                )}
            </Box>

            {loading && <CircularProgress />}

            {users.length > 0 && (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={selectedUsers.every(selected => selected)}
                                                indeterminate={selectedUsers.some(selected => selected) && !selectedUsers.every(selected => selected)}
                                                onChange={handleSelectAll}
                                            />
                                        }
                                        label="انتخاب همه"
                                    />
                                </TableCell>
                                <TableCell>نام کاربری</TableCell>
                                <TableCell>نام</TableCell>
                                <TableCell>دپارتمان</TableCell>
                                <TableCell>ایمیل</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {users.map((user, index) => (
                                <TableRow key={user.username}>
                                    <TableCell>
                                        <Checkbox
                                            checked={selectedUsers[index]}
                                            onChange={() => handleSelectUser(index)}
                                        />
                                    </TableCell>
                                    <TableCell>{user.username}</TableCell>
                                    <TableCell>{user.name}</TableCell>
                                    <TableCell>{user.department}</TableCell>
                                    <TableCell>{user.email}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </Box>
    );
};

export default ADUserImport; 