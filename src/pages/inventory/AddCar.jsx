import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Chip,
  IconButton,
  Alert,
  useTheme,
} from '@mui/material';
import { Add, Delete, ArrowBack } from '@mui/icons-material';
import { addCar } from '../../services/carService';
import { getSuppliers } from '../../services/supplierService';

const AddCar = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [suppliers, setSuppliers] = useState([]);
  const [formData, setFormData] = useState({
    make: '',
    model: '',
    year: new Date().getFullYear(),
    variant: '',
    purchaseRate: '',
    sellingPrice: '',
    availableColors: [],
    stockQuantity: 1,
    fuel: 'Petrol',
    transmission: 'Auto',
    mileage: 0,
    engine: '',
    images: [''],
    description: '',
    status: 'Available',
    supplierId: '',
  });
  const [colorInput, setColorInput] = useState('');
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const supplierData = getSuppliers();
    setSuppliers(supplierData);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleAddColor = () => {
    if (colorInput && !formData.availableColors.includes(colorInput)) {
      setFormData(prev => ({
        ...prev,
        availableColors: [...prev.availableColors, colorInput],
      }));
      setColorInput('');
    }
  };

  const handleRemoveColor = (color) => {
    setFormData(prev => ({
      ...prev,
      availableColors: prev.availableColors.filter(c => c !== color),
    }));
  };

  const handleAddImage = () => {
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ''],
    }));
  };

  const handleImageChange = (index, value) => {
    const newImages = [...formData.images];
    newImages[index] = value;
    setFormData(prev => ({ ...prev, images: newImages }));
  };

  const handleRemoveImage = (index) => {
    if (formData.images.length > 1) {
      setFormData(prev => ({
        ...prev,
        images: prev.images.filter((_, i) => i !== index),
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.make) newErrors.make = 'Make is required';
    if (!formData.model) newErrors.model = 'Model is required';
    if (!formData.variant) newErrors.variant = 'Variant is required';
    if (!formData.purchaseRate) newErrors.purchaseRate = 'Purchase rate is required';
    else if (formData.purchaseRate < 0) newErrors.purchaseRate = 'Must be non-negative';
    if (!formData.sellingPrice) newErrors.sellingPrice = 'Selling price is required';
    else if (formData.sellingPrice < 0) newErrors.sellingPrice = 'Must be non-negative';
    if (formData.availableColors.length === 0) newErrors.colors = 'At least one color required';
    if (!formData.supplierId) newErrors.supplierId = 'Supplier is required';
    if (formData.stockQuantity < 0) newErrors.stockQuantity = 'Must be non-negative';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    // Filter out empty image URLs
    const images = formData.images.filter(img => img.trim() !== '');

    const carData = {
      ...formData,
      purchaseRate: parseFloat(formData.purchaseRate),
      sellingPrice: parseFloat(formData.sellingPrice),
      stockQuantity: parseInt(formData.stockQuantity),
      mileage: parseInt(formData.mileage) || 0,
      images: images.length > 0 ? images : ['https://via.placeholder.com/800x400?text=Car'],
    };

    addCar(carData);
    setSuccess(true);
    setTimeout(() => {
      navigate('/cars');
    }, 2000);
  };

  const fuelOptions = ['Petrol', 'Diesel', 'Hybrid', 'Electric', 'CNG'];
  const transmissionOptions = ['Auto', 'Manual', 'CVT'];
  const statusOptions = ['Available', 'Reserved', 'Sold', 'Inactive'];
  const yearOptions = Array.from({ length: 20 }, (_, i) => new Date().getFullYear() - i);

  return (
    <Box>
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate('/cars')}
        sx={{ mb: 3 }}
      >
        Back to Cars
      </Button>

      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Add New Car
      </Typography>

      <Card>
        <CardContent>
          {success && (
            <Alert severity="success" sx={{ mb: 3 }}>
              Car added successfully! Redirecting...
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              {/* Basic Information */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Basic Information
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Make"
                  name="make"
                  value={formData.make}
                  onChange={handleChange}
                  error={!!errors.make}
                  helperText={errors.make}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Model"
                  name="model"
                  value={formData.model}
                  onChange={handleChange}
                  error={!!errors.model}
                  helperText={errors.model}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth>
                  <InputLabel>Year</InputLabel>
                  <Select
                    name="year"
                    value={formData.year}
                    onChange={handleChange}
                    label="Year"
                  >
                    {yearOptions.map(year => (
                      <MenuItem key={year} value={year}>{year}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Variant"
                  name="variant"
                  value={formData.variant}
                  onChange={handleChange}
                  error={!!errors.variant}
                  helperText={errors.variant}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    label="Status"
                  >
                    {statusOptions.map(status => (
                      <MenuItem key={status} value={status}>{status}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Pricing */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  Pricing
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Purchase Rate (PKR)"
                  name="purchaseRate"
                  type="number"
                  value={formData.purchaseRate}
                  onChange={handleChange}
                  error={!!errors.purchaseRate}
                  helperText={errors.purchaseRate}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Selling Price (PKR)"
                  name="sellingPrice"
                  type="number"
                  value={formData.sellingPrice}
                  onChange={handleChange}
                  error={!!errors.sellingPrice}
                  helperText={errors.sellingPrice}
                  required
                />
              </Grid>

              {/* Supplier */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  Supplier
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth error={!!errors.supplierId}>
                  <InputLabel>Supplier</InputLabel>
                  <Select
                    name="supplierId"
                    value={formData.supplierId}
                    onChange={handleChange}
                    label="Supplier"
                    required
                  >
                    {suppliers.map(supplier => (
                      <MenuItem key={supplier.id} value={supplier.id}>
                        {supplier.name}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.supplierId && (
                    <Typography color="error" variant="caption">
                      {errors.supplierId}
                    </Typography>
                  )}
                </FormControl>
              </Grid>

              {/* Specs */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  Specifications
                </Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth>
                  <InputLabel>Fuel</InputLabel>
                  <Select
                    name="fuel"
                    value={formData.fuel}
                    onChange={handleChange}
                    label="Fuel"
                  >
                    {fuelOptions.map(fuel => (
                      <MenuItem key={fuel} value={fuel}>{fuel}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth>
                  <InputLabel>Transmission</InputLabel>
                  <Select
                    name="transmission"
                    value={formData.transmission}
                    onChange={handleChange}
                    label="Transmission"
                  >
                    {transmissionOptions.map(trans => (
                      <MenuItem key={trans} value={trans}>{trans}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Engine (e.g., 1800cc)"
                  name="engine"
                  value={formData.engine}
                  onChange={handleChange}
                />
              </Grid>

              {/* Stock */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Stock Quantity"
                  name="stockQuantity"
                  type="number"
                  value={formData.stockQuantity}
                  onChange={handleChange}
                  error={!!errors.stockQuantity}
                  helperText={errors.stockQuantity}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Mileage (km)"
                  name="mileage"
                  type="number"
                  value={formData.mileage}
                  onChange={handleChange}
                />
              </Grid>

              {/* Colors */}
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  Available Colors
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                  <TextField
                    size="small"
                    label="Color"
                    value={colorInput}
                    onChange={(e) => setColorInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddColor()}
                    sx={{ flex: 1 }}
                  />
                  <IconButton onClick={handleAddColor} color="primary">
                    <Add />
                  </IconButton>
                </Box>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {formData.availableColors.map(color => (
                    <Chip
                      key={color}
                      label={color}
                      onDelete={() => handleRemoveColor(color)}
                      sx={{ bgcolor: color.toLowerCase(), color: ['White', 'Silver'].includes(color) ? '#333' : '#fff' }}
                    />
                  ))}
                </Box>
                {errors.colors && (
                  <Typography color="error" variant="caption">
                    {errors.colors}
                  </Typography>
                )}
              </Grid>

              {/* Images */}
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  Images (URLs)
                </Typography>
                {formData.images.map((img, index) => (
                  <Box key={index} sx={{ display: 'flex', gap: 1, mb: 1 }}>
                    <TextField
                      fullWidth
                      size="small"
                      placeholder="Image URL"
                      value={img}
                      onChange={(e) => handleImageChange(index, e.target.value)}
                    />
                    {formData.images.length > 1 && (
                      <IconButton onClick={() => handleRemoveImage(index)} color="error">
                        <Delete />
                      </IconButton>
                    )}
                  </Box>
                ))}
                <Button size="small" startIcon={<Add />} onClick={handleAddImage}>
                  Add Image
                </Button>
              </Grid>

              {/* Description */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  name="description"
                  multiline
                  rows={3}
                  value={formData.description}
                  onChange={handleChange}
                />
              </Grid>

              {/* Actions */}
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={() => navigate('/cars')}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    size="large"
                  >
                    Add Car
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default AddCar;