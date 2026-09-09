/**
 * backend/src/validators/vehicleValidators.js
 * ----------------------------------------------------------------------------
 * express-validator chains for `/api/vehicles/*` (spec §4 catalogue fields:
 * make, model, year, variant, price, stock/availability, status).
 * ----------------------------------------------------------------------------
 */
const { body, param } = require('express-validator');
const { validate } = require('../middleware/validateMiddleware');

/** `:id` route param must be a positive integer vehicle id. */
const idParamValidator = [
  param('id').isInt({ min: 1 }).withMessage('Valid vehicle id is required'),
  validate,
];

/** POST /api/vehicles — catalogue entry creation. */
const createVehicleValidator = [
  body('make').trim().notEmpty().withMessage('make is required').isLength({ max: 255 }),
  body('model').trim().notEmpty().withMessage('model is required').isLength({ max: 255 }),
  body('year')
    .isInt({ min: 1990, max: 2100 })
    .withMessage('year must be a valid year'),
  body('sellingPrice').optional().isFloat({ min: 0 }).withMessage('sellingPrice must be >= 0'),
  body('price').optional().isFloat({ min: 0 }).withMessage('price must be >= 0'),
  body('purchaseRate').optional().isFloat({ min: 0 }).withMessage('purchaseRate must be >= 0'),
  body('stockQuantity').optional().isInt({ min: 0 }).withMessage('stockQuantity must be >= 0'),
  body('status')
    .optional()
    .isIn(['Available', 'Reserved', 'Sold', 'Inactive'])
    .withMessage('Invalid vehicle status'),
  validate,
];

/** PUT /api/vehicles/:id — every field optional, validated when present. */
const updateVehicleValidator = [
  param('id').isInt({ min: 1 }).withMessage('Valid vehicle id is required'),
  body('year').optional().isInt({ min: 1990, max: 2100 }).withMessage('year must be a valid year'),
  body('sellingPrice').optional().isFloat({ min: 0 }).withMessage('sellingPrice must be >= 0'),
  body('price').optional().isFloat({ min: 0 }).withMessage('price must be >= 0'),
  body('purchaseRate').optional().isFloat({ min: 0 }).withMessage('purchaseRate must be >= 0'),
  body('stockQuantity').optional().isInt({ min: 0 }).withMessage('stockQuantity must be >= 0'),
  body('status')
    .optional()
    .isIn(['Available', 'Reserved', 'Sold', 'Inactive'])
    .withMessage('Invalid vehicle status'),
  validate,
];

module.exports = {
  idParamValidator,
  createVehicleValidator,
  updateVehicleValidator,
};
