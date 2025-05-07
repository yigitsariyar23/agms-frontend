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
      const token = getToken();
      
      if (!token) {
        setUserProfile(null);
        return;
      }
      
      const response = await fetch('http://localhost:8080/api/users/profile', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include', // Include cookies for authentication
      });

      if (response.ok) {
        const profileData = await response.json();
        console.log(profileData);
        setUserProfile(profileData);
      } else if (response.status === 401) {
        // Handle unauthorized
        setUserProfile(null);
      } else {
        console.error('Failed to fetch user profile:', await response.text());
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
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