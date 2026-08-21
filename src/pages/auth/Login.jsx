import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
} from '@mui/material';
import {
  CarRental,
  Email,
  Lock,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { loginUser } from '../../services/authService';
import { seedData } from '../../data/seedData';
import { seedInitialData } from '../../services/localStorage';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    seedInitialData(seedData);
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((previous) => ({ ...previous, [name]: value }));
    setError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await loginUser(formData.email, formData.password);

      if (!result.success) {
        setError(result.message || 'Login failed');
        return;
      }

      login(result.user);

      if (result.user.role === 'customer') {
        navigate('/customer-dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (submitError) {
      setError('An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  const demoCredentials = [
    { role: 'Admin', email: 'admin@udevs.com', password: 'Admin@123' },
    { role: 'Sales', email: 'sales@udevs.com', password: 'Sales@123' },
    { role: 'Inventory', email: 'inventory@udevs.com', password: 'Inventory@123' },
    { role: 'Customer', email: 'customer@udevs.com', password: 'Customer@123' },
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
          p: 2,
          borderRadius: 4,
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        }}
      >
        <CardContent>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Avatar
              sx={{
                width: 72,
                height: 72,
                mx: 'auto',
                mb: 2,
                bgcolor: '#5D4037',
              }}
            >
              <CarRental fontSize="large" />
            </Avatar>
            <Typography variant="h4" fontWeight={700} color="#5D4037">
              Car Showroom
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Sign in to manage your showroom
            </Typography>
          </Box>

          <Box component="form" onSubmit={handleSubmit}>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <TextField
              fullWidth
              required
              label="Email address"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              margin="normal"
              autoComplete="username"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              required
              label="Password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange}
              margin="normal"
              autoComplete="current-password"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      edge="end"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      onClick={() => setShowPassword((visible) => !visible)}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button
              fullWidth
              type="submit"
              variant="contained"
              disabled={loading}
              sx={{ mt: 3, mb: 3, py: 1.5, bgcolor: '#5D4037' }}
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </Button>
          </Box>

          <Box sx={{ mt: 2 }}>
            <Typography variant="caption" color="text.secondary" display="block" mb={1}>
              Demo access
            </Typography>
            {demoCredentials.map((credential) => (
              <Button
                key={credential.role}
                fullWidth
                size="small"
                color="inherit"
                sx={{ justifyContent: 'space-between', textTransform: 'none', mb: 0.5 }}
                onClick={() => fillCredentials(credential.email, credential.password)}
              >
                <span>{credential.role}</span>
                <span>{credential.email}</span>
              </Button>
            ))}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Login;
