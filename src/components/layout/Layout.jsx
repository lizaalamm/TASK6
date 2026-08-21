import React, { useState } from 'react';
import { Box, Toolbar, useMediaQuery, useTheme } from '@mui/material';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

const drawerWidth = 280;
const collapsedDrawerWidth = 80;

const Layout = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleSidebarToggle = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const currentDrawerWidth = isSidebarCollapsed ? collapsedDrawerWidth : drawerWidth;

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Top Bar */}
      <TopBar 
        handleDrawerToggle={handleDrawerToggle}
        isSidebarCollapsed={isSidebarCollapsed}
        handleSidebarToggle={handleSidebarToggle}
      />
      
      {/* Sidebar */}
      <Sidebar 
        mobileOpen={mobileOpen}
        handleDrawerToggle={handleDrawerToggle}
        isCollapsed={isSidebarCollapsed}
        drawerWidth={drawerWidth}
        collapsedDrawerWidth={collapsedDrawerWidth}
      />
      
      {/* Main Content - FULL WIDTH FIX */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3, md: 4 },
          width: { 
            xs: '100%', 
            sm: `calc(100% - ${currentDrawerWidth}px)` 
          },
          maxWidth: { 
            xs: '100%', 
            sm: `calc(100% - ${currentDrawerWidth}px)` 
          },
          mt: '64px',
          minHeight: 'calc(100vh - 64px)',
          backgroundColor: 'background.default',
          transition: 'width 0.3s ease, margin 0.3s ease',
          overflowX: 'auto',
        }}
      >
        <Toolbar />
        <Box sx={{ width: '100%' }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default Layout;