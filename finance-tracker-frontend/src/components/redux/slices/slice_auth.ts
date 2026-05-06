import { createSlice } from '@reduxjs/toolkit';
import type { User } from '@/types/interfaces';

type AuthState = {
  user: User | null;
  isAuthenticated: boolean;
  error: string | null;
};

const loadStateFromStorage = (): AuthState => {
  if (typeof window !== "undefined") {
    const raw = sessionStorage.getItem("user");
    let user = null;
    if (raw) {
      try {
        user = JSON.parse(raw);
      } catch {
        sessionStorage.removeItem("user");
      }
    }
    return { user, isAuthenticated: !!user, error: null };
  }
  return { user: null, isAuthenticated: false, error: null };
};

const initialState: AuthState = loadStateFromStorage();

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login(state, action) {
      state.user = action.payload.user;
      state.isAuthenticated = true;
      state.error = null;

      sessionStorage.setItem('user', JSON.stringify(action.payload.user));
    },
    logout(state) {
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;

      sessionStorage.removeItem('user');
    },
    setError(state, action) {
      state.error = action.payload;
    },
  },
});

export const { login, logout, setError } = authSlice.actions;
export default authSlice.reducer;
