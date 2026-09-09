/**
 * backend/src/models/auditLogModel.js
 * ----------------------------------------------------------------------------
 * Sequelize `AuditLog` model — append-only audit history (spec §4: Super Admin
 * views dashboards, reports, overdue installments and audit history).
 *
 * Written via `utils/auditLogger.js` (fire-and-forget). Readable ONLY by
 * superadmins (`GET /api/admin/audit-logs`).
 * ----------------------------------------------------------------------------
 */
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const AuditLog = sequelize.define(
  'AuditLog',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    actorId: { type: DataTypes.INTEGER, allowNull: true },
    actorName: { type: DataTypes.STRING(500), allowNull: true },
    actorRole: { type: DataTypes.STRING(64), allowNull: true },
    action: { type: DataTypes.STRING(128), allowNull: false },
    entityType: { type: DataTypes.STRING(64), allowNull: true },
    entityId: { type: DataTypes.STRING(64), allowNull: true },
    details: { type: DataTypes.JSON, allowNull: true },
    ip: { type: DataTypes.STRING(64), allowNull: true },
  },
  {
    timestamps: true,
    updatedAt: false, // append-only: createdAt is the record
  }
);

module.exports = AuditLog;
