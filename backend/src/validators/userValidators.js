/**
 * backend/src/validators/userValidators.js
 * ----------------------------------------------------------------------------
 * express-validator chains for every user endpoint. Each chain ends with the
 * shared `validate` middleware, which returns a 422 response listing ALL
 * field errors when validation fails — so controllers only see clean input.
 * ----------------------------------------------------------------------------
 */
const { body, param } = require('express-validator');
const { validate } = require('../middleware/validateMiddleware');
const { ALLOWED_TYPES } = require('../constants/roles');

// Re-export so routes/tests can reference the same list.
const USER_TYPES = ALLOWED_TYPES;

/** POST /api/users/register — public sign-up fields. */
const registerValidator = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 500 }),
  body('email').trim().isEmail().withMessage('Valid email is required').isLength({ max: 500 }).normalizeEmail(),
  body('password').isLength({ min: 8, max: 128 }).withMessage('Password must be between 8 and 128 characters'),
  validate,
];

/** POST /api/users/login — credential pair. */
const loginValidator = [
  body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
  validate,
];

/** POST /api/users/user — staff-created account (admin+). */
const createUserValidator = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 500 }),
  body('email').trim().isEmail().withMessage('Valid email is required').isLength({ max: 500 }).normalizeEmail(),
  body('password').isLength({ min: 8, max: 128 }).withMessage('Password must be between 8 and 128 characters'),
  body('userType').optional().isIn(USER_TYPES).withMessage('Invalid user type'),
  body('role').optional().isIn(USER_TYPES).withMessage('Invalid role'),
  validate,
];

/** PUT /api/users/user[/:id] — every field optional, validated when present. */
const updateUserValidator = [
  body('name').optional().trim().notEmpty().withMessage('Name is required').isLength({ max: 500 }),
  body('email').optional().trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').optional({ checkFalsy: true }).isLength({ min: 8, max: 128 }).withMessage('Password must be between 8 and 128 characters'),
  body('userType').optional().isIn(USER_TYPES),
  body('status').optional().isIn(['active', 'inactive', 'Active', 'Inactive']),
  validate,
];

/** `:id` route param must be a positive integer user id. */
const idParamValidator = [
  param('id').isInt({ min: 1 }).withMessage('Valid user id is required'),
  validate,
];

/** `:teamLeadId` route param must be a positive integer user id. */
const teamLeadParamValidator = [
  param('teamLeadId').isInt({ min: 1 }).withMessage('Valid team lead id is required'),
  validate,
];

module.exports = {
  USER_TYPES,
  registerValidator,
  loginValidator,
  createUserValidator,
  updateUserValidator,
  idParamValidator,
  teamLeadParamValidator,
};
