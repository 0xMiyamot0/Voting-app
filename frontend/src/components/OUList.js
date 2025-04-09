import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Collapse,
    IconButton,
    Paper,
    CircularProgress,
    Alert
} from '@mui/material';
import {
    Folder as FolderIcon,
    FolderOpen as FolderOpenIcon,
    ExpandMore as ExpandMoreIcon,
    ExpandLess as ExpandLessIcon
} from '@mui/icons-material';
import axios from 'axios';

const OUList = () => {
    const [ous, setOus] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [expandedOUs, setExpandedOUs] = useState({});

    const fetchOUs = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await axios.post('/api/fetch-ous');
            setOus(response.data.ous);
            // Initialize expanded state for all OUs
            const expanded = {};
            response.data.ous.forEach(ou => {
                expanded[ou.dn] = false;
            });
            setExpandedOUs(expanded);
        } catch (err) {
            setError('خطا در دریافت لیست OUها');
            console.error(err);
        }
        setLoading(false);
    };

    const handleToggle = (dn) => {
        setExpandedOUs(prev => ({
            ...prev,
            [dn]: !prev[dn]
        }));
    };

    const renderOU = (ou, level = 0) => {
        const isExpanded = expandedOUs[ou.dn];
        const hasChildren = ous.some(otherOU => 
            otherOU.dn !== ou.dn && 
            otherOU.dn.includes(ou.dn)
        );

        return (
            <React.Fragment key={ou.dn}>
                <ListItem 
                    sx={{ 
                        pl: level * 4,
                        borderLeft: '1px solid',
                        borderColor: 'divider',
                        '&:hover': {
                            backgroundColor: 'action.hover',
                        }
                    }}
                >
                    <ListItemIcon>
                        {isExpanded ? <FolderOpenIcon color="primary" /> : <FolderIcon />}
                    </ListItemIcon>
                    <ListItemText
                        primary={ou.name}
                        secondary={ou.description || 'بدون توضیحات'}
                    />
                    {hasChildren && (
                        <IconButton onClick={() => handleToggle(ou.dn)}>
                            {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                        </IconButton>
                    )}
                </ListItem>
                <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding>
                        {ous
                            .filter(childOU => 
                                childOU.dn !== ou.dn && 
                                childOU.dn.includes(ou.dn) &&
                                childOU.dn.replace(ou.dn, '').count(',') === 1
                            )
                            .map(childOU => renderOU(childOU, level + 1))
                        }
                    </List>
                </Collapse>
            </React.Fragment>
        );
    };

    useEffect(() => {
        fetchOUs();
    }, []);

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
                لیست واحدهای سازمانی (OU)
            </Typography>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            {loading ? (
                <CircularProgress />
            ) : (
                <Paper elevation={3} sx={{ mt: 2 }}>
                    <List>
                        {ous
                            .filter(ou => !ous.some(otherOU => 
                                otherOU.dn !== ou.dn && 
                                otherOU.dn.includes(ou.dn)
                            ))
                            .map(rootOU => renderOU(rootOU))
                        }
                    </List>
                </Paper>
            )}
        </Box>
    );
};

export default OUList; 