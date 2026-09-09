/**
 * src/constants/permissions.js
 * ----------------------------------------------------------------------------
 * Frontend mirror of the backend permission matrix
 * (`backend/src/constants/permissions.js`).
 *
 * IMPORTANT: these helpers only drive UI visibility (which buttons/menus to
 * show). Every action is re-checked server-side — hiding a button never
 * grants or denies access by itself.
 *
 * Scope legend: FULL · LIMITED · ASSIGNED · OWN · VIEW · -
 * See the backend file for the full matrix table.
 * ----------------------------------------------------------------------------
 */
import { ROLES, getUserRole } from './roles';

/** Every permission key checked by the UI (mirrors the backend). */
export const PERMISSIONS = Object.freeze({
  USERS_REGISTER: 'users.register',
  USERS_CREATE_PRIVILEGED: 'users.createPrivileged',
  USERS_CREATE_STAFF: 'users.createStaff',
  USERS_VIEW_ALL: 'users.viewAll',
  USERS_VIEW_ASSIGNED: 'users.viewAssigned',
  APPLICATIONS_REVIEW: 'applications.review',
  APPLICATIONS_ASSIGN_MANAGER: 'applications.assignManager',
  APPLICATIONS_VERIFY: 'applications.verify',
  APPLICATIONS_SELECT_VEHICLE: 'applications.selectVehicle',
  APPLICATIONS_FINANCE_SETUP: 'applications.financeSetup',
  APPLICATIONS_RECORD_PAYMENT: 'applications.recordPayment',
  APPLICATIONS_MARK_READY: 'applications.markReady',
  APPLICATIONS_COMPLETE: 'applications.complete',
  APPLICATIONS_VIEW_ALL: 'applications.viewAll',
  VEHICLES_CREATE: 'vehicles.create',
  VEHICLES_UPDATE: 'vehicles.update',
  VEHICLES_DELETE: 'vehicles.delete',
  VEHICLES_VIEW: 'vehicles.view',
  PAYMENTS_VIEW_ALL: 'payments.viewAll',
  PAYMENTS_VIEW_ASSIGNED: 'payments.viewAssigned',
  REPORTS_VIEW_ALL: 'reports.viewAll',
  REPORTS_VIEW_LIMITED: 'reports.viewLimited',
  AUDIT_VIEW: 'audit.view',
});

/**
 * Matrix: permission key → roles granted that permission.
 * Superadmin passes every check even when unlisted.
 */
export const PERMISSION_MATRIX = Object.freeze({
  [PERMISSIONS.USERS_REGISTER]: [ROLES.SUPERADMIN, ROLES.ADMIN],
  [PERMISSIONS.USERS_CREATE_PRIVILEGED]: [ROLES.SUPERADMIN],
  [PERMISSIONS.USERS_CREATE_STAFF]: [ROLES.SUPERADMIN, ROLES.ADMIN],
  [PERMISSIONS.USERS_VIEW_ALL]: [
    ROLES.SUPERADMIN,
    ROLES.ADMIN,
    ROLES.SALES,
    ROLES.TEAMLEAD,
    ROLES.EMPLOYEE,
    ROLES.INVENTORY,
  ],
  [PERMISSIONS.USERS_VIEW_ASSIGNED]: [ROLES.SUPERADMIN, ROLES.ADMIN, ROLES.MANAGER],
  [PERMISSIONS.APPLICATIONS_REVIEW]: [ROLES.SUPERADMIN],
  [PERMISSIONS.APPLICATIONS_ASSIGN_MANAGER]: [ROLES.SUPERADMIN],
  [PERMISSIONS.APPLICATIONS_VERIFY]: [ROLES.SUPERADMIN, ROLES.MANAGER],
  [PERMISSIONS.APPLICATIONS_SELECT_VEHICLE]: [ROLES.SUPERADMIN, ROLES.MANAGER, ROLES.CUSTOMER],
  [PERMISSIONS.APPLICATIONS_FINANCE_SETUP]: [ROLES.SUPERADMIN, ROLES.MANAGER],
  [PERMISSIONS.APPLICATIONS_RECORD_PAYMENT]: [ROLES.SUPERADMIN, ROLES.ADMIN, ROLES.MANAGER],
  [PERMISSIONS.APPLICATIONS_MARK_READY]: [ROLES.SUPERADMIN, ROLES.MANAGER],
  [PERMISSIONS.APPLICATIONS_COMPLETE]: [ROLES.SUPERADMIN],
  [PERMISSIONS.APPLICATIONS_VIEW_ALL]: [
    ROLES.SUPERADMIN,
    ROLES.ADMIN,
    ROLES.SALES,
    ROLES.TEAMLEAD,
    ROLES.EMPLOYEE,
  ],
  [PERMISSIONS.VEHICLES_CREATE]: [ROLES.SUPERADMIN, ROLES.ADMIN, ROLES.INVENTORY],
  [PERMISSIONS.VEHICLES_UPDATE]: [ROLES.SUPERADMIN, ROLES.ADMIN, ROLES.INVENTORY],
  [PERMISSIONS.VEHICLES_DELETE]: [ROLES.SUPERADMIN],
  [PERMISSIONS.VEHICLES_VIEW]: [
    ROLES.SUPERADMIN,
    ROLES.ADMIN,
    ROLES.MANAGER,
    ROLES.SALES,
    ROLES.TEAMLEAD,
    ROLES.EMPLOYEE,
    ROLES.INVENTORY,
    ROLES.CUSTOMER,
  ],
  [PERMISSIONS.PAYMENTS_VIEW_ALL]: [ROLES.SUPERADMIN, ROLES.ADMIN],
  [PERMISSIONS.PAYMENTS_VIEW_ASSIGNED]: [ROLES.SUPERADMIN, ROLES.ADMIN, ROLES.MANAGER],
  [PERMISSIONS.REPORTS_VIEW_ALL]: [ROLES.SUPERADMIN],
  [PERMISSIONS.REPORTS_VIEW_LIMITED]: [
    ROLES.SUPERADMIN,
    ROLES.ADMIN,
    ROLES.MANAGER,
    ROLES.SALES,
    ROLES.TEAMLEAD,
    ROLES.EMPLOYEE,
    ROLES.INVENTORY,
  ],
  [PERMISSIONS.AUDIT_VIEW]: [ROLES.SUPERADMIN],
});

/**
 * Check whether a user holds a permission (UI visibility only).
 * @param {object|null} user - User object.
 * @param {string} permission - One of PERMISSIONS.
 * @returns {boolean} True when the UI should show the action.
 */
export const can = (user, permission) => {
  const role = getUserRole(user);
  if (!role) return false;
  if (role === ROLES.SUPERADMIN) return true;
  return (PERMISSION_MATRIX[permission] || []).includes(role);
};

/**
 * Human-readable scope badge per role (spec §2 access column).
 * @param {object|null} user - User object.
 * @returns {string} FULL · LIMITED · ASSIGNED ONLY · OWN DATA · STAFF · -
 */
export const accessScopeFor = (user) => {
  const role = getUserRole(user);
  if (role === ROLES.SUPERADMIN) return 'FULL';
  if (role === ROLES.ADMIN) return 'LIMITED';
  if (role === ROLES.MANAGER) return 'ASSIGNED ONLY';
  if (role === ROLES.CUSTOMER) return 'OWN DATA';
  if (role) return 'STAFF';
  return '-';
};
