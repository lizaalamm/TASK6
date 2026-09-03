import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Grid,
  Alert,
} from '@mui/material';

const ROLES = [
  { value: 'admin', label: 'Admin' },
  { value: 'employee', label: 'Employee' },
  { value: 'teamlead', label: 'Team Lead' },
  { value: 'sales', label: 'Sales' },
  { value: 'inventory', label: 'Inventory' },
  { value: 'customer', label: 'Customer' },
];

const UserForm = ({ open, onClose, onSubmit, user, loading, error }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    userType: 'employee',
    status: 'active',
  });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        password: '',
        phone: user.phone || '',
        userType: user.userType || user.role || 'employee',
        status: (user.status || 'active').toLowerCase(),
      });
    } else {
      setFormData({
        name: '',
        email: '',
        password: '',
        phone: '',
        userType: 'employee',
        status: 'active',
      });
    }
    setFormErrors({});
  }, [user, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Name is required';
    if (!formData.email.trim()) errors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Invalid email format';
    if (!user && !formData.password) errors.password = 'Password is required for new user';
    else if (!user && formData.password.length < 8) errors.password = 'Password must be at least 8 characters';
    if (!formData.userType) errors.userType = 'Role is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const submitData = {
      name: formData.name,
      email: formData.email,
      userType: formData.userType,
      role: formData.userType,
      status: formData.status,
    };
    if (formData.phone) submitData.phone = formData.phone.replace(/\s+/g, '');
    if (formData.password) submitData.password = formData.password;
    onSubmit(submitData);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{user ? 'Edit User' : 'Add New User'}</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Full Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                error={!!formErrors.name}
                helperText={formErrors.name}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                error={!!formErrors.email}
                helperText={formErrors.email}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="03001234567"
                helperText="Format: 03XXXXXXXXX or +92XXXXXXXXXX"
              />
            </Grid>
            {!user && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  error={!!formErrors.password}
                  helperText={formErrors.password || 'Minimum 8 characters'}
                  required
                />
              </Grid>
            )}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={!!formErrors.userType}>
                <InputLabel>Role</InputLabel>
                <Select
                  name="userType"
                  value={formData.userType}
                  onChange={handleChange}
                  label="Role"
                >
                  {ROLES.map((role) => (
                    <MenuItem key={role.value} value={role.value}>
                      {role.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  label="Status"
                >
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? 'Saving...' : user ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default UserForm;
