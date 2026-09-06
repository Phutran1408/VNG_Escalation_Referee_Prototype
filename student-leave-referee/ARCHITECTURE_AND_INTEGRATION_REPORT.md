# Architecture & Integration Report
## AI Escalation Referee — Spec A · Duyệt Đơn Xin Nghỉ Học Của Sinh Viên
### Tổ chức: Bảng 1 — OrganizationAI | Vai: SV2 — Lõi Agent & Decision Log

---

## 1. Bản đồ Thành phần Hệ thống (System Component Mapping)

```
student-leave-referee/
├── policy.md                            # Quy chế Đào tạo & Phân cấp thẩm quyền xử lý nghỉ học
├── README.md                            # Hướng dẫn chạy và giải thích vai SV2
├── ARCHITECTURE_AND_INTEGRATION_REPORT.md # Tài liệu kiến trúc và REST API contracts
├── index.html                           # HTML shell cho Vite
├── package.json                         # Scripts và dependencies (React 19, Vite, Tailwind v4)
├── vite.config.ts                       # Cấu hình Vite & Tailwind plugin
└── src/
    ├── main.tsx                         # Entrypoint React 19; mount App vào #root
    ├── index.css                        # Tailwind CSS v4 và styles badges
    ├── App.tsx                          # Root component; Form nộp đơn sinh viên kèm 4 Quick Presets
    ├── components/
    │   ├── Header.tsx                   # Banner nhận diện bài toán học đường, chỉ số thống kê SV2
    │   ├── VerifyHarness.tsx            # Trình kiểm thử 5 ca chuẩn (3 thường quy, 2 dừng)
    │   └── AuditTrail.tsx               # Nhật ký quyết định (Decision Log), hỗ trợ Giảng viên override
    ├── services/
    │   └── api.ts                       # REST API client (8s timeout, AbortController) + mock fallback
    ├── types/
    │   └── index.ts                     # Schema DTOs (MSSV, Môn học, Số buổi vắng, 3 loại dừng)
    └── data/
        └── mockTestCases.ts             # Lõi Agent SV2 + 5 ca kiểm thử chuẩn học đường
```

---

## 2. Thiết kế Lõi Agent SV2 (The Referee Engine)

### 3 Loại Dừng Bất Định & Câu Hỏi Escalate Cụ Thể (Single-Turn Actionable)

| Loại dừng | Hiện tượng kích hoạt | Câu hỏi Escalate cho Giảng viên / Trưởng khoa | Căn cứ Quy chế |
| :--- | :--- | :--- | :--- |
| **Không chắc dữ kiện** | Giấy khám bệnh không đọc được ngày (chụp mờ, mất góc, thiếu ngày khám) | *"Giấy khám bệnh không đọc được ngày: Sinh viên xin nghỉ từ ngày nào?"* | Điều 2.2 Quy chế Đào tạo |
| **Ngoài chính sách** | Tổng số buổi nghỉ vượt quá 20% số buổi của học phần (nguy cơ cấm thi) | *"Sinh viên đã nghỉ quá 20% số buổi (vượt mức cho phép), có xét đặc biệt không?"* | Điều 1.2 & 1.3 Quy chế Đào tạo |
| **Vượt thẩm quyền** | Đơn xin bảo lưu cả học kỳ / nghỉ dài hạn toàn khóa | *"Đơn xin bảo lưu cả học kỳ thuộc thẩm quyền Trưởng khoa. Chuyển hồ sơ lên Trưởng khoa phê duyệt?"* | Điều 3.2 Quy chế Đào tạo |

### Quy tắc Bất biến (Invariance Rules):
1. **Ca thường quy**: Sinh viên nghỉ $\le 20\%$ số buổi, có minh chứng rõ ràng $\rightarrow$ `AUTO_APPROVE`.
2. **Không bao giờ xuất kết quả chắc chắn trên ca đã gắn cờ**: Khi rơi vào 1 trong 3 loại dừng, quyết định **bắt buộc là `ESCALATE`**, không được tự ý duyệt hay từ chối dứt điểm.
3. **Câu hỏi 1 lượt (Single-turn)**: Câu hỏi được thiết kế để người duyệt chỉ cần trả lời 1 lần (Yes/No hoặc cung cấp dữ liệu đối soát).

---

## 3. REST API Contracts

### `POST /api/v1/verify`
Chạy 5 ca kiểm thử chuẩn của học đường:
- TC01: Nghỉ ốm 1 buổi có giấy rõ ngày ($1/15 = 6.7\% \le 20\%$) $\rightarrow$ `AUTO_APPROVE`
- TC02: Nghỉ việc riêng tang chế có xác nhận ($2/15 = 13.3\% \le 20\%$) $\rightarrow$ `AUTO_APPROVE`
- TC03: Nghỉ hoạt động Đoàn trường có công văn ($3/30 = 10\% \le 20\%$) $\rightarrow$ `AUTO_APPROVE`
- TC04: Nghỉ ốm nhưng giấy khám mờ ngày $\rightarrow$ `ESCALATE` (*Không chắc dữ kiện*)
- TC05: Đã vắng 3 buổi, xin thêm 1 buổi ($4/15 = 26.7\% > 20\%$) $\rightarrow$ `ESCALATE` (*Ngoài chính sách*)

### `POST /api/v1/evaluate`
Thẩm định một đơn xin nghỉ học của sinh viên:
```json
{
  "studentId": "SV-2024-1001",
  "studentName": "Nguyễn Văn An",
  "faculty": "Khoa Công nghệ Thông tin",
  "courseName": "Lập trình Web",
  "totalSessions": 15,
  "pastAbsences": 0,
  "sessionsRequested": 1,
  "fromDate": "2025-10-10",
  "toDate": "2025-10-10",
  "leaveType": "Nghỉ ốm điều trị",
  "docEvidenceStatus": "VALID",
  "reason": "Sốt cao cần điều trị",
  "notes": "Có giấy khám bệnh rõ ràng"
}
```

### `POST /api/v1/override`
Ghi nhận thao tác can thiệp của Giảng viên / Trưởng khoa đối với quyết định của Agent (Human-in-the-loop).
