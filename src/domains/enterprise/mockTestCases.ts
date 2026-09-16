export type LeaveType =
  | "Nghỉ phép năm"
  | "Nghỉ ốm/chế độ"
  | "Nghỉ không lương"
  | "Nghỉ việc riêng"
  | "Nghỉ thai sản";

export type DocEvidenceStatus = "VALID" | "UNCLEAR_DATE" | "MISSING" | "POOR_QUALITY";

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
  daysRequested: number;
  remainingLeaveBalance: number;
  fromDate: string;
  toDate: string;
  reason: string;
  notes: string;
  docEvidenceStatus: DocEvidenceStatus;
  isProbation?: boolean;
  isSpecialLongTerm?: boolean;
  expected: "AUTO_APPROVE" | "ESCALATE";
  expectedTrigger?: TriggerCategory;
  expectedQuestionRegex?: RegExp;
}

/**
 * 5 Ca Kiểm thử Chuẩn (Canonical 5 Test Cases) cho Enterprise Verify Harness
 * 3 ca thường quy (Auto-Approve) + 2 ca Escalate
 */
export const CANONICAL_5_TEST_CASES: TestCase[] = [
  {
    id: "TC-HR-01",
    employeeId: "NV-2024-0312",
    employeeName: "Nguyễn Thị Hương",
    department: "Phòng Kinh doanh",
    leaveType: "Nghỉ phép năm",
    daysRequested: 1,
    remainingLeaveBalance: 4,
    fromDate: "2025-10-15",
    toDate: "2025-10-15",
    reason: "Nghỉ phép năm theo kế hoạch cá nhân, nộp trước 3 ngày làm việc.",
    notes: "Xác nhận số dư phép năm còn 4 ngày hợp lệ. Đã bàn giao công việc.",
    docEvidenceStatus: "VALID",
    expected: "AUTO_APPROVE",
  },
  {
    id: "TC-HR-02",
    employeeId: "NV-2023-1102",
    employeeName: "Trần Văn Nam",
    department: "Phòng Kỹ thuật",
    leaveType: "Nghỉ việc riêng",
    daysRequested: 3,
    remainingLeaveBalance: 6,
    fromDate: "2025-11-01",
    toDate: "2025-11-03",
    reason: "Kết hôn lần đầu (nghỉ việc riêng hưởng nguyên lương theo Điều 115 Bộ luật Lao động).",
    notes: "Nộp kèm Giấy chứng nhận kết hôn bản sao công chứng hợp lệ.",
    docEvidenceStatus: "VALID",
    expected: "AUTO_APPROVE",
  },
  {
    id: "TC-HR-03",
    employeeId: "NV-1981-0592",
    employeeName: "Lê Thị Phương",
    department: "Phòng Kế hoạch & Quản lý Sản xuất",
    leaveType: "Nghỉ ốm/chế độ",
    daysRequested: 3,
    remainingLeaveBalance: 8,
    fromDate: "2025-10-20",
    toDate: "2025-10-22",
    reason: "Sốt siêu vi và viêm phế quản cấp, có chỉ định nghỉ điều trị ngoại trú của bác sĩ.",
    notes: "Có Giấy ra viện và chứng nhận khám bệnh Bệnh viện Quận 1 rõ ràng ngày tháng.",
    docEvidenceStatus: "VALID",
    expected: "AUTO_APPROVE",
  },
  {
    id: "TC-HR-04",
    employeeId: "NV-2020-0019",
    employeeName: "Trương Minh Trí",
    department: "Phòng Kinh doanh",
    leaveType: "Nghỉ ốm/chế độ",
    daysRequested: 6,
    remainingLeaveBalance: 5,
    fromDate: "2025-11-01",
    toDate: "2025-11-07",
    reason: "Nghỉ ốm phẫu thuật ruột thừa tại Bệnh viện Nhân dân Gia Định.",
    notes: "Mới nộp Giấy ra viện photocopy. Chưa nộp Giấy chứng nhận nghỉ việc hưởng BHXH (mẫu C65-HD).",
    docEvidenceStatus: "UNCLEAR_DATE",
    expected: "ESCALATE",
    expectedTrigger: "Không chắc dữ kiện",
  },
  {
    id: "TC-HR-05",
    employeeId: "NV-2021-0034",
    employeeName: "Hoàng Văn Bình",
    department: "Phòng Vận hành",
    leaveType: "Nghỉ không lương",
    daysRequested: 20,
    remainingLeaveBalance: 0,
    fromDate: "2025-11-10",
    toDate: "2025-12-05",
    reason: "Xin nghỉ không lương dài hạn để chăm sóc người thân bị bệnh nặng.",
    notes: "Bản cam kết bàn giao tiến độ vận hành. Thời gian nghỉ 20 ngày liên tục vượt thẩm quyền Quản lý trực tiếp.",
    docEvidenceStatus: "VALID",
    isSpecialLongTerm: true,
    expected: "ESCALATE",
    expectedTrigger: "Vượt thẩm quyền",
  },
];

/**
 * 15 Ca Toàn Diện (Full 15 Test Cases) cho Enterprise Testbed
 */
export const FULL_TEST_CASES: TestCase[] = [
  ...CANONICAL_5_TEST_CASES,
  {
    id: "TC-HR-06",
    employeeId: "NV-2024-0891",
    employeeName: "Phạm Thị Thảo",
    department: "Phòng Marketing",
    leaveType: "Nghỉ phép năm",
    daysRequested: 2,
    remainingLeaveBalance: 0,
    fromDate: "2025-10-25",
    toDate: "2025-10-26",
    reason: "Xin nghỉ phép năm đi du lịch cùng gia đình.",
    notes: "Nhân viên đang trong thời gian thử việc tháng thứ 1, chưa phát sinh quỹ ngày phép năm.",
    docEvidenceStatus: "VALID",
    isProbation: true,
    expected: "ESCALATE",
    expectedTrigger: "Ngoài chính sách",
  },
  {
    id: "TC-HR-07",
    employeeId: "NV-2022-4412",
    employeeName: "Đỗ Quốc Bảo",
    department: "Phòng IT & Hạ tầng",
    leaveType: "Nghỉ việc riêng",
    daysRequested: 2,
    remainingLeaveBalance: 3,
    fromDate: "2025-11-12",
    toDate: "2025-11-13",
    reason: "Nghỉ việc riêng gia đình đi công chuyện riêng ở quê.",
    notes: "Không có giấy tờ minh chứng theo Điều 15 Quy chế Nhân sự.",
    docEvidenceStatus: "MISSING",
    expected: "ESCALATE",
    expectedTrigger: "Ngoài chính sách",
  },
  {
    id: "TC-HR-08",
    employeeId: "NV-2021-9901",
    employeeName: "Vũ Hải Đăng",
    department: "Phòng Tài chính - Kế toán",
    leaveType: "Nghỉ ốm/chế độ",
    daysRequested: 2,
    remainingLeaveBalance: 7,
    fromDate: "2025-10-18",
    toDate: "2025-10-19",
    reason: "Khám bệnh ngoại trú theo bảo hiểm y tế.",
    notes: "Ảnh chụp giấy khám bệnh bị mờ ngày khám và thiếu con dấu tròn của phòng khám.",
    docEvidenceStatus: "UNCLEAR_DATE",
    expected: "ESCALATE",
    expectedTrigger: "Không chắc dữ kiện",
  },
  {
    id: "TC-HR-09",
    employeeId: "NV-2023-0145",
    employeeName: "Lâm Mỹ Dung",
    department: "Phòng Hành chính - Nhân sự",
    leaveType: "Nghỉ phép năm",
    daysRequested: 8,
    remainingLeaveBalance: 10,
    fromDate: "2025-12-01",
    toDate: "2025-12-10",
    reason: "Nghỉ phép năm liên tục 8 ngày làm việc để giải quyết việc gia đình.",
    notes: "Số dư phép năm còn 10 ngày. Thời gian nghỉ liên tục > 5 ngày làm việc vượt thẩm quyền Quản lý trực tiếp.",
    docEvidenceStatus: "VALID",
    expected: "ESCALATE",
    expectedTrigger: "Vượt thẩm quyền",
  },
  {
    id: "TC-HR-10",
    employeeId: "NV-2022-7789",
    employeeName: "Nguyễn Tuấn Anh",
    department: "Phòng Dự án",
    leaveType: "Nghỉ phép năm",
    daysRequested: 2,
    remainingLeaveBalance: 5,
    fromDate: "2025-10-08",
    toDate: "2025-10-09",
    reason: "Nghỉ phép năm giải quyết việc riêng, đã nộp đơn trước 3 ngày làm việc.",
    notes: "Đầy đủ chữ ký bàn giao công việc cho đồng nghiệp trong nhóm.",
    docEvidenceStatus: "VALID",
    expected: "AUTO_APPROVE",
  },
  {
    id: "TC-HR-11",
    employeeId: "NV-2020-5531",
    employeeName: "Bùi Thị Bích",
    department: "Phòng Kế toán",
    leaveType: "Nghỉ ốm/chế độ",
    daysRequested: 4,
    remainingLeaveBalance: 6,
    fromDate: "2025-11-15",
    toDate: "2025-11-18",
    reason: "Điều trị sốt xuất huyết tại Bệnh viện Thống Nhất.",
    notes: "Giấy ra viện có mộc đỏ và chữ ký trưởng khoa điều trị rõ ràng.",
    docEvidenceStatus: "VALID",
    expected: "AUTO_APPROVE",
  },
  {
    id: "TC-HR-12",
    employeeId: "NV-2023-3321",
    employeeName: "Đinh Công Thành",
    department: "Phòng Sản phẩm",
    leaveType: "Nghỉ không lương",
    daysRequested: 7,
    remainingLeaveBalance: 2,
    fromDate: "2025-11-20",
    toDate: "2025-11-28",
    reason: "Nghỉ không lương 7 ngày làm việc để tham gia khóa đào tạo chuyên sâu cá nhân.",
    notes: "Nghỉ không lương > 5 ngày vượt thẩm quyền Quản lý trực tiếp, cần Trưởng phòng / HRD duyệt.",
    docEvidenceStatus: "VALID",
    expected: "ESCALATE",
    expectedTrigger: "Vượt thẩm quyền",
  },
  {
    id: "TC-HR-13",
    employeeId: "NV-2024-1190",
    employeeName: "Mai Thu Trang",
    department: "Phòng Thiết kế",
    leaveType: "Nghỉ việc riêng",
    daysRequested: 3,
    remainingLeaveBalance: 4,
    fromDate: "2025-10-28",
    toDate: "2025-10-30",
    reason: "Nghỉ tang chế (ông bà nội ngoại qua đời hưởng lương theo quy chế nội bộ).",
    notes: "Nộp kèm giấy cáo phó gia đình rõ ràng.",
    docEvidenceStatus: "VALID",
    expected: "AUTO_APPROVE",
  },
  {
    id: "TC-HR-14",
    employeeId: "NV-2021-6643",
    employeeName: "Trịnh Gia Huy",
    department: "Phòng Vận hành",
    leaveType: "Nghỉ ốm/chế độ",
    daysRequested: 5,
    remainingLeaveBalance: 3,
    fromDate: "2025-11-05",
    toDate: "2025-11-10",
    reason: "Phẫu thuật chấn thương cổ tay.",
    notes: "Bản chụp giấy xác nhận y tế bị nhòe vết mực ở phần ngày điều trị.",
    docEvidenceStatus: "UNCLEAR_DATE",
    expected: "ESCALATE",
    expectedTrigger: "Không chắc dữ kiện",
  },
  {
    id: "TC-HR-15",
    employeeId: "NV-2022-8812",
    employeeName: "Phan Văn Hậu",
    department: "Phòng Chăm sóc Khách hàng",
    leaveType: "Nghỉ phép năm",
    daysRequested: 1,
    remainingLeaveBalance: 6,
    fromDate: "2025-10-14",
    toDate: "2025-10-14",
    reason: "Nghỉ phép năm theo lịch cá nhân.",
    notes: "Đã hoàn thành bàn giao ca trực.",
    docEvidenceStatus: "VALID",
    expected: "AUTO_APPROVE",
  },
];

export function getCaseLabel(tc: TestCase): string {
  return `${tc.id} · ${tc.employeeName} (${tc.department}) — ${tc.leaveType} (${tc.daysRequested} ngày)`;
}
