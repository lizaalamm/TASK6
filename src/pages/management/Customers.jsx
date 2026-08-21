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
  Tooltip,
  useTheme,
} from '@mui/material';
import { Search, Visibility, Clear } from '@mui/icons-material';
import { getCustomers } from '../../services/customerService';
import { getApplicationsByCustomer } from '../../services/applicationService';

const Customers = () => {
  const theme = useTheme();
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const customerData = getCustomers();
    setCustomers(customerData);
    setFilteredCustomers(customerData);
    setLoading(false);
  };

  useEffect(() => {
    if (searchTerm) {
      const filtered = customers.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.phone.includes(searchTerm) ||
        c.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCustomers(filtered);
    } else {
      setFilteredCustomers(customers);
    }
    setPage(0);
  }, [searchTerm, customers]);

  if (loading) return <Box>Loading...</Box>;

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Customers
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Manage all customer records
        </Typography>
      </Box>

      {/* Search */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <TextField
              size="small"
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
                endAdornment: searchTerm && (
                  <IconButton size="small" onClick={() => setSearchTerm('')}>
                    <Clear />
                  </IconButton>
                ),
              }}
              sx={{ flex: 1 }}
            />
          </Box>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <TableContainer component={Paper} elevation={0}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>City</TableCell>
                <TableCell>Applications</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredCustomers
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((customer) => {
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
                      <TableCell>{customer.city}</TableCell>
                      <TableCell>
                        <Chip
                          label={apps.length}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              {filteredCustomers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <Typography color="textSecondary">
                      No customers found
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
          count={filteredCustomers.length}
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