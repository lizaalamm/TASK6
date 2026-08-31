import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PrivateRoute from './PrivateRoute';
import RoleRoute from './RoleRoute';

// Auth Pages
import Login from '../pages/auth/Login';

// Admin Pages
import AdminDashboard from '../pages/admin/AdminDashboard';

// Staff Pages
import StaffDashboard from '../pages/staff/StaffDashboard';

// Inventory Pages
import Cars from '../pages/inventory/Cars';
import CarDetails from '../pages/inventory/CarDetails';
import AddCar from '../pages/inventory/AddCar';
import EditCar from '../pages/inventory/EditCar';
import Suppliers from '../pages/inventory/Suppliers';
import AddSupplier from '../pages/inventory/AddSupplier';

// Customer Pages
import CustomerDashboard from '../pages/customer/CustomerDashboard';
import Showroom from '../pages/customer/Showroom';
import CarDetailsPage from '../pages/customer/CarDetailsPage';
import ApplyForCar from '../pages/customer/ApplyForCar';
import MyApplications from '../pages/customer/MyApplications';
import ApplicationSuccess from '../pages/customer/ApplicationSuccess';
import CustomerProfilePage from '../pages/customer/CustomerProfilePage';

// Management Pages
import Applications from '../pages/management/Applications';
import Customers from '../pages/management/Customers';
// Import the Redux version - USE THIS
import UsersRedux from '../pages/management/UsersRedux';

// Reports
import ReportsPage from '../pages/reports/ReportsPage';

const AppRoutes = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={
        isAuthenticated ? <Navigate to="/dashboard" /> : <Login />
      } />
      
      {/* Protected Routes */}
      <Route element={<PrivateRoute />}>
        <Route path="/" element={<Navigate to="/dashboard" />} />
        <Route path="/dashboard" element={<RoleRoute allowedRoles={['admin', 'sales', 'inventory']}><AdminDashboard /></RoleRoute>} />
        <Route path="/staff-dashboard" element={<RoleRoute allowedRoles={['sales']}><StaffDashboard /></RoleRoute>} />
        
        {/* Customer Routes */}
        <Route path="/customer-dashboard" element={<RoleRoute allowedRoles={['customer']}><CustomerDashboard /></RoleRoute>} />
        <Route path="/showroom" element={<RoleRoute allowedRoles={['customer']}><Showroom /></RoleRoute>} />
        <Route path="/car/:id" element={<RoleRoute allowedRoles={['customer']}><CarDetailsPage /></RoleRoute>} />
        <Route path="/apply/:carId" element={<RoleRoute allowedRoles={['customer']}><ApplyForCar /></RoleRoute>} />
        <Route path="/my-applications" element={<RoleRoute allowedRoles={['customer']}><MyApplications /></RoleRoute>} />
        <Route path="/application-success" element={<RoleRoute allowedRoles={['customer']}><ApplicationSuccess /></RoleRoute>} />
        <Route path="/customer-profile" element={<RoleRoute allowedRoles={['customer']}><CustomerProfilePage /></RoleRoute>} />
        
        {/* Admin & Staff Routes */}
        <Route path="/cars" element={<RoleRoute allowedRoles={['admin', 'sales', 'inventory']}><Cars /></RoleRoute>} />
        <Route path="/car/:id" element={<RoleRoute allowedRoles={['admin', 'sales', 'inventory']}><CarDetails /></RoleRoute>} />
        <Route path="/add-car" element={<RoleRoute allowedRoles={['admin', 'inventory']}><AddCar /></RoleRoute>} />
        <Route path="/edit-car/:id" element={<RoleRoute allowedRoles={['admin', 'inventory']}><EditCar /></RoleRoute>} />
        <Route path="/suppliers" element={<RoleRoute allowedRoles={['admin', 'inventory']}><Suppliers /></RoleRoute>} />
        <Route path="/add-supplier" element={<RoleRoute allowedRoles={['admin', 'inventory']}><AddSupplier /></RoleRoute>} />
        <Route path="/applications" element={<RoleRoute allowedRoles={['admin', 'sales']}><Applications /></RoleRoute>} />
        <Route path="/customers" element={<RoleRoute allowedRoles={['admin', 'sales']}><Customers /></RoleRoute>} />
        
        {/* Users Route - Using Redux Version */}
        <Route path="/users" element={
          <RoleRoute allowedRoles={['admin']}>
            <UsersRedux />
          </RoleRoute>
        } />
        
        <Route path="/reports" element={<RoleRoute allowedRoles={['admin', 'sales', 'inventory']}><ReportsPage /></RoleRoute>} />
      </Route>
      
      {/* 404 */}
      <Route path="*" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
};

export default AppRoutes;