import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Get user from sessionStorage
const user = JSON.parse(sessionStorage.getItem('user'));

const initialState = {
  user: user ? user : null,
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: '',
  verificationEmail: null, // Store email for verification step
  requiresTwoFactor: false,
  twoFactorToken: null,
};

// Register user
export const register = createAsyncThunk('auth/register', async (userData, thunkAPI) => {
  try {
    const response = await api.post('/auth/register', userData);
    if (response.data && response.data.success) {
      if (response.data.requiresVerification) {
        thunkAPI.dispatch(authSlice.actions.setVerificationEmail(userData.email));
      } else {
        sessionStorage.setItem('user', JSON.stringify({
          ...response.data.user,
          token: response.data.token
        }));
      }
    }
    return response.data;
  } catch (error) {
    const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

// Verify email
export const verifyEmail = createAsyncThunk('auth/verifyEmail', async (verificationData, thunkAPI) => {
  try {
    const response = await api.post('/auth/verify-email', verificationData);
    if (response.data && response.data.success) {
      sessionStorage.setItem('user', JSON.stringify({ 
        ...response.data.user, 
        token: response.data.token 
      }));
    }
    return response.data;
  } catch (error) {
    const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

// Login user
export const login = createAsyncThunk('auth/login', async (userData, thunkAPI) => {
  try {
    const response = await api.post('/auth/login', userData);
    if (response.data && response.data.success && !response.data.requiresTwoFactor) {
      sessionStorage.setItem('user', JSON.stringify({ 
        ...response.data.user, 
        token: response.data.token 
      }));
    }
    return response.data;
  } catch (error) {
    const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

// Verify 2FA login code
export const verifyTwoFactorLogin = createAsyncThunk('auth/verifyTwoFactorLogin', async (verificationData, thunkAPI) => {
  try {
    const response = await api.post('/auth/2fa/login', verificationData);
    if (response.data && response.data.success) {
      sessionStorage.setItem('user', JSON.stringify({
        ...response.data.user,
        token: response.data.token
      }));
    }
    return response.data;
  } catch (error) {
    const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

// Get current user profile
export const getMe = createAsyncThunk('auth/getMe', async (_, thunkAPI) => {
  try {
    const response = await api.get('/auth/me');
    if (response.data && response.data.success) {
      const token = JSON.parse(sessionStorage.getItem('user'))?.token;
      const updatedUser = { ...response.data.data, token };
      sessionStorage.setItem('user', JSON.stringify(updatedUser));
      return updatedUser;
    }
    return response.data;
  } catch (error) {
    const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

// Logout
export const logout = createAsyncThunk('auth/logout', async () => {
  sessionStorage.removeItem('user');
});

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isError = false;
      state.isSuccess = false;
      state.message = '';
      state.requiresTwoFactor = false;
      state.twoFactorToken = null;
    },
    setVerificationEmail: (state, action) => {
      state.verificationEmail = action.payload;
    },
    updateUser: (state, action) => {
      const updated = { ...state.user, ...action.payload };
      state.user = updated;
      sessionStorage.setItem('user', JSON.stringify(updated));
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(register.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.user = { ...action.payload.user, token: action.payload.token };
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(verifyEmail.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(verifyEmail.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.user = { ...action.payload.user, token: action.payload.token };
      })
      .addCase(verifyEmail.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(login.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        if (action.payload.requiresTwoFactor) {
          state.isSuccess = false;
          state.requiresTwoFactor = true;
          state.twoFactorToken = action.payload.twoFactorToken;
          state.user = null;
        } else {
          state.requiresTwoFactor = false;
          state.twoFactorToken = null;
          state.user = { ...action.payload.user, token: action.payload.token };
        }
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        state.user = null;
      })
      .addCase(verifyTwoFactorLogin.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(verifyTwoFactorLogin.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.requiresTwoFactor = false;
        state.twoFactorToken = null;
        state.user = { ...action.payload.user, token: action.payload.token };
      })
      .addCase(verifyTwoFactorLogin.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(getMe.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getMe.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.user = action.payload;
      })
      .addCase(getMe.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        state.user = null;
        sessionStorage.removeItem('user');
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.requiresTwoFactor = false;
        state.twoFactorToken = null;
      });
  },
});

export const { reset, setVerificationEmail, updateUser } = authSlice.actions;
export default authSlice.reducer;
