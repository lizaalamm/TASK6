/**
 * backend/src/controllers/adminController.js
 * ----------------------------------------------------------------------------
 * SUPERADMIN-ONLY endpoints mounted under `/api/admin/*`.
 * Powers the Super Admin dashboard: platform-wide counts, per-role breakdown,
 * recent signups and the list of leadership (admin) accounts.
 * Every route here is guarded by `requireSuperAdmin` in adminRoutes.js.
 * ----------------------------------------------------------------------------
 */
const asyncHandler = require('express-async-handler');
const { fn, col } = require('sequelize');
const { User } = require('../models');
const { sanitizeUser } = require('../utils/sanitizeUser');
const { success } = require('../utils/apiResponse');
const { ROLES } = require('../constants/roles');

/**
 * GET /api/admin/stats — platform overview numbers.
 * @returns { total, active, inactive, terminated, byRole, recentUsers }
 */
const getSystemStats = asyncHandler(async (req, res) => {
  // Total accounts on the platform.
  const total = await User.count();

  // Health breakdowns.
  const active = await User.count({ where: { status: 'active' } });
  const inactive = await User.count({ where: { status: 'inactive' } });
  const terminated = await User.count({ where: { isTerminated: true } });

  // GROUP BY userType → [{ userType, count }] → { admin: 2, customer: 9, ... }
  const grouped = await User.findAll({
    attributes: ['userType', [fn('COUNT', col('id')), 'count']],
    group: ['userType'],
    raw: true,
  });
  const byRole = {};
  for (const row of grouped) {
    byRole[row.userType] = Number(row.count);
  }

  // Latest 5 signups for the "recent activity" panel.
  const recentRows = await User.findAll({
    attributes: { exclude: ['password'] },
    order: [['createdAt', 'DESC']],
    limit: 5,
  });

  return success(res, {
    message: 'System stats fetched',
    data: {
      total,
      active,
      inactive,
      terminated,
      byRole,
      recentUsers: recentRows.map(sanitizeUser),
    },
  });
});

/**
 * GET /api/admin/admins — list leadership accounts (superadmin + admin).
 * Lets the platform owner see exactly who holds elevated access.
 */
const getAdminAccounts = asyncHandler(async (req, res) => {
  const admins = await User.findAll({
    where: { userType: [ROLES.SUPERADMIN, ROLES.ADMIN] },
    attributes: { exclude: ['password'] },
    order: [['id', 'ASC']],
  });
  return success(res, {
    message: 'Admin accounts fetched',
    data: admins.map(sanitizeUser),
  });
});

module.exports = {
  getSystemStats,
  getAdminAccounts,
};
