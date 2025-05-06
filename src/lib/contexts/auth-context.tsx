"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types/user';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<{ success: boolean; message: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on mount
    // This is where you would typically check for a stored token
    // and validate it with your backend
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; message: string }> => {
    try {
      setLoading(true);
      // Check if backend is available
      try {
        const response = await fetch('http://localhost:8080/api/auth/login', {
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
        
        if (response.ok) {
          // Create a default user if the backend doesn't return user data
          setUser({
            id: data.id || '1',
            email,
            firstName: data.firstName || email,
            lastName: data.lastName || email,
            role: data.role || 'student'
          });
          return { success: true, message: data.message || "Login successful!" };
        } else {
          return { success: false, message: data.message || "Login failed" };
        }
      } catch (networkError) {
        console.error('Network error:', networkError);
        return { 
          success: false, 
          message: "Cannot connect to the server. Please ensure the backend server is running at http://localhost:8080."
        };
      }
    } catch (error) {
      console.error('Login failed:', error);
      return { success: false, message: "Login failed due to an unexpected error." };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Implement your logout logic here
      setLoading(true);
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string): Promise<{ success: boolean; message: string }> => {
    try {
      setLoading(true);
      // Check if backend is available
      try {
        const response = await fetch('http://localhost:8080/api/auth/register', {
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
        
        if (response.ok) {
          // Create a default user if the backend doesn't return user data
          setUser({
            id: data.id || '1',
            email,
            firstName: data.firstName || email,
            lastName: data.lastName || email,
            role: data.role || 'student'
          });
          return { success: true, message: data.message || "Login successful!" };
        } else {
          return { success: false, message: data.message || "Login failed" };
        }
      } catch (networkError) {
        console.error('Network error:', networkError);
        return { 
          success: false, 
          message: "Cannot connect to the server. Please ensure the backend server is running at http://localhost:8080."
        };
      }
    } catch (error) {
      console.error('Login failed:', error);
      return { success: false, message: "Login failed due to an unexpected error." };
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    login,
    logout,
    register,
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