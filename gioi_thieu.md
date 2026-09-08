# 🎯 TÀI LIỆU ĐẶC TẢ GIỚI THIỆU SẢN PHẨM: THE ESCALATION REFEREE
### *Spec A — OrganizationAI · AI Phân Xử & Điểm Dừng Thông Minh Trong Thẩm Định Đơn*
*Thiết kế chuẩn hóa trải nghiệm Web App trên Laptop / Desktop Workspace*

---

## ⚡ 1. KEYWORDS CỐT LÕI (CORE KEYWORDS)
- **Hệ thống**: `The Escalation Referee` · `Spec A` · `Bảng 1 OrganizationAI`.
- **Bài toán**: `Leave Approval` · `Human-in-the-Loop` · `Smart Escalation` · `Zero Over-escalation`.
- **Kiến trúc**: `Hybrid 2-Tier Engine` · `Local Deterministic Guardrails (<= 6ms)` · `Local VLM & LLM (Qwen3-VL 4B)`.
- **Quy chuẩn hồ sơ**: `Case Folder Per Applicant` · `1 PDF Form` + `Medical Evidences (.jpg / .pdf)`.
- **3 Điểm dừng chuẩn**: `Fact Uncertainty` (Dữ liệu mờ/thiếu) · `Policy Edge` (Vượt 20% học phần/chính sách) · `Authority Cap` (Bảo lưu/Vượt thẩm quyền).
- **Hành động & Phân xử**: `Auto-Approve` · `Single-Turn Actionable Escalation` · `Human Override Audit Trail`.
- **Nền tảng vận hành**: `Laptop Web Workspace` · `Trackpad & Mouse Precision` · `Multi-column Side-by-Side Inspection`.
- **Thị giác AI & Đối soát**: `Qwen3-VL 4B Laser Beam Scan` · `Dynamic Bounding Boxes` · `Animated Link-Lines Cross-Check` · `Wait! Something is wrong... Interruption Alert`.

---

## 💻 2. ĐẶC TẢ THAO TÁC TRÊN LAPTOP / DESKTOP (LAPTOP WORKSPACE INTERACTION)

### 👤 Role 1: Cấp Dưới / Người Làm Đơn (Applicant Portal — Sinh Viên / Nhân Viên)
> **Nguyên tắc**: *Laptop Web Portal · Upload-only · Privacy Isolation (Không thấy hồ sơ người khác).*

- **Thao tác trên Laptop (Keyboard + Mouse/Trackpad Workflow)**:
  1. **Nhập liệu biểu mẫu (Form Inputs)**:
     - Nhập họ tên (`Lê Thị Phương` / `Nguyễn Văn An`), Mã số (`NV-1981-0592` / `SV-2024-1001`), Khoa/Phòng ban.
     - Chọn loại đơn (`Nghỉ ốm BHXH` / `Nghỉ phép năm` / `Bảo lưu học kỳ`) & mốc ngày bằng bộ chọn lịch trên Desktop.
  2. **Kéo thả chuột (Drag & Drop Zone 1) — Tệp Đơn PDF Bắt Buộc**:
     - Kéo thả file PDF đơn chuẩn (`BM-HR-01` / `BM-DT-02`) từ File Explorer / Finder vào vùng thả chuột có viền nét đứt $\rightarrow$ Hiện chip tệp đính kèm.
  3. **Kéo thả chuột (Drag & Drop Zone 2) — Multi-file Evidence Attachments**:
     - Kéo thả ảnh chứng từ y tế (`.jpg`, `.png`), giấy ra viện, giấy chứng nhận BHXH (Mẫu CT07).
  4. **Tự động đóng gói thư mục (Automatic Folder Packaging)**:
     - Trình duyệt tự động tạo cây thư mục: `case_<id>_<tên>/` chứa đúng 1 PDF đơn + n file ảnh minh chứng.
  5. **Bấm nộp (1-Click Submit)**:
     - Click nút **`Nộp Hồ Sơ Lên Hệ Thống`** $\rightarrow$ Nhận mã tiếp nhận, thông báo phân quyền bảo mật riêng tư, hồ sơ tự động chuyển vào hàng đợi cấp trên.

---

### 🛡️ Role 2: Cấp Trên / Người Phê Duyệt (Reviewer Portal — Trưởng Khoa / HR / Ban Đào Tạo)
> **Nguyên tắc**: *Full Dossier Transparency · Side-by-Side Dual Column · One-Click AI Inspection.*

- **Thao tác trên Laptop (High-productivity Reviewer Cockpit)**:
  1. **Hàng đợi hồ sơ (Pending Queue - Cột Trái)**:
     - Danh sách thư mục chờ duyệt, hiển thị huy hiệu: `Chưa Check` | `✓ Hợp lệ` | `⚠️ Cần Escalate`.
     - Click chọn từng ca để xem chi tiết hoặc bấm nút **`⚡⚡ Agent Check All`** trên thanh công cụ để quét toàn bộ hàng đợi.
  2. **Hiệu ứng Quét VLM Laser (Qwen3-VL 4B Deep Vision Scan)**:
     - Chùm laser xanh quét dọc ảnh chứng từ y tế từ trên xuống dưới.
     - Tự động đóng các khung Bounding Box:
       - 🔴 Bounding Box đỏ: `[DETECTED: RED STAMP - Trạm Y Tế Hòa Cường Nam]`
       - ✍️ Bounding Box xanh: `[DETECTED: SIGNATURE - BS. Khương Linh Nhi]`
       - 📅 Bounding Box cam: `[OCR: 10 NGÀY NGHỈ - SARS-CoV-2]`
  3. **Hiệu ứng Đường Nối Đối Soát Logic (Interactive Link-Lines Cross-Check)**:
     - Các tia sáng liên kết (SVG glowing connector lines) bắn từ các ô Bounding Box của ảnh bằng chứng sang thẳng các trường tương ứng trên Đơn PDF gốc để đối soát (Họ tên $\rightarrow$ Họ tên, 10 ngày $\rightarrow$ 10 ngày).
     - Đối soát hoàn tất $\rightarrow$ Hiện huy hiệu xanh phát sáng: `✓ VERIFIED MATCH (100% VALID)`.
  4. **Điểm Dừng Đột Xuất: "Wait! Something's wrong..." (Human Escalation Trigger)**:
     - Khi gặp hồ sơ bất thường (Vắng quá 20% hoặc Đơn bảo lưu cả kỳ):
     - Màn hình chuyển hiệu ứng cảnh báo giật nhịp hổ phách/đỏ: `"Wait! Something's wrong..."`
     - Cảnh báo vi phạm: *"Hồ sơ bảo lưu cả học kỳ vượt thẩm quyền Giảng viên (Điều 3.2 Quy chế Đào tạo)!"*
     - Hệ thống kích hoạt điểm dừng thông minh (`Smart Stop: Authority Cap`), sinh câu hỏi phân xử 1 lượt chuyển cấp trên: *"Chuyển hồ sơ lên Trưởng khoa / Phòng Đào tạo phê chuẩn?"*.
  5. **Quyền quyết định tối cao (Human Override / Approval)**:
     - Click nút **`✍️ Ký Duyệt Phê Chuẩn`** hoặc **`Chuyển Trưởng Khoa Phê Duyệt ↗`**.
     - Ghi nhận Audit Trail bất biến lưu vết kiểm toán (Thời gian, ID người duyệt, Căn cứ pháp lý).

---

### 🧪 Role 3: Giám Khảo Kiểm Chứng (Verify Harness Dashboard)
- **Kiểm chứng hàng loạt**: Bấm **`▶ Chạy Kiểm Chứng Hàng Loạt`** (5 ca chuẩn / 16 ca toàn diện) $\rightarrow$ `100% Pass Rate`, `0% Over-escalation`.
- **Khu vực Giám khảo tự nhập (Interactive Judge Playground)**: Tự do nhập mọi tình huống để thử thách AI phân xử thời gian thực.
- **Phép "vặn nút" tự kiểm chứng**: 3 nút chuyển nhanh dữ liệu để kiểm chứng tính phi-cài-đặt (không hardcode).
- **Xuất minh chứng JSON**: 1-click tải toàn bộ log phán quyết phục vụ hội đồng chấm thi.

---

## 🎬 3. SƯỜN PHÂN CẢNH PRODUCT SHOWCASE FILM (CINEMATIC LAPTOP EDITION)
*Tổng thời lượng: 80,000ms (~80 giây), bố cục nhịp nhàng, trực quan hóa chi tiết từng bước thẩm định:*

| Scene | Tên Phân Cảnh | Thời lượng (ms) | Visual & Laptop Motion Concept | Key Text / Words Hiển Thị |
| :---: | :--- | :---: | :--- | :--- |
| **S0A** | **The Hook** | 3,200ms | Chữ typographic khổng lồ lướt chậm, trang trọng trên nền tối sâu | `Absences.` `Leaves.` `Approvals.` |
| **S0B** | **The Pain** | 3,200ms | Hiệu ứng cảnh báo đỏ, nguy cơ tắc nghẽn và rủi ro duyệt mù | `High volume.` `Manual triage.` `Blind risks.` |
| **S1** | **The Reveal** | 4,500ms | Logo 4 vạch ánh sáng + Khối typographic hổ phách nhận diện thương hiệu | `THE ESCALATION REFEREE` · *Smart stops. Zero over-escalation.* |
| **S2** | **The Problem** | 4,200ms | Con trỏ soạn thảo gõ chậm từng chữ, gạch chân quy chế thẩm định | `Every leave request carries uncertainty.` |
| **S3** | **Applicant Upload** | 6,500ms | **Laptop Cổng Nộp Đơn**: Chuột kéo 1 PDF Form + ảnh chứng từ vào Dropzone, đóng gói cây thư mục | `Folder Package.` `1 PDF Form + Evidences.` `Drag & Drop Upload.` |
| **S3B** | **Folder Ingestion**| 5,500ms | Laser quét bóc tách từng tầng dữ liệu trong thư mục nộp | `Packaging.` `OCR Ingestion.` `Local VLM Staging.` |
| **S4** | **VLM Laser Scan** | 7,000ms | **Tia laser quét ảnh y tế**: Bounding Boxes phát hiện mộc đỏ + chữ ký bác sĩ Khương Linh Nhi | `Qwen3-VL 4B Vision.` `Red Stamp Verified.` `Doctor Signature Detected.` |
| **S5** | **Logic Link-Lines**| 6,500ms | **Tia sáng kết nối SVG**: Bắn từ bằng chứng y tế sang các ô tương ứng trên Đơn PDF đối soát | `Side-by-Side Cross-Check.` `Interactive Logic Links.` `✓ Verified Match.` |
| **S6** | **Stop Alert: Wait!**| 6,500ms | **Cảnh báo kịch tính**: "Wait! Something is wrong...", phát hiện đơn bảo lưu cả kỳ vượt thẩm quyền | `Wait! Something's wrong...` `Authority Cap Exceeded.` `Escalate to Dean.` |
| **S7** | **The 3 Smart Stops** | 6,500ms | 3 thẻ nổi ba chiều tượng trưng cho 3 loại dừng bắt buộc | `1. Fact Uncertainty` `2. Policy Edge` `3. Authority Cap` |
| **S8** | **Single-Turn Action**| 6,000ms | Hộp câu hỏi hành động 1 lượt, chuột click chuyển Trưởng khoa phê duyệt, lưu Audit Log | `One-Turn Actionable.` `Human Override.` `Audit Trail Logged.` |
| **S9B** | **Multi-Domain** | 4,500ms | 3 dòng chữ lướt lên: thích ứng linh hoạt giữa Nhà trường & Doanh nghiệp | `Enterprise HR Leaves,` `University Absences,` `Medical BHXH Claims.` |
| **S9C** | **Climax & Call** | 5,500ms | Khẳng định loại bỏ 100% rủi ro duyệt mù, nút Run Verify Harness | `Zero Blind Risk.` `Zero Over-escalation.` `16/16 Pass Rate.` |
| **S10** | **End Card** | 5,000ms | Khung Laptop mở rộng toàn màn hình, logo & nút Replay tinh tế | `The Escalation Referee.` `Spec A · OrganizationAI.` |
