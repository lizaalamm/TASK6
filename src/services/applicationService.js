/**
 * src/services/applicationService.js
 * ----------------------------------------------------------------------------
 * Application pipeline data layer (spec §8).
 *
 * Two access styles:
 *  - Sync localStorage helpers (`getApplications`, `addApplication`, …) keep
 *    the existing dashboard/report screens working offline.
 *  - Async API helpers (`fetchApplications`, `reviewApplication`, …) talk to
 *    the backend pipeline and mirror results into the local cache, so both
 *    worlds stay consistent.
 *
 * Statuses are normalised to the canonical UPPER_SNAKE form — legacy Title
 * Case rows (`Pending`, `Reserved`, …) are migrated on read.
 * ----------------------------------------------------------------------------
 */
import api from './api';
import { getData, setData, generateId } from './localStorage';
import { APPLICATION_STATUS, normalizeStatus } from '../constants/applicationStatus';

const KEY = 'udevs_applications';

/** Migrate one cached row to the canonical shape (idempotent). */
const migrateRow = (app) => ({
  downPayment: 0,
  installmentAmount: 0,
  installmentDuration: 0,
  installmentFrequency: 'monthly',
  totalPayable: 0,
  paidAmount: 0,
  remainingBalance: 0,
  ...app,
  status: normalizeStatus(app?.status),
});

/** Insert or replace one row in the local cache (matches string/number ids). */
const upsertLocal = (row) => {
  const rows = getData(KEY, []);
  const id = String(row.id);
  const index = rows.findIndex((r) => String(r.id) === id);
  const migrated = migrateRow(row);
  if (index === -1) rows.unshift(migrated);
  else rows[index] = { ...rows[index], ...migrated };
  setData(KEY, rows);
  return migrated;
};

/** Replace the whole local cache (used after API list fetches). */
export const cacheApplications = (rows) => {
  setData(KEY, (rows || []).map(migrateRow));
};

// --- Sync localStorage helpers (dashboards, reports, offline) ------------------

export const getApplications = () => getData(KEY, []).map(migrateRow);

export const getApplicationById = (id) => {
  const sid = String(id);
  return getApplications().find((app) => String(app.id) === sid) || null;
};

export const getApplicationsByCustomer = (customerId) => {
  const sid = String(customerId);
  return getApplications().filter((app) => String(app.customerId) === sid);
};

export const getApplicationsByManager = (managerId) => {
  const sid = String(managerId);
  return getApplications().filter((app) => String(app.managerId) === sid);
};

export const addApplication = (applicationData) => {
  const now = new Date().toISOString();
  const created = upsertLocal({
    id: generateId('APP'),
    ...applicationData,
    status: normalizeStatus(applicationData.status) || APPLICATION_STATUS.PENDING,
    applicationDate: applicationData.applicationDate || now,
    createdAt: now,
    updatedAt: now,
  });
  return created;
};

export const updateApplicationStatus = (id, status) => {
  const current = getApplicationById(id);
  if (!current) return null;
  return upsertLocal({ ...current, status: normalizeStatus(status), updatedAt: new Date().toISOString() });
};

export const updateApplication = (id, applicationData) => {
  const current = getApplicationById(id);
  if (!current) return null;
  const next = { ...current, ...applicationData, updatedAt: new Date().toISOString() };
  if (applicationData.status) next.status = normalizeStatus(applicationData.status);
  return upsertLocal(next);
};

export const deleteApplication = (id) => {
  const sid = String(id);
  setData(
    KEY,
    getData(KEY, []).filter((app) => String(app.id) !== sid)
  );
  return true;
};

export const getApplicationStats = () => {
  const applications = getApplications();
  const byStatus = {};
  for (const app of applications) {
    byStatus[app.status] = (byStatus[app.status] || 0) + 1;
  }
  // Legacy keys keep the old dashboard cards working.
  return {
    total: applications.length,
    byStatus,
    pending: byStatus[APPLICATION_STATUS.PENDING] || 0,
    approved: byStatus[APPLICATION_STATUS.APPROVED] || 0,
    reserved: byStatus[APPLICATION_STATUS.VEHICLE_SELECTED] || 0,
    completed: byStatus[APPLICATION_STATUS.COMPLETE] || 0,
    rejected: byStatus[APPLICATION_STATUS.REJECTED] || 0,
  };
};

export const getOverdueApplicationsLocal = () => {
  const now = new Date();
  return getApplications().filter(
    (app) =>
      Number(app.remainingBalance || 0) > 0 &&
      app.nextDueDate &&
      new Date(app.nextDueDate) < now &&
      [APPLICATION_STATUS.FINANCE_SETUP, APPLICATION_STATUS.PAYMENT_IN_PROGRESS].includes(app.status)
  );
};

// --- Async API helpers (pipeline screens) ---------------------------------------
// Each falls back to the local cache when the API is unreachable, so the UI
// keeps working in demo/offline mode. Local mutations are used as the
// fallback so pipeline buttons stay functional without a backend.

const unwrap = (response) => response.data?.data;

export const fetchApplications = async (params = {}) => {
  try {
    const rows = unwrap(await api.get('/applications', { params })) || [];
    cacheApplications(rows);
    return rows.map(migrateRow);
  } catch {
    let rows = getApplications();
    if (params.status) rows = rows.filter((r) => r.status === normalizeStatus(params.status));
    if (params.customerId) {
      rows = rows.filter((r) => String(r.customerId) === String(params.customerId));
    }
    if (params.managerId) {
      rows = rows.filter((r) => String(r.managerId) === String(params.managerId));
    }
    return rows;
  }
};

export const fetchApplicationById = async (id) => {
  try {
    const row = unwrap(await api.get(`/applications/${id}`));
    if (row) return upsertLocal(row);
  } catch {
    // fall through to cache
  }
  return getApplicationById(id);
};

export const createApplication = async (payload) => {
  try {
    const row = unwrap(await api.post('/applications', payload));
    return upsertLocal(row);
  } catch {
    return addApplication({ ...payload, status: APPLICATION_STATUS.PENDING });
  }
};

export const reviewApplication = async (id, decision, rejectionReason = '') => {
  try {
    const row = unwrap(await api.post(`/applications/${id}/review`, { decision, rejectionReason }));
    return upsertLocal(row);
  } catch {
    const normalized = normalizeStatus(decision);
    if (![APPLICATION_STATUS.APPROVED, APPLICATION_STATUS.REJECTED, APPLICATION_STATUS.PENDING].includes(normalized)) {
      throw new Error('Decision must be APPROVED, REJECTED or PENDING');
    }
    return updateApplication(id, {
      status: normalized,
      rejectionReason: normalized === APPLICATION_STATUS.REJECTED ? rejectionReason : null,
    });
  }
};

export const assignManagerToApplication = async (id, managerId, managerName = '') => {
  try {
    const row = unwrap(await api.post(`/applications/${id}/assign`, { managerId }));
    return upsertLocal(row);
  } catch {
    return updateApplication(id, { managerId, managerName, status: APPLICATION_STATUS.ASSIGNED });
  }
};

export const verifyApplication = async (id, notes = '') => {
  try {
    const row = unwrap(await api.post(`/applications/${id}/verify`, { notes }));
    return upsertLocal(row);
  } catch {
    return updateApplication(id, { status: APPLICATION_STATUS.IN_PROCESS, verified: true, notes });
  }
};

export const selectApplicationVehicle = async (id, vehicle, selectedColor = '') => {
  try {
    const row = unwrap(
      await api.post(`/applications/${id}/vehicle`, {
        vehicleId: vehicle.id,
        selectedColor: selectedColor || vehicle.selectedColor,
      })
    );
    return upsertLocal(row);
  } catch {
    return updateApplication(id, {
      vehicleId: vehicle.id,
      carMake: vehicle.make,
      carModel: vehicle.model,
      carVariant: vehicle.variant,
      carYear: vehicle.year,
      carImage: vehicle.images?.[0] || vehicle.carImage,
      vehiclePrice: vehicle.sellingPrice,
      totalPayable: vehicle.sellingPrice,
      remainingBalance: Number(vehicle.sellingPrice || 0),
      selectedColor: selectedColor || vehicle.availableColors?.[0] || '',
      status: APPLICATION_STATUS.VEHICLE_SELECTED,
    });
  }
};

export const setupFinancePlan = async (id, plan) => {
  try {
    const row = unwrap(await api.post(`/applications/${id}/finance`, plan));
    return upsertLocal(row);
  } catch {
    const current = getApplicationById(id);
    const vehiclePrice = Number(current?.vehiclePrice || 0);
    const downPayment = Number(plan.downPayment || 0);
    const installmentAmount = Number(plan.installmentAmount || 0);
    const installmentDuration = Number(plan.installmentDuration || 0);
    const totalPayable = vehiclePrice > 0 ? vehiclePrice : downPayment + installmentAmount * installmentDuration;
    const nextDueDate = new Date();
    nextDueDate.setMonth(nextDueDate.getMonth() + 1);
    return updateApplication(id, {
      downPayment,
      installmentAmount,
      installmentDuration,
      installmentFrequency: plan.installmentFrequency || 'monthly',
      totalPayable,
      remainingBalance: Math.max(0, totalPayable - Number(current?.paidAmount || 0)),
      nextDueDate: nextDueDate.toISOString(),
      status: APPLICATION_STATUS.FINANCE_SETUP,
    });
  }
};

export const markApplicationReady = async (id) => {
  try {
    const row = unwrap(await api.post(`/applications/${id}/ready`));
    return upsertLocal(row);
  } catch {
    return updateApplication(id, { status: APPLICATION_STATUS.READY_FOR_DELIVERY });
  }
};

export const completeApplicationById = async (id) => {
  try {
    const row = unwrap(await api.post(`/applications/${id}/complete`));
    return upsertLocal(row);
  } catch {
    return updateApplication(id, { status: APPLICATION_STATUS.COMPLETE });
  }
};

export const resubmitApplicationById = async (id) => {
  try {
    const row = unwrap(await api.post(`/applications/${id}/resubmit`));
    return upsertLocal(row);
  } catch {
    return updateApplication(id, { status: APPLICATION_STATUS.PENDING, rejectionReason: null });
  }
};

export const fetchOverdueApplications = async () => {
  try {
    const rows = unwrap(await api.get('/applications/overdue/list')) || [];
    return rows.map(migrateRow);
  } catch {
    return getOverdueApplicationsLocal();
  }
};

export const fetchApplicationStats = async () => {
  try {
    return unwrap(await api.get('/applications/stats'));
  } catch {
    return getApplicationStats();
  }
};
