/**
 * src/routes/PrivateRoute.jsx
 * ----------------------------------------------------------------------------
 * Outer guard for ALL authenticated pages: shows a branded loader while the
 * session is restoring, redirects to /login when logged out, and otherwise
 * renders the app shell (`Layout`) + the matched child route (`Outlet`).
 * ----------------------------------------------------------------------------
 */
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { Box, CircularProgress, Typography, Avatar } from '@mui/material';
import { DirectionsCar } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/layout/Layout';

const PrivateRoute = () => {
  const { isAuthenticated, loading } = useAuth();

  // Session still restoring from the stored JWT → branded splash loader.
  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
          background:
            'radial-gradient(1200px 600px at 20% -10%, rgba(212,162,76,.18), transparent), radial-gradient(1000px 500px at 110% 10%, rgba(123,31,162,.12), transparent)',
        }}
      >
        <Avatar
          sx={{
            width: 64,
            height: 64,
            background: 'linear-gradient(135deg, #5D4037 0%, #D4A24C 100%)',
            boxShadow: '0 12px 32px rgba(93,64,55,.35)',
          }}
        >
          <DirectionsCar sx={{ fontSize: 36 }} />
        </Avatar>
        <CircularProgress size={28} thickness={5} />
        <Typography color="textSecondary" variant="body2" fontWeight={500}>
          Restoring session…
        </Typography>
      </Box>
    );
  }

  // No session → login.
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Authenticated → app shell + nested page.
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
};

export default PrivateRoute;
