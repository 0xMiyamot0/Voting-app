import React from 'react';
import { Box } from '@mui/material';

function Logo() {
  return (
    <Box
      component="img"
      src="/logo.webp"
      alt="Company Logo"
      sx={{
        height: 80,
        width: 'auto',
        mb: 2,
        display: 'block',
        margin: '0 auto',
      }}
    />
  );
}

export default Logo; 