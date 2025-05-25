"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types/user';
import { useUser } from './user-context';
import { getToken } from '../utils/jwt';
import { SubmissionDetails } from '../types/submission-details';
import { DeanList } from '../types/dean-list';

interface StudentAffairsContextType {
  staffProfile: User | null;
  students: SubmissionDetails[];
  deanLists: DeanList[];
  loading: boolean;
  deanListsLoading: boolean;
  fetchStaffProfile: () => Promise<void>;
  fetchStudents: () => Promise<void>;
  fetchDeanLists: () => Promise<void>;
  approveStudent: (submissionId: string) => Promise<void>;
  declineStudent: (submissionId: string, reason: string) => Promise<void>;
  finalizeList: () => Promise<void>;
  canFinalize: () => boolean;
  isListFinalized: boolean;
}

const StudentAffairsContext = createContext<StudentAffairsContextType | undefined>(undefined);

export function StudentAffairsProvider({ children }: { children: ReactNode }) {
  const [staffProfile, setStaffProfile] = useState<User | null>(null);
  const [students, setStudents] = useState<SubmissionDetails[]>([]);
  const [deanLists, setDeanLists] = useState<DeanList[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [deanListsLoading, setDeanListsLoading] = useState<boolean>(false);
  const [isListFinalized, setIsListFinalized] = useState<boolean>(false);
  const { user } = useUser();

  const fetchStaffProfile = async (): Promise<void> => {
    if (!user) {
      console.log("user is null");
      setStaffProfile(null);
      return;
    }
    
    const userRole = user.role;
    
    // Only fetch staff data if user is student affairs staff
    if (userRole !== 'STUDENT_AFFAIRS' && userRole !== 'ROLE_STUDENT_AFFAIRS') {
      console.log("user is not student affairs staff");
      setStaffProfile(null);
      return;
    }

    setLoading(true);
    
    try {
      const token = getToken();
      if (!token) {
        setStaffProfile(user); // Use basic user info as fallback
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
        const staffData: User = await response.json();
        // Merge basic user info from user context with staff data
        const mergedProfile: User = {
          ...user, // Basic info from user context
          ...staffData, // Staff-specific info
        };
        setStaffProfile(mergedProfile);
      } else if (response.status === 401) {
        setStaffProfile(user); // Use basic user info as fallback
      } else {
        const errorText = await response.text();
        console.error('Failed to fetch staff profile:', errorText);
        setStaffProfile(user); // Use basic user info as fallback
      }
    } catch (error) {
      console.error('Error fetching staff profile:', error);
      setStaffProfile(user); // Use basic user info as fallback
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
      
      // Get staff ID from user context or staff profile
      const staffId = staffProfile?.instituteNumber || user?.userId || user?.instituteNumber;

      if (!staffId) {
        console.error('No staff ID available. User properties:', Object.keys(user || {}));
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
          console.warn('Student affairs API endpoint not implemented yet. Using empty student list.');
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
              ? { ...student, status: 'GRADUATION_APPROVED' } 
              : student
          )
        );
      } else {
        setStudents(prev => 
          prev.map(student => 
            student.submissionId === submissionId 
              ? { ...student, status: 'STUDENT_AFFAIRS_REJECTED' } 
              : student
          )
        );
        console.error('Failed to approve student:', await response.text());
      }
    } catch (error) {
      setStudents(prev => 
        prev.map(student => 
          student.submissionId === submissionId 
            ? { ...student, status: 'STUDENT_AFFAIRS_REJECTED' } 
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
      
      const staffId = staffProfile?.userId || user?.userId;
      
      if (!staffId) {
        console.error('No staff ID available');
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
              ? { ...student, status: 'STUDENT_AFFAIRS_REJECTED', declineReason: reason } 
              : student
          )
        );
      } else {
        setStudents(prev => 
          prev.map(student => 
            student.submissionId === submissionId
              ? { ...student, status: 'STUDENT_AFFAIRS_REJECTED', declineReason: reason } 
              : student
          )
        );
        console.error('Failed to decline student:', await response.text());
      }
    } catch (error) {
      setStudents(prev => 
        prev.map(student => 
          student.submissionId === submissionId 
            ? { ...student, status: 'STUDENT_AFFAIRS_REJECTED', declineReason: reason } 
            : student
        )
      );
      console.error('Error declining student:', error);
    }
  };

  const fetchDeanLists = async (): Promise<void> => {
    if (!user) return;
    
    setDeanListsLoading(true);
    
    try {
      const token = getToken();
      if (!token) {
        setDeanListsLoading(false);
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
        
        // Transform API response to match DeanList interface and fetch student counts
        const deanListsData: DeanList[] = await Promise.all(
          apiData.map(async (item: any) => {
            // Fetch student counts for each dean
            let studentCounts = {
              totalStudents: 0,
              approvedStudents: 0,
              rejectedStudents: 0,
              pendingStudents: 0,
            };

            try {
              const studentResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/submissions/dean/${item.deanId}`, {
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
                studentCounts.approvedStudents = studentData.filter((s: any) => s.status === 'APPROVED_BY_DEAN').length;
                studentCounts.rejectedStudents = studentData.filter((s: any) => s.status === 'REJECTED_BY_DEAN').length;
                studentCounts.pendingStudents = studentData.filter((s: any) => s.status === 'APPROVED_BY_DEAN').length;
              }
            } catch (error) {
              console.warn(`Failed to fetch student counts for dean ${item.deanId}:`, error);
            }

            return {
              deanId: item.deanId || item.empId,
              deanName: item.deanName || item.name,
              deanEmail: item.deanEmail || item.email,
              office: item.office || 'Dean\'s Office',
              ...studentCounts,
              isFinalized: item.isFinalized,
              finalizedDate: item.isFinalized ? new Date().toISOString() : undefined,
              lastUpdated: new Date().toISOString(),
            };
          })
        );
        
        setDeanLists(deanListsData);
      } else {
        const errorText = await response.text();
        if (response.status === 404 || errorText.includes("No static resource")) {
          console.warn('Student affairs dean lists API endpoint not implemented yet. Using empty dean list.');
          setDeanLists([]);
        } else {
          console.error('Failed to fetch dean lists:', errorText);
        }
      }
    } catch (error) {
      console.error('Error fetching dean lists:', error);
    }
    
    setDeanListsLoading(false);
  };

  const canFinalize = (): boolean => {
    // Check if all dean lists are finalized
    const allDeanListsFinalized = deanLists.length > 0 && deanLists.every(dean => dean.isFinalized);
    
    // Check if there are no students with approved or rejected status (only pending or not requested)
    const hasApprovedOrRejectedStudents = students.some(student => 
      student.status === 'GRADUATION_APPROVED' || 
      student.status === 'STUDENT_AFFAIRS_REJECTED' ||
      student.status === 'APPROVED_BY_DEAN' ||
      student.status === 'REJECTED_BY_DEAN'
    );
    
    return allDeanListsFinalized && !hasApprovedOrRejectedStudents;
  };

  const finalizeList = async (): Promise<void> => {
    // Validate finalization conditions
    if (!canFinalize()) {
      const allDeanListsFinalized = deanLists.length > 0 && deanLists.every(dean => dean.isFinalized);
      const hasApprovedOrRejectedStudents = students.some(student => 
        student.status === 'GRADUATION_APPROVED' || 
        student.status === 'STUDENT_AFFAIRS_REJECTED' ||
        student.status === 'APPROVED_BY_DEAN' ||
        student.status === 'REJECTED_BY_DEAN'
      );
      
      if (!allDeanListsFinalized) {
        throw new Error('All dean lists must be finalized before graduation process can be completed');
      }
      
      if (hasApprovedOrRejectedStudents) {
        throw new Error('Cannot complete graduation process while there are students with approved or rejected status');
      }
      
      return;
    }

    try {
      const token = getToken();
      if (!token) {
        console.error('No token available');
        return;
      }
      
      const staffId = staffProfile?.userId || user?.userId;
      
      if (!staffId) {
        console.error('No staff ID available');
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
    if (user && (user.role === 'STUDENT_AFFAIRS' || user.role === 'ROLE_STUDENT_AFFAIRS')) {
      fetchStaffProfile();
    } else {
      setStaffProfile(null);
      setStudents([]);
    }
  }, [user]);

  useEffect(() => {
    if (staffProfile && user && (user.role === 'STUDENT_AFFAIRS' || user.role === 'ROLE_STUDENT_AFFAIRS')) {
      fetchStudents();
      fetchDeanLists();
    }
  }, [staffProfile]);

  const value = {
    staffProfile,
    students,
    deanLists,
    loading,
    deanListsLoading,
    fetchStaffProfile,
    fetchStudents,
    fetchDeanLists,
    approveStudent,
    declineStudent,
    finalizeList,
    canFinalize,
    isListFinalized,
  };

  return <StudentAffairsContext.Provider value={value}>{children}</StudentAffairsContext.Provider>;
}

export function useStudentAffairs() {
  const context = useContext(StudentAffairsContext);
  if (context === undefined) {
    throw new Error('useStudentAffairs must be used within a StudentAffairsProvider');
  }
  return context;
} 