export type Role = 'ROLE_ADMIN' | 'ROLE_STUDENT' | 'ROLE_USER' | 'ROLE_ADVISOR' | 'ROLE_DEPARTMENT_SECRETARY' | 'ROLE_DEANS_OFFICE' | 'ROLE_STUDENT_AFFAIRS';

export type GraduationRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'NOT_SUBMITTED';

export interface User {
    userId: string;
    email: string;
    firstname: string;
    lastname: string;
    role: Role;
    studentId?: string;
    graduationRequestStatus?: GraduationRequestStatus;
}