import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Divider,
  Paper,
  Alert,
  Button,
  useTheme,
} from '@mui/material';
import {
  CheckCircle,
  Pending,
  Cancel,
  HourglassEmpty,
  Done,
  Assignment,
} from '@mui/icons-material';
import { getApplicationsByCustomer } from '../../services/applicationService';
import { useAuth } from '../../context/AuthContext';
import { formatDate } from '../../utils/calculations';

const MyApplications = () => {
  const theme = useTheme();
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadApplications();
    }
  }, [user]);

  const loadApplications = () => {
    const apps = getApplicationsByCustomer(user.id);
    setApplications(apps.sort((a, b) => 
      new Date(b.applicationDate) - new Date(a.applicationDate)
    ));
    setLoading(false);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Pending': return <Pending color="warning" />;
      case 'Approved': return <HourglassEmpty color="info" />;
      case 'Reserved': return <Assignment color="primary" />;
      case 'Completed': return <CheckCircle color="success" />;
      case 'Rejected': return <Cancel color="error" />;
      default: return <Pending />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'warning';
      case 'Approved': return 'info';
      case 'Reserved': return 'primary';
      case 'Completed': return 'success';
      case 'Rejected': return 'error';
      default: return 'default';
    }
  };

  const stats = {
    total: applications.length,
    pending: applications.filter(a => a.status === 'Pending').length,
    approved: applications.filter(a => a.status === 'Approved').length,
    completed: applications.filter(a => a.status === 'Completed').length,
    rejected: applications.filter(a => a.status === 'Rejected').length,
  };

  if (loading) return <Box>Loading...</Box>;

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          My Applications
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Track all your car applications
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={6} md={2.4}>
          <Card>
            <CardContent>
              <Typography variant="caption" color="textSecondary">Total</Typography>
              <Typography variant="h4">{stats.total}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} md={2.4}>
          <Card sx={{ borderTop: `4px solid ${theme.palette.warning.main}` }}>
            <CardContent>
              <Typography variant="caption" color="textSecondary">Pending</Typography>
              <Typography variant="h4" color="warning.main">{stats.pending}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} md={2.4}>
          <Card sx={{ borderTop: `4px solid ${theme.palette.info.main}` }}>
            <CardContent>
              <Typography variant="caption" color="textSecondary">Approved</Typography>
              <Typography variant="h4" color="info.main">{stats.approved}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} md={2.4}>
          <Card sx={{ borderTop: `4px solid ${theme.palette.success.main}` }}>
            <CardContent>
              <Typography variant="caption" color="textSecondary">Completed</Typography>
              <Typography variant="h4" color="success.main">{stats.completed}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} md={2.4}>
          <Card sx={{ borderTop: `4px solid ${theme.palette.error.main}` }}>
            <CardContent>
              <Typography variant="caption" color="textSecondary">Rejected</Typography>
              <Typography variant="h4" color="error.main">{stats.rejected}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {applications.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 8 }}>
            <Assignment sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="textSecondary">
              No applications yet
            </Typography>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              Browse our showroom and apply for a car today!
            </Typography>
            <Button variant="contained" href="/showroom" sx={{ mt: 2 }}>
              Browse Showroom
            </Button>
          </CardContent>
        </Card>
      ) : (
        applications.map((app) => (
          <Card key={app.id} sx={{ mb: 3 }}>
            <CardContent>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={2}>
                  <Box
                    component="img"
                    src={app.carImage || 'https://via.placeholder.com/100x80?text=Car'}
                    alt={`${app.carMake} ${app.carModel}`}
                    sx={{
                      width: '100%',
                      height: 80,
                      objectFit: 'cover',
                      borderRadius: 2,
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="h6" fontWeight="bold">
                    {app.carMake} {app.carModel}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {app.carVariant}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Color: <Chip label={app.selectedColor} size="small" />
                  </Typography>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {getStatusIcon(app.status)}
                    <Chip
                      label={app.status}
                      color={getStatusColor(app.status)}
                      size="small"
                    />
                  </Box>
                  <Typography variant="caption" color="textSecondary">
                    Applied: {formatDate(app.applicationDate)}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="caption" color="textSecondary">
                      Application ID
                    </Typography>
                    <Typography variant="body2" fontWeight="500">
                      {app.id}
                    </Typography>
                    {app.status === 'Completed' && (
                      <Chip
                        label="Delivered ✓"
                        size="small"
                        color="success"
                        sx={{ mt: 1 }}
                      />
                    )}
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        ))
      )}
    </Box>
  );
};

export default MyApplications;