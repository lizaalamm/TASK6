import { getData, setData, removeData } from './localStorage';

export const loginUser = (email, password) => {
  const users = getData('udevs_users', []);
  const user = users.find(u => u.email === email && u.password === password);
  
  if (!user) {
    return { success: false, message: 'Invalid email or password' };
  }

  // Don't send password in session
  const { password: _, ...userWithoutPassword } = user;
  setData('udevs_session', userWithoutPassword);
  
  return { success: true, user: userWithoutPassword };
};

export const logoutUser = () => {
  removeData('udevs_session');
  return { success: true };
};

export const getCurrentUser = () => {
  return getData('udevs_session');
};

export const isAuthenticated = () => {
  return !!getData('udevs_session');
};

export const hasRole = (roles) => {
  const user = getCurrentUser();
  if (!user) return false;
  return roles.includes(user.role);
};