/**
 * backend/src/routes/vehicleRoutes.js
 * ----------------------------------------------------------------------------
 * Vehicle catalogue endpoints, mounted as `/api/vehicles/*` in app.js.
 *
 *   GET    /      scoped list (?search=&status=&available=1&minPrice=...
 *   GET    /:id   one vehicle
 *   POST   /      create (superadmin/admin/inventory)
 *   PUT    /:id   update (superadmin/admin/inventory)
 *   DELETE /:id   delete (superadmin only)
 *
 * Every route requires auth; permissions are enforced in the controller
 * against the permission matrix (see constants/permissions.js).
 * ----------------------------------------------------------------------------
 */
const express = require('express');
const {
  listVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle,
} = require('../controllers/vehicleController');
const { isAuthenticated } = require('../middleware/authMiddleware');
const {
  idParamValidator,
  createVehicleValidator,
  updateVehicleValidator,
} = require('../validators/vehicleValidators');

const router = express.Router();

router.use(isAuthenticated);

router.get('/', listVehicles);
router.get('/:id', idParamValidator, getVehicleById);
router.post('/', createVehicleValidator, createVehicle);
router.put('/:id', updateVehicleValidator, updateVehicle);
router.delete('/:id', idParamValidator, deleteVehicle);

module.exports = router;
