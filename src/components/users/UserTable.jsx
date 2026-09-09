/**
 * src/components/users/UserTable.jsx
 * ----------------------------------------------------------------------------
 * Users listing table: avatar + name, email, role chip (brand colour per
 * role), status chip and view/edit/delete actions.
 *
 * Safety UX: rows the current user must NOT delete (themselves, or — for
 * non-superadmins — superadmin accounts) get a disabled delete button with an
 * explanatory tooltip. The API enforces the same rules server-side.
 * ----------------------------------------------------------------------------
 */
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
import { Edit, Delete, Visibility, Shield } from '@mui/icons-material';
import { ROLES, roleLabel, roleColor, getUserRole } from '../../constants/roles';

/**
 * @param {{users: object[], loading: boolean, currentUserId?: number|string,
 *   currentUserRole?: string, onEdit: Function, onDelete: Function, onView?: Function}} props
 */
const UserTable = ({ users, loading, currentUserId, currentUserRole, onEdit, onDelete, onView }) => {
  // --- Loading / empty states -------------------------------------------------
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

  const viewerIsSuper = String(currentUserRole || '').toLowerCase() === ROLES.SUPERADMIN;

  /**
   * Can the viewer delete this row? Never yourself; superadmin rows need a
   * superadmin viewer. Returns a reason string when blocked, else null.
   */
  const deleteBlockReason = (user) => {
    if (Number(user.id) === Number(currentUserId)) return 'You cannot delete your own account';
    if (getUserRole(user) === ROLES.SUPERADMIN && !viewerIsSuper) {
      return 'Only a superadmin can delete superadmin accounts';
    }
    return null;
  };

  return (
    <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
      <Table>
        <TableHead>
          <TableRow sx={{ bgcolor: 'action.hover' }}>
            <TableCell><strong>User</strong></TableCell>
            <TableCell><strong>Email</strong></TableCell>
            <TableCell><strong>Role</strong></TableCell>
            <TableCell><strong>Status</strong></TableCell>
            <TableCell align="center"><strong>Actions</strong></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {users.map((user) => {
            const blockReason = deleteBlockReason(user);
            const userRole = getUserRole(user);
            return (
              <TableRow key={user.id} hover>
                {/* Avatar + name + id */}
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar
                      sx={{
                        backgroundColor: roleColor(userRole),
                        width: 38,
                        height: 38,
                        fontWeight: 700,
                        boxShadow: '0 4px 12px rgba(0,0,0,.18)',
                      }}
                    >
                      {user.name?.charAt(0) || 'U'}
                    </Avatar>
                    <Box>
                      <Typography variant="body2" fontWeight={600}>
                        {user.name}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        ID: {user.id}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>{user.email}</TableCell>
                {/* Brand-coloured role chip (+ shield for superadmins) */}
                <TableCell>
                  <Chip
                    icon={userRole === ROLES.SUPERADMIN ? <Shield sx={{ fontSize: 14 }} /> : undefined}
                    label={roleLabel(userRole)}
                    size="small"
                    sx={{
                      fontWeight: 700,
                      color: '#fff',
                      backgroundColor: roleColor(userRole),
                    }}
                  />
                </TableCell>
                {/* Green = active, grey = anything else */}
                <TableCell>
                  <Chip
                    label={user.status || 'active'}
                    size="small"
                    color={String(user.status || '').toLowerCase() === 'active' ? 'success' : 'default'}
                  />
                </TableCell>
                {/* Row actions */}
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
                  <Tooltip title={blockReason || 'Delete'}>
                    <span>
                      <IconButton
                        size="small"
                        color="error"
                        disabled={Boolean(blockReason)}
                        onClick={() => onDelete(user.id)}
                      >
                        <Delete />
                      </IconButton>
                    </span>
                  </Tooltip>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default UserTable;
