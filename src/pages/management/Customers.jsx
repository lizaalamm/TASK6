/**
 * src/pages/management/Customers.jsx
 * ----------------------------------------------------------------------------
 * Customer records (route: `/customers`).
 * Scoping (spec §2): superadmin/admin/staff see all customers; managers see
 * ONLY customers assigned to them (managerId match — enforced by the API,
 * re-checked here before render).
 * ----------------------------------------------------------------------------
 */
import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  Chip,
  Avatar,
  IconButton,
  useTheme,
  Alert,
  LinearProgress,
} from '@mui/material';
import { Search, Clear } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { getUserRole, ROLES } from '../../constants/roles';
import api from '../../services/api';
import { getData } from '../../services/localStorage';
import { getApplicationsByCustomer } from '../../services/applicationService';

const Customers = () => {
  const theme = useTheme();
  const { user } = useAuth();
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);

  const role = getUserRole(user);
  const isManager = role === ROLES.MANAGER;

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    let rows = [];
    try {
      const res = await api.get('/users/user', { params: { userType: 'customer' } });
      rows = res.data?.data || [];
    } catch {
      rows = getData('udevs_customers', []);
    }
    // Client-side re-scope (the API already scopes; never render foreign rows).
    if (isManager) {
      rows = rows.filter((c) => String(c.managerId) === String(user?.id));
    }
    setCustomers(rows);
    setLoading(false);
  };

  const filtered = searchTerm
    ? customers.filter(
        (c) =>
          c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          String(c.phone || '').includes(searchTerm) ||
          String(c.id).toLowerCase().includes(searchTerm.toLowerCase())
      )
    : customers;

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Customers {isManager && <Chip label="ASSIGNED ONLY" size="small" color="info" />}
        </Typography>
        <Typography variant="body1" color="textSecondary">
          {isManager
            ? 'Customers assigned to you by the Super Admin'
            : 'Manage all customer records'}
        </Typography>
      </Box>

      {loading && <LinearProgress sx={{ mb: 2 }} />}

      {isManager && (
        <Alert severity="info" sx={{ mb: 3 }}>
          You can only see customers assigned to you. Assignment and transfers are
          handled by the Super Admin.
        </Alert>
      )}

      {/* Search */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <TextField
            size="small"
            fullWidth
            placeholder="Search customers..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setPage(0); }}
            InputProps={{
              startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
              endAdornment: searchTerm && (
                <IconButton size="small" onClick={() => setSearchTerm('')}>
                  <Clear />
                </IconButton>
              ),
            }}
          />
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <TableContainer component={Paper} elevation={0} sx={{ overflowX: 'auto' }}>
          <Table sx={{ minWidth: 800 }}>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>City</TableCell>
                {!isManager && <TableCell>Manager</TableCell>}
                <TableCell>Applications</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((customer) => {
                const apps = getApplicationsByCustomer(customer.id);
                return (
                  <TableRow key={customer.id} hover>
                    <TableCell>{customer.id}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                          {customer.name?.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight="500">
                            {customer.name}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {customer.cnic || 'No CNIC'}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>{customer.email}</TableCell>
                    <TableCell>{customer.phone}</TableCell>
                    <TableCell>{customer.city || '—'}</TableCell>
                    {!isManager && (
                      <TableCell>
                        {customer.managerId ? (
                          <Chip label={`Manager #${customer.managerId}`} size="small" color="info" variant="outlined" />
                        ) : (
                          <Chip label="Unassigned" size="small" variant="outlined" />
                        )}
                      </TableCell>
                    )}
                    <TableCell>
                      <Chip label={apps.length} size="small" color="primary" variant="outlined" />
                    </TableCell>
                  </TableRow>
                );
              })}
              {filtered.length === 0 && !loading && (
                <TableRow>
                  <TableCell colSpan={isManager ? 6 : 7} align="center" sx={{ py: 4 }}>
                    <Typography color="textSecondary">
                      {isManager ? 'No customers assigned to you yet.' : 'No customers found'}
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
          count={filtered.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
        />
      </Card>
    </Box>
  );
};

export default Customers;
