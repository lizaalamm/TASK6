/**
 * backend/src/controllers/adminController.js
 * ----------------------------------------------------------------------------
 * SUPERADMIN-ONLY endpoints mounted under `/api/admin/*`.
 * Powers the Super Admin dashboard: platform-wide counts, per-role breakdown,
 * recent signups, leadership accounts, pipeline stats, overdue installments
 * and the audit trail. Every route here is guarded by `requireSuperAdmin`
 * in adminRoutes.js.
 * ----------------------------------------------------------------------------
 */
const asyncHandler = require('express-async-handler');
const { fn, col, Op } = require('sequelize');
const { User, Application, Payment, AuditLog } = require('../models');
const { sanitizeUser } = require('../utils/sanitizeUser');
const { success } = require('../utils/apiResponse');
const { ROLES } = require('../constants/roles');
const { APPLICATION_STATUS } = require('../constants/applicationStatus');

/**
 * GET /api/admin/stats — platform overview numbers.
 * @returns { total, active, inactive, terminated, byRole, recentUsers,
 *            applications, overdueCount, revenue }
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

  // Pipeline counts per status (spec §8).
  const appRows = await Application.findAll({ attributes: ['status'] });
  const applicationsByStatus = {};
  for (const row of appRows) {
    applicationsByStatus[row.status] = (applicationsByStatus[row.status] || 0) + 1;
  }

  // Overdue installments: balance + past-due with an active finance plan.
  const overdueCount = await Application.count({
    where: {
      remainingBalance: { [Op.gt]: 0 },
      nextDueDate: { [Op.lt]: new Date() },
      status: {
        [Op.in]: [APPLICATION_STATUS.FINANCE_SETUP, APPLICATION_STATUS.PAYMENT_IN_PROGRESS],
      },
    },
  });

  // Lifetime recorded revenue.
  const revenueRows = await Payment.findAll({
    where: { status: 'paid' },
    attributes: [[fn('COALESCE', fn('SUM', col('amount')), 0), 'total']],
    raw: true,
  });
  const revenue = Number(revenueRows?.[0]?.total || 0);

  return success(res, {
    message: 'System stats fetched',
    data: {
      total,
      active,
      inactive,
      terminated,
      byRole,
      recentUsers: recentRows.map(sanitizeUser),
      applications: { total: appRows.length, byStatus: applicationsByStatus },
      overdueCount,
      revenue,
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

/**
 * GET /api/admin/audit-logs — paginated audit trail (spec §4).
 * Query: `?limit=50&offset=0&action=&actorId=`
 */
const getAuditLogs = asyncHandler(async (req, res) => {
  const limit = Math.min(200, Math.max(1, Number(req.query.limit) || 50));
  const offset = Math.max(0, Number(req.query.offset) || 0);
  const where = {};
  if (req.query.action) where.action = req.query.action;
  if (req.query.actorId) where.actorId = req.query.actorId;
  if (req.query.entityType) where.entityType = req.query.entityType;

  const { rows, count } = await AuditLog.findAndCountAll({
    where,
    order: [['createdAt', 'DESC']],
    limit,
    offset,
  });
  return success(res, {
    message: 'Audit logs fetched',
    data: { total: count, limit, offset, logs: rows },
  });
});

module.exports = {
  getSystemStats,
  getAdminAccounts,
  getAuditLogs,
};
