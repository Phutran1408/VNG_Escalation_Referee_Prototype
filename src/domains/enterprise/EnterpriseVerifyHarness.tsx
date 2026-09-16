import { useState } from "react";
import type { LeaveType, DocEvidenceStatus, TriggerCategory, TestCase } from "./mockTestCases";
import { getCaseLabel, CANONICAL_5_TEST_CASES, FULL_TEST_CASES } from "./mockTestCases";
import { compareEnterpriseCase, type FailReason } from "./verifyComparator";
import { refereeAgent } from "../../core/agent/EscalationRefereeAgent";
import type { LocalLlmConfig } from "../../core/agent/localLlmClient";
import type { AgentEvaluationInput, AgentEvaluationOutput } from "../../core/agent/types";

interface HarnessResultItem {
  caseId: string;
  summary: string;
  expected: "AUTO_APPROVE" | "ESCALATE";
  actual: "AUTO_APPROVE" | "ESCALATE";
  triggerCategory?: TriggerCategory;
  escalationQuestion?: string;
  timestamp: string;
  policyBasis: string;
  latencyMs?: number;
  modelUsed?: string;
  isJudgeCustom?: boolean;
  expectedTrigger?: TriggerCategory;
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
  employeeId: string;
  employeeName: string;
  department: string;
  leaveType: LeaveType;
  daysRequested: number;
  remainingLeaveBalance: number;
  fromDate: string;
  toDate: string;
  docEvidenceStatus: DocEvidenceStatus;
  isProbation: boolean;
  isSpecialLongTerm: boolean;
  reason: string;
  notes: string;
}

const EMPTY_JUDGE_FORM: JudgeFormState = {
  employeeId: "NV-2024-0312",
  employeeName: "Nguyễn Thị Hương",
  department: "Phòng Kinh doanh",
  leaveType: "Nghỉ phép năm",
  daysRequested: 1,
  remainingLeaveBalance: 4,
  fromDate: "2025-10-15",
  toDate: "2025-10-15",
  docEvidenceStatus: "VALID",
  isProbation: false,
  isSpecialLongTerm: false,
  reason: "Nghỉ phép năm giải quyết việc gia đình.",
  notes: "Đã bàn giao công việc đầy đủ, số dư phép năm còn 4 ngày hợp lệ.",
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
      employeeId: "NV-2024-0312",
      employeeName: "Nguyễn Thị Hương",
      department: "Phòng Kinh doanh",
      leaveType: "Nghỉ phép năm",
      daysRequested: 1,
      remainingLeaveBalance: 4,
      fromDate: "2025-10-15",
      toDate: "2025-10-15",
      docEvidenceStatus: "VALID",
      isProbation: false,
      isSpecialLongTerm: false,
      reason: "Nghỉ phép năm theo kế hoạch cá nhân.",
      notes: "Số dư phép năm còn 4 ngày hợp lệ, nộp đơn trước 3 ngày làm việc.",
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
      employeeId: "NV-2020-0019",
      employeeName: "Trương Minh Trí",
      department: "Phòng Kinh doanh",
      leaveType: "Nghỉ ốm/chế độ",
      daysRequested: 6,
      remainingLeaveBalance: 5,
      fromDate: "2025-11-01",
      toDate: "2025-11-07",
      docEvidenceStatus: "UNCLEAR_DATE",
      isProbation: false,
      isSpecialLongTerm: false,
      reason: "Nghỉ ốm phẫu thuật ruột thừa tại Bệnh viện Gia Định.",
      notes: "Mới nộp Giấy ra viện photocopy, chưa nộp Giấy chứng nhận nghỉ việc hưởng BHXH mẫu C65-HD.",
    },
  },
  {
    id: "P3",
    label: "Ca 3: Dừng Loại 2 — Ngoài chính sách (Thử việc)",
    badge: "Ngoài chính sách",
    badgeColor: "bg-rose-100 text-rose-900 border-rose-300",
    expected: "ESCALATE",
    expectedCategory: "Ngoài chính sách",
    data: {
      employeeId: "NV-2024-0891",
      employeeName: "Phạm Thị Thảo",
      department: "Phòng Marketing",
      leaveType: "Nghỉ phép năm",
      daysRequested: 2,
      remainingLeaveBalance: 0,
      fromDate: "2025-10-25",
      toDate: "2025-10-26",
      docEvidenceStatus: "VALID",
      isProbation: true,
      isSpecialLongTerm: false,
      reason: "Xin nghỉ phép năm đi du lịch.",
      notes: "Nhân viên đang trong thời gian thử việc tháng thứ 1, chưa phát sinh quỹ ngày phép năm theo Điều 8.",
    },
  },
  {
    id: "P4",
    label: "Ca 4: Dừng Loại 3 — Vượt thẩm quyền (20 ngày)",
    badge: "Vượt thẩm quyền",
    badgeColor: "bg-purple-100 text-purple-900 border-purple-300",
    expected: "ESCALATE",
    expectedCategory: "Vượt thẩm quyền",
    data: {
      employeeId: "NV-2021-0034",
      employeeName: "Hoàng Văn Bình",
      department: "Phòng Vận hành",
      leaveType: "Nghỉ không lương",
      daysRequested: 20,
      remainingLeaveBalance: 0,
      fromDate: "2025-11-10",
      toDate: "2025-12-05",
      docEvidenceStatus: "VALID",
      isProbation: false,
      isSpecialLongTerm: true,
      reason: "Xin nghỉ không lương dài hạn 20 ngày để chăm sóc người thân bệnh nặng.",
      notes: "Thời gian nghỉ 20 ngày liên tục vượt thẩm quyền Quản lý trực tiếp (cần Tổng Giám Đốc / HRD phê duyệt).",
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

export default function EnterpriseVerifyHarness({ domain = "enterprise", onResults, llmConfig }: Props) {
  const [mode, setMode] = useState<"5_cases" | "15_cases">("5_cases");
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

  async function handleEvaluateJudgeCase() {
    setJudgeLoading(true);
    setJudgeOutput(null);

    try {
      const agentInput: AgentEvaluationInput = {
        domain: "enterprise",
        subjectId: judgeForm.employeeId.trim() || `NV-JUDGE-${judgeCaseCounter}`,
        subjectName: judgeForm.employeeName.trim() || "Nhân Viên Thử Nghiệm",
        organizationUnit: judgeForm.department,
        leaveType: judgeForm.leaveType,
        fromDate: judgeForm.fromDate,
        toDate: judgeForm.toDate,
        durationDaysOrSessions: Number(judgeForm.daysRequested) || 1,
        docStatus: judgeForm.docEvidenceStatus === "POOR_QUALITY" ? "UNCLEAR_DATE" : judgeForm.docEvidenceStatus,
        isSpecialRequest: judgeForm.isSpecialLongTerm || judgeForm.daysRequested >= 20,
        reasonText: judgeForm.reason,
        notesText: `${judgeForm.notes} ${judgeForm.isProbation ? "Nhân viên đang trong thời gian thử việc." : ""}`,
      };

      const out = await refereeAgent.evaluateAsync(
        agentInput,
        engine === "live_llm" ? llmConfig : { enabled: false }
      );

      setJudgeOutput(out);

      const judgeResultItem: HarnessResultItem = {
        caseId: `JUDGE-${judgeCaseCounter}`,
        summary: `[Tự kiểm chứng] ${agentInput.subjectName} (${agentInput.organizationUnit}) — ${agentInput.leaveType} (${agentInput.durationDaysOrSessions} ngày)`,
        expected: out.outcome,
        actual: out.outcome,
        triggerCategory: out.uncertaintyCategory as TriggerCategory | undefined,
        escalationQuestion: out.escalationQuestion,
        timestamp: out.timestamp,
        policyBasis: out.policyBasis,
        latencyMs: out.latencyMs,
        modelUsed: out.modelUsed,
        isJudgeCustom: true,
        pass: null,
      };

      setResults((prev) => [judgeResultItem, ...prev]);
      setJudgeCaseCounter((c) => c + 1);
      if (onResults) onResults([judgeResultItem, ...results]);
    } finally {
      setJudgeLoading(false);
    }
  }

  async function runBatchVerification() {
    setRunning(true);
    setDone(false);
    setResults([]);
    const startTime = Date.now();

    const casesToRun: TestCase[] =
      mode === "5_cases" ? CANONICAL_5_TEST_CASES : FULL_TEST_CASES;

    const accumulatedResults: HarnessResultItem[] = [];

    for (let i = 0; i < casesToRun.length; i++) {
      setCurrentRunningIndex(i);
      const tc = casesToRun[i];

      const agentInput: AgentEvaluationInput = {
        domain: "enterprise",
        subjectId: tc.employeeId,
        subjectName: tc.employeeName,
        organizationUnit: tc.department,
        leaveType: tc.leaveType,
        fromDate: tc.fromDate,
        toDate: tc.toDate,
        durationDaysOrSessions: tc.daysRequested,
        docStatus: tc.docEvidenceStatus === "POOR_QUALITY" ? "UNCLEAR_DATE" : tc.docEvidenceStatus,
        isSpecialRequest: tc.isSpecialLongTerm || tc.daysRequested >= 20,
        reasonText: tc.reason,
        notesText: `${tc.notes} ${tc.isProbation ? "Nhân viên thử việc." : ""}`,
      };

      const agentOutput = await refereeAgent.evaluateAsync(
        agentInput,
        engine === "live_llm" ? llmConfig : { enabled: false }
      );

      const comp = compareEnterpriseCase(tc, agentOutput);

      const item: HarnessResultItem = {
        caseId: tc.id,
        summary: getCaseLabel(tc),
        expected: tc.expected,
        actual: agentOutput.outcome,
        triggerCategory: agentOutput.uncertaintyCategory as TriggerCategory | undefined,
        escalationQuestion: agentOutput.escalationQuestion,
        timestamp: agentOutput.timestamp,
        policyBasis: agentOutput.policyBasis,
        latencyMs: agentOutput.latencyMs,
        modelUsed: agentOutput.modelUsed,
        expectedTrigger: tc.expectedTrigger,
        pass: comp.pass,
        failReasons: comp.failReasons,
        failDetail: comp.detail,
        isJudgeCustom: false,
      };

      accumulatedResults.push(item);
      setResults([...accumulatedResults]);
      await new Promise((r) => setTimeout(r, 60));
    }

    setElapsed(Date.now() - startTime);
    setRunning(false);
    setCurrentRunningIndex(-1);
    setDone(true);
    if (onResults) onResults(accumulatedResults);
  }

  const standardResults = results.filter((r) => !r.isJudgeCustom);
  const totalStandard = standardResults.length;
  const passedStandard = standardResults.filter((r) => r.pass === true).length;
  const passRate = totalStandard > 0 ? ((passedStandard / totalStandard) * 100).toFixed(0) : "100";

  const autoApprovedCount = results.filter((r) => r.actual === "AUTO_APPROVE").length;
  const escalatedCount = results.filter((r) => r.actual === "ESCALATE").length;

  const filteredResults = results.filter((r) => {
    if (filter === "ALL") return true;
    if (filter === "APPROVE") return r.actual === "AUTO_APPROVE";
    if (filter === "ESCALATE") return r.actual === "ESCALATE";
    if (filter === "JUDGE") return r.isJudgeCustom === true;
    if (filter === "FAIL") return r.pass === false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 rounded-2xl p-6 text-white shadow-xl border border-blue-800/40">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-blue-600/40 text-blue-200 border border-blue-400/30 text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                🧪 Verify Harness · Ngữ cảnh Doanh Nghiệp (Enterprise HR)
              </span>
              <span className="text-xs text-slate-400">
                100% Deterministic Rules + Local LLM
              </span>
            </div>
            <h2 className="text-2xl font-bold font-display mt-2 tracking-tight">
              Kiểm Chứng Độc Lập &amp; Thẩm Định Đơn Nghỉ Phép Nhân Sự
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-3xl leading-relaxed">
              Môi trường kiểm chuẩn dành cho Giám khảo: Chạy hàng loạt ca kiểm thử đối soát quy chuẩn hoặc tự nhập ca tùy biến để đánh giá khả năng phân loại 3 nhóm bất định theo <strong>Quy chế Nhân sự &amp; Bộ luật Lao động</strong>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={runBatchVerification}
              disabled={running}
              className={`px-5 py-2.5 rounded-xl font-bold text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer ${
                running
                  ? "bg-slate-700 text-slate-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white hover:shadow-blue-500/25"
              }`}
            >
              <span>{running ? "⏳ Đang chạy kiểm thử..." : "🚀 Chạy Kiểm Chứng Hàng Loạt"}</span>
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-800 text-center">
          <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/50">
            <div className="text-xs text-slate-400">Tỷ Lệ Pass Chuẩn</div>
            <div className="text-xl font-bold text-emerald-400 mt-0.5">{passRate}%</div>
          </div>
          <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/50">
            <div className="text-xs text-slate-400">Tự Động Duyệt (Auto)</div>
            <div className="text-xl font-bold text-blue-400 mt-0.5">{autoApprovedCount} ca</div>
          </div>
          <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/50">
            <div className="text-xs text-slate-400">Phân Xử Chuyển Cấp (Escalate)</div>
            <div className="text-xl font-bold text-amber-400 mt-0.5">{escalatedCount} ca</div>
          </div>
          <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/50">
            <div className="text-xs text-slate-400">Độ Trễ Phản Hồi (Rules)</div>
            <div className="text-xl font-bold text-indigo-400 mt-0.5">&lt; 10 ms</div>
          </div>
        </div>
      </div>

      {/* Main Grid: Left interactive form & presets, Right verification output */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Form for Judges */}
        <div className="lg:col-span-5 space-y-4">
          <div className="card p-5 bg-white border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                  <span>⚙️</span>
                  <span>Tự Kiểm Chứng (Nhập ca tùy ý)</span>
                </h3>
                <p className="text-[11px] text-slate-500">Giám khảo có thể chọn ca mẫu hoặc tự điều chỉnh thông số</p>
              </div>
            </div>

            {/* Presets Grid */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">Ca thử nghiệm nhanh (Presets):</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {JUDGE_PRESETS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setJudgeForm(p.data)}
                    className="p-2 rounded-lg text-left text-xs border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 transition-colors cursor-pointer bg-slate-50"
                  >
                    <div className="font-bold text-slate-800 truncate">{p.label}</div>
                    <span className={`inline-block text-[10px] px-1.5 py-0.2 rounded border font-semibold mt-1 ${p.badgeColor}`}>
                      {p.badge}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Interactive Form Fields */}
            <div className="space-y-3 pt-2 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Mã nhân viên:</label>
                  <input
                    type="text"
                    value={judgeForm.employeeId}
                    onChange={(e) => setJudgeForm({ ...judgeForm, employeeId: e.target.value })}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 outline-hidden font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Họ tên nhân viên:</label>
                  <input
                    type="text"
                    value={judgeForm.employeeName}
                    onChange={(e) => setJudgeForm({ ...judgeForm, employeeName: e.target.value })}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Phòng ban:</label>
                  <input
                    type="text"
                    value={judgeForm.department}
                    onChange={(e) => setJudgeForm({ ...judgeForm, department: e.target.value })}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Loại nghỉ phép:</label>
                  <select
                    value={judgeForm.leaveType}
                    onChange={(e) => setJudgeForm({ ...judgeForm, leaveType: e.target.value as LeaveType })}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 outline-hidden bg-white"
                  >
                    <option value="Nghỉ phép năm">Nghỉ phép năm</option>
                    <option value="Nghỉ ốm/chế độ">Nghỉ ốm / Chế độ BHXH</option>
                    <option value="Nghỉ không lương">Nghỉ không lương</option>
                    <option value="Nghỉ việc riêng">Nghỉ việc riêng (Tang chế, Kết hôn)</option>
                    <option value="Nghỉ thai sản">Nghỉ thai sản</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Số ngày xin nghỉ:</label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={judgeForm.daysRequested}
                    onChange={(e) => setJudgeForm({ ...judgeForm, daysRequested: Number(e.target.value) || 1 })}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 outline-hidden font-bold text-blue-700"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Số dư phép năm còn:</label>
                  <input
                    type="number"
                    min="0"
                    max="30"
                    value={judgeForm.remainingLeaveBalance}
                    onChange={(e) => setJudgeForm({ ...judgeForm, remainingLeaveBalance: Number(e.target.value) || 0 })}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 outline-hidden font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tình trạng chứng từ / Bằng chứng y tế:</label>
                <select
                  value={judgeForm.docEvidenceStatus}
                  onChange={(e) => setJudgeForm({ ...judgeForm, docEvidenceStatus: e.target.value as DocEvidenceStatus })}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 outline-hidden bg-white font-semibold text-slate-800"
                >
                  <option value="VALID">✓ Rõ ràng, đầy đủ mộc đỏ &amp; chữ ký (VALID)</option>
                  <option value="UNCLEAR_DATE">⚠️ Mờ ngày / thiếu mộc / thiếu mẫu C65-HD (UNCLEAR_DATE)</option>
                  <option value="MISSING">❌ Không có chứng từ đính kèm (MISSING)</option>
                </select>
              </div>

              <div className="flex items-center gap-4 pt-1">
                <label className="inline-flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={judgeForm.isProbation}
                    onChange={(e) => setJudgeForm({ ...judgeForm, isProbation: e.target.checked })}
                    className="rounded text-blue-600"
                  />
                  <span className="text-slate-700 font-medium">Nhân viên đang thử việc</span>
                </label>

                <label className="inline-flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={judgeForm.isSpecialLongTerm}
                    onChange={(e) => setJudgeForm({ ...judgeForm, isSpecialLongTerm: e.target.checked })}
                    className="rounded text-blue-600"
                  />
                  <span className="text-slate-700 font-medium">Nghỉ dài hạn (&gt; 5 ngày)</span>
                </label>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Lý do nghỉ:</label>
                <input
                  type="text"
                  value={judgeForm.reason}
                  onChange={(e) => setJudgeForm({ ...judgeForm, reason: e.target.value })}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Ghi chú &amp; Minh chứng:</label>
                <input
                  type="text"
                  value={judgeForm.notes}
                  onChange={(e) => setJudgeForm({ ...judgeForm, notes: e.target.value })}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 outline-hidden"
                />
              </div>

              <button
                type="button"
                onClick={handleEvaluateJudgeCase}
                disabled={judgeLoading}
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs shadow-xs transition-colors cursor-pointer mt-2"
              >
                {judgeLoading ? "⏳ Đang đánh giá qua Agent..." : "⚡ Đánh Giá Ca Này Ngay"}
              </button>
            </div>
          </div>

          {/* Single Judge Result Callout */}
          {judgeOutput && (
            <div className="card p-4 bg-slate-900 text-white rounded-xl border border-slate-800 shadow-md space-y-3 animate-in fade-in duration-150">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-bold text-blue-300">Kết quả đánh giá trực tiếp:</span>
                <OutcomeBadge d={judgeOutput.outcome} />
              </div>
              <div className="text-xs space-y-1.5">
                <div>
                  <span className="text-slate-400">Nhóm bất định: </span>
                  <TriggerPill cat={judgeOutput.uncertaintyCategory} />
                </div>
                <div>
                  <span className="text-slate-400">Căn cứ quy chế: </span>
                  <span className="text-slate-200">{judgeOutput.policyBasis}</span>
                </div>
                {judgeOutput.escalationQuestion && (
                  <div className="p-2.5 bg-slate-800 rounded-lg border border-slate-700">
                    <span className="text-amber-300 font-bold block mb-1">❓ Câu hỏi Escalate 1 lượt:</span>
                    <p className="text-slate-200 italic leading-relaxed text-xs">
                      &ldquo;{judgeOutput.escalationQuestion}&rdquo;
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Verification Results & Benchmark Table */}
        <div className="lg:col-span-7 space-y-4">
          {/* Controls Bar */}
          <div className="card p-4 bg-white border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-700">Bộ test:</span>
              <div className="inline-flex bg-slate-100 p-0.5 rounded-lg border border-slate-300">
                <button
                  type="button"
                  onClick={() => setMode("5_cases")}
                  className={`px-2.5 py-1 rounded-md font-semibold cursor-pointer ${
                    mode === "5_cases" ? "bg-white text-blue-700 shadow-2xs" : "text-slate-600"
                  }`}
                >
                  5 Ca Tiêu Biểu
                </button>
                <button
                  type="button"
                  onClick={() => setMode("15_cases")}
                  className={`px-2.5 py-1 rounded-md font-semibold cursor-pointer ${
                    mode === "15_cases" ? "bg-white text-blue-700 shadow-2xs" : "text-slate-600"
                  }`}
                >
                  15 Ca Toàn Diện
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-700">Lọc kết quả:</span>
              <div className="inline-flex bg-slate-100 p-0.5 rounded-lg border border-slate-300">
                <button
                  type="button"
                  onClick={() => setFilter("ALL")}
                  className={`px-2 py-1 rounded font-semibold cursor-pointer ${
                    filter === "ALL" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-600"
                  }`}
                >
                  Tất cả ({results.length})
                </button>
                <button
                  type="button"
                  onClick={() => setFilter("APPROVE")}
                  className={`px-2 py-1 rounded font-semibold cursor-pointer ${
                    filter === "APPROVE" ? "bg-white text-emerald-700 shadow-2xs" : "text-slate-600"
                  }`}
                >
                  Auto ({autoApprovedCount})
                </button>
                <button
                  type="button"
                  onClick={() => setFilter("ESCALATE")}
                  className={`px-2 py-1 rounded font-semibold cursor-pointer ${
                    filter === "ESCALATE" ? "bg-white text-amber-700 shadow-2xs" : "text-slate-600"
                  }`}
                >
                  Escalate ({escalatedCount})
                </button>
              </div>
            </div>
          </div>

          {/* Results List */}
          {results.length === 0 ? (
            <div className="card p-12 bg-white border border-slate-200 text-center space-y-3">
              <div className="text-4xl">🏢</div>
              <h4 className="font-bold text-base text-slate-800">Sẵn sàng chạy kiểm chứng Enterprise HR</h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Nhấn <strong>&ldquo;Chạy Kiểm Chứng Hàng Loạt&rdquo;</strong> ở trên hoặc chọn các ca mẫu bên trái để kiểm tra trực tiếp khả năng tự động phê duyệt và phân loại dừng của hệ thống.
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
              {filteredResults.map((r, idx) => (
                <div
                  key={`${r.caseId}-${idx}`}
                  className={`card p-4 border rounded-xl transition-all ${
                    r.pass === false
                      ? "bg-rose-50/70 border-rose-300"
                      : r.actual === "AUTO_APPROVE"
                      ? "bg-emerald-50/50 border-emerald-200"
                      : "bg-white border-slate-200"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold bg-slate-100 text-slate-800 px-2 py-0.5 rounded border border-slate-300">
                          {r.caseId}
                        </span>
                        <OutcomeBadge d={r.actual} />
                        <TriggerPill cat={r.triggerCategory} />
                      </div>
                      <h4 className="font-bold text-xs text-slate-900 mt-1">{r.summary}</h4>
                    </div>

                    <div className="text-right">
                      {r.pass !== null && (
                        <span
                          className={`text-xs font-bold px-2 py-0.5 rounded ${
                            r.pass ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                          }`}
                        >
                          {r.pass ? "✓ PASS" : "✗ FAIL"}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mt-2 text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200 space-y-1">
                    <div>
                      <strong>Căn cứ:</strong> {r.policyBasis}
                    </div>
                    {r.escalationQuestion && (
                      <div className="text-amber-900 bg-amber-50/80 p-2 rounded border border-amber-200 mt-1">
                        <strong>Câu hỏi Escalate 1 lượt:</strong> &ldquo;{r.escalationQuestion}&rdquo;
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
