# PART II: SYSTEM ARCHITECTURE & TECHNICAL CONTRIBUTIONS

## 5. High-Level Architecture and Closed Dataflow

### 5.1 4-Tier Architectural Topology

AER is engineered with a strict 4-tier separation of concerns:

1. **Tier 1 — Multi-Role Interface Layer**:
   - *Applicant Portal*: Employee folder packaging interface for PDF leave applications (`BM-HR-01`) and medical attachments.
   - *Reviewer Portal*: Managerial dashboard featuring laser VLM visual inspection and single-turn decision prompts.
   - *Verify Harness*: Comprehensive benchmark test runner executing standardized test suites with live latency tracking.
2. **Tier 2 — Deterministic Rules & VLM Inspection Engine**:
   - *Edge VLM (`qwen3-vl:4b`)*: Detects circular hospital stamps, doctor signatures, and treatment date legibility.
   - *Deterministic Rule Guardrails*: Evaluates leave quotas, probation constraints, and authority boundaries in < 5ms.
3. **Tier 3 — Cognitive Local LLM Referee**:
   - Synthesizes actionable, closed single-turn prompts upon detecting categorized uncertainty.
4. **Tier 4 — Cryptographic Audit & Rollback Ledger**:
   - Implements immutable SHA-256 state hashing and sub-second optimistic rollbacks.

### 5.2 Closed Request Lifecycle

> **Employee Packages Folder (`BM-HR-01` + Proof)** → **VLM Scan & Deterministic Rule Engine** → **Uncertainty Space Evaluation (*U*<sub>Enterprise</sub>)**
> - **Routine Case (*U* = ∅)** → Deterministic Fast-Path Auto-Approval (`AUTO_APPROVE`) in < 10ms.
> - **Flagged Risk (*U* ≠ ∅)** → Synthesizes Single-Turn Closed Prompt to Line Manager or HR Director.

![Figure 1: AER Runtime Topology and Decision Pipeline](assets/system_topology_en.svg)

---

## 6. Scientific and Engineering Contributions (C1 – C6)

### 6.1 Contribution C1: 3D Enterprise Uncertainty Space (U_Enterprise)

Traditional agents collapse uncertainty into an undifferentiated scalar *p* ∈ [0, 1]. In enterprise governance, this fails because the root cause of uncertainty determines **who has the statutory authority to act**.

AER introduces an orthogonal 3-dimensional uncertainty decomposition:

> *U*<sub>Enterprise</sub> = ⟨ *U*<sub>data</sub>, *U*<sub>policy</sub>, *U*<sub>auth</sub> ⟩

- **Dimension U₁ — Data Ambiguity (U_data)**: Missing or degraded inputs (e.g., blurry medical note, missing statutory Form C65-HD per Article 14.3). Action: *Request physical C65-HD delivery within 3 business days*.
- **Dimension U₂ — Policy Conflict (U_policy)**: Clear data conflicting with regulations (e.g., probationary employee requesting paid leave per Article 8.2, or personal leave without proof per Article 15). Action: *Escalate to Line Manager for unpaid leave conversion or rejection*.
- **Dimension U₃ — Authority Breach (U_auth)**: Request exceeds line manager jurisdiction (e.g., unpaid leave > 5 days per Article 18.1, or long-term leave ≥ 20 days per Article 18.3). Action: *Lock line manager approval and route to HR Director / Executive*.

![Figure 2: 3-Dimensional Enterprise Uncertainty Space](assets/uncertainty_space_en.svg)

### 6.2 Contribution C2: Dual Decision Function with Grounded Fallback

AER formalizes decision evaluation as a deterministic dual function:

![Figure 3: Deterministic Finite State Machine and Lifecycle Transitions](assets/state_machine_en.svg)

The decision function *D*(*R*, *S*) evaluates across 4 deterministic branches:
- ***D*(*R*, *S*) = AUTO_APPROVE**: when *V*<sub>doc</sub>(*R*) = 1 ∧ RequestedDays(*R*) ≤ RemainingQuota(*S*) ∧ Authority(*R*) ≤ LineManager ∧ IsProbation(*S*) = False
- ***D*(*R*, *S*) = ESCALATE(*U*₁)**: when *V*<sub>doc</sub>(*R*) = 0 (Degraded note or missing Form C65-HD)
- ***D*(*R*, *S*) = ESCALATE(*U*₂)**: when IsProbation(*S*) = True ∨ (PersonalLeave(*R*) ∧ MissingProof(*R*))
- ***D*(*R*, *S*) = ESCALATE(*U*₃)**: when UnpaidDays > 5 ∨ LongTermDays ≥ 20 ∨ ConsecutiveAnnualLeave > 5 days

Where *R* is the leave request payload, *S* is the employee profile state, and *V*<sub>doc</sub>(*R*) is the visual certificate validity indicator.

### 6.3 Contribution C3: Single-Turn Actionable Question Synthesis

When escalated, AER synthesizes structured, closed single-turn prompts:
1. **Extract Core Factors**: Employee name, department, leave type, requested days, leave balance, and governing policy citation.
2. **Synthesize Closed Question**: *"Employee [Name] ([Dept]) requests [X] days [Type], [Violation citation]. Does the manager grant unpaid leave or reject per Article Y?"*
3. **Present Exactly 2 Decisive Actions**:
   - Action 0: *Reject per Regulation* → Emits formal notice with regulatory citation.
   - Action 1: *Grant Exception / Convert to Unpaid* → Logs policy waiver with full audit trail.

This eliminates back-and-forth emails, reducing human review latency from 3 minutes to **under 15 seconds**.

### 6.4 Contribution C4: Optimistic Rollback & SHA-256 Audit Trail

To eliminate managerial automation anxiety, AER provides instant state reversal:
- Every state transition appends an immutable event *T*<sub>*i*</sub>:

> *T*<sub>*i*</sub> = ⟨ Timestamp, RequestID, Actor, OldState, NewState, PolicyCitation, SHA-256 Hash ⟩

- If a manager detects retroactive medical fraud, clicking [Undo] immediately revokes approval and recalculates leave balances in **0.1 seconds**.

### 6.5 Contribution C5: Live Leave Quota Dynamic Gauge

AER provides live interactive leave quota visualization:
- Real-time simulation of remaining annual leave balance upon date selection.
- Clear 3-tier risk coloring: **Green** (Safe quota ≤ 5 days), **Amber** (Probation / low balance warning), **Red/Purple** (Exceeds authority / requires HRD approval).

### 6.6 Contribution C6: State-Independent Verification Protocol

AER includes an independent verification harness evaluating canonical test suites with 100% test reproducibility and zero state bleed between runs.
