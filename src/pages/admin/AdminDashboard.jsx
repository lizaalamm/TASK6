import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  Divider,
  LinearProgress,
  useTheme,
} from '@mui/material';
import {
  DirectionsCar,
  People,
  Assignment,
  AttachMoney,
  TrendingUp,
  Warning,
  CheckCircle,
  Pending,
} from '@mui/icons-material';
import { getCars } from '../../services/carService';
import { getCustomers } from '../../services/customerService';
import { getApplications, getApplicationStats } from '../../services/applicationService';
import { formatCurrency } from '../../utils/calculations';
import RecentOrders from '../../components/dashboard/RecentOrders';
import RecentActivity from '../../components/dashboard/RecentActivity';

const AdminDashboard = () => {
  const theme = useTheme();
  const [stats, setStats] = useState({
    totalCars: 0,
    availableCars: 0,
    reservedSold: 0,
    totalCustomers: 0,
    pendingApplications: 0,
    estimatedProfit: 0,
    lowStock: 0,
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
    const reservedSold = cars.filter(c => c.status === 'Reserved' || c.status === 'Sold').length;
    const lowStock = cars.filter(c => c.stockQuantity <= 2 && c.status === 'Available').length;

    // Calculate estimated profit
    const totalProfit = cars.reduce((sum, car) => {
      return sum + ((car.sellingPrice || 0) - (car.purchaseRate || 0));
    }, 0);

    setStats({
      totalCars: cars.length,
      availableCars: available,
      reservedSold,
      totalCustomers: customers.length,
      pendingApplications: appStats.pending || 0,
      estimatedProfit: totalProfit,
      lowStock,
    });
    setLoading(false);
  };

  const kpiCards = [
    {
      title: 'Total Cars',
      value: stats.totalCars,
      icon: <DirectionsCar sx={{ fontSize: 32 }} />,
      color: theme.palette.primary.main,
      trend: '+12%',
    },
    {
      title: 'Available Cars',
      value: stats.availableCars,
      icon: <CheckCircle sx={{ fontSize: 32 }} />,
      color: theme.palette.success.main,
      trend: '+5%',
    },
    {
      title: 'Customers',
      value: stats.totalCustomers,
      icon: <People sx={{ fontSize: 32 }} />,
      color: theme.palette.info.main,
      trend: '+8%',
    },
    {
      title: 'Pending Applications',
      value: stats.pendingApplications,
      icon: <Pending sx={{ fontSize: 32 }} />,
      color: theme.palette.warning.main,
      trend: '-3%',
    },
    {
      title: 'Estimated Profit',
      value: formatCurrency(stats.estimatedProfit),
      icon: <AttachMoney sx={{ fontSize: 32 }} />,
      color: theme.palette.success.main,
    },
    {
      title: 'Reserved/Sold',
      value: stats.reservedSold,
      icon: <TrendingUp sx={{ fontSize: 32 }} />,
      color: theme.palette.secondary.main,
    },
  ];

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Typography>Loading dashboard...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Admin Dashboard
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Welcome back! Here's what's happening with your car showroom today.
        </Typography>
      </Box>

      {/* KPI Cards */}
      <Grid container spacing={3}>
        {kpiCards.map((card, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card
              sx={{
                height: '100%',
                transition: 'transform 0.2s, box-shadow 0.2s',
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
                    {card.trend && (
                      <Chip
                        label={card.trend}
                        size="small"
                        color={card.trend.startsWith('+') ? 'success' : 'error'}
                        sx={{ mt: 1 }}
                      />
                    )}
                  </Box>
                  <Box
                    sx={{
                      p: 1.5,
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

      {/* Low Stock Warning */}
      {stats.lowStock > 0 && (
        <Card
          sx={{
            mt: 3,
            bgcolor: theme.palette.warning.light,
            border: `1px solid ${theme.palette.warning.main}`,
          }}
        >
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Warning color="warning" />
              <Typography variant="body1">
                <strong>Warning:</strong> {stats.lowStock} car(s) are running low on stock (≤ 2 units). Please restock soon.
              </Typography>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Recent Activity Section */}
      <Grid container spacing={3} sx={{ mt: 1 }}>
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

export default AdminDashboard;