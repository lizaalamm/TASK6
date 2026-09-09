/**
 * backend/src/constants/permissions.js
 * ----------------------------------------------------------------------------
 * Permission matrix for the U Devs Showroom Management System.
 *
 * Every privileged backend action is checked against this matrix — permissions
 * are NEVER enforced by hiding buttons in React alone.
 *
 * Scope legend:
 *   FULL     — unrestricted access
 *   LIMITED  — operational access within Super-Admin-granted modules only
 *   ASSIGNED — only rows where `managerId` matches the authenticated manager
 *   OWN      — only the authenticated user's own rows
 *   VIEW     — read-only
 *   -        — denied
 *
 * | Feature                    | Super Admin | Admin   | Manager  | Customer |
 * |----------------------------|-------------|---------|----------|----------|
 * | Register users (portal)    | YES         | YES*    | NO       | NO       |
 * | Create Super Admin         | YES         | NO      | NO       | NO       |
 * | Create Admin               | YES         | NO      | NO       | NO       |
 * | Create Manager/Customer    | YES         | YES     | NO       | NO       |
 * | Approve/Pending/Reject app | YES         | NO      | NO       | NO       |
 * | Assign Manager             | YES         | NO      | NO       | NO       |
 * | View all customers         | YES         | LIMITED | NO       | NO       |
 * | View assigned customers    | YES         | YES     | YES      | NO       |
 * | View own profile           | YES         | YES     | YES      | YES      |
 * | Vehicle CRUD               | FULL        | LIMITED | VIEW     | VIEW**   |
 * | Finance / Installments     | FULL        | LIMITED | ASSIGNED | VIEW OWN |
 * | Payments                   | ALL         | LIMITED | ASSIGNED | VIEW OWN |
 * | Reports                    | ALL         | LIMITED | ASSIGNED | NO       |
 * | Audit logs / settings      | YES         | NO      | NO       | NO       |
 * | Complete order             | YES         | NO      | NO       | NO       |
 *
 *  * Admin can create manager/customer/staff accounts only.
 * ** Customer sees Available vehicles with stock only.
 * ----------------------------------------------------------------------------
 */
const { ROLES } = require('./roles');

/** Every permission key checked by the API. */
const PERMISSIONS = Object.freeze({
  USERS_REGISTER: 'users.register',
  USERS_CREATE_PRIVILEGED: 'users.createPrivileged', // superadmin/admin accounts
  USERS_CREATE_STAFF: 'users.createStaff', // manager/customer/legacy staff
  USERS_VIEW_ALL: 'users.viewAll',
  USERS_VIEW_ASSIGNED: 'users.viewAssigned',
  APPLICATIONS_REVIEW: 'applications.review', // approve / pending / reject
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
 * Superadmin is omnipotent — it passes every check even if unlisted.
 */
const PERMISSION_MATRIX = Object.freeze({
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
 * Check whether a role holds a permission.
 * Superadmin bypasses every check.
 *
 * @param {string} role - Canonical role string.
 * @param {string} permission - One of PERMISSIONS.
 * @returns {boolean} True when granted.
 */
const can = (role, permission) => {
  const normalized = String(role || '').toLowerCase();
  if (normalized === ROLES.SUPERADMIN) return true;
  const allowed = PERMISSION_MATRIX[permission] || [];
  return allowed.includes(normalized);
};

module.exports = {
  PERMISSIONS,
  PERMISSION_MATRIX,
  can,
};
