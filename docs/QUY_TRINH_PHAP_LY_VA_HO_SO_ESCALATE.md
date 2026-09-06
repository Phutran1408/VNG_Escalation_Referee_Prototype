# QUY TRÌNH PHÁP LÝ & PHIẾU CHUYỂN TIẾP HỒ SƠ (ESCALATION DOSSIER)
**Hệ Thống Phân Xử Duyệt Nghỉ Phép Tự Động (Spec A Escalation Referee)**

---

## 1. Mục Đích & Ý Nghĩa Pháp Lý
Trong quy trình quản trị thực tế (cả Doanh nghiệp và Trường học):
- **Ca thường quy (Routine Cases)**: Nhân sự hoặc sinh viên nộp đơn chuẩn, đủ điều kiện, hồ sơ rõ ràng. AI Agent tự động thẩm định và phê duyệt tức thì theo khung ủy quyền (Automated Approval).
- **Ca bất định / Vượt thẩm quyền (Escalated Cases)**:
  - AI Agent **tuyệt đối không tự ý từ chối hay phê duyệt sai thẩm quyền**.
  - Thay vào đó, hệ thống lập tức đóng gói toàn bộ hồ sơ thành một **Phiếu Chuyển Tiếp Hồ Sơ (Legal Escalation Referral Dossier)** để trình lên đúng cấp có thẩm quyền (Trưởng phòng, Giám đốc Khối, Ban Giám Đốc hoặc Trưởng Khoa / Ban Đào Tạo).

---

## 2. Luồng Xử Lý Khép Kín: Từ Đơn Giấy / OCR đến Cấp Thẩm Quyền

```
┌────────────────────────┐
│  ĐƠN XIN NGHỈ CHUẨN    │ (BM-HR-01 / BM-DT-02)
│  (Bản giấy/Scan/PDF)   │ + Chứng từ y tế, C65-HD, ĐKKH, Cáo phó
└───────────┬────────────┘
            │
            ▼
┌────────────────────────┐
│  MÔ-ĐUN OCR TRÍCH XUẤT │ Tự động nhận diện: Họ tên, Mã NV/SV,
│  (Quick Data Extractor)│ Loại phép, Số ngày, Trạng thái chứng từ
└───────────┬────────────┘
            │
            ▼
┌────────────────────────┐
│   AI REFEREE ENGINE    │ Thẩm định đối chiếu với Quy chế
│  (Rules + Qwen 1.5B)   │ Kiểm tra 3 điều kiện: Thẩm quyền, Dữ kiện, Chính sách
└───────────┬────────────┘
            │
      ┌─────┴────────────────────────────────┐
      │                                      │
[Đủ điều kiện & Hợp lệ]               [Phát hiện Bất định / Vượt hạn mức]
      │                                      │
      ▼                                      ▼
┌────────────────────────┐       ┌─────────────────────────────────────┐
│  TỰ ĐỘNG PHÊ DUYỆT     │       │ PHIẾU CHUYỂN TIẾP TRÌNH KÝ          │
│  - Cấp mã phê duyệt    │       │ (LEGAL ESCALATION REFERRAL DOSSIER) │
│  - Ghi Audit Trail     │       │ 1. Đính kèm trích xuất đơn gốc      │
│  - Lưu kho lịch sử     │       │ 2. Căn cứ điều khoản Quy chế vi phạm│
└────────────────────────┘       │ 3. Cấp thẩm quyền thụ lý chỉ định   │
                                 │ 4. Câu hỏi AI đề xuất dứt khoát 1 lần│
                                 └──────────────────┬──────────────────┘
                                                    │
                                                    ▼
                                 ┌─────────────────────────────────────┐
                                 │ CẤP CÓ THẨM QUYỀN RA QUYẾT ĐỊNH     │
                                 │ (Ký duyệt ngoại lệ hoặc Từ chối)    │
                                 └─────────────────────────────────────┘
```

---

## 3. Cấu Trúc Phiếu Chuyển Tiếp Hồ Sơ (Escalation Dossier Template)

Một Phiếu Chuyển Tiếp hợp lệ bao gồm:
1. **Mã hồ sơ trình ký**: `HS-ESC-YYYYMMDD-XXXX`
2. **Đối tượng đề xuất**: Tên nhân sự / sinh viên, Đơn vị, Mã số định danh.
3. **Phân loại độ bất định**:
   - `Vượt thẩm quyền` (Authority Limit Exceeded)
   - `Không chắc dữ kiện` (Fact Uncertainty / Incomplete Documents)
   - `Ngoài chính sách` (Policy Non-compliance / Exception)
4. **Căn cứ Quy chế**: Viện dẫn chính xác điều, khoản quy chế hiện hành.
5. **Đề xuất của AI (Single-turn Actionable Question)**: Đúng 1 câu hỏi cụ thể đưa ra các phương án rõ ràng để người có thẩm quyền ký duyệt ngay trong 1 lượt làm việc.
