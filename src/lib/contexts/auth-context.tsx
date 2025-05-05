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
      // Implement your login logic here
      // This is where you would typically make an API call to your backend
      setLoading(true);
      // Mock login for now - replace with actual API call and response handling
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate delay
      
      // Example: Check credentials (replace with actual backend check)
      if (password === "123123") { // Example success condition
          setUser({
            id: '1',
            email,
            name: 'Test User',
            role: 'student'
          });
          return { success: true, message: "Login successful!" };
      } else {
          return { success: false, message: "Invalid credentials (simulated)." };
      }

    } catch (error) {
      console.error('Login failed:', error);
      // Return error state
      return { success: false, message: "Login failed due to an unexpected error." }; 
      // Optionally rethrow if the caller should handle it differently
      // throw error; 
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
    // TODO: Implement actual registration API call
    console.log("Registering:", { email, name });
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000)); 

    // Simulate success - replace with actual API response handling
    // Example: Check if email already exists, handle backend errors, etc.
    if (email.includes("fail")) { // Example failure condition
      return { success: false, message: "Registration failed (simulated)." };
    }

    return { success: true, message: "Registration successful!" };
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