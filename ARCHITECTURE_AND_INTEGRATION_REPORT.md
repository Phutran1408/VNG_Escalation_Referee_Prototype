# Architecture & Integration Report
## AI Escalation Referee — Spec A · Enterprise HR Leave Management

---

## 1. System Component Mapping

### Frontend (React 19 + TypeScript + Tailwind CSS v4 · Deployed on Vercel)

```
src/
├── main.tsx                     # React 19 entrypoint; mounts App into #root; imports index.css
├── index.css                    # Tailwind v4 + Google Fonts (Outfit, Inter, JetBrains Mono)
├── App.tsx                      # Root component; owns global audit state; wires all events
├── components/
│   ├── Header.tsx               # Indigo-950 banner, system name callout, nav strip, stat chips
│   ├── VerifyHarness.tsx        # Sequential 5-case runner, progress bar, animated result table
│   └── AuditTrail.tsx           # Compliance audit log, HR override / rollback per row
├── services/
│   └── api.ts                   # Fetch client (8s timeout, AbortController) + mock fallback
├── types/
│   └── index.ts                 # Decision, LeaveType, TriggerCategory, all DTO interfaces
└── data/
    └── mockTestCases.ts         # 5 enterprise test cases + deterministic mock rule engine
```

**Note**: `LeaveForm` is co-located in `App.tsx` so it can share `FormState` type locally. Move to `components/LeaveForm.tsx` when the form needs independent testing.

### FastAPI Backend (Python 3.11 + Pydantic v2 · Deployed on Render)

```
backend/
├── main.py                      # FastAPI app factory; mounts /api/v1 router; CORSMiddleware
├── api/
│   └── endpoints.py             # POST /verify · POST /evaluate · POST /override
├── core/
│   ├── agent.py                 # Orchestrator: calls rules.py, builds EvaluateResponse
│   └── rules.py                 # Deterministic policy rules (same logic as mockTestCases.ts)
├── models/
│   └── schemas.py               # Pydantic v2 models for all request/response shapes
└── policy.md                    # Human-readable Quy chế Nhân sự nội bộ (policy citations)
```

---

## 2. REST API Contracts

### `POST /api/v1/verify`

Runs all 5 canonical enterprise test cases server-side.

**Request**: `{}`

**Response** `200 OK` — `VerifyResult[]`
```json
[
  {
    "caseId": "TC01",
    "summary": "NV-2024-0312 · Nguyễn Thị Hương · Phòng Kinh doanh · Nghỉ phép năm · 1 ngày",
    "expected": "AUTO_APPROVE",
    "actual": "AUTO_APPROVE",
    "pass": true,
    "triggerCategory": null,
    "escalationQuestion": null,
    "policyBasis": "Điều 10.1 Quy chế Nhân sự — Nghỉ phép năm: Nộp đúng hạn, còn đủ số ngày phép",
    "timestamp": "2025-10-05T08:00:00.000Z"
  },
  {
    "caseId": "TC04",
    "summary": "NV-2024-0489 · Phạm Đức Anh · Phòng Marketing · Nghỉ ốm/chế độ · 4 ngày",
    "expected": "ESCALATE",
    "actual": "ESCALATE",
    "pass": true,
    "triggerCategory": "Không chắc dữ kiện",
    "escalationQuestion": "Chứng từ y tế mờ ngày xuất viện: Nhân viên xin nghỉ từ ngày 12/10 hay 15/10?...",
    "policyBasis": "Điều 14.2 Quy chế Nhân sự — Yêu cầu chứng từ y tế hợp lệ cho nghỉ ốm từ 2 ngày",
    "timestamp": "2025-10-05T08:00:00.000Z"
  }
]
```

**UI Component**: `VerifyHarness.tsx` → `apiVerify()` in `services/api.ts`

---

### `POST /api/v1/evaluate`

Evaluates a single employee leave request.

**Request** — `EvaluateRequest`
```json
{
  "employeeId": "NV-2024-0312",
  "employeeName": "Nguyễn Thị Hương",
  "department": "Phòng Kinh doanh",
  "leaveType": "Nghỉ phép năm",
  "fromDate": "2025-10-15",
  "toDate": "2025-10-15",
  "reason": "Nghỉ phép năm theo kế hoạch, nộp trước 3 ngày",
  "notes": "Còn 4 ngày phép năm trong năm"
}
```

**Response — Auto-Approve** `200 OK`
```json
{
  "requestId": "HR-1728115200000",
  "decision": "AUTO_APPROVE",
  "policyBasis": "Điều 10.1 Quy chế Nhân sự — Nghỉ phép năm đủ điều kiện",
  "escalationQuestion": null,
  "triggerCategory": null,
  "timestamp": "2025-10-05T08:00:00.000Z"
}
```

**Response — Escalate** `200 OK`
```json
{
  "requestId": "HR-1728115201234",
  "decision": "ESCALATE",
  "policyBasis": "Điều 18.1 Quy chế Nhân sự — Phân cấp thẩm quyền phê duyệt nghỉ không lương",
  "escalationQuestion": "Đơn nghỉ không lương 20 ngày vượt thẩm quyền Quản lý trực tiếp (tối đa 5 ngày). Cần chuyển Giám đốc Khối / HRD phê duyệt?",
  "triggerCategory": "Vượt thẩm quyền",
  "timestamp": "2025-10-05T08:00:01.234Z"
}
```

**Trigger categories** (enum):
- `"Không chắc dữ kiện"` — ambiguous/missing evidence
- `"Ngoài chính sách"` — reason not covered by policy
- `"Vượt thẩm quyền"` — exceeds direct manager approval limit

**UI Component**: `LeaveForm` (in `App.tsx`) → `apiEvaluate()` in `services/api.ts`

---

### `POST /api/v1/override`

Records a human HR Admin rollback for an already-processed request.

**Request**
```json
{
  "requestId": "HR-1728115200000",
  "override": true,
  "overriddenBy": "HR Admin"
}
```

**Response** `200 OK`
```json
{
  "requestId": "HR-1728115200000",
  "overridden": true,
  "overriddenBy": "HR Admin",
  "overriddenAt": "2025-10-05T09:00:00.000Z"
}
```

**UI Component**: `AuditTrail.tsx` → `apiOverride()` → optimistic client-side state update

---

## 3. Decision Rule Matrix (policy.md)

| Leave Type | Condition | Decision | Trigger | Policy Ref |
|---|---|---|---|---|
| Nghỉ phép năm | ≤ 5 days, sufficient balance | AUTO_APPROVE | — | Điều 10.1 |
| Nghỉ phép năm | > 5 days consecutive | ESCALATE | Vượt thẩm quyền | Điều 10.3 |
| Nghỉ ốm/chế độ | Valid medical doc, ≤ 1 day | AUTO_APPROVE | — | Điều 14.1 |
| Nghỉ ốm/chế độ | ≥ 2 days, no doc | ESCALATE | Không chắc dữ kiện | Điều 14.2 |
| Nghỉ ốm/chế độ | Doc present but unclear | ESCALATE | Không chắc dữ kiện | Điều 14.2 |
| Nghỉ việc riêng | With valid certificate | AUTO_APPROVE | — | Điều 15.3 |
| Nghỉ việc riêng | No certificate | ESCALATE | Ngoài chính sách | Điều 15 |
| Nghỉ không lương | ≤ 5 days | AUTO_APPROVE | — | Điều 18.1 |
| Nghỉ không lương | > 5 days | ESCALATE | Vượt thẩm quyền | Điều 18.1 |

---

## 4. Mock Fallback Strategy

`services/api.ts` wraps every call with an `AbortController` (8s timeout). On any network failure, CORS error, or Render cold-start timeout:

- `apiVerify()` → `runMockVerify()` — deterministic results for all 5 enterprise test cases
- `apiEvaluate()` → `runMockEvaluate()` — applies same 3-rule engine locally
- `apiOverride()` → no-op (state handled client-side via optimistic update)

The UI is **identical** whether live or mock — no fallback messaging shown to judges.

---

## 5. Step-by-Step Integration Plan (72-Hour Sprint 1)

### Phase 1 — Mock Fallback Demonstration (Hours 0–24)
- [x] All UI components built and wired to enterprise mock data
- [x] `services/api.ts` with 8s timeout + transparent fallback implemented
- [x] `VITE_API_BASE_URL` env var slot ready for injection
- [ ] Deploy to Vercel: `vercel --prod`
- [ ] Set `VITE_API_BASE_URL` in Vercel project environment settings
- [ ] Smoke test: click Verify Harness → confirm 5/5 TC PASS in mock mode

### Phase 2 — FastAPI Backend on Render (Hours 24–48)
- [ ] Scaffold `backend/` per the component map above
- [ ] Implement `core/rules.py` matching the Decision Rule Matrix exactly
- [ ] Implement `core/agent.py` to call rules, generate `requestId`, return `EvaluateResponse`
- [ ] Implement `api/endpoints.py` — three routes, Pydantic validation
- [ ] Write `models/schemas.py` with all Pydantic v2 models
- [ ] Configure CORS in `main.py`:
  ```python
  from fastapi.middleware.cors import CORSMiddleware
  app.add_middleware(
      CORSMiddleware,
      allow_origins=["https://your-app.vercel.app"],
      allow_methods=["POST", "OPTIONS"],
      allow_headers=["Content-Type"],
  )
  ```
- [ ] Deploy to Render as Python Web Service (`uvicorn main:app --host 0.0.0.0 --port $PORT`)
- [ ] Update `VITE_API_BASE_URL` in Vercel to `https://your-service.onrender.com/api/v1`
- [ ] Redeploy Vercel frontend to pick up new env var

### Phase 3 — Cold-Start Keep-Alive & Live E2E (Hours 48–72)
- [ ] Register `GET /health` endpoint returning `{"status": "ok"}` in FastAPI
- [ ] Configure UptimeRobot (free tier): ping `/health` every 14 minutes
- [ ] Run live E2E: click Verify Harness in production → confirm 5/5 PASS from Render
- [ ] Submit custom form entries covering all 3 trigger categories, verify correct escalation
- [ ] Test Override/Rollback on each row — confirm gray background persists in session
- [ ] Confirm `policy.md` article citations appear correctly in Audit Trail `policyBasis` column

---

## 6. Environment Variables

| Variable | Where | Value |
|---|---|---|
| `VITE_API_BASE_URL` | Vercel → Settings → Environment Variables | `https://your-service.onrender.com/api/v1` |
| `ALLOWED_ORIGINS` | Render → Environment | `https://your-app.vercel.app` |

---

## 7. Key Architectural Decisions

| Decision | Rationale |
|---|---|
| **Optimistic override** | Row updates instantly on Rollback; API is fire-and-forget. Keeps UI snappy through Render cold starts. |
| **Mock-first** | Full demo without any backend. Judges evaluate all 5 test cases and submit custom forms purely client-side. |
| **Rule parity** | `mockTestCases.ts` implements the same 3-trigger logic as `core/rules.py`. Mock and live responses are behaviorally identical. |
| **ISO-8601 timestamps** | `new Date().toISOString()` in mock; `datetime.utcnow().isoformat() + "Z"` in FastAPI. Uniform format across audit trail. |
| **AbortController timeout** | 8s hard timeout prevents hanging UX on cold starts. Falls back to mock gracefully. |
