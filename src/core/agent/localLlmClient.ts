/**
 * Local LLM Client kết nối trực tiếp với Ollama (qwen2.5, llama3, qwen3,...)
 * Chạy cục bộ trên máy tại http://localhost:11434
 */

export interface LocalLlmConfig {
  baseUrl: string;
  model: string;
  enabled: boolean;
  timeoutMs: number;
}

export const DEFAULT_LLM_CONFIG: LocalLlmConfig = {
  baseUrl: "http://localhost:11434",
  model: "qwen2.5:1.5b",
  enabled: true,
  timeoutMs: 3500,
};

/**
 * Kiểm tra xem Ollama Local có đang chạy không và lấy danh sách model
 */
export async function checkOllamaConnection(baseUrl: string = DEFAULT_LLM_CONFIG.baseUrl): Promise<{
  online: boolean;
  models: string[];
  currentModel: string;
}> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000);
    const res = await fetch(`${baseUrl}/api/tags`, { signal: controller.signal });
    clearTimeout(timeout);

    if (!res.ok) throw new Error("Ollama endpoint returned error");
    const data = await res.json();
    const modelNames = (data.models || []).map((m: any) => m.name as string);

    return {
      online: true,
      models: modelNames,
      currentModel: modelNames.includes("qwen2.5:1.5b")
        ? "qwen2.5:1.5b"
        : modelNames.includes("qwen2.5:7b")
        ? "qwen2.5:7b"
        : modelNames[0] || "qwen2.5:1.5b",
    };
  } catch {
    return {
      online: false,
      models: [],
      currentModel: "qwen2.5:1.5b",
    };
  }
}

/**
 * Gọi Local LLM để sinh câu hỏi Escalate sắc bén, ngắn gọn (1 lượt)
 */
export async function generateEscalationQuestionWithLLM(params: {
  domain: "enterprise" | "academic";
  subjectName: string;
  leaveType: string;
  reason: string;
  notes: string;
  uncertaintyCategory: string;
  ruleCitation: string;
  config?: Partial<LocalLlmConfig>;
}): Promise<string | null> {
  const cfg = { ...DEFAULT_LLM_CONFIG, ...params.config };
  if (!cfg.enabled) return null;

  const roleDesc =
    params.domain === "enterprise"
      ? "Bạn là AI Escalation Referee trong hệ thống Nhân sự doanh nghiệp."
      : "Bạn là AI Escalation Referee trong hệ thống Quản lý Đào tạo Đại học.";

  const prompt = `${roleDesc}
Nhiệm vụ: Hãy tạo đúng 1 CÂU HỎI ESCALATE cụ thể để gửi cho cấp quản lý phê duyệt.
Yêu cầu bắt buộc:
- Ngắn gọn, súc tích (1-2 câu).
- Trả lời được trong đúng 1 lượt (Single-turn Actionable).
- Bằng tiếng Việt chuẩn công vụ/học đường.

Thông tin đơn:
- Người làm đơn: ${params.subjectName}
- Loại đơn: ${params.leaveType}
- Lý do: ${params.reason}
- Ghi chú: ${params.notes}
- Nhóm độ bất định: ${params.uncertaintyCategory}
- Căn cứ quy chế: ${params.ruleCitation}

Chỉ xuất ra nội dung câu hỏi, không thêm lời chào hay giải thích rườm rà.`;

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), cfg.timeoutMs);

    const res = await fetch(`${cfg.baseUrl}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        model: cfg.model,
        prompt,
        stream: false,
        options: {
          temperature: 0.2,
          num_predict: 120,
        },
      }),
    });
    clearTimeout(timer);

    if (!res.ok) return null;
    const data = await res.json();
    const answer = (data.response || "").trim();

    // Làm sạch câu trả lời
    return answer.replace(/^["'\s]+|["'\s]+$/g, "");
  } catch {
    // Tự động fallback về câu hỏi quy chế xác định
    return null;
  }
}
