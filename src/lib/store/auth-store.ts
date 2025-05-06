import { create } from 'zustand';
import { User } from '../types/user';
import { setCookie, removeCookie } from '../utils/cookies';
import { getToken, getUserFromToken, isTokenExpired } from '../utils/jwt';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  token: string | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setLoading: (loading: boolean) => void;
  initialize: () => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  token: null,
  loading: true,
  
  setUser: (user: User | null) => {
    set({ user, isAuthenticated: !!user });
  },
  
  setToken: (token: string | null) => {
    if (token) {
      // Save the token to cookie
      setCookie('jwt_token', token);
      
      // Extract user info from token if available
      const tokenData = getUserFromToken(token);
      const user = tokenData?.user as User | undefined;
      
      const updateData: Partial<AuthState> = { 
        token, 
        isAuthenticated: true
      };
      
      if (user) {
        updateData.user = user;
      }
      
      set(updateData);
    } else {
      removeCookie('jwt_token');
      set({ token: null, isAuthenticated: false });
    }
  },
  
  setLoading: (loading: boolean) => {
    set({ loading });
  },
  
  initialize: () => {
    const token = getToken();
    if (token && !isTokenExpired(token)) {
      // Valid token exists
      const tokenData = getUserFromToken(token);
      
      const updateData: Partial<AuthState> = {
        token,
        isAuthenticated: true,
        loading: false
      };
      
      if (tokenData?.user) {
        updateData.user = tokenData.user as User;
      }
      
      set(updateData);
    } else if (token && isTokenExpired(token)) {
      // Token exists but expired
      removeCookie('jwt_token');
      set({ isAuthenticated: false, user: null, token: null, loading: false });
    } else {
      // No token
      set({ isAuthenticated: false, user: null, token: null, loading: false });
    }
  },
  
  clearAuth: () => {
    removeCookie('jwt_token');
    set({ user: null, token: null, isAuthenticated: false });
  }
})); 