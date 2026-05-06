import { describe, it, expect, vi, beforeEach } from 'vitest';
import reducer, { login, logout } from '@/components/redux/slices/slice_auth';

// Mock sessionStorage
const storage: Record<string, string> = {};
vi.stubGlobal('sessionStorage', {
  getItem: (key: string) => storage[key] ?? null,
  setItem: (key: string, value: string) => { storage[key] = value; },
  removeItem: (key: string) => { delete storage[key]; },
});

beforeEach(() => {
  Object.keys(storage).forEach((k) => delete storage[k]);
});

describe('authSlice', () => {
  const mockUser = {
    id: '123',
    phone: '+1234567890',
    email: 'test@example.com',
    full_name: 'Test User',
    profession: 'developer',
    profile_complete: true,
    created_at: '2024-01-01T00:00:00Z',
  };

  it('should handle login', () => {
    const initialState = { user: null, isAuthenticated: false, error: null };
    const nextState = reducer(initialState, login({ user: mockUser }));

    expect(nextState.user).toEqual(mockUser);
    expect(nextState.isAuthenticated).toBe(true);
    expect(nextState.error).toBeNull();
    expect(storage['user']).toBe(JSON.stringify(mockUser));
  });

  it('should handle logout', () => {
    const loggedInState = { user: mockUser, isAuthenticated: true, error: null };
    storage['user'] = JSON.stringify(mockUser);

    const nextState = reducer(loggedInState, logout());

    expect(nextState.user).toBeNull();
    expect(nextState.isAuthenticated).toBe(false);
    expect(storage['user']).toBeUndefined();
  });

  it('should not have token in state', () => {
    const initialState = { user: null, isAuthenticated: false, error: null };
    expect(initialState).not.toHaveProperty('token');
  });
});
