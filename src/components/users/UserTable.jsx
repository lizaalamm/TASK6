import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  Typography,
  Box,
  Avatar,
  CircularProgress,
} from '@mui/material';
import { Edit, Delete, Visibility } from '@mui/icons-material';

const UserTable = ({ users, loading, onEdit, onDelete, onView }) => {
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!users || users.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography color="textSecondary">No users found</Typography>
      </Box>
    );
  }

  const getRoleColor = (role) => {
    switch (role?.toLowerCase()) {
      case 'admin': return 'error';
      case 'manager': return 'warning';
      case 'teamlead': return 'info';
      default: return 'default';
    }
  };

  return (
    <TableContainer component={Paper} elevation={0}>
      <Table>
        <TableHead>
          <TableRow sx={{ bgcolor: 'background.default' }}>
            <TableCell><strong>User</strong></TableCell>
            <TableCell><strong>Email</strong></TableCell>
            <TableCell><strong>Role</strong></TableCell>
            <TableCell><strong>Status</strong></TableCell>
            <TableCell align="center"><strong>Actions</strong></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id} hover>
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: 'primary.main', width: 36, height: 36 }}>
                    {user.name?.charAt(0) || 'U'}
                  </Avatar>
                  <Box>
                    <Typography variant="body2" fontWeight="500">
                      {user.name}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      ID: {user.id}
                    </Typography>
                  </Box>
                </Box>
              </TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                <Chip
                  label={user.role || user.userType || 'User'}
                  size="small"
                  color={getRoleColor(user.role)}
                  variant="outlined"
                />
              </TableCell>
              <TableCell>
                <Chip
                  label={user.status || 'active'}
                  size="small"
                  color={String(user.status || '').toLowerCase() === 'active' ? 'success' : 'default'}
                />
              </TableCell>
              <TableCell align="center">
                <Tooltip title="View">
                  <IconButton size="small" onClick={() => onView?.(user)}>
                    <Visibility />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Edit">
                  <IconButton size="small" color="primary" onClick={() => onEdit(user)}>
                    <Edit />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete">
                  <IconButton size="small" color="error" onClick={() => onDelete(user.id)}>
                    <Delete />
                  </IconButton>
                </Tooltip>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default UserTable;