/**
 * SV4 — COMPARATOR 3 VẾ CHO VERIFY HARNESS
 *
 * Nguyên tắc: harness phải TRUNG THỰC, không "hợp" với agent hiện tại.
 * Một ca chỉ PASS khi khớp CẢ BA vế:
 *    1. outcome            (AUTO_APPROVE / ESCALATE)
 *    2. uncertaintyCategory (3 loại dừng — hoặc rỗng với ca thường quy)
 *    3. escalationQuestion  (khớp regex kỳ vọng — chống câu đúng loại nhưng bịa dữ kiện)
 *
 * So sánh chỉ outcome là chưa đủ: ca gắn SAI loại dừng vẫn ra ESCALATE và sẽ
 * hiện PASS giả. Xem TC16 (sentinel lỗi B1) để thấy vế CATEGORY bắt được lỗi đó.
 */
import type { Decision, TriggerCategory } from "./types";

export type FailReason = "OUTCOME" | "CATEGORY" | "QUESTION";

export interface ComparableExpectation {
  expected: Decision;
  expectedTrigger?: TriggerCategory;
}

export interface ComparableActual {
  outcome: Decision;
  uncertaintyCategory?: TriggerCategory;
  escalationQuestion?: string;
}

export interface ComparisonVerdict {
  pass: boolean;
  failReasons: FailReason[];
  outcomeOk: boolean;
  categoryOk: boolean;
  questionOk: boolean;
  detail: string;
}

/**
 * Regex kỳ vọng cho câu hỏi escalate, theo từng loại dừng.
 * Câu hỏi phải cụ thể, trả lời được trong MỘT lượt (chuẩn đề bài).
 */
export const QUESTION_PATTERNS: Record<TriggerCategory, RegExp> = {
  "Không chắc dữ kiện": /từ ngày nào|ngày nào|bổ sung .*(trong|trong vòng)/i,
  "Ngoài chính sách": /(\d+\s*\/\s*\d+\s*buổi|vượt mức cho phép|cấm thi|ngoại lệ)/i,
  "Vượt thẩm quyền": /(trưởng khoa|phòng đào tạo|chuyển .*(phê duyệt|cấp trên))/i,
};

/**
 * Câu hỏi chung chung bị đề bài CẤM. Nếu câu hỏi chỉ có bấy nhiêu → trượt vế QUESTION.
 */
const VAGUE_QUESTION = /^(vui lòng |xin |đề nghị )?(kiểm tra|xem xét|rà soát|review)( lại)?[\s.!?]*$/i;

export function compareCase(
  exp: ComparableExpectation,
  act: ComparableActual
): ComparisonVerdict {
  const failReasons: FailReason[] = [];

  // ── Vế 1: outcome ────────────────────────────────────────────────────────
  const outcomeOk = act.outcome === exp.expected;
  if (!outcomeOk) failReasons.push("OUTCOME");

  // ── Vế 2: category (ca thường quy PHẢI không gắn cờ) ─────────────────────
  const expCat = exp.expectedTrigger ?? null;
  const actCat = act.uncertaintyCategory ?? null;
  const categoryOk = expCat === actCat;
  if (!categoryOk) failReasons.push("CATEGORY");

  // ── Vế 3: question ───────────────────────────────────────────────────────
  const q = (act.escalationQuestion ?? "").trim();
  let questionOk: boolean;
  if (!expCat) {
    // Ca thường quy: tuyệt đối không được kèm câu hỏi escalate
    questionOk = q.length === 0;
  } else if (q.length === 0) {
    questionOk = false;
  } else if (VAGUE_QUESTION.test(q)) {
    questionOk = false; // câu chung chung — đề bài cấm
  } else {
    // Khớp pattern của loại dừng KỲ VỌNG (không phải loại agent tự gán),
    // nên câu đúng-loại-sai-nội-dung vẫn bị bắt.
    questionOk = QUESTION_PATTERNS[expCat].test(q);
  }
  if (!questionOk) failReasons.push("QUESTION");

  const detail = failReasons.length === 0
    ? "Khớp cả 3 vế: outcome + category + question."
    : failReasons
        .map((r) =>
          r === "OUTCOME"
            ? `OUTCOME: chờ ${exp.expected}, nhận ${act.outcome}`
            : r === "CATEGORY"
            ? `CATEGORY: chờ ${expCat ?? "(không gắn cờ)"}, nhận ${actCat ?? "(không gắn cờ)"}`
            : `QUESTION: câu hỏi không khớp chuẩn của "${expCat ?? "ca thường quy"}" → "${q || "(rỗng)"}"`
        )
        .join(" · ");

  return {
    pass: failReasons.length === 0,
    failReasons,
    outcomeOk,
    categoryOk,
    questionOk,
    detail,
  };
}
