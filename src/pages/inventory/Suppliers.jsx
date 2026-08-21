import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Grid,
  IconButton,
  Chip,
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
  Tooltip,
  useTheme,
} from '@mui/material';
import { Add, Search, Edit, Delete, Visibility, Clear } from '@mui/icons-material';
import { getSuppliers, deleteSupplier } from '../../services/supplierService';
import { getCarsBySupplier } from '../../services/carService';

const Suppliers = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [suppliers, setSuppliers] = useState([]);
  const [filteredSuppliers, setFilteredSuppliers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, supplierId: null });
  const [carCounts, setCarCounts] = useState({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const supplierData = getSuppliers();
    setSuppliers(supplierData);
    setFilteredSuppliers(supplierData);
    
    // Count cars per supplier
    const counts = {};
    supplierData.forEach(supplier => {
      const cars = getCarsBySupplier(supplier.id);
      counts[supplier.id] = cars.length;
    });
    setCarCounts(counts);
  };

  useEffect(() => {
    if (searchTerm) {
      const filtered = suppliers.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredSuppliers(filtered);
    } else {
      setFilteredSuppliers(suppliers);
    }
    setPage(0);
  }, [searchTerm, suppliers]);

  const handleDelete = () => {
    if (deleteDialog.supplierId) {
      deleteSupplier(deleteDialog.supplierId);
      loadData();
      setDeleteDialog({ open: false, supplierId: null });
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          Suppliers
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate('/add-supplier')}
        >
          Add Supplier
        </Button>
      </Box>

      {/* Search */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <TextField
              size="small"
              placeholder="Search suppliers..."
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
                <TableCell>Company Name</TableCell>
                <TableCell>Contact Person</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Cars</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredSuppliers
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((supplier) => (
                  <TableRow key={supplier.id} hover>
                    <TableCell>{supplier.id}</TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="500">
                        {supplier.name}
                      </Typography>
                    </TableCell>
                    <TableCell>{supplier.contactPerson}</TableCell>
                    <TableCell>{supplier.email}</TableCell>
                    <TableCell>{supplier.phone}</TableCell>
                    <TableCell>
                      <Chip
                        label={carCounts[supplier.id] || 0}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={supplier.status}
                        size="small"
                        color={supplier.status === 'Active' ? 'success' : 'default'}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="Edit">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => navigate(`/edit-supplier/${supplier.id}`)}
                        >
                          <Edit />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => setDeleteDialog({ open: true, supplierId: supplier.id })}
                        >
                          <Delete />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              {filteredSuppliers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                    <Typography color="textSecondary">
                      No suppliers found. Add your first supplier!
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
          count={filteredSuppliers.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
        />
      </Card>

      {/* Delete Dialog */}
      <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, supplierId: null })}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this supplier? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, supplierId: null })}>
            Cancel
          </Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Suppliers;