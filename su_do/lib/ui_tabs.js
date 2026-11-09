// lib/ui_tabs.js
// Các tab chức năng: Kiến Thiết, Luận Kiếm, Lịch Luyện, Nhật Ký & Tiền Duyên

import {
  TU_LINH_TRAN_CONFIG,
  DUOC_DIEN_CONFIG,
  LUYEN_DAN_CONFIG,
  HO_TONG_CONFIG,
  NHIEM_VU_LICH_LUYEN,
} from "./constants.js";

import {
  dinhDangCanhGioi,
  dinhDangHe,
  dinhDangThoiGianNam,
  dongBoTienDoLichLuyen,
} from "./utils.js";

// ==========================================
// TAB: NHẬT KÝ SƯ MÔN
// ==========================================
export function capNhatNhatKy(nhatKy, box) {
  if (!nhatKy || nhatKy.length === 0) {
    box.innerHTML = `<div style="text-align: center; color: var(--muc-nhat); font-size: 12px; padding: 16px;">Chưa có biến cố sư môn nào được ghi lại.</div>`;
    return;
  }

  box.innerHTML = "";
  const list = document.createElement("div");
  list.style.cssText = "display: flex; flex-direction: column; gap: 6px;";

  nhatKy.slice(0, 35).forEach((entry) => {
    const item = document.createElement("div");
    item.style.cssText =
      "display: flex; gap: 6px; font-size: 11.5px; line-height: 1.4; border-bottom: 1px dashed var(--vien-trong); padding-bottom: 4px;";
    item.innerHTML = `
      <span class="hud-phu" style="flex-shrink: 0; font-size: 11px; white-space: nowrap;">[${dinhDangThoiGianNam(entry.nam)}]</span>
      <span style="flex: 1 1 auto;">${entry.text}</span>
    `;
    list.append(item);
  });

  box.append(list);
}

// ==========================================
// TAB: LỊCH LUYỆN
// ==========================================
export function capNhatLichLuyen(deTuList, box, namHienTai = 1, tt, kit) {
  box.innerHTML = "";
  deTuList.forEach((dt) => dongBoTienDoLichLuyen(dt, namHienTai));

  const dtDangLichLuyen = deTuList.filter(
    (d) => d.trangThai?.loai === "lich_luyen",
  );
  const dtRanhRoi = deTuList.filter((d) => d.trangThai?.loai !== "lich_luyen");

  // Khối 1: Đệ tử đang lịch luyện
  const dangDiBox = document.createElement("div");
  dangDiBox.className = "su-do-header";
  dangDiBox.style.cssText += "padding: 8px 10px; gap: 6px;";
  dangDiBox.innerHTML = `<b style="color: var(--chu-do); font-size: 12.5px; white-space: nowrap;">🏰 Đệ Tử Đang Lịch Luyện (${dtDangLichLuyen.length})</b>`;

  if (dtDangLichLuyen.length === 0) {
    const empty = document.createElement("div");
    empty.className = "hud-phu";
    empty.style.cssText =
      "font-size: 11.5px; text-align: center; padding: 6px 0;";
    empty.textContent = "Hiện không có đồ đệ nào đang xuất sơn.";
    dangDiBox.append(empty);
  } else {
    dtDangLichLuyen.forEach((dt) => {
      const row = document.createElement("div");
      row.className = "su-do-card";
      row.style.cssText = "padding: 6px 8px; gap: 4px;";

      const nv =
        NHIEM_VU_LICH_LUYEN[dt.trangThai?.nhiemVu] ??
        NHIEM_VU_LICH_LUYEN.hai_duoc;
      const conLai = Number(dt.trangThai?.namConLai) || 0;
      const daXong = conLai <= 0;

      row.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; font-size: 12px; white-space: nowrap;">
          <span style="font-weight: bold;">${dt.ten}</span>
          <span class="su-do-badge" style="color:${daXong ? "#10b981" : "#f59e0b"}; background:${daXong ? "rgba(16,185,129,0.1)" : "rgba(245,158,11,0.1)"}; border:1px solid ${daXong ? "#10b981" : "#f59e0b"}; font-size:9.5px; padding:0 4px; white-space:nowrap;">
            ${daXong ? "Đã Hoàn Thành" : `Còn ${conLai} năm`}
          </span>
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 11px; color: var(--muc-nhat); white-space: nowrap;">
          <span>Nhiệm vụ: ${nv.icon} ${nv.ten}</span>
          <span>${conLai > 0 ? `Về năm: ${Math.floor(dt.trangThai?.namHoanThanh ?? namHienTai)}` : "Đang chờ thu nhận"}</span>
        </div>
      `;

      if (daXong) {
        const btnThuHoach = kit.button({
          text: "🎁 Thu Nhận Thành Quả & Phần Thưởng",
          kind: "chinh",
          onClick: () => {
            tt.game.modAction("su_do", "thu_hoach_lich_luyen", {
              deTuId: dt.id,
            });
            tt.ui.toast(`Đã thu nhận kết quả lịch luyện của ${dt.ten}!`);
          },
        });
        btnThuHoach.classList.add("su-do-btn-wrap");
        btnThuHoach.style.cssText +=
          "margin-top: 4px; padding: 3px 8px; font-size: 11px; width: 100%;";
        row.append(btnThuHoach);
      }

      dangDiBox.append(row);
    });
  }
  box.append(dangDiBox);

  // Khối 2: Phái đệ tử mới xuất sơn
  const phaiDiBox = document.createElement("div");
  phaiDiBox.className = "su-do-card";
  phaiDiBox.style.cssText = "padding: 8px 10px; gap: 6px;";
  phaiDiBox.innerHTML = `<b style="color: var(--vang-kim); font-size: 12.5px; white-space: nowrap;">📜 Phái Đồ Đệ Xuất Sơn Lịch Luyện</b>`;

  if (dtRanhRoi.length === 0) {
    const empty = document.createElement("div");
    empty.className = "hud-phu";
    empty.style.cssText =
      "font-size: 11.5px; text-align: center; padding: 6px 0;";
    empty.textContent = "Tất cả đệ tử đều đang bận hoặc đang xuất sơn.";
    phaiDiBox.append(empty);
  } else {
    let selectedDtId = dtRanhRoi[0]?.id;
    let selectedNv = "hai_duoc";
    let selectedSoNam = 2;

    const form = document.createElement("div");
    form.style.cssText =
      "display: flex; flex-direction: column; gap: 6px; font-size: 11.5px;";

    // Chọn đệ tử
    const rowDt = document.createElement("div");
    rowDt.style.cssText =
      "display: flex; align-items: center; justify-content: space-between; gap: 6px;";
    rowDt.innerHTML = `<span class="hud-phu" style="white-space: nowrap;">Chọn đệ tử:</span>`;
    const selDt = document.createElement("select");
    selDt.style.cssText =
      "flex: 1 1 auto; padding: 3px 6px; border-radius: 4px; border: 1px solid var(--vien-hud); background: var(--nen-hud); color: var(--muc); font-size: 11.5px;";
    dtRanhRoi.forEach((d) => {
      const opt = document.createElement("option");
      opt.value = d.id;
      opt.textContent = `${d.ten} (${dinhDangCanhGioi(d.canhGioi, d.tieuCanhGioi)})`;
      selDt.append(opt);
    });
    selDt.addEventListener("change", (e) => {
      selectedDtId = e.target.value;
    });
    rowDt.append(selDt);
    form.append(rowDt);

    // Chọn phương hướng
    const rowNv = document.createElement("div");
    rowNv.style.cssText =
      "display: flex; align-items: center; justify-content: space-between; gap: 6px;";
    rowNv.innerHTML = `<span class="hud-phu" style="white-space: nowrap;">Phương hướng:</span>`;
    const selNv = document.createElement("select");
    selNv.style.cssText =
      "flex: 1 1 auto; padding: 3px 6px; border-radius: 4px; border: 1px solid var(--vien-hud); background: var(--nen-hud); color: var(--muc); font-size: 11.5px;";
    Object.keys(NHIEM_VU_LICH_LUYEN).forEach((k) => {
      const n = NHIEM_VU_LICH_LUYEN[k];
      const opt = document.createElement("option");
      opt.value = k;
      opt.textContent = `${n.icon} ${n.ten} (${n.moTa})`;
      selNv.append(opt);
    });
    selNv.addEventListener("change", (e) => {
      selectedNv = e.target.value;
      const defYears = NHIEM_VU_LICH_LUYEN[selectedNv]?.soNamMacDinh ?? 2;
      selNam.value = String(defYears);
      selectedSoNam = defYears;
    });
    rowNv.append(selNv);
    form.append(rowNv);

    // Chọn số năm
    const rowNam = document.createElement("div");
    rowNam.style.cssText =
      "display: flex; align-items: center; justify-content: space-between; gap: 6px;";
    rowNam.innerHTML = `<span class="hud-phu" style="white-space: nowrap;">Thời gian:</span>`;
    const selNam = document.createElement("select");
    selNam.style.cssText =
      "flex: 1 1 auto; padding: 3px 6px; border-radius: 4px; border: 1px solid var(--vien-hud); background: var(--nen-hud); color: var(--muc); font-size: 11.5px;";
    [1, 2, 3, 5].forEach((n) => {
      const opt = document.createElement("option");
      opt.value = String(n);
      opt.textContent = `${n} năm`;
      if (n === 2) opt.selected = true;
      selNam.append(opt);
    });
    selNam.addEventListener("change", (e) => {
      selectedSoNam = Number(e.target.value) || 2;
    });
    rowNam.append(selNam);
    form.append(rowNam);

    const btnPhaiDi = kit.button({
      text: "🚀 Ban Lệnh Xuất Sơn Lịch Luyện",
      kind: "chinh",
      onClick: () => {
        if (!selectedDtId) return;
        tt.game.modAction("su_do", "phai_lich_luyen", {
          deTuId: selectedDtId,
          nhiemVu: selectedNv,
          soNam: selectedSoNam,
        });
        tt.ui.toast("Đã phái đệ tử xuất sơn lịch luyện!");
      },
    });
    btnPhaiDi.classList.add("su-do-btn-wrap");
    btnPhaiDi.style.cssText +=
      "margin-top: 4px; padding: 4px 8px; font-size: 11.5px; font-weight: bold; width: 100%;";
    form.append(btnPhaiDi);
    phaiDiBox.append(form);
  }
  box.append(phaiDiBox);
}

// ==========================================
// TAB: KIẾN THIẾT ĐẠO TRÀNG (TRỤ CỘT 1)
// ==========================================
export function capNhatKienThiet(data, box, s, nv, tt, kit) {
  box.innerHTML = "";
  const bannerKT = document.createElement("div");
  bannerKT.className = "su-do-header";
  bannerKT.style.cssText = "padding: 6px 8px; margin-bottom: 2px;";
  bannerKT.innerHTML = `
    <div style="font-weight: bold; color: var(--chu-do); font-size: 12px;">🛡️ Sư Đồ Đồng Lòng · Động Phủ & Kiếm Trận</div>
    <div style="font-size: 10.5px; color: var(--muc-nhat); line-height: 1.4; margin-top: 2px;">
      Đồ đệ phân công chức sự ngày đêm hộ trì kiếm trận, tương trợ Sư Tôn giảm sát thương khi giao chiến và tăng tỉ lệ độ kiếp.
    </div>
  `;
  box.append(bannerKT);
  const kt = data.daoTrang.kienThiet;
  const curLt = Number(nv?.linhThach) || 0;
  const deTuList = data.danhSachDeTu;

  // 1. Tụ Linh Trận
  const cardTLT = document.createElement("div");
  cardTLT.className = "su-do-kienthiet-card";
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
      kind: curLt >= cfgTLT.phi ? "chinh" : "phu",
      onClick: () => {
        if (curLt < cfgTLT.phi) {
          tt.ui.toast(`Sư tôn không đủ ${cfgTLT.phi} linh thạch!`);
          return;
        }
        tt.game.modAction("su_do", "nang_cap_kien_thiet", {
          loai: "tuLinhTran",
        });
        tt.ui.toast(`Đã nâng cấp Tụ Linh Trận lên ${nextTLT.ten}!`);
      },
    });
    btnUpTLT.style.cssText +=
      "margin-top:2px; font-size:11px; padding:3px 6px;";
    cardTLT.append(btnUpTLT);
  } else {
    const maxLabel = document.createElement("div");
    maxLabel.className = "hud-phu";
    maxLabel.style.cssText = "font-size:11px; color:#10b981; font-weight:bold;";
    maxLabel.textContent = "✨ Trận pháp đã đạt cấp Đỉnh Phong Viên Mãn!";
    cardTLT.append(maxLabel);
  }
  box.append(cardTLT);

  // 2. Dược Điền
  const cardDD = document.createElement("div");
  cardDD.className = "su-do-kienthiet-card";
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
      <b>Dược Đồng:</b> ${duocDong ? duocDong.ten : "Chưa phân công"}
      ${duocDong && (duocDong.he?.includes("moc") || duocDong.he?.includes("thuy") || duocDong.tinhCach === "can_man") ? '<span style="color:#10b981; font-weight:bold;"> (✨ +50% sản lượng)</span>' : ""}
    </div>
  `;

  if (capDD > 0 && deTuList.length > 0) {
    const rowPhanCong = document.createElement("div");
    rowPhanCong.style.cssText =
      "display:flex; align-items:center; gap:6px; margin-top:2px;";
    const selDD = document.createElement("select");
    selDD.style.cssText =
      "flex:1 1 auto; font-size:11px; padding:2px 4px; border:1px solid var(--vien-hud); background:var(--nen-hud); border-radius:4px;";
    const optNone = document.createElement("option");
    optNone.value = "";
    optNone.textContent = "-- Để trống --";
    selDD.append(optNone);
    deTuList.forEach((d) => {
      const opt = document.createElement("option");
      opt.value = d.id;
      opt.textContent = `${d.ten} (${dinhDangHe(d.he)})`;
      if (d.id === kt.duocDien.duocDongId) opt.selected = true;
      selDD.append(opt);
    });
    selDD.addEventListener("change", (e) => {
      tt.game.modAction("su_do", "phan_cong_chuc_nghiep", {
        loai: "duocDien",
        deTuId: e.target.value || null,
      });
      tt.ui.toast("Đã cập nhật Dược Đồng!");
    });
    rowPhanCong.append(selDD);
    cardDD.append(rowPhanCong);
  }

  if (nextDD) {
    const btnUpDD = kit.button({
      text: `Nâng Cấp Dược Điền (${cfgDD.phi} LT)`,
      kind: curLt >= cfgDD.phi ? "chinh" : "phu",
      onClick: () => {
        if (curLt < cfgDD.phi) {
          tt.ui.toast(`Sư tôn không đủ ${cfgDD.phi} linh thạch!`);
          return;
        }
        tt.game.modAction("su_do", "nang_cap_kien_thiet", { loai: "duocDien" });
        tt.ui.toast(`Đã nâng cấp Dược Điền lên ${nextDD.ten}!`);
      },
    });
    btnUpDD.style.cssText += "margin-top:2px; font-size:11px; padding:3px 6px;";
    cardDD.append(btnUpDD);
  }
  box.append(cardDD);

  // 3. Luyện Đan Các
  const cardLDP = document.createElement("div");
  cardLDP.className = "su-do-kienthiet-card";
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
      <b>Đan Đồng:</b> ${danDong ? danDong.ten : "Chưa phân công"}
      ${danDong && (danDong.he?.includes("hoa") || danDong.he?.includes("kim")) ? '<span style="color:#ef4444; font-weight:bold;"> (🔥 +50% tốc độ)</span>' : ""}
    </div>
  `;

  const eligibleDeTu = deTuList.filter(
    (d) => d.trangThai?.loai !== "lich_luyen" && d.trangThai?.loai !== "ma_hoa",
  );

  if (capLDP > 0 && eligibleDeTu.length > 0) {
    const rowPhanCongDan = document.createElement("div");
    rowPhanCongDan.style.cssText =
      "display:flex; align-items:center; gap:6px; margin-top:2px;";
    const selLDP = document.createElement("select");
    selLDP.style.cssText =
      "flex:1 1 auto; font-size:11px; padding:2px 4px; border:1px solid var(--vien-hud); background:var(--nen-hud); border-radius:4px;";
    const optNoneDan = document.createElement("option");
    optNoneDan.value = "";
    optNoneDan.textContent = "-- Để trống --";
    selLDP.append(optNoneDan);
    eligibleDeTu.forEach((d) => {
      const opt = document.createElement("option");
      opt.value = d.id;
      opt.textContent = `${d.ten} (${dinhDangHe(d.he)})`;
      if (d.id === kt.luyenDanPhong.danDongId) opt.selected = true;
      selLDP.append(opt);
    });
    selLDP.addEventListener("change", (e) => {
      tt.game.modAction("su_do", "phan_cong_chuc_nghiep", {
        loai: "luyenDanPhong",
        deTuId: e.target.value || null,
      });
      tt.ui.toast("Đã cập nhật Đan Đồng!");
    });
    rowPhanCongDan.append(selLDP);
    cardLDP.append(rowPhanCongDan);
  }

  if (nextLDP) {
    const btnUpLDP = kit.button({
      text: `Nâng Cấp Lò Đan (${cfgLDP.phi} LT)`,
      kind: curLt >= cfgLDP.phi ? "chinh" : "phu",
      onClick: () => {
        if (curLt < cfgLDP.phi) {
          tt.ui.toast(`Sư tôn không đủ ${cfgLDP.phi} linh thạch!`);
          return;
        }
        tt.game.modAction("su_do", "nang_cap_kien_thiet", {
          loai: "luyenDanPhong",
        });
        tt.ui.toast(`Đã nâng cấp Luyện Đan Các lên ${nextLDP.ten}!`);
      },
    });
    btnUpLDP.style.cssText +=
      "margin-top:2px; font-size:11px; padding:3px 6px;";
    cardLDP.append(btnUpLDP);
  }
  box.append(cardLDP);

  // 4. Hộ Tông Đại Trận
  const cardHT = document.createElement("div");
  cardHT.className = "su-do-kienthiet-card";
  const capHT = Number(kt.hoTongDaiTran?.cap) || 0;
  const cfgHT = HO_TONG_CONFIG[capHT] ?? HO_TONG_CONFIG[0];
  const nextHT = HO_TONG_CONFIG[capHT + 1];
  const tranDong = deTuList.find((d) => d.id === kt.hoTongDaiTran?.tranDongId);

  cardHT.innerHTML = `
    <div class="su-do-kienthiet-header">
      <span class="su-do-kienthiet-title">🛡️ ${cfgHT.ten}</span>
      <span class="su-do-badge" style="color:#8b5cf6; background:rgba(139,92,246,0.12); border:1px solid #8b5cf6; font-size:9.5px; padding:0 4px;">Cấp ${capHT}/4</span>
    </div>
    <div style="font-size:11.5px; line-height:1.4; color:var(--muc-nhat);">${cfgHT.moTa}</div>
    <div style="font-size:11px; margin-top:2px;">
      <b>Trận Đồng:</b> ${tranDong ? tranDong.ten : "Chưa phân công"}
      ${tranDong && (tranDong.he?.includes("tho") || tranDong.he?.includes("kim") || tranDong.tinhCach === "kien_dinh") ? '<span style="color:#8b5cf6; font-weight:bold;"> (🛡️ +3% phòng ngự, hỗ trợ chữa thương)</span>' : ""}
    </div>
  `;

  if (capHT > 0 && eligibleDeTu.length > 0) {
    const rowPhanCongTran = document.createElement("div");
    rowPhanCongTran.style.cssText =
      "display:flex; align-items:center; gap:6px; margin-top:2px;";
    const selHT = document.createElement("select");
    selHT.style.cssText =
      "flex:1 1 auto; font-size:11px; padding:2px 4px; border:1px solid var(--vien-hud); background:var(--nen-hud); border-radius:4px;";
    const optNoneTran = document.createElement("option");
    optNoneTran.value = "";
    optNoneTran.textContent = "-- Để trống --";
    selHT.append(optNoneTran);
    eligibleDeTu.forEach((d) => {
      const opt = document.createElement("option");
      opt.value = d.id;
      opt.textContent = `${d.ten} (${dinhDangHe(d.he)})`;
      if (d.id === kt.hoTongDaiTran?.tranDongId) opt.selected = true;
      selHT.append(opt);
    });
    selHT.addEventListener("change", (e) => {
      tt.game.modAction("su_do", "phan_cong_chuc_nghiep", {
        loai: "hoTongDaiTran",
        deTuId: e.target.value || null,
      });
      tt.ui.toast("Đã cập nhật Trận Đồng!");
    });
    rowPhanCongTran.append(selHT);
    cardHT.append(rowPhanCongTran);
  }

  if (nextHT) {
    const btnUpHT = kit.button({
      text: `Nâng Cấp Hộ Tông Trận (${cfgHT.phi} LT)`,
      kind: curLt >= cfgHT.phi ? "chinh" : "phu",
      onClick: () => {
        if (curLt < cfgHT.phi) {
          tt.ui.toast(`Sư tôn không đủ ${cfgHT.phi} linh thạch!`);
          return;
        }
        tt.game.modAction("su_do", "nang_cap_kien_thiet", {
          loai: "hoTongDaiTran",
        });
        tt.ui.toast(`Đã nâng cấp Hộ Tông Đại Trận lên ${nextHT.ten}!`);
      },
    });
    btnUpHT.style.cssText += "margin-top:2px; font-size:11px; padding:3px 6px;";
    cardHT.append(btnUpHT);
  } else {
    const maxLabel = document.createElement("div");
    maxLabel.className = "hud-phu";
    maxLabel.style.cssText = "font-size:11px; color:#10b981; font-weight:bold;";
    maxLabel.textContent =
      "✨ Hộ Tông Đại Trận đã đạt cấp Đỉnh Phong Viên Mãn!";
    cardHT.append(maxLabel);
  }
  box.append(cardHT);
}

// ==========================================
// TAB: LUẬN KIẾM TÔNG MÔN (TRỤ CỘT 3)
// ==========================================
export function capNhatLuanKiem(data, box, tt, kit) {
  box.innerHTML = "";
  const deTuList = data.danhSachDeTu.filter(
    (d) => d.trangThai?.loai !== "lich_luyen" && d.trangThai?.loai !== "ma_hoa",
  );

  const arenaBox = document.createElement("div");
  arenaBox.className = "su-do-arena-box";
  arenaBox.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center;">
      <b style="color:var(--chu-do); font-size:13px;">⚔️ Võ Đài Luận Kiếm Tông Môn</b>
      <span class="hud-phu" style="font-size:11px;">Tỉ thí cọ xát võ học</span>
    </div>
  `;

  if (deTuList.length < 2) {
    const empty = document.createElement("div");
    empty.className = "hud-phu";
    empty.style.cssText = "text-align:center; padding:16px 0; font-size:12px;";
    empty.textContent =
      "Cần ít nhất 2 đồ đệ rảnh rỗi tại tông môn để tổ chức Luận Kiếm.";
    arenaBox.append(empty);
    box.append(arenaBox);
    return;
  }

  let idA = deTuList[0]?.id;
  let idB = deTuList[1]?.id;

  const vsRow = document.createElement("div");
  vsRow.style.cssText =
    "display:flex; justify-content:space-between; align-items:center; gap:8px;";

  const selA = document.createElement("select");
  selA.style.cssText =
    "flex:1 1 0; min-width:0; font-size:11.5px; padding:3px 4px; border:1px solid var(--vien-hud); background:var(--nen-hud); border-radius:4px;";
  const selB = document.createElement("select");
  selB.style.cssText =
    "flex:1 1 0; min-width:0; font-size:11.5px; padding:3px 4px; border:1px solid var(--vien-hud); background:var(--nen-hud); border-radius:4px;";

  deTuList.forEach((d) => {
    const optA = document.createElement("option");
    optA.value = d.id;
    optA.textContent = `${d.ten}`;
    if (d.id === idA) optA.selected = true;
    selA.append(optA);

    const optB = document.createElement("option");
    optB.value = d.id;
    optB.textContent = `${d.ten}`;
    if (d.id === idB) optB.selected = true;
    selB.append(optB);
  });

  selA.addEventListener("change", (e) => {
    idA = e.target.value;
  });
  selB.addEventListener("change", (e) => {
    idB = e.target.value;
  });

  vsRow.append(selA);
  const vsBadge = document.createElement("b");
  vsBadge.style.cssText = "color:var(--chu-do); font-size:12px;";
  vsBadge.textContent = "VS";
  vsRow.append(vsBadge);
  vsRow.append(selB);
  arenaBox.append(vsRow);

  const btnDau = kit.button({
    text: "⚔️ Khai Mạc Luận Kiếm Tông Môn",
    kind: "chinh",
    onClick: () => {
      if (idA === idB) {
        tt.ui.toast("Không thể chọn cùng một đệ tử để so tài!");
        return;
      }
      tt.game.modAction("su_do", "luan_kiem_noi_mon", {
        deTuIdA: idA,
        deTuIdB: idB,
      });
      tt.ui.toast("Luận Kiếm kết thúc! Đã có chiến báo mới.");
    },
  });
  btnDau.style.cssText +=
    "margin-top:4px; width:100%; font-size:12px; font-weight:bold;";
  arenaBox.append(btnDau);

  // Hiển thị Chiến báo gần nhất nếu có
  const cb = data.daoTrang.chienBaoMoiNhat;
  if (cb) {
    const logBox = document.createElement("div");
    logBox.className = "su-do-combat-log";
    logBox.innerHTML = `
      <div style="display:flex; justify-content:space-between; border-bottom:1px dashed var(--vien-trong); padding-bottom:3px;">
        <b>📜 Chiến Báo So Tài [Năm ${cb.nam}]</b>
        <span style="color:#10b981; font-weight:bold;">🏆 Thắng: ${cb.thangTen}</span>
      </div>
      <div>${cb.hiep1}</div>
      <div>${cb.hiep2}</div>
      <div style="font-weight:bold; color:var(--chu-do);">${cb.chungCuoc}</div>
    `;

    // Sắc phong nhanh đệ tử chiến thắng lên làm Đại Sư Huynh/Tỷ nếu chưa phải
    const currentDaiSuHuynh = data.danhSachDeTu.find(
      (d) => d.vaiVe === "dai_su_huynh",
    );
    if (cb.thang && cb.thang !== currentDaiSuHuynh?.id) {
      const btnPromoteWinner = kit.button({
        text: `👑 Sắc Phong ${cb.thangTen} Làm Thủ Tịch`,
        kind: "phu",
        onClick: () => {
          tt.game.modAction("su_do", "bo_nhiem", { deTuId: cb.thang });
          tt.ui.toast(
            `Đã sắc phong ${cb.thangTen} làm Đại Sư Huynh / Đại Sư Tỷ!`,
          );
        },
      });
      btnPromoteWinner.style.cssText +=
        "margin-top:4px; width:100%; font-size:11px; padding:2px 6px;";
      logBox.append(btnPromoteWinner);
    }

    arenaBox.append(logBox);
  }

  box.append(arenaBox);
}

// ==========================================
// TAB: TIỀN DUYÊN
// ==========================================
export function capNhatTienDuyen(box) {
  box.innerHTML = "";
  const luu = localStorage.getItem("mod:su_do:tien_duyen");
  let deTuCu = [];
  if (luu) {
    try {
      deTuCu = JSON.parse(luu);
    } catch (e) {}
  }

  const info = document.createElement("div");
  info.className = "su-do-header";
  info.innerHTML = `
    <div style="font-size: 13px; font-weight: bold; color: var(--chu-do); white-space: nowrap;">🌸 Tiền Duyên Tương Ngộ</div>
    <div class="hud-phu" style="font-size: 11.5px; line-height: 1.5;">
      Khi sư tôn chuyển sinh luân hồi, đồ đệ kiếp trước sẽ trở thành tán tu hoặc lão quái nơi thế gian.
      Ngươi có cơ hội gặp lại họ qua kỳ ngộ "Tiền duyên chưa dứt" để nhận lại bảo vật năm xưa!
    </div>
  `;
  box.append(info);

  const list = document.createElement("div");
  list.style.cssText = "display: flex; flex-direction: column; gap: 6px;";

  if (deTuCu.length === 0) {
    list.innerHTML = `<div style="text-align: center; color: var(--muc-nhat); font-size: 12px; padding: 12px;">Chưa có đồ đệ nào ở kiếp trước.</div>`;
  } else {
    deTuCu.forEach((d) => {
      const card = document.createElement("div");
      card.className = "su-do-card";
      card.style.cssText =
        "padding: 6px 8px; font-size: 11.5px; white-space: nowrap;";
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
