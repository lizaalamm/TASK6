/**
 * backend/src/validators/paymentValidators.js
 * ----------------------------------------------------------------------------
 * express-validator chains for `/api/payments/*` (spec §8 step 7).
 * ----------------------------------------------------------------------------
 */
const { body, param } = require('express-validator');
const { validate } = require('../middleware/validateMiddleware');

/** `:id` route param must be a positive integer payment id. */
const idParamValidator = [
  param('id').isInt({ min: 1 }).withMessage('Valid payment id is required'),
  validate,
];

/** POST /api/payments — record a payment against an application. */
const recordPaymentValidator = [
  body('applicationId').isInt({ min: 1 }).withMessage('Valid applicationId is required'),
  body('amount').isFloat({ min: 0.01 }).withMessage('amount must be greater than 0'),
  body('method')
    .optional()
    .isIn(['cash', 'bank_transfer', 'cheque', 'online', 'other'])
    .withMessage('Invalid payment method'),
  body('type')
    .optional()
    .isIn(['down_payment', 'installment', 'other'])
    .withMessage('Invalid payment type'),
  validate,
];

/** PUT /api/payments/:id — correct a payment record. */
const updatePaymentValidator = [
  param('id').isInt({ min: 1 }).withMessage('Valid payment id is required'),
  body('method')
    .optional()
    .isIn(['cash', 'bank_transfer', 'cheque', 'online', 'other'])
    .withMessage('Invalid payment method'),
  body('type')
    .optional()
    .isIn(['down_payment', 'installment', 'other'])
    .withMessage('Invalid payment type'),
  body('status')
    .optional()
    .isIn(['paid', 'pending', 'overdue'])
    .withMessage('Invalid payment status'),
  validate,
];

module.exports = {
  idParamValidator,
  recordPaymentValidator,
  updatePaymentValidator,
};
