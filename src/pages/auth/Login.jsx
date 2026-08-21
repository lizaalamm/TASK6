import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Avatar,
  Alert,
  Paper,
  InputAdornment,
  IconButton,
  Grid,
  Divider,
} from '@mui/material';
import {
  Email,
  Lock,
  Visibility,
  VisibilityOff,
  CarRental,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { loginUser } from '../../services/authService';
import { seedData } from '../../data/seedData';
import { seedInitialData, getData } from '../../services/localStorage';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Seed initial data on first load
    console.log('Checking and seeding data...');
    const seeded = seedInitialData(seedData);
    if (seeded) {
      console.log('Data seeded successfully!');
      // Verify data was seeded
      const cars = getData('udevs_cars', []);
      console.log('Cars in localStorage:', cars.length);
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = loginUser(formData.email, formData.password);
      
      if (result.success) {
        login(result.user);
        // Redirect based on role
        if (result.user.role === 'admin') {
          navigate('/dashboard');
        } else if (result.user.role === 'sales' || result.user.role === 'inventory') {
          navigate('/dashboard');
        } else if (result.user.role === 'customer') {
          navigate('/customer-dashboard');
        }
      } else {
        setError(result.message || 'Login failed');
      }
    } catch (err) {
      setError('An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  const demoCredentials = [
    { role: 'Admin', email: 'admin@udevs.com', password: 'Admin@123', color: '#5D4037' },
    { role: 'Sales', email: 'sales@udevs.com', password: 'Sales@123', color: '#795548' },
    { role: 'Inventory', email: 'inventory@udevs.com', password: 'Inventory@123', color: '#8D6E63' },
    { role: 'Customer', email: 'customer@udevs.com', password: 'Customer@123', color: '#A1887F' },
  ];

  const fillCredentials = (email, password) => {
    setFormData({ email, password });
    setError('');
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
      <Card
        sx={{
          maxWidth: 440,
          width: '100%',
          p: 3,
          borderRadius: 4,
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        }}
      >
        <CardContent>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Avatar
              sx={{
                width: 72,
                height: 72,
                bgcolor: 'primary.main',
                margin: '0 auto',
                mb: 2,
              }}
            >
              <CarRental sx={{ fontSize: 40 }} />
            </Avatar>
            <Typography variant="h5" fontWeight="bold">
              Car Showroom
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Sign in to your account
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
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange}
              margin="normal"
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{ mt: 3, mb: 2 }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <Divider sx={{ my: 3 }}>
            <Typography variant="caption" color="textSecondary">
              Demo Credentials
            </Typography>
          </Divider>

          <Grid container spacing={1}>
            {demoCredentials.map((cred) => (
              <Grid item xs={6} key={cred.role}>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 1,
                    cursor: 'pointer',
                    textAlign: 'center',
                    '&:hover': {
                      bgcolor: 'action.hover',
                      borderColor: cred.color,
                    },
                  }}
                  onClick={() => fillCredentials(cred.email, cred.password)}
                >
                  <Typography variant="caption" fontWeight="bold" display="block">
                    {cred.role}
                  </Typography>
                  <Typography variant="caption" color="textSecondary" noWrap>
                    {cred.email}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Login;