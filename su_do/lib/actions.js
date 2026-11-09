/**
 * Mod Sư Đồ Truyền Thừa (su_do) - Mod Actions Registration
 */

import {
  CANH_GIOI_TEN,
  TIEU_CANH_GIOI_TEN,
  HE_MAP,
  NGU_HANH_KHAC,
  TU_CHAT_MAP,
  TU_LINH_TRAN_CONFIG,
  DUOC_DIEN_CONFIG,
  LUYEN_DAN_CONFIG,
  HO_TONG_CONFIG,
  NHIEM_VU_LICH_LUYEN,
} from "./constants.js";

import {
  layTrangThaiMod,
  ghiNhatKy,
  taoDeTuNgauNhien,
  dongBoNpcDeTu,
  dongBoTienDoLichLuyen,
  tuViYeuCauChoCanhGioi,
  sucChuaDeTu,
  dinhDangCanhGioi,
} from "./utils.js";

export function dangKyModActions(tt, mod) {
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
        dongBoNpcDeTu(ctx, deTuMoi, data);
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
        if (dt.trangThai?.loai === 'lich_luyen' || dt.trangThai?.loai === 'ma_hoa') return 'khong_tick';

        const huong = args?.huong ?? 'chinh_dao';
        dt.khuynhHuong = huong;
        dt.haoCam = Math.min(100, (Number(dt.haoCam) || 0) + 15);
        dt.doKy = Math.max(0, (Number(dt.doKy) || 0) - 10);
        const req = Math.max(1, Number(dt.tuViYeuCau) || 1);
        dt.tuVi = Math.min(req, (Number(dt.tuVi) || 0) + 5);

        const loiGiai = huong === 'chinh_dao'
          ? 'lấy trừ ma vệ đạo, thủ hộ sinh linh làm gốc'
          : huong === 'tieu_dao'
          ? 'thuận theo tự nhiên, tiêu dao tự tại giữa đất trời'
          : 'nghịch thiên cải mệnh, kẻ mạnh vi tôn';

        dongBoNpcDeTu(ctx, dt, data);
        ghiNhatKy(data, `Sư tôn đàm đạo cùng ${dt.ten}, chỉ dạy đạo lý "${loiGiai}". Đạo tâm đệ tử đại chấn! Hảo cảm tăng tiến.`, ctx.run?.nam ?? 1);
        h.setData(data);
        return 'khong_tick';
      });

      // Action: Truyền công quán đảnh
      mod.addAction('truyen_cong', (ctx, args, h) => {
        const data = layTrangThaiMod(h);
        const dt = data.danhSachDeTu.find((d) => d.id === args?.deTuId);
        if (!dt) return 'khong_tick';
        if (dt.trangThai?.loai === 'lich_luyen' || dt.trangThai?.loai === 'ma_hoa') return 'khong_tick';

        const req = Math.max(1, Number(dt.tuViYeuCau) || 1);
        const cur = Math.max(0, Number(dt.tuVi) || 0);
        if (cur >= req) return 'khong_tick';

        const nv = ctx.run?.nhanVat;
        if (!nv || (Number(nv.tuVi) || 0) < 0.5) return 'khong_tick';

        nv.tuVi = Math.max(0, (Number(nv.tuVi) || 0) - 0.5);
        const tang = 15;
        dt.tuVi = Math.min(req, cur + tang);
        dt.haoCam = Math.min(100, (Number(dt.haoCam) || 0) + 15);

        // Đệ tử đồng môn tăng đố kỵ
        data.danhSachDeTu.forEach((d) => {
          if (d.id !== dt.id) {
            d.doKy = Math.min(100, (Number(d.doKy) || 0) + 5);
          }
        });

        dongBoNpcDeTu(ctx, dt, data);
        ghiNhatKy(data, `Sư tôn quán đảnh truyền công cho ${dt.ten}, tiêu hao 0.5 chân nguyên, tăng ${tang} tu vi.`, ctx.run?.nam ?? 1);
        h.setData(data);
        return 'khong_tick';
      });

      // Action: Ban thưởng linh thạch
      mod.addAction('ban_thuong', (ctx, args, h) => {
        const data = layTrangThaiMod(h);
        const dt = data.danhSachDeTu.find((d) => d.id === args?.deTuId);
        if (!dt) return 'khong_tick';
        if (dt.trangThai?.loai === 'lich_luyen' || dt.trangThai?.loai === 'ma_hoa') return 'khong_tick';

        const nv = ctx.run?.nhanVat;
        const soTien = Math.max(10, Number(args?.soTien) || 30);
        if (!nv || (Number(nv.linhThach) || 0) < soTien) return 'khong_tick';

        nv.linhThach = Math.max(0, (Number(nv.linhThach) || 0) - soTien);
        dt.haoCam = Math.min(100, (Number(dt.haoCam) || 0) + 12);
        dt.doKy = Math.max(0, (Number(dt.doKy) || 0) - 20);

        data.danhSachDeTu.forEach((other) => {
          if (other.id !== dt.id) {
            other.doKy = Math.min(100, (Number(other.doKy) || 0) + 4);
          }
        });

        dongBoNpcDeTu(ctx, dt, data);
        ghiNhatKy(data, `Sư tôn ban thưởng ${soTien} linh thạch cho đồ đệ ${dt.ten}.`, ctx.run?.nam ?? 1);
        h.setData(data);
        return 'khong_tick';
      });

      // Action: Luận bàn đấu pháp
      mod.addAction('dau_phap', (ctx, args, h) => {
        const data = layTrangThaiMod(h);
        const dt = data.danhSachDeTu.find((d) => d.id === args?.deTuId);
        if (!dt) return 'khong_tick';
        if (dt.trangThai?.loai === 'lich_luyen' || dt.trangThai?.loai === 'ma_hoa') return 'khong_tick';

        const req = Math.max(1, Number(dt.tuViYeuCau) || 1);
        const cur = Math.max(0, Number(dt.tuVi) || 0);
        const tang = Math.max(8, Math.round(req * 0.1));
        dt.tuVi = Math.min(req, cur + tang);
        dt.haoCam = Math.min(100, (Number(dt.haoCam) || 0) + 5);

        dongBoNpcDeTu(ctx, dt, data);
        ghiNhatKy(data, `Sư tôn hạ mình luận bàn đấu pháp cùng ${dt.ten}, chỉ điểm kiếm quyết, tăng ${tang} tu vi.`, ctx.run?.nam ?? 1);
        h.setData(data);
        return 'khong_tick';
      });

      // Action: Hộ pháp đột phá / Độ kiếp
      mod.addAction('ho_phap', (ctx, args, h) => {
        const data = layTrangThaiMod(h);
        const dt = data.danhSachDeTu.find((d) => d.id === args?.deTuId);
        if (!dt) return 'khong_tick';
        if (dt.trangThai?.loai === 'lich_luyen' || dt.trangThai?.loai === 'ma_hoa') return 'khong_tick';

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

        dongBoNpcDeTu(ctx, dt, data);
        h.setData(data);
        return 'khong_tick';
      });

      // Action: Sắc phong Đại Sư Huynh / Tỷ
      mod.addAction('bo_nhiem', (ctx, args, h) => {
        const data = layTrangThaiMod(h);
        const dt = data.danhSachDeTu.find((d) => d.id === args?.deTuId);
        if (!dt || dt.trangThai?.loai === 'ma_hoa') return 'khong_tick';

        data.danhSachDeTu.forEach((d) => {
          if (d.vaiVe === 'dai_su_huynh') d.vaiVe = 'de_tu';
        });

        dt.vaiVe = 'dai_su_huynh';
        dt.haoCam = Math.min(100, (Number(dt.haoCam) || 0) + 25);
        dt.doKy = 0;

        const danhXung = dt.gioiTinh === 'nu' ? 'Đại Sư Tỷ' : 'Đại Sư Huynh';
        data.danhSachDeTu.forEach((d) => dongBoNpcDeTu(ctx, d, data));
        ghiNhatKy(data, `Sư tôn sắc phong ${dt.ten} làm ${danhXung} đứng đầu môn phái, thống lĩnh các đồng môn!`, ctx.run?.nam ?? 1);
        h.setData(data);
        return 'khong_tick';
      });

      // Action: Phái đi lịch luyện
      mod.addAction('phai_lich_luyen', (ctx, args, h) => {
        const data = layTrangThaiMod(h);
        const dt = data.danhSachDeTu.find((d) => d.id === args?.deTuId);
        if (!dt) return 'khong_tick';
        if (dt.trangThai?.loai === 'lich_luyen' || dt.trangThai?.loai === 'ma_hoa') return 'khong_tick';

        // Tự động gỡ bỏ khỏi chức vụ tại đạo tràng nếu đang đảm nhiệm
        if (data.daoTrang.kienThiet.duocDien?.duocDongId === dt.id) data.daoTrang.kienThiet.duocDien.duocDongId = null;
        if (data.daoTrang.kienThiet.luyenDanPhong?.danDongId === dt.id) data.daoTrang.kienThiet.luyenDanPhong.danDongId = null;
        if (data.daoTrang.kienThiet.hoTongDaiTran?.tranDongId === dt.id) data.daoTrang.kienThiet.hoTongDaiTran.tranDongId = null;
        if (ctx?.run?.npc?.[args?.deTuId]) { ctx.run.npc[args.deTuId].theLuc = undefined; ctx.run.npc[args.deTuId].danhPhan = "quen_biet"; }

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

        // Pháp bảo gia trì thêm linh thạch khi thu hoạch
        if (dt.phapBao && thuong.linhThach) {
          thuong.linhThach = Math.round(thuong.linhThach * 1.25);
        }

        const nv = ctx.run?.nhanVat ?? {};
        if (thuong.linhThach) {
          nv.linhThach = (Number(nv.linhThach) || 0) + thuong.linhThach;
        }
        if (thuong.vatPham && window.tuTien?.core?.['character/tui_do']) {
          window.tuTien.core['character/tui_do'].nhanVaoTui(ctx, thuong.vatPham, thuong.soLuong || 1);
        }

        const tuViThuong = 15;
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

        const baoGiaTri = dt.phapBao ? ` (Pháp bảo ${dt.phapBao.ten} hộ thể +25% thu hoạch)` : '';
        dongBoNpcDeTu(ctx, dt, data);
        ghiNhatKy(data, `Đệ tử ${dt.ten} hoàn thành lịch luyện xuất sơn trở về, ${thuong.moTa}${baoGiaTri}, tăng ${tuViThuong} tu vi!`, ctx.run?.nam ?? 1);
        h.setData(data);
        return 'khong_tick';
      });

      // Action: Trục xuất đồ đệ
      mod.addAction('truc_xuat', (ctx, args, h) => {
        const data = layTrangThaiMod(h);
        const idx = data.danhSachDeTu.findIndex((d) => d.id === args?.deTuId);
        if (idx < 0) return 'khong_tick';

        const dt = data.danhSachDeTu.splice(idx, 1)[0];
        // Gỡ bỏ khỏi chức nghiệp đạo tràng
        if (data.daoTrang.kienThiet.duocDien?.duocDongId === dt.id) data.daoTrang.kienThiet.duocDien.duocDongId = null;
        if (data.daoTrang.kienThiet.luyenDanPhong?.danDongId === dt.id) data.daoTrang.kienThiet.luyenDanPhong.danDongId = null;
        if (data.daoTrang.kienThiet.hoTongDaiTran?.tranDongId === dt.id) data.daoTrang.kienThiet.hoTongDaiTran.tranDongId = null;

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
        } else if (loai === 'hoTongDaiTran') {
          configList = HO_TONG_CONFIG;
          if (!data.daoTrang.kienThiet.hoTongDaiTran) {
            data.daoTrang.kienThiet.hoTongDaiTran = { cap: 0, tranDongId: null };
          }
          obj = data.daoTrang.kienThiet.hoTongDaiTran;
          tenKienTruc = 'Hộ Tông Đại Trận';
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

      // Action: Phân công đệ tử coi sóc Dược Điền / Đan Các / Hộ Tông Trận
      mod.addAction('phan_cong_chuc_nghiep', (ctx, args, h) => {
        const data = layTrangThaiMod(h);
        const loai = args?.loai; // 'duocDien' | 'luyenDanPhong' | 'hoTongDaiTran'
        const deTuId = args?.deTuId;

        let dt = null;
        if (deTuId) {
          dt = data.danhSachDeTu.find((d) => d.id === deTuId);
          if (!dt || dt.trangThai?.loai === 'lich_luyen' || dt.trangThai?.loai === 'ma_hoa') {
            return 'khong_tick';
          }
        }

        const ten = dt ? dt.ten : 'Không ai';
        if (loai === 'duocDien') {
          data.daoTrang.kienThiet.duocDien.duocDongId = deTuId || null;
          ghiNhatKy(data, `Bổ nhiệm ${ten} làm Dược Đồng coi sóc Dược Điền tông môn.`, ctx.run?.nam ?? 1);
        } else if (loai === 'luyenDanPhong') {
          data.daoTrang.kienThiet.luyenDanPhong.danDongId = deTuId || null;
          ghiNhatKy(data, `Bổ nhiệm ${ten} làm Đan Đồng chấp chưởng lò luyện đan.`, ctx.run?.nam ?? 1);
        } else if (loai === 'hoTongDaiTran') {
          if (!data.daoTrang.kienThiet.hoTongDaiTran) {
            data.daoTrang.kienThiet.hoTongDaiTran = { cap: 0, tranDongId: null };
          }
          data.daoTrang.kienThiet.hoTongDaiTran.tranDongId = deTuId || null;
          ghiNhatKy(data, `Bổ nhiệm ${ten} làm Trận Đồng trấn thủ Hộ Tông Đại Trận.`, ctx.run?.nam ?? 1);
        }

        h.setData(data);
        return 'khong_tick';
      });

      // Action: Truyền thụ công pháp từ túi đồ
      mod.addAction('truyen_cong_phap', (ctx, args, h) => {
        const data = layTrangThaiMod(h);
        const dt = data.danhSachDeTu.find((d) => d.id === args?.deTuId);
        if (!dt || dt.trangThai?.loai === 'lich_luyen' || dt.trangThai?.loai === 'ma_hoa') return 'khong_tick';

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
          'item.su_do_chan_truyen_ngoc_gian': 'Chân Truyền Ngọc Giản',
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
        if (!dt || dt.trangThai?.loai === 'lich_luyen' || dt.trangThai?.loai === 'ma_hoa') return 'khong_tick';

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
          'item.su_do_ho_tong_tran_ban': 'Trận Bàn Hộ Tông',
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
        if (!dt || dt.trangThai?.loai === 'lich_luyen' || dt.trangThai?.loai === 'ma_hoa') return 'khong_tick';

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
        if (dtA.trangThai?.loai === 'lich_luyen' || dtB.trangThai?.loai === 'lich_luyen' || dtA.trangThai?.loai === 'ma_hoa' || dtB.trangThai?.loai === 'ma_hoa') return 'khong_tick';

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
        // Gỡ bỏ khỏi chức nghiệp đạo tràng
        if (data.daoTrang.kienThiet.duocDien?.duocDongId === dt.id) data.daoTrang.kienThiet.duocDien.duocDongId = null;
        if (data.daoTrang.kienThiet.luyenDanPhong?.danDongId === dt.id) data.daoTrang.kienThiet.luyenDanPhong.danDongId = null;
        if (data.daoTrang.kienThiet.hoTongDaiTran?.tranDongId === dt.id) data.daoTrang.kienThiet.hoTongDaiTran.tranDongId = null;

        if (dt.vaiVe === 'dai_su_huynh' && data.danhSachDeTu.length > 0) {
          data.danhSachDeTu[0].vaiVe = 'dai_su_huynh';
          const danhXung = data.danhSachDeTu[0].gioiTinh === 'nu' ? 'Đại Sư Tỷ' : 'Đại Sư Huynh';
          ghiNhatKy(data, `Vị trí thủ tịch trống, tự động chuyển giao danh hiệu ${danhXung} cho ${data.danhSachDeTu[0].ten}.`, ctx.run?.nam ?? 1);
        }

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
        // Gỡ bỏ khỏi chức nghiệp đạo tràng
        if (data.daoTrang.kienThiet.duocDien?.duocDongId === dt.id) data.daoTrang.kienThiet.duocDien.duocDongId = null;
        if (data.daoTrang.kienThiet.luyenDanPhong?.danDongId === dt.id) data.daoTrang.kienThiet.luyenDanPhong.danDongId = null;
        if (data.daoTrang.kienThiet.hoTongDaiTran?.tranDongId === dt.id) data.daoTrang.kienThiet.hoTongDaiTran.tranDongId = null;

        if (dt.vaiVe === 'dai_su_huynh' && data.danhSachDeTu.length > 0) {
          data.danhSachDeTu[0].vaiVe = 'dai_su_huynh';
          const danhXung = data.danhSachDeTu[0].gioiTinh === 'nu' ? 'Đại Sư Tỷ' : 'Đại Sư Huynh';
          ghiNhatKy(data, `Vị trí thủ tịch trống, tự động chuyển giao danh hiệu ${danhXung} cho ${data.danhSachDeTu[0].ten}.`, ctx.run?.nam ?? 1);
        }

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
}
