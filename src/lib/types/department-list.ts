export interface DepartmentList {
  departmentId: string;
  departmentName: string;
  secretaryName: string;
  secretaryEmail: string;
  totalStudents: number;
  approvedStudents: number;
  rejectedStudents: number;
  pendingStudents: number;
  isFinalized: boolean;
  finalizedDate?: string;
  lastUpdated: string;
} 