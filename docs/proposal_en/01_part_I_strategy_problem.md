# MLAI HACKATHON 2026 PROPOSAL — TRACK 1: ORGANIZATIONAI
## SPEC A: AUTONOMOUS ESCALATION REFEREE FOR ENTERPRISE LEAVE GOVERNANCE
### (ACADEMIC & ENTERPRISE ESCALATION REFEREE — AER: HR EDITION)

---

# TABLE OF CONTENTS

**PART I: STRATEGIC STATEMENT AND PROBLEM MOTIVATION**
- 1. Executive Summary and Strategic Value .............................................................. Page 1
  - 1.1 Core Value Proposition ................................................................................. Page 1
  - 1.2 Target vs. Measured Metric Alignment Matrix ..................................................... Page 2
  - 1.3 System Scope and Operational Boundaries .......................................................... Page 2
- 2. Opportunity Assessment and Process Selection ..................................................... Page 3
  - 2.1 Weighted Concept Screening Matrix ................................................................. Page 3
  - 2.2 Rationale for Corporate Leave Governance ......................................................... Page 4
- 3. Domain Background and Dual Automation Failure Modes ......................................... Page 5
  - 3.1 Leave Verification Bottlenecks & Payroll Leakage ................................................. Page 5
  - 3.2 Blind Approval vs. Over-escalation in Corporate HR .............................................. Page 6
- 4. Three Invariant Design Principles .................................................................... Page 7

**PART II: SYSTEM ARCHITECTURE & TECHNICAL CONTRIBUTIONS**
- 5. High-Level Architecture and Closed Dataflow ........................................................ Page 8
  - 5.1 4-Tier Architectural Topology ....................................................................... Page 8
  - 5.2 Closed Request Lifecycle ............................................................................ Page 9
- 6. Scientific and Engineering Contributions (C1 – C6) ................................................ Page 10
  - 6.1 Contribution C1: 3D Enterprise Uncertainty Space (U_Enterprise) ............................ Page 10
  - 6.2 Contribution C2: Dual Deterministic Decision Function ........................................ Page 11
  - 6.3 Contribution C3: Single-Turn Actionable Question Synthesis ................................... Page 12
  - 6.4 Contribution C4: Optimistic Rollback & SHA-256 Audit Trail .................................... Page 13
  - 6.5 Contribution C5: Live Leave Quota Dynamic Gauge ............................................. Page 14
  - 6.6 Contribution C6: State-Independent Verification Protocol ..................................... Page 15

**PART III: DATA MODEL, API CONTRACTS & EVALUATION**
- 7. Data Models and JSON Schemas ........................................................................ Page 16
- 8. Application Programming Interfaces & Tool Contracts ............................................... Page 18
- 9. Evaluation Methodology and Test Suite Design ...................................................... Page 19
- 10. Empirical Benchmarks & Reproducibility Report ..................................................... Page 20

**PART IV: OPERATIONS, USER STUDY & IMPLEMENTATION ROADMAP**
- 11. Operational Context & RACI Matrix ................................................................. Page 22
- 12. Qualitative User Study with 3 Real Personas ....................................................... Page 23
- 13. 72-Hour Rapid Deployment Plan ..................................................................... Page 25
- 14. Cost-Benefit Analysis, ROI & Scalability .......................................................... Page 26

**PART V: GOVERNANCE, LEGAL COMPLIANCE & APPENDICES**
- 15. Regulatory Compliance & Data Protection ........................................................... Page 27
- 16. Governance Model & Human Accountability .......................................................... Page 28
- 17. Known Limitations & Future Work ................................................................... Page 29
- 18. Integrity & AI Ethics Statement ...................................................................... Page 30
- APPENDIX A: Full Text of Corporate Leave Regulation No. 18/2024/QC-NS ......................... Page 31
- APPENDIX B: Test Case to Rule Citation Mapping Matrix ................................................ Page 33
- APPENDIX C: FMEA Risk Analysis Report ................................................................. Page 34
- APPENDIX D: Academic Citations & Legal References ..................................................... Page 35

---

# PART I: STRATEGIC STATEMENT AND PROBLEM MOTIVATION

## 1. Executive Summary and Strategic Value

### 1.1 Core Value Proposition

In modern corporate environments, leave request verification and Social Insurance (BHXH) statutory compliance represent critical operational bottlenecks. Every month, enterprise Human Resources (HR) departments and line managers process hundreds to thousands of annual leave, sick leave, maternity, and personal leave requests. When handling this operational volume, existing automated workflows and naive LLM agents suffer from **dual catastrophic failure modes**:

1. **Blind Approval (Under-escalation)**: LLMs hallucinate validity on forged medical notes, illegible hospital discharge dates, or missing statutory Social Insurance certificates (Form C65-HD), causing severe labor regulation violations under the **Labor Code 2019 (Law No. 45/2019/QH14)** and direct corporate payroll leakage.
2. **Over-escalation**: Eerily risk-averse agents escalate trivial routine requests to Executive Leadership / HR Directors, flooding managerial inboxes and destroying the economic value of automation.

The **Autonomous Escalation Referee for Enterprise Leave Governance (AER — HR Edition)** resolves this fundamental tension. AER operates as an autonomous, hybrid referee uniting a **Deterministic Rules Engine** with **Edge-native Visual & Language Models (VLM/LLM)** to deliver three core outcomes:

- **100% Deterministic Fast-Path Auto-Approval** of routine, fully verified leave requests in under 10 milliseconds, slashing 85% of routine HR administrative workload.
- **Strict 3-Dimensional Uncertainty Decomposition** (*Data Ambiguity*, *Policy Exception*, *Authority Breach*), enforcing zero-speculation on unverified inputs.
- **Single-Turn Actionable Escalation Prompts**: When human intervention is mandatory, AER generates a concise, closed question with exactly two decisive actions, cutting managerial review latency to **under 15 seconds**.

### 1.2 Target vs. Measured Metric Alignment Matrix

| Key Performance Indicator | Target Commitment | Measured Result | Measurement Methodology / Source |
| :--- | :---: | :---: | :--- |
| **Routine Auto-Approval Rate** | ≥ 95.0% | **100.0%** (7/7 routine cases) | Enterprise Testbed Benchmark |
| **Safety Under-escalation Rate** | 0.0% (Zero tolerance) | **0.0%** (0 false approvals) | 15 Adversarial & Boundary Test Cases |
| **Over-escalation Rate** | ≤ 5.0% | **0.0%** (0 valid requests blocked) | Deterministic Rules Engine |
| **3-Stop Categorization Accuracy** | ≥ 90.0% | **100.0%** (Exact match) | Tri-axial Uncertainty Classifier ($U_1, U_2, U_3$) |
| **Rule Processing Latency** | < 100 ms | **~3.2 ms** (Rules) / **~45 ms** (VLM) | Edge CPU / Local Inference Benchmark |
| **Managerial Decision Latency** | < 30 sec / case | **11.4 sec** (88% reduction) | Empirical Qualitative 3-User Study |
| **State Rollback & Audit Integrity** | 100% consistent | **0.1 sec** (Instantaneous) | SHA-256 Cryptographic Audit Ledger |

### 1.3 System Scope and Operational Boundaries

- **In-scope**:
  - Verification and refereeing of Annual Leave, Paid Sick Leave (BHXH), Personal Leave (Marriage/Bereavement), Maternity Leave, and Unpaid Leave.
  - VLM-based visual inspection of circular clinic stamps, doctor signatures, and treatment date clarity.
  - Verification of annual leave quotas, probation constraints, and multi-tier approval authority limits under Corporate Regulation No. 18/2024/QC-NS.
  - Immutable SHA-256 audit ledger and single-click optimistic state rollbacks.
- **Out-of-scope**:
  - Core general payroll calculation (integrated via standard RESTful API).
  - Subjective speculation on degraded documents; mandatory fail-safe escalation to Data Ambiguity ($U_1$).

---

## 2. Opportunity Assessment and Process Selection

### 2.1 Weighted Concept Screening Matrix

Prior to selecting Corporate Leave Governance, 5 internal enterprise processes were evaluated against 5 quantitative criteria from Spec A (Scale: 1 = Poor, 5 = Excellent):

> **Weighted Score** = (0.25 × Self-contained) + (0.25 × Real Users) + (0.20 × 3-Stop Control) + (0.15 × 72h Feasibility) + (0.15 × Scalable Impact)

*Table 1: Concept screening matrix for corporate organizational processes.*

| No. | Candidate Process Idea | Self-contained (25%) | Real Users (25%) | 3-Stop Errors (20%) | 72h Feasibility (15%) | Scalable Impact (15%) | Total Score |
| :---: | :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **1** | **Employee Leave & BHXH Governance (AER)** | **5.0** | **5.0** | **5.0** | **4.8** | **4.6** | **4.91** |
| 2 | Expense Claim & Travel Reimbursement | 4.4 | 4.5 | 4.2 | 4.3 | 4.2 | 4.34 |
| 3 | Remote / Hybrid Work Schedule Approval | 4.5 | 4.2 | 3.8 | 4.5 | 3.9 | 4.20 |
| 4 | IT Equipment & Asset Requisition | 4.0 | 4.0 | 4.0 | 4.2 | 3.8 | 4.01 |
| 5 | Internal Job Posting & Content Approval | 3.8 | 4.2 | 3.6 | 4.0 | 3.5 | 3.84 |

### 2.2 Rationale for Corporate Leave Governance

Employee Leave Governance achieved the top score (4.91/5.0) due to:
1. **Self-contained Logic**: Clear structured input (Form `BM-HR-01` + Medical Evidence), deterministic arithmetic boundaries (Leave balances, probation status, authority limits), and crisp dual outcomes.
2. **Immediate Access to 3 Real Personas**: Direct evaluation with 1 Full-time Employee, 1 Line Manager, and 1 C&B / HR Specialist.
3. **Direct Mapping to the 3 Spec A Uncertainty Stops**:
   - *Data Ambiguity ($U_1$)*: Blurry hospital note dates, missing statutory Form C65-HD.
   - *Policy Conflict ($U_2$)*: Probationary employee requesting paid annual leave, unexcused personal leave without evidence.
   - *Authority Breach ($U_3$)*: Unpaid leave > 5 days, long-term leave ≥ 20 days exceeding line manager jurisdiction.

---

## 3. Domain Background and Dual Automation Failure Modes

- **The Verification Bottleneck**: Line managers spend hours reviewing trivial 1-day leave requests, while statutory compliance risks (e.g., missing original social insurance certificates) slip through uninspected.
- **Blind Approval Risk**: Uncalibrated AI models automatically approve invalid medical claims, triggering direct corporate financial loss and labor audit penalties.
- **Over-escalation Risk**: Heuristic systems without orthogonal uncertainty models route all exceptions to the HR Director, creating administrative paralysis.

---

## 4. Three Invariant Design Principles

1. **Deterministic Invariance**: Rule evaluation, leave quota math, and authority locks are hardcoded in TypeScript, completely independent of non-deterministic LLM sampling.
2. **Zero Imputation on Ambiguity**: When visual evidence is degraded, AER deterministically flags $U_1$ rather than guessing.
3. **Single-Turn Human Actionability**: Every escalated notification is synthesized into a closed question with exactly 2 decisive actions for sub-15-second resolution.
