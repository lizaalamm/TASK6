/**
 * backend/src/controllers/applicationController.js
 * ----------------------------------------------------------------------------
 * HTTP handlers for every `/api/applications/*` endpoint — the
 * application-to-delivery pipeline (spec §8).
 *
 * Permission summary (ALL enforced here, never only in React):
 *  - create  : customer (own) or superadmin (for any customer)
 *  - list/get: superadmin + admin + legacy staff see all;
 *              manager sees ASSIGNED-only; customer sees OWN-only
 *  - review  : superadmin only (PENDING → APPROVED / REJECTED)
 *  - assign  : superadmin only (APPROVED → ASSIGNED, sets managerId)
 *  - verify  : assigned manager or superadmin (ASSIGNED → IN_PROCESS)
 *  - vehicle : assigned manager, owning customer or superadmin
 *              (IN_PROCESS → VEHICLE_SELECTED)
 *  - finance : assigned manager or superadmin
 *              (VEHICLE_SELECTED → FINANCE_SETUP)
 *  - ready   : assigned manager or superadmin
 *              (PAYMENT_IN_PROGRESS → READY_FOR_DELIVERY)
 *  - complete: superadmin only (READY_FOR_DELIVERY → COMPLETE)
 *  - resubmit: owning customer or superadmin (REJECTED → PENDING)
 *  - delete  : superadmin only, PENDING/REJECTED rows only
 * ----------------------------------------------------------------------------
 */
const asyncHandler = require('express-async-handler');
const { Op } = require('sequelize');
const { Application, User, Vehicle, Payment } = require('../models');
const { success, fail } = require('../utils/apiResponse');
const { ROLES } = require('../constants/roles');
const {
  APPLICATION_STATUS,
  normalizeStatus,
  canTransition,
} = require('../constants/applicationStatus');
const { logAudit } = require('../utils/auditLogger');

// Legacy staff roles keep read access to the pipeline (no privileged actions).
const PIPELINE_VIEW_ALL = [
  ROLES.SUPERADMIN,
  ROLES.ADMIN,
  ROLES.SALES,
  ROLES.TEAMLEAD,
  ROLES.EMPLOYEE,
  ROLES.INVENTORY,
];

/**
 * Row-level scope for list queries.
 * @param {import('express').Request} req - Authed request.
 * @returns {object} Sequelize `where` fragment.
 */
const scopeWhere = (req) => {
  const role = req.user?.userType;
  if (PIPELINE_VIEW_ALL.includes(role)) return {};
  if (role === ROLES.MANAGER) return { managerId: req.userId };
  return { customerId: req.userId }; // customer (and any unknown role): own only
};

/**
 * Check row-level access to ONE application.
 * @param {import('express').Request} req - Authed request.
 * @param {Application} app - Application row.
 * @returns {boolean} True when the requester may see/act on the row.
 */
const canAccessRow = (req, app) => {
  const role = req.user?.userType;
  if (PIPELINE_VIEW_ALL.includes(role)) return true;
  if (role === ROLES.MANAGER) return Number(app.managerId) === Number(req.userId);
  return Number(app.customerId) === Number(req.userId);
};

/**
 * Shape an application row for API responses (adds display names).
 * @param {Application} app - Application instance (plain or with includes).
 * @returns {object} JSON-safe payload.
 */
const serializeApplication = (app) => {
  const json = typeof app.toJSON === 'function' ? app.toJSON() : { ...app };
  if (json.customer) {
    json.customerName = json.customer.name;
    json.customerEmail = json.customer.email;
  }
  if (json.manager) {
    json.managerName = json.manager.name;
    json.managerEmail = json.manager.email;
  }
  if (json.vehicle) {
    json.vehicleLabel = `${json.vehicle.make} ${json.vehicle.model} ${json.vehicle.variant || ''}`.trim();
  }
  return json;
};

const APP_INCLUDES = [
  { model: User, as: 'customer', attributes: ['id', 'name', 'email', 'phone', 'cnic'] },
  { model: User, as: 'manager', attributes: ['id', 'name', 'email', 'phone'] },
  { model: Vehicle, as: 'vehicle' },
];

/**
 * GET /api/applications — scoped list with optional `?status=` filter.
 */
const listApplications = asyncHandler(async (req, res) => {
  const where = scopeWhere(req);
  if (req.query.status) {
    const status = normalizeStatus(req.query.status);
    if (status) where.status = status;
  }
  if (req.query.customerId && PIPELINE_VIEW_ALL.includes(req.user?.userType)) {
    where.customerId = req.query.customerId;
  }
  if (req.query.managerId && [ROLES.SUPERADMIN, ROLES.ADMIN].includes(req.user?.userType)) {
    where.managerId = req.query.managerId;
  }

  const rows = await Application.findAll({
    where,
    include: APP_INCLUDES,
    order: [['createdAt', 'DESC']],
  });
  return success(res, {
    message: 'Applications fetched',
    data: rows.map(serializeApplication),
  });
});

/**
 * GET /api/applications/stats — counts per status (same scope as list).
 */
const getApplicationStats = asyncHandler(async (req, res) => {
  const where = scopeWhere(req);
  const rows = await Application.findAll({ where, attributes: ['status'] });
  const byStatus = {};
  for (const row of rows) {
    byStatus[row.status] = (byStatus[row.status] || 0) + 1;
  }
  return success(res, {
    message: 'Application stats fetched',
    data: { total: rows.length, byStatus },
  });
});

/**
 * GET /api/applications/:id — one application + its payment history.
 */
const getApplicationById = asyncHandler(async (req, res) => {
  const app = await Application.findByPk(req.params.id, {
    include: [...APP_INCLUDES, { model: Payment, as: 'payments' }],
  });
  if (!app) return fail(res, { status: 404, message: 'Application not found' });
  if (!canAccessRow(req, app)) {
    return fail(res, { status: 403, message: 'You cannot view this application' });
  }
  return success(res, { message: 'Application fetched', data: serializeApplication(app) });
});

/**
 * POST /api/applications — submit an application (spec §8 step 1 → PENDING).
 * Customers create for themselves; superadmins may file for any customer.
 */
const createApplication = asyncHandler(async (req, res) => {
  const role = req.user?.userType;
  const isSuper = role === ROLES.SUPERADMIN;

  // Resolve the owning customer.
  let customerId = req.userId;
  if (req.body.customerId) {
    if (!isSuper && Number(req.body.customerId) !== Number(req.userId)) {
      return fail(res, { status: 403, message: 'You can only apply for yourself' });
    }
    customerId = req.body.customerId;
  } else if (role !== ROLES.CUSTOMER && !isSuper) {
    return fail(res, { status: 403, message: 'Only customers can submit applications' });
  }
  const customer = await User.findByPk(customerId);
  if (!customer) return fail(res, { status: 404, message: 'Customer not found' });

  const app = await Application.create({
    customerId,
    firstName: req.body.firstName || customer.firstName || null,
    lastName: req.body.lastName || customer.lastName || null,
    email: req.body.email || customer.email,
    phone: req.body.phone || customer.phone || null,
    cnic: req.body.cnic || customer.cnic || null,
    cnicFront: req.body.cnicFront || req.body.cnic_front || customer.cnic_front || null,
    cnicBack: req.body.cnicBack || req.body.cnic_back || customer.cnic_back || null,
    address: req.body.address || customer.address || null,
    city: req.body.city || customer.city || null,
    carMake: req.body.carMake || null,
    carModel: req.body.carModel || null,
    carVariant: req.body.carVariant || null,
    selectedColor: req.body.selectedColor || req.body.color || null,
    notes: req.body.notes || null,
    status: APPLICATION_STATUS.PENDING,
  });

  await logAudit(req, 'application.create', 'application', app.id, {
    customerId,
    status: app.status,
  });
  const created = await Application.findByPk(app.id, { include: APP_INCLUDES });
  return success(res, { status: 201, message: 'Application submitted', data: serializeApplication(created) });
});

/**
 * PUT /api/applications/:id — edit allowed fields.
 *  - Customers: own row, allowed fields only, while PENDING/REJECTED.
 *    (Cannot touch status, manager, vehicle or financial totals.)
 *  - Assigned manager: notes + applicant contact fields on assigned rows.
 *  - Superadmin: any non-pipeline field (pipeline moves use the step endpoints).
 */
const updateApplication = asyncHandler(async (req, res) => {
  const app = await Application.findByPk(req.params.id);
  if (!app) return fail(res, { status: 404, message: 'Application not found' });
  if (!canAccessRow(req, app)) {
    return fail(res, { status: 403, message: 'You cannot edit this application' });
  }

  const role = req.user?.userType;
  const isSuper = role === ROLES.SUPERADMIN;
  const isManager = role === ROLES.MANAGER && Number(app.managerId) === Number(req.userId);
  const isOwner =
    role === ROLES.CUSTOMER && Number(app.customerId) === Number(req.userId);

  if (!isSuper && !isManager && !isOwner) {
    return fail(res, { status: 403, message: 'You cannot edit this application' });
  }
  if (isOwner && ![APPLICATION_STATUS.PENDING, APPLICATION_STATUS.REJECTED].includes(app.status)) {
    return fail(res, {
      status: 403,
      message: 'You can only edit applications while they are pending or rejected',
    });
  }

  // Privileged fields are NEVER editable here — use the pipeline endpoints.
  const blocked = [
    'status',
    'managerId',
    'customerId',
    'vehicleId',
    'vehiclePrice',
    'downPayment',
    'installmentAmount',
    'installmentDuration',
    'installmentFrequency',
    'totalPayable',
    'paidAmount',
    'remainingBalance',
    'verified',
  ];
  const payload = {};
  const editable = [
    'firstName',
    'lastName',
    'email',
    'phone',
    'cnic',
    'cnicFront',
    'cnicBack',
    'address',
    'city',
    'selectedColor',
    'notes',
  ];
  for (const key of editable) {
    if (req.body[key] !== undefined) payload[key] = req.body[key];
  }
  if (isSuper || isManager) {
    if (req.body.carMake !== undefined) payload.carMake = req.body.carMake;
    if (req.body.carModel !== undefined) payload.carModel = req.body.carModel;
    if (req.body.carVariant !== undefined) payload.carVariant = req.body.carVariant;
  }
  void blocked;

  await app.update(payload);
  await logAudit(req, 'application.update', 'application', app.id, { fields: Object.keys(payload) });
  const updated = await Application.findByPk(app.id, { include: APP_INCLUDES });
  return success(res, { message: 'Application updated', data: serializeApplication(updated) });
});

/**
 * POST /api/applications/:id/review — Super Admin decision (spec §8 step 2).
 * Body: `{ decision: 'APPROVED' | 'REJECTED' | 'PENDING', rejectionReason? }`
 * `PENDING` keeps the row pending (review logged, no state change).
 */
const reviewApplication = asyncHandler(async (req, res) => {
  if (req.user?.userType !== ROLES.SUPERADMIN) {
    return fail(res, { status: 403, message: 'Only a superadmin can review applications' });
  }
  const app = await Application.findByPk(req.params.id);
  if (!app) return fail(res, { status: 404, message: 'Application not found' });

  const decision = normalizeStatus(req.body.decision);
  if (![APPLICATION_STATUS.APPROVED, APPLICATION_STATUS.REJECTED, APPLICATION_STATUS.PENDING].includes(decision)) {
    return fail(res, { status: 400, message: 'Decision must be APPROVED, REJECTED or PENDING' });
  }
  if (app.status !== APPLICATION_STATUS.PENDING && app.status !== decision) {
    return fail(res, {
      status: 400,
      message: `Only PENDING applications can be reviewed (current: ${app.status})`,
    });
  }

  if (decision === APPLICATION_STATUS.PENDING) {
    await logAudit(req, 'application.review', 'application', app.id, { decision });
    const current = await Application.findByPk(app.id, { include: APP_INCLUDES });
    return success(res, { message: 'Application kept pending', data: serializeApplication(current) });
  }

  const check = canTransition(app.status, decision, req.user.userType);
  if (!check.ok) return fail(res, { status: 400, message: check.reason });

  await app.update({
    status: decision,
    approvedAt: decision === APPLICATION_STATUS.APPROVED ? new Date() : app.approvedAt,
    approvedBy: decision === APPLICATION_STATUS.APPROVED ? req.userId : app.approvedBy,
    rejectionReason: decision === APPLICATION_STATUS.REJECTED ? req.body.rejectionReason || null : null,
  });
  await logAudit(req, 'application.review', 'application', app.id, {
    from: APPLICATION_STATUS.PENDING,
    to: decision,
    rejectionReason: app.rejectionReason,
  });
  const updated = await Application.findByPk(app.id, { include: APP_INCLUDES });
  return success(res, {
    message: `Application ${decision === 'APPROVED' ? 'approved' : 'rejected'}`,
    data: serializeApplication(updated),
  });
});

/**
 * POST /api/applications/:id/assign — Super Admin assigns a manager
 * (spec §8 step 3: APPROVED → ASSIGNED). Also stamps the customer's
 * `managerId` so the manager's assigned-only scope picks the customer up.
 * Body: `{ managerId }`
 */
const assignManager = asyncHandler(async (req, res) => {
  if (req.user?.userType !== ROLES.SUPERADMIN) {
    return fail(res, { status: 403, message: 'Only a superadmin can assign managers' });
  }
  const app = await Application.findByPk(req.params.id);
  if (!app) return fail(res, { status: 404, message: 'Application not found' });
  if (app.status !== APPLICATION_STATUS.APPROVED) {
    return fail(res, {
      status: 400,
      message: `Only APPROVED applications can be assigned (current: ${app.status})`,
    });
  }

  const manager = await User.findByPk(req.body.managerId);
  if (!manager || !['manager', 'superadmin'].includes(manager.userType)) {
    return fail(res, { status: 400, message: 'managerId must belong to a manager account' });
  }
  if (manager.status === 'inactive' || manager.isTerminated) {
    return fail(res, { status: 400, message: 'Cannot assign an inactive manager' });
  }

  const check = canTransition(app.status, APPLICATION_STATUS.ASSIGNED, req.user.userType);
  if (!check.ok) return fail(res, { status: 400, message: check.reason });

  await app.update({
    managerId: manager.id,
    status: APPLICATION_STATUS.ASSIGNED,
    assignedAt: new Date(),
    assignedBy: req.userId,
  });
  await User.update({ managerId: manager.id }, { where: { id: app.customerId } });
  await logAudit(req, 'application.assign', 'application', app.id, {
    managerId: manager.id,
    managerName: manager.name,
  });
  const updated = await Application.findByPk(app.id, { include: APP_INCLUDES });
  return success(res, { message: 'Manager assigned', data: serializeApplication(updated) });
});

/**
 * POST /api/applications/:id/verify — Manager verifies customer/documents
 * (spec §8 step 4: ASSIGNED → IN_PROCESS).
 */
const verifyApplication = asyncHandler(async (req, res) => {
  const app = await Application.findByPk(req.params.id);
  if (!app) return fail(res, { status: 404, message: 'Application not found' });

  const isSuper = req.user?.userType === ROLES.SUPERADMIN;
  const isAssignedManager =
    req.user?.userType === ROLES.MANAGER && Number(app.managerId) === Number(req.userId);
  if (!isSuper && !isAssignedManager) {
    return fail(res, { status: 403, message: 'Only the assigned manager can verify this application' });
  }
  const check = canTransition(app.status, APPLICATION_STATUS.IN_PROCESS, req.user.userType);
  if (!check.ok) return fail(res, { status: 400, message: check.reason });

  await app.update({
    status: APPLICATION_STATUS.IN_PROCESS,
    verified: true,
    verifiedAt: new Date(),
    verifiedBy: req.userId,
    notes: req.body.notes !== undefined ? req.body.notes : app.notes,
  });
  await logAudit(req, 'application.verify', 'application', app.id, { verified: true });
  const updated = await Application.findByPk(app.id, { include: APP_INCLUDES });
  return success(res, { message: 'Application verified', data: serializeApplication(updated) });
});

/**
 * POST /api/applications/:id/vehicle — Select the vehicle (spec §8 step 5:
 * IN_PROCESS → VEHICLE_SELECTED). Manager + customer agree on an available
 * vehicle; stock is decremented on selection.
 * Body: `{ vehicleId, selectedColor? }`
 */
const selectVehicle = asyncHandler(async (req, res) => {
  const app = await Application.findByPk(req.params.id);
  if (!app) return fail(res, { status: 404, message: 'Application not found' });

  const role = req.user?.userType;
  const isSuper = role === ROLES.SUPERADMIN;
  const isAssignedManager = role === ROLES.MANAGER && Number(app.managerId) === Number(req.userId);
  const isOwner = role === ROLES.CUSTOMER && Number(app.customerId) === Number(req.userId);
  if (!isSuper && !isAssignedManager && !isOwner) {
    return fail(res, { status: 403, message: 'You cannot select a vehicle for this application' });
  }
  const check = canTransition(app.status, APPLICATION_STATUS.VEHICLE_SELECTED, role);
  if (!check.ok) return fail(res, { status: 400, message: check.reason });

  const vehicle = await Vehicle.findByPk(req.body.vehicleId);
  if (!vehicle) return fail(res, { status: 404, message: 'Vehicle not found' });
  if (vehicle.status !== 'Available' || vehicle.stockQuantity <= 0) {
    return fail(res, { status: 400, message: 'Selected vehicle is not available in stock' });
  }

  await app.update({
    vehicleId: vehicle.id,
    carMake: vehicle.make,
    carModel: vehicle.model,
    carVariant: vehicle.variant,
    carYear: vehicle.year,
    carImage: Array.isArray(vehicle.images) ? vehicle.images[0] || null : null,
    vehiclePrice: vehicle.sellingPrice,
    selectedColor: req.body.selectedColor || app.selectedColor || null,
    totalPayable: vehicle.sellingPrice,
    remainingBalance: vehicle.sellingPrice - (app.paidAmount || 0),
    status: APPLICATION_STATUS.VEHICLE_SELECTED,
  });
  await vehicle.update({ stockQuantity: Math.max(0, vehicle.stockQuantity - 1) });
  await logAudit(req, 'application.selectVehicle', 'application', app.id, {
    vehicleId: vehicle.id,
    vehiclePrice: vehicle.sellingPrice,
  });
  const updated = await Application.findByPk(app.id, { include: APP_INCLUDES });
  return success(res, { message: 'Vehicle selected', data: serializeApplication(updated) });
});

/**
 * POST /api/applications/:id/finance — Configure the finance plan
 * (spec §8 step 6: VEHICLE_SELECTED → FINANCE_SETUP).
 * Body: `{ downPayment, installmentAmount, installmentDuration,
 *          installmentFrequency? }`
 */
const setupFinance = asyncHandler(async (req, res) => {
  const app = await Application.findByPk(req.params.id);
  if (!app) return fail(res, { status: 404, message: 'Application not found' });

  const isSuper = req.user?.userType === ROLES.SUPERADMIN;
  const isAssignedManager =
    req.user?.userType === ROLES.MANAGER && Number(app.managerId) === Number(req.userId);
  if (!isSuper && !isAssignedManager) {
    return fail(res, { status: 403, message: 'Only the assigned manager can set up finance' });
  }
  const check = canTransition(app.status, APPLICATION_STATUS.FINANCE_SETUP, req.user.userType);
  if (!check.ok) return fail(res, { status: 400, message: check.reason });

  const downPayment = Number(req.body.downPayment);
  const installmentAmount = Number(req.body.installmentAmount);
  const installmentDuration = Number(req.body.installmentDuration);
  const installmentFrequency = req.body.installmentFrequency || 'monthly';
  if (![downPayment, installmentAmount, installmentDuration].every((n) => Number.isFinite(n) && n >= 0)) {
    return fail(res, { status: 400, message: 'downPayment, installmentAmount and installmentDuration must be numbers >= 0' });
  }
  if (!['monthly', 'quarterly', 'yearly', 'weekly'].includes(installmentFrequency)) {
    return fail(res, { status: 400, message: 'installmentFrequency must be weekly, monthly, quarterly or yearly' });
  }
  const vehiclePrice = Number(app.vehiclePrice || 0);
  if (vehiclePrice > 0 && downPayment > vehiclePrice) {
    return fail(res, { status: 400, message: 'Down payment cannot exceed the vehicle price' });
  }

  const totalPayable = vehiclePrice > 0 ? vehiclePrice : downPayment + installmentAmount * installmentDuration;
  const paidAmount = Number(app.paidAmount || 0);
  const nextDueDate = new Date();
  nextDueDate.setMonth(nextDueDate.getMonth() + 1);

  await app.update({
    downPayment,
    installmentAmount,
    installmentDuration,
    installmentFrequency,
    totalPayable,
    paidAmount,
    remainingBalance: Math.max(0, totalPayable - paidAmount),
    nextDueDate,
    status: APPLICATION_STATUS.FINANCE_SETUP,
  });
  await logAudit(req, 'application.finance', 'application', app.id, {
    downPayment,
    installmentAmount,
    installmentDuration,
    installmentFrequency,
    totalPayable,
  });
  const updated = await Application.findByPk(app.id, { include: APP_INCLUDES });
  return success(res, { message: 'Finance plan configured', data: serializeApplication(updated) });
});

/**
 * POST /api/applications/:id/ready — Conditions met (spec §8 step 8:
 * PAYMENT_IN_PROGRESS → READY_FOR_DELIVERY). Requires the down payment
 * to be fully covered.
 */
const markReadyForDelivery = asyncHandler(async (req, res) => {
  const app = await Application.findByPk(req.params.id);
  if (!app) return fail(res, { status: 404, message: 'Application not found' });

  const isSuper = req.user?.userType === ROLES.SUPERADMIN;
  const isAssignedManager =
    req.user?.userType === ROLES.MANAGER && Number(app.managerId) === Number(req.userId);
  if (!isSuper && !isAssignedManager) {
    return fail(res, { status: 403, message: 'Only the assigned manager can mark readiness' });
  }
  const check = canTransition(app.status, APPLICATION_STATUS.READY_FOR_DELIVERY, req.user.userType);
  if (!check.ok) return fail(res, { status: 400, message: check.reason });
  if (Number(app.paidAmount || 0) < Number(app.downPayment || 0)) {
    return fail(res, { status: 400, message: 'Down payment must be fully paid before delivery' });
  }

  await app.update({ status: APPLICATION_STATUS.READY_FOR_DELIVERY });
  await logAudit(req, 'application.ready', 'application', app.id, {
    paidAmount: app.paidAmount,
    remainingBalance: app.remainingBalance,
  });
  const updated = await Application.findByPk(app.id, { include: APP_INCLUDES });
  return success(res, { message: 'Application ready for delivery', data: serializeApplication(updated) });
});

/**
 * POST /api/applications/:id/complete — Super Admin completes the order
 * (spec §8 step 9: READY_FOR_DELIVERY → COMPLETE).
 */
const completeApplication = asyncHandler(async (req, res) => {
  if (req.user?.userType !== ROLES.SUPERADMIN) {
    return fail(res, { status: 403, message: 'Only a superadmin can complete orders' });
  }
  const app = await Application.findByPk(req.params.id);
  if (!app) return fail(res, { status: 404, message: 'Application not found' });
  const check = canTransition(app.status, APPLICATION_STATUS.COMPLETE, req.user.userType);
  if (!check.ok) return fail(res, { status: 400, message: check.reason });

  await app.update({ status: APPLICATION_STATUS.COMPLETE, completedAt: new Date(), completedBy: req.userId });
  await logAudit(req, 'application.complete', 'application', app.id, {
    totalPayable: app.totalPayable,
    paidAmount: app.paidAmount,
  });
  const updated = await Application.findByPk(app.id, { include: APP_INCLUDES });
  return success(res, { message: 'Order completed', data: serializeApplication(updated) });
});

/**
 * POST /api/applications/:id/resubmit — Customer resubmits a rejected
 * application (REJECTED → PENDING).
 */
const resubmitApplication = asyncHandler(async (req, res) => {
  const app = await Application.findByPk(req.params.id);
  if (!app) return fail(res, { status: 404, message: 'Application not found' });

  const isSuper = req.user?.userType === ROLES.SUPERADMIN;
  const isOwner = Number(app.customerId) === Number(req.userId);
  if (!isSuper && !isOwner) {
    return fail(res, { status: 403, message: 'You cannot resubmit this application' });
  }
  const check = canTransition(app.status, APPLICATION_STATUS.PENDING, req.user.userType);
  if (!check.ok) return fail(res, { status: 400, message: check.reason });

  await app.update({ status: APPLICATION_STATUS.PENDING, rejectionReason: null });
  await logAudit(req, 'application.resubmit', 'application', app.id, {});
  const updated = await Application.findByPk(app.id, { include: APP_INCLUDES });
  return success(res, { message: 'Application resubmitted', data: serializeApplication(updated) });
});

/**
 * DELETE /api/applications/:id — superadmin-only, PENDING/REJECTED rows only.
 */
const deleteApplication = asyncHandler(async (req, res) => {
  if (req.user?.userType !== ROLES.SUPERADMIN) {
    return fail(res, { status: 403, message: 'Only a superadmin can delete applications' });
  }
  const app = await Application.findByPk(req.params.id);
  if (!app) return fail(res, { status: 404, message: 'Application not found' });
  if (![APPLICATION_STATUS.PENDING, APPLICATION_STATUS.REJECTED].includes(app.status)) {
    return fail(res, { status: 400, message: 'Only PENDING or REJECTED applications can be deleted' });
  }
  await app.destroy();
  await logAudit(req, 'application.delete', 'application', req.params.id, {});
  return success(res, { message: 'Application deleted', data: { id: Number(req.params.id) } });
});

/**
 * GET /api/applications/overdue/list — applications past due with a balance.
 * Superadmin/admin see all; managers see their assigned slice.
 */
const listOverdueApplications = asyncHandler(async (req, res) => {
  const role = req.user?.userType;
  if (![ROLES.SUPERADMIN, ROLES.ADMIN, ROLES.MANAGER].includes(role)) {
    return fail(res, { status: 403, message: 'You cannot view overdue installments' });
  }
  const where = {
    remainingBalance: { [Op.gt]: 0 },
    nextDueDate: { [Op.lt]: new Date() },
    status: {
      [Op.in]: [APPLICATION_STATUS.PAYMENT_IN_PROGRESS, APPLICATION_STATUS.FINANCE_SETUP],
    },
  };
  if (role === ROLES.MANAGER) where.managerId = req.userId;
  const rows = await Application.findAll({
    where,
    include: APP_INCLUDES,
    order: [['nextDueDate', 'ASC']],
  });
  return success(res, {
    message: 'Overdue applications fetched',
    data: rows.map(serializeApplication),
  });
});

module.exports = {
  listApplications,
  getApplicationStats,
  getApplicationById,
  createApplication,
  updateApplication,
  reviewApplication,
  assignManager,
  verifyApplication,
  selectVehicle,
  setupFinance,
  markReadyForDelivery,
  completeApplication,
  resubmitApplication,
  deleteApplication,
  listOverdueApplications,
};
