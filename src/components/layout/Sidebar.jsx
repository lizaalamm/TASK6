import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Typography,
  Avatar,
  Tooltip,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Dashboard,
  DirectionsCar,
  People,
  LocalShipping,
  Assignment,
  Person,
  BarChart,
  Settings,
  Logout,
  Storefront,
  AdminPanelSettings,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';

const Sidebar = ({ 
  mobileOpen, 
  handleDrawerToggle, 
  isCollapsed, 
  drawerWidth,
  collapsedDrawerWidth 
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const { logout, user } = useAuth();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const getMenuItems = () => {
    const role = user?.role || 'customer';
    
    if (role === 'admin') {
      return [
        { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
        { text: 'Cars', icon: <DirectionsCar />, path: '/cars' },
        { text: 'Suppliers', icon: <LocalShipping />, path: '/suppliers' },
        { text: 'Customers', icon: <People />, path: '/customers' },
        { text: 'Applications', icon: <Assignment />, path: '/applications' },
       { text: 'Users', icon: <AdminPanelSettings />, path: '/users' },
        { text: 'Reports', icon: <BarChart />, path: '/reports' },
        { text: 'Settings', icon: <Settings />, path: '/settings' },
      ];
    } else if (role === 'sales') {
      return [
        { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
        { text: 'Cars', icon: <DirectionsCar />, path: '/cars' },
        { text: 'Customers', icon: <People />, path: '/customers' },
        { text: 'Applications', icon: <Assignment />, path: '/applications' },
        { text: 'Reports', icon: <BarChart />, path: '/reports' },
      ];
    } else if (role === 'inventory') {
      return [
        { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
        { text: 'Cars', icon: <DirectionsCar />, path: '/cars' },
        { text: 'Suppliers', icon: <LocalShipping />, path: '/suppliers' },
        { text: 'Reports', icon: <BarChart />, path: '/reports' },
      ];
    } else if (role === 'customer') {
      return [
        { text: 'Dashboard', icon: <Dashboard />, path: '/customer-dashboard' },
        { text: 'Showroom', icon: <Storefront />, path: '/showroom' },
        { text: 'My Applications', icon: <Assignment />, path: '/my-applications' },
        { text: 'Profile', icon: <Person />, path: '/customer-profile' },
      ];
    }
    return [];
  };

  const handleNavigation = (path) => {
    navigate(path);
    if (isMobile) handleDrawerToggle();
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const currentWidth = isCollapsed ? collapsedDrawerWidth : drawerWidth;

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Logo */}
      <Box
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: isCollapsed ? 'center' : 'flex-start',
          borderBottom: '1px solid',
          borderColor: 'divider',
          minHeight: 80,
        }}
      >
        <Avatar
          sx={{
            width: 40,
            height: 40,
            bgcolor: 'primary.main',
            color: 'white',
            fontWeight: 'bold',
            flexShrink: 0,
          }}
        >
          U
        </Avatar>
        {!isCollapsed && (
          <Box sx={{ ml: 1.5 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
              U Devs
            </Typography>
            <Typography variant="caption" color="textSecondary">
              Car Showroom
            </Typography>
          </Box>
        )}
      </Box>

      {/* User Info */}
      {!isCollapsed && user && (
        <Box
          sx={{
            p: 2,
            display: 'flex',
            alignItems: 'center',
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Avatar sx={{ bgcolor: 'secondary.main', width: 40, height: 40 }}>
            {user.name?.charAt(0) || 'U'}
          </Avatar>
          <Box sx={{ ml: 1.5, overflow: 'hidden' }}>
            <Typography variant="subtitle2" noWrap>
              {user.name}
            </Typography>
            <Typography variant="caption" color="textSecondary" noWrap>
              {user.role?.charAt(0).toUpperCase() + user.role?.slice(1)}
            </Typography>
          </Box>
        </Box>
      )}

      {/* Navigation */}
      <List sx={{ flex: 1, px: 1, py: 2 }}>
        {getMenuItems().map((item) => (
          <ListItem key={item.text} disablePadding>
            <Tooltip title={isCollapsed ? item.text : ''} placement="right">
              <ListItemButton
                onClick={() => handleNavigation(item.path)}
                selected={isActive(item.path)}
                sx={{
                  borderRadius: 2,
                  mb: 0.5,
                  justifyContent: isCollapsed ? 'center' : 'flex-start',
                  px: isCollapsed ? 1.5 : 2,
                  py: 1.5,
                  '&.Mui-selected': {
                    backgroundColor: 'primary.main',
                    color: 'white',
                    '&:hover': {
                      backgroundColor: 'primary.dark',
                    },
                    '& .MuiListItemIcon-root': {
                      color: 'white',
                    },
                  },
                  '&:hover': {
                    backgroundColor: 'action.hover',
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: isCollapsed ? 0 : 40,
                    mr: isCollapsed ? 0 : 1,
                    color: isActive(item.path) ? 'inherit' : 'text.secondary',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                {!isCollapsed && <ListItemText primary={item.text} />}
              </ListItemButton>
            </Tooltip>
          </ListItem>
        ))}
      </List>

      {/* Logout */}
      <Box sx={{ p: 1, borderTop: '1px solid', borderColor: 'divider' }}>
        <Tooltip title={isCollapsed ? 'Logout' : ''} placement="right">
          <ListItemButton
            onClick={handleLogout}
            sx={{
              borderRadius: 2,
              justifyContent: isCollapsed ? 'center' : 'flex-start',
              px: isCollapsed ? 1.5 : 2,
              py: 1.5,
              color: 'error.main',
              '&:hover': {
                backgroundColor: 'error.light',
                color: 'error.dark',
              },
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: isCollapsed ? 0 : 40,
                mr: isCollapsed ? 0 : 1,
                color: 'inherit',
              }}
            >
              <Logout />
            </ListItemIcon>
            {!isCollapsed && <ListItemText primary="Logout" />}
          </ListItemButton>
        </Tooltip>
      </Box>
    </Box>
  );

  return (
    <>
      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Desktop Drawer - FIXED POSITION */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', sm: 'block' },
          width: currentWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: currentWidth,
            transition: 'width 0.3s ease',
            overflowX: 'hidden',
            borderRight: '1px solid',
            borderColor: 'divider',
            position: 'fixed',
            top: 0,
            left: 0,
            height: '100vh',
            zIndex: theme.zIndex.drawer,
            backgroundColor: theme.palette.background.paper,
          },
        }}
        open
      >
        {drawerContent}
      </Drawer>
    </>
  );
};

export default Sidebar;