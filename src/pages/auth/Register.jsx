import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Avatar,
  Alert,
  InputAdornment,
  MenuItem,
} from '@mui/material';
import { Email, Lock, Person, CarRental, Phone } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { seedData } from '../../data/seedData';
import { seedInitialData } from '../../services/localStorage';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    userType: 'customer',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    seedInitialData(seedData);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = { ...formData };
      if (!payload.phone) delete payload.phone;
      const result = await register(payload);
      if (result.success) {
        const role = result.user?.role || result.user?.userType;
        navigate(role === 'customer' ? '/customer-dashboard' : '/dashboard', { replace: true });
      } else {
        setError(result.message || 'Registration failed');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to reach the API');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #5D4037 0%, #8D6E63 100%)',
        p: 2,
      }}
    >
      <Card sx={{ maxWidth: 440, width: '100%', p: 3, borderRadius: 4 }}>
        <CardContent>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Avatar sx={{ width: 72, height: 72, bgcolor: 'primary.main', margin: '0 auto', mb: 2 }}>
              <CarRental sx={{ fontSize: 40 }} />
            </Avatar>
            <Typography variant="h5" fontWeight="bold">
              Create account
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Register through POST /api/users/register
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Full name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              margin="normal"
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Person color="action" />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              margin="normal"
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email color="action" />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              fullWidth
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              margin="normal"
              required
              helperText="At least 8 characters"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock color="action" />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              fullWidth
              label="Phone (optional)"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              margin="normal"
              placeholder="03001234567"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Phone color="action" />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              select
              fullWidth
              label="Account type"
              name="userType"
              value={formData.userType}
              onChange={handleChange}
              margin="normal"
            >
              <MenuItem value="customer">Customer</MenuItem>
              <MenuItem value="employee">Employee</MenuItem>
              <MenuItem value="sales">Sales</MenuItem>
            </TextField>
            <Button type="submit" fullWidth variant="contained" size="large" disabled={loading} sx={{ mt: 3, mb: 2 }}>
              {loading ? 'Creating account...' : 'Register'}
            </Button>
          </form>

          <Typography variant="body2" align="center">
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#5D4037', fontWeight: 600 }}>
              Sign in
            </Link>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Register;
