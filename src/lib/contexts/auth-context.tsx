"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuthStore } from '../store/auth-store';
import { getToken, withAuth } from '../utils/jwt';

interface AuthContextType {
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
  confirmLogout: () => void;
  showLogoutConfirm: boolean;
  setShowLogoutConfirm: (show: boolean) => void;
  navigateToResetPasswordRequest: (email: string) => Promise<{ success: boolean; message: string }>;
  token: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setTokenState] = useState<string | null>(null);
  const { 
    setToken, 
    setLoading: setStoreLoading, 
    initialize,
    clearAuth 
  } = useAuthStore();

  useEffect(() => {
    // Initialize auth state from cookies
    const initAuth = async () => {
      await initialize();
      const currentToken = getToken();
      setTokenState(currentToken);
      setIsAuthenticated(!!currentToken);
      setLoading(false);
    };
    initAuth();
  }, [initialize]);

  const login = async (email: string, password: string): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      });
      
      const data = await response.json();
      
      if (response.status === 200 && data.token) {
        setToken(data.token); // Store token in cookie via auth-store
        setTokenState(data.token);
        setIsAuthenticated(true);
        return { success: true, message: data.message || "Login successful!" };
      } else if (response.status === 404) {
        return { success: false, message: data.message || "User not found." };
      } else if (response.status === 403) {
        return { success: false, message: data.message || "Invalid credentials." };
      } else {
        return { success: false, message: data.message || `Login failed with status: ${response.status}` };
      }
    } catch (networkError) {
      console.error('Network error during login:', networkError);
      return { 
        success: false, 
        message: "Cannot connect to the server. Please ensure the backend server is running."
      };
    }
  };

  const confirmLogout = () => {
    setShowLogoutConfirm(true);
  };

  const logout = async () => {
    setLoading(true);
    setStoreLoading(true);
    try {
      const currentToken = getToken();
      if (currentToken) {
        try {
          await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/logout`, {
            method: 'POST',
            headers: withAuth().headers, // Use withAuth to include Authorization header
          });
        } catch (error) {
          console.error('Logout API call failed:', error);
          // Continue with client-side logout even if API call fails
        }
      }
    } catch (error) {
      console.error('Error during logout prep:', error);
    } finally {
      clearAuth(); // Clear auth state and remove JWT cookie from store
      setTokenState(null);
      setIsAuthenticated(false);
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

      const data = await response.json(); // Assuming backend sends a JSON response
      if (response.ok) {
        return { success: true, message: data.message || "Password reset request sent successfully. Please check your email for the reset link." };
      } else {
        return { success: false, message: data.message || "Failed to send password reset request." };
      }
    } catch (error) {
      console.error('Password reset request failed:', error);
      return { success: false, message: "Password reset request failed due to an unexpected error." };
    }
  };

  const value = {
    isAuthenticated,
    loading,
    login,
    logout,
    confirmLogout,
    showLogoutConfirm,
    setShowLogoutConfirm,
    navigateToResetPasswordRequest,
    token,
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