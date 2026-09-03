const asyncHandler = require('express-async-handler');
const { User } = require('../models');
const { verifyToken } = require('../services/tokenService');
const { fail } = require('../utils/apiResponse');

const getTokenFromRequest = (req) => {
  const header = req.headers.authorization || req.headers.Authorization;
  if (header && String(header).startsWith('Bearer ')) {
    return String(header).slice(7).trim();
  }
  if (req.cookies?.token) {
    return req.cookies.token;
  }
  return null;
};

const attachUser = async (req) => {
  const token = getTokenFromRequest(req);
  if (!token) return null;
  const decoded = verifyToken(token);
  const user = await User.findByPk(decoded.userId);
  if (!user) return null;
  req.token = token;
  req.userId = user.id;
  req.user = user;
  return user;
};

const extractUserId = asyncHandler(async (req, res, next) => {
  try {
    const user = await attachUser(req);
    if (!user) {
      return fail(res, { status: 401, message: 'Not authenticated' });
    }
    next();
  } catch (error) {
    return fail(res, { status: 401, message: 'Invalid or expired token' });
  }
});

const isAuthenticated = extractUserId;

const requireAdmin = asyncHandler(async (req, res, next) => {
  if (!req.user) {
    return fail(res, { status: 401, message: 'Not authenticated' });
  }
  if (req.user.userType !== 'admin') {
    return fail(res, { status: 403, message: 'Admin access required' });
  }
  next();
});

const requireRoles = (...roles) =>
  asyncHandler(async (req, res, next) => {
    if (!req.user) {
      return fail(res, { status: 401, message: 'Not authenticated' });
    }
    if (!roles.includes(req.user.userType)) {
      return fail(res, { status: 403, message: 'You are not allowed to perform this action' });
    }
    next();
  });

module.exports = {
  extractUserId,
  isAuthenticated,
  requireAdmin,
  requireRoles,
  getTokenFromRequest,
};
