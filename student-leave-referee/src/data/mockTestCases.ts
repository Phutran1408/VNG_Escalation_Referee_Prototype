import type { TestCase, VerifyResult, EvaluateResponse, EvaluateRequest } from "../types";

/**
 * 5 Ca Kiểm thử Chuẩn (Canonical 5 Test Cases) cho Verify Harness (SV4)
 * 3 ca thường quy (Auto-Approve) + 2 ca Escalate
 */
export const CANONICAL_5_TEST_CASES: TestCase[] = [
  {
    id: "TC01",
    studentId: "SV-2024-1001",
    studentName: "Nguyễn Văn An",
    faculty: "Khoa Công nghệ Thông tin",
    courseName: "Lập trình Web nâng cao",
    totalSessions: 15,
    pastAbsences: 0,
    sessionsRequested: 1,
    fromDate: "2025-10-10",
    toDate: "2025-10-10",
    leaveType: "Nghỉ ốm điều trị",
    reason: "Sốt siêu vi cần nghỉ điều trị tại nhà 1 ngày.",
    notes: "Đính kèm: Giấy khám bệnh Bệnh viện Quận 1 rõ ngày khám 10/10/2025.",
    docEvidenceStatus: "VALID",
    expected: "AUTO_APPROVE",
  },
  {
    id: "TC02",
    studentId: "SV-2023-2045",
    studentName: "Trần Thị Mai",
    faculty: "Khoa Kinh tế & Quản trị",
    courseName: "Kinh tế Vi mô",
    totalSessions: 15,
    pastAbsences: 1,
    sessionsRequested: 1,
    fromDate: "2025-10-15",
    toDate: "2025-10-15",
    leaveType: "Nghỉ việc riêng gia đình",
    reason: "Về quê dự đám tang người thân ruột thịt (ông nội mất).",
    notes: "Có giấy cáo phó gia đình gửi kèm và xác nhận của phụ huynh.",
    docEvidenceStatus: "VALID",
    expected: "AUTO_APPROVE",
  },
  {
    id: "TC03",
    studentId: "SV-2022-3108",
    studentName: "Lê Quốc Bảo",
    faculty: "Khoa Ngoại ngữ",
    courseName: "Tiếng Anh Chuyên ngành 2",
    totalSessions: 30,
    pastAbsences: 2,
    sessionsRequested: 1,
    fromDate: "2025-11-05",
    toDate: "2025-11-05",
    leaveType: "Nghỉ tham gia hoạt động trường",
    reason: "Đại diện Đoàn trường tham dự Hội nghị Thanh niên Khởi nghiệp toàn quốc.",
    notes: "Đính kèm: Giấy triệu tập chính thức số 88/QĐ-ĐTN có dấu mộc Đoàn trường.",
    docEvidenceStatus: "VALID",
    expected: "AUTO_APPROVE",
  },
  {
    id: "TC04",
    studentId: "SV-2024-4099",
    studentName: "Phạm Đức Anh",
    faculty: "Khoa Công nghệ Thông tin",
    courseName: "Cấu trúc Dữ liệu & Giải thuật",
    totalSessions: 15,
    pastAbsences: 1,
    sessionsRequested: 1,
    fromDate: "2025-10-12",
    toDate: "2025-10-12",
    leaveType: "Nghỉ ốm điều trị",
    reason: "Khám bệnh tại cơ sở y tế, xin nghỉ buổi thực hành.",
    notes: "Giấy khám bệnh không đọc được ngày: bản scan bị mờ nhoè phần ngày khám và chữ ký bác sĩ.",
    docEvidenceStatus: "UNCLEAR_DATE",
    expected: "ESCALATE",
    expectedTrigger: "Không chắc dữ kiện",
  },
  {
    id: "TC05",
    studentId: "SV-2023-5012",
    studentName: "Hoàng Minh Tuấn",
    faculty: "Khoa Điện tử - Viễn thông",
    courseName: "Kiến trúc Máy tính",
    totalSessions: 15,
    pastAbsences: 3, // Đã nghỉ 3 buổi (20%)
    sessionsRequested: 1, // Tổng 4/15 buổi = 26.7% > 20%
    fromDate: "2025-11-20",
    toDate: "2025-11-20",
    leaveType: "Nghỉ ốm điều trị",
    reason: "Tái khám định kỳ sau phẫu thuật chấn thương.",
    notes: "Sinh viên đã vắng 3 buổi trước đó. Nếu duyệt thêm buổi này sẽ thành 4/15 buổi, vượt quá 20% số buổi học phần.",
    docEvidenceStatus: "VALID",
    expected: "ESCALATE",
    expectedTrigger: "Ngoài chính sách",
  },
];

/**
 * BỘ 15 CA KIỂM THỬ TOÀN DIỆN (Đạt yêu cầu SV1 & SV2)
 * Cài sẵn ca thường quy, ca nhập nhằng dữ kiện, ca ngoài chính sách, ca vượt thẩm quyền
 */
export const FULL_15_TEST_CASES: TestCase[] = [
  ...CANONICAL_5_TEST_CASES,
  // ── Thêm ca Dừng Loại 3: Vượt thẩm quyền ──────────────────────────────────
  {
    id: "TC06",
    studentId: "SV-2022-6789",
    studentName: "Đặng Thu Hà",
    faculty: "Khoa Luật Quốc tế",
    courseName: "Toàn bộ học kỳ I (2025 - 2026)",
    totalSessions: 60,
    pastAbsences: 0,
    sessionsRequested: 60,
    fromDate: "2025-10-01",
    toDate: "2026-01-30",
    leaveType: "Xin bảo lưu học kỳ",
    reason: "Gia đình gặp biến cố lớn, xin bảo lưu kết quả học tập cả học kỳ để hỗ trợ kinh tế gia đình.",
    notes: "Đơn xin bảo lưu học kỳ trọn vẹn. Thuộc thẩm quyền Trưởng khoa.",
    docEvidenceStatus: "VALID",
    isSemesterDeferral: true,
    expected: "ESCALATE",
    expectedTrigger: "Vượt thẩm quyền",
  },
  {
    id: "TC07",
    studentId: "SV-2021-7890",
    studentName: "Vũ Đình Trọng",
    faculty: "Khoa Cơ khí",
    courseName: "Chi tiết máy",
    totalSessions: 15,
    pastAbsences: 0,
    sessionsRequested: 10,
    fromDate: "2025-11-01",
    toDate: "2025-12-15",
    leaveType: "Nghỉ ốm điều trị",
    reason: "Phẫu thuật chấn thương chỉnh hình và phục hồi chức năng dài ngày (nghỉ 10 buổi liên tiếp).",
    notes: "Thời gian nghỉ dài vượt quá thẩm quyền của Giảng viên phụ trách, cần Trưởng khoa xét duyệt kế hoạch học bù.",
    docEvidenceStatus: "VALID",
    expected: "ESCALATE",
    expectedTrigger: "Vượt thẩm quyền",
  },
  // ── Thêm ca Dừng Loại 1: Không chắc dữ kiện ──────────────────────────────
  {
    id: "TC08",
    studentId: "SV-2024-8123",
    studentName: "Bùi Thị Yến",
    faculty: "Khoa Hóa học",
    courseName: "Hóa Phân tích",
    totalSessions: 15,
    pastAbsences: 1,
    sessionsRequested: 1,
    fromDate: "2025-10-18",
    toDate: "2025-10-18",
    leaveType: "Nghỉ ốm điều trị",
    reason: "Điều trị viêm họng cấp có giấy xác nhận của phòng khám tư nhân.",
    notes: "Giấy xác nhận bị chụp mất góc trên bên phải, không rõ ngày vào khám là 18/10 hay 28/10.",
    docEvidenceStatus: "UNCLEAR_DATE",
    expected: "ESCALATE",
    expectedTrigger: "Không chắc dữ kiện",
  },
  {
    id: "TC09",
    studentId: "SV-2023-9234",
    studentName: "Dương Quốc Hưng",
    faculty: "Khoa CNTT",
    courseName: "Hệ điều hành",
    totalSessions: 15,
    pastAbsences: 0,
    sessionsRequested: 2,
    fromDate: "2025-11-12",
    toDate: "2025-11-13",
    leaveType: "Nghỉ ốm điều trị",
    reason: "Nghỉ điều trị ngoại trú.",
    notes: "Bản sao toa thuốc bị mờ ngày chỉ định, không ghi rõ số ngày bác sĩ dặn nghỉ ngơi.",
    docEvidenceStatus: "UNCLEAR_DATE",
    expected: "ESCALATE",
    expectedTrigger: "Không chắc dữ kiện",
  },
  // ── Thêm ca Dừng Loại 2: Ngoài chính sách ────────────────────────────────
  {
    id: "TC10",
    studentId: "SV-2023-1357",
    studentName: "Lý Gia Hân",
    faculty: "Khoa Du lịch",
    courseName: "Quản trị Khách sạn",
    totalSessions: 15,
    pastAbsences: 2,
    sessionsRequested: 2, // 2 + 2 = 4/15 = 26.7% > 20%
    fromDate: "2025-11-25",
    toDate: "2025-11-26",
    leaveType: "Nghỉ việc riêng gia đình",
    reason: "Gia đình tổ chức đi du lịch kỷ niệm ngày cưới của bố mẹ.",
    notes: "Tổng số buổi vắng thành 4/15 buổi, vượt quá 20% khung quy chế, lý do đi du lịch không thuộc danh mục ưu tiên xét miễn.",
    docEvidenceStatus: "MISSING",
    expected: "ESCALATE",
    expectedTrigger: "Ngoài chính sách",
  },
  {
    id: "TC11",
    studentId: "SV-2024-2468",
    studentName: "Ngô Kiến Huy",
    faculty: "Khoa Tài chính",
    courseName: "Thị trường Chứng khoán",
    totalSessions: 15,
    pastAbsences: 0,
    sessionsRequested: 1,
    fromDate: "2025-12-01",
    toDate: "2025-12-01",
    leaveType: "Nghỉ việc riêng gia đình",
    reason: "Đi phượt với bạn bè cuối tuần chưa về kịp.",
    notes: "Lý do cá nhân thuần túy, hoàn toàn không có giấy tờ minh chứng hoặc xác nhận gia đình.",
    docEvidenceStatus: "MISSING",
    expected: "ESCALATE",
    expectedTrigger: "Ngoài chính sách",
  },
  // ── Thêm ca Thường quy (AUTO_APPROVE) ──────────────────────────────────
  {
    id: "TC12",
    studentId: "SV-2024-3579",
    studentName: "Đỗ Thùy Linh",
    faculty: "Khoa Quản trị Kinh doanh",
    courseName: "Marketing Căn bản",
    totalSessions: 15,
    pastAbsences: 0,
    sessionsRequested: 1,
    fromDate: "2025-10-22",
    toDate: "2025-10-22",
    leaveType: "Nghỉ ốm điều trị",
    reason: "Đau răng cần tiểu phẫu nhổ răng khôn theo lịch hẹn bác sĩ.",
    notes: "Đính kèm: Sổ khám bệnh Bệnh viện Răng Hàm Mặt Trung ương có ghi rõ chỉ định nghỉ 1 ngày.",
    docEvidenceStatus: "VALID",
    expected: "AUTO_APPROVE",
  },
  {
    id: "TC13",
    studentId: "SV-2023-4680",
    studentName: "Phan Văn Hậu",
    faculty: "Khoa Xây dựng",
    courseName: "Sức bền Vật liệu",
    totalSessions: 20,
    pastAbsences: 1,
    sessionsRequested: 1, // 2/20 = 10% <= 20%
    fromDate: "2025-11-08",
    toDate: "2025-11-08",
    leaveType: "Nghỉ tham gia hoạt động trường",
    reason: "Tham gia đội tuyển Robocon trường thi đấu vòng loại khu vực phía Nam.",
    notes: "Có công văn cử đoàn dự thi của Ban Giám hiệu ký ngày 02/11/2025.",
    docEvidenceStatus: "VALID",
    expected: "AUTO_APPROVE",
  },
  {
    id: "TC14",
    studentId: "SV-2022-5791",
    studentName: "Cao Minh Nhật",
    faculty: "Khoa Vật lý",
    courseName: "Quang học Ứng dụng",
    totalSessions: 15,
    pastAbsences: 1,
    sessionsRequested: 1, // 2/15 = 13.3% <= 20%
    fromDate: "2025-11-15",
    toDate: "2025-11-15",
    leaveType: "Nghỉ ốm điều trị",
    reason: "Khám chuyên khoa mắt do kích ứng giác mạc trong phòng thí nghiệm.",
    notes: "Giấy khám Bệnh viện Mắt TP.HCM có mộc tròn rõ ngày 15/11/2025.",
    docEvidenceStatus: "VALID",
    expected: "AUTO_APPROVE",
  },
  {
    id: "TC15",
    studentId: "SV-2024-6802",
    studentName: "Lâm Thị Diễm",
    faculty: "Khoa Sinh học",
    courseName: "Vi sinh đại cương",
    totalSessions: 15,
    pastAbsences: 0,
    sessionsRequested: 1, // 1/15 = 6.7% <= 20%
    fromDate: "2025-11-18",
    toDate: "2025-11-18",
    leaveType: "Nghỉ việc riêng gia đình",
    reason: "Chị ruột làm lễ cưới ở quê, xin nghỉ 1 buổi học lý thuyết.",
    notes: "Kèm thiệp cưới và đơn xin phép có chữ ký phụ huynh.",
    docEvidenceStatus: "VALID",
    expected: "AUTO_APPROVE",
  },
];

export const TEST_CASES = CANONICAL_5_TEST_CASES;

export function getCaseLabel(caseId: string): string {
  const map: Record<string, string> = {
    TC01: "Nghỉ ốm có giấy khám rõ ràng · 1 buổi (<=20%)",
    TC02: "Nghỉ việc riêng tang chế có xác nhận · 1 buổi (<=20%)",
    TC03: "Nghỉ hoạt động Đoàn trường có công văn · 1 buổi (<=20%)",
    TC04: "Nghỉ ốm · Giấy khám không đọc được ngày",
    TC05: "Nghỉ quá 20% số buổi học phần (4/15 buổi)",
    TC06: "Xin bảo lưu cả học kỳ (Vượt thẩm quyền)",
    TC07: "Nghỉ điều trị 10 buổi liên tục (Vượt thẩm quyền)",
    TC08: "Giấy khám mất góc không rõ ngày (Không chắc dữ kiện)",
    TC09: "Toa thuốc mờ ngày chỉ định (Không chắc dữ kiện)",
    TC10: "Nghỉ đi du lịch vượt 20% số buổi (Ngoài chính sách)",
    TC11: "Đi phượt không minh chứng (Ngoài chính sách)",
    TC12: "Nhổ răng khôn sổ khám rõ ngày · Thường quy",
    TC13: "Thi đấu Robocon công văn BGH · Thường quy",
    TC14: "Khám mắt giấy BV Mắt TP.HCM · Thường quy",
    TC15: "Đám cưới chị ruột có đơn phụ huynh · Thường quy",
  };
  return map[caseId] ?? "Ca kiểm thử chuyên cần";
}

export function runMockVerify(testSet: TestCase[] = CANONICAL_5_TEST_CASES): VerifyResult[] {
  const now = new Date().toISOString();
  return testSet.map((tc) => {
    // Chạy qua chính lõi Evaluate để đảm bảo tính nhất quán tuyệt đối giữa test và thực thi
    const evalRes = runMockEvaluate({
      studentId: tc.studentId,
      studentName: tc.studentName,
      faculty: tc.faculty,
      courseName: tc.courseName,
      totalSessions: tc.totalSessions,
      pastAbsences: tc.pastAbsences,
      sessionsRequested: tc.sessionsRequested,
      fromDate: tc.fromDate,
      toDate: tc.toDate,
      leaveType: tc.leaveType,
      docEvidenceStatus: tc.docEvidenceStatus,
      isSemesterDeferral: tc.isSemesterDeferral,
      reason: tc.reason,
      notes: tc.notes,
    });

    const pass = evalRes.decision === tc.expected;

    return {
      caseId: tc.id,
      summary: `${tc.studentId} · ${tc.studentName} · ${tc.faculty} · Môn: ${tc.courseName} · Xin nghỉ ${tc.sessionsRequested} buổi (Tổng ${tc.pastAbsences + tc.sessionsRequested}/${tc.totalSessions})`,
      expected: tc.expected,
      actual: evalRes.decision,
      pass,
      triggerCategory: evalRes.triggerCategory,
      escalationQuestion: evalRes.escalationQuestion,
      policyBasis: evalRes.policyBasis,
      timestamp: now,
    };
  });
}

/**
 * SV2 — Lõi Agent Quyết định Phân xử (Escalation Referee Engine)
 * Quy tắc bất biến:
 * 1. Tự động xử lý ca thường quy -> AUTO_APPROVE.
 * 2. Phân loại độ bất định thành 3 loại dừng:
 *    - "Không chắc dữ kiện": Giấy khám bệnh không đọc được ngày -> "nghỉ từ ngày nào?"
 *    - "Ngoài chính sách": Đã nghỉ quá 20% số buổi -> "vượt mức cho phép, có xét đặc biệt không?"
 *    - "Vượt thẩm quyền": Xin bảo lưu cả học kỳ -> "thuộc thẩm quyền trưởng khoa."
 * 3. Câu hỏi escalate phải cụ thể, trả lời được trong một lượt (single-turn actionable question).
 * 4. Không bao giờ xuất kết quả chắc chắn trên ca đã gắn cờ (luôn là ESCALATE).
 */
export function runMockEvaluate(req: EvaluateRequest): EvaluateResponse {
  const requestId = `STU-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const timestamp = new Date().toISOString();
  const textContent = `${req.reason} ${req.notes}`.toLowerCase();

  const totalAbsences = (Number(req.pastAbsences) || 0) + (Number(req.sessionsRequested) || 1);
  const totalSessions = Math.max(1, Number(req.totalSessions) || 15);
  const absenceRatio = totalAbsences / totalSessions;
  const isExceeded20Percent = absenceRatio > 0.20;

  // ── DỪNG LOẠI 3: Vượt thẩm quyền ─────────────────────────────────────────
  // Xin bảo lưu cả học kỳ / nghỉ dài hạn toàn khóa -> "thuộc thẩm quyền trưởng khoa."
  const isDeferral =
    req.isSemesterDeferral ||
    req.leaveType === "Xin bảo lưu học kỳ" ||
    textContent.includes("bảo lưu cả học kỳ") ||
    textContent.includes("bảo lưu học kỳ") ||
    req.sessionsRequested >= 10;

  if (isDeferral) {
    return {
      requestId,
      decision: "ESCALATE",
      policyBasis: "Điều 3.2 Quy chế Đào tạo — Thẩm quyền phê duyệt bảo lưu học kỳ thuộc Trưởng khoa / Phòng Đào tạo",
      escalationQuestion: `Đơn xin bảo lưu cả học kỳ của sinh viên ${req.studentName} (${req.studentId}) thuộc thẩm quyền Trưởng khoa. Chuyển hồ sơ lên Trưởng khoa phê duyệt?`,
      triggerCategory: "Vượt thẩm quyền",
      timestamp,
      details: {
        absenceRatio,
        maxAllowedRatio: 0.20,
        isExceeded20Percent,
      },
    };
  }

  // ── DỪNG LOẠI 1: Không chắc dữ kiện ──────────────────────────────────────
  // Giấy khám bệnh không đọc được ngày -> "nghỉ từ ngày nào?"
  const isUnclearDateDoc =
    req.docEvidenceStatus === "UNCLEAR_DATE" ||
    textContent.includes("mờ") ||
    textContent.includes("không đọc được ngày") ||
    textContent.includes("không rõ ngày") ||
    textContent.includes("mất góc") ||
    textContent.includes("mất ngày");

  if (isUnclearDateDoc) {
    return {
      requestId,
      decision: "ESCALATE",
      policyBasis: "Điều 2.2 Quy chế Đào tạo — Yêu cầu chứng từ y tế rõ ràng mốc thời gian nghỉ",
      escalationQuestion: `Giấy khám bệnh không đọc được ngày: Sinh viên ${req.studentName} xin nghỉ từ ngày nào?`,
      triggerCategory: "Không chắc dữ kiện",
      timestamp,
      details: {
        absenceRatio,
        maxAllowedRatio: 0.20,
        isExceeded20Percent,
      },
    };
  }

  // ── DỪNG LOẠI 2: Ngoài chính sách ────────────────────────────────────────
  // Đã nghỉ quá 20% số buổi -> "vượt mức cho phép, có xét đặc biệt không?"
  if (isExceeded20Percent) {
    const pct = (absenceRatio * 100).toFixed(1);
    return {
      requestId,
      decision: "ESCALATE",
      policyBasis: "Điều 1.2 & 1.3 Quy chế Đào tạo — Tổng số buổi nghỉ vượt quá 20% học phần (nguy cơ cấm thi)",
      escalationQuestion: `Sinh viên ${req.studentName} đã nghỉ ${totalAbsences}/${totalSessions} buổi (${pct}%), vượt mức cho phép (quá 20% số buổi). Giảng viên/Khoa có xét đặc biệt không?`,
      triggerCategory: "Ngoài chính sách",
      timestamp,
      details: {
        absenceRatio,
        maxAllowedRatio: 0.20,
        isExceeded20Percent: true,
      },
    };
  }

  // DỪNG LOẠI 2 (phụ): Nghỉ việc riêng nhưng không có bất kỳ giấy tờ minh chứng nào
  if (req.leaveType === "Nghỉ việc riêng gia đình" && req.docEvidenceStatus === "MISSING") {
    return {
      requestId,
      decision: "ESCALATE",
      policyBasis: "Điều 1.1 Quy chế Đào tạo — Nghỉ việc riêng gia đình phải có đơn/minh chứng hợp lệ",
      escalationQuestion: `Đơn nghỉ việc riêng của sinh viên ${req.studentName} chưa có giấy tờ xác nhận, vượt quy định thông thường. Có xét duyệt ngoại lệ không?`,
      triggerCategory: "Ngoài chính sách",
      timestamp,
      details: {
        absenceRatio,
        maxAllowedRatio: 0.20,
        isExceeded20Percent: false,
      },
    };
  }

  // ── CA THƯỜNG QUY: Tự động phê duyệt (AUTO_APPROVE) ─────────────────────
  const policyMap: Record<string, string> = {
    "Nghỉ ốm điều trị": "Điều 2.1 Quy chế Đào tạo — Nghỉ ốm có chứng từ y tế hợp lệ, trong hạn mức chuyên cần (<= 20%)",
    "Nghỉ việc riêng gia đình": "Điều 1.1 Quy chế Đào tạo — Nghỉ việc riêng có minh chứng hợp lệ, trong hạn mức chuyên cần",
    "Nghỉ tham gia hoạt động trường": "Điều 3.1 Quy chế Đào tạo — Đại diện trường tham gia hoạt động có công văn xác nhận",
  };

  return {
    requestId,
    decision: "AUTO_APPROVE",
    policyBasis:
      policyMap[req.leaveType] ??
      "Điều 1 Quy chế Đào tạo — Đơn xin nghỉ hợp lệ, minh chứng đầy đủ, đủ điều kiện tự động phê duyệt",
    timestamp,
    details: {
      absenceRatio,
      maxAllowedRatio: 0.20,
      isExceeded20Percent: false,
    },
  };
}
