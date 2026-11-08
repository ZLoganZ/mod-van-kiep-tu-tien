/**
 * Mod Sư Đồ Truyền Thừa (su_do) - Vạn Kiếp Tu Tiên
 * Tác giả: Antigravity & Tu Tiên Giả
 * Phiên bản: 1.0.1
 * Tương thích: apiVersion 1 (Hỗ trợ UI Kit: progress, badge, empty, toggle)
 */

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

      // Cảnh giới ban đầu: thường là Luyện Khí tầng 1 - 4
      const tieuCanhGioi = 1 + (Math.floor(rngVal * 99) % 3);

      return {
        id: `dt_${Date.now()}_${Math.floor(rngVal * 10000)}`,
        ten: `${ho} ${ten}`,
        gioiTinh,
        tuoi: 14 + (Math.floor(rngVal * 88) % 6), // 14 - 19 tuổi
        he,
        tuChat: tuChat.id,
        tinhCach: tinhCach.id,
        khuynhHuong: 'chinh_dao', // chinh_dao, tieu_dao, ma_dao
        canhGioi: 0, // 0: Luyện Khí
        tieuCanhGioi,
        tuVi: 0,
        tuViYeuCau: tieuCanhGioi * 10,
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
      if (data.nhatKy.length > 50) data.nhatKy.pop(); // giữ tối đa 50 sự kiện
    }

    function sucChuaDeTu(canhGioiNguoiChoi) {
      if (canhGioiNguoiChoi <= 0) return 1;  // Luyện Khí: 1
      if (canhGioiNguoiChoi === 1) return 3; // Trúc Cơ: 3
      if (canhGioiNguoiChoi === 2) return 5; // Kim Đan: 5
      if (canhGioiNguoiChoi === 3) return 8; // Nguyên Anh: 8
      return 12;                             // Hóa Thần trở lên: 12
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

    // Action 2: Thu nhận 1 đệ tử
    mod.addAction('nhan_de_tu', (ctx, args, h) => {
      const data = layTrangThaiMod(h);
      const nv = ctx.run.nhanVat;
      const maxDt = sucChuaDeTu(nv.canhGioi);

      if (data.danhSachDeTu.length >= maxDt) {
        throw new Error(`Đạo tràng hiện tại chỉ có thể chứa tối đa ${maxDt} đệ tử. Hãy nâng cảnh giới để mở rộng!`);
      }

      const idx = args?.index ?? 0;
      const ungVien = data.ungVien?.[idx];
      if (!ungVien) throw new Error('Không tìm thấy thông tin ứng viên!');

      // Nếu chưa có ai làm Đại Sư Huynh, người đầu tiên sẽ là Đại Sư Huynh
      if (data.danhSachDeTu.length === 0) {
        ungVien.vaiVe = 'dai_su_huynh';
      }

      data.danhSachDeTu.push(ungVien);
      data.ungVien.splice(idx, 1);
      ghiNhatKy(data, `Thu nhận đồ đệ ${ungVien.ten} (${ungVien.he.join('/')}) nhập môn.`, ctx.run.nam ?? 1);
      h.setData(data);
      return 'khong_tick';
    });

    // Action 3: Đàm tâm vấn đạo
    mod.addAction('luan_dao', (ctx, args, h) => {
      const data = layTrangThaiMod(h);
      const dt = data.danhSachDeTu.find((d) => d.id === args?.deTuId);
      if (!dt) throw new Error('Không tìm thấy đệ tử!');

      const huong = args?.huong ?? 'chinh_dao'; // chinh_dao, tieu_dao, ma_dao
      dt.khuynhHuong = huong;
      dt.haoCam = Math.min(100, dt.haoCam + 15);
      dt.tuVi += 5;

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
      if (!dt) throw new Error('Không tìm thấy đệ tử!');

      const nv = ctx.run.nhanVat;
      if (nv.tuVi < 1) {
        throw new Error('Tu vi của sư tôn không đủ để truyền công!');
      }

      // Trừ nhẹ tu vi sư phụ để quán đảnh
      nv.tuVi = Math.max(0, nv.tuVi - 0.5);

      // Tăng tu vi đệ tử (x1.5 nếu hợp hệ ngũ hành)
      const tang = 15;
      dt.tuVi += tang;
      dt.haoCam = Math.min(100, dt.haoCam + 10);

      // Giảm đố kỵ của người nhận
      dt.doKy = Math.max(0, dt.doKy - 10);

      // Tăng nhẹ đố kỵ của các đệ tử khác vì thấy sư phụ thiên vị
      data.danhSachDeTu.forEach((other) => {
        if (other.id !== dt.id) {
          other.doKy = Math.min(100, (other.doKy ?? 0) + 5);
        }
      });

      ghiNhatKy(data, `Sư tôn hao phí chân nguyên quán đảnh truyền công cho ${dt.ten}, tăng ${tang} tu vi!`, ctx.run.nam ?? 1);
      h.setData(data);
      return 'khong_tick';
    });

    // Action 5: Ban thưởng linh thạch / pháp bảo
    mod.addAction('ban_thuong', (ctx, args, h) => {
      const data = layTrangThaiMod(h);
      const dt = data.danhSachDeTu.find((d) => d.id === args?.deTuId);
      if (!dt) throw new Error('Không tìm thấy đệ tử!');

      const nv = ctx.run.nhanVat;
      const soTien = args?.soTien ?? 30;
      if (nv.linhThach < soTien) {
        throw new Error(`Sư tôn không đủ ${soTien} linh thạch để ban thưởng!`);
      }

      nv.linhThach -= soTien;
      dt.haoCam = Math.min(100, dt.haoCam + 12);
      dt.doKy = Math.max(0, dt.doKy - 20);

      // Tăng nhẹ đố kỵ của các đệ tử khác
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
      if (!dt) throw new Error('Không tìm thấy đệ tử!');

      // Sư phụ áp chế tu vi để khảo nghiệm đệ tử
      dt.tuVi += 8;
      dt.haoCam = Math.min(100, dt.haoCam + 5);

      ghiNhatKy(data, `Sư tôn áp chế tu vi luận bàn đấu pháp cùng ${dt.ten}. Đệ tử ngộ ra nhiều chiêu thức thực chiến.`, ctx.run.nam ?? 1);
      h.setData(data);
      return 'khong_tick';
    });

    // Action 7: Hộ pháp độ kiếp
    mod.addAction('ho_phap', (ctx, args, h) => {
      const data = layTrangThaiMod(h);
      const dt = data.danhSachDeTu.find((d) => d.id === args?.deTuId);
      if (!dt) throw new Error('Không tìm thấy đệ tử!');

      if (dt.tuVi < dt.tuViYeuCau) {
        throw new Error('Đệ tử chưa tích lũy đủ tu vi để xung kích cảnh giới!');
      }

      const cach = args?.cach ?? 'ganh_loi_kiep'; // ganh_loi_kiep, ban_dan, tu_luc
      const nv = ctx.run.nhanVat;
      let thanhCong = false;

      if (cach === 'ganh_loi_kiep') {
        thanhCong = true;
        nv.thuongThe = Math.min(100, (nv.thuongThe ?? 0) + 5);
        dt.haoCam = 100;
        ghiNhatKy(data, `⚡ Sư tôn dùng thân thể đón đỡ cửu thiên lôi kiếp hộ ${dt.ten}! ${dt.ten} cảm kích tận xương tủy, đột phá thành công!`, ctx.run.nam ?? 1);
      } else if (cach === 'ban_dan') {
        const coDan = (nv.tuiDo?.['item.su_do_ho_mach_dan'] ?? 0) > 0;
        if (coDan) {
          nv.tuiDo['item.su_do_ho_mach_dan'] -= 1;
        } else if (nv.linhThach >= 50) {
          nv.linhThach -= 50;
        } else {
          throw new Error('Sư tôn không có Hộ Mạch Đan hoặc không đủ 50 linh thạch để mua đan dược!');
        }
        thanhCong = h.random() > 0.15; // 85% thành công
        ghiNhatKy(data, `Sư tôn ban đan dược hộ mạch cho ${dt.ten} độ kiếp: ${thanhCong ? 'Thành công viên mãn!' : 'Bình cảnh chưa phá, may nhờ đan dược hộ mệnh nên không nguy hiểm.'}`, ctx.run.nam ?? 1);
      } else {
        thanhCong = h.random() > 0.4;
        ghiNhatKy(data, `${dt.ten} tự mình vượt qua thiên kiếp: ${thanhCong ? 'Thuận lợi thăng cấp!' : 'Bị thiên lôi đánh lui, tu vi hao tổn.'}`, ctx.run.nam ?? 1);
      }

      if (thanhCong) {
        dt.tieuCanhGioi += 1;
        if (dt.tieuCanhGioi > 9) {
          dt.canhGioi += 1;
          dt.tieuCanhGioi = 1;
        }
        dt.tuVi = 0;
        dt.tuViYeuCau = (dt.canhGioi * 9 + dt.tieuCanhGioi) * 12;
      } else {
        dt.tuVi = Math.floor(dt.tuVi * 0.7);
      }

      h.setData(data);
      return 'khong_tick';
    });

    // Action 8: Bổ nhiệm Đại Sư Huynh
    mod.addAction('bo_nhiem', (ctx, args, h) => {
      const data = layTrangThaiMod(h);
      const dt = data.danhSachDeTu.find((d) => d.id === args?.deTuId);
      if (!dt) throw new Error('Không tìm thấy đệ tử!');

      data.danhSachDeTu.forEach((d) => (d.vaiVe = 'de_tu'));
      dt.vaiVe = 'dai_su_huynh';
      dt.haoCam = Math.min(100, dt.haoCam + 20);

      ghiNhatKy(data, `Sư tôn sắc phong ${dt.ten} làm Đại Sư Huynh, thống lĩnh đệ tử đời thứ nhất.`, ctx.run.nam ?? 1);
      h.setData(data);
      return 'khong_tick';
    });

    // Action 9: Phái đi lịch luyện
    mod.addAction('phai_lich_luyen', (ctx, args, h) => {
      const data = layTrangThaiMod(h);
      const dt = data.danhSachDeTu.find((d) => d.id === args?.deTuId);
      if (!dt) throw new Error('Không tìm thấy đệ tử!');

      const nhiemVu = args?.nhiemVu ?? 'hai_duoc'; // hai_duoc, dao_khoang, tru_ma, bi_canh
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
      if (!dt) throw new Error('Không tìm thấy đệ tử!');

      if (dt.trangThai?.loai !== 'lich_luyen' || (dt.trangThai?.namConLai ?? 0) > 0) {
        throw new Error('Đệ tử chưa hoàn thành lịch luyện!');
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
      if (idx === -1) throw new Error('Không tìm thấy đệ tử!');

      const dt = data.danhSachDeTu[idx];
      data.danhSachDeTu.splice(idx, 1);

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
        dt.tuVi += tuViTang;

        if (dt.trangThai?.loai === 'lich_luyen') {
          dt.trangThai.namConLai = Math.max(0, (dt.trangThai.namConLai ?? 0) - years);
          if (dt.trangThai.namConLai === 0) {
            ghiNhatKy(data, `Đệ tử ${dt.ten} đã hoàn thành lịch luyện, đang chờ sư tôn thu nhận kết quả.`, nam);
          }
        }

        if (dt.tinhCach === 'hieu_thuan' && dt.haoCam >= 80 && h.random() > 0.6) {
          const nv = ctx.run.nhanVat;
          if (nv.thuongThe > 0) {
            nv.thuongThe = Math.max(0, nv.thuongThe - 2);
            ghiNhatKy(data, `Đệ tử hiếu thảo ${dt.ten} nấu chén Tuyết Liên Trà dâng sư tôn, giúp sư tôn bình phục thương thế.`, nam);
          }
        }

        if (dt.doKy >= 80 && h.random() > 0.7) {
          ghiNhatKy(data, `⚠️ Đệ tử ${dt.ten} oán hận sư phụ thiên vị, đạo tâm chao đảo, có dấu hiệu muốn phản bội môn phái!`, nam);
        }
      });

      h.setData(data);
    });
  },

  ready(tt, mod) {
    mod.log('Mod Sư Đồ Truyền Thừa đã sẵn sàng (Pha ready)');
    const kit = tt.ui.kit;

    // ==========================================
    // 4. TIỆN ÍCH HIỂN THỊ & CSS TOÀN CỤC
    // ==========================================
    const TEN_CANH_GIOI = ['Luyện Khí', 'Trúc Cơ', 'Kim Đan', 'Nguyên Anh', 'Hóa Thần', 'Luyện Hư', 'Hợp Thể', 'Đại Thừa', 'Độ Kiếp'];

    const HE_MAP = {
      kim: 'Kim',
      moc: 'Mộc',
      thuy: 'Thủy',
      hoa: 'Hỏa',
      tho: 'Thổ',
    };

    const TU_CHAT_MAP = {
      pho_thong: { ten: 'Phổ Thông', color: 'var(--muc-nhat)', bg: 'rgba(0,0,0,0.06)' },
      kha: { ten: 'Khá Giỏi', color: 'var(--ngoc-luc)', bg: 'rgba(46,139,87,0.12)' },
      thien_tai: { ten: 'Thiên Tài', color: 'var(--vang-kim)', bg: 'rgba(218,165,32,0.15)' },
      yeu_nghiet: { ten: 'Yêu Nghiệt', color: 'var(--cam-do)', bg: 'rgba(220,20,60,0.15)' },
    };

    const TINH_CACH_MAP = {
      hieu_thuan: 'Hiếu Thuận',
      kien_dinh: 'Kiên Định',
      kieu_ngao: 'Kiêu Ngạo',
      can_man: 'Cần Mẫn',
    };

    // Chèn CSS ẩn hoàn toàn scrollbar và chống giật layout
    const styleId = 'mod-su-do-css';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        /* Ẩn hoàn toàn scrollbar nhưng vẫn cho cuộn bằng chuột và vuốt */
        .su-do-no-scroll,
        .su-do-no-scroll * {
          scrollbar-width: none !important;
          -ms-overflow-style: none !important;
        }
        .su-do-no-scroll::-webkit-scrollbar,
        .su-do-no-scroll *::-webkit-scrollbar {
          display: none !important;
          width: 0 !important;
          height: 0 !important;
        }
        /* Chống vỡ chữ và rớt dòng cho các nút bấm nhỏ */
        .su-do-btn-wrap {
          white-space: nowrap !important;
          flex-shrink: 0 !important;
        }
        .su-do-badge {
          display: inline-block;
          font-size: 11px;
          padding: 1px 6px;
          border-radius: 4px;
          line-height: 1.4;
          font-weight: 500;
        }
      `;
      document.head.append(style);
    }

    function sucChuaDeTu(cg) {
      if (cg <= 0) return 1;
      if (cg === 1) return 3;
      if (cg === 2) return 5;
      if (cg === 3) return 8;
      return 12;
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

          const wrap = document.createElement('div');
          wrap.className = 'su-do-no-scroll';
          wrap.style.cssText = 'padding: 8px 4px; display: flex; flex-direction: column; gap: 8px;';

          // Thanh công cụ đầu tab
          const topBar = document.createElement('div');
          topBar.style.cssText = 'display: flex; justify-content: space-between; align-items: center;';

          const title = document.createElement('div');
          title.style.cssText = 'font-size: 13px;';
          title.innerHTML = `<b>Đạo Tràng:</b> ${data.daoTrangTen ?? 'Thanh Khê Đạo Tràng'} <span class="hud-phu">(${danhSach.length} đệ tử)</span>`;
          topBar.append(title);

          const btnMoDaoTrang = kit.button({
            text: '🏛️ Đạo Tràng',
            kind: 'chinh',
            onClick: () => mod.ui.openPanel('dao_trang_panel'),
          });
          btnMoDaoTrang.classList.add('su-do-btn-wrap');
          topBar.append(btnMoDaoTrang);
          wrap.append(topBar);

          if (danhSach.length === 0) {
            wrap.append(
              kit.empty({
                text: 'Chưa có đồ đệ nào bái nhập sư môn',
                hint: 'Hãy mở Đạo Tràng để tổ chức kỳ tuyển mộ đệ tử!',
              })
            );
          } else {
            danhSach.forEach((dt) => {
              const card = taoTheDeTuNho(dt, tt, kit);
              wrap.append(card);
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
      title: '🏛️ Đạo Tràng Sư Đồ',
      mount(el) {
        const veBangDaoTrang = () => {
          el.innerHTML = '';
          const s = tt.state();
          const data = s.run?.modData?.su_do ?? {};
          const danhSach = data.danhSachDeTu ?? [];
          const ungVien = data.ungVien ?? [];
          const nv = s.run?.nhanVat;

          const container = document.createElement('div');
          container.className = 'su-do-no-scroll';
          container.style.cssText = 'display: flex; flex-direction: column; gap: 8px; min-height: 420px; overflow-y: auto;';

          // 4 TABS RÚT GỌN ĐỂ KHÔNG BỊ RỚT DÒNG
          const tabsEl = kit.tabs({
            tabs: [
              // TAB 1: DANH SÁCH ĐỒ ĐỆ
              {
                id: 'tab_de_tu',
                title: `Đồ Đệ (${danhSach.length})`,
                mount(box) {
                  box.className = 'su-do-no-scroll';
                  box.style.cssText = 'display: flex; flex-direction: column; gap: 8px; margin-top: 6px;';

                  // Nút mở kỳ tuyển đồ
                  const rowTuyen = document.createElement('div');
                  rowTuyen.style.cssText = 'display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;';

                  const scSpan = document.createElement('div');
                  scSpan.style.cssText = 'font-size: 13px; color: var(--muc);';
                  const maxDt = sucChuaDeTu(nv?.canhGioi ?? 0);
                  scSpan.innerHTML = `Sức chứa: <b>${danhSach.length} / ${maxDt}</b> đệ tử`;
                  rowTuyen.append(scSpan);

                  const btnChieuMo = kit.button({
                    text: '📜 Chiêu Mộ Đồ Đệ',
                    kind: 'phu',
                    onClick: () => {
                      tt.game.modAction('su_do', 'tuyen_do', {});
                      tt.ui.toast('Đã mở kỳ tuyển đồ! 3 ứng viên đang chờ bên dưới.');
                    },
                  });
                  btnChieuMo.classList.add('su-do-btn-wrap');
                  rowTuyen.append(btnChieuMo);
                  box.append(rowTuyen);

                  // Danh sách ứng viên đang chờ nếu có
                  if (ungVien.length > 0) {
                    const uvBox = document.createElement('div');
                    uvBox.style.cssText = 'background: rgba(218, 165, 32, 0.08); border: 1px dashed var(--vang-kim); border-radius: 6px; padding: 8px; margin-bottom: 8px; display: flex; flex-direction: column; gap: 6px;';

                    const uvHeader = document.createElement('div');
                    uvHeader.style.cssText = 'font-size: 13px; font-weight: 600; color: var(--vang-kim);';
                    uvHeader.innerHTML = `⚡ Ứng viên đang chờ bái sư (${ungVien.length}):`;
                    uvBox.append(uvHeader);

                    ungVien.forEach((uv, idx) => {
                      const itemCard = document.createElement('div');
                      itemCard.style.cssText = 'background: var(--nen-hud); border: 1px solid var(--vien-hud); border-radius: 6px; padding: 6px 8px; display: flex; justify-content: space-between; align-items: center; gap: 6px;';

                      const colLeft = document.createElement('div');
                      colLeft.style.cssText = 'display: flex; flex-direction: column; gap: 2px; font-size: 12px;';

                      const tc = TU_CHAT_MAP[uv.tuChat] ?? { ten: uv.tuChat, color: 'inherit', bg: 'transparent' };
                      const heStr = uv.he.map((h) => HE_MAP[h] ?? h).join(' · ');

                      colLeft.innerHTML = `
                        <div style="font-size: 13px;"><b>${uv.ten}</b> <span class="hud-phu">(${uv.gioiTinh === 'nam' ? 'Nam' : 'Nữ'}, ${uv.tuoi} tuổi)</span></div>
                        <div style="display:flex; gap:6px; align-items:center; margin-top:2px;">
                          <span>Hệ: <b>${heStr}</b></span>
                          <span class="su-do-badge" style="color:${tc.color}; background:${tc.bg}; border:1px solid ${tc.color};">${tc.ten}</span>
                        </div>
                      `;
                      itemCard.append(colLeft);

                      const btnNhan = kit.button({
                        text: 'Thu nhận',
                        kind: 'nho',
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
                      btnNhan.style.cssText += 'padding: 4px 10px; font-weight: bold;';
                      itemCard.append(btnNhan);

                      uvBox.append(itemCard);
                    });
                    box.append(uvBox);
                  }

                  // Danh sách đệ tử chính thức
                  if (danhSach.length === 0) {
                    box.append(
                      kit.empty({
                        text: 'Đạo tràng chưa có đệ tử nào',
                        hint: 'Hãy bấm nút "Chiêu Mộ Đồ Đệ" ở trên để tìm kiếm kỳ tài tu tiên!',
                      })
                    );
                  } else {
                    danhSach.forEach((dt) => {
                      box.append(taoTheDeTuChiTiet(dt, tt, kit));
                    });
                  }
                },
              },

              // TAB 2: SƯ MÔN NHẬT KÝ
              {
                id: 'tab_su_mon',
                title: 'Nhật Ký',
                mount(box) {
                  box.className = 'su-do-no-scroll';
                  box.style.cssText = 'display: flex; flex-direction: column; gap: 8px; margin-top: 6px;';

                  const nhatKy = data.nhatKy ?? [];
                  if (nhatKy.length === 0) {
                    box.append(kit.empty({ text: 'Chưa có sự kiện sư môn nào được ghi lại' }));
                  } else {
                    const logList = document.createElement('div');
                    logList.className = 'su-do-no-scroll';
                    logList.style.cssText = 'max-height: 340px; overflow-y: auto; display: flex; flex-direction: column; gap: 4px;';
                    nhatKy.forEach((nk) => {
                      const item = document.createElement('div');
                      item.style.cssText = 'font-size: 12px; padding: 4px 6px; border-bottom: 1px solid var(--vien-trong);';
                      item.innerHTML = `<span class="hud-phu">[Năm ${nk.nam}]</span> ${nk.text}`;
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
                  box.className = 'su-do-no-scroll';
                  box.style.cssText = 'display: flex; flex-direction: column; gap: 8px; margin-top: 6px;';

                  const dangLichLuyen = danhSach.filter((d) => d.trangThai?.loai === 'lich_luyen');
                  const ranhRoi = danhSach.filter((d) => d.trangThai?.loai === 'nha_roi');

                  box.append(kit.section({ title: `Đang lịch luyện (${dangLichLuyen.length})` }));
                  if (dangLichLuyen.length === 0) {
                    box.append(kit.empty({ text: 'Hiện không có đệ tử nào đang đi lịch luyện' }));
                  } else {
                    dangLichLuyen.forEach((dt) => {
                      const row = document.createElement('div');
                      row.style.cssText = 'border: 1px solid var(--vien-hud); background: var(--nen-hud); border-radius: 6px; padding: 6px 10px; display: flex; justify-content: space-between; align-items: center;';

                      const info = document.createElement('div');
                      info.style.cssText = 'font-size: 12px;';
                      const conLai = dt.trangThai?.namConLai ?? 0;
                      info.innerHTML = `<b>${dt.ten}</b> - Nhiệm vụ: <i>${dt.trangThai?.nhiemVu}</i><br><span class="hud-phu">${conLai > 0 ? `Còn ${conLai} năm nữa trở về` : '✅ Đã hoàn thành, chờ thu nhận!'}</span>`;
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
                        row.append(btnThu);
                      }
                      box.append(row);
                    });
                  }

                  box.append(kit.section({ title: `Đệ tử rảnh rỗi (${ranhRoi.length})` }));
                  if (ranhRoi.length > 0) {
                    ranhRoi.forEach((dt) => {
                      const row = document.createElement('div');
                      row.style.cssText = 'border: 1px solid var(--vien-hud); background: var(--nen-hud); border-radius: 6px; padding: 6px 10px; display: flex; justify-content: space-between; align-items: center; margin: 4px 0; font-size: 13px;';
                      row.innerHTML = `<span><b>${dt.ten}</b> <span class="hud-phu">(${TEN_CANH_GIOI[dt.canhGioi]} tầng ${dt.tieuCanhGioi})</span></span>`;

                      const btnPhai = kit.button({
                        text: 'Phái Đi',
                        kind: 'phu',
                        onClick: async () => {
                          const m = kit.modal({
                            title: `Phái ${dt.ten} Đi Lịch Luyện`,
                            mount(modalBox) {
                              modalBox.style.cssText = 'display: flex; flex-direction: column; gap: 8px;';

                              const msg = document.createElement('div');
                              msg.innerHTML = 'Chọn nhiệm vụ lịch luyện cho đồ đệ:';
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
                                text: 'Xuất Phát',
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
                  box.className = 'su-do-no-scroll';
                  box.style.cssText = 'display: flex; flex-direction: column; gap: 10px; margin-top: 6px; font-size: 13px;';

                  const intro = document.createElement('div');
                  intro.innerHTML = 'Tông môn truyền thừa qua vạn kiếp. Những đệ tử xuất sắc của kiếp trước khi sư phụ tọa hóa sẽ tiếp tục tu hành, kiếp sau có cơ hội tương phùng tái ngộ!';
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
                          value: `${TEN_CANH_GIOI[td.canhGioi] ?? 'Trúc Cơ'} · Tư chất: ${tc}`,
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
    // 7. CÁC HÀM TẠO CARD / GIAO DIỆN CON
    // ==========================================

    function taoTheDeTuNho(dt, tt, kit) {
      const card = document.createElement('div');
      card.style.cssText = 'border: 1px solid var(--vien-hud); background: var(--nen-hud); border-radius: 6px; padding: 6px 8px; display: flex; flex-direction: column; gap: 4px;';

      const rowTop = document.createElement('div');
      rowTop.style.cssText = 'display: flex; justify-content: space-between; align-items: center; font-size: 13px;';

      const tenSpan = document.createElement('span');
      tenSpan.innerHTML = `<b>${dt.ten}</b> ${dt.vaiVe === 'dai_su_huynh' ? '<span style="color:var(--vang-kim); font-size:11px;">[Đại Sư Huynh]</span>' : ''}`;
      rowTop.append(tenSpan);

      const cgSpan = document.createElement('span');
      cgSpan.className = 'hud-phu';
      cgSpan.textContent = `${TEN_CANH_GIOI[dt.canhGioi]} tầng ${dt.tieuCanhGioi}`;
      rowTop.append(cgSpan);
      card.append(rowTop);

      // Thanh tu vi progress
      const pct = Math.min(100, Math.floor((dt.tuVi / dt.tuViYeuCau) * 100));
      if (kit.progress) {
        card.append(kit.progress({ value: dt.tuVi, max: dt.tuViYeuCau }));
      } else {
        const bar = document.createElement('div');
        bar.style.cssText = 'height: 4px; background: rgba(0,0,0,0.1); border-radius: 2px; overflow: hidden; margin: 2px 0;';
        bar.innerHTML = `<div style="height:100%; width:${pct}%; background:var(--chu-do);"></div>`;
        card.append(bar);
      }

      return card;
    }

    function taoTheDeTuChiTiet(dt, tt, kit) {
      const card = document.createElement('div');
      card.style.cssText = 'border: 1px solid var(--vien-hud); background: var(--nen-hud); border-radius: 6px; padding: 8px 10px; display: flex; flex-direction: column; gap: 6px; margin-bottom: 6px;';

      const top = document.createElement('div');
      top.style.cssText = 'display: flex; gap: 10px; align-items: center;';

      // Chân dung NPC thủy mặc bằng npcFace
      const faceUrl = tt.assets?.npcFace?.(dt.id, dt.gioiTinh, dt.tuoi, 'su_phu');
      const avatar = document.createElement('div');
      avatar.style.cssText = 'width: 44px; height: 44px; border-radius: 50%; border: 1px solid var(--vien-muc); overflow: hidden; background: #fff; display: flex; align-items: center; justify-content: center; flex-shrink: 0;';
      if (faceUrl) {
        avatar.innerHTML = `<img src="${faceUrl}" style="width:100%; height:100%; object-fit:cover;" />`;
      } else {
        avatar.innerHTML = `<span style="font-size:18px;">🥋</span>`;
      }
      top.append(avatar);

      // Thông tin cơ bản
      const tc = TU_CHAT_MAP[dt.tuChat] ?? { ten: dt.tuChat, color: 'inherit', bg: 'transparent' };
      const heStr = dt.he.map((h) => HE_MAP[h] ?? h).join(' · ');
      const tcStr = TINH_CACH_MAP[dt.tinhCach] ?? dt.tinhCach;

      const info = document.createElement('div');
      info.style.cssText = 'flex: 1; display: flex; flex-direction: column; gap: 2px; font-size: 12px;';
      info.innerHTML = `
        <div style="font-size:14px; display:flex; gap:6px; align-items:center;">
          <b>${dt.ten}</b>
          ${dt.vaiVe === 'dai_su_huynh' ? '<span style="color:var(--vang-kim); font-size:11px; font-weight:bold;">[Đại Sư Huynh]</span>' : ''}
          <span class="hud-phu">(${dt.gioiTinh === 'nam' ? 'Nam' : 'Nữ'}, ${dt.tuoi}t)</span>
        </div>
        <div style="display:flex; gap:6px; align-items:center; margin-top:2px;">
          <span>${TEN_CANH_GIOI[dt.canhGioi]} tầng ${dt.tieuCanhGioi}</span> · 
          <span>${heStr}</span>
          <span class="su-do-badge" style="color:${tc.color}; background:${tc.bg}; border:1px solid ${tc.color};">${tc.ten}</span>
        </div>
        <div class="hud-phu">Tính cách: <i>${tcStr}</i> | Hiếu cảm: <b>${dt.haoCam}</b> | Đố kỵ: <b style="color:${dt.doKy > 50 ? 'var(--cam-do)' : 'inherit'}">${dt.doKy}</b></div>
      `;
      top.append(info);
      card.append(top);

      // Thanh tu vi
      const pct = Math.min(100, Math.floor((dt.tuVi / dt.tuViYeuCau) * 100));
      const progBox = document.createElement('div');
      progBox.style.cssText = 'display:flex; align-items:center; gap:8px; font-size:11px;';
      progBox.innerHTML = `<span>Tu vi: ${dt.tuVi}/${dt.tuViYeuCau} (${pct}%)</span>`;
      if (kit.progress) {
        progBox.append(kit.progress({ value: dt.tuVi, max: dt.tuViYeuCau }));
      }
      card.append(progBox);

      // HÀNG NÚT TƯƠNG TÁC
      const btnRow = document.createElement('div');
      btnRow.style.cssText = 'display: flex; flex-wrap: wrap; gap: 4px; margin-top: 4px;';

      // 1. Nút Đàm tâm
      const btnDamTam = kit.button({
        text: '🗣️ Đàm Tâm',
        kind: 'nho',
        onClick: () => {
          const m = kit.modal({
            title: `Vấn Đạo Cùng ${dt.ten}`,
            mount(box) {
              box.style.cssText = 'display: flex; flex-direction: column; gap: 8px; font-size: 13px;';
              const ask = document.createElement('div');
              ask.innerHTML = `Đệ tử ${dt.ten} chắp tay thưa: <i>"Bạch sư tôn, giữa nhân gian hiểm ác, đệ tử tu tiên nên lấy điều gì làm trọng tâm?"</i>`;
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
      btnRow.append(btnDamTam);

      // 2. Nút Truyền công
      const btnTruyenCong = kit.button({
        text: '📖 Truyền Công',
        kind: 'nho',
        onClick: () => {
          try {
            tt.game.modAction('su_do', 'truyen_cong', { deTuId: dt.id });
            tt.ui.toast(`Đã quán đảnh truyền công cho ${dt.ten}!`);
          } catch (e) {
            tt.ui.toast(e.message);
          }
        },
      });
      btnTruyenCong.classList.add('su-do-btn-wrap');
      btnRow.append(btnTruyenCong);

      // 3. Nút Ban thưởng
      const btnBanThuong = kit.button({
        text: '🎁 Ban Thưởng',
        kind: 'nho',
        onClick: () => {
          try {
            tt.game.modAction('su_do', 'ban_thuong', { deTuId: dt.id, soTien: 30 });
            tt.ui.toast(`Đã ban thưởng 30 linh thạch cho ${dt.ten}!`);
          } catch (e) {
            tt.ui.toast(e.message);
          }
        },
      });
      btnBanThuong.classList.add('su-do-btn-wrap');
      btnRow.append(btnBanThuong);

      // 4. Nút Luận bàn đấu pháp
      const btnDauPhap = kit.button({
        text: '⚔️ Luận Bàn',
        kind: 'nho',
        onClick: () => {
          tt.game.modAction('su_do', 'dau_phap', { deTuId: dt.id });
          tt.ui.toast(`Đã luận bàn đấu pháp cùng ${dt.ten}!`);
        },
      });
      btnDauPhap.classList.add('su-do-btn-wrap');
      btnRow.append(btnDauPhap);

      // 5. Nút Hộ pháp độ kiếp nếu đủ tu vi
      if (dt.tuVi >= dt.tuViYeuCau) {
        const btnHoPhap = kit.button({
          text: '⚡ Độ Kiếp',
          kind: 'chinh',
          onClick: () => {
            const m = kit.modal({
              title: `Hộ Pháp Độ Kiếp Cho ${dt.ten}`,
              mount(box) {
                box.style.cssText = 'display: flex; flex-direction: column; gap: 8px; font-size: 13px;';
                const msg = document.createElement('div');
                msg.innerHTML = `Đệ tử đã đạt bình cảnh, lôi kiếp sắp giáng xuống! Sư tôn lựa chọn cách hộ pháp nào?`;
                box.append(msg);

                box.append(
                  kit.button({
                    text: '⚡ Gánh lôi kiếp (100% thành công, tổn hao khí huyết)',
                    kind: 'chinh',
                    onClick: () => {
                      tt.game.modAction('su_do', 'ho_phap', { deTuId: dt.id, cach: 'ganh_loi_kiep' });
                      m.close();
                      tt.ui.toast('Đã gánh lôi kiếp hộ đồ đệ thành công!');
                    },
                  })
                );

                box.append(
                  kit.button({
                    text: '💊 Ban Hộ Mạch Đan (85% thành công, 50 linh thạch)',
                    kind: 'phu',
                    onClick: () => {
                      try {
                        tt.game.modAction('su_do', 'ho_phap', { deTuId: dt.id, cach: 'ban_dan' });
                        m.close();
                        tt.ui.toast('Đã ban đan dược hộ pháp!');
                      } catch (e) {
                        tt.ui.toast(e.message);
                      }
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
          },
        });
        btnHoPhap.classList.add('su-do-btn-wrap');
        btnRow.append(btnHoPhap);
      }

      // 6. Nút Bổ nhiệm Đại Sư Huynh
      if (dt.vaiVe !== 'dai_su_huynh') {
        const btnBoNhiem = kit.button({
          text: '👑 Đại Sư Huynh',
          kind: 'nho',
          onClick: () => {
            tt.game.modAction('su_do', 'bo_nhiem', { deTuId: dt.id });
            tt.ui.toast(`Đã sắc phong ${dt.ten} làm Đại Sư Huynh!`);
          },
        });
        btnBoNhiem.classList.add('su-do-btn-wrap');
        btnRow.append(btnBoNhiem);
      }

      // 7. Nút Trục xuất
      const btnTrucXuat = kit.button({
        text: '❌ Trục Xuất',
        kind: 'nho',
        onClick: async () => {
          const ok = await tt.ui.confirm({
            title: 'Trục Xuất Đệ Tử',
            text: `Sư tôn có chắc chắn muốn trục xuất ${dt.ten} khỏi môn phái? Đoạn tuyệt duyên phận sư đồ không thể vãn hồi!`,
          });
          if (ok) {
            tt.game.modAction('su_do', 'truc_xuat', { deTuId: dt.id });
            tt.ui.toast(`Đã trục xuất ${dt.ten}!`);
          }
        },
      });
      btnTrucXuat.classList.add('su-do-btn-wrap');
      btnRow.append(btnTrucXuat);

      card.append(btnRow);
      return card;
    }
  },
});
