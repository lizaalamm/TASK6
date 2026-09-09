/**
 * backend/src/validators/applicationValidators.js
 * ----------------------------------------------------------------------------
 * express-validator chains for `/api/applications/*`. Each chain ends with
 * the shared `validate` middleware (422 on failure) so controllers only see
 * clean input. Role + transition rules live in the controller — validators
 * only check shapes and value formats.
 * ----------------------------------------------------------------------------
 */
const { body, param } = require('express-validator');
const { validate } = require('../middleware/validateMiddleware');

/** `:id` route param must be a positive integer application id. */
const idParamValidator = [
  param('id').isInt({ min: 1 }).withMessage('Valid application id is required'),
  validate,
];

/** POST /api/applications — customer submission (spec §7 allowed fields). */
const createApplicationValidator = [
  body('customerId').optional().isInt({ min: 1 }).withMessage('customerId must be a positive integer'),
  body('firstName').optional().trim().isLength({ max: 255 }),
  body('lastName').optional().trim().isLength({ max: 255 }),
  body('email').optional().trim().isEmail().withMessage('Valid email is required'),
  body('cnic')
    .optional({ checkFalsy: true })
    .matches(/^\d{5}-\d{7}-\d{1}$|^\d{13}$/)
    .withMessage('CNIC must be XXXXX-XXXXXXX-X or 13 digits'),
  validate,
];

/** PUT /api/applications/:id — every field optional, validated when present. */
const updateApplicationValidator = [
  param('id').isInt({ min: 1 }).withMessage('Valid application id is required'),
  body('email').optional().trim().isEmail().withMessage('Valid email is required'),
  body('cnic')
    .optional({ checkFalsy: true })
    .matches(/^\d{5}-\d{7}-\d{1}$|^\d{13}$/)
    .withMessage('CNIC must be XXXXX-XXXXXXX-X or 13 digits'),
  validate,
];

/** POST /:id/review — superadmin decision. */
const reviewValidator = [
  param('id').isInt({ min: 1 }).withMessage('Valid application id is required'),
  body('decision').trim().notEmpty().withMessage('decision is required'),
  validate,
];

/** POST /:id/assign — superadmin manager assignment. */
const assignValidator = [
  param('id').isInt({ min: 1 }).withMessage('Valid application id is required'),
  body('managerId').isInt({ min: 1 }).withMessage('Valid managerId is required'),
  validate,
];

/** POST /:id/vehicle — vehicle selection. */
const selectVehicleValidator = [
  param('id').isInt({ min: 1 }).withMessage('Valid application id is required'),
  body('vehicleId').isInt({ min: 1 }).withMessage('Valid vehicleId is required'),
  validate,
];

/** POST /:id/finance — finance plan configuration. */
const financeValidator = [
  param('id').isInt({ min: 1 }).withMessage('Valid application id is required'),
  body('downPayment').isFloat({ min: 0 }).withMessage('downPayment must be >= 0'),
  body('installmentAmount').isFloat({ min: 0 }).withMessage('installmentAmount must be >= 0'),
  body('installmentDuration').isInt({ min: 0 }).withMessage('installmentDuration must be >= 0'),
  body('installmentFrequency')
    .optional()
    .isIn(['weekly', 'monthly', 'quarterly', 'yearly'])
    .withMessage('installmentFrequency must be weekly, monthly, quarterly or yearly'),
  validate,
];

module.exports = {
  idParamValidator,
  createApplicationValidator,
  updateApplicationValidator,
  reviewValidator,
  assignValidator,
  selectVehicleValidator,
  financeValidator,
};
