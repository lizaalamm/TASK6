/**
 * src/routes/AppRoutes.jsx
 * ----------------------------------------------------------------------------
 * Central route table for the whole app.
 *
 *  - Public routes (`/login`, `/register`) redirect home when already logged in.
 *  - Everything else sits behind `<PrivateRoute>` (auth) + `<RoleRoute>`
 *    (per-page roles from `src/constants/roles.js`).
 *  - Unknown URLs fall back to the user's home dashboard (or /login).
 * ----------------------------------------------------------------------------
 */
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PrivateRoute from './PrivateRoute';
import RoleRoute from './RoleRoute';
import {
  STAFF_ROLES,
  SALES_ROLES,
  INVENTORY_ROLES,
  ADMIN_ROLES,
  SUPERADMIN_ONLY,
  CUSTOMER_ONLY,
  homeRouteFor,
} from '../constants/roles';

// --- Auth pages ----------------------------------------------------------------
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';

// --- Dashboards ------------------------------------------------------------------
import AdminDashboard from '../pages/admin/AdminDashboard';
import SuperAdminDashboard from '../pages/superadmin/SuperAdminDashboard';
import StaffDashboard from '../pages/staff/StaffDashboard';

// --- Inventory -------------------------------------------------------------------
import Cars from '../pages/inventory/Cars';
import CarDetails from '../pages/inventory/CarDetails';
import AddCar from '../pages/inventory/AddCar';
import EditCar from '../pages/inventory/EditCar';
import Suppliers from '../pages/inventory/Suppliers';
import AddSupplier from '../pages/inventory/AddSupplier';

// --- Customer storefront ----------------------------------------------------------
import CustomerDashboard from '../pages/customer/CustomerDashboard';
import Showroom from '../pages/customer/Showroom';
import CarDetailsPage from '../pages/customer/CarDetailsPage';
import ApplyForCar from '../pages/customer/ApplyForCar';
import MyApplications from '../pages/customer/MyApplications';
import ApplicationSuccess from '../pages/customer/ApplicationSuccess';
import CustomerProfilePage from '../pages/customer/CustomerProfilePage';

// --- Management + reports ----------------------------------------------------------
import Applications from '../pages/management/Applications';
import Customers from '../pages/management/Customers';
import UsersRedux from '../pages/management/UsersRedux';
import ReportsPage from '../pages/reports/ReportsPage';

const AppRoutes = () => {
  const { isAuthenticated, user } = useAuth();
  // Where "home" means for THIS user (superadmin → /superadmin, ...).
  const home = homeRouteFor(user);

  return (
    <Routes>
      {/* --- Public: login / register (bounce home when already authed) --- */}
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to={home} replace /> : <Login />}
      />
      <Route
        path="/register"
        element={isAuthenticated ? <Navigate to={home} replace /> : <Register />}
      />

      {/* --- Authenticated zone (Layout shell via PrivateRoute) --- */}
      <Route element={<PrivateRoute />}>
        <Route path="/" element={<Navigate to={home} replace />} />

        {/* Dashboards */}
        <Route
          path="/dashboard"
          element={
            <RoleRoute allowedRoles={STAFF_ROLES}>
              <AdminDashboard />
            </RoleRoute>
          }
        />
        <Route
          path="/superadmin"
          element={
            <RoleRoute allowedRoles={SUPERADMIN_ONLY}>
              <SuperAdminDashboard />
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

        {/* Customer storefront */}
        <Route path="/customer-dashboard" element={<RoleRoute allowedRoles={CUSTOMER_ONLY}><CustomerDashboard /></RoleRoute>} />
        <Route path="/showroom" element={<RoleRoute allowedRoles={CUSTOMER_ONLY}><Showroom /></RoleRoute>} />
        <Route path="/showroom/car/:id" element={<RoleRoute allowedRoles={CUSTOMER_ONLY}><CarDetailsPage /></RoleRoute>} />
        <Route path="/apply/:carId" element={<RoleRoute allowedRoles={CUSTOMER_ONLY}><ApplyForCar /></RoleRoute>} />
        <Route path="/my-applications" element={<RoleRoute allowedRoles={CUSTOMER_ONLY}><MyApplications /></RoleRoute>} />
        <Route path="/application-success" element={<RoleRoute allowedRoles={CUSTOMER_ONLY}><ApplicationSuccess /></RoleRoute>} />
        <Route path="/customer-profile" element={<RoleRoute allowedRoles={CUSTOMER_ONLY}><CustomerProfilePage /></RoleRoute>} />

        {/* Inventory (cars + suppliers) */}
        <Route path="/cars" element={<RoleRoute allowedRoles={STAFF_ROLES}><Cars /></RoleRoute>} />
        <Route path="/cars/:id" element={<RoleRoute allowedRoles={STAFF_ROLES}><CarDetails /></RoleRoute>} />
        <Route path="/add-car" element={<RoleRoute allowedRoles={INVENTORY_ROLES}><AddCar /></RoleRoute>} />
        <Route path="/edit-car/:id" element={<RoleRoute allowedRoles={INVENTORY_ROLES}><EditCar /></RoleRoute>} />
        <Route path="/suppliers" element={<RoleRoute allowedRoles={INVENTORY_ROLES}><Suppliers /></RoleRoute>} />
        <Route path="/add-supplier" element={<RoleRoute allowedRoles={INVENTORY_ROLES}><AddSupplier /></RoleRoute>} />

        {/* Management */}
        <Route path="/applications" element={<RoleRoute allowedRoles={SALES_ROLES}><Applications /></RoleRoute>} />
        <Route path="/customers" element={<RoleRoute allowedRoles={SALES_ROLES}><Customers /></RoleRoute>} />
        <Route
          path="/users"
          element={
            <RoleRoute allowedRoles={ADMIN_ROLES}>
              <UsersRedux />
            </RoleRoute>
          }
        />
        <Route path="/reports" element={<RoleRoute allowedRoles={STAFF_ROLES}><ReportsPage /></RoleRoute>} />
      </Route>

      {/* --- Catch-all → home (or login when logged out) --- */}
      <Route path="*" element={<Navigate to={isAuthenticated ? home : '/login'} replace />} />
    </Routes>
  );
};

export default AppRoutes;
