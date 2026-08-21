import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Chip,
  TextField,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  IconButton,
  useTheme,
} from '@mui/material';
import {
  Search,
  Clear,
  DirectionsCar,
} from '@mui/icons-material';
import { getAvailableCars } from '../../services/carService';
import { formatCurrency } from '../../utils/calculations';

const Showroom = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [cars, setCars] = useState([]);
  const [filteredCars, setFilteredCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    make: '',
    minPrice: '',
    maxPrice: '',
    fuel: '',
  });

  useEffect(() => {
    loadCars();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [cars, filters]);

  const loadCars = () => {
    const availableCars = getAvailableCars();
    setCars(availableCars);
    setFilteredCars(availableCars);
    setLoading(false);
  };

  const applyFilters = () => {
    let filtered = [...cars];

    if (filters.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(car =>
        car.make.toLowerCase().includes(search) ||
        car.model.toLowerCase().includes(search) ||
        car.variant.toLowerCase().includes(search)
      );
    }

    if (filters.make) {
      filtered = filtered.filter(car => car.make === filters.make);
    }

    if (filters.minPrice) {
      filtered = filtered.filter(car => car.sellingPrice >= parseInt(filters.minPrice));
    }

    if (filters.maxPrice) {
      filtered = filtered.filter(car => car.sellingPrice <= parseInt(filters.maxPrice));
    }

    if (filters.fuel) {
      filtered = filtered.filter(car => car.fuel === filters.fuel);
    }

    setFilteredCars(filtered);
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      make: '',
      minPrice: '',
      maxPrice: '',
      fuel: '',
    });
  };

  const makes = [...new Set(cars.map(car => car.make))];
  const fuelTypes = [...new Set(cars.map(car => car.fuel))];

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Our Showroom
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Browse our collection of premium vehicles
        </Typography>
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search cars..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Make</InputLabel>
                <Select
                  value={filters.make}
                  onChange={(e) => handleFilterChange('make', e.target.value)}
                  label="Make"
                >
                  <MenuItem value="">All</MenuItem>
                  {makes.map(make => (
                    <MenuItem key={make} value={make}>{make}</MenuItem>
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
            <Grid item xs={12} sm={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Fuel</InputLabel>
                <Select
                  value={filters.fuel}
                  onChange={(e) => handleFilterChange('fuel', e.target.value)}
                  label="Fuel"
                >
                  <MenuItem value="">All</MenuItem>
                  {fuelTypes.map(fuel => (
                    <MenuItem key={fuel} value={fuel}>{fuel}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={1}>
              <IconButton onClick={clearFilters} color="primary">
                <Clear />
              </IconButton>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Car Grid */}
      {filteredCars.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <DirectionsCar sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="textSecondary">
            No cars available
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Check back later for new arrivals
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {filteredCars.map((car) => (
            <Grid item xs={12} sm={6} md={4} key={car.id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: theme.shadows[8],
                  },
                }}
              >
                <CardMedia
                  component="img"
                  height="200"
                  image={car.images?.[0] || 'https://via.placeholder.com/400x200?text=Car'}
                  alt={`${car.make} ${car.model}`}
                  sx={{ objectFit: 'cover' }}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Typography variant="h6" fontWeight="bold">
                      {car.make} {car.model}
                    </Typography>
                    <Chip
                      label={car.status}
                      size="small"
                      color="success"
                    />
                  </Box>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    {car.variant} • {car.year}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    {car.fuel} • {car.transmission}
                  </Typography>
                  <Typography variant="h6" color="primary" sx={{ mt: 1 }}>
                    {formatCurrency(car.sellingPrice)}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 0.5, mt: 1, flexWrap: 'wrap' }}>
                    {car.availableColors?.slice(0, 4).map(color => (
                      <Chip
                        key={color}
                        label={color}
                        size="small"
                        variant="outlined"
                        sx={{
                          bgcolor: color.toLowerCase(),
                          color: ['White', 'Silver'].includes(color) ? '#333' : '#fff',
                          '&:hover': { opacity: 0.8 },
                        }}
                      />
                    ))}
                  </Box>
                  <Button
                    variant="contained"
                    fullWidth
                    sx={{ mt: 2 }}
                    onClick={() => navigate(`/car/${car.id}`)}
                  >
                    View Details
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default Showroom;