// lib/hooks.js
// Vòng lặp thế giới (Tick hook) & Bộ điều chỉnh chỉ số (Modifiers)

import {
  TU_LINH_TRAN_CONFIG,
  DUOC_DIEN_CONFIG,
  LUYEN_DAN_CONFIG,
  HO_TONG_CONFIG,
} from './constants.js';

import {
  layTrangThaiMod,
  layModData,
  ghiNhatKy,
  tuViYeuCauChoCanhGioi,
  dongBoTienDoLichLuyen,
} from './utils.js';

export function dangKyHooks(tt, mod) {
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
      const duocDong = data.danhSachDeTu.find((d) => d.id === data.daoTrang.kienThiet.duocDien.duocDongId && d.trangThai?.loai !== 'lich_luyen' && d.trangThai?.loai !== 'ma_hoa');
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
      const danDong = data.danhSachDeTu.find((d) => d.id === data.daoTrang.kienThiet.luyenDanPhong.danDongId && d.trangThai?.loai !== 'lich_luyen' && d.trangThai?.loai !== 'ma_hoa');
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

    // 4. Hộ Tông Đại Trận hỗ trợ phục hồi thương thế cho Sư Tôn
    const capHT = Number(data.daoTrang.kienThiet.hoTongDaiTran?.cap) || 0;
    if (capHT > 0 && nv && (Number(nv.thuongThe) || 0) > 0) {
      const tranDong = data.danhSachDeTu.find((d) => d.id === data.daoTrang.kienThiet.hoTongDaiTran?.tranDongId && d.trangThai?.loai !== 'lich_luyen' && d.trangThai?.loai !== 'ma_hoa');
      const tiLeHoiPhuc = (capHT >= 3 ? 0.45 : 0.25) + (tranDong ? 0.2 : 0);
      if (h.random() < tiLeHoiPhuc) {
        nv.thuongThe = Math.max(0, (Number(nv.thuongThe) || 0) - 1);
        ghiNhatKy(data, `🛡️ Hộ Tông Đại Trận hội tụ địa mạch linh khí, giúp Sư Tôn chữa lành 1 tầng thương thế!`, nam);
      }
    }

    // 5. Duyệt danh sách đệ tử
    data.danhSachDeTu.forEach((dt) => {
      dt.tuoi = (Number(dt.tuoi) || 14) + years;

      const heSoTuChat = { pho_thong: 1.5, kha: 2.5, thien_tai: 4.0, yeu_nghiet: 6.5 }[dt.tuChat] ?? 2.0;
      const heSoTLT = 1 + (cfgTLT.deTuHieuQua || 0);
      const cpBonus = dt.congPhap ? Math.round(years * (dt.congPhap.phamCap || 1) * 1.5) : 0;
      const tuViTang = Math.round(years * heSoTuChat * heSoTLT) + cpBonus;
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
      let deTuBuff = Math.min(0.20, deTuKhoeManh.length * 0.02);
      deTuKhoeManh.forEach((d) => {
        if (d.phapBao) deTuBuff += 0.01;
        if (d.congPhap) deTuBuff += 0.01;
      });
      deTuBuff = Math.min(0.35, deTuBuff);

      const capTLT = Number(data.daoTrang?.kienThiet?.tuLinhTran?.cap) || 0;
      const tltBuff = TU_LINH_TRAN_CONFIG[capTLT]?.satThuong || 0;
      return val * (1 + deTuBuff + tltBuff);
    }

    // Khi Sư Tôn bị tấn công (target === 'ta')
    if (target?.ma === 'ta') {
      let giam = 0;
      const daiSuHuynh = danhSach.find((d) => d.vaiVe === 'dai_su_huynh' && d.trangThai?.loai !== 'lich_luyen' && d.trangThai?.loai !== 'ma_hoa');
      if (daiSuHuynh && (Number(daiSuHuynh.canhGioi) || 1) >= 2) {
        giam += (Number(daiSuHuynh.canhGioi) || 1) >= 3 ? 0.10 : 0.05;
      }

      // Hộ Tông Đại Trận giảm sát thương
      const capHT = Number(data.daoTrang?.kienThiet?.hoTongDaiTran?.cap) || 0;
      const htCfg = HO_TONG_CONFIG[capHT] ?? HO_TONG_CONFIG[0];
      giam += htCfg.giamSatThuong || 0;

      const tranDong = danhSach.find((d) => d.id === data.daoTrang?.kienThiet?.hoTongDaiTran?.tranDongId && d.trangThai?.loai !== 'lich_luyen' && d.trangThai?.loai !== 'ma_hoa');
      if (tranDong && capHT > 0) {
        giam += 0.03;
      }

      giam = Math.min(0.45, giam);
      return val * (1 - giam);
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
    const thienTaiCount = data.danhSachDeTu.filter((d) => d.tuChat === 'thien_tai').length;
    const yeuNghietCount = data.danhSachDeTu.filter((d) => d.tuChat === 'yeu_nghiet').length;
    const bonus = Math.min(0.20, thienTaiCount * 0.03 + yeuNghietCount * 0.06);

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
}
