"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types/user';
import { useAuthStore } from '../store/auth-store';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
  confirmLogout: () => void;
  showLogoutConfirm: boolean;
  setShowLogoutConfirm: (show: boolean) => void;
  navigateToResetPasswordRequest: (email: string) => Promise<{ success: boolean; message: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const { 
    user, 
    setUser, 
    setToken, 
    setLoading: setStoreLoading, 
    initialize,
    clearAuth 
  } = useAuthStore();

  useEffect(() => {
    // Initialize auth state from cookies
    initialize();
    setLoading(false);
  }, [initialize]);

  const login = async (email: string, password: string): Promise<{ success: boolean; message: string }> => {
    try {
      setLoading(true);
      setStoreLoading(true);
      
      // Mock authentication - accept any credentials
      const mockToken = 'mock-jwt-token-' + Math.random().toString(36).substring(7);
      setToken(mockToken);
      
      // Create mock user data
      const mockUserData: User = {
        id: '1',
        email: email,
        firstName: email.split('@')[0] || 'John',
        lastName: 'Doe',
        role: 'ROLE_STUDENT'
      };
      
      setUser(mockUserData);
      return { success: true, message: "Mock login successful!" };
      
    } catch (error) {
      console.error('Login failed:', error);
      return { success: false, message: "Login failed due to an unexpected error." };
    } finally {
      setLoading(false);
      setStoreLoading(false);
    }
  };

  const confirmLogout = () => {
    setShowLogoutConfirm(true);
  };

  const logout = async () => {
    try {
      setLoading(true);
      setStoreLoading(true);
      
      // Clear auth state and remove JWT cookie
      clearAuth();
      
      // Additional backend logout if needed
      try {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });
      } catch (error) {
        console.error('Logout API call failed:', error);
        // Continue with logout even if API call fails
      }
      
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    } finally {
      setLoading(false);
      setStoreLoading(false);
      setShowLogoutConfirm(false);
    }
  };

  const navigateToResetPasswordRequest = async (email: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/navigate-to-reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        return { success: true, message: "Password reset request sent successfully. Please check your email for the reset link." };
      } else {
        return { success: false, message: "Failed to send password reset request." };
      }
    } catch (error) {
      console.error('Password reset request failed:', error);
      return { success: false, message: "Password reset request failed due to an unexpected error." };
    }
  };

  const value = {
    user,
    loading,
    login,
    logout,
    confirmLogout,
    showLogoutConfirm,
    setShowLogoutConfirm,
    navigateToResetPasswordRequest,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 