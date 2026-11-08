/**
 * Mod Sư Đồ Truyền Thừa (su_do) - Vạn Kiếp Tu Tiên
 * Tác giả: Antigravity & Tu Tiên Giả
 * Phiên bản: 1.0.9
 * Tương thích: apiVersion 1 (Giao diện Tiên Hiệp Cổ Phong Tinh Mỹ, Ẩn Scrollbar 100%)
 */

(() => {
  const CANH_GIOI_TEN = ['Phàm Nhân', 'Luyện Khí', 'Trúc Cơ', 'Kết Đan', 'Nguyên Anh', 'Hóa Thần'];
  const TIEU_CANH_GIOI_TEN = ['Sơ kỳ', 'Trung kỳ', 'Hậu kỳ', 'Đại viên mãn'];

  function dinhDangCanhGioi(cg, tieu = 0) {
    if (typeof window !== 'undefined' && window.tuTien?.core?.index?.tenCanhGioi) {
      return window.tuTien.core.index.tenCanhGioi(cg, tieu);
    }
    if (cg <= 0) return 'Phàm Nhân';
    const cName = CANH_GIOI_TEN[cg] ?? 'Hóa Thần';
    const tName = TIEU_CANH_GIOI_TEN[tieu] ?? 'Sơ kỳ';
    return `${cName} ${tName}`;
  }

  function tuViYeuCauChoCanhGioi(cg, tieu = 0) {
    const base = Math.max(1, cg);
    return (base * 4 + tieu + 1) * 12;
  }

  function sucChuaDeTu(canhGioiNguoiChoi) {
    const cg = canhGioiNguoiChoi ?? 0;
    if (cg <= 1) return 2;  // Phàm Nhân / Luyện Khí: 2
    if (cg === 2) return 4; // Trúc Cơ: 4
    if (cg === 3) return 6; // Kết Đan: 6
    if (cg === 4) return 9; // Nguyên Anh: 9
    return 12;             // Hóa Thần trở lên: 12
  }

  (window.tuTienMods ??= []).push({
  id: 'su_do',

  boot(tt, mod) {
    mod.log('Khởi động Mod Sư Đồ Truyền Thừa (Pha boot)...');

    // ==========================================
    // 1. CÁC HÀM TIỆN ÍCH SINH ĐỆ TỬ NGẪU NHIÊN
    // ==========================================
    const HO = ['Lâm', 'Diệp', 'Tiêu', 'Sở', 'Lý', 'Trần', 'Vương', 'Bạch', 'Hàn', 'Thạch', 'Khương', 'Tạ', 'Cố', 'Vũ'];
    const TEN_NAM = ['Phong', 'Phàm', 'Thần', 'Vũ', 'Hạo', 'Vân', 'Kiếm', 'Viêm', 'Lăng', 'Dực', 'Huyền', 'Minh', 'Kỳ'];
    const TEN_NU = ['Tuyết', 'Nguyệt', 'Nhiên', 'Dao', 'Thanh', 'Sương', 'Linh', 'Uyển', 'Hinh', 'Mộng', 'Thiền', 'Vy'];
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

    function taoDeTuNgauNhien(seed, canhGioiNguoiChoi = 1) {
      const rngVal = Math.abs(Math.sin(seed));
      const gioiTinh = rngVal > 0.5 ? 'nam' : 'nu';
      const ho = HO[Math.floor(rngVal * 1000) % HO.length];
      const ten = gioiTinh === 'nam'
        ? TEN_NAM[Math.floor(rngVal * 777) % TEN_NAM.length]
        : TEN_NU[Math.floor(rngVal * 777) % TEN_NU.length];

      // Linh căn & Ngũ hành
      const heChon = HE_DANH_SACH[Math.floor(rngVal * 333) % HE_DANH_SACH.length];
      const hePhu = rngVal > 0.7 ? [HE_DANH_SACH[(HE_DANH_SACH.indexOf(heChon) + 2) % 5]] : [];
      const he = [heChon, ...hePhu];

      // Tư chất
      let tuChat = TU_CHAT_LIST[0];
      if (rngVal > 0.92) tuChat = TU_CHAT_LIST[3];
      else if (rngVal > 0.75) tuChat = TU_CHAT_LIST[2];
      else if (rngVal > 0.45) tuChat = TU_CHAT_LIST[1];

      // Tính cách
      const tinhCach = TINH_CACH_LIST[Math.floor(rngVal * 555) % TINH_CACH_LIST.length];

      // Cảnh giới ban đầu: Luyện Khí Sơ kỳ (tieu: 0) hoặc Trung kỳ (tieu: 1)
      const tieuCanhGioi = rngVal > 0.6 ? 1 : 0;
      const canhGioi = 1; // 1: Luyện Khí

      return {
        id: `dt_${Date.now()}_${Math.floor(rngVal * 10000)}`,
        ten: `${ho} ${ten}`,
        gioiTinh,
        tuoi: 14 + (Math.floor(rngVal * 88) % 6), // 14 - 19 tuổi
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
      data.version ??= 1;
      data.daoTrangTen ??= 'Thanh Khê Đạo Tràng';
      data.danhSachDeTu ??= [];
      data.ungVien ??= [];
      data.nhatKy ??= [];
      return data;
    }

    function ghiNhatKy(data, text, nam = 1) {
      data.nhatKy ??= [];
      data.nhatKy.unshift({ nam, text, time: Date.now() });
      if (data.nhatKy.length > 50) data.nhatKy.pop();
    }

    // ==========================================
    // 2. ĐĂNG KÝ CÁC ACTIONS (GIAO DỊCH AN TOÀN)
    // ==========================================

    // Action 1: Mở kỳ tuyển đồ
    mod.addAction('tuyen_do', (ctx, args, h) => {
      const data = layTrangThaiMod(h);
      const nv = ctx.run.nhanVat;
      const nam = ctx.run.nam ?? 1;

      // Sinh 3 ứng viên mới
      const uvs = [
        taoDeTuNgauNhien(h.random() * 1000 + 1, nv.canhGioi),
        taoDeTuNgauNhien(h.random() * 2000 + 2, nv.canhGioi),
        taoDeTuNgauNhien(h.random() * 3000 + 3, nv.canhGioi),
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
      const tenCu = data.daoTrangTen ?? 'Thanh Khê Đạo Tràng';
      data.daoTrangTen = tenMoi;
      ghiNhatKy(data, `Sư tôn đổi tên đạo tràng thành "${tenMoi}".`, ctx.run.nam ?? 1);
      h.setData(data);
      return 'khong_tick';
    });

    // Action 2: Thu nhận 1 đệ tử
    mod.addAction('nhan_de_tu', (ctx, args, h) => {
      const data = layTrangThaiMod(h);
      const nv = ctx.run.nhanVat;
      const maxDt = sucChuaDeTu(nv.canhGioi);

      if (data.danhSachDeTu.length >= maxDt) {
        return 'khong_tick';
      }

      const idx = args?.index ?? 0;
      const ungVien = data.ungVien?.[idx];
      if (!ungVien) return 'khong_tick';

      if (data.danhSachDeTu.length === 0) {
        ungVien.vaiVe = 'dai_su_huynh';
      }

      data.danhSachDeTu.push(ungVien);
      data.ungVien.splice(idx, 1);
      const danhXung = ungVien.gioiTinh === 'nu' ? 'Đại Sư Tỷ' : 'Đại Sư Huynh';
      ghiNhatKy(data, `Thu nhận đồ đệ ${ungVien.ten} (${ungVien.he.join('/')}) nhập môn${ungVien.vaiVe === 'dai_su_huynh' ? `, tôn làm ${danhXung}` : ''}.`, ctx.run.nam ?? 1);
      h.setData(data);
      return 'khong_tick';
    });

    // Action 3: Đàm tâm vấn đạo
    mod.addAction('luan_dao', (ctx, args, h) => {
      const data = layTrangThaiMod(h);
      const dt = data.danhSachDeTu.find((d) => d.id === args?.deTuId);
      if (!dt) return 'khong_tick';
      if (dt.trangThai?.loai === 'lich_luyen' && (dt.trangThai?.namConLai ?? 0) > 0) return 'khong_tick';

      const huong = args?.huong ?? 'chinh_dao';
      dt.khuynhHuong = huong;
      dt.haoCam = Math.min(100, dt.haoCam + 15);
      dt.tuVi = Math.min(dt.tuViYeuCau, dt.tuVi + 5);

      const loiGiai = huong === 'chinh_dao'
        ? 'lấy trừ ma vệ đạo, thủ hộ sinh linh làm gốc'
        : huong === 'tieu_dao'
        ? 'thuận theo tự nhiên, tiêu dao tự tại giữa đất trời'
        : 'nghịch thiên cải mệnh, kẻ mạnh vi tôn';

      ghiNhatKy(data, `Sư tôn đàm đạo cùng ${dt.ten}, chỉ dạy đạo lý "${loiGiai}". Đạo tâm đệ tử đại chấn!`, ctx.run.nam ?? 1);
      h.setData(data);
      return 'khong_tick';
    });

    // Action 4: Truyền thụ công pháp
    mod.addAction('truyen_cong', (ctx, args, h) => {
      const data = layTrangThaiMod(h);
      const dt = data.danhSachDeTu.find((d) => d.id === args?.deTuId);
      if (!dt) return 'khong_tick';
      if (dt.trangThai?.loai === 'lich_luyen' && (dt.trangThai?.namConLai ?? 0) > 0) return 'khong_tick';
      if (dt.tuVi >= dt.tuViYeuCau) return 'khong_tick';

      const nv = ctx.run.nhanVat;
      if (nv.tuVi < 1) {
        return 'khong_tick';
      }

      nv.tuVi = Math.max(0, nv.tuVi - 0.5);

      const tang = 15;
      dt.tuVi = Math.min(dt.tuViYeuCau, dt.tuVi + tang);
      dt.haoCam = Math.min(100, dt.haoCam + 10);
      dt.doKy = Math.max(0, dt.doKy - 10);

      data.danhSachDeTu.forEach((other) => {
        if (other.id !== dt.id) {
          other.doKy = Math.min(100, (other.doKy ?? 0) + 5);
        }
      });

      ghiNhatKy(data, `Sư tôn hao phí chân nguyên quán đảnh truyền công cho ${dt.ten}, tăng ${tang} tu vi!`, ctx.run.nam ?? 1);
      h.setData(data);
      return 'khong_tick';
    });

    // Action 5: Ban thưởng linh thạch
    mod.addAction('ban_thuong', (ctx, args, h) => {
      const data = layTrangThaiMod(h);
      const dt = data.danhSachDeTu.find((d) => d.id === args?.deTuId);
      if (!dt) return 'khong_tick';
      if (dt.trangThai?.loai === 'lich_luyen' && (dt.trangThai?.namConLai ?? 0) > 0) return 'khong_tick';

      const nv = ctx.run.nhanVat;
      const soTien = args?.soTien ?? 30;
      if (nv.linhThach < soTien) {
        return 'khong_tick';
      }

      nv.linhThach -= soTien;
      dt.haoCam = Math.min(100, dt.haoCam + 12);
      dt.doKy = Math.max(0, dt.doKy - 20);

      data.danhSachDeTu.forEach((other) => {
        if (other.id !== dt.id) {
          other.doKy = Math.min(100, (other.doKy ?? 0) + 4);
        }
      });

      ghiNhatKy(data, `Sư tôn ban thưởng ${soTien} linh thạch cho ${dt.ten}.`, ctx.run.nam ?? 1);
      h.setData(data);
      return 'khong_tick';
    });

    // Action 6: Luận bàn đấu pháp
    mod.addAction('dau_phap', (ctx, args, h) => {
      const data = layTrangThaiMod(h);
      const dt = data.danhSachDeTu.find((d) => d.id === args?.deTuId);
      if (!dt) return 'khong_tick';
      if (dt.trangThai?.loai === 'lich_luyen' && (dt.trangThai?.namConLai ?? 0) > 0) return 'khong_tick';

      dt.tuVi = Math.min(dt.tuViYeuCau, dt.tuVi + 8);
      dt.haoCam = Math.min(100, dt.haoCam + 5);

      ghiNhatKy(data, `Sư tôn áp chế tu vi luận bàn đấu pháp cùng ${dt.ten}. Đệ tử ngộ ra nhiều chiêu thức thực chiến.`, ctx.run.nam ?? 1);
      h.setData(data);
      return 'khong_tick';
    });

    // Action 7: Hộ trì phá cảnh / Độ kiếp
    mod.addAction('ho_phap', (ctx, args, h) => {
      const data = layTrangThaiMod(h);
      const dt = data.danhSachDeTu.find((d) => d.id === args?.deTuId);
      if (!dt) return 'khong_tick';
      if (dt.trangThai?.loai === 'lich_luyen' && (dt.trangThai?.namConLai ?? 0) > 0) return 'khong_tick';
      if (dt.canhGioi >= 5 && dt.tieuCanhGioi >= 3) return 'khong_tick';

      if (dt.tuVi < dt.tuViYeuCau) {
        return 'khong_tick';
      }

      const cach = args?.cach ?? 'tu_luc';
      const nv = ctx.run.nhanVat;
      const nam = ctx.run.nam ?? 1;
      const TEN_THUONG = ['Lành lặn', 'Thương nhẹ', 'Thương nặng', 'Trọng thương'];
      let thanhCong = false;

      // KIỂM TRA: ĐỘT PHÁ TIỂU CẢNH GIỚI hay ĐẠI CẢNH GIỚI
      const laDaiCanhGioi = dt.tieuCanhGioi >= 3;

      if (!laDaiCanhGioi) {
        // === 1. ĐỘT PHÁ TIỂU CẢNH GIỚI (KHÔNG CÓ THIÊN KIẾP / LÔI KIẾP) ===
        if (cach === 'chi_dan' || cach === 'ganh_loi_kiep' || cach === 'ho_phap') {
          // Sư tôn chỉ dẫn khí tức: tốn 0.2 tu vi, 100% thành công, KHÔNG BỊ THƯƠNG
          nv.tuVi = Math.max(0, nv.tuVi - 0.2);
          thanhCong = true;
          dt.haoCam = Math.min(100, dt.haoCam + 10);
          ghiNhatKy(data, `Sư tôn đích thân dẫn khí hộ mạch, ${dt.ten} thuận lợi phá vỡ bình cảnh, đột phá lên ${dinhDangCanhGioi(dt.canhGioi, dt.tieuCanhGioi + 1)}!`, nam);
        } else if (cach === 'ban_dan') {
          // Ban đan dược trợ lực: 30 linh thạch
          if (nv.linhThach < 30) return 'khong_tick';
          nv.linhThach -= 30;
          thanhCong = h.random() > 0.15; // 85%
          ghiNhatKy(data, `Sư tôn ban đan dược trợ lực cho ${dt.ten} xung kích tiểu cảnh giới: ${thanhCong ? 'Thành công phá cảnh!' : 'Bình cảnh kiên cố, chưa thể phá vỡ.'}`, nam);
        } else {
          // Tự lực xung kích: 60%
          thanhCong = h.random() > 0.4;
          ghiNhatKy(data, `${dt.ten} tự mình vận công xung kích bình cảnh: ${thanhCong ? 'Thuận lợi thăng cấp!' : 'Bình cảnh chưa phá, tu vi hao tổn.'}`, nam);
        }

        if (thanhCong) {
          dt.tieuCanhGioi += 1;
          dt.tuVi = 0;
          dt.tuViYeuCau = tuViYeuCauChoCanhGioi(dt.canhGioi, dt.tieuCanhGioi);
        } else {
          dt.tuVi = Math.floor(dt.tuVi * 0.7);
        }
      } else {
        // === 2. ĐỘT PHÁ ĐẠI CẢNH GIỚI (Luyện Khí -> Trúc Cơ; Trúc Cơ -> Kết Đan...) ===
        const tuLuyenKhiLenTrucCo = dt.canhGioi === 1;

        if (tuLuyenKhiLenTrucCo) {
          // 2A. Luyện Khí Đại viên mãn -> Trúc Cơ: Đúc Đạo Cơ, KHÔNG CÓ LÔI KIẾP
          if (cach === 'ho_phap' || cach === 'chi_dan' || cach === 'ganh_loi_kiep') {
            nv.tuVi = Math.max(0, nv.tuVi - 0.5);
            thanhCong = true;
            dt.haoCam = Math.min(100, dt.haoCam + 20);
            ghiNhatKy(data, `🌟 Sư tôn thi triển huyền công hộ pháp đúc đạo cơ! ${dt.ten} ngưng tụ đạo cơ hoàn mỹ, chính thức bước vào Trúc Cơ Sơ kỳ!`, nam);
          } else if (cach === 'ban_dan') {
            const coDan = (nv.tuiDo?.['item.truc_co_dan'] ?? 0) > 0;
            if (coDan) {
              nv.tuiDo['item.truc_co_dan'] -= 1;
            } else if (nv.linhThach >= 80) {
              nv.linhThach -= 80;
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
          // 2B. Từ Trúc Cơ trở lên (Kết Đan, Nguyên Anh, Hóa Thần): THẬT SỰ CÓ THIÊN KIẾP / LÔI KIẾP!
          if (cach === 'ganh_loi_kiep') {
            thanhCong = true;
            // CHỈ TĂNG ĐÚNG 1 TẦNG THƯƠNG THẾ (thang điểm 0..3 của game gốc)
            nv.thuongThe = Math.min(3, (nv.thuongThe ?? 0) + 1);
            dt.haoCam = 100;
            ghiNhatKy(data, `⚡ Cửu thiên lôi kiếp giáng xuống! Sư tôn dùng thân thể đón đỡ lôi đình hộ ${dt.ten}! ${dt.ten} cảm kích rơi lệ, vượt thiên kiếp thành công! Sư tôn chịu 1 tầng thương thế (${TEN_THUONG[nv.thuongThe]}).`, nam);
          } else if (cach === 'ban_dan') {
            const coDan = (nv.tuiDo?.['item.su_do_ho_mach_dan'] ?? 0) > 0 || (nv.tuiDo?.['item.ket_kim_dan'] ?? 0) > 0;
            if (coDan) {
              if (nv.tuiDo?.['item.su_do_ho_mach_dan']) nv.tuiDo['item.su_do_ho_mach_dan'] -= 1;
              else nv.tuiDo['item.ket_kim_dan'] -= 1;
            } else if (nv.linhThach >= 100) {
              nv.linhThach -= 100;
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
          dt.canhGioi += 1;
          dt.tieuCanhGioi = 0;
          dt.tuVi = 0;
          dt.tuViYeuCau = tuViYeuCauChoCanhGioi(dt.canhGioi, dt.tieuCanhGioi);
        } else {
          dt.tuVi = Math.floor(dt.tuVi * 0.6);
        }
      }

      h.setData(data);
      return 'khong_tick';
    });

    // Action 8: Bổ nhiệm Đại Sư Huynh
    mod.addAction('bo_nhiem', (ctx, args, h) => {
      const data = layTrangThaiMod(h);
      const dt = data.danhSachDeTu.find((d) => d.id === args?.deTuId);
      if (!dt) return 'khong_tick';

      data.danhSachDeTu.forEach((d) => (d.vaiVe = 'de_tu'));
      dt.vaiVe = 'dai_su_huynh';
      dt.haoCam = Math.min(100, dt.haoCam + 20);

      const danhXung = dt.gioiTinh === 'nu' ? 'Đại Sư Tỷ' : 'Đại Sư Huynh';
      ghiNhatKy(data, `Sư tôn sắc phong ${dt.ten} làm ${danhXung}, thống lĩnh đệ tử đời thứ nhất.`, ctx.run.nam ?? 1);
      h.setData(data);
      return 'khong_tick';
    });

    // Action 9: Phái đi lịch luyện
    mod.addAction('phai_lich_luyen', (ctx, args, h) => {
      const data = layTrangThaiMod(h);
      const dt = data.danhSachDeTu.find((d) => d.id === args?.deTuId);
      if (!dt) return 'khong_tick';
      if (dt.trangThai?.loai === 'lich_luyen' && (dt.trangThai?.namConLai ?? 0) > 0) return 'khong_tick';

      const nhiemVu = args?.nhiemVu ?? 'hai_duoc';
      const soNam = Math.max(1, Math.min(5, args?.soNam ?? 2));

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

      ghiNhatKy(data, `Phái ${dt.ten} hạ sơn làm nhiệm vụ "${tenNv}" trong ${soNam} năm.`, ctx.run.nam ?? 1);
      h.setData(data);
      return 'khong_tick';
    });

    // Action 10: Thu hoạch phần thưởng lịch luyện
    mod.addAction('thu_hoach_lich_luyen', (ctx, args, h) => {
      const data = layTrangThaiMod(h);
      const dt = data.danhSachDeTu.find((d) => d.id === args?.deTuId);
      if (!dt) return 'khong_tick';

      if (dt.trangThai?.loai !== 'lich_luyen' || (dt.trangThai?.namConLai ?? 0) > 0) {
        return 'khong_tick';
      }

      const nv = ctx.run.nhanVat;
      const loai = dt.trangThai.nhiemVu;
      let thuong = '';

      if (loai === 'hai_duoc') {
        const lt = 40 + Math.floor(h.random() * 40);
        nv.linhThach += lt;
        thuong = `thu thập được nhiều thảo dược quý, quy đổi thành ${lt} linh thạch`;
      } else if (loai === 'dao_khoang') {
        const lt = 50 + Math.floor(h.random() * 50);
        nv.linhThach += lt;
        thuong = `đào được quặng huyền thiết, nhận ${lt} linh thạch`;
      } else if (loai === 'tru_ma') {
        nv.congHien = (nv.congHien ?? 0) + 30;
        nv.linhThach += 60;
        thuong = 'trảm sát yêu thú ma đạo, mang về 30 cống hiến và 60 linh thạch';
      } else {
        nv.linhThach += 100;
        nv.tuiDo ??= {};
        nv.tuiDo['item.su_do_ho_mach_dan'] = (nv.tuiDo['item.su_do_ho_mach_dan'] ?? 0) + 1;
        thuong = 'khám phá cổ di tích, dâng lên sư tôn 100 linh thạch và 1 Hộ Mạch Tụ Khí Đan!';
      }

      dt.tuVi += 15;
      dt.trangThai = { loai: 'nha_roi', nhiemVu: null, namConLai: 0 };
      ghiNhatKy(data, `Đệ tử ${dt.ten} lịch luyện trở về, ${thuong}.`, ctx.run.nam ?? 1);
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
        ghiNhatKy(data, `${data.danhSachDeTu[0].ten} được tôn lên kế nhiệm làm ${keNhiemXung}.`, ctx.run.nam ?? 1);
      }

      ghiNhatKy(data, `Sư tôn trục xuất đồ đệ ${dt.ten} khỏi môn phái, đoạn tuyệt duyên phận sư đồ.`, ctx.run.nam ?? 1);
      h.setData(data);
      return 'khong_tick';
    });

    // ==========================================
    // 3. VÒNG LẶP THẾ GIỚI (TICK HOOK)
    // ==========================================
    mod.addTickHook((ctx, years, h) => {
      const data = layTrangThaiMod(h);
      const nam = ctx.run.nam ?? 1;

      data.danhSachDeTu.forEach((dt) => {
        dt.tuoi += years;

        const heSoTuChat = { pho_thong: 1.5, kha: 2.5, thien_tai: 4.0, yeu_nghiet: 6.5 }[dt.tuChat] ?? 2.0;
        const tuViTang = Math.round(years * heSoTuChat);
        dt.tuVi = Math.min(dt.tuViYeuCau, dt.tuVi + tuViTang);

        if (dt.trangThai?.loai === 'lich_luyen') {
          dt.trangThai.namConLai = Math.max(0, (dt.trangThai.namConLai ?? 0) - years);
          if (dt.trangThai.namConLai === 0) {
            ghiNhatKy(data, `Đệ tử ${dt.ten} đã hoàn thành lịch luyện, đang chờ sư tôn thu nhận kết quả.`, nam);
          }
        }

        if (dt.trangThai?.loai !== 'lich_luyen' && dt.tinhCach === 'hieu_thuan' && dt.haoCam >= 80 && h.random() > 0.6) {
          const nv = ctx.run.nhanVat;
          if ((nv.thuongThe ?? 0) > 0) {
            nv.thuongThe = Math.max(0, nv.thuongThe - 1);
            ghiNhatKy(data, `Đệ tử hiếu thảo ${dt.ten} nấu chén Tuyết Liên Trà dâng sư tôn, giúp sư tôn chữa khỏi 1 tầng thương thế.`, nam);
          }
        }

        if (dt.doKy >= 80 && h.random() > 0.7) {
          ghiNhatKy(data, `⚠️ Đệ tử ${dt.ten} oán hận sư phụ thiên vị, đạo tâm chao đảo, có dấu hiệu muốn phản bội môn phái!`, nam);
        }
      });

      h.setData(data);
    });

    // Modifier: Điều chỉnh tần suất kỳ ngộ đệ tử theo cấu hình mod.yaml
    mod.modify('encounterWeight', ({ id, value }) => {
      if (id?.startsWith('ev.su_do_')) {
        const opt = mod.options?.ti_le_ky_ngo ?? 'thuong';
        const heSo = opt === 'it' ? 0.4 : opt === 'nhieu' ? 3.0 : 1.2;
        return (value ?? 1) * heSo;
      }
      return value ?? 1;
    });
  },

  ready(tt, mod) {
    window.__suDoModUi = mod.ui;
    mod.log('Mod Sư Đồ Truyền Thừa đã sẵn sàng (Pha ready)');
    const kit = tt.ui.kit;

    // ==========================================
    // 4. TIỆN ÍCH HIỂN THỊ & CSS TOÀN CỤC CỰC MẠNH
    // ==========================================
    const TEN_CANH_GIOI = ['Luyện Khí', 'Trúc Cơ', 'Kim Đan', 'Nguyên Anh', 'Hóa Thần', 'Luyện Hư', 'Hợp Thể', 'Đại Thừa', 'Độ Kiếp'];

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

    // Triệt tiêu 100% scrollbar toàn bộ trang và trong modal để UI không bao giờ bị nhảy/giật
    const styleId = 'mod-su-do-master-css';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
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
          width: 38px;
          height: 38px;
          border-radius: 50%;
          border: 1.5px solid var(--vien-muc);
          box-shadow: 0 0 5px rgba(0,0,0,0.08);
          overflow: hidden;
          background: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
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
      document.head.append(style);
    }

    // Lắng nghe kết thúc kiếp để lưu truyền thừa
    tt.on('lifeEnd', () => {
      try {
        const s = tt.state();
        const deTuList = s.run?.modData?.su_do?.danhSachDeTu ?? [];
        if (deTuList.length > 0) {
          const key = 'mod:su_do:tien_duyen';
          const luu = deTuList.map((d) => ({ ten: d.ten, canhGioi: d.canhGioi, tuChat: d.tuChat }));
          localStorage.setItem(key, JSON.stringify(luu));
          mod.log('Đã lưu truyền thừa đệ tử cho kiếp sau:', luu);
        }
      } catch (err) {
        console.error('[Mod Sư Đồ] Lỗi khi lưu di trạch:', err);
      }
    });

    // ==========================================
    // 5. CẮM TAB VÀO MÀN HÌNH NHÂN VẬT
    // ==========================================
    mod.ui.addSlot('characterTab', {
      id: 'de_tu_tab',
      title: 'Đồ Đệ',
      mount(el) {
        const veGiaoDienTab = () => {
          el.innerHTML = '';
          const s = tt.state();
          const data = s.run?.modData?.su_do ?? {};
          const danhSach = data.danhSachDeTu ?? [];
          const nv = s.run?.nhanVat;
          const maxDt = sucChuaDeTu(nv?.canhGioi ?? 0);

          const wrap = document.createElement('div');
          wrap.className = 'su-do-panel';
          wrap.style.cssText = 'padding: 8px 4px;';

          // Header nhỏ gọn
          const topBar = document.createElement('div');
          topBar.className = 'su-do-header';
          topBar.innerHTML = `
            <div class="su-do-header-title">
              <span>🏛️ ${data.daoTrangTen ?? 'Thanh Khê Đạo Tràng'}</span>
              <span class="hud-phu" style="font-size:12px; font-weight:normal;">(${danhSach.length}/${maxDt})</span>
            </div>
            <div class="su-do-header-sub">Sư Tôn khai sơn lập phái, thụ nghiệp truyền đạo.</div>
          `;

          const btnMoDaoTrang = kit.button({
            text: 'Mở Bảng Đạo Tràng',
            kind: 'chinh',
            onClick: () => mod.ui.openPanel('dao_trang_panel'),
          });
          btnMoDaoTrang.classList.add('su-do-btn-wrap');
          btnMoDaoTrang.style.cssText += 'margin-top: 6px;';
          topBar.append(btnMoDaoTrang);
          wrap.append(topBar);

          if (danhSach.length === 0) {
            wrap.append(
              kit.empty({
                text: 'Chưa có đồ đệ nào bái nhập sư môn',
                hint: 'Hãy mở Đạo Tràng để chiêu mộ những kỳ tài đầu tiên!',
              })
            );
          } else {
            danhSach.forEach((dt) => {
              wrap.append(taoTheDeTuNho(dt, tt, kit));
            });
          }

          el.append(wrap);
        };

        veGiaoDienTab();
        return tt.subscribe(veGiaoDienTab);
      },
    });

    // ==========================================
    // 6. BẢNG ĐIỀU KHIỂN CHÍNH: ĐẠO TRÀNG SƯ ĐỒ
    // ==========================================
    mod.ui.addPanel({
      id: 'dao_trang_panel',
      title: '🏛️ Đạo Tràng',
      mount(el) {
        const veBangDaoTrang = () => {
          el.innerHTML = '';
          const s = tt.state();
          const data = s.run?.modData?.su_do ?? {};
          const danhSach = data.danhSachDeTu ?? [];
          const ungVien = data.ungVien ?? [];
          const nv = s.run?.nhanVat;
          const maxDt = sucChuaDeTu(nv?.canhGioi ?? 0);

          const container = document.createElement('div');
          container.className = 'su-do-panel';
          container.style.cssText = 'min-height: 420px;';

          // HEADER ĐẠO TRÀNG SANG TRỌNG
          const header = document.createElement('div');
          header.className = 'su-do-header';
          header.innerHTML = `
            <div class="su-do-header-title">
              <span class="su-do-title-text" style="display:inline-flex; align-items:center; gap:4px; cursor:pointer;" title="Bấm để đổi tên Đạo Tràng">
                🏛️ <b>${data.daoTrangTen ?? 'Thanh Khê Đạo Tràng'}</b> <span style="font-size:10px; opacity:0.6;">✏️</span>
              </span>
              <span class="su-do-badge" style="color:var(--vang-kim); background:rgba(218,165,32,0.12); border:1px solid var(--vang-kim);">
                ${CANH_GIOI_TEN[nv?.canhGioi ?? 1] ?? 'Hóa Thần'} Sư Tôn
              </span>
            </div>
            <div class="su-do-header-sub">Khai sơn lập phái · Quảng truyền đạo pháp</div>
            <div class="su-do-header-stats">
              <span>🥋 Đồ đệ: <b>${danhSach.length}/${maxDt}</b></span>
              <span>📜 Tông môn: <b>Thịnh</b></span>
              <span>✨ Chờ bái: <b>${ungVien.length}</b></span>
            </div>
          `;

          const titleBtn = header.querySelector('.su-do-title-text');
          if (titleBtn) {
            titleBtn.onclick = () => {
              const m = kit.modal({
                title: 'Đổi Tên Đạo Tràng',
                mount(modalBox) {
                  modalBox.style.cssText = 'display: flex; flex-direction: column; gap: 8px; font-size: 13px;';
                  const tip = document.createElement('div');
                  tip.innerHTML = 'Nhập tên mới cho tông môn / đạo tràng của sư tôn (tối đa 24 ký tự):';
                  modalBox.append(tip);

                  const input = document.createElement('input');
                  input.type = 'text';
                  input.value = data.daoTrangTen ?? 'Thanh Khê Đạo Tràng';
                  input.maxLength = 24;
                  input.style.cssText = 'padding: 6px 10px; font-size: 13px; border: 1px solid var(--vien-hud); background: var(--nen-hud); color: var(--muc); border-radius: 4px; outline: none;';
                  modalBox.append(input);

                  const btnSave = kit.button({
                    text: 'Xác Nhận Đổi Tên',
                    kind: 'chinh',
                    onClick: () => {
                      const tenMoi = input.value.trim();
                      if (!tenMoi) {
                        tt.ui.toast('Tên đạo tràng không được để trống!');
                        return;
                      }
                      try {
                        tt.game.modAction('su_do', 'doi_ten_dao_trang', { ten: tenMoi });
                        m.close();
                        tt.ui.toast(`Đã đổi tên đạo tràng thành: "${tenMoi}"`);
                      } catch (err) {
                        tt.ui.toast(err.message);
                      }
                    },
                  });
                  btnSave.classList.add('su-do-btn-wrap');
                  modalBox.append(btnSave);
                },
              });
            };
          }

          container.append(header);

          // 4 TABS RÚT GỌN NẰM TRÊN 1 HÀNG
          const tabsEl = kit.tabs({
            tabs: [
              // TAB 1: ĐỒ ĐỆ
              {
                id: 'tab_de_tu',
                title: `Đồ Đệ (${danhSach.length})`,
                mount(box) {
                  box.style.cssText = 'display: flex; flex-direction: column; gap: 8px; margin-top: 6px;';

                  // Nút mở kỳ tuyển đồ
                  const topAct = document.createElement('div');
                  topAct.style.cssText = 'display: flex; justify-content: space-between; align-items: center; margin-bottom: 2px; gap: 8px;';

                  const desc = document.createElement('div');
                  desc.style.cssText = 'font-size: 11.5px; color: var(--muc-nhat); white-space: nowrap;';
                  desc.innerHTML = `Đệ tử: <b>${danhSach.length}/${maxDt}</b>`;
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

                  // BẢNG VÀNG ỨNG VIÊN ĐANG CHỜ BÁI SƯ
                  if (ungVien.length > 0) {
                    const uvBox = document.createElement('div');
                    uvBox.style.cssText = 'background: rgba(218, 165, 32, 0.06); border: 1px dashed var(--vang-kim); border-radius: 8px; padding: 8px 10px; display: flex; flex-direction: column; gap: 6px;';

                    const uvHeader = document.createElement('div');
                    uvHeader.style.cssText = 'font-size: 13px; font-weight: bold; color: var(--vang-kim); display: flex; justify-content: space-between;';
                    uvHeader.innerHTML = `<span>⚡ Ứng viên cầu đạo đang chờ bái sư (${ungVien.length}):</span>`;
                    uvBox.append(uvHeader);

                    ungVien.forEach((uv, idx) => {
                      const itemCard = document.createElement('div');
                      itemCard.style.cssText = 'background: var(--nen-hud); border: 1px solid var(--vien-hud); border-radius: 6px; padding: 6px 8px; display: flex; justify-content: space-between; align-items: center; gap: 6px; min-width: 0;';

                      const colLeft = document.createElement('div');
                      colLeft.style.cssText = 'display: flex; flex-direction: column; gap: 2px; font-size: 11.5px; min-width: 0; flex: 1;';

                      const tc = TU_CHAT_MAP[uv.tuChat] ?? { ten: uv.tuChat, color: 'inherit', bg: 'transparent', border: 'transparent' };
                      const heStr = uv.he.map((h) => HE_MAP[h] ?? h).join(' · ');

                      colLeft.innerHTML = `
                        <div style="font-size: 13px; display: flex; align-items: center; gap: 6px; white-space: nowrap;">
                          <b>${uv.ten}</b>
                          <span class="hud-phu" style="font-size:11px;">(${uv.gioiTinh === 'nam' ? 'Nam' : 'Nữ'} · ${uv.tuoi}t)</span>
                        </div>
                        <div style="display:flex; gap:6px; align-items:center; white-space:nowrap; font-size:11px;">
                          <span>Hệ: <b>${heStr}</b></span>
                          <span class="su-do-badge" style="color:${tc.color}; background:${tc.bg}; border:1px solid ${tc.border}; font-size:10px;">${tc.ten}</span>
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
                      btnNhan.classList.add('su-do-btn-wrap');
                      btnNhan.style.cssText += 'padding: 3px 8px; font-weight: bold; font-size: 11.5px; white-space: nowrap;';
                      itemCard.append(btnNhan);

                      uvBox.append(itemCard);
                    });
                    box.append(uvBox);
                  }

                  // DANH SÁCH ĐỒ ĐỆ CHÍNH THỨC
                  if (danhSach.length === 0) {
                    box.append(
                      kit.empty({
                        text: 'Đạo tràng chưa có đệ tử nào',
                        hint: 'Hãy bấm nút "Chiêu Mộ Đồ Đệ" ở trên để tìm kiếm thiên tài!',
                      })
                    );
                  } else {
                    danhSach.forEach((dt) => {
                      box.append(taoTheDeTuChiTiet(dt, tt, kit));
                    });
                  }
                },
              },

              // TAB 2: NHẬT KÝ SƯ MÔN
              {
                id: 'tab_su_mon',
                title: 'Nhật Ký',
                mount(box) {
                  box.style.cssText = 'display: flex; flex-direction: column; gap: 8px; margin-top: 6px;';

                  const nhatKy = data.nhatKy ?? [];
                  if (nhatKy.length === 0) {
                    box.append(kit.empty({ text: 'Chưa có sự kiện sư môn nào được ghi lại' }));
                  } else {
                    const logList = document.createElement('div');
                    logList.style.cssText = 'max-height: 340px; overflow-y: auto; display: flex; flex-direction: column; gap: 6px;';
                    nhatKy.forEach((nk) => {
                      const item = document.createElement('div');
                      item.style.cssText = 'font-size: 12px; padding: 6px 8px; border-left: 2px solid var(--chu-do); background: rgba(0,0,0,0.02); border-radius: 0 4px 4px 0;';
                      item.innerHTML = `<span style="color:var(--chu-do); font-weight:600;">[Năm ${nk.nam}]</span> ${nk.text}`;
                      logList.append(item);
                    });
                    box.append(logList);
                  }
                },
              },

              // TAB 3: LỊCH LUYỆN
              {
                id: 'tab_lich_luyen',
                title: 'Lịch Luyện',
                mount(box) {
                  box.style.cssText = 'display: flex; flex-direction: column; gap: 8px; margin-top: 6px;';

                  const dangLichLuyen = danhSach.filter((d) => d.trangThai?.loai === 'lich_luyen');
                  const ranhRoi = danhSach.filter((d) => d.trangThai?.loai === 'nha_roi');

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
                      const conLai = dt.trangThai?.namConLai ?? 0;
                      info.innerHTML = `
                        <div><b>${dt.ten}</b> · <i style="color:var(--chu-do);">${dt.trangThai?.nhiemVu}</i></div>
                        <div class="hud-phu" style="font-size: 11px;">${conLai > 0 ? `⏳ Còn <b>${conLai} năm</b> nữa trở về` : '✅ Đã hoàn thành, chờ thu nhận!'}</div>
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
                },
              },

              // TAB 4: TIỀN DUYÊN
              {
                id: 'tab_truyen_thua',
                title: 'Tiền Duyên',
                mount(box) {
                  box.style.cssText = 'display: flex; flex-direction: column; gap: 10px; margin-top: 6px; font-size: 13px;';

                  const intro = document.createElement('div');
                  intro.style.cssText = 'line-height: 1.5; color: var(--muc);';
                  intro.innerHTML = 'Tông môn truyền thừa qua muôn vàn kiếp số. Đồ đệ xuất sắc khi sư tôn tọa hóa sẽ tiếp tục tu hành, kiếp sau có cơ hội tương phùng tái ngộ!';
                  box.append(intro);

                  let tienDuyen = [];
                  try {
                    tienDuyen = JSON.parse(localStorage.getItem('mod:su_do:tien_duyen') ?? '[]');
                  } catch (e) {}

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
                },
              },
            ],
          });

          container.append(tabsEl);
          el.append(container);
        };

        veBangDaoTrang();
        return tt.subscribe(veBangDaoTrang);
      },
    });

    // ==========================================
    // 7. CÁC HÀM TẠO THẺ ĐỆ TỬ TINH XẢO
    // ==========================================

    function taoTheDeTuNho(dt, tt, kit) {
      const card = document.createElement('div');
      card.className = 'su-do-card';
      card.style.cssText = 'padding: 6px 8px; gap: 4px;';

      const rowTop = document.createElement('div');
      rowTop.style.cssText = 'display: flex; justify-content: space-between; align-items: center; font-size: 12.5px; white-space: nowrap; min-width: 0;';

      const tenSpan = document.createElement('span');
      tenSpan.style.cssText = 'display: flex; align-items: center; gap: 4px; white-space: nowrap;';
      const danhXung = dt.gioiTinh === 'nu' ? 'Đại Sư Tỷ' : 'Đại Sư Huynh';
      tenSpan.innerHTML = `<b>${dt.ten}</b> ${dt.vaiVe === 'dai_su_huynh' ? `<span class="su-do-badge" style="color:var(--vang-kim); background:rgba(218,165,32,0.12); border:1px solid var(--vang-kim); font-size:9.5px; padding:0 4px;">${danhXung}</span>` : ''}`;
      rowTop.append(tenSpan);

      const cgSpan = document.createElement('span');
      cgSpan.className = 'hud-phu';
      cgSpan.style.cssText = 'font-size: 11px; white-space: nowrap; margin-left: auto;';
      cgSpan.textContent = dinhDangCanhGioi(dt.canhGioi, dt.tieuCanhGioi);
      rowTop.append(cgSpan);
      card.append(rowTop);

      // Thanh tu vi progress thanh mảnh kèm số điểm
      const pct = Math.min(100, Math.floor(((dt.tuVi ?? 0) / (dt.tuViYeuCau || 1)) * 100));
      const sanSang = (dt.tuVi ?? 0) >= (dt.tuViYeuCau || 1);
      const progBox = document.createElement('div');
      progBox.style.cssText = 'display: flex; align-items: center; gap: 6px; font-size: 10px;';
      progBox.innerHTML = `
        <div class="su-do-progress-bar">
          <div class="su-do-progress-val ${sanSang ? 'su-do-progress-max' : ''}" style="width: ${pct}%;"></div>
        </div>
        <span style="font-size: 10px; white-space: nowrap; font-weight: 600; color: ${sanSang ? 'var(--chu-do)' : 'inherit'};">
          ${dt.tuVi ?? 0}/${dt.tuViYeuCau} (${pct}%)
        </span>
      `;
      card.append(progBox);

      return card;
    }

    function taoTheDeTuChiTiet(dt, tt, kit) {
      const card = document.createElement('div');
      card.className = 'su-do-card';

      const top = document.createElement('div');
      top.style.cssText = 'display: flex; gap: 8px; align-items: center; min-width: 0;';

      // Chân dung NPC thủy mặc
      const faceUrl = tt.assets?.npcFace?.(dt.id, dt.gioiTinh, dt.tuoi, 'su_phu');
      const avatar = document.createElement('div');
      avatar.className = 'su-do-avatar';
      if (faceUrl) {
        avatar.innerHTML = `<img src="${faceUrl}" style="width:100%; height:100%; object-fit:cover;" />`;
      } else {
        avatar.innerHTML = `<span style="font-size:18px;">🥋</span>`;
      }
      top.append(avatar);

      // Thông tin chi tiết
      const tc = TU_CHAT_MAP[dt.tuChat] ?? { ten: dt.tuChat, color: 'inherit', bg: 'transparent', border: 'transparent' };
      const heStr = dt.he.map((h) => HE_MAP[h] ?? h).join(' · ');
      const tcStr = TINH_CACH_MAP[dt.tinhCach] ?? dt.tinhCach;
      const danhXung = dt.gioiTinh === 'nu' ? 'Đại Sư Tỷ' : 'Đại Sư Huynh';

      const info = document.createElement('div');
      info.className = 'su-do-card-info';
      info.innerHTML = `
        <div class="su-do-card-name-row">
          <span class="su-do-card-name">${dt.ten}</span>
          ${dt.vaiVe === 'dai_su_huynh' ? `<span class="su-do-badge" style="color:var(--vang-kim); background:rgba(218,165,32,0.14); border:1px solid var(--vang-kim); font-size:10px; padding:0 5px; white-space:nowrap;">${danhXung}</span>` : ''}
          <span class="su-do-badge" style="color:${tc.color}; background:${tc.bg}; border:1px solid ${tc.border}; font-size:10px; padding:0 5px; white-space:nowrap; margin-left:${dt.vaiVe === 'dai_su_huynh' ? '4px' : 'auto'};">${tc.ten}</span>
          <span class="su-do-card-meta" style="margin-left:${dt.vaiVe === 'dai_su_huynh' ? 'auto' : '6px'};">${dt.gioiTinh === 'nam' ? 'Nam' : 'Nữ'} · ${dt.tuoi}t</span>
        </div>
        <div class="su-do-card-subrow">
          <span>${dinhDangCanhGioi(dt.canhGioi, dt.tieuCanhGioi)}</span>
          <span style="opacity:0.4;">·</span>
          <span>Hệ ${heStr}</span>
          ${dt.trangThai?.loai === 'lich_luyen' && (dt.trangThai?.namConLai ?? 0) > 0 ? `<span class="su-do-badge" style="color:#10b981; background:rgba(16,185,129,0.12); border:1px solid #10b981; font-size:9.5px; padding:0 4px; margin-left:auto;">Lịch luyện (${dt.trangThai.namConLai}n)</span>` : ''}
        </div>
        <div class="su-do-card-stats">Tính cách: <i>${tcStr}</i> · Hiếu cảm: <b>${dt.haoCam}</b> · Đố kỵ: <b style="color:${dt.doKy > 50 ? 'var(--cam-do)' : 'inherit'}">${dt.doKy}</b></div>
      `;
      top.append(info);
      card.append(top);

      // Thanh tu vi kèm số điểm và %
      const pct = Math.min(100, Math.floor(((dt.tuVi ?? 0) / (dt.tuViYeuCau || 1)) * 100));
      const sanSangDoKiep = (dt.tuVi ?? 0) >= (dt.tuViYeuCau || 1);
      const progRow = document.createElement('div');
      progRow.style.cssText = 'display:flex; align-items:center; gap:6px; font-size:11px;';
      progRow.innerHTML = `
        <span class="hud-phu" style="font-size:11px; white-space:nowrap;">Tu vi:</span>
        <div class="su-do-progress-bar">
          <div class="su-do-progress-val ${sanSangDoKiep ? 'su-do-progress-max' : ''}" style="width: ${pct}%;"></div>
        </div>
        <span style="font-size:10.5px; white-space:nowrap; font-weight:600; color:${sanSangDoKiep ? 'var(--chu-do)' : 'inherit'};">
          ${dt.tuVi ?? 0}/${dt.tuViYeuCau} (${pct}%)${sanSangDoKiep ? ' ⚡' : ''}
        </span>
      `;
      card.append(progRow);

      // HÀNG NÚT TƯƠNG TÁC CHÍNH (3 Nút hàng trên)
      const gridMain = document.createElement('div');
      gridMain.className = 'su-do-action-grid';

      // 1. Đàm tâm
      const btnDamTam = kit.button({
        text: '🗣️ Đàm Tâm',
        kind: 'nho',
        onClick: () => {
          if (dt.trangThai?.loai === 'lich_luyen' && (dt.trangThai?.namConLai ?? 0) > 0) {
            tt.ui.toast(`Đệ tử ${dt.ten} đang xuất sơn lịch luyện (${dt.trangThai.namConLai} năm nữa mới về)!`);
            return;
          }
          const m = kit.modal({
            title: `Vấn Đạo Cùng ${dt.ten}`,
            mount(box) {
              box.style.cssText = 'display: flex; flex-direction: column; gap: 8px; font-size: 13px;';
              const ask = document.createElement('div');
              ask.innerHTML = `Đệ tử ${dt.ten} chắp tay cung kính thưa: <i>"Khởi bẩm Sư tôn, giữa nhân gian hiểm ác, đệ tử tu tiên nên lấy điều gì làm trọng tâm?"</i>`;
              box.append(ask);

              box.append(
                kit.button({
                  text: 'Trừ Ma Vệ Đạo (Chính Đạo)',
                  kind: 'chinh',
                  onClick: () => {
                    tt.game.modAction('su_do', 'luan_dao', { deTuId: dt.id, huong: 'chinh_dao' });
                    m.close();
                    tt.ui.toast('Đã chỉ dạy đạo lý Chính Đạo!');
                  },
                })
              );

              box.append(
                kit.button({
                  text: 'Tiêu Dao Tự Tại (Tiêu Dao)',
                  kind: 'phu',
                  onClick: () => {
                    tt.game.modAction('su_do', 'luan_dao', { deTuId: dt.id, huong: 'tieu_dao' });
                    m.close();
                    tt.ui.toast('Đã chỉ dạy đạo lý Tiêu Dao!');
                  },
                })
              );

              box.append(
                kit.button({
                  text: 'Kẻ Mạnh Vi Tôn (Ma Đạo)',
                  kind: 'phu',
                  onClick: () => {
                    tt.game.modAction('su_do', 'luan_dao', { deTuId: dt.id, huong: 'ma_dao' });
                    m.close();
                    tt.ui.toast('Đã chỉ dạy đạo lý Nghịch Thiên!');
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
      const btnTruyenCong = kit.button({
        text: '📖 Truyền Công',
        kind: 'nho',
        onClick: () => {
          if (dt.trangThai?.loai === 'lich_luyen' && (dt.trangThai?.namConLai ?? 0) > 0) {
            tt.ui.toast(`Đệ tử ${dt.ten} đang xuất sơn lịch luyện!`);
            return;
          }
          if ((dt.tuVi ?? 0) >= (dt.tuViYeuCau || 1)) {
            tt.ui.toast(`Đệ tử ${dt.ten} đã đạt bình cảnh tu vi (100%), cần hộ pháp đột phá trước!`);
            return;
          }
          const s = tt.state();
          if ((s.run?.nhanVat?.tuVi ?? 0) < 1) {
            tt.ui.toast('Sư tôn không đủ chân nguyên tu vi để truyền công (cần ít nhất 1.0 tu vi)!');
            return;
          }
          try {
            tt.game.modAction('su_do', 'truyen_cong', { deTuId: dt.id });
            tt.ui.toast(`Đã quán đảnh truyền công cho ${dt.ten}!`);
          } catch (e) {
            tt.ui.toast(e.message);
          }
        },
      });
      btnTruyenCong.classList.add('su-do-btn-wrap');
      gridMain.append(btnTruyenCong);

      // 3. Luận bàn
      const btnDauPhap = kit.button({
        text: '⚔️ Luận Bàn',
        kind: 'nho',
        onClick: () => {
          if (dt.trangThai?.loai === 'lich_luyen' && (dt.trangThai?.namConLai ?? 0) > 0) {
            tt.ui.toast(`Đệ tử ${dt.ten} đang xuất sơn lịch luyện!`);
            return;
          }
          tt.game.modAction('su_do', 'dau_phap', { deTuId: dt.id });
          tt.ui.toast(`Đã luận bàn đấu pháp cùng ${dt.ten}!`);
        },
      });
      btnDauPhap.classList.add('su-do-btn-wrap');
      gridMain.append(btnDauPhap);
      card.append(gridMain);

      // HÀNG PHỤ: Ban Thưởng, Độ Kiếp, Đại Sư Huynh, Trục Xuất
      const subRow = document.createElement('div');
      subRow.className = 'su-do-action-subgrid';

      // Nút Ban thưởng
      const btnBanThuong = kit.button({
        text: '🎁 Ban Thưởng (30 LT)',
        kind: 'nho',
        onClick: () => {
          if (dt.trangThai?.loai === 'lich_luyen' && (dt.trangThai?.namConLai ?? 0) > 0) {
            tt.ui.toast(`Đệ tử ${dt.ten} đang xuất sơn lịch luyện!`);
            return;
          }
          const s = tt.state();
          if ((s.run?.nhanVat?.linhThach ?? 0) < 30) {
            tt.ui.toast('Sư tôn không đủ 30 linh thạch để ban thưởng!');
            return;
          }
          try {
            tt.game.modAction('su_do', 'ban_thuong', { deTuId: dt.id, soTien: 30 });
            tt.ui.toast(`Đã ban thưởng 30 linh thạch cho ${dt.ten}!`);
          } catch (e) {
            tt.ui.toast(e.message);
          }
        },
      });
      btnBanThuong.classList.add('su-do-btn-wrap');
      subRow.append(btnBanThuong);

      // Nút Hộ trì đột phá / Độ kiếp nếu đủ tu vi
      const laDinhPhong = dt.canhGioi >= 5 && dt.tieuCanhGioi >= 3;
      if (dt.tuVi >= dt.tuViYeuCau && !laDinhPhong) {
        const laDaiCanhGioi = dt.tieuCanhGioi >= 3;
        const tuLuyenKhiLenTrucCo = dt.canhGioi === 1 && laDaiCanhGioi;
        const doKiepThucSu = dt.canhGioi >= 2 && laDaiCanhGioi;

        const nutText = doKiepThucSu
          ? '⚡ Độ Kiếp'
          : tuLuyenKhiLenTrucCo
          ? '🌟 Đột Phá Trúc Cơ'
          : '⚡ Đột Phá';

        const btnHoPhap = kit.button({
          text: nutText,
          kind: 'chinh',
          onClick: () => {
            if (dt.trangThai?.loai === 'lich_luyen' && (dt.trangThai?.namConLai ?? 0) > 0) {
              tt.ui.toast(`Đệ tử ${dt.ten} đang xuất sơn lịch luyện, chưa có mặt tại đạo tràng!`);
              return;
            }
            if (!laDaiCanhGioi) {
              // === 1. ĐỘT PHÁ TIỂU CẢNH GIỚI ===
              const m = kit.modal({
                title: `Hộ Trì Đột Phá Cho ${dt.ten}`,
                mount(box) {
                  box.style.cssText = 'display: flex; flex-direction: column; gap: 8px; font-size: 13px;';
                  const msg = document.createElement('div');
                  msg.innerHTML = `Đệ tử <b>${dt.ten}</b> (${dinhDangCanhGioi(dt.canhGioi, dt.tieuCanhGioi)}) đã tích lũy đầy đủ tu vi, chuẩn bị xung mạch phá quan lên <b>${dinhDangCanhGioi(dt.canhGioi, dt.tieuCanhGioi + 1)}</b>! Sư tôn lựa chọn cách hộ trì nào?`;
                  box.append(msg);

                  box.append(
                    kit.button({
                      text: '✨ Chỉ dẫn khí mạch (100% thành công, tốn 0.2 tu vi, không bị thương)',
                      kind: 'chinh',
                      onClick: () => {
                        const nv = tt.state().run?.nhanVat;
                        if (nv && (nv.tuVi ?? 0) < 0.2) {
                          tt.ui.toast('Sư tôn không đủ 0.2 tu vi chân nguyên để chỉ dẫn!');
                          return;
                        }
                        tt.game.modAction('su_do', 'ho_phap', { deTuId: dt.id, cach: 'chi_dan' });
                        m.close();
                        tt.ui.toast(`Đã chỉ dẫn khí mạch hộ ${dt.ten} đột phá thành công!`);
                      },
                    })
                  );

                  box.append(
                    kit.button({
                      text: '💊 Ban đan dược trợ lực (85% thành công, 30 linh thạch)',
                      kind: 'phu',
                      onClick: () => {
                        const nv = tt.state().run?.nhanVat;
                        if (nv && (nv.linhThach ?? 0) < 30) {
                          tt.ui.toast('Sư tôn không đủ 30 linh thạch để mua đan dược!');
                          return;
                        }
                        tt.game.modAction('su_do', 'ho_phap', { deTuId: dt.id, cach: 'ban_dan' });
                        m.close();
                        tt.ui.toast(`Đã ban đan dược cho ${dt.ten} xung kích tiểu cảnh giới!`);
                      },
                    })
                  );

                  box.append(
                    kit.button({
                      text: '🛡️ Tự lực cánh sinh (60% thành công)',
                      kind: 'phu',
                      onClick: () => {
                        tt.game.modAction('su_do', 'ho_phap', { deTuId: dt.id, cach: 'tu_luc' });
                        m.close();
                      },
                    })
                  );
                },
              });
            } else if (tuLuyenKhiLenTrucCo) {
              // === 2. ĐỘT PHÁ TRÚC CƠ (ĐÚC ĐẠO CƠ, KHÔNG CÓ LÔI KIẾP) ===
              const m = kit.modal({
                title: `Hộ Đạo Trúc Cơ Cho ${dt.ten}`,
                mount(box) {
                  box.style.cssText = 'display: flex; flex-direction: column; gap: 8px; font-size: 13px;';
                  const msg = document.createElement('div');
                  msg.innerHTML = `Đồ đệ <b>${dt.ten}</b> đã đạt Luyện Khí Đại viên mãn, chuẩn bị ngưng tụ đạo cơ để bước chân vào Trúc Cơ Sơ kỳ! Sư tôn lựa chọn cách hộ đạo?`;
                  box.append(msg);

                  box.append(
                    kit.button({
                      text: '🌟 Sư tôn hộ pháp đúc đạo cơ (100% thành công, hao 0.5 tu vi, không bị thương)',
                      kind: 'chinh',
                      onClick: () => {
                        const nv = tt.state().run?.nhanVat;
                        if (nv && (nv.tuVi ?? 0) < 0.5) {
                          tt.ui.toast('Sư tôn không đủ 0.5 tu vi để hộ pháp đúc đạo cơ!');
                          return;
                        }
                        tt.game.modAction('su_do', 'ho_phap', { deTuId: dt.id, cach: 'ho_phap' });
                        m.close();
                        tt.ui.toast(`Đã hộ pháp giúp ${dt.ten} đúc thành đạo cơ Trúc Cơ!`);
                      },
                    })
                  );

                  box.append(
                    kit.button({
                      text: '💊 Ban Trúc Cơ Đan (90% thành công, 80 linh thạch hoặc có đan)',
                      kind: 'phu',
                      onClick: () => {
                        const nv = tt.state().run?.nhanVat;
                        const coDan = (nv?.tuiDo?.['item.truc_co_dan'] ?? 0) > 0;
                        if (!coDan && (nv?.linhThach ?? 0) < 80) {
                          tt.ui.toast('Sư tôn không có Trúc Cơ Đan hoặc không đủ 80 linh thạch!');
                          return;
                        }
                        tt.game.modAction('su_do', 'ho_phap', { deTuId: dt.id, cach: 'ban_dan' });
                        m.close();
                        tt.ui.toast(`Đã ban Trúc Cơ Đan cho ${dt.ten}!`);
                      },
                    })
                  );

                  box.append(
                    kit.button({
                      text: '🛡️ Tự thân đúc đạo cơ (50% thành công)',
                      kind: 'phu',
                      onClick: () => {
                        tt.game.modAction('su_do', 'ho_phap', { deTuId: dt.id, cach: 'tu_luc' });
                        m.close();
                      },
                    })
                  );
                },
              });
            } else {
              // === 3. ĐỘ KIẾP ĐẠI CẢNH GIỚI (CỬU THIÊN LÔI KIẾP) ===
              const m = kit.modal({
                title: `Hộ Pháp Độ Kiếp Cho ${dt.ten}`,
                mount(box) {
                  box.style.cssText = 'display: flex; flex-direction: column; gap: 8px; font-size: 13px;';
                  const msg = document.createElement('div');
                  msg.innerHTML = `Đệ tử <b>${dt.ten}</b> xung kích đại cảnh giới, thiên địa dị tượng cuồn cuộn, cửu thiên lôi kiếp sắp giáng xuống! Sư tôn lựa chọn phương án hộ kiếp nào?`;
                  box.append(msg);

                  box.append(
                    kit.button({
                      text: '⚡ Gánh lôi kiếp (100% thành công, Sư tôn chịu 1 tầng thương thế nhẹ)',
                      kind: 'chinh',
                      onClick: () => {
                        tt.game.modAction('su_do', 'ho_phap', { deTuId: dt.id, cach: 'ganh_loi_kiep' });
                        m.close();
                        tt.ui.toast(`Đã gánh lôi kiếp hộ ${dt.ten} vượt thiên kiếp thành công!`);
                      },
                    })
                  );

                  box.append(
                    kit.button({
                      text: '💊 Ban Đan Dược Hộ Mệnh (80% thành công, 100 linh thạch)',
                      kind: 'phu',
                      onClick: () => {
                        const nv = tt.state().run?.nhanVat;
                        const coDan = (nv?.tuiDo?.['item.su_do_ho_mach_dan'] ?? 0) > 0 || (nv?.tuiDo?.['item.ket_kim_dan'] ?? 0) > 0;
                        if (!coDan && (nv?.linhThach ?? 0) < 100) {
                          tt.ui.toast('Sư tôn không đủ 100 linh thạch để ban đan dược hộ mệnh!');
                          return;
                        }
                        tt.game.modAction('su_do', 'ho_phap', { deTuId: dt.id, cach: 'ban_dan' });
                        m.close();
                        tt.ui.toast('Đã ban đan dược hộ mệnh độ kiếp!');
                      },
                    })
                  );

                  box.append(
                    kit.button({
                      text: '🛡️ Tự thân vượt thiên kiếp (50% thành công)',
                      kind: 'phu',
                      onClick: () => {
                        tt.game.modAction('su_do', 'ho_phap', { deTuId: dt.id, cach: 'tu_luc' });
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

      if (dt.vaiVe !== 'dai_su_huynh') {
        const danhXung = dt.gioiTinh === 'nu' ? 'Đại Sư Tỷ' : 'Đại Sư Huynh';
        const btnBoNhiem = kit.button({
          text: '👑',
          tip: `Sắc phong làm ${danhXung}`,
          kind: 'nho',
          onClick: () => {
            tt.game.modAction('su_do', 'bo_nhiem', { deTuId: dt.id });
            tt.ui.toast(`Đã sắc phong ${dt.ten} làm ${danhXung}!`);
          },
        });
        btnBoNhiem.classList.add('su-do-btn-wrap');
        rightGroup.append(btnBoNhiem);
      }

      const btnTrucXuat = kit.button({
        text: '✕',
        tip: 'Trục xuất đồ đệ khỏi môn phái',
        kind: 'nho',
        onClick: async () => {
          const ok = await tt.ui.confirm({
            title: 'Trục Xuất Đệ Tử',
            text: `Sư tôn có chắc chắn muốn trục xuất ${dt.ten} khỏi môn phái?`,
          });
          if (ok) {
            tt.game.modAction('su_do', 'truc_xuat', { deTuId: dt.id });
            tt.ui.toast(`Đã trục xuất ${dt.ten}!`);
          }
        },
      });
      btnTrucXuat.classList.add('su-do-btn-wrap');
      rightGroup.append(btnTrucXuat);

      subRow.append(rightGroup);
      card.append(subRow);

      return card;
    }
  },
});
})();
