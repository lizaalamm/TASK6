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
  IconButton,
  useTheme,
  Paper,
  List,
  ListItem,
  ListItemText,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  ArrowBack,
  LocalGasStation,
  Settings,
  Speed,
  CalendarToday,
  AttachMoney,
  ColorLens,
  Info,
} from '@mui/icons-material';
import { getCarById } from '../../services/carService';
import { formatCurrency } from '../../utils/calculations';
import { addApplication } from '../../services/applicationService';
import { useAuth } from '../../context/AuthContext';

const CarDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const { user } = useAuth();
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedColor, setSelectedColor] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    loadCar();
  }, [id]);

  const loadCar = () => {
    const carData = getCarById(id);
    if (carData) {
      setCar(carData);
      if (carData.availableColors?.length > 0) {
        setSelectedColor(carData.availableColors[0]);
      }
    }
    setLoading(false);
  };

  const handleApply = () => {
    if (!selectedColor) {
      setSnackbar({
        open: true,
        message: 'Please select a color',
        severity: 'error',
      });
      return;
    }

    if (!user) {
      setSnackbar({
        open: true,
        message: 'Please login to apply',
        severity: 'error',
      });
      return;
    }

    // Create application
    const applicationData = {
      customerId: user.id,
      carId: car.id,
      selectedColor,
      carMake: car.make,
      carModel: car.model,
      carVariant: car.variant,
      carImage: car.images?.[0] || '',
      customerName: user.name,
      customerEmail: user.email,
      customerPhone: user.phone || '',
      customerAddress: user.address || '',
      customerCity: user.city || '',
      notes: 'Interested in this vehicle',
    };

    addApplication(applicationData);
    navigate('/application-success', { state: { carName: `${car.make} ${car.model}` } });
  };

  if (loading) return <Box>Loading...</Box>;
  if (!car) return <Box>Car not found</Box>;

  const specs = [
    { icon: <Settings />, label: 'Transmission', value: car.transmission },
    { icon: <LocalGasStation />, label: 'Fuel', value: car.fuel },
    { icon: <Speed />, label: 'Engine', value: car.engine },
    { icon: <CalendarToday />, label: 'Year', value: car.year },
  ];

  const profit = car.sellingPrice - car.purchaseRate;
  const profitMargin = ((profit / car.sellingPrice) * 100).toFixed(1);

  return (
    <Box>
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate('/showroom')}
        sx={{ mb: 3 }}
      >
        Back to Showroom
      </Button>

      <Grid container spacing={3}>
        {/* Images */}
        <Grid item xs={12} md={7}>
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
                        width: 120,
                        height: 80,
                        objectFit: 'cover',
                        borderRadius: 4,
                        cursor: 'pointer',
                        border: `2px solid ${theme.palette.divider}`,
                      }}
                    />
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Details */}
        <Grid item xs={12} md={5}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Box>
                  <Typography variant="h5" fontWeight="bold">
                    {car.make} {car.model}
                  </Typography>
                  <Typography variant="subtitle1" color="textSecondary">
                    {car.variant}
                  </Typography>
                </Box>
                <Chip
                  label={car.status}
                  color={car.status === 'Available' ? 'success' : 'warning'}
                />
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Price */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h4" color="primary" fontWeight="bold">
                  {formatCurrency(car.sellingPrice)}
                </Typography>
                <Box>
                  <Chip
                    label={`Profit: ${formatCurrency(profit)}`}
                    size="small"
                    color="success"
                    variant="outlined"
                  />
                  <Chip
                    label={`Margin: ${profitMargin}%`}
                    size="small"
                    color="info"
                    variant="outlined"
                    sx={{ ml: 1 }}
                  />
                </Box>
              </Box>

              {/* Specs */}
              <Grid container spacing={1} sx={{ mb: 2 }}>
                {specs.map((spec, index) => (
                  <Grid item xs={6} key={index}>
                    <Paper
                      variant="outlined"
                      sx={{
                        p: 1,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        bgcolor: 'background.default',
                      }}
                    >
                      {spec.icon}
                      <Box>
                        <Typography variant="caption" color="textSecondary">
                          {spec.label}
                        </Typography>
                        <Typography variant="body2" fontWeight="500">
                          {spec.value}
                        </Typography>
                      </Box>
                    </Paper>
                  </Grid>
                ))}
              </Grid>

              {/* Colors */}
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Available Colors
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {car.availableColors?.map(color => (
                    <Chip
                      key={color}
                      label={color}
                      onClick={() => setSelectedColor(color)}
                      color={selectedColor === color ? 'primary' : 'default'}
                      variant={selectedColor === color ? 'filled' : 'outlined'}
                      sx={{
                        bgcolor: selectedColor === color ? 'primary.main' : 'transparent',
                        color: selectedColor === color ? '#fff' : 'inherit',
                        borderColor: color.toLowerCase(),
                        '&:hover': {
                          bgcolor: selectedColor === color ? 'primary.dark' : 'action.hover',
                        },
                      }}
                    />
                  ))}
                </Box>
              </Box>

              {/* Stock */}
              <Alert
                severity={car.stockQuantity > 0 ? 'success' : 'error'}
                sx={{ mb: 2 }}
              >
                {car.stockQuantity > 0
                  ? `${car.stockQuantity} units available`
                  : 'Out of stock'}
              </Alert>

              {/* Description */}
              <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                {car.description}
              </Typography>

              {/* Apply Button */}
              <Button
                variant="contained"
                fullWidth
                size="large"
                onClick={handleApply}
                disabled={car.status !== 'Available' || car.stockQuantity <= 0}
              >
                Apply for this Car
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CarDetailsPage;