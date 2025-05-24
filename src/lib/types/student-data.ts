import { AdvisorDetails } from "./advisor-details";

export interface StudentData {
    studentNumber?: string;
    gpa?: number;
    totalCredit?: number;
    semester?: number;
    department?: string;
    advisor?: AdvisorDetails | null; 
  }
  