import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Avatar,
  TextField,
  Button,
  Divider,
  Chip,
  Paper,
  useTheme,
} from '@mui/material';
import {
  Person,
  Email,
  Phone,
  LocationOn,
  Badge,
  Edit,
  Save,
  Cancel,
} from '@mui/icons-material';
import { getCustomerByEmail, updateCustomer } from '../../services/customerService';

const CustomerProfilePage = () => {
  const theme = useTheme();
  const { user, setUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    cnic: '',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      const customerData = getCustomerByEmail(user.email);
      if (customerData) {
        setFormData({
          name: customerData.name || user.name || '',
          email: customerData.email || user.email || '',
          phone: customerData.phone || user.phone || '',
          address: customerData.address || user.address || '',
          city: customerData.city || user.city || '',
          cnic: customerData.cnic || user.cnic || '',
        });
      } else {
        setFormData({
          name: user.name || '',
          email: user.email || '',
          phone: user.phone || '',
          address: user.address || '',
          city: user.city || '',
          cnic: user.cnic || '',
        });
      }
    }
    setLoading(false);
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    // Find and update customer
    const customer = getCustomerByEmail(user.email);
    if (customer) {
      const updated = updateCustomer(customer.id, formData);
      if (updated) {
        // Update session user
        const updatedUser = { ...user, ...formData };
        setUser(updatedUser);
        // Also update in localStorage
        import('../../services/localStorage').then(({ setData }) => {
          setData('udevs_session', updatedUser);
        });
        setIsEditing(false);
      }
    }
  };

  if (loading) return <Box>Loading...</Box>;

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        My Profile
      </Typography>
      <Typography variant="body1" color="textSecondary" sx={{ mb: 4 }}>
        Manage your personal information
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card sx={{ textAlign: 'center', p: 3 }}>
            <Avatar
              sx={{
                width: 120,
                height: 120,
                margin: '0 auto',
                bgcolor: theme.palette.primary.main,
                fontSize: 48,
              }}
            >
              {formData.name?.charAt(0) || 'U'}
            </Avatar>
            <Typography variant="h6" sx={{ mt: 2 }}>
              {formData.name || 'Customer'}
            </Typography>
            <Chip
              label="Customer"
              color="primary"
              size="small"
              sx={{ mt: 1 }}
            />
            <Divider sx={{ my: 2 }} />
            <Box sx={{ textAlign: 'left' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Email fontSize="small" color="action" />
                <Typography variant="body2">{formData.email}</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Phone fontSize="small" color="action" />
                <Typography variant="body2">{formData.phone || 'Not provided'}</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocationOn fontSize="small" color="action" />
                <Typography variant="body2">{formData.city || 'Not provided'}</Typography>
              </Box>
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6">Personal Information</Typography>
                {!isEditing ? (
                  <Button
                    startIcon={<Edit />}
                    variant="outlined"
                    onClick={() => setIsEditing(true)}
                  >
                    Edit Profile
                  </Button>
                ) : (
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      startIcon={<Save />}
                      variant="contained"
                      onClick={handleSave}
                    >
                      Save
                    </Button>
                    <Button
                      startIcon={<Cancel />}
                      variant="outlined"
                      color="error"
                      onClick={() => setIsEditing(false)}
                    >
                      Cancel
                    </Button>
                  </Box>
                )}
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Full Name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    disabled={!isEditing}
                    InputProps={{
                      startAdornment: <Person sx={{ mr: 1, color: 'text.secondary' }} />,
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled
                    InputProps={{
                      startAdornment: <Email sx={{ mr: 1, color: 'text.secondary' }} />,
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    disabled={!isEditing}
                    placeholder="0321-1234567"
                    InputProps={{
                      startAdornment: <Phone sx={{ mr: 1, color: 'text.secondary' }} />,
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="CNIC"
                    name="cnic"
                    value={formData.cnic}
                    onChange={handleChange}
                    disabled={!isEditing}
                    placeholder="12345-6789012-3"
                    InputProps={{
                      startAdornment: <Badge sx={{ mr: 1, color: 'text.secondary' }} />,
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    disabled={!isEditing}
                    multiline
                    rows={2}
                    InputProps={{
                      startAdornment: <LocationOn sx={{ mr: 1, color: 'text.secondary' }} />,
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="City"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                </Grid>
              </Grid>

              {!isEditing && (
                <Box sx={{ mt: 3, p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
                  <Typography variant="caption" color="textSecondary">
                    Member since {new Date().toLocaleDateString()}
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CustomerProfilePage;