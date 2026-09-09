/**
 * src/context/AuthContext.jsx
 * ----------------------------------------------------------------------------
 * AuthContext — the app-wide authentication façade.
 *
 * It wraps the Redux `auth` slice with a friendly hook API so components never
 * touch dispatch/selectors directly:
 *
 *   const { user, login, logout, hasRole, isSuperAdmin } = useAuth();
 *
 * Session lifecycle:
 *  1. On mount, if a JWT exists in localStorage, `loadCurrentUser()` restores
 *     the session from GET /api/users/me (shows a loader meanwhile).
 *  2. `login()` / `register()` dispatch thunks → persist token + user.
 *  3. `logout()` clears the server cookie AND the local session.
 * ----------------------------------------------------------------------------
 */
import React, { createContext, useContext, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  loginUser as loginThunk,
  registerUser as registerThunk,
  logoutUser as logoutThunk,
  loadCurrentUser,
  logoutLocal,
  selectAuthUser,
  selectAuthToken,
  selectIsAuthenticated,
  selectAuthLoading,
  selectAuthRestoring,
  selectAuthError,
} from '../redux/auth/authSlice';
import { ROLES, getUserRole, hasAnyRole } from '../constants/roles';

const AuthContext = createContext();

/**
 * Provider component — mount ONCE near the root (see App.jsx).
 * @param {{children: React.ReactNode}} props - Child tree.
 */
export const AuthProvider = ({ children }) => {
  const dispatch = useDispatch();

  // --- Redux auth state (single source of truth) ------------------------------
  const user = useSelector(selectAuthUser);
  const token = useSelector(selectAuthToken);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const loading = useSelector(selectAuthLoading);
  const restoring = useSelector(selectAuthRestoring);
  const error = useSelector(selectAuthError);

  // --- Restore session on first load when a token is stored -------------------
  useEffect(() => {
    if (localStorage.getItem('token')) {
      dispatch(loadCurrentUser());
    }
  }, [dispatch]);

  /**
   * Log in with email + password.
   * @param {string} email - Account email.
   * @param {string} password - Plain-text password.
   * @returns {Promise<{success:boolean,user?:object,token?:string,message?:string}>}
   */
  const login = async (email, password) => {
    const result = await dispatch(loginThunk({ email, password }));
    if (loginThunk.fulfilled.match(result)) {
      const payload = result.payload;
      return {
        success: true,
        user: payload.user || payload.data?.user,
        token: payload.token || payload.data?.token,
      };
    }
    return { success: false, message: result.payload || 'Login failed' };
  };

  /**
   * Register a new account (role is sanitised server-side).
   * @param {object} userData - { name, email, password, phone?, userType? }.
   * @returns {Promise<{success:boolean,user?:object,token?:string,message?:string}>}
   */
  const register = async (userData) => {
    const result = await dispatch(registerThunk(userData));
    if (registerThunk.fulfilled.match(result)) {
      const payload = result.payload;
      return {
        success: true,
        user: payload.user || payload.data?.user,
        token: payload.token || payload.data?.token,
      };
    }
    return { success: false, message: result.payload || 'Registration failed' };
  };

  /** Log out everywhere (server cookie + local session). */
  const logout = () => {
    dispatch(logoutThunk());
  };

  /**
   * Check whether the current user holds ANY of the given roles.
   * Superadmin always passes (platform-owner bypass).
   * @param {string[]} roles - Allowed roles.
   * @returns {boolean} True when the user may proceed.
   */
  const hasRole = (roles) => hasAnyRole(user, roles);

  // Canonical role string for the session (`superadmin` | `admin` | ...).
  const role = getUserRole(user);

  // --- Memoised context value (stable reference → fewer re-renders) ------------
  const value = useMemo(
    () => ({
      user, // raw user object
      token, // raw JWT
      role, // canonical role string
      login,
      register,
      logout,
      logoutLocal: () => dispatch(logoutLocal()),
      loading: loading || restoring,
      restoring,
      error,
      hasRole,
      isAuthenticated,
      isSuperAdmin: role === ROLES.SUPERADMIN,
      isAdmin: role === ROLES.ADMIN || role === ROLES.SUPERADMIN,
      isManager: role === ROLES.MANAGER || role === ROLES.SUPERADMIN,
      isCustomer: role === ROLES.CUSTOMER,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user, token, role, loading, restoring, error, isAuthenticated, dispatch]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Consume the auth context. Must be used inside `<AuthProvider>`.
 * @returns {object} Auth state + actions (see provider value above).
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
