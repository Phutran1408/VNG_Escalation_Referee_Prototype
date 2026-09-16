# ACADEMIC & ENTERPRISE ESCALATION REFEREE (AER: HR EDITION)
## Technical Reference and System Specification
### Track 1: OrganizationAI · Spec A: Autonomous Escalation Referee

> This document describes what is built, measured, and executable in the code repository for the Enterprise HR domain, not what is merely planned. Every metric, schema, and formula here is verified against the codebase and test harness.

---

# TABLE OF CONTENTS

- 1. System Overview and Runtime Topology .............................................................. Page 1
- 2. Closed Form Lifecycle and State Machine ........................................................... Page 1
- 3. Algorithms and Mathematical Formulations ........................................................... Page 2
  - 3.1 3-Dimensional Enterprise Uncertainty Space (C1) ................................................. Page 2
  - 3.2 Dual Deterministic Decision Function (C2) ....................................................... Page 3
  - 3.3 Document Visual Validator and Stamp Verification ................................................. Page 3
  - 3.4 Dynamic Leave Quota and Probation Constraint Dynamics (C5) ...................................... Page 3
  - 3.5 Single-Turn Closed Escalation Synthesis (C3) .................................................... Page 4
  - 3.6 Cryptographic Audit Ledger and State Rollback (C4) ............................................. Page 4
- 4. API Surface and Data Contracts ................................................................... Page 5
  - 4.1 Endpoint Specifications ........................................................................ Page 5
  - 4.2 JSON Payload Schemas ........................................................................... Page 5
- 5. Prompt Engineering, Guardrails and Tool Contracts ................................................. Page 7
  - 5.1 Cognitive Reasoning Core ....................................................................... Page 7
  - 5.2 Closed Tool Contracts .......................................................................... Page 7
  - 5.3 Grounded Regulatory Enforcement ................................................................ Page 8
  - 5.4 System Prompt and Guardrails ................................................................... Page 8
- 6. Verification and Empirical Reproducibility ........................................................ Page 8
  - 6.1 The Reproduction Package and Test Runner ....................................................... Page 8
  - 6.2 Adversarial Probing and Stress Testing ......................................................... Page 9
- 7. Known Limits and Boundary Conditions .............................................................. Page 9

---

# 1. System Overview and Runtime Topology

AER operates as a self-contained, edge-executable escalation referee designed to govern corporate leave approvals and Social Insurance statutory compliance under the Vietnamese Labor Code 2019 and Corporate Leave Regulation No. 18/2024/QC-NS.

The runtime topology comprises 4 interconnected components:
- **Intake Gateway**: Consumes structured JSON leave requests (`BM-HR-01`) alongside scanned medical/statutory evidence attachments.
- **Vision-Language Feature Extractor**: Runs local VLM (`qwen3-vl:4b`) to extract circular clinic stamps, doctor signatures, and treatment date legibility.
- **Deterministic Rules Engine**: Evaluates numerical leave quotas, probation flags, and multi-tier authority thresholds in < 5ms.
- **Cognitive Local LLM Referee**: Formulates structured, single-turn human prompts when orthogonal uncertainty is detected.
- **Cryptographic Audit Ledger**: Records immutable SHA-256 state transitions and executes sub-second optimistic state rollbacks.

```text
[ Employee Application ] ──► [ Local VLM Laser Scan ] ──► [ Deterministic Rule Guardrails ]
                                                                       │
                         ┌─────────────────────────────────────────────┴─────────────────────────────────────────────┐
                         ▼                                                                                           ▼
            [ Routine: All Verified ]                                                                   [ Flagged Uncertainty ]
                         │                                                                                           │
                         ▼                                                                                           ▼
            [ AUTO_APPROVE (< 10ms) ]                                                                   [ Cognitive Local LLM ]
                         │                                                                                           │
                         ▼                                                                                           ▼
            [ Immutable Audit Ledger ]                                                                  [ Single-Turn Action Prompt ]
                         ▲                                                                                           │
                         └───────────────────────── [ Manager Decision / Undo ] ◄────────────────────────────────────┘
```

---

# 2. Closed Form Lifecycle and State Machine

A request moves deterministically through a finite set of states:

```text
  ┌──────────────┐
  │   SUBMITTED  │
  └──────┬───────┘
         │
         ▼
  ┌──────────────┐      Valid Quota + Clear Proof
  │  EVALUATING  ├────────────────────────────────────► ┌────────────────┐
  └──────┬───────┘                                      │ AUTO_APPROVED  │
         │                                              └───────┬────────┘
         │ Flagged Uncertainty                                  │
         ▼                                                      │ Manager [Undo]
  ┌──────────────┐                                              ▼
  │  ESCALATED   │◄───────────────────────────────────── ┌────────────────┐
  └──────┬───────┘                                      │    REVERTED    │
         │                                              └────────────────┘
         ├──────────────────────────────┐
         ▼                              ▼
  ┌──────────────┐              ┌────────────────┐
  │   APPROVED   │              │    REJECTED    │
  │ (Exception)  │              │ (Non-compliant)│
  └──────────────┘              └────────────────┘
```

---

# 3. Algorithms and Mathematical Formulations

## 3.1 3-Dimensional Enterprise Uncertainty Space (C1)

Traditional agentic systems model uncertainty as an undifferentiated scalar probability *p* ∈ [0, 1]. AER decomposes enterprise uncertainty into three orthogonal, actionable dimensions:

> *U*<sub>Enterprise</sub> = ⟨ *U*<sub>data</sub>, *U*<sub>policy</sub>, *U*<sub>auth</sub> ⟩

- **U₁ — Data Ambiguity (U_data)**: Missing or illegible information in evidence (e.g., missing statutory Social Insurance Form C65-HD).
- **U₂ — Policy Conflict (U_policy)**: Valid data breaching regulatory rules (e.g., probationary employee requesting paid leave).
- **U₃ — Authority Breach (U_auth)**: Request exceeds line manager jurisdiction (e.g., unpaid leave > 5 days or long-term leave ≥ 20 days).

![Figure 1: 3-Dimensional Enterprise Uncertainty Space](assets/uncertainty_space_en.svg)

## 3.2 Dual Deterministic Decision Function (C2)

AER evaluates requests using a deterministic dual-layer decision function:

The decision function *D*(*R*, *S*) evaluates across 4 deterministic branches:
- ***D*(*R*, *S*) = AUTO_APPROVE**: when *V*<sub>doc</sub>(*R*) = 1 ∧ RequestedDays(*R*) ≤ RemainingQuota(*S*) ∧ Authority(*R*) ≤ LineManager ∧ IsProbation(*S*) = False
- ***D*(*R*, *S*) = ESCALATE(*U*₁)**: when *V*<sub>doc</sub>(*R*) = 0 (Illegible medical note or missing Form C65-HD)
- ***D*(*R*, *S*) = ESCALATE(*U*₂)**: when IsProbation(*S*) = True ∨ (PersonalLeave(*R*) ∧ MissingProof(*R*))
- ***D*(*R*, *S*) = ESCALATE(*U*₃)**: when UnpaidDays > 5 ∨ LongTermDays ≥ 20 ∨ ConsecutiveAnnualLeave > 5 days

Where *R* is the leave request payload, *S* is the employee profile state, and *V*<sub>doc</sub>(*R*) is the visual certificate validity indicator.

## 3.3 Document Visual Validator and Stamp Verification

The document verification component validates 3 invariant visual features on uploaded certificates:

> *V*<sub>doc</sub>(*R*) = **I**(has_red_stamp = True) × **I**(has_doctor_signature = True) × **I**(date_clarity = CLEAR)

If any indicator evaluates to False, *V*<sub>doc</sub>(*R*) = 0, deterministically triggering an escalation to *U*₁ (Data Ambiguity).

## 3.4 Dynamic Leave Quota and Probation Constraint Dynamics (C5)

The engine computes remaining leave quota and verifies probationary eligibility:

> *A*<sub>new</sub>(*R*, *S*) = *Quota*<sub>current</sub>(*S*) - *Days*<sub>requested</sub>(*R*)

Attendance risk tiers are assigned deterministically:
> **Tier**(*A*<sub>new</sub>) =
> - **SAFE (Green)**: *A*<sub>new</sub> ≥ 0 ∧ *Days*<sub>requested</sub> ≤ 5 ∧ IsProbation = False
> - **EARLY_WARNING (Amber)**: IsProbation = True ∨ *A*<sub>new</sub> < 0
> - **BREACH (Red/Purple)**: *Days*<sub>requested</sub> > 5 ∨ LeaveType = UNPAID_LONG_TERM *(Article 18 Trigger)*

## 3.5 Single-Turn Closed Escalation Synthesis (C3)

When *D*(*R*, *S*) = ESCALATE(*U*<sub>*k*</sub>), AER executes closed question synthesis:

> **Prompt**(*R*, *S*) = **G**(EmployeeID, Department, *Days*<sub>requested</sub>, LeaveType, PolicyCitation(*U*<sub>*k*</sub>))

The prompt presents exactly two definitive actions:
- Action 0: *Reject per Regulation* → Dispatches formal rejection notice citing Article Y.
- Action 1: *Grant Exception / Convert to Unpaid* → Logs managerial policy exception with full audit trace.

## 3.6 Cryptographic Audit Ledger and State Rollback (C4)

Every state change appends an immutable event *T*<sub>*i*</sub> to the audit ledger:

> *T*<sub>*i*</sub> = ⟨ Timestamp, RequestID, Actor, State<sub>old</sub>, State<sub>new</sub>, RuleID, *H*<sub>*i*</sub> ⟩

Where the cryptographic link hash *H*<sub>*i*</sub> is defined as:

> *H*<sub>*i*</sub> = SHA-256( *H*<sub>*i*-1</sub> || RequestID || State<sub>new</sub> || Timestamp )

---

# 4. API Surface and Data Contracts

## 4.1 Endpoint Specifications

| HTTP Method & Path | Authentication | Request Payload | Response Object | Functionality |
| :--- | :--- | :--- | :--- | :--- |
| `POST /api/v1/verify` | None (Public) | Test suite ID / Empty | `VerifyReport` | Executes benchmark test runner; returns latency & pass status |
| `POST /api/v1/evaluate` | Session token | `EmployeeLeaveRequest` | `EvaluationResponse` | Evaluates leave request; returns auto-approval or escalation prompt |
| `POST /api/v1/override` | Manager / HR | `OverrideDirective` | `AuditRecord` | Executes human override; rolls back state and recalculates quota |
| `GET /api/v1/policy` | Public | None | `PolicyDocument` | Returns codified text of Corporate Leave Regulation No. 18/2024/QC-NS |

## 4.2 JSON Payload Schemas

### Evaluation Request and Response Contract

```json
// POST /api/v1/evaluate - Request
{
  "request_id": "REQ-HR-2026-0012",
  "employee_id": "NV-2024-0312",
  "employee_name": "Nguyen Thi Huong",
  "department": "Sales Department",
  "leave_type": "ANNUAL_LEAVE",
  "days_requested": 1,
  "remaining_leave_balance": 4,
  "is_probation": false,
  "from_date": "2025-10-15",
  "to_date": "2025-10-15",
  "evidence": {
    "has_attachment": true,
    "attachment_type": "NONE",
    "has_red_stamp": true,
    "has_doctor_signature": true,
    "visual_quality": "CLEAR"
  }
}

// POST /api/v1/evaluate - Response
{
  "decision_id": "DEC-HR-1741234567-890",
  "outcome": "AUTO_APPROVE",
  "policy_basis": "Article 10.1 Corporate Regulation — Valid annual leave request within quota.",
  "confidence_score": 1.0,
  "model_used": "Deterministic Rules Engine",
  "latency_ms": 2.1,
  "timestamp": "2026-09-16T08:00:00.000Z"
}
```

---

# 5. Prompt Engineering, Guardrails and Tool Contracts

## 5.1 Cognitive Reasoning Core

AER integrates a constrained system prompt enforcing single-turn actionable outputs.

## 5.2 Closed Tool Contracts

| Tool Function | Deterministic Contract Specification |
| :--- | :--- |
| `check_policy_rules()` | Evaluates leave balance and probation flags; returns boolean |
| `verify_document_vlm()` | Validates circular clinic seal and signature; returns 1 or 0 |
| `triage_uncertainty()` | Classifies into U1, U2, or U3 based on orthogonal failure |
| `synthesize_prompt()` | Injects parameters into closed single-turn prompt template |
| `append_audit_log()` | Computes SHA-256 hash and appends event to audit store |

## 5.3 Grounded Regulatory Enforcement

All citations are strictly mapped to an immutable regulatory gazetteer compiled from official labor regulations.

## 5.4 System Prompt and Guardrails

1. *Never issue an AUTO_APPROVED decision on probation employee paid leave requests.*
2. *Never guess or impute missing dates from blurred medical certificates.*
3. *Never allow line manager approval on unpaid leave exceeding 5 business days.*
4. *Always quote Article 14 when generating escalation prompts for missing Form C65-HD.*
5. *Always maintain append-only audit trail logging for every evaluation step.*

---

# 6. Verification and Empirical Reproducibility

## 6.1 The Reproduction Package and Test Runner

The reproduction suite is executable directly in-browser or via the command line:

```bash
npm run build
```

*Table 10: Benchmark test results across enterprise test suite.*

| Test ID | Test Category | Target Invariant | Measured Latency | Result |
| :---: | :--- | :--- | :---: | :---: |
| **TC-HR-01** | Fast-path Routine Approval | Quota ≤ Balance ∧ Valid ⇒ AUTO_APPROVED | 2.1 ms | **PASS** |
| **TC-HR-02** | Special Marriage Leave | Art. 15 Proof ∧ Days ≤ 3 ⇒ AUTO_APPROVED | 2.4 ms | **PASS** |
| **TC-HR-03** | Routine Sick Leave | Discharge Note ∧ Valid Seal ⇒ AUTO_APPROVED | 2.8 ms | **PASS** |
| **TC-HR-04** | Missing Statutory C65-HD | Missing C65-HD ⇒ ESCALATE(U1) | 3.2 ms | **PASS** |
| **TC-HR-05** | Authority Multi-Tier Lock | Days = 20 ≥ 20 ⇒ ESCALATE(U3) | 2.9 ms | **PASS** |
| **TC-HR-06** | Probation Constraint | IsProbation = True ⇒ ESCALATE(U2) | 3.1 ms | **PASS** |

## 6.2 Adversarial Probing and Stress Testing

- **Adversarial Input 1 (Claiming paid leave during probation)**: Correctly flagged as $U_2$ (Policy Conflict).
- **Adversarial Input 2 (Prompt injection in reason box)**: Deterministic rule engine ignored free text payload; enforced statutory absence boundaries.

---

# 7. Known Limits and Boundary Conditions

1. **OCR Performance on Extreme Degradation**: Mobile captures with severe motion blur or low lighting (< 50 lux) are safely rejected to $U_1$ rather than parsed.
2. **Offline Fallback**: In-browser client executes on cached employee quota snapshots and synchronizes upon reconnection.
3. **Forensic Digital Forgery**: Deep digital forgery detection requires centralized integration with the National Social Security database.
