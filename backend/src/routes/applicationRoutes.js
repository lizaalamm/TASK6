/**
 * backend/src/routes/applicationRoutes.js
 * ----------------------------------------------------------------------------
 * Application pipeline endpoints, mounted as `/api/applications/*` in app.js.
 *
 *   GET    /                        scoped list (?status=&customerId=&managerId=)
 *   GET    /stats                   counts per status (same scope)
 *   GET    /overdue/list            past-due applications with a balance
 *   GET    /:id                     one application + payment history
 *   POST   /                        submit application → PENDING
 *   PUT    /:id                     edit allowed fields
 *   POST   /:id/review              superadmin: APPROVED / REJECTED / PENDING
 *   POST   /:id/assign              superadmin: assign manager → ASSIGNED
 *   POST   /:id/verify              manager: verify docs → IN_PROCESS
 *   POST   /:id/vehicle             manager/customer: select → VEHICLE_SELECTED
 *   POST   /:id/finance             manager: finance plan → FINANCE_SETUP
 *   POST   /:id/ready               manager: conditions met → READY_FOR_DELIVERY
 *   POST   /:id/complete            superadmin: complete order → COMPLETE
 *   POST   /:id/resubmit            customer: REJECTED → PENDING
 *   DELETE /:id                     superadmin: delete PENDING/REJECTED only
 *
 * Every route requires auth; role + transition rules are enforced in the
 * controller (see applicationController.js + applicationStatus.js).
 * ----------------------------------------------------------------------------
 */
const express = require('express');
const {
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
} = require('../controllers/applicationController');
const { isAuthenticated, requireSuperAdmin } = require('../middleware/authMiddleware');
const {
  idParamValidator,
  createApplicationValidator,
  updateApplicationValidator,
  reviewValidator,
  assignValidator,
  selectVehicleValidator,
  financeValidator,
} = require('../validators/applicationValidators');

const router = express.Router();

// Everything below requires a logged-in user.
router.use(isAuthenticated);

router.get('/', listApplications);
router.get('/stats', getApplicationStats);
router.get('/overdue/list', listOverdueApplications);
router.get('/:id', idParamValidator, getApplicationById);
router.post('/', createApplicationValidator, createApplication);
router.put('/:id', updateApplicationValidator, updateApplication);
router.post('/:id/review', reviewValidator, reviewApplication);
router.post('/:id/assign', assignValidator, assignManager);
router.post('/:id/verify', idParamValidator, verifyApplication);
router.post('/:id/vehicle', selectVehicleValidator, selectVehicle);
router.post('/:id/finance', financeValidator, setupFinance);
router.post('/:id/ready', idParamValidator, markReadyForDelivery);
router.post('/:id/complete', idParamValidator, completeApplication);
router.post('/:id/resubmit', idParamValidator, resubmitApplication);
router.delete('/:id', idParamValidator, requireSuperAdmin, deleteApplication);

module.exports = router;
