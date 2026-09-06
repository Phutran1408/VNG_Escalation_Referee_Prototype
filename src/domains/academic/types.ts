export type Decision = "AUTO_APPROVE" | "ESCALATE";

export type LeaveType =
  | "Nghỉ ốm điều trị"
  | "Nghỉ việc riêng gia đình"
  | "Nghỉ tham gia hoạt động trường"
  | "Xin bảo lưu học kỳ";

export type TriggerCategory =
  | "Không chắc dữ kiện"
  | "Ngoài chính sách"
  | "Vượt thẩm quyền";

export type DocEvidenceStatus = "VALID" | "UNCLEAR_DATE" | "MISSING";

export interface TestCase {
  id: string;
  studentId: string;
  studentName: string;
  faculty: string;
  courseName: string;
  totalSessions: number;
  pastAbsences: number;
  sessionsRequested: number;
  fromDate: string;
  toDate: string;
  leaveType: LeaveType;
  reason: string;
  notes: string;
  docEvidenceStatus: DocEvidenceStatus;
  isSemesterDeferral?: boolean;
  expected: Decision;
  expectedTrigger?: TriggerCategory;
}

export interface VerifyResult {
  caseId: string;
  summary: string;
  expected: Decision;
  actual: Decision;
  pass: boolean;
  triggerCategory?: TriggerCategory;
  escalationQuestion?: string;
  policyBasis: string;
  timestamp: string;
}

export interface EvaluateRequest {
  studentId: string;
  studentName: string;
  faculty: string;
  courseName: string;
  totalSessions: number;
  pastAbsences: number;
  sessionsRequested: number;
  fromDate: string;
  toDate: string;
  leaveType: LeaveType;
  reason: string;
  notes: string;
  docEvidenceStatus: DocEvidenceStatus;
  isSemesterDeferral?: boolean;
}

export interface EvaluateResponse {
  requestId: string;
  decision: Decision;
  policyBasis: string;
  escalationQuestion?: string;
  triggerCategory?: TriggerCategory;
  timestamp: string;
  details?: {
    absenceRatio: number;
    maxAllowedRatio: number;
    isExceeded20Percent: boolean;
  };
}

export interface AuditEntry {
  requestId: string;
  timestamp: string;
  studentInfo: string;
  faculty: string;
  courseName: string;
  sessionsInfo: string;
  decision: Decision;
  policyBasis: string;
  overridden: boolean;
  escalationQuestion?: string;
  triggerCategory?: TriggerCategory;
}
