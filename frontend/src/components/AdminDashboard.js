import { 
  HowToVote as VoteIcon,
  // ... other existing imports ...
} from '@mui/icons-material';

function AdminDashboard() {
  // ... existing code ...

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Box sx={{ mb: 4, textAlign: 'center' }}>
            <AdminPanelSettingsIcon sx={{ fontSize: 40, color: '#0078D4', mb: 1 }} />
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
              پنل مدیریت
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              مدیریت کارمندان و نتایج رای‌گیری
            </Typography>
          </Box>

          <Grid container spacing={3}>
            {/* Add Voting Button Card */}
            <Grid item xs={12} md={6} lg={4}>
              <motion.div
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                custom={0}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card
                  elevation={0}
                  sx={{
                    height: '100%',
                    transition: 'all 0.2s',
                    border: '1px solid',
                    borderColor: 'rgba(0,0,0,0.08)',
                    backgroundColor: 'white',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    },
                  }}
                >
                  <CardContent>
                    <Box sx={{ textAlign: 'center', py: 2 }}>
                      <VoteIcon sx={{ fontSize: 40, color: '#0078D4', mb: 2 }} />
                      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                        رای دادن
                      </Typography>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        ارزیابی کارمندان با سیستم امتیازدهی ستاره‌ای
                      </Typography>
                      <Button
                        variant="contained"
                        startIcon={<VoteIcon />}
                        onClick={() => navigate('/voting')}
                        sx={{
                          mt: 2,
                          backgroundColor: '#0078D4',
                          '&:hover': {
                            backgroundColor: '#106EBE',
                          },
                        }}
                      >
                        شروع رای‌دهی
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>

            {/* Existing Cards */}
            <Grid item xs={12} md={6} lg={4}>
              // ... rest of the existing code ...
            </Grid>
          </Grid>
        </motion.div>
      </Box>
    </Container>
  );
}

export default AdminDashboard; 