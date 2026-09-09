/**
 * backend/src/controllers/paymentController.js
 * ----------------------------------------------------------------------------
 * HTTP handlers for `/api/payments/*` — payment records against finance plans
 * (spec §8 step 7: Manager/Admin/Super Admin record payments).
 *
 *  - create : superadmin (any), admin (any), assigned manager (assigned apps)
 *  - list   : superadmin/admin see all; manager sees assigned; customer sees
 *             own; legacy staff see all (read-only dashboards)
 *  - overdue: superadmin/admin/manager(assigned) — pending/overdue rows past
 *             their due date
 *
 * Recording a payment recomputes the parent application (`paidAmount`,
 * `remainingBalance`, `nextDueDate`) and moves FINANCE_SETUP →
 * PAYMENT_IN_PROGRESS on the first payment.
 * ----------------------------------------------------------------------------
 */
const asyncHandler = require('express-async-handler');
const { Op } = require('sequelize');
const { Payment, Application, User } = require('../models');
const { success, fail } = require('../utils/apiResponse');
const { ROLES } = require('../constants/roles');
const { APPLICATION_STATUS } = require('../constants/applicationStatus');
const { logAudit } = require('../utils/auditLogger');

/**
 * Row-level scope for payment list queries.
 */
const scopeWhere = (req) => {
  const role = req.user?.userType;
  if ([ROLES.SUPERADMIN, ROLES.ADMIN, ROLES.SALES, ROLES.TEAMLEAD, ROLES.EMPLOYEE].includes(role)) {
    return {};
  }
  if (role === ROLES.MANAGER) return { managerId: req.userId };
  return { customerId: req.userId };
};

const PAYMENT_INCLUDES = [
  {
    model: Application,
    as: 'application',
    attributes: ['id', 'status', 'carMake', 'carModel', 'totalPayable', 'remainingBalance'],
  },
  { model: User, as: 'customer', attributes: ['id', 'name', 'email'] },
];

/**
 * Advance the due date by one frequency step.
 */
const advanceDueDate = (from, frequency) => {
  const date = from ? new Date(from) : new Date();
  if (frequency === 'weekly') date.setDate(date.getDate() + 7);
  else if (frequency === 'quarterly') date.setMonth(date.getMonth() + 3);
  else if (frequency === 'yearly') date.setFullYear(date.getFullYear() + 1);
  else date.setMonth(date.getMonth() + 1);
  return date;
};

/**
 * GET /api/payments — scoped payment history. Optional `?applicationId=`.
 */
const listPayments = asyncHandler(async (req, res) => {
  const where = scopeWhere(req);
  if (req.query.applicationId) {
    const app = await Application.findByPk(req.query.applicationId);
    if (!app) return fail(res, { status: 404, message: 'Application not found' });
    // Customers/managers must own the application to see its payments.
    if (
      req.user?.userType === ROLES.CUSTOMER &&
      Number(app.customerId) !== Number(req.userId)
    ) {
      return fail(res, { status: 403, message: 'You cannot view these payments' });
    }
    if (
      req.user?.userType === ROLES.MANAGER &&
      Number(app.managerId) !== Number(req.userId)
    ) {
      return fail(res, { status: 403, message: 'You cannot view these payments' });
    }
    where.applicationId = req.query.applicationId;
  }
  const rows = await Payment.findAll({
    where,
    include: PAYMENT_INCLUDES,
    order: [['createdAt', 'DESC']],
  });
  return success(res, { message: 'Payments fetched', data: rows });
});

/**
 * GET /api/payments/overdue — pending/overdue rows past their due date.
 */
const listOverduePayments = asyncHandler(async (req, res) => {
  const role = req.user?.userType;
  if (![ROLES.SUPERADMIN, ROLES.ADMIN, ROLES.MANAGER].includes(role)) {
    return fail(res, { status: 403, message: 'You cannot view overdue payments' });
  }
  const where = {
    status: { [Op.in]: ['pending', 'overdue'] },
    dueDate: { [Op.lt]: new Date() },
  };
  if (role === ROLES.MANAGER) where.managerId = req.userId;
  const rows = await Payment.findAll({
    where,
    include: PAYMENT_INCLUDES,
    order: [['dueDate', 'ASC']],
  });
  return success(res, { message: 'Overdue payments fetched', data: rows });
});

/**
 * POST /api/payments — record a payment (spec §8 step 7).
 * Body: `{ applicationId, amount, method?, type?, dueDate?, paidAt?,
 *          receiptNo?, notes? }`
 */
const recordPayment = asyncHandler(async (req, res) => {
  const app = await Application.findByPk(req.body.applicationId);
  if (!app) return fail(res, { status: 404, message: 'Application not found' });

  const role = req.user?.userType;
  const isSuper = role === ROLES.SUPERADMIN;
  const isAdmin = role === ROLES.ADMIN;
  const isAssignedManager = role === ROLES.MANAGER && Number(app.managerId) === Number(req.userId);
  if (!isSuper && !isAdmin && !isAssignedManager) {
    return fail(res, { status: 403, message: 'You cannot record payments for this application' });
  }
  if (![APPLICATION_STATUS.FINANCE_SETUP, APPLICATION_STATUS.PAYMENT_IN_PROGRESS].includes(app.status)) {
    return fail(res, {
      status: 400,
      message: `Payments require a finance plan (current: ${app.status})`,
    });
  }

  const amount = Number(req.body.amount);
  if (!Number.isFinite(amount) || amount <= 0) {
    return fail(res, { status: 400, message: 'amount must be a number greater than 0' });
  }
  if (amount > Number(app.remainingBalance || 0) + 0.01 && Number(app.remainingBalance || 0) > 0) {
    return fail(res, { status: 400, message: 'amount exceeds the remaining balance' });
  }

  const payment = await Payment.create({
    applicationId: app.id,
    customerId: app.customerId,
    managerId: app.managerId,
    recordedBy: req.userId,
    amount,
    method: req.body.method || 'cash',
    type: req.body.type || 'installment',
    status: 'paid',
    dueDate: req.body.dueDate || app.nextDueDate || null,
    paidAt: req.body.paidAt || new Date(),
    receiptNo:
      req.body.receiptNo ||
      `RCP-${Date.now().toString(36).toUpperCase()}-${String(app.id).padStart(4, '0')}`,
    notes: req.body.notes || null,
  });

  const paidAmount = Number(app.paidAmount || 0) + amount;
  const remainingBalance = Math.max(0, Number(app.totalPayable || 0) - paidAmount);
  await app.update({
    paidAmount,
    remainingBalance,
    nextDueDate:
      remainingBalance > 0 ? advanceDueDate(app.nextDueDate, app.installmentFrequency) : null,
    status: APPLICATION_STATUS.PAYMENT_IN_PROGRESS,
  });

  await logAudit(req, 'payment.record', 'payment', payment.id, {
    applicationId: app.id,
    amount,
    paidAmount,
    remainingBalance,
  });
  return success(res, {
    status: 201,
    message: 'Payment recorded',
    data: { payment, paidAmount, remainingBalance },
  });
});

/**
 * PUT /api/payments/:id — correct a payment record (superadmin/admin only).
 * Totals are recomputed from the full payment history afterwards.
 */
const updatePayment = asyncHandler(async (req, res) => {
  if (![ROLES.SUPERADMIN, ROLES.ADMIN].includes(req.user?.userType)) {
    return fail(res, { status: 403, message: 'Only a superadmin or admin can correct payments' });
  }
  const payment = await Payment.findByPk(req.params.id);
  if (!payment) return fail(res, { status: 404, message: 'Payment not found' });

  const payload = {};
  for (const key of ['method', 'type', 'status', 'dueDate', 'paidAt', 'receiptNo', 'notes']) {
    if (req.body[key] !== undefined) payload[key] = req.body[key];
  }
  await payment.update(payload);

  const history = await Payment.findAll({
    where: { applicationId: payment.applicationId, status: 'paid' },
  });
  const paidAmount = history.reduce((sum, row) => sum + Number(row.amount || 0), 0);
  const app = await Application.findByPk(payment.applicationId);
  if (app) {
    await app.update({
      paidAmount,
      remainingBalance: Math.max(0, Number(app.totalPayable || 0) - paidAmount),
    });
  }
  await logAudit(req, 'payment.update', 'payment', payment.id, payload);
  return success(res, { message: 'Payment updated', data: payment });
});

module.exports = {
  listPayments,
  listOverduePayments,
  recordPayment,
  updatePayment,
};
