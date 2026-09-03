import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PrivateRoute from './PrivateRoute';
import RoleRoute from './RoleRoute';

import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import AdminDashboard from '../pages/admin/AdminDashboard';
import StaffDashboard from '../pages/staff/StaffDashboard';
import Cars from '../pages/inventory/Cars';
import CarDetails from '../pages/inventory/CarDetails';
import AddCar from '../pages/inventory/AddCar';
import EditCar from '../pages/inventory/EditCar';
import Suppliers from '../pages/inventory/Suppliers';
import AddSupplier from '../pages/inventory/AddSupplier';
import CustomerDashboard from '../pages/customer/CustomerDashboard';
import Showroom from '../pages/customer/Showroom';
import CarDetailsPage from '../pages/customer/CarDetailsPage';
import ApplyForCar from '../pages/customer/ApplyForCar';
import MyApplications from '../pages/customer/MyApplications';
import ApplicationSuccess from '../pages/customer/ApplicationSuccess';
import CustomerProfilePage from '../pages/customer/CustomerProfilePage';
import Applications from '../pages/management/Applications';
import Customers from '../pages/management/Customers';
import UsersRedux from '../pages/management/UsersRedux';
import ReportsPage from '../pages/reports/ReportsPage';

const STAFF = ['admin', 'sales', 'inventory', 'employee', 'teamlead'];
const SALES = ['admin', 'sales', 'employee', 'teamlead'];
const INVENTORY = ['admin', 'inventory'];
const CUSTOMER = ['customer'];

const homeFor = (user) => {
  const role = user?.role || user?.userType;
  return role === 'customer' ? '/customer-dashboard' : '/dashboard';
};

const AppRoutes = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <Routes>
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to={homeFor(user)} replace /> : <Login />}
      />
      <Route
        path="/register"
        element={isAuthenticated ? <Navigate to={homeFor(user)} replace /> : <Register />}
      />

      <Route element={<PrivateRoute />}>
        <Route path="/" element={<Navigate to={homeFor(user)} replace />} />
        <Route
          path="/dashboard"
          element={
            <RoleRoute allowedRoles={STAFF}>
              <AdminDashboard />
            </RoleRoute>
          }
        />
        <Route
          path="/staff-dashboard"
          element={
            <RoleRoute allowedRoles={['sales', 'employee', 'teamlead']}>
              <StaffDashboard />
            </RoleRoute>
          }
        />

        <Route path="/customer-dashboard" element={<RoleRoute allowedRoles={CUSTOMER}><CustomerDashboard /></RoleRoute>} />
        <Route path="/showroom" element={<RoleRoute allowedRoles={CUSTOMER}><Showroom /></RoleRoute>} />
        <Route path="/showroom/car/:id" element={<RoleRoute allowedRoles={CUSTOMER}><CarDetailsPage /></RoleRoute>} />
        <Route path="/apply/:carId" element={<RoleRoute allowedRoles={CUSTOMER}><ApplyForCar /></RoleRoute>} />
        <Route path="/my-applications" element={<RoleRoute allowedRoles={CUSTOMER}><MyApplications /></RoleRoute>} />
        <Route path="/application-success" element={<RoleRoute allowedRoles={CUSTOMER}><ApplicationSuccess /></RoleRoute>} />
        <Route path="/customer-profile" element={<RoleRoute allowedRoles={CUSTOMER}><CustomerProfilePage /></RoleRoute>} />

        <Route path="/cars" element={<RoleRoute allowedRoles={STAFF}><Cars /></RoleRoute>} />
        <Route path="/cars/:id" element={<RoleRoute allowedRoles={STAFF}><CarDetails /></RoleRoute>} />
        <Route path="/add-car" element={<RoleRoute allowedRoles={INVENTORY}><AddCar /></RoleRoute>} />
        <Route path="/edit-car/:id" element={<RoleRoute allowedRoles={INVENTORY}><EditCar /></RoleRoute>} />
        <Route path="/suppliers" element={<RoleRoute allowedRoles={INVENTORY}><Suppliers /></RoleRoute>} />
        <Route path="/add-supplier" element={<RoleRoute allowedRoles={INVENTORY}><AddSupplier /></RoleRoute>} />
        <Route path="/applications" element={<RoleRoute allowedRoles={SALES}><Applications /></RoleRoute>} />
        <Route path="/customers" element={<RoleRoute allowedRoles={SALES}><Customers /></RoleRoute>} />
        <Route
          path="/users"
          element={
            <RoleRoute allowedRoles={['admin']}>
              <UsersRedux />
            </RoleRoute>
          }
        />
        <Route path="/reports" element={<RoleRoute allowedRoles={STAFF}><ReportsPage /></RoleRoute>} />
      </Route>

      <Route path="*" element={<Navigate to={isAuthenticated ? homeFor(user) : '/login'} replace />} />
    </Routes>
  );
};

export default AppRoutes;
