/**
 * Mod Sư Đồ Truyền Thừa (su_do) - Constants & Configuration
 */

export const MOD_VERSION = '1.3.2';

export const CANH_GIOI_TEN = ['Phàm Nhân', 'Luyện Khí', 'Trúc Cơ', 'Kết Đan', 'Nguyên Anh', 'Hóa Thần'];
export const TIEU_CANH_GIOI_TEN = ['Sơ kỳ', 'Trung kỳ', 'Hậu kỳ', 'Đại viên mãn'];
export const TEN_CANH_GIOI_HUD = ['Luyện Khí', 'Trúc Cơ', 'Kim Đan', 'Nguyên Anh', 'Hóa Thần', 'Luyện Hư', 'Hợp Thể', 'Đại Thừa', 'Độ Kiếp'];

export const HE_MAP = {
  kim: 'Kim',
  moc: 'Mộc',
  thuy: 'Thủy',
  hoa: 'Hỏa',
  tho: 'Thổ',
  loi: 'Lôi',
  phong: 'Phong',
  bang: 'Băng',
  quang: 'Quang',
  am: 'Ám',
  vo_sac: 'Vô Sắc',
};

export const NGU_HANH_KHAC = {
  kim: 'moc',
  moc: 'tho',
  tho: 'thuy',
  thuy: 'hoa',
  hoa: 'kim',
  loi: 'moc',
  phong: 'tho',
  bang: 'hoa',
  quang: 'am',
  am: 'quang',
};

export const TU_CHAT_MAP = {
  pho_thong: { ten: 'Phổ Thông', color: 'var(--muc-nhat)', bg: 'rgba(0,0,0,0.06)', border: 'var(--vien-hud)', diemLuanKiem: 10 },
  kha: { ten: 'Khá Giỏi', color: '#10b981', bg: 'rgba(16,185,129,0.12)', border: '#10b981', diemLuanKiem: 25 },
  thien_tai: { ten: 'Thiên Tài', color: '#f59e0b', bg: 'rgba(245,158,11,0.15)', border: '#f59e0b', diemLuanKiem: 45 },
  yeu_nghiet: { ten: 'Yêu Nghiệt', color: '#ef4444', bg: 'rgba(239,68,68,0.18)', border: '#ef4444', diemLuanKiem: 75 },
};

export const TINH_CACH_MAP = {
  hieu_thuan: 'Hiếu Thuận',
  kien_dinh: 'Kiên Định',
  kieu_ngao: 'Kiêu Ngạo',
  can_man: 'Cần Mẫn',
};

export const KHUYNH_HUONG_MAP = {
  chinh_dao: 'Chính Đạo',
  tieu_dao: 'Tiêu Dao',
  ma_dao: 'Ma Đạo',
};

// Cấu hình Kiến Thiết Đạo Tràng (Trụ Cột 1)
export const TU_LINH_TRAN_CONFIG = [
  { cap: 0, ten: 'Chưa Khai Lập', phi: 80, moTa: 'Chưa dựng tụ linh trận.', deTuHieuQua: 0, suTonTuVi: 0, satThuong: 0, dotPha: 0 },
  { cap: 1, ten: 'Tụ Khí Trận', phi: 250, moTa: '+15% tu vi đệ tử, +0.2 tu vi/năm cho Sư Tôn, +2% sát thương chiến đấu.', deTuHieuQua: 0.15, suTonTuVi: 0.2, satThuong: 0.02, dotPha: 0 },
  { cap: 2, ten: 'Linh Tuyền Trận', phi: 600, moTa: '+30% tu vi đệ tử, +0.5 tu vi/năm cho Sư Tôn, +5% sát thương chiến đấu.', deTuHieuQua: 0.30, suTonTuVi: 0.5, satThuong: 0.05, dotPha: 0.02 },
  { cap: 3, ten: 'Thiên Linh Tụ Đỉnh', phi: 1500, moTa: '+50% tu vi đệ tử, +1.0 tu vi/năm cho Sư Tôn, +8% sát thương, +5% tỉ lệ đột phá Sư Tôn.', deTuHieuQua: 0.50, suTonTuVi: 1.0, satThuong: 0.08, dotPha: 0.05 },
  { cap: 4, ten: 'Hỗn Độn Tiên Trận', phi: null, moTa: '+80% tu vi đệ tử, +2.0 tu vi/năm cho Sư Tôn, +12% sát thương, +10% tỉ lệ đột phá Sư Tôn.', deTuHieuQua: 0.80, suTonTuVi: 2.0, satThuong: 0.12, dotPha: 0.10 },
];

export const DUOC_DIEN_CONFIG = [
  { cap: 0, ten: 'Hoang Điền', phi: 100, moTa: 'Đất hoang chưa canh tác.', tocDo: 0, sanPham: [] },
  { cap: 1, ten: 'Linh Điền Sơ Cấp', phi: 300, moTa: 'Gieo trồng thảo dược, thu hoạch Thượng Cổ Linh Thảo.', tocDo: 1.0, sanPham: ['item.su_do_duoc_dien_linh_thoc'] },
  { cap: 2, ten: 'Dược Viên Trung Cấp', phi: 700, moTa: 'Linh khí nồng đậm, thu hoạch thêm Tuyết Liên Trà quý.', tocDo: 1.5, sanPham: ['item.su_do_duoc_dien_linh_thoc', 'item.su_do_tuyet_lien_tra'] },
  { cap: 3, ten: 'Thảo Uyển Thượng Cấp', phi: 1600, moTa: 'Dược thảo tươi tốt gấp bội, sản sinh liên tục.', tocDo: 2.2, sanPham: ['item.su_do_duoc_dien_linh_thoc', 'item.su_do_tuyet_lien_tra', 'item.su_do_ho_mach_dan'] },
  { cap: 4, ten: 'Dược Điền Bất Hủ', phi: null, moTa: 'Thần thổ bất hủ, dược tính kinh thiên động địa.', tocDo: 3.0, sanPham: ['item.su_do_duoc_dien_linh_thoc', 'item.su_do_tuyet_lien_tra', 'item.su_do_ho_mach_dan'] },
];

export const LUYEN_DAN_CONFIG = [
  { cap: 0, ten: 'Chưa Dựng Lò', phi: 120, moTa: 'Chưa có phòng luyện đan.', tocDo: 0 },
  { cap: 1, ten: 'Đồng Đỉnh Các', phi: 350, moTa: 'Luyện chế Hộ Mạch Tụ Khí Đan định kỳ cho sư môn.', tocDo: 1.0, sanPham: 'item.su_do_ho_mach_dan' },
  { cap: 2, ten: 'Địa Hỏa Lò', phi: 800, moTa: 'Địa hỏa bốc cao, tốc độ luyện đan tăng nhanh.', tocDo: 1.6, sanPham: 'item.su_do_ho_mach_dan' },
  { cap: 3, ten: 'Cửu Long Đan Các', phi: 1800, moTa: 'Tăng tốc luyện chế x2.5, linh đan thượng phẩm.', tocDo: 2.5, sanPham: 'item.su_do_ho_mach_dan' },
  { cap: 4, ten: 'Thái Thượng Đan Các', phi: null, moTa: 'Đan đạo đỉnh phong, thần đan hộ đạo.', tocDo: 3.5, sanPham: 'item.su_do_ho_mach_dan' },
];

export const HO_TONG_CONFIG = [
  { cap: 0, ten: 'Chưa Khởi Động Trận Pháp', phi: 150, moTa: 'Chưa dựng kết giới hộ tông.', giamSatThuong: 0, phanKich: 0 },
  { cap: 1, ten: 'Tứ Tượng Hộ Môn Trận', phi: 350, moTa: 'Giảm 5% sát thương nhận vào cho Sư Tôn, phản kích 5% uy lực.', giamSatThuong: 0.05, phanKich: 0.05 },
  { cap: 2, ten: 'Bát Quái Cửu Cung Trận', phi: 800, moTa: 'Giảm 10% sát thương nhận vào cho Sư Tôn, phản kích 10% uy lực.', giamSatThuong: 0.10, phanKich: 0.10 },
  { cap: 3, ten: 'Thập Tuyệt Tru Tiên Trận', phi: 1800, moTa: 'Giảm 15% sát thương nhận vào cho Sư Tôn, phản kích 15% uy lực.', giamSatThuong: 0.15, phanKich: 0.15 },
  { cap: 4, ten: 'Hỗn Độn Hộ Tông Trận', phi: null, moTa: 'Kim thân bất hoại, giảm 22% sát thương nhận vào cho Sư Tôn!', giamSatThuong: 0.22, phanKich: 0.20 },
];

export const NHIEM_VU_LICH_LUYEN = {
  hai_duoc: {
    ten: 'Hái Linh Dược',
    icon: '🌿',
    moTa: 'An toàn, thu linh thạch',
    soNamMacDinh: 2,
    tinhThuong(h) {
      const lt = 40 + Math.floor(h.random() * 40);
      return {
        linhThach: lt,
        moTa: `thu thập được nhiều thảo dược quý, quy đổi thành ${lt} linh thạch`,
      };
    },
  },
  dao_khoang: {
    ten: 'Khai Khoáng Thạch',
    icon: '⛏️',
    moTa: 'Ổn định, nhận linh thạch',
    soNamMacDinh: 2,
    tinhThuong(h) {
      const lt = 50 + Math.floor(h.random() * 50);
      return {
        linhThach: lt,
        moTa: `đào được quặng huyền thiết, nhận ${lt} linh thạch`,
      };
    },
  },
  tru_ma: {
    ten: 'Trừ Ma Vệ Đạo',
    icon: '⚔️',
    moTa: 'Cống hiến & linh thạch',
    soNamMacDinh: 3,
    tinhThuong(h) {
      return {
        congHien: 30,
        linhThach: 60,
        vatPham: 'item.su_do_nghich_do_ma_hoan',
        moTa: 'trảm sát yêu thú ma đạo, mang về 30 cống hiến, 60 linh thạch và 1 Ma Hoán Tín Vật!',
      };
    },
  },
  bi_canh: {
    ten: 'Thám Hiểm Bí Cảnh',
    icon: '🏰',
    moTa: 'Mạo hiểm, Đan dược quý',
    soNamMacDinh: 3,
    tinhThuong(h) {
      return {
        linhThach: 100,
        vatPham: 'item.su_do_ho_mach_dan',
        soLuong: 1,
        moTa: 'khám phá cổ di tích, dâng lên sư tôn 100 linh thạch và 1 Hộ Mạch Tụ Khí Đan!',
      };
    },
  },
};
