/**
 * src/components/users/UserForm.jsx
 * ----------------------------------------------------------------------------
 * Create / edit user dialog used by the Users screen.
 *
 * Props:
 *  - `user`            → object when editing, null when creating
 *  - `currentUserRole` → role of the logged-in staff member; the
 *                        "Super Admin" option is ONLY offered to superadmins
 *                        (the API enforces the same rule server-side).
 * ----------------------------------------------------------------------------
 */
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
  Avatar,
  Box,
  Typography,
} from '@mui/material';
import { PersonAdd, Edit } from '@mui/icons-material';
import { ROLES, ROLE_LABELS } from '../../constants/roles';

/** All assignable roles in privilege order (highest first). */
const ALL_ROLE_VALUES = [
  ROLES.SUPERADMIN,
  ROLES.ADMIN,
  ROLES.TEAMLEAD,
  ROLES.SALES,
  ROLES.INVENTORY,
  ROLES.EMPLOYEE,
  ROLES.CUSTOMER,
];

/** Empty-form defaults for the "create" mode. */
const EMPTY_FORM = {
  name: '',
  email: '',
  password: '',
  phone: '',
  userType: 'employee',
  status: 'active',
};

const UserForm = ({ open, onClose, onSubmit, user, loading, error, currentUserRole }) => {
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});

  // Only superadmins may assign the superadmin role — hide it for admins.
  const isSuperAdmin = String(currentUserRole || '').toLowerCase() === ROLES.SUPERADMIN;
  const visibleRoles = ALL_ROLE_VALUES.filter(
    (value) => value !== ROLES.SUPERADMIN || isSuperAdmin
  );

  // Prefill when editing; reset when creating (or when the dialog reopens).
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        password: '', // never prefill — blank means "keep existing"
        phone: user.phone || '',
        userType: user.userType || user.role || 'employee',
        status: (user.status || 'active').toLowerCase(),
      });
    } else {
      setFormData(EMPTY_FORM);
    }
    setFormErrors({});
  }, [user, open]);

  /** Update one field + clear its error as the user types. */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  /** Client-side validation (the API re-validates everything server-side). */
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

  /** Validate → build the API payload → bubble up to the parent. */
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const submitData = {
      name: formData.name,
      email: formData.email,
      userType: formData.userType,
      role: formData.userType, // backend accepts either key
      status: formData.status,
    };
    if (formData.phone) submitData.phone = formData.phone.replace(/\s+/g, '');
    if (formData.password) submitData.password = formData.password;
    onSubmit(submitData);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      {/* Dialog header with mode icon */}
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar
            sx={{
              background: user
                ? 'linear-gradient(135deg, #1565C0, #64B5F6)'
                : 'linear-gradient(135deg, #5D4037, #D4A24C)',
            }}
          >
            {user ? <Edit /> : <PersonAdd />}
          </Avatar>
          <Box>
            <Typography variant="h6" fontWeight={700}>
              {user ? 'Edit User' : 'Add New User'}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              {user ? `Updating ${user.name}` : 'Create a showroom account'}
            </Typography>
          </Box>
        </Box>
      </DialogTitle>

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
            {/* Password only on create — edits keep the old hash when blank. */}
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
                  {visibleRoles.map((value) => (
                    <MenuItem key={value} value={value}>
                      {ROLE_LABELS[value] || value}
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
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
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
