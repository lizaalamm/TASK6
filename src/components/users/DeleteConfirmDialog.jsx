/**
 * src/components/users/DeleteConfirmDialog.jsx
 * ----------------------------------------------------------------------------
 * Reusable "are you sure?" dialog for destructive actions (user deletion).
 * Shows the target's name + any API error, with a loading-aware confirm
 * button. Parent owns open/close state and the actual delete dispatch.
 * ----------------------------------------------------------------------------
 */
import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Alert,
} from '@mui/material';

const DeleteConfirmDialog = ({ open, onClose, onConfirm, userName, loading, error }) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Confirm Delete</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <DialogContentText>
          Are you sure you want to delete user <strong>"{userName}"</strong>?
          This action cannot be undone.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button onClick={onConfirm} color="error" variant="contained" disabled={loading}>
          {loading ? 'Deleting...' : 'Delete'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteConfirmDialog;