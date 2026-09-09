/**
 * backend/src/routes/adminRoutes.js
 * ----------------------------------------------------------------------------
 * Superadmin-only API surface, mounted as `/api/admin/*` in app.js.
 *
 *   GET /api/admin/stats  → platform counts + per-role breakdown
 *   GET /api/admin/admins → leadership accounts (superadmin + admin)
 *
 * Guard chain on every route: `isAuthenticated` → `requireSuperAdmin`.
 * ----------------------------------------------------------------------------
 */
const express = require('express');
const {
  getSystemStats,
  getAdminAccounts,
  getAuditLogs,
} = require('../controllers/adminController');
const {
  isAuthenticated,
  requireSuperAdmin,
} = require('../middleware/authMiddleware');

const router = express.Router();

// Everything below requires a logged-in SUPERADMIN — no exceptions.
router.use(isAuthenticated, requireSuperAdmin);

router.get('/stats', getSystemStats);
router.get('/admins', getAdminAccounts);
router.get('/audit-logs', getAuditLogs);

module.exports = router;
