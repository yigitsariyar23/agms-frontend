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
      
      // Generate mock profile data based on user role
      const mockProfileData: User = {
        ...user,
        studentId: user.role === 'ROLE_STUDENT' ? '2023001' : undefined,
        graduationRequestStatus: user.role === 'ROLE_STUDENT' ? 'NOT_SUBMITTED' : undefined,
        department: 'Computer Engineering',
        advisor: user.role === 'ROLE_STUDENT' ? 'Dr. Jane Smith' : undefined,
        gpa: user.role === 'ROLE_STUDENT' ? 3.5 : undefined,
        creditsCompleted: user.role === 'ROLE_STUDENT' ? 120 : undefined,
        totalCredits: user.role === 'ROLE_STUDENT' ? 240 : undefined,
        semester: user.role === 'ROLE_STUDENT' ? 6 : undefined,
        // Add role-specific data
        ...(user.role === 'ROLE_ADVISOR' && {
          advisees: ['2023001', '2023002', '2023003'],
          department: 'Computer Engineering',
          title: 'Associate Professor'
        }),
        ...(user.role === 'ROLE_DEPARTMENT_SECRETARY' && {
          department: 'Computer Engineering',
          office: 'Room 101',
          phone: '+90 232 123 4567'
        }),
        ...(user.role === 'ROLE_DEANS_OFFICE' && {
          office: 'Dean\'s Office',
          title: 'Dean\'s Office Staff',
          phone: '+90 232 123 4568'
        }),
        ...(user.role === 'ROLE_STUDENT_AFFAIRS' && {
          office: 'Student Affairs Office',
          title: 'Student Affairs Staff',
          phone: '+90 232 123 4569'
        })
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