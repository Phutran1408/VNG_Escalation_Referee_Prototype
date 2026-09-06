export type Decision = "AUTO_APPROVE" | "ESCALATE";

export type LeaveType =
  | "Nghỉ phép năm"
  | "Nghỉ ốm/chế độ"
  | "Nghỉ không lương"
  | "Nghỉ việc riêng";

export type TriggerCategory =
  | "Không chắc dữ kiện"
  | "Ngoài chính sách"
  | "Vượt thẩm quyền";

export interface TestCase {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  leaveType: LeaveType;
  days: number;
  fromDate: string;
  toDate: string;
  reason: string;
  notes: string;
  expected: Decision;
}

export interface VerifyResult {
  caseId: string;
  summary: string;
  expected: Decision;
  actual: Decision;
  pass: boolean;
  triggerCategory?: TriggerCategory;
  escalationQuestion?: string;
  timestamp: string;
}

export interface EvaluateRequest {
  employeeId: string;
  employeeName: string;
  department: string;
  leaveType: LeaveType;
  fromDate: string;
  toDate: string;
  reason: string;
  notes: string;
}

export interface EvaluateResponse {
  requestId: string;
  decision: Decision;
  policyBasis: string;
  escalationQuestion?: string;
  triggerCategory?: TriggerCategory;
  timestamp: string;
}

export interface AuditEntry {
  requestId: string;
  timestamp: string;
  employeeInfo: string;
  department: string;
  leaveType: string;
  decision: Decision;
  policyBasis: string;
  overridden: boolean;
  escalationQuestion?: string;
  triggerCategory?: TriggerCategory;
}
