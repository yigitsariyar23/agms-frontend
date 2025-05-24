"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types/user';
import { useAuth } from './auth-context';
import { getToken } from '../utils/jwt';

interface UserContextType {
  user: User | null;
  userProfile: User | null;
  loading: boolean;
  fetchUserProfile: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const { isAuthenticated, token } = useAuth();

  const fetchUserProfile = async (): Promise<void> => {
    if (!isAuthenticated || !token) {
      setUser(null);
      setUserProfile(null);
      return;
    }
    
    setLoading(true);
    
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
        
        // Get all basic user info including firstname, lastname, role
        const userData: User = {
          userId: profileData.userId || '',
          email: profileData.email || '',
          firstname: profileData.firstname || '',
          lastname: profileData.lastname || '',
          role: profileData.role,
          studentNumber: profileData.studentNumber, // Include if user is a student
        };
        
        setUser(userData);
        setUserProfile(userData);
        console.log(`User role ${userData.role} profile loaded from API`);
      } else {
        console.error("Failed to fetch user profile", profileResponse.statusText);
        setUser(null);
        setUserProfile(null);
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      setUser(null);
      setUserProfile(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && token) {
      fetchUserProfile();
    } else {
      setUser(null);
      setUserProfile(null);
    }
  }, [isAuthenticated, token]);

  const value = {
    user,
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