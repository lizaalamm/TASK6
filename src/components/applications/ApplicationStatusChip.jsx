/**
 * src/components/applications/ApplicationStatusChip.jsx
 * ----------------------------------------------------------------------------
 * Pipeline status chip: icon + label + step number for any application row.
 * ----------------------------------------------------------------------------
 */
import React from 'react';
import { Box, Chip } from '@mui/material';
import {
  Pending,
  HourglassEmpty,
  Cancel,
  Assignment,
  Autorenew,
  DirectionsCar,
  AccountBalance,
  Payments,
  LocalShipping,
  CheckCircle,
} from '@mui/icons-material';
import {
  APPLICATION_STATUS,
  normalizeStatus,
  statusLabel,
  statusColor,
  statusStep,
} from '../../constants/applicationStatus';

const ICONS = {
  [APPLICATION_STATUS.PENDING]: <Pending fontSize="small" />,
  [APPLICATION_STATUS.APPROVED]: <HourglassEmpty fontSize="small" />,
  [APPLICATION_STATUS.REJECTED]: <Cancel fontSize="small" />,
  [APPLICATION_STATUS.ASSIGNED]: <Assignment fontSize="small" />,
  [APPLICATION_STATUS.IN_PROCESS]: <Autorenew fontSize="small" />,
  [APPLICATION_STATUS.VEHICLE_SELECTED]: <DirectionsCar fontSize="small" />,
  [APPLICATION_STATUS.FINANCE_SETUP]: <AccountBalance fontSize="small" />,
  [APPLICATION_STATUS.PAYMENT_IN_PROGRESS]: <Payments fontSize="small" />,
  [APPLICATION_STATUS.READY_FOR_DELIVERY]: <LocalShipping fontSize="small" />,
  [APPLICATION_STATUS.COMPLETE]: <CheckCircle fontSize="small" />,
};

const ApplicationStatusChip = ({ status, showStep = true, size = 'small' }) => {
  const normalized = normalizeStatus(status);
  return (
    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
      {ICONS[normalized]}
      <Chip label={statusLabel(status)} size={size} color={statusColor(status)} />
      {showStep && (
        <Chip label={`Step ${statusStep(status)}/9`} size={size} variant="outlined" />
      )}
    </Box>
  );
};

export default ApplicationStatusChip;
