/**
 * src/components/applications/ApplicationActionButtons.jsx
 * ----------------------------------------------------------------------------
 * One-stop pipeline actions for an application row. Renders ONLY the buttons
 * the current user may use (see `availableActionsFor`) and owns every
 * workflow dialog: review, assign, verify, vehicle, finance, payment, ready,
 * complete, resubmit.
 *
 * Props:
 *  - `user`      → logged-in user (drives which actions appear)
 *  - `app`       → application row
 *  - `onUpdated` → callback(updatedRow) after each successful step
 *  - `compact`   → icon-only buttons for tight table columns
 * ----------------------------------------------------------------------------
 */
import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Typography,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  availableActionsFor,
  APPLICATION_STATUS,
  statusLabel,
} from '../../constants/applicationStatus';
import {
  reviewApplication,
  assignManagerToApplication,
  verifyApplication,
  selectApplicationVehicle,
  setupFinancePlan,
  markApplicationReady,
  completeApplicationById,
  resubmitApplicationById,
} from '../../services/applicationService';
import { fetchVehicles } from '../../services/vehicleService';
import { recordPayment } from '../../services/paymentService';
import { fetchManagers } from '../../services/auditService';
import { getData } from '../../services/localStorage';

const ACTION_LABELS = {
  review: 'Review',
  assign: 'Assign Manager',
  verify: 'Verify',
  vehicle: 'Select Vehicle',
  finance: 'Finance Plan',
  payment: 'Record Payment',
  ready: 'Mark Ready',
  complete: 'Complete',
  resubmit: 'Resubmit',
};

const ApplicationActionButtons = ({ user, app, onUpdated, compact = false }) => {
  const [dialog, setDialog] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [vehicles, setVehicles] = useState([]);
  const [managers, setManagers] = useState([]);

  // Form state per dialog.
  const [decision, setDecision] = useState(APPLICATION_STATUS.APPROVED);
  const [rejectionReason, setRejectionReason] = useState('');
  const [managerId, setManagerId] = useState('');
  const [notes, setNotes] = useState('');
  const [vehicleId, setVehicleId] = useState('');
  const [color, setColor] = useState('');
  const [finance, setFinance] = useState({
    downPayment: '',
    installmentAmount: '',
    installmentDuration: '',
    installmentFrequency: 'monthly',
  });
  const [payment, setPayment] = useState({ amount: '', method: 'cash', type: 'installment', notes: '' });

  const actions = availableActionsFor(user, app);

  // Lazy-load dropdown data when the matching dialog opens.
  useEffect(() => {
    if (dialog === 'vehicle') {
      fetchVehicles({ available: '1' }).then(setVehicles).catch(() => setVehicles([]));
    }
    if (dialog === 'assign') {
      fetchManagers().then((rows) => {
        if (rows && rows.length) {
          setManagers(rows);
        } else {
          // Offline fallback: local demo users with the manager role.
          const local = getData('udevs_users', []).filter((u) => u.role === 'manager' || u.userType === 'manager');
          setManagers(local);
        }
      });
    }
  }, [dialog]);

  const open = (action) => {
    setError('');
    setNotes('');
    setRejectionReason('');
    if (action === 'finance') {
      setFinance({
        downPayment: app.downPayment || '',
        installmentAmount: app.installmentAmount || '',
        installmentDuration: app.installmentDuration || '',
        installmentFrequency: app.installmentFrequency || 'monthly',
      });
    }
    if (action === 'payment') {
      setPayment({ amount: app.installmentAmount || '', method: 'cash', type: 'installment', notes: '' });
    }
    setDialog(action);
  };

  const close = () => {
    if (!busy) {
      setDialog(null);
      setError('');
    }
  };

  const done = (updated) => {
    setDialog(null);
    setError('');
    if (onUpdated) onUpdated(updated);
  };

  const fail = (err) => {
    setError(err?.response?.data?.message || err?.message || 'Action failed');
  };

  const run = async (fn) => {
    setBusy(true);
    setError('');
    try {
      const updated = await fn();
      done(updated);
    } catch (err) {
      fail(err);
    } finally {
      setBusy(false);
    }
  };

  const selectedVehicle = vehicles.find((v) => String(v.id) === String(vehicleId));
  const selectedManager = managers.find((m) => String(m.id) === String(managerId));

  if (actions.length === 0) {
    return (
      <Typography variant="caption" color="textSecondary">
        No actions
      </Typography>
    );
  }

  return (
    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'center' }}>
      {actions.map((action) => (
        <Button
          key={action}
          size="small"
          variant={['review', 'complete', 'ready'].includes(action) ? 'contained' : 'outlined'}
          color={
            action === 'review' ? 'primary' : action === 'complete' ? 'success' : action === 'ready' ? 'success' : 'primary'
          }
          onClick={() => open(action)}
        >
          {compact ? ACTION_LABELS[action].split(' ')[0] : ACTION_LABELS[action]}
        </Button>
      ))}

      {/* ---- Review (Super Admin) ---- */}
      <Dialog open={dialog === 'review'} onClose={close} maxWidth="xs" fullWidth>
        <DialogTitle>Review Application</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <FormControl fullWidth sx={{ mt: 1 }}>
            <InputLabel>Decision</InputLabel>
            <Select value={decision} onChange={(e) => setDecision(e.target.value)} label="Decision">
              <MenuItem value={APPLICATION_STATUS.APPROVED}>Approved</MenuItem>
              <MenuItem value={APPLICATION_STATUS.REJECTED}>Rejected</MenuItem>
              <MenuItem value={APPLICATION_STATUS.PENDING}>Keep Pending</MenuItem>
            </Select>
          </FormControl>
          {decision === APPLICATION_STATUS.REJECTED && (
            <TextField
              fullWidth
              multiline
              rows={2}
              label="Rejection reason"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              sx={{ mt: 2 }}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={close} disabled={busy}>Cancel</Button>
          <Button
            variant="contained"
            disabled={busy}
            onClick={() => run(() => reviewApplication(app.id, decision, rejectionReason))}
          >
            {busy ? <CircularProgress size={20} /> : 'Submit Review'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ---- Assign manager (Super Admin) ---- */}
      <Dialog open={dialog === 'assign'} onClose={close} maxWidth="xs" fullWidth>
        <DialogTitle>Assign Manager</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            Only a Super Admin can assign the case manager. The manager will see
            this customer and application in their assigned-only workspace.
          </Typography>
          <FormControl fullWidth>
            <InputLabel>Manager</InputLabel>
            <Select value={managerId} onChange={(e) => setManagerId(e.target.value)} label="Manager">
              {managers.map((m) => (
                <MenuItem key={m.id} value={m.id}>
                  {m.name} ({m.email})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {managers.length === 0 && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              No active managers found — register a manager account first.
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={close} disabled={busy}>Cancel</Button>
          <Button
            variant="contained"
            disabled={busy || !managerId}
            onClick={() => run(() => assignManagerToApplication(app.id, managerId, selectedManager?.name || ''))}
          >
            {busy ? <CircularProgress size={20} /> : 'Assign'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ---- Verify (Manager) ---- */}
      <Dialog open={dialog === 'verify'} onClose={close} maxWidth="xs" fullWidth>
        <DialogTitle>Verify Customer &amp; Documents</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            Confirm the profile and CNIC documents, then move the application to
            In Process.
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Verification notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={close} disabled={busy}>Cancel</Button>
          <Button variant="contained" disabled={busy} onClick={() => run(() => verifyApplication(app.id, notes))}>
            {busy ? <CircularProgress size={20} /> : 'Verify'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ---- Select vehicle (Manager + Customer) ---- */}
      <Dialog open={dialog === 'vehicle'} onClose={close} maxWidth="xs" fullWidth>
        <DialogTitle>Select Vehicle</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <FormControl fullWidth sx={{ mt: 1 }}>
            <InputLabel>Available vehicle</InputLabel>
            <Select value={vehicleId} onChange={(e) => { setVehicleId(e.target.value); setColor(''); }} label="Available vehicle">
              {vehicles.map((v) => (
                <MenuItem key={v.id} value={v.id}>
                  {v.make} {v.model} {v.variant} — {v.year} (stock {v.stockQuantity})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {selectedVehicle?.availableColors?.length > 0 && (
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>Colour</InputLabel>
              <Select value={color} onChange={(e) => setColor(e.target.value)} label="Colour">
                {selectedVehicle.availableColors.map((c) => (
                  <MenuItem key={c} value={c}>{c}</MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={close} disabled={busy}>Cancel</Button>
          <Button
            variant="contained"
            disabled={busy || !selectedVehicle}
            onClick={() => run(() => selectApplicationVehicle(app.id, selectedVehicle, color))}
          >
            {busy ? <CircularProgress size={20} /> : 'Select'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ---- Finance plan (Manager) ---- */}
      <Dialog open={dialog === 'finance'} onClose={close} maxWidth="xs" fullWidth>
        <DialogTitle>Finance Plan</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            Vehicle price: <strong>{Number(app.vehiclePrice || 0).toLocaleString()}</strong>
          </Typography>
          <TextField
            fullWidth margin="dense" label="Down payment" type="number"
            value={finance.downPayment}
            onChange={(e) => setFinance({ ...finance, downPayment: e.target.value })}
          />
          <TextField
            fullWidth margin="dense" label="Installment amount" type="number"
            value={finance.installmentAmount}
            onChange={(e) => setFinance({ ...finance, installmentAmount: e.target.value })}
          />
          <TextField
            fullWidth margin="dense" label="Duration (months)" type="number"
            value={finance.installmentDuration}
            onChange={(e) => setFinance({ ...finance, installmentDuration: e.target.value })}
          />
          <FormControl fullWidth sx={{ mt: 1 }}>
            <InputLabel>Frequency</InputLabel>
            <Select
              value={finance.installmentFrequency}
              onChange={(e) => setFinance({ ...finance, installmentFrequency: e.target.value })}
              label="Frequency"
            >
              <MenuItem value="weekly">Weekly</MenuItem>
              <MenuItem value="monthly">Monthly</MenuItem>
              <MenuItem value="quarterly">Quarterly</MenuItem>
              <MenuItem value="yearly">Yearly</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={close} disabled={busy}>Cancel</Button>
          <Button variant="contained" disabled={busy} onClick={() => run(() => setupFinancePlan(app.id, finance))}>
            {busy ? <CircularProgress size={20} /> : 'Save Plan'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ---- Record payment ---- */}
      <Dialog open={dialog === 'payment'} onClose={close} maxWidth="xs" fullWidth>
        <DialogTitle>Record Payment</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            Remaining balance: <strong>{Number(app.remainingBalance || 0).toLocaleString()}</strong>
          </Typography>
          <TextField
            fullWidth margin="dense" label="Amount" type="number" required
            value={payment.amount}
            onChange={(e) => setPayment({ ...payment, amount: e.target.value })}
          />
          <FormControl fullWidth sx={{ mt: 1 }}>
            <InputLabel>Method</InputLabel>
            <Select value={payment.method} onChange={(e) => setPayment({ ...payment, method: e.target.value })} label="Method">
              <MenuItem value="cash">Cash</MenuItem>
              <MenuItem value="bank_transfer">Bank Transfer</MenuItem>
              <MenuItem value="cheque">Cheque</MenuItem>
              <MenuItem value="online">Online</MenuItem>
              <MenuItem value="other">Other</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Type</InputLabel>
            <Select value={payment.type} onChange={(e) => setPayment({ ...payment, type: e.target.value })} label="Type">
              <MenuItem value="down_payment">Down Payment</MenuItem>
              <MenuItem value="installment">Installment</MenuItem>
              <MenuItem value="other">Other</MenuItem>
            </Select>
          </FormControl>
          <TextField
            fullWidth margin="dense" label="Notes" multiline rows={2}
            value={payment.notes}
            onChange={(e) => setPayment({ ...payment, notes: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={close} disabled={busy}>Cancel</Button>
          <Button
            variant="contained"
            disabled={busy || !Number(payment.amount)}
            onClick={() =>
              run(async () => {
                await recordPayment({ applicationId: app.id, ...payment, amount: Number(payment.amount) });
                const { fetchApplicationById } = await import('../../services/applicationService');
                return fetchApplicationById(app.id);
              })
            }
          >
            {busy ? <CircularProgress size={20} /> : 'Record'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ---- Ready / Complete / Resubmit confirmations ---- */}
      <Dialog open={dialog === 'ready'} onClose={close} maxWidth="xs" fullWidth>
        <DialogTitle>Mark Ready for Delivery</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Typography variant="body2">
            Confirm all delivery conditions are met for this application
            (current: {statusLabel(app.status)}).
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={close} disabled={busy}>Cancel</Button>
          <Button variant="contained" color="success" disabled={busy} onClick={() => run(() => markApplicationReady(app.id))}>
            {busy ? <CircularProgress size={20} /> : 'Mark Ready'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={dialog === 'complete'} onClose={close} maxWidth="xs" fullWidth>
        <DialogTitle>Complete Order</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Typography variant="body2">
            Only a Super Admin can complete the order. This closes the pipeline.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={close} disabled={busy}>Cancel</Button>
          <Button variant="contained" color="success" disabled={busy} onClick={() => run(() => completeApplicationById(app.id))}>
            {busy ? <CircularProgress size={20} /> : 'Complete'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={dialog === 'resubmit'} onClose={close} maxWidth="xs" fullWidth>
        <DialogTitle>Resubmit Application</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Typography variant="body2">
            Move this rejected application back to Pending for a fresh review.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={close} disabled={busy}>Cancel</Button>
          <Button variant="contained" disabled={busy} onClick={() => run(() => resubmitApplicationById(app.id))}>
            {busy ? <CircularProgress size={20} /> : 'Resubmit'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ApplicationActionButtons;
