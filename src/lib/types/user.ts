export type Role = 'STUDENT' | 'ADVISOR' | 'DEPARTMENT_SECRETARY' | 'DEAN_OFFICER' | 'STUDENT_AFFAIRS' | 'ROLE_STUDENT' | 'ROLE_ADVISOR' | 'ROLE_DEPARTMENT_SECRETARY' | 'ROLE_DEANS_OFFICE' | 'ROLE_STUDENT_AFFAIRS';

export type GraduationRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'NOT_SUBMITTED';

export interface User {
    userId: string;
    email: string;
    firstname: string;
    lastname: string;
    role: Role;
    studentNumber?: string;
    graduationRequestStatus?: GraduationRequestStatus;
    advisor?: string;
    gpa?: number;
    creditsCompleted?: number;
    totalCredits?: number;
    semester?: number;
    department?: string;
    office?: string;
    title?: string;
    phone?: string;
    advisees?: string[];
}