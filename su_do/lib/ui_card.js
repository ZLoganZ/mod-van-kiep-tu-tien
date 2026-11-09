// lib/ui_card.js
// Thẻ đệ tử, ứng viên tuyển mộ & các modal ban tặng, truyền thụ

import { TU_CHAT_MAP, TINH_CACH_MAP } from "./constants.js";

import {
  dinhDangCanhGioi,
  dinhDangHe,
  layChuKyCauTrucDeTu,
  sucChuaDeTu,
  layModData,
} from "./utils.js";

// ==========================================
// TIỆN ÍCH MODAL BAN TẶNG & TRUYỀN THỤ
// ==========================================
export function moModalBanTang(dt, ttInstance, kitInstance) {
  const s = ttInstance.state();
  const nv = s?.run?.nhanVat ?? {};
  const tuiDo = nv.tuiDo ?? {};
  const ctx = ttInstance.game.readCtx?.() ?? {};
  const itemsMap = ctx.content?.items;

  function layTenVatPham(id, def) {
    if (def?.ten) return def.ten;
    const MAP = {
      "item.su_do_huyen_thien_tam_phap": "Huyền Thiên Tâm Pháp",
      "item.su_do_chan_truyen_phap_bao": "Trấn Môn Thanh Phong Kiếm",
      "item.su_do_ho_menh_ngoc_bai": "Ngọc Bài Hộ Mệnh",
      "item.su_do_ho_mach_dan": "Hộ Mạch Tụ Khí Đan",
      "item.su_do_tuyet_lien_tra": "Tuyết Liên Linh Trà",
      "item.su_do_duoc_dien_linh_thoc": "Thượng Cổ Linh Thảo",
      "item.cot_thu": "Cốt Thủ",
      "item.dan_khi_quyet": "Dẫn Khí Quyết",
      "item.tho_nap_phap": "Thổ Nạp Pháp",
      "item.thau_cot_cham": "Thấu Cốt Châm",
      "item.xich_viem_phu": "Xích Viêm Phù",
      "item.han_bang_phu": "Hàn Băng Phù",
      "item.truc_co_dan": "Trúc Cơ Đan",
    };
    return MAP[id] || id;
  }

  const m = kitInstance.modal({
    title: `🎁 Ban Tặng & Truyền Thụ Cho ${dt.ten}`,
    mount(box) {
      box.style.cssText =
        "display:flex; flex-direction:column; gap:10px; font-size:12.5px; max-height:480px; overflow-y:auto;";

      // 1. Công pháp
      const cpSec = document.createElement("div");
      cpSec.style.cssText =
        "border:1px solid var(--vien-hud); border-radius:6px; padding:8px; display:flex; flex-direction:column; gap:6px;";
      cpSec.innerHTML = `<b style="color:var(--chu-do); font-size:12px;">📖 Truyền Thụ Công Pháp</b>`;

      const cpItems = Object.keys(tuiDo).filter((id) => {
        const def = itemsMap?.get(id);
        const laCp = def
          ? def.loai === "cong_phap"
          : id === "item.su_do_huyen_thien_tam_phap" ||
            id.includes("cong_phap");
        return laCp && (tuiDo[id] || 0) > 0;
      });

      if (cpItems.length === 0) {
        const empty = document.createElement("div");
        empty.className = "hud-phu";
        empty.style.fontSize = "11px";
        empty.textContent = "Trong túi đồ không có công pháp nào.";
        cpSec.append(empty);
      } else {
        cpItems.forEach((id) => {
          const def = itemsMap?.get(id);
          const tenMon = layTenVatPham(id, def);
          const row = document.createElement("div");
          row.style.cssText =
            "display:flex; justify-content:space-between; align-items:center; font-size:11.5px;";
          row.innerHTML = `<span>${tenMon} (x${tuiDo[id]})</span>`;
          const btn = kitInstance.button({
            text: "Truyền Thụ",
            kind: "chinh",
            onClick: () => {
              ttInstance.game.modAction("su_do", "truyen_cong_phap", {
                deTuId: dt.id,
                itemId: id,
              });
              m.close();
              ttInstance.ui.toast(`Đã truyền thụ "${tenMon}" cho ${dt.ten}!`);
            },
          });
          btn.style.cssText += "padding:2px 8px; font-size:11px;";
          row.append(btn);
          cpSec.append(row);
        });
      }
      box.append(cpSec);

      // 2. Pháp bảo / Pháp khí
      const pbSec = document.createElement("div");
      pbSec.style.cssText =
        "border:1px solid var(--vien-hud); border-radius:6px; padding:8px; display:flex; flex-direction:column; gap:6px;";
      pbSec.innerHTML = `<b style="color:var(--chu-do); font-size:12px;">⚔️ Ban Tặng Pháp Bảo</b>`;

      const pbItems = Object.keys(tuiDo).filter((id) => {
        const def = itemsMap?.get(id);
        const laPb = def
          ? def.loai === "phap_khi"
          : id === "item.su_do_chan_truyen_phap_bao" ||
            id === "item.su_do_ho_menh_ngoc_bai" ||
            id === "item.su_do_tu_linh_tran_ky" ||
            id.includes("phap_khi");
        return laPb && (tuiDo[id] || 0) > 0;
      });

      if (pbItems.length === 0) {
        const empty = document.createElement("div");
        empty.className = "hud-phu";
        empty.style.fontSize = "11px";
        empty.textContent = "Trong túi đồ không có pháp khí nào.";
        pbSec.append(empty);
      } else {
        pbItems.forEach((id) => {
          const def = itemsMap?.get(id);
          const tenMon = layTenVatPham(id, def);
          const row = document.createElement("div");
          row.style.cssText =
            "display:flex; justify-content:space-between; align-items:center; font-size:11.5px;";
          row.innerHTML = `<span>${tenMon} (x${tuiDo[id]})</span>`;
          const btn = kitInstance.button({
            text: "Ban Tặng",
            kind: "chinh",
            onClick: () => {
              ttInstance.game.modAction("su_do", "ban_phap_bao", {
                deTuId: dt.id,
                itemId: id,
              });
              m.close();
              ttInstance.ui.toast(`Đã ban tặng "${tenMon}" cho ${dt.ten}!`);
            },
          });
          btn.style.cssText += "padding:2px 8px; font-size:11px;";
          row.append(btn);
          pbSec.append(row);
        });
      }
      box.append(pbSec);

      // 3. Đan dược
      const ddSec = document.createElement("div");
      ddSec.style.cssText =
        "border:1px solid var(--vien-hud); border-radius:6px; padding:8px; display:flex; flex-direction:column; gap:6px;";
      ddSec.innerHTML = `<b style="color:var(--chu-do); font-size:12px;">💊 Ban Đan Dược Tăng Tu Vi</b>`;

      const ddItems = Object.keys(tuiDo).filter((id) => {
        const def = itemsMap?.get(id);
        const laDd = def
          ? def.loai === "dan_duoc"
          : id === "item.su_do_ho_mach_dan" ||
            id === "item.su_do_tuyet_lien_tra" ||
            id === "item.truc_co_dan" ||
            id.includes("dan");
        return laDd && (tuiDo[id] || 0) > 0;
      });

      if (ddItems.length === 0) {
        const empty = document.createElement("div");
        empty.className = "hud-phu";
        empty.style.fontSize = "11px";
        empty.textContent = "Trong túi đồ không có linh đan phù hợp.";
        ddSec.append(empty);
      } else {
        ddItems.forEach((id) => {
          const def = itemsMap?.get(id);
          const tenMon = layTenVatPham(id, def);
          const row = document.createElement("div");
          row.style.cssText =
            "display:flex; justify-content:space-between; align-items:center; font-size:11.5px;";
          row.innerHTML = `<span>${tenMon} (x${tuiDo[id]})</span>`;
          const btn = kitInstance.button({
            text: "Ban Đan",
            kind: "phu",
            onClick: () => {
              ttInstance.game.modAction("su_do", "ban_dan_duoc", {
                deTuId: dt.id,
                itemId: id,
              });
              m.close();
              ttInstance.ui.toast(`Đã ban đan dược "${tenMon}" cho ${dt.ten}!`);
            },
          });
          btn.style.cssText += "padding:2px 8px; font-size:11px;";
          row.append(btn);
          ddSec.append(row);
        });
      }
      box.append(ddSec);

      // 4. Ban Linh Thạch trực tiếp
      const ltSec = document.createElement("div");
      ltSec.style.cssText =
        "display:flex; justify-content:space-between; align-items:center; border:1px solid var(--vien-hud); border-radius:6px; padding:8px;";
      ltSec.innerHTML = `<span><b>💰 Linh Thạch Sư Tôn:</b> ${nv.linhThach ?? 0}</span>`;
      const btnBanLt = kitInstance.button({
        text: "Ban 50 LT",
        kind: "phu",
        onClick: () => {
          if ((Number(nv.linhThach) || 0) < 50) {
            ttInstance.ui.toast("Sư tôn không đủ 50 linh thạch!");
            return;
          }
          ttInstance.game.modAction("su_do", "ban_thuong", {
            deTuId: dt.id,
            soTien: 50,
          });
          m.close();
          ttInstance.ui.toast(`Đã ban 50 linh thạch cho ${dt.ten}!`);
        },
      });
      btnBanLt.style.cssText += "padding:2px 8px; font-size:11px;";
      ltSec.append(btnBanLt);
      box.append(ltSec);
    },
  });
}

// ==========================================
// TẠO THẺ ĐỆ TỬ CHI TIẾT
// ==========================================
export function taoTheDeTuChiTiet(dt, ttInstance, kitInstance) {
  let currentDt = dt;
  const card = document.createElement("div");
  card.className = "su-do-card";
  card.dataset.id = dt.id;

  const isMaHoa = dt.trangThai?.loai === "ma_hoa";
  if (isMaHoa) card.classList.add("su-do-ma-hoa");

  const top = document.createElement("div");
  top.style.cssText =
    "display: flex; gap: 8px; align-items: center; min-width: 0;";

  const faceUrl =
    ttInstance.assets?.npcFace?.(
      dt.id,
      dt.gioiTinh,
      Math.floor(Number(dt.tuoi) || 14),
    ) ||
    (dt.gioiTinh === "nam"
      ? "/img/nguoi/nam.tre.1.webp"
      : "/img/nguoi/nu.tre.1.webp");
  const avatar = document.createElement("div");
  avatar.className = "su-do-avatar";
  avatar.innerHTML = `<img src="${faceUrl}" alt="${dt.ten}" onerror="this.src='/img/nguoi/${dt.gioiTinh === "nu" ? "nu" : "nam"}.tre.1.webp'" />`;
  top.append(avatar);

  const tc = TU_CHAT_MAP[dt.tuChat] ?? {
    ten: dt.tuChat,
    color: "inherit",
    bg: "transparent",
    border: "transparent",
  };
  const heStr = dinhDangHe(dt.he);
  const tcStr = TINH_CACH_MAP[dt.tinhCach] ?? dt.tinhCach;
  const danhXung = dt.gioiTinh === "nu" ? "Đại Sư Tỷ" : "Đại Sư Huynh";

  const info = document.createElement("div");
  info.className = "su-do-card-info";
  info.innerHTML = `
    <div class="su-do-card-name-row" style="display: flex; align-items: center; gap: 5px; min-width: 0; line-height: 1.2;">
      <span class="su-do-card-name" style="font-weight: bold; font-size: 13px; white-space: nowrap;">${dt.ten}</span>
      ${dt.vaiVe === "dai_su_huynh" ? `<span class="su-do-badge" style="color:var(--vang-kim); background:rgba(218,165,32,0.14); border:1px solid var(--vang-kim); font-size:9.5px; padding:0 4px; white-space:nowrap;">${danhXung}</span>` : ""}
      ${(() => {
        if (dt.trangThai?.loai === "ma_hoa") {
          return `<span class="su-do-badge" style="color:#ef4444; background:rgba(239,68,68,0.18); border:1px solid #ef4444; font-size:9.5px; padding:0 4px; white-space:nowrap;">🔴 Ma Hóa</span>`;
        }
        if (dt.trangThai?.loai !== "lich_luyen") return "";
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
      <span class="hud-phu su-do-card-age" style="font-size: 11px; white-space: nowrap; flex-shrink: 0;">${dt.gioiTinh === "nam" ? "Nam" : "Nữ"} · ${Math.floor(Number(dt.tuoi) || 14)}t</span>
    </div>
    <div class="su-do-card-stats" style="font-size: 11px; color: var(--muc-nhat); margin-top: 2px; white-space: nowrap;">
      Tính cách: <i>${tcStr}</i> · Hảo cảm: <b>${dt.haoCam ?? 0}</b> · Đố kỵ: <b style="color:${(dt.doKy ?? 0) > 50 ? "var(--cam-do)" : "inherit"}">${dt.doKy ?? 0}</b>
    </div>
    ${
      dt.congPhap || dt.phapBao
        ? `
      <div style="display:flex; gap:4px; margin-top:2px; font-size:10px; overflow:hidden;">
        ${dt.congPhap ? `<span class="su-do-badge" style="color:#3b82f6; background:rgba(59,130,246,0.12); border:1px solid #3b82f6; padding:0 4px;">📖 ${dt.congPhap.ten}</span>` : ""}
        ${dt.phapBao ? `<span class="su-do-badge" style="color:#8b5cf6; background:rgba(139,92,246,0.12); border:1px solid #8b5cf6; padding:0 4px;">⚔️ ${dt.phapBao.ten}</span>` : ""}
      </div>
    `
        : ""
    }
  `;
  top.append(info);
  card.append(top);

  // Tu vi progress
  const tuViReq = Math.max(1, Number(dt?.tuViYeuCau) || 1);
  const tuViCur = Math.max(0, Number(dt?.tuVi) || 0);
  const pct = Math.min(100, Math.max(0, Math.floor((tuViCur / tuViReq) * 100)));
  const sanSangDoKiep = tuViCur >= tuViReq;

  const progRow = document.createElement("div");
  progRow.style.cssText =
    "display:flex; align-items:center; gap:6px; font-size:11px;";
  progRow.innerHTML = `
    <span class="hud-phu" style="font-size:11px; white-space:nowrap;">Tu vi:</span>
    <div class="su-do-progress-bar">
      <div class="su-do-progress-val ${sanSangDoKiep ? "su-do-progress-max" : ""}" style="width: ${pct}%;"></div>
    </div>
    <span class="su-do-tuvi-text" style="font-size:10.5px; white-space:nowrap; font-weight:600; color:${sanSangDoKiep ? "var(--chu-do)" : "inherit"};">
      ${tuViCur}/${tuViReq} (${pct}%)${sanSangDoKiep ? " ⚡" : ""}
    </span>
  `;
  card.append(progRow);

  const progValEl = progRow.querySelector(".su-do-progress-val");
  const progTextEl = progRow.querySelector(".su-do-tuvi-text");
  const ageEl = info.querySelector(".su-do-card-age");
  const statsEl = info.querySelector(".su-do-card-stats");

  // NẾU BỊ MA HÓA: Hiện cụm xử lý nguy cấp
  if (isMaHoa) {
    const maBox = document.createElement("div");
    maBox.style.cssText = "display:flex; gap:4px; margin-top:2px;";

    const btnCamHoa = kitInstance.button({
      text: "❤️ Cảm Hóa (80LT/0.5TV)",
      kind: "chinh",
      onClick: () => {
        const curS = ttInstance.state();
        const curNv = curS?.run?.nhanVat;
        if (
          !curNv ||
          (Number(curNv.linhThach) || 0) < 80 ||
          (Number(curNv.tuVi) || 0) < 0.5
        ) {
          ttInstance.ui.toast(
            "Sư tôn không đủ 80 linh thạch hoặc 0.5 tu vi để cảm hóa!",
          );
          return;
        }
        ttInstance.game.modAction("su_do", "cam_hoa_nghich_do", {
          deTuId: currentDt.id,
        });
        ttInstance.ui.toast(
          `Đã dùng vô thượng chân tâm cảm hóa ${currentDt.ten}!`,
        );
      },
    });
    btnCamHoa.classList.add("su-do-btn-wrap");
    btnCamHoa.style.cssText += "flex:1 1 0; font-size:10.5px;";
    maBox.append(btnCamHoa);

    const btnTruc = kitInstance.button({
      text: "🚫 Phế Xuất",
      kind: "phu",
      onClick: () => {
        ttInstance.game.modAction("su_do", "phe_truc_xuat_nghich_do", {
          deTuId: currentDt.id,
        });
        ttInstance.ui.toast(`Đã phế tu vi và trục xuất ${currentDt.ten}!`);
      },
    });
    btnTruc.classList.add("su-do-btn-wrap");
    btnTruc.style.cssText += "font-size:10.5px;";
    maBox.append(btnTruc);

    const btnTram = kitInstance.button({
      text: "⚔️ Trảm Ma",
      kind: "phu",
      onClick: () => {
        ttInstance.game.modAction("su_do", "tru_ma_ve_dao", {
          deTuId: currentDt.id,
        });
        ttInstance.ui.toast(`Đã trảm ma trừ họa ${currentDt.ten}!`);
      },
    });
    btnTram.classList.add("su-do-btn-wrap");
    btnTram.style.cssText += "font-size:10.5px;";
    maBox.append(btnTram);

    card.append(maBox);
    return card;
  }

  // HÀNG NÚT TƯƠNG TÁC CHÍNH (Đàm tâm, Truyền công, Luận bàn)
  const gridMain = document.createElement("div");
  gridMain.className = "su-do-action-grid";

  // 1. Đàm tâm
  const btnDamTam = kitInstance.button({
    text: "🗣️ Đàm Tâm",
    kind: "nho",
    onClick: () => {
      if (currentDt.trangThai?.loai === "lich_luyen") {
        const conLai = Number(currentDt.trangThai?.namConLai) || 0;
        if (conLai > 0) {
          ttInstance.ui.toast(
            `Đệ tử ${currentDt.ten} đang xuất sơn lịch luyện (${conLai} năm nữa mới về)!`,
          );
        } else {
          ttInstance.ui.toast(
            `Đệ tử ${currentDt.ten} đã hoàn thành lịch luyện, hãy vào tab Lịch Luyện để thu nhận!`,
          );
        }
        return;
      }
      const m = kitInstance.modal({
        title: `Vấn Đạo Cùng ${currentDt.ten}`,
        mount(box) {
          box.style.cssText =
            "display: flex; flex-direction: column; gap: 8px; font-size: 13px;";
          const ask = document.createElement("div");
          ask.innerHTML = `Đệ tử ${currentDt.ten} chắp tay cung kính thưa: <i>"Khởi bẩm Sư tôn, giữa nhân gian hiểm ác, đệ tử tu tiên nên lấy điều gì làm trọng tâm?"</i>`;
          box.append(ask);

          box.append(
            kitInstance.button({
              text: "Trừ Ma Vệ Đạo (Chính Đạo)",
              kind: "chinh",
              onClick: () => {
                ttInstance.game.modAction("su_do", "luan_dao", {
                  deTuId: currentDt.id,
                  huong: "chinh_dao",
                });
                m.close();
                ttInstance.ui.toast("Đã chỉ dạy đạo lý Chính Đạo!");
              },
            }),
          );

          box.append(
            kitInstance.button({
              text: "Tiêu Dao Tự Tại (Tiêu Dao)",
              kind: "phu",
              onClick: () => {
                ttInstance.game.modAction("su_do", "luan_dao", {
                  deTuId: currentDt.id,
                  huong: "tieu_dao",
                });
                m.close();
                ttInstance.ui.toast("Đã chỉ dạy đạo lý Tiêu Dao!");
              },
            }),
          );

          box.append(
            kitInstance.button({
              text: "Kẻ Mạnh Vi Tôn (Ma Đạo)",
              kind: "phu",
              onClick: () => {
                ttInstance.game.modAction("su_do", "luan_dao", {
                  deTuId: currentDt.id,
                  huong: "ma_dao",
                });
                m.close();
                ttInstance.ui.toast("Đã chỉ dạy đạo lý Nghịch Thiên!");
              },
            }),
          );
        },
      });
    },
  });
  btnDamTam.classList.add("su-do-btn-wrap");
  gridMain.append(btnDamTam);

  // 2. Truyền công
  const btnTruyenCong = kitInstance.button({
    text: "📖 Truyền Công",
    kind: "nho",
    onClick: () => {
      if (currentDt.trangThai?.loai === "lich_luyen") {
        const conLai = Number(currentDt.trangThai?.namConLai) || 0;
        if (conLai > 0) {
          ttInstance.ui.toast(
            `Đệ tử ${currentDt.ten} đang xuất sơn lịch luyện (${conLai} năm nữa mới về)!`,
          );
        } else {
          ttInstance.ui.toast(
            `Đệ tử ${currentDt.ten} đã hoàn thành lịch luyện, hãy vào tab Lịch Luyện để thu nhận!`,
          );
        }
        return;
      }
      const curReq = Math.max(1, Number(currentDt?.tuViYeuCau) || 1);
      const curVal = Math.max(0, Number(currentDt?.tuVi) || 0);
      if (curVal >= curReq) {
        ttInstance.ui.toast(
          `Đệ tử ${currentDt.ten} đã đạt bình cảnh tu vi (100%), cần hộ pháp đột phá trước!`,
        );
        return;
      }
      const s = ttInstance.state();
      if ((Number(s.run?.nhanVat?.tuVi) || 0) < 1) {
        ttInstance.ui.toast(
          "Sư tôn không đủ chân nguyên tu vi để truyền công (cần ít nhất 1.0 tu vi)!",
        );
        return;
      }
      try {
        ttInstance.game.modAction("su_do", "truyen_cong", {
          deTuId: currentDt.id,
        });
        ttInstance.ui.toast(`Đã quán đảnh truyền công cho ${currentDt.ten}!`);
      } catch (e) {
        ttInstance.ui.toast(e.message);
      }
    },
  });
  btnTruyenCong.classList.add("su-do-btn-wrap");
  gridMain.append(btnTruyenCong);

  // 3. Luận bàn
  const btnDauPhap = kitInstance.button({
    text: "⚔️ Luận Bàn",
    kind: "nho",
    onClick: () => {
      if (currentDt.trangThai?.loai === "lich_luyen") {
        const conLai = Number(currentDt.trangThai?.namConLai) || 0;
        if (conLai > 0) {
          ttInstance.ui.toast(
            `Đệ tử ${currentDt.ten} đang xuất sơn lịch luyện (${conLai} năm nữa mới về)!`,
          );
        } else {
          ttInstance.ui.toast(
            `Đệ tử ${currentDt.ten} đã hoàn thành lịch luyện, hãy vào tab Lịch Luyện để thu nhận!`,
          );
        }
        return;
      }
      ttInstance.game.modAction("su_do", "dau_phap", { deTuId: currentDt.id });
      ttInstance.ui.toast(`Đã luận bàn đấu pháp cùng ${currentDt.ten}!`);
    },
  });
  btnDauPhap.classList.add("su-do-btn-wrap");
  gridMain.append(btnDauPhap);
  card.append(gridMain);

  // HÀNG PHỤ: Ban Tặng / Đột Phá / Đại Sư Huynh / Trục Xuất
  const subRow = document.createElement("div");
  subRow.className = "su-do-action-subgrid";

  // Nút Ban tặng modal
  const btnBanTang = kitInstance.button({
    text: "🎁 Ban Tặng & Truyền Thụ",
    kind: "nho",
    onClick: () => {
      if (currentDt.trangThai?.loai === "lich_luyen") {
        ttInstance.ui.toast(`Đệ tử ${currentDt.ten} đang xuất sơn lịch luyện!`);
        return;
      }
      moModalBanTang(currentDt, ttInstance, kitInstance);
    },
  });
  btnBanTang.classList.add("su-do-btn-wrap");
  subRow.append(btnBanTang);

  // Nút Hộ trì đột phá / Độ kiếp
  const laDinhPhong =
    (Number(currentDt.canhGioi) || 1) >= 5 &&
    (Number(currentDt.tieuCanhGioi) || 0) >= 3;
  if (tuViCur >= tuViReq && !laDinhPhong) {
    const laDaiCanhGioi = (Number(currentDt.tieuCanhGioi) || 0) >= 3;
    const tuLuyenKhiLenTrucCo = currentDt.canhGioi === 1 && laDaiCanhGioi;
    const doKiepThucSu = currentDt.canhGioi >= 2 && laDaiCanhGioi;

    const nutText = doKiepThucSu
      ? "⚡ Độ Kiếp"
      : tuLuyenKhiLenTrucCo
        ? "🌟 Đột Phá Trúc Cơ"
        : "⚡ Đột Phá";

    const btnHoPhap = kitInstance.button({
      text: nutText,
      kind: "chinh",
      onClick: () => {
        if (currentDt.trangThai?.loai === "lich_luyen") {
          ttInstance.ui.toast(
            `Đệ tử ${currentDt.ten} đang xuất sơn lịch luyện!`,
          );
          return;
        }
        if (!laDaiCanhGioi) {
          // Tiểu cảnh giới
          const m = kitInstance.modal({
            title: `Hộ Trì Đột Phá Cho ${currentDt.ten}`,
            mount(box) {
              box.style.cssText =
                "display: flex; flex-direction: column; gap: 8px; font-size: 13px;";
              const msg = document.createElement("div");
              msg.innerHTML = `Đệ tử <b>${currentDt.ten}</b> (${dinhDangCanhGioi(currentDt.canhGioi, currentDt.tieuCanhGioi)}) đã tích lũy tu vi đại viên mãn, chuẩn bị xung kích lên <b>${dinhDangCanhGioi(currentDt.canhGioi, (currentDt.tieuCanhGioi ?? 0) + 1)}</b>!`;
              box.append(msg);

              box.append(
                kitInstance.button({
                  text: "✨ Chỉ dẫn khí mạch (100% thành công, tốn 0.2 tu vi)",
                  kind: "chinh",
                  onClick: () => {
                    const nv = ttInstance.state().run?.nhanVat;
                    if (nv && (Number(nv.tuVi) || 0) < 0.2) {
                      ttInstance.ui.toast(
                        "Sư tôn không đủ 0.2 tu vi chân nguyên để chỉ dẫn!",
                      );
                      return;
                    }
                    ttInstance.game.modAction("su_do", "ho_phap", {
                      deTuId: currentDt.id,
                      cach: "chi_dan",
                    });
                    m.close();
                    ttInstance.ui.toast(
                      `Đã chỉ dẫn hộ ${currentDt.ten} đột phá thành công!`,
                    );
                  },
                }),
              );

              box.append(
                kitInstance.button({
                  text: "💊 Ban đan dược trợ lực (85% thành công, 30 linh thạch)",
                  kind: "phu",
                  onClick: () => {
                    const nv = ttInstance.state().run?.nhanVat;
                    if (nv && (Number(nv.linhThach) || 0) < 30) {
                      ttInstance.ui.toast("Sư tôn không đủ 30 linh thạch!");
                      return;
                    }
                    ttInstance.game.modAction("su_do", "ho_phap", {
                      deTuId: currentDt.id,
                      cach: "ban_dan",
                    });
                    m.close();
                    ttInstance.ui.toast(
                      `Đã ban đan dược cho ${currentDt.ten}!`,
                    );
                  },
                }),
              );

              box.append(
                kitInstance.button({
                  text: "🛡️ Tự lực cánh sinh (60% thành công)",
                  kind: "phu",
                  onClick: () => {
                    ttInstance.game.modAction("su_do", "ho_phap", {
                      deTuId: currentDt.id,
                      cach: "tu_luc",
                    });
                    m.close();
                  },
                }),
              );
            },
          });
        } else if (tuLuyenKhiLenTrucCo) {
          // Trúc Cơ
          const m = kitInstance.modal({
            title: `Hộ Đạo Trúc Cơ Cho ${currentDt.ten}`,
            mount(box) {
              box.style.cssText =
                "display: flex; flex-direction: column; gap: 8px; font-size: 13px;";
              const msg = document.createElement("div");
              msg.innerHTML = `Đồ đệ <b>${currentDt.ten}</b> đã đạt Luyện Khí Đại viên mãn, chuẩn bị ngưng tụ đạo cơ để bước chân vào Trúc Cơ Sơ kỳ!`;
              box.append(msg);

              box.append(
                kitInstance.button({
                  text: "🌟 Sư tôn hộ pháp đúc đạo cơ (100% thành công, hao 0.5 tu vi)",
                  kind: "chinh",
                  onClick: () => {
                    const nv = ttInstance.state().run?.nhanVat;
                    if (nv && (Number(nv.tuVi) || 0) < 0.5) {
                      ttInstance.ui.toast("Sư tôn không đủ 0.5 tu vi!");
                      return;
                    }
                    ttInstance.game.modAction("su_do", "ho_phap", {
                      deTuId: currentDt.id,
                      cach: "ho_phap",
                    });
                    m.close();
                    ttInstance.ui.toast(
                      `Đã hộ pháp giúp ${currentDt.ten} đúc thành đạo cơ Trúc Cơ!`,
                    );
                  },
                }),
              );

              box.append(
                kitInstance.button({
                  text: "💊 Ban Trúc Cơ Đan (90% thành công, 80 linh thạch hoặc có đan)",
                  kind: "phu",
                  onClick: () => {
                    const nv = ttInstance.state().run?.nhanVat;
                    const coDan =
                      (Number(nv?.tuiDo?.["item.truc_co_dan"]) || 0) > 0;
                    if (!coDan && (Number(nv?.linhThach) || 0) < 80) {
                      ttInstance.ui.toast(
                        "Sư tôn không có Trúc Cơ Đan hoặc không đủ 80 linh thạch!",
                      );
                      return;
                    }
                    ttInstance.game.modAction("su_do", "ho_phap", {
                      deTuId: currentDt.id,
                      cach: "ban_dan",
                    });
                    m.close();
                    ttInstance.ui.toast(
                      `Đã ban Trúc Cơ Đan cho ${currentDt.ten}!`,
                    );
                  },
                }),
              );

              box.append(
                kitInstance.button({
                  text: "🛡️ Tự thân đúc đạo cơ (50% thành công)",
                  kind: "phu",
                  onClick: () => {
                    ttInstance.game.modAction("su_do", "ho_phap", {
                      deTuId: currentDt.id,
                      cach: "tu_luc",
                    });
                    m.close();
                  },
                }),
              );
            },
          });
        } else {
          // Độ Kiếp
          const m = kitInstance.modal({
            title: `Hộ Pháp Độ Kiếp Cho ${currentDt.ten}`,
            mount(box) {
              box.style.cssText =
                "display: flex; flex-direction: column; gap: 8px; font-size: 13px;";
              const msg = document.createElement("div");
              msg.innerHTML = `Đệ tử <b>${currentDt.ten}</b> xung kích đại cảnh giới, cửu thiên lôi kiếp sắp giáng xuống!`;
              box.append(msg);

              box.append(
                kitInstance.button({
                  text: "⚡ Gánh lôi kiếp (100% thành công, Sư tôn chịu 1 tầng thương thế nhẹ)",
                  kind: "chinh",
                  onClick: () => {
                    ttInstance.game.modAction("su_do", "ho_phap", {
                      deTuId: currentDt.id,
                      cach: "ganh_loi_kiep",
                    });
                    m.close();
                    ttInstance.ui.toast(
                      `Đã gánh lôi kiếp hộ ${currentDt.ten} độ kiếp thành công!`,
                    );
                  },
                }),
              );

              box.append(
                kitInstance.button({
                  text: "💊 Ban Đan Dược Hộ Mệnh (80% thành công, 100 linh thạch)",
                  kind: "phu",
                  onClick: () => {
                    const nv = ttInstance.state().run?.nhanVat;
                    const coDan =
                      (Number(nv?.tuiDo?.["item.su_do_ho_mach_dan"]) || 0) > 0;
                    if (!coDan && (Number(nv?.linhThach) || 0) < 100) {
                      ttInstance.ui.toast(
                        "Sư tôn không đủ 100 linh thạch để ban đan dược hộ mệnh!",
                      );
                      return;
                    }
                    ttInstance.game.modAction("su_do", "ho_phap", {
                      deTuId: currentDt.id,
                      cach: "ban_dan",
                    });
                    m.close();
                    ttInstance.ui.toast("Đã ban đan dược hộ mệnh độ kiếp!");
                  },
                }),
              );

              box.append(
                kitInstance.button({
                  text: "🛡️ Tự thân vượt thiên kiếp (50% thành công)",
                  kind: "phu",
                  onClick: () => {
                    ttInstance.game.modAction("su_do", "ho_phap", {
                      deTuId: currentDt.id,
                      cach: "tu_luc",
                    });
                    m.close();
                  },
                }),
              );
            },
          });
        }
      },
    });
    btnHoPhap.classList.add("su-do-btn-wrap");
    subRow.append(btnHoPhap);
  }

  // Quản trị bên phải (Sắc phong, Trục xuất)
  const rightGroup = document.createElement("div");
  rightGroup.style.cssText = "display: flex; gap: 4px; align-items: center;";

  if (currentDt.vaiVe !== "dai_su_huynh") {
    const btnBoNhiem = kitInstance.button({
      text: "👑",
      tip: `Sắc phong làm ${danhXung}`,
      kind: "nho",
      onClick: () => {
        ttInstance.game.modAction("su_do", "bo_nhiem", {
          deTuId: currentDt.id,
        });
        ttInstance.ui.toast(`Đã sắc phong ${currentDt.ten} làm ${danhXung}!`);
      },
    });
    btnBoNhiem.classList.add("su-do-btn-wrap");
    rightGroup.append(btnBoNhiem);
  }

  const btnTrucXuat = kitInstance.button({
    text: "✕",
    tip: "Trục xuất đồ đệ khỏi môn phái",
    kind: "nho",
    onClick: async () => {
      const ok = await ttInstance.ui.confirm({
        title: "Trục Xuất Đệ Tử",
        text: `Sư tôn có chắc chắn muốn trục xuất ${currentDt.ten} khỏi môn phái?`,
      });
      if (ok) {
        ttInstance.game.modAction("su_do", "truc_xuat", {
          deTuId: currentDt.id,
        });
        ttInstance.ui.toast(`Đã trục xuất ${currentDt.ten}!`);
      }
    },
  });
  const btnNhanMach = kitInstance.button({
    text: "👁️",
    tip: "Xem vị trí & mối quan hệ của đồ đệ trong bảng Nhân Mạch (phím tắt N)",
    kind: "nho",
    onClick: () => {
      ttInstance.ui.gamePanel("relations", true);
    },
  });
  btnNhanMach.classList.add("su-do-btn-wrap");
  btnNhanMach.style.cssText += "padding: 2px 5px; font-size: 10px;";
  rightGroup.append(btnNhanMach);

  btnTrucXuat.classList.add("su-do-btn-wrap");
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
    const curPct = Math.min(
      100,
      Math.max(0, Math.floor((curVal / curReq) * 100)),
    );
    const curSanSang = curVal >= curReq;

    if (progValEl) {
      progValEl.style.width = `${curPct}%`;
      progValEl.classList.toggle("su-do-progress-max", curSanSang);
    }
    if (progTextEl) {
      progTextEl.textContent = `${curVal}/${curReq} (${curPct}%)${curSanSang ? " ⚡" : ""}`;
      progTextEl.style.color = curSanSang ? "var(--chu-do)" : "inherit";
    }
    if (ageEl) {
      ageEl.textContent = `${newDt.gioiTinh === "nam" ? "Nam" : "Nữ"} · ${Math.floor(Number(newDt.tuoi) || 14)}t`;
    }
    if (statsEl) {
      const curTcStr = TINH_CACH_MAP[newDt.tinhCach] ?? newDt.tinhCach;
      statsEl.innerHTML = `Tính cách: <i>${curTcStr}</i> · Hảo cảm: <b>${newDt.haoCam ?? 0}</b> · Đố kỵ: <b style="color:${(newDt.doKy ?? 0) > 50 ? "var(--cam-do)" : "inherit"}">${newDt.doKy ?? 0}</b>`;
    }
  };

  return card;
}

// ==========================================
// THẺ ĐỆ TỬ THU NHỎ (CHO SLOT CHARACTER TAB)
// ==========================================
export function taoTheDeTuNho(dt) {
  const card = document.createElement("div");
  card.className = "su-do-card";
  card.style.cssText = "padding: 6px 8px; gap: 4px;";

  const rowTop = document.createElement("div");
  rowTop.style.cssText =
    "display: flex; justify-content: space-between; align-items: center; font-size: 12.5px; white-space: nowrap; min-width: 0;";

  const tenSpan = document.createElement("span");
  tenSpan.style.cssText =
    "display: flex; align-items: center; gap: 4px; white-space: nowrap;";
  rowTop.append(tenSpan);

  const cgSpan = document.createElement("span");
  cgSpan.className = "hud-phu";
  cgSpan.style.cssText =
    "font-size: 11px; white-space: nowrap; margin-left: auto;";
  rowTop.append(cgSpan);
  card.append(rowTop);

  const rowSub = document.createElement("div");
  rowSub.style.cssText =
    "display: flex; justify-content: space-between; font-size: 11px; color: var(--muc-nhat); white-space: nowrap;";

  const statsSpan = document.createElement("span");
  statsSpan.style.cssText = "white-space: nowrap;";
  rowSub.append(statsSpan);

  const tuViSpan = document.createElement("span");
  tuViSpan.style.cssText = "white-space: nowrap;";
  rowSub.append(tuViSpan);
  card.append(rowSub);

  card._update = (newDt) => {
    const danhXung = newDt.gioiTinh === "nu" ? "Đại Sư Tỷ" : "Đại Sư Huynh";
    tenSpan.innerHTML = `<b>${newDt.ten}</b> ${newDt.vaiVe === "dai_su_huynh" ? `<span class="su-do-badge" style="color:var(--vang-kim); font-size:9.5px; border:1px solid var(--vang-kim); padding:0 3px;">${danhXung}</span>` : ""}`;
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
export function capNhatDanhSachDeTu(list, container, tt, kit) {
  if (list.length === 0) {
    container.innerHTML = `
      <div style="border: 1px dashed var(--vien-hud); border-radius: 8px; padding: 18px 12px; text-align: center; color: var(--muc-nhat); font-size: 12.5px; line-height: 1.6;">
        Chưa có đồ đệ nào bái nhập bổn môn.<br/>
        Hãy nhấn nút <b>"Chiêu Mộ Đồ Đệ"</b> bên trên để mở kỳ tuyển đồ!
      </div>
    `;
    return;
  }

  const emptyNotice = container.querySelector(
    'div[style*="text-align: center"]',
  );
  if (emptyNotice) container.innerHTML = "";

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
    if (
      !cardEl ||
      (typeof cardEl._checkStructuralChange === "function" &&
        cardEl._checkStructuralChange(dt))
    ) {
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

// ==========================================
// CẬP NHẬT DANH SÁCH ỨNG VIÊN
// ==========================================
export function capNhatUngVien(list, uvBox, tt, kit) {
  if (!list || list.length === 0) {
    uvBox.style.display = "none";
    uvBox.innerHTML = "";
    return;
  }

  uvBox.style.display = "flex";
  uvBox.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px dashed var(--vang-kim); padding-bottom: 4px; margin-bottom: 2px;">
      <b style="color: var(--vang-kim); font-size: 12.5px; white-space: nowrap;">📜 Ứng Viên Cầu Đạo (${list.length})</b>
      <span class="hud-phu" style="font-size: 11px; white-space: nowrap;">Chọn đồ đệ thu nạp</span>
    </div>
  `;

  list.forEach((uv, idx) => {
    const uvCard = document.createElement("div");
    uvCard.className = "su-do-card";
    uvCard.style.cssText =
      "padding: 6px 8px; gap: 4px; background: rgba(255,255,255,0.6);";

    const tc = TU_CHAT_MAP[uv.tuChat] ?? {
      ten: uv.tuChat,
      color: "inherit",
      bg: "transparent",
      border: "transparent",
    };
    const heStr = dinhDangHe(uv.he);
    const tcStr = TINH_CACH_MAP[uv.tinhCach] ?? uv.tinhCach;

    uvCard.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; font-size: 12.5px; white-space: nowrap;">
        <span style="font-weight: bold; white-space: nowrap;">${uv.ten}</span>
        <span class="su-do-badge" style="color:${tc.color}; background:${tc.bg}; border:1px solid ${tc.border}; font-size:9.5px; padding:0 4px; white-space:nowrap;">${tc.ten}</span>
      </div>
      <div style="display: flex; justify-content: space-between; font-size: 11px; color: var(--muc-nhat); white-space: nowrap;">
        <span>${uv.gioiTinh === "nam" ? "Nam" : "Nữ"} · ${Math.floor(Number(uv.tuoi) || 14)}t · ${heStr}</span>
        <span>Tâm tính: <i>${tcStr}</i></span>
      </div>
    `;

    const btnThuNhan = kit.button({
      text: "Thu Nhận Đồ Đệ",
      kind: "chinh",
      onClick: () => {
        const curMaxDt = sucChuaDeTu(tt.state().run?.nhanVat?.canhGioi ?? 0);
        const curDtCount = layModData(tt.state()).danhSachDeTu.length;
        if (curDtCount >= curMaxDt) {
          tt.ui.toast(
            `Môn phái đã đạt giới hạn sức chứa (${curDtCount}/${curMaxDt}), cần đột phá cảnh giới để thu thêm!`,
          );
          return;
        }
        tt.game.modAction("su_do", "nhan_de_tu", { index: idx });
        tt.ui.toast(`Đã thu nạp ${uv.ten} vào môn phái!`);
      },
    });
    btnThuNhan.classList.add("su-do-btn-wrap");
    btnThuNhan.style.cssText +=
      "margin-top: 3px; padding: 2px 8px; font-size: 11px; width: 100%;";
    uvCard.append(btnThuNhan);
    uvBox.append(uvCard);
  });
}
