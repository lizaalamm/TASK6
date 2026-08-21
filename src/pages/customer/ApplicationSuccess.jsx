import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Paper,
  useTheme,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const ApplicationSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const carName = location.state?.carName || 'your selected car';
  const applicationId = location.state?.applicationId || '';

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '60vh',
      }}
    >
      <Card sx={{ maxWidth: 600, width: '100%', textAlign: 'center' }}>
        <CardContent sx={{ p: 4 }}>
          <CheckCircleIcon
            sx={{
              fontSize: 80,
              color: theme.palette.success.main,
              mb: 2,
            }}
          />
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Application Submitted! 🎉
          </Typography>
          <Typography variant="body1" color="textSecondary" paragraph>
            Your application for <strong>{carName}</strong> has been submitted successfully.
          </Typography>
          {applicationId && (
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                bgcolor: 'background.default',
                mb: 3,
                display: 'inline-block',
              }}
            >
              <Typography variant="caption" color="textSecondary">
                Application ID
              </Typography>
              <Typography variant="h6" fontWeight="bold">
                {applicationId}
              </Typography>
            </Paper>
          )}
          <Typography variant="body2" color="textSecondary" paragraph>
            Our team will review your application and contact you shortly.
            You can track the status in <strong>My Applications</strong>.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              onClick={() => navigate('/my-applications')}
            >
              View My Applications
            </Button>
            <Button
              variant="outlined"
              onClick={() => navigate('/showroom')}
            >
              Browse More Cars
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ApplicationSuccess;