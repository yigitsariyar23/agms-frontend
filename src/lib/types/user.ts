export interface User {
    id: string;
    email: string;
    name: string;
    role?: "student" | "advisor" | "department_secretary" | "deans_office" | "student_affairs";
}