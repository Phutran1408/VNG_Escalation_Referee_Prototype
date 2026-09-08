import { useState } from "react";
import type { VerifyResult, LeaveType, DocEvidenceStatus, TriggerCategory } from "./types";
import { getCaseLabel, CANONICAL_5_TEST_CASES, FULL_TEST_CASES } from "./mockTestCases";
import { compareCase, type FailReason } from "./verifyComparator";
import { refereeAgent } from "../../core/agent/EscalationRefereeAgent";
import type { LocalLlmConfig } from "../../core/agent/localLlmClient";
import type { AgentEvaluationInput, AgentEvaluationOutput } from "../../core/agent/types";

interface HarnessResultItem extends Omit<VerifyResult, "pass"> {
  policyBasis: string;
  latencyMs?: number;
  modelUsed?: string;
  isJudgeCustom?: boolean;
  /** Loại dừng KỲ VỌNG — undefined nghĩa là ca thường quy (không được gắn cờ). */
  expectedTrigger?: TriggerCategory;
  /**
   * null = ca giám khảo tự nhập, KHÔNG có kỳ vọng nên không chấm được.
   * Trước đây chỗ này hardcode `true` — đó là PASS giả.
   */
  pass: boolean | null;
  failReasons?: FailReason[];
  failDetail?: string;
}

interface Props {
  domain?: "academic" | "enterprise";
  onResults?: (results: HarnessResultItem[]) => void;
  llmConfig?: Partial<LocalLlmConfig>;
}

interface JudgeFormState {
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
  docEvidenceStatus: DocEvidenceStatus;
  isSemesterDeferral: boolean;
  reason: string;
  notes: string;
}

const EMPTY_JUDGE_FORM: JudgeFormState = {
  studentId: "SV-JUDGE-01",
  studentName: "Nguyễn Giám Khảo Test",
  faculty: "Khoa Công nghệ Thông tin",
  courseName: "Lập trình Web nâng cao",
  totalSessions: 15,
  pastAbsences: 0,
  sessionsRequested: 1,
  fromDate: "2025-10-10",
  toDate: "2025-10-10",
  leaveType: "Nghỉ ốm điều trị",
  docEvidenceStatus: "VALID",
  isSemesterDeferral: false,
  reason: "Sốt phát ban, có giấy khám bệnh Bệnh viện Quận 1.",
  notes: "Giấy khám bệnh rõ ràng ngày khám 10/10/2025, chữ ký bác sĩ đầy đủ.",
};

const JUDGE_PRESETS: {
  id: string;
  label: string;
  badge: string;
  badgeColor: string;
  expected: "AUTO_APPROVE" | "ESCALATE";
  expectedCategory?: string;
  data: JudgeFormState;
}[] = [
  {
    id: "P1",
    label: "Ca 1: Thường quy hợp lệ (Auto-Approve)",
    badge: "Thường quy",
    badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-300",
    expected: "AUTO_APPROVE",
    data: {
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
      docEvidenceStatus: "VALID",
      isSemesterDeferral: false,
      reason: "Sốt phát ban, có giấy khám bệnh Bệnh viện Quận 1.",
      notes: "Giấy khám bệnh rõ ràng ngày khám 10/10/2025, chữ ký bác sĩ đầy đủ.",
    },
  },
  {
    id: "P2",
    label: "Ca 2: Dừng Loại 1 — Không chắc dữ kiện",
    badge: "Không chắc dữ kiện",
    badgeColor: "bg-amber-100 text-amber-900 border-amber-300",
    expected: "ESCALATE",
    expectedCategory: "Không chắc dữ kiện",
    data: {
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
      docEvidenceStatus: "UNCLEAR_DATE",
      isSemesterDeferral: false,
      reason: "Nghỉ ốm khám ngoại trú.",
      notes: "Giấy khám bệnh không đọc được ngày: bản chụp bị mờ nhoè phần ngày điều trị.",
    },
  },
  {
    id: "P3",
    label: "Ca 3: Dừng Loại 2 — Ngoài chính sách (>20%)",
    badge: "Ngoài chính sách",
    badgeColor: "bg-rose-100 text-rose-900 border-rose-300",
    expected: "ESCALATE",
    expectedCategory: "Ngoài chính sách",
    data: {
      studentId: "SV-2023-5012",
      studentName: "Hoàng Minh Tuấn",
      faculty: "Khoa Điện tử - Viễn thông",
      courseName: "Kiến trúc Máy tính",
      totalSessions: 15,
      pastAbsences: 3,
      sessionsRequested: 1,
      fromDate: "2025-11-20",
      toDate: "2025-11-20",
      leaveType: "Nghỉ ốm điều trị",
      docEvidenceStatus: "VALID",
      isSemesterDeferral: false,
      reason: "Tái khám sau phẫu thuật chân.",
      notes: "Đã vắng 3 buổi trước đó. Xin vắng thêm 1 buổi, tổng vắng 4 buổi (>20% môn học).",
    },
  },
  {
    id: "P4",
    label: "Ca 4: Dừng Loại 3 — Vượt thẩm quyền (Bảo lưu)",
    badge: "Vượt thẩm quyền",
    badgeColor: "bg-purple-100 text-purple-900 border-purple-300",
    expected: "ESCALATE",
    expectedCategory: "Vượt thẩm quyền",
    data: {
      studentId: "SV-2022-6789",
      studentName: "Đặng Thu Hà",
      faculty: "Khoa Luật Quốc tế",
      courseName: "Toàn bộ học kỳ I (2025-2026)",
      totalSessions: 60,
      pastAbsences: 0,
      sessionsRequested: 60,
      fromDate: "2025-10-01",
      toDate: "2026-01-30",
      leaveType: "Xin bảo lưu học kỳ",
      docEvidenceStatus: "VALID",
      isSemesterDeferral: true,
      reason: "Gia đình khó khăn đột xuất, làm đơn xin bảo lưu kết quả học tập cả học kỳ.",
      notes: "Đơn xin bảo lưu cả học kỳ trọn vẹn. Thuộc thẩm quyền Trưởng khoa.",
    },
  },
];

function TriggerPill({ cat }: { cat?: string }) {
  if (!cat) return null;
  const cls =
    cat === "Không chắc dữ kiện"
      ? "bg-amber-100 text-amber-900 border-amber-300"
      : cat === "Ngoài chính sách"
      ? "bg-rose-100 text-rose-900 border-rose-300"
      : "bg-purple-100 text-purple-900 border-purple-300";
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded border ${cls}`}>
      <span>●</span>
      {cat}
    </span>
  );
}

function OutcomeBadge({ d }: { d: string }) {
  return d === "AUTO_APPROVE" ? (
    <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded text-xs font-semibold">
      ✓ Tự Động Duyệt
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded text-xs font-semibold">
      ⚠️ Escalate (Chuyển duyệt)
    </span>
  );
}

export default function VerifyHarness({ domain = "academic", onResults, llmConfig }: Props) {
  // Batch verification state
  const [mode, setMode] = useState<"5_cases" | "15_cases">("5_cases");
  /**
   * CẢ HAI chế độ đều gọi agent thật (refereeAgent.evaluateAsync).
   *  · "rules"    — tắt LLM: quyết định tất định, câu hỏi do rule engine sinh.
   *                 Đây là chế độ CHẤM ĐIỂM, vì regex câu hỏi mới tái lập được.
   *  · "live_llm" — bật Ollama để LLM viết lại câu hỏi (chỉ để trình diễn).
   *                 LLM KHÔNG đổi outcome/category (EscalationRefereeAgent.ts:43-69).
   * Chế độ "mock_fast" cũ đã bị gỡ: nó chạy engine song song, không phải agent.
   */
  const [engine, setEngine] = useState<"rules" | "live_llm">("rules");
  const [filter, setFilter] = useState<"ALL" | "ESCALATE" | "APPROVE" | "JUDGE" | "FAIL">("ALL");
  const [running, setRunning] = useState(false);
  const [, setCurrentRunningIndex] = useState<number>(-1);
  const [results, setResults] = useState<HarnessResultItem[]>([]);
  const [elapsed, setElapsed] = useState(0);
  const [done, setDone] = useState(false);

  // Judge interactive live evaluation state
  const [judgeForm, setJudgeForm] = useState<JudgeFormState>(EMPTY_JUDGE_FORM);
  const [judgeLoading, setJudgeLoading] = useState(false);
  const [judgeOutput, setJudgeOutput] = useState<AgentEvaluationOutput | null>(null);
  const [judgeCaseCounter, setJudgeCaseCounter] = useState(1);

  // Absence calculation
  const totalAbsences = (Number(judgeForm.pastAbsences) || 0) + (Number(judgeForm.sessionsRequested) || 1);
  const maxTotal = Math.max(1, Number(judgeForm.totalSessions) || 15);
  const absenceRatio = (totalAbsences / maxTotal) * 100;
  const isOver20Percent = absenceRatio > 20;

  // Handle single judge case execution (100% Dynamic, Real Agent Call)
  async function handleEvaluateJudgeCase() {
    setJudgeLoading(true);
    setJudgeOutput(null);

    try {
      const agentInput: AgentEvaluationInput = {
        domain,
        subjectId: judgeForm.studentId.trim() || `SV-JUDGE-${judgeCaseCounter}`,
        subjectName: judgeForm.studentName.trim() || "Thí sinh Giám khảo",
        organizationUnit: judgeForm.faculty,
        leaveType: judgeForm.leaveType,
        fromDate: judgeForm.fromDate,
        toDate: judgeForm.toDate,
        durationDaysOrSessions: Number(judgeForm.sessionsRequested) || 1,
        pastAbsencesCount: Number(judgeForm.pastAbsences) || 0,
        totalLimitOrCapacity: Number(judgeForm.totalSessions) || 15,
        docStatus: judgeForm.docEvidenceStatus,
        isSpecialRequest: judgeForm.isSemesterDeferral,
        reasonText: judgeForm.reason,
        notesText: judgeForm.notes,
      };

      const evalRes = await refereeAgent.evaluateAsync(agentInput, {
        ...llmConfig,
        enabled: engine === "live_llm",
      });

      setJudgeOutput(evalRes);
    } finally {
      setJudgeLoading(false);
    }
  }

  // Pin judge evaluated case into the verification results table
  function handlePinJudgeCase() {
    if (!judgeOutput) return;

    const customId = `JUDGE-TC${String(judgeCaseCounter).padStart(2, "0")}`;
    const newItem: HarnessResultItem = {
      caseId: customId,
      summary: `${judgeForm.studentId} · ${judgeForm.studentName} · ${judgeForm.faculty} · Nghỉ ${judgeForm.sessionsRequested} buổi (Tổng ${totalAbsences}/${maxTotal} = ${absenceRatio.toFixed(0)}%)`,
      // Ca giám khảo tự nhập KHÔNG có kỳ vọng đi kèm, nên không chấm pass/fail được.
      // pass = null → bảng hiện "—". Trước đây chỗ này hardcode true = PASS giả.
      expected: judgeOutput.outcome,
      actual: judgeOutput.outcome,
      pass: null,
      triggerCategory: judgeOutput.uncertaintyCategory,
      escalationQuestion: judgeOutput.escalationQuestion,
      policyBasis: judgeOutput.policyBasis,
      timestamp: judgeOutput.timestamp,
      latencyMs: judgeOutput.latencyMs,
      modelUsed: judgeOutput.modelUsed,
      isJudgeCustom: true,
    };

    setResults((prev) => [newItem, ...prev]);
    setJudgeCaseCounter((c) => c + 1);
  }

  // Run batch verification (5 canonical cases or 15 full cases)
  async function handleRunBatch(targetMode: "5_cases" | "15_cases" = mode, targetEngine: "rules" | "live_llm" = engine) {
    setRunning(true);
    setDone(false);
    setElapsed(0);
    setCurrentRunningIndex(0);

    // Keep existing judge custom cases at top
    const existingJudgeCases = results.filter((r) => r.isJudgeCustom);

    const start = Date.now();
    const ticker = setInterval(() => setElapsed(Math.floor((Date.now() - start) / 1000)), 200);

    try {
      const targetCases = targetMode === "15_cases" ? FULL_TEST_CASES : CANONICAL_5_TEST_CASES;
      const accumulated: HarnessResultItem[] = [...existingJudgeCases];

      // MỘT ĐƯỜNG DUY NHẤT: mọi ca đều đi qua agent thật.
      // Không có nhánh mock, không có bảng đáp án cài sẵn.
      for (let i = 0; i < targetCases.length; i++) {
        setCurrentRunningIndex(i);
        const tc = targetCases[i];
        const itemStart = Date.now();

        const agentInput: AgentEvaluationInput = {
          domain: "academic",
          subjectId: tc.studentId,
          subjectName: tc.studentName,
          organizationUnit: tc.faculty,
          leaveType: tc.leaveType,
          fromDate: tc.fromDate,
          toDate: tc.toDate,
          durationDaysOrSessions: tc.sessionsRequested,
          pastAbsencesCount: tc.pastAbsences,
          totalLimitOrCapacity: tc.totalSessions,
          docStatus: tc.docEvidenceStatus,
          isSpecialRequest: tc.isSemesterDeferral,
          reasonText: tc.reason,
          notesText: tc.notes,
        };

        const evalRes = await refereeAgent.evaluateAsync(agentInput, {
          ...llmConfig,
          enabled: targetEngine === "live_llm",
        });

        // COMPARATOR 3 VẾ: outcome AND category AND question-regex.
        // So chỉ outcome là chưa đủ — ca gắn SAI loại dừng vẫn ra ESCALATE
        // và sẽ hiện PASS giả (xem TC16).
        const verdict = compareCase(
          { expected: tc.expected, expectedTrigger: tc.expectedTrigger },
          evalRes
        );

        const resItem: HarnessResultItem = {
          caseId: tc.id,
          summary: `${tc.studentId} · ${tc.studentName} · ${tc.faculty} · ${tc.courseName} · Nghỉ ${tc.sessionsRequested} buổi (tổng ${tc.pastAbsences + tc.sessionsRequested}/${tc.totalSessions})`,
          expected: tc.expected,
          expectedTrigger: tc.expectedTrigger,
          actual: evalRes.outcome,
          pass: verdict.pass,
          failReasons: verdict.failReasons,
          failDetail: verdict.detail,
          triggerCategory: evalRes.uncertaintyCategory,
          escalationQuestion: evalRes.escalationQuestion,
          policyBasis: evalRes.policyBasis,
          timestamp: evalRes.timestamp,
          latencyMs: evalRes.latencyMs ?? (Date.now() - itemStart),
          modelUsed:
            targetEngine === "live_llm"
              ? evalRes.modelUsed ?? "Local LLM"
              : "Deterministic Rules Engine",
          isJudgeCustom: false,
        };

        accumulated.push(resItem);
        setResults([...accumulated]);
      }

      if (onResults) {
        onResults(accumulated);
      }
      setDone(true);
    } finally {
      clearInterval(ticker);
      setRunning(false);
      setCurrentRunningIndex(-1);
    }
  }

  // Export results to JSON
  function handleExportJSON() {
    const jsonStr = JSON.stringify(results, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `escalation_referee_verify_report_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // Filtered list
  const filteredResults = results.filter((r) => {
    if (filter === "ESCALATE") return r.actual === "ESCALATE";
    if (filter === "APPROVE") return r.actual === "AUTO_APPROVE";
    if (filter === "JUDGE") return r.isJudgeCustom;
    if (filter === "FAIL") return r.pass === false;
    return true;
  });

  // Chỉ ca chuẩn (có kỳ vọng) mới được tính điểm. Ca giám khảo pass === null.
  const scoredResults = results.filter((r) => r.pass !== null);
  const passCount = scoredResults.filter((r) => r.pass === true).length;
  const failCount = scoredResults.filter((r) => r.pass === false).length;
  const standardCasesInResults = results.filter((r) => !r.isJudgeCustom);
  const judgeCasesInResults = results.filter((r) => r.isJudgeCustom);
  const totalExpected = mode === "15_cases" ? FULL_TEST_CASES.length : CANONICAL_5_TEST_CASES.length;

  return (
    <div className="space-y-6">
      {/* SV4 Header Compliance Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-5 border border-slate-800 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="bg-amber-400 text-slate-950 font-mono-data font-bold text-xs px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                SV4 · Verify Harness
              </span>
              <span className="bg-indigo-900/80 text-indigo-200 border border-indigo-700 text-xs px-2.5 py-0.5 rounded-full font-mono-data">
                Hackathon MLAI 2026 · Track 1 Spec A
              </span>
              <span className="bg-emerald-900/80 text-emerald-200 border border-emerald-700 text-xs px-2.5 py-0.5 rounded-full font-mono-data">
                0% Over-escalation
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold mt-2 text-white tracking-tight">
              Hệ Thống Kiểm Chứng Tự Động &amp; Thẩm Định Ca Mới
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-3xl leading-relaxed">
              <strong className="text-white">Thử ngay trong 30 giây:</strong> bấm{" "}
              <strong className="text-white">▶ Chạy Kiểm Chứng</strong> để xem hệ tự duyệt 3 đơn hợp lệ
              và dừng 2 đơn có vấn đề — hoặc nhập ca của bạn ở khung{" "}
              <strong className="text-white">Ca Giám Khảo</strong> bên dưới (nhớ chọn ô{" "}
              <strong className="text-white">① Tình trạng minh chứng</strong>). Mọi kết quả do agent
              tính trực tiếp trên máy bạn — <strong className="text-white">không có đáp án cài sẵn</strong>.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2.5 text-center min-w-[100px]">
              <div className="text-[11px] text-slate-400 uppercase font-semibold">Đã Kiểm Thử</div>
              <div className="text-lg font-bold font-mono-data text-white">{results.length} Ca</div>
            </div>
            <div className="bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2.5 text-center min-w-[100px]">
              <div className="text-[11px] text-slate-400 uppercase font-semibold">Độ Chính Xác</div>
              <div
                className={`text-lg font-bold font-mono-data ${
                  failCount > 0 ? "text-rose-400" : "text-emerald-400"
                }`}
              >
                {/* Chưa chạy thì hiện "—", KHÔNG hiện 100% cho bảng rỗng. */}
                {scoredResults.length > 0
                  ? `${((passCount / scoredResults.length) * 100).toFixed(0)}%`
                  : "—"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 1: INTERACTIVE JUDGE PLAYGROUND (Sơ loại 1 ca, Chung kết 5 ca) */}
      <section className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 bg-slate-50/60">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 font-bold flex items-center justify-center text-sm shadow-xs">
                🎯
              </span>
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Khu Vực Giám Khảo Tự Nhập Ca Mới (Live Agent Evaluation)
                </h2>
                <p className="text-xs text-slate-500">
                  Gọi trực tiếp <code>refereeAgent.evaluateAsync(...)</code> — Tuyệt đối không hardcode kết quả
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-mono-data">
                Sơ loại: 1 ca
              </span>
              <span className="bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-mono-data">
                Chung kết: 5 ca
              </span>
            </div>
          </div>

          {/* Quick Presets for Judge Convenience */}
          <div className="mt-4 pt-3 border-t border-slate-200/70">
            <div className="text-xs font-semibold text-slate-600 mb-2 flex items-center gap-1.5">
              <span>⚡ Mẫu thử nhanh cho Giám khảo:</span>
              <span className="text-[11px] text-slate-400 font-normal">(bấm chọn hoặc tự chỉnh sửa các ô bên dưới)</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
              {JUDGE_PRESETS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    setJudgeForm({ ...p.data });
                    setJudgeOutput(null);
                  }}
                  className="p-2.5 rounded-xl border border-slate-200 hover:border-indigo-400 bg-white hover:bg-indigo-50/40 text-left transition-all cursor-pointer group shadow-2xs"
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="font-bold text-xs text-slate-800 group-hover:text-indigo-900">
                      {p.label.split(":")[0]}
                    </span>
                    <span className={`text-[10px] font-semibold px-1.5 py-0.2 rounded border ${p.badgeColor}`}>
                      {p.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-1 leading-snug">
                    {p.data.reason}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Judge Input Form */}
        <div className="p-5 sm:p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Mã sinh viên */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Mã Sinh Viên / NV
              </label>
              <input
                type="text"
                value={judgeForm.studentId}
                onChange={(e) => setJudgeForm({ ...judgeForm, studentId: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono-data bg-white text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                placeholder="VD: SV-2024-1001"
              />
            </div>

            {/* Họ và tên */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Họ và Tên
              </label>
              <input
                type="text"
                value={judgeForm.studentName}
                onChange={(e) => setJudgeForm({ ...judgeForm, studentName: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs bg-white text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                placeholder="VD: Nguyễn Văn An"
              />
            </div>

            {/* Khoa / Đơn vị */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Khoa / Viện Đào Tạo
              </label>
              <input
                type="text"
                value={judgeForm.faculty}
                onChange={(e) => setJudgeForm({ ...judgeForm, faculty: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs bg-white text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                placeholder="Khoa Công nghệ Thông tin"
              />
            </div>

            {/* Loại đơn xin nghỉ */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Loại Đơn Xin Nghỉ
              </label>
              <select
                value={judgeForm.leaveType}
                onChange={(e) => {
                  const val = e.target.value as LeaveType;
                  setJudgeForm({
                    ...judgeForm,
                    leaveType: val,
                    isSemesterDeferral: val === "Xin bảo lưu học kỳ",
                  });
                }}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs bg-white text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="Nghỉ ốm điều trị">Nghỉ ốm điều trị</option>
                <option value="Nghỉ việc riêng gia đình">Nghỉ việc riêng gia đình</option>
                <option value="Nghỉ tham gia hoạt động trường">Nghỉ tham gia hoạt động trường</option>
                <option value="Xin bảo lưu học kỳ">Xin bảo lưu học kỳ (Trưởng khoa duyệt)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Học phần môn học */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Học phần / Môn học
              </label>
              <input
                type="text"
                value={judgeForm.courseName}
                onChange={(e) => setJudgeForm({ ...judgeForm, courseName: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs bg-white text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                placeholder="Lập trình Web nâng cao"
              />
            </div>

            {/* Số buổi xin nghỉ */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Số Buổi Xin Nghỉ Lần Này
              </label>
              <input
                type="number"
                min="1"
                max="60"
                value={judgeForm.sessionsRequested}
                onChange={(e) => setJudgeForm({ ...judgeForm, sessionsRequested: Math.max(1, Number(e.target.value) || 1) })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono-data bg-white text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            {/* Số buổi đã vắng trước */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Số Buổi Đã Vắng Trước Đó
              </label>
              <input
                type="number"
                min="0"
                max="60"
                value={judgeForm.pastAbsences}
                onChange={(e) => setJudgeForm({ ...judgeForm, pastAbsences: Math.max(0, Number(e.target.value) || 0) })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono-data bg-white text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            {/* Tổng số buổi môn học */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Tổng Số Buổi Học Phần
              </label>
              <input
                type="number"
                min="5"
                max="120"
                value={judgeForm.totalSessions}
                onChange={(e) => setJudgeForm({ ...judgeForm, totalSessions: Math.max(1, Number(e.target.value) || 15) })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono-data bg-white text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Absence Ratio Indicator */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-700">Tỷ lệ vắng chuyên cần:</span>
              <span className={`font-mono-data font-bold px-2 py-0.5 rounded text-xs ${
                isOver20Percent ? "bg-rose-100 text-rose-800" : "bg-emerald-100 text-emerald-800"
              }`}>
                {totalAbsences}/{maxTotal} buổi ({absenceRatio.toFixed(1)}%)
              </span>
              {isOver20Percent && (
                <span className="text-rose-600 font-semibold text-[11px]">
                  ⚠️ Vượt ngưỡng 20% học phần (Thuộc Dừng Loại 2: Ngoài chính sách)
                </span>
              )}
            </div>

            <div className="flex items-center gap-3">
              <label className="inline-flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={judgeForm.isSemesterDeferral}
                  onChange={(e) => setJudgeForm({ ...judgeForm, isSemesterDeferral: e.target.checked })}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="font-semibold text-slate-700 text-xs">
                  Bảo lưu cả học kỳ (Dừng Loại 3: Vượt thẩm quyền)
                </span>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Tình trạng minh chứng */}
            <div>
              <label className="block text-[11px] font-bold text-indigo-800 uppercase mb-1">
                ① Tình Trạng Minh Chứng — chọn ở đây, đừng chỉ mô tả bằng lời
              </label>
              <select
                value={judgeForm.docEvidenceStatus}
                onChange={(e) => setJudgeForm({ ...judgeForm, docEvidenceStatus: e.target.value as DocEvidenceStatus })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs bg-white text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="VALID">VALID — Giấy tờ rõ ràng, đúng mốc thời gian</option>
                <option value="UNCLEAR_DATE">UNCLEAR_DATE — Mờ nhoè ngày tháng / mất góc</option>
                <option value="MISSING">MISSING — Không có giấy tờ kèm theo</option>
              </select>
              <p className="text-[10px] text-slate-500 mt-1 leading-snug">
                Agent đọc ô này làm căn cứ chính. Mô tả "mờ / thiếu / mất" chỉ bằng chữ trong ô Ghi
                Chú có thể không được nhận diện.
              </p>
            </div>

            {/* Lý do */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Lý Do Xin Nghỉ
              </label>
              <input
                type="text"
                value={judgeForm.reason}
                onChange={(e) => setJudgeForm({ ...judgeForm, reason: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs bg-white text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                placeholder="VD: Sốt xuất huyết nằm viện điều trị..."
              />
            </div>

            {/* Ghi chú minh chứng */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Ghi Chú Chứng Từ Kèm Theo
              </label>
              <input
                type="text"
                value={judgeForm.notes}
                onChange={(e) => setJudgeForm({ ...judgeForm, notes: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs bg-white text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                placeholder="VD: Giấy ra viện BV Chợ Rẫy, ký ngày 12/10 — (tình trạng mờ/thiếu chọn ở ô ① bên trên)"
              />
              {/*
                Cảnh báo TRUNG THỰC về giới hạn của agent: nó quét keyword trong reason/notes
                (EscalationRefereeAgent.ts:153-164) nên từ ngữ lạ sẽ không kích hoạt.
                Harness phơi giới hạn này ra thay vì giấu. KHÔNG sửa keyword agent (việc SV2).
              */}
              {judgeForm.docEvidenceStatus === "VALID" &&
                /mờ|nhoè|nhòe|thiếu|mất|không rõ|mo |illegible/i.test(
                  `${judgeForm.reason} ${judgeForm.notes}`
                ) && (
                  <p className="text-[10px] text-amber-900 bg-amber-50 border border-amber-300 rounded p-1.5 mt-1 leading-snug">
                    ⚠️ Ghi chú đang mô tả chứng từ có vấn đề, nhưng ô ① để{" "}
                    <strong>VALID</strong>. Agent xét theo ô ① — đổi sang{" "}
                    <strong>UNCLEAR_DATE</strong> hoặc <strong>MISSING</strong> nếu bạn muốn thử
                    tình huống đó.
                  </p>
                )}
            </div>
          </div>

          {/* Action Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                setJudgeForm({
                  ...EMPTY_JUDGE_FORM,
                  studentId: `SV-JUDGE-${String(judgeCaseCounter).padStart(2, "0")}`,
                  studentName: "",
                  reason: "",
                  notes: "",
                  pastAbsences: 0,
                  sessionsRequested: 1,
                });
                setJudgeOutput(null);
              }}
              className="text-xs text-slate-500 hover:text-slate-800 underline cursor-pointer"
            >
              Đặt lại / Xóa trắng form
            </button>

            <button
              type="button"
              onClick={handleEvaluateJudgeCase}
              disabled={judgeLoading}
              className="inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-500 disabled:bg-amber-200 text-slate-950 font-bold text-sm px-6 py-2.5 rounded-xl transition-all shadow-sm cursor-pointer"
            >
              {judgeLoading ? (
                <>
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                    <path d="M12 2a10 10 0 0 1 10 10" />
                  </svg>
                  Đang phân xử trực tiếp...
                </>
              ) : (
                <>
                  <span>⚡</span>
                  <span>Phân Xử Bằng Agent Thật (Evaluate Live)</span>
                </>
              )}
            </button>
          </div>

          {/* Live Result Display Box */}
          {judgeOutput && (
            <div className={`mt-4 rounded-xl border p-4 sm:p-5 transition-all ${
              judgeOutput.outcome === "AUTO_APPROVE"
                ? "bg-emerald-50/70 border-emerald-300"
                : "bg-amber-50/80 border-amber-300"
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/80">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-slate-500 uppercase">Kết Quả Phân Xử:</span>
                  <OutcomeBadge d={judgeOutput.outcome} />
                  {judgeOutput.uncertaintyCategory && (
                    <TriggerPill cat={judgeOutput.uncertaintyCategory} />
                  )}
                  <span className="text-[11px] font-mono-data bg-white/80 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                    Độ tin cậy: {(judgeOutput.confidenceScore * 100).toFixed(0)}%
                  </span>
                  <span className="text-[11px] font-mono-data bg-white/80 text-indigo-700 px-2 py-0.5 rounded border border-indigo-200">
                    ⚡ {judgeOutput.latencyMs}ms ({judgeOutput.modelUsed})
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handlePinJudgeCase}
                  className="inline-flex items-center gap-1.5 bg-indigo-700 hover:bg-indigo-800 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors cursor-pointer shadow-2xs self-start sm:self-auto"
                >
                  <span>📌</span>
                  <span>Ghim ca này vào Bảng Kiểm Chứng</span>
                </button>
              </div>

              <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* Căn cứ pháp lý */}
                <div className="bg-white/90 p-3 rounded-lg border border-slate-200">
                  <div className="font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <span>📖 Căn cứ Quy chế Đào tạo:</span>
                  </div>
                  <p className="text-slate-700 leading-relaxed">
                    {judgeOutput.policyBasis}
                  </p>
                </div>

                {/* Câu hỏi escalate 1 lượt (nếu có) */}
                <div className="bg-white/90 p-3 rounded-lg border border-slate-200">
                  <div className="font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <span>❓ Câu hỏi leo thang (Single-turn Question):</span>
                  </div>
                  {judgeOutput.escalationQuestion ? (
                    <p className="text-amber-950 font-semibold leading-relaxed bg-amber-100/60 p-2 rounded border border-amber-200">
                      {judgeOutput.escalationQuestion}
                    </p>
                  ) : (
                    <p className="text-emerald-700 font-medium">
                      ✓ Đạt đầy đủ tiêu chuẩn tự động duyệt, không phát sinh câu hỏi leo thang.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* SECTION 2: BATCH VERIFICATION & RESULTS TABLE */}
      <section className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Table Toolbar */}
        <div className="p-5 border-b border-slate-200 bg-slate-50/70 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900">
                Bảng Kiểm Chứng Tự Động &amp; Báo Cáo Chấm Thi
              </h2>
              <span className="text-[11px] font-mono-data bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded font-semibold">
                {mode === "5_cases" ? `${CANONICAL_5_TEST_CASES.length} Ca Tiêu Biểu` : `${FULL_TEST_CASES.length} Ca Toàn Diện`}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Kiểm tra tỷ lệ phê duyệt đúng 100%, tách biệt 3 nhóm dừng bất định và 0% over-escalation
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Mode Toggle */}
            <div className="inline-flex bg-slate-200/80 p-0.5 rounded-lg text-xs font-semibold">
              <button
                type="button"
                onClick={() => {
                  setMode("5_cases");
                  if (results.length > 0) handleRunBatch("5_cases", engine);
                }}
                disabled={running}
                className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                  mode === "5_cases"
                    ? "bg-white text-indigo-900 shadow-xs font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                5 Ca Tiêu Biểu
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode("15_cases");
                  if (results.length > 0) handleRunBatch("15_cases", engine);
                }}
                disabled={running}
                className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                  mode === "15_cases"
                    ? "bg-white text-indigo-900 shadow-xs font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Tất Cả {FULL_TEST_CASES.length} Ca
              </button>
            </div>

            {/* Engine Toggle */}
            <div className="inline-flex bg-slate-200/80 p-0.5 rounded-lg text-xs font-semibold">
              <button
                type="button"
                onClick={() => setEngine("rules")}
                disabled={running}
                className={`px-3 py-1.5 rounded-md transition-all cursor-pointer flex items-center gap-1 ${
                  engine === "rules"
                    ? "bg-white text-slate-900 shadow-xs font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
                title="Agent thật, tắt LLM: quyết định tất định, tái lập được. Đây là chế độ chấm điểm."
              >
                <span>⚡ Agent (tất định)</span>
              </button>
              <button
                type="button"
                onClick={() => setEngine("live_llm")}
                disabled={running}
                className={`px-3 py-1.5 rounded-md transition-all cursor-pointer flex items-center gap-1 ${
                  engine === "live_llm"
                    ? "bg-indigo-600 text-white shadow-xs font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
                title="Chạy mô hình AI cục bộ qua Ollama"
              >
                <span>🤖 Live LLM (Async)</span>
              </button>
            </div>

            {/* Run Batch Button */}
            <button
              type="button"
              onClick={() => handleRunBatch(mode, engine)}
              disabled={running}
              className="inline-flex items-center gap-2 bg-indigo-700 hover:bg-indigo-800 disabled:bg-indigo-400 text-white font-bold text-xs px-4 py-2 rounded-lg transition-colors cursor-pointer shadow-xs"
            >
              {running ? (
                <>
                  <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                    <path d="M12 2a10 10 0 0 1 10 10" />
                  </svg>
                  Đang chạy ({results.length}/{totalExpected}) {elapsed}s
                </>
              ) : (
                <>
                  <span>▶</span>
                  <span>Chạy Kiểm Chứng Hàng Loạt</span>
                </>
              )}
            </button>

            {/* Export JSON Button */}
            {results.length > 0 && (
              <button
                type="button"
                onClick={handleExportJSON}
                className="inline-flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 text-xs font-semibold px-3 py-2 rounded-lg transition-colors cursor-pointer"
                title="Tải báo cáo JSON kết quả kiểm chứng"
              >
                <span>📥</span>
                <span>Xuất JSON</span>
              </button>
            )}
          </div>
        </div>

        {/* Status Strip & Filter Tabs */}
        {(running || done || results.length > 0) && (
          <div className="px-5 py-2.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3 font-mono-data">
              <span className="font-semibold text-slate-700">
                {done
                  ? `${failCount > 0 ? "⚠" : "✓"} Hoàn thành — ${scoredResults.length} ca chấm điểm · ${passCount} PASS · ${failCount} FAIL`
                  : running
                  ? `⏱ Đang phân xử... ${results.length}/${totalExpected} ca · ${elapsed}s`
                  : `Đang có ${results.length} ca trong bảng`}
              </span>
              <span
                className={`px-2 py-0.5 rounded font-bold ${
                  failCount > 0
                    ? "bg-rose-100 text-rose-800"
                    : "bg-emerald-100 text-emerald-800"
                }`}
              >
                Tỷ lệ đạt:{" "}
                {scoredResults.length > 0
                  ? `${passCount}/${scoredResults.length} (${((passCount / scoredResults.length) * 100).toFixed(0)}%)`
                  : "—"}
              </span>
              {judgeCasesInResults.length > 0 && (
                <span className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded font-bold">
                  {judgeCasesInResults.length} ca Giám khảo
                </span>
              )}
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1">
              <span className="text-[11px] text-slate-500 mr-1">Lọc:</span>
              {(["ALL", "APPROVE", "ESCALATE", "JUDGE", "FAIL"] as const).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFilter(f)}
                  className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
                    filter === f
                      ? "bg-slate-800 text-white font-bold"
                      : "bg-slate-200/80 text-slate-700 hover:bg-slate-300"
                  }`}
                >
                  {f === "ALL"
                    ? `Tất cả (${results.length})`
                    : f === "APPROVE"
                    ? `Duyệt (${results.filter((x) => x.actual === "AUTO_APPROVE").length})`
                    : f === "ESCALATE"
                    ? `Escalate (${results.filter((x) => x.actual === "ESCALATE").length})`
                    : f === "JUDGE"
                    ? `Ca Giám khảo (${judgeCasesInResults.length})`
                    : `Chỉ FAIL (${failCount})`}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Results Table */}
        {filteredResults.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[1000px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                  <th className="px-4 py-3">Mã Ca &amp; Nguồn</th>
                  <th className="px-4 py-3">Tóm Tắt Đối Tượng &amp; Lý Do</th>
                  <th className="px-4 py-3">Kỳ Vọng<br/><span className="font-normal normal-case text-[10px] text-slate-400">outcome + loại dừng</span></th>
                  <th className="px-4 py-3">Thực Tế + Phán Quyết 3 Vế</th>
                  <th className="px-4 py-3">Nhóm Dừng &amp; Câu Hỏi Escalate</th>
                  <th className="px-4 py-3">Căn Cứ Quy Chế</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredResults.map((r) => (
                  <tr
                    key={r.caseId}
                    className={`hover:bg-slate-50 transition-colors ${
                      r.isJudgeCustom
                        ? "bg-purple-50/40"
                        : r.actual === "ESCALATE"
                        ? "bg-amber-50/20"
                        : ""
                    }`}
                  >
                    {/* Mã ca */}
                    <td className="px-4 py-3.5 align-top">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className={`font-mono-data font-bold px-2 py-0.5 rounded border text-[11px] ${
                            r.isJudgeCustom
                              ? "bg-purple-100 text-purple-900 border-purple-300"
                              : "bg-indigo-50 text-indigo-800 border-indigo-200"
                          }`}>
                            {r.caseId}
                          </span>
                          {r.isJudgeCustom && (
                            <span className="text-[10px] bg-purple-600 text-white font-bold px-1.5 py-0.2 rounded">
                              GIÁM KHẢO
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-500 max-w-[160px] leading-tight">
                          {r.isJudgeCustom ? "Ca nhập trực tiếp" : getCaseLabel(r.caseId)}
                        </span>
                        {r.latencyMs !== undefined && (
                          <span className="text-[10px] font-mono-data text-slate-500">
                            ⚡ {r.latencyMs}ms · {r.modelUsed}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Tóm tắt */}
                    <td className="px-4 py-3.5 align-top max-w-xs">
                      <p className="text-xs text-slate-800 leading-relaxed font-mono-data">
                        {r.summary}
                      </p>
                    </td>

                    {/* Kỳ vọng: outcome + loại dừng */}
                    <td className="px-4 py-3.5 align-top">
                      <div className="flex flex-col gap-1">
                        {r.isJudgeCustom ? (
                          <span className="text-[11px] text-slate-500 italic">
                            (ca giám khảo — không có kỳ vọng)
                          </span>
                        ) : (
                          <>
                            <OutcomeBadge d={r.expected} />
                            <span className="text-[10px] font-mono-data text-slate-600">
                              {r.expectedTrigger ?? "(không gắn cờ)"}
                            </span>
                          </>
                        )}
                      </div>
                    </td>

                    {/* Thực tế: outcome + loại dừng + phán quyết 3 vế */}
                    <td className="px-4 py-3.5 align-top">
                      <div className="flex flex-col gap-1">
                        <OutcomeBadge d={r.actual} />
                        <span
                          className={`text-[10px] font-mono-data ${
                            r.failReasons?.includes("CATEGORY")
                              ? "text-rose-700 font-bold bg-rose-100 border border-rose-300 px-1 rounded"
                              : "text-slate-600"
                          }`}
                        >
                          {r.triggerCategory ?? "(không gắn cờ)"}
                        </span>

                        {r.pass === null ? (
                          <span
                            className="text-[10px] font-bold text-slate-600 bg-slate-100 border border-slate-300 px-1.5 py-0.2 rounded w-fit"
                            title="Ca giám khảo tự nhập: không kèm kỳ vọng nên không chấm pass/fail."
                          >
                            — chưa chấm
                          </span>
                        ) : r.pass ? (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 border border-emerald-300 px-1.5 py-0.2 rounded w-fit">
                            PASS ✓
                          </span>
                        ) : (
                          <>
                            <span className="text-[10px] font-bold text-rose-700 bg-rose-100 border border-rose-300 px-1.5 py-0.2 rounded w-fit">
                              FAIL ✗ — {r.failReasons?.join(" + ")}
                            </span>
                            {r.failDetail && (
                              <span className="text-[10px] text-rose-800 leading-snug bg-rose-50 border border-rose-200 rounded p-1.5">
                                {r.failDetail}
                              </span>
                            )}
                          </>
                        )}
                      </div>
                    </td>

                    {/* Nhóm dừng & câu hỏi */}
                    <td className="px-4 py-3.5 align-top max-w-sm">
                      <div className="flex flex-col gap-1.5">
                        {r.triggerCategory ? (
                          <>
                            <TriggerPill cat={r.triggerCategory} />
                            <div className="text-[11px] text-amber-950 font-medium leading-snug bg-amber-100/70 p-2 rounded border border-amber-300">
                              ❓ {r.escalationQuestion}
                            </div>
                          </>
                        ) : (
                          <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                            ✓ Đủ điều kiện tự động duyệt
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Căn cứ Quy chế */}
                    <td className="px-4 py-3.5 align-top text-[11px] text-slate-600 max-w-xs leading-relaxed">
                      {r.policyBasis}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          !running && (
            <div className="p-12 text-center">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3 text-lg font-bold">
                🧪
              </div>
              <h3 className="text-sm font-bold text-slate-800">Chưa có kết quả kiểm thử</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                Bấm nút <strong>&quot;Chạy Kiểm Chứng Hàng Loạt&quot;</strong> bên trên để chạy bộ 5 ca tiêu biểu hoặc tự nhập ca mới tại khu vực Giám khảo.
              </p>
            </div>
          )
        )}
      </section>
    </div>
  );
}
