import { CANH_GIOI_VISUAL, KIEP_LABELS } from "./constants.js";

function getKiepTypeForRealm(realm) {
  if (realm >= 8) return "thien_kiep_toi_thuong";
  if (realm >= 5) return "tam_ma_kiep";
  if (realm >= 4) return "loi_kiep";
  return "hoa_kiep";
}

export class CinematicController {
  constructor(tt, mod, particleSystem, options) {
    this.tt = tt;
    this.mod = mod;
    this.particleSystem = particleSystem;
    this.options = options;
    this.playing = false;
    this.queue = [];
    this.lastBreakthrough = 0;
    this.cooldown = 2000;
    this.queueTimer = null;
  }

  onBreakthrough(data = {}) {
    if (!data.success || !this.options.get("bat_tat_thien_kiep")) return Promise.resolve();

    return new Promise(resolve => {
      if (this.playing || Date.now() - this.lastBreakthrough < this.cooldown) {
        if (this.queue.length >= 3) this.queue.shift().resolve();
        this.queue.push({ data, time: Date.now(), resolve });
        this._scheduleQueue();
        return;
      }
      this._playBreakthrough(data).then(resolve, error => {
        this.mod.log("[Cinematic] Playback failed:", error);
        resolve();
      });
    });
  }

  async _playBreakthrough(data) {
    this.playing = true;
    this.lastBreakthrough = Date.now();
    const realm = Number.isFinite(Number(data.realm)) ? Number(data.realm) : 1;
    const visual = CANH_GIOI_VISUAL[realm] || CANH_GIOI_VISUAL[1];
    const kiepType = visual.kiep || getKiepTypeForRealm(realm);

    try {
      this.mod.ui.toast?.(`Đột phá ${visual.ten} thành công — ${KIEP_LABELS[kiepType] || "Thiên Kiếp"}!`);
      await this.particleSystem.playCinematic(kiepType, {
        duration: 5000,
        entityName: "Đột phá thành công"
      });
      if (this.options.get("am_thanh")) this._playBreakthroughSound(kiepType);
      this._triggerScreenFlash(visual.mau);
    } finally {
      this.playing = false;
      this._scheduleQueue();
    }
  }

  _scheduleQueue() {
    if (this.playing || this.queueTimer || !this.queue.length) return;
    const delay = Math.max(0, this.cooldown - (Date.now() - this.lastBreakthrough));
    this.queueTimer = setTimeout(async () => {
      this.queueTimer = null;
      const next = this.queue.shift();
      if (!next) return;
      if (Date.now() - next.time > 15000) {
        next.resolve();
        this._scheduleQueue();
        return;
      }
      try {
        await this._playBreakthrough(next.data);
      } catch (error) {
        this.mod.log("[Cinematic] Queued playback failed:", error);
      } finally {
        next.resolve();
      }
    }, delay);
  }

  _triggerScreenFlash(color) {
    if (this.particleSystem.reducedMotion) return;
    const flash = document.createElement("div");
    flash.style.cssText = `
      position: fixed; inset: 0; pointer-events: none; z-index: 9999;
      background: radial-gradient(circle at center, ${color}40 0%, transparent 70%);
      animation: tdlk-flash 0.5s ease-out;
    `;
    const style = document.createElement("style");
    style.textContent = "@keyframes tdlk-flash { 0% { opacity: 1; } 100% { opacity: 0; } }";
    document.head.appendChild(style);
    document.body.appendChild(flash);
    setTimeout(() => { flash.remove(); style.remove(); }, 500);
  }

  _playBreakthroughSound(type) {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const now = ctx.currentTime;
      const masterGain = ctx.createGain();
      masterGain.connect(ctx.destination);
      masterGain.gain.value = 0.3;

      switch (type) {
        case "loi_kiep":
          this._playThunder(ctx, masterGain, now);
          break;
        case "hoa_kiep":
          this._playFire(ctx, masterGain, now);
          break;
        case "tam_ma_kiep":
          this._playDissonance(ctx, masterGain, now);
          break;
      }
      setTimeout(() => ctx.close(), 5000);
    } catch (error) {
      this.mod.log("[Cinematic] Audio unavailable:", error);
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
    filter.type = "highpass";
    filter.frequency.value = 200;
    const gain2 = ctx.createGain();
    gain2.gain.setValueAtTime(1, now);
    gain2.gain.exponentialRampToValueAtTime(0.01, now + 2);
    noise.connect(filter).connect(gain2).connect(gain);
    noise.start(now);
  }

  _playFire(ctx, gain, now) {
    const osc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 300;
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
    [220, 233, 247, 262].forEach((frequency, index) => {
      const osc = ctx.createOscillator();
      const gain2 = ctx.createGain();
      gain2.gain.setValueAtTime(0.1, now + index * 0.2);
      gain2.gain.exponentialRampToValueAtTime(0.01, now + 4);
      osc.type = "sine";
      osc.frequency.value = frequency;
      osc.connect(gain2).connect(gain);
      osc.start(now + index * 0.2);
      osc.stop(now + 4);
    });
  }

  async triggerTestCinematic(type = "loi_kiep") {
    await this.particleSystem.playCinematic(type, {
      duration: 3000,
      entityName: "Kiểm thử hiệu ứng"
    });
  }

  destroy() {
    clearTimeout(this.queueTimer);
    this.queueTimer = null;
    this.queue.splice(0).forEach(entry => entry.resolve());
    this.playing = false;
    this.particleSystem.cancelCinematic();
  }
}
