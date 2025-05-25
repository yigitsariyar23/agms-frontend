"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types/user';
import { useUser } from './user-context';
import { getToken } from '../utils/jwt';
import { SubmissionDetails } from '../types/submission-details';
import { AdvisorList } from '../types/advisor-list';

interface DepartmentSecretaryContextType {
  secretaryProfile: User | null;
  students: SubmissionDetails[];
  advisorLists: AdvisorList[];
  loading: boolean;
  advisorListsLoading: boolean;
  fetchSecretaryProfile: () => Promise<void>;
  fetchStudents: () => Promise<void>;
  fetchAdvisorLists: () => Promise<void>;
  approveStudent: (submissionId: string) => Promise<void>;
  declineStudent: (submissionId: string, reason: string) => Promise<void>;
  finalizeList: () => Promise<void>;
  canFinalize: () => boolean;
  isListFinalized: boolean;
  checkListFinalized: () => Promise<void>;
}

const DepartmentSecretaryContext = createContext<DepartmentSecretaryContextType | undefined>(undefined);

export function DepartmentSecretaryProvider({ children }: { children: ReactNode }) {
  const [secretaryProfile, setSecretaryProfile] = useState<User | null>(null);
  const [students, setStudents] = useState<SubmissionDetails[]>([]);
  const [advisorLists, setAdvisorLists] = useState<AdvisorList[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [advisorListsLoading, setAdvisorListsLoading] = useState<boolean>(false);
  const [isListFinalized, setIsListFinalized] = useState<boolean>(false);
  const { user } = useUser();

  const fetchSecretaryProfile = async (): Promise<void> => {
    if (!user) {
      console.log("user is null");
      setSecretaryProfile(null);
      return;
    }
    
    const userRole = user.role;
    
    // Only fetch secretary data if user is a department secretary
    if (userRole !== 'DEPARTMENT_SECRETARY' && userRole !== 'ROLE_DEPARTMENT_SECRETARY') {
      console.log("user is not a department secretary");
      setSecretaryProfile(null);
      return;
    }

    setLoading(true);
    
    try {
      const token = getToken();
      if (!token) {
        setSecretaryProfile(user); // Use basic user info as fallback
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
        const secretaryData: User = await response.json();
        // Merge basic user info from user context with secretary data
        const mergedProfile: User = {
          ...user, // Basic info from user context
          ...secretaryData, // Secretary-specific info
        };
        setSecretaryProfile(mergedProfile);
      } else if (response.status === 401) {
        setSecretaryProfile(user); // Use basic user info as fallback
      } else {
        const errorText = await response.text();
        console.error('Failed to fetch secretary profile:', errorText);
        setSecretaryProfile(user); // Use basic user info as fallback
      }
    } catch (error) {
      console.error('Error fetching secretary profile:', error);
      setSecretaryProfile(user); // Use basic user info as fallback
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
      
      // Get secretary ID from user context or secretary profile
      const secretaryId = secretaryProfile?.instituteNumber || user?.userId || user?.instituteNumber;

      if (!secretaryId) {
        console.error('No secretary ID available. User properties:', Object.keys(user || {}));
        setLoading(false);
        return;
      }
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/submissions/my-submissions`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      });

      if (response.ok) {
        const apiData = await response.json();
        
        // Transform API response to match SubmissionDetails interface
        const studentsData: SubmissionDetails[] = apiData.map((item: any) => ({
          submissionId: item.submissionId,
          studentNumber: item.studentNumber,
          studentName: item.studentName,
          submissionDate: item.submissionDate || new Date().toISOString(), 
          content: item.content || '', 
          status: item.status, // Assuming API returns a compatible status string
          files: item.files || [],
          advisorListId: item.advisorListId || '', 
          advisorComment: item.advisorComment,
          secretaryComment: item.secretaryComment,
          deanComment: item.deanComment,
          declineReason: item.declineReason,
          graduationStatus: item.graduationStatus,
          graduationComment: item.graduationComment,
        }));
        
        // Enrich students with detailed GPA data if missing
        const enrichedStudentsData = await enrichStudentsWithGPA(studentsData, token);
        
        setStudents(enrichedStudentsData);
      } else {
        const errorText = await response.text();
        if (response.status === 404 || errorText.includes("No static resource")) {
          console.warn('Department secretary API endpoint not implemented yet. Using empty student list.');
          setStudents([]);
        } else {
          console.error('Failed to fetch students:', errorText);
        }
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    }
    
    setLoading(false);
  };

  // Function to enrich students with GPA data from detailed student API
  const enrichStudentsWithGPA = async (students: SubmissionDetails[], token: string): Promise<SubmissionDetails[]> => {
    const enrichedStudents = await Promise.all(
      students.map(async (student) => {
        // If GPA is already available and valid, keep it
        if (student.gpa !== undefined && student.gpa !== null && !isNaN(student.gpa)) {
          return student;
        }

        try {
          // Fetch detailed student data to get GPA
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/students/${student.studentNumber}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            credentials: 'include',
          });

          if (response.ok) {
            const detailedData = await response.json();
            
            return {
              ...student,
              gpa: detailedData.gpa ?? student.gpa,
            };
          } else {
            return student;
          }
        } catch (error) {
          return student;
        }
      })
    );

    return enrichedStudents;
  };

  const fetchAdvisorLists = async (): Promise<void> => {
    if (!user) return;
    
    setAdvisorListsLoading(true);
    
    try {
      const token = getToken();
      if (!token) {
        setAdvisorListsLoading(false);
        return;
      }
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/submissions/subordinate-status`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      });

      if (response.ok) {
        const apiData = await response.json();
        
        // Transform API response to match AdvisorList interface and fetch student counts
        const advisorListsData: AdvisorList[] = await Promise.all(
          apiData.map(async (item: any) => {
            // Fetch student counts for each advisor
            let studentCounts = {
              totalStudents: 0,
              approvedStudents: 0,
              rejectedStudents: 0,
              pendingStudents: 0,
            };

            try {
              const studentResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/submissions/advisor/${item.empId}`, {
                method: 'GET',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`,
                },
                credentials: 'include',
              });

              if (studentResponse.ok) {
                const studentData = await studentResponse.json();
                studentCounts.totalStudents = studentData.length;
                studentCounts.approvedStudents = studentData.filter((s: any) => s.status === 'APPROVED_BY_ADVISOR').length;
                studentCounts.rejectedStudents = studentData.filter((s: any) => s.status === 'REJECTED_BY_ADVISOR').length;
                studentCounts.pendingStudents = studentData.filter((s: any) => s.status === 'PENDING').length;
              }
            } catch (error) {
              console.warn(`Failed to fetch student counts for advisor ${item.empId}:`, error);
            }

            return {
              advisorId: item.empId,
              advisorName: item.name,
              advisorEmail: item.email,
              department: item.department || 'Unknown',
              ...studentCounts,
              isFinalized: item.isFinalized,
              finalizedDate: item.isFinalized ? new Date().toISOString() : undefined,
              lastUpdated: new Date().toISOString(),
            };
          })
        );
        
        setAdvisorLists(advisorListsData);
      } else {
        const errorText = await response.text();
        if (response.status === 404 || errorText.includes("No static resource")) {
          console.warn('Advisor lists API endpoint not implemented yet. Using empty advisor lists.');
          setAdvisorLists([]);
        } else {
          console.error('Failed to fetch advisor lists:', errorText);
        }
      }
    } catch (error) {
      console.error('Error fetching advisor lists:', error);
    }
    
    setAdvisorListsLoading(false);
  };

  const approveStudent = async (submissionId: string): Promise<void> => {
    try {
      const token = getToken();
      if (!token) {
        console.error('No token available');
        return;
      }

      console.log("approving student", submissionId);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/submissions/${submissionId}/approve`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      });

      if (response.ok) {
        setStudents(prev => 
          prev.map(student => 
            student.submissionId === submissionId 
              ? { ...student, status: 'APPROVED_BY_DEPT' } 
              : student
          )
        );
      } else {
        setStudents(prev => 
          prev.map(student => 
            student.submissionId === submissionId 
              ? { ...student, status: 'APPROVED_BY_DEPT' } 
              : student
          )
        );
        console.error('Failed to approve student:', await response.text());
      }
    } catch (error) {
      setStudents(prev => 
        prev.map(student => 
          student.submissionId === submissionId 
            ? { ...student, status: 'APPROVED_BY_DEPT' } 
            : student
        )
      );
      console.error('Error approving student:', error);
    }
  };

  const declineStudent = async (submissionId: string, reason: string): Promise<void> => {
    try {
      const token = getToken();
      if (!token) {
        console.error('No token available');
        return;
      }
      
      const secretaryId = secretaryProfile?.userId || user?.userId;
      
      if (!secretaryId) {
        console.error('No secretary ID available');
        return;
      }
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/submissions/${submissionId}/reject?rejectionReason=${reason}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      });

      if (response.ok) {
        setStudents(prev => 
          prev.map(student => 
            student.submissionId === submissionId 
              ? { ...student, status: 'REJECTED_BY_DEPT', declineReason: reason } 
              : student
          )
        );
      } else {
        setStudents(prev => 
          prev.map(student => 
            student.submissionId === submissionId
              ? { ...student, status: 'REJECTED_BY_DEPT', declineReason: reason } 
              : student
          )
        );
        console.error('Failed to decline student:', await response.text());
      }
    } catch (error) {
      setStudents(prev => 
        prev.map(student => 
          student.submissionId === submissionId 
            ? { ...student, status: 'REJECTED_BY_DEPT', declineReason: reason } 
            : student
        )
      );
      console.error('Error declining student:', error);
    }
  };

  const canFinalize = (): boolean => {
    // Check if all advisor lists are finalized
    const allAdvisorListsFinalized = advisorLists.length > 0 && advisorLists.every(advisor => advisor.isFinalized);
    
    // Check if there are no students with approved or rejected status (only pending or not requested)
    const hasApprovedOrRejectedStudents = students.some(student => 
      student.status === 'APPROVED_BY_DEPT' || 
      student.status === 'REJECTED_BY_DEPT' ||
      student.status === 'APPROVED_BY_ADVISOR' ||
      student.status === 'REJECTED_BY_ADVISOR'
    );
    
    return allAdvisorListsFinalized && !hasApprovedOrRejectedStudents;
  };

  const checkListFinalized = async (): Promise<void> => {
    try {
      const token = getToken();
      if (!token) {
        console.error('No token available');
        return;
      }
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/submissions/my-list/finalized`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setIsListFinalized(data || false);
      } else {
        console.error('Failed to check list finalized status:', await response.text());
        // Keep current state if API call fails
      }
    } catch (error) {
      console.error('Error checking list finalized status:', error);
      // Keep current state if API call fails
    }
  };

  const finalizeList = async (): Promise<void> => {
    // Validate finalization conditions
    if (!canFinalize()) {
      const allAdvisorListsFinalized = advisorLists.length > 0 && advisorLists.every(advisor => advisor.isFinalized);
      const hasApprovedOrRejectedStudents = students.some(student => 
        student.status === 'APPROVED_BY_DEPT' || 
        student.status === 'REJECTED_BY_DEPT' ||
        student.status === 'APPROVED_BY_ADVISOR' ||
        student.status === 'REJECTED_BY_ADVISOR'
      );
      
      if (!allAdvisorListsFinalized) {
        throw new Error('All advisor lists must be finalized before department list can be finalized');
      }
      
      if (hasApprovedOrRejectedStudents) {
        throw new Error('Cannot finalize list while there are students with approved or rejected status');
      }
      
      return;
    }

    try {
      const token = getToken();
      if (!token) {
        console.error('No token available');
        return;
      }
      
      const secretaryId = secretaryProfile?.userId || user?.userId;
      
      if (!secretaryId) {
        console.error('No secretary ID available');
        return;
      }
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/submissions/finalize-my-list`, {
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
        setIsListFinalized(true);
        console.error('Failed to finalize list:', await response.text());
      }
    } catch (error) {
      setIsListFinalized(true);
      console.error('Error finalizing list:', error);
    }
  };

  useEffect(() => {
    if (user && (user.role === 'DEPARTMENT_SECRETARY' || user.role === 'ROLE_DEPARTMENT_SECRETARY')) {
      fetchSecretaryProfile();
    } else {
      setSecretaryProfile(null);
      setStudents([]);
    }
  }, [user]);

  useEffect(() => {
    if (secretaryProfile && user && (user.role === 'DEPARTMENT_SECRETARY' || user.role === 'ROLE_DEPARTMENT_SECRETARY')) {
      fetchStudents();
      fetchAdvisorLists();
      checkListFinalized();
    }
  }, [secretaryProfile]);

  const value = {
    secretaryProfile,
    students,
    advisorLists,
    loading,
    advisorListsLoading,
    fetchSecretaryProfile,
    fetchStudents,
    fetchAdvisorLists,
    approveStudent,
    declineStudent,
    finalizeList,
    canFinalize,
    isListFinalized,
    checkListFinalized,
  };

  return <DepartmentSecretaryContext.Provider value={value}>{children}</DepartmentSecretaryContext.Provider>;
}

export function useDepartmentSecretary() {
  const context = useContext(DepartmentSecretaryContext);
  if (context === undefined) {
    throw new Error('useDepartmentSecretary must be used within a DepartmentSecretaryProvider');
  }
  return context;
} 