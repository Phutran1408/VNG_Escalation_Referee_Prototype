#!/usr/bin/env python3
"""
PIPELINE XỬ LÝ HỒ SƠ PHÁP LÝ CHUẨN CHỈNH:
Markdown Document ──> PDF Scan Văn Bản ──> OCR Bóc Tách Dữ Liệu ──> Thẩm Định AI Phân Xử
"""

import os
import re
import json
from fpdf import FPDF
from pypdf import PdfReader

# Kiểm tra font tiếng Việt
FONT_PATH = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
FONT_BOLD_PATH = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"

class LegalLeavePDF(FPDF):
    def header(self):
        pass

    def footer(self):
        self.set_y(-15)
        self.set_font("DejaVu", size=8)
        self.set_text_color(128, 128, 128)
        self.cell(0, 10, f"Trang {self.page_no()} - Hệ thống Thẩm định & Phân xử Nghỉ phép Tự động", align="C")

def create_leave_pdf(data: dict, output_pdf_path: str):
    pdf = LegalLeavePDF(orientation="P", unit="mm", format="A4")
    pdf.add_page()
    pdf.add_font("DejaVu", fname=FONT_PATH)
    pdf.add_font("DejaVu", style="B", fname=FONT_BOLD_PATH)

    # 1. Quốc hiệu Tiêu ngữ
    pdf.set_font("DejaVu", style="B", size=10)
    pdf.cell(0, 5, "CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM", align="C", new_x="LMARGIN", new_y="NEXT")
    pdf.set_font("DejaVu", style="B", size=10)
    pdf.cell(0, 5, "Độc lập – Tự do – Hạnh phúc", align="C", new_x="LMARGIN", new_y="NEXT")
    pdf.set_font("DejaVu", size=8)
    pdf.cell(0, 4, "─────────────────────────", align="C", new_x="LMARGIN", new_y="NEXT")
    pdf.cell(0, 6, f"TP. Hồ Chí Minh, ngày {data.get('date', '15 tháng 10 năm 2025')}", align="R", new_x="LMARGIN", new_y="NEXT")
    pdf.ln(3)

    # 2. Tiêu đề
    pdf.set_font("DejaVu", style="B", size=14)
    pdf.set_text_color(20, 45, 100)
    pdf.cell(0, 8, "ĐƠN XIN NGHỈ PHÉP", align="C", new_x="LMARGIN", new_y="NEXT")
    pdf.set_font("DejaVu", size=9)
    pdf.set_text_color(100, 100, 100)
    pdf.cell(0, 5, f"(Mã biểu mẫu: BM-HR-01 · Mã văn bản: {data['doc_id']})", align="C", new_x="LMARGIN", new_y="NEXT")
    pdf.ln(4)

    # 3. Kính gửi
    pdf.set_text_color(30, 30, 30)
    pdf.set_font("DejaVu", style="B", size=9)
    pdf.cell(0, 5, "Kính gửi:", new_x="LMARGIN", new_y="NEXT")
    pdf.set_font("DejaVu", size=9)
    pdf.cell(0, 5, "  - Ban Giám Đốc Khối / Ban Giám Đốc Công ty;", new_x="LMARGIN", new_y="NEXT")
    pdf.cell(0, 5, f"  - Trưởng phòng {data.get('department', 'Phòng chuyên môn')};", new_x="LMARGIN", new_y="NEXT")
    pdf.cell(0, 5, "  - Phòng Quản trị Nhân sự (HR).", new_x="LMARGIN", new_y="NEXT")
    pdf.ln(3)

    # 4. Thông tin cá nhân
    pdf.set_font("DejaVu", style="B", size=10)
    pdf.set_text_color(0, 51, 102)
    pdf.cell(0, 6, "1. THÔNG TIN NGƯỜI LÀM ĐƠN", new_x="LMARGIN", new_y="NEXT")
    pdf.set_text_color(30, 30, 30)
    pdf.set_font("DejaVu", size=9)
    pdf.cell(95, 6, f"Họ và tên: {data['employee_name']}")
    pdf.cell(95, 6, f"Mã số NV: {data['employee_id']}", new_x="LMARGIN", new_y="NEXT")
    pdf.cell(95, 6, f"Phòng ban: {data['department']}")
    pdf.cell(95, 6, f"Chức vụ: {data.get('position', 'Nhân viên')}", new_x="LMARGIN", new_y="NEXT")
    pdf.ln(2)

    # 5. Nội dung nghỉ
    pdf.set_font("DejaVu", style="B", size=10)
    pdf.set_text_color(0, 51, 102)
    pdf.cell(0, 6, "2. NỘI DUNG XIN NGHỈ PHÉP", new_x="LMARGIN", new_y="NEXT")
    pdf.set_text_color(30, 30, 30)
    pdf.set_font("DejaVu", size=9)
    pdf.cell(95, 6, f"Loại nghỉ phép: {data['leave_type']}")
    pdf.cell(95, 6, f"Số ngày nghỉ: {data['days']} ngày làm việc", new_x="LMARGIN", new_y="NEXT")
    pdf.cell(0, 6, f"Thời gian nghỉ: Từ ngày {data['from_date']} đến hết ngày {data['to_date']}", new_x="LMARGIN", new_y="NEXT")
    pdf.multi_cell(0, 5, f"Lý do xin nghỉ: {data['reason']}")
    pdf.ln(2)

    # 6. Minh chứng
    pdf.set_font("DejaVu", style="B", size=10)
    pdf.set_text_color(0, 51, 102)
    pdf.cell(0, 6, "3. DANH MỤC HỒ SƠ, MINH CHỨNG ĐÍNH KÈM", new_x="LMARGIN", new_y="NEXT")
    pdf.set_text_color(30, 30, 30)
    pdf.set_font("DejaVu", size=9)
    pdf.multi_cell(0, 5, f"Chứng từ đính kèm: {data['attachments']}")
    pdf.ln(2)

    # 7. Cam kết
    pdf.set_font("DejaVu", style="B", size=10)
    pdf.set_text_color(0, 51, 102)
    pdf.cell(0, 6, "4. BÀN GIAO CÔNG VIỆC & CAM KẾT", new_x="LMARGIN", new_y="NEXT")
    pdf.set_text_color(30, 30, 30)
    pdf.set_font("DejaVu", size=9)
    pdf.cell(0, 5, f"Người nhận bàn giao: {data.get('handover_person', 'Đồng nghiệp cùng bộ phận')}", new_x="LMARGIN", new_y="NEXT")
    pdf.multi_cell(0, 5, "Tôi cam đoan thông tin khai báo và chứng từ nộp kèm là hoàn toàn chính xác theo Quy chế Nhân sự.")
    pdf.ln(5)

    # 8. Bảng chữ ký
    col_w = 47
    pdf.set_font("DejaVu", style="B", size=8)
    pdf.cell(col_w, 5, "Người làm đơn", align="C")
    pdf.cell(col_w, 5, "Người nhận bàn giao", align="C")
    pdf.cell(col_w, 5, "Trưởng phòng", align="C")
    pdf.cell(col_w, 5, "Cấp có thẩm quyền", align="C", new_x="LMARGIN", new_y="NEXT")

    pdf.set_font("DejaVu", size=7)
    pdf.set_text_color(100, 100, 100)
    pdf.cell(col_w, 4, "(Ký, ghi rõ họ tên)", align="C")
    pdf.cell(col_w, 4, "(Ký xác nhận)", align="C")
    pdf.cell(col_w, 4, "(Ký duyệt)", align="C")
    pdf.cell(col_w, 4, "(Ký & đóng dấu)", align="C", new_x="LMARGIN", new_y="NEXT")

    pdf.ln(12)
    pdf.set_font("DejaVu", style="B", size=8)
    pdf.set_text_color(0, 0, 0)
    pdf.cell(col_w, 5, data['employee_name'], align="C")
    pdf.cell(col_w, 5, "Đã ký", align="C")
    pdf.cell(col_w, 5, "Đã xác nhận", align="C")
    pdf.cell(col_w, 5, "Chờ duyệt", align="C", new_x="LMARGIN", new_y="NEXT")

    pdf.output(output_pdf_path)
    print(f"✓ Đã tạo file PDF: {output_pdf_path}")

def ocr_extract_pdf(pdf_path: str) -> dict:
    """Mô phỏng bộ bóc tách dữ liệu OCR từ tệp PDF"""
    reader = PdfReader(pdf_path)
    full_text = ""
    for page in reader.pages:
        full_text += page.extract_text() + "\n"

    # Regex trích xuất các trường dữ liệu
    extracted = {
        "raw_text": full_text,
        "employee_name": "",
        "employee_id": "",
        "department": "",
        "leave_type": "",
        "days": 1,
        "from_date": "",
        "to_date": "",
        "reason": "",
        "attachments": "",
        "doc_status": "VALID",
    }

    # Bóc tách Họ tên
    m = re.search(r"Họ và tên:\s*([^\n]+?)(?=Mã số NV|$)", full_text)
    if m: extracted["employee_name"] = m.group(1).strip()

    # Bóc tách Mã NV
    m = re.search(r"Mã số NV:\s*([A-Z0-9-]+)", full_text)
    if m: extracted["employee_id"] = m.group(1).strip()

    # Bóc tách Phòng ban
    m = re.search(r"Phòng ban:\s*([^\n]+?)(?=Chức vụ|$)", full_text)
    if m: extracted["department"] = m.group(1).strip()

    # Bóc tách Loại nghỉ
    m = re.search(r"Loại nghỉ phép:\s*([^\n]+?)(?=Số ngày nghỉ|$)", full_text)
    if m: extracted["leave_type"] = m.group(1).strip()

    # Bóc tách Số ngày
    m = re.search(r"Số ngày nghỉ:\s*(\d+)", full_text)
    if m: extracted["days"] = int(m.group(1))

    # Bóc tách Thời gian
    m = re.search(r"Từ ngày\s*([\d-]+)\s*đến hết ngày\s*([\d-]+)", full_text)
    if m:
        extracted["from_date"] = m.group(1).strip()
        extracted["to_date"] = m.group(2).strip()

    # Bóc tách Lý do
    m = re.search(r"Lý do xin nghỉ:\s*([^\n]+)", full_text)
    if m: extracted["reason"] = m.group(1).strip()

    # Bóc tách Minh chứng
    m = re.search(r"Chứng từ đính kèm:\s*([^\n]+)", full_text)
    if m: extracted["attachments"] = m.group(1).strip()

    # Kiểm tra trạng thái chứng từ (OCR validation)
    att_lower = extracted["attachments"].lower()
    if "chưa nộp" in att_lower or "thiếu" in att_lower or "c65" in att_lower:
        extracted["doc_status"] = "UNCLEAR_DATE"
    elif "không có" in att_lower:
        extracted["doc_status"] = "MISSING"

    return extracted

if __name__ == "__main__":
    sample_cases = [
        {
            "doc_id": "VB-2025-0012",
            "employee_id": "NV-2020-0019",
            "employee_name": "Trương Minh Trí",
            "department": "Phòng Kinh doanh",
            "leave_type": "Nghỉ ốm/chế độ",
            "days": 6,
            "from_date": "2025-11-01",
            "to_date": "2025-11-07",
            "reason": "Nghỉ ốm phẫu thuật ruột thừa tại Bệnh viện Nhân dân Gia Định.",
            "attachments": "Giấy ra viện. Chưa nộp Giấy chứng nhận nghỉ việc hưởng BHXH (mẫu C65-HD).",
            "filename": "don_nghi_om_truong_minh_tri.pdf"
        },
        {
            "doc_id": "VB-2025-0034",
            "employee_id": "NV-2021-0034",
            "employee_name": "Hoàng Văn Bình",
            "department": "Phòng Vận hành",
            "leave_type": "Nghỉ không lương",
            "days": 20,
            "from_date": "2025-11-10",
            "to_date": "2025-12-05",
            "reason": "Xin nghỉ không lương dài hạn để chăm sóc người thân bị bệnh nặng.",
            "attachments": "Bản cam kết bàn giao tiến độ vận hành. Thời gian nghỉ 20 ngày.",
            "filename": "don_nghi_khong_luong_hoang_van_binh.pdf"
        },
        {
            "doc_id": "VB-2025-0089",
            "employee_id": "NV-2024-0312",
            "employee_name": "Nguyễn Thị Hương",
            "department": "Phòng Kinh doanh",
            "leave_type": "Nghỉ phép năm",
            "days": 1,
            "from_date": "2025-10-15",
            "to_date": "2025-10-15",
            "reason": "Nghỉ phép năm theo kế hoạch cá nhân, nộp trước 3 ngày làm việc.",
            "attachments": "Xác nhận số dư phép năm còn 4 ngày hợp lệ.",
            "filename": "don_phep_nam_nguyen_thi_huong.pdf"
        }
    ]

    results = []
    for c in sample_cases:
        out_path = os.path.join("public/documents", c["filename"])
        create_leave_pdf(c, out_path)
        extracted = ocr_extract_pdf(out_path)
        results.append({
            "pdf_file": c["filename"],
            "data": extracted
        })

    # Ghi kết quả OCR ra file json để app có thể nạp
    with open("public/documents/ocr_extracted_samples.json", "w", encoding="utf-8") as f:
        json.dump(results, f, ensure_ascii=False, indent=2)

    print("✓ Đã hoàn thành Pipeline: Tạo PDF chuẩn ➔ OCR trích xuất dữ liệu ➔ Lưu mẫu json thành công!")
