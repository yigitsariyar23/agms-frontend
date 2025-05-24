import { Role } from './role';
import { GraduationRequestStatus } from './graduation-status';

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