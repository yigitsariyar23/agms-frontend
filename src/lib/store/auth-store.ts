import { create } from 'zustand';
import { User } from '../types/user';
import { setCookie, removeCookie, getCookie } from '../utils/cookies';
import { decodeToken, isTokenExpired } from '../utils/jwt';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  token: string | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setLoading: (loading: boolean) => void;
  initialize: () => Promise<void>;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  token: null,
  loading: true,
  
  setUser: (user: User | null) => {
    set({ user, isAuthenticated: !!user, loading: false });
  },
  
  setToken: (token: string | null) => {
    if (token) {
      setCookie('jwt_token', token);
      set({ token, isAuthenticated: true });
    } else {
      removeCookie('jwt_token');
      set({ token: null, isAuthenticated: false, user: null });
    }
  },
  
  setLoading: (loading: boolean) => {
    set({ loading });
  },
  
  initialize: async () => {
    set({ loading: true });
    const tokenFromCookie = getCookie('jwt_token');

    if (tokenFromCookie && !isTokenExpired(tokenFromCookie)) {
      set({
        token: tokenFromCookie,
        isAuthenticated: true,
        loading: false
      });
    } else {
      if (tokenFromCookie) {
        removeCookie('jwt_token');
      }
      set({ isAuthenticated: false, user: null, token: null, loading: false });
    }
  },
  
  clearAuth: () => {
    removeCookie('jwt_token');
    set({ user: null, token: null, isAuthenticated: false, loading: false });
  }
})); 