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
} from '@mui/material';
import { Add, Search, Refresh, Clear, People } from '@mui/icons-material';
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
  clearUserError,      // ← Import from userSlice
  clearUserSuccess,    // ← Import from userSlice
} from '../../redux/users/userSlice';
import UserTable from '../../components/users/UserTable';
import UserForm from '../../components/users/UserForm';
import DeleteConfirmDialog from '../../components/users/DeleteConfirmDialog';

const UsersRedux = () => {
  const dispatch = useDispatch();
  const users = useSelector(selectUsers);
  const loading = useSelector(selectUsersLoading);
  const error = useSelector(selectUsersError);
  const success = useSelector(selectUsersSuccess);

  const [searchTerm, setSearchTerm] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, user: null });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

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

  useEffect(() => {
    if (searchTerm) {
      const filtered = users.filter(user =>
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(users);
    }
  }, [searchTerm, users]);

  const handleCreate = () => { setEditingUser(null); setFormOpen(true); };
  const handleEdit = (user) => { setEditingUser(user); setFormOpen(true); };
  const handleDelete = (id) => { const user = users.find(u => u.id === id); setDeleteDialog({ open: true, user }); };

  const handleFormSubmit = (data) => {
    if (editingUser) {
      dispatch(updateUser({ id: editingUser.id, payload: data }));
    } else {
      dispatch(createUser(data));
    }
    setFormOpen(false);
    setEditingUser(null);
  };

  const handleDeleteConfirm = () => {
    if (deleteDialog.user) {
      dispatch(deleteUser(deleteDialog.user.id));
      setDeleteDialog({ open: false, user: null });
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold">User Management</Typography>
          <Typography variant="body1" color="textSecondary">Manage system users and their roles</Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="outlined" startIcon={<Refresh />} onClick={() => dispatch(fetchUsers())} disabled={loading}>
            Refresh
          </Button>
          <Button variant="contained" startIcon={<Add />} onClick={handleCreate}>
            Add User
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="caption" color="textSecondary">Total Users</Typography>
                  <Typography variant="h4">{users.length}</Typography>
                </Box>
                <Box sx={{ p: 1, borderRadius: 2, bgcolor: 'primary.light', color: 'white' }}>
                  <People />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="caption" color="textSecondary">Active Users</Typography>
                  <Typography variant="h4">{users.filter(u => u.status === 'Active').length}</Typography>
                </Box>
                <Box sx={{ p: 1, borderRadius: 2, bgcolor: 'success.light', color: 'white' }}>
                  Active
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="caption" color="textSecondary">Admins</Typography>
                  <Typography variant="h4">{users.filter(u => u.role === 'Admin').length}</Typography>
                </Box>
                <Box sx={{ p: 1, borderRadius: 2, bgcolor: 'warning.light', color: 'white' }}>
                  Admin
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            <TextField
              size="small"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <InputAdornment position="start"><Search /></InputAdornment>,
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

      <Card>
        <CardContent>
          <UserTable
            users={filteredUsers}
            loading={loading}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </CardContent>
      </Card>

      <UserForm
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditingUser(null); }}
        onSubmit={handleFormSubmit}
        user={editingUser}
        loading={loading}
        error={error}
      />

      <DeleteConfirmDialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, user: null })}
        onConfirm={handleDeleteConfirm}
        userName={deleteDialog.user?.name}
        loading={loading}
        error={error}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default UsersRedux;