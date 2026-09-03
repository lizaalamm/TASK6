const asyncHandler = require('express-async-handler');
const { Op } = require('sequelize');
const { User } = require('../models');
const { sanitizeUser } = require('../utils/sanitizeUser');
const { success, fail } = require('../utils/apiResponse');
const {
  generateToken,
  setTokenCookie,
  clearTokenCookie,
} = require('../services/tokenService');

const ALLOWED_TYPES = [
  'admin',
  'employee',
  'teamlead',
  'sales',
  'inventory',
  'customer',
];

const normalizeType = (value) => {
  if (!value) return undefined;
  const raw = String(value).trim().toLowerCase();
  const aliases = {
    user: 'employee',
    manager: 'teamlead',
    'team-lead': 'teamlead',
    teamlead: 'teamlead',
  };
  const mapped = aliases[raw] || raw;
  return ALLOWED_TYPES.includes(mapped) ? mapped : undefined;
};

const normalizeStatus = (value) => {
  if (!value) return undefined;
  const raw = String(value).trim().toLowerCase();
  if (raw === 'active' || raw === 'inactive') return raw;
  return undefined;
};

const buildUserPayload = (body, { isCreate = false } = {}) => {
  const userType = normalizeType(body.userType || body.role);
  const status = normalizeStatus(body.status);

  const payload = {
    name: body.name,
    email: body.email,
    phone: body.phone || null,
    cnic: body.cnic || null,
    avatar: body.avatar || null,
    cnic_front: body.cnic_front || null,
    cnic_back: body.cnic_back || null,
    teamLeadId: body.teamLeadId || null,
    joiningDate: body.joiningDate || null,
    terminatedDate: body.terminatedDate || null,
    isTeamLead: Boolean(body.isTeamLead) || userType === 'teamlead',
    isTerminated: Boolean(body.isTerminated),
  };

  if (userType) payload.userType = userType;
  if (status) payload.status = status;
  if (body.password) payload.password = body.password;

  if (isCreate && !payload.userType) {
    payload.userType = 'employee';
  }

  Object.keys(payload).forEach((key) => {
    if (payload[key] === undefined) delete payload[key];
  });

  return payload;
};

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

const logoutUser = asyncHandler(async (req, res) => {
  clearTokenCookie(res);
  return success(res, { message: 'Logged out successfully', data: {} });
});

const registerUser = asyncHandler(async (req, res) => {
  const payload = buildUserPayload(
    { ...req.body, userType: req.body.userType || req.body.role || 'customer' },
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

const createUser = asyncHandler(async (req, res) => {
  const payload = buildUserPayload(req.body, { isCreate: true });

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

const getAllUsers = asyncHandler(async (req, res) => {
  const { search, userType, status } = req.query;
  const where = {};

  if (userType) {
    const type = normalizeType(userType);
    if (type) where.userType = type;
  }
  if (status) {
    const st = normalizeStatus(status);
    if (st) where.status = st;
  }
  if (search) {
    where[Op.or] = [
      { name: { [Op.like]: `%${search}%` } },
      { email: { [Op.like]: `%${search}%` } },
    ];
  }

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

const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.params.id, {
    attributes: { exclude: ['password'] },
  });
  if (!user) {
    return fail(res, { status: 404, message: 'User not found' });
  }
  return success(res, { message: 'User fetched', data: sanitizeUser(user) });
});

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

const updateUser = asyncHandler(async (req, res) => {
  const id = req.params.id || req.body.id || req.userId;
  if (!id) {
    return fail(res, { status: 400, message: 'User id is required' });
  }

  const isSelf = Number(id) === Number(req.userId);
  const isAdmin = req.user?.userType === 'admin';
  if (!isSelf && !isAdmin) {
    return fail(res, { status: 403, message: 'You can only update your own profile' });
  }

  const user = await User.findByPk(id);
  if (!user) {
    return fail(res, { status: 404, message: 'User not found' });
  }

  const payload = buildUserPayload(req.body);
  if (!isAdmin) {
    delete payload.userType;
    delete payload.status;
    delete payload.isTerminated;
    delete payload.isTeamLead;
    delete payload.teamLeadId;
  }
  if (!payload.password) delete payload.password;

  await user.update(payload);
  const updated = await User.findByPk(id, { attributes: { exclude: ['password'] } });
  return success(res, { message: 'User updated', data: sanitizeUser(updated) });
});

const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (Number(id) === Number(req.userId)) {
    return fail(res, { status: 400, message: 'You cannot delete your own account' });
  }

  const user = await User.findByPk(id);
  if (!user) {
    return fail(res, { status: 404, message: 'User not found' });
  }

  await user.destroy();
  return success(res, { message: 'User deleted', data: { id: Number(id) } });
});

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
  getMe,
};
