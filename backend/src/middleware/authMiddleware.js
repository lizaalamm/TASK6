/**
 * backend/src/middleware/authMiddleware.js
 * ----------------------------------------------------------------------------
 * Authentication + authorisation guards used by every protected route.
 *
 * Guards (use in this order on a route):
 *   1. `isAuthenticated`  — valid JWT required (populates req.user/req.userId)
 *   2. `requireAdmin`     — admin OR superadmin only
 *   3. `requireSuperAdmin`— superadmin only (platform-owner actions)
 *   4. `requireRoles(..)`— any custom list of roles
 *
 * Token sources (checked in order): `Authorization: Bearer <jwt>` header,
 * then the httpOnly `token` cookie.
 * ----------------------------------------------------------------------------
 */
const asyncHandler = require('express-async-handler');
const { User } = require('../models');
const { verifyToken } = require('../services/tokenService');
const { fail } = require('../utils/apiResponse');

/**
 * Pull the JWT out of the request (header first, cookie fallback).
 * @param {import('express').Request} req - Express request.
 * @returns {string|null} The raw token, or null when absent.
 */
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

/**
 * Verify the token and attach the live user row to the request.
 * @param {import('express').Request} req - Express request (mutated in place).
 * @returns {Promise<User|null>} The user, or null when unauthenticated.
 */
const attachUser = async (req) => {
  const token = getTokenFromRequest(req);
  if (!token) return null;
  const decoded = verifyToken(token); // throws on invalid/expired tokens
  const user = await User.findByPk(decoded.userId);
  if (!user) return null;
  req.token = token;
  req.userId = user.id;
  req.user = user;
  return user;
};

/**
 * Guard: reject requests without a valid JWT (401).
 * Populates `req.user` + `req.userId` for downstream handlers.
 */
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

// Alias with a friendlier name — both do exactly the same thing.
const isAuthenticated = extractUserId;

/**
 * Guard: admin-level access. Superadmins inherit admin rights, so both
 * `admin` and `superadmin` pass. Must run AFTER `isAuthenticated`.
 */
const requireAdmin = asyncHandler(async (req, res, next) => {
  if (!req.user) {
    return fail(res, { status: 401, message: 'Not authenticated' });
  }
  if (req.user.userType !== 'admin' && req.user.userType !== 'superadmin') {
    return fail(res, { status: 403, message: 'Admin access required' });
  }
  next();
});

/**
 * Guard: platform-owner access. ONLY `superadmin` passes.
 * Use for managing admins, system settings and global stats.
 * Must run AFTER `isAuthenticated`.
 */
const requireSuperAdmin = asyncHandler(async (req, res, next) => {
  if (!req.user) {
    return fail(res, { status: 401, message: 'Not authenticated' });
  }
  if (req.user.userType !== 'superadmin') {
    return fail(res, { status: 403, message: 'Superadmin access required' });
  }
  next();
});

/**
 * Factory guard: allow ONLY the listed roles.
 * @example router.get('/x', isAuthenticated, requireRoles('sales', 'admin'), handler)
 * @param {...string} roles - Roles permitted to pass.
 * @returns Express middleware enforcing the role list.
 */
const requireRoles = (...roles) =>
  asyncHandler(async (req, res, next) => {
    if (!req.user) {
      return fail(res, { status: 401, message: 'Not authenticated' });
    }
    // Superadmin is omnipotent — it passes every role check automatically.
    if (req.user.userType === 'superadmin') return next();
    if (!roles.includes(req.user.userType)) {
      return fail(res, { status: 403, message: 'You are not allowed to perform this action' });
    }
    next();
  });

module.exports = {
  extractUserId,
  isAuthenticated,
  requireAdmin,
  requireSuperAdmin,
  requireRoles,
  getTokenFromRequest,
};
