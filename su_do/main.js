/**
 * Mod Sư Đồ Truyền Thừa (su_do) - Vạn Kiếp Tu Tiên
 * Tác giả: Antigravity & Tu Tiên Giả
 * Phiên bản: 1.1.0
 * Tương thích: apiVersion 1 (Đại Tu Toàn Diện Tông Môn, Kiến Thiết Đạo Tràng, Luận Kiếm, Ma Hóa, HUD Dock)
 */

(() => {
  // ==========================================
  // 1. CÁC HẰNG SỐ & BẢNG TRA CỨU TIÊN HIỆP
  // ==========================================
  const CANH_GIOI_TEN = ['Phàm Nhân', 'Luyện Khí', 'Trúc Cơ', 'Kết Đan', 'Nguyên Anh', 'Hóa Thần'];
  const TIEU_CANH_GIOI_TEN = ['Sơ kỳ', 'Trung kỳ', 'Hậu kỳ', 'Đại viên mãn'];
  const TEN_CANH_GIOI_HUD = ['Luyện Khí', 'Trúc Cơ', 'Kim Đan', 'Nguyên Anh', 'Hóa Thần', 'Luyện Hư', 'Hợp Thể', 'Đại Thừa', 'Độ Kiếp'];

  const HE_MAP = {
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

  const NGU_HANH_KHAC = {
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

  const TU_CHAT_MAP = {
    pho_thong: { ten: 'Phổ Thông', color: 'var(--muc-nhat)', bg: 'rgba(0,0,0,0.06)', border: 'var(--vien-hud)', diemLuanKiem: 10 },
    kha: { ten: 'Khá Giỏi', color: '#10b981', bg: 'rgba(16,185,129,0.12)', border: '#10b981', diemLuanKiem: 25 },
    thien_tai: { ten: 'Thiên Tài', color: '#f59e0b', bg: 'rgba(245,158,11,0.15)', border: '#f59e0b', diemLuanKiem: 45 },
    yeu_nghiet: { ten: 'Yêu Nghiệt', color: '#ef4444', bg: 'rgba(239,68,68,0.18)', border: '#ef4444', diemLuanKiem: 75 },
  };

  const TINH_CACH_MAP = {
    hieu_thuan: 'Hiếu Thuận',
    kien_dinh: 'Kiên Định',
    kieu_ngao: 'Kiêu Ngạo',
    can_man: 'Cần Mẫn',
  };

  const KHUYNH_HUONG_MAP = {
    chinh_dao: 'Chính Đạo',
    tieu_dao: 'Tiêu Dao',
    ma_dao: 'Ma Đạo',
  };

  // Cấu hình Kiến Thiết Đạo Tràng (Trụ Cột 1)
  const TU_LINH_TRAN_CONFIG = [
    { cap: 0, ten: 'Chưa Khai Lập', phi: 80, moTa: 'Chưa dựng tụ linh trận.', deTuHieuQua: 0, suTonTuVi: 0, satThuong: 0, dotPha: 0 },
    { cap: 1, ten: 'Tụ Khí Trận', phi: 250, moTa: '+15% tu vi đệ tử, +0.2 tu vi/năm cho Sư Tôn, +2% sát thương chiến đấu.', deTuHieuQua: 0.15, suTonTuVi: 0.2, satThuong: 0.02, dotPha: 0 },
    { cap: 2, ten: 'Linh Tuyền Trận', phi: 600, moTa: '+30% tu vi đệ tử, +0.5 tu vi/năm cho Sư Tôn, +5% sát thương chiến đấu.', deTuHieuQua: 0.30, suTonTuVi: 0.5, satThuong: 0.05, dotPha: 0.02 },
    { cap: 3, ten: 'Thiên Linh Tụ Đỉnh', phi: 1500, moTa: '+50% tu vi đệ tử, +1.0 tu vi/năm cho Sư Tôn, +8% sát thương, +5% tỉ lệ đột phá Sư Tôn.', deTuHieuQua: 0.50, suTonTuVi: 1.0, satThuong: 0.08, dotPha: 0.05 },
    { cap: 4, ten: 'Hỗn Độn Tiên Trận', phi: null, moTa: '+80% tu vi đệ tử, +2.0 tu vi/năm cho Sư Tôn, +12% sát thương, +10% tỉ lệ đột phá Sư Tôn.', deTuHieuQua: 0.80, suTonTuVi: 2.0, satThuong: 0.12, dotPha: 0.10 },
  ];

  const DUOC_DIEN_CONFIG = [
    { cap: 0, ten: 'Hoang Điền', phi: 100, moTa: 'Đất hoang chưa canh tác.', tocDo: 0, sanPham: [] },
    { cap: 1, ten: 'Linh Điền Sơ Cấp', phi: 300, moTa: 'Gieo trồng thảo dược, thu hoạch Thượng Cổ Linh Thảo.', tocDo: 1.0, sanPham: ['item.su_do_duoc_dien_linh_thoc'] },
    { cap: 2, ten: 'Dược Viên Trung Cấp', phi: 700, moTa: 'Linh khí nồng đậm, thu hoạch thêm Tuyết Liên Trà quý.', tocDo: 1.5, sanPham: ['item.su_do_duoc_dien_linh_thoc', 'item.su_do_tuyet_lien_tra'] },
    { cap: 3, ten: 'Thảo Uyển Thượng Cấp', phi: 1600, moTa: 'Dược thảo tươi tốt gấp bội, sản sinh liên tục.', tocDo: 2.2, sanPham: ['item.su_do_duoc_dien_linh_thoc', 'item.su_do_tuyet_lien_tra', 'item.su_do_ho_mach_dan'] },
    { cap: 4, ten: 'Dược Điền Bất Hủ', phi: null, moTa: 'Thần thổ bất hủ, dược tính kinh thiên động địa.', tocDo: 3.0, sanPham: ['item.su_do_duoc_dien_linh_thoc', 'item.su_do_tuyet_lien_tra', 'item.su_do_ho_mach_dan'] },
  ];

  const LUYEN_DAN_CONFIG = [
    { cap: 0, ten: 'Chưa Dựng Lò', phi: 120, moTa: 'Chưa có phòng luyện đan.', tocDo: 0 },
    { cap: 1, ten: 'Đồng Đỉnh Các', phi: 350, moTa: 'Luyện chế Hộ Mạch Tụ Khí Đan định kỳ cho sư môn.', tocDo: 1.0, sanPham: 'item.su_do_ho_mach_dan' },
    { cap: 2, ten: 'Địa Hỏa Lò', phi: 800, moTa: 'Địa hỏa bốc cao, tốc độ luyện đan tăng nhanh.', tocDo: 1.6, sanPham: 'item.su_do_ho_mach_dan' },
    { cap: 3, ten: 'Cửu Long Đan Các', phi: 1800, moTa: 'Tăng tốc luyện chế x2.5, linh đan thượng phẩm.', tocDo: 2.5, sanPham: 'item.su_do_ho_mach_dan' },
    { cap: 4, ten: 'Thái Thượng Đan Các', phi: null, moTa: 'Đan đạo đỉnh phong, thần đan hộ đạo.', tocDo: 3.5, sanPham: 'item.su_do_ho_mach_dan' },
  ];

  const NHIEM_VU_LICH_LUYEN = {
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

  /**
   * Đồng bộ tiến độ lịch luyện của đệ tử theo mốc năm hiện tại của thế giới
   */
  function dongBoTienDoLichLuyen(dt, namHienTai = 1) {
    if (!dt || dt.trangThai?.loai !== 'lich_luyen') return;
    const tt = dt.trangThai;
    const curYear = Number(namHienTai) || 1;

    if (tt.namConLai === 0 && tt.namHoanThanh != null && tt.namHoanThanh > curYear) {
      tt.namHoanThanh = curYear;
    }

    if (tt.namHoanThanh == null) {
      const conLaiCu = Math.max(0, Number(tt.namConLai) || 0);
      tt.namBatDau = curYear;
      tt.namHoanThanh = Math.round((curYear + conLaiCu) * 100) / 100;
    }

    const conLai = Math.max(0, Math.round(((Number(tt.namHoanThanh) || 0) - curYear) * 10) / 10);
    tt.namConLai = conLai;
  }

  // ==========================================
  // 2. TIỆN ÍCH ĐỊNH DẠNG & TÍNH TOÁN AN TOÀN
  // ==========================================
  function dinhDangThoiGianNam(nam) {
    const n = Number(nam);
    if (!Number.isFinite(n)) return 'Năm 1 · Tháng 1';
    const namInt = Math.floor(n);
    const frac = n - namInt;
    const thang = Math.min(12, Math.max(1, Math.floor(frac * 12 + 1e-4) + 1));
    return `Năm ${namInt} · Tháng ${thang}`;
  }

  function dinhDangCanhGioi(cg, tieu = 0) {
    if (typeof window !== 'undefined' && window.tuTien?.core?.index?.tenCanhGioi) {
      return window.tuTien.core.index.tenCanhGioi(cg, tieu);
    }
    const c = Number(cg) || 0;
    const t = Number(tieu) || 0;
    if (c <= 0) return 'Phàm Nhân';
    const cName = CANH_GIOI_TEN[c] ?? 'Hóa Thần';
    const tName = TIEU_CANH_GIOI_TEN[t] ?? 'Sơ kỳ';
    return `${cName} ${tName}`;
  }

  function tuViYeuCauChoCanhGioi(cg, tieu = 0) {
    const base = Math.max(1, Number(cg) || 1);
    const t = Math.max(0, Number(tieu) || 0);
    return (base * 4 + t + 1) * 12;
  }

  function sucChuaDeTu(canhGioiNguoiChoi) {
    const cg = Number(canhGioiNguoiChoi) || 0;
    if (cg <= 1) return 2;  // Phàm Nhân / Luyện Khí: 2
    if (cg === 2) return 4; // Trúc Cơ: 4
    if (cg === 3) return 6; // Kết Đan: 6
    if (cg === 4) return 9; // Nguyên Anh: 9
    return 12;             // Hóa Thần trở lên: 12
  }

  function dinhDangHe(heList) {
    if (!Array.isArray(heList) || heList.length === 0) return 'Vô thuộc tính';
    const tenHe = heList.map((h) => HE_MAP[h] ?? h).join(' · ');
    return `Hệ ${tenHe}`;
  }

  /**
   * Trích xuất và chuẩn hóa an toàn trạng thái mod từ game state
   */
  function layModData(s) {
    const suDo = s?.run?.modData?.su_do;
    return {
      version: Number(suDo?.version) || 2,
      daoTrangTen: typeof suDo?.daoTrangTen === 'string' && suDo.daoTrangTen.trim() ? suDo.daoTrangTen : 'Thanh Khê Đạo Tràng',
      danhSachDeTu: Array.isArray(suDo?.danhSachDeTu) ? suDo.danhSachDeTu : [],
      ungVien: Array.isArray(suDo?.ungVien) ? suDo.ungVien : [],
      nhatKy: Array.isArray(suDo?.nhatKy) ? suDo.nhatKy : [],
      daoTrang: {
        kienThiet: {
          tuLinhTran: { cap: Number(suDo?.daoTrang?.kienThiet?.tuLinhTran?.cap) || 0 },
          duocDien: {
            cap: Number(suDo?.daoTrang?.kienThiet?.duocDien?.cap) || 0,
            duocDongId: suDo?.daoTrang?.kienThiet?.duocDien?.duocDongId ?? null,
            tienDo: Number(suDo?.daoTrang?.kienThiet?.duocDien?.tienDo) || 0,
          },
          luyenDanPhong: {
            cap: Number(suDo?.daoTrang?.kienThiet?.luyenDanPhong?.cap) || 0,
            danDongId: suDo?.daoTrang?.kienThiet?.luyenDanPhong?.danDongId ?? null,
            tienDo: Number(suDo?.daoTrang?.kienThiet?.luyenDanPhong?.tienDo) || 0,
          },
        },
        chienBaoMoiNhat: suDo?.daoTrang?.chienBaoMoiNhat ?? null,
      },
    };
  }

  /**
   * Trả về chữ ký trạng thái cấu trúc để phát hiện khi nào card đệ tử cần rebuild nút bấm
   */
  function layChuKyCauTrucDeTu(dt) {
    const cg = Number(dt?.canhGioi) || 1;
    const tcg = Number(dt?.tieuCanhGioi) || 0;
    const laDinhPhong = cg >= 5 && tcg >= 3;
    const tuViReq = Math.max(1, Number(dt?.tuViYeuCau) || 1);
    const tuViCur = Math.max(0, Number(dt?.tuVi) || 0);
    const sanSang = tuViCur >= tuViReq && !laDinhPhong;
    const laDaiCanhGioi = tcg >= 3;
    const loai = dt?.trangThai?.loai ?? 'nha_roi';
    const nv = dt?.trangThai?.nhiemVu ?? '';
    const namConLai = Math.max(0, Math.round((Number(dt?.trangThai?.namConLai) || 0) * 10) / 10);
    const vaiVe = dt?.vaiVe ?? 'de_tu';
    const cpId = dt?.congPhap?.id ?? '';
    const pbId = dt?.phapBao?.id ?? '';
    return `${vaiVe}_${cg}_${tcg}_${loai}_${nv}_${namConLai}_${sanSang ? 1 : 0}_${laDaiCanhGioi ? 1 : 0}_${cpId}_${pbId}`;
  }

  // ==========================================
  // 3. TIỆN ÍCH TIÊM CSS TOÀN CỤC CHỐNG TRÙNG LẶP
  // ==========================================
  const STYLE_ID = 'mod-su-do-master-css';

  function injectMasterStyles() {
    if (typeof document === 'undefined') return;
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      * {
        scrollbar-width: none !important;
        -ms-overflow-style: none !important;
      }
      *::-webkit-scrollbar {
        display: none !important;
        width: 0 !important;
        height: 0 !important;
      }
      
      .hud-phai:has(.su-do-panel) {
        width: 360px !important;
      }
      .hud-khung.mod-panel:has(.su-do-panel) {
        width: 360px !important;
        max-width: calc(100vw - 20px) !important;
      }
      .mod-panel-dau {
        display: flex !important;
        align-items: center !important;
        gap: 6px !important;
        white-space: nowrap !important;
        overflow: hidden !important;
      }
      .mod-panel-dau b {
        font-size: 13.5px !important;
        white-space: nowrap !important;
        flex-shrink: 0 !important;
      }
      .mod-panel-dau .hud-phu {
        font-size: 11px !important;
        white-space: nowrap !important;
        overflow: hidden !important;
        text-overflow: ellipsis !important;
      }

      .su-do-panel {
        font-family: inherit;
        color: var(--muc);
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      /* Tab bar 2 hàng gọn gàng, không bị cắt cụt chữ */
      .su-do-panel .ui-tabs {
        display: grid !important;
        grid-template-columns: repeat(3, 1fr) !important;
        gap: 4px !important;
        margin: 0 0 8px 0 !important;
      }
      .su-do-panel .ui-tabs > button {
        padding: 5px 2px !important;
        font-size: 11.5px !important;
        font-weight: 500 !important;
        white-space: nowrap !important;
        overflow: hidden !important;
        text-overflow: ellipsis !important;
        text-align: center !important;
      }

      .su-do-header {
        border: 1px solid var(--vien-hud);
        background: linear-gradient(180deg, rgba(218, 165, 32, 0.08) 0%, rgba(0,0,0,0.02) 100%);
        border-radius: 8px;
        padding: 8px 10px;
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .su-do-header-title {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 6px;
      }

      .su-do-title-text {
        font-size: 13.5px;
        font-weight: bold;
        color: var(--chu-do);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .su-do-header-sub {
        font-size: 11px;
        color: var(--muc-nhat);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .su-do-header-stats {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 11px;
        margin-top: 2px;
        padding-top: 4px;
        border-top: 1px dashed var(--vien-trong);
        white-space: nowrap;
      }
      .su-do-header-stats > span {
        display: inline-flex;
        align-items: center;
        gap: 2px;
        white-space: nowrap;
      }

      /* Thẻ bài đệ tử */
      .su-do-card {
        border: 1px solid var(--vien-hud);
        background: var(--nen-hud);
        border-radius: 8px;
        padding: 6px 8px;
        display: flex;
        flex-direction: column;
        gap: 5px;
        box-shadow: 0 1px 4px rgba(0,0,0,0.04);
        transition: border-color 0.2s ease;
      }
      .su-do-card:hover {
        border-color: var(--vien-muc);
      }
      .su-do-card.su-do-ma-hoa {
        border-color: #ef4444 !important;
        background: linear-gradient(180deg, rgba(239,68,68,0.08) 0%, var(--nen-hud) 100%) !important;
      }

      .su-do-avatar {
        width: 42px;
        height: 42px;
        border-radius: 50%;
        border: 1.5px solid var(--vien-hud, #d4c5a9);
        box-shadow: 0 1px 4px rgba(0,0,0,0.1);
        overflow: hidden;
        background-color: rgba(0,0,0,0.03);
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .su-do-avatar img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
      }

      .su-do-card-info {
        display: flex;
        flex-direction: column;
        gap: 2px;
        flex: 1 1 auto;
        min-width: 0;
        overflow: hidden;
      }

      .su-do-badge {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border-radius: 4px;
        line-height: 1.4;
        font-weight: 500;
        white-space: nowrap !important;
      }

      .su-do-progress-bar {
        flex: 1 1 auto;
        height: 5px;
        background: rgba(0,0,0,0.08);
        border-radius: 3px;
        overflow: hidden;
        position: relative;
        min-width: 40px;
      }
      .su-do-progress-val {
        height: 100%;
        background: linear-gradient(90deg, #10b981 0%, #059669 100%);
        border-radius: 3px;
        transition: width 0.3s ease;
      }
      .su-do-progress-val.su-do-progress-max {
        background: linear-gradient(90deg, #f59e0b 0%, #ef4444 100%);
      }

      .su-do-action-grid {
        display: flex;
        gap: 4px;
        align-items: center;
        margin-top: 2px;
      }
      .su-do-action-grid > button {
        flex: 1 1 0;
        min-width: 0;
        padding: 4px 4px !important;
        font-size: 11px !important;
        white-space: nowrap !important;
        text-align: center !important;
      }

      .su-do-action-subgrid {
        display: flex;
        gap: 4px;
        align-items: center;
        justify-content: space-between;
      }
      .su-do-action-subgrid > button {
        padding: 2px 6px !important;
        font-size: 10.5px !important;
        white-space: nowrap !important;
      }

      .su-do-btn-wrap {
        white-space: nowrap !important;
      }

      /* Card Kiến Thiết Đạo Tràng */
      .su-do-kienthiet-card {
        border: 1px solid var(--vien-hud);
        background: var(--nen-hud);
        border-radius: 8px;
        padding: 10px;
        display: flex;
        flex-direction: column;
        gap: 6px;
        box-shadow: 0 1px 4px rgba(0,0,0,0.03);
      }
      .su-do-kienthiet-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 6px;
      }
      .su-do-kienthiet-title {
        font-size: 13px;
        font-weight: bold;
        color: var(--chu-do);
        display: flex;
        align-items: center;
        gap: 4px;
      }

      /* Luận Kiếm Arena */
      .su-do-arena-box {
        border: 1px solid var(--vien-hud);
        background: linear-gradient(180deg, rgba(218,165,32,0.05) 0%, var(--nen-hud) 100%);
        border-radius: 8px;
        padding: 10px;
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .su-do-combat-log {
        background: rgba(0,0,0,0.03);
        border: 1px dashed var(--vien-trong);
        border-radius: 6px;
        padding: 8px;
        font-size: 11.5px;
        line-height: 1.5;
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      /* Dock HUD Widget */
      .su-do-dock-box {
        display: flex;
        flex-direction: column;
        gap: 5px;
        padding: 6px 8px;
        font-size: 11.5px;
        line-height: 1.3;
      }
    `;
    document.head.append(style);
  }

  // ==========================================
  // 4. KHAI BÁO CHÍNH CỦA BẢN MOD (EXPORT MOD SPEC)
  // ==========================================
  let unsubLifeEndListener = null;

  (window.tuTienMods ??= []).push({
    id: 'su_do',
    name: 'Sư Đồ Truyền Thừa',
    version: '1.1.0',
    apiVersion: 1,

    // ========================================================
    // PHA 1: BOOT (Đăng ký Modifier, Hành động, TickHook)
    // ========================================================
    boot(tt, mod) {
      mod.log('Mod Sư Đồ Truyền Thừa đang khởi động (Pha boot v1.1.0)');

      // Tiện ích sinh đệ tử ngẫu nhiên
      function taoDeTuNgauNhien(seed = 1, canhGioiNguoiChoi = 1) {
        const rng = () => {
          seed = (seed * 9301 + 49297) % 233280;
          return seed / 233280;
        };

        const HO_POOL = ['Lâm', 'Diệp', 'Tiêu', 'Sở', 'Vương', 'Lý', 'Bạch', 'Vũ', 'Trần', 'Hoàng', 'Dương', 'Phan', 'Hàn', 'Cố', 'Thẩm'];
        const DEM_NAM = ['Thanh', 'Văn', 'Nhật', 'Đình', 'Bảo', 'Minh', 'Thiên', 'Tuấn', 'Hải', 'Trọng', 'Bá', 'Vĩnh', 'Quốc'];
        const TEN_NAM = ['Phong', 'Hạo', 'Vũ', 'Hiên', 'Phàm', 'Dương', 'Nham', 'Kình', 'Vân', 'Lôi', 'Long', 'Châu', 'Đạt', 'Kiệt', 'Bân', 'Bình'];
        const DEM_NU = ['Thanh', 'Như', 'Ngọc', 'Tuyết', 'Bích', 'Tiểu', 'Diệu', 'Mộng', 'Tố', 'Linh', 'Thục', 'Nhã'];
        const TEN_NU = ['Vy', 'Dao', 'Nguyệt', 'Sương', 'Huyên', 'Nhi', 'Hân', 'Chi', 'Tâm', 'Liên', 'Yến', 'Trinh', 'Uyên', 'Thư', 'Châu'];

        const gioiTinh = rng() > 0.5 ? 'nam' : 'nu';
        const ho = HO_POOL[Math.floor(rng() * HO_POOL.length)];
        const dem = gioiTinh === 'nam' ? DEM_NAM[Math.floor(rng() * DEM_NAM.length)] : DEM_NU[Math.floor(rng() * DEM_NU.length)];
        const tenGoc = gioiTinh === 'nam' ? TEN_NAM[Math.floor(rng() * TEN_NAM.length)] : TEN_NU[Math.floor(rng() * TEN_NU.length)];
        const ten = `${ho} ${dem} ${tenGoc}`;

        const HE_POOL = ['kim', 'moc', 'thuy', 'hoa', 'tho', 'loi', 'phong', 'bang'];
        const heCount = rng() > 0.7 ? 2 : 1;
        const he = [];
        for (let i = 0; i < heCount; i++) {
          const h = HE_POOL[Math.floor(rng() * HE_POOL.length)];
          if (!he.includes(h)) he.push(h);
        }

        const TU_CHAT_LIST = [
          { id: 'pho_thong', tile: 0.5 },
          { id: 'kha', tile: 0.3 },
          { id: 'thien_tai', tile: 0.15 },
          { id: 'yeu_nghiet', tile: 0.05 },
        ];
        const rTc = rng();
        let tuChat = TU_CHAT_LIST[0];
        let acc = 0;
        for (const t of TU_CHAT_LIST) {
          acc += t.tile;
          if (rTc <= acc) {
            tuChat = t;
            break;
          }
        }

        const TINH_CACH_LIST = [
          { id: 'hieu_thuan', tile: 0.35 },
          { id: 'kien_dinh', tile: 0.35 },
          { id: 'kieu_ngao', tile: 0.15 },
          { id: 'can_man', tile: 0.15 },
        ];
        const rTch = rng();
        let tinhCach = TINH_CACH_LIST[0];
        let accTch = 0;
        for (const tc of TINH_CACH_LIST) {
          accTch += tc.tile;
          if (rTch <= accTch) {
            tinhCach = tc;
            break;
          }
        }

        const tieuCanhGioi = rng() > 0.6 ? 1 : 0;
        const canhGioi = 1;
        const tuoi = 14 + Math.floor(rng() * 6);

        return {
          id: `dt_${Date.now()}_${Math.floor(rng() * 100000)}_${Math.floor((Number(seed) || 0) % 1000)}`,
          ten,
          gioiTinh,
          tuoi,
          he,
          tuChat: tuChat.id,
          tinhCach: tinhCach.id,
          khuynhHuong: 'chinh_dao',
          canhGioi,
          tieuCanhGioi,
          tuVi: 0,
          tuViYeuCau: tuViYeuCauChoCanhGioi(canhGioi, tieuCanhGioi),
          haoCam: 60,
          doKy: 0,
          vaiVe: 'de_tu',
          congPhap: null,
          phapBao: null,
          trangThai: {
            loai: 'nha_roi',
            nhiemVu: null,
            soNam: 0,
            namBatDau: null,
            namHoanThanh: null,
            namConLai: 0,
            daThongBao: false,
          },
        };
      }

      function layTrangThaiMod(h) {
        const data = h.data() ?? {};
        data.version = Number(data.version) || 2;
        data.daoTrangTen = typeof data.daoTrangTen === 'string' && data.daoTrangTen.trim() ? data.daoTrangTen : 'Thanh Khê Đạo Tràng';
        data.danhSachDeTu = Array.isArray(data.danhSachDeTu) ? data.danhSachDeTu : [];
        data.ungVien = Array.isArray(data.ungVien) ? data.ungVien : [];
        data.nhatKy = Array.isArray(data.nhatKy) ? data.nhatKy : [];
        data.daoTrang ??= {};
        data.daoTrang.kienThiet ??= {};
        data.daoTrang.kienThiet.tuLinhTran ??= { cap: 0 };
        data.daoTrang.kienThiet.duocDien ??= { cap: 0, duocDongId: null, tienDo: 0 };
        data.daoTrang.kienThiet.luyenDanPhong ??= { cap: 0, danDongId: null, tienDo: 0 };
        data.daoTrang.chienBaoMoiNhat ??= null;
        return data;
      }

      function ghiNhatKy(data, text, nam = 1) {
        data.nhatKy ??= [];
        data.nhatKy.unshift({ nam: Number(nam) || 1, text, time: Date.now() });
        if (data.nhatKy.length > 60) data.nhatKy.pop();
      }

      // ==========================================
      // ACTIONS CỦA MOD (Giao dịch trạng thái an toàn)
      // ==========================================

      // Action: Mở kỳ tuyển đồ
      mod.addAction('tuyen_do', (ctx, args, h) => {
        const data = layTrangThaiMod(h);
        const nv = ctx.run?.nhanVat ?? {};
        const nam = ctx.run?.nam ?? 1;

        const uvs = [
          taoDeTuNgauNhien(h.random() * 1000 + 1, nv.canhGioi ?? 1),
          taoDeTuNgauNhien(h.random() * 2000 + 2, nv.canhGioi ?? 1),
          taoDeTuNgauNhien(h.random() * 3000 + 3, nv.canhGioi ?? 1),
        ];
        data.ungVien = uvs;
        ghiNhatKy(data, `Sư tôn mở kỳ tuyển mộ đồ đệ, có ${uvs.length} thiếu niên cầu đạo đến ứng tuyển.`, nam);
        h.setData(data);
        return 'khong_tick';
      });

      // Action: Đổi tên đạo tràng
      mod.addAction('doi_ten_dao_trang', (ctx, args, h) => {
        const data = layTrangThaiMod(h);
        const tenMoi = String(args?.ten ?? '').trim();
        if (!tenMoi) return 'khong_tick';
        data.daoTrangTen = tenMoi;
        ghiNhatKy(data, `Sư tôn đổi tên đạo tràng thành "${tenMoi}".`, ctx.run?.nam ?? 1);
        h.setData(data);
        return 'khong_tick';
      });

      // Action: Nhận đệ tử
      mod.addAction('nhan_de_tu', (ctx, args, h) => {
        const data = layTrangThaiMod(h);
        const nv = ctx.run?.nhanVat ?? {};
        const maxDt = sucChuaDeTu(nv.canhGioi ?? 0);

        if (data.danhSachDeTu.length >= maxDt) return 'khong_tick';

        const idx = Number(args?.index);
        if (Number.isNaN(idx) || idx < 0 || idx >= data.ungVien.length) return 'khong_tick';

        const deTuMoi = data.ungVien.splice(idx, 1)[0];
        if (data.danhSachDeTu.length === 0) {
          deTuMoi.vaiVe = 'dai_su_huynh';
        }

        data.danhSachDeTu.push(deTuMoi);
        const danhXung = deTuMoi.gioiTinh === 'nu' ? 'Đại Sư Tỷ' : 'Đại Sư Huynh';
        const vaiVeStr = deTuMoi.vaiVe === 'dai_su_huynh' ? ` (Sắc phong: ${danhXung})` : '';
        ghiNhatKy(data, `Đón nhận đệ tử ${deTuMoi.ten} gia nhập bổn môn${vaiVeStr}.`, ctx.run?.nam ?? 1);
        h.setData(data);
        return 'khong_tick';
      });

      // Action: Luận đạo / Đàm tâm
      mod.addAction('luan_dao', (ctx, args, h) => {
        const data = layTrangThaiMod(h);
        const dt = data.danhSachDeTu.find((d) => d.id === args?.deTuId);
        if (!dt) return 'khong_tick';
        if (dt.trangThai?.loai === 'lich_luyen') return 'khong_tick';

        const huong = args?.huong ?? 'chinh_dao';
        dt.khuynhHuong = huong;
        dt.haoCam = Math.min(100, (Number(dt.haoCam) || 0) + 12);
        dt.doKy = Math.max(0, (Number(dt.doKy) || 0) - 10);

        const tenHuong = KHUYNH_HUONG_MAP[huong] ?? huong;
        ghiNhatKy(data, `Sư tôn vấn đạo cùng ${dt.ten}, định hướng theo con đường ${tenHuong}. Hảo cảm tăng tiến.`, ctx.run?.nam ?? 1);
        h.setData(data);
        return 'khong_tick';
      });

      // Action: Truyền công quán đảnh
      mod.addAction('truyen_cong', (ctx, args, h) => {
        const data = layTrangThaiMod(h);
        const dt = data.danhSachDeTu.find((d) => d.id === args?.deTuId);
        if (!dt) return 'khong_tick';
        if (dt.trangThai?.loai === 'lich_luyen') return 'khong_tick';

        const req = Math.max(1, Number(dt.tuViYeuCau) || 1);
        const cur = Math.max(0, Number(dt.tuVi) || 0);
        if (cur >= req) return 'khong_tick';

        const nv = ctx.run?.nhanVat;
        if (!nv || (Number(nv.tuVi) || 0) < 1.0) return 'khong_tick';

        nv.tuVi = Math.max(0, (Number(nv.tuVi) || 0) - 1.0);
        const tang = Math.round(req * 0.25);
        dt.tuVi = Math.min(req, cur + tang);
        dt.haoCam = Math.min(100, (Number(dt.haoCam) || 0) + 15);

        // Đệ tử kiêu ngạo khác tăng đố kỵ nhẹ
        data.danhSachDeTu.forEach((d) => {
          if (d.id !== dt.id && (d.tinhCach === 'kieu_ngao' || d.khuynhHuong === 'ma_dao')) {
            d.doKy = Math.min(100, (Number(d.doKy) || 0) + 6);
          }
        });

        ghiNhatKy(data, `Sư tôn quán đảnh truyền công cho ${dt.ten}, tăng ${tang} tu vi.`, ctx.run?.nam ?? 1);
        h.setData(data);
        return 'khong_tick';
      });

      // Action: Ban thưởng linh thạch
      mod.addAction('ban_thuong', (ctx, args, h) => {
        const data = layTrangThaiMod(h);
        const dt = data.danhSachDeTu.find((d) => d.id === args?.deTuId);
        if (!dt) return 'khong_tick';
        if (dt.trangThai?.loai === 'lich_luyen') return 'khong_tick';

        const nv = ctx.run?.nhanVat;
        const soTien = Math.max(10, Number(args?.soTien) || 30);
        if (!nv || (Number(nv.linhThach) || 0) < soTien) return 'khong_tick';

        nv.linhThach = Math.max(0, (Number(nv.linhThach) || 0) - soTien);
        dt.haoCam = Math.min(100, (Number(dt.haoCam) || 0) + 10);
        dt.doKy = Math.max(0, (Number(dt.doKy) || 0) - 15);

        ghiNhatKy(data, `Sư tôn ban thưởng ${soTien} linh thạch cho đồ đệ ${dt.ten}.`, ctx.run?.nam ?? 1);
        h.setData(data);
        return 'khong_tick';
      });

      // Action: Luận bàn đấu pháp
      mod.addAction('dau_phap', (ctx, args, h) => {
        const data = layTrangThaiMod(h);
        const dt = data.danhSachDeTu.find((d) => d.id === args?.deTuId);
        if (!dt) return 'khong_tick';
        if (dt.trangThai?.loai === 'lich_luyen') return 'khong_tick';

        const req = Math.max(1, Number(dt.tuViYeuCau) || 1);
        const cur = Math.max(0, Number(dt.tuVi) || 0);
        const tang = Math.round(req * 0.1);
        dt.tuVi = Math.min(req, cur + tang);
        dt.haoCam = Math.min(100, (Number(dt.haoCam) || 0) + 5);

        ghiNhatKy(data, `Sư tôn hạ mình luận bàn đấu pháp cùng ${dt.ten}, chỉ điểm kiếm quyết.`, ctx.run?.nam ?? 1);
        h.setData(data);
        return 'khong_tick';
      });

      // Action: Hộ pháp đột phá / Độ kiếp
      mod.addAction('ho_phap', (ctx, args, h) => {
        const data = layTrangThaiMod(h);
        const dt = data.danhSachDeTu.find((d) => d.id === args?.deTuId);
        if (!dt) return 'khong_tick';
        if (dt.trangThai?.loai === 'lich_luyen') return 'khong_tick';

        const laDinhPhong = (Number(dt.canhGioi) || 1) >= 5 && (Number(dt.tieuCanhGioi) || 0) >= 3;
        if (laDinhPhong) return 'khong_tick';

        const curReq = Math.max(1, Number(dt.tuViYeuCau) || 1);
        const curVal = Math.max(0, Number(dt.tuVi) || 0);
        if (curVal < curReq) return 'khong_tick';

        const nv = ctx.run?.nhanVat ?? {};
        const nam = ctx.run?.nam ?? 1;
        const cach = args?.cach ?? 'chi_dan';
        const laDaiCanhGioi = (Number(dt.tieuCanhGioi) || 0) >= 3;
        const tuLuyenKhiLenTrucCo = dt.canhGioi === 1 && laDaiCanhGioi;
        const doKiepThucSu = dt.canhGioi >= 2 && laDaiCanhGioi;

        let tiLe = 0.6;
        if (!laDaiCanhGioi) {
          if (cach === 'chi_dan') {
            if ((Number(nv.tuVi) || 0) < 0.2) return 'khong_tick';
            nv.tuVi = Math.max(0, (Number(nv.tuVi) || 0) - 0.2);
            tiLe = 1.0;
          } else if (cach === 'ban_dan') {
            if ((Number(nv.linhThach) || 0) < 30) return 'khong_tick';
            nv.linhThach = Math.max(0, (Number(nv.linhThach) || 0) - 30);
            tiLe = 0.85;
          } else {
            tiLe = 0.6;
          }
        } else if (tuLuyenKhiLenTrucCo) {
          if (cach === 'ho_phap') {
            if ((Number(nv.tuVi) || 0) < 0.5) return 'khong_tick';
            nv.tuVi = Math.max(0, (Number(nv.tuVi) || 0) - 0.5);
            tiLe = 1.0;
          } else if (cach === 'ban_dan') {
            const tui = window.tuTien?.core?.['character/tui_do'];
            const coDan = (Number(nv.tuiDo?.['item.truc_co_dan']) || 0) > 0;
            if (coDan && tui) {
              tui.layKhoiTui(ctx, 'item.truc_co_dan', 1);
            } else if ((Number(nv.linhThach) || 0) >= 80) {
              nv.linhThach = Math.max(0, (Number(nv.linhThach) || 0) - 80);
            } else {
              return 'khong_tick';
            }
            tiLe = 0.9;
          } else {
            tiLe = 0.5;
          }
        } else {
          if (cach === 'ganh_loi_kiep') {
            nv.thuongThe = Math.min(3, (Number(nv.thuongThe) || 0) + 1);
            tiLe = 1.0;
          } else if (cach === 'ban_dan') {
            const tui = window.tuTien?.core?.['character/tui_do'];
            const coDan = (Number(nv.tuiDo?.['item.su_do_ho_mach_dan']) || 0) > 0;
            if (coDan && tui) {
              tui.layKhoiTui(ctx, 'item.su_do_ho_mach_dan', 1);
            } else if ((Number(nv.linhThach) || 0) >= 100) {
              nv.linhThach = Math.max(0, (Number(nv.linhThach) || 0) - 100);
            } else {
              return 'khong_tick';
            }
            tiLe = 0.8;
          } else {
            tiLe = 0.5;
          }
        }

        const thanhCong = h.random() <= tiLe;
        if (thanhCong) {
          if (laDaiCanhGioi) {
            dt.canhGioi = (Number(dt.canhGioi) || 1) + 1;
            dt.tieuCanhGioi = 0;
          } else {
            dt.tieuCanhGioi = (Number(dt.tieuCanhGioi) || 0) + 1;
          }
          dt.tuVi = 0;
          dt.tuViYeuCau = tuViYeuCauChoCanhGioi(dt.canhGioi, dt.tieuCanhGioi);
          dt.haoCam = Math.min(100, (Number(dt.haoCam) || 0) + 20);
          dt.doKy = Math.max(0, (Number(dt.doKy) || 0) - 10);

          const cgMoi = dinhDangCanhGioi(dt.canhGioi, dt.tieuCanhGioi);
          const loaiDotPhaStr = doKiepThucSu ? 'vượt qua Lôi Kiếp, độ kiếp thành công' : 'đột phá đại thành';
          ghiNhatKy(data, `🎉 Đệ tử ${dt.ten} đã ${loaiDotPhaStr}, bước chân vào ${cgMoi}!`, nam);
        } else {
          dt.tuVi = Math.floor(curReq * 0.5);
          dt.haoCam = Math.max(0, (Number(dt.haoCam) || 0) - 10);
          ghiNhatKy(data, `⚠️ Đệ tử ${dt.ten} xung kích quan ải thất bại, khí huyết nghịch hành, tổn thất 50% tu vi.`, nam);
        }

        h.setData(data);
        return 'khong_tick';
      });

      // Action: Sắc phong Đại Sư Huynh / Tỷ
      mod.addAction('bo_nhiem', (ctx, args, h) => {
        const data = layTrangThaiMod(h);
        const dt = data.danhSachDeTu.find((d) => d.id === args?.deTuId);
        if (!dt) return 'khong_tick';

        data.danhSachDeTu.forEach((d) => {
          if (d.vaiVe === 'dai_su_huynh') d.vaiVe = 'de_tu';
        });

        dt.vaiVe = 'dai_su_huynh';
        dt.haoCam = Math.min(100, (Number(dt.haoCam) || 0) + 25);
        dt.doKy = 0;

        const danhXung = dt.gioiTinh === 'nu' ? 'Đại Sư Tỷ' : 'Đại Sư Huynh';
        ghiNhatKy(data, `Sư tôn sắc phong ${dt.ten} làm ${danhXung} đứng đầu môn phái, thống lĩnh các đồng môn!`, ctx.run?.nam ?? 1);
        h.setData(data);
        return 'khong_tick';
      });

      // Action: Phái đi lịch luyện
      mod.addAction('phai_lich_luyen', (ctx, args, h) => {
        const data = layTrangThaiMod(h);
        const dt = data.danhSachDeTu.find((d) => d.id === args?.deTuId);
        if (!dt) return 'khong_tick';
        if (dt.trangThai?.loai === 'lich_luyen') return 'khong_tick';

        const curNam = Number(ctx.run?.nam) || 1;
        const nvKey = args?.nhiemVu && NHIEM_VU_LICH_LUYEN[args.nhiemVu] ? args.nhiemVu : 'hai_duoc';
        const nvConfig = NHIEM_VU_LICH_LUYEN[nvKey];
        const soNam = Math.max(1, Math.min(10, Number(args?.soNam) || nvConfig.soNamMacDinh));

        dt.trangThai = {
          loai: 'lich_luyen',
          nhiemVu: nvKey,
          soNam,
          namBatDau: curNam,
          namHoanThanh: Math.round((curNam + soNam) * 100) / 100,
          namConLai: soNam,
          daThongBao: false,
        };

        ghiNhatKy(data, `Sư tôn lệnh cho đệ tử ${dt.ten} xuất sơn lịch luyện: "${nvConfig.ten}" trong ${soNam} năm.`, curNam);
        h.setData(data);
        return 'khong_tick';
      });

      // Action: Thu hoạch lịch luyện
      mod.addAction('thu_hoach_lich_luyen', (ctx, args, h) => {
        const data = layTrangThaiMod(h);
        const dt = data.danhSachDeTu.find((d) => d.id === args?.deTuId);
        if (!dt) return 'khong_tick';
        if (dt.trangThai?.loai !== 'lich_luyen') return 'khong_tick';

        dongBoTienDoLichLuyen(dt, ctx.run?.nam ?? 1);
        if ((Number(dt.trangThai?.namConLai) || 0) > 0) return 'khong_tick';

        const nvKey = dt.trangThai.nhiemVu ?? 'hai_duoc';
        const nvConfig = NHIEM_VU_LICH_LUYEN[nvKey] ?? NHIEM_VU_LICH_LUYEN.hai_duoc;
        const thuong = nvConfig.tinhThuong(h);

        const nv = ctx.run?.nhanVat ?? {};
        if (thuong.linhThach) {
          nv.linhThach = (Number(nv.linhThach) || 0) + thuong.linhThach;
        }
        if (thuong.vatPham && window.tuTien?.core?.['character/tui_do']) {
          window.tuTien.core['character/tui_do'].nhanVaoTui(ctx, thuong.vatPham, thuong.soLuong || 1);
        }

        const tuViThuong = Math.round(dt.tuViYeuCau * 0.25);
        dt.tuVi = Math.min(dt.tuViYeuCau, (Number(dt.tuVi) || 0) + tuViThuong);
        dt.haoCam = Math.min(100, (Number(dt.haoCam) || 0) + 10);

        dt.trangThai = {
          loai: 'nha_roi',
          nhiemVu: null,
          soNam: 0,
          namBatDau: null,
          namHoanThanh: null,
          namConLai: 0,
          daThongBao: false,
        };

        ghiNhatKy(data, `Đệ tử ${dt.ten} hoàn thành lịch luyện xuất sơn trở về, ${thuong.moTa}, tăng ${tuViThuong} tu vi!`, ctx.run?.nam ?? 1);
        h.setData(data);
        return 'khong_tick';
      });

      // Action: Trục xuất đồ đệ
      mod.addAction('truc_xuat', (ctx, args, h) => {
        const data = layTrangThaiMod(h);
        const idx = data.danhSachDeTu.findIndex((d) => d.id === args?.deTuId);
        if (idx < 0) return 'khong_tick';

        const dt = data.danhSachDeTu.splice(idx, 1)[0];
        if (dt.vaiVe === 'dai_su_huynh' && data.danhSachDeTu.length > 0) {
          data.danhSachDeTu[0].vaiVe = 'dai_su_huynh';
          const danhXung = data.danhSachDeTu[0].gioiTinh === 'nu' ? 'Đại Sư Tỷ' : 'Đại Sư Huynh';
          ghiNhatKy(data, `Vị trí thủ tịch trống, tự động chuyển giao danh hiệu ${danhXung} cho ${data.danhSachDeTu[0].ten}.`, ctx.run?.nam ?? 1);
        }

        ghiNhatKy(data, `Sư tôn trục xuất đồ đệ ${dt.ten} khỏi môn phái, đoạn tuyệt duyên phận sư đồ.`, ctx.run?.nam ?? 1);
        h.setData(data);
        return 'khong_tick';
      });

      // ==========================================
      // CÁC HÀNH ĐỘNG MỚI (ĐẠI TU TRỤ CỘT 1, 2, 3)
      // ==========================================

      // Action: Nâng cấp kiến thiết Đạo Tràng (Tụ Linh Trận, Dược Điền, Luyện Đan Phòng)
      mod.addAction('nang_cap_kien_thiet', (ctx, args, h) => {
        const data = layTrangThaiMod(h);
        const loai = args?.loai; // 'tuLinhTran' | 'duocDien' | 'luyenDanPhong'
        const nv = ctx.run?.nhanVat;
        if (!nv) return 'khong_tick';

        let configList = null;
        let obj = null;
        let tenKienTruc = '';

        if (loai === 'tuLinhTran') {
          configList = TU_LINH_TRAN_CONFIG;
          obj = data.daoTrang.kienThiet.tuLinhTran;
          tenKienTruc = 'Tụ Linh Trận';
        } else if (loai === 'duocDien') {
          configList = DUOC_DIEN_CONFIG;
          obj = data.daoTrang.kienThiet.duocDien;
          tenKienTruc = 'Dược Điền';
        } else if (loai === 'luyenDanPhong') {
          configList = LUYEN_DAN_CONFIG;
          obj = data.daoTrang.kienThiet.luyenDanPhong;
          tenKienTruc = 'Luyện Đan Các';
        } else {
          return 'khong_tick';
        }

        const capHienTai = Number(obj.cap) || 0;
        const curCfg = configList[capHienTai];
        const phi = curCfg?.phi;
        if (phi == null) return 'khong_tick'; // Đã đạt cấp tối đa

        if ((Number(nv.linhThach) || 0) < phi) return 'khong_tick';

        nv.linhThach = Math.max(0, (Number(nv.linhThach) || 0) - phi);
        obj.cap = capHienTai + 1;
        const nextCfg = configList[obj.cap];

        ghiNhatKy(data, `Sư tôn tiêu hao ${phi} linh thạch, nâng cấp ${tenKienTruc} lên ${nextCfg.ten} (Cấp ${obj.cap})!`, ctx.run?.nam ?? 1);
        h.setData(data);
        return 'khong_tick';
      });

      // Action: Phân công đệ tử coi sóc Dược Điền / Đan Các
      mod.addAction('phan_cong_chuc_nghiep', (ctx, args, h) => {
        const data = layTrangThaiMod(h);
        const loai = args?.loai; // 'duocDien' | 'luyenDanPhong'
        const deTuId = args?.deTuId;

        if (loai === 'duocDien') {
          data.daoTrang.kienThiet.duocDien.duocDongId = deTuId || null;
          const dt = data.danhSachDeTu.find((d) => d.id === deTuId);
          const ten = dt ? dt.ten : 'Không ai';
          ghiNhatKy(data, `Bổ nhiệm ${ten} làm Dược Đồng coi sóc Dược Điền tông môn.`, ctx.run?.nam ?? 1);
        } else if (loai === 'luyenDanPhong') {
          data.daoTrang.kienThiet.luyenDanPhong.danDongId = deTuId || null;
          const dt = data.danhSachDeTu.find((d) => d.id === deTuId);
          const ten = dt ? dt.ten : 'Không ai';
          ghiNhatKy(data, `Bổ nhiệm ${ten} làm Đan Đồng chấp chưởng lò luyện đan.`, ctx.run?.nam ?? 1);
        }

        h.setData(data);
        return 'khong_tick';
      });

      // Action: Truyền thụ công pháp từ túi đồ
      mod.addAction('truyen_cong_phap', (ctx, args, h) => {
        const data = layTrangThaiMod(h);
        const dt = data.danhSachDeTu.find((d) => d.id === args?.deTuId);
        if (!dt || dt.trangThai?.loai === 'lich_luyen') return 'khong_tick';

        const itemId = args?.itemId;
        const nv = ctx.run?.nhanVat;
        const tuiMod = window.tuTien?.core?.['character/tui_do'];
        if (!nv || !itemId || !tuiMod) return 'khong_tick';

        const so = nv.tuiDo?.[itemId] ?? 0;
        if (so < 1) return 'khong_tick';

        tuiMod.layKhoiTui(ctx, itemId, 1);
        const itemDef = ctx.content?.items?.get(itemId);
        const tenCp = itemDef?.ten || {
          'item.su_do_huyen_thien_tam_phap': 'Huyền Thiên Tâm Pháp',
          'item.dan_khi_quyet': 'Dẫn Khí Quyết',
          'item.tho_nap_phap': 'Thổ Nạp Pháp',
        }[itemId] || itemId;

        dt.congPhap = {
          id: itemId,
          ten: tenCp,
          phamCap: itemDef?.pham_cap || 1,
          he: itemDef?.he || ['vo_sac'],
        };
        dt.haoCam = Math.min(100, (Number(dt.haoCam) || 0) + 20);
        dt.doKy = Math.max(0, (Number(dt.doKy) || 0) - 25);

        ghiNhatKy(data, `Sư tôn truyền thụ bí kíp công pháp "${dt.congPhap.ten}" cho đệ tử ${dt.ten}!`, ctx.run?.nam ?? 1);
        h.setData(data);
        return 'khong_tick';
      });

      // Action: Ban tặng Pháp khí bảo vật từ túi đồ
      mod.addAction('ban_phap_bao', (ctx, args, h) => {
        const data = layTrangThaiMod(h);
        const dt = data.danhSachDeTu.find((d) => d.id === args?.deTuId);
        if (!dt || dt.trangThai?.loai === 'lich_luyen') return 'khong_tick';

        const itemId = args?.itemId;
        const nv = ctx.run?.nhanVat;
        const tuiMod = window.tuTien?.core?.['character/tui_do'];
        if (!nv || !itemId || !tuiMod) return 'khong_tick';

        const so = nv.tuiDo?.[itemId] ?? 0;
        if (so < 1) return 'khong_tick';

        tuiMod.layKhoiTui(ctx, itemId, 1);
        const itemDef = ctx.content?.items?.get(itemId);
        const tenPb = itemDef?.ten || {
          'item.su_do_chan_truyen_phap_bao': 'Trấn Môn Thanh Phong Kiếm',
          'item.su_do_ho_menh_ngoc_bai': 'Ngọc Bài Hộ Mệnh',
          'item.cot_thu': 'Cốt Thủ',
          'item.thau_cot_cham': 'Thấu Cốt Châm',
          'item.xich_viem_phu': 'Xích Viêm Phù',
        }[itemId] || itemId;

        dt.phapBao = {
          id: itemId,
          ten: tenPb,
          phamCap: itemDef?.pham_cap || 1,
          he: itemDef?.he || ['vo_sac'],
        };
        dt.haoCam = Math.min(100, (Number(dt.haoCam) || 0) + 25);
        dt.doKy = Math.max(0, (Number(dt.doKy) || 0) - 20);

        ghiNhatKy(data, `Sư tôn ban tặng pháp bảo "${dt.phapBao.ten}" cho ${dt.ten}, tăng cường chiến lực!`, ctx.run?.nam ?? 1);
        h.setData(data);
        return 'khong_tick';
      });

      // Action: Ban tặng đan dược bồi bổ tu vi từ túi đồ
      mod.addAction('ban_dan_duoc', (ctx, args, h) => {
        const data = layTrangThaiMod(h);
        const dt = data.danhSachDeTu.find((d) => d.id === args?.deTuId);
        if (!dt || dt.trangThai?.loai === 'lich_luyen') return 'khong_tick';

        const itemId = args?.itemId;
        const nv = ctx.run?.nhanVat;
        const tuiMod = window.tuTien?.core?.['character/tui_do'];
        if (!nv || !itemId || !tuiMod) return 'khong_tick';

        const so = nv.tuiDo?.[itemId] ?? 0;
        if (so < 1) return 'khong_tick';

        tuiMod.layKhoiTui(ctx, itemId, 1);
        const itemDef = ctx.content?.items?.get(itemId);
        const phamCap = itemDef?.pham_cap || 1;
        const tangTuVi = 15 * phamCap;

        dt.tuVi = Math.min(dt.tuViYeuCau, (Number(dt.tuVi) || 0) + tangTuVi);
        dt.haoCam = Math.min(100, (Number(dt.haoCam) || 0) + 12);
        dt.doKy = Math.max(0, (Number(dt.doKy) || 0) - 10);

        ghiNhatKy(data, `Sư tôn ban tặng linh đan "${itemDef?.ten || itemId}" cho ${dt.ten}, hấp thu tăng ${tangTuVi} tu vi!`, ctx.run?.nam ?? 1);
        h.setData(data);
        return 'khong_tick';
      });

      // Action: Luận Kiếm Tông Môn (Tỉ thí giữa 2 đệ tử)
      mod.addAction('luan_kiem_noi_mon', (ctx, args, h) => {
        const data = layTrangThaiMod(h);
        const dtA = data.danhSachDeTu.find((d) => d.id === args?.deTuIdA);
        const dtB = data.danhSachDeTu.find((d) => d.id === args?.deTuIdB);
        if (!dtA || !dtB || dtA.id === dtB.id) return 'khong_tick';
        if (dtA.trangThai?.loai === 'lich_luyen' || dtB.trangThai?.loai === 'lich_luyen') return 'khong_tick';

        // 1. Tính điểm cơ bản
        const baseA = (Number(dtA.canhGioi) || 1) * 100 + (Number(dtA.tieuCanhGioi) || 0) * 25;
        const baseB = (Number(dtB.canhGioi) || 1) * 100 + (Number(dtB.tieuCanhGioi) || 0) * 25;

        const tcBonusA = TU_CHAT_MAP[dtA.tuChat]?.diemLuanKiem || 15;
        const tcBonusB = TU_CHAT_MAP[dtB.tuChat]?.diemLuanKiem || 15;

        const cpBonusA = (dtA.congPhap?.phamCap || 0) * 20;
        const cpBonusB = (dtB.congPhap?.phamCap || 0) * 20;

        const pbBonusA = (dtA.phapBao?.phamCap || 0) * 25;
        const pbBonusB = (dtB.phapBao?.phamCap || 0) * 25;

        // 2. Ngũ hành tương khắc
        let heBonusA = 0;
        let heBonusB = 0;
        const heA = dtA.he?.[0] || 'vo_sac';
        const heB = dtB.he?.[0] || 'vo_sac';

        if (NGU_HANH_KHAC[heA] === heB) heBonusA += 30;
        if (NGU_HANH_KHAC[heB] === heA) heBonusB += 30;

        const rngA = (h.random() - 0.5) * 40;
        const rngB = (h.random() - 0.5) * 40;

        const totalA = baseA + tcBonusA + cpBonusA + pbBonusA + heBonusA + rngA;
        const totalB = baseB + tcBonusB + cpBonusB + pbBonusB + heBonusB + rngB;

        const dtWin = totalA >= totalB ? dtA : dtB;
        const dtLose = totalA >= totalB ? dtB : dtA;

        // Thưởng phạt
        const thuongTuVi = Math.round(dtWin.tuViYeuCau * 0.15);
        dtWin.tuVi = Math.min(dtWin.tuViYeuCau, (Number(dtWin.tuVi) || 0) + thuongTuVi);
        dtWin.haoCam = Math.min(100, (Number(dtWin.haoCam) || 0) + 10);

        dtLose.doKy = Math.max(0, (Number(dtLose.doKy) || 0) - 20);
        dtLose.haoCam = Math.min(100, (Number(dtLose.haoCam) || 0) + 5);

        // Tạo bản chiến báo kịch tính
        const chienBao = {
          nam: ctx.run?.nam ?? 1,
          time: Date.now(),
          deTuA: { id: dtA.id, ten: dtA.ten, canhGioi: dinhDangCanhGioi(dtA.canhGioi, dtA.tieuCanhGioi), he: dinhDangHe(dtA.he) },
          deTuB: { id: dtB.id, ten: dtB.ten, canhGioi: dinhDangCanhGioi(dtB.canhGioi, dtB.tieuCanhGioi), he: dinhDangHe(dtB.he) },
          thang: dtWin.id,
          thangTen: dtWin.ten,
          hiep1: `Hiệp 1: ${dtA.ten} vận chuyển khí tức ngũ hành giao phong cùng ${dtB.ten}, quyền kiếm va chạm phát ra tiếng sấm rền!`,
          hiep2: dtWin.congPhap
            ? `Hiệp 2: ${dtWin.ten} tế xuất tâm pháp "${dtWin.congPhap.ten}", thế trận dần nghiêng về phía ${dtWin.ten}!`
            : `Hiệp 2: ${dtWin.ten} nắm bắt sơ hở của đối phương, liên tục dồn ép đối thủ!`,
          chungCuoc: `Chung cuộc: Bằng một chiêu biến hóa xuất thần, ${dtWin.ten} đã đánh bại ${dtLose.ten}, giành chiến thắng vang dội!`,
        };

        data.daoTrang.chienBaoMoiNhat = chienBao;
        ghiNhatKy(data, `⚔️ Luận Kiếm Tông Môn: ${dtWin.ten} đả bại ${dtLose.ten}, nhận được sự tán thưởng của toàn thể sư môn!`, ctx.run?.nam ?? 1);
        h.setData(data);
        return 'khong_tick';
      });

      // Action: Cảm hóa nghịch đồ ma hóa
      mod.addAction('cam_hoa_nghich_do', (ctx, args, h) => {
        const data = layTrangThaiMod(h);
        const dt = data.danhSachDeTu.find((d) => d.id === args?.deTuId);
        if (!dt || dt.trangThai?.loai !== 'ma_hoa') return 'khong_tick';

        const nv = ctx.run?.nhanVat;
        if (!nv || (Number(nv.linhThach) || 0) < 80 || (Number(nv.tuVi) || 0) < 0.5) return 'khong_tick';

        nv.linhThach = Math.max(0, (Number(nv.linhThach) || 0) - 80);
        nv.tuVi = Math.max(0, (Number(nv.tuVi) || 0) - 0.5);

        dt.trangThai = { loai: 'nha_roi', nhiemVu: null, soNam: 0, namBatDau: null, namHoanThanh: null, namConLai: 0, daThongBao: false };
        dt.khuynhHuong = 'chinh_dao';
        dt.tinhCach = 'kien_dinh';
        dt.doKy = 0;
        dt.haoCam = 80;

        ghiNhatKy(data, `❤️ Sư tôn dùng đại đạo chân tâm cảm hóa ${dt.ten}, tiêu trừ tâm ma ma hóa, quy phục chính đạo!`, ctx.run?.nam ?? 1);
        h.setData(data);
        return 'khong_tick';
      });

      // Action: Phế truất tu vi & Trục xuất ma đồ
      mod.addAction('phe_truc_xuat_nghich_do', (ctx, args, h) => {
        const data = layTrangThaiMod(h);
        const idx = data.danhSachDeTu.findIndex((d) => d.id === args?.deTuId);
        if (idx < 0) return 'khong_tick';

        const dt = data.danhSachDeTu.splice(idx, 1)[0];
        const tuiMod = window.tuTien?.core?.['character/tui_do'];
        if (dt.phapBao?.id && tuiMod) {
          tuiMod.nhanVaoTui(ctx, dt.phapBao.id, 1);
        }

        ghiNhatKy(data, `🚫 Sư tôn phế bỏ tu vi nghịch đồ ${dt.ten}, thu hồi pháp bảo và trục xuất vĩnh viễn khỏi sơn môn!`, ctx.run?.nam ?? 1);
        h.setData(data);
        return 'khong_tick';
      });

      // Action: Trừ ma vệ đạo (Trảm diệt nghịch đồ)
      mod.addAction('tru_ma_ve_dao', (ctx, args, h) => {
        const data = layTrangThaiMod(h);
        const idx = data.danhSachDeTu.findIndex((d) => d.id === args?.deTuId);
        if (idx < 0) return 'khong_tick';

        const dt = data.danhSachDeTu.splice(idx, 1)[0];
        const nv = ctx.run?.nhanVat;
        if (nv) {
          nv.linhThach = (Number(nv.linhThach) || 0) + 50;
        }

        const tuiMod = window.tuTien?.core?.['character/tui_do'];
        if (tuiMod) {
          tuiMod.nhanVaoTui(ctx, 'item.su_do_nghich_do_ma_hoan', 1);
        }

        ghiNhatKy(data, `⚔️ Sư tôn đích thân trảm ma vệ đạo, thanh lý môn hộ ${dt.ten}, thu được 50 linh thạch và Nghịch Đồ Ma Hoán!`, ctx.run?.nam ?? 1);
        h.setData(data);
        return 'khong_tick';
      });

      // ==========================================
      // VÒNG LẶP THẾ GIỚI (Tick hook đa tầng)
      // ==========================================
      mod.addTickHook((ctx, years, h) => {
        const data = layTrangThaiMod(h);
        const nam = ctx.run?.nam ?? 1;
        const nv = ctx.run?.nhanVat;

        // 1. Tụ Linh Trận tăng tu vi cho đệ tử & Sư Tôn
        const capTLT = Number(data.daoTrang.kienThiet.tuLinhTran.cap) || 0;
        const cfgTLT = TU_LINH_TRAN_CONFIG[capTLT] ?? TU_LINH_TRAN_CONFIG[0];

        if (nv && cfgTLT.suTonTuVi > 0) {
          nv.tuVi = (Number(nv.tuVi) || 0) + Math.round(years * cfgTLT.suTonTuVi * 10) / 10;
        }

        // 2. Dược Điền sản xuất thảo dược
        const capDD = Number(data.daoTrang.kienThiet.duocDien.cap) || 0;
        const cfgDD = DUOC_DIEN_CONFIG[capDD] ?? DUOC_DIEN_CONFIG[0];
        if (capDD > 0 && cfgDD.sanPham.length > 0) {
          const duocDong = data.danhSachDeTu.find((d) => d.id === data.daoTrang.kienThiet.duocDien.duocDongId);
          const hasBonusDD = duocDong && (duocDong.he?.includes('moc') || duocDong.he?.includes('thuy') || duocDong.tinhCach === 'can_man');
          const tocDoDD = cfgDD.tocDo * (hasBonusDD ? 1.5 : 1.0);
          data.daoTrang.kienThiet.duocDien.tienDo = (Number(data.daoTrang.kienThiet.duocDien.tienDo) || 0) + years * tocDoDD;

          if (data.daoTrang.kienThiet.duocDien.tienDo >= 2.0) {
            data.daoTrang.kienThiet.duocDien.tienDo -= 2.0;
            const itemId = cfgDD.sanPham[Math.floor(h.random() * cfgDD.sanPham.length)];
            const tuiMod = window.tuTien?.core?.['character/tui_do'];
            if (tuiMod) {
              tuiMod.nhanVaoTui(ctx, itemId, 1);
              const tenSp = ctx.content?.items?.get(itemId)?.ten || {
                'item.su_do_duoc_dien_linh_thoc': 'Thượng Cổ Linh Thảo',
                'item.su_do_tuyet_lien_tra': 'Tuyết Liên Linh Trà',
                'item.su_do_ho_mach_dan': 'Hộ Mạch Tụ Khí Đan',
              }[itemId] || itemId;
              ghiNhatKy(data, `🌾 Dược Điền bội thu! Dược đồng ${duocDong ? duocDong.ten : 'Đạo tràng'} thu hoạch 1 ${tenSp} nhập vào túi trữ vật sư tôn.`, nam);
            }
          }
        }

        // 3. Luyện Đan Các luyện đan
        const capLDP = Number(data.daoTrang.kienThiet.luyenDanPhong.cap) || 0;
        const cfgLDP = LUYEN_DAN_CONFIG[capLDP] ?? LUYEN_DAN_CONFIG[0];
        if (capLDP > 0 && cfgLDP.sanPham) {
          const danDong = data.danhSachDeTu.find((d) => d.id === data.daoTrang.kienThiet.luyenDanPhong.danDongId);
          const hasBonusLDP = danDong && (danDong.he?.includes('hoa') || danDong.he?.includes('kim'));
          const tocDoLDP = cfgLDP.tocDo * (hasBonusLDP ? 1.5 : 1.0);
          data.daoTrang.kienThiet.luyenDanPhong.tienDo = (Number(data.daoTrang.kienThiet.luyenDanPhong.tienDo) || 0) + years * tocDoLDP;

          if (data.daoTrang.kienThiet.luyenDanPhong.tienDo >= 2.5) {
            data.daoTrang.kienThiet.luyenDanPhong.tienDo -= 2.5;
            const itemId = cfgLDP.sanPham;
            const tuiMod = window.tuTien?.core?.['character/tui_do'];
            if (tuiMod) {
              tuiMod.nhanVaoTui(ctx, itemId, 1);
              ghiNhatKy(data, `🔥 Luyện Đan Các xuất lò 1 Hộ Mạch Tụ Khí Đan, chuyển thẳng vào túi đồ Sư Tôn!`, nam);
            }
          }
        }

        // 4. Duyệt danh sách đệ tử
        data.danhSachDeTu.forEach((dt) => {
          dt.tuoi = (Number(dt.tuoi) || 14) + years;

          const heSoTuChat = { pho_thong: 1.5, kha: 2.5, thien_tai: 4.0, yeu_nghiet: 6.5 }[dt.tuChat] ?? 2.0;
          const heSoTLT = 1 + (cfgTLT.deTuHieuQua || 0);
          const tuViTang = Math.round(years * heSoTuChat * heSoTLT);
          const req = Math.max(1, Number(dt.tuViYeuCau) || tuViYeuCauChoCanhGioi(dt.canhGioi ?? 1, dt.tieuCanhGioi ?? 0));
          dt.tuViYeuCau = req;
          dt.tuVi = Math.min(req, (Number(dt.tuVi) || 0) + tuViTang);

          if (dt.trangThai?.loai === 'lich_luyen') {
            dongBoTienDoLichLuyen(dt, nam);
            if ((Number(dt.trangThai.namConLai) || 0) <= 0 && !dt.trangThai.daThongBao) {
              dt.trangThai.daThongBao = true;
              ghiNhatKy(data, `Đệ tử ${dt.ten} đã hoàn thành lịch luyện, đang chờ sư tôn thu nhận kết quả.`, nam);
            }
          }

          if (dt.trangThai?.loai !== 'lich_luyen' && dt.tinhCach === 'hieu_thuan' && (Number(dt.haoCam) || 0) >= 80 && h.random() > 0.6) {
            if (nv && (Number(nv.thuongThe) || 0) > 0) {
              nv.thuongThe = Math.max(0, (Number(nv.thuongThe) || 0) - 1);
              ghiNhatKy(data, `Đệ tử hiếu thảo ${dt.ten} nấu chén Tuyết Liên Trà dâng sư tôn, giúp sư tôn chữa khỏi 1 tầng thương thế.`, nam);
            }
          }

          // Kiểm tra nguy cơ Ma Hóa khi đố kỵ quá cao
          if ((Number(dt.doKy) || 0) >= 85 && dt.trangThai?.loai !== 'ma_hoa' && dt.trangThai?.loai !== 'lich_luyen') {
            if (dt.khuynhHuong === 'ma_dao' || (dt.tinhCach === 'kieu_ngao' && (Number(dt.haoCam) || 0) < 40)) {
              dt.trangThai = { loai: 'ma_hoa', lyDo: 'oan_han_su_mon' };
              ghiNhatKy(data, `🔴 NGUY CẤP! Đệ tử ${dt.ten} đố kỵ ngút trời, tâm ma bộc phát đã ma hóa phản môn!`, nam);
            } else if (h.random() > 0.7) {
              ghiNhatKy(data, `⚠️ Đệ tử ${dt.ten} oán hận sư phụ bất công, đạo tâm chao đảo, cần được đàm tâm hoặc ban thưởng!`, nam);
            }
          }
        });

        h.setData(data);
      });

      // ==========================================
      // MODIFIERS: MÓC NỐI LÕI CHIẾN ĐẤU & ĐỘT PHÁ
      // ==========================================

      // 1. Sư Đồ Đồng Lòng: Tăng sát thương và Hộ thể
      mod.modify('damage', ({ attacker, target, value }) => {
        const val = Number(value) || 0;
        const s = window.tuTien?.state();
        if (!s) return val;

        const data = layModData(s);
        const danhSach = data.danhSachDeTu;

        // Khi Sư Tôn tấn công ('ta')
        if (attacker?.ma === 'ta') {
          const deTuKhoeManh = danhSach.filter((d) => d.trangThai?.loai !== 'lich_luyen' && d.trangThai?.loai !== 'ma_hoa');
          const deTuBuff = Math.min(0.20, deTuKhoeManh.length * 0.02);
          const capTLT = Number(data.daoTrang?.kienThiet?.tuLinhTran?.cap) || 0;
          const tltBuff = TU_LINH_TRAN_CONFIG[capTLT]?.satThuong || 0;
          return val * (1 + deTuBuff + tltBuff);
        }

        // Khi Sư Tôn bị tấn công (target === 'ta')
        if (target?.ma === 'ta') {
          const daiSuHuynh = danhSach.find((d) => d.vaiVe === 'dai_su_huynh' && d.trangThai?.loai !== 'lich_luyen' && d.trangThai?.loai !== 'ma_hoa');
          if (daiSuHuynh && (Number(daiSuHuynh.canhGioi) || 1) >= 2) {
            const giam = (Number(daiSuHuynh.canhGioi) || 1) >= 3 ? 0.10 : 0.05;
            return val * (1 - giam);
          }
        }

        return val;
      });

      // 2. Sư Môn Hộ Đạo: Tăng tỷ lệ đột phá cho Sư Tôn
      mod.modify('breakthroughChance', ({ realm, value }) => {
        const val = Number(value) || 0;
        const s = window.tuTien?.state();
        if (!s) return val;

        const data = layModData(s);
        const deTuKhoeManh = data.danhSachDeTu.filter((d) => d.trangThai?.loai !== 'lich_luyen' && d.trangThai?.loai !== 'ma_hoa');
        const deTuBonus = Math.min(0.10, deTuKhoeManh.length * 0.02);
        const capTLT = Number(data.daoTrang?.kienThiet?.tuLinhTran?.cap) || 0;
        const tltBonus = TU_LINH_TRAN_CONFIG[capTLT]?.dotPha || 0;

        return Math.min(1.0, val + deTuBonus + tltBonus);
      });

      // 3. Khí Vận Tông Môn: Đệ tử tài ba tăng tỉ lệ rớt vật phẩm quý
      mod.modify('dropChance', ({ item, value }) => {
        const val = Number(value) || 0;
        const s = window.tuTien?.state();
        if (!s) return val;

        const data = layModData(s);
        const thiênTaiCount = data.danhSachDeTu.filter((d) => d.tuChat === 'thien_tai').length;
        const yeuNghietCount = data.danhSachDeTu.filter((d) => d.tuChat === 'yeu_nghiet').length;
        const bonus = Math.min(0.20, thiênTaiCount * 0.03 + yeuNghietCount * 0.06);

        return val * (1 + bonus);
      });

      // 4. Cân bằng tỷ lệ xuất hiện kỳ ngộ thu đồ
      mod.modify('encounterWeight', ({ id, value }) => {
        if (id?.startsWith('ev.su_do_')) {
          const opt = mod.options?.ti_le_ky_ngo ?? 'thuong';
          const heSo = opt === 'it' ? 0.4 : opt === 'nhieu' ? 3.0 : 1.2;
          return (Number(value) || 1) * heSo;
        }
        return Number(value) || 1;
      });
    },

    // ========================================================
    // PHA 2: READY (Khởi tạo giao diện, Diffing DOM, Slot & Dock)
    // ========================================================
    ready(tt, mod) {
      window.__suDoModUi = mod.ui;
      mod.log('Mod Sư Đồ Truyền Thừa đã sẵn sàng (Pha ready v1.1.0)');
      const kit = tt.ui.kit;

      injectMasterStyles();

      // ==========================================
      // LẮNG NGHE KẾT THÚC KIẾP (Di trạch đệ tử)
      // ==========================================
      if (typeof unsubLifeEndListener === 'function') {
        try {
          unsubLifeEndListener();
        } catch (e) {}
        unsubLifeEndListener = null;
      }

      unsubLifeEndListener = tt.on('lifeEnd', () => {
        try {
          const s = tt.state();
          const data = layModData(s);
          const deTuList = data.danhSachDeTu;
          if (deTuList.length > 0) {
            const key = 'mod:su_do:tien_duyen';
            const luu = deTuList.map((d) => ({
              ten: d.ten,
              canhGioi: Number(d.canhGioi) || 1,
              tieuCanhGioi: Number(d.tieuCanhGioi) || 0,
              tuChat: d.tuChat,
            }));
            localStorage.setItem(key, JSON.stringify(luu));
            mod.log('Đã lưu truyền thừa đệ tử cho kiếp sau:', luu);
          }
        } catch (err) {
          console.error('[Mod Sư Đồ] Lỗi khi lưu di trạch:', err);
        }
      });

      // ==========================================
      // TIỆN ÍCH MODAL BAN TẶNG & TRUYỀN THỤ
      // ==========================================
      function moModalBanTang(dt, ttInstance, kitInstance) {
        const s = ttInstance.state();
        const nv = s?.run?.nhanVat ?? {};
        const tuiDo = nv.tuiDo ?? {};
        const ctx = ttInstance.game.readCtx?.() ?? {};
        const itemsMap = ctx.content?.items;

        function layTenVatPham(id, def) {
          if (def?.ten) return def.ten;
          const MAP = {
            'item.su_do_huyen_thien_tam_phap': 'Huyền Thiên Tâm Pháp',
            'item.su_do_chan_truyen_phap_bao': 'Trấn Môn Thanh Phong Kiếm',
            'item.su_do_ho_menh_ngoc_bai': 'Ngọc Bài Hộ Mệnh',
            'item.su_do_ho_mach_dan': 'Hộ Mạch Tụ Khí Đan',
            'item.su_do_tuyet_lien_tra': 'Tuyết Liên Linh Trà',
            'item.su_do_duoc_dien_linh_thoc': 'Thượng Cổ Linh Thảo',
            'item.cot_thu': 'Cốt Thủ',
            'item.dan_khi_quyet': 'Dẫn Khí Quyết',
            'item.tho_nap_phap': 'Thổ Nạp Pháp',
            'item.thau_cot_cham': 'Thấu Cốt Châm',
            'item.xich_viem_phu': 'Xích Viêm Phù',
            'item.han_bang_phu': 'Hàn Băng Phù',
            'item.truc_co_dan': 'Trúc Cơ Đan',
          };
          return MAP[id] || id;
        }

        const m = kitInstance.modal({
          title: `🎁 Ban Tặng & Truyền Thụ Cho ${dt.ten}`,
          mount(box) {
            box.style.cssText = 'display:flex; flex-direction:column; gap:10px; font-size:12.5px; max-height:480px; overflow-y:auto;';

            // 1. Công pháp
            const cpSec = document.createElement('div');
            cpSec.style.cssText = 'border:1px solid var(--vien-hud); border-radius:6px; padding:8px; display:flex; flex-direction:column; gap:6px;';
            cpSec.innerHTML = `<b style="color:var(--chu-do); font-size:12px;">📖 Truyền Thụ Công Pháp</b>`;

            const cpItems = Object.keys(tuiDo).filter((id) => {
              const def = itemsMap?.get(id);
              const laCp = def ? def.loai === 'cong_phap' : (id === 'item.su_do_huyen_thien_tam_phap' || id.includes('cong_phap'));
              return laCp && (tuiDo[id] || 0) > 0;
            });

            if (cpItems.length === 0) {
              const empty = document.createElement('div');
              empty.className = 'hud-phu';
              empty.style.fontSize = '11px';
              empty.textContent = 'Trong túi đồ không có công pháp nào.';
              cpSec.append(empty);
            } else {
              cpItems.forEach((id) => {
                const def = itemsMap?.get(id);
                const tenMon = layTenVatPham(id, def);
                const row = document.createElement('div');
                row.style.cssText = 'display:flex; justify-content:space-between; align-items:center; font-size:11.5px;';
                row.innerHTML = `<span>${tenMon} (x${tuiDo[id]})</span>`;
                const btn = kitInstance.button({
                  text: 'Truyền Thụ',
                  kind: 'chinh',
                  onClick: () => {
                    ttInstance.game.modAction('su_do', 'truyen_cong_phap', { deTuId: dt.id, itemId: id });
                    m.close();
                    ttInstance.ui.toast(`Đã truyền thụ "${tenMon}" cho ${dt.ten}!`);
                  },
                });
                btn.style.cssText += 'padding:2px 8px; font-size:11px;';
                row.append(btn);
                cpSec.append(row);
              });
            }
            box.append(cpSec);

            // 2. Pháp bảo / Pháp khí
            const pbSec = document.createElement('div');
            pbSec.style.cssText = 'border:1px solid var(--vien-hud); border-radius:6px; padding:8px; display:flex; flex-direction:column; gap:6px;';
            pbSec.innerHTML = `<b style="color:var(--chu-do); font-size:12px;">⚔️ Ban Tặng Pháp Bảo</b>`;

            const pbItems = Object.keys(tuiDo).filter((id) => {
              const def = itemsMap?.get(id);
              const laPb = def ? def.loai === 'phap_khi' : (id === 'item.su_do_chan_truyen_phap_bao' || id === 'item.su_do_ho_menh_ngoc_bai' || id === 'item.su_do_tu_linh_tran_ky' || id.includes('phap_khi'));
              return laPb && (tuiDo[id] || 0) > 0;
            });

            if (pbItems.length === 0) {
              const empty = document.createElement('div');
              empty.className = 'hud-phu';
              empty.style.fontSize = '11px';
              empty.textContent = 'Trong túi đồ không có pháp khí nào.';
              pbSec.append(empty);
            } else {
              pbItems.forEach((id) => {
                const def = itemsMap?.get(id);
                const tenMon = layTenVatPham(id, def);
                const row = document.createElement('div');
                row.style.cssText = 'display:flex; justify-content:space-between; align-items:center; font-size:11.5px;';
                row.innerHTML = `<span>${tenMon} (x${tuiDo[id]})</span>`;
                const btn = kitInstance.button({
                  text: 'Ban Tặng',
                  kind: 'chinh',
                  onClick: () => {
                    ttInstance.game.modAction('su_do', 'ban_phap_bao', { deTuId: dt.id, itemId: id });
                    m.close();
                    ttInstance.ui.toast(`Đã ban tặng "${tenMon}" cho ${dt.ten}!`);
                  },
                });
                btn.style.cssText += 'padding:2px 8px; font-size:11px;';
                row.append(btn);
                pbSec.append(row);
              });
            }
            box.append(pbSec);

            // 3. Đan dược
            const ddSec = document.createElement('div');
            ddSec.style.cssText = 'border:1px solid var(--vien-hud); border-radius:6px; padding:8px; display:flex; flex-direction:column; gap:6px;';
            ddSec.innerHTML = `<b style="color:var(--chu-do); font-size:12px;">💊 Ban Đan Dược Tăng Tu Vi</b>`;

            const ddItems = Object.keys(tuiDo).filter((id) => {
              const def = itemsMap?.get(id);
              const laDd = def ? def.loai === 'dan_duoc' : (id === 'item.su_do_ho_mach_dan' || id === 'item.su_do_tuyet_lien_tra' || id === 'item.truc_co_dan' || id.includes('dan'));
              return laDd && (tuiDo[id] || 0) > 0;
            });

            if (ddItems.length === 0) {
              const empty = document.createElement('div');
              empty.className = 'hud-phu';
              empty.style.fontSize = '11px';
              empty.textContent = 'Trong túi đồ không có linh đan phù hợp.';
              ddSec.append(empty);
            } else {
              ddItems.forEach((id) => {
                const def = itemsMap?.get(id);
                const tenMon = layTenVatPham(id, def);
                const row = document.createElement('div');
                row.style.cssText = 'display:flex; justify-content:space-between; align-items:center; font-size:11.5px;';
                row.innerHTML = `<span>${tenMon} (x${tuiDo[id]})</span>`;
                const btn = kitInstance.button({
                  text: 'Ban Đan',
                  kind: 'phu',
                  onClick: () => {
                    ttInstance.game.modAction('su_do', 'ban_dan_duoc', { deTuId: dt.id, itemId: id });
                    m.close();
                    ttInstance.ui.toast(`Đã ban đan dược "${tenMon}" cho ${dt.ten}!`);
                  },
                });
                btn.style.cssText += 'padding:2px 8px; font-size:11px;';
                row.append(btn);
                ddSec.append(row);
              });
            }
            box.append(ddSec);

            // 4. Ban Linh Thạch trực tiếp
            const ltSec = document.createElement('div');
            ltSec.style.cssText = 'display:flex; justify-content:space-between; align-items:center; border:1px solid var(--vien-hud); border-radius:6px; padding:8px;';
            ltSec.innerHTML = `<span><b>💰 Linh Thạch Sư Tôn:</b> ${nv.linhThach ?? 0}</span>`;
            const btnBanLt = kitInstance.button({
              text: 'Ban 50 LT',
              kind: 'phu',
              onClick: () => {
                if ((Number(nv.linhThach) || 0) < 50) {
                  ttInstance.ui.toast('Sư tôn không đủ 50 linh thạch!');
                  return;
                }
                ttInstance.game.modAction('su_do', 'ban_thuong', { deTuId: dt.id, soTien: 50 });
                m.close();
                ttInstance.ui.toast(`Đã ban 50 linh thạch cho ${dt.ten}!`);
              },
            });
            btnBanLt.style.cssText += 'padding:2px 8px; font-size:11px;';
            ltSec.append(btnBanLt);
            box.append(ltSec);
          },
        });
      }

      // ==========================================
      // TẠO THẺ ĐỆ TỬ CHI TIẾT
      // ==========================================
      function taoTheDeTuChiTiet(dt, ttInstance, kitInstance) {
        let currentDt = dt;
        const card = document.createElement('div');
        card.className = 'su-do-card';
        card.dataset.id = dt.id;

        const isMaHoa = dt.trangThai?.loai === 'ma_hoa';
        if (isMaHoa) card.classList.add('su-do-ma-hoa');

        const top = document.createElement('div');
        top.style.cssText = 'display: flex; gap: 8px; align-items: center; min-width: 0;';

        const faceUrl = ttInstance.assets?.npcFace?.(dt.id, dt.gioiTinh, Math.floor(Number(dt.tuoi) || 14)) || (dt.gioiTinh === 'nam' ? '/img/nguoi/nam.tre.1.webp' : '/img/nguoi/nu.tre.1.webp');
        const avatar = document.createElement('div');
        avatar.className = 'su-do-avatar';
        avatar.innerHTML = `<img src="${faceUrl}" alt="${dt.ten}" onerror="this.src='/img/nguoi/${dt.gioiTinh === 'nu' ? 'nu' : 'nam'}.tre.1.webp'" />`;
        top.append(avatar);

        const tc = TU_CHAT_MAP[dt.tuChat] ?? { ten: dt.tuChat, color: 'inherit', bg: 'transparent', border: 'transparent' };
        const heStr = dinhDangHe(dt.he);
        const tcStr = TINH_CACH_MAP[dt.tinhCach] ?? dt.tinhCach;
        const danhXung = dt.gioiTinh === 'nu' ? 'Đại Sư Tỷ' : 'Đại Sư Huynh';

        const info = document.createElement('div');
        info.className = 'su-do-card-info';
        info.innerHTML = `
          <div class="su-do-card-name-row" style="display: flex; align-items: center; gap: 5px; min-width: 0; line-height: 1.2;">
            <span class="su-do-card-name" style="font-weight: bold; font-size: 13px; white-space: nowrap;">${dt.ten}</span>
            ${dt.vaiVe === 'dai_su_huynh' ? `<span class="su-do-badge" style="color:var(--vang-kim); background:rgba(218,165,32,0.14); border:1px solid var(--vang-kim); font-size:9.5px; padding:0 4px; white-space:nowrap;">${danhXung}</span>` : ''}
            ${(() => {
              if (dt.trangThai?.loai === 'ma_hoa') {
                return `<span class="su-do-badge" style="color:#ef4444; background:rgba(239,68,68,0.18); border:1px solid #ef4444; font-size:9.5px; padding:0 4px; white-space:nowrap;">🔴 Ma Hóa</span>`;
              }
              if (dt.trangThai?.loai !== 'lich_luyen') return '';
              const conLai = Number(dt.trangThai?.namConLai) || 0;
              if (conLai > 0) {
                return `<span class="su-do-badge" style="color:#10b981; background:rgba(16,185,129,0.12); border:1px solid #10b981; font-size:9.5px; padding:0 4px; white-space:nowrap;">Lịch luyện (${conLai}n)</span>`;
              }
              return `<span class="su-do-badge" style="color:#f59e0b; background:rgba(245,158,11,0.15); border:1px solid #f59e0b; font-size:9.5px; padding:0 4px; white-space:nowrap;">🎁 Chờ thu nhận</span>`;
            })()}
            <span class="su-do-badge" style="color:${tc.color}; background:${tc.bg}; border:1px solid ${tc.border}; font-size:9.5px; padding:0 4px; white-space:nowrap; margin-left: auto;">${tc.ten}</span>
          </div>
          <div class="su-do-card-subrow" style="display: flex; align-items: center; justify-content: space-between; gap: 4px; font-size: 11px; white-space: nowrap; margin-top: 2px;">
            <div style="display: flex; align-items: center; gap: 4px; min-width: 0; overflow: hidden; text-overflow: ellipsis;">
              <span>${dinhDangCanhGioi(dt.canhGioi, dt.tieuCanhGioi)}</span>
              <span style="opacity:0.4;">·</span>
              <span>${heStr}</span>
            </div>
            <span class="hud-phu su-do-card-age" style="font-size: 11px; white-space: nowrap; flex-shrink: 0;">${dt.gioiTinh === 'nam' ? 'Nam' : 'Nữ'} · ${Math.floor(Number(dt.tuoi) || 14)}t</span>
          </div>
          <div class="su-do-card-stats" style="font-size: 11px; color: var(--muc-nhat); margin-top: 2px; white-space: nowrap;">
            Tính cách: <i>${tcStr}</i> · Hảo cảm: <b>${dt.haoCam ?? 0}</b> · Đố kỵ: <b style="color:${(dt.doKy ?? 0) > 50 ? 'var(--cam-do)' : 'inherit'}">${dt.doKy ?? 0}</b>
          </div>
          ${dt.congPhap || dt.phapBao ? `
            <div style="display:flex; gap:4px; margin-top:2px; font-size:10px; overflow:hidden;">
              ${dt.congPhap ? `<span class="su-do-badge" style="color:#3b82f6; background:rgba(59,130,246,0.12); border:1px solid #3b82f6; padding:0 4px;">📖 ${dt.congPhap.ten}</span>` : ''}
              ${dt.phapBao ? `<span class="su-do-badge" style="color:#8b5cf6; background:rgba(139,92,246,0.12); border:1px solid #8b5cf6; padding:0 4px;">⚔️ ${dt.phapBao.ten}</span>` : ''}
            </div>
          ` : ''}
        `;
        top.append(info);
        card.append(top);

        // Tu vi progress
        const tuViReq = Math.max(1, Number(dt?.tuViYeuCau) || 1);
        const tuViCur = Math.max(0, Number(dt?.tuVi) || 0);
        const pct = Math.min(100, Math.max(0, Math.floor((tuViCur / tuViReq) * 100)));
        const sanSangDoKiep = tuViCur >= tuViReq;

        const progRow = document.createElement('div');
        progRow.style.cssText = 'display:flex; align-items:center; gap:6px; font-size:11px;';
        progRow.innerHTML = `
          <span class="hud-phu" style="font-size:11px; white-space:nowrap;">Tu vi:</span>
          <div class="su-do-progress-bar">
            <div class="su-do-progress-val ${sanSangDoKiep ? 'su-do-progress-max' : ''}" style="width: ${pct}%;"></div>
          </div>
          <span class="su-do-tuvi-text" style="font-size:10.5px; white-space:nowrap; font-weight:600; color:${sanSangDoKiep ? 'var(--chu-do)' : 'inherit'};">
            ${tuViCur}/${tuViReq} (${pct}%)${sanSangDoKiep ? ' ⚡' : ''}
          </span>
        `;
        card.append(progRow);

        const progValEl = progRow.querySelector('.su-do-progress-val');
        const progTextEl = progRow.querySelector('.su-do-tuvi-text');
        const ageEl = info.querySelector('.su-do-card-age');
        const statsEl = info.querySelector('.su-do-card-stats');

        // NẾU BỊ MA HÓA: Hiện cụm xử lý nguy cấp
        if (isMaHoa) {
          const maBox = document.createElement('div');
          maBox.style.cssText = 'display:flex; gap:4px; margin-top:2px;';

          const btnCamHoa = kitInstance.button({
            text: '❤️ Cảm Hóa (80LT/0.5TV)',
            kind: 'chinh',
            onClick: () => {
              ttInstance.game.modAction('su_do', 'cam_hoa_nghich_do', { deTuId: currentDt.id });
              ttInstance.ui.toast(`Đã dùng vô thượng chân tâm cảm hóa ${currentDt.ten}!`);
            },
          });
          btnCamHoa.classList.add('su-do-btn-wrap');
          btnCamHoa.style.cssText += 'flex:1 1 0; font-size:10.5px;';
          maBox.append(btnCamHoa);

          const btnTruc = kitInstance.button({
            text: '🚫 Phế Xuất',
            kind: 'phu',
            onClick: () => {
              ttInstance.game.modAction('su_do', 'phe_truc_xuat_nghich_do', { deTuId: currentDt.id });
              ttInstance.ui.toast(`Đã phế tu vi và trục xuất ${currentDt.ten}!`);
            },
          });
          btnTruc.classList.add('su-do-btn-wrap');
          btnTruc.style.cssText += 'font-size:10.5px;';
          maBox.append(btnTruc);

          const btnTram = kitInstance.button({
            text: '⚔️ Trảm Ma',
            kind: 'phu',
            onClick: () => {
              ttInstance.game.modAction('su_do', 'tru_ma_ve_dao', { deTuId: currentDt.id });
              ttInstance.ui.toast(`Đã trảm ma trừ họa ${currentDt.ten}!`);
            },
          });
          btnTram.classList.add('su-do-btn-wrap');
          btnTram.style.cssText += 'font-size:10.5px;';
          maBox.append(btnTram);

          card.append(maBox);
          return card;
        }

        // HÀNG NÚT TƯƠNG TÁC CHÍNH (Đàm tâm, Truyền công, Luận bàn)
        const gridMain = document.createElement('div');
        gridMain.className = 'su-do-action-grid';

        // 1. Đàm tâm
        const btnDamTam = kitInstance.button({
          text: '🗣️ Đàm Tâm',
          kind: 'nho',
          onClick: () => {
            if (currentDt.trangThai?.loai === 'lich_luyen') {
              const conLai = Number(currentDt.trangThai?.namConLai) || 0;
              if (conLai > 0) {
                ttInstance.ui.toast(`Đệ tử ${currentDt.ten} đang xuất sơn lịch luyện (${conLai} năm nữa mới về)!`);
              } else {
                ttInstance.ui.toast(`Đệ tử ${currentDt.ten} đã hoàn thành lịch luyện, hãy vào tab Lịch Luyện để thu nhận!`);
              }
              return;
            }
            const m = kitInstance.modal({
              title: `Vấn Đạo Cùng ${currentDt.ten}`,
              mount(box) {
                box.style.cssText = 'display: flex; flex-direction: column; gap: 8px; font-size: 13px;';
                const ask = document.createElement('div');
                ask.innerHTML = `Đệ tử ${currentDt.ten} chắp tay cung kính thưa: <i>"Khởi bẩm Sư tôn, giữa nhân gian hiểm ác, đệ tử tu tiên nên lấy điều gì làm trọng tâm?"</i>`;
                box.append(ask);

                box.append(
                  kitInstance.button({
                    text: 'Trừ Ma Vệ Đạo (Chính Đạo)',
                    kind: 'chinh',
                    onClick: () => {
                      ttInstance.game.modAction('su_do', 'luan_dao', { deTuId: currentDt.id, huong: 'chinh_dao' });
                      m.close();
                      ttInstance.ui.toast('Đã chỉ dạy đạo lý Chính Đạo!');
                    },
                  })
                );

                box.append(
                  kitInstance.button({
                    text: 'Tiêu Dao Tự Tại (Tiêu Dao)',
                    kind: 'phu',
                    onClick: () => {
                      ttInstance.game.modAction('su_do', 'luan_dao', { deTuId: currentDt.id, huong: 'tieu_dao' });
                      m.close();
                      ttInstance.ui.toast('Đã chỉ dạy đạo lý Tiêu Dao!');
                    },
                  })
                );

                box.append(
                  kitInstance.button({
                    text: 'Kẻ Mạnh Vi Tôn (Ma Đạo)',
                    kind: 'phu',
                    onClick: () => {
                      ttInstance.game.modAction('su_do', 'luan_dao', { deTuId: currentDt.id, huong: 'ma_dao' });
                      m.close();
                      ttInstance.ui.toast('Đã chỉ dạy đạo lý Nghịch Thiên!');
                    },
                  })
                );
              },
            });
          },
        });
        btnDamTam.classList.add('su-do-btn-wrap');
        gridMain.append(btnDamTam);

        // 2. Truyền công
        const btnTruyenCong = kitInstance.button({
          text: '📖 Truyền Công',
          kind: 'nho',
          onClick: () => {
            if (currentDt.trangThai?.loai === 'lich_luyen') {
              const conLai = Number(currentDt.trangThai?.namConLai) || 0;
              if (conLai > 0) {
                ttInstance.ui.toast(`Đệ tử ${currentDt.ten} đang xuất sơn lịch luyện (${conLai} năm nữa mới về)!`);
              } else {
                ttInstance.ui.toast(`Đệ tử ${currentDt.ten} đã hoàn thành lịch luyện, hãy vào tab Lịch Luyện để thu nhận!`);
              }
              return;
            }
            const curReq = Math.max(1, Number(currentDt?.tuViYeuCau) || 1);
            const curVal = Math.max(0, Number(currentDt?.tuVi) || 0);
            if (curVal >= curReq) {
              ttInstance.ui.toast(`Đệ tử ${currentDt.ten} đã đạt bình cảnh tu vi (100%), cần hộ pháp đột phá trước!`);
              return;
            }
            const s = ttInstance.state();
            if ((Number(s.run?.nhanVat?.tuVi) || 0) < 1) {
              ttInstance.ui.toast('Sư tôn không đủ chân nguyên tu vi để truyền công (cần ít nhất 1.0 tu vi)!');
              return;
            }
            try {
              ttInstance.game.modAction('su_do', 'truyen_cong', { deTuId: currentDt.id });
              ttInstance.ui.toast(`Đã quán đảnh truyền công cho ${currentDt.ten}!`);
            } catch (e) {
              ttInstance.ui.toast(e.message);
            }
          },
        });
        btnTruyenCong.classList.add('su-do-btn-wrap');
        gridMain.append(btnTruyenCong);

        // 3. Luận bàn
        const btnDauPhap = kitInstance.button({
          text: '⚔️ Luận Bàn',
          kind: 'nho',
          onClick: () => {
            if (currentDt.trangThai?.loai === 'lich_luyen') {
              const conLai = Number(currentDt.trangThai?.namConLai) || 0;
              if (conLai > 0) {
                ttInstance.ui.toast(`Đệ tử ${currentDt.ten} đang xuất sơn lịch luyện (${conLai} năm nữa mới về)!`);
              } else {
                ttInstance.ui.toast(`Đệ tử ${currentDt.ten} đã hoàn thành lịch luyện, hãy vào tab Lịch Luyện để thu nhận!`);
              }
              return;
            }
            ttInstance.game.modAction('su_do', 'dau_phap', { deTuId: currentDt.id });
            ttInstance.ui.toast(`Đã luận bàn đấu pháp cùng ${currentDt.ten}!`);
          },
        });
        btnDauPhap.classList.add('su-do-btn-wrap');
        gridMain.append(btnDauPhap);
        card.append(gridMain);

        // HÀNG PHỤ: Ban Tặng / Đột Phá / Đại Sư Huynh / Trục Xuất
        const subRow = document.createElement('div');
        subRow.className = 'su-do-action-subgrid';

        // Nút Ban tặng modal
        const btnBanTang = kitInstance.button({
          text: '🎁 Ban Tặng & Truyền Thụ',
          kind: 'nho',
          onClick: () => {
            if (currentDt.trangThai?.loai === 'lich_luyen') {
              ttInstance.ui.toast(`Đệ tử ${currentDt.ten} đang xuất sơn lịch luyện!`);
              return;
            }
            moModalBanTang(currentDt, ttInstance, kitInstance);
          },
        });
        btnBanTang.classList.add('su-do-btn-wrap');
        subRow.append(btnBanTang);

        // Nút Hộ trì đột phá / Độ kiếp
        const laDinhPhong = (Number(currentDt.canhGioi) || 1) >= 5 && (Number(currentDt.tieuCanhGioi) || 0) >= 3;
        if (tuViCur >= tuViReq && !laDinhPhong) {
          const laDaiCanhGioi = (Number(currentDt.tieuCanhGioi) || 0) >= 3;
          const tuLuyenKhiLenTrucCo = currentDt.canhGioi === 1 && laDaiCanhGioi;
          const doKiepThucSu = currentDt.canhGioi >= 2 && laDaiCanhGioi;

          const nutText = doKiepThucSu
            ? '⚡ Độ Kiếp'
            : tuLuyenKhiLenTrucCo
            ? '🌟 Đột Phá Trúc Cơ'
            : '⚡ Đột Phá';

          const btnHoPhap = kitInstance.button({
            text: nutText,
            kind: 'chinh',
            onClick: () => {
              if (currentDt.trangThai?.loai === 'lich_luyen') {
                ttInstance.ui.toast(`Đệ tử ${currentDt.ten} đang xuất sơn lịch luyện!`);
                return;
              }
              if (!laDaiCanhGioi) {
                // Tiểu cảnh giới
                const m = kitInstance.modal({
                  title: `Hộ Trì Đột Phá Cho ${currentDt.ten}`,
                  mount(box) {
                    box.style.cssText = 'display: flex; flex-direction: column; gap: 8px; font-size: 13px;';
                    const msg = document.createElement('div');
                    msg.innerHTML = `Đệ tử <b>${currentDt.ten}</b> (${dinhDangCanhGioi(currentDt.canhGioi, currentDt.tieuCanhGioi)}) đã tích lũy tu vi đại viên mãn, chuẩn bị xung kích lên <b>${dinhDangCanhGioi(currentDt.canhGioi, (currentDt.tieuCanhGioi ?? 0) + 1)}</b>!`;
                    box.append(msg);

                    box.append(
                      kitInstance.button({
                        text: '✨ Chỉ dẫn khí mạch (100% thành công, tốn 0.2 tu vi)',
                        kind: 'chinh',
                        onClick: () => {
                          const nv = ttInstance.state().run?.nhanVat;
                          if (nv && (Number(nv.tuVi) || 0) < 0.2) {
                            ttInstance.ui.toast('Sư tôn không đủ 0.2 tu vi chân nguyên để chỉ dẫn!');
                            return;
                          }
                          ttInstance.game.modAction('su_do', 'ho_phap', { deTuId: currentDt.id, cach: 'chi_dan' });
                          m.close();
                          ttInstance.ui.toast(`Đã chỉ dẫn hộ ${currentDt.ten} đột phá thành công!`);
                        },
                      })
                    );

                    box.append(
                      kitInstance.button({
                        text: '💊 Ban đan dược trợ lực (85% thành công, 30 linh thạch)',
                        kind: 'phu',
                        onClick: () => {
                          const nv = ttInstance.state().run?.nhanVat;
                          if (nv && (Number(nv.linhThach) || 0) < 30) {
                            ttInstance.ui.toast('Sư tôn không đủ 30 linh thạch!');
                            return;
                          }
                          ttInstance.game.modAction('su_do', 'ho_phap', { deTuId: currentDt.id, cach: 'ban_dan' });
                          m.close();
                          ttInstance.ui.toast(`Đã ban đan dược cho ${currentDt.ten}!`);
                        },
                      })
                    );

                    box.append(
                      kitInstance.button({
                        text: '🛡️ Tự lực cánh sinh (60% thành công)',
                        kind: 'phu',
                        onClick: () => {
                          ttInstance.game.modAction('su_do', 'ho_phap', { deTuId: currentDt.id, cach: 'tu_luc' });
                          m.close();
                        },
                      })
                    );
                  },
                });
              } else if (tuLuyenKhiLenTrucCo) {
                // Trúc Cơ
                const m = kitInstance.modal({
                  title: `Hộ Đạo Trúc Cơ Cho ${currentDt.ten}`,
                  mount(box) {
                    box.style.cssText = 'display: flex; flex-direction: column; gap: 8px; font-size: 13px;';
                    const msg = document.createElement('div');
                    msg.innerHTML = `Đồ đệ <b>${currentDt.ten}</b> đã đạt Luyện Khí Đại viên mãn, chuẩn bị ngưng tụ đạo cơ để bước chân vào Trúc Cơ Sơ kỳ!`;
                    box.append(msg);

                    box.append(
                      kitInstance.button({
                        text: '🌟 Sư tôn hộ pháp đúc đạo cơ (100% thành công, hao 0.5 tu vi)',
                        kind: 'chinh',
                        onClick: () => {
                          const nv = ttInstance.state().run?.nhanVat;
                          if (nv && (Number(nv.tuVi) || 0) < 0.5) {
                            ttInstance.ui.toast('Sư tôn không đủ 0.5 tu vi!');
                            return;
                          }
                          ttInstance.game.modAction('su_do', 'ho_phap', { deTuId: currentDt.id, cach: 'ho_phap' });
                          m.close();
                          ttInstance.ui.toast(`Đã hộ pháp giúp ${currentDt.ten} đúc thành đạo cơ Trúc Cơ!`);
                        },
                      })
                    );

                    box.append(
                      kitInstance.button({
                        text: '💊 Ban Trúc Cơ Đan (90% thành công, 80 linh thạch hoặc có đan)',
                        kind: 'phu',
                        onClick: () => {
                          const nv = ttInstance.state().run?.nhanVat;
                          const coDan = (Number(nv?.tuiDo?.['item.truc_co_dan']) || 0) > 0;
                          if (!coDan && (Number(nv?.linhThach) || 0) < 80) {
                            ttInstance.ui.toast('Sư tôn không có Trúc Cơ Đan hoặc không đủ 80 linh thạch!');
                            return;
                          }
                          ttInstance.game.modAction('su_do', 'ho_phap', { deTuId: currentDt.id, cach: 'ban_dan' });
                          m.close();
                          ttInstance.ui.toast(`Đã ban Trúc Cơ Đan cho ${currentDt.ten}!`);
                        },
                      })
                    );

                    box.append(
                      kitInstance.button({
                        text: '🛡️ Tự thân đúc đạo cơ (50% thành công)',
                        kind: 'phu',
                        onClick: () => {
                          ttInstance.game.modAction('su_do', 'ho_phap', { deTuId: currentDt.id, cach: 'tu_luc' });
                          m.close();
                        },
                      })
                    );
                  },
                });
              } else {
                // Độ Kiếp
                const m = kitInstance.modal({
                  title: `Hộ Pháp Độ Kiếp Cho ${currentDt.ten}`,
                  mount(box) {
                    box.style.cssText = 'display: flex; flex-direction: column; gap: 8px; font-size: 13px;';
                    const msg = document.createElement('div');
                    msg.innerHTML = `Đệ tử <b>${currentDt.ten}</b> xung kích đại cảnh giới, cửu thiên lôi kiếp sắp giáng xuống!`;
                    box.append(msg);

                    box.append(
                      kitInstance.button({
                        text: '⚡ Gánh lôi kiếp (100% thành công, Sư tôn chịu 1 tầng thương thế nhẹ)',
                        kind: 'chinh',
                        onClick: () => {
                          ttInstance.game.modAction('su_do', 'ho_phap', { deTuId: currentDt.id, cach: 'ganh_loi_kiep' });
                          m.close();
                          ttInstance.ui.toast(`Đã gánh lôi kiếp hộ ${currentDt.ten} độ kiếp thành công!`);
                        },
                      })
                    );

                    box.append(
                      kitInstance.button({
                        text: '💊 Ban Đan Dược Hộ Mệnh (80% thành công, 100 linh thạch)',
                        kind: 'phu',
                        onClick: () => {
                          const nv = ttInstance.state().run?.nhanVat;
                          const coDan = (Number(nv?.tuiDo?.['item.su_do_ho_mach_dan']) || 0) > 0;
                          if (!coDan && (Number(nv?.linhThach) || 0) < 100) {
                            ttInstance.ui.toast('Sư tôn không đủ 100 linh thạch để ban đan dược hộ mệnh!');
                            return;
                          }
                          ttInstance.game.modAction('su_do', 'ho_phap', { deTuId: currentDt.id, cach: 'ban_dan' });
                          m.close();
                          ttInstance.ui.toast('Đã ban đan dược hộ mệnh độ kiếp!');
                        },
                      })
                    );

                    box.append(
                      kitInstance.button({
                        text: '🛡️ Tự thân vượt thiên kiếp (50% thành công)',
                        kind: 'phu',
                        onClick: () => {
                          ttInstance.game.modAction('su_do', 'ho_phap', { deTuId: currentDt.id, cach: 'tu_luc' });
                          m.close();
                        },
                      })
                    );
                  },
                });
              }
            },
          });
          btnHoPhap.classList.add('su-do-btn-wrap');
          subRow.append(btnHoPhap);
        }

        // Quản trị bên phải (Sắc phong, Trục xuất)
        const rightGroup = document.createElement('div');
        rightGroup.style.cssText = 'display: flex; gap: 4px; align-items: center;';

        if (currentDt.vaiVe !== 'dai_su_huynh') {
          const btnBoNhiem = kitInstance.button({
            text: '👑',
            tip: `Sắc phong làm ${danhXung}`,
            kind: 'nho',
            onClick: () => {
              ttInstance.game.modAction('su_do', 'bo_nhiem', { deTuId: currentDt.id });
              ttInstance.ui.toast(`Đã sắc phong ${currentDt.ten} làm ${danhXung}!`);
            },
          });
          btnBoNhiem.classList.add('su-do-btn-wrap');
          rightGroup.append(btnBoNhiem);
        }

        const btnTrucXuat = kitInstance.button({
          text: '✕',
          tip: 'Trục xuất đồ đệ khỏi môn phái',
          kind: 'nho',
          onClick: async () => {
            const ok = await ttInstance.ui.confirm({
              title: 'Trục Xuất Đệ Tử',
              text: `Sư tôn có chắc chắn muốn trục xuất ${currentDt.ten} khỏi môn phái?`,
            });
            if (ok) {
              ttInstance.game.modAction('su_do', 'truc_xuat', { deTuId: currentDt.id });
              ttInstance.ui.toast(`Đã trục xuất ${currentDt.ten}!`);
            }
          },
        });
        btnTrucXuat.classList.add('su-do-btn-wrap');
        rightGroup.append(btnTrucXuat);

        subRow.append(rightGroup);
        card.append(subRow);

        card._sig = layChuKyCauTrucDeTu(dt);
        card._checkStructuralChange = (newDt) => {
          return layChuKyCauTrucDeTu(newDt) !== card._sig;
        };

        card._update = (newDt) => {
          currentDt = newDt;
          const curReq = Math.max(1, Number(newDt?.tuViYeuCau) || 1);
          const curVal = Math.max(0, Number(newDt?.tuVi) || 0);
          const curPct = Math.min(100, Math.max(0, Math.floor((curVal / curReq) * 100)));
          const curSanSang = curVal >= curReq;

          if (progValEl) {
            progValEl.style.width = `${curPct}%`;
            progValEl.classList.toggle('su-do-progress-max', curSanSang);
          }
          if (progTextEl) {
            progTextEl.textContent = `${curVal}/${curReq} (${curPct}%)${curSanSang ? ' ⚡' : ''}`;
            progTextEl.style.color = curSanSang ? 'var(--chu-do)' : 'inherit';
          }
          if (ageEl) {
            ageEl.textContent = `${newDt.gioiTinh === 'nam' ? 'Nam' : 'Nữ'} · ${Math.floor(Number(newDt.tuoi) || 14)}t`;
          }
          if (statsEl) {
            const curTcStr = TINH_CACH_MAP[newDt.tinhCach] ?? newDt.tinhCach;
            statsEl.innerHTML = `Tính cách: <i>${curTcStr}</i> · Hảo cảm: <b>${newDt.haoCam ?? 0}</b> · Đố kỵ: <b style="color:${(newDt.doKy ?? 0) > 50 ? 'var(--cam-do)' : 'inherit'}">${newDt.doKy ?? 0}</b>`;
          }
        };

        return card;
      }

      // ==========================================
      // THẺ ĐỆ TỬ THU NHỎ (CHO SLOT CHARACTER TAB)
      // ==========================================
      function taoTheDeTuNho(dt, ttInstance, kitInstance) {
        const card = document.createElement('div');
        card.className = 'su-do-card';
        card.style.cssText = 'padding: 6px 8px; gap: 4px;';

        const rowTop = document.createElement('div');
        rowTop.style.cssText = 'display: flex; justify-content: space-between; align-items: center; font-size: 12.5px; white-space: nowrap; min-width: 0;';

        const tenSpan = document.createElement('span');
        tenSpan.style.cssText = 'display: flex; align-items: center; gap: 4px; white-space: nowrap;';
        rowTop.append(tenSpan);

        const cgSpan = document.createElement('span');
        cgSpan.className = 'hud-phu';
        cgSpan.style.cssText = 'font-size: 11px; white-space: nowrap; margin-left: auto;';
        rowTop.append(cgSpan);
        card.append(rowTop);

        const rowSub = document.createElement('div');
        rowSub.style.cssText = 'display: flex; justify-content: space-between; font-size: 11px; color: var(--muc-nhat); white-space: nowrap;';

        const statsSpan = document.createElement('span');
        statsSpan.style.cssText = 'white-space: nowrap;';
        rowSub.append(statsSpan);

        const tuViSpan = document.createElement('span');
        tuViSpan.style.cssText = 'white-space: nowrap;';
        rowSub.append(tuViSpan);
        card.append(rowSub);

        card._update = (newDt) => {
          const danhXung = newDt.gioiTinh === 'nu' ? 'Đại Sư Tỷ' : 'Đại Sư Huynh';
          tenSpan.innerHTML = `<b>${newDt.ten}</b> ${newDt.vaiVe === 'dai_su_huynh' ? `<span class="su-do-badge" style="color:var(--vang-kim); font-size:9.5px; border:1px solid var(--vang-kim); padding:0 3px;">${danhXung}</span>` : ''}`;
          cgSpan.textContent = dinhDangCanhGioi(newDt.canhGioi, newDt.tieuCanhGioi);
          statsSpan.textContent = `Hảo cảm: ${newDt.haoCam ?? 0}`;
          const curVal = Math.max(0, Number(newDt?.tuVi) || 0);
          const curReq = Math.max(1, Number(newDt?.tuViYeuCau) || 1);
          tuViSpan.textContent = `Tu vi: ${curVal}/${curReq}`;
        };

        card._update(dt);
        return card;
      }

      // ==========================================
      // DIFFING & CẬP NHẬT DANH SÁCH ĐỆ TỬ
      // ==========================================
      function capNhatDanhSachDeTu(list, container) {
        if (list.length === 0) {
          container.innerHTML = `
            <div style="border: 1px dashed var(--vien-hud); border-radius: 8px; padding: 18px 12px; text-align: center; color: var(--muc-nhat); font-size: 12.5px; line-height: 1.6;">
              Chưa có đồ đệ nào bái nhập bổn môn.<br/>
              Hãy nhấn nút <b>"Chiêu Mộ Đồ Đệ"</b> bên trên để mở kỳ tuyển đồ!
            </div>
          `;
          return;
        }

        const emptyNotice = container.querySelector('div[style*="text-align: center"]');
        if (emptyNotice) container.innerHTML = '';

        const existingCards = new Map();
        Array.from(container.children).forEach((child) => {
          if (child.dataset?.id) existingCards.set(child.dataset.id, child);
        });

        const newIds = new Set(list.map((d) => d.id));
        existingCards.forEach((cardEl, id) => {
          if (!newIds.has(id)) cardEl.remove();
        });

        list.forEach((dt, idx) => {
          let cardEl = existingCards.get(dt.id);
          if (!cardEl || (typeof cardEl._checkStructuralChange === 'function' && cardEl._checkStructuralChange(dt))) {
            const newCard = taoTheDeTuChiTiet(dt, tt, kit);
            if (cardEl) {
              container.replaceChild(newCard, cardEl);
            } else {
              container.append(newCard);
            }
            existingCards.set(dt.id, newCard);
          } else {
            cardEl._update?.(dt);
            if (container.children[idx] !== cardEl) {
              container.insertBefore(cardEl, container.children[idx] || null);
            }
          }
        });
      }

      function capNhatUngVien(list, uvBox) {
        if (!list || list.length === 0) {
          uvBox.style.display = 'none';
          uvBox.innerHTML = '';
          return;
        }

        uvBox.style.display = 'flex';
        uvBox.innerHTML = `
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px dashed var(--vang-kim); padding-bottom: 4px; margin-bottom: 2px;">
            <b style="color: var(--vang-kim); font-size: 12.5px; white-space: nowrap;">📜 Ứng Viên Cầu Đạo (${list.length})</b>
            <span class="hud-phu" style="font-size: 11px; white-space: nowrap;">Chọn đồ đệ thu nạp</span>
          </div>
        `;

        list.forEach((uv, idx) => {
          const uvCard = document.createElement('div');
          uvCard.className = 'su-do-card';
          uvCard.style.cssText = 'padding: 6px 8px; gap: 4px; background: rgba(255,255,255,0.6);';

          const tc = TU_CHAT_MAP[uv.tuChat] ?? { ten: uv.tuChat, color: 'inherit', bg: 'transparent', border: 'transparent' };
          const heStr = dinhDangHe(uv.he);
          const tcStr = TINH_CACH_MAP[uv.tinhCach] ?? uv.tinhCach;

          uvCard.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; font-size: 12.5px; white-space: nowrap;">
              <span style="font-weight: bold; white-space: nowrap;">${uv.ten}</span>
              <span class="su-do-badge" style="color:${tc.color}; background:${tc.bg}; border:1px solid ${tc.border}; font-size:9.5px; padding:0 4px; white-space:nowrap;">${tc.ten}</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 11px; color: var(--muc-nhat); white-space: nowrap;">
              <span>${uv.gioiTinh === 'nam' ? 'Nam' : 'Nữ'} · ${Math.floor(Number(uv.tuoi) || 14)}t · ${heStr}</span>
              <span>Tâm tính: <i>${tcStr}</i></span>
            </div>
          `;

          const btnThuNhan = kit.button({
            text: 'Bái Nhập Sư Môn',
            kind: 'chinh',
            onClick: () => {
              const curMaxDt = sucChuaDeTu(tt.state().run?.nhanVat?.canhGioi ?? 0);
              const curDtCount = layModData(tt.state()).danhSachDeTu.length;
              if (curDtCount >= curMaxDt) {
                tt.ui.toast(`Môn phái đã đạt giới hạn sức chứa (${curDtCount}/${curMaxDt}), cần đột phá cảnh giới để thu thêm!`);
                return;
              }
              tt.game.modAction('su_do', 'nhan_de_tu', { index: idx });
              tt.ui.toast(`Đã thu nạp ${uv.ten} vào môn phái!`);
            },
          });
          btnThuNhan.classList.add('su-do-btn-wrap');
          btnThuNhan.style.cssText += 'margin-top: 3px; padding: 2px 8px; font-size: 11px; width: 100%;';
          uvCard.append(btnThuNhan);
          uvBox.append(uvCard);
        });
      }

      function capNhatNhatKy(nhatKy, box) {
        if (!nhatKy || nhatKy.length === 0) {
          box.innerHTML = `<div style="text-align: center; color: var(--muc-nhat); font-size: 12px; padding: 16px;">Chưa có biến cố sư môn nào được ghi lại.</div>`;
          return;
        }

        box.innerHTML = '';
        const list = document.createElement('div');
        list.style.cssText = 'display: flex; flex-direction: column; gap: 6px;';

        nhatKy.slice(0, 35).forEach((entry) => {
          const item = document.createElement('div');
          item.style.cssText = 'display: flex; gap: 6px; font-size: 11.5px; line-height: 1.4; border-bottom: 1px dashed var(--vien-trong); padding-bottom: 4px;';
          item.innerHTML = `
            <span class="hud-phu" style="flex-shrink: 0; font-size: 11px; white-space: nowrap;">[${dinhDangThoiGianNam(entry.nam)}]</span>
            <span style="flex: 1 1 auto;">${entry.text}</span>
          `;
          list.append(item);
        });

        box.append(list);
      }

      function capNhatLichLuyen(deTuList, box, namHienTai = 1) {
        box.innerHTML = '';
        deTuList.forEach((dt) => dongBoTienDoLichLuyen(dt, namHienTai));

        const dtDangLichLuyen = deTuList.filter((d) => d.trangThai?.loai === 'lich_luyen');
        const dtRanhRoi = deTuList.filter((d) => d.trangThai?.loai !== 'lich_luyen');

        // Khối 1: Đệ tử đang lịch luyện
        const dangDiBox = document.createElement('div');
        dangDiBox.className = 'su-do-header';
        dangDiBox.style.cssText += 'padding: 8px 10px; gap: 6px;';
        dangDiBox.innerHTML = `<b style="color: var(--chu-do); font-size: 12.5px; white-space: nowrap;">🏰 Đệ Tử Đang Lịch Luyện (${dtDangLichLuyen.length})</b>`;

        if (dtDangLichLuyen.length === 0) {
          const empty = document.createElement('div');
          empty.className = 'hud-phu';
          empty.style.cssText = 'font-size: 11.5px; text-align: center; padding: 6px 0;';
          empty.textContent = 'Hiện không có đồ đệ nào đang xuất sơn.';
          dangDiBox.append(empty);
        } else {
          dtDangLichLuyen.forEach((dt) => {
            const row = document.createElement('div');
            row.className = 'su-do-card';
            row.style.cssText = 'padding: 6px 8px; gap: 4px;';

            const nv = NHIEM_VU_LICH_LUYEN[dt.trangThai?.nhiemVu] ?? NHIEM_VU_LICH_LUYEN.hai_duoc;
            const conLai = Number(dt.trangThai?.namConLai) || 0;
            const daXong = conLai <= 0;

            row.innerHTML = `
              <div style="display: flex; justify-content: space-between; align-items: center; font-size: 12px; white-space: nowrap;">
                <span style="font-weight: bold;">${dt.ten}</span>
                <span class="su-do-badge" style="color:${daXong ? '#10b981' : '#f59e0b'}; background:${daXong ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)'}; border:1px solid ${daXong ? '#10b981' : '#f59e0b'}; font-size:9.5px; padding:0 4px; white-space:nowrap;">
                  ${daXong ? 'Đã Hoàn Thành' : `Còn ${conLai} năm`}
                </span>
              </div>
              <div style="display: flex; justify-content: space-between; font-size: 11px; color: var(--muc-nhat); white-space: nowrap;">
                <span>Nhiệm vụ: ${nv.icon} ${nv.ten}</span>
                <span>${conLai > 0 ? `Về năm: ${Math.floor(dt.trangThai?.namHoanThanh ?? namHienTai)}` : 'Đang chờ thu nhận'}</span>
              </div>
            `;

            if (daXong) {
              const btnThuHoach = kit.button({
                text: '🎁 Thu Nhận Thành Quả & Phần Thưởng',
                kind: 'chinh',
                onClick: () => {
                  tt.game.modAction('su_do', 'thu_hoach_lich_luyen', { deTuId: dt.id });
                  tt.ui.toast(`Đã thu nhận kết quả lịch luyện của ${dt.ten}!`);
                },
              });
              btnThuHoach.classList.add('su-do-btn-wrap');
              btnThuHoach.style.cssText += 'margin-top: 4px; padding: 3px 8px; font-size: 11px; width: 100%;';
              row.append(btnThuHoach);
            }

            dangDiBox.append(row);
          });
        }
        box.append(dangDiBox);

        // Khối 2: Phái đệ tử mới xuất sơn
        const phaiDiBox = document.createElement('div');
        phaiDiBox.className = 'su-do-card';
        phaiDiBox.style.cssText = 'padding: 8px 10px; gap: 6px;';
        phaiDiBox.innerHTML = `<b style="color: var(--vang-kim); font-size: 12.5px; white-space: nowrap;">📜 Phái Đồ Đệ Xuất Sơn Lịch Luyện</b>`;

        if (dtRanhRoi.length === 0) {
          const empty = document.createElement('div');
          empty.className = 'hud-phu';
          empty.style.cssText = 'font-size: 11.5px; text-align: center; padding: 6px 0;';
          empty.textContent = 'Tất cả đệ tử đều đang bận hoặc đang xuất sơn.';
          phaiDiBox.append(empty);
        } else {
          let selectedDtId = dtRanhRoi[0]?.id;
          let selectedNv = 'hai_duoc';
          let selectedSoNam = 2;

          const form = document.createElement('div');
          form.style.cssText = 'display: flex; flex-direction: column; gap: 6px; font-size: 11.5px;';

          // Chọn đệ tử
          const rowDt = document.createElement('div');
          rowDt.style.cssText = 'display: flex; align-items: center; justify-content: space-between; gap: 6px;';
          rowDt.innerHTML = `<span class="hud-phu" style="white-space: nowrap;">Chọn đệ tử:</span>`;
          const selDt = document.createElement('select');
          selDt.style.cssText = 'flex: 1 1 auto; padding: 3px 6px; border-radius: 4px; border: 1px solid var(--vien-hud); background: var(--nen-hud); color: var(--muc); font-size: 11.5px;';
          dtRanhRoi.forEach((d) => {
            const opt = document.createElement('option');
            opt.value = d.id;
            opt.textContent = `${d.ten} (${dinhDangCanhGioi(d.canhGioi, d.tieuCanhGioi)})`;
            selDt.append(opt);
          });
          selDt.addEventListener('change', (e) => {
            selectedDtId = e.target.value;
          });
          rowDt.append(selDt);
          form.append(rowDt);

          // Chọn phương hướng
          const rowNv = document.createElement('div');
          rowNv.style.cssText = 'display: flex; align-items: center; justify-content: space-between; gap: 6px;';
          rowNv.innerHTML = `<span class="hud-phu" style="white-space: nowrap;">Phương hướng:</span>`;
          const selNv = document.createElement('select');
          selNv.style.cssText = 'flex: 1 1 auto; padding: 3px 6px; border-radius: 4px; border: 1px solid var(--vien-hud); background: var(--nen-hud); color: var(--muc); font-size: 11.5px;';
          Object.keys(NHIEM_VU_LICH_LUYEN).forEach((k) => {
            const n = NHIEM_VU_LICH_LUYEN[k];
            const opt = document.createElement('option');
            opt.value = k;
            opt.textContent = `${n.icon} ${n.ten} (${n.moTa})`;
            selNv.append(opt);
          });
          selNv.addEventListener('change', (e) => {
            selectedNv = e.target.value;
            const defYears = NHIEM_VU_LICH_LUYEN[selectedNv]?.soNamMacDinh ?? 2;
            selNam.value = String(defYears);
            selectedSoNam = defYears;
          });
          rowNv.append(selNv);
          form.append(rowNv);

          // Chọn số năm
          const rowNam = document.createElement('div');
          rowNam.style.cssText = 'display: flex; align-items: center; justify-content: space-between; gap: 6px;';
          rowNam.innerHTML = `<span class="hud-phu" style="white-space: nowrap;">Thời gian:</span>`;
          const selNam = document.createElement('select');
          selNam.style.cssText = 'flex: 1 1 auto; padding: 3px 6px; border-radius: 4px; border: 1px solid var(--vien-hud); background: var(--nen-hud); color: var(--muc); font-size: 11.5px;';
          [1, 2, 3, 5].forEach((n) => {
            const opt = document.createElement('option');
            opt.value = String(n);
            opt.textContent = `${n} năm`;
            if (n === 2) opt.selected = true;
            selNam.append(opt);
          });
          selNam.addEventListener('change', (e) => {
            selectedSoNam = Number(e.target.value) || 2;
          });
          rowNam.append(selNam);
          form.append(rowNam);

          const btnPhaiDi = kit.button({
            text: '🚀 Ban Lệnh Xuất Sơn Lịch Luyện',
            kind: 'chinh',
            onClick: () => {
              if (!selectedDtId) return;
              tt.game.modAction('su_do', 'phai_lich_luyen', {
                deTuId: selectedDtId,
                nhiemVu: selectedNv,
                soNam: selectedSoNam,
              });
              tt.ui.toast('Đã phái đệ tử xuất sơn lịch luyện!');
            },
          });
          btnPhaiDi.classList.add('su-do-btn-wrap');
          btnPhaiDi.style.cssText += 'margin-top: 4px; padding: 4px 8px; font-size: 11.5px; font-weight: bold; width: 100%;';
          form.append(btnPhaiDi);
          phaiDiBox.append(form);
        }
        box.append(phaiDiBox);
      }

      // ==========================================
      // TAB MỚI: KIẾN THIẾT ĐẠO TRÀNG (TRỤ CỘT 1)
      // ==========================================
      function capNhatKienThiet(data, box, s, nv) {
        box.innerHTML = '';
        const kt = data.daoTrang.kienThiet;
        const curLt = Number(nv?.linhThach) || 0;
        const deTuList = data.danhSachDeTu;

        // 1. Tụ Linh Trận
        const cardTLT = document.createElement('div');
        cardTLT.className = 'su-do-kienthiet-card';
        const capTLT = Number(kt.tuLinhTran.cap) || 0;
        const cfgTLT = TU_LINH_TRAN_CONFIG[capTLT];
        const nextTLT = TU_LINH_TRAN_CONFIG[capTLT + 1];

        cardTLT.innerHTML = `
          <div class="su-do-kienthiet-header">
            <span class="su-do-kienthiet-title">⚡ ${cfgTLT.ten}</span>
            <span class="su-do-badge" style="color:#3b82f6; background:rgba(59,130,246,0.12); border:1px solid #3b82f6; font-size:9.5px; padding:0 4px;">Cấp ${capTLT}/4</span>
          </div>
          <div style="font-size:11.5px; line-height:1.4; color:var(--muc-nhat);">${cfgTLT.moTa}</div>
        `;

        if (nextTLT) {
          const btnUpTLT = kit.button({
            text: `Nâng Cấp Lên Cấp ${capTLT + 1} (${cfgTLT.phi} LT)`,
            kind: curLt >= cfgTLT.phi ? 'chinh' : 'phu',
            onClick: () => {
              if (curLt < cfgTLT.phi) {
                tt.ui.toast(`Sư tôn không đủ ${cfgTLT.phi} linh thạch!`);
                return;
              }
              tt.game.modAction('su_do', 'nang_cap_kien_thiet', { loai: 'tuLinhTran' });
              tt.ui.toast(`Đã nâng cấp Tụ Linh Trận lên ${nextTLT.ten}!`);
            },
          });
          btnUpTLT.style.cssText += 'margin-top:2px; font-size:11px; padding:3px 6px;';
          cardTLT.append(btnUpTLT);
        } else {
          const maxLabel = document.createElement('div');
          maxLabel.className = 'hud-phu';
          maxLabel.style.cssText = 'font-size:11px; color:#10b981; font-weight:bold;';
          maxLabel.textContent = '✨ Trận pháp đã đạt cấp Đỉnh Phong Viên Mãn!';
          cardTLT.append(maxLabel);
        }
        box.append(cardTLT);

        // 2. Dược Điền
        const cardDD = document.createElement('div');
        cardDD.className = 'su-do-kienthiet-card';
        const capDD = Number(kt.duocDien.cap) || 0;
        const cfgDD = DUOC_DIEN_CONFIG[capDD];
        const nextDD = DUOC_DIEN_CONFIG[capDD + 1];
        const duocDong = deTuList.find((d) => d.id === kt.duocDien.duocDongId);

        cardDD.innerHTML = `
          <div class="su-do-kienthiet-header">
            <span class="su-do-kienthiet-title">🌾 ${cfgDD.ten}</span>
            <span class="su-do-badge" style="color:#10b981; background:rgba(16,185,129,0.12); border:1px solid #10b981; font-size:9.5px; padding:0 4px;">Cấp ${capDD}/4</span>
          </div>
          <div style="font-size:11.5px; line-height:1.4; color:var(--muc-nhat);">${cfgDD.moTa}</div>
          <div style="font-size:11px; margin-top:2px;">
            <b>Dược Đồng:</b> ${duocDong ? duocDong.ten : 'Chưa phân công'}
            ${duocDong && (duocDong.he?.includes('moc') || duocDong.he?.includes('thuy') || duocDong.tinhCach === 'can_man') ? '<span style="color:#10b981; font-weight:bold;"> (✨ +50% sản lượng)</span>' : ''}
          </div>
        `;

        if (capDD > 0 && deTuList.length > 0) {
          const rowPhanCong = document.createElement('div');
          rowPhanCong.style.cssText = 'display:flex; align-items:center; gap:6px; margin-top:2px;';
          const selDD = document.createElement('select');
          selDD.style.cssText = 'flex:1 1 auto; font-size:11px; padding:2px 4px; border:1px solid var(--vien-hud); background:var(--nen-hud); border-radius:4px;';
          const optNone = document.createElement('option');
          optNone.value = '';
          optNone.textContent = '-- Để trống --';
          selDD.append(optNone);
          deTuList.forEach((d) => {
            const opt = document.createElement('option');
            opt.value = d.id;
            opt.textContent = `${d.ten} (${dinhDangHe(d.he)})`;
            if (d.id === kt.duocDien.duocDongId) opt.selected = true;
            selDD.append(opt);
          });
          selDD.addEventListener('change', (e) => {
            tt.game.modAction('su_do', 'phan_cong_chuc_nghiep', { loai: 'duocDien', deTuId: e.target.value || null });
            tt.ui.toast('Đã cập nhật Dược Đồng!');
          });
          rowPhanCong.append(selDD);
          cardDD.append(rowPhanCong);
        }

        if (nextDD) {
          const btnUpDD = kit.button({
            text: `Nâng Cấp Dược Điền (${cfgDD.phi} LT)`,
            kind: curLt >= cfgDD.phi ? 'chinh' : 'phu',
            onClick: () => {
              if (curLt < cfgDD.phi) {
                tt.ui.toast(`Sư tôn không đủ ${cfgDD.phi} linh thạch!`);
                return;
              }
              tt.game.modAction('su_do', 'nang_cap_kien_thiet', { loai: 'duocDien' });
              tt.ui.toast(`Đã nâng cấp Dược Điền lên ${nextDD.ten}!`);
            },
          });
          btnUpDD.style.cssText += 'margin-top:2px; font-size:11px; padding:3px 6px;';
          cardDD.append(btnUpDD);
        }
        box.append(cardDD);

        // 3. Luyện Đan Các
        const cardLDP = document.createElement('div');
        cardLDP.className = 'su-do-kienthiet-card';
        const capLDP = Number(kt.luyenDanPhong.cap) || 0;
        const cfgLDP = LUYEN_DAN_CONFIG[capLDP];
        const nextLDP = LUYEN_DAN_CONFIG[capLDP + 1];
        const danDong = deTuList.find((d) => d.id === kt.luyenDanPhong.danDongId);

        cardLDP.innerHTML = `
          <div class="su-do-kienthiet-header">
            <span class="su-do-kienthiet-title">🔥 ${cfgLDP.ten}</span>
            <span class="su-do-badge" style="color:#ef4444; background:rgba(239,68,68,0.12); border:1px solid #ef4444; font-size:9.5px; padding:0 4px;">Cấp ${capLDP}/4</span>
          </div>
          <div style="font-size:11.5px; line-height:1.4; color:var(--muc-nhat);">${cfgLDP.moTa}</div>
          <div style="font-size:11px; margin-top:2px;">
            <b>Đan Đồng:</b> ${danDong ? danDong.ten : 'Chưa phân công'}
            ${danDong && (danDong.he?.includes('hoa') || danDong.he?.includes('kim')) ? '<span style="color:#ef4444; font-weight:bold;"> (🔥 +50% tốc độ)</span>' : ''}
          </div>
        `;

        if (capLDP > 0 && deTuList.length > 0) {
          const rowPhanCongDan = document.createElement('div');
          rowPhanCongDan.style.cssText = 'display:flex; align-items:center; gap:6px; margin-top:2px;';
          const selLDP = document.createElement('select');
          selLDP.style.cssText = 'flex:1 1 auto; font-size:11px; padding:2px 4px; border:1px solid var(--vien-hud); background:var(--nen-hud); border-radius:4px;';
          const optNoneDan = document.createElement('option');
          optNoneDan.value = '';
          optNoneDan.textContent = '-- Để trống --';
          selLDP.append(optNoneDan);
          deTuList.forEach((d) => {
            const opt = document.createElement('option');
            opt.value = d.id;
            opt.textContent = `${d.ten} (${dinhDangHe(d.he)})`;
            if (d.id === kt.luyenDanPhong.danDongId) opt.selected = true;
            selLDP.append(opt);
          });
          selLDP.addEventListener('change', (e) => {
            tt.game.modAction('su_do', 'phan_cong_chuc_nghiep', { loai: 'luyenDanPhong', deTuId: e.target.value || null });
            tt.ui.toast('Đã cập nhật Đan Đồng!');
          });
          rowPhanCongDan.append(selLDP);
          cardLDP.append(rowPhanCongDan);
        }

        if (nextLDP) {
          const btnUpLDP = kit.button({
            text: `Nâng Cấp Lò Đan (${cfgLDP.phi} LT)`,
            kind: curLt >= cfgLDP.phi ? 'chinh' : 'phu',
            onClick: () => {
              if (curLt < cfgLDP.phi) {
                tt.ui.toast(`Sư tôn không đủ ${cfgLDP.phi} linh thạch!`);
                return;
              }
              tt.game.modAction('su_do', 'nang_cap_kien_thiet', { loai: 'luyenDanPhong' });
              tt.ui.toast(`Đã nâng cấp Luyện Đan Các lên ${nextLDP.ten}!`);
            },
          });
          btnUpLDP.style.cssText += 'margin-top:2px; font-size:11px; padding:3px 6px;';
          cardLDP.append(btnUpLDP);
        }
        box.append(cardLDP);
      }

      // ==========================================
      // TAB MỚI: LUẬN KIẾM TÔNG MÔN (TRỤ CỘT 3)
      // ==========================================
      function capNhatLuanKiem(data, box) {
        box.innerHTML = '';
        const deTuList = data.danhSachDeTu.filter((d) => d.trangThai?.loai !== 'lich_luyen');

        const arenaBox = document.createElement('div');
        arenaBox.className = 'su-do-arena-box';
        arenaBox.innerHTML = `
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <b style="color:var(--chu-do); font-size:13px;">⚔️ Võ Đài Luận Kiếm Tông Môn</b>
            <span class="hud-phu" style="font-size:11px;">Tỉ thí cọ xát võ học</span>
          </div>
        `;

        if (deTuList.length < 2) {
          const empty = document.createElement('div');
          empty.className = 'hud-phu';
          empty.style.cssText = 'text-align:center; padding:16px 0; font-size:12px;';
          empty.textContent = 'Cần ít nhất 2 đồ đệ rảnh rỗi tại tông môn để tổ chức Luận Kiếm.';
          arenaBox.append(empty);
          box.append(arenaBox);
          return;
        }

        let idA = deTuList[0]?.id;
        let idB = deTuList[1]?.id;

        const vsRow = document.createElement('div');
        vsRow.style.cssText = 'display:flex; justify-content:space-between; align-items:center; gap:8px;';

        const selA = document.createElement('select');
        selA.style.cssText = 'flex:1 1 0; min-width:0; font-size:11.5px; padding:3px 4px; border:1px solid var(--vien-hud); background:var(--nen-hud); border-radius:4px;';
        const selB = document.createElement('select');
        selB.style.cssText = 'flex:1 1 0; min-width:0; font-size:11.5px; padding:3px 4px; border:1px solid var(--vien-hud); background:var(--nen-hud); border-radius:4px;';

        deTuList.forEach((d) => {
          const optA = document.createElement('option');
          optA.value = d.id;
          optA.textContent = `${d.ten}`;
          if (d.id === idA) optA.selected = true;
          selA.append(optA);

          const optB = document.createElement('option');
          optB.value = d.id;
          optB.textContent = `${d.ten}`;
          if (d.id === idB) optB.selected = true;
          selB.append(optB);
        });

        selA.addEventListener('change', (e) => { idA = e.target.value; });
        selB.addEventListener('change', (e) => { idB = e.target.value; });

        vsRow.append(selA);
        const vsBadge = document.createElement('b');
        vsBadge.style.cssText = 'color:var(--chu-do); font-size:12px;';
        vsBadge.textContent = 'VS';
        vsRow.append(vsBadge);
        vsRow.append(selB);
        arenaBox.append(vsRow);

        const btnDau = kit.button({
          text: '⚔️ Khai Mạc Luận Kiếm Tông Môn',
          kind: 'chinh',
          onClick: () => {
            if (idA === idB) {
              tt.ui.toast('Không thể chọn cùng một đệ tử để so tài!');
              return;
            }
            tt.game.modAction('su_do', 'luan_kiem_noi_mon', { deTuIdA: idA, deTuIdB: idB });
            tt.ui.toast('Luận Kiếm kết thúc! Đã có chiến báo mới.');
          },
        });
        btnDau.style.cssText += 'margin-top:4px; width:100%; font-size:12px; font-weight:bold;';
        arenaBox.append(btnDau);

        // Hiển thị Chiến báo gần nhất nếu có
        const cb = data.daoTrang.chienBaoMoiNhat;
        if (cb) {
          const logBox = document.createElement('div');
          logBox.className = 'su-do-combat-log';
          logBox.innerHTML = `
            <div style="display:flex; justify-content:space-between; border-bottom:1px dashed var(--vien-trong); padding-bottom:3px;">
              <b>📜 Chiến Báo So Tài [Năm ${cb.nam}]</b>
              <span style="color:#10b981; font-weight:bold;">🏆 Thắng: ${cb.thangTen}</span>
            </div>
            <div>${cb.hiep1}</div>
            <div>${cb.hiep2}</div>
            <div style="font-weight:bold; color:var(--chu-do);">${cb.chungCuoc}</div>
          `;
          arenaBox.append(logBox);
        }

        box.append(arenaBox);
      }

      function capNhatTienDuyen(box) {
        box.innerHTML = '';
        const luu = localStorage.getItem('mod:su_do:tien_duyen');
        let deTuCu = [];
        if (luu) {
          try {
            deTuCu = JSON.parse(luu);
          } catch (e) {}
        }

        const info = document.createElement('div');
        info.className = 'su-do-header';
        info.innerHTML = `
          <div style="font-size: 13px; font-weight: bold; color: var(--chu-do); white-space: nowrap;">🌸 Tiền Duyên Tương Ngộ</div>
          <div class="hud-phu" style="font-size: 11.5px; line-height: 1.5;">
            Khi sư tôn chuyển sinh luân hồi, đồ đệ kiếp trước sẽ trở thành tán tu hoặc lão quái nơi thế gian.
            Ngươi có cơ hội gặp lại họ qua kỳ ngộ "Tiền duyên chưa dứt" để nhận lại bảo vật năm xưa!
          </div>
        `;
        box.append(info);

        const list = document.createElement('div');
        list.style.cssText = 'display: flex; flex-direction: column; gap: 6px;';

        if (deTuCu.length === 0) {
          list.innerHTML = `<div style="text-align: center; color: var(--muc-nhat); font-size: 12px; padding: 12px;">Chưa có đồ đệ nào ở kiếp trước.</div>`;
        } else {
          deTuCu.forEach((d) => {
            const card = document.createElement('div');
            card.className = 'su-do-card';
            card.style.cssText = 'padding: 6px 8px; font-size: 11.5px; white-space: nowrap;';
            card.innerHTML = `
              <div style="display: flex; justify-content: space-between; align-items: center; white-space: nowrap;">
                <b>${d.ten}</b>
                <span class="hud-phu">${dinhDangCanhGioi(d.canhGioi, d.tieuCanhGioi)}</span>
              </div>
            `;
            list.append(card);
          });
        }
        box.append(list);
      }

      // ==========================================
      // HEADER ĐẠO TRÀNG
      // ==========================================
      function taoDaoTrangHeader(data, nv, maxDt, kitInstance, ttInstance) {
        const header = document.createElement('div');
        header.className = 'su-do-header';

        const titleRow = document.createElement('div');
        titleRow.className = 'su-do-header-title';

        const titleText = document.createElement('span');
        titleText.className = 'su-do-title-text';
        titleText.textContent = data.daoTrangTen;
        titleRow.append(titleText);

        const btnDoiTen = kitInstance.button({
          text: '✏️ Đổi Tên',
          kind: 'nho',
          onClick: async () => {
            const tenMoi = prompt('Nhập danh hiệu Đạo Tràng mới của Sư Tôn:', data.daoTrangTen);
            if (tenMoi && tenMoi.trim() && tenMoi.trim() !== data.daoTrangTen) {
              ttInstance.game.modAction('su_do', 'doi_ten_dao_trang', { ten: tenMoi.trim() });
              ttInstance.ui.toast(`Đã đổi tên đạo tràng thành "${tenMoi.trim()}"!`);
            }
          },
        });
        btnDoiTen.classList.add('su-do-btn-wrap');
        btnDoiTen.style.cssText += 'padding: 1px 6px; font-size: 10.5px;';
        titleRow.append(btnDoiTen);
        header.append(titleRow);

        const subRow = document.createElement('div');
        subRow.className = 'su-do-header-sub';
        header.append(subRow);

        const statsRow = document.createElement('div');
        statsRow.className = 'su-do-header-stats';
        header.append(statsRow);

        header._update = (newData, newNv, newMaxDt) => {
          titleText.textContent = newData.daoTrangTen;
          const cgTen = dinhDangCanhGioi(newNv?.canhGioi ?? 0);
          subRow.textContent = `Sư Tôn: ${newNv?.ten ?? 'Vô Danh'} (${cgTen})`;

          const count = newData.danhSachDeTu.length;
          const capTLT = Number(newData.daoTrang?.kienThiet?.tuLinhTran?.cap) || 0;
          statsRow.innerHTML = `
            <span>👥 Đồ đệ: <b>${count}/${newMaxDt}</b></span>
            <span>⚡ Tụ Linh: <b>Lv${capTLT}</b></span>
            <span>💰 Linh thạch: <b>${newNv?.linhThach ?? 0}</b></span>
          `;
        };

        header._update(data, nv, maxDt);
        return header;
      }

      // ==========================================
      // 5. CẮM Ô TAB VÀO MÀN HÌNH NHÂN VẬT (SLOT)
      // ==========================================
      mod.ui.addSlot('characterTab', {
        id: 'de_tu_tab',
        title: 'Đồ Đệ',
        mount(el) {
          injectMasterStyles();
          el.innerHTML = '';

          const container = document.createElement('div');
          container.className = 'su-do-panel';
          container.style.cssText = 'padding: 4px 0; display: flex; flex-direction: column; gap: 8px;';

          const topBar = document.createElement('div');
          topBar.style.cssText = 'display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--vien-hud); padding-bottom: 6px;';

          const titleSpan = document.createElement('span');
          titleSpan.style.cssText = 'font-weight: bold; font-size: 13px; color: var(--chu-do);';
          titleSpan.textContent = 'Đồ Đệ Môn Phái';
          topBar.append(titleSpan);

          const btnMoDaoTrang = kit.button({
            text: '🏛️ Vào Đạo Tràng',
            kind: 'chinh',
            onClick: () => {
              mod.ui.openPanel('dao_trang_panel');
            },
          });
          btnMoDaoTrang.classList.add('su-do-btn-wrap');
          btnMoDaoTrang.style.cssText += 'padding: 3px 8px; font-size: 11px;';
          topBar.append(btnMoDaoTrang);
          container.append(topBar);

          const listContainer = document.createElement('div');
          listContainer.style.cssText = 'display: flex; flex-direction: column; gap: 6px;';
          container.append(listContainer);
          el.append(container);

          const capNhatSlot = () => {
            const s = tt.state();
            const data = layModData(s);
            const dtList = data.danhSachDeTu;

            if (dtList.length === 0) {
              listContainer.innerHTML = `
                <div style="text-align: center; color: var(--muc-nhat); font-size: 12px; padding: 16px 8px; line-height: 1.5;">
                  Chưa có đồ đệ.<br/>
                  Bấm <b>"Vào Đạo Tràng"</b> để chiêu mộ đệ tử đầu tiên!
                </div>
              `;
              return;
            }

            listContainer.innerHTML = '';
            dtList.forEach((dt) => {
              const card = taoTheDeTuNho(dt, tt, kit);
              listContainer.append(card);
            });
          };

          capNhatSlot();
          const unsub = tt.subscribe(capNhatSlot);
          return () => {
            unsub();
          };
        },
      });

      // ==========================================
      // 6. TIỆN ÍCH HUD MINI-DOCK (TRỤ CỘT 5)
      // ==========================================
      mod.ui.addDock({
        id: 'su_do_dock',
        title: '🏛️ Đạo Tràng',
        mount(el) {
          injectMasterStyles();
          el.innerHTML = '';

          const dockBox = document.createElement('div');
          dockBox.className = 'su-do-dock-box';

          const updateDock = () => {
            const s = tt.state();
            const data = layModData(s);
            const nv = s?.run?.nhanVat;
            const maxDt = sucChuaDeTu(nv?.canhGioi ?? 0);
            const count = data.danhSachDeTu.length;
            const capTLT = Number(data.daoTrang.kienThiet.tuLinhTran.cap) || 0;
            const capDD = Number(data.daoTrang.kienThiet.duocDien.cap) || 0;

            const hasMaHoa = data.danhSachDeTu.some((d) => d.trangThai?.loai === 'ma_hoa');
            const hasXongLichLuyen = data.danhSachDeTu.some((d) => d.trangThai?.loai === 'lich_luyen' && (Number(d.trangThai?.namConLai) || 0) <= 0);
            const hasReadyBreakthrough = data.danhSachDeTu.some((d) => (Number(d.tuVi) || 0) >= (Number(d.tuViYeuCau) || 1));

            dockBox.innerHTML = `
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <b style="color:var(--chu-do); font-size:12px;">${data.daoTrangTen}</b>
                <span class="hud-phu" style="font-size:11px;">${count}/${maxDt}</span>
              </div>
              <div style="font-size:10.5px; color:var(--muc-nhat); display:flex; gap:6px;">
                <span>⚡ Tụ Linh: Lv${capTLT}</span>
                <span>🌾 Dược Điền: Lv${capDD}</span>
              </div>
              ${hasMaHoa ? '<div style="color:#ef4444; font-weight:bold; font-size:10.5px;">🔴 Có nghịch đồ ma hóa!</div>' : ''}
              ${hasXongLichLuyen ? '<div style="color:#10b981; font-weight:bold; font-size:10.5px;">📜 Đệ tử lịch luyện đã về!</div>' : ''}
              ${hasReadyBreakthrough ? '<div style="color:#f59e0b; font-weight:bold; font-size:10.5px;">⚡ Có đệ tử chờ đột phá!</div>' : ''}
            `;

            const btnOpen = kit.button({
              text: '🏛️ Mở Đạo Tràng',
              kind: 'chinh',
              onClick: () => {
                mod.ui.openPanel('dao_trang_panel');
              },
            });
            btnOpen.style.cssText += 'margin-top:2px; padding:2px 6px; font-size:11px; width:100%;';
            dockBox.append(btnOpen);
          };

          updateDock();
          el.append(dockBox);
          const unsub = tt.subscribe(updateDock);
          return () => {
            unsub();
          };
        },
      });

      // ==========================================
      // 7. BẢNG ĐIỀU KHIỂN CHÍNH: ĐẠO TRÀNG (PANEL)
      // ==========================================
      mod.ui.addPanel({
        id: 'dao_trang_panel',
        title: '🏛️ Đạo Tràng',
        mount(el) {
          injectMasterStyles();
          el.innerHTML = '';

          const s0 = tt.state();
          const data0 = layModData(s0);
          const nv0 = s0.run?.nhanVat;
          const maxDt0 = sucChuaDeTu(nv0?.canhGioi ?? 0);

          const container = document.createElement('div');
          container.className = 'su-do-panel';
          container.style.cssText = 'min-height: 440px;';

          const header = taoDaoTrangHeader(data0, nv0, maxDt0, kit, tt);
          container.append(header);

          const tabUpdaters = {};

          const tabsEl = kit.tabs({
            tabs: [
              // TAB 1: ĐỒ ĐỆ
              {
                id: 'tab_de_tu',
                title: `Đồ Đệ (${data0.danhSachDeTu.length})`,
                mount(box) {
                  box.style.cssText = 'display: flex; flex-direction: column; gap: 8px; margin-top: 6px;';

                  const topAct = document.createElement('div');
                  topAct.style.cssText = 'display: flex; justify-content: space-between; align-items: center; margin-bottom: 2px; gap: 8px;';

                  const desc = document.createElement('div');
                  desc.style.cssText = 'font-size: 11.5px; color: var(--muc-nhat); white-space: nowrap;';
                  topAct.append(desc);

                  const btnChieuMo = kit.button({
                    text: '📜 Chiêu Mộ Đồ Đệ',
                    kind: 'chinh',
                    onClick: () => {
                      tt.game.modAction('su_do', 'tuyen_do', {});
                      tt.ui.toast('Đã mở kỳ tuyển đồ! 3 ứng viên xuất hiện bên dưới.');
                    },
                  });
                  btnChieuMo.classList.add('su-do-btn-wrap');
                  btnChieuMo.style.cssText += 'padding: 3px 10px; font-size: 11.5px; font-weight: bold;';
                  topAct.append(btnChieuMo);
                  box.append(topAct);

                  const uvBox = document.createElement('div');
                  uvBox.style.cssText = 'background: rgba(218, 165, 32, 0.06); border: 1px dashed var(--vang-kim); border-radius: 8px; padding: 8px 10px; display: flex; flex-direction: column; gap: 6px;';
                  box.append(uvBox);

                  const discipleContainer = document.createElement('div');
                  discipleContainer.style.cssText = 'display: flex; flex-direction: column; gap: 8px;';
                  box.append(discipleContainer);

                  tabUpdaters.tab_de_tu = (data, s, nv, maxDt) => {
                    const namHienTai = s?.run?.nam ?? 1;
                    data.danhSachDeTu.forEach((dt) => dongBoTienDoLichLuyen(dt, namHienTai));
                    desc.innerHTML = `Đệ tử: <b>${data.danhSachDeTu.length}/${maxDt}</b>`;
                    capNhatUngVien(data.ungVien, uvBox);
                    capNhatDanhSachDeTu(data.danhSachDeTu, discipleContainer);
                  };

                  const curS = tt.state();
                  const curData = layModData(curS);
                  const curNv = curS.run?.nhanVat;
                  tabUpdaters.tab_de_tu(curData, curS, curNv, sucChuaDeTu(curNv?.canhGioi ?? 0));

                  return () => {
                    delete tabUpdaters.tab_de_tu;
                  };
                },
              },

              // TAB 2: KIẾN THIẾT ĐẠO TRÀNG
              {
                id: 'tab_kien_thiet',
                title: 'Kiến Thiết',
                mount(box) {
                  box.style.cssText = 'display: flex; flex-direction: column; gap: 8px; margin-top: 6px;';

                  tabUpdaters.tab_kien_thiet = (data, s, nv) => {
                    capNhatKienThiet(data, box, s, nv);
                  };

                  const curS = tt.state();
                  const curData = layModData(curS);
                  const curNv = curS.run?.nhanVat;
                  tabUpdaters.tab_kien_thiet(curData, curS, curNv);

                  return () => {
                    delete tabUpdaters.tab_kien_thiet;
                  };
                },
              },

              // TAB 3: LUẬN KIẾM TÔNG MÔN
              {
                id: 'tab_luan_kiem',
                title: 'Luận Kiếm',
                mount(box) {
                  box.style.cssText = 'display: flex; flex-direction: column; gap: 8px; margin-top: 6px;';

                  tabUpdaters.tab_luan_kiem = (data) => {
                    capNhatLuanKiem(data, box);
                  };

                  const curS = tt.state();
                  const curData = layModData(curS);
                  tabUpdaters.tab_luan_kiem(curData);

                  return () => {
                    delete tabUpdaters.tab_luan_kiem;
                  };
                },
              },

              // TAB 4: LỊCH LUYỆN
              {
                id: 'tab_lich_luyen',
                title: 'Lịch Luyện',
                mount(box) {
                  box.style.cssText = 'display: flex; flex-direction: column; gap: 8px; margin-top: 6px;';

                  tabUpdaters.tab_lich_luyen = (data, s) => {
                    capNhatLichLuyen(data.danhSachDeTu, box, s?.run?.nam ?? 1);
                  };

                  const curS = tt.state();
                  const curData = layModData(curS);
                  tabUpdaters.tab_lich_luyen(curData, curS);

                  return () => {
                    delete tabUpdaters.tab_lich_luyen;
                  };
                },
              },

              // TAB 5: NHẬT KÝ SƯ MÔN
              {
                id: 'tab_su_mon',
                title: 'Nhật Ký',
                mount(box) {
                  box.style.cssText = 'display: flex; flex-direction: column; gap: 8px; margin-top: 6px;';

                  tabUpdaters.tab_su_mon = (data) => {
                    capNhatNhatKy(data.nhatKy, box);
                  };

                  const curS = tt.state();
                  const curData = layModData(curS);
                  tabUpdaters.tab_su_mon(curData);

                  return () => {
                    delete tabUpdaters.tab_su_mon;
                  };
                },
              },

              // TAB 6: TIỀN DUYÊN
              {
                id: 'tab_truyen_thua',
                title: 'Tiền Duyên',
                mount(box) {
                  box.style.cssText = 'display: flex; flex-direction: column; gap: 10px; margin-top: 6px; font-size: 13px;';

                  tabUpdaters.tab_truyen_thua = () => {
                    capNhatTienDuyen(box);
                  };

                  tabUpdaters.tab_truyen_thua();

                  return () => {
                    delete tabUpdaters.tab_truyen_thua;
                  };
                },
              },
            ],
          });

          container.append(tabsEl);
          el.append(container);

          const onStateChange = () => {
            const s = tt.state();
            const data = layModData(s);
            const nv = s.run?.nhanVat;
            const maxDt = sucChuaDeTu(nv?.canhGioi ?? 0);

            header._update?.(data, nv, maxDt);

            const tab1Btn = tabsEl.querySelector('.ui-tabs > button:nth-child(1)');
            if (tab1Btn) {
              const expectedTitle = `Đồ Đệ (${data.danhSachDeTu.length})`;
              if (tab1Btn.textContent !== expectedTitle) {
                tab1Btn.textContent = expectedTitle;
              }
            }

            for (const k of Object.keys(tabUpdaters)) {
              try {
                tabUpdaters[k]?.(data, s, nv, maxDt);
              } catch (err) {
                console.error(`[Mod Sư Đồ] Lỗi khi cập nhật tab ${k}:`, err);
              }
            }
          };

          const unsubState = tt.subscribe(onStateChange);

          return () => {
            unsubState();
          };
        },
      });
    },
  });
})();
