# CODEBASE MAP — THE ESCALATION REFEREE (Spec A · Bảng 1 OrganizationAI)

> Lập bởi: **SV4** (Verify harness / test / runbook) · Ngày: 08/09/2026
> Phương pháp: đọc code + **chạy agent thật** bằng `tsx` trên 15 ca + 6 ca tự nghĩ. Mọi khẳng định dưới đây có `file:dòng`.
> Quy trình đã chốt: **DUYỆT ĐƠN XIN NGHỈ**.

---

## 1. Ngôn ngữ, framework, cách chạy

| Hạng mục | Giá trị | Bằng chứng |
|---|---|---|
| Framework | React 19 + TypeScript 5.7 + Vite 8 + Tailwind v4 | `package.json:12-25` |
| Kiểu ứng dụng | **SPA thuần client — KHÔNG có backend** | `package.json` không có server dep; `vercel.json:1-5` chỉ build tĩnh |
| Entry point | `index.html` → `src/main.tsx:8` → `src/App.tsx` | `src/main.tsx:1-10` |
| Deploy | Vercel, `outputDirectory: dist` | `vercel.json:2-4` |
| Chạy local | `npm install && npm run dev` (Vite :5173) | `package.json:8-10` |
| Build | `npm run build` → **PASS, 28 modules, 391ms** | verify 08/09/2026 |
| Lịch sử | **27 commit**, không squash | `git log` |

### 1.1 Cây thư mục (phần SỐNG)
```
src/main.tsx → App.tsx
  ├── components/Header.tsx           (đổi domain + đổi vai trò)
  ├── components/LocalAgentBar.tsx    (cấu hình Ollama)
  ├── components/PolicyModal.tsx      (hiển thị quy chế)
  ├── components/ApplicantPortal.tsx  (vai người nộp đơn)
  ├── components/ReviewerPortal.tsx   (vai người duyệt)
  ├── domains/academic/VerifyHarness.tsx   ★ HARNESS SỐNG (1100 dòng)
  ├── domains/academic/mockTestCases.ts    (5 ca chuẩn + 15 ca)
  └── core/agent/EscalationRefereeAgent.ts ★ LÕI AGENT (333 dòng)
```

### 1.2 ⚠️ Cây thư mục (phần CHẾT — không được bundle)
Không file nào dưới đây được `App.tsx` import (xác nhận: build chỉ transform 28 modules):

| File chết | Vì sao nguy hiểm |
|---|---|
| `src/services/api.ts` | Trỏ `https://api-placeholder.onrender.com` (**không tồn tại**), `api.ts:6` |
| `src/data/mockTestCases.ts` | `runMockVerify()` **hardcode** `actual: tc.expected, pass: true` — `:106-107` |
| `src/domains/enterprise/mockTestCases.ts` | **hardcode** `actual: tc.expected, pass: true` — `:279-280` |
| `src/domains/enterprise/VerifyHarness.tsx` | harness song song, không dùng |
| `src/domains/academic/AcademicApp.tsx`, `enterprise/EnterpriseApp.tsx` | app cũ, không dùng |
| `artifact/student-leave-referee/**` | **cây dự án thứ 2, hoàn toàn tách biệt**, có `policy.md` riêng |

> **Kết luận quan trọng cho SV4**: harness sống KHÔNG dính hardcode, nhưng repo còn 3 file hardcode `pass:true`. Nếu giám khảo `grep` sẽ thấy → phải xóa trước nộp (xem báo cáo Cổng A, mục H2).

---

## 2. Agent nhận input / trả output thế nào

### 2.1 Input — `AgentEvaluationInput` (`src/core/agent/types.ts:40-55`)

| Field | Kiểu | Ý nghĩa |
|---|---|---|
| `domain` | `"enterprise" \| "academic"` | chọn nhánh quy chế |
| `subjectId`, `subjectName` | string | mã + tên SV/NV |
| `organizationUnit` | string | Khoa / Phòng ban |
| `leaveType` | string | loại đơn (vd `"Xin bảo lưu học kỳ"`) |
| `fromDate`, `toDate` | string | mốc thời gian |
| `durationDaysOrSessions` | number | số buổi/ngày xin nghỉ |
| `pastAbsencesCount` | number? | đã nghỉ trước đó |
| `totalLimitOrCapacity` | number? | tổng số buổi môn học |
| `docStatus` | `"VALID" \| "UNCLEAR_DATE" \| "MISSING"` | tình trạng minh chứng |
| `isSpecialRequest` | boolean? | cờ bảo lưu học kỳ |
| `reasonText`, `notesText` | string | **văn bản tự do — agent quét keyword ở đây** |

### 2.2 Output — `AgentEvaluationOutput` (`types.ts:57-68`)
- `outcome`: **`"AUTO_APPROVE" | "ESCALATE"`** (chỉ 2 giá trị — `types.ts:9`)
- `uncertaintyCategory?`: **3 nhãn phân biệt** (`types.ts:4-7`)
  - `"Không chắc dữ kiện"` · `"Ngoài chính sách"` · `"Vượt thẩm quyền"`
- `escalationQuestion?`: câu hỏi 1 lượt
- `policyBasis`: điều khoản trích dẫn
- `reasoningTrace[]`: `{checkName, passed, observation, ruleCited}`
- `confidenceScore`: `1.0` khi auto-approve, `0.5` khi escalate

### 2.3 Luồng quyết định (thứ tự QUAN TRỌNG)
`EscalationRefereeAgent.evaluate()` — `EscalationRefereeAgent.ts:84-285`, **fail-fast theo thứ tự**:

1. **BƯỚC 1 — Thẩm quyền** `:91-146` → `return` ngay `"Vượt thẩm quyền"`
2. **BƯỚC 2 — Dữ kiện** `:148-203` → `return` ngay `"Không chắc dữ kiện"`
3. **BƯỚC 3 — Chính sách** `:205-262` → `return` ngay `"Ngoài chính sách"`
4. **BƯỚC 4 — Auto-approve** `:264-284`

> Vì bước 1 chạy TRƯỚC bước 3, ca vừa vượt 20% vừa `>=10 buổi` bị **nuốt** vào "Vượt thẩm quyền". Đây là lỗi ranh giới — xem báo cáo mục (b).

---

## 3. Chính sách sống ở đâu?

**Policy KHÔNG phải file/config — nó hardcode rải rác trong TypeScript.**

| Nơi | Bằng chứng |
|---|---|
| Ngưỡng 20% chuyên cần | `EscalationRefereeAgent.ts:232` — `if (absenceRatio > 0.20)` |
| Ngưỡng bảo lưu (academic) | `:114-119` — `isSpecialRequest \|\| leaveType==="Xin bảo lưu học kỳ" \|\| duration >= 10` |
| Ngưỡng thẩm quyền (enterprise) | `:98-103` — `không lương > 5` / `phép năm > 5` / `duration >= 20` |
| Danh sách keyword "mờ/thiếu" | `:153-164` |
| Văn bản điều khoản ("Điều 1.2…") | chuỗi literal, vd `:235`, `:123`, `:176` |
| Bản quy chế cho người đọc | `src/components/PolicyModal.tsx` (JSX prose, **không** được agent đọc) |
| `policy.md` | **CHỈ có ở** `student-leave-referee/policy.md` — cây chết, agent sống không đọc |

→ **Agent không "đọc" policy.** Không có RAG, không parse markdown. Policy = `if/else` + literal string. Sửa policy = sửa code.

---

## 4. Interface mà harness SV4 phải gọi

**KHÔNG có HTTP endpoint.** Live URL là trang tĩnh; agent chạy **in-browser**.

```ts
import { refereeAgent } from "@/core/agent/EscalationRefereeAgent";

const out: AgentEvaluationOutput =
  await refereeAgent.evaluateAsync(input /* AgentEvaluationInput */,
                                   { enabled: false /* tắt Ollama */ });
```
- Định nghĩa: `EscalationRefereeAgent.ts:31-79`; singleton export `:333`
- Đồng bộ (không LLM): `refereeAgent.evaluate(input)` — `:84`
- Harness sống đã gọi đúng hàm này: `domains/academic/VerifyHarness.tsx:235` (ca giám khảo) và `:310` (chạy hàng loạt)

### 4.1 Vai trò của Ollama (`localLlmClient.ts`)
- Endpoint `http://localhost:11434/api/generate` — `localLlmClient.ts:99`
- **Chỉ dùng để VIẾT LẠI CÂU HỎI escalate**, không đổi `outcome` cũng không đổi `uncertaintyCategory` (`EscalationRefereeAgent.ts:43-69` chỉ gán `escalationQuestion`).
- Trên live URL HTTPS, gọi `http://localhost` bị chặn (mixed-content) → `catch` `:121-124` trả `null` → **fallback về câu hỏi rule engine**. Quyết định vẫn tất định. 
- ⚠️ Nhưng `:40` gán `modelUsed = cfg.model` TRƯỚC khi gọi và **không revert khi thất bại** → UI khoe "qwen3-vl:4b" dù LLM chưa từng chạy.

---

## 5. Cách giám khảo nhập ca mới

`domains/academic/VerifyHarness.tsx` có sẵn **form nhập tay** (`:500-690`), nút chạy `:721` → `handleEvaluateJudgeCase()` `:213-244` → **gọi `refereeAgent.evaluateAsync` thật** `:235`. Nút "ghim" kết quả vào bảng: `:766` → `handlePinJudgeCase()` `:247-268`.

→ **Hệ thống CÓ nhận input mới**, không bị khoá vào 15 ca. (Chi tiết kiểm chứng: báo cáo Cổng A mục 4.)
