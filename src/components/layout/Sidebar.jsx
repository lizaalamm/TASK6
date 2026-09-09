/**
 * src/components/layout/Sidebar.jsx
 * ----------------------------------------------------------------------------
 * Role-aware navigation rail.
 *
 *  - Menu items are computed from the logged-in user's role (superadmin sees
 *    everything, including the Super Admin Panel + Users screens).
 *  - Desktop: permanent collapsible drawer. Mobile: temporary slide-over.
 *  - Active item glows with the brand gold gradient; hover states lift softly.
 * ----------------------------------------------------------------------------
 */
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
  Chip,
} from '@mui/material';
import {
  Dashboard,
  DirectionsCar,
  People,
  LocalShipping,
  Assignment,
  Person,
  BarChart,
  Logout,
  Storefront,
  AdminPanelSettings,
  SupervisorAccount,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { getUserRole, roleLabel, roleColor, ROLES } from '../../constants/roles';

/** Gold gradient used for the active nav item + brand avatar. */
const ACTIVE_GRADIENT = 'linear-gradient(135deg, #D4A24C 0%, #B07C24 100%)';

const Sidebar = ({
  mobileOpen,
  handleDrawerToggle,
  isCollapsed,
  drawerWidth,
  collapsedDrawerWidth,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const { logout, user } = useAuth();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  /**
   * Build the nav items for the current role.
   * Superadmin = full staff menu + Super Admin Panel + Users.
   * @returns {{text:string, icon:React.ReactNode, path:string, badge?:string}[]}
   */
  const getMenuItems = () => {
    const role = getUserRole(user) || ROLES.CUSTOMER;

    // Platform owner: every screen, leadership tools first.
    if (role === ROLES.SUPERADMIN) {
      return [
        { text: 'Super Admin Panel', icon: <SupervisorAccount />, path: '/superadmin', badge: 'OWNER' },
        { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
        { text: 'Users', icon: <AdminPanelSettings />, path: '/users' },
        { text: 'Cars', icon: <DirectionsCar />, path: '/cars' },
        { text: 'Suppliers', icon: <LocalShipping />, path: '/suppliers' },
        { text: 'Customers', icon: <People />, path: '/customers' },
        { text: 'Applications', icon: <Assignment />, path: '/applications' },
        { text: 'Reports', icon: <BarChart />, path: '/reports' },
      ];
    }

    // Showroom manager: everything except the superadmin panel.
    if (role === ROLES.ADMIN) {
      return [
        { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
        { text: 'Cars', icon: <DirectionsCar />, path: '/cars' },
        { text: 'Suppliers', icon: <LocalShipping />, path: '/suppliers' },
        { text: 'Customers', icon: <People />, path: '/customers' },
        { text: 'Applications', icon: <Assignment />, path: '/applications' },
        { text: 'Users', icon: <AdminPanelSettings />, path: '/users' },
        { text: 'Reports', icon: <BarChart />, path: '/reports' },
      ];
    }

    // Sales-side staff: storefront-facing screens.
    if ([ROLES.SALES, ROLES.EMPLOYEE, ROLES.TEAMLEAD].includes(role)) {
      return [
        { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
        { text: 'Cars', icon: <DirectionsCar />, path: '/cars' },
        { text: 'Customers', icon: <People />, path: '/customers' },
        { text: 'Applications', icon: <Assignment />, path: '/applications' },
        { text: 'Reports', icon: <BarChart />, path: '/reports' },
      ];
    }

    // Stock team: cars + suppliers only.
    if (role === ROLES.INVENTORY) {
      return [
        { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
        { text: 'Cars', icon: <DirectionsCar />, path: '/cars' },
        { text: 'Suppliers', icon: <LocalShipping />, path: '/suppliers' },
        { text: 'Reports', icon: <BarChart />, path: '/reports' },
      ];
    }

    // Showroom visitors: storefront + own applications.
    return [
      { text: 'Dashboard', icon: <Dashboard />, path: '/customer-dashboard' },
      { text: 'Showroom', icon: <Storefront />, path: '/showroom' },
      { text: 'My Applications', icon: <Assignment />, path: '/my-applications' },
      { text: 'Profile', icon: <Person />, path: '/customer-profile' },
    ];
  };

  /** Navigate + auto-close the drawer on mobile. */
  const handleNavigation = (path) => {
    navigate(path);
    if (isMobile) handleDrawerToggle();
  };

  /** Log out and return to the login screen. */
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  /** Is this nav item the current route? (drives the active glow). */
  const isActive = (path) => location.pathname === path;

  const currentWidth = isCollapsed ? collapsedDrawerWidth : drawerWidth;
  const role = getUserRole(user);

  // --- Shared drawer body (rendered in both mobile + desktop drawers) ----------
  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', color: '#F5EFE7' }}>
      {/* Brand header */}
      <Box
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: isCollapsed ? 'center' : 'flex-start',
          borderBottom: '1px solid rgba(255,255,255,.12)',
          minHeight: 80,
        }}
      >
        <Avatar
          sx={{
            width: 42,
            height: 42,
            background: ACTIVE_GRADIENT,
            color: '#3E2723',
            fontWeight: 800,
            flexShrink: 0,
            boxShadow: '0 6px 18px rgba(212,162,76,.4)',
          }}
        >
          U
        </Avatar>
        {!isCollapsed && (
          <Box sx={{ ml: 1.5 }}>
            <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
              U Devs
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(245,239,231,.7)' }}>
              Car Showroom
            </Typography>
          </Box>
        )}
      </Box>

      {/* Logged-in user card */}
      {!isCollapsed && user && (
        <Box
          sx={{
            m: 2,
            p: 1.5,
            display: 'flex',
            alignItems: 'center',
            borderRadius: 3,
            background: 'rgba(255,255,255,.07)',
            border: '1px solid rgba(255,255,255,.1)',
          }}
        >
          <Avatar
            sx={{
              bgcolor: roleColor(role),
              width: 40,
              height: 40,
              fontWeight: 700,
              boxShadow: '0 4px 12px rgba(0,0,0,.35)',
            }}
          >
            {user.name?.charAt(0) || 'U'}
          </Avatar>
          <Box sx={{ ml: 1.5, overflow: 'hidden' }}>
            <Typography variant="subtitle2" noWrap fontWeight={700}>
              {user.name}
            </Typography>
            <Chip
              label={roleLabel(role)}
              size="small"
              sx={{
                mt: 0.25,
                height: 20,
                fontSize: 10,
                fontWeight: 800,
                letterSpacing: 0.5,
                color: '#fff',
                backgroundColor: roleColor(role),
              }}
            />
          </Box>
        </Box>
      )}

      {/* Nav items */}
      <List sx={{ flex: 1, px: 1.5, py: 1, overflowY: 'auto' }}>
        {getMenuItems().map((item) => {
          const active = isActive(item.path);
          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
              <Tooltip title={isCollapsed ? item.text : ''} placement="right">
                <ListItemButton
                  onClick={() => handleNavigation(item.path)}
                  selected={active}
                  sx={{
                    borderRadius: 2.5,
                    justifyContent: isCollapsed ? 'center' : 'flex-start',
                    px: isCollapsed ? 1.5 : 2,
                    py: 1.4,
                    color: active ? '#3E2723' : 'rgba(245,239,231,.78)',
                    background: active ? ACTIVE_GRADIENT : 'transparent',
                    boxShadow: active ? '0 6px 18px rgba(212,162,76,.35)' : 'none',
                    fontWeight: active ? 700 : 500,
                    transition: 'all .22s ease',
                    '&:hover': {
                      background: active ? ACTIVE_GRADIENT : 'rgba(255,255,255,.09)',
                      color: active ? '#3E2723' : '#fff',
                      transform: 'translateX(3px)',
                    },
                    '&.Mui-selected': {
                      background: ACTIVE_GRADIENT,
                      color: '#3E2723',
                      '&:hover': { background: ACTIVE_GRADIENT },
                    },
                    '& .MuiListItemIcon-root': {
                      color: 'inherit',
                      minWidth: isCollapsed ? 0 : 38,
                      mr: isCollapsed ? 0 : 1,
                    },
                  }}
                >
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  {!isCollapsed && (
                    <ListItemText
                      primary={item.text}
                      primaryTypographyProps={{ fontWeight: active ? 700 : 500, fontSize: 14 }}
                    />
                  )}
                  {/* Owner badge on the Super Admin Panel entry. */}
                  {!isCollapsed && item.badge && (
                    <Chip
                      label={item.badge}
                      size="small"
                      sx={{
                        height: 20,
                        fontSize: 9,
                        fontWeight: 800,
                        color: '#3E2723',
                        background: 'rgba(255,255,255,.85)',
                      }}
                    />
                  )}
                </ListItemButton>
              </Tooltip>
            </ListItem>
          );
        })}
      </List>

      {/* Logout footer */}
      <Box sx={{ p: 1.5, borderTop: '1px solid rgba(255,255,255,.12)' }}>
        <Tooltip title={isCollapsed ? 'Logout' : ''} placement="right">
          <ListItemButton
            onClick={handleLogout}
            sx={{
              borderRadius: 2.5,
              justifyContent: isCollapsed ? 'center' : 'flex-start',
              px: isCollapsed ? 1.5 : 2,
              py: 1.4,
              color: '#FFAB91',
              transition: 'all .22s ease',
              '&:hover': {
                backgroundColor: 'rgba(198,40,40,.25)',
                color: '#FFCCBC',
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: isCollapsed ? 0 : 38, mr: isCollapsed ? 0 : 1, color: 'inherit' }}>
              <Logout />
            </ListItemIcon>
            {!isCollapsed && <ListItemText primary="Logout" primaryTypographyProps={{ fontWeight: 600, fontSize: 14 }} />}
          </ListItemButton>
        </Tooltip>
      </Box>
    </Box>
  );

  return (
    <>
      {/* Mobile: temporary slide-over drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Desktop: permanent collapsible rail */}
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
            position: 'fixed',
            top: 0,
            left: 0,
            height: '100vh',
            zIndex: theme.zIndex.drawer,
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
