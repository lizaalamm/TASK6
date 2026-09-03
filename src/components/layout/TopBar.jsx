import React from 'react';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Badge,
  Avatar,
  Menu,
  MenuItem,
  Box,
  Switch,
  Tooltip,
  useTheme,
  Chip,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Notifications,
  Brightness4,
  Brightness7,
  ChevronLeft,
  ChevronRight,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { useThemeContext } from '../../context/ThemeContext';

const TopBar = ({ handleDrawerToggle, isSidebarCollapsed, handleSidebarToggle }) => {
  const theme = useTheme();
  const { darkMode, setDarkMode } = useThemeContext();
  const { logout, user } = useAuth();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [notificationAnchor, setNotificationAnchor] = React.useState(null);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationOpen = (event) => {
    setNotificationAnchor(event.currentTarget);
  };

  const handleNotificationClose = () => {
    setNotificationAnchor(null);
  };

  const handleLogout = () => {
    handleMenuClose();
    logout();
  };

  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        zIndex: theme.zIndex.drawer + 1,
        backgroundColor: theme.palette.background.paper,
        color: theme.palette.text.primary,
        boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
        borderBottom: '1px solid',
        borderColor: theme.palette.divider,
        left: 0,
        right: 0,
        top: 0,
      }}
    >
      <Toolbar>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={handleDrawerToggle}
          sx={{ mr: 2, display: { sm: 'none' } }}
        >
          <MenuIcon />
        </IconButton>

        <IconButton
          color="inherit"
          onClick={handleSidebarToggle}
          sx={{ mr: 2, display: { xs: 'none', sm: 'flex' } }}
        >
          {isSidebarCollapsed ? <ChevronRight /> : <ChevronLeft />}
        </IconButton>

        <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
          Car Showroom Management
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Theme Toggle */}
          <Tooltip title={darkMode ? 'Light Mode' : 'Dark Mode'}>
            <IconButton onClick={toggleTheme} color="inherit">
              {darkMode ? <Brightness7 /> : <Brightness4 />}
            </IconButton>
          </Tooltip>

          {/* Notifications */}
          <Tooltip title="Notifications">
            <IconButton color="inherit" onClick={handleNotificationOpen}>
              <Badge badgeContent={3} color="error">
                <Notifications />
              </Badge>
            </IconButton>
          </Tooltip>

          {/* User Menu */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip
              label={(user?.role || user?.userType || 'user').charAt(0).toUpperCase() + (user?.role || user?.userType || 'user').slice(1)}
              size="small"
              color="primary"
              variant="outlined"
            />
            <Tooltip title="Account">
              <IconButton onClick={handleMenuOpen} color="inherit">
                <Avatar
                  sx={{
                    width: 36,
                    height: 36,
                    bgcolor: theme.palette.primary.main,
                  }}
                >
                  {user?.name?.charAt(0) || 'U'}
                </Avatar>
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* User Menu Dropdown */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <MenuItem onClick={handleMenuClose}>
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Typography variant="subtitle1">{user?.name}</Typography>
              <Typography variant="caption" color="textSecondary">
                {user?.email}
              </Typography>
            </Box>
          </MenuItem>
          <MenuItem onClick={handleLogout}>Logout</MenuItem>
        </Menu>

        {/* Notifications Dropdown */}
        <Menu
          anchorEl={notificationAnchor}
          open={Boolean(notificationAnchor)}
          onClose={handleNotificationClose}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          PaperProps={{
            sx: { width: 320, maxHeight: 400 },
          }}
        >
          <MenuItem>
            <Typography variant="subtitle2">New application received</Typography>
          </MenuItem>
          <MenuItem>
            <Typography variant="subtitle2">Car stock is running low</Typography>
          </MenuItem>
          <MenuItem>
            <Typography variant="subtitle2">Application status updated</Typography>
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default TopBar;