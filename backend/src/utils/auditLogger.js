/**
 * backend/src/utils/auditLogger.js
 * ----------------------------------------------------------------------------
 * Append-only audit trail writer (spec §4: Super Admin views audit history).
 * Fire-and-forget — audit failures must NEVER break the request that caused
 * them, so every error is swallowed after a console warning.
 * ----------------------------------------------------------------------------
 */

/**
 * Record one audit entry.
 * @param {import('express').Request} req - Request carrying req.user (actor).
 * @param {string} action - Machine-readable action, e.g. `application.review`.
 * @param {string} [entityType] - e.g. `application`, `vehicle`, `payment`.
 * @param {string|number} [entityId] - Affected row id.
 * @param {object} [details] - Extra JSON context (old/new values, ...).
 * @returns {Promise<void>}
 */
const logAudit = async (req, action, entityType = null, entityId = null, details = null) => {
  try {
    // Lazy require avoids a circular import with models/index.js.
    const { AuditLog } = require('../models');
    await AuditLog.create({
      actorId: req?.user?.id || null,
      actorName: req?.user?.name || null,
      actorRole: req?.user?.userType || null,
      action,
      entityType,
      entityId: entityId === null || entityId === undefined ? null : String(entityId),
      details: details || null,
      ip: req?.ip || req?.headers?.['x-forwarded-for'] || null,
    });
  } catch (error) {
    console.warn('Audit log write failed:', error.message);
  }
};

module.exports = { logAudit };
