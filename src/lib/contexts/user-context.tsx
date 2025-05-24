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
    
    const userRole = user.role;
    
    // Now auth context provides complete basic user info for everyone
    // For students, we also fetch additional academic data
    if (userRole === 'STUDENT' || userRole === 'ROLE_STUDENT') {
      try {
        const token = getToken();
        if (!token) {
          setUserProfile(user); // Use basic auth info as fallback
          setLoading(false);
          return;
        }
        
        console.log('Fetching student academic data from: /api/students/profile');
        
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/students/profile`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          credentials: 'include',
        });

        if (response.ok) {
          const studentAcademicData: User = await response.json();
          // Merge basic user info from auth context with student academic data
          const mergedProfile: User = {
            ...user, // Basic info from auth context (userId, email, firstname, lastname, role)
            ...studentAcademicData, // Academic info (department, advisor, gpa, etc.)
          };
          setUserProfile(mergedProfile);
          // Fetch detailed student data if student number is available
          if (mergedProfile.studentNumber) {
            fetchDetailedStudentData(mergedProfile.studentNumber);
          }
        } else if (response.status === 401) {
          setUserProfile(user); // Use basic auth info as fallback
        } else {
          const errorText = await response.text();
          console.error('Failed to fetch student academic data:', errorText);
          setUserProfile(user); // Use basic auth info as fallback
        }
      } catch (error) {
        console.error('Error fetching student academic data:', error);
        setUserProfile(user); // Use basic auth info as fallback
      }
    } else {
      // For non-student roles, use the complete basic info from auth context
      console.log(`User role ${userRole} using basic profile from auth context`);
      setUserProfile(user); // Auth context now provides complete basic user info
    }
    
    setLoading(false);
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