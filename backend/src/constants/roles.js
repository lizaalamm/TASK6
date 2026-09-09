/**
 * backend/src/constants/roles.js
 * ----------------------------------------------------------------------------
 * Single source of truth for every user role in the system.
 *
 * Core showroom roles (per U Devs spec):
 *   superadmin > admin > manager > customer
 *
 * Legacy / specialised staff roles kept for backwards compatibility:
 *   teamlead / sales / inventory / employee
 *
 * - `superadmin` : platform owner. FULL access — manages everything, including
 *                  admins. Only role that can approve/reject applications,
 *                  assign managers and complete orders.
 * - `admin`      : showroom manager. LIMITED operational access within the
 *                  permissions granted by Super Admin. Cannot create
 *                  superadmins/admins, approve protected applications or
 *                  assign managers.
 * - `manager`    : case owner. ASSIGNED-ONLY — sees only customers /
 *                  applications where `managerId` matches their own id.
 *                  Verifies documents, selects vehicles, configures finance
 *                  plans and records permitted payments.
 * - `teamlead`   : legacy sales-team lead (ranked with manager).
 * - `sales`      : legacy sales staff — customers + applications (view).
 * - `inventory`  : legacy stock staff — cars + suppliers.
 * - `employee`   : generic staff member (default for new staff).
 * - `customer`   : showroom visitor. OWN DATA only — own profile, own
 *                  applications, own finance plan and payment history.
 * ----------------------------------------------------------------------------
 */

// All roles recognised by the API (matches the User.userType ENUM).
const ROLES = Object.freeze({
  SUPERADMIN: 'superadmin',
  ADMIN: 'admin',
  MANAGER: 'manager',
  TEAMLEAD: 'teamlead',
  SALES: 'sales',
  INVENTORY: 'inventory',
  EMPLOYEE: 'employee',
  CUSTOMER: 'customer',
});

// Flat list — handy for validators and `isIn()` checks.
const ALLOWED_TYPES = Object.freeze(Object.values(ROLES));

// Roles that work IN the showroom (staff). Used for dashboard access.
const STAFF_ROLES = Object.freeze([
  ROLES.SUPERADMIN,
  ROLES.ADMIN,
  ROLES.MANAGER,
  ROLES.SALES,
  ROLES.INVENTORY,
  ROLES.EMPLOYEE,
  ROLES.TEAMLEAD,
]);

// Numeric rank for each role — bigger number = more power.
// Useful for comparisons like "can X manage Y?".
const ROLE_RANK = Object.freeze({
  [ROLES.CUSTOMER]: 1,
  [ROLES.EMPLOYEE]: 2,
  [ROLES.SALES]: 3,
  [ROLES.INVENTORY]: 3,
  [ROLES.TEAMLEAD]: 4,
  [ROLES.MANAGER]: 4,
  [ROLES.ADMIN]: 5,
  [ROLES.SUPERADMIN]: 6,
});

/**
 * Check whether a string is a valid role.
 * @param {string} value - Raw role string (any casing/whitespace).
 * @returns {boolean} True when the value is a known role.
 */
const isValidRole = (value) => {
  if (!value) return false;
  return ALLOWED_TYPES.includes(String(value).trim().toLowerCase());
};

/**
 * Compare two roles by privilege rank.
 * @param {string} a - First role.
 * @param {string} b - Second role.
 * @returns {number} Positive when `a` outranks `b`, negative when lower, 0 when equal.
 */
const compareRoles = (a, b) => {
  const rankA = ROLE_RANK[String(a || '').toLowerCase()] || 0;
  const rankB = ROLE_RANK[String(b || '').toLowerCase()] || 0;
  return rankA - rankB;
};

/**
 * Decide whether `actorRole` is allowed to manage `targetRole`.
 * Rule: you can only manage roles strictly BELOW your own rank,
 * except superadmin who can manage everyone (including other superadmins).
 *
 * @param {string} actorRole - Role of the person performing the action.
 * @param {string} targetRole - Role of the account being managed.
 * @returns {boolean} True when management is allowed.
 */
const canManageRole = (actorRole, targetRole) => {
  const actor = String(actorRole || '').toLowerCase();
  const target = String(targetRole || '').toLowerCase();
  if (actor === ROLES.SUPERADMIN) return true; // superadmin manages all
  if (target === ROLES.SUPERADMIN) return false; // nobody else touches superadmin
  return compareRoles(actor, target) > 0;
};

module.exports = {
  ROLES,
  ALLOWED_TYPES,
  STAFF_ROLES,
  ROLE_RANK,
  isValidRole,
  compareRoles,
  canManageRole,
};
