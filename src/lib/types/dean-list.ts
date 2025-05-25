export interface DeanList {
  deanId: string;
  deanName: string;
  deanEmail: string;
  office: string;
  totalStudents: number;
  approvedStudents: number;
  rejectedStudents: number;
  pendingStudents: number;
  isFinalized: boolean;
  finalizedDate?: string;
  lastUpdated: string;
} 