import { createSlice } from '@reduxjs/toolkit';

const getInitialToken = () => {
  return localStorage.getItem('accessToken') || null;
};

const initialState = {
  user: null,
  token: getInitialToken(),
  refreshToken: localStorage.getItem('refreshToken') || null,
  isAuthenticated: !!getInitialToken(),
  role: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { user, token, refreshToken, role } = action.payload;
      
      state.user = user;
      state.token = token;
      state.refreshToken = refreshToken || state.refreshToken;
      state.role = role;
      state.isAuthenticated = true;
      
      if (token) {
        localStorage.setItem('accessToken', token);
      }
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
      }
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.role = null;
      state.isAuthenticated = false;
      
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    },
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
    },
  },
});

export const { setCredentials, logout, updateUser } = authSlice.actions;
export default authSlice.reducer;

