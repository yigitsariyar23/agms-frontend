import { useUser } from "@/lib/contexts/user-context";
import { useAuth } from "@/lib/contexts/auth-context";

export function useUserProfile() {
    const { userProfile, loading: profileLoading, fetchUserProfile } = useUser();
    const { user, loading: authLoading } = useAuth();
  
    const isLoading = authLoading || profileLoading;
    const isAuthenticated = !!user;
  
    const isStudent = userProfile?.role === 'ROLE_STUDENT';
    const isAdvisor = userProfile?.role === 'ROLE_ADVISOR';
    const isDepartmentSecretary = userProfile?.role === 'ROLE_DEPARTMENT_SECRETARY';
    const isDeansOffice = userProfile?.role === 'ROLE_DEANS_OFFICE';
    const isStudentAffairs = userProfile?.role === 'ROLE_STUDENT_AFFAIRS';
    const isAdmin = userProfile?.role === 'ROLE_ADMIN';
  
  return {
    user: userProfile,
    isLoading,
    isAuthenticated,
    isStudent,
    isAdvisor,
    isDepartmentSecretary,
    isDeansOffice,
    isStudentAffairs,
    isAdmin,
    fetchUserProfile,
  };
} 