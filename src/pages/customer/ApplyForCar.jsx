import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  Alert,
  Paper,
  Stepper,
  Step,
  StepLabel,
  Chip,
  useTheme,
} from '@mui/material';
import { getCarById } from '../../services/carService';
import { addApplication } from '../../services/applicationService';
import { useAuth } from '../../context/AuthContext';
import { validateCNIC, validatePhone, validateEmail } from '../../utils/validation';

const ApplyForCar = () => {
  const { carId } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const { user } = useAuth();
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeStep, setActiveStep] = useState(0);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    cnic: '',
    phone: '',
    address: '',
    city: '',
    color: '',
    notes: '',
  });

  useEffect(() => {
    const carData = getCarById(carId);
    if (carData) {
      setCar(carData);
      if (carData.availableColors?.length > 0) {
        setFormData(prev => ({ ...prev, color: carData.availableColors[0] }));
      }
    }
    setLoading(false);
  }, [carId]);

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        city: user.city || '',
      }));
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = 'Full name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!validateEmail(formData.email)) newErrors.email = 'Invalid email format';
    if (!formData.cnic) newErrors.cnic = 'CNIC is required';
    else if (!validateCNIC(formData.cnic)) newErrors.cnic = 'Invalid CNIC format (XXXXX-XXXXXXX-X)';
    if (!formData.phone) newErrors.phone = 'Phone is required';
    else if (!validatePhone(formData.phone)) newErrors.phone = 'Invalid phone format (03XX-XXXXXXX)';
    if (!formData.address) newErrors.address = 'Address is required';
    if (!formData.city) newErrors.city = 'City is required';
    if (!formData.color) newErrors.color = 'Please select a color';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const applicationData = {
      customerId: user?.id || 'GUEST',
      carId: car.id,
      selectedColor: formData.color,
      carMake: car.make,
      carModel: car.model,
      carVariant: car.variant,
      carImage: car.images?.[0] || '',
      customerName: formData.name,
      customerEmail: formData.email,
      customerPhone: formData.phone,
      customerAddress: formData.address,
      customerCity: formData.city,
      notes: formData.notes,
    };

    addApplication(applicationData);
    navigate('/application-success', { 
      state: { 
        carName: `${car.make} ${car.model}`,
        applicationId: applicationData.id,
      } 
    });
  };

  if (loading) return <Box>Loading...</Box>;
  if (!car) return <Box>Car not found</Box>;

  const steps = ['Select Car & Color', 'Fill Details', 'Submit Application'];

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Apply for a Car
      </Typography>

      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Grid container spacing={3}>
        <Grid item xs={12} md={7}>
          <Card>
            <CardContent>
              <form onSubmit={handleSubmit}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Alert severity="info" sx={{ mb: 2 }}>
                      Applying for: <strong>{car.make} {car.model} - {car.variant}</strong>
                    </Alert>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Full Name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      error={!!errors.name}
                      helperText={errors.name}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      error={!!errors.email}
                      helperText={errors.email}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="CNIC"
                      name="cnic"
                      placeholder="12345-6789012-3"
                      value={formData.cnic}
                      onChange={handleChange}
                      error={!!errors.cnic}
                      helperText={errors.cnic || 'Format: XXXXX-XXXXXXX-X'}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Phone"
                      name="phone"
                      placeholder="0321-1234567"
                      value={formData.phone}
                      onChange={handleChange}
                      error={!!errors.phone}
                      helperText={errors.phone || 'Format: 03XX-XXXXXXX'}
                      required
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Address"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      error={!!errors.address}
                      helperText={errors.address}
                      required
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="City"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      error={!!errors.city}
                      helperText={errors.city}
                      required
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Notes (Optional)"
                      name="notes"
                      multiline
                      rows={3}
                      value={formData.notes}
                      onChange={handleChange}
                      placeholder="Any special requests or requirements..."
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Button
                        variant="outlined"
                        fullWidth
                        onClick={() => navigate('/showroom')}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        variant="contained"
                        fullWidth
                        size="large"
                      >
                        Submit Application
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </form>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={5}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Car Details
              </Typography>
              <Box
                component="img"
                src={car.images?.[0] || 'https://via.placeholder.com/400x200?text=Car'}
                alt={`${car.make} ${car.model}`}
                sx={{
                  width: '100%',
                  height: 180,
                  objectFit: 'cover',
                  borderRadius: 2,
                  mb: 2,
                }}
              />
              <Typography variant="subtitle1" fontWeight="bold">
                {car.make} {car.model}
              </Typography>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                {car.variant} • {car.year}
              </Typography>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                {car.fuel} • {car.transmission}
              </Typography>

              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Select Color
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {car.availableColors?.map(color => (
                    <Chip
                      key={color}
                      label={color}
                      onClick={() => setFormData(prev => ({ ...prev, color }))}
                      color={formData.color === color ? 'primary' : 'default'}
                      variant={formData.color === color ? 'filled' : 'outlined'}
                      sx={{
                        bgcolor: formData.color === color ? 'primary.main' : 'transparent',
                        color: formData.color === color ? '#fff' : 'inherit',
                      }}
                    />
                  ))}
                </Box>
                {errors.color && (
                  <Typography color="error" variant="caption">
                    {errors.color}
                  </Typography>
                )}
              </Box>

              <Box sx={{ mt: 2, p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
                <Typography variant="body2" color="textSecondary">
                  Price: <strong>{new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR', minimumFractionDigits: 0 }).format(car.sellingPrice)}</strong>
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Stock: <strong>{car.stockQuantity} units</strong>
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ApplyForCar;