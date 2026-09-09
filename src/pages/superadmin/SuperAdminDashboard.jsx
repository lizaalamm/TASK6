/**
 * src/pages/superadmin/SuperAdminDashboard.jsx
 * ----------------------------------------------------------------------------
 * Platform-owner command centre (route: `/superadmin`, role: superadmin only).
 *
 * Sections:
 *  1. KPI cards — total / active / inactive / terminated accounts
 *  2. Role distribution — per-role counts with animated progress bars
 *  3. Leadership table — every superadmin + admin account on the platform
 *  4. Recent signups — the 5 newest users
 *
 * Data comes from the superadmin-only API (`GET /api/admin/stats` and
 * `GET /api/admin/admins`) so numbers are always live, never mocked.
 * ----------------------------------------------------------------------------
 */
import React, { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Avatar,
  Chip,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Divider,
  Alert,
  Skeleton,
} from '@mui/material';
import {
  SupervisorAccount,
  Group,
  CheckCircle,
  Block,
  PersonOff,
  Shield,
  PersonAdd,
} from '@mui/icons-material';
import api from '../../services/api';
import { roleLabel, roleColor } from '../../constants/roles';

/** Gradient backgrounds cycling across the KPI cards. */
const CARD_GRADIENTS = [
  'linear-gradient(135deg, #7B1FA2 0%, #BA68C8 100%)', // purple — total
  'linear-gradient(135deg, #2E7D32 0%, #66BB6A 100%)', // green — active
  'linear-gradient(135deg, #EF6C00 0%, #FFB74D 100%)', // orange — inactive
  'linear-gradient(135deg, #C62828 0%, #EF5350 100%)', // red — terminated
];

const SuperAdminDashboard = () => {
  // --- State ------------------------------------------------------------------
  const [stats, setStats] = useState(null); // { total, active, ..., byRole, recentUsers }
  const [admins, setAdmins] = useState([]); // leadership accounts
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // --- Load both superadmin endpoints in parallel on mount --------------------
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const [statsRes, adminsRes] = await Promise.all([
          api.get('/admin/stats'),
          api.get('/admin/admins'),
        ]);
        setStats(statsRes.data?.data || null);
        setAdmins(adminsRes.data?.data || []);
      } catch (err) {
        setError(
          err.response?.data?.message || 'Could not load system statistics.'
        );
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // --- Derived: KPI card definitions -------------------------------------------
  const kpiCards = [
    { title: 'Total Accounts', value: stats?.total ?? 0, icon: <Group sx={{ fontSize: 30 }} /> },
    { title: 'Active', value: stats?.active ?? 0, icon: <CheckCircle sx={{ fontSize: 30 }} /> },
    { title: 'Inactive', value: stats?.inactive ?? 0, icon: <Block sx={{ fontSize: 30 }} /> },
    { title: 'Terminated', value: stats?.terminated ?? 0, icon: <PersonOff sx={{ fontSize: 30 }} /> },
  ];

  // --- Derived: role distribution rows sorted by count (desc) -------------------
  const roleRows = Object.entries(stats?.byRole || {}).sort((a, b) => b[1] - a[1]);
  const maxRoleCount = Math.max(1, ...roleRows.map(([, count]) => count));

  return (
    <Box className="page-enter">
      {/* ===== Page header ===================================================== */}
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Avatar
          sx={{
            width: 56,
            height: 56,
            background: 'linear-gradient(135deg, #7B1FA2 0%, #D4A24C 100%)',
            boxShadow: '0 10px 28px rgba(123,31,162,.35)',
          }}
        >
          <SupervisorAccount sx={{ fontSize: 32 }} />
        </Avatar>
        <Box>
          <Typography variant="h4" fontWeight={800} gutterBottom sx={{ mb: 0 }}>
            Super Admin Panel
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Platform-wide control — accounts, roles and leadership access.
          </Typography>
        </Box>
        <Chip
          icon={<Shield />}
          label="SUPERADMIN"
          size="small"
          sx={{
            ml: 'auto',
            fontWeight: 800,
            letterSpacing: 1,
            color: '#fff',
            background: 'linear-gradient(135deg, #7B1FA2, #BA68C8)',
          }}
        />
      </Box>

      {/* ===== Error banner ===================================================== */}
      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 3 }}>
          {error}
        </Alert>
      )}

      {/* ===== KPI cards ========================================================= */}
      <Grid container spacing={3}>
        {kpiCards.map((card, i) => (
          <Grid item xs={12} sm={6} md={3} key={card.title}>
            <Card
              className="kpi-glow"
              sx={{
                background: CARD_GRADIENTS[i % CARD_GRADIENTS.length],
                color: '#fff',
                overflow: 'hidden',
                position: 'relative',
                animation: `fadeUp .5s ease ${i * 0.08}s both`,
              }}
            >
              <CardContent>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Box>
                    <Typography variant="caption" sx={{ opacity: 0.85, fontWeight: 600 }}>
                      {card.title.toUpperCase()}
                    </Typography>
                    <Typography variant="h4" fontWeight={800}>
                      {loading ? '–' : card.value}
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: 'rgba(255,255,255,.22)', width: 52, height: 52 }}>
                    {card.icon}
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* ===== Role distribution + leadership ===================================== */}
      <Grid container spacing={3} sx={{ mt: 1 }}>
        {/* Role distribution bars */}
        <Grid item xs={12} md={5}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" fontWeight={700} gutterBottom>
                Accounts by Role
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Live breakdown of every account on the platform.
              </Typography>
              <Divider sx={{ my: 2 }} />
              {loading ? (
                // Skeleton rows while fetching.
                [...Array(4)].map((_, i) => (
                  <Skeleton key={i} height={44} sx={{ borderRadius: 2 }} />
                ))
              ) : roleRows.length === 0 ? (
                <Typography color="textSecondary">No accounts yet.</Typography>
              ) : (
                roleRows.map(([role, count]) => (
                  <Box key={role} sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Chip
                        label={roleLabel(role)}
                        size="small"
                        sx={{
                          fontWeight: 700,
                          color: '#fff',
                          backgroundColor: roleColor(role),
                        }}
                      />
                      <Typography variant="body2" fontWeight={700}>
                        {count}
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={(count / maxRoleCount) * 100}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: 'action.hover',
                        '& .MuiLinearProgress-bar': {
                          borderRadius: 4,
                          backgroundColor: roleColor(role),
                        },
                      }}
                    />
                  </Box>
                ))
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Leadership accounts table */}
        <Grid item xs={12} md={7}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Shield color="primary" />
                <Typography variant="h6" fontWeight={700}>
                  Leadership Accounts
                </Typography>
              </Box>
              <Typography variant="caption" color="textSecondary">
                Everyone holding admin-level access. Manage them under Users.
              </Typography>
              <Divider sx={{ my: 2 }} />
              <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 2 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>Account</strong></TableCell>
                      <TableCell><strong>Role</strong></TableCell>
                      <TableCell><strong>Status</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={3}>
                          <Skeleton height={36} />
                        </TableCell>
                      </TableRow>
                    ) : (
                      admins.map((admin) => (
                        <TableRow key={admin.id} hover>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                              <Avatar
                                sx={{
                                  width: 32,
                                  height: 32,
                                  fontSize: 14,
                                  fontWeight: 700,
                                  backgroundColor: roleColor(admin.userType),
                                }}
                              >
                                {admin.name?.charAt(0) || 'U'}
                              </Avatar>
                              <Box>
                                <Typography variant="body2" fontWeight={600}>
                                  {admin.name}
                                </Typography>
                                <Typography variant="caption" color="textSecondary">
                                  {admin.email}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={roleLabel(admin.userType)}
                              size="small"
                              sx={{
                                fontWeight: 700,
                                color: '#fff',
                                backgroundColor: roleColor(admin.userType),
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={admin.status || 'active'}
                              size="small"
                              color={
                                String(admin.status || '').toLowerCase() === 'active'
                                  ? 'success'
                                  : 'default'
                              }
                            />
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* ===== Recent signups ====================================================== */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PersonAdd color="primary" />
            <Typography variant="h6" fontWeight={700}>
              Recent Signups
            </Typography>
          </Box>
          <Divider sx={{ my: 2 }} />
          <Grid container spacing={2}>
            {loading ? (
              [...Array(5)].map((_, i) => (
                <Grid item xs={12} sm={6} md={4} lg={2.4} key={i}>
                  <Skeleton height={90} sx={{ borderRadius: 3 }} />
                </Grid>
              ))
            ) : (stats?.recentUsers || []).length === 0 ? (
              <Grid item xs={12}>
                <Typography color="textSecondary">No recent signups.</Typography>
              </Grid>
            ) : (
              (stats?.recentUsers || []).map((recent) => (
                <Grid item xs={12} sm={6} md={4} lg={2.4} key={recent.id}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      borderRadius: 3,
                      border: '1px solid',
                      borderColor: 'divider',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5,
                      transition: 'transform .2s ease, box-shadow .2s ease',
                      '&:hover': { transform: 'translateY(-3px)', boxShadow: 3 },
                    }}
                  >
                    <Avatar
                      sx={{
                        backgroundColor: roleColor(recent.userType),
                        fontWeight: 700,
                      }}
                    >
                      {recent.name?.charAt(0) || 'U'}
                    </Avatar>
                    <Box sx={{ overflow: 'hidden' }}>
                      <Typography variant="body2" fontWeight={700} noWrap>
                        {recent.name}
                      </Typography>
                      <Typography variant="caption" color="textSecondary" noWrap display="block">
                        {recent.email}
                      </Typography>
                      <Chip
                        label={roleLabel(recent.userType)}
                        size="small"
                        sx={{ mt: 0.5, height: 20, fontSize: 10, fontWeight: 700 }}
                      />
                    </Box>
                  </Paper>
                </Grid>
              ))
            )}
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default SuperAdminDashboard;
