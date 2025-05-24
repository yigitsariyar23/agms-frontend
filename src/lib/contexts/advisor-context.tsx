"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types/user';
import { useUser } from './user-context';
import { getToken } from '../utils/jwt';

export interface AdvisorStudent {
  id: string;
  studentNumber: string;
  name: string;
  email: string;
  department: string;
  gpa?: number;
  curriculum?: string;
  credits?: number;
  status: "Approved" | "Declined" | "Pending";
  files?: string[];
  advisorComment?: string;
  secretaryComment?: string;
  deanComment?: string;
  declineReason?: string;
  graduationStatus?: string;
  graduationComment?: string;
  totalCredits?: number;
  creditsCompleted?: number;
  semester?: number;
}

interface AdvisorContextType {
  advisorProfile: User | null;
  students: AdvisorStudent[];
  loading: boolean;
  fetchAdvisorProfile: () => Promise<void>;
  fetchStudents: () => Promise<void>;
  approveStudent: (studentId: string) => Promise<void>;
  declineStudent: (studentId: string, reason: string) => Promise<void>;
  finalizeList: () => Promise<void>;
  isListFinalized: boolean;
}

const AdvisorContext = createContext<AdvisorContextType | undefined>(undefined);

export function AdvisorProvider({ children }: { children: ReactNode }) {
  const [advisorProfile, setAdvisorProfile] = useState<User | null>(null);
  const [students, setStudents] = useState<AdvisorStudent[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [isListFinalized, setIsListFinalized] = useState<boolean>(false);
  const { user } = useUser();

  const fetchAdvisorProfile = async (): Promise<void> => {
    if (!user) {
      console.log("user is null");
      setAdvisorProfile(null);
      return;
    }
    
    const userRole = user.role;
    
    // Only fetch advisor data if user is an advisor
    if (userRole !== 'ADVISOR' && userRole !== 'ROLE_ADVISOR') {
      console.log("user is not an advisor");
      setAdvisorProfile(null);
      return;
    }
    

    setLoading(true);
    
    try {
      const token = getToken();
      if (!token) {
        setAdvisorProfile(user); // Use basic user info as fallback
        setLoading(false);
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
        const advisorData: User = await response.json();
        // Merge basic user info from user context with advisor data
        const mergedProfile: User = {
          ...user, // Basic info from user context
          ...advisorData, // Advisor-specific info
        };
        setAdvisorProfile(mergedProfile);
      } else if (response.status === 401) {
        setAdvisorProfile(user); // Use basic user info as fallback
      } else {
        const errorText = await response.text();
        console.error('Failed to fetch advisor profile:', errorText);
        setAdvisorProfile(user); // Use basic user info as fallback
      }
    } catch (error) {
      console.error('Error fetching advisor profile:', error);
      setAdvisorProfile(user); // Use basic user info as fallback
    }
    
    setLoading(false);
  };

  const fetchStudents = async (): Promise<void> => {
    if (!user) return;
    
    setLoading(true);
    
    try {
      const token = getToken();
      if (!token) {
        setLoading(false);
        return;
      }
      
      // Get advisor ID from user context or advisor profile (consistent with other functions)
      const advisorId = advisorProfile?.instituteNumber || user?.userId || user?.instituteNumber;

      if (!advisorId) {
        console.error('No advisor ID available. User properties:', Object.keys(user || {}));
        setLoading(false);
        return;
      }
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/submissions/advisor/${advisorId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      });

      if (response.ok) {
        const apiData = await response.json();
        
        // Transform API response to match AdvisorStudent interface
        const studentsData: AdvisorStudent[] = apiData.map((item: any) => ({
          id: item.submissionId,
          studentNumber: item.studentNumber,
          name: item.studentName,
          email: item.email || '',
          department: item.department || '',
          gpa: item.gpa,
          curriculum: item.curriculum,
          credits: item.credits,
          status: item.status === 'PENDING' ? 'Pending' as const : 
                  item.status === 'APPROVED' ? 'Approved' as const : 
                  item.status === 'DECLINED' ? 'Declined' as const : 'Pending' as const,
          files: item.files || [],
          advisorComment: item.advisorComment,
          secretaryComment: item.secretaryComment,
          deanComment: item.deanComment,
          declineReason: item.declineReason,
          graduationStatus: item.graduationStatus,
          graduationComment: item.graduationComment,
          totalCredits: item.totalCredits,
          creditsCompleted: item.creditsCompleted,
          semester: item.semester,
        }));
        
        setStudents(studentsData);
      } else {
        const errorText = await response.text();
        console.error('Failed to fetch students:', errorText);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    }
    
    setLoading(false);
  };

  const approveStudent = async (studentId: string): Promise<void> => {
    try {
      const token = getToken();
      if (!token) {
        console.error('No token available');
        return;
      }
      
      // Get advisor ID from user context or advisor profile
      const advisorId = advisorProfile?.userId || user?.userId;
      
      if (!advisorId) {
        console.error('No advisor ID available');
        return;
      }
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/submissions/advisor/${advisorId}/student/${studentId}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      });

      if (response.ok) {
        setStudents(prev => 
          prev.map(student => 
            student.id === studentId 
              ? { ...student, status: 'Approved' as const }
              : student
          )
        );
      } else {
        // Update local state even if API fails (for development)
        setStudents(prev => 
          prev.map(student => 
            student.id === studentId 
              ? { ...student, status: 'Approved' as const }
              : student
          )
        );
        console.error('Failed to approve student:', await response.text());
      }
    } catch (error) {
      // Update local state even if API fails (for development)
      setStudents(prev => 
        prev.map(student => 
          student.id === studentId 
            ? { ...student, status: 'Approved' as const }
            : student
        )
      );
      console.error('Error approving student:', error);
    }
  };

  const declineStudent = async (studentId: string, reason: string): Promise<void> => {
    try {
      const token = getToken();
      if (!token) {
        console.error('No token available');
        return;
      }
      
      // Get advisor ID from user context or advisor profile
      const advisorId = advisorProfile?.userId || user?.userId;
      
      if (!advisorId) {
        console.error('No advisor ID available');
        return;
      }
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/submissions/advisor/${advisorId}/student/${studentId}/decline`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
        body: JSON.stringify({ reason }),
      });

      if (response.ok) {
        setStudents(prev => 
          prev.map(student => 
            student.id === studentId 
              ? { ...student, status: 'Declined' as const, declineReason: reason }
              : student
          )
        );
      } else {
        // Update local state even if API fails (for development)
        setStudents(prev => 
          prev.map(student => 
            student.id === studentId 
              ? { ...student, status: 'Declined' as const, declineReason: reason }
              : student
          )
        );
        console.error('Failed to decline student:', await response.text());
      }
    } catch (error) {
      // Update local state even if API fails (for development)
      setStudents(prev => 
        prev.map(student => 
          student.id === studentId 
            ? { ...student, status: 'Declined' as const, declineReason: reason }
            : student
        )
      );
      console.error('Error declining student:', error);
    }
  };

  const finalizeList = async (): Promise<void> => {
    try {
      const token = getToken();
      if (!token) {
        console.error('No token available');
        return;
      }
      
      // Get advisor ID from user context or advisor profile
      const advisorId = advisorProfile?.userId || user?.userId;
      
      if (!advisorId) {
        console.error('No advisor ID available');
        return;
      }
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/submissions/advisor/${advisorId}/finalize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      });

      if (response.ok) {
        setIsListFinalized(true);
      } else {
        // Update local state even if API fails (for development)
        setIsListFinalized(true);
        console.error('Failed to finalize list:', await response.text());
      }
    } catch (error) {
      // Update local state even if API fails (for development)
      setIsListFinalized(true);
      console.error('Error finalizing list:', error);
    }
  };

  useEffect(() => {
    if (user && (user.role === 'ADVISOR' || user.role === 'ROLE_ADVISOR')) {
      fetchAdvisorProfile();
    } else {
      setAdvisorProfile(null);
      setStudents([]);
    }
  }, [user]);

  // Fetch students after advisor profile has been loaded
  useEffect(() => {
    if (advisorProfile && user && (user.role === 'ADVISOR' || user.role === 'ROLE_ADVISOR')) {
      fetchStudents();
    }
  }, [advisorProfile]);

  const value = {
    advisorProfile,
    students,
    loading,
    fetchAdvisorProfile,
    fetchStudents,
    approveStudent,
    declineStudent,
    finalizeList,
    isListFinalized,
  };

  return <AdvisorContext.Provider value={value}>{children}</AdvisorContext.Provider>;
}

export function useAdvisor() {
  const context = useContext(AdvisorContext);
  if (context === undefined) {
    throw new Error('useAdvisor must be used within an AdvisorProvider');
  }
  return context;
} 