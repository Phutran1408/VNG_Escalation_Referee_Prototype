import { useState } from "react";
import type { VerifyResult } from "./types";
import { getCaseLabel, runMockVerify, CANONICAL_5_TEST_CASES, FULL_15_TEST_CASES } from "./mockTestCases";

interface Props {
  onResults: (results: VerifyResult[]) => void;
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

export default function VerifyHarness({ onResults }: Props) {
  const [mode, setMode] = useState<"5_cases" | "15_cases">("5_cases");
  const [filter, setFilter] = useState<"ALL" | "ESCALATE" | "APPROVE">("ALL");
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState<(VerifyResult & { policyBasis?: string })[]>([]);
  const [elapsed, setElapsed] = useState(0);
  const [done, setDone] = useState(false);

  const totalExpected = mode === "15_cases" ? 15 : 5;

  async function handleRun(targetMode: "5_cases" | "15_cases" = mode) {
    setRunning(true);
    setDone(false);
    setResults([]);
    setElapsed(0);

    const start = Date.now();
    const ticker = setInterval(() => setElapsed(Math.floor((Date.now() - start) / 1000)), 300);

    try {
      const targetCases = targetMode === "15_cases" ? FULL_15_TEST_CASES : CANONICAL_5_TEST_CASES;
      const data = runMockVerify(targetCases);
      for (let i = 0; i < data.length; i++) {
        await new Promise((r) => setTimeout(r, targetMode === "15_cases" ? 120 : 250));
        setResults((prev) => [...prev, data[i]]);
      }
      onResults(data);
      setDone(true);
    } finally {
      clearInterval(ticker);
      setRunning(false);
    }
  }

  const passCount = results.filter((r) => r.pass).length;
  const allPass = results.length > 0 && results.every((r) => r.pass);

  const filteredResults = results.filter((r) => {
    if (filter === "ESCALATE") return r.actual === "ESCALATE";
    if (filter === "APPROVE") return r.actual === "AUTO_APPROVE";
    return true;
  });

  return (
    <section id="verify" className="scroll-mt-6">
      <div className="card">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="font-display text-lg font-700 text-slate-900">Verify Test Harness (SV4 & SV1)</h2>
              <span className="text-[11px] font-mono-data bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded font-semibold">
                {mode === "5_cases" ? "5 Ca Chuẩn (SV4)" : "15 Ca Toàn Diện (SV1)"}
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-0.5">
              Kiểm chứng tự động Lõi Agent SV2: Tự duyệt ca thường quy & Phân loại chính xác 3 loại dừng bất định
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Mode toggle */}
            <div className="inline-flex bg-slate-200/80 p-0.5 rounded-lg text-xs font-semibold">
              <button
                type="button"
                onClick={() => {
                  setMode("5_cases");
                  if (results.length > 0) handleRun("5_cases");
                }}
                disabled={running}
                className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                  mode === "5_cases"
                    ? "bg-white text-indigo-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                5 Ca Chuẩn
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode("15_cases");
                  if (results.length > 0) handleRun("15_cases");
                }}
                disabled={running}
                className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                  mode === "15_cases"
                    ? "bg-white text-indigo-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                15 Ca Toàn Diện
              </button>
            </div>

            {/* Run Button */}
            <button
              onClick={() => handleRun(mode)}
              disabled={running}
              className="inline-flex items-center gap-2 bg-indigo-700 hover:bg-indigo-800 disabled:bg-indigo-400 text-white font-semibold text-sm px-5 py-2.5 rounded-lg transition-colors shadow-sm shrink-0 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 cursor-pointer"
            >
              {running ? (
                <>
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                    <path d="M12 2a10 10 0 0 1 10 10" />
                  </svg>
                  Đang chạy ({results.length}/{totalExpected}) {elapsed}s
                </>
              ) : (
                <>
                  <span aria-hidden>▶</span>
                  Chạy Verify {mode === "5_cases" ? "(5 Ca)" : "(15 Ca)"}
                </>
              )}
            </button>
          </div>
        </div>

        {/* Progress / status bar */}
        {(running || done) && (
          <div
            className={`px-6 py-2.5 flex flex-wrap items-center justify-between gap-2 border-b text-xs font-medium ${
              done && allPass
                ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                : running
                ? "bg-indigo-50 border-indigo-200 text-indigo-700"
                : "bg-amber-50 border-amber-200 text-amber-700"
            }`}
          >
            <div className="flex items-center gap-3 font-mono-data">
              <span>
                {done
                  ? `✓ Hoàn thành — ${results.length}/${totalExpected} ca · ${passCount} PASS · ${results.length - passCount} FAIL`
                  : `⏱ Đang phân xử tuần tự — ${results.length}/${totalExpected} ca · ${elapsed}s`}
              </span>
              {done && (
                <span className="text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded">
                  Độ chính xác: {((passCount / results.length) * 100).toFixed(0)}%
                </span>
              )}
            </div>

            {/* Quick Filters */}
            {results.length > 0 && (
              <div className="flex items-center gap-1">
                <span className="text-[11px] text-slate-500 mr-1">Lọc:</span>
                {(["ALL", "APPROVE", "ESCALATE"] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
                      filter === f
                        ? "bg-slate-800 text-white"
                        : "bg-slate-200 text-slate-700 hover:bg-slate-300"
                    }`}
                  >
                    {f === "ALL"
                      ? `Tất cả (${results.length})`
                      : f === "APPROVE"
                      ? `Duyệt (${results.filter((x) => x.actual === "AUTO_APPROVE").length})`
                      : `Escalate (${results.filter((x) => x.actual === "ESCALATE").length})`}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Progress strip */}
        {(running || done) && (
          <div className="h-0.5 bg-slate-100">
            <div
              className={`h-full transition-all duration-500 ${done ? "bg-emerald-500" : "bg-indigo-500"}`}
              style={{ width: `${(results.length / totalExpected) * 100}%` }}
            />
          </div>
        )}

        {/* Results table */}
        {results.length > 0 ? (
          <div className="scroll-x">
            <table className="w-full text-sm min-w-[1060px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80">
                  {["Mã ca & Loại ca", "Thông tin sinh viên & Môn học", "Kỳ vọng", "Kết quả", "Nhóm dừng & Câu hỏi Escalate", "Căn cứ Quy chế"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-[11px] font-700 text-slate-500 uppercase tracking-wide whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredResults.map((r) => (
                  <tr
                    key={r.caseId}
                    className={`hover:bg-slate-50 ${r.actual === "ESCALATE" ? "bg-amber-50/30" : ""}`}
                  >
                    {/* Mã ca */}
                    <td className="px-4 py-3.5 align-top">
                      <div className="flex flex-col gap-1">
                        <span className="font-mono-data text-xs font-600 text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded w-fit">
                          {r.caseId}
                        </span>
                        <span className="text-[11px] text-slate-500 max-w-[170px] leading-tight">
                          {getCaseLabel(r.caseId)}
                        </span>
                      </div>
                    </td>

                    {/* Tóm tắt */}
                    <td className="px-4 py-3.5 align-top">
                      <p className="text-xs text-slate-700 leading-relaxed font-mono-data">
                        {r.summary}
                      </p>
                    </td>

                    {/* Kỳ vọng */}
                    <td className="px-4 py-3.5 align-top">
                      <ExpectedBadge d={r.expected} />
                    </td>

                    {/* Kết quả */}
                    <td className="px-4 py-3.5 align-top">
                      {r.pass ? (
                        <span className="badge badge-pass">PASS</span>
                      ) : (
                        <span className="badge trigger-fact">FAIL</span>
                      )}
                    </td>

                    {/* Trạng thái & câu hỏi */}
                    <td className="px-4 py-3.5 align-top max-w-sm">
                      <div className="flex flex-col gap-1.5">
                        {r.triggerCategory ? (
                          <>
                            <TriggerPill cat={r.triggerCategory} />
                            <p className="text-[12px] text-amber-950 font-medium leading-snug bg-amber-100/70 p-2.5 rounded border border-amber-300">
                              ❓ {r.escalationQuestion}
                            </p>
                          </>
                        ) : (
                          <span className="text-[12px] text-emerald-700 font-medium flex items-center gap-1">
                            ✓ Đủ điều kiện tự động phê duyệt
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Căn cứ Quy chế */}
                    <td className="px-4 py-3.5 align-top text-[11px] text-slate-500 max-w-xs leading-relaxed">
                      {r.policyBasis}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          !running && (
            <div className="px-6 py-14 text-center">
              <div className="w-12 h-12 bg-indigo-50 rounded-xl mx-auto mb-3 flex items-center justify-center">
                <svg className="w-6 h-6 text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
              </div>
              <p className="text-sm text-slate-500">
                Bấm <strong className="text-slate-700">Chạy Verify {mode === "5_cases" ? "(5 Ca)" : "(15 Ca)"}</strong> để bắt đầu kiểm thử tự động toàn diện.
              </p>
            </div>
          )
        )}
      </div>
    </section>
  );
}
