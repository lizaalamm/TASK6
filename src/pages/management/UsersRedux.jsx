/**
 * src/pages/management/UsersRedux.jsx
 * ----------------------------------------------------------------------------
 * User Management screen (route: `/users`, roles: admin + superadmin).
 * Full CRUD over the accounts API, powered by the Redux `users` slice:
 *
 *  - stat cards (total / active / leadership counts)
 *  - live name+email search filter
 *  - UserTable (list) + UserForm (create/edit dialog) + delete confirm dialog
 *  - snackbar toasts for success / error feedback
 * ----------------------------------------------------------------------------
 */
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  IconButton,
  InputAdornment,
  Alert,
  Snackbar,
  CircularProgress,
  Grid,
  Avatar,
} from '@mui/material';
import { Add, Search, Refresh, Clear, People, CheckCircle, Shield } from '@mui/icons-material';
import {
  fetchUsers,
  createUser,
  updateUser,
  deleteUser,
} from '../../redux/users/userActions';
import {
  selectUsers,
  selectUsersLoading,
  selectUsersError,
  selectUsersSuccess,
  clearUserError,
  clearUserSuccess,
} from '../../redux/users/userSlice';
import { selectAuthUser } from '../../redux/auth/authSlice';
import { getUserRole, ROLES } from '../../constants/roles';
import UserTable from '../../components/users/UserTable';
import UserForm from '../../components/users/UserForm';
import DeleteConfirmDialog from '../../components/users/DeleteConfirmDialog';

const UsersRedux = () => {
  const dispatch = useDispatch();

  // --- Redux state ---------------------------------------------------------------
  const users = useSelector(selectUsers);
  const loading = useSelector(selectUsersLoading);
  const error = useSelector(selectUsersError);
  const success = useSelector(selectUsersSuccess);
  const currentUser = useSelector(selectAuthUser); // for self/superadmin row guards

  // --- Local UI state --------------------------------------------------------------
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null); // null = create mode
  const [deleteDialog, setDeleteDialog] = useState({ open: false, user: null });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Load the user list once on mount.
  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  // Surface Redux success/error flags as toasts, then clear them.
  useEffect(() => {
    if (success) {
      setSnackbar({ open: true, message: 'Operation completed successfully!', severity: 'success' });
      dispatch(clearUserSuccess());
    }
    if (error) {
      setSnackbar({ open: true, message: error, severity: 'error' });
      dispatch(clearUserError());
    }
  }, [success, error, dispatch]);

  // Live client-side filter over name + email.
  useEffect(() => {
    if (searchTerm) {
      const needle = searchTerm.toLowerCase();
      setFilteredUsers(
        users.filter(
          (user) =>
            user.name?.toLowerCase().includes(needle) ||
            user.email?.toLowerCase().includes(needle)
        )
      );
    } else {
      setFilteredUsers(users);
    }
  }, [searchTerm, users]);

  /** Open the dialog in create mode. */
  const handleCreate = () => {
    setEditingUser(null);
    setFormOpen(true);
  };

  /** Open the dialog prefilled for one user. */
  const handleEdit = (user) => {
    setEditingUser(user);
    setFormOpen(true);
  };

  /** Open the delete confirmation for one user id. */
  const handleDelete = (id) => {
    const user = users.find((u) => u.id === id);
    setDeleteDialog({ open: true, user });
  };

  /** Create or update depending on dialog mode, then close it. */
  const handleFormSubmit = (data) => {
    if (editingUser) {
      dispatch(updateUser({ id: editingUser.id, payload: data }));
    } else {
      dispatch(createUser(data));
    }
    setFormOpen(false);
    setEditingUser(null);
  };

  /** Confirm button of the delete dialog → dispatch the delete thunk. */
  const handleDeleteConfirm = () => {
    if (deleteDialog.user) {
      dispatch(deleteUser(deleteDialog.user.id));
      setDeleteDialog({ open: false, user: null });
    }
  };

  // --- Derived stat counts -----------------------------------------------------------
  const activeCount = users.filter(
    (u) => String(u.status || '').toLowerCase() === 'active'
  ).length;
  const leadershipCount = users.filter((u) =>
    [ROLES.ADMIN, ROLES.SUPERADMIN].includes(getUserRole(u))
  ).length;

  /** Stat-card definitions (gradient icon tiles). */
  const statCards = [
    {
      label: 'Total Users',
      value: users.length,
      icon: <People />,
      gradient: 'linear-gradient(135deg, #5D4037, #A1887F)',
    },
    {
      label: 'Active Users',
      value: activeCount,
      icon: <CheckCircle />,
      gradient: 'linear-gradient(135deg, #2E7D32, #66BB6A)',
    },
    {
      label: 'Leadership',
      value: leadershipCount,
      icon: <Shield />,
      gradient: 'linear-gradient(135deg, #7B1FA2, #BA68C8)',
    },
  ];

  return (
    <Box className="page-enter">
      {/* Page header + actions */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight={800}>
            User Management
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Manage system users and their roles
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={() => dispatch(fetchUsers())}
            disabled={loading}
          >
            Refresh
          </Button>
          <Button variant="contained" startIcon={<Add />} onClick={handleCreate}>
            Add User
          </Button>
        </Box>
      </Box>

      {/* Stat cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {statCards.map((stat, i) => (
          <Grid item xs={12} sm={6} md={4} key={stat.label}>
            <Card className="kpi-glow" sx={{ animation: `fadeUp .5s ease ${i * 0.08}s both` }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="caption" color="textSecondary" fontWeight={600}>
                      {stat.label.toUpperCase()}
                    </Typography>
                    <Typography variant="h4" fontWeight={800}>
                      {stat.value}
                    </Typography>
                  </Box>
                  <Avatar sx={{ background: stat.gradient, width: 52, height: 52 }}>
                    {stat.icon}
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Search bar */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            <TextField
              size="small"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
                endAdornment: searchTerm && (
                  <IconButton size="small" onClick={() => setSearchTerm('')}>
                    <Clear />
                  </IconButton>
                ),
              }}
              sx={{ flex: 1, minWidth: 200 }}
            />
            {loading && <CircularProgress size={24} />}
          </Box>
        </CardContent>
      </Card>

      {/* Users table */}
      <Card>
        <CardContent>
          <UserTable
            users={filteredUsers}
            loading={loading}
            currentUserId={currentUser?.id}
            currentUserRole={getUserRole(currentUser)}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </CardContent>
      </Card>

      {/* Create / edit dialog */}
      <UserForm
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditingUser(null);
        }}
        onSubmit={handleFormSubmit}
        user={editingUser}
        loading={loading}
        error={error}
        currentUserRole={getUserRole(currentUser)}
      />

      {/* Delete confirmation */}
      <DeleteConfirmDialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, user: null })}
        onConfirm={handleDeleteConfirm}
        userName={deleteDialog.user?.name}
        loading={loading}
        error={error}
      />

      {/* Success / error toast */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          sx={{ borderRadius: 2 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default UsersRedux;
