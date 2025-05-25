export interface AdvisorList {
  advisorId: string;
  advisorName: string;
  advisorEmail: string;
  department: string;
  totalStudents: number;
  approvedStudents: number;
  rejectedStudents: number;
  pendingStudents: number;
  isFinalized: boolean;
  finalizedDate?: string;
  lastUpdated: string;
} 