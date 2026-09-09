/**
 * src/pages/manager/ManagerDashboard.jsx
 * ----------------------------------------------------------------------------
 * Manager workspace (route: `/manager-dashboard`, role: manager).
 * Spec §6 — assigned-only:
 *  - sees ONLY customers/applications where managerId matches their own id
 *  - verify profile/documents → select vehicle → finance plan → payments
 *  - monitors paid amount, remaining balance and overdue installments
 *  - CANNOT transfer customers, approve applications or bypass Super Admin
 * ----------------------------------------------------------------------------
 */
import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Avatar,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Divider,
  Alert,
  Button,
  LinearProgress,
} from '@mui/material';
import {
  People,
  Assignment,
  Payments,
  Warning,
  CheckCircle,
  Refresh,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import {
  fetchApplications,
  fetchOverdueApplications,
} from '../../services/applicationService';
import { fetchPayments } from '../../services/paymentService';
import { APPLICATION_STATUS, normalizeStatus } from '../../constants/applicationStatus';
import ApplicationStatusChip from '../../components/applications/ApplicationStatusChip';
import ApplicationActionButtons from '../../components/applications/ApplicationActionButtons';
import api from '../../services/api';
import { getData } from '../../services/localStorage';

const ManagerDashboard = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [overdue, setOverdue] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const [apps, overdueApps, paymentRows] = await Promise.all([
        fetchApplications({ managerId: user?.id }),
        fetchOverdueApplications(),
        fetchPayments({}).catch(() => []),
      ]);
      // Belt-and-braces: the API already scopes, but never render foreign rows.
      const mine = (apps || []).filter((a) => String(a.managerId) === String(user?.id));
      const mineIds = new Set(mine.map((a) => String(a.id)));
      setApplications(mine);
      setOverdue((overdueApps || []).filter((a) => String(a.managerId) === String(user?.id)));
      setPayments(
        (paymentRows || []).filter(
          (p) => String(p.managerId) === String(user?.id) || mineIds.has(String(p.applicationId))
        )
      );

      // Assigned customers: API first, local cache fallback.
      try {
        const res = await api.get('/users/user', { params: { userType: 'customer' } });
        const rows = res.data?.data || [];
        setCustomers(rows.filter((c) => String(c.managerId) === String(user?.id)));
      } catch {
        const local = getData('udevs_customers', []);
        const ids = new Set(mine.map((a) => String(a.customerId)));
        setCustomers(local.filter((c) => ids.has(String(c.id))));
      }
    } catch (err) {
      setError(err?.message || 'Could not load your workspace.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleUpdated = (updated) => {
    if (!updated) {
      load();
      return;
    }
    setApplications((prev) => prev.map((a) => (String(a.id) === String(updated.id) ? updated : a)));
  };

  const collected = payments
    .filter((p) => p.status === 'paid')
    .reduce((sum, p) => sum + Number(p.amount || 0), 0);
  const outstanding = applications.reduce((sum, a) => sum + Number(a.remainingBalance || 0), 0);

  const stats = [
    { label: 'Assigned Customers', value: customers.length, icon: <People />, color: '#1565C0' },
    { label: 'Assigned Applications', value: applications.length, icon: <Assignment />, color: '#00838F' },
    { label: 'Overdue Installments', value: overdue.length, icon: <Warning />, color: '#EF6C00' },
    { label: 'Collected (PKR)', value: collected.toLocaleString(), icon: <Payments />, color: '#2E7D32' },
  ];

  return (
    <Box className="page-enter">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight={800}>
            Manager Dashboard
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Welcome, {user?.name} — your assigned-only workspace.
            <Chip label="ASSIGNED ONLY" size="small" sx={{ ml: 1, fontWeight: 700 }} color="info" />
          </Typography>
        </Box>
        <Button variant="outlined" startIcon={<Refresh />} onClick={load} disabled={loading}>
          Refresh
        </Button>
      </Box>

      {loading && <LinearProgress sx={{ mb: 2 }} />}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* KPI cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {stats.map((s) => (
          <Grid item xs={12} sm={6} md={3} key={s.label}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="caption" color="textSecondary" fontWeight={600}>
                      {s.label.toUpperCase()}
                    </Typography>
                    <Typography variant="h5" fontWeight={800}>{s.value}</Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: `${s.color}18`, color: s.color }}>{s.icon}</Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Outstanding banner */}
      <Alert severity={outstanding > 0 ? 'warning' : 'success'} sx={{ mb: 3 }}>
        Outstanding balance across your portfolio: <strong>PKR {outstanding.toLocaleString()}</strong>
      </Alert>

      {/* Assigned applications */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={700}>Assigned Applications</Typography>
          <Typography variant="caption" color="textSecondary">
            Verify documents, select vehicles, configure finance plans and record payments.
            Approval and completion stay with the Super Admin.
          </Typography>
          <Divider sx={{ my: 2 }} />
          <TableContainer component={Paper} elevation={0}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell><strong>ID</strong></TableCell>
                  <TableCell><strong>Customer</strong></TableCell>
                  <TableCell><strong>Vehicle</strong></TableCell>
                  <TableCell><strong>Status</strong></TableCell>
                  <TableCell><strong>Paid / Remaining</strong></TableCell>
                  <TableCell align="center"><strong>Actions</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {applications.map((app) => (
                  <TableRow key={app.id} hover>
                    <TableCell>{app.id}</TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {app.customerName || `${app.firstName || ''} ${app.lastName || ''}`.trim() || 'Customer'}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">{app.email}</Typography>
                    </TableCell>
                    <TableCell>
                      {app.carMake ? `${app.carMake} ${app.carModel || ''}` : <em>Not selected</em>}
                      {app.vehiclePrice ? (
                        <Typography variant="caption" display="block" color="textSecondary">
                          PKR {Number(app.vehiclePrice).toLocaleString()}
                        </Typography>
                      ) : null}
                    </TableCell>
                    <TableCell><ApplicationStatusChip status={app.status} /></TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {Number(app.paidAmount || 0).toLocaleString()} / {Number(app.remainingBalance || 0).toLocaleString()}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <ApplicationActionButtons user={user} app={app} onUpdated={handleUpdated} compact />
                    </TableCell>
                  </TableRow>
                ))}
                {applications.length === 0 && !loading && (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                      <CheckCircle color="success" sx={{ fontSize: 40, mb: 1 }} />
                      <Typography color="textSecondary">
                        No customers assigned yet — the Super Admin assigns cases after approval.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Assigned customers + overdue side by side */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" fontWeight={700}>Assigned Customers</Typography>
              <Divider sx={{ my: 2 }} />
              {customers.length === 0 ? (
                <Typography color="textSecondary">No assigned customers.</Typography>
              ) : (
                customers.map((c) => (
                  <Box key={c.id} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                    <Avatar sx={{ bgcolor: '#00838F' }}>{c.name?.charAt(0) || 'C'}</Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" fontWeight={600}>{c.name}</Typography>
                      <Typography variant="caption" color="textSecondary">{c.email} · {c.phone || 'no phone'}</Typography>
                    </Box>
                    <Chip label={c.cnic ? 'Docs on file' : 'Docs missing'} size="small" color={c.cnic ? 'success' : 'warning'} />
                  </Box>
                ))
              )}
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" fontWeight={700}>Overdue Installments</Typography>
              <Divider sx={{ my: 2 }} />
              {overdue.length === 0 ? (
                <Typography color="textSecondary">Nothing overdue — well done.</Typography>
              ) : (
                overdue.map((app) => (
                  <Box key={app.id} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                    <Avatar sx={{ bgcolor: '#EF6C00' }}><Warning /></Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" fontWeight={600}>
                        #{app.id} — {app.customerName || app.email}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        Due {app.nextDueDate ? new Date(app.nextDueDate).toLocaleDateString() : '—'} ·
                        PKR {Number(app.remainingBalance || 0).toLocaleString()} remaining
                      </Typography>
                    </Box>
                    <Chip label={normalizeStatus(app.status) === APPLICATION_STATUS.PAYMENT_IN_PROGRESS ? 'Collect' : 'Plan due'} size="small" color="warning" />
                  </Box>
                ))
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ManagerDashboard;
