import { createSlice } from '@reduxjs/toolkit';

const getStoredUser = () => {
  try {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const initialState = {
  token: localStorage.getItem('token') || null,
  role: localStorage.getItem('role') || null,
  user: getStoredUser(),
  isAuthenticated: !!localStorage.getItem('token'),
  isLoading: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess: (state, action) => {
      const { token, role, user } = action.payload;
      state.token = token;
      state.role = role || (user && user.role) || null;
      state.user = user || null;
      state.isAuthenticated = true;
      state.isLoading = false;
      if (token) localStorage.setItem('token', token);
      if (state.role) localStorage.setItem('role', state.role);
      if (user) localStorage.setItem('user', JSON.stringify(user));
    },
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
      if (state.user) localStorage.setItem('user', JSON.stringify(state.user));
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    logout: (state) => {
      state.token = null;
      state.role = null;
      state.user = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      localStorage.removeItem('user');
    },
  },
});

export const { loginSuccess, updateUser, setLoading, logout } = authSlice.actions;
export default authSlice.reducer;
