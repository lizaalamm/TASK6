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

router.post('/login', loginValidator, loginUser);
router.post('/logout', logoutUser);
router.post('/register', registerValidator, registerUser);

router.get('/me', isAuthenticated, getMe);
router.get('/teamUsers/:teamLeadId', isAuthenticated, teamLeadParamValidator, getUsersByTeamLead);

router.post('/user', isAuthenticated, requireAdmin, createUserValidator, createUser);
router.get('/user', extractUserId, getAllUsers);
router.get('/user/:id', isAuthenticated, idParamValidator, getUserById);
router.put('/user', isAuthenticated, updateUserValidator, updateUser);
router.put('/user/:id', isAuthenticated, updateUserValidator, updateUser);
router.delete('/user/:id', isAuthenticated, requireAdmin, idParamValidator, deleteUser);

module.exports = router;
