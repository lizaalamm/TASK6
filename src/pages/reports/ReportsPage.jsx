import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemText,
  Chip,
  useTheme,
} from '@mui/material';
import {
  DirectionsCar,
  AttachMoney,
  People,
  Assignment,
  TrendingUp,
  Storefront,
} from '@mui/icons-material';
import { getCars } from '../../services/carService';
import { getSuppliers } from '../../services/supplierService';
import { getCustomers } from '../../services/customerService';
import { getApplications, getApplicationStats } from '../../services/applicationService';
import { formatCurrency } from '../../utils/calculations';

const ReportsPage = () => {
  const theme = useTheme();
  const [reports, setReports] = useState({
    inventory: {},
    profit: {},
    suppliers: {},
    applications: {},
    customers: {},
    activity: {},
  });

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = () => {
    const cars = getCars();
    const suppliers = getSuppliers();
    const customers = getCustomers();
    const apps = getApplications();
    const appStats = getApplicationStats();

    // Inventory Report
    const inventory = {
      total: cars.length,
      available: cars.filter(c => c.status === 'Available').length,
      reserved: cars.filter(c => c.status === 'Reserved').length,
      sold: cars.filter(c => c.status === 'Sold').length,
      inactive: cars.filter(c => c.status === 'Inactive').length,
      byMake: {},
    };
    cars.forEach(car => {
      if (!inventory.byMake[car.make]) {
        inventory.byMake[car.make] = 0;
      }
      inventory.byMake[car.make]++;
    });

    // Profit Report
    const profit = {
      totalPurchase: 0,
      totalSelling: 0,
      totalProfit: 0,
      averageMargin: 0,
    };
    cars.forEach(car => {
      profit.totalPurchase += car.purchaseRate || 0;
      profit.totalSelling += car.sellingPrice || 0;
      profit.totalProfit += (car.sellingPrice || 0) - (car.purchaseRate || 0);
    });
    profit.averageMargin = profit.totalSelling > 0 
      ? ((profit.totalProfit / profit.totalSelling) * 100) 
      : 0;

    setReports({
      inventory,
      profit,
      suppliers: {
        total: suppliers.length,
        active: suppliers.filter(s => s.status === 'Active').length,
        inactive: suppliers.filter(s => s.status === 'Inactive').length,
      },
      applications: appStats,
      customers: {
        total: customers.length,
        withApplications: customers.filter(c => 
          apps.some(a => a.customerId === c.id)
        ).length,
      },
      activity: {
        totalOrders: apps.length,
      },
    });
  };

  const reportCards = [
    {
      title: 'Inventory Overview',
      icon: <DirectionsCar sx={{ fontSize: 32 }} />,
      color: theme.palette.primary.main,
      stats: [
        { label: 'Total Cars', value: reports.inventory.total || 0 },
        { label: 'Available', value: reports.inventory.available || 0 },
        { label: 'Reserved', value: reports.inventory.reserved || 0 },
        { label: 'Sold', value: reports.inventory.sold || 0 },
      ],
    },
    {
      title: 'Profit Analysis',
      icon: <AttachMoney sx={{ fontSize: 32 }} />,
      color: theme.palette.success.main,
      stats: [
        { label: 'Total Profit', value: formatCurrency(reports.profit.totalProfit || 0) },
        { label: 'Avg Margin', value: `${reports.profit.averageMargin?.toFixed(1) || 0}%` },
        { label: 'Total Purchase', value: formatCurrency(reports.profit.totalPurchase || 0) },
        { label: 'Total Selling', value: formatCurrency(reports.profit.totalSelling || 0) },
      ],
    },
    {
      title: 'Applications',
      icon: <Assignment sx={{ fontSize: 32 }} />,
      color: theme.palette.info.main,
      stats: [
        { label: 'Pending', value: reports.applications.pending || 0 },
        { label: 'Approved', value: reports.applications.approved || 0 },
        { label: 'Completed', value: reports.applications.completed || 0 },
        { label: 'Rejected', value: reports.applications.rejected || 0 },
      ],
    },
    {
      title: 'Customers & Suppliers',
      icon: <People sx={{ fontSize: 32 }} />,
      color: theme.palette.secondary.main,
      stats: [
        { label: 'Total Customers', value: reports.customers.total || 0 },
        { label: 'Active Customers', value: reports.customers.withApplications || 0 },
        { label: 'Total Suppliers', value: reports.suppliers.total || 0 },
        { label: 'Active Suppliers', value: reports.suppliers.active || 0 },
      ],
    },
  ];

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Reports & Analytics
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Comprehensive overview of your car showroom performance
        </Typography>
      </Box>

      {/* Report Cards */}
      <Grid container spacing={3}>
        {reportCards.map((card, index) => (
          <Grid item xs={12} md={6} key={index}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
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
                  <Typography variant="h6">{card.title}</Typography>
                </Box>
                <Grid container spacing={2}>
                  {card.stats.map((stat, idx) => (
                    <Grid item xs={6} key={idx}>
                      <Paper
                        variant="outlined"
                        sx={{
                          p: 1.5,
                          textAlign: 'center',
                          bgcolor: 'background.default',
                        }}
                      >
                        <Typography variant="caption" color="textSecondary">
                          {stat.label}
                        </Typography>
                        <Typography variant="h6" fontWeight="bold">
                          {stat.value}
                        </Typography>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Inventory by Make */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Inventory by Make
          </Typography>
          <Grid container spacing={2}>
            {Object.entries(reports.inventory.byMake || {}).map(([make, count]) => (
              <Grid item xs={6} sm={4} md={3} key={make}>
                <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="subtitle2">{make}</Typography>
                  <Chip label={count} color="primary" size="small" sx={{ mt: 1 }} />
                </Paper>
              </Grid>
            ))}
            {Object.keys(reports.inventory.byMake || {}).length === 0 && (
              <Grid item xs={12}>
                <Typography color="textSecondary">No cars in inventory</Typography>
              </Grid>
            )}
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ReportsPage;