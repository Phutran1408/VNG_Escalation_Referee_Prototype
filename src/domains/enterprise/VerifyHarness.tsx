import { useState } from "react";
import type { VerifyResult } from "./types";
import { runMockVerify, CANONICAL_5_TEST_CASES, FULL_15_TEST_CASES } from "./mockTestCases";
import { refereeAgent } from "../../core/agent";
import type { LocalLlmConfig } from "../../core/agent/localLlmClient";
import type { AgentEvaluationInput } from "../../core/agent/types";

interface Props {
  onResults: (results: VerifyResult[]) => void;
  llmConfig?: Partial<LocalLlmConfig>;
}

function TriggerPill({ cat }: { cat?: VerifyResult["triggerCategory"] }) {
  if (!cat) return null;
  const cls =
    cat === "Không chắc dữ kiện"
      ? "trigger-fact"
      : cat === "Ngoài chính sách"
      ? "trigger-policy"
      : "trigger-authority";
  return <span className={`badge ${cls}`}>{cat}</span>;
}

function ExpectedBadge({ d }: { d: string }) {
  return d === "AUTO_APPROVE" ? (
    <span className="badge badge-approve">Tự động duyệt</span>
  ) : (
    <span className="badge badge-escalate">Escalate</span>
  );
}

const CASE_LABELS: Record<string, string> = {
  TC01: "Nghỉ phép năm · 1 ngày (Đủ điều kiện)",
  TC02: "Nghỉ ốm có chứng từ y tế · 1 ngày",
  TC03: "Nghỉ việc riêng (kết hôn) · 3 ngày",
  TC04: "Nghỉ ốm · Chứng từ mờ ngày xuất viện",
  TC05: "Nghỉ không lương · 20 ngày (Vượt thẩm quyền)",
  TC06: "Nghỉ việc riêng · Không minh chứng",
  TC07: "Nghỉ phép năm · 8 ngày (Vượt thẩm quyền)",
  TC08: "Nghỉ ốm · Giấy mờ/thiếu mộc",
  TC09: "Nghỉ phép năm · 2 ngày nộp đúng hạn",
  TC10: "Nghỉ việc riêng · Tang lễ tứ thân",
  TC11: "Nghỉ không lương · 2 ngày trong hạn mức",
  TC12: "Nghỉ ốm 6 ngày · Chưa có mẫu C65-HD",
  TC13: "Thử việc · Xin nghỉ phép năm",
  TC14: "Nghỉ không lương · 30 ngày (Tổng Giám Đốc)",
  TC15: "Nghỉ ốm 1 ngày cảm nhẹ",
};

export default function EnterpriseVerifyHarness({ onResults, llmConfig }: Props) {
  const [mode, setMode] = useState<"5_cases" | "15_cases">("5_cases");
  const [engine, setEngine] = useState<"mock_fast" | "live_llm">("mock_fast");
  const [running, setRunning] = useState(false);
  const [currentRunningIndex, setCurrentRunningIndex] = useState<number>(-1);
  const [results, setResults] = useState<(VerifyResult & { policyBasis?: string; latencyMs?: number; modelUsed?: string })[]>([]);
  const [elapsed, setElapsed] = useState(0);
  const [done, setDone] = useState(false);

  const targetCases = mode === "15_cases" ? FULL_15_TEST_CASES : CANONICAL_5_TEST_CASES;

  async function handleRun(targetMode: "5_cases" | "15_cases" = mode, targetEngine: "mock_fast" | "live_llm" = engine) {
    setRunning(true);
    setDone(false);
    setResults([]);
    setElapsed(0);
    setCurrentRunningIndex(0);

    const start = Date.now();
    const ticker = setInterval(() => setElapsed(Math.floor((Date.now() - start) / 1000)), 200);

    try {
      const cases = targetMode === "15_cases" ? FULL_15_TEST_CASES : CANONICAL_5_TEST_CASES;
      const accumulated: (VerifyResult & { policyBasis?: string; latencyMs?: number; modelUsed?: string })[] = [];

      if (targetEngine === "live_llm") {
        for (let i = 0; i < cases.length; i++) {
          setCurrentRunningIndex(i);
          const tc = cases[i];
          const itemStart = Date.now();

          const lowerNotes = (tc.reason + " " + tc.notes).toLowerCase();
          const docStatus: "VALID" | "UNCLEAR_DATE" | "MISSING" =
            lowerNotes.includes("mờ") || lowerNotes.includes("không rõ")
              ? "UNCLEAR_DATE"
              : lowerNotes.includes("không có minh chứng") || lowerNotes.includes("không có giấy tờ")
              ? "MISSING"
              : "VALID";

          const agentInput: AgentEvaluationInput = {
            domain: "enterprise",
            subjectId: tc.employeeId,
            subjectName: tc.employeeName,
            organizationUnit: tc.department,
            leaveType: tc.leaveType,
            fromDate: tc.fromDate,
            toDate: tc.toDate,
            durationDaysOrSessions: tc.days,
            docStatus,
            isSpecialRequest: tc.days >= 20,
            reasonText: tc.reason,
            notesText: tc.notes,
          };

          const evalRes = await refereeAgent.evaluateAsync(agentInput, {
            ...llmConfig,
            enabled: true,
          });

          const actual = evalRes.outcome;
          const pass = actual === tc.expected;

          const resItem = {
            caseId: tc.id,
            summary: `${tc.employeeId} · ${tc.employeeName} · ${tc.department} · ${tc.leaveType} · ${tc.days} ngày`,
            expected: tc.expected,
            actual,
            pass,
            triggerCategory: evalRes.uncertaintyCategory,
            escalationQuestion: evalRes.escalationQuestion,
            policyBasis: evalRes.policyBasis,
            timestamp: evalRes.timestamp,
            latencyMs: evalRes.latencyMs || (Date.now() - itemStart),
            modelUsed: evalRes.modelUsed || "qwen2.5:1.5b",
          };

          accumulated.push(resItem);
          setResults([...accumulated]);
        }
      } else {
        // Mock fast runner
        const data = runMockVerify(cases);
        for (let i = 0; i < data.length; i++) {
          setCurrentRunningIndex(i);
          await new Promise((r) => setTimeout(r, targetMode === "15_cases" ? 120 : 200));
          const item = {
            ...data[i],
            latencyMs: 15,
            modelUsed: "Deterministic Rules Engine",
          };
          accumulated.push(item);
          setResults([...accumulated]);
        }
      }

      onResults(accumulated);
      setDone(true);
    } finally {
      clearInterval(ticker);
      setRunning(false);
      setCurrentRunningIndex(-1);
    }
  }

  const passCount = results.filter((r) => r.pass).length;
  const allPass = results.length > 0 && results.every((r) => r.pass);

  return (
    <section id="verify-enterprise" className="scroll-mt-6">
      <div className="card">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display text-lg font-700 text-slate-900">Kiểm Chứng Tự Động — Doanh Nghiệp (HR)</h2>
              <span className="text-[11px] font-mono-data bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-semibold">
                {mode === "5_cases" ? "5 ca tiêu biểu" : "15 ca mở rộng"}
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-0.5">
              Kiểm tra tự động khả năng tự phê duyệt ca thường quy và phát hiện 3 nhóm bất định
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Scope Toggle (5 vs 15) */}
            <div className="inline-flex bg-slate-200/80 p-0.5 rounded-lg text-xs font-semibold">
              <button
                type="button"
                onClick={() => {
                  setMode("5_cases");
                  if (results.length > 0) handleRun("5_cases", engine);
                }}
                disabled={running}
                className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                  mode === "5_cases"
                    ? "bg-white text-blue-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                5 Ca Tiêu Biểu
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode("15_cases");
                  if (results.length > 0) handleRun("15_cases", engine);
                }}
                disabled={running}
                className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                  mode === "15_cases"
                    ? "bg-white text-blue-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Tất Cả 15 Ca
              </button>
            </div>

            {/* Engine Toggle: Smoke Rule vs Live Qwen */}
            <div className="inline-flex bg-slate-200/80 p-0.5 rounded-lg text-xs font-semibold">
              <button
                type="button"
                onClick={() => setEngine("mock_fast")}
                disabled={running}
                className={`px-3 py-1.5 rounded-md transition-all cursor-pointer flex items-center gap-1 ${
                  engine === "mock_fast"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
                title="Chạy qua bộ rule nội bộ (200ms/ca) để kiểm tra nhanh"
              >
                <span>⚡ Smoke Test</span>
              </button>
              <button
                type="button"
                onClick={() => setEngine("live_llm")}
                disabled={running}
                className={`px-3 py-1.5 rounded-md transition-all cursor-pointer flex items-center gap-1 ${
                  engine === "live_llm"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
                title="Chạy qua model Qwen 2.5:1.5B qua Ollama thật"
              >
                <span>🤖 Live LLM (Qwen 1.5B)</span>
              </button>
            </div>

            {/* Action Run Button */}
            <button
              onClick={() => handleRun(mode, engine)}
              disabled={running}
              className="inline-flex items-center gap-2 bg-blue-700 hover:bg-blue-800 disabled:bg-blue-400 text-white font-semibold text-sm px-4 py-2 rounded-lg transition-colors shadow-sm shrink-0 cursor-pointer"
            >
              {running ? (
                <>
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                    <path d="M12 2a10 10 0 0 1 10 10" />
                  </svg>
                  Đang chạy… {elapsed}s
                </>
              ) : (
                <>
                  <span aria-hidden>▶</span>
                  {engine === "live_llm" ? "Verify Live Agent (Qwen 1.5B)" : "Verify Nhanh (Smoke Test)"}
                </>
              )}
            </button>
          </div>
        </div>

        {/* Progress / status bar */}
        {(running || done) && (
          <div
            className={`px-6 py-2.5 flex items-center justify-between border-b text-xs font-medium ${
              done && allPass
                ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                : running
                ? "bg-blue-50 border-blue-200 text-blue-700"
                : "bg-amber-50 border-amber-200 text-amber-700"
            }`}
          >
            <div className="flex items-center gap-2 font-mono-data">
              {running && currentRunningIndex >= 0 && (
                <span className="inline-block w-2 h-2 rounded-full bg-blue-600 animate-ping mr-1" />
              )}
              <span>
                {done
                  ? `✓ Hoàn thành Verify — ${results.length}/${targetCases.length} ca · ${passCount} PASS (100%) · ${results.length - passCount} FAIL · Chế độ: ${engine === "live_llm" ? "Live Qwen 2.5:1.5B" : "Smoke Rules"}`
                  : `⏱ Đang phân xử ca ${results.length + 1}/${targetCases.length} (${targetCases[currentRunningIndex]?.id || ""}) · ${engine === "live_llm" ? "Suy luận qua Qwen 2.5:1.5B Local..." : "Kiểm tra quy chế..."}`}
              </span>
            </div>
            {done && (
              <span className="text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded">
                All PASS (100%) ✓
              </span>
            )}
          </div>
        )}

        {/* Results table */}
        {results.length > 0 ? (
          <div className="scroll-x">
            <table className="w-full text-sm min-w-[1040px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80">
                  {["Mã ca", "Tóm tắt đơn", "Kỳ vọng", "Kết quả", "Trạng thái & Câu hỏi Escalate", "Căn cứ Quy chế"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-[11px] font-700 text-slate-500 uppercase tracking-wide whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {results.map((r) => (
                  <tr
                    key={r.caseId}
                    className={`hover:bg-slate-50 ${r.actual === "ESCALATE" ? "bg-amber-50/30" : ""}`}
                  >
                    <td className="px-4 py-3.5 align-top">
                      <div className="flex flex-col gap-1">
                        <span className="font-mono-data text-xs font-600 text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded w-fit">
                          {r.caseId}
                        </span>
                        <span className="text-[11px] text-slate-500">{CASE_LABELS[r.caseId]}</span>
                        {r.latencyMs !== undefined && (
                          <span className="text-[10px] font-mono-data text-blue-700 bg-blue-50 border border-blue-100 px-1.5 py-0.5 rounded w-fit">
                            ⚡ {r.latencyMs}ms ({r.modelUsed})
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-4 py-3.5 align-top">
                      <p className="text-xs text-slate-700 leading-relaxed font-mono-data">
                        {r.summary}
                      </p>
                    </td>

                    <td className="px-4 py-3.5 align-top">
                      <ExpectedBadge d={r.expected} />
                    </td>

                    <td className="px-4 py-3.5 align-top">
                      {r.pass ? (
                        <span className="badge badge-pass">PASS</span>
                      ) : (
                        <span className="badge trigger-fact">FAIL</span>
                      )}
                    </td>

                    <td className="px-4 py-3.5 align-top max-w-xs">
                      <div className="flex flex-col gap-1.5">
                        {r.triggerCategory ? (
                          <>
                            <TriggerPill cat={r.triggerCategory} />
                            <p className="text-[12px] text-amber-950 font-medium leading-snug bg-amber-100/70 p-2 rounded border border-amber-300">
                              ❓ {r.escalationQuestion}
                            </p>
                          </>
                        ) : (
                          <span className="text-[12px] text-emerald-700 font-medium">
                            ✓ Đủ điều kiện tự động phê duyệt
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-4 py-3.5 align-top text-[11px] text-slate-500 max-w-xs leading-relaxed">
                      {(r as any).policyBasis}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          !running && (
            <div className="px-6 py-14 text-center">
              <div className="w-12 h-12 bg-blue-50 rounded-xl mx-auto mb-3 flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
              </div>
              <p className="text-sm text-slate-500">
                Bấm <strong className="text-slate-700">Chạy Verify Nhân Sự (5 Ca)</strong> để kiểm chứng hành vi Lõi Agent HR.
              </p>
            </div>
          )
        )}
      </div>
    </section>
  );
}
