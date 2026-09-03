import api from './api';
import { getData, setData, removeData } from './localStorage';

const persistSession = (user, token) => {
  if (token) localStorage.setItem('token', token);
  if (user) setData('udevs_session', user);
};

const clearSession = () => {
  localStorage.removeItem('token');
  removeData('udevs_session');
};

const unwrapAuth = (payload) => {
  const token = payload?.token || payload?.data?.token || null;
  const user = payload?.user || payload?.data?.user || payload?.data || null;
  return { token, user };
};

export const loginUser = async (email, password) => {
  const response = await api.post('/users/login', { email, password });
  const { token, user } = unwrapAuth(response.data);
  if (!user || !token) {
    return { success: false, message: response.data?.message || 'Login failed' };
  }
  persistSession(user, token);
  return { success: true, user, token };
};

export const registerUser = async (userData) => {
  const response = await api.post('/users/register', userData);
  const { token, user } = unwrapAuth(response.data);
  if (user && token) persistSession(user, token);
  return { success: true, user, token, raw: response.data };
};

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

export const fetchCurrentUser = async () => {
  const response = await api.get('/users/me');
  const user = response.data?.user || response.data?.data || null;
  if (user) setData('udevs_session', user);
  return user;
};

export const getCurrentUser = () => getData('udevs_session');

export const isAuthenticated = () => !!localStorage.getItem('token');

export const hasRole = (roles) => {
  const user = getCurrentUser();
  if (!user) return false;
  const role = user.role || user.userType;
  return roles.includes(role);
};

export { persistSession, clearSession, unwrapAuth };
