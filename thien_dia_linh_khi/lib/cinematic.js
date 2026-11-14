// lib/cinematic.js - Breakthrough Cinematic Controller

import { CANH_GIOI_VISUAL } from "./constants.js";

export class CinematicController {
  constructor(tt, mod, particleSystem) {
    this.tt = tt; this.mod = mod; this.particleSystem = particleSystem;
    this.playing = false;
    this.queue = [];
    this.lastBreakthrough = 0;
    this.cooldown = 2000; // ms giữa 2 cinematic
  }

  /** Trigger khi player/đệ tử đột phá */
  async onBreakthrough(entity, data = {}) {
    if (!this.mod.options.bat_tat_thien_kiep) return;
    if (this.playing) {
      this.queue.push({ entity, data, time: Date.now() });
      return;
    }
    const now = Date.now();
    if (now - this.lastBreakthrough < this.cooldown) {
      this.queue.push({ entity, data, time: now });
      return;
    }
    this.lastBreakthrough = now;
    await this._playBreakthrough(entity, data);
    this._processQueue();
  }

  _processQueue() {
    if (this.queue.length === 0) return;
    const next = this.queue.shift();
    if (Date.now() - next.time > 5000) return; // bỏ qua nếu quá cũ
    setTimeout(() => this._playBreakthrough(next.entity, next.data), 500);
  }

  async _playBreakthrough(entity, data) {
    this.playing = true;
    const isPlayer = entity?.id === this.tt.state()?.run?.nhanVat?.id;
    const realm = Number(entity?.canhGioi ?? data.realm ?? 1);
    const visual = CANH_GIOI_VISUAL[realm] || CANH_GIOI_VISUAL[1];
    const kiepType = visual.kiep || (realm >= 4 ? "loi_kiep" : "hoa_kiep");

    // Toast notification
    this.tt.ui.toast(`${isPlayer ? "Sư Tôn" : entity?.ten ?? "Đệ tử"} đang độ kiếp ${this._kiepName(kiepType)}!`);

    // Play cinematic
    try {
      await this.particleSystem.playCinematic(kiepType, {
        duration: isPlayer ? 6000 : 4000,
        realm,
        entityName: entity?.ten
      });
    } catch (e) {
      this.mod.log("[Cinematic] Error:", e);
    }

    // Post-cinematic effects
    if (isPlayer) {
      this._triggerScreenFlash(visual.mau);
      if (this.mod.options.am_thanh) this._playBreakthroughSound(kiepType);
    }

    this.playing = false;
  }

  _kiepName(type) {
    const names = {
      loi_kiep: "Lôi Kiếp",
      hoa_kiep: "Hỏa Kiếp",
      tam_ma_kiep: "Tâm Ma Kiếp",
      thien_kiep_toi_thuong: "Thiên Kiếp Tối Thượng"
    };
    return names[type] || "Thiên Kiếp";
  }

  _triggerScreenFlash(color) {
    const flash = document.createElement("div");
    flash.style.cssText = `
      position: fixed; inset: 0; pointer-events: none; z-index: 9999;
      background: radial-gradient(circle at center, ${color}40 0%, transparent 70%);
      animation: tdlk-flash 0.5s ease-out;
    `;
    const style = document.createElement("style");
    style.textContent = `@keyframes tdlk-flash { 0% { opacity: 1; } 100% { opacity: 0; } }`;
    document.head.appendChild(style);
    document.body.appendChild(flash);
    setTimeout(() => { flash.remove(); style.remove(); }, 500);
  }

  _playBreakthroughSound(type) {
    // Tạo âm thanh procedural (Web Audio API)
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const now = ctx.currentTime;

      const masterGain = ctx.createGain();
      masterGain.connect(ctx.destination);
      masterGain.gain.value = 0.3;

      switch (type) {
        case "loi_kiep":
          // Thunder crack
          this._playThunder(ctx, masterGain, now);
          break;
        case "hoa_kiep":
          // Fire whoosh
          this._playFire(ctx, masterGain, now);
          break;
        case "tam_ma_kiep":
          // Dissonant chord
          this._playDissonance(ctx, masterGain, now);
          break;
      }
    } catch (e) {
      // Audio blocked or not supported
    }
  }

  _playThunder(ctx, gain, now) {
    const noise = ctx.createBufferSource();
    const buffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < buffer.length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.5));
    }
    noise.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = "highpass"; filter.frequency.value = 200;
    const gain2 = ctx.createGain();
    gain2.gain.setValueAtTime(1, now);
    gain2.gain.exponentialRampToValueAtTime(0.01, now + 2);
    noise.connect(filter).connect(gain2).connect(gain);
    noise.start(now);
  }

  _playFire(ctx, gain, now) {
    const osc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass"; filter.frequency.value = 300;
    const gain2 = ctx.createGain();
    gain2.gain.setValueAtTime(0.5, now);
    gain2.gain.exponentialRampToValueAtTime(0.01, now + 3);
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(100, now);
    osc.frequency.exponentialRampToValueAtTime(50, now + 3);
    osc.connect(filter).connect(gain2).connect(gain);
    osc.start(now);
    osc.stop(now + 3);
  }

  _playDissonance(ctx, gain, now) {
    [220, 233, 247, 262].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain2 = ctx.createGain();
      gain2.gain.setValueAtTime(0.1, now + i * 0.2);
      gain2.gain.exponentialRampToValueAtTime(0.01, now + 4);
      osc.type = "sine";
      osc.frequency.value = freq;
      osc.connect(gain2).connect(gain);
      osc.start(now + i * 0.2);
      osc.stop(now + 4);
    });
  }

  /** Manual trigger từ UI */
  async triggerTestCinematic(type = "loi_kiep") {
    const mockEntity = { id: "test", ten: "Test", canhGioi: 4 };
    await this.onBreakthrough(mockEntity, { realm: 4 });
  }

  /** Cleanup */
  destroy() {
    this.queue = [];
    this.playing = false;
  }
}