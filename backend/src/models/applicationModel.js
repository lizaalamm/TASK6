/**
 * backend/src/models/applicationModel.js
 * ----------------------------------------------------------------------------
 * Sequelize `Application` model — the application-to-delivery pipeline
 * (spec §8, 9 steps: PENDING → … → COMPLETE).
 *
 * Status values live in `constants/applicationStatus.js`. Stored as STRING
 * (not PG ENUM) so the pipeline can evolve without ENUM migrations.
 *
 * Key columns:
 *  - customerId / managerId / vehicleId — pipeline ownership links
 *  - applicant snapshot (firstName … city, CNIC front/back)
 *  - vehicle snapshot (carMake … vehiclePrice, selectedColor)
 *  - finance plan (downPayment, installmentAmount/Duration/Frequency,
 *    totalPayable, paidAmount, remainingBalance, nextDueDate)
 *  - verification + audit trail (verified, approved/assigned/completed
 *    timestamps + actor ids, rejectionReason, notes)
 * ----------------------------------------------------------------------------
 */
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const { APPLICATION_STATUS, ALL_STATUSES } = require('../constants/applicationStatus');

const Application = sequelize.define(
  'Application',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    // --- Ownership ------------------------------------------------------------
    customerId: { type: DataTypes.INTEGER, allowNull: false },
    managerId: { type: DataTypes.INTEGER, allowNull: true },
    vehicleId: { type: DataTypes.INTEGER, allowNull: true },
    // --- Applicant snapshot (spec §7 allowed fields) ---------------------------
    firstName: { type: DataTypes.STRING(255), allowNull: true },
    lastName: { type: DataTypes.STRING(255), allowNull: true },
    email: { type: DataTypes.STRING(500), allowNull: true },
    phone: { type: DataTypes.STRING(32), allowNull: true },
    cnic: { type: DataTypes.STRING(32), allowNull: true },
    cnicFront: { type: DataTypes.TEXT, allowNull: true },
    cnicBack: { type: DataTypes.TEXT, allowNull: true },
    address: { type: DataTypes.TEXT, allowNull: true },
    city: { type: DataTypes.STRING(255), allowNull: true },
    // --- Vehicle snapshot (spec §8 step 5) --------------------------------------
    carMake: { type: DataTypes.STRING(255), allowNull: true },
    carModel: { type: DataTypes.STRING(255), allowNull: true },
    carVariant: { type: DataTypes.STRING(255), allowNull: true },
    carYear: { type: DataTypes.INTEGER, allowNull: true },
    selectedColor: { type: DataTypes.STRING(64), allowNull: true },
    carImage: { type: DataTypes.TEXT, allowNull: true },
    vehiclePrice: { type: DataTypes.FLOAT, allowNull: true, defaultValue: 0 },
    // --- Finance plan (spec §8 step 6) -------------------------------------------
    downPayment: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
    installmentAmount: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
    installmentDuration: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    installmentFrequency: {
      type: DataTypes.STRING(32),
      allowNull: false,
      defaultValue: 'monthly',
    },
    totalPayable: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
    paidAmount: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
    remainingBalance: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
    nextDueDate: { type: DataTypes.DATE, allowNull: true },
    // --- Pipeline state ------------------------------------------------------------
    status: {
      type: DataTypes.STRING(32),
      allowNull: false,
      defaultValue: APPLICATION_STATUS.PENDING,
      validate: { isIn: [ALL_STATUSES] },
    },
    // --- Verification + audit trail -------------------------------------------------
    verified: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    verifiedAt: { type: DataTypes.DATE, allowNull: true },
    verifiedBy: { type: DataTypes.INTEGER, allowNull: true },
    approvedAt: { type: DataTypes.DATE, allowNull: true },
    approvedBy: { type: DataTypes.INTEGER, allowNull: true },
    assignedAt: { type: DataTypes.DATE, allowNull: true },
    assignedBy: { type: DataTypes.INTEGER, allowNull: true },
    completedAt: { type: DataTypes.DATE, allowNull: true },
    completedBy: { type: DataTypes.INTEGER, allowNull: true },
    rejectionReason: { type: DataTypes.TEXT, allowNull: true },
    notes: { type: DataTypes.TEXT, allowNull: true },
  },
  {
    timestamps: true,
  }
);

module.exports = Application;
