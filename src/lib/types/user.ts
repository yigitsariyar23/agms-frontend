export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role?: "student" | "advisor" | "department_secretary" | "deans_office" | "student_affairs";
}