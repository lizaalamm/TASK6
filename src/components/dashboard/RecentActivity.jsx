import React, { useState, useEffect } from 'react';
import {
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Typography,
  Divider,
  Box,
  Chip,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  CheckCircle,
  Warning,
} from '@mui/icons-material';
import { getData } from '../../services/localStorage';
import { formatDate } from '../../utils/calculations';

const RecentActivity = () => {
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    const logs = getData('udevs_activity_logs', []);
    setActivities(logs.slice(0, 5));
  }, []);

  const getActivityIcon = (action) => {
    if (action.includes('Added')) return <Add color="success" />;
    if (action.includes('Updated')) return <Edit color="info" />;
    if (action.includes('Deleted')) return <Delete color="error" />;
    if (action.includes('Completed')) return <CheckCircle color="success" />;
    return <Warning color="warning" />;
  };

  if (activities.length === 0) {
    return (
      <Box sx={{ py: 2, textAlign: 'center' }}>
        <Typography variant="body2" color="textSecondary">
          No recent activity
        </Typography>
      </Box>
    );
  }

  return (
    <List>
      {activities.map((activity, index) => (
        <React.Fragment key={activity.id}>
          <ListItem alignItems="flex-start">
            <ListItemIcon>
              {getActivityIcon(activity.action)}
            </ListItemIcon>
            <ListItemText
              primary={
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2">
                    {activity.action}
                  </Typography>
                  <Chip
                    label={activity.role}
                    size="small"
                    variant="outlined"
                  />
                </Box>
              }
              secondary={
                <>
                  <Typography variant="caption" color="textSecondary" display="block">
                    {activity.details}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {activity.user} • {formatDate(activity.timestamp)}
                  </Typography>
                </>
              }
            />
          </ListItem>
          {index < activities.length - 1 && <Divider variant="inset" component="li" />}
        </React.Fragment>
      ))}
    </List>
  );
};

export default RecentActivity;