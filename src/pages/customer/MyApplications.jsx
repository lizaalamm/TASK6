/**
 * src/pages/customer/MyApplications.jsx
 * ----------------------------------------------------------------------------
 * Customer application tracker (route: `/my-applications`, own data only).
 * Spec §7 — the customer views application status, assigned manager, selected
 * vehicle, price, down payment, installment amount/duration, paid amount,
 * remaining balance and payment history. Customers cannot approve, assign
 * managers, change roles or edit official financial totals.
 * ----------------------------------------------------------------------------
 */
import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Divider,
  Button,
  Stepper,
  Step,
  StepLabel,
  LinearProgress,
  Alert,
} from '@mui/material';
import { Assignment } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { fetchApplications } from '../../services/applicationService';
import { fetchPayments } from '../../services/paymentService';
import {
  STATUS_FLOW,
  normalizeStatus,
  statusStep,
  statusLabel,
} from '../../constants/applicationStatus';
import { APPLICATION_STATUS } from '../../constants/applicationStatus';
import ApplicationStatusChip from '../../components/applications/ApplicationStatusChip';
import ApplicationActionButtons from '../../components/applications/ApplicationActionButtons';
import { formatDate } from '../../utils/calculations';

const MyApplications = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [paymentsByApp, setPaymentsByApp] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const apps = await fetchApplications({ customerId: user?.id });
      // Own data only — never render another customer's rows.
      const mine = (apps || []).filter((a) => String(a.customerId) === String(user?.id));
      mine.sort((a, b) => new Date(b.applicationDate || b.createdAt) - new Date(a.applicationDate || a.createdAt));
      setApplications(mine);
      const map = {};
      await Promise.all(
        mine.map(async (app) => {
          try {
            map[app.id] = app.payments || (await fetchPayments({ applicationId: app.id }));
          } catch {
            map[app.id] = app.payments || [];
          }
        })
      );
      setPaymentsByApp(map);
    } catch (err) {
      setError(err?.message || 'Could not load your applications.');
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

  const stats = {
    total: applications.length,
    pending: applications.filter((a) => normalizeStatus(a.status) === APPLICATION_STATUS.PENDING).length,
    active: applications.filter((a) => {
      const step = statusStep(a.status);
      return step >= 2 && step <= 8;
    }).length,
    completed: applications.filter((a) => normalizeStatus(a.status) === APPLICATION_STATUS.COMPLETE).length,
  };

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          My Applications
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Track status, assigned manager, vehicle, finance plan and payments.
        </Typography>
      </Box>

      {loading && <LinearProgress sx={{ mb: 2 }} />}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[
          { label: 'Total', value: stats.total },
          { label: 'Pending', value: stats.pending },
          { label: 'In Progress', value: stats.active },
          { label: 'Completed', value: stats.completed },
        ].map((s) => (
          <Grid item xs={6} md={3} key={s.label}>
            <Card>
              <CardContent>
                <Typography variant="caption" color="textSecondary">{s.label}</Typography>
                <Typography variant="h4">{s.value}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {applications.length === 0 && !loading ? (
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
        applications.map((app) => {
          const payments = paymentsByApp[app.id] || [];
          const progress =
            Number(app.totalPayable) > 0
              ? Math.min(100, (Number(app.paidAmount || 0) / Number(app.totalPayable)) * 100)
              : 0;
          return (
            <Card key={app.id} sx={{ mb: 3 }}>
              <CardContent>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} md={2}>
                    <Box
                      component="img"
                      src={app.carImage || 'https://via.placeholder.com/100x80?text=Car'}
                      alt={`${app.carMake} ${app.carModel}`}
                      sx={{ width: '100%', height: 80, objectFit: 'cover', borderRadius: 2 }}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="h6" fontWeight="bold">
                      {app.carMake ? `${app.carMake} ${app.carModel}` : 'Vehicle to be selected'}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {app.carVariant || 'Your manager will help you choose'} · {app.selectedColor || 'No colour'}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      Applied: {formatDate(app.applicationDate || app.createdAt)} · ID {app.id}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <ApplicationStatusChip status={app.status} />
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      Manager: <strong>{app.managerName || (app.managerId ? `#${app.managerId}` : 'Not assigned yet')}</strong>
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <ApplicationActionButtons user={user} app={app} onUpdated={handleUpdated} />
                  </Grid>
                </Grid>

                <Stepper activeStep={statusStep(app.status) - 1} alternativeLabel sx={{ mt: 3 }}>
                  {STATUS_FLOW.map((s) => (
                    <Step key={s}><StepLabel>{statusLabel(s)}</StepLabel></Step>
                  ))}
                </Stepper>

                {Number(app.totalPayable || 0) > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Grid container spacing={2}>
                      <Grid item xs={6} md={3}>
                        <Typography variant="caption" color="textSecondary">Vehicle Price</Typography>
                        <Typography variant="body1" fontWeight={700}>
                          PKR {Number(app.vehiclePrice || 0).toLocaleString()}
                        </Typography>
                      </Grid>
                      <Grid item xs={6} md={3}>
                        <Typography variant="caption" color="textSecondary">Down Payment</Typography>
                        <Typography variant="body1" fontWeight={700}>
                          PKR {Number(app.downPayment || 0).toLocaleString()}
                        </Typography>
                      </Grid>
                      <Grid item xs={6} md={3}>
                        <Typography variant="caption" color="textSecondary">Installment</Typography>
                        <Typography variant="body1" fontWeight={700}>
                          PKR {Number(app.installmentAmount || 0).toLocaleString()} × {app.installmentDuration || 0}
                        </Typography>
                      </Grid>
                      <Grid item xs={6} md={3}>
                        <Typography variant="caption" color="textSecondary">Remaining</Typography>
                        <Typography variant="body1" fontWeight={700} color="warning.main">
                          PKR {Number(app.remainingBalance || 0).toLocaleString()}
                        </Typography>
                      </Grid>
                    </Grid>
                    <LinearProgress variant="determinate" value={progress} sx={{ mt: 1, height: 8, borderRadius: 4 }} />
                    <Typography variant="caption" color="textSecondary">
                      Paid PKR {Number(app.paidAmount || 0).toLocaleString()} of PKR {Number(app.totalPayable || 0).toLocaleString()}
                      {app.nextDueDate && ` · Next due ${formatDate(app.nextDueDate)}`}
                    </Typography>
                  </Box>
                )}

                {payments.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Divider sx={{ mb: 1 }} />
                    <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                      Payment History
                    </Typography>
                    {payments.map((p) => (
                      <Box key={p.id} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
                        <Typography variant="body2" color="textSecondary">
                          {formatDate(p.paidAt || p.createdAt)} · {p.type} · {p.method} · {p.receiptNo}
                        </Typography>
                        <Typography variant="body2" fontWeight={700}>
                          PKR {Number(p.amount || 0).toLocaleString()}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                )}

                {app.rejectionReason && (
                  <Alert severity="error" sx={{ mt: 2 }}>
                    Rejected: {app.rejectionReason} — update your details and resubmit.
                  </Alert>
                )}
              </CardContent>
            </Card>
          );
        })
      )}
    </Box>
  );
};

export default MyApplications;
