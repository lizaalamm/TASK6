/**
 * src/routes/RoleRoute.jsx
 * ----------------------------------------------------------------------------
 * Route guard that renders `children` only when the logged-in user holds one
 * of `allowedRoles`. Everyone else is bounced to their own home dashboard.
 * Superadmin bypasses every check (see `hasAnyRole`).
 *
 * @example <RoleRoute allowedRoles={ADMIN_ROLES}><UsersRedux /></RoleRoute>
 * ----------------------------------------------------------------------------
 */
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { homeRouteFor } from '../constants/roles';

/**
 * @param {{children: React.ReactNode, allowedRoles: string[]}} props
 */
const RoleRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, hasRole } = useAuth();

  // Not logged in at all → back to login.
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Logged in but wrong role → bounce to the user's own home page.
  if (!hasRole(allowedRoles)) {
    return <Navigate to={homeRouteFor(user)} replace />;
  }

  // Allowed → render the protected page.
  return children;
};

export default RoleRoute;
