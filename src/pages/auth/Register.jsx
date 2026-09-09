/**
 * src/pages/auth/Register.jsx
 * ----------------------------------------------------------------------------
 * Customer sign-up screen: creates a CUSTOMER account via
 * POST /api/users/register, then redirects to the customer dashboard.
 * Public registration is customer-only (spec §2) — staff accounts are
 * created from the portal by the Super Admin / Admin.
 * ----------------------------------------------------------------------------
 */
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
  CircularProgress,
} from '@mui/material';
import { Email, Lock, Person, DirectionsCar, Phone } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { homeRouteFor } from '../../constants/roles';
import { seedData } from '../../data/seedData';
import { seedInitialData } from '../../services/localStorage';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  // --- Form state ----------------------------------------------------------------
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    userType: 'customer',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Seed the local demo catalogue once (cars / customers / applications).
  React.useEffect(() => {
    seedInitialData(seedData);
  }, []);

  /** Update a field + clear any previous error. */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  /** Create the account → redirect to the role home page. */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = { ...formData };
      if (!payload.phone) delete payload.phone; // backend treats missing as null
      const result = await register(payload);
      if (result.success) {
        navigate(homeRouteFor(result.user), { replace: true });
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
        // Animated espresso → gold → plum showroom backdrop (matches Login).
        background: 'linear-gradient(-45deg, #2A1B14, #5D4037, #7B1FA2, #B07C24)',
        backgroundSize: '400% 400%',
        animation: 'gradientPan 14s ease infinite',
        p: 2,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Floating ambient light blobs */}
      <Box className="blob" sx={{ width: 420, height: 420, background: '#D4A24C', top: -120, right: -120 }} />
      <Box className="blob" sx={{ width: 360, height: 360, background: '#7B1FA2', bottom: -100, left: -80, animationDelay: '2s' }} />

      {/* Glass sign-up card */}
      <Card
        className="page-enter"
        sx={{
          maxWidth: 460,
          width: '100%',
          p: 3,
          borderRadius: 6,
          position: 'relative',
          zIndex: 1,
          background: 'rgba(255,255,255,.92)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          boxShadow: '0 30px 80px rgba(0,0,0,.45)',
          border: '1px solid rgba(255,255,255,.6)',
        }}
      >
        <CardContent>
          {/* Brand header */}
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Avatar
              sx={{
                width: 76,
                height: 76,
                margin: '0 auto',
                mb: 2,
                background: 'linear-gradient(135deg, #5D4037 0%, #D4A24C 100%)',
                boxShadow: '0 14px 34px rgba(93,64,55,.4)',
              }}
            >
              <DirectionsCar sx={{ fontSize: 42 }} />
            </Avatar>
            <Typography variant="h5" fontWeight={800}>
              Create account
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Join the showroom in seconds
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          {/* Registration form */}
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
            <Alert severity="info" sx={{ mt: 2, borderRadius: 2 }}>
              You are registering as a <strong>Customer</strong> — browse the showroom
              and apply for cars. Staff accounts are created by the showroom.
            </Alert>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{ mt: 3, mb: 2, py: 1.4, borderRadius: 3, fontSize: 16 }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Register'}
            </Button>
          </form>

          <Typography variant="body2" align="center">
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#8D5A1E', fontWeight: 700, textDecoration: 'none' }}>
              Sign in
            </Link>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Register;
