/**
 * src/pages/admin/AdminDashboard.jsx
 * ----------------------------------------------------------------------------
 * Staff home dashboard (route: `/dashboard`).
 * Aggregates the local showroom catalogue (cars / customers / applications)
 * into KPI cards, a low-stock warning and recent-activity panels.
 * ----------------------------------------------------------------------------
 */
import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
  Chip,
  Avatar,
  Alert,
} from '@mui/material';
import {
  DirectionsCar,
  People,
  Pending,
  AttachMoney,
  TrendingUp,
  Warning,
  CheckCircle,
} from '@mui/icons-material';
import { getCars } from '../../services/carService';
import { getCustomers } from '../../services/customerService';
import { getApplications, getApplicationStats } from '../../services/applicationService';
import { formatCurrency } from '../../utils/calculations';
import RecentOrders from '../../components/dashboard/RecentOrders';
import RecentActivity from '../../components/dashboard/RecentActivity';

const AdminDashboard = () => {
  // --- Dashboard aggregates ------------------------------------------------------
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

  // Compute aggregates once on mount.
  useEffect(() => {
    loadDashboardData();
  }, []);

  /**
   * Pull the local catalogues and reduce them into dashboard numbers:
   * availability counts, low-stock warnings and total estimated profit
   * (selling price − purchase rate, summed over every car).
   */
  const loadDashboardData = () => {
    const cars = getCars();
    const customers = getCustomers();
    const apps = getApplications();
    const appStats = getApplicationStats();
    void apps; // loaded for downstream widgets; counts come from appStats

    const available = cars.filter((c) => c.status === 'Available').length;
    const reservedSold = cars.filter(
      (c) => c.status === 'Reserved' || c.status === 'Sold'
    ).length;
    const lowStock = cars.filter(
      (c) => c.stockQuantity <= 2 && c.status === 'Available'
    ).length;

    // Estimated profit across the whole catalogue.
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

  // --- KPI card definitions (gradient + icon + optional trend chip) ---------------
  const kpiCards = [
    {
      title: 'Total Cars',
      value: stats.totalCars,
      icon: <DirectionsCar sx={{ fontSize: 30 }} />,
      gradient: 'linear-gradient(135deg, #5D4037 0%, #A1887F 100%)',
      trend: '+12%',
    },
    {
      title: 'Available Cars',
      value: stats.availableCars,
      icon: <CheckCircle sx={{ fontSize: 30 }} />,
      gradient: 'linear-gradient(135deg, #2E7D32 0%, #66BB6A 100%)',
      trend: '+5%',
    },
    {
      title: 'Customers',
      value: stats.totalCustomers,
      icon: <People sx={{ fontSize: 30 }} />,
      gradient: 'linear-gradient(135deg, #1565C0 0%, #64B5F6 100%)',
      trend: '+8%',
    },
    {
      title: 'Pending Applications',
      value: stats.pendingApplications,
      icon: <Pending sx={{ fontSize: 30 }} />,
      gradient: 'linear-gradient(135deg, #EF6C00 0%, #FFB74D 100%)',
      trend: '-3%',
    },
    {
      title: 'Estimated Profit',
      value: formatCurrency(stats.estimatedProfit),
      icon: <AttachMoney sx={{ fontSize: 30 }} />,
      gradient: 'linear-gradient(135deg, #B07C24 0%, #E3B96B 100%)',
    },
    {
      title: 'Reserved / Sold',
      value: stats.reservedSold,
      icon: <TrendingUp sx={{ fontSize: 30 }} />,
      gradient: 'linear-gradient(135deg, #7B1FA2 0%, #BA68C8 100%)',
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
    <Box className="page-enter">
      {/* Page header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight={800} gutterBottom>
          Admin Dashboard <Chip label="LIMITED" size="small" color="warning" sx={{ ml: 1, fontWeight: 700 }} />
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Welcome back! Here&apos;s what&apos;s happening with your car showroom today.
        </Typography>
      </Box>

      {/* Spec §5 — Admin operates within Super-Admin-granted modules only. */}
      <Alert severity="info" sx={{ mb: 3 }}>
        Limited operational access: application approval, manager assignment and order
        completion are reserved for the Super Admin. All actions are verified on the server.
      </Alert>

      {/* KPI cards with staggered entrance */}
      <Grid container spacing={3}>
        {kpiCards.map((card, index) => (
          <Grid item xs={12} sm={6} md={4} key={card.title}>
            <Card
              className="kpi-glow"
              sx={{
                height: '100%',
                background: card.gradient,
                color: '#fff',
                animation: `fadeUp .5s ease ${index * 0.07}s both`,
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography variant="caption" sx={{ opacity: 0.85, fontWeight: 600 }} gutterBottom display="block">
                      {card.title.toUpperCase()}
                    </Typography>
                    <Typography variant="h5" fontWeight={800}>
                      {card.value}
                    </Typography>
                    {card.trend && (
                      <Chip
                        label={card.trend}
                        size="small"
                        sx={{
                          mt: 1,
                          fontWeight: 700,
                          color: '#fff',
                          backgroundColor: 'rgba(255,255,255,.25)',
                        }}
                      />
                    )}
                  </Box>
                  <Avatar sx={{ bgcolor: 'rgba(255,255,255,.22)', width: 54, height: 54 }}>
                    {card.icon}
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Low-stock warning banner */}
      {stats.lowStock > 0 && (
        <Card
          className="stagger-4"
          sx={{
            mt: 3,
            background: 'linear-gradient(135deg, rgba(239,108,0,.12) 0%, rgba(255,183,77,.12) 100%)',
            border: '1px solid #EF6C00',
          }}
        >
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ background: 'linear-gradient(135deg, #EF6C00, #FFB74D)' }}>
                <Warning />
              </Avatar>
              <Typography variant="body1">
                <strong>Warning:</strong> {stats.lowStock} car(s) are running low on
                stock (≤ 2 units). Please restock soon.
              </Typography>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Recent orders + activity side-by-side */}
      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={700} gutterBottom>
                Recent Orders
              </Typography>
              <RecentOrders />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={700} gutterBottom>
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
