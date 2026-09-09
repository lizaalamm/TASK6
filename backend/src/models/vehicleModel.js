/**
 * backend/src/models/vehicleModel.js
 * ----------------------------------------------------------------------------
 * Sequelize `Vehicle` model — the vehicle catalogue (spec §4: make, model,
 * year, variant, price, stock/availability and status).
 *
 * Permissions (enforced in vehicleController, see permissions.js):
 *  - create / update : superadmin (FULL), admin (LIMITED), inventory
 *  - delete          : superadmin only
 *  - view            : all authenticated users; customers see only
 *                      Available vehicles with stock > 0
 * ----------------------------------------------------------------------------
 */
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const VEHICLE_STATUS = Object.freeze({
  AVAILABLE: 'Available',
  RESERVED: 'Reserved',
  SOLD: 'Sold',
  INACTIVE: 'Inactive',
});

const Vehicle = sequelize.define(
  'Vehicle',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    // Catalogue identity — spec §4.
    make: { type: DataTypes.STRING(255), allowNull: false },
    model: { type: DataTypes.STRING(255), allowNull: false },
    year: { type: DataTypes.INTEGER, allowNull: false },
    variant: { type: DataTypes.STRING(255), allowNull: true },
    // Pricing.
    sellingPrice: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
    purchaseRate: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
    // Stock / availability.
    stockQuantity: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    status: {
      type: DataTypes.STRING(32),
      allowNull: false,
      defaultValue: VEHICLE_STATUS.AVAILABLE,
      validate: { isIn: [Object.values(VEHICLE_STATUS)] },
    },
    // Showroom details.
    fuel: { type: DataTypes.STRING(64), allowNull: true },
    transmission: { type: DataTypes.STRING(64), allowNull: true },
    mileage: { type: DataTypes.FLOAT, allowNull: true, defaultValue: 0 },
    engine: { type: DataTypes.STRING(64), allowNull: true },
    availableColors: { type: DataTypes.JSON, allowNull: true, defaultValue: [] },
    images: { type: DataTypes.JSON, allowNull: true, defaultValue: [] },
    description: { type: DataTypes.TEXT, allowNull: true },
    // Supplier link (suppliers live in the frontend catalogue; kept as text).
    supplierId: { type: DataTypes.STRING(64), allowNull: true },
    supplierName: { type: DataTypes.STRING(255), allowNull: true },
  },
  {
    timestamps: true,
  }
);

module.exports = Vehicle;
module.exports.VEHICLE_STATUS = VEHICLE_STATUS;
