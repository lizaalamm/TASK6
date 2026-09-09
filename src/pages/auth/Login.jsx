/**
 * src/pages/auth/Login.jsx
 * ----------------------------------------------------------------------------
 * Sign-in screen: email + password → JWT via AuthContext, then role-based
 * redirect (superadmin → /superadmin, customer → /customer-dashboard, …).
 *
 * Also seeds the local demo catalogue (cars/customers) on first visit and
 * offers one-click demo credentials for every role.
 * ----------------------------------------------------------------------------
 */
import React, { useState, useEffect } from 'react';
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
  Paper,
  InputAdornment,
  IconButton,
  Grid,
  Divider,
  CircularProgress,
} from '@mui/material';
import {
  Email,
  Lock,
  Visibility,
  VisibilityOff,
  DirectionsCar,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { homeRouteFor } from '../../constants/roles';
import { seedData } from '../../data/seedData';
import { seedInitialData } from '../../services/localStorage';

/** One-click demo logins — one per key role. */
const demoCredentials = [
  { role: 'Super Admin', email: 'superadmin@udevs.com', password: 'Super@123', color: '#7B1FA2' },
  { role: 'Admin', email: 'admin@udevs.com', password: 'Admin@123', color: '#C62828' },
  { role: 'Sales', email: 'sales@udevs.com', password: 'Sales@123', color: '#2E7D32' },
  { role: 'Inventory', email: 'inventory@udevs.com', password: 'Inventory@123', color: '#EF6C00' },
  { role: 'Team Lead', email: 'lead@udevs.com', password: 'Lead@1234', color: '#1565C0' },
  { role: 'Customer', email: 'customer@udevs.com', password: 'Customer@123', color: '#6D4C41' },
];

const Login = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated, user } = useAuth();

  // --- Form state ----------------------------------------------------------------
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Seed the local demo catalogue once (cars / customers / applications).
  useEffect(() => {
    seedInitialData(seedData);
  }, []);

  // Already logged in → bounce straight to the role home page.
  useEffect(() => {
    if (isAuthenticated && user) {
      navigate(homeRouteFor(user), { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  /** Update a field + clear any previous error. */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  /** Submit credentials → JWT → role-based redirect. */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(formData.email, formData.password);
      if (result.success) {
        navigate(homeRouteFor(result.user), { replace: true });
      } else {
        setError(result.message || 'Login failed');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to reach the API. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  /** Fill the form with a demo account's credentials. */
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
        // Animated espresso → gold → plum showroom backdrop.
        background: 'linear-gradient(-45deg, #2A1B14, #5D4037, #7B1FA2, #B07C24)',
        backgroundSize: '400% 400%',
        animation: 'gradientPan 14s ease infinite',
        p: 2,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Floating ambient light blobs */}
      <Box className="blob" sx={{ width: 420, height: 420, background: '#D4A24C', top: -120, left: -120 }} />
      <Box className="blob" sx={{ width: 360, height: 360, background: '#7B1FA2', bottom: -100, right: -80, animationDelay: '2s' }} />
      <Box className="blob" sx={{ width: 220, height: 220, background: '#fff', top: '60%', left: '12%', opacity: 0.25, animationDelay: '4s' }} />

      {/* Glass sign-in card */}
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
              Car Showroom
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Sign in with the live API
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          {/* Credentials form */}
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
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
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
              sx={{ mt: 3, mb: 2, py: 1.4, borderRadius: 3, fontSize: 16 }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
            </Button>
          </form>

          <Typography variant="body2" align="center" sx={{ mb: 1 }}>
            New here?{' '}
            <Link to="/register" style={{ color: '#8D5A1E', fontWeight: 700, textDecoration: 'none' }}>
              Create an account
            </Link>
          </Typography>

          <Divider sx={{ my: 2.5 }}>
            <Typography variant="caption" color="textSecondary" fontWeight={700}>
              ONE-CLICK DEMO LOGIN
            </Typography>
          </Divider>

          {/* Demo credential chips */}
          <Grid container spacing={1}>
            {demoCredentials.map((cred) => (
              <Grid item xs={6} sm={4} key={cred.role}>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 1,
                    cursor: 'pointer',
                    textAlign: 'center',
                    borderRadius: 2,
                    borderTop: `3px solid ${cred.color}`,
                    transition: 'all .2s ease',
                    '&:hover': {
                      bgcolor: 'action.hover',
                      transform: 'translateY(-2px)',
                      boxShadow: 2,
                    },
                  }}
                  onClick={() => fillCredentials(cred.email, cred.password)}
                >
                  <Typography variant="caption" fontWeight={800} display="block" sx={{ color: cred.color }}>
                    {cred.role}
                  </Typography>
                  <Typography variant="caption" color="textSecondary" noWrap display="block">
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
