export interface SubmissionFile {
  fileId: string;
  fileName: string;
  fileType: string;
  uploadDate: string; // Or Date, if you parse it
  uploaderName: string;
}

export interface SubmissionDetails {
  submissionId: string;
  submissionDate: string; // Or Date, if you parse it
  content: string;
  status: "NOT_REQUESTED" | "PENDING" | "APPROVED_BY_ADVISOR" | "REJECTED_BY_ADVISOR" | "APPROVED_BY_DEPT" | "REJECTED_BY_DEPT" | "APPROVED_BY_DEAN" | "REJECTED_BY_DEAN" | "FINAL_APPROVED" | "FINAL_REJECTED";
  studentNumber: string;
  studentName: string;
  advisorListId: string; // This might be optional or come from a different source
  files: SubmissionFile[];
  advisorComment?: string;
  secretaryComment?: string;
  deanComment?: string;
  declineReason?: string;
  graduationStatus?: string;
  graduationComment?: string;
  email?: string;
  department?: string;
  gpa?: number;
  curriculum?: string;
  creditsCompleted?: number;
  totalCredits?: number;
  semester?: number;
} 