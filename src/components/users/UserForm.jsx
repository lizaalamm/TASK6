/**
 * src/components/users/UserForm.jsx
 * ----------------------------------------------------------------------------
 * Create / edit user dialog used by the Users screen (portal registration,
 * spec §4: First Name, Last Name, Email, Phone, CNIC, CNIC Front/Back,
 * Role, Status).
 *
 * Props:
 *  - `user`            → object when editing, null when creating
 *  - `currentUserRole` → role of the logged-in staff member; privileged
 *                        roles are hidden per the permission matrix:
 *                        superadmin sees all roles, admin sees all EXCEPT
 *                        superadmin/admin (the API enforces the same rules
 *                        server-side).
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
  ROLES.MANAGER,
  ROLES.TEAMLEAD,
  ROLES.SALES,
  ROLES.INVENTORY,
  ROLES.EMPLOYEE,
  ROLES.CUSTOMER,
];

/** Empty-form defaults for the "create" mode. */
const EMPTY_FORM = {
  firstName: '',
  lastName: '',
  name: '',
  email: '',
  password: '',
  phone: '',
  cnic: '',
  cnicFront: '',
  cnicBack: '',
  address: '',
  city: '',
  userType: 'customer',
  status: 'active',
};

const UserForm = ({ open, onClose, onSubmit, user, loading, error, currentUserRole }) => {
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});

  // Role visibility per the permission matrix.
  const normalized = String(currentUserRole || '').toLowerCase();
  const isSuperAdmin = normalized === ROLES.SUPERADMIN;
  const visibleRoles = ALL_ROLE_VALUES.filter((value) => {
    if (isSuperAdmin) return true;
    // Admins cannot create superadmin/admin accounts (API rejects too).
    return value !== ROLES.SUPERADMIN && value !== ROLES.ADMIN;
  });

  // Prefill when editing; reset when creating (or when the dialog reopens).
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        name: user.name || '',
        email: user.email || '',
        password: '', // never prefill — blank means "keep existing"
        phone: user.phone || '',
        cnic: user.cnic || '',
        cnicFront: user.cnic_front || user.cnicFront || '',
        cnicBack: user.cnic_back || user.cnicBack || '',
        address: user.address || '',
        city: user.city || '',
        userType: user.userType || user.role || 'customer',
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
    if (!formData.firstName.trim() && !formData.name.trim()) {
      errors.firstName = 'First name is required';
    }
    if (!formData.email.trim()) errors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Invalid email format';
    if (!user && !formData.password) errors.password = 'Password is required for new user';
    else if (!user && formData.password.length < 8) errors.password = 'Password must be at least 8 characters';
    if (formData.cnic && !/^\d{5}-\d{7}-\d{1}$|^\d{13}$/.test(formData.cnic.trim())) {
      errors.cnic = 'CNIC must be XXXXX-XXXXXXX-X or 13 digits';
    }
    if (!formData.userType) errors.userType = 'Role is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  /** Validate → build the API payload → bubble up to the parent. */
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const displayName =
      formData.name.trim() ||
      `${formData.firstName.trim()} ${formData.lastName.trim()}`.trim();
    const submitData = {
      firstName: formData.firstName.trim() || undefined,
      lastName: formData.lastName.trim() || undefined,
      name: displayName,
      email: formData.email.trim(),
      userType: formData.userType,
      role: formData.userType, // backend accepts either key
      status: formData.status,
    };
    if (formData.phone.trim()) submitData.phone = formData.phone.replace(/\s+/g, '');
    if (formData.cnic.trim()) submitData.cnic = formData.cnic.trim();
    if (formData.cnicFront.trim()) submitData.cnic_front = formData.cnicFront.trim();
    if (formData.cnicBack.trim()) submitData.cnic_back = formData.cnicBack.trim();
    if (formData.address.trim()) submitData.address = formData.address.trim();
    if (formData.city.trim()) submitData.city = formData.city.trim();
    if (formData.password) submitData.password = formData.password;
    onSubmit(submitData);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
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
              {user ? 'Edit User' : 'Register User'}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              {user ? `Updating ${user.name}` : 'Portal registration — name, contact, CNIC, role, status'}
            </Typography>
          </Box>
        </Box>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent dividers>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          {!isSuperAdmin && !user && (
            <Alert severity="info" sx={{ mb: 2 }}>
              As an Admin you can register Manager, Customer and staff accounts.
              Super Admin and Admin accounts can only be created by a Super Admin.
            </Alert>
          )}
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="First Name"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                error={!!formErrors.firstName}
                helperText={formErrors.firstName}
                required={!user}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Last Name"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Display Name (optional — auto-composed when blank)"
                name="name"
                value={formData.name}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
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
            <Grid item xs={12} sm={6}>
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
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="CNIC"
                name="cnic"
                value={formData.cnic}
                onChange={handleChange}
                error={!!formErrors.cnic}
                helperText={formErrors.cnic || 'XXXXX-XXXXXXX-X'}
                placeholder="12345-6789012-3"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="CNIC Front (URL)"
                name="cnicFront"
                value={formData.cnicFront}
                onChange={handleChange}
                placeholder="https://…"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="CNIC Back (URL)"
                name="cnicBack"
                value={formData.cnicBack}
                onChange={handleChange}
                placeholder="https://…"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Address"
                name="address"
                value={formData.address}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="City"
                name="city"
                value={formData.city}
                onChange={handleChange}
              />
            </Grid>
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
            {loading ? 'Saving...' : user ? 'Update' : 'Register'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default UserForm;
