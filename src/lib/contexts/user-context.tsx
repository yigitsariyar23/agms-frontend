"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Role as UserRole } from '../types/user'; // Assuming Role is exported from user.ts
import { useAuth } from './auth-context';
import { getToken } from '../utils/jwt';

// Define a type for the advisor object nested in detailed student data
interface AdvisorDetails {
  id?: string;
  firstName?: string;
  lastName?: string;
  // Add other advisor fields if available and needed
}

// Define a type for the detailed student data from /api/ubys/student/{studentNumber}/complete
// This should ideally match the structure of com.agms.backend.model.users.Student
export interface DetailedStudentData {
  studentNumber?: string;
  gpa?: number;
  totalCredit?: number; // This is 'creditsCompleted' from Student.java
  semester?: number;
  department?: string; // Assuming Student.java will have department
  advisor?: AdvisorDetails | null; 
  // Add other fields like courses if needed by any component
  // graduationRequestStatus might also come from here or be derived
}

interface UserContextType {
  userProfile: User | null;
  detailedStudentData: DetailedStudentData | null;
  loading: boolean; // Combined loading state for initial profile
  loadingDetailedInfo: boolean; // Separate loading state for detailed info
  fetchUserProfile: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [detailedStudentData, setDetailedStudentData] = useState<DetailedStudentData | null>(null);
  const [loading, setLoading] = useState<boolean>(false); // For initial userProfile fetch
  const [loadingDetailedInfo, setLoadingDetailedInfo] = useState<boolean>(false);
  const { user } = useAuth();

  const fetchDetailedStudentData = async (studentNumber: string) => {
    if (!studentNumber) return;
    setLoadingDetailedInfo(true);
    try {
      const token = getToken();
      if (!token) {
        setDetailedStudentData(null);
        return;
      }
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/ubys/student/${studentNumber}/complete`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setDetailedStudentData(data);
      } else {
        console.error('Failed to fetch detailed student data:', await response.text());
        setDetailedStudentData(null);
      }
    } catch (error) {
      console.error('Error fetching detailed student data:', error);
      setDetailedStudentData(null);
    } finally {
      setLoadingDetailedInfo(false);
    }
  };

  const fetchUserProfile = async (): Promise<void> => {
    if (!user) {
      setUserProfile(null);
      setDetailedStudentData(null);
      return;
    }
    
    setLoading(true);
    setDetailedStudentData(null); // Reset detailed data on new profile fetch
    try {
      const token = getToken();
      if (!token) {
        setUserProfile(null);
        return;
      }
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/profile`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      });

      if (response.ok) {
        const profileData: User = await response.json();
        setUserProfile(profileData);
        // If user is a student and has a student number, fetch detailed data
        if (profileData.role === 'ROLE_STUDENT' && profileData.studentNumber) {
          fetchDetailedStudentData(profileData.studentNumber);
        }
      } else if (response.status === 401) {
        setUserProfile(null);
      } else {
        console.error('Failed to fetch user profile:', await response.text());
        setUserProfile(null); // Set to null on other errors too
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setUserProfile(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchUserProfile();
    } else {
      setUserProfile(null);
      setDetailedStudentData(null);
    }
  }, [user]);

  const value = {
    userProfile,
    detailedStudentData,
    loading,
    loadingDetailedInfo,
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