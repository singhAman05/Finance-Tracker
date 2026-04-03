import { createSlice } from '@reduxjs/toolkit';
import type { User } from '@/types/interfaces';

type AuthState = {
  token: string | null;
  user: User | null;
  error: string | null;
};

const loadStateFromStorage = (): AuthState => {
  if (typeof window !== "undefined") {
    const token = sessionStorage.getItem("jwt");
    const raw = sessionStorage.getItem("user");
    let user = null;
    if (raw) {
      try {
        user = JSON.parse(raw);
      } catch {
        sessionStorage.removeItem("user");
      }
    }
    return { token: token || null, user, error: null };
  }
  return { token: null, user: null, error: null };
};

const initialState: AuthState = loadStateFromStorage();

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login(state, action) {
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.error = null;

      sessionStorage.setItem('jwt', action.payload.token);
      sessionStorage.setItem('user', JSON.stringify(action.payload.user));
    },
    logout(state) {
      state.token = null;
      state.user = null;
      state.error = null;

      sessionStorage.removeItem('jwt');
      sessionStorage.removeItem('user');
    },
    setError(state, action) {
      state.error = action.payload;
    },
  },
});

export const { login, logout, setError } = authSlice.actions;
export default authSlice.reducer;
