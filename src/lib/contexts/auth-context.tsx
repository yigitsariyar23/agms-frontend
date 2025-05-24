"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types/user';
import { useAuthStore } from '../store/auth-store';
import { getToken, withAuth } from '../utils/jwt';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
  confirmLogout: () => void;
  showLogoutConfirm: boolean;
  setShowLogoutConfirm: (show: boolean) => void;
  navigateToResetPasswordRequest: (email: string) => Promise<{ success: boolean; message: string }>;
  fetchUserProfile: (token: string) => Promise<User | null>;
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
    // Initialize auth state from cookies and fetch profile if token exists
    const initAuth = async () => {
      await initialize(); // initialize will set token and potentially basic user info from token
      const currentToken = getToken();
      if (currentToken && !user) { // If token exists but user not fully loaded by store's init
        setLoading(true);
        await fetchUserProfile(currentToken);
        setLoading(false);
      }
      setLoading(false); 
    };
    initAuth();
  }, [initialize]); // Removed user from dependency array to avoid re-triggering fetchUserProfile unnecessarily

  const fetchUserProfile = async (token: string): Promise<User | null> => {
    try {
      const profileResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        console.log('User profile data received:', profileData);
        
        // Now we get all basic user info including firstname, lastname, role
        const userData: User = {
          userId: profileData.userId || '',
          email: profileData.email || '',
          firstname: profileData.firstname || '',
          lastname: profileData.lastname || '',
          role: profileData.role,
          studentNumber: profileData.studentNumber, // Include if user is a student
        };
        setUser(userData);
        return userData;
      } else {
        console.error("Failed to fetch user profile", profileResponse.statusText);
        return null;
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      return null;
    }
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; message: string }> => {
    setLoading(true);
    setStoreLoading(true);
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
      
      if (response.ok && data.token) {
        setToken(data.token); // Store token in cookie via auth-store
        
        // Fetch user role using the new token
        const userProfile = await fetchUserProfile(data.token);

        if (userProfile) {
          return { success: true, message: data.message || "Login successful!" };
        } else {
          // If role fetch failed after successful login and token retrieval
          clearAuth(); // Clear the potentially bad token
          return { success: false, message: "Login succeeded but failed to fetch user role." };
        }
      } else {
        return { success: false, message: data.message || "Login failed" };
      }
    } catch (networkError) {
      console.error('Network error during login:', networkError);
      return { 
        success: false, 
        message: "Cannot connect to the server. Please ensure the backend server is running."
      };
    } finally {
      setLoading(false);
      setStoreLoading(false);
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
      setUser(null); // Explicitly set user to null in context's view if not already handled by clearAuth listener
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
    user,
    loading,
    login,
    logout,
    confirmLogout,
    showLogoutConfirm,
    setShowLogoutConfirm,
    navigateToResetPasswordRequest,
    fetchUserProfile, // expose fetchUserProfile if needed elsewhere, or keep it internal
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