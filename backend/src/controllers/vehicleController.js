/**
 * backend/src/controllers/vehicleController.js
 * ----------------------------------------------------------------------------
 * HTTP handlers for every `/api/vehicles/*` endpoint — the vehicle catalogue
 * (spec §4: make, model, year, variant, price, stock/availability, status).
 *
 * Permission summary (permission matrix + row scoping, enforced here):
 *  - create / update : superadmin (FULL), admin (LIMITED), inventory
 *  - delete          : superadmin only
 *  - list / get      : all authenticated users; customers only see
 *                      Available vehicles with stock > 0
 * ----------------------------------------------------------------------------
 */
const asyncHandler = require('express-async-handler');
const { Op } = require('sequelize');
const { Vehicle } = require('../models');
const { success, fail } = require('../utils/apiResponse');
const { ROLES } = require('../constants/roles');
const { PERMISSIONS, can } = require('../constants/permissions');
const { logAudit } = require('../utils/auditLogger');

const VEHICLE_FIELDS = [
  'make',
  'model',
  'year',
  'variant',
  'sellingPrice',
  'purchaseRate',
  'stockQuantity',
  'status',
  'fuel',
  'transmission',
  'mileage',
  'engine',
  'availableColors',
  'images',
  'description',
  'supplierId',
  'supplierName',
];

/**
 * Pick only known vehicle columns from the request body.
 * @param {object} body - Raw request body.
 * @returns {object} Clean payload.
 */
const buildVehiclePayload = (body) => {
  const payload = {};
  for (const key of VEHICLE_FIELDS) {
    if (body[key] !== undefined) payload[key] = body[key];
  }
  // Legacy alias: `price` → `sellingPrice`.
  if (payload.sellingPrice === undefined && body.price !== undefined) {
    payload.sellingPrice = body.price;
  }
  return payload;
};

/**
 * GET /api/vehicles — catalogue list with optional filters.
 * Query: `?search=&status=&available=1&minPrice=&maxPrice=&year=&fuel=`
 * Customers are force-scoped to Available + in-stock rows.
 */
const listVehicles = asyncHandler(async (req, res) => {
  const { search, status, minPrice, maxPrice, year, fuel, available } = req.query;
  const where = {};

  if (req.user?.userType === ROLES.CUSTOMER || available === '1' || available === 'true') {
    where.status = 'Available';
    where.stockQuantity = { [Op.gt]: 0 };
  }
  if (status && req.user?.userType !== ROLES.CUSTOMER) where.status = status;
  if (minPrice) where.sellingPrice = { ...(where.sellingPrice || {}), [Op.gte]: Number(minPrice) };
  if (maxPrice) where.sellingPrice = { ...(where.sellingPrice || {}), [Op.lte]: Number(maxPrice) };
  if (year) where.year = Number(year);
  if (fuel) where.fuel = fuel;
  if (search) {
    where[Op.or] = [
      { make: { [Op.like]: `%${search}%` } },
      { model: { [Op.like]: `%${search}%` } },
      { variant: { [Op.like]: `%${search}%` } },
    ];
  }

  const rows = await Vehicle.findAll({ where, order: [['createdAt', 'DESC']] });
  return success(res, { message: 'Vehicles fetched', data: rows });
});

/**
 * GET /api/vehicles/:id — one vehicle.
 * Customers can only open Available + in-stock vehicles.
 */
const getVehicleById = asyncHandler(async (req, res) => {
  const vehicle = await Vehicle.findByPk(req.params.id);
  if (!vehicle) return fail(res, { status: 404, message: 'Vehicle not found' });
  if (
    req.user?.userType === ROLES.CUSTOMER &&
    (vehicle.status !== 'Available' || vehicle.stockQuantity <= 0)
  ) {
    return fail(res, { status: 403, message: 'This vehicle is not available' });
  }
  return success(res, { message: 'Vehicle fetched', data: vehicle });
});

/**
 * POST /api/vehicles — add a catalogue vehicle (superadmin/admin/inventory).
 */
const createVehicle = asyncHandler(async (req, res) => {
  if (!can(req.user?.userType, PERMISSIONS.VEHICLES_CREATE)) {
    return fail(res, { status: 403, message: 'You cannot add vehicles' });
  }
  const vehicle = await Vehicle.create(buildVehiclePayload(req.body));
  await logAudit(req, 'vehicle.create', 'vehicle', vehicle.id, {
    label: `${vehicle.make} ${vehicle.model}`,
  });
  return success(res, { status: 201, message: 'Vehicle created', data: vehicle });
});

/**
 * PUT /api/vehicles/:id — update a vehicle (superadmin/admin/inventory).
 */
const updateVehicle = asyncHandler(async (req, res) => {
  if (!can(req.user?.userType, PERMISSIONS.VEHICLES_UPDATE)) {
    return fail(res, { status: 403, message: 'You cannot update vehicles' });
  }
  const vehicle = await Vehicle.findByPk(req.params.id);
  if (!vehicle) return fail(res, { status: 404, message: 'Vehicle not found' });
  await vehicle.update(buildVehiclePayload(req.body));
  await logAudit(req, 'vehicle.update', 'vehicle', vehicle.id, {});
  return success(res, { message: 'Vehicle updated', data: vehicle });
});

/**
 * DELETE /api/vehicles/:id — remove a vehicle (superadmin only).
 */
const deleteVehicle = asyncHandler(async (req, res) => {
  if (!can(req.user?.userType, PERMISSIONS.VEHICLES_DELETE)) {
    return fail(res, { status: 403, message: 'Only a superadmin can delete vehicles' });
  }
  const vehicle = await Vehicle.findByPk(req.params.id);
  if (!vehicle) return fail(res, { status: 404, message: 'Vehicle not found' });
  await vehicle.destroy();
  await logAudit(req, 'vehicle.delete', 'vehicle', req.params.id, {});
  return success(res, { message: 'Vehicle deleted', data: { id: Number(req.params.id) } });
});

module.exports = {
  listVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle,
};
