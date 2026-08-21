import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Button,
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
  Avatar,
  useTheme,
} from '@mui/material';
import {
  CheckCircle,
  Pending,
  Cancel,
  HourglassEmpty,
  Assignment,
  Update,
} from '@mui/icons-material';
import { getApplications, updateApplicationStatus } from '../../services/applicationService';
import { formatDate } from '../../utils/calculations';

const Applications = () => {
  const theme = useTheme();
  const [applications, setApplications] = useState([]);
  const [filteredApps, setFilteredApps] = useState([]);
  const [statusFilter, setStatusFilter] = useState('All');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [statusDialog, setStatusDialog] = useState({ open: false, appId: null, currentStatus: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFilter();
  }, [applications, statusFilter]);

  const loadData = () => {
    const apps = getApplications();
    setApplications(apps);
    setFilteredApps(apps);
    setLoading(false);
  };

  const applyFilter = () => {
    if (statusFilter === 'All') {
      setFilteredApps(applications);
    } else {
      setFilteredApps(applications.filter(app => app.status === statusFilter));
    }
    setPage(0);
  };

  const handleStatusUpdate = () => {
    if (statusDialog.appId && statusDialog.newStatus) {
      updateApplicationStatus(statusDialog.appId, statusDialog.newStatus);
      loadData();
      setStatusDialog({ open: false, appId: null, currentStatus: '', newStatus: '' });
    }
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

  const statusOptions = ['All', 'Pending', 'Approved', 'Reserved', 'Completed', 'Rejected'];

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
          Applications Management
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Manage all customer car applications
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={4} md={2.4}>
          <Card>
            <CardContent>
              <Typography variant="caption" color="textSecondary">Total</Typography>
              <Typography variant="h5">{stats.total}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={4} md={2.4}>
          <Card sx={{ borderTop: `4px solid ${theme.palette.warning.main}` }}>
            <CardContent>
              <Typography variant="caption" color="textSecondary">Pending</Typography>
              <Typography variant="h5" color="warning.main">{stats.pending}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={4} md={2.4}>
          <Card sx={{ borderTop: `4px solid ${theme.palette.info.main}` }}>
            <CardContent>
              <Typography variant="caption" color="textSecondary">Approved</Typography>
              <Typography variant="h5" color="info.main">{stats.approved}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={4} md={2.4}>
          <Card sx={{ borderTop: `4px solid ${theme.palette.success.main}` }}>
            <CardContent>
              <Typography variant="caption" color="textSecondary">Completed</Typography>
              <Typography variant="h5" color="success.main">{stats.completed}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={4} md={2.4}>
          <Card sx={{ borderTop: `4px solid ${theme.palette.error.main}` }}>
            <CardContent>
              <Typography variant="caption" color="textSecondary">Rejected</Typography>
              <Typography variant="h5" color="error.main">{stats.rejected}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filter */}
      <Box sx={{ mb: 3 }}>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Filter by Status</InputLabel>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            label="Filter by Status"
          >
            {statusOptions.map(status => (
              <MenuItem key={status} value={status}>{status}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Table */}
      <Card>
        <TableContainer component={Paper} elevation={0}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell>Car</TableCell>
                <TableCell>Color</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="center">Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredApps
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((app) => (
                  <TableRow key={app.id} hover>
                    <TableCell>{app.id}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar sx={{ width: 32, height: 32 }}>
                          {app.customerName?.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight="500">
                            {app.customerName}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {app.customerEmail}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {app.carMake} {app.carModel}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {app.carVariant}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={app.selectedColor}
                        size="small"
                        sx={{
                          bgcolor: app.selectedColor?.toLowerCase(),
                          color: ['White', 'Silver'].includes(app.selectedColor) ? '#333' : '#fff',
                        }}
                      />
                    </TableCell>
                    <TableCell>{formatDate(app.applicationDate)}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {getStatusIcon(app.status)}
                        <Chip
                          label={app.status}
                          size="small"
                          color={getStatusColor(app.status)}
                        />
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<Update />}
                        onClick={() => setStatusDialog({
                          open: true,
                          appId: app.id,
                          currentStatus: app.status,
                          newStatus: app.status,
                        })}
                      >
                        Update
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              {filteredApps.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <Typography color="textSecondary">
                      No applications found
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredApps.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
        />
      </Card>

      {/* Status Update Dialog */}
      <Dialog
        open={statusDialog.open}
        onClose={() => setStatusDialog({ open: false, appId: null, currentStatus: '', newStatus: '' })}
      >
        <DialogTitle>Update Application Status</DialogTitle>
        <DialogContent>
          <Typography variant="body2" gutterBottom>
            Current Status: <Chip
              label={statusDialog.currentStatus}
              size="small"
              color={getStatusColor(statusDialog.currentStatus)}
            />
          </Typography>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>New Status</InputLabel>
            <Select
              value={statusDialog.newStatus || statusDialog.currentStatus}
              onChange={(e) => setStatusDialog(prev => ({ ...prev, newStatus: e.target.value }))}
              label="New Status"
            >
              {statusOptions.filter(s => s !== 'All').map(status => (
                <MenuItem key={status} value={status}>{status}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatusDialog({ open: false, appId: null, currentStatus: '', newStatus: '' })}>
            Cancel
          </Button>
          <Button
            onClick={handleStatusUpdate}
            variant="contained"
            disabled={!statusDialog.newStatus || statusDialog.newStatus === statusDialog.currentStatus}
          >
            Update Status
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Applications;