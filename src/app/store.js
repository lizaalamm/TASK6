import { configureStore } from '@reduxjs/toolkit';
import userReducer from '../redux/users/userSlice';
import authReducer from '../redux/auth/authSlice';

export const store = configureStore({
  reducer: {
    users: userReducer,
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export default store;