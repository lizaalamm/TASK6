import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const homeForRole = (user) => {
  const role = user?.role || user?.userType;
  return role === 'customer' ? '/customer-dashboard' : '/dashboard';
};

const RoleRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  const role = user?.role || user?.userType;
  if (!allowedRoles.includes(role)) {
    return <Navigate to={homeForRole(user)} replace />;
  }

  return children;
};

export default RoleRoute;
