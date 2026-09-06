import type {
  AgentEvaluationInput,
  AgentEvaluationOutput,
  DecisionLog,
  ReasoningStep,
  UncertaintyCategory,
} from "./types";
import {
  generateEscalationQuestionWithLLM,
  DEFAULT_LLM_CONFIG,
  type LocalLlmConfig,
} from "./localLlmClient";

/**
 * SV2 — LÕI AGENT PHÂN XỬ HYBRID (RULES ENGINE + LOCAL LLM COGNITIVE REASONING)
 *
 * Các nguyên tắc vàng:
 * 1. Tự động duyệt ca thường quy.
 * 2. Phân loại độ bất định thành 3 loại dừng bắt buộc.
 * 3. Câu hỏi Escalate phải cụ thể, trả lời được trong 1 lượt.
 * 4. NGUYÊN TẮC BẤT BIẾN (INVARIANCE): Không bao giờ xuất kết quả chắc chắn trên ca đã gắn cờ.
 * 5. Bàn giao: Mã nguồn + Log quyết định (Reasoning Trace & Decision Log).
 * 6. Kiến trúc Hybrid: Rule Guardrails định lượng + Local LLM sinh câu hỏi ngữ cảnh sắc bén.
 */
export class EscalationRefereeAgent {
  public systemName: string = "AI Escalation Referee Agent (Hybrid SV2)";

  /**
   * Đánh giá kết hợp Rules Engine và Local LLM
   */
  public async evaluateAsync(
    input: AgentEvaluationInput,
    llmConfig?: Partial<LocalLlmConfig>
  ): Promise<AgentEvaluationOutput> {
    const startTime = Date.now();
    const cfg = { ...DEFAULT_LLM_CONFIG, ...llmConfig };

    // 1. Chạy qua Rules Guardrails trước để xác định độ bất định định lượng
    const baseOutput = this.evaluate(input);
    baseOutput.modelUsed = cfg.enabled ? cfg.model : "Deterministic Rules Engine";

    // 2. Nếu ca là ESCALATE và Local LLM được bật, gọi mô hình local để làm giàu câu hỏi
    if (baseOutput.outcome === "ESCALATE" && baseOutput.uncertaintyCategory && cfg.enabled) {
      try {
        const llmQuestion = await generateEscalationQuestionWithLLM({
          domain: input.domain,
          subjectName: input.subjectName,
          leaveType: input.leaveType,
          reason: input.reasonText,
          notes: input.notesText,
          uncertaintyCategory: baseOutput.uncertaintyCategory,
          ruleCitation: baseOutput.policyBasis,
          config: llmConfig,
        });

        if (llmQuestion && llmQuestion.length > 10) {
          baseOutput.escalationQuestion = llmQuestion;
          baseOutput.modelUsed = cfg.model;
          baseOutput.reasoningTrace.push({
            checkName: `Local LLM Reasoning (${cfg.model})`,
            passed: true,
            observation: `Mô hình AI cục bộ (${cfg.model}) đã phân tích ngữ cảnh và tối ưu câu hỏi Escalate 1 lượt.`,
            ruleCited: "Single-turn Actionability Standard (SV2)",
          });
        }
      } catch {
        // Fallback an toàn về câu hỏi Rule Engine
      }
    }

    // 3. Nguyên Lý Bất Biến (INVARIANCE PRINCIPLE - SV2):
    // Ca đã gắn cờ bất định thì TUYỆT ĐỐI KHÔNG xuất kết quả AUTO_APPROVE
    if (baseOutput.uncertaintyCategory && baseOutput.outcome !== "ESCALATE") {
      baseOutput.outcome = "ESCALATE";
    }

    baseOutput.latencyMs = Date.now() - startTime;
    return baseOutput;
  }

  /**
   * Đánh giá đồng bộ theo Deterministic Rules Guardrails
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
      // Doanh nghiệp: Nghỉ không lương > 5 ngày hoặc phép năm liên tục > 5 ngày vượt thẩm quyền Quản lý trực tiếp
      if (
        (input.leaveType === "Nghỉ không lương" && input.durationDaysOrSessions > 5) ||
        (input.leaveType === "Nghỉ phép năm" && input.durationDaysOrSessions > 5) ||
        input.durationDaysOrSessions >= 20 ||
        fullText.includes("vượt thẩm quyền")
      ) {
        isAuthorityExceeded = true;
        authorityReason = input.durationDaysOrSessions >= 20
          ? "Điều 18.3 Quy chế Nhân sự — Nghỉ dài hạn từ 20 ngày trở lên vượt thẩm quyền Quản lý trực tiếp, cần Giám đốc Khối / Tổng Giám Đốc phê duyệt."
          : input.leaveType === "Nghỉ phép năm"
          ? "Điều 10.3 Quy chế Nhân sự — Nghỉ phép năm liên tục > 5 ngày làm việc cần Trưởng phòng phê duyệt."
          : "Điều 18.1 Quy chế Nhân sự — Nghỉ không lương > 5 ngày vượt thẩm quyền Quản lý trực tiếp (tối đa 5 ngày làm việc).";
        authorityQuestion = `Đơn nghỉ ${input.durationDaysOrSessions} ngày vượt thẩm quyền Quản lý trực tiếp (tối đa 5 ngày). Chuyển cấp trên (Trưởng phòng / HRD) phê duyệt theo Quy chế?`;
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
      fullText.includes("mất ngày") ||
      fullText.includes("thiếu mộc") ||
      fullText.includes("c65-hd") ||
      fullText.includes("chưa nộp giấy") ||
      fullText.includes("chưa có mẫu") ||
      (input.leaveType === "Nghỉ ốm/chế độ" && (fullText.includes("chưa nộp") || fullText.includes("chưa có")));

    if (hasUnclearKeywords) {
      isFactUncertain = true;
      if (input.domain === "enterprise") {
        if (fullText.includes("c65-hd") || fullText.includes("mẫu c65") || (input.leaveType === "Nghỉ ốm/chế độ" && fullText.includes("chưa"))) {
          factReason = "Điều 14.3 Quy chế Nhân sự — Hồ sơ hưởng trợ cấp ốm đau BHXH";
          factQuestion = `Nghỉ ốm ${input.durationDaysOrSessions} ngày chưa có Giấy chứng nhận nghỉ việc hưởng BHXH mẫu C65-HD. Yêu cầu nộp bản gốc trong 3 ngày làm việc hay chuyển sang nghỉ không lương?`;
        } else if (fullText.includes("thiếu mộc") || fullText.includes("con dấu") || fullText.includes("chữ ký")) {
          factReason = "Điều 14.2 Quy chế Nhân sự — Yêu cầu chứng từ y tế có chữ ký và mộc đỏ hợp lệ";
          factQuestion = `Giấy nghỉ ốm thiếu chữ ký bác sĩ hoặc con dấu cơ sở y tế. Yêu cầu ${input.subjectName} bổ sung giấy hợp lệ trong 24h hay từ chối thanh toán chế độ?`;
        } else {
          factReason = "Điều 14.2 Quy chế Nhân sự — Yêu cầu chứng từ y tế rõ ràng mốc thời gian điều trị để thanh toán chế độ.";
          factQuestion = `Chứng từ y tế của ${input.subjectName} bị mờ, không đọc rõ mốc thời gian điều trị. Yêu cầu nhân viên bổ sung chứng từ rõ nét trong 24h?`;
        }
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
      // Doanh nghiệp: Nghỉ việc riêng không có minh chứng hoặc nhân viên thử việc xin nghỉ phép năm
      if (
        (input.leaveType === "Nghỉ việc riêng" && (input.docStatus === "MISSING" || fullText.includes("không có giấy tờ") || fullText.includes("không có minh chứng"))) ||
        fullText.includes("thử việc")
      ) {
        isPolicyViolated = true;
        policyReason = fullText.includes("thử việc")
          ? "Điều 8.2 Quy chế Nhân sự — Hợp đồng thử việc chưa phát sinh ngày phép năm hưởng lương theo quy định."
          : "Điều 15 Quy chế Nhân sự — Nghỉ việc riêng hưởng lương bắt buộc có minh chứng (kết hôn, tang chế).";
        policyQuestion = fullText.includes("thử việc")
          ? `Nhân viên ${input.subjectName} đang trong thời gian thử việc chưa có quỹ phép năm. Cho phép nghỉ việc không hưởng lương hay từ chối đơn?`
          : `Đơn nghỉ việc riêng của ${input.subjectName} chưa có giấy tờ minh chứng theo Điều 15. Cho phép bổ sung giấy tờ trong 24h hay chuyển sang nghỉ không lương?`;
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
