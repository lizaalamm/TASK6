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

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const dispatch = useDispatch();
  const user = useSelector(selectAuthUser);
  const token = useSelector(selectAuthToken);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const loading = useSelector(selectAuthLoading);
  const restoring = useSelector(selectAuthRestoring);
  const error = useSelector(selectAuthError);

  useEffect(() => {
    if (localStorage.getItem('token')) {
      dispatch(loadCurrentUser());
    }
  }, [dispatch]);

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

  const logout = () => {
    dispatch(logoutThunk());
  };

  const hasRole = (roles) => {
    if (!user) return false;
    const role = user.role || user.userType;
    return roles.includes(role);
  };

  const value = useMemo(
    () => ({
      user,
      token,
      login,
      register,
      logout,
      logoutLocal: () => dispatch(logoutLocal()),
      loading: loading || restoring,
      restoring,
      error,
      hasRole,
      isAuthenticated,
    }),
    [user, token, loading, restoring, error, isAuthenticated, dispatch]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
