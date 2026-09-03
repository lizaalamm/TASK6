const { body, param } = require('express-validator');
const { validate } = require('../middleware/validateMiddleware');

const USER_TYPES = ['admin', 'employee', 'teamlead', 'sales', 'inventory', 'customer'];

const registerValidator = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 500 }),
  body('email').trim().isEmail().withMessage('Valid email is required').isLength({ max: 500 }).normalizeEmail(),
  body('password').isLength({ min: 8, max: 128 }).withMessage('Password must be between 8 and 128 characters'),
  validate,
];

const loginValidator = [
  body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
  validate,
];

const createUserValidator = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 500 }),
  body('email').trim().isEmail().withMessage('Valid email is required').isLength({ max: 500 }).normalizeEmail(),
  body('password').isLength({ min: 8, max: 128 }).withMessage('Password must be between 8 and 128 characters'),
  body('userType').optional().isIn(USER_TYPES).withMessage('Invalid user type'),
  body('role').optional().isIn(USER_TYPES).withMessage('Invalid role'),
  validate,
];

const updateUserValidator = [
  body('name').optional().trim().notEmpty().withMessage('Name is required').isLength({ max: 500 }),
  body('email').optional().trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').optional({ checkFalsy: true }).isLength({ min: 8, max: 128 }).withMessage('Password must be between 8 and 128 characters'),
  body('userType').optional().isIn(USER_TYPES),
  body('status').optional().isIn(['active', 'inactive', 'Active', 'Inactive']),
  validate,
];

const idParamValidator = [
  param('id').isInt({ min: 1 }).withMessage('Valid user id is required'),
  validate,
];

const teamLeadParamValidator = [
  param('teamLeadId').isInt({ min: 1 }).withMessage('Valid team lead id is required'),
  validate,
];

module.exports = {
  registerValidator,
  loginValidator,
  createUserValidator,
  updateUserValidator,
  idParamValidator,
  teamLeadParamValidator,
};
