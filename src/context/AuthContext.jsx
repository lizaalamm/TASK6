import React, { createContext, useState, useContext, useEffect } from 'react';
import { getData, setData, removeData } from '../services/localStorage';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const session = getData('udevs_session');
    if (session) {
      setUser(session);
    }
    setLoading(false);
  }, []);

  const login = (userData) => {
    setUser(userData);
    setData('udevs_session', userData);
  };

  const logout = () => {
    setUser(null);
    removeData('udevs_session');
  };

  const hasRole = (roles) => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  const value = {
    user,
    setUser,
    login,
    logout,
    loading,
    hasRole,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};