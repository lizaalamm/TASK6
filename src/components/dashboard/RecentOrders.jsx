import React, { useState, useEffect } from 'react';
import {
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  Typography,
  Divider,
  Box,
} from '@mui/material';
import { getApplications } from '../../services/applicationService';
import { formatDate } from '../../utils/calculations';

const RecentOrders = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const apps = getApplications();
    setOrders(apps.slice(0, 5));
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'warning';
      case 'Approved': return 'info';
      case 'Reserved': return 'primary';
      case 'Completed': return 'success';
      case 'Rejected': return 'error';
      default: return 'default';
    }
  };

  if (orders.length === 0) {
    return (
      <Box sx={{ py: 2, textAlign: 'center' }}>
        <Typography variant="body2" color="textSecondary">
          No recent orders
        </Typography>
      </Box>
    );
  }

  return (
    <List>
      {orders.map((order, index) => (
        <React.Fragment key={order.id}>
          <ListItem alignItems="flex-start">
            <ListItemAvatar>
              <Avatar
                src={order.carImage}
                variant="rounded"
                sx={{ width: 56, height: 56 }}
              />
            </ListItemAvatar>
            <ListItemText
              primary={
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="subtitle2">
                    {order.carMake} {order.carModel}
                  </Typography>
                  <Chip
                    label={order.status}
                    size="small"
                    color={getStatusColor(order.status)}
                  />
                </Box>
              }
              secondary={
                <>
                  <Typography variant="body2" color="textSecondary">
                    {order.customerName}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {formatDate(order.applicationDate)}
                  </Typography>
                </>
              }
            />
          </ListItem>
          {index < orders.length - 1 && <Divider variant="inset" component="li" />}
        </React.Fragment>
      ))}
    </List>
  );
};

export default RecentOrders;