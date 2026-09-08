# RUNBOOK — AI ESCALATION REFEREE (Spec A · Bảng 1 OrganizationAI)

> Quy trình đã chốt: **DUYỆT ĐƠN XIN NGHỈ** · Vai trò: SV4 (Verify harness)
> Cập nhật: 08/09/2026 · Build đã kiểm: PASS, `tsc --noEmit` sạch

---

## 1. Chạy từ máy sạch

```bash
git clone <repo-url>
cd artifact

node -v          # cần >= 20  (đã kiểm trên v22.18.0)
npm install

npm run dev      # http://localhost:5173
```

Bản production (giống hệt live URL):

```bash
npm run build    # ra thư mục dist/
npm run preview
```

Không cần biến môi trường. Không cần API key. Không cần cài Ollama.

---

## 2. Kiểm chứng 90 giây — đường giám khảo đi

| Bước | Thao tác | Thấy gì |
|---|---|---|
| 1 | Mở URL | Mặc định vai **Harness**, ngữ cảnh **Trường học** |
| 2 | Bấm **▶ Chạy Kiểm Chứng** (bộ 5 ca) | Bảng 5 dòng: 3 PASS thường quy, TC04 escalate, TC16 **FAIL đỏ** (xem §5) |
| 3 | Đọc cột **Thực Tế + Phán Quyết 3 Vế** | Mỗi ca có outcome, loại dừng, câu hỏi escalate, độ trễ ms, timestamp |
| 4 | Bấm **Tất Cả 16 Ca** | Bộ toàn diện, phủ cả 3 loại dừng |
| 5 | Khung **Ca Giám Khảo** → nhập ca của bạn → **Phân Xử** | Agent chạy thật trên input mới |
| 6 | **Ghim vào bảng** → **⬇ Xuất JSON** | Lưu bằng chứng phiên chấm |

---

## 3. H1 — Kiến trúc: agent chạy TRONG TRÌNH DUYỆT, không có HTTP endpoint

Đây là điểm quan trọng nhất cần biết trước khi chấm.

- **Không có backend.** `package.json` không có dependency server nào; `vercel.json` chỉ
  build tĩnh ra `dist/`. Live URL là trang tĩnh.
- **Agent là TypeScript chạy trên máy giám khảo.** Interface duy nhất:

  ```ts
  import { refereeAgent } from "@/core/agent/EscalationRefereeAgent";
  const out = await refereeAgent.evaluateAsync(input, { enabled: false });
  ```
  Định nghĩa: `src/core/agent/EscalationRefereeAgent.ts:31` · singleton `:333`.

- **Hệ quả tốt cho buổi chấm**: không có server nào để sập, không có cold-start,
  không phụ thuộc mạng sau khi tải trang, và kết quả tái lập được 100%.
- Harness gọi đúng hàm này ở 2 chỗ: ca giám khảo (`VerifyHarness.tsx:~235`) và
  chạy hàng loạt (vòng lặp trong `handleRunBatch`). **Không có đường nào khác.**

---

## 4. Ollama là TUỲ CHỌN — fallback rule engine là hành vi ĐÚNG

- Cấu hình mặc định: `http://localhost:11434`, model `qwen2.5:1.5b` /
  `qwen3-vl:4b` (`src/core/agent/localLlmClient.ts:13-18`).
- Máy giám khảo gần như chắc chắn **không** có Ollama. Ngoài ra trang HTTPS **chặn**
  gọi `http://localhost` (mixed-content). Cả hai trường hợp rơi vào `catch`
  (`localLlmClient.ts:121-124`) và trả `null`.
- Khi đó agent dùng **câu hỏi do rule engine sinh**. Đây là thiết kế, không phải lỗi.

**Vì sao không ảnh hưởng tính đúng đắn:** LLM chỉ được phép **viết lại câu chữ** của
`escalationQuestion`. Nó **không bao giờ** đổi `outcome` hay `uncertaintyCategory` —
xem `EscalationRefereeAgent.ts:43-69`, nhánh LLM chỉ gán đúng một trường.

> Chế độ chấm điểm của harness (**⚡ Agent (tất định)**) chủ động **tắt** LLM, để câu hỏi
> tái lập được và so khớp regex có nghĩa. Nút **Live LLM** chỉ để trình diễn.

---

## 5. Đã biết & đang xử (bàn giao SV2)

Harness cố tình **không** che các lỗi này. Dòng đỏ trên bảng là bằng chứng, không phải sự cố.

| Mã | Lỗi | Vị trí | Trạng thái | Ảnh hưởng bảng |
|---|---|---|---|---|
| **B1** | `durationDaysOrSessions >= 10` bị coi là "xin bảo lưu học kỳ" ⇒ ca vắng nhiều bị gán sai `Vượt thẩm quyền` thay vì `Ngoài chính sách` | `EscalationRefereeAgent.ts:119` | ⏳ **Chờ SV2** | TC16 (bộ 5) + TC07 (bộ 16) FAIL — CATEGORY |
| **B1b** | Khớp chuỗi mù phủ định: ghi chú `"KHÔNG xin bảo lưu học kỳ"` vẫn kích hoạt nhánh thẩm quyền | `EscalationRefereeAgent.ts:117-118` | ⏳ **Chờ SV2** | Không hiện trên bảng; là bẫy khi soạn ca mới |
| **B2** | `modelUsed` gán tên model **trước** khi gọi LLM và không revert khi thất bại ⇒ UI khoe tên model dù LLM chưa chạy | `EscalationRefereeAgent.ts:40` | ⏳ **Chờ SV2** | Cột model có thể sai ở chế độ Live LLM |

**Sau khi SV2 vá B1, cả hai ca tự chuyển PASS — không cần sửa harness.**
Đã kiểm chứng bằng bản vá mô phỏng: bộ 5 → 5/5, bộ 16 → 16/16.

**Việc SV4 đã làm để lộ lỗi ra thay vì giấu:**
- Comparator so **3 vế** (`src/domains/academic/verifyComparator.ts`), không chỉ `outcome`.
- Gỡ engine song song `runMockVerify` / `runMockEvaluate` — chỉ còn một đường tới agent thật.
- Xoá 12 file chết, trong đó 3 file hardcode `actual = expected, pass = true`.
- Ca giám khảo `pass = null` ("— chưa chấm") thay vì `true` giả.
- Bỏ chuỗi hardcode `· 0 FAIL` và "Tỷ lệ đạt 100%" khi bảng rỗng.

---

## 6. Tự chứng minh KHÔNG hardcode — 3 phép "vặn nút"

Làm ngay trên khung **Ca Giám Khảo**. Mỗi phép chỉ đổi **một** trường.

### Phép 1 — lật quyết định bằng số buổi vắng
1. Bấm mẫu **Ca 1: Thường quy hợp lệ** → Phân Xử → `AUTO_APPROVE`, không gắn cờ.
2. Đổi **Số buổi đã nghỉ trước đó**: `0` → `4` (tổng 5/15 = 33%).
3. Phân Xử lại → lật sang `ESCALATE` / **Ngoài chính sách**, và câu hỏi in đúng
   `5/15 buổi (33.3%)`.
→ Con số trong câu hỏi được **tính**, không phải chuỗi cài sẵn.

### Phép 2 — lật loại dừng bằng ô ① minh chứng
1. Vẫn ca đó, trả **Số buổi đã nghỉ** về `0`.
2. Đổi ô **① Tình trạng minh chứng**: `VALID` → `UNCLEAR_DATE`.
3. Phân Xử → `ESCALATE` / **Không chắc dữ kiện**, câu hỏi đổi thành
   *"…xin nghỉ từ ngày nào?"*.
→ Cùng một đơn, đổi một trường, ra **loại dừng khác** và **câu hỏi khác**.

### Phép 3 — đổi mẫu số, tỉ lệ đổi theo
1. Ca vắng 4 buổi, **Tổng số buổi môn học** = `15` → escalate (26.7% > 20%).
2. Đổi tổng số buổi thành `40` (4/40 = 10%).
3. Phân Xử → quay lại `AUTO_APPROVE`.
→ Ngưỡng 20% được tính trên dữ liệu nhập, không tra bảng.

> Muốn chắc hơn nữa: đổi **tên sinh viên** thành tên bất kỳ — tên đó xuất hiện nguyên văn
> trong câu hỏi escalate, chứng tỏ câu hỏi được sinh tại chỗ.

---

## 7. Cấu trúc mã nguồn (sau dọn dẹp)

18 file sống, 0 file mồ côi (kiểm bằng phân tích đồ thị import từ `src/main.tsx`).

```
src/main.tsx → App.tsx
├── components/         Header · LocalAgentBar · PolicyModal · StandardFormModal
│                       ApplicantPortal · ReviewerPortal
├── core/agent/         EscalationRefereeAgent.ts  ← LÕI QUYẾT ĐỊNH (SV2)
│                       localLlmClient.ts · vlmClient.ts · types.ts
├── core/data/          caseFolders.ts
└── domains/academic/   VerifyHarness.tsx      ← HARNESS (SV4)
                        verifyComparator.ts    ← COMPARATOR 3 VẾ (SV4)
                        mockTestCases.ts       ← DỮ LIỆU CA thuần (16 ca)
                        types.ts
```

**Chính sách sống ở đâu:** hardcode trong `EscalationRefereeAgent.ts`, không phải file
config — ngưỡng 20% ở `:232`, ngưỡng thẩm quyền ở `:114-119`, danh sách keyword ở
`:153-164`. Agent **không** đọc `policy.md` và **không** dùng RAG. Sửa chính sách = sửa code.

---

## 8. Sự cố thường gặp

| Triệu chứng | Nguyên nhân | Xử lý |
|---|---|---|
| Bảng có dòng đỏ TC16 / TC07 | **Đúng như thiết kế** — lỗi B1 chưa vá | Xem §5; không phải lỗi harness |
| Cột model ghi tên LLM nhưng máy không có Ollama | Lỗi B2 | Dùng chế độ **⚡ Agent (tất định)** |
| Ca giám khảo hiện "— chưa chấm" | Đúng: ca tự nhập không có kỳ vọng | Không có gì phải sửa |
| Nhập "giấy mờ" bằng chữ mà vẫn AUTO_APPROVE | Agent quét keyword cố định | Dùng ô ①; harness đã cảnh báo inline |
| `npm install` lỗi | Node < 20 | Nâng Node lên >= 20 |
