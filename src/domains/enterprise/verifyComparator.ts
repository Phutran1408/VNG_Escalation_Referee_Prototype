import type { AgentEvaluationOutput } from "../../core/agent/types";
import type { TestCase, TriggerCategory } from "./mockTestCases";

export type FailReason = "OUTCOME_MISMATCH" | "CATEGORY_MISMATCH" | "OVER_ESCALATE" | "UNDER_ESCALATE";

export interface ComparisonResult {
  pass: boolean;
  failReasons: FailReason[];
  detail: string;
}

export function compareEnterpriseCase(
  tc: TestCase,
  output: AgentEvaluationOutput
): ComparisonResult {
  const failReasons: FailReason[] = [];
  const details: string[] = [];

  // 1. So khớp outcome chính (AUTO_APPROVE vs ESCALATE)
  if (output.outcome !== tc.expected) {
    if (tc.expected === "AUTO_APPROVE" && output.outcome === "ESCALATE") {
      failReasons.push("OVER_ESCALATE");
      details.push(
        `Over-escalation: Ca thường quy nhưng hệ thống lại gắn cờ Escalate (${output.uncertaintyCategory || "không rõ lý do"}).`
      );
    } else {
      failReasons.push("UNDER_ESCALATE");
      details.push(
        `Under-escalation: Ca rủi ro bất định (${tc.expectedTrigger}) nhưng hệ thống tự ý Auto-Approve.`
      );
    }
  }

  // 2. Nếu là ca Escalate, so khớp loại dừng (Uncertainty Category)
  if (tc.expected === "ESCALATE") {
    const actualCategory = output.uncertaintyCategory as TriggerCategory | undefined;
    if (!actualCategory) {
      failReasons.push("CATEGORY_MISMATCH");
      details.push(`Thiếu nhóm bất định: Kỳ vọng '${tc.expectedTrigger}' nhưng không có category.`);
    } else if (tc.expectedTrigger && actualCategory !== tc.expectedTrigger) {
      failReasons.push("CATEGORY_MISMATCH");
      details.push(
        `Sai nhóm bất định: Kỳ vọng '${tc.expectedTrigger}' nhưng thực tế là '${actualCategory}'.`
      );
    }
  }

  return {
    pass: failReasons.length === 0,
    failReasons,
    detail: details.join(" | ") || "PASS: Khớp 100% quyết định và nhóm bất định.",
  };
}
