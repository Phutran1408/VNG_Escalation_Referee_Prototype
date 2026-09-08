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
| 2 | Bấm **▶ Chạy Kiểm Chứng** (bộ 5 ca) | Bảng 5 dòng, **5/5 PASS**: 3 ca tự duyệt + 2 ca chuyển tiếp khác loại dừng |
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

## 5. Đã biết & đang xử

Harness cố tình **không** che lỗi. Ba lỗi dưới đây do chính comparator 3 vế phát hiện ở
commit `a25c0d2`, và đã được vá ở commit `d9a8f36` ngay sau đó.

| Mã | Lỗi | Vị trí | Trạng thái |
|---|---|---|---|
| **B1** | `durationDaysOrSessions >= 10` bị coi là "xin bảo lưu học kỳ" ⇒ ca vắng nhiều bị gán sai `Vượt thẩm quyền` thay vì `Ngoài chính sách` | `EscalationRefereeAgent.ts:119` | ✅ **Đã vá** |
| **B1b** | Khớp chuỗi mù phủ định: ghi chú `"KHÔNG xin bảo lưu học kỳ"` vẫn kích hoạt nhánh thẩm quyền | `EscalationRefereeAgent.ts:117-118` | ✅ **Đã vá** |
| **B2** | `modelUsed` gán tên model **trước** khi gọi LLM và không revert khi thất bại ⇒ UI khoe tên model dù LLM chưa chạy | `EscalationRefereeAgent.ts:40` | ✅ **Đã vá** |

Sau khi vá: bộ 5 → **5/5**, bộ 16 → **16/16**, và harness **không** bị sửa để lấy pass —
diff `src/domains/academic/` rỗng ở commit vá, kiểm được bằng `git show d9a8f36 --stat`.

### 5.1 Nhánh Doanh Nghiệp — chủ động KHÔNG đưa vào demo

`EscalationRefereeAgent.ts:98-103` (nhánh `domain === "enterprise"`) còn **đúng loại lỗi**
vừa vá cho nhánh trường học:

- `durationDaysOrSessions >= 20` ⇒ suy thẩm quyền từ **độ dài đơn** (giống B1)
- `fullText.includes("vượt thẩm quyền")` ⇒ quét **chuỗi tự do** (giống B1b)

**Chưa có bộ ca kiểm thử nào phủ nhánh này.** Vá logic mà không có test là vá mù, nên
quyết định là **ngắt khỏi giao diện** thay vì sửa vội:

- Bộ chuyển ngữ cảnh trong `Header.tsx` thay bằng nhãn tĩnh "🎓 Trường Học".
- `App.tsx` chốt cứng `const DEMO_DOMAIN = "academic"` — không còn `setDomain` nào trong
  toàn bộ `src/`, nên không tồn tại đường nào từ UI đặt `domain = "enterprise"`.
- **Code enterprise vẫn giữ nguyên trong repo** để bảo toàn lịch sử, chỉ là không ai gọi tới.

> **Đây là việc đầu tiên nếu mở rộng**: viết bộ ca kiểm thử cho nhánh doanh nghiệp trước,
> rồi mới áp cùng cách vá B1/B1b (thẩm quyền đọc từ trường có cấu trúc, không suy từ số
> ngày và không quét văn xuôi), rồi mới mở lại bộ chuyển ngữ cảnh.

### 5.2 Bẫy free-text — giới hạn còn nguyên, chưa vá

Agent nhận diện tình trạng minh chứng theo **hai** đường:

1. Trường có cấu trúc `docStatus` (`VALID` / `UNCLEAR_DATE` / `MISSING`) — **đáng tin**.
2. Quét danh sách từ khoá cố định trong `reasonText` + `notesText`
   (`EscalationRefereeAgent.ts:153-164`: `"mờ"`, `"không rõ ngày"`, `"mất góc"`,
   `"thiếu mộc"`, `"chưa nộp giấy"`…) — **không đáng tin**.

Đường 2 chỉ khớp đúng những từ đã liệt kê. Gõ **"nhoè"**, **"mất chữ"**, **"illegible"**,
hay diễn đạt vòng vo thì agent **không** nhận ra, và ca sẽ ra `AUTO_APPROVE`.

**Vì sao chưa vá:** nới danh sách từ khoá chỉ đẩy ranh giới đi chỗ khác, không xoá được
bản chất — muốn xử đúng phải hiểu ngữ nghĩa, và đó là thay đổi kiến trúc chứ không phải
sửa vài dòng. Lỗi B1b vừa vá chính là cùng gốc bệnh này: quét chuỗi tự do không phân biệt
được cả câu phủ định.

**Đã giảm rủi ro bằng giao diện, không bằng cách sửa agent:**
- Ô `docStatus` đánh số **①** và ghi thẳng *"chọn ở đây, đừng chỉ mô tả bằng lời"*.
- Placeholder ô Ghi Chú trỏ ngược về ô ①.
- Cảnh báo hiện ngay khi ô ① để `VALID` mà ghi chú lại tả "mờ / thiếu / mất / không rõ".

> **Hướng xử đúng (chưa làm):** bỏ hẳn đường 2, bắt mọi tình trạng minh chứng phải khai
> qua trường có cấu trúc. Cái giá là người nhập phải kỷ luật hơn — cần hỏi giáo vụ thật
> trước khi quyết.

**Những thay đổi để lộ lỗi ra thay vì giấu:**
- Comparator so **3 vế** (`src/domains/academic/verifyComparator.ts`), không chỉ `outcome`.
- Gỡ engine song song `runMockVerify` / `runMockEvaluate` — chỉ còn một đường tới agent thật.
- Xoá 12 file chết, trong đó 3 file hardcode `actual = expected, pass = true`.
- Ca giám khảo `pass = null` ("— chưa chấm") thay vì `true` giả.
- Bỏ chuỗi hardcode `· 0 FAIL` và "Tỷ lệ đạt 100%" khi bảng rỗng.

---

## 6. Tự chứng minh KHÔNG hardcode — 3 phép "vặn nút"

Khung **Ca Giám Khảo** có sẵn khối **"🔧 Tự kiểm chứng"** với 3 nút bấm ứng với 3 phép
dưới đây. Bấm nút → bấm **Phân Xử** → xem kết quả lật. Đã kiểm chứng cả khi bấm nối tiếp.

Xuất phát: form mặc định (1/15 buổi, minh chứng VALID) → `AUTO_APPROVE`.

### Phép 1 — nút ① "Đã nghỉ → 9 buổi"
Chỉ đổi **số buổi đã nghỉ trước đó**: `0` → `9` (tổng 10/15).
→ Lật sang `ESCALATE` / **Ngoài chính sách**, câu hỏi in đúng **`10/15 buổi (66.7%)`**.
Con số phần trăm được **tính từ dữ liệu nhập**, không phải chuỗi cài sẵn.

### Phép 2 — nút ② "Minh chứng → mờ ngày"
Chỉ đổi ô **① Tình trạng minh chứng**: `VALID` → `UNCLEAR_DATE`.
→ Lật sang `ESCALATE` / **Không chắc dữ kiện**, câu hỏi đổi thành
*"…xin nghỉ từ ngày nào?"*.
Cùng một đơn, đổi một trường, ra **loại dừng khác** và **câu hỏi khác**.

### Phép 3 — nút ③ "Về ca sạch, tổng buổi → 60"
Trả về hồ sơ sạch với mẫu số lớn: tổng 60 buổi, chưa nghỉ buổi nào, minh chứng hợp lệ.
→ Quay lại `AUTO_APPROVE`.
Ngưỡng 20% tính trên dữ liệu nhập, không tra bảng — và hệ **không** escalate ca hợp lệ.

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
| Bảng có dòng đỏ | B1/B1b đã vá nên bộ chuẩn phải **5/5** — còn đỏ là hồi quy thật | Đọc cột lý do: `OUTCOME` / `CATEGORY` / `QUESTION` |
| Cột model ghi "Deterministic Rules Engine" | **Đúng**: LLM không chạy, và B2 đã vá nên nó báo trung thực | Không có gì phải sửa |
| Ca giám khảo hiện "— chưa chấm" | Đúng: ca tự nhập không kèm kỳ vọng nên không chấm được | Không có gì phải sửa |
| Nhập "nhoè / mất chữ" bằng lời mà vẫn AUTO_APPROVE | Bẫy free-text — agent quét danh sách từ khoá cố định | Dùng ô **①**; xem §5.2 |
| Bấm nút 🔧 mà kết quả không lật | Chưa bấm **Phân Xử** lại sau khi vặn | Nút chỉ đổi form; phải chạy lại agent |
| `npm install` lỗi | Node < 20 | Nâng Node lên >= 20 |
