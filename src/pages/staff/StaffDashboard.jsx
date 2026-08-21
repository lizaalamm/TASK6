import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Paper,
  useTheme,
  Chip,
} from '@mui/material';
import {
  DirectionsCar,
  People,
  Assignment,
  TrendingUp,
  CheckCircle,
  Pending,
} from '@mui/icons-material';
import { getCars } from '../../services/carService';
import { getCustomers } from '../../services/customerService';
import { getApplications, getApplicationStats } from '../../services/applicationService';
import { formatCurrency } from '../../utils/calculations';
import RecentOrders from '../../components/dashboard/RecentOrders';
import RecentActivity from '../../components/dashboard/RecentActivity';

const StaffDashboard = () => {
  const theme = useTheme();
  const [stats, setStats] = useState({
    totalCars: 0,
    availableCars: 0,
    totalCustomers: 0,
    pendingApplications: 0,
    totalApplications: 0,
    completedApplications: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = () => {
    const cars = getCars();
    const customers = getCustomers();
    const apps = getApplications();
    const appStats = getApplicationStats();

    const available = cars.filter(c => c.status === 'Available').length;

    setStats({
      totalCars: cars.length,
      availableCars: available,
      totalCustomers: customers.length,
      pendingApplications: appStats.pending,
      totalApplications: appStats.total,
      completedApplications: appStats.completed,
    });
    setLoading(false);
  };

  const kpiCards = [
    {
      title: 'Total Cars',
      value: stats.totalCars,
      icon: <DirectionsCar sx={{ fontSize: 32 }} />,
      color: theme.palette.primary.main,
    },
    {
      title: 'Available Cars',
      value: stats.availableCars,
      icon: <CheckCircle sx={{ fontSize: 32 }} />,
      color: theme.palette.success.main,
    },
    {
      title: 'Total Customers',
      value: stats.totalCustomers,
      icon: <People sx={{ fontSize: 32 }} />,
      color: theme.palette.info.main,
    },
    {
      title: 'Pending Applications',
      value: stats.pendingApplications,
      icon: <Pending sx={{ fontSize: 32 }} />,
      color: theme.palette.warning.main,
    },
    {
      title: 'Total Applications',
      value: stats.totalApplications,
      icon: <Assignment sx={{ fontSize: 32 }} />,
      color: theme.palette.secondary.main,
    },
    {
      title: 'Completed',
      value: stats.completedApplications,
      icon: <TrendingUp sx={{ fontSize: 32 }} />,
      color: theme.palette.success.main,
    },
  ];

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Sales Dashboard
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Welcome! Here's your sales overview.
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {kpiCards.map((card, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card
              sx={{
                height: '100%',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4,
                },
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography variant="caption" color="textSecondary" gutterBottom>
                      {card.title}
                    </Typography>
                    <Typography variant="h5" fontWeight="bold">
                      {card.value}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      p: 1,
                      borderRadius: 2,
                      bgcolor: `${card.color}15`,
                      color: card.color,
                    }}
                  >
                    {card.icon}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Orders
              </Typography>
              <RecentOrders />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Activity
              </Typography>
              <RecentActivity />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default StaffDashboard;