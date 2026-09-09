/**
 * backend/src/routes/paymentRoutes.js
 * ----------------------------------------------------------------------------
 * Payment endpoints, mounted as `/api/payments/*` in app.js.
 *
 *   GET /             scoped payment history (?applicationId=)
 *   GET /overdue      past-due pending/overdue rows
 *   POST /            record a payment (superadmin/admin/assigned manager)
 *   PUT /:id          correct a record (superadmin/admin only)
 *
 * Every route requires auth; row-level scoping (all / assigned / own) is
 * enforced in the controller (see paymentController.js).
 * ----------------------------------------------------------------------------
 */
const express = require('express');
const {
  listPayments,
  listOverduePayments,
  recordPayment,
  updatePayment,
} = require('../controllers/paymentController');
const { isAuthenticated } = require('../middleware/authMiddleware');
const {
  idParamValidator,
  recordPaymentValidator,
  updatePaymentValidator,
} = require('../validators/paymentValidators');

const router = express.Router();

router.use(isAuthenticated);

router.get('/', listPayments);
router.get('/overdue', listOverduePayments);
router.post('/', recordPaymentValidator, recordPayment);
router.put('/:id', updatePaymentValidator, updatePayment);

module.exports = router;
