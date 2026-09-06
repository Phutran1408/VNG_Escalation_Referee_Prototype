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
  timeoutMs: 8000,
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
 * Gọi Local LLM để sinh câu hỏi Escalate sắc bén, ngắn gọn (trả lời được trong đúng 1 lượt - SV2)
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
      ? "Bạn là AI Escalation Referee trong hệ thống Nhân sự doanh nghiệp (HR)."
      : "Bạn là AI Escalation Referee trong hệ thống Quản lý Đào tạo Đại học.";

  const prompt = `${roleDesc}
Nhiệm vụ cốt lõi (SV2): Tạo đúng 1 CÂU HỎI ESCALATE để người có thẩm quyền phê duyệt đọc là quyết định được ngay trong ĐÚNG MỘT LƯỢT (Single-turn Actionable).
Quy tắc câu hỏi:
1. Đặt vấn đề cụ thể theo độ bất định (${params.uncertaintyCategory}) và căn cứ quy chế (${params.ruleCitation}).
2. Đưa ra 2 lựa chọn xử lý dứt khoát (ví dụ: "Cho phép nghỉ hay yêu cầu bổ sung chứng từ trong 24h?", "Xác nhận chấp thuận ngoại lệ hay từ chối đơn?").
3. Tuyệt đối KHÔNG hỏi vòng vo hay đòi hỏi thêm nhiều vòng trao đổi.
4. Độ dài tối đa 2 câu tiếng Việt.

Thông tin hồ sơ:
- Người làm đơn: ${params.subjectName}
- Loại đơn: ${params.leaveType}
- Lý do: ${params.reason}
- Ghi chú: ${params.notes}
- Nhóm bất định: ${params.uncertaintyCategory}
- Điều khoản áp dụng: ${params.ruleCitation}

Chỉ xuất ra đúng 1 câu hỏi dứt khoát, không chào hỏi, không giải thích ngoài.`;

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
          temperature: 0.1,
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
