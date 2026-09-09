/**
 * src/services/auditService.js
 * ----------------------------------------------------------------------------
 * Audit-trail reads (superadmin only). Online-only — audit history lives in
 * the database; returns an empty page when the API is unreachable.
 * ----------------------------------------------------------------------------
 */
import api from './api';

const unwrap = (response) => response.data?.data;

export const fetchAuditLogs = async (params = {}) => {
  try {
    const data = unwrap(await api.get('/admin/audit-logs', { params }));
    return data || { total: 0, logs: [] };
  } catch {
    return { total: 0, logs: [] };
  }
};

export const fetchSystemStats = async () => {
  const data = unwrap(await api.get('/admin/stats'));
  return data || null;
};

export const fetchManagers = async () => {
  try {
    return unwrap(await api.get('/users/managers')) || [];
  } catch {
    return [];
  }
};
