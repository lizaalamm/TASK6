/**
 * backend/src/controllers/userController.js
 * ----------------------------------------------------------------------------
 * HTTP handlers for every `/api/users/*` endpoint (auth + user management).
 *
 * Permission summary:
 *  - register/login/logout : public
 *  - me / list / detail    : any authenticated user
 *  - create (POST /user)   : admin+, but ONLY superadmin may create
 *                            `superadmin` (or `admin`) accounts
 *  - update (PUT)          : self-service for own profile; admins can edit
 *                            lower-ranked accounts; superadmin accounts are
 *                            editable by superadmins only
 *  - delete (DELETE)       : admin+, but superadmin accounts can only be
 *                            deleted by another superadmin (never yourself)
 * ----------------------------------------------------------------------------
 */
const asyncHandler = require('express-async-handler');
const { Op } = require('sequelize');
const { User } = require('../models');
const { sanitizeUser } = require('../utils/sanitizeUser');
const { success, fail } = require('../utils/apiResponse');
const { ROLES, ALLOWED_TYPES } = require('../constants/roles');
const {
  generateToken,
  setTokenCookie,
  clearTokenCookie,
} = require('../services/tokenService');

/**
 * Normalise any raw role string into a canonical role (or undefined).
 * Accepts legacy aliases (`user` → employee, `manager` → teamlead, ...).
 * @param {string} value - Raw role / userType input.
 * @returns {string|undefined} Canonical role, or undefined when unknown.
 */
const normalizeType = (value) => {
  if (!value) return undefined;
  const raw = String(value).trim().toLowerCase();
  // NOTE: `manager` is a first-class role (spec §2) — NOT an alias of teamlead.
  const aliases = {
    user: 'employee',
    'team-lead': 'teamlead',
    team_lead: 'teamlead',
    teamlead: 'teamlead',
    'super-admin': 'superadmin',
    super_admin: 'superadmin',
    superadmin: 'superadmin',
  };
  const mapped = aliases[raw] || raw;
  return ALLOWED_TYPES.includes(mapped) ? mapped : undefined;
};

/**
 * Normalise a status string into `active` / `inactive` (or undefined).
 * @param {string} value - Raw status input.
 * @returns {string|undefined} Canonical status, or undefined when unknown.
 */
const normalizeStatus = (value) => {
  if (!value) return undefined;
  const raw = String(value).trim().toLowerCase();
  if (raw === 'active' || raw === 'inactive') return raw;
  return undefined;
};

/**
 * Whitelist + normalise user fields coming from `req.body`.
 * Only known columns are picked, so clients can never mass-assign internals.
 * @param {object} body - Raw request body.
 * @param {{isCreate?: boolean}} opts - On create, default role to `employee`.
 * @returns {object} Clean payload ready for Sequelize.
 */
const buildUserPayload = (body, { isCreate = false } = {}) => {
  const userType = normalizeType(body.userType || body.role);
  const status = normalizeStatus(body.status);

  const payload = {
    name: body.name,
    firstName: body.firstName || null,
    lastName: body.lastName || null,
    email: body.email,
    phone: body.phone || null,
    cnic: body.cnic || null,
    avatar: body.avatar || null,
    cnic_front: body.cnic_front || body.cnicFront || null,
    cnic_back: body.cnic_back || body.cnicBack || null,
    teamLeadId: body.teamLeadId || null,
    managerId: body.managerId || null,
    address: body.address || null,
    city: body.city || null,
    joiningDate: body.joiningDate || null,
    terminatedDate: body.terminatedDate || null,
    isTeamLead: Boolean(body.isTeamLead) || userType === 'teamlead',
    isTerminated: Boolean(body.isTerminated),
  };
  // Compose the display name from first/last when `name` is absent (spec §4).
  if (!payload.name && (payload.firstName || payload.lastName)) {
    payload.name = `${payload.firstName || ''} ${payload.lastName || ''}`.trim();
  }

  if (userType) payload.userType = userType;
  if (status) payload.status = status;
  if (body.password) payload.password = body.password; // hashed by model hook

  if (isCreate && !payload.userType) {
    payload.userType = 'employee';
  }

  // Drop `undefined` keys so partial updates don't null-out columns.
  Object.keys(payload).forEach((key) => {
    if (payload[key] === undefined) delete payload[key];
  });

  return payload;
};

/**
 * POST /api/users/login — verify credentials and issue a JWT.
 * Response contains the token twice (top-level + `data`) for client compat.
 */
const loginUser = asyncHandler(async (req, res) => {
  const email = String(req.body.email || '')
    .trim()
    .toLowerCase();
  const password = req.body.password;

  const user = await User.findOne({ where: { email } });
  if (!user) {
    return fail(res, { status: 401, message: 'Invalid credentials' });
  }

  const valid = await user.checkPassword(password);
  if (!valid) {
    return fail(res, { status: 401, message: 'Invalid credentials' });
  }

  // Blocked accounts can never obtain a token.
  if (user.status === 'inactive' || user.isTerminated) {
    return fail(res, {
      status: 403,
      message: 'Account is inactive or terminated',
    });
  }

  const token = generateToken(user);
  setTokenCookie(res, token);
  const safeUser = sanitizeUser(user);

  return res.status(200).json({
    success: true,
    message: 'Login successful',
    token,
    user: safeUser,
    data: { token, user: safeUser },
    errors: [],
  });
});

/**
 * POST /api/users/logout — clear the auth cookie (stateless JWT on top).
 */
const logoutUser = asyncHandler(async (req, res) => {
  clearTokenCookie(res);
  return success(res, { message: 'Logged out successfully', data: {} });
});

/**
 * POST /api/users/register — public sign-up (customer ONLY).
 * Security: EVERY public registration is forced to `customer` — staff
 * accounts (superadmin/admin/manager/...) can only be created from the
 * portal by authorised staff via POST /user (spec §2 permission matrix).
 */
const registerUser = asyncHandler(async (req, res) => {
  // Public self-registration is customer-only. Always.
  const safeType = ROLES.CUSTOMER;

  const payload = buildUserPayload(
    { ...req.body, userType: safeType },
    { isCreate: true }
  );

  const exists = await User.emailExists(payload.email);
  if (exists) {
    return fail(res, { status: 409, message: 'Email is already registered' });
  }

  const user = await User.createUser(payload);
  const token = generateToken(user);
  setTokenCookie(res, token);
  const safeUser = sanitizeUser(user);

  return res.status(201).json({
    success: true,
    message: 'Registration successful',
    token,
    user: safeUser,
    data: { token, user: safeUser },
    errors: [],
  });
});

/**
 * POST /api/users/user — portal account creation (spec §4: First Name,
 * Last Name, Email, Phone, CNIC, CNIC Front/Back, Role, Status).
 * Only a superadmin may create `superadmin` or `admin` accounts; an admin
 * creating one gets a 403. Admins MAY create manager/customer/legacy-staff
 * accounts. Route is additionally guarded by `requireAdmin`.
 */
const createUser = asyncHandler(async (req, res) => {
  const payload = buildUserPayload(req.body, { isCreate: true });
  const requesterIsSuper = req.user?.userType === ROLES.SUPERADMIN;

  // Guard the leadership roles: admins cannot mint admins/superadmins.
  if (
    (payload.userType === ROLES.SUPERADMIN || payload.userType === ROLES.ADMIN) &&
    !requesterIsSuper
  ) {
    return fail(res, {
      status: 403,
      message: 'Only a superadmin can create admin accounts',
    });
  }

  if (await User.emailExists(payload.email)) {
    return fail(res, { status: 409, message: 'Email is already registered' });
  }

  const user = await User.createUser(payload);
  return success(res, {
    status: 201,
    message: 'User created',
    data: sanitizeUser(user),
  });
});

/**
 * GET /api/users/user — scoped list with optional filters.
 * Query params: `?search=…&userType=…&status=…&managerId=…`
 * Scoping (spec §2): superadmin/admin/staff see all; managers see
 * ASSIGNED-only (their customers + themselves); customers see OWN-only.
 */
const getAllUsers = asyncHandler(async (req, res) => {
  const { search, userType, status } = req.query;
  const role = req.user?.userType;
  const and = [];

  if (userType) {
    const type = normalizeType(userType);
    if (type) and.push({ userType: type });
  }
  if (status) {
    const st = normalizeStatus(status);
    if (st) and.push({ status: st });
  }
  if (search) {
    // NOTE: `Op.like` works on SQLite + Postgres; swap to Op.iLike for
    // case-insensitive Postgres-only search if needed.
    and.push({
      [Op.or]: [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
      ],
    });
  }
  // Superadmin/admin may filter by assigned manager (assignment screens).
  if (req.query.managerId && [ROLES.SUPERADMIN, ROLES.ADMIN].includes(role)) {
    and.push({ managerId: req.query.managerId });
  }
  // Row-level scoping: assigned-only for managers, own-only for customers.
  if (role === ROLES.MANAGER) {
    and.push({ [Op.or]: [{ managerId: req.userId }, { id: req.userId }] });
  } else if (role === ROLES.CUSTOMER) {
    and.push({ id: req.userId });
  }

  const where = and.length ? { [Op.and]: and } : {};
  const users = await User.findAll({
    where,
    attributes: { exclude: ['password'] },
    order: [['id', 'ASC']],
  });

  const data = users.map(sanitizeUser);
  return res.status(200).json({
    success: true,
    message: 'Users fetched',
    data,
    errors: [],
  });
});

/**
 * GET /api/users/user/:id — fetch one user by id (no password hash).
 * Scoped: managers may open assigned customers + themselves; customers
 * may open themselves; staff may open anyone.
 */
const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.params.id, {
    attributes: { exclude: ['password'] },
  });
  if (!user) {
    return fail(res, { status: 404, message: 'User not found' });
  }

  const role = req.user?.userType;
  const isSelf = Number(req.params.id) === Number(req.userId);
  const isAssignedToManager =
    role === ROLES.MANAGER && Number(user.managerId) === Number(req.userId);
  const isStaffReader = [
    ROLES.SUPERADMIN,
    ROLES.ADMIN,
    ROLES.SALES,
    ROLES.TEAMLEAD,
    ROLES.EMPLOYEE,
    ROLES.INVENTORY,
  ].includes(role);
  if (!isSelf && !isAssignedToManager && !isStaffReader) {
    return fail(res, { status: 403, message: 'You cannot view this user' });
  }
  return success(res, { message: 'User fetched', data: sanitizeUser(user) });
});

/**
 * GET /api/users/managers — active manager accounts for the Super Admin
 * "assign manager" dropdown (spec §8 step 3). Superadmin + admin only.
 */
const getManagers = asyncHandler(async (req, res) => {
  if (![ROLES.SUPERADMIN, ROLES.ADMIN].includes(req.user?.userType)) {
    return fail(res, { status: 403, message: 'You cannot view the manager list' });
  }
  const managers = await User.findAll({
    where: { userType: ROLES.MANAGER, status: 'active' },
    attributes: { exclude: ['password'] },
    order: [['name', 'ASC']],
  });
  return success(res, {
    message: 'Managers fetched',
    data: managers.map(sanitizeUser),
  });
});

/**
 * GET /api/users/me — return the currently logged-in user.
 * Used by the frontend to restore sessions after a page reload.
 */
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.userId, {
    attributes: { exclude: ['password'] },
  });
  if (!user) {
    return fail(res, { status: 404, message: 'User not found' });
  }
  const safeUser = sanitizeUser(user);
  return res.status(200).json({
    success: true,
    message: 'Current user fetched',
    user: safeUser,
    data: safeUser,
    errors: [],
  });
});

/**
 * PUT /api/users/user/:id (or PUT /user with `id` in body) — update a user.
 *  - Regular users: may edit ONLY their own profile, and never privilege
 *    fields (role / status / termination / team links).
 *  - Admins: may edit lower-ranked accounts but NOT superadmin accounts.
 *  - Superadmins: may edit anyone, including role changes.
 */
const updateUser = asyncHandler(async (req, res) => {
  const id = req.params.id || req.body.id || req.userId;
  if (!id) {
    return fail(res, { status: 400, message: 'User id is required' });
  }

  const isSelf = Number(id) === Number(req.userId);
  const requesterRole = req.user?.userType;
  const isSuper = requesterRole === ROLES.SUPERADMIN;
  const isAdmin = requesterRole === ROLES.ADMIN || isSuper;

  // Non-admins can only touch their own profile.
  if (!isSelf && !isAdmin) {
    return fail(res, { status: 403, message: 'You can only update your own profile' });
  }

  const user = await User.findByPk(id);
  if (!user) {
    return fail(res, { status: 404, message: 'User not found' });
  }

  // Superadmin accounts are untouchable for plain admins.
  if (user.userType === ROLES.SUPERADMIN && !isSuper) {
    return fail(res, { status: 403, message: 'Only a superadmin can edit superadmin accounts' });
  }

  const payload = buildUserPayload(req.body);

  // Strip privilege fields for non-admin self edits.
  if (!isAdmin) {
    delete payload.userType;
    delete payload.status;
    delete payload.isTerminated;
    delete payload.isTeamLead;
    delete payload.teamLeadId;
    delete payload.managerId; // only Super Admin assigns managers (spec §8.3)
  }

  // Manager assignment is a Super-Admin-only action — admins included.
  if (!isSuper && payload.managerId !== undefined && payload.managerId !== user.managerId) {
    return fail(res, {
      status: 403,
      message: 'Only a superadmin can assign managers',
    });
  }

  // Admins (non-super) cannot promote anyone INTO leadership roles...
  if (!isSuper && (payload.userType === ROLES.SUPERADMIN || payload.userType === ROLES.ADMIN)) {
    return fail(res, {
      status: 403,
      message: 'Only a superadmin can assign admin roles',
    });
  }
  // ...nor demote/edit existing admins & superadmins.
  if (!isSuper && (user.userType === ROLES.ADMIN || user.userType === ROLES.SUPERADMIN)) {
    return fail(res, { status: 403, message: 'Only a superadmin can manage admin accounts' });
  }

  if (!payload.password) delete payload.password; // keep old hash when blank

  await user.update(payload);
  const updated = await User.findByPk(id, { attributes: { exclude: ['password'] } });
  return success(res, { message: 'User updated', data: sanitizeUser(updated) });
});

/**
 * DELETE /api/users/user/:id — delete a user (admin+).
 *  - You can never delete your own account (prevents lock-out).
 *  - Superadmin accounts can only be deleted by another superadmin.
 */
const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (Number(id) === Number(req.userId)) {
    return fail(res, { status: 400, message: 'You cannot delete your own account' });
  }

  const user = await User.findByPk(id);
  if (!user) {
    return fail(res, { status: 404, message: 'User not found' });
  }

  if (user.userType === ROLES.SUPERADMIN && req.user?.userType !== ROLES.SUPERADMIN) {
    return fail(res, {
      status: 403,
      message: 'Only a superadmin can delete superadmin accounts',
    });
  }

  await user.destroy();
  return success(res, { message: 'User deleted', data: { id: Number(id) } });
});

/**
 * GET /api/users/teamUsers/:teamLeadId — list members of one team lead.
 */
const getUsersByTeamLead = asyncHandler(async (req, res) => {
  const { teamLeadId } = req.params;
  const users = await User.findAll({
    where: { teamLeadId },
    attributes: { exclude: ['password'] },
    order: [['id', 'ASC']],
  });
  return success(res, {
    message: 'Team users fetched',
    data: users.map(sanitizeUser),
  });
});

module.exports = {
  createUser,
  getAllUsers,
  loginUser,
  logoutUser,
  updateUser,
  deleteUser,
  registerUser,
  getUserById,
  getUsersByTeamLead,
  getManagers,
  getMe,
};
