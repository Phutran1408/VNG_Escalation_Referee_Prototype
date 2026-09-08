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

---

## 💻 2. ĐẶC TẢ THAO TÁC TRÊN LAPTOP / DESKTOP (LAPTOP WORKSPACE INTERACTION)

### 👤 Role 1: Cấp Dưới / Người Làm Đơn (Applicant Portal — Sinh Viên / Nhân Viên)
> **Nguyên tắc**: *Laptop Web Portal · Upload-only · Privacy Isolation (Không thấy hồ sơ người khác).*

- **Thao tác trên Laptop (Keyboard + Mouse/Trackpad Workflow)**:
  1. **Nhập liệu nhanh (Tab & Keyboard Navigation)**:
     - Nhập họ tên (`Lê Thị Phương` / `Nguyễn Văn An`), Mã số (`NV-1981-0592` / `SV-2024-1001`), Khoa/Phòng ban.
     - Chọn loại đơn (`Nghỉ ốm BHXH` / `Nghỉ phép năm` / `Bảo lưu học kỳ`) & mốc ngày bằng bộ chọn lịch trên Desktop.
  2. **Kéo thả chuột (Drag & Drop Zone 1) — Tệp Đơn PDF Bắt Buộc**:
     - Kéo thả file PDF đơn chuẩn (`BM-HR-01` / `BM-DT-02`) từ File Explorer / Finder vào vùng thả chuột có viền nét đứt.
  3. **Kéo thả chuột (Drag & Drop Zone 2) — Multi-file Evidence Attachments**:
     - Kéo thả đồng thời nhiều tệp ảnh chứng từ y tế (`.jpg`, `.png`), giấy ra viện, giấy chứng nhận BHXH (Mẫu CT07).
  4. **Tự động đóng gói thư mục (Automatic Folder Packaging)**:
     - Trình duyệt đóng gói thành folder: `case_<id>_<tên>/` chứa đúng 1 PDF đơn + n file chứng từ.
  5. **Bấm nộp (1-Click Submit)**:
     - Click nút **`Nộp Hồ Sơ Lên Hệ Thống`** $\rightarrow$ Nhận mã tiếp nhận, thông báo phân quyền bảo mật riêng tư, hồ sơ tự động chuyển vào hàng đợi cấp trên.

---

### 🛡️ Role 2: Cấp Trên / Người Phê Duyệt (Reviewer Portal — Trưởng Khoa / HR / Ban Đào Tạo)
> **Nguyên tắc**: *Full Dossier Transparency · Side-by-Side Dual Column · One-Click AI Inspection.*

- **Thao tác trên Laptop (High-productivity Reviewer Cockpit)**:
  1. **Hàng đợi hồ sơ (Pending Queue - Cột Trái)**:
     - Danh sách thư mục chờ duyệt, hiển thị huy hiệu: `Chưa Check` | `✓ Hợp lệ` | `⚠️ Cần Escalate`.
     - Click chọn từng ca để xem chi tiết hoặc bấm nút **`⚡⚡ Agent Check All`** trên thanh công cụ để quét toàn bộ hàng đợi.
  2. **Đối soát song song trên màn hình rộng Laptop (Side-by-side Dual Column)**:
     - **Cột Trái (Đơn PDF Gốc)**: Hiển thị trích xuất OCR văn bản (Họ tên, Mã số, Loại nghỉ, Mốc thời gian, Lý do). Nút mở file PDF gốc tab mới.
     - **Cột Phải (Thị Giác AI - Live VLM Inspector)**:
       - Hiển thị bản xem trước ảnh chứng từ y tế gốc (hỗ trợ zoom chuột).
       - **Huy hiệu thị giác AI (AI Vision Badges)**:
         - 🔴 Con dấu đỏ: `✓ CÓ MỘC ĐỎ` (Trạm y tế / Bệnh viện) hoặc `✕ Không phát hiện`.
         - ✍️ Chữ ký bác sĩ: `✓ CÓ CHỮ KÝ` (Tên bác sĩ Khương Linh Nhi) hoặc `✕ Không phát hiện`.
       - **Bóc tách văn bản OCR từ ảnh**: Trích xuất chẩn đoán bệnh (`B34.2 SARS-CoV-2`), số ngày nghỉ chỉ định (`10 ngày`), cơ sở y tế cấp.
  3. **Hộp phán quyết của AI Referee (Decision Box)**:
     - Nếu hồ sơ đủ điều kiện $\rightarrow$ **`✓ ĐỦ ĐIỀU KIỆN TỰ ĐỘNG PHÊ DUYỆT (AUTO_APPROVE)`** (Độ trễ $\le 6\text{ms}$).
     - Nếu phát sinh bất định $\rightarrow$ **`⚠️ KÍCH HOẠT ĐIỂM DỪNG (ESCALATE)`** với 3 nhóm dừng:
       - **Dừng 1 (Không chắc dữ kiện)**: Ảnh mờ ngày $\rightarrow$ Câu hỏi: *"Bổ sung chứng từ gốc trong 24h hay từ chối đơn?"*
       - **Dừng 2 (Ngoài chính sách)**: Vắng $>20\%$ $\rightarrow$ Câu hỏi: *"Vượt trần quy định 20%, có duyệt đặc cách ngoại lệ không?"*
       - **Dừng 3 (Vượt thẩm quyền)**: Bảo lưu cả kỳ $\rightarrow$ Câu hỏi: *"Vượt thẩm quyền cấp cơ sở. Chuyển cấp trên phê chuẩn?"*
  4. **Quyền quyết định tối cao (Human Override / Approval)**:
     - Click nút **`✍️ Ký Duyệt Phê Chuẩn`** hoặc **`✕ Từ Chối Đơn`**.
     - Ghi nhận Audit Trail bất biến lưu vết kiểm toán (Thời gian, ID người duyệt, Căn cứ pháp lý).

---

### 🧪 Role 3: Giám Khảo Kiểm Chứng (Verify Harness Dashboard)
- **Kiểm chứng hàng loạt**: Bấm **`▶ Chạy Kiểm Chứng Hàng Loạt`** (5 ca chuẩn / 16 ca toàn diện) $\rightarrow$ `100% Pass Rate`, `0% Over-escalation`.
- **Khu vực Giám khảo tự nhập (Interactive Judge Playground)**: Tự do nhập mọi tình huống để thử thách AI phân xử thời gian thực.
- **Phép "vặn nút" tự kiểm chứng**: 3 nút chuyển nhanh dữ liệu để kiểm chứng tính phi-cài-đặt (không hardcode).
- **Xuất minh chứng JSON**: 1-click tải toàn bộ log phán quyết phục vụ hội đồng chấm thi.

---

## 🎬 3. SƯỜN PHÂN CẢNH PRODUCT SHOWCASE FILM (LAPTOP WORKSPACE EDITION)
*Thời lượng điều chỉnh thư thái (nhịp độ vừa vặn, tăng từ ~40s lên ~70s để người xem đọc rõ chữ và quan sát chuyển động chuột trên Laptop):*

| Scene | Tên Phân Cảnh | Thời lượng (ms) | Visual & Laptop Motion Concept | Key Text / Words Hiển Thị |
| :---: | :--- | :---: | :--- | :--- |
| **S0A** | **The Hook** | 3,200ms | Chữ typographic khổng lồ lướt chậm, trang trọng trên nền tối sâu | `Absences.` `Leaves.` `Approvals.` |
| **S0B** | **The Pain** | 3,200ms | Hiệu ứng cảnh báo đỏ, nguy cơ tắc nghẽn và rủi ro duyệt mù | `High volume.` `Manual triage.` `Blind risks.` |
| **S1** | **The Reveal** | 4,500ms | Logo 4 vạch ánh sáng + Khối typographic hổ phách nhận diện thương hiệu | `THE ESCALATION REFEREE` · *Smart stops. Zero over-escalation.* |
| **S2** | **The Problem** | 4,200ms | Con trỏ soạn thảo gõ chậm từng chữ, gạch chân quy chế thẩm định | `Every leave request carries uncertainty.` |
| **S3** | **Applicant Laptop** | 5,500ms | **Màn hình Laptop nghiêng 3D**: Cổng nộp đơn, chuột kéo thả 1 PDF + ảnh minh chứng | `Folder Package.` `1 PDF Form + Evidences.` `Drag & Drop Upload.` |
| **S3B** | **Folder Ingestion**| 5,000ms | Laser quét bóc tách từng tầng dữ liệu trong thư mục nộp | `Packaging.` `OCR Ingestion.` `Local VLM Staging.` |
| **S4** | **VLM Inspection** | 5,500ms | Zoom cận cảnh mộc đỏ và chữ ký bác sĩ được nhận diện tự động | `Red Stamp Verified.` `Doctor Signature Detected.` `Diagnosis Extracted.` |
| **S5** | **Reviewer Cockpit**| 5,500ms | **Laptop Cấp Trên**: Bố cục 2 cột song song Đơn PDF $\leftrightarrow$ VLM Bằng chứng | `Side-by-Side Review.` `Pending Queue.` `Instant Cross-Check.` |
| **S6** | **Agent Check (6ms)**| 6,000ms | Chuột click **⚡ Agent Check**, thanh tiến trình nhảy tức thì 5.8ms | `⚡ Agent Check.` `5.8ms Latency.` `100% Local Inference.` |
| **S7** | **The 3 Smart Stops** | 6,500ms | 3 thẻ nổi ba chiều tượng trưng cho 3 loại dừng bắt buộc | `1. Fact Uncertainty` `2. Policy Edge` `3. Authority Cap` |
| **S8** | **Single-Turn Action**| 5,500ms | Hộp câu hỏi hành động 1 lượt, chuột hover nút Ký Duyệt Phê Chuẩn | `One-Turn Actionable.` `Human Override.` `Audit Trail Logged.` |
| **S9B** | **Multi-Domain** | 4,500ms | 3 dòng chữ lướt lên: thích ứng linh hoạt giữa Nhà trường & Doanh nghiệp | `Enterprise HR Leaves,` `University Absences,` `Medical BHXH Claims.` |
| **S9C** | **Climax & Call** | 5,000ms | Khẳng định loại bỏ 100% rủi ro duyệt mù, nút Run Verify Harness | `Zero Blind Risk.` `Zero Over-escalation.` `16/16 Pass Rate.` |
| **S10** | **End Card** | 5,000ms | Khung Laptop mở rộng toàn màn hình, logo & nút Replay tinh tế | `The Escalation Referee.` `Spec A · OrganizationAI.` |
