import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Avatar,
  Chip,
  useTheme,
  Paper,
} from '@mui/material';
import {
  DirectionsCar,
  Assignment,
  Person,
  Storefront,
  TrendingUp,
  CheckCircle,
  Pending,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { getApplicationsByCustomer } from '../../services/applicationService';
import { getAvailableCars } from '../../services/carService';

const CustomerDashboard = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalApplications: 0,
    pending: 0,
    approved: 0,
    completed: 0,
    rejected: 0,
    availableCars: 0,
  });
  const [recentApps, setRecentApps] = useState([]);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = () => {
    const apps = getApplicationsByCustomer(user.id);
    const availableCars = getAvailableCars();

    setStats({
      totalApplications: apps.length,
      pending: apps.filter(a => a.status === 'Pending').length,
      approved: apps.filter(a => a.status === 'Approved').length,
      completed: apps.filter(a => a.status === 'Completed').length,
      rejected: apps.filter(a => a.status === 'Rejected').length,
      availableCars: availableCars.length,
    });

    setRecentApps(apps.slice(0, 3));
  };

  const quickActions = [
    {
      title: 'Browse Showroom',
      icon: <Storefront />,
      color: theme.palette.primary.main,
      onClick: () => navigate('/showroom'),
    },
    {
      title: 'My Applications',
      icon: <Assignment />,
      color: theme.palette.info.main,
      onClick: () => navigate('/my-applications'),
    },
    {
      title: 'My Profile',
      icon: <Person />,
      color: theme.palette.secondary.main,
      onClick: () => navigate('/customer-profile'),
    },
  ];

  return (
    <Box>
      {/* Welcome Section */}
      <Paper
        sx={{
          p: 3,
          mb: 4,
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
          color: 'white',
          borderRadius: 3,
        }}
      >
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Welcome back, {user?.name || 'Customer'}! 👋
        </Typography>
        <Typography variant="body1" sx={{ opacity: 0.9 }}>
          Find your dream car and track your applications.
        </Typography>
      </Paper>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="caption" color="textSecondary">Available Cars</Typography>
              <Typography variant="h4" color="primary">{stats.availableCars}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} md={3}>
          <Card sx={{ borderTop: `4px solid ${theme.palette.info.main}` }}>
            <CardContent>
              <Typography variant="caption" color="textSecondary">My Applications</Typography>
              <Typography variant="h4" color="info.main">{stats.totalApplications}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} md={3}>
          <Card sx={{ borderTop: `4px solid ${theme.palette.warning.main}` }}>
            <CardContent>
              <Typography variant="caption" color="textSecondary">Pending</Typography>
              <Typography variant="h4" color="warning.main">{stats.pending}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} md={3}>
          <Card sx={{ borderTop: `4px solid ${theme.palette.success.main}` }}>
            <CardContent>
              <Typography variant="caption" color="textSecondary">Completed</Typography>
              <Typography variant="h4" color="success.main">{stats.completed}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Typography variant="h6" gutterBottom>
        Quick Actions
      </Typography>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {quickActions.map((action, index) => (
          <Grid item xs={12} sm={4} key={index}>
            <Card
              sx={{
                cursor: 'pointer',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4,
                },
              }}
              onClick={action.onClick}
            >
              <CardContent sx={{ textAlign: 'center' }}>
                <Avatar
                  sx={{
                    width: 56,
                    height: 56,
                    bgcolor: `${action.color}15`,
                    color: action.color,
                    margin: '0 auto 12px',
                  }}
                >
                  {action.icon}
                </Avatar>
                <Typography variant="body1" fontWeight="500">
                  {action.title}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Recent Applications */}
      {recentApps.length > 0 && (
        <>
          <Typography variant="h6" gutterBottom>
            Recent Applications
          </Typography>
          <Grid container spacing={2}>
            {recentApps.map((app) => (
              <Grid item xs={12} md={4} key={app.id}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                      <Avatar
                        variant="rounded"
                        src={app.carImage}
                        sx={{ width: 60, height: 60 }}
                      />
                      <Box>
                        <Typography variant="subtitle2" fontWeight="bold">
                          {app.carMake} {app.carModel}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {app.carVariant}
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Chip
                        label={app.status}
                        size="small"
                        color={
                          app.status === 'Pending' ? 'warning' :
                          app.status === 'Approved' ? 'info' :
                          app.status === 'Completed' ? 'success' : 'error'
                        }
                      />
                      <Typography variant="caption" color="textSecondary">
                        {new Date(app.applicationDate).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </>
      )}
    </Box>
  );
};

export default CustomerDashboard;