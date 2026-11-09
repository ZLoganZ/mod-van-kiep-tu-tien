// lib/ui.js
// Giao diện người dùng: Panels, Modals, Slots, Docks, Tabs và Thẻ đệ tử

import {
  MOD_VERSION,
  TU_CHAT_MAP,
  TINH_CACH_MAP,
  NHIEM_VU_LICH_LUYEN,
  TU_LINH_TRAN_CONFIG,
  DUOC_DIEN_CONFIG,
  LUYEN_DAN_CONFIG,
  HO_TONG_CONFIG,
} from "./constants.js";

import { injectMasterStyles } from "./styles.js";

import {
  dinhDangCanhGioi,
  dinhDangHe,
  dinhDangThoiGianNam,
  layModData,
  layChuKyCauTrucDeTu,
  sucChuaDeTu,
  dongBoTienDoLichLuyen,
} from "./utils.js";

let unsubLifeEndListener = null;

export function dangKySlotsVaDocks(tt, mod) {
  const kit = tt.ui.kit;

  // ==========================================
  // LẮNG NGHE KẾT THÚC KIẾP (Di trạch đệ tử)
  // ==========================================
  if (typeof unsubLifeEndListener === "function") {
    try {
      unsubLifeEndListener();
    } catch (e) {}
    unsubLifeEndListener = null;
  }

  unsubLifeEndListener = tt.on("lifeEnd", () => {
    try {
      const s = tt.state();
      const data = layModData(s);
      const deTuList = data.danhSachDeTu;
      if (deTuList.length > 0) {
        const key = "mod:su_do:tien_duyen";
        const luu = deTuList.map((d) => ({
          ten: d.ten,
          canhGioi: Number(d.canhGioi) || 1,
          tieuCanhGioi: Number(d.tieuCanhGioi) || 0,
          tuChat: d.tuChat,
        }));
        localStorage.setItem(key, JSON.stringify(luu));
        mod.log("Đã lưu truyền thừa đệ tử cho kiếp sau:", luu);
      }
    } catch (err) {
      console.error("[Mod Sư Đồ] Lỗi khi lưu di trạch:", err);
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
                ttInstance.ui.toast(
                  `Đã ban đan dược "${tenMon}" cho ${dt.ten}!`,
                );
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
  function taoTheDeTuChiTiet(dt, ttInstance, kitInstance) {
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
    const pct = Math.min(
      100,
      Math.max(0, Math.floor((tuViCur / tuViReq) * 100)),
    );
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
        ttInstance.game.modAction("su_do", "dau_phap", {
          deTuId: currentDt.id,
        });
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
          ttInstance.ui.toast(
            `Đệ tử ${currentDt.ten} đang xuất sơn lịch luyện!`,
          );
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
                        (Number(nv?.tuiDo?.["item.su_do_ho_mach_dan"]) || 0) >
                        0;
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
  function taoTheDeTuNho(dt) {
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

  function capNhatUngVien(list, uvBox) {
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

  function capNhatNhatKy(nhatKy, box) {
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

  function capNhatLichLuyen(deTuList, box, namHienTai = 1) {
    box.innerHTML = "";
    deTuList.forEach((dt) => dongBoTienDoLichLuyen(dt, namHienTai));

    const dtDangLichLuyen = deTuList.filter(
      (d) => d.trangThai?.loai === "lich_luyen",
    );
    const dtRanhRoi = deTuList.filter(
      (d) => d.trangThai?.loai !== "lich_luyen",
    );

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
  function capNhatKienThiet(data, box, s, nv) {
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
      maxLabel.style.cssText =
        "font-size:11px; color:#10b981; font-weight:bold;";
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
          tt.game.modAction("su_do", "nang_cap_kien_thiet", {
            loai: "duocDien",
          });
          tt.ui.toast(`Đã nâng cấp Dược Điền lên ${nextDD.ten}!`);
        },
      });
      btnUpDD.style.cssText +=
        "margin-top:2px; font-size:11px; padding:3px 6px;";
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
      (d) =>
        d.trangThai?.loai !== "lich_luyen" && d.trangThai?.loai !== "ma_hoa",
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
    const tranDong = deTuList.find(
      (d) => d.id === kt.hoTongDaiTran?.tranDongId,
    );

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
      btnUpHT.style.cssText +=
        "margin-top:2px; font-size:11px; padding:3px 6px;";
      cardHT.append(btnUpHT);
    } else {
      const maxLabel = document.createElement("div");
      maxLabel.className = "hud-phu";
      maxLabel.style.cssText =
        "font-size:11px; color:#10b981; font-weight:bold;";
      maxLabel.textContent =
        "✨ Hộ Tông Đại Trận đã đạt cấp Đỉnh Phong Viên Mãn!";
      cardHT.append(maxLabel);
    }
    box.append(cardHT);
  }

  // ==========================================
  // TAB: LUẬN KIẾM TÔNG MÔN (TRỤ CỘT 3)
  // ==========================================
  function capNhatLuanKiem(data, box) {
    box.innerHTML = "";
    const deTuList = data.danhSachDeTu.filter(
      (d) =>
        d.trangThai?.loai !== "lich_luyen" && d.trangThai?.loai !== "ma_hoa",
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
      empty.style.cssText =
        "text-align:center; padding:16px 0; font-size:12px;";
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
  function capNhatTienDuyen(box) {
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

  // ==========================================
  // HEADER ĐẠO TRÀNG
  // ==========================================
  function taoDaoTrangHeader(data, nv, maxDt, kitInstance, ttInstance) {
    const header = document.createElement("div");
    header.className = "su-do-header";

    const titleRow = document.createElement("div");
    titleRow.className = "su-do-header-title";

    const titleText = document.createElement("span");
    titleText.className = "su-do-title-text";
    titleText.textContent = data.daoTrangTen;
    titleRow.append(titleText);

    const btnDoiTen = kitInstance.button({
      text: "✏️ Đổi Tên",
      kind: "nho",
      onClick: async () => {
        const tenMoi = prompt(
          "Nhập danh hiệu Đạo Tràng mới của Sư Tôn:",
          data.daoTrangTen,
        );
        if (tenMoi && tenMoi.trim() && tenMoi.trim() !== data.daoTrangTen) {
          ttInstance.game.modAction("su_do", "doi_ten_dao_trang", {
            ten: tenMoi.trim(),
          });
          ttInstance.ui.toast(`Đã đổi tên đạo tràng thành "${tenMoi.trim()}"!`);
        }
      },
    });
    btnDoiTen.classList.add("su-do-btn-wrap");
    btnDoiTen.style.cssText += "padding: 1px 6px; font-size: 10.5px;";
    titleRow.append(btnDoiTen);
    header.append(titleRow);

    const subRow = document.createElement("div");
    subRow.className = "su-do-header-sub";
    header.append(subRow);

    const statsRow = document.createElement("div");
    statsRow.className = "su-do-header-stats";
    header.append(statsRow);

    header._update = (newData, newNv, newMaxDt) => {
      titleText.textContent = newData.daoTrangTen;
      const cgTen = dinhDangCanhGioi(newNv?.canhGioi ?? 0);
      subRow.textContent = `Sư Tôn: ${newNv?.ten ?? "Vô Danh"} (${cgTen})`;

      const count = newData.danhSachDeTu.length;
      const capTLT = Number(newData.daoTrang?.kienThiet?.tuLinhTran?.cap) || 0;
      const capHT =
        Number(newData.daoTrang?.kienThiet?.hoTongDaiTran?.cap) || 0;
      statsRow.innerHTML = `
        <span>👥 Đồ đệ: <b>${count}/${newMaxDt}</b></span>
        <span>⚡ Tụ Linh: <b>Lv${capTLT}</b></span>
        <span>🛡️ Hộ Tông: <b>Lv${capHT}</b></span>
        <span>💰 Linh thạch: <b>${newNv?.linhThach ?? 0}</b></span>
      `;
    };

    header._update(data, nv, maxDt);
    return header;
  }

  // ==========================================
  // DỰNG GIAO DIỆN SƯ MÔN CHÍNH THỐNG
  // ==========================================
  function taoSuMonDashboard(
    container,
    ttInstance,
    kitInstance,
    { isCharacterTab = false } = {},
  ) {
    const s0 = ttInstance.state();
    const data0 = layModData(s0);
    const nv0 = s0.run?.nhanVat;
    const maxDt0 = sucChuaDeTu(nv0?.canhGioi ?? 0);

    const header = taoDaoTrangHeader(
      data0,
      nv0,
      maxDt0,
      kitInstance,
      ttInstance,
    );
    container.append(header);

    const tabUpdaters = {};

    const tabsEl = kitInstance.tabs({
      tabs: [
        // TAB 1: ĐỒ ĐỆ
        {
          id: "tab_de_tu",
          title: `Đồ Đệ (${data0.danhSachDeTu.length})`,
          mount(box) {
            box.style.cssText =
              "display: flex; flex-direction: column; gap: 8px; margin-top: 6px; padding-bottom: 24px;";

            const topAct = document.createElement("div");
            topAct.style.cssText =
              "display: flex; justify-content: space-between; align-items: center; margin-bottom: 2px; gap: 8px;";

            const desc = document.createElement("div");
            desc.style.cssText =
              "font-size: 11.5px; color: var(--muc-nhat); white-space: nowrap;";
            topAct.append(desc);

            const btnChieuMo = kitInstance.button({
              text: "📜 Chiêu Mộ Đồ Đệ",
              kind: "chinh",
              onClick: () => {
                ttInstance.game.modAction("su_do", "tuyen_do", {});
                ttInstance.ui.toast(
                  "Đã mở kỳ tuyển đồ! 3 ứng viên xuất hiện bên dưới.",
                );
              },
            });
            btnChieuMo.classList.add("su-do-btn-wrap");
            btnChieuMo.style.cssText += "padding: 3px 8px; font-size: 11px;";
            topAct.append(btnChieuMo);
            box.append(topAct);

            const listUngVien = document.createElement("div");
            listUngVien.style.cssText =
              "display: flex; flex-direction: column; gap: 6px;";
            box.append(listUngVien);

            const listDeTu = document.createElement("div");
            listDeTu.style.cssText =
              "display: flex; flex-direction: column; gap: 6px;";
            box.append(listDeTu);

            tabUpdaters.tab_de_tu = (data, s, nv, maxDt) => {
              desc.textContent = `Đệ tử: ${data.danhSachDeTu.length}/${maxDt}`;
              capNhatUngVien(data.ungVien, listUngVien);
              capNhatDanhSachDeTu(data.danhSachDeTu, listDeTu);
            };

            const curS = ttInstance.state();
            const curData = layModData(curS);
            const curNv = curS.run?.nhanVat;
            tabUpdaters.tab_de_tu(
              curData,
              curS,
              curNv,
              sucChuaDeTu(curNv?.canhGioi ?? 0),
            );

            return () => {
              delete tabUpdaters.tab_de_tu;
            };
          },
        },

        // TAB 2: KIẾN THIẾT ĐẠO TRÀNG / ĐỘNG PHỦ
        {
          id: "tab_kien_thiet",
          title: "Kiến Thiết",
          mount(box) {
            box.style.cssText =
              "display: flex; flex-direction: column; gap: 8px; margin-top: 6px; padding-bottom: 24px;";

            tabUpdaters.tab_kien_thiet = (data, s, nv) => {
              capNhatKienThiet(data, box, s, nv);
            };

            const curS = ttInstance.state();
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
          id: "tab_luan_kiem",
          title: "Luận Kiếm",
          mount(box) {
            box.style.cssText =
              "display: flex; flex-direction: column; gap: 8px; margin-top: 6px; padding-bottom: 24px;";

            tabUpdaters.tab_luan_kiem = (data) => {
              capNhatLuanKiem(data, box);
            };

            const curS = ttInstance.state();
            const curData = layModData(curS);
            tabUpdaters.tab_luan_kiem(curData);

            return () => {
              delete tabUpdaters.tab_luan_kiem;
            };
          },
        },

        // TAB 4: LỊCH LUYỆN
        {
          id: "tab_lich_luyen",
          title: "Lịch Luyện",
          mount(box) {
            box.style.cssText =
              "display: flex; flex-direction: column; gap: 8px; margin-top: 6px; padding-bottom: 24px;";

            tabUpdaters.tab_lich_luyen = (data, s) => {
              capNhatLichLuyen(data.danhSachDeTu, box, s?.run?.nam ?? 1);
            };

            const curS = ttInstance.state();
            const curData = layModData(curS);
            tabUpdaters.tab_lich_luyen(curData, curS);

            return () => {
              delete tabUpdaters.tab_lich_luyen;
            };
          },
        },

        // TAB 5: NHẬT KÝ SƯ MÔN
        {
          id: "tab_su_mon",
          title: "Nhật Ký",
          mount(box) {
            box.style.cssText =
              "display: flex; flex-direction: column; gap: 8px; margin-top: 6px; padding-bottom: 24px;";

            tabUpdaters.tab_su_mon = (data) => {
              capNhatNhatKy(data.nhatKy, box);
            };

            const curS = ttInstance.state();
            const curData = layModData(curS);
            tabUpdaters.tab_su_mon(curData);

            return () => {
              delete tabUpdaters.tab_su_mon;
            };
          },
        },

        // TAB 6: TIỀN DUYÊN
        {
          id: "tab_truyen_thua",
          title: "Tiền Duyên",
          mount(box) {
            box.style.cssText =
              "display: flex; flex-direction: column; gap: 10px; margin-top: 6px; font-size: 13px; padding-bottom: 24px;";

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

    const onStateChange = () => {
      const s = ttInstance.state();
      const data = layModData(s);
      const nv = s.run?.nhanVat;
      const maxDt = sucChuaDeTu(nv?.canhGioi ?? 0);

      header._update?.(data, nv, maxDt);

      const tab1Btn = tabsEl.querySelector(".ui-tabs > button:nth-child(1)");
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

    const unsubState = ttInstance.subscribe(onStateChange);
    return () => {
      unsubState();
    };
  }

  // ==========================================
  // 6. CẮM Ô TAB VÀO MÀN HÌNH NHÂN VẬT (CHARACTER TAB SLOT)
  // ==========================================
  mod.ui.addSlot("characterTab", {
    id: "de_tu_tab",
    title: "Đồ Đệ",
    mount(el) {
      injectMasterStyles();
      el.innerHTML = "";
      const container = document.createElement("div");
      container.className = "su-do-panel su-do-in-char-tab";
      container.style.cssText =
        "padding: 4px 0; width: 100%; box-sizing: border-box;";
      el.append(container);
      return taoSuMonDashboard(container, tt, kit, { isCharacterTab: true });
    },
  });

  // ==========================================
  // 7. CẮM Ô KHUNG NƠI CHỐN (PLACE INFO SLOT)
  // ==========================================
  mod.ui.addSlot("placeInfo", {
    id: "su_do_place_slot",
    title: "🏯 Sư Môn Đạo Tràng",
    mount(el) {
      injectMasterStyles();
      el.innerHTML = "";

      const box = document.createElement("div");
      box.style.cssText =
        "display: flex; flex-direction: column; gap: 6px; font-size: 12px; padding: 4px 0;";

      const updatePlaceSlot = () => {
        const s = tt.state();
        const data = layModData(s);
        const nv = s.run?.nhanVat;
        const maxDt = sucChuaDeTu(nv?.canhGioi ?? 0);
        const count = data.danhSachDeTu.length;
        const conLaiLichLuyen = data.danhSachDeTu.filter(
          (d) => d.trangThai?.loai === "lich_luyen",
        ).length;
        const choDotPha = data.danhSachDeTu.filter(
          (d) => (Number(d.tuVi) || 0) >= (Number(d.tuViYeuCau) || 1),
        ).length;

        box.innerHTML = `
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-weight: bold; color: var(--chu-do);">${data.daoTrangTen}</span>
            <span class="hud-phu">Đồ đệ: ${count}/${maxDt}</span>
          </div>
          <div style="font-size: 11px; color: var(--muc-nhat); line-height: 1.4;">
            ${conLaiLichLuyen > 0 ? `<span>🗺️ ${conLaiLichLuyen} đệ tử đang xuất sơn lịch luyện.<br/></span>` : ""}
            ${choDotPha > 0 ? `<span style="color: #f59e0b;">⚡ ${choDotPha} đệ tử tu vi viên mãn, sẵn sàng phá quan!<br/></span>` : ""}
            ${count === 0 ? "<span>Chưa có đồ đệ môn hạ. Mở kỳ tuyển đồ để thu nạp thiếu niên có linh căn.</span>" : ""}
          </div>
        `;

        const btnRow = document.createElement("div");
        btnRow.style.cssText = "display: flex; gap: 6px; margin-top: 2px;";

        const btnMoSuMon = kit.button({
          text: "👥 Quản Trị Sư Môn",
          kind: "chinh",
          onClick: () => {
            tt.ui.gamePanel("character", true);
            setTimeout(() => {
              const tabBtn = Array.from(
                document.querySelectorAll(
                  ".bnv-tren button, .mod-tab-nv button, button",
                ),
              ).find(
                (b) =>
                  b.textContent &&
                  (b.textContent.includes("Sư Môn") ||
                    b.textContent.includes("Đồ Đệ")),
              );
              if (tabBtn) tabBtn.click();
              else mod.ui.openPanel("dao_trang_panel");
            }, 150);
          },
        });
        btnMoSuMon.style.cssText +=
          "padding: 3px 8px; font-size: 11px; flex: 1;";
        btnRow.append(btnMoSuMon);
        box.append(btnRow);
      };

      updatePlaceSlot();
      el.append(box);
      const unsub = tt.subscribe(updatePlaceSlot);
      return () => {
        unsub();
      };
    },
  });

  // ==========================================
  // 8. TIỆN ÍCH HUD MINI-DOCK (TRỤ CỘT 5)
  // ==========================================
  mod.ui.addDock({
    id: "su_do_dock",
    title: "🏛️ Đạo Tràng",
    mount(el) {
      injectMasterStyles();
      el.innerHTML = "";

      const dockBox = document.createElement("div");
      dockBox.className = "su-do-dock-box";

      const updateDock = () => {
        const s = tt.state();
        const data = layModData(s);
        const nv = s?.run?.nhanVat;
        const maxDt = sucChuaDeTu(nv?.canhGioi ?? 0);
        const count = data.danhSachDeTu.length;
        const capTLT = Number(data.daoTrang.kienThiet.tuLinhTran.cap) || 0;
        const capDD = Number(data.daoTrang.kienThiet.duocDien.cap) || 0;
        const capHT = Number(data.daoTrang.kienThiet.hoTongDaiTran?.cap) || 0;

        const hasMaHoa = data.danhSachDeTu.some(
          (d) => d.trangThai?.loai === "ma_hoa",
        );
        const hasXongLichLuyen = data.danhSachDeTu.some(
          (d) =>
            d.trangThai?.loai === "lich_luyen" &&
            (Number(d.trangThai?.namConLai) || 0) <= 0,
        );
        const hasReadyBreakthrough = data.danhSachDeTu.some(
          (d) => (Number(d.tuVi) || 0) >= (Number(d.tuViYeuCau) || 1),
        );

        dockBox.innerHTML = `
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <b style="color:var(--chu-do); font-size:12px;">${data.daoTrangTen}</b>
            <span class="hud-phu" style="font-size:11px;">${count}/${maxDt}</span>
          </div>
          <div style="font-size:10.5px; color:var(--muc-nhat); display:flex; gap:6px;">
            <span>⚡ Tụ Linh: Lv${capTLT}</span>
            <span>🌾 Dược Điền: Lv${capDD}</span>
            <span>🛡️ Hộ Tông: Lv${capHT}</span>
          </div>
          ${hasMaHoa ? '<div style="color:#ef4444; font-weight:bold; font-size:10.5px;">🔴 Có nghịch đồ ma hóa!</div>' : ""}
          ${hasXongLichLuyen ? '<div style="color:#10b981; font-weight:bold; font-size:10.5px;">📜 Đệ tử lịch luyện đã về!</div>' : ""}
          ${hasReadyBreakthrough ? '<div style="color:#f59e0b; font-weight:bold; font-size:10.5px;">⚡ Có đệ tử chờ đột phá!</div>' : ""}
        `;

        const btnOpen = kit.button({
          text: "🏛️ Mở Đạo Tràng",
          kind: "chinh",
          onClick: () => {
            mod.ui.openPanel("dao_trang_panel");
          },
        });
        btnOpen.style.cssText +=
          "margin-top:2px; padding:2px 6px; font-size:11px; width:100%;";
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
  // 9. BẢNG ĐIỀU KHIỂN CHÍNH: ĐẠO TRÀNG (PANEL)
  // ==========================================
  mod.ui.addPanel({
    id: "dao_trang_panel",
    title: "🏛️ Đạo Tràng",
    mount(el) {
      injectMasterStyles();
      el.innerHTML = "";
      const container = document.createElement("div");
      container.className = "su-do-panel";
      container.style.cssText = "min-height: 440px; width: 100%;";
      el.append(container);
      return taoSuMonDashboard(container, tt, kit, { isCharacterTab: false });
    },
  });
}
