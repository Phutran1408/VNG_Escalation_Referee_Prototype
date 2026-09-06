import type {
  AgentEvaluationInput,
  AgentEvaluationOutput,
  DecisionLog,
  ReasoningStep,
  UncertaintyCategory,
} from "./types";

/**
 * SV2 — LÕI AGENT PHÂN XỬ QUYẾT ĐỊNH (THE ESCALATION REFEREE ENGINE)
 *
 * Các nguyên tắc vàng:
 * 1. Tự động duyệt ca thường quy.
 * 2. Phân loại độ bất định thành 3 loại dừng bắt buộc.
 * 3. Câu hỏi Escalate phải cụ thể, trả lời được trong 1 lượt.
 * 4. NGUYÊN TẮC BẤT BIẾN (INVARIANCE): Không bao giờ xuất kết quả chắc chắn trên ca đã gắn cờ.
 * 5. Bàn giao: Mã nguồn + Log quyết định (Reasoning Trace & Decision Log).
 */
export class EscalationRefereeAgent {
  private systemName: string = "AI Escalation Referee Agent (SV2)";

  /**
   * Đánh giá đơn xin nghỉ và phân loại độ bất định
   */
  public evaluate(input: AgentEvaluationInput): AgentEvaluationOutput {
    const decisionId = `DEC-${input.domain === "enterprise" ? "HR" : "STU"}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const timestamp = new Date().toISOString();
    const trace: ReasoningStep[] = [];

    const fullText = `${input.reasonText} ${input.notesText}`.toLowerCase();

    // ── BƯỚC 1: KIỂM TRA THẨM QUYỀN (AUTHORITY LIMIT CHECK) ──────────────────
    let isAuthorityExceeded = false;
    let authorityReason = "";
    let authorityQuestion = "";

    if (input.domain === "enterprise") {
      // Doanh nghiệp: Nghỉ không lương > 5 ngày vượt thẩm quyền Quản lý trực tiếp
      if (input.leaveType === "Nghỉ không lương" && input.durationDaysOrSessions > 5) {
        isAuthorityExceeded = true;
        authorityReason = "Điều 18.1 Quy chế Nhân sự — Nghỉ không lương > 5 ngày vượt thẩm quyền Quản lý trực tiếp (tối đa 5 ngày làm việc).";
        authorityQuestion = `Đơn nghỉ không lương ${input.durationDaysOrSessions} ngày vượt thẩm quyền Quản lý trực tiếp (tối đa 5 ngày). Cần chuyển Giám đốc Khối / HRD phê duyệt theo Điều 18.1 Quy chế?`;
      }
    } else {
      // Trường học: Xin bảo lưu cả học kỳ hoặc nghỉ dài hạn toàn khóa
      const isDeferral =
        input.isSpecialRequest ||
        input.leaveType === "Xin bảo lưu học kỳ" ||
        fullText.includes("bảo lưu cả học kỳ") ||
        fullText.includes("bảo lưu học kỳ") ||
        input.durationDaysOrSessions >= 10;

      if (isDeferral) {
        isAuthorityExceeded = true;
        authorityReason = "Điều 3.2 Quy chế Đào tạo — Thẩm quyền phê duyệt bảo lưu học kỳ thuộc Trưởng khoa / Phòng Đào tạo.";
        authorityQuestion = `Đơn xin bảo lưu cả học kỳ của sinh viên ${input.subjectName} (${input.subjectId}) thuộc thẩm quyền Trưởng khoa. Chuyển hồ sơ lên Trưởng khoa phê duyệt?`;
      }
    }

    trace.push({
      checkName: "Kiểm tra Phân cấp Thẩm quyền (Authority Check)",
      passed: !isAuthorityExceeded,
      observation: isAuthorityExceeded
        ? `Phát hiện vượt thẩm quyền: ${authorityReason}`
        : "Nằm trong phạm vi thẩm quyền phê duyệt của cấp cơ sở (Quản lý trực tiếp / Giảng viên).",
      ruleCited: input.domain === "enterprise" ? "Điều 18.1 Quy chế Nhân sự" : "Điều 3.2 Quy chế Đào tạo",
    });

    if (isAuthorityExceeded) {
      return this.buildEscalateResponse(
        decisionId,
        "Vượt thẩm quyền",
        authorityReason,
        authorityQuestion,
        trace,
        timestamp
      );
    }

    // ── BƯỚC 2: KIỂM TRA ĐỘ RÕ RÀNG CỦA DỮ KIỆN (FACT UNCERTAINTY CHECK) ─────
    let isFactUncertain = false;
    let factReason = "";
    let factQuestion = "";

    const hasUnclearKeywords =
      input.docStatus === "UNCLEAR_DATE" ||
      fullText.includes("mờ") ||
      fullText.includes("không rõ ngày") ||
      fullText.includes("không đọc được ngày") ||
      fullText.includes("mất góc") ||
      fullText.includes("mất ngày");

    if (hasUnclearKeywords) {
      isFactUncertain = true;
      if (input.domain === "enterprise") {
        factReason = "Điều 14.2 Quy chế Nhân sự — Yêu cầu chứng từ y tế rõ ràng mốc thời gian điều trị để thanh toán chế độ.";
        factQuestion = `Chứng từ y tế mờ ngày xuất viện: Nhân viên ${input.subjectName} xin nghỉ từ ngày nào đến ngày nào để phòng HR đối soát công và BHXH?`;
      } else {
        factReason = "Điều 2.2 Quy chế Đào tạo — Yêu cầu chứng từ y tế rõ ràng mốc ngày khám/nghỉ để đối soát điểm danh.";
        factQuestion = `Giấy khám bệnh không đọc được ngày: Sinh viên ${input.subjectName} xin nghỉ từ ngày nào?`;
      }
    }

    trace.push({
      checkName: "Kiểm tra Dữ kiện & Minh chứng (Fact Uncertainty Check)",
      passed: !isFactUncertain,
      observation: isFactUncertain
        ? `Dữ kiện không rõ ràng: ${factReason}`
        : "Chứng từ y tế / hồ sơ đính kèm rõ ràng, xác thực được các mốc thời gian.",
      ruleCited: input.domain === "enterprise" ? "Điều 14.2 Quy chế Nhân sự" : "Điều 2.2 Quy chế Đào tạo",
    });

    if (isFactUncertain) {
      return this.buildEscalateResponse(
        decisionId,
        "Không chắc dữ kiện",
        factReason,
        factQuestion,
        trace,
        timestamp
      );
    }

    // ── BƯỚC 3: KIỂM TRA ĐIỀU KIỆN CHÍNH SÁCH (POLICY COMPLIANCE CHECK) ───────
    let isPolicyViolated = false;
    let policyReason = "";
    let policyQuestion = "";

    if (input.domain === "enterprise") {
      // Doanh nghiệp: Nghỉ việc riêng nhưng không có bất kỳ giấy tờ/căn cứ hợp lệ
      if (input.leaveType === "Nghỉ việc riêng" && input.docStatus === "MISSING") {
        isPolicyViolated = true;
        policyReason = "Điều 15 Quy chế Nhân sự — Nghỉ việc riêng hưởng lương bắt buộc có minh chứng (kết hôn, tang chế).";
        policyQuestion = `Đơn nghỉ việc riêng của ${input.subjectName} chưa có giấy tờ minh chứng theo Điều 15. Quản lý có duyệt ngoại lệ không hưởng lương không?`;
      }
    } else {
      // Trường học: Vượt 20% tổng số buổi học phần (nguy cơ cấm thi)
      const past = Number(input.pastAbsencesCount) || 0;
      const current = Number(input.durationDaysOrSessions) || 1;
      const totalCapacity = Math.max(1, Number(input.totalLimitOrCapacity) || 15);
      const totalAbsences = past + current;
      const absenceRatio = totalAbsences / totalCapacity;

      if (absenceRatio > 0.20) {
        isPolicyViolated = true;
        const pct = (absenceRatio * 100).toFixed(1);
        policyReason = `Điều 1.2 & 1.3 Quy chế Đào tạo — Tổng số buổi nghỉ (${totalAbsences}/${totalCapacity} buổi, ${pct}%) vượt quá khung chuyên cần 20% (nguy cơ cấm thi).`;
        policyQuestion = `Sinh viên ${input.subjectName} đã nghỉ ${totalAbsences}/${totalCapacity} buổi (${pct}%), vượt mức cho phép: Có xét đặc biệt để không bị cấm thi không?`;
      } else if (input.leaveType === "Nghỉ việc riêng gia đình" && input.docStatus === "MISSING") {
        isPolicyViolated = true;
        policyReason = "Điều 1.1 Quy chế Đào tạo — Nghỉ việc riêng phải có đơn xác nhận của phụ huynh.";
        policyQuestion = `Đơn nghỉ việc riêng của sinh viên ${input.subjectName} chưa có xác nhận phụ huynh, ngoài quy định thông thường. Có chấp thuận ngoại lệ không?`;
      }
    }

    trace.push({
      checkName: "Kiểm tra Khung Chính sách & Định mức (Policy Compliance Check)",
      passed: !isPolicyViolated,
      observation: isPolicyViolated
        ? `Vượt khung chính sách: ${policyReason}`
        : "Đơn nghỉ hoàn toàn nằm trong định mức cho phép của chính sách.",
      ruleCited: input.domain === "enterprise" ? "Điều 10 & 15 Quy chế Nhân sự" : "Điều 1.2 Quy chế Đào tạo",
    });

    if (isPolicyViolated) {
      return this.buildEscalateResponse(
        decisionId,
        "Ngoài chính sách",
        policyReason,
        policyQuestion,
        trace,
        timestamp
      );
    }

    // ── BƯỚC 4: CA THƯỜNG QUY — TỰ ĐỘNG PHÊ DUYỆT (AUTO-APPROVE) ──────────────
    trace.push({
      checkName: "Tổng hợp Đánh giá (Synthesis & Final Determination)",
      passed: true,
      observation: "Đơn hợp lệ, đầy đủ minh chứng, trong thẩm quyền và định mức chuyên cần/ngày phép.",
      ruleCited: input.domain === "enterprise" ? "Điều 10.1 Quy chế Nhân sự" : "Điều 1 Quy chế Đào tạo",
    });

    const defaultPolicy =
      input.domain === "enterprise"
        ? "Điều 10.1 Quy chế Nhân sự — Đơn xin nghỉ phép hợp lệ, đủ điều kiện tự động phê duyệt."
        : "Điều 1.1 & 2.1 Quy chế Đào tạo — Đơn xin nghỉ học hợp lệ, minh chứng rõ ràng, trong hạn mức chuyên cần (<= 20%).";

    return {
      decisionId,
      outcome: "AUTO_APPROVE",
      policyBasis: defaultPolicy,
      reasoningTrace: trace,
      timestamp,
      confidenceScore: 1.0, // 100% tự tin khi thỏa mãn đầy đủ quy chế
    };
  }

  /**
   * NGUYÊN TẮC BẤT BIẾN SV2:
   * Khi ca bị gắn cờ bất định, KHÔNG BAO GIỜ xuất kết quả chắc chắn.
   * Quyết định luôn là ESCALATE, kèm câu hỏi 1 lượt.
   */
  private buildEscalateResponse(
    decisionId: string,
    category: UncertaintyCategory,
    policyBasis: string,
    escalationQuestion: string,
    trace: ReasoningStep[],
    timestamp: string
  ): AgentEvaluationOutput {
    return {
      decisionId,
      outcome: "ESCALATE",
      uncertaintyCategory: category,
      policyBasis,
      escalationQuestion,
      reasoningTrace: trace,
      timestamp,
      confidenceScore: 0.5, // Gắn cờ dừng, chuyển giao quyền quyết định cho con người
    };
  }

  /**
   * Chuyển đổi Agent Output thành Decision Log đầy đủ cho SV2/SV3
   */
  public toDecisionLog(
    input: AgentEvaluationInput,
    output: AgentEvaluationOutput
  ): DecisionLog {
    return {
      decisionId: output.decisionId,
      timestamp: output.timestamp,
      domain: input.domain,
      subjectInfo: `${input.subjectId} · ${input.subjectName}`,
      contextDetails: `${input.organizationUnit} · ${input.leaveType} · ${input.durationDaysOrSessions} ${input.domain === "enterprise" ? "ngày" : "buổi"}`,
      outcome: output.outcome,
      uncertaintyCategory: output.uncertaintyCategory,
      confidenceScore: output.confidenceScore,
      reasoningTrace: output.reasoningTrace,
      policyCitations: [output.policyBasis],
      escalationQuestion: output.escalationQuestion,
      isOverridden: false,
    };
  }
}

export const refereeAgent = new EscalationRefereeAgent();
