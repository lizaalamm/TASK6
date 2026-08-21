import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Divider,
  Avatar,
  useTheme,
  Paper,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import {
  ArrowBack,
  Edit,
  Delete,
  LocalGasStation,
  Settings,
  Speed,
  CalendarToday,
  AttachMoney,
  ColorLens,
  Person,
  Business,
  CheckCircle,
} from '@mui/icons-material';
import { getCarById, deleteCar } from '../../services/carService';
import { getSupplierById } from '../../services/supplierService';
import { formatCurrency, formatDate } from '../../utils/calculations';

const CarDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const [car, setCar] = useState(null);
  const [supplier, setSupplier] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = () => {
    const carData = getCarById(id);
    if (carData) {
      setCar(carData);
      const supplierData = getSupplierById(carData.supplierId);
      setSupplier(supplierData);
    }
    setLoading(false);
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this car?')) {
      deleteCar(id);
      navigate('/cars');
    }
  };

  if (loading) return <Box>Loading...</Box>;
  if (!car) return <Box>Car not found</Box>;

  const profit = car.sellingPrice - car.purchaseRate;
  const profitMargin = ((profit / car.sellingPrice) * 100).toFixed(1);
  const profitLevel = profitMargin >= 25 ? 'High' : profitMargin >= 15 ? 'Medium' : 'Low';

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/cars')}>
          Back to Cars
        </Button>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<Edit />}
            onClick={() => navigate(`/edit-car/${id}`)}
          >
            Edit
          </Button>
          <Button
            variant="contained"
            color="error"
            startIcon={<Delete />}
            onClick={handleDelete}
          >
            Delete
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Images */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <img
                src={car.images?.[0] || 'https://via.placeholder.com/800x400?text=Car'}
                alt={`${car.make} ${car.model}`}
                style={{
                  width: '100%',
                  height: 'auto',
                  maxHeight: 400,
                  objectFit: 'cover',
                  borderRadius: 8,
                }}
              />
              {car.images?.length > 1 && (
                <Box sx={{ display: 'flex', gap: 1, mt: 2, overflow: 'auto' }}>
                  {car.images.slice(1).map((img, index) => (
                    <img
                      key={index}
                      src={img}
                      alt={`${car.make} ${car.model} ${index + 2}`}
                      style={{
                        width: 100,
                        height: 70,
                        objectFit: 'cover',
                        borderRadius: 4,
                        cursor: 'pointer',
                      }}
                    />
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Details */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {car.make} {car.model}
                  </Typography>
                  <Typography variant="subtitle1" color="textSecondary">
                    {car.variant}
                  </Typography>
                </Box>
                <Chip
                  label={car.status}
                  color={
                    car.status === 'Available' ? 'success' :
                    car.status === 'Reserved' ? 'warning' :
                    car.status === 'Sold' ? 'error' : 'default'
                  }
                  size="large"
                />
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Pricing */}
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="textSecondary">
                    Selling Price
                  </Typography>
                  <Typography variant="h5" color="primary" fontWeight="bold">
                    {formatCurrency(car.sellingPrice)}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="textSecondary">
                    Purchase Rate
                  </Typography>
                  <Typography variant="body1">
                    {formatCurrency(car.purchaseRate)}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="textSecondary">
                    Gross Profit
                  </Typography>
                  <Typography variant="body1" color="success.main">
                    {formatCurrency(profit)}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="textSecondary">
                    Profit Margin
                  </Typography>
                  <Chip
                    label={`${profitMargin}% - ${profitLevel}`}
                    color={profitLevel === 'High' ? 'success' : profitLevel === 'Medium' ? 'warning' : 'error'}
                    size="small"
                  />
                </Grid>
              </Grid>

              {/* Specs */}
              <Typography variant="subtitle2" gutterBottom>
                Specifications
              </Typography>
              <Grid container spacing={1} sx={{ mb: 2 }}>
                <Grid item xs={6}>
                  <Paper variant="outlined" sx={{ p: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CalendarToday fontSize="small" color="action" />
                    <Box>
                      <Typography variant="caption" color="textSecondary">Year</Typography>
                      <Typography variant="body2">{car.year}</Typography>
                    </Box>
                  </Paper>
                </Grid>
                <Grid item xs={6}>
                  <Paper variant="outlined" sx={{ p: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LocalGasStation fontSize="small" color="action" />
                    <Box>
                      <Typography variant="caption" color="textSecondary">Fuel</Typography>
                      <Typography variant="body2">{car.fuel}</Typography>
                    </Box>
                  </Paper>
                </Grid>
                <Grid item xs={6}>
                  <Paper variant="outlined" sx={{ p: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Settings fontSize="small" color="action" />
                    <Box>
                      <Typography variant="caption" color="textSecondary">Transmission</Typography>
                      <Typography variant="body2">{car.transmission}</Typography>
                    </Box>
                  </Paper>
                </Grid>
                <Grid item xs={6}>
                  <Paper variant="outlined" sx={{ p: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Speed fontSize="small" color="action" />
                    <Box>
                      <Typography variant="caption" color="textSecondary">Engine</Typography>
                      <Typography variant="body2">{car.engine || 'N/A'}</Typography>
                    </Box>
                  </Paper>
                </Grid>
              </Grid>

              {/* Stock & Colors */}
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="textSecondary">
                    Stock Quantity
                  </Typography>
                  <Chip
                    label={car.stockQuantity}
                    color={car.stockQuantity <= 2 ? 'warning' : 'default'}
                  />
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="textSecondary">
                    Available Colors
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 0.5 }}>
                    {car.availableColors?.map(color => (
                      <Chip
                        key={color}
                        label={color}
                        size="small"
                        sx={{ bgcolor: color.toLowerCase(), color: ['White', 'Silver'].includes(color) ? '#333' : '#fff' }}
                      />
                    ))}
                  </Box>
                </Grid>
              </Grid>

              {/* Supplier */}
              {supplier && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle2" gutterBottom>
                    Supplier Information
                  </Typography>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                        <Business />
                      </Avatar>
                      <Box>
                        <Typography variant="body1" fontWeight="500">
                          {supplier.name}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          Contact: {supplier.contactPerson} • {supplier.phone}
                        </Typography>
                      </Box>
                    </Box>
                  </Paper>
                </>
              )}

              {/* Description */}
              {car.description && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle2" gutterBottom>
                    Description
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {car.description}
                  </Typography>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CarDetails;