/**
 * src/pages/management/Applications.jsx
 * ----------------------------------------------------------------------------
 * Applications pipeline (route: `/applications`).
 * Spec §8 — the 9-step application-to-delivery flow. Each role sees scoped
 * rows and only its own actions (buttons via `ApplicationActionButtons`):
 *
 *  Super Admin: review (approve/reject), assign manager, complete
 *  Manager:     verify, vehicle, finance, payments, ready (assigned only)
 *  Admin:       record payments (no review / assign / complete)
 *  Customer:    own rows via My Applications (this screen is staff-only)
 * ----------------------------------------------------------------------------
 */
import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Avatar,
  Divider,
  LinearProgress,
  Alert,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import { Visibility, Refresh } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import {
  fetchApplications,
  fetchApplicationById,
} from '../../services/applicationService';
import { fetchPayments } from '../../services/paymentService';
import {
  ALL_STATUSES,
  STATUS_FLOW,
  normalizeStatus,
  statusLabel,
  statusStep,
} from '../../constants/applicationStatus';
import ApplicationStatusChip from '../../components/applications/ApplicationStatusChip';
import ApplicationActionButtons from '../../components/applications/ApplicationActionButtons';
import { formatDate } from '../../utils/calculations';

const Applications = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [statusFilter, setStatusFilter] = useState('All');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [detail, setDetail] = useState({ open: false, app: null, payments: [] });

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const rows = await fetchApplications();
      setApplications(rows || []);
    } catch (err) {
      setError(err?.message || 'Could not load applications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleUpdated = (updated) => {
    if (!updated) {
      load();
      return;
    }
    setApplications((prev) => prev.map((a) => (String(a.id) === String(updated.id) ? updated : a)));
    if (detail.open && detail.app && String(detail.app.id) === String(updated.id)) {
      setDetail((prev) => ({ ...prev, app: updated }));
    }
  };

  const openDetail = async (app) => {
    setDetail({ open: true, app, payments: [] });
    try {
      const full = await fetchApplicationById(app.id);
      const payments = full?.payments || (await fetchPayments({ applicationId: app.id }).catch(() => []));
      setDetail({ open: true, app: full || app, payments: payments || [] });
    } catch {
      // keep the cached row
    }
  };

  const filtered =
    statusFilter === 'All'
      ? applications
      : applications.filter((a) => normalizeStatus(a.status) === statusFilter);

  const countBy = (status) => applications.filter((a) => normalizeStatus(a.status) === status).length;

  const statCards = [
    { label: 'Total', value: applications.length, color: 'text.primary' },
    { label: 'Pending Review', value: countBy('PENDING'), color: 'warning.main' },
    { label: 'In Pipeline', value: applications.filter((a) => statusStep(a.status) >= 3 && statusStep(a.status) <= 7).length, color: 'info.main' },
    { label: 'Ready / Complete', value: countBy('READY_FOR_DELIVERY') + countBy('COMPLETE'), color: 'success.main' },
    { label: 'Rejected', value: countBy('REJECTED'), color: 'error.main' },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Applications Pipeline
          </Typography>
          <Typography variant="body1" color="textSecondary">
            9-step application-to-delivery flow — actions are gated by your role.
          </Typography>
        </Box>
        <Button variant="outlined" startIcon={<Refresh />} onClick={load} disabled={loading}>
          Refresh
        </Button>
      </Box>

      {loading && <LinearProgress sx={{ mb: 2 }} />}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* Stats */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {statCards.map((s) => (
          <Grid item xs={6} md={2.4} key={s.label}>
            <Card>
              <CardContent>
                <Typography variant="caption" color="textSecondary">{s.label}</Typography>
                <Typography variant="h5" sx={{ color: s.color }}>{s.value}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Filter */}
      <Box sx={{ mb: 3 }}>
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Filter by Status</InputLabel>
          <Select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }} label="Filter by Status">
            <MenuItem value="All">All ({applications.length})</MenuItem>
            {ALL_STATUSES.map((status) => (
              <MenuItem key={status} value={status}>
                {statusLabel(status)} ({countBy(status)})
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Table */}
      <Card>
        <TableContainer component={Paper} elevation={0} sx={{ overflowX: 'auto' }}>
          <Table sx={{ minWidth: 1000 }}>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell>Vehicle</TableCell>
                <TableCell>Manager</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Finance</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((app) => (
                <TableRow key={app.id} hover>
                  <TableCell>{app.id}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar sx={{ width: 32, height: 32 }}>
                        {(app.customerName || app.firstName || '?')?.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight="500">
                          {app.customerName || `${app.firstName || ''} ${app.lastName || ''}`.trim() || 'Customer'}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {app.customerEmail || app.email}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    {app.carMake ? (
                      <>
                        <Typography variant="body2">{app.carMake} {app.carModel}</Typography>
                        <Typography variant="caption" color="textSecondary">{app.carVariant}</Typography>
                      </>
                    ) : (
                      <Typography variant="caption" color="textSecondary">Not selected</Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{app.managerName || (app.managerId ? `#${app.managerId}` : 'Unassigned')}</Typography>
                  </TableCell>
                  <TableCell>{formatDate(app.applicationDate || app.createdAt)}</TableCell>
                  <TableCell><ApplicationStatusChip status={app.status} /></TableCell>
                  <TableCell>
                    <Typography variant="caption" display="block">
                      Paid {Number(app.paidAmount || 0).toLocaleString()}
                    </Typography>
                    <Typography variant="caption" display="block" color="textSecondary">
                      Due {Number(app.remainingBalance || 0).toLocaleString()}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap' }}>
                      <Button size="small" startIcon={<Visibility />} onClick={() => openDetail(app)}>
                        View
                      </Button>
                      <ApplicationActionButtons user={user} app={app} onUpdated={handleUpdated} compact />
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && !loading && (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                    <Typography color="textSecondary">No applications found</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filtered.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
        />
      </Card>

      {/* Detail dialog */}
      <Dialog open={detail.open} onClose={() => setDetail({ open: false, app: null, payments: [] })} maxWidth="md" fullWidth>
        <DialogTitle>Application #{detail.app?.id}</DialogTitle>
        <DialogContent dividers>
          {detail.app && (
            <>
              <Stepper activeStep={statusStep(detail.app.status) - 1} alternativeLabel sx={{ mb: 3 }}>
                {STATUS_FLOW.map((s) => (
                  <Step key={s}><StepLabel>{statusLabel(s)}</StepLabel></Step>
                ))}
              </Stepper>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" fontWeight={700}>Applicant</Typography>
                  <Typography variant="body2">
                    {detail.app.customerName || `${detail.app.firstName || ''} ${detail.app.lastName || ''}`.trim()}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">{detail.app.customerEmail || detail.app.email}</Typography>
                  <Typography variant="body2" color="textSecondary">{detail.app.phone} · {detail.app.cnic}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    {[detail.app.address, detail.app.city].filter(Boolean).join(', ')}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    CNIC docs: {detail.app.cnicFront || detail.app.cnic_front ? 'front on file' : 'front missing'} ·{' '}
                    {detail.app.cnicBack || detail.app.cnic_back ? 'back on file' : 'back missing'}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Manager: {detail.app.managerName || (detail.app.managerId ? `#${detail.app.managerId}` : 'Unassigned')}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" fontWeight={700}>Vehicle &amp; Finance</Typography>
                  <Typography variant="body2">
                    {detail.app.carMake ? `${detail.app.carMake} ${detail.app.carModel} ${detail.app.carVariant || ''}` : 'Not selected'}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Price PKR {Number(detail.app.vehiclePrice || 0).toLocaleString()} ·
                    Down PKR {Number(detail.app.downPayment || 0).toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {Number(detail.app.installmentAmount || 0).toLocaleString()} × {detail.app.installmentDuration || 0} ({detail.app.installmentFrequency || 'monthly'})
                  </Typography>
                  <Typography variant="body2">
                    Paid PKR {Number(detail.app.paidAmount || 0).toLocaleString()} ·
                    Remaining PKR {Number(detail.app.remainingBalance || 0).toLocaleString()}
                  </Typography>
                  {detail.app.rejectionReason && (
                    <Alert severity="error" sx={{ mt: 1 }}>Rejected: {detail.app.rejectionReason}</Alert>
                  )}
                  {detail.app.notes && (
                    <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                      Notes: {detail.app.notes}
                    </Typography>
                  )}
                </Grid>
              </Grid>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle2" fontWeight={700} gutterBottom>Payment History</Typography>
              {detail.payments.length === 0 ? (
                <Typography variant="body2" color="textSecondary">No payments recorded.</Typography>
              ) : (
                detail.payments.map((p) => (
                  <Box key={p.id} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
                    <Typography variant="body2">
                      {formatDate(p.paidAt || p.createdAt)} · {p.type} · {p.method} · {p.receiptNo}
                    </Typography>
                    <Typography variant="body2" fontWeight={700}>
                      PKR {Number(p.amount || 0).toLocaleString()}
                    </Typography>
                  </Box>
                ))
              )}
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'space-between', px: 3 }}>
          {detail.app && (
            <ApplicationActionButtons user={user} app={detail.app} onUpdated={handleUpdated} />
          )}
          <Button onClick={() => setDetail({ open: false, app: null, payments: [] })}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Applications;
