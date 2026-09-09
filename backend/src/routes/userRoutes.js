/**
 * backend/src/routes/userRoutes.js
 * ----------------------------------------------------------------------------
 * User + auth endpoints, mounted as `/api/users/*` in app.js.
 *
 *   Public : POST /login · POST /logout · POST /register
 *   Authed : GET /me · GET /teamUsers/:teamLeadId · GET /user · GET /user/:id
 *            PUT /user · PUT /user/:id   (self or admin — see controller)
 *   Admin+ : POST /user · DELETE /user/:id
 *
 * Guard order always reads left → right: auth → role → validators → handler.
 * ----------------------------------------------------------------------------
 */
const express = require('express');
const {
  createUser,
  getAllUsers,
  loginUser,
  logoutUser,
  updateUser,
  deleteUser,
  registerUser,
  getUserById,
  getUsersByTeamLead,
  getMe,
} = require('../controllers/userController');
const {
  extractUserId,
  isAuthenticated,
  requireAdmin,
} = require('../middleware/authMiddleware');
const {
  registerValidator,
  loginValidator,
  createUserValidator,
  updateUserValidator,
  idParamValidator,
  teamLeadParamValidator,
} = require('../validators/userValidators');

const router = express.Router();

// --- Public auth -------------------------------------------------------------
router.post('/login', loginValidator, loginUser);
router.post('/logout', logoutUser);
router.post('/register', registerValidator, registerUser);

// --- Authenticated self-service ----------------------------------------------
router.get('/me', isAuthenticated, getMe);
router.get('/teamUsers/:teamLeadId', isAuthenticated, teamLeadParamValidator, getUsersByTeamLead);

// --- User management ----------------------------------------------------------
router.post('/user', isAuthenticated, requireAdmin, createUserValidator, createUser);
router.get('/user', extractUserId, getAllUsers);
router.get('/user/:id', isAuthenticated, idParamValidator, getUserById);
// Two update shapes: RESTful `:id` param + legacy `id`-in-body.
router.put('/user', isAuthenticated, updateUserValidator, updateUser);
router.put('/user/:id', isAuthenticated, updateUserValidator, updateUser);
router.delete('/user/:id', isAuthenticated, requireAdmin, idParamValidator, deleteUser);

module.exports = router;
