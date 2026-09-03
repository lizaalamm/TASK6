import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';
import { persistSession, clearSession, unwrapAuth } from '../../services/authService';

const readStoredUser = () => {
  try {
    const raw = localStorage.getItem('udevs_session');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const getErrorMessage = (error, fallback) => {
  const data = error.response?.data;
  if (data?.errors?.length) {
    const first = data.errors[0];
    return first.message || first.msg || data.message || fallback;
  }
  return data?.message || fallback;
};

export const loginUser = createAsyncThunk(
  'auth/login',
  async ({ email, password }, thunkAPI) => {
    try {
      const response = await api.post('/users/login', { email, password });
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error, 'Login failed'));
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData, thunkAPI) => {
    try {
      const response = await api.post('/users/register', userData);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error, 'Registration failed'));
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, thunkAPI) => {
    try {
      await api.post('/users/logout');
      return {};
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error, 'Logout failed'));
    } finally {
      clearSession();
    }
  }
);

export const loadCurrentUser = createAsyncThunk(
  'auth/me',
  async (_, thunkAPI) => {
    const token = localStorage.getItem('token');
    if (!token) {
      return thunkAPI.rejectWithValue('No token');
    }
    try {
      const response = await api.get('/users/me');
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error, 'Session expired'));
    }
  }
);

const storedUser = readStoredUser();
const storedToken = localStorage.getItem('token');

const initialState = {
  user: storedUser,
  token: storedToken || null,
  isAuthenticated: Boolean(storedToken && storedUser),
  loading: false,
  restoring: Boolean(storedToken),
  error: null,
  success: false,
};

const applyAuthSuccess = (state, payload) => {
  const { token, user } = unwrapAuth(payload);
  state.loading = false;
  state.restoring = false;
  state.error = null;
  state.success = true;
  if (user) state.user = user;
  if (token) state.token = token;
  state.isAuthenticated = Boolean(state.user && state.token);
  persistSession(state.user, state.token);
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearAuthError: (state) => {
      state.error = null;
    },
    clearAuthSuccess: (state) => {
      state.success = false;
    },
    setAuthToken: (state, action) => {
      state.token = action.payload;
      state.isAuthenticated = true;
      localStorage.setItem('token', action.payload);
    },
    setCredentials: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      persistSession(action.payload.user, action.payload.token);
    },
    logoutLocal: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.restoring = false;
      state.error = null;
      clearSession();
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        applyAuthSuccess(state, action.payload);
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
      })
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        applyAuthSuccess(state, action.payload);
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.loading = false;
        state.restoring = false;
        state.error = null;
        state.success = false;
      })
      .addCase(logoutUser.rejected, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.loading = false;
        state.restoring = false;
      })
      .addCase(loadCurrentUser.pending, (state) => {
        state.restoring = true;
      })
      .addCase(loadCurrentUser.fulfilled, (state, action) => {
        const user = action.payload?.user || action.payload?.data || null;
        state.user = user;
        state.isAuthenticated = Boolean(user && state.token);
        state.restoring = false;
        if (user) persistSession(user, state.token);
      })
      .addCase(loadCurrentUser.rejected, (state, action) => {
        state.restoring = false;
        if (action.payload !== 'No token') {
          state.user = null;
          state.token = null;
          state.isAuthenticated = false;
          clearSession();
        }
      });
  },
});

export const {
  clearAuthError,
  clearAuthSuccess,
  setAuthToken,
  setCredentials,
  logoutLocal,
} = authSlice.actions;

export const selectAuthUser = (state) => state.auth.user;
export const selectAuthToken = (state) => state.auth.token;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectAuthLoading = (state) => state.auth.loading;
export const selectAuthRestoring = (state) => state.auth.restoring;
export const selectAuthError = (state) => state.auth.error;
export const selectAuthSuccess = (state) => state.auth.success;
export const selectUserRole = (state) =>
  state.auth.user?.role || state.auth.user?.userType || null;

export default authSlice.reducer;
