/**
 * src/hooks/useRole.js
 * ----------------------------------------------------------------------------
 * Tiny hook that exposes the current user's role + permission helpers to any
 * component without prop-drilling the auth context everywhere.
 *
 * @example
 *   const { role, isSuperAdmin, can } = useRole();
 *   if (can(['admin'])) { ... }
 * ----------------------------------------------------------------------------
 */
import { useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  ROLES,
  getUserRole,
  hasAnyRole,
  roleLabel,
  roleColor,
} from '../constants/roles';

/**
 * Read the logged-in user's role and derive permission flags.
 * @returns {{
 *   role: string|null,
 *   label: string,
 *   color: string,
 *   isSuperAdmin: boolean,
 *   isAdmin: boolean,
 *   isManager: boolean,
 *   isStaff: boolean,
 *   isCustomer: boolean,
 *   can: (roles: string[]) => boolean
 * }} Role helpers for the current session.
 */
export const useRole = () => {
  const { user } = useAuth();

  return useMemo(() => {
    const role = getUserRole(user);
    const isSuperAdmin = role === ROLES.SUPERADMIN;
    const isAdmin = role === ROLES.ADMIN || isSuperAdmin;
    const isManager = role === ROLES.MANAGER || isSuperAdmin;
    const isCustomer = role === ROLES.CUSTOMER;

    return {
      // Raw role + display metadata.
      role,
      label: roleLabel(role),
      color: roleColor(role),
      // Common flags (superadmin inherits every staff flag).
      isSuperAdmin,
      isAdmin,
      isManager,
      isStaff: Boolean(role) && !isCustomer,
      isCustomer,
      // Generic checker: `can(['sales', 'admin'])`.
      can: (roles = []) => hasAnyRole(user, roles),
    };
  }, [user]);
};

export default useRole;
