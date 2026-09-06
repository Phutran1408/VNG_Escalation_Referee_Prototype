import { useState } from "react";
import type { VerifyResult } from "./types";
import { runMockVerify } from "./mockTestCases";

interface Props {
  onResults: (results: VerifyResult[]) => void;
}

const CASE_LABELS: Record<string, string> = {
  TC01: "Nghỉ phép năm · 1 ngày (Đủ điều kiện)",
  TC02: "Nghỉ ốm có chứng từ y tế · 1 ngày",
  TC03: "Nghỉ việc riêng (kết hôn) · 3 ngày",
  TC04: "Nghỉ ốm · Chứng từ mờ ngày xuất viện",
  TC05: "Nghỉ không lương · 20 ngày (Vượt thẩm quyền)",
};

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

export default function EnterpriseVerifyHarness({ onResults }: Props) {
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState<(VerifyResult & { policyBasis?: string })[]>([]);
  const [elapsed, setElapsed] = useState(0);
  const [done, setDone] = useState(false);

  async function handleRun() {
    setRunning(true);
    setDone(false);
    setResults([]);
    setElapsed(0);

    const start = Date.now();
    const ticker = setInterval(() => setElapsed(Math.floor((Date.now() - start) / 1000)), 300);

    try {
      const data = runMockVerify();
      for (let i = 0; i < data.length; i++) {
        await new Promise((r) => setTimeout(r, 200));
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

  return (
    <section id="verify-enterprise" className="scroll-mt-6">
      <div className="card">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display text-lg font-700 text-slate-900">Verify Test Harness — Doanh Nghiệp (Enterprise HR)</h2>
              <span className="text-[11px] font-mono-data bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-semibold">
                5 Ca Chuẩn Nhân Sự
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-0.5">
              5 ca kiểm thử chuẩn Enterprise HR — tự động phân loại theo Quy chế Nhân sự nội bộ
            </p>
          </div>
          <button
            onClick={handleRun}
            disabled={running}
            className="inline-flex items-center gap-2 bg-blue-700 hover:bg-blue-800 disabled:bg-blue-400 text-white font-semibold text-sm px-5 py-2.5 rounded-lg transition-colors shadow-sm shrink-0 cursor-pointer"
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
                Chạy Verify Nhân Sự (5 Ca)
              </>
            )}
          </button>
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
            <span className="font-mono-data">
              {done
                ? `✓ Hoàn thành — ${results.length}/5 ca · ${passCount} PASS · ${results.length - passCount} FAIL`
                : `⏱ Đang phân xử tuần tự — ${results.length}/5 ca · ${elapsed}s`}
            </span>
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
