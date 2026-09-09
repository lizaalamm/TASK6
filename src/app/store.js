/**
 * src/app/store.js
 * ----------------------------------------------------------------------------
 * Redux store: combines the `auth` slice (session) and the `users` slice
 * (user-management CRUD). Provided once in main.js/index.jsx via `<Provider>`.
 * `serializableCheck` is off because thunks briefly carry API payloads.
 * ----------------------------------------------------------------------------
 */
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