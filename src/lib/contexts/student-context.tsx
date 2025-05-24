"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types/user';
import { useUser } from './user-context';
import { getToken } from '../utils/jwt';
import { StudentData } from '../types/student-data';

interface StudentContextType {
  studentProfile: User | null;
  studentData: StudentData | null;
  loading: boolean;
  loadingDetailedInfo: boolean;
  fetchStudentProfile: () => Promise<void>;
}

const StudentContext = createContext<StudentContextType | undefined>(undefined);

export function StudentProvider({ children }: { children: ReactNode }) {
  const [studentProfile, setStudentProfile] = useState<User | null>(null);
  const [studentData, setStudentData] = useState<StudentData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingDetailedInfo, setLoadingDetailedInfo] = useState<boolean>(false);
  const { user } = useUser();

  const fetchDetailedStudentData = async (studentNumber: string) => {
    if (!studentNumber) return;
    setLoadingDetailedInfo(true);
    try {
      const token = getToken();
      if (!token) {
        setStudentData(null);
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
        setStudentData(data);
      } else {
        console.error('Failed to fetch detailed student data:', await response.text());
        setStudentData(null);
      }
    } catch (error) {
      console.error('Error fetching detailed student data:', error);
      setStudentData(null);
    } finally {
      setLoadingDetailedInfo(false);
    }
  };

  const fetchStudentProfile = async (): Promise<void> => {
    if (!user) {
      setStudentProfile(null);
      setStudentData(null);
      return;
    }
    
    const userRole = user.role;
    
    // Only fetch student data if user is a student
    if (userRole !== 'STUDENT' && userRole !== 'ROLE_STUDENT') {
      setStudentProfile(null);
      setStudentData(null);
      return;
    }
    
    setLoading(true);
    setStudentData(null); // Reset detailed data on new profile fetch
    
    try {
      const token = getToken();
      if (!token) {
        setStudentProfile(user); // Use basic user info as fallback
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
        // Merge basic user info from user context with student academic data
        const mergedProfile: User = {
          ...user, // Basic info from user context (userId, email, firstname, lastname, role)
          ...studentAcademicData, // Academic info (department, advisor, gpa, etc.)
        };
        setStudentProfile(mergedProfile);
        // Fetch detailed student data if student number is available
        if (mergedProfile.studentNumber) {
          fetchDetailedStudentData(mergedProfile.studentNumber);
        }
      } else if (response.status === 401) {
        setStudentProfile(user); // Use basic user info as fallback
      } else {
        const errorText = await response.text();
        console.error('Failed to fetch student academic data:', errorText);
        setStudentProfile(user); // Use basic user info as fallback
      }
    } catch (error) {
      console.error('Error fetching student academic data:', error);
      setStudentProfile(user); // Use basic user info as fallback
    }
    
    setLoading(false);
  };

  useEffect(() => {
    if (user) {
      fetchStudentProfile();
    } else {
      setStudentProfile(null);
      setStudentData(null);
    }
  }, [user]);

  const value = {
    studentProfile,
    studentData,
    loading,
    loadingDetailedInfo,
    fetchStudentProfile, 
  };

  return <StudentContext.Provider value={value}>{children}</StudentContext.Provider>;
}

export function useStudent() {
  const context = useContext(StudentContext);
  if (context === undefined) {
    throw new Error('useStudent must be used within a StudentProvider');
  }
  return context;
}
