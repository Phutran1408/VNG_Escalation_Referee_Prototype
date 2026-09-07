export interface CaseFolderItem {
  id: string;
  folderName: string;
  applicantRole: "employee" | "student";
  applicantName: string;
  applicantId: string;
  departmentOrFaculty: string;
  leaveType: string;
  submissionDate: string;
  fromDate: string;
  toDate: string;
  durationLabel: string;
  reason: string;
  notes: string;
  
  pdfFile: {
    fileName: string;
    filePath: string;
    title: string;
    docCode: string;
  };
  evidenceFiles: {
    fileName: string;
    filePath: string;
    title: string;
    fileType: "image" | "pdf";
    description: string;
  }[];
}

export const CASE_FOLDERS: CaseFolderItem[] = [
  // --- DOANH NGHIỆP (ENTERPRISE) ---
  {
    id: "CASE-01",
    folderName: "case_01_le_thi_phuong",
    applicantRole: "employee",
    applicantName: "Lê Thị Phương",
    applicantId: "NV-1981-0592",
    departmentOrFaculty: "Phòng Kế hoạch & Quản lý Sản xuất",
    leaveType: "Nghỉ ốm / Chế độ BHXH",
    submissionDate: "2022-01-20",
    fromDate: "2022-01-21",
    toDate: "2022-01-30",
    durationLabel: "10 ngày làm việc",
    reason: "Nhiễm SARS-COV-2 (điều trị ngoại trú cách ly tại nhà theo chỉ định y tế).",
    notes: "Nộp kèm Giấy chứng nhận nghỉ việc hưởng BHXH (Mẫu CT07).",
    pdfFile: {
      fileName: "don_nghi_om_le_thi_phuong.pdf",
      filePath: "/cases/case_01_le_thi_phuong/don_nghi_om_le_thi_phuong.pdf",
      title: "Đơn Xin Nghỉ Ốm Điều Trị Covid-19",
      docCode: "BM-HR-01 · VB-2022-0148",
    },
    evidenceFiles: [
      {
        fileName: "bang_chung_le_thi_phuong.jpg",
        filePath: "/cases/case_01_le_thi_phuong/bang_chung_le_thi_phuong.jpg",
        title: "Giấy chứng nhận nghỉ việc hưởng BHXH (Mẫu CT07)",
        fileType: "image",
        description: "Bằng chứng y tế đính kèm của Trạm y tế phường Hòa Cường Nam.",
      },
    ],
  },
  {
    id: "CASE-02",
    folderName: "case_02_truong_minh_tri",
    applicantRole: "employee",
    applicantName: "Trương Minh Trí",
    applicantId: "NV-2020-0019",
    departmentOrFaculty: "Phòng Kinh doanh",
    leaveType: "Nghỉ ốm/chế độ",
    submissionDate: "2025-10-31",
    fromDate: "2025-11-01",
    toDate: "2025-11-07",
    durationLabel: "6 ngày làm việc",
    reason: "Nghỉ ốm phẫu thuật ruột thừa tại Bệnh viện Nhân dân Gia Định.",
    notes: "Mới nộp Giấy ra viện photocopy. Chưa nộp Giấy chứng nhận nghỉ việc hưởng BHXH (mẫu C65-HD).",
    pdfFile: {
      fileName: "don_nghi_om_truong_minh_tri.pdf",
      filePath: "/cases/case_02_truong_minh_tri/don_nghi_om_truong_minh_tri.pdf",
      title: "Đơn Xin Nghỉ Ốm Phẫu Thuật (6 ngày)",
      docCode: "BM-HR-01 · VB-2025-0012",
    },
    evidenceFiles: [],
  },
  {
    id: "CASE-03",
    folderName: "case_03_hoang_van_binh",
    applicantRole: "employee",
    applicantName: "Hoàng Văn Bình",
    applicantId: "NV-2021-0034",
    departmentOrFaculty: "Phòng Vận hành",
    leaveType: "Nghỉ không lương",
    submissionDate: "2025-11-05",
    fromDate: "2025-11-10",
    toDate: "2025-12-05",
    durationLabel: "20 ngày làm việc",
    reason: "Xin nghỉ không lương dài hạn để chăm sóc người thân bị bệnh nặng.",
    notes: "Bản cam kết bàn giao tiến độ vận hành. Thời gian nghỉ 20 ngày liên tục.",
    pdfFile: {
      fileName: "don_nghi_khong_luong_hoang_van_binh.pdf",
      filePath: "/cases/case_03_hoang_van_binh/don_nghi_khong_luong_hoang_van_binh.pdf",
      title: "Đơn Nghỉ Không Lương Dài Hạn (20 ngày)",
      docCode: "BM-HR-01 · VB-2025-0034",
    },
    evidenceFiles: [],
  },
  {
    id: "CASE-04",
    folderName: "case_04_nguyen_thi_huong",
    applicantRole: "employee",
    applicantName: "Nguyễn Thị Hương",
    applicantId: "NV-2024-0312",
    departmentOrFaculty: "Phòng Kinh doanh",
    leaveType: "Nghỉ phép năm",
    submissionDate: "2025-10-12",
    fromDate: "2025-10-15",
    toDate: "2025-10-15",
    durationLabel: "1 ngày làm việc",
    reason: "Nghỉ phép năm theo kế hoạch cá nhân, nộp trước 3 ngày làm việc.",
    notes: "Xác nhận số dư phép năm còn 4 ngày hợp lệ. Đã bàn giao công việc.",
    pdfFile: {
      fileName: "don_phep_nam_nguyen_thi_huong.pdf",
      filePath: "/cases/case_04_nguyen_thi_huong/don_phep_nam_nguyen_thi_huong.pdf",
      title: "Đơn Nghỉ Phép Năm Hợp Lệ (1 ngày)",
      docCode: "BM-HR-01 · VB-2025-0089",
    },
    evidenceFiles: [],
  },

  // --- TRƯỜNG HỌC / ĐẠI HỌC (ACADEMIC) ---
  {
    id: "CASE-STU-01",
    folderName: "case_stu_01_nguyen_van_an",
    applicantRole: "student",
    applicantName: "Nguyễn Văn An",
    applicantId: "SV-2024-1001",
    departmentOrFaculty: "Khoa Công nghệ Thông tin",
    leaveType: "Nghỉ ốm điều trị",
    submissionDate: "2025-10-10",
    fromDate: "2025-10-10",
    toDate: "2025-10-10",
    durationLabel: "1 buổi học (Lập trình Web nâng cao)",
    reason: "Sốt phát ban, có giấy khám bệnh Bệnh viện Quận 1 chỉ định nghỉ điều trị.",
    notes: "Có giấy khám bệnh đầy đủ dấu mộc và chữ ký bác sĩ. Chưa vượt trần 20% vắng.",
    pdfFile: {
      fileName: "don_nghi_hoc_nguyen_van_an.pdf",
      filePath: "/cases/case_01_le_thi_phuong/don_nghi_om_le_thi_phuong.pdf",
      title: "Đơn Xin Nghỉ Học Có Lý Do (1 buổi)",
      docCode: "BM-DT-02 · VB-2025-0101",
    },
    evidenceFiles: [
      {
        fileName: "giay_kham_benh_nguyen_van_an.jpg",
        filePath: "/cases/case_01_le_thi_phuong/bang_chung_le_thi_phuong.jpg",
        title: "Giấy khám bệnh Bệnh viện Quận 1 (Có mộc đỏ & chữ ký bác sĩ)",
        fileType: "image",
        description: "Chỉ định nghỉ khám và điều trị ngoại trú ngày 10/10/2025.",
      },
    ],
  },
  {
    id: "CASE-STU-02",
    folderName: "case_stu_02_pham_duc_anh",
    applicantRole: "student",
    applicantName: "Phạm Đức Anh",
    applicantId: "SV-2024-4099",
    departmentOrFaculty: "Khoa Công nghệ Thông tin",
    leaveType: "Nghỉ ốm điều trị",
    submissionDate: "2025-10-10",
    fromDate: "2025-10-10",
    toDate: "2025-10-10",
    durationLabel: "1 buổi học (Cấu trúc dữ liệu)",
    reason: "Nghỉ ốm, nộp giấy khám bệnh nhưng vết mực ngày khám bị nhòe mờ không đọc được.",
    notes: "Ảnh chụp giấy khám bệnh không xác định được ngày khám là 10/10 hay 12/10.",
    pdfFile: {
      fileName: "don_nghi_hoc_pham_duc_anh.pdf",
      filePath: "/cases/case_02_truong_minh_tri/don_nghi_om_truong_minh_tri.pdf",
      title: "Đơn Xin Nghỉ Học (Mờ ngày chứng từ)",
      docCode: "BM-DT-02 · VB-2025-0102",
    },
    evidenceFiles: [],
  },
  {
    id: "CASE-STU-03",
    folderName: "case_stu_03_le_quoc_bao",
    applicantRole: "student",
    applicantName: "Lê Quốc Bảo",
    applicantId: "SV-2024-3001",
    departmentOrFaculty: "Khoa Kinh tế Quốc tế",
    leaveType: "Xin bảo lưu học kỳ",
    submissionDate: "2025-10-12",
    fromDate: "2025-10-15",
    toDate: "2026-02-28",
    durationLabel: "Toàn bộ Học kỳ I (15 tuần)",
    reason: "Gia đình có biến cố lớn, xin bảo lưu kết quả học tập kỳ 1 năm học 2025-2026.",
    notes: "Đơn vượt thẩm quyền Giảng viên bộ môn, thẩm quyền thuộc về Trưởng khoa & Phòng Đào tạo.",
    pdfFile: {
      fileName: "don_bao_luu_le_quoc_bao.pdf",
      filePath: "/cases/case_03_hoang_van_binh/don_nghi_khong_luong_hoang_van_binh.pdf",
      title: "Đơn Xin Bảo Lưu Kết Quả Học Tập",
      docCode: "BM-DT-02 · VB-2025-0103",
    },
    evidenceFiles: [],
  },
];
