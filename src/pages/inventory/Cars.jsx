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
  Tooltip,
  useTheme,
} from '@mui/material';
import {
  Add,
  Search,
  Edit,
  Delete,
  Visibility,
  Clear,
} from '@mui/icons-material';
import { getCars, deleteCar } from '../../services/carService';
import { getSuppliers } from '../../services/supplierService';
import { formatCurrency, getStatusColor } from '../../utils/calculations';

const Cars = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [cars, setCars] = useState([]);
  const [filteredCars, setFilteredCars] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, carId: null });
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    supplier: '',
    minPrice: '',
    maxPrice: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [cars, filters]);

  const loadData = () => {
    const carData = getCars();
    const supplierData = getSuppliers();
    setCars(carData);
    setSuppliers(supplierData);
    setFilteredCars(carData);
    setLoading(false);
  };

  const applyFilters = () => {
    let filtered = [...cars];

    if (filters.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(car =>
        car.make.toLowerCase().includes(search) ||
        car.model.toLowerCase().includes(search) ||
        car.variant.toLowerCase().includes(search) ||
        car.id.toLowerCase().includes(search)
      );
    }

    if (filters.status) {
      filtered = filtered.filter(car => car.status === filters.status);
    }

    if (filters.supplier) {
      filtered = filtered.filter(car => car.supplierId === filters.supplier);
    }

    if (filters.minPrice) {
      filtered = filtered.filter(car => car.sellingPrice >= parseInt(filters.minPrice));
    }

    if (filters.maxPrice) {
      filtered = filtered.filter(car => car.sellingPrice <= parseInt(filters.maxPrice));
    }

    setFilteredCars(filtered);
    setPage(0);
  };

  const handleDelete = () => {
    if (deleteDialog.carId) {
      deleteCar(deleteDialog.carId);
      loadData();
      setDeleteDialog({ open: false, carId: null });
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      status: '',
      supplier: '',
      minPrice: '',
      maxPrice: '',
    });
  };

  const getSupplierName = (supplierId) => {
    const supplier = suppliers.find(s => s.id === supplierId);
    return supplier ? supplier.name : 'Unknown';
  };

  const statusOptions = ['Available', 'Reserved', 'Sold', 'Inactive'];

  if (loading) return <Box>Loading...</Box>;

  return (
    <Box sx={{ width: '100%' }}>
      {/* Header */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 3,
        flexWrap: 'wrap',
        gap: 2,
      }}>
        <Typography variant="h4" fontWeight="bold">
          Cars Inventory
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate('/add-car')}
        >
          Add New Car
        </Button>
      </Box>

      {/* Filters - FULL WIDTH */}
      <Card sx={{ mb: 3, width: '100%' }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                size="small"
                label="Search"
                placeholder="Make, Model, ID..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                InputProps={{
                  startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  label="Status"
                >
                  <MenuItem value="">All</MenuItem>
                  {statusOptions.map(status => (
                    <MenuItem key={status} value={status}>{status}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Supplier</InputLabel>
                <Select
                  value={filters.supplier}
                  onChange={(e) => handleFilterChange('supplier', e.target.value)}
                  label="Supplier"
                >
                  <MenuItem value="">All</MenuItem>
                  {suppliers.map(supplier => (
                    <MenuItem key={supplier.id} value={supplier.id}>{supplier.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={2}>
              <TextField
                fullWidth
                size="small"
                label="Min Price"
                type="number"
                value={filters.minPrice}
                onChange={(e) => handleFilterChange('minPrice', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={2}>
              <TextField
                fullWidth
                size="small"
                label="Max Price"
                type="number"
                value={filters.maxPrice}
                onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={1}>
              <Tooltip title="Clear Filters">
                <IconButton onClick={clearFilters} color="primary">
                  <Clear />
                </IconButton>
              </Tooltip>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Table - FULL WIDTH WITH HORIZONTAL SCROLL */}
      <Card sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer 
          component={Paper} 
          elevation={0}
          sx={{ 
            width: '100%',
            overflowX: 'auto',
          }}
        >
          <Table sx={{ minWidth: 800 }}>
            <TableHead>
              <TableRow>
                <TableCell><strong>Make / Model</strong></TableCell>
                <TableCell><strong>Variant</strong></TableCell>
                <TableCell><strong>Year</strong></TableCell>
                <TableCell><strong>Price</strong></TableCell>
                <TableCell><strong>Stock</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
                <TableCell align="center"><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredCars
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((car) => (
                  <TableRow key={car.id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight="500">
                        {car.make} {car.model}
                      </Typography>
                    </TableCell>
                    <TableCell>{car.variant}</TableCell>
                    <TableCell>{car.year}</TableCell>
                    <TableCell>{formatCurrency(car.sellingPrice)}</TableCell>
                    <TableCell>
                      <Chip
                        label={car.stockQuantity}
                        size="small"
                        color={car.stockQuantity <= 2 ? 'warning' : 'default'}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={car.status}
                        size="small"
                        color={getStatusColor(car.status)}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="View">
                        <IconButton
                          size="small"
                          onClick={() => navigate(`/car/${car.id}`)}
                        >
                          <Visibility />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => navigate(`/edit-car/${car.id}`)}
                        >
                          <Edit />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => setDeleteDialog({ open: true, carId: car.id })}
                        >
                          <Delete />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              {filteredCars.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <Typography color="textSecondary">
                      No cars found. Add your first car!
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={filteredCars.length}
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
      <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, carId: null })}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this car? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, carId: null })}>
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

export default Cars;