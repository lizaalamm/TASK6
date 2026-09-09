/**
 * src/services/authService.js
 * ----------------------------------------------------------------------------
 * Low-level auth API calls + session persistence helpers.
 * The Redux `auth` slice and `AuthContext` both build on top of this module.
 *
 * Session storage:
 *  - JWT          → localStorage `token` (read by the api interceptor)
 *  - user object  → localStorage `udevs_session` (instant boot, no flash)
 * ----------------------------------------------------------------------------
 */
import api from './api';
import { getData, setData, removeData } from './localStorage';

/**
 * Persist a login session (token + user snapshot) to localStorage.
 * @param {object|null} user - Authenticated user object.
 * @param {string|null} token - JWT access token.
 */
const persistSession = (user, token) => {
  if (token) localStorage.setItem('token', token);
  if (user) setData('udevs_session', user);
};

/** Wipe the local session (token + user snapshot). */
const clearSession = () => {
  localStorage.removeItem('token');
  removeData('udevs_session');
};

/**
 * Normalise the login/register response shape — the API returns the token
 * and user both top-level AND nested under `data`, so accept either.
 * @param {object} payload - Raw response body.
 * @returns {{token: string|null, user: object|null}}
 */
const unwrapAuth = (payload) => {
  const token = payload?.token || payload?.data?.token || null;
  const user = payload?.user || payload?.data?.user || payload?.data || null;
  return { token, user };
};

/**
 * Log in via POST /users/login and persist the returned session.
 * @param {string} email - Account email.
 * @param {string} password - Plain-text password.
 * @returns {Promise<{success:boolean,user?:object,token?:string,message?:string}>}
 */
export const loginUser = async (email, password) => {
  const response = await api.post('/users/login', { email, password });
  const { token, user } = unwrapAuth(response.data);
  if (!user || !token) {
    return { success: false, message: response.data?.message || 'Login failed' };
  }
  persistSession(user, token);
  return { success: true, user, token };
};

/**
 * Register via POST /users/register and persist the returned session.
 * @param {object} userData - { name, email, password, phone?, userType? }.
 * @returns {Promise<{success:boolean,user:object,token:string,raw:object}>}
 */
export const registerUser = async (userData) => {
  const response = await api.post('/users/register', userData);
  const { token, user } = unwrapAuth(response.data);
  if (user && token) persistSession(user, token);
  return { success: true, user, token, raw: response.data };
};

/**
 * Log out via POST /users/logout. The local session is cleared even when
 * the network call fails (offline logout still works).
 * @returns {Promise<{success:boolean}>}
 */
export const logoutUser = async () => {
  try {
    await api.post('/users/logout');
  } catch {
    // still clear local session
  } finally {
    clearSession();
  }
  return { success: true };
};

/**
 * Fetch the current user via GET /users/me (used for session restore).
 * @returns {Promise<object|null>} Fresh user object, or null when logged out.
 */
export const fetchCurrentUser = async () => {
  const response = await api.get('/users/me');
  const user = response.data?.user || response.data?.data || null;
  if (user) setData('udevs_session', user);
  return user;
};

/** Read the cached session user WITHOUT a network call. */
export const getCurrentUser = () => getData('udevs_session');

/** True when a JWT is stored (cheap check — validity proven by /me). */
export const isAuthenticated = () => !!localStorage.getItem('token');

/**
 * Check the cached user against a role list (superadmin bypass included).
 * @param {string[]} roles - Allowed roles.
 * @returns {boolean} True when the cached user may proceed.
 */
export const hasRole = (roles) => {
  const user = getCurrentUser();
  if (!user) return false;
  const role = user.role || user.userType;
  if (role === 'superadmin') return true;
  return roles.includes(role);
};

export { persistSession, clearSession, unwrapAuth };
