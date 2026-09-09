/**
 * src/constants/roles.js
 * ----------------------------------------------------------------------------
 * Frontend mirror of the backend role system (`backend/src/constants/roles`).
 * Import roles / groups / helpers from HERE — never hardcode role strings in
 * components, so adding a role later means editing one file, not twenty.
 *
 * Hierarchy (most → least privilege):
 *   superadmin > admin > teamlead > sales/inventory/employee > customer
 * ----------------------------------------------------------------------------
 */

/** Every role recognised by the platform. */
export const ROLES = Object.freeze({
  SUPERADMIN: 'superadmin',
  ADMIN: 'admin',
  TEAMLEAD: 'teamlead',
  SALES: 'sales',
  INVENTORY: 'inventory',
  EMPLOYEE: 'employee',
  CUSTOMER: 'customer',
});

/** Flat list of all roles — handy for `<select>` options and validators. */
export const ALL_ROLES = Object.freeze(Object.values(ROLES));

/** Human-readable labels for dropdowns, chips and tables. */
export const ROLE_LABELS = Object.freeze({
  [ROLES.SUPERADMIN]: 'Super Admin',
  [ROLES.ADMIN]: 'Admin',
  [ROLES.TEAMLEAD]: 'Team Lead',
  [ROLES.SALES]: 'Sales',
  [ROLES.INVENTORY]: 'Inventory',
  [ROLES.EMPLOYEE]: 'Employee',
  [ROLES.CUSTOMER]: 'Customer',
});

/** Brand colour per role — used for chips, avatars and badges. */
export const ROLE_COLORS = Object.freeze({
  [ROLES.SUPERADMIN]: '#7B1FA2', // royal purple — the platform owner
  [ROLES.ADMIN]: '#C62828', // deep red — showroom manager
  [ROLES.TEAMLEAD]: '#1565C0', // blue — team leadership
  [ROLES.SALES]: '#2E7D32', // green — revenue team
  [ROLES.INVENTORY]: '#EF6C00', // orange — stock team
  [ROLES.EMPLOYEE]: '#546E7A', // slate — generic staff
  [ROLES.CUSTOMER]: '#6D4C41', // brown — showroom visitor
});

// --- Route-access groups (consumed by AppRoutes + Sidebar) --------------------

/** Everyone who works IN the showroom (all staff incl. superadmin). */
export const STAFF_ROLES = Object.freeze([
  ROLES.SUPERADMIN,
  ROLES.ADMIN,
  ROLES.SALES,
  ROLES.INVENTORY,
  ROLES.EMPLOYEE,
  ROLES.TEAMLEAD,
]);

/** Roles allowed to manage customers + car applications. */
export const SALES_ROLES = Object.freeze([
  ROLES.SUPERADMIN,
  ROLES.ADMIN,
  ROLES.SALES,
  ROLES.EMPLOYEE,
  ROLES.TEAMLEAD,
]);

/** Roles allowed to manage cars + suppliers stock. */
export const INVENTORY_ROLES = Object.freeze([
  ROLES.SUPERADMIN,
  ROLES.ADMIN,
  ROLES.INVENTORY,
]);

/** Leadership: admins AND the superadmin (user management screens). */
export const ADMIN_ROLES = Object.freeze([ROLES.SUPERADMIN, ROLES.ADMIN]);

/** Platform owner only (system panel). */
export const SUPERADMIN_ONLY = Object.freeze([ROLES.SUPERADMIN]);

/** Showroom visitors only (storefront + own applications). */
export const CUSTOMER_ONLY = Object.freeze([ROLES.CUSTOMER]);

// --- Helpers -------------------------------------------------------------------

/**
 * Extract the canonical role string from any user object shape.
 * The API returns both `role` (virtual) and `userType` (column) — accept both.
 *
 * @param {object|null} user - User object (or null when logged out).
 * @returns {string|null} Lowercase role, or null when unknown.
 */
export const getUserRole = (user) => {
  const raw = user?.role || user?.userType;
  return raw ? String(raw).toLowerCase() : null;
};

/**
 * Check whether a user holds ANY of the given roles.
 * Superadmin bypasses every check (passes even when not listed).
 *
 * @param {object|null} user - User object.
 * @param {string[]} allowedRoles - Roles permitted.
 * @returns {boolean} True when access is granted.
 */
export const hasAnyRole = (user, allowedRoles = []) => {
  const role = getUserRole(user);
  if (!role) return false;
  if (role === ROLES.SUPERADMIN) return true; // omnipotent platform owner
  return allowedRoles.includes(role);
};

/**
 * Landing page per role after login / on `/`.
 * @param {object|null} user - Authenticated user.
 * @returns {string} Route path to redirect to.
 */
export const homeRouteFor = (user) => {
  const role = getUserRole(user);
  if (role === ROLES.SUPERADMIN) return '/superadmin';
  if (role === ROLES.CUSTOMER) return '/customer-dashboard';
  return '/dashboard';
};

/**
 * Pretty label for a role string (falls back to the raw value).
 * @param {string} role - Raw role.
 * @returns {string} Display label.
 */
export const roleLabel = (role) =>
  ROLE_LABELS[String(role || '').toLowerCase()] || String(role || 'User');

/**
 * Brand colour for a role string (falls back to neutral grey).
 * @param {string} role - Raw role.
 * @returns {string} Hex colour.
 */
export const roleColor = (role) =>
  ROLE_COLORS[String(role || '').toLowerCase()] || '#757575';
