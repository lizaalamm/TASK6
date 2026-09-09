/**
 * backend/src/models/paymentModel.js
 * ----------------------------------------------------------------------------
 * Sequelize `Payment` model — payment records against an application's
 * finance plan (spec §8 step 7: recorded by Manager/Admin/Super Admin).
 *
 * Recording a payment bumps the parent application:
 *  - paidAmount / remainingBalance are recomputed
 *  - FINANCE_SETUP → PAYMENT_IN_PROGRESS on the first payment
 * ----------------------------------------------------------------------------
 */
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const PAYMENT_METHODS = Object.freeze([
  'cash',
  'bank_transfer',
  'cheque',
  'online',
  'other',
]);

const PAYMENT_TYPES = Object.freeze(['down_payment', 'installment', 'other']);

const PAYMENT_STATUS = Object.freeze({
  PAID: 'paid',
  PENDING: 'pending',
  OVERDUE: 'overdue',
});

const Payment = sequelize.define(
  'Payment',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    applicationId: { type: DataTypes.INTEGER, allowNull: false },
    customerId: { type: DataTypes.INTEGER, allowNull: false },
    managerId: { type: DataTypes.INTEGER, allowNull: true },
    recordedBy: { type: DataTypes.INTEGER, allowNull: true },
    amount: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
    method: {
      type: DataTypes.STRING(32),
      allowNull: false,
      defaultValue: 'cash',
      validate: { isIn: [PAYMENT_METHODS] },
    },
    type: {
      type: DataTypes.STRING(32),
      allowNull: false,
      defaultValue: 'installment',
      validate: { isIn: [PAYMENT_TYPES] },
    },
    status: {
      type: DataTypes.STRING(32),
      allowNull: false,
      defaultValue: PAYMENT_STATUS.PAID,
      validate: { isIn: [Object.values(PAYMENT_STATUS)] },
    },
    dueDate: { type: DataTypes.DATE, allowNull: true },
    paidAt: { type: DataTypes.DATE, allowNull: true },
    receiptNo: { type: DataTypes.STRING(128), allowNull: true },
    notes: { type: DataTypes.TEXT, allowNull: true },
  },
  {
    timestamps: true,
  }
);

module.exports = Payment;
module.exports.PAYMENT_METHODS = PAYMENT_METHODS;
module.exports.PAYMENT_TYPES = PAYMENT_TYPES;
module.exports.PAYMENT_STATUS = PAYMENT_STATUS;
