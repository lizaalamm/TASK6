import React, { useState } from 'react';
import { Box, Toolbar } from '@mui/material';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

const drawerWidth = 280;

const Layout = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleSidebarToggle = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <TopBar 
        handleDrawerToggle={handleDrawerToggle}
        isSidebarCollapsed={isSidebarCollapsed}
        handleSidebarToggle={handleSidebarToggle}
      />
      <Sidebar 
        mobileOpen={mobileOpen}
        handleDrawerToggle={handleDrawerToggle}
        isCollapsed={isSidebarCollapsed}
        drawerWidth={drawerWidth}
      />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${isSidebarCollapsed ? 80 : drawerWidth}px)` },
          mt: '64px',
          transition: 'all 0.3s ease',
          backgroundColor: 'background.default',
          minHeight: '100vh',
        }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
};

export default Layout;