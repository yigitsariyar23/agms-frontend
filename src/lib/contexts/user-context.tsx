"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types/user';
import { useAuth } from './auth-context';
import { getToken } from '../utils/jwt';

interface UserContextType {
  userProfile: User | null;
  loading: boolean;
  fetchUserProfile: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const { user } = useAuth();

  const fetchUserProfile = async (): Promise<void> => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Mock user profile data
      const mockProfileData: User = {
        ...user,  // Use the base user data from auth context
        studentId: '2023001',  // Mock student ID
        graduationRequestStatus: 'NOT_SUBMITTED'  // Mock graduation status
      };
      
      setUserProfile(mockProfileData);
      
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setUserProfile(null);
    } finally {
      setLoading(false);
    }
  };
  // Fetch user profile when auth user changes
  useEffect(() => {
    if (user) {
      fetchUserProfile();
    } else {
      setUserProfile(null);
    }
  }, [user]);

  const value = {
    userProfile,
    loading,
    fetchUserProfile,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
} 