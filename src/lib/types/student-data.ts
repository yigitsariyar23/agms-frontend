import { AdvisorDetails } from "./advisor-details";

export interface Course {
  code?: string;
  name?: string;
  credit?: number;
  grade?: string;
  semester?: string;
  year?: string;
}

export interface StudentData {
    studentNumber?: string;
    gpa?: number;
    totalCredit?: number;
    hasCompletedCurriculum?: boolean;
    semester?: number;
    email?: string;
    department?: string;
    advisor?: AdvisorDetails | null;
    courses?: Course[];
}