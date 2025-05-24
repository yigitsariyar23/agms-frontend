"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types/user';
import { useUser } from './user-context';
import { getToken } from '../utils/jwt';
import { StudentData } from '../types/student-data';
import { GraduationRequestStatus } from '../types/graduation-status';

interface DetailedGraduationStatusData {
  status: GraduationRequestStatus;
  message?: string;
}

interface StudentContextType {
  studentProfile: User | null;
  studentData: StudentData | null;
  initialGraduationStatusData: DetailedGraduationStatusData | null;
  loading: boolean;
  loadingDetailedInfo: boolean;
  loadingInitialGraduationStatus: boolean;
  fetchStudentProfile: () => Promise<void>;
  hasCompletedCurriculum: boolean | null;
  getCurriculumStatus: () => "Completed" | "Not Completed";
}

const StudentContext = createContext<StudentContextType | undefined>(undefined);

export function StudentProvider({ children }: { children: ReactNode }) {
  const [studentProfile, setStudentProfile] = useState<User | null>(null);
  const [studentData, setStudentData] = useState<StudentData | null>(null);
  const [initialGraduationStatusData, setInitialGraduationStatusData] = useState<DetailedGraduationStatusData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingDetailedInfo, setLoadingDetailedInfo] = useState<boolean>(false);
  const [loadingInitialGraduationStatus, setLoadingInitialGraduationStatus] = useState<boolean>(false);
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

  const fetchStudentGraduationStatus = async (studentNumber: string) => {
    if (!studentNumber) return;
    setLoadingInitialGraduationStatus(true);
    setInitialGraduationStatusData(null);
    try {
      const token = getToken();
      if (!token) {
        setInitialGraduationStatusData({ status: "NOT_SUBMITTED", message: "Auth token missing for grad status" });
        return;
      }
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/submissions/student/${studentNumber}/latest`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        if (data && data.status) {
          setInitialGraduationStatusData({
            status: data.status as GraduationRequestStatus,
            message: data.message || "Latest graduation submission status loaded.",
          });
        } else {
          setInitialGraduationStatusData({
            status: "NOT_SUBMITTED",
            message: "No graduation submission status found."
          });
        }
      } else if (response.status === 404) {
        // No submission exists
        setInitialGraduationStatusData({
          status: "NOT_SUBMITTED",
          message: "Not requested"
        });
      } else {
        let errorMessage = response.statusText;
        try {
          const errorBody = await response.json();
          errorMessage = errorBody.message || errorBody.error || errorMessage;
        } catch (e) { /* Ignore if error body isn't json */ }
        setInitialGraduationStatusData({
          status: "NOT_SUBMITTED",
          message: `Failed to load graduation status: ${errorMessage}`,
        });
      }
    } catch (error) {
      console.error('Error fetching initial graduation status:', error);
      setInitialGraduationStatusData({
        status: "NOT_SUBMITTED",
        message: "Client error fetching graduation status.",
      });
    } finally {
      setLoadingInitialGraduationStatus(false);
    }
  };

  const fetchStudentProfile = async (): Promise<void> => {
    if (!user) {
      setStudentProfile(null);
      setStudentData(null);
      setInitialGraduationStatusData(null);
      return;
    }
    
    const userRole = user.role;
    
    if (userRole !== 'STUDENT' && userRole !== 'ROLE_STUDENT') {
      setStudentProfile(null);
      setStudentData(null);
      setInitialGraduationStatusData(null);
      return;
    }
    
    setLoading(true);
    setStudentData(null);
    setInitialGraduationStatusData(null);
    
    try {
      const token = getToken();
      if (!token) {
        setStudentProfile(user);
        setLoading(false);
        setInitialGraduationStatusData({ status: "NOT_SUBMITTED", message: "Auth token missing for profile." });
        return;
      }
      
      console.log('Fetching student academic data from: /api/students/profile');
      const profileResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/students/profile`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      });

      if (profileResponse.ok) {
        const studentAcademicData: User = await profileResponse.json();
        const mergedProfile: User = {
          ...user,
          ...studentAcademicData,
        };
        setStudentProfile(mergedProfile);

        if (mergedProfile.studentNumber) {
          fetchDetailedStudentData(mergedProfile.studentNumber);
          fetchStudentGraduationStatus(mergedProfile.studentNumber);
        } else {
          setInitialGraduationStatusData({ status: "NOT_SUBMITTED", message: "Student number not found in profile." });
        }
      } else if (profileResponse.status === 401) {
        setStudentProfile(user);
        setInitialGraduationStatusData({ status: "NOT_SUBMITTED", message: "Unauthorized to fetch profile." });
      } else {
        const errorText = await profileResponse.text();
        console.error('Failed to fetch student academic data:', errorText);
        setStudentProfile(user);
        setInitialGraduationStatusData({ status: "NOT_SUBMITTED", message: `Profile fetch error: ${errorText.substring(0,100)}` });
      }
    } catch (error) {
      console.error('Error fetching student academic data:', error);
      setStudentProfile(user);
      setInitialGraduationStatusData({ status: "NOT_SUBMITTED", message: "Client error fetching profile." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchStudentProfile();
    } else {
      setStudentProfile(null);
      setStudentData(null);
    }
  }, [user]);

  const getCurriculumStatus = (): "Completed" | "Not Completed" => {
    if (studentData?.hasCompletedCurriculum !== undefined) {
      return studentData.hasCompletedCurriculum ? "Completed" : "Not Completed";
    }
    
    const totalCredits = studentData?.totalCredit || studentProfile?.totalCredits;
    const creditsCompleted = studentProfile?.creditsCompleted;
    
    if (totalCredits && creditsCompleted && creditsCompleted >= totalCredits) {
      return "Completed";
    }
    return "Not Completed";
  };

  const value = {
    studentProfile,
    studentData,
    initialGraduationStatusData,
    loading,
    loadingDetailedInfo,
    loadingInitialGraduationStatus,
    fetchStudentProfile,
    hasCompletedCurriculum: studentData?.hasCompletedCurriculum ?? null,
    getCurriculumStatus,
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
