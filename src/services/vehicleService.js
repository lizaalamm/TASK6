/**
 * src/services/vehicleService.js
 * ----------------------------------------------------------------------------
 * Vehicle catalogue data layer — async API first, localStorage (`udevs_cars`)
 * fallback. Rows are mirrored into the local cache so the existing inventory
 * screens (`Cars`, `Showroom`, …) keep working with or without a backend.
 * ----------------------------------------------------------------------------
 */
import api from './api';
import { getData, setData, generateId } from './localStorage';

const KEY = 'udevs_cars';
const unwrap = (response) => response.data?.data;

const upsertLocal = (row) => {
  const rows = getData(KEY, []);
  const id = String(row.id);
  const index = rows.findIndex((r) => String(r.id) === id);
  if (index === -1) rows.unshift(row);
  else rows[index] = { ...rows[index], ...row };
  setData(KEY, rows);
  return rows[index === -1 ? 0 : index];
};

export const fetchVehicles = async (params = {}) => {
  try {
    const rows = unwrap(await api.get('/vehicles', { params })) || [];
    // Merge API rows into the cache without dropping local-only rows.
    const cached = getData(KEY, []);
    const apiIds = new Set(rows.map((r) => String(r.id)));
    setData(KEY, [...rows, ...cached.filter((r) => !apiIds.has(String(r.id)))]);
    return rows;
  } catch {
    let rows = getData(KEY, []);
    if (params.available === '1' || params.available === 1) {
      rows = rows.filter((r) => r.status === 'Available' && Number(r.stockQuantity) > 0);
    }
    if (params.status) rows = rows.filter((r) => r.status === params.status);
    return rows;
  }
};

export const fetchVehicleById = async (id) => {
  try {
    const row = unwrap(await api.get(`/vehicles/${id}`));
    if (row) return upsertLocal(row);
  } catch {
    // fall through to cache
  }
  const sid = String(id);
  return getData(KEY, []).find((r) => String(r.id) === sid) || null;
};

export const createVehicle = async (payload) => {
  try {
    const row = unwrap(await api.post('/vehicles', payload));
    return upsertLocal(row);
  } catch {
    const now = new Date().toISOString();
    return upsertLocal({
      id: generateId('CAR'),
      stockQuantity: 0,
      status: 'Available',
      ...payload,
      createdAt: now,
      updatedAt: now,
    });
  }
};

export const updateVehicleById = async (id, payload) => {
  try {
    const row = unwrap(await api.put(`/vehicles/${id}`, payload));
    return upsertLocal(row);
  } catch {
    const sid = String(id);
    const current = getData(KEY, []).find((r) => String(r.id) === sid);
    if (!current) return null;
    return upsertLocal({ ...current, ...payload, updatedAt: new Date().toISOString() });
  }
};

export const deleteVehicleById = async (id) => {
  try {
    await api.delete(`/vehicles/${id}`);
  } catch {
    // fall through — still drop the cached row
  }
  const sid = String(id);
  setData(
    KEY,
    getData(KEY, []).filter((r) => String(r.id) !== sid)
  );
  return true;
};
