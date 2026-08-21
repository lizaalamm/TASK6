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
  Divider,
  Typography,
  Avatar,
  Tooltip,
  Collapse,
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
  ExpandLess,
  ExpandMore,
  Storefront,
  ShoppingCart,
  Inventory,
  AdminPanelSettings,
  SupervisorAccount,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { getCurrentUser } from '../../services/authService';
import { seedUsers } from '../../data/seedData';

const Sidebar = ({ mobileOpen, handleDrawerToggle, isCollapsed, drawerWidth }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const user = getCurrentUser();
  const [openMenus, setOpenMenus] = React.useState({});

  const getMenuItems = () => {
    const role = user?.role || 'customer';
    
    const baseItems = [];
    
    if (role === 'admin') {
      baseItems.push(
        { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
        { text: 'Cars', icon: <DirectionsCar />, path: '/cars' },
        { text: 'Suppliers', icon: <LocalShipping />, path: '/suppliers' },
        { text: 'Customers', icon: <People />, path: '/customers' },
        { text: 'Applications', icon: <Assignment />, path: '/applications' },
        { text: 'Users', icon: <AdminPanelSettings />, path: '/users' },
        { text: 'Reports', icon: <BarChart />, path: '/reports' },
        { text: 'Settings', icon: <Settings />, path: '/settings' },
      );
    } else if (role === 'sales') {
      baseItems.push(
        { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
        { text: 'Cars', icon: <DirectionsCar />, path: '/cars' },
        { text: 'Customers', icon: <People />, path: '/customers' },
        { text: 'Applications', icon: <Assignment />, path: '/applications' },
        { text: 'Reports', icon: <BarChart />, path: '/reports' },
      );
    } else if (role === 'inventory') {
      baseItems.push(
        { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
        { text: 'Cars', icon: <DirectionsCar />, path: '/cars' },
        { text: 'Suppliers', icon: <LocalShipping />, path: '/suppliers' },
        { text: 'Reports', icon: <BarChart />, path: '/reports' },
      );
    } else if (role === 'customer') {
      baseItems.push(
        { text: 'Dashboard', icon: <Dashboard />, path: '/customer-dashboard' },
        { text: 'Showroom', icon: <Storefront />, path: '/showroom' },
        { text: 'My Applications', icon: <Assignment />, path: '/my-applications' },
        { text: 'Profile', icon: <Person />, path: '/customer-profile' },
      );
    }
    
    return baseItems;
  };

  const handleNavigation = (path) => {
    navigate(path);
    if (mobileOpen) handleDrawerToggle();
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Logo Section */}
      <Box
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: isCollapsed ? 'center' : 'flex-start',
          borderBottom: '1px solid',
          borderColor: 'divider',
          minHeight: '80px',
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
            {user.name?.charAt(0)}
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

      {/* Navigation Items */}
      <List sx={{ flex: 1, px: 1, py: 1 }}>
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
                  py: 1,
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

      {/* Logout Button */}
      <Box sx={{ p: 1, borderTop: '1px solid', borderColor: 'divider' }}>
        <Tooltip title={isCollapsed ? 'Logout' : ''} placement="right">
          <ListItemButton
            onClick={handleLogout}
            sx={{
              borderRadius: 2,
              justifyContent: isCollapsed ? 'center' : 'flex-start',
              px: isCollapsed ? 1.5 : 2,
              py: 1,
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
        {drawer}
      </Drawer>

      {/* Desktop Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', sm: 'block' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: isCollapsed ? 80 : drawerWidth,
            transition: 'width 0.3s ease',
            overflowX: 'hidden',
            borderRight: '1px solid',
            borderColor: 'divider',
          },
        }}
        open
      >
        {drawer}
      </Drawer>
    </>
  );
};

export default Sidebar;