/**
 * src/components/layout/TopBar.jsx
 * ----------------------------------------------------------------------------
 * Frosted-glass top bar: sidebar toggles, page title, theme switch,
 * notifications dropdown and the user account menu with a role-coloured chip.
 * ----------------------------------------------------------------------------
 */
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
  Tooltip,
  useTheme,
  Chip,
  Divider,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Notifications,
  Brightness4,
  Brightness7,
  ChevronLeft,
  ChevronRight,
  Logout,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { useThemeContext } from '../../context/ThemeContext';
import { getUserRole, roleLabel, roleColor } from '../../constants/roles';

/** Demo notifications until a real notification API exists. */
const DEMO_NOTIFICATIONS = [
  { title: 'New application received', hint: 'A customer applied for a car' },
  { title: 'Car stock is running low', hint: 'Some models have ≤ 2 units left' },
  { title: 'Application status updated', hint: 'A review was completed' },
];

const TopBar = ({ handleDrawerToggle, isSidebarCollapsed, handleSidebarToggle }) => {
  const theme = useTheme();
  const { darkMode, setDarkMode } = useThemeContext();
  const { logout, user } = useAuth();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [notificationAnchor, setNotificationAnchor] = React.useState(null);

  /** Open the account dropdown. */
  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  /** Close the account dropdown. */
  const handleMenuClose = () => setAnchorEl(null);
  /** Open the notifications dropdown. */
  const handleNotificationOpen = (event) => setNotificationAnchor(event.currentTarget);
  /** Close the notifications dropdown. */
  const handleNotificationClose = () => setNotificationAnchor(null);

  /** Log out from the account menu. */
  const handleLogout = () => {
    handleMenuClose();
    logout();
  };

  /** Flip between light and dark mode. */
  const toggleTheme = () => setDarkMode(!darkMode);

  const role = getUserRole(user);

  return (
    <AppBar position="fixed" sx={{ zIndex: theme.zIndex.drawer + 1, left: 0, right: 0, top: 0 }}>
      <Toolbar>
        {/* Mobile: open the slide-over drawer */}
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={handleDrawerToggle}
          sx={{ mr: 2, display: { sm: 'none' } }}
        >
          <MenuIcon />
        </IconButton>

        {/* Desktop: collapse / expand the sidebar rail */}
        <IconButton
          color="inherit"
          onClick={handleSidebarToggle}
          sx={{ mr: 2, display: { xs: 'none', sm: 'flex' } }}
        >
          {isSidebarCollapsed ? <ChevronRight /> : <ChevronLeft />}
        </IconButton>

        {/* App title */}
        <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, fontWeight: 700 }}>
          Car Showroom{' '}
          <Box component="span" sx={{ display: { xs: 'none', md: 'inline' } }} color="text.secondary" fontWeight={500}>
            Management
          </Box>
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Light / dark switch */}
          <Tooltip title={darkMode ? 'Light Mode' : 'Dark Mode'}>
            <IconButton onClick={toggleTheme} color="inherit">
              {darkMode ? <Brightness7 /> : <Brightness4 />}
            </IconButton>
          </Tooltip>

          {/* Notifications bell */}
          <Tooltip title="Notifications">
            <IconButton color="inherit" onClick={handleNotificationOpen}>
              <Badge badgeContent={DEMO_NOTIFICATIONS.length} color="error">
                <Notifications />
              </Badge>
            </IconButton>
          </Tooltip>

          {/* Role chip + avatar */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip
              label={roleLabel(role)}
              size="small"
              sx={{
                display: { xs: 'none', sm: 'flex' },
                fontWeight: 700,
                color: '#fff',
                backgroundColor: roleColor(role),
                boxShadow: '0 4px 12px rgba(0,0,0,.18)',
              }}
            />
            <Tooltip title="Account">
              <IconButton onClick={handleMenuOpen} color="inherit" sx={{ p: 0.5 }}>
                <Avatar
                  sx={{
                    width: 38,
                    height: 38,
                    background: `linear-gradient(135deg, ${roleColor(role)} 0%, #3E2723 130%)`,
                    boxShadow: '0 4px 14px rgba(0,0,0,.25)',
                    border: '2px solid rgba(255,255,255,.6)',
                  }}
                >
                  {user?.name?.charAt(0) || 'U'}
                </Avatar>
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Account dropdown */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          PaperProps={{ sx: { minWidth: 230, borderRadius: 3, mt: 1 } }}
        >
          <MenuItem onClick={handleMenuClose}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Avatar sx={{ bgcolor: roleColor(role), width: 40, height: 40 }}>
                {user?.name?.charAt(0) || 'U'}
              </Avatar>
              <Box>
                <Typography variant="subtitle2" fontWeight={700}>
                  {user?.name}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  {user?.email}
                </Typography>
                <Chip label={roleLabel(role)} size="small" sx={{ mt: 0.5, height: 20, fontSize: 10, fontWeight: 700 }} />
              </Box>
            </Box>
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleLogout} sx={{ color: 'error.main', fontWeight: 600 }}>
            <Logout fontSize="small" sx={{ mr: 1 }} /> Logout
          </MenuItem>
        </Menu>

        {/* Notifications dropdown */}
        <Menu
          anchorEl={notificationAnchor}
          open={Boolean(notificationAnchor)}
          onClose={handleNotificationClose}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          PaperProps={{ sx: { width: 320, maxHeight: 400, borderRadius: 3, mt: 1 } }}
        >
          <Box sx={{ px: 2, py: 1.5 }}>
            <Typography variant="subtitle1" fontWeight={700}>
              Notifications
            </Typography>
          </Box>
          <Divider />
          {DEMO_NOTIFICATIONS.map((note) => (
            <MenuItem key={note.title} onClick={handleNotificationClose}>
              <Box>
                <Typography variant="body2" fontWeight={600}>
                  {note.title}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  {note.hint}
                </Typography>
              </Box>
            </MenuItem>
          ))}
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default TopBar;
