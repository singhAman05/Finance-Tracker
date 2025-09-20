import { createSlice } from '@reduxjs/toolkit';

interface User {
  id: string;
  phone: string;
  email: string;
  full_name: string;
  profession: string;
  profile_complete: boolean;
  created_at: string;
}

type AuthState = {
  token: string | null;
  user: User | null;
  error: string | null;
};

const loadStateFromLocalStorage = (): AuthState => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("jwt");
    const user = localStorage.getItem("user");
    return {
      token: token || null,
      user: user ? JSON.parse(user) : null,
      error: null,
    };
  }
  return { token: null, user: null, error: null };
};

const initialState: AuthState = loadStateFromLocalStorage();

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login(state, action) {
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.error = null;

      // Save to localStorage
      localStorage.setItem('jwt', action.payload.token);
      localStorage.setItem('user', JSON.stringify(action.payload.user));
    },
    logout(state) {
      state.token = null;
      state.user = null;
      state.error = null;

      // Remove from localStorage
      localStorage.removeItem('jwt');
      localStorage.removeItem('user');
    },
    setError(state, action) {
      state.error = action.payload;
    },
  },
});

export const { login, logout, setError } = authSlice.actions;
export default authSlice.reducer;
