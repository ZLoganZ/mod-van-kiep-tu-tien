/**
 * Mod Sư Đồ Truyền Thừa (su_do) - Vạn Kiếp Tu Tiên
 * Tác giả: Antigravity & Tu Tiên Giả
 * Phiên bản: 1.0.13
 * Tương thích: apiVersion 1 (Giao diện Tiên Hiệp Cổ Phong Tinh Mỹ, Ẩn Scrollbar 100%, Tối Ưu Render DOM & Bộ Nhớ)
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
  };

  const TU_CHAT_MAP = {
    pho_thong: { ten: 'Phổ Thông', color: 'var(--muc-nhat)', bg: 'rgba(0,0,0,0.06)', border: 'var(--vien-hud)' },
    kha: { ten: 'Khá Giỏi', color: '#10b981', bg: 'rgba(16,185,129,0.12)', border: '#10b981' },
    thien_tai: { ten: 'Thiên Tài', color: '#f59e0b', bg: 'rgba(245,158,11,0.15)', border: '#f59e0b' },
    yeu_nghiet: { ten: 'Yêu Nghiệt', color: '#ef4444', bg: 'rgba(239,68,68,0.18)', border: '#ef4444' },
  };

  const TINH_CACH_MAP = {
    hieu_thuan: 'Hiếu Thuận',
    kien_dinh: 'Kiên Định',
    kieu_ngao: 'Kiêu Ngạo',
    can_man: 'Cần Mẫn',
  };

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
      version: Number(suDo?.version) || 1,
      daoTrangTen: typeof suDo?.daoTrangTen === 'string' && suDo.daoTrangTen.trim() ? suDo.daoTrangTen : 'Thanh Khê Đạo Tràng',
      danhSachDeTu: Array.isArray(suDo?.danhSachDeTu) ? suDo.danhSachDeTu : [],
      ungVien: Array.isArray(suDo?.ungVien) ? suDo.ungVien : [],
      nhatKy: Array.isArray(suDo?.nhatKy) ? suDo.nhatKy : [],
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
    const namConLai = Math.ceil(Number(dt?.trangThai?.namConLai) || 0);
    const vaiVe = dt?.vaiVe ?? 'de_tu';
    return `${vaiVe}_${cg}_${tcg}_${loai}_${namConLai}_${sanSang ? 1 : 0}_${laDaiCanhGioi ? 1 : 0}`;
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
      /* Ẩn triệt để scrollbar trên toàn bộ trang nhưng vẫn cuộn cực mượt */
      * {
        scrollbar-width: none !important;
        -ms-overflow-style: none !important;
      }
      *::-webkit-scrollbar {
        display: none !important;
        width: 0 !important;
        height: 0 !important;
      }
      
      /* Mở rộng bề ngang cho Mod Sư Đồ hiển thị khoáng đạt, không bị gò bó */
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

      /* Phong cách Tiên Hiệp cho Mod Sư Đồ */
      .su-do-panel {
        font-family: inherit;
        color: var(--muc);
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      /* Tab tinh giản, chống rớt dòng */
      .su-do-panel .ui-tabs {
        display: flex !important;
        flex-wrap: nowrap !important;
        gap: 3px !important;
        margin: 0 0 6px 0 !important;
      }
      .su-do-panel .ui-tabs > button {
        flex: 1 1 0 !important;
        min-width: 0 !important;
        padding: 4px 2px !important;
        font-size: 11px !important;
        white-space: nowrap !important;
        text-overflow: ellipsis !important;
        overflow: hidden !important;
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

      /* Thẻ bài đệ tử tinh xảo */
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

      .su-do-avatar {
        width: 42px;
        height: 42px;
        border-radius: 50%;
        border: 1.5px solid var(--vien-hud, #d4c5a9);
        box-shadow: 0 1px 4px rgba(0,0,0,0.1);
        overflow: hidden;
        background-color: #fbf8f2;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }
      .su-do-avatar img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        object-position: 50% 15%;
        transform: scale(1.35);
        display: block;
      }

      .su-do-card-info {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      .su-do-card-name-row {
        display: flex;
        align-items: center;
        gap: 5px;
        min-width: 0;
        line-height: 1.2;
      }

      .su-do-card-name {
        font-size: 13.5px;
        font-weight: bold;
        white-space: nowrap;
        flex-shrink: 0;
      }

      .su-do-card-meta {
        font-size: 10.5px;
        color: var(--muc-nhat);
        margin-left: auto;
        white-space: nowrap;
        flex-shrink: 0;
      }

      .su-do-card-subrow {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 11px;
        min-width: 0;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .su-do-card-subrow span {
        white-space: nowrap;
        flex-shrink: 0;
      }

      .su-do-card-stats {
        font-size: 10.5px;
        color: var(--muc-nhat);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        line-height: 1.2;
      }

      .su-do-badge {
        display: inline-flex;
        align-items: center;
        gap: 2px;
        font-size: 10px;
        padding: 1px 6px;
        border-radius: 8px;
        line-height: 1.3;
        font-weight: 600;
        white-space: nowrap;
        flex-shrink: 0;
      }

      .su-do-btn-wrap {
        white-space: nowrap !important;
        flex-shrink: 0 !important;
      }

      .su-do-btn-mini {
        padding: 0 !important;
        margin: 0 !important;
        flex-shrink: 0 !important;
        width: auto !important;
      }
      .su-do-btn-mini button,
      .su-do-btn-mini .btn-act {
        min-width: 0 !important;
        width: auto !important;
        padding: 4px 10px !important;
        font-size: 11px !important;
        line-height: 1.2 !important;
        height: auto !important;
      }

      /* Thanh tiến trình tu vi đẹp mắt */
      .su-do-progress-bar {
        height: 6px;
        background: rgba(0,0,0,0.08);
        border-radius: 3px;
        overflow: hidden;
        flex: 1;
      }
      .su-do-progress-val {
        height: 100%;
        background: linear-gradient(90deg, var(--chu-do), #d97706);
        border-radius: 3px;
        transition: width 0.3s ease;
      }
      .su-do-progress-val.su-do-progress-max {
        background: linear-gradient(90deg, #d97706, #ef4444) !important;
        box-shadow: 0 0 6px rgba(239, 68, 68, 0.4);
      }

      /* Hàng nút bấm chia theo cụm */
      .su-do-action-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 4px;
        margin-top: 2px;
      }
      .su-do-action-grid button {
        padding: 3px 2px !important;
        font-size: 11px !important;
        white-space: nowrap !important;
        text-align: center !important;
        justify-content: center !important;
        min-width: 0 !important;
      }

      .su-do-action-subgrid {
        display: flex;
        gap: 4px;
        justify-content: space-between;
        align-items: center;
        margin-top: 2px;
        padding-top: 4px;
        border-top: 1px dashed var(--vien-trong);
      }
      .su-do-action-subgrid button {
        padding: 3px 6px !important;
        font-size: 11px !important;
        white-space: nowrap !important;
        min-width: 0 !important;
      }
    `;

    const head = document.head || document.getElementsByTagName('head')[0] || document.documentElement;
    if (head) {
      head.append(style);
    }
  }

  // Biến toàn cục module lưu handle hủy sự kiện lifeEnd để chống rò rỉ bộ nhớ
  let unsubLifeEndListener = null;

  // ==========================================
  // 4. ĐĂNG KÝ MOD VÀO HỆ THỐNG GAME
  // ==========================================
  (window.tuTienMods ??= []).push({
    id: 'su_do',

    // ========================================================
    // PHA 1: BOOT (Khởi tạo logic hạt nhân, actions, tick hook)
    // ========================================================
    boot(tt, mod) {
      mod.log('Khởi động Mod Sư Đồ Truyền Thừa (Pha boot)...');

      // Danh sách họ danh gia vọng tộc (24 họ)
      const HO_DANH_SACH = ['Lâm', 'Diệp', 'Tiêu', 'Sở', 'Hàn', 'Bạch', 'Cố', 'Vương', 'Lý', 'Trần', 'Thạch', 'Khương', 'Tạ', 'Vũ', 'Lục', 'Ninh', 'Thẩm', 'Tống', 'Tần', 'Mạc', 'Liễu', 'Âu Dương', 'Độc Cô', 'Tư Mã'];

      // Tên nam: Khí khái, hùng tráng, kiên định (100% không trùng tên nữ)
      const DEM_NAM = ['Trường', 'Bá', 'Vô', 'Nhất', 'Thiên', 'Hạo', 'Huyền', 'Minh', 'Kính', 'Trọng', 'Đức', 'Chấn', 'Cửu', 'Cảnh', 'Chí', 'Đại', 'Vĩnh', 'Định', 'Khắc', 'Nguyên'];
      const CHINH_NAM = ['Phong', 'Phàm', 'Kiếm', 'Viêm', 'Dực', 'Hạo', 'Kỳ', 'Xuyên', 'Liệt', 'Long', 'Lôi', 'Sơn', 'Khang', 'Bằng', 'Bách', 'Thương', 'Trảm', 'Đoan', 'Hải', 'Hùng', 'Vực', 'Hạc', 'Tiêu', 'Đỉnh'];

      // Tên nữ: Dịu dàng, thanh nhã, tiên khí phiêu dật (100% không trùng tên nam)
      const DEM_NU = ['Mộng', 'Tuyết', 'Nguyệt', 'Thanh', 'Tố', 'Băng', 'Uyển', 'Tử', 'Tiểu', 'Thục', 'Nhược', 'Lạc', 'Thược', 'Bích', 'Vân', 'Thần', 'Gia', 'Bảo', 'Thu', 'Hạ'];
      const CHINH_NU = ['Dao', 'Sương', 'Nhi', 'Hinh', 'Thiền', 'Vy', 'Yên', 'Cầm', 'Chỉ', 'Thoa', 'Mi', 'Thảo', 'Thư', 'Huyên', 'Liên', 'Trúc', 'Quỳnh', 'Liễu', 'Khuê', 'Dung', 'Tú', 'Cơ', 'Nhu', 'Khê'];

      const HE_DANH_SACH = ['kim', 'moc', 'thuy', 'hoa', 'tho'];
      const TU_CHAT_LIST = [
        { id: 'pho_thong', ten: 'Phổ Thông', heSo: 1.0 },
        { id: 'kha', ten: 'Khá Giỏi', heSo: 1.3 },
        { id: 'thien_tai', ten: 'Thiên Tài', heSo: 1.8 },
        { id: 'yeu_nghiet', ten: 'Yêu Nghiệt', heSo: 2.5 },
      ];
      const TINH_CACH_LIST = [
        { id: 'hieu_thuan', ten: 'Hiếu Thuận', moTa: 'Tôn kính sư tôn, hay dâng linh trà' },
        { id: 'kien_dinh', ten: 'Kiên Định', moTa: 'Khổ tu bền bỉ, ít bị tâm ma quấy nhiễu' },
        { id: 'kieu_ngao', ten: 'Kiêu Ngạo', moTa: 'Thực chiến cao nhưng dễ sinh lòng đố kỵ' },
        { id: 'can_man', ten: 'Cần Mẫn', moTa: 'Lịch luyện chuyên tâm, mang nhiều tài nguyên' },
      ];

      function taoRng(seed) {
        let s = (Math.abs(Number(seed)) * 1000000 + 1) >>> 0;
        return function next() {
          s = (s + 0x6d2b79f5) >>> 0;
          let t = Math.imul(s ^ (s >>> 15), 1 | s);
          t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
          return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        };
      }

      function taoDeTuNgauNhien(seed, canhGioiNguoiChoi = 1) {
        const rng = taoRng(seed);
        const gioiTinh = rng() > 0.5 ? 'nam' : 'nu';
        const ho = HO_DANH_SACH[Math.floor(rng() * HO_DANH_SACH.length)];
        let ten = '';
        if (gioiTinh === 'nam') {
          const chinh = CHINH_NAM[Math.floor(rng() * CHINH_NAM.length)];
          if (rng() < 0.75) {
            const dem = DEM_NAM[Math.floor(rng() * DEM_NAM.length)];
            ten = `${ho} ${dem} ${chinh}`;
          } else {
            ten = `${ho} ${chinh}`;
          }
        } else {
          const chinh = CHINH_NU[Math.floor(rng() * CHINH_NU.length)];
          if (rng() < 0.75) {
            const dem = DEM_NU[Math.floor(rng() * DEM_NU.length)];
            ten = `${ho} ${dem} ${chinh}`;
          } else {
            ten = `${ho} ${chinh}`;
          }
        }

        // Linh căn & Ngũ hành độc lập
        const heChon = HE_DANH_SACH[Math.floor(rng() * HE_DANH_SACH.length)];
        const hePhu = rng() > 0.7 ? [HE_DANH_SACH[(HE_DANH_SACH.indexOf(heChon) + 2) % 5]] : [];
        const he = [heChon, ...hePhu];

        // Tư chất độc lập hoàn toàn với giới tính (nam & nữ có tỷ lệ như nhau)
        const rngTuChat = rng();
        let tuChat = TU_CHAT_LIST[0]; // Phổ thông: ~45%
        if (rngTuChat > 0.92) tuChat = TU_CHAT_LIST[3]; // Yêu Nghiệt: ~8%
        else if (rngTuChat > 0.75) tuChat = TU_CHAT_LIST[2]; // Thiên Tài: ~17%
        else if (rngTuChat > 0.45) tuChat = TU_CHAT_LIST[1]; // Khá Giỏi: ~30%

        // Tính cách độc lập
        const tinhCach = TINH_CACH_LIST[Math.floor(rng() * TINH_CACH_LIST.length)];

        // Cảnh giới ban đầu độc lập: Luyện Khí Sơ kỳ (tieu: 0) hoặc Trung kỳ (tieu: 1)
        const tieuCanhGioi = rng() > 0.6 ? 1 : 0;
        const canhGioi = 1; // 1: Luyện Khí
        const tuoi = 14 + Math.floor(rng() * 6); // 14 - 19 tuổi

        return {
          id: `dt_${Date.now()}_${Math.floor(rng() * 100000)}_${Math.floor((Number(seed) || 0) % 1000)}`,
          ten,
          gioiTinh,
          tuoi,
          he,
          tuChat: tuChat.id,
          tinhCach: tinhCach.id,
          khuynhHuong: 'chinh_dao', // chinh_dao, tieu_dao, ma_dao
          canhGioi,
          tieuCanhGioi,
          tuVi: 0,
          tuViYeuCau: tuViYeuCauChoCanhGioi(canhGioi, tieuCanhGioi),
          haoCam: 60, // 0 - 100
          doKy: 0,   // 0 - 100
          vaiVe: 'de_tu', // de_tu, dai_su_huynh
          congPhap: null,
          trangThai: {
            loai: 'nha_roi', // nha_roi, lich_luyen, trong_thuong
            nhiemVu: null,
            namConLai: 0,
          },
        };
      }

      function layTrangThaiMod(h) {
        const data = h.data() ?? {};
        data.version = Number(data.version) || 1;
        data.daoTrangTen = typeof data.daoTrangTen === 'string' && data.daoTrangTen.trim() ? data.daoTrangTen : 'Thanh Khê Đạo Tràng';
        data.danhSachDeTu = Array.isArray(data.danhSachDeTu) ? data.danhSachDeTu : [];
        data.ungVien = Array.isArray(data.ungVien) ? data.ungVien : [];
        data.nhatKy = Array.isArray(data.nhatKy) ? data.nhatKy : [];
        return data;
      }

      function ghiNhatKy(data, text, nam = 1) {
        data.nhatKy ??= [];
        data.nhatKy.unshift({ nam: Number(nam) || 1, text, time: Date.now() });
        if (data.nhatKy.length > 50) data.nhatKy.pop();
      }

      // ==========================================
      // ACTIONS CỦA MOD (Giao dịch trạng thái an toàn)
      // ==========================================

      // Action 1: Mở kỳ tuyển đồ
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

      // Action 1.5: Đổi tên đạo tràng
      mod.addAction('doi_ten_dao_trang', (ctx, args, h) => {
        const data = layTrangThaiMod(h);
        const tenMoi = String(args?.ten ?? '').trim();
        if (!tenMoi || tenMoi.length > 24) return 'khong_tick';
        data.daoTrangTen = tenMoi;
        ghiNhatKy(data, `Sư tôn đổi tên đạo tràng thành "${tenMoi}".`, ctx.run?.nam ?? 1);
        h.setData(data);
        return 'khong_tick';
      });

      // Action 2: Thu nhận 1 đệ tử
      mod.addAction('nhan_de_tu', (ctx, args, h) => {
        const data = layTrangThaiMod(h);
        const nv = ctx.run?.nhanVat ?? {};
        const maxDt = sucChuaDeTu(nv.canhGioi ?? 1);

        if (data.danhSachDeTu.length >= maxDt) {
          return 'khong_tick';
        }

        const idx = Number(args?.index) || 0;
        const ungVien = data.ungVien?.[idx];
        if (!ungVien) return 'khong_tick';

        if (data.danhSachDeTu.length === 0) {
          ungVien.vaiVe = 'dai_su_huynh';
        }

        data.danhSachDeTu.push(ungVien);
        data.ungVien.splice(idx, 1);
        const danhXung = ungVien.gioiTinh === 'nu' ? 'Đại Sư Tỷ' : 'Đại Sư Huynh';
        ghiNhatKy(data, `Thu nhận đồ đệ ${ungVien.ten} (${dinhDangHe(ungVien.he)}) nhập môn${ungVien.vaiVe === 'dai_su_huynh' ? `, tôn làm ${danhXung}` : ''}.`, ctx.run?.nam ?? 1);
        h.setData(data);
        return 'khong_tick';
      });

      // Action 3: Đàm tâm vấn đạo
      mod.addAction('luan_dao', (ctx, args, h) => {
        const data = layTrangThaiMod(h);
        const dt = data.danhSachDeTu.find((d) => d.id === args?.deTuId);
        if (!dt) return 'khong_tick';
        if (dt.trangThai?.loai === 'lich_luyen' && (Number(dt.trangThai?.namConLai) || 0) > 0) return 'khong_tick';

        const huong = args?.huong ?? 'chinh_dao';
        dt.khuynhHuong = huong;
        dt.haoCam = Math.min(100, (Number(dt.haoCam) || 0) + 15);
        const req = Math.max(1, Number(dt.tuViYeuCau) || 1);
        dt.tuVi = Math.min(req, (Number(dt.tuVi) || 0) + 5);

        const loiGiai = huong === 'chinh_dao'
          ? 'lấy trừ ma vệ đạo, thủ hộ sinh linh làm gốc'
          : huong === 'tieu_dao'
          ? 'thuận theo tự nhiên, tiêu dao tự tại giữa đất trời'
          : 'nghịch thiên cải mệnh, kẻ mạnh vi tôn';

        ghiNhatKy(data, `Sư tôn đàm đạo cùng ${dt.ten}, chỉ dạy đạo lý "${loiGiai}". Đạo tâm đệ tử đại chấn!`, ctx.run?.nam ?? 1);
        h.setData(data);
        return 'khong_tick';
      });

      // Action 4: Truyền thụ công pháp
      mod.addAction('truyen_cong', (ctx, args, h) => {
        const data = layTrangThaiMod(h);
        const dt = data.danhSachDeTu.find((d) => d.id === args?.deTuId);
        if (!dt) return 'khong_tick';
        if (dt.trangThai?.loai === 'lich_luyen' && (Number(dt.trangThai?.namConLai) || 0) > 0) return 'khong_tick';

        const req = Math.max(1, Number(dt.tuViYeuCau) || 1);
        const curTuVi = Number(dt.tuVi) || 0;
        if (curTuVi >= req) return 'khong_tick';

        const nv = ctx.run?.nhanVat ?? {};
        if ((Number(nv.tuVi) || 0) < 1) {
          return 'khong_tick';
        }

        nv.tuVi = Math.max(0, (Number(nv.tuVi) || 0) - 0.5);

        const tang = 15;
        dt.tuVi = Math.min(req, curTuVi + tang);
        dt.haoCam = Math.min(100, (Number(dt.haoCam) || 0) + 10);
        dt.doKy = Math.max(0, (Number(dt.doKy) || 0) - 10);

        data.danhSachDeTu.forEach((other) => {
          if (other.id !== dt.id) {
            other.doKy = Math.min(100, (Number(other.doKy) || 0) + 5);
          }
        });

        ghiNhatKy(data, `Sư tôn hao phí chân nguyên quán đảnh truyền công cho ${dt.ten}, tăng ${tang} tu vi!`, ctx.run?.nam ?? 1);
        h.setData(data);
        return 'khong_tick';
      });

      // Action 5: Ban thưởng linh thạch
      mod.addAction('ban_thuong', (ctx, args, h) => {
        const data = layTrangThaiMod(h);
        const dt = data.danhSachDeTu.find((d) => d.id === args?.deTuId);
        if (!dt) return 'khong_tick';
        if (dt.trangThai?.loai === 'lich_luyen' && (Number(dt.trangThai?.namConLai) || 0) > 0) return 'khong_tick';

        const nv = ctx.run?.nhanVat ?? {};
        const soTien = Number(args?.soTien) || 30;
        if ((Number(nv.linhThach) || 0) < soTien) {
          return 'khong_tick';
        }

        nv.linhThach = (Number(nv.linhThach) || 0) - soTien;
        dt.haoCam = Math.min(100, (Number(dt.haoCam) || 0) + 12);
        dt.doKy = Math.max(0, (Number(dt.doKy) || 0) - 20);

        data.danhSachDeTu.forEach((other) => {
          if (other.id !== dt.id) {
            other.doKy = Math.min(100, (Number(other.doKy) || 0) + 4);
          }
        });

        ghiNhatKy(data, `Sư tôn ban thưởng ${soTien} linh thạch cho ${dt.ten}.`, ctx.run?.nam ?? 1);
        h.setData(data);
        return 'khong_tick';
      });

      // Action 6: Luận bàn đấu pháp
      mod.addAction('dau_phap', (ctx, args, h) => {
        const data = layTrangThaiMod(h);
        const dt = data.danhSachDeTu.find((d) => d.id === args?.deTuId);
        if (!dt) return 'khong_tick';
        if (dt.trangThai?.loai === 'lich_luyen' && (Number(dt.trangThai?.namConLai) || 0) > 0) return 'khong_tick';

        const req = Math.max(1, Number(dt.tuViYeuCau) || 1);
        dt.tuVi = Math.min(req, (Number(dt.tuVi) || 0) + 8);
        dt.haoCam = Math.min(100, (Number(dt.haoCam) || 0) + 5);

        ghiNhatKy(data, `Sư tôn áp chế tu vi luận bàn đấu pháp cùng ${dt.ten}. Đệ tử ngộ ra nhiều chiêu thức thực chiến.`, ctx.run?.nam ?? 1);
        h.setData(data);
        return 'khong_tick';
      });

      // Action 7: Hộ trì phá cảnh / Độ kiếp
      mod.addAction('ho_phap', (ctx, args, h) => {
        const data = layTrangThaiMod(h);
        const dt = data.danhSachDeTu.find((d) => d.id === args?.deTuId);
        if (!dt) return 'khong_tick';
        if (dt.trangThai?.loai === 'lich_luyen' && (Number(dt.trangThai?.namConLai) || 0) > 0) return 'khong_tick';
        if ((Number(dt.canhGioi) || 1) >= 5 && (Number(dt.tieuCanhGioi) || 0) >= 3) return 'khong_tick';

        const req = Math.max(1, Number(dt.tuViYeuCau) || 1);
        if ((Number(dt.tuVi) || 0) < req) {
          return 'khong_tick';
        }

        const cach = args?.cach ?? 'tu_luc';
        const nv = ctx.run?.nhanVat ?? {};
        const nam = ctx.run?.nam ?? 1;
        const TEN_THUONG = ['Lành lặn', 'Thương nhẹ', 'Thương nặng', 'Trọng thương'];
        let thanhCong = false;

        const laDaiCanhGioi = (Number(dt.tieuCanhGioi) || 0) >= 3;

        if (!laDaiCanhGioi) {
          // === 1. ĐỘT PHÁ TIỂU CẢNH GIỚI (KHÔNG CÓ THIÊN KIẾP / LÔI KIẾP) ===
          if (cach === 'chi_dan' || cach === 'ganh_loi_kiep' || cach === 'ho_phap') {
            nv.tuVi = Math.max(0, (Number(nv.tuVi) || 0) - 0.2);
            thanhCong = true;
            dt.haoCam = Math.min(100, (Number(dt.haoCam) || 0) + 10);
            ghiNhatKy(data, `Sư tôn đích thân dẫn khí hộ mạch, ${dt.ten} thuận lợi phá vỡ bình cảnh, đột phá lên ${dinhDangCanhGioi(dt.canhGioi, (dt.tieuCanhGioi ?? 0) + 1)}!`, nam);
          } else if (cach === 'ban_dan') {
            if ((Number(nv.linhThach) || 0) < 30) return 'khong_tick';
            nv.linhThach = (Number(nv.linhThach) || 0) - 30;
            thanhCong = h.random() > 0.15; // 85%
            ghiNhatKy(data, `Sư tôn ban đan dược trợ lực cho ${dt.ten} xung kích tiểu cảnh giới: ${thanhCong ? 'Thành công phá cảnh!' : 'Bình cảnh kiên cố, chưa thể phá vỡ.'}`, nam);
          } else {
            thanhCong = h.random() > 0.4; // 60%
            ghiNhatKy(data, `${dt.ten} tự mình vận công xung kích bình cảnh: ${thanhCong ? 'Thuận lợi thăng cấp!' : 'Bình cảnh chưa phá, tu vi hao tổn.'}`, nam);
          }

          if (thanhCong) {
            dt.tieuCanhGioi = (Number(dt.tieuCanhGioi) || 0) + 1;
            dt.tuVi = 0;
            dt.tuViYeuCau = tuViYeuCauChoCanhGioi(dt.canhGioi, dt.tieuCanhGioi);
          } else {
            dt.tuVi = Math.floor((Number(dt.tuVi) || 0) * 0.7);
          }
        } else {
          // === 2. ĐỘT PHÁ ĐẠI CẢNH GIỚI ===
          const tuLuyenKhiLenTrucCo = dt.canhGioi === 1;

          if (tuLuyenKhiLenTrucCo) {
            // Luyện Khí -> Trúc Cơ: Đúc Đạo Cơ, KHÔNG CÓ LÔI KIẾP
            if (cach === 'ho_phap' || cach === 'chi_dan' || cach === 'ganh_loi_kiep') {
              nv.tuVi = Math.max(0, (Number(nv.tuVi) || 0) - 0.5);
              thanhCong = true;
              dt.haoCam = Math.min(100, (Number(dt.haoCam) || 0) + 20);
              ghiNhatKy(data, `🌟 Sư tôn thi triển huyền công hộ pháp đúc đạo cơ! ${dt.ten} ngưng tụ đạo cơ hoàn mỹ, chính thức bước vào Trúc Cơ Sơ kỳ!`, nam);
            } else if (cach === 'ban_dan') {
              const coDan = (Number(nv.tuiDo?.['item.truc_co_dan']) || 0) > 0;
              if (coDan) {
                nv.tuiDo['item.truc_co_dan'] -= 1;
              } else if ((Number(nv.linhThach) || 0) >= 80) {
                nv.linhThach = (Number(nv.linhThach) || 0) - 80;
              } else {
                return 'khong_tick';
              }
              thanhCong = h.random() > 0.1; // 90%
              ghiNhatKy(data, `Sư tôn ban Trúc Cơ Đan cho ${dt.ten} đúc đạo cơ: ${thanhCong ? 'Ngưng tụ đạo cơ thành công!' : 'Đạo cơ chưa vững, ngưng tụ thất bại.'}`, nam);
            } else {
              thanhCong = h.random() > 0.5; // 50%
              ghiNhatKy(data, `${dt.ten} tự thân đúc đạo cơ: ${thanhCong ? 'Thành công bước vào Trúc Cơ!' : 'Thất bại, tu vi hao tổn.'}`, nam);
            }
          } else {
            // Kết Đan trở lên: THẬT SỰ CÓ CỬU THIÊN LÔI KIẾP
            if (cach === 'ganh_loi_kiep') {
              thanhCong = true;
              // Chỉ tăng đúng +1 tầng thương thế (0..3 của game gốc)
              nv.thuongThe = Math.min(3, (Number(nv.thuongThe) || 0) + 1);
              dt.haoCam = 100;
              ghiNhatKy(data, `⚡ Cửu thiên lôi kiếp giáng xuống! Sư tôn dùng thân thể đón đỡ lôi đình hộ ${dt.ten}! ${dt.ten} cảm kích rơi lệ, vượt thiên kiếp thành công! Sư tôn chịu 1 tầng thương thế (${TEN_THUONG[nv.thuongThe]}).`, nam);
            } else if (cach === 'ban_dan') {
              const coDan = (Number(nv.tuiDo?.['item.su_do_ho_mach_dan']) || 0) > 0 || (Number(nv.tuiDo?.['item.ket_kim_dan']) || 0) > 0;
              if (coDan) {
                if ((Number(nv.tuiDo?.['item.su_do_ho_mach_dan']) || 0) > 0) nv.tuiDo['item.su_do_ho_mach_dan'] -= 1;
                else nv.tuiDo['item.ket_kim_dan'] -= 1;
              } else if ((Number(nv.linhThach) || 0) >= 100) {
                nv.linhThach = (Number(nv.linhThach) || 0) - 100;
              } else {
                return 'khong_tick';
              }
              thanhCong = h.random() > 0.2; // 80%
              ghiNhatKy(data, `Sư tôn ban đan dược hộ mệnh cho ${dt.ten} độ kiếp: ${thanhCong ? 'Độ kiếp thành công viên mãn!' : 'Bình cảnh chưa phá, may có đan dược che chở tính mạng.'}`, nam);
            } else {
              thanhCong = h.random() > 0.5; // 50%
              ghiNhatKy(data, `${dt.ten} tự mình vượt qua thiên kiếp: ${thanhCong ? 'Thuận lợi thăng cấp đại cảnh giới!' : 'Bị thiên lôi đánh lui, tu vi tổn hại nặng nề.'}`, nam);
            }
          }

          if (thanhCong) {
            dt.canhGioi = (Number(dt.canhGioi) || 1) + 1;
            dt.tieuCanhGioi = 0;
            dt.tuVi = 0;
            dt.tuViYeuCau = tuViYeuCauChoCanhGioi(dt.canhGioi, dt.tieuCanhGioi);
          } else {
            dt.tuVi = Math.floor((Number(dt.tuVi) || 0) * 0.6);
          }
        }

        h.setData(data);
        return 'khong_tick';
      });

      // Action 8: Bổ nhiệm Đại Sư Huynh / Đại Sư Tỷ
      mod.addAction('bo_nhiem', (ctx, args, h) => {
        const data = layTrangThaiMod(h);
        const dt = data.danhSachDeTu.find((d) => d.id === args?.deTuId);
        if (!dt) return 'khong_tick';

        data.danhSachDeTu.forEach((d) => (d.vaiVe = 'de_tu'));
        dt.vaiVe = 'dai_su_huynh';
        dt.haoCam = Math.min(100, (Number(dt.haoCam) || 0) + 20);

        const danhXung = dt.gioiTinh === 'nu' ? 'Đại Sư Tỷ' : 'Đại Sư Huynh';
        ghiNhatKy(data, `Sư tôn sắc phong ${dt.ten} làm ${danhXung}, thống lĩnh đệ tử đời thứ nhất.`, ctx.run?.nam ?? 1);
        h.setData(data);
        return 'khong_tick';
      });

      // Action 9: Phái đi lịch luyện
      mod.addAction('phai_lich_luyen', (ctx, args, h) => {
        const data = layTrangThaiMod(h);
        const dt = data.danhSachDeTu.find((d) => d.id === args?.deTuId);
        if (!dt) return 'khong_tick';
        if (dt.trangThai?.loai === 'lich_luyen' && (Number(dt.trangThai?.namConLai) || 0) > 0) return 'khong_tick';

        const nhiemVu = args?.nhiemVu ?? 'hai_duoc';
        const soNam = Math.max(1, Math.min(5, Number(args?.soNam) || 2));

        dt.trangThai = {
          loai: 'lich_luyen',
          nhiemVu,
          namConLai: soNam,
        };

        const tenNv = {
          hai_duoc: 'Hái Linh Dược',
          dao_khoang: 'Khai Khoáng Thạch',
          tru_ma: 'Trừ Ma Vệ Đạo',
          bi_canh: 'Thám Hiểm Bí Cảnh',
        }[nhiemVu] ?? 'Lịch luyện';

        ghiNhatKy(data, `Phái ${dt.ten} hạ sơn làm nhiệm vụ "${tenNv}" trong ${soNam} năm.`, ctx.run?.nam ?? 1);
        h.setData(data);
        return 'khong_tick';
      });

      // Action 10: Thu hoạch phần thưởng lịch luyện
      mod.addAction('thu_hoach_lich_luyen', (ctx, args, h) => {
        const data = layTrangThaiMod(h);
        const dt = data.danhSachDeTu.find((d) => d.id === args?.deTuId);
        if (!dt) return 'khong_tick';

        if (dt.trangThai?.loai !== 'lich_luyen' || (Number(dt.trangThai?.namConLai) || 0) > 0) {
          return 'khong_tick';
        }

        const nv = ctx.run?.nhanVat ?? {};
        const loai = dt.trangThai.nhiemVu;
        let thuong = '';

        if (loai === 'hai_duoc') {
          const lt = 40 + Math.floor(h.random() * 40);
          nv.linhThach = (Number(nv.linhThach) || 0) + lt;
          thuong = `thu thập được nhiều thảo dược quý, quy đổi thành ${lt} linh thạch`;
        } else if (loai === 'dao_khoang') {
          const lt = 50 + Math.floor(h.random() * 50);
          nv.linhThach = (Number(nv.linhThach) || 0) + lt;
          thuong = `đào được quặng huyền thiết, nhận ${lt} linh thạch`;
        } else if (loai === 'tru_ma') {
          nv.congHien = (Number(nv.congHien) || 0) + 30;
          nv.linhThach = (Number(nv.linhThach) || 0) + 60;
          thuong = 'trảm sát yêu thú ma đạo, mang về 30 cống hiến và 60 linh thạch';
        } else {
          nv.linhThach = (Number(nv.linhThach) || 0) + 100;
          nv.tuiDo ??= {};
          nv.tuiDo['item.su_do_ho_mach_dan'] = (Number(nv.tuiDo['item.su_do_ho_mach_dan']) || 0) + 1;
          thuong = 'khám phá cổ di tích, dâng lên sư tôn 100 linh thạch và 1 Hộ Mạch Tụ Khí Đan!';
        }

        const req = Math.max(1, Number(dt.tuViYeuCau) || 1);
        dt.tuVi = Math.min(req, (Number(dt.tuVi) || 0) + 15);
        dt.trangThai = { loai: 'nha_roi', nhiemVu: null, namConLai: 0 };
        ghiNhatKy(data, `Đệ tử ${dt.ten} lịch luyện trở về, ${thuong}.`, ctx.run?.nam ?? 1);
        h.setData(data);
        return 'khong_tick';
      });

      // Action 11: Trục xuất đệ tử
      mod.addAction('truc_xuat', (ctx, args, h) => {
        const data = layTrangThaiMod(h);
        const idx = data.danhSachDeTu.findIndex((d) => d.id === args?.deTuId);
        if (idx === -1) return 'khong_tick';

        const dt = data.danhSachDeTu[idx];
        const biTrucXuatLaDaiDeTu = dt.vaiVe === 'dai_su_huynh';
        data.danhSachDeTu.splice(idx, 1);

        if (biTrucXuatLaDaiDeTu && data.danhSachDeTu.length > 0) {
          data.danhSachDeTu[0].vaiVe = 'dai_su_huynh';
          const keNhiemXung = data.danhSachDeTu[0].gioiTinh === 'nu' ? 'Đại Sư Tỷ' : 'Đại Sư Huynh';
          ghiNhatKy(data, `${data.danhSachDeTu[0].ten} được tôn lên kế nhiệm làm ${keNhiemXung}.`, ctx.run?.nam ?? 1);
        }

        ghiNhatKy(data, `Sư tôn trục xuất đồ đệ ${dt.ten} khỏi môn phái, đoạn tuyệt duyên phận sư đồ.`, ctx.run?.nam ?? 1);
        h.setData(data);
        return 'khong_tick';
      });

      // ==========================================
      // VÒNG LẶP THẾ GIỚI (Tick hook)
      // ==========================================
      mod.addTickHook((ctx, years, h) => {
        const data = layTrangThaiMod(h);
        const nam = ctx.run?.nam ?? 1;

        data.danhSachDeTu.forEach((dt) => {
          dt.tuoi = (Number(dt.tuoi) || 14) + years;

          const heSoTuChat = { pho_thong: 1.5, kha: 2.5, thien_tai: 4.0, yeu_nghiet: 6.5 }[dt.tuChat] ?? 2.0;
          const tuViTang = Math.round(years * heSoTuChat);
          const req = Math.max(1, Number(dt.tuViYeuCau) || tuViYeuCauChoCanhGioi(dt.canhGioi ?? 1, dt.tieuCanhGioi ?? 0));
          dt.tuViYeuCau = req;
          dt.tuVi = Math.min(req, (Number(dt.tuVi) || 0) + tuViTang);

          if (dt.trangThai?.loai === 'lich_luyen') {
            dt.trangThai.namConLai = Math.max(0, (Number(dt.trangThai.namConLai) || 0) - years);
            if (dt.trangThai.namConLai === 0) {
              ghiNhatKy(data, `Đệ tử ${dt.ten} đã hoàn thành lịch luyện, đang chờ sư tôn thu nhận kết quả.`, nam);
            }
          }

          if (dt.trangThai?.loai !== 'lich_luyen' && dt.tinhCach === 'hieu_thuan' && (Number(dt.haoCam) || 0) >= 80 && h.random() > 0.6) {
            const nv = ctx.run?.nhanVat;
            if (nv && (Number(nv.thuongThe) || 0) > 0) {
              nv.thuongThe = Math.max(0, (Number(nv.thuongThe) || 0) - 1);
              ghiNhatKy(data, `Đệ tử hiếu thảo ${dt.ten} nấu chén Tuyết Liên Trà dâng sư tôn, giúp sư tôn chữa khỏi 1 tầng thương thế.`, nam);
            }
          }

          if ((Number(dt.doKy) || 0) >= 80 && h.random() > 0.7) {
            ghiNhatKy(data, `⚠️ Đệ tử ${dt.ten} oán hận sư phụ thiên vị, đạo tâm chao đảo, có dấu hiệu muốn phản bội môn phái!`, nam);
          }
        });

        h.setData(data);
      });

      // Modifier: Cân bằng tỷ lệ kỳ ngộ
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
    // PHA 2: READY (Khởi tạo giao diện, Diffing DOM, Slot & Panel)
    // ========================================================
    ready(tt, mod) {
      window.__suDoModUi = mod.ui;
      mod.log('Mod Sư Đồ Truyền Thừa đã sẵn sàng (Pha ready)');
      const kit = tt.ui.kit;

      // Tiêm CSS toàn cục an toàn
      injectMasterStyles();

      // ==========================================
      // LẮNG NGHE KẾT THÚC KIẾP (Chống rò rỉ bộ nhớ)
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
      // CÁC HÀM TẠO THẺ & DIFFING DOM THÔNG MINH
      // ==========================================

      /**
       * Thẻ đệ tử thu nhỏ (cho Slot Đồ Đệ tại màn hình nhân vật)
       */
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

        const progBox = document.createElement('div');
        progBox.style.cssText = 'display: flex; align-items: center; gap: 6px; font-size: 10px;';

        const bar = document.createElement('div');
        bar.className = 'su-do-progress-bar';
        const val = document.createElement('div');
        val.className = 'su-do-progress-val';
        bar.append(val);
        progBox.append(bar);

        const textSpan = document.createElement('span');
        textSpan.style.cssText = 'font-size: 10px; white-space: nowrap; font-weight: 600;';
        progBox.append(textSpan);
        card.append(progBox);

        const render = (d) => {
          const danhXung = d.gioiTinh === 'nu' ? 'Đại Sư Tỷ' : 'Đại Sư Huynh';
          tenSpan.innerHTML = `<b>${d.ten}</b> ${d.vaiVe === 'dai_su_huynh' ? `<span class="su-do-badge" style="color:var(--vang-kim); background:rgba(218,165,32,0.12); border:1px solid var(--vang-kim); font-size:9.5px; padding:0 4px;">${danhXung}</span>` : ''}`;
          cgSpan.textContent = dinhDangCanhGioi(d.canhGioi, d.tieuCanhGioi);

          const req = Math.max(1, Number(d?.tuViYeuCau) || 1);
          const cur = Math.max(0, Number(d?.tuVi) || 0);
          const pct = Math.min(100, Math.max(0, Math.floor((cur / req) * 100)));
          const sanSang = cur >= req;

          val.style.width = `${pct}%`;
          val.classList.toggle('su-do-progress-max', sanSang);
          textSpan.textContent = `${cur}/${req} (${pct}%)`;
          textSpan.style.color = sanSang ? 'var(--chu-do)' : 'inherit';
        };

        render(dt);
        card._update = render;
        return card;
      }

      /**
       * Cập nhật danh sách thẻ đệ tử thu nhỏ (Keyed Diffing)
       */
      function capNhatDanhSachDeTuNho(danhSach, container) {
        if (danhSach.length === 0) {
          if (!container._hasEmpty) {
            container.innerHTML = '';
            container.append(
              kit.empty({
                text: 'Chưa có đồ đệ nào bái nhập sư môn',
                hint: 'Hãy mở Đạo Tràng để chiêu mộ những kỳ tài đầu tiên!',
              })
            );
            container._hasEmpty = true;
            container._cardMap?.clear();
          }
          return;
        }

        if (container._hasEmpty) {
          container.innerHTML = '';
          container._hasEmpty = false;
        }

        container._cardMap ??= new Map();
        const currentIds = new Set(danhSach.map((d) => d.id));

        for (const [id, cardEl] of container._cardMap.entries()) {
          if (!currentIds.has(id)) {
            cardEl.remove();
            container._cardMap.delete(id);
          }
        }

        danhSach.forEach((dt, idx) => {
          let cardEl = container._cardMap.get(dt.id);
          if (!cardEl) {
            cardEl = taoTheDeTuNho(dt, tt, kit);
            container._cardMap.set(dt.id, cardEl);
            container.append(cardEl);
          } else {
            cardEl._update?.(dt);
          }
          const childAtIndex = container.children[idx];
          if (childAtIndex !== cardEl) {
            container.insertBefore(cardEl, childAtIndex || null);
          }
        });
      }

      /**
       * Header Đạo Tràng (Panel) với khả năng update DOM trực tiếp không chớp
       */
      function taoDaoTrangHeader(data, nv, maxDt, kitInstance, ttInstance) {
        const header = document.createElement('div');
        header.className = 'su-do-header';

        header.innerHTML = `
          <div class="su-do-header-title">
            <span class="su-do-title-text" style="display:inline-flex; align-items:center; gap:4px; cursor:pointer;" title="Bấm để đổi tên Đạo Tràng">
              🏛️ <b class="su-do-name-target">${data.daoTrangTen}</b> <span style="font-size:10px; opacity:0.6;">✏️</span>
            </span>
            <span class="su-do-badge su-do-realm-badge" style="color:var(--vang-kim); background:rgba(218,165,32,0.12); border:1px solid var(--vang-kim);">
              ${TEN_CANH_GIOI_HUD[nv?.canhGioi ?? 1] ?? 'Hóa Thần'} Sư Tôn
            </span>
          </div>
          <div class="su-do-header-sub">Khai sơn lập phái · Quảng truyền đạo pháp</div>
          <div class="su-do-header-stats">
            <span>🥋 Đồ đệ: <b class="su-do-stat-count">${data.danhSachDeTu.length}/${maxDt}</b></span>
            <span>📜 Tông môn: <b>Thịnh</b></span>
            <span>✨ Chờ bái: <b class="su-do-stat-uv">${data.ungVien.length}</b></span>
          </div>
        `;

        const titleBtn = header.querySelector('.su-do-title-text');
        if (titleBtn) {
          titleBtn.onclick = () => {
            const m = kitInstance.modal({
              title: 'Đổi Tên Đạo Tràng',
              mount(modalBox) {
                modalBox.style.cssText = 'display: flex; flex-direction: column; gap: 8px; font-size: 13px;';
                const tip = document.createElement('div');
                tip.innerHTML = 'Nhập tên mới cho tông môn / đạo tràng của sư tôn (tối đa 24 ký tự):';
                modalBox.append(tip);

                const input = document.createElement('input');
                input.type = 'text';
                input.value = header.querySelector('.su-do-name-target')?.textContent?.trim() || 'Thanh Khê Đạo Tràng';
                input.maxLength = 24;
                input.style.cssText = 'padding: 6px 10px; font-size: 13px; border: 1px solid var(--vien-hud); background: var(--nen-hud); color: var(--muc); border-radius: 4px; outline: none;';
                modalBox.append(input);

                const btnSave = kitInstance.button({
                  text: 'Xác Nhận Đổi Tên',
                  kind: 'chinh',
                  onClick: () => {
                    const tenMoi = input.value.trim();
                    if (!tenMoi) {
                      ttInstance.ui.toast('Tên đạo tràng không được để trống!');
                      return;
                    }
                    try {
                      ttInstance.game.modAction('su_do', 'doi_ten_dao_trang', { ten: tenMoi });
                      m.close();
                      ttInstance.ui.toast(`Đã đổi tên đạo tràng thành: "${tenMoi}"`);
                    } catch (err) {
                      ttInstance.ui.toast(err.message);
                    }
                  },
                });
                btnSave.classList.add('su-do-btn-wrap');
                modalBox.append(btnSave);
              },
            });
          };
        }

        const nameTarget = header.querySelector('.su-do-name-target');
        const realmBadge = header.querySelector('.su-do-realm-badge');
        const statCount = header.querySelector('.su-do-stat-count');
        const statUv = header.querySelector('.su-do-stat-uv');

        header._update = (freshData, freshNv, freshMaxDt) => {
          if (nameTarget && nameTarget.textContent !== freshData.daoTrangTen) {
            nameTarget.textContent = freshData.daoTrangTen;
          }
          const realmText = `${TEN_CANH_GIOI_HUD[freshNv?.canhGioi ?? 1] ?? 'Hóa Thần'} Sư Tôn`;
          if (realmBadge && realmBadge.textContent !== realmText) {
            realmBadge.textContent = realmText;
          }
          const countText = `${freshData.danhSachDeTu.length}/${freshMaxDt}`;
          if (statCount && statCount.textContent !== countText) {
            statCount.textContent = countText;
          }
          const uvText = String(freshData.ungVien.length);
          if (statUv && statUv.textContent !== uvText) {
            statUv.textContent = uvText;
          }
        };

        return header;
      }

      /**
       * Thẻ đệ tử chi tiết với khả năng cập nhật tu vi / chỉ số tại chỗ (in-place)
       */
      function taoTheDeTuChiTiet(dt, ttInstance, kitInstance) {
        let currentDt = dt;
        const card = document.createElement('div');
        card.className = 'su-do-card';
        card.dataset.id = dt.id;

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
            <span class="su-do-badge" style="color:${tc.color}; background:${tc.bg}; border:1px solid ${tc.border}; font-size:9.5px; padding:0 4px; white-space:nowrap; margin-left: auto;">${tc.ten}</span>
          </div>
          <div class="su-do-card-subrow" style="display: flex; align-items: center; justify-content: space-between; gap: 4px; font-size: 11px; white-space: nowrap; margin-top: 2px;">
            <div style="display: flex; align-items: center; gap: 4px; min-width: 0; overflow: hidden; text-overflow: ellipsis;">
              <span>${dinhDangCanhGioi(dt.canhGioi, dt.tieuCanhGioi)}</span>
              <span style="opacity:0.4;">·</span>
              <span>${heStr}</span>
              ${dt.trangThai?.loai === 'lich_luyen' && (Number(dt.trangThai?.namConLai) || 0) > 0 ? `<span class="su-do-badge" style="color:#10b981; background:rgba(16,185,129,0.12); border:1px solid #10b981; font-size:9.5px; padding:0 4px;">Lịch luyện (${Math.ceil(dt.trangThai.namConLai)}n)</span>` : ''}
            </div>
            <span class="hud-phu su-do-card-age" style="font-size: 11px; white-space: nowrap; flex-shrink: 0;">${dt.gioiTinh === 'nam' ? 'Nam' : 'Nữ'} · ${Math.floor(Number(dt.tuoi) || 14)}t</span>
          </div>
          <div class="su-do-card-stats" style="font-size: 11px; color: var(--muc-nhat); margin-top: 2px; white-space: nowrap;">Tính cách: <i>${tcStr}</i> · Hiếu cảm: <b>${dt.haoCam ?? 0}</b> · Đố kỵ: <b style="color:${(dt.doKy ?? 0) > 50 ? 'var(--cam-do)' : 'inherit'}">${dt.doKy ?? 0}</b></div>
        `;
        top.append(info);
        card.append(top);

        // Tu vi progress row
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

        // HÀNG NÚT TƯƠNG TÁC CHÍNH (3 Nút hàng trên)
        const gridMain = document.createElement('div');
        gridMain.className = 'su-do-action-grid';

        // 1. Đàm tâm
        const btnDamTam = kitInstance.button({
          text: '🗣️ Đàm Tâm',
          kind: 'nho',
          onClick: () => {
            if (currentDt.trangThai?.loai === 'lich_luyen' && (Number(currentDt.trangThai?.namConLai) || 0) > 0) {
              ttInstance.ui.toast(`Đệ tử ${currentDt.ten} đang xuất sơn lịch luyện (${currentDt.trangThai.namConLai} năm nữa mới về)!`);
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
            if (currentDt.trangThai?.loai === 'lich_luyen' && (Number(currentDt.trangThai?.namConLai) || 0) > 0) {
              ttInstance.ui.toast(`Đệ tử ${currentDt.ten} đang xuất sơn lịch luyện!`);
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
            if (currentDt.trangThai?.loai === 'lich_luyen' && (Number(currentDt.trangThai?.namConLai) || 0) > 0) {
              ttInstance.ui.toast(`Đệ tử ${currentDt.ten} đang xuất sơn lịch luyện!`);
              return;
            }
            ttInstance.game.modAction('su_do', 'dau_phap', { deTuId: currentDt.id });
            ttInstance.ui.toast(`Đã luận bàn đấu pháp cùng ${currentDt.ten}!`);
          },
        });
        btnDauPhap.classList.add('su-do-btn-wrap');
        gridMain.append(btnDauPhap);
        card.append(gridMain);

        // HÀNG PHỤ: Ban Thưởng, Độ Kiếp, Đại Sư Huynh, Trục Xuất
        const subRow = document.createElement('div');
        subRow.className = 'su-do-action-subgrid';

        // Nút Ban thưởng
        const btnBanThuong = kitInstance.button({
          text: '🎁 Ban Thưởng (30 LT)',
          kind: 'nho',
          onClick: () => {
            if (currentDt.trangThai?.loai === 'lich_luyen' && (Number(currentDt.trangThai?.namConLai) || 0) > 0) {
              ttInstance.ui.toast(`Đệ tử ${currentDt.ten} đang xuất sơn lịch luyện!`);
              return;
            }
            const s = ttInstance.state();
            if ((Number(s.run?.nhanVat?.linhThach) || 0) < 30) {
              ttInstance.ui.toast('Sư tôn không đủ 30 linh thạch để ban thưởng!');
              return;
            }
            try {
              ttInstance.game.modAction('su_do', 'ban_thuong', { deTuId: currentDt.id, soTien: 30 });
              ttInstance.ui.toast(`Đã ban thưởng 30 linh thạch cho ${currentDt.ten}!`);
            } catch (e) {
              ttInstance.ui.toast(e.message);
            }
          },
        });
        btnBanThuong.classList.add('su-do-btn-wrap');
        subRow.append(btnBanThuong);

        // Nút Hộ trì đột phá / Độ kiếp nếu đủ tu vi
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
              if (currentDt.trangThai?.loai === 'lich_luyen' && (Number(currentDt.trangThai?.namConLai) || 0) > 0) {
                ttInstance.ui.toast(`Đệ tử ${currentDt.ten} đang xuất sơn lịch luyện, chưa có mặt tại đạo tràng!`);
                return;
              }
              if (!laDaiCanhGioi) {
                // === 1. ĐỘT PHÁ TIỂU CẢNH GIỚI ===
                const m = kitInstance.modal({
                  title: `Hộ Trì Đột Phá Cho ${currentDt.ten}`,
                  mount(box) {
                    box.style.cssText = 'display: flex; flex-direction: column; gap: 8px; font-size: 13px;';
                    const msg = document.createElement('div');
                    msg.innerHTML = `Đệ tử <b>${currentDt.ten}</b> (${dinhDangCanhGioi(currentDt.canhGioi, currentDt.tieuCanhGioi)}) đã tích lũy đầy đủ tu vi, chuẩn bị xung mạch phá quan lên <b>${dinhDangCanhGioi(currentDt.canhGioi, (currentDt.tieuCanhGioi ?? 0) + 1)}</b>! Sư tôn lựa chọn cách hộ trì nào?`;
                    box.append(msg);

                    box.append(
                      kitInstance.button({
                        text: '✨ Chỉ dẫn khí mạch (100% thành công, tốn 0.2 tu vi, không bị thương)',
                        kind: 'chinh',
                        onClick: () => {
                          const nv = ttInstance.state().run?.nhanVat;
                          if (nv && (Number(nv.tuVi) || 0) < 0.2) {
                            ttInstance.ui.toast('Sư tôn không đủ 0.2 tu vi chân nguyên để chỉ dẫn!');
                            return;
                          }
                          ttInstance.game.modAction('su_do', 'ho_phap', { deTuId: currentDt.id, cach: 'chi_dan' });
                          m.close();
                          ttInstance.ui.toast(`Đã chỉ dẫn khí mạch hộ ${currentDt.ten} đột phá thành công!`);
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
                            ttInstance.ui.toast('Sư tôn không đủ 30 linh thạch để mua đan dược!');
                            return;
                          }
                          ttInstance.game.modAction('su_do', 'ho_phap', { deTuId: currentDt.id, cach: 'ban_dan' });
                          m.close();
                          ttInstance.ui.toast(`Đã ban đan dược cho ${currentDt.ten} xung kích tiểu cảnh giới!`);
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
                // === 2. ĐỘT PHÁ TRÚC CƠ ===
                const m = kitInstance.modal({
                  title: `Hộ Đạo Trúc Cơ Cho ${currentDt.ten}`,
                  mount(box) {
                    box.style.cssText = 'display: flex; flex-direction: column; gap: 8px; font-size: 13px;';
                    const msg = document.createElement('div');
                    msg.innerHTML = `Đồ đệ <b>${currentDt.ten}</b> đã đạt Luyện Khí Đại viên mãn, chuẩn bị ngưng tụ đạo cơ để bước chân vào Trúc Cơ Sơ kỳ! Sư tôn lựa chọn cách hộ đạo?`;
                    box.append(msg);

                    box.append(
                      kitInstance.button({
                        text: '🌟 Sư tôn hộ pháp đúc đạo cơ (100% thành công, hao 0.5 tu vi, không bị thương)',
                        kind: 'chinh',
                        onClick: () => {
                          const nv = ttInstance.state().run?.nhanVat;
                          if (nv && (Number(nv.tuVi) || 0) < 0.5) {
                            ttInstance.ui.toast('Sư tôn không đủ 0.5 tu vi để hộ pháp đúc đạo cơ!');
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
                // === 3. ĐỘ KIẾP ĐẠI CẢNH GIỚI ===
                const m = kitInstance.modal({
                  title: `Hộ Pháp Độ Kiếp Cho ${currentDt.ten}`,
                  mount(box) {
                    box.style.cssText = 'display: flex; flex-direction: column; gap: 8px; font-size: 13px;';
                    const msg = document.createElement('div');
                    msg.innerHTML = `Đệ tử <b>${currentDt.ten}</b> xung kích đại cảnh giới, thiên địa dị tượng cuồn cuộn, cửu thiên lôi kiếp sắp giáng xuống! Sư tôn lựa chọn phương án hộ kiếp nào?`;
                    box.append(msg);

                    box.append(
                      kitInstance.button({
                        text: '⚡ Gánh lôi kiếp (100% thành công, Sư tôn chịu 1 tầng thương thế nhẹ)',
                        kind: 'chinh',
                        onClick: () => {
                          ttInstance.game.modAction('su_do', 'ho_phap', { deTuId: currentDt.id, cach: 'ganh_loi_kiep' });
                          m.close();
                          ttInstance.ui.toast(`Đã gánh lôi kiếp hộ ${currentDt.ten} vượt thiên kiếp thành công!`);
                        },
                      })
                    );

                    box.append(
                      kitInstance.button({
                        text: '💊 Ban Đan Dược Hộ Mệnh (80% thành công, 100 linh thạch)',
                        kind: 'phu',
                        onClick: () => {
                          const nv = ttInstance.state().run?.nhanVat;
                          const coDan = (Number(nv?.tuiDo?.['item.su_do_ho_mach_dan']) || 0) > 0 || (Number(nv?.tuiDo?.['item.ket_kim_dan']) || 0) > 0;
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

        // Cụm chức năng quản trị bên phải
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
            statsEl.innerHTML = `Tính cách: <i>${curTcStr}</i> · Hiếu cảm: <b>${newDt.haoCam ?? 0}</b> · Đố kỵ: <b style="color:${(newDt.doKy ?? 0) > 50 ? 'var(--cam-do)' : 'inherit'}">${newDt.doKy ?? 0}</b>`;
          }
        };

        return card;
      }

      /**
       * Cập nhật danh sách thẻ đệ tử chi tiết (Keyed Diffing & In-place State Patching)
       */
      function capNhatDanhSachDeTu(danhSach, container) {
        if (danhSach.length === 0) {
          if (!container._hasEmpty) {
            container.innerHTML = '';
            container.append(
              kit.empty({
                text: 'Đạo tràng chưa có đệ tử nào',
                hint: 'Hãy bấm nút "Chiêu Mộ Đồ Đệ" ở trên để tìm kiếm thiên tài!',
              })
            );
            container._hasEmpty = true;
            container._cardMap?.clear();
          }
          return;
        }

        if (container._hasEmpty) {
          container.innerHTML = '';
          container._hasEmpty = false;
        }

        container._cardMap ??= new Map();
        const currentIds = new Set(danhSach.map((d) => d.id));

        for (const [id, cardEl] of container._cardMap.entries()) {
          if (!currentIds.has(id)) {
            cardEl.remove();
            container._cardMap.delete(id);
          }
        }

        danhSach.forEach((dt, idx) => {
          let cardEl = container._cardMap.get(dt.id);
          if (!cardEl) {
            cardEl = taoTheDeTuChiTiet(dt, tt, kit);
            container._cardMap.set(dt.id, cardEl);
            container.append(cardEl);
          } else {
            const needRebuild = cardEl._checkStructuralChange?.(dt);
            if (needRebuild) {
              const newCardEl = taoTheDeTuChiTiet(dt, tt, kit);
              cardEl.replaceWith(newCardEl);
              container._cardMap.set(dt.id, newCardEl);
              cardEl = newCardEl;
            } else {
              cardEl._update?.(dt);
            }
          }
          const childAtIndex = container.children[idx];
          if (childAtIndex !== cardEl) {
            container.insertBefore(cardEl, childAtIndex || null);
          }
        });
      }

      /**
       * Cập nhật hộp ứng viên cầu đạo (Diffing theo danh sách ID ứng viên)
       */
      function capNhatUngVien(ungVien, uvBox) {
        const uvSig = ungVien.map((u) => `${u.id}_${u.ten}_${u.tuChat}`).join(';');
        if (uvBox._sig === uvSig) return;
        uvBox._sig = uvSig;

        if (ungVien.length === 0) {
          uvBox.style.display = 'none';
          uvBox.innerHTML = '';
          return;
        }

        uvBox.style.display = 'flex';
        uvBox.innerHTML = '';

        const uvHeader = document.createElement('div');
        uvHeader.style.cssText = 'font-size: 13px; font-weight: bold; color: var(--vang-kim); display: flex; justify-content: space-between;';
        uvHeader.innerHTML = `<span>⚡ Ứng viên cầu đạo đang chờ bái sư (${ungVien.length}):</span>`;
        uvBox.append(uvHeader);

        ungVien.forEach((uv, idx) => {
          const itemCard = document.createElement('div');
          itemCard.style.cssText = 'background: var(--nen-hud); border: 1px solid var(--vien-hud); border-radius: 6px; padding: 6px 8px; display: flex; justify-content: space-between; align-items: center; gap: 8px; min-width: 0;';

          const uvAvatar = document.createElement('div');
          uvAvatar.className = 'su-do-avatar';
          uvAvatar.style.cssText = 'width: 34px; height: 34px; flex-shrink: 0;';
          const uvFaceUrl = tt.assets?.npcFace?.(uv.id, uv.gioiTinh, Math.floor(Number(uv.tuoi) || 14)) || (uv.gioiTinh === 'nam' ? '/img/nguoi/nam.tre.1.webp' : '/img/nguoi/nu.tre.1.webp');
          uvAvatar.innerHTML = `<img src="${uvFaceUrl}" alt="${uv.ten}" onerror="this.src='/img/nguoi/${uv.gioiTinh}.tre.1.webp'" />`;
          itemCard.append(uvAvatar);

          const colLeft = document.createElement('div');
          colLeft.style.cssText = 'display: flex; flex-direction: column; gap: 2px; font-size: 11.5px; min-width: 0; flex: 1; overflow: hidden;';

          const tc = TU_CHAT_MAP[uv.tuChat] ?? { ten: uv.tuChat, color: 'inherit', bg: 'transparent', border: 'transparent' };
          const heStr = dinhDangHe(uv.he);

          colLeft.innerHTML = `
            <div style="font-size: 12.5px; line-height: 1.2; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
              <b>${uv.ten}</b>
            </div>
            <div style="display: flex; gap: 4px; align-items: center; white-space: nowrap; font-size: 10px; line-height: 1.2;">
              <span class="su-do-badge" style="color:${tc.color}; background:${tc.bg}; border:1px solid ${tc.border}; font-size:9.5px; padding:0 4px; flex-shrink: 0;">${tc.ten}</span>
              <span class="hud-phu">${uv.gioiTinh === 'nam' ? 'Nam' : 'Nữ'} · ${Math.floor(Number(uv.tuoi) || 14)}t</span>
            </div>
            <div style="font-size: 10px; color: var(--muc-nhat); white-space: nowrap; line-height: 1.2; overflow: hidden; text-overflow: ellipsis;">
              Linh căn: <b style="color:var(--muc);">${heStr}</b>
            </div>
          `;
          itemCard.append(colLeft);

          const btnNhan = kit.button({
            text: 'Thu Nhận',
            kind: 'chinh',
            onClick: () => {
              try {
                tt.game.modAction('su_do', 'nhan_de_tu', { index: idx });
                tt.ui.toast(`Đã thu nhận ${uv.ten} nhập môn!`);
              } catch (e) {
                tt.ui.toast(e.message);
              }
            },
          });
          btnNhan.classList.add('su-do-btn-mini');
          itemCard.append(btnNhan);

          uvBox.append(itemCard);
        });
      }

      /**
       * Cập nhật nhật ký môn phái (Chỉ cập nhật khi có bản ghi mới, giữ nguyên thanh cuộn)
       */
      function capNhatNhatKy(nhatKy, logBox) {
        const logSig = nhatKy.length > 0 ? `${nhatKy.length}_${nhatKy[0]?.time}_${nhatKy[0]?.nam}` : '0';
        if (logBox._sig === logSig) return;
        logBox._sig = logSig;

        logBox.innerHTML = '';
        if (nhatKy.length === 0) {
          logBox.append(kit.empty({ text: 'Chưa có sự kiện sư môn nào được ghi lại' }));
        } else {
          const logList = document.createElement('div');
          logList.style.cssText = 'max-height: 340px; overflow-y: auto; display: flex; flex-direction: column; gap: 6px;';
          nhatKy.forEach((nk) => {
            const item = document.createElement('div');
            item.style.cssText = 'font-size: 12px; padding: 6px 8px; border-left: 2px solid var(--chu-do); background: rgba(0,0,0,0.02); border-radius: 0 4px 4px 0;';
            item.innerHTML = `<span style="color:var(--chu-do); font-weight:600; white-space:nowrap;">[${dinhDangThoiGianNam(nk.nam)}]</span> ${nk.text}`;
            logList.append(item);
          });
          logBox.append(logList);
        }
      }

      /**
       * Cập nhật tab lịch luyện (Chỉ vẽ lại khi có biến động năm còn lại hoặc phân bổ nhân sự)
       */
      function capNhatLichLuyen(danhSach, box) {
        const dangLichLuyen = danhSach.filter((d) => d.trangThai?.loai === 'lich_luyen');
        const ranhRoi = danhSach.filter((d) => d.trangThai?.loai === 'nha_roi');

        const sig = dangLichLuyen.map((d) => `${d.id}_${d.trangThai?.namConLai}`).join(';') + '||' + ranhRoi.map((d) => `${d.id}_${d.canhGioi}_${d.tieuCanhGioi}`).join(';');
        if (box._sig === sig) return;
        box._sig = sig;

        box.innerHTML = '';

        box.append(kit.section({ title: `Đang lịch luyện (${dangLichLuyen.length})` }));
        if (dangLichLuyen.length === 0) {
          box.append(kit.empty({ text: 'Hiện không có đệ tử nào đang đi lịch luyện' }));
        } else {
          dangLichLuyen.forEach((dt) => {
            const row = document.createElement('div');
            row.className = 'su-do-card';
            row.style.cssText = 'display: flex; justify-content: space-between; align-items: center; padding: 6px 10px; min-width: 0;';

            const info = document.createElement('div');
            info.style.cssText = 'font-size: 11.5px; display: flex; flex-direction: column; gap: 2px; white-space: nowrap;';
            const conLai = Number(dt.trangThai?.namConLai) || 0;
            info.innerHTML = `
              <div><b>${dt.ten}</b> · <i style="color:var(--chu-do);">${dt.trangThai?.nhiemVu}</i></div>
              <div class="hud-phu" style="font-size: 11px;">${conLai > 0 ? `⏳ Còn <b>${Math.ceil(conLai)} năm</b> nữa trở về` : '✅ Đã hoàn thành, chờ thu nhận!'}</div>
            `;
            row.append(info);

            if (conLai === 0) {
              const btnThu = kit.button({
                text: '🎁 Thu Hoạch',
                kind: 'chinh',
                onClick: () => {
                  tt.game.modAction('su_do', 'thu_hoach_lich_luyen', { deTuId: dt.id });
                  tt.ui.toast(`Đã thu hoạch quà lịch luyện của ${dt.ten}!`);
                },
              });
              btnThu.classList.add('su-do-btn-wrap');
              btnThu.style.cssText += 'padding: 3px 8px; font-size: 11.5px;';
              row.append(btnThu);
            }
            box.append(row);
          });
        }

        box.append(kit.section({ title: `Đệ tử rảnh rỗi (${ranhRoi.length})` }));
        if (ranhRoi.length > 0) {
          ranhRoi.forEach((dt) => {
            const row = document.createElement('div');
            row.className = 'su-do-card';
            row.style.cssText = 'display: flex; justify-content: space-between; align-items: center; padding: 6px 10px; min-width: 0;';
            row.innerHTML = `
              <div style="font-size:12.5px; white-space: nowrap;">
                <b>${dt.ten}</b> 
                <span class="hud-phu" style="font-size:11px;">(${dinhDangCanhGioi(dt.canhGioi, dt.tieuCanhGioi)})</span>
              </div>
            `;

            const btnPhai = kit.button({
              text: 'Phái Đi',
              kind: 'phu',
              onClick: async () => {
                const m = kit.modal({
                  title: `Phái ${dt.ten} Đi Lịch Luyện`,
                  mount(modalBox) {
                    modalBox.style.cssText = 'display: flex; flex-direction: column; gap: 8px;';

                    const msg = document.createElement('div');
                    msg.innerHTML = 'Chọn phương hướng lịch luyện cho đồ đệ:';
                    modalBox.append(msg);

                    const selNv = kit.select({
                      options: [
                        { value: 'hai_duoc', label: '🌿 Hái Linh Dược (An toàn, thu linh thạch)' },
                        { value: 'dao_khoang', label: '⛏️ Khai Khoáng Thạch (Ổn định, khoáng thạch)' },
                        { value: 'tru_ma', label: '⚔️ Trừ Ma Vệ Đạo (Cống hiến & linh thạch)' },
                        { value: 'bi_canh', label: '🏰 Thám Hiểm Bí Cảnh (Mạo hiểm, Đan dược quý)' },
                      ],
                      value: 'hai_duoc',
                    });
                    modalBox.append(selNv);

                    const timeInfo = document.createElement('div');
                    timeInfo.innerHTML = 'Thời gian lịch luyện: <b>2 năm</b>';
                    modalBox.append(timeInfo);

                    const btnXacNhan = kit.button({
                      text: 'Xuất Sơn',
                      kind: 'chinh',
                      onClick: () => {
                        tt.game.modAction('su_do', 'phai_lich_luyen', {
                          deTuId: dt.id,
                          nhiemVu: selNv.value ?? 'hai_duoc',
                          soNam: 2,
                        });
                        m.close();
                        tt.ui.toast(`Đã phái ${dt.ten} xuất sơn lịch luyện!`);
                      },
                    });
                    modalBox.append(btnXacNhan);
                  },
                });
              },
            });
            btnPhai.classList.add('su-do-btn-wrap');
            row.append(btnPhai);
            box.append(row);
          });
        }
      }

      /**
       * Cập nhật tab truyền thừa tiền duyên
       */
      function capNhatTienDuyen(box) {
        let tienDuyen = [];
        try {
          tienDuyen = JSON.parse(localStorage.getItem('mod:su_do:tien_duyen') ?? '[]');
        } catch (e) {}

        const sig = JSON.stringify(tienDuyen);
        if (box._sig === sig) return;
        box._sig = sig;

        box.innerHTML = '';
        const intro = document.createElement('div');
        intro.style.cssText = 'line-height: 1.5; color: var(--muc);';
        intro.innerHTML = 'Tông môn truyền thừa qua muôn vàn kiếp số. Đồ đệ xuất sắc khi sư tôn tọa hóa sẽ tiếp tục tu hành, kiếp sau có cơ hội tương phùng tái ngộ!';
        box.append(intro);

        if (tienDuyen.length === 0) {
          box.append(kit.empty({ text: 'Chưa có truyền thừa đệ tử từ kiếp trước' }));
        } else {
          box.append(kit.section({ title: 'Đệ tử kiếp trước còn lưu danh' }));
          tienDuyen.forEach((td) => {
            const tc = TU_CHAT_MAP[td.tuChat]?.ten ?? td.tuChat;
            box.append(
              kit.row({
                label: td.ten,
                value: `${dinhDangCanhGioi(td.canhGioi ?? 1, td.tieuCanhGioi ?? 0)} · Tư chất: ${tc}`,
              })
            );
          });
        }
      }

      // ==========================================
      // 5. CẮM TAB VÀO MÀN HÌNH NHÂN VẬT (CHARACTER TAB)
      // ==========================================
      mod.ui.addSlot('characterTab', {
        id: 'de_tu_tab',
        title: 'Đồ Đệ',
        mount(el) {
          injectMasterStyles();
          el.innerHTML = '';

          const s0 = tt.state();
          const data0 = layModData(s0);
          const nv0 = s0.run?.nhanVat;
          const maxDt0 = sucChuaDeTu(nv0?.canhGioi ?? 0);

          const wrap = document.createElement('div');
          wrap.className = 'su-do-panel';
          wrap.style.cssText = 'padding: 8px 4px;';

          const topBar = document.createElement('div');
          topBar.className = 'su-do-header';

          const topBarTitle = document.createElement('div');
          topBarTitle.className = 'su-do-header-title';
          topBarTitle.innerHTML = `
            <span>🏛️ <span class="su-do-tab-dt-name">${data0.daoTrangTen}</span></span>
            <span class="hud-phu su-do-tab-dt-count" style="font-size:12px; font-weight:normal;">(${data0.danhSachDeTu.length}/${maxDt0})</span>
          `;
          topBar.append(topBarTitle);

          const topBarSub = document.createElement('div');
          topBarSub.className = 'su-do-header-sub';
          topBarSub.textContent = 'Sư Tôn khai sơn lập phái, thụ nghiệp truyền đạo.';
          topBar.append(topBarSub);

          const btnMoDaoTrang = kit.button({
            text: 'Mở Bảng Đạo Tràng',
            kind: 'chinh',
            onClick: () => mod.ui.openPanel('dao_trang_panel'),
          });
          btnMoDaoTrang.classList.add('su-do-btn-wrap');
          btnMoDaoTrang.style.cssText += 'margin-top: 6px;';
          topBar.append(btnMoDaoTrang);
          wrap.append(topBar);

          const listContainer = document.createElement('div');
          listContainer.style.cssText = 'display: flex; flex-direction: column; gap: 4px;';
          wrap.append(listContainer);

          el.append(wrap);

          const dtNameEl = topBar.querySelector('.su-do-tab-dt-name');
          const dtCountEl = topBar.querySelector('.su-do-tab-dt-count');

          const updateTab = () => {
            const s = tt.state();
            const data = layModData(s);
            const nv = s.run?.nhanVat;
            const maxDt = sucChuaDeTu(nv?.canhGioi ?? 0);

            if (dtNameEl && dtNameEl.textContent !== data.daoTrangTen) {
              dtNameEl.textContent = data.daoTrangTen;
            }
            const countStr = `(${data.danhSachDeTu.length}/${maxDt})`;
            if (dtCountEl && dtCountEl.textContent !== countStr) {
              dtCountEl.textContent = countStr;
            }

            capNhatDanhSachDeTuNho(data.danhSachDeTu, listContainer);
          };

          updateTab();
          return tt.subscribe(updateTab);
        },
      });

      // ==========================================
      // 6. BẢNG ĐIỀU KHIỂN CHÍNH: ĐẠO TRÀNG SƯ ĐỒ (PANEL)
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
          container.style.cssText = 'min-height: 420px;';

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

              // TAB 2: NHẬT KÝ SƯ MÔN
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

              // TAB 3: LỊCH LUYỆN
              {
                id: 'tab_lich_luyen',
                title: 'Lịch Luyện',
                mount(box) {
                  box.style.cssText = 'display: flex; flex-direction: column; gap: 8px; margin-top: 6px;';

                  tabUpdaters.tab_lich_luyen = (data) => {
                    capNhatLichLuyen(data.danhSachDeTu, box);
                  };

                  const curS = tt.state();
                  const curData = layModData(curS);
                  tabUpdaters.tab_lich_luyen(curData);

                  return () => {
                    delete tabUpdaters.tab_lich_luyen;
                  };
                },
              },

              // TAB 4: TIỀN DUYÊN
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

            // Cập nhật Header trực tiếp không tái tạo DOM
            header._update?.(data, nv, maxDt);

            // Cập nhật nhãn Tab 1 nếu số lượng đồ đệ thay đổi
            const tab1Btn = tabsEl.querySelector('.ui-tabs > button:nth-child(1)');
            if (tab1Btn) {
              const expectedTitle = `Đồ Đệ (${data.danhSachDeTu.length})`;
              if (tab1Btn.textContent !== expectedTitle) {
                tab1Btn.textContent = expectedTitle;
              }
            }

            // Kích hoạt hàm cập nhật của các tab đang được hiển thị
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
