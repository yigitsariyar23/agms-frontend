"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types/user';
import { useUser } from './user-context';
import { getToken } from '../utils/jwt';
import { SubmissionDetails } from '../types/submission-details';
import { DepartmentList } from '../types/department-list';

interface DeansOfficeContextType {
  deanProfile: User | null;
  students: SubmissionDetails[];
  departmentLists: DepartmentList[];
  loading: boolean;
  departmentListsLoading: boolean;
  fetchDeanProfile: () => Promise<void>;
  fetchStudents: () => Promise<void>;
  fetchDepartmentLists: () => Promise<void>;
  approveStudent: (submissionId: string) => Promise<void>;
  declineStudent: (submissionId: string, reason: string) => Promise<void>;
  finalizeList: () => Promise<void>;
  canFinalize: () => boolean;
  isListFinalized: boolean;
  checkListFinalized: () => Promise<void>;
}

const DeansOfficeContext = createContext<DeansOfficeContextType | undefined>(undefined);

export function DeansOfficeProvider({ children }: { children: ReactNode }) {
  const [deanProfile, setDeanProfile] = useState<User | null>(null);
  const [students, setStudents] = useState<SubmissionDetails[]>([]);
  const [departmentLists, setDepartmentLists] = useState<DepartmentList[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [departmentListsLoading, setDepartmentListsLoading] = useState<boolean>(false);
  const [isListFinalized, setIsListFinalized] = useState<boolean>(false);
  const { user } = useUser();

  const fetchDeanProfile = async (): Promise<void> => {
    if (!user) {
      console.log("user is null");
      setDeanProfile(null);
      return;
    }
    
    const userRole = user.role;
    
    // Only fetch dean data if user is a dean
    if (userRole !== 'DEAN_OFFICER' && userRole !== 'ROLE_DEANS_OFFICE') {
      console.log("user is not a dean");
      setDeanProfile(null);
      return;
    }

    setLoading(true);
    
    try {
      const token = getToken();
      if (!token) {
        setDeanProfile(user); // Use basic user info as fallback
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
        const deanData: User = await response.json();
        // Merge basic user info from user context with dean data
        const mergedProfile: User = {
          ...user, // Basic info from user context
          ...deanData, // Dean-specific info
        };
        setDeanProfile(mergedProfile);
      } else if (response.status === 401) {
        setDeanProfile(user); // Use basic user info as fallback
      } else {
        const errorText = await response.text();
        console.error('Failed to fetch dean profile:', errorText);
        setDeanProfile(user); // Use basic user info as fallback
      }
    } catch (error) {
      console.error('Error fetching dean profile:', error);
      setDeanProfile(user); // Use basic user info as fallback
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
      
      // Get dean ID from user context or dean profile
      const deanId = deanProfile?.instituteNumber || user?.userId || user?.instituteNumber;

      if (!deanId) {
        console.error('No dean ID available. User properties:', Object.keys(user || {}));
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
          console.warn('Dean office API endpoint not implemented yet. Using empty student list.');
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
              ? { ...student, status: 'APPROVED_BY_DEAN' } 
              : student
          )
        );
      } else {
        setStudents(prev => 
          prev.map(student => 
            student.submissionId === submissionId 
              ? { ...student, status: 'APPROVED_BY_DEAN' } 
              : student
          )
        );
        console.error('Failed to approve student:', await response.text());
      }
    } catch (error) {
      setStudents(prev => 
        prev.map(student => 
          student.submissionId === submissionId 
            ? { ...student, status: 'APPROVED_BY_DEAN' } 
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
      
      const deanId = deanProfile?.userId || user?.userId;
      
      if (!deanId) {
        console.error('No dean ID available');
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
              ? { ...student, status: 'REJECTED_BY_DEAN', declineReason: reason } 
              : student
          )
        );
      } else {
        setStudents(prev => 
          prev.map(student => 
            student.submissionId === submissionId
              ? { ...student, status: 'REJECTED_BY_DEAN', declineReason: reason } 
              : student
          )
        );
        console.error('Failed to decline student:', await response.text());
      }
    } catch (error) {
      setStudents(prev => 
        prev.map(student => 
          student.submissionId === submissionId 
            ? { ...student, status: 'REJECTED_BY_DEAN', declineReason: reason } 
            : student
        )
      );
      console.error('Error declining student:', error);
    }
  };

  const fetchDepartmentLists = async (): Promise<void> => {
    if (!user) {
      console.log('fetchDepartmentLists: No user available');
      return;
    }
    
    console.log('fetchDepartmentLists: Starting fetch for user:', user.role);
    setDepartmentListsLoading(true);
    
    try {
      const token = getToken();
      if (!token) {
        console.warn('fetchDepartmentLists: No token available');
        setDepartmentListsLoading(false);
        return;
      }
      
      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/submissions/subordinate-status`;
      console.log('fetchDepartmentLists: Making request to:', apiUrl);
      
      if (!process.env.NEXT_PUBLIC_API_URL) {
        console.error('fetchDepartmentLists: NEXT_PUBLIC_API_URL environment variable is not set');
        setDepartmentListsLoading(false);
        return;
      }
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      });

      if (response.ok) {
        console.log('fetchDepartmentLists: Response received successfully');
        const apiData = await response.json();
        console.log('fetchDepartmentLists: API data:', apiData);
        
        // Transform API response to match DepartmentList interface and fetch student counts
        const departmentListsData: DepartmentList[] = await Promise.all(
          apiData.map(async (item: any) => {
            // Fetch student counts for each department
            let studentCounts = {
              totalStudents: 0,
              approvedStudents: 0,
              rejectedStudents: 0,
              pendingStudents: 0,
            };

            try {
              const studentResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/submissions/department/${item.departmentId}`, {
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
                studentCounts.approvedStudents = studentData.filter((s: any) => s.status === 'APPROVED_BY_DEPT').length;
                studentCounts.rejectedStudents = studentData.filter((s: any) => s.status === 'REJECTED_BY_DEPT').length;
                studentCounts.pendingStudents = studentData.filter((s: any) => s.status === 'APPROVED_BY_DEPT').length;
              }
            } catch (error) {
              console.warn(`Failed to fetch student counts for department ${item.departmentId}:`, error);
            }

            return {
              departmentId: item.departmentId || item.empId,
              departmentName: item.departmentName || item.department || 'Unknown Department',
              secretaryName: item.secretaryName || item.name,
              secretaryEmail: item.secretaryEmail || item.email,
              ...studentCounts,
              isFinalized: item.isFinalized,
              finalizedDate: item.isFinalized ? new Date().toISOString() : undefined,
              lastUpdated: new Date().toISOString(),
            };
          })
        );
        
        console.log('fetchDepartmentLists: Setting department lists:', departmentListsData);
        setDepartmentLists(departmentListsData);
      } else {
        let errorText = '';
        try {
          errorText = await response.text();
        } catch (textError) {
          console.warn('Could not read response text:', textError);
        }
        
        const errorMessage = errorText || `HTTP ${response.status} ${response.statusText}`;
        
        if (response.status === 404 || errorText.includes("No static resource")) {
          console.warn('Dean office department lists API endpoint not implemented yet. Using empty department list.');
          setDepartmentLists([]);
        } else {
          console.error(`Failed to fetch department lists (${response.status}):`, errorMessage);
          console.error('Response details:', {
            status: response.status,
            statusText: response.statusText,
            headers: Object.fromEntries(response.headers.entries()),
            url: response.url
          });
        }
      }
    } catch (error) {
      console.error('Error fetching department lists:', error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        apiUrl: `${process.env.NEXT_PUBLIC_API_URL}/api/submissions/subordinate-status`
      });
      // Set empty list on error to prevent UI issues
      setDepartmentLists([]);
    }
    
    setDepartmentListsLoading(false);
  };

  const canFinalize = (): boolean => {
    // Check if all department lists are finalized
    const allDepartmentListsFinalized = departmentLists.length > 0 && departmentLists.every(dept => dept.isFinalized);
    
    // Check if there are no students with approved or rejected status (only pending or not requested)
    const hasApprovedOrRejectedStudents = students.some(student => 
      student.status === 'APPROVED_BY_DEAN' || 
      student.status === 'REJECTED_BY_DEAN' ||
      student.status === 'APPROVED_BY_DEPT' ||
      student.status === 'REJECTED_BY_DEPT'
    );
    
    return allDepartmentListsFinalized && !hasApprovedOrRejectedStudents;
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
        console.log(data);
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
      const allDepartmentListsFinalized = departmentLists.length > 0 && departmentLists.every(dept => dept.isFinalized);
      const hasApprovedOrRejectedStudents = students.some(student => 
        student.status === 'APPROVED_BY_DEAN' || 
        student.status === 'REJECTED_BY_DEAN' ||
        student.status === 'APPROVED_BY_DEPT' ||
        student.status === 'REJECTED_BY_DEPT'
      );
      
      if (!allDepartmentListsFinalized) {
        throw new Error('All department lists must be finalized before dean list can be finalized');
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
      
      const deanId = deanProfile?.userId || user?.userId;
      
      if (!deanId) {
        console.error('No dean ID available');
        return;
      }
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/submissions/my-submissions/finalize`, {
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
    if (user && (user.role === 'DEAN_OFFICER' || user.role === 'ROLE_DEANS_OFFICE')) {
      fetchDeanProfile();
    } else {
      setDeanProfile(null);
      setStudents([]);
    }
  }, [user]);

  useEffect(() => {
    if (deanProfile && user && (user.role === 'DEAN_OFFICER' || user.role === 'ROLE_DEANS_OFFICE')) {
      fetchStudents();
      fetchDepartmentLists();
      checkListFinalized();
    }
  }, [deanProfile]);

  const value = {
    deanProfile,
    students,
    departmentLists,
    loading,
    departmentListsLoading,
    fetchDeanProfile,
    fetchStudents,
    fetchDepartmentLists,
    approveStudent,
    declineStudent,
    finalizeList,
    canFinalize,
    isListFinalized,
    checkListFinalized,
  };

  return <DeansOfficeContext.Provider value={value}>{children}</DeansOfficeContext.Provider>;
}

export function useDeansOffice() {
  const context = useContext(DeansOfficeContext);
  if (context === undefined) {
    throw new Error('useDeansOffice must be used within a DeansOfficeProvider');
  }
  return context;
} 