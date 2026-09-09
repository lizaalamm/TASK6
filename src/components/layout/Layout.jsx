/**
 * src/components/layout/Layout.jsx
 * ----------------------------------------------------------------------------
 * Authenticated app shell: TopBar + Sidebar + content area.
 * Owns the sidebar state (mobile open / desktop collapsed) and keeps the main
 * content correctly offset from the fixed drawer at every breakpoint.
 * ----------------------------------------------------------------------------
 */
import React, { useState } from 'react';
import { Box, Toolbar, useMediaQuery, useTheme } from '@mui/material';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

/** Sidebar widths (expanded vs collapsed rail). */
const drawerWidth = 280;
const collapsedDrawerWidth = 84;

/**
 * @param {{children: React.ReactNode}} props - Page content to render.
 */
const Layout = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  /** Toggle the mobile slide-over drawer. */
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  /** Collapse / expand the desktop sidebar rail. */
  const handleSidebarToggle = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  // Effective drawer width (mobile always overlays, so offset is 0 there).
  const currentDrawerWidth = isSidebarCollapsed ? collapsedDrawerWidth : drawerWidth;

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Frosted top bar */}
      <TopBar
        handleDrawerToggle={handleDrawerToggle}
        isSidebarCollapsed={isSidebarCollapsed}
        handleSidebarToggle={handleSidebarToggle}
      />

      {/* Role-aware navigation rail */}
      <Sidebar
        mobileOpen={mobileOpen}
        handleDrawerToggle={handleDrawerToggle}
        isCollapsed={isSidebarCollapsed}
        drawerWidth={drawerWidth}
        collapsedDrawerWidth={collapsedDrawerWidth}
      />

      {/* Main content — offset by the drawer width on desktop */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3, md: 4 },
          width: {
            xs: '100%',
            sm: `calc(100% - ${currentDrawerWidth}px)`,
          },
          maxWidth: {
            xs: '100%',
            sm: `calc(100% - ${currentDrawerWidth}px)`,
          },
          mt: '64px',
          minHeight: 'calc(100vh - 64px)',
          backgroundColor: 'transparent',
          transition: 'width 0.3s ease, margin 0.3s ease',
          overflowX: 'auto',
        }}
      >
        {/* Spacer matching the fixed AppBar height */}
        <Toolbar />
        <Box sx={{ width: '100%', maxWidth: 1400, mx: 'auto' }}>{children}</Box>
      </Box>
    </Box>
  );
};

export default Layout;
