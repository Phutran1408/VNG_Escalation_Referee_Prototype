import type { TestCase, VerifyResult, EvaluateResponse, LeaveType } from "../types";

export const TEST_CASES: TestCase[] = [
  {
    id: "TC01",
    employeeId: "NV-2024-0312",
    employeeName: "Nguyễn Thị Hương",
    department: "Phòng Kinh doanh",
    leaveType: "Nghỉ phép năm",
    days: 1,
    fromDate: "2025-10-15",
    toDate: "2025-10-15",
    reason: "Nghỉ phép năm theo kế hoạch, nộp trước 3 ngày làm việc, còn đủ 4 ngày phép năm trong năm.",
    notes: "Đã xác nhận số dư phép năm còn 4 ngày. Không ảnh hưởng tiến độ nhóm.",
    expected: "AUTO_APPROVE",
  },
  {
    id: "TC02",
    employeeId: "NV-2023-0087",
    employeeName: "Trần Minh Quân",
    department: "Phòng Kỹ thuật",
    leaveType: "Nghỉ ốm/chế độ",
    days: 1,
    fromDate: "2025-10-12",
    toDate: "2025-10-12",
    reason: "Nghỉ ốm điều trị cúm, có đính kèm chứng từ y tế hợp lệ từ Phòng khám Đa khoa Medic.",
    notes: "Đính kèm: Giấy chứng nhận nghỉ ốm số 0042/MC ngày 12/10/2025. Chứng từ rõ ràng, đủ điều kiện.",
    expected: "AUTO_APPROVE",
  },
  {
    id: "TC03",
    employeeId: "NV-2022-0156",
    employeeName: "Lê Phương Thảo",
    department: "Phòng Tài chính",
    leaveType: "Nghỉ việc riêng",
    days: 3,
    fromDate: "2025-11-01",
    toDate: "2025-11-03",
    reason: "Nghỉ việc riêng hưởng nguyên lương — kết hôn lần đầu, có đính kèm Giấy chứng nhận đăng ký kết hôn.",
    notes: "Đính kèm: Giấy chứng nhận ĐKKH số 001456 do UBND Q.3 cấp ngày 28/10/2025.",
    expected: "AUTO_APPROVE",
  },
  {
    id: "TC04",
    employeeId: "NV-2024-0489",
    employeeName: "Phạm Đức Anh",
    department: "Phòng Marketing",
    leaveType: "Nghỉ ốm/chế độ",
    days: 4,
    fromDate: "2025-10-12",
    toDate: "2025-10-15",
    reason: "Nghỉ ốm điều trị tại bệnh viện, đính kèm chứng từ y tế.",
    notes: "Chứng từ y tế bị mờ, không đọc rõ ngày bắt đầu điều trị. Cần xác minh.",
    expected: "ESCALATE",
  },
  {
    id: "TC05",
    employeeId: "NV-2021-0034",
    employeeName: "Hoàng Văn Bình",
    department: "Phòng Vận hành",
    leaveType: "Nghỉ không lương",
    days: 20,
    fromDate: "2025-11-10",
    toDate: "2025-12-05",
    reason: "Xin nghỉ không lương dài hạn để chăm sóc người thân bị bệnh nặng.",
    notes: "Thời gian nghỉ 20 ngày làm việc liên tục. Vượt thẩm quyền phê duyệt của Quản lý trực tiếp.",
    expected: "ESCALATE",
  },
];

interface EscalationData {
  triggerCategory: VerifyResult["triggerCategory"];
  escalationQuestion: string;
  policyBasis: string;
}

const ESCALATION_MAP: Record<string, EscalationData> = {
  TC04: {
    triggerCategory: "Không chắc dữ kiện",
    escalationQuestion:
      "Chứng từ y tế mờ ngày xuất viện: Nhân viên xin nghỉ từ ngày 12/10 hay 15/10? Yêu cầu Phạm Đức Anh bổ sung bản scan rõ hoặc xác nhận lại từ cơ sở y tế trước khi phê duyệt.",
    policyBasis: "Điều 14.2 Quy chế Nhân sự — Yêu cầu chứng từ y tế hợp lệ cho nghỉ ốm từ 2 ngày trở lên",
  },
  TC05: {
    triggerCategory: "Vượt thẩm quyền",
    escalationQuestion:
      "Đơn nghỉ không lương 20 ngày vượt thẩm quyền Quản lý trực tiếp (tối đa 5 ngày). Cần chuyển Giám đốc Khối / HRD phê duyệt theo Điều 18.1 Quy chế Nhân sự.",
    policyBasis: "Điều 18.1 Quy chế Nhân sự — Phân cấp thẩm quyền phê duyệt nghỉ không lương",
  },
};

const APPROVE_POLICY: Record<string, string> = {
  TC01: "Điều 10.1 Quy chế Nhân sự — Nghỉ phép năm: Nộp đúng hạn, còn đủ số ngày phép",
  TC02: "Điều 14.1 Quy chế Nhân sự — Nghỉ ốm/chế độ: Chứng từ y tế hợp lệ, trong định mức",
  TC03: "Điều 15.3 Quy chế Nhân sự — Nghỉ việc riêng hưởng lương: Kết hôn lần đầu tối đa 3 ngày có minh chứng",
};

export function runMockVerify(): VerifyResult[] {
  const now = new Date().toISOString();
  return TEST_CASES.map((tc) => {
    const esc = ESCALATION_MAP[tc.id];
    return {
      caseId: tc.id,
      summary: `${tc.employeeId} · ${tc.employeeName} · ${tc.department} · ${tc.leaveType} · ${tc.days} ngày`,
      expected: tc.expected,
      actual: tc.expected,
      pass: true,
      triggerCategory: esc?.triggerCategory,
      escalationQuestion: esc?.escalationQuestion,
      policyBasis: esc?.policyBasis ?? APPROVE_POLICY[tc.id],
      timestamp: now,
    } as VerifyResult & { policyBasis: string };
  });
}

function daysBetween(from: string, to: string): number {
  if (!from || !to) return 0;
  const diff = new Date(to).getTime() - new Date(from).getTime();
  return Math.max(1, Math.floor(diff / 86400000) + 1);
}

export function runMockEvaluate(req: {
  employeeId: string;
  employeeName: string;
  department: string;
  leaveType: LeaveType;
  fromDate: string;
  toDate: string;
  reason: string;
  notes: string;
}): EvaluateResponse {
  const requestId = `HR-${Date.now()}`;
  const timestamp = new Date().toISOString();
  const days = daysBetween(req.fromDate, req.toDate);
  const lower = (req.reason + " " + req.notes).toLowerCase();

  const hasValidDoc =
    lower.includes("giấy") ||
    lower.includes("chứng từ") ||
    lower.includes("xác nhận") ||
    lower.includes("đính kèm") ||
    lower.includes("bệnh viện") ||
    lower.includes("phòng khám");

  const docMentionedButUnclear =
    (lower.includes("mờ") || lower.includes("mất") || lower.includes("không rõ") || lower.includes("thiếu")) &&
    (lower.includes("chứng từ") || lower.includes("giấy"));

  // Rule: unpaid leave > 5 days → Vượt thẩm quyền
  if (req.leaveType === "Nghỉ không lương" && days > 5) {
    return {
      requestId,
      decision: "ESCALATE",
      policyBasis: "Điều 18.1 Quy chế Nhân sự — Phân cấp thẩm quyền phê duyệt nghỉ không lương",
      escalationQuestion: `Đơn nghỉ không lương ${days} ngày vượt thẩm quyền Quản lý trực tiếp (tối đa 5 ngày làm việc). Cần chuyển Giám đốc Khối / HRD phê duyệt?`,
      triggerCategory: "Vượt thẩm quyền",
      timestamp,
    };
  }

  // Rule: sick leave with unclear docs → Không chắc dữ kiện
  if (req.leaveType === "Nghỉ ốm/chế độ" && docMentionedButUnclear) {
    return {
      requestId,
      decision: "ESCALATE",
      policyBasis: "Điều 14.2 Quy chế Nhân sự — Yêu cầu chứng từ y tế hợp lệ, rõ ràng",
      escalationQuestion: `Chứng từ y tế không rõ ràng hoặc thiếu thông tin ngày điều trị. Yêu cầu ${req.employeeName} bổ sung bản scan rõ hoặc xác nhận lại từ cơ sở y tế?`,
      triggerCategory: "Không chắc dữ kiện",
      timestamp,
    };
  }

  // Rule: sick leave ≥ 2 days without doc → Không chắc dữ kiện
  if (req.leaveType === "Nghỉ ốm/chế độ" && days >= 2 && !hasValidDoc) {
    return {
      requestId,
      decision: "ESCALATE",
      policyBasis: "Điều 14.2 Quy chế Nhân sự — Yêu cầu chứng từ y tế hợp lệ cho nghỉ ốm từ 2 ngày",
      escalationQuestion: `Nghỉ ốm ${days} ngày nhưng chưa đính kèm chứng từ y tế hợp lệ. Yêu cầu ${req.employeeName} bổ sung trước khi phê duyệt?`,
      triggerCategory: "Không chắc dữ kiện",
      timestamp,
    };
  }

  // Rule: annual leave > 5 days consecutively → Vượt thẩm quyền
  if (req.leaveType === "Nghỉ phép năm" && days > 5) {
    return {
      requestId,
      decision: "ESCALATE",
      policyBasis: "Điều 10.3 Quy chế Nhân sự — Nghỉ phép năm liên tục > 5 ngày cần Trưởng phòng phê duyệt",
      escalationQuestion: `Nghỉ phép năm ${days} ngày liên tục vượt ngưỡng 5 ngày Quản lý trực tiếp có thể tự phê duyệt. Trưởng phòng xác nhận?`,
      triggerCategory: "Vượt thẩm quyền",
      timestamp,
    };
  }

  // Rule: personal/personal-reason leave without doc → Ngoài chính sách
  if (req.leaveType === "Nghỉ việc riêng" && !hasValidDoc) {
    return {
      requestId,
      decision: "ESCALATE",
      policyBasis: "Điều 15 Quy chế Nhân sự — Nghỉ việc riêng hưởng lương phải có minh chứng hợp lệ",
      escalationQuestion: `Đơn nghỉ việc riêng chưa đính kèm minh chứng hợp lệ (giấy kết hôn, giấy tang lễ, v.v.). Yêu cầu bổ sung hay từ chối?`,
      triggerCategory: "Ngoài chính sách",
      timestamp,
    };
  }

  // Default: auto-approve
  const policyMap: Record<string, string> = {
    "Nghỉ phép năm": "Điều 10.1 Quy chế Nhân sự — Nghỉ phép năm đủ điều kiện",
    "Nghỉ ốm/chế độ": "Điều 14.1 Quy chế Nhân sự — Nghỉ ốm có chứng từ hợp lệ",
    "Nghỉ không lương": "Điều 18.1 Quy chế Nhân sự — Nghỉ không lương trong thẩm quyền",
    "Nghỉ việc riêng": "Điều 15 Quy chế Nhân sự — Nghỉ việc riêng có minh chứng hợp lệ",
  };

  return {
    requestId,
    decision: "AUTO_APPROVE",
    policyBasis: policyMap[req.leaveType] ?? "Quy chế Nhân sự nội bộ — Đủ điều kiện tự động phê duyệt",
    timestamp,
  };
}
