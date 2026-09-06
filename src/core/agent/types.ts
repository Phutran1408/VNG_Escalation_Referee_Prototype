/**
 * Lõi Agent SV2 — Phân Loại Độ Bất Định (3 Uncertainty Categories)
 */
export type UncertaintyCategory =
  | "Không chắc dữ kiện"   // Fact Uncertainty: mờ, thiếu dữ liệu, không đọc được mốc ngày
  | "Ngoài chính sách"     // Policy Exception: vượt 20% số buổi, lý do ngoài quy chế
  | "Vượt thẩm quyền";     // Authority Limit: bảo lưu học kỳ, nghỉ không lương dài ngày

export type DecisionOutcome = "AUTO_APPROVE" | "ESCALATE";

export interface ReasoningStep {
  checkName: string;
  passed: boolean;
  observation: string;
  ruleCited: string;
}

/**
 * Log Quyết Định của Lõi Agent SV2 (Decision Log)
 */
export interface DecisionLog {
  decisionId: string;
  timestamp: string;
  domain: "enterprise" | "academic";
  subjectInfo: string;
  contextDetails: string;
  outcome: DecisionOutcome;
  uncertaintyCategory?: UncertaintyCategory;
  confidenceScore: number; // 1.0 cho Auto-Approve, < 0.7 hoặc cắm cờ cho Escalate
  reasoningTrace: ReasoningStep[];
  policyCitations: string[];
  escalationQuestion?: string;
  isOverridden: boolean;
  overriddenBy?: string;
  overriddenAt?: string;
}

export interface AgentEvaluationInput {
  domain: "enterprise" | "academic";
  subjectId: string;
  subjectName: string;
  organizationUnit: string; // Phòng ban hoặc Khoa
  leaveType: string;
  fromDate: string;
  toDate: string;
  durationDaysOrSessions: number;
  pastAbsencesCount?: number;
  totalLimitOrCapacity?: number; // Tổng số buổi môn học hoặc định mức phép
  docStatus: "VALID" | "UNCLEAR_DATE" | "MISSING";
  isSpecialRequest?: boolean; // Bảo lưu học kỳ hoặc nghỉ không lương dài hạn
  reasonText: string;
  notesText: string;
}

export interface AgentEvaluationOutput {
  decisionId: string;
  outcome: DecisionOutcome;
  uncertaintyCategory?: UncertaintyCategory;
  policyBasis: string;
  escalationQuestion?: string;
  reasoningTrace: ReasoningStep[];
  timestamp: string;
  confidenceScore: number;
}
