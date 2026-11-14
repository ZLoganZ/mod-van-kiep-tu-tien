// lib/core.js - Particle System (Ambient + Cinematic)

import { QUALITY_PRESETS, BIOME_CONFIG, CANH_GIOI_VISUAL } from "./constants.js";

/** Simple Perlin noise cho flow field */
class PerlinNoise {
  constructor(seed = Math.random()) {
    this.perm = new Uint8Array(512);
    const p = new Uint8Array(256);
    for (let i = 0; i < 256; i++) p[i] = i;
    // Fisher-Yates shuffle với seed
    let s = seed;
    for (let i = 255; i > 0; i--) {
      s = (s * 1664525 + 1013904223) >>> 0;
      const j = s % (i + 1);
      [p[i], p[j]] = [p[j], p[i]];
    }
    for (let i = 0; i < 512; i++) this.perm[i] = p[i & 255];
  }
  fade(t) { return t * t * t * (t * (t * 6 - 15) + 10); }
  lerp(a, b, t) { return a + t * (b - a); }
  grad(hash, x, y) {
    const h = hash & 3;
    const u = h < 2 ? x : y;
    const v = h < 2 ? y : x;
    return ((h & 1) ? -u : u) + ((h & 2) ? -v : v);
  }
  noise2D(x, y) {
    const X = Math.floor(x) & 255, Y = Math.floor(y) & 255;
    x -= Math.floor(x); y -= Math.floor(y);
    const u = this.fade(x), v = this.fade(y);
    const A = this.perm[X] + Y, B = this.perm[X + 1] + Y;
    return this.lerp(
      this.lerp(this.grad(this.perm[A], x, y), this.grad(this.perm[B], x - 1, y), u),
      this.lerp(this.grad(this.perm[A + 1], x, y - 1), this.grad(this.perm[B + 1], x - 1, y - 1), u),
      v
    );
  }
  fbm(x, y, octaves = 4, persistence = 0.5, lacunarity = 2.0) {
    let value = 0, amplitude = 1, frequency = 1, max = 0;
    for (let i = 0; i < octaves; i++) {
      value += this.noise2D(x * frequency, y * frequency) * amplitude;
      max += amplitude;
      amplitude *= persistence;
      frequency *= lacunarity;
    }
    return value / max;
  }
}

/** Particle class */
class Particle {
  constructor(x, y, config) {
    this.x = x; this.y = y;
    this.vx = 0; this.vy = 0;
    this.life = 1; this.maxLife = 1;
    this.size = 2 + Math.random() * 3;
    this.baseHue = config.hue;
    this.saturation = config.saturation;
    this.opacity = 0.3 + Math.random() * 0.4;
    this.type = "ambient"; // ambient | cinematic | breakthrough
    this.trail = [];
    this.maxTrail = 8;
  }
  update(dt, flowField, config) {
    // Flow field velocity
    const angle = flowField.getAngle(this.x, this.y) + (Math.random() - 0.5) * 0.3;
    const speed = config.speed * (0.5 + Math.random() * 0.5);
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    this.x += this.vx * dt * 60;
    this.y += this.vy * dt * 60;

    // Trail
    this.trail.push({ x: this.x, y: this.y, opacity: this.opacity });
    if (this.trail.length > this.maxTrail) this.trail.shift();

    // Wrap around screen (ambient) or die (cinematic)
    if (this.type === "ambient") {
      if (this.x < -50) this.x = flowField.width + 50;
      if (this.x > flowField.width + 50) this.x = -50;
      if (this.y < -50) this.y = flowField.height + 50;
      if (this.y > flowField.height + 50) this.y = -50;
    }
    this.life -= dt;
  }
  draw(ctx, config) {
    if (this.type === "cinematic" || this.type === "breakthrough") {
      // Draw trail first
      ctx.beginPath();
      for (let i = 0; i < this.trail.length; i++) {
        const t = this.trail[i];
        const alpha = t.opacity * (i / this.trail.length) * 0.5;
        const size = this.size * (i / this.trail.length);
        ctx.globalAlpha = alpha;
        ctx.fillStyle = `hsl(${this.baseHue}, ${this.saturation * 100}%, 60%)`;
        ctx.beginPath();
        ctx.arc(t.x, t.y, size, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    // Main particle
    ctx.globalAlpha = this.opacity * this.life;
    const hueShift = this.type === "breakthrough" ? (Date.now() / 50) % 60 : 0;
    ctx.fillStyle = `hsl(${(this.baseHue + hueShift) % 360}, ${this.saturation * 100}%, 65%)`;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size * this.life, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }
}

/** Flow Field cho ambient particles */
class FlowField {
  constructor(width, height, resolution = 40, noise) {
    this.width = width; this.height = height;
    this.resolution = resolution;
    this.cols = Math.ceil(width / resolution);
    this.rows = Math.ceil(height / resolution);
    this.noise = noise;
    this.field = new Float32Array(this.cols * this.rows);
    this.time = 0;
    this.update();
  }
  update() {
    this.time += 0.003;
    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        const n = this.noise.fbm(
          x * 0.1 + this.time * 0.1,
          y * 0.1 + this.time * 0.05,
          3, 0.5, 2.0
        );
        const angle = n * Math.PI * 4;
        this.field[y * this.cols + x] = angle;
      }
    }
  }
  getAngle(x, y) {
    const col = Math.floor(x / this.resolution);
    const row = Math.floor(y / this.resolution);
    if (col < 0 || col >= this.cols || row < 0 || row >= this.rows) return 0;
    return this.field[row * this.cols + col];
  }
  resize(width, height) {
    this.width = width; this.height = height;
    this.cols = Math.ceil(width / this.resolution);
    this.rows = Math.ceil(height / this.resolution);
    this.field = new Float32Array(this.cols * this.rows);
  }
}

/** Main Particle System */
export class ParticleSystem {
  constructor(tt, mod) {
    this.tt = tt; this.mod = mod;
    this.canvas = null; this.ctx = null;
    this.particles = [];
    this.flowField = null;
    this.noise = new PerlinNoise(Date.now());
    this.running = false; this.animId = null;
    this.lastTime = 0;
    this.fps = 60; this.frameCount = 0; this.fpsTime = 0;
    this.currentBiome = "default";
    this.quality = "cao";
    this.cinematicParticles = [];
    this.cinematicRunning = false;

    // Bind methods
    this._animate = this._animate.bind(this);
    this._resize = this._resize.bind(this);
    this._onVisibilityChange = this._onVisibilityChange.bind(this);

    // Listen quality changes
    this._qualityUnsub = mod.onOptionChange?.("chat_luong", (v) => this.setQuality(v));
  }

  /** Khởi tạo canvas */
  init() {
    if (this.canvas) return;
    this.canvas = document.createElement("canvas");
    this.canvas.className = "tdlk-ambient-canvas";
    this.canvas.style.cssText = "position:fixed;top:0;left:0;width:100vw;height:100vh;pointer-events:none;z-index:1;opacity:0.6;";
    document.body.appendChild(this.canvas);
    this.ctx = this.canvas.getContext("2d", { alpha: true, desynchronized: true });
    this._resize();
    window.addEventListener("resize", this._resize);
    document.addEventListener("visibilitychange", this._onVisibilityChange);
    this._updateBiome();
  }

  /** Bắt đầu ambient loop */
  startAmbient() {
    if (this.running) return;
    this.init();
    this.running = true;
    this._spawnAmbientParticles();
    this.lastTime = performance.now();
    this.animId = requestAnimationFrame(this._animate);
    this.canvas.classList.remove("tdlk-hidden");
    this.mod.log("[TDLK] Ambient started");
  }

  /** Dừng ambient */
  stopAmbient() {
    this.running = false;
    if (this.animId) cancelAnimationFrame(this.animId);
    this.animId = null;
    this.canvas?.classList.add("tdlk-hidden");
    this.mod.log("[TDLK] Ambient stopped");
  }

  /** Set quality preset */
  setQuality(preset) {
    this.quality = preset;
    const q = QUALITY_PRESETS[preset] || QUALITY_PRESETS.cao;
    this.targetFPS = q.fpsCap;
    this.maxParticles = q.maxParticles;
    this.cinematicMaxParticles = q.cinematicParticles;
    this.canvas?.classList.toggle("tdlk-quality-thap", preset === "thap");
    // Respawn particles to match new count
    if (this.running) this._spawnAmbientParticles();
    this.mod.log(`[TDLK] Quality set to ${preset}`);
  }

  /** Set biome (gọi khi player đổi nơi chốn) */
  setBiome(biome) {
    if (BIOME_CONFIG[biome]) {
      this.currentBiome = biome;
      this._updateBiome();
    }
  }

  /** Trigger cinematic breakthrough */
  async playCinematic(type, data = {}) {
    if (this.cinematicRunning) return;
    this.cinematicRunning = true;
    this.mod.log(`[TDLK] Cinematic start: ${type}`);

    const cinematicCanvas = document.createElement("canvas");
    cinematicCanvas.className = "tdlk-cinematic-canvas";
    const overlay = document.createElement("div");
    overlay.className = `tdlk-cinematic-overlay tdlk-cinematic-${type}`;
    overlay.appendChild(cinematicCanvas);
    document.body.appendChild(overlay);

    const cinematicCtx = cinematicCanvas.getContext("2d", { alpha: true });
    const rect = cinematicCanvas.getBoundingClientRect();
    cinematicCanvas.width = rect.width * devicePixelRatio;
    cinematicCanvas.height = rect.height * devicePixelRatio;
    cinematicCtx.scale(devicePixelRatio, devicePixelRatio);

    // Force reflow then activate
    overlay.offsetHeight;
    overlay.classList.add("tdlk-active");

    // Spawn cinematic particles
    this._spawnCinematicParticles(type, cinematicCanvas.width, cinematicCanvas.height);

    // Animate cinematic
    const duration = data.duration || 5000;
    const startTime = performance.now();
    const animateCinematic = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Clear
      cinematicCtx.clearRect(0, 0, cinematicCanvas.width, cinematicCanvas.height);

      // Draw particles
      this.cinematicParticles.forEach(p => {
        p.update(elapsed / 1000, { getAngle: () => 0 }, BIOME_CONFIG.thien_kiep);
        p.draw(cinematicCtx, BIOME_CONFIG.thien_kiep);
      });

      // Clean dead
      this.cinematicParticles = this.cinematicParticles.filter(p => p.life > 0);

      // Type-specific effects
      this._drawCinematicEffects(cinematicCtx, type, progress, cinematicCanvas.width, cinematicCanvas.height);

      if (progress < 1 && this.cinematicRunning) {
        requestAnimationFrame(animateCinematic);
      } else {
        // Fade out
        overlay.classList.remove("tdlk-active");
        setTimeout(() => {
          overlay.remove();
          this.cinematicRunning = false;
          this.cinematicParticles = [];
          this.mod.log(`[TDLK] Cinematic end: ${type}`);
        }, 500);
      }
    };
    requestAnimationFrame(animateCinematic);

    return new Promise(r => setTimeout(r, duration + 500));
  }

  /** Vẽ hiệu ứng đặc biệt theo loại kiếp */
  _drawCinematicEffects(ctx, type, progress, w, h) {
    const centerX = w / 2, centerY = h / 2;

    switch (type) {
      case "loi_kiep":
        // Lightning bolts
        if (progress > 0.2 && progress < 0.8 && Math.random() < 0.3) {
          this._drawLightning(ctx, centerX, 0, centerX + (Math.random() - 1) * 200, h, "#60a5fa");
        }
        break;
      case "hoa_kiep":
        // Fire rings expanding
        const ringCount = 3;
        for (let i = 0; i < ringCount; i++) {
          const ringProgress = (progress * ringCount - i) / ringCount;
          if (ringProgress > 0 && ringProgress < 1) {
            const r = ringProgress * Math.max(w, h) * 0.8;
            ctx.strokeStyle = `hsla(20, 100%, 60%, ${1 - ringProgress})`;
            ctx.lineWidth = 3 * (1 - ringProgress);
            ctx.beginPath();
            ctx.arc(centerX, centerY, r, 0, Math.PI * 2);
            ctx.stroke();
          }
        }
        break;
      case "tam_ma_kiep":
        // Distortion waves
        for (let i = 0; i < 5; i++) {
          const waveProgress = (progress * 5 - i) / 5;
          if (waveProgress > 0 && waveProgress < 1) {
            ctx.strokeStyle = `hsla(270, 80%, 70%, ${0.3 * (1 - waveProgress)})`;
            ctx.lineWidth = 2;
            ctx.beginPath();
            for (let x = 0; x < w; x += 10) {
              const y = centerY + Math.sin(x * 0.02 + waveProgress * 10) * 50 * waveProgress * (1 - waveProgress);
              if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
            }
            ctx.stroke();
          }
        }
        break;
    }
  }

  /** Vẽ sét */
  _drawLightning(ctx, x1, y1, x2, y2, color) {
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    const segments = 10;
    for (let i = 1; i <= segments; i++) {
      const t = i / segments;
      const nx = x1 + (x2 - x1) * t + (Math.random() - 0.5) * 60 * (1 - t * 0.5);
      const ny = y1 + (y2 - y1) * t;
      ctx.lineTo(nx, ny);
    }
    ctx.stroke();
    // Glow
    ctx.strokeStyle = color + "80";
    ctx.lineWidth = 6;
    ctx.stroke();
  }

  /** Animation loop chính */
  _animate(now) {
    if (!this.running) return;
    const dt = Math.min((now - this.lastTime) / 1000, 0.1);
    this.lastTime = now;

    // FPS tracking
    this.frameCount++; this.fpsTime += dt;
    if (this.fpsTime >= 1) { this.fps = this.frameCount; this.frameCount = 0; this.fpsTime = 0; }

    // Auto quality down
    if (this.mod.options.giam_toc_do_nguyen && this.fps < 25 && this.quality !== "thap") {
      this.setQuality(this.quality === "cao" ? "trung_binh" : "thap");
    }

    // Update flow field
    this.flowField?.update();

    // Update particles
    const config = BIOME_CONFIG[this.currentBiome] || BIOME_CONFIG.default;
    for (const p of this.particles) {
      p.update(dt, this.flowField, config);
    }
    // Remove dead (cinematic particles mixed in)
    this.particles = this.particles.filter(p => p.life > 0 || p.type === "ambient");

    // Maintain particle count
    while (this.particles.filter(p => p.type === "ambient").length < this.maxParticles) {
      this._spawnOneAmbient();
    }

    // Draw
    this._draw(config);

    this.animId = requestAnimationFrame(this._animate);
  }

  _draw(config) {
    const { width, height } = this.canvas;
    this.ctx.clearRect(0, 0, width, height);

    // Sort by life for layering
    this.particles.sort((a, b) => a.life - b.life);

    for (const p of this.particles) {
      p.draw(this.ctx, config);
    }

    // Weather overlay
    this._drawWeather(config);
  }

  _drawWeather(config) {
    if (config.weather === "rain" && Math.random() < 0.1) {
      this.ctx.strokeStyle = "rgba(100,150,255,0.3)";
      this.ctx.lineWidth = 1;
      for (let i = 0; i < 5; i++) {
        const x = Math.random() * this.canvas.width;
        const y = Math.random() * this.canvas.height;
        this.ctx.beginPath();
        this.ctx.moveTo(x, y);
        this.ctx.lineTo(x + 2, y + 15);
        this.ctx.stroke();
      }
    } else if (config.weather === "mist") {
      const g = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
      g.addColorStop(0, "rgba(200,220,255,0.02)");
      g.addColorStop(1, "rgba(180,200,255,0.05)");
      this.ctx.fillStyle = g;
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    } else if (config.weather === "ember") {
      for (let i = 0; i < 3; i++) {
        const x = Math.random() * this.canvas.width;
        const y = this.canvas.height - Math.random() * 100;
        const r = 2 + Math.random() * 3;
        this.ctx.fillStyle = `hsla(${20 + Math.random() * 20}, 100%, 60%, ${0.3 + Math.random() * 0.3})`;
        this.ctx.beginPath();
        this.ctx.arc(x, y, r, 0, Math.PI * 2);
        this.ctx.fill();
      }
    } else if (config.weather === "golden") {
      for (let i = 0; i < 2; i++) {
        const x = Math.random() * this.canvas.width;
        const y = Math.random() * this.canvas.height;
        const r = 1 + Math.random() * 2;
        this.ctx.fillStyle = `hsla(${50 + Math.random() * 10}, 80%, 70%, ${0.2 + Math.random() * 0.2})`;
        this.ctx.beginPath();
        this.ctx.arc(x, y, r, 0, Math.PI * 2);
        this.ctx.fill();
      }
    } else if (config.weather === "sparkle") {
      for (let i = 0; i < 4; i++) {
        const x = Math.random() * this.canvas.width;
        const y = Math.random() * this.canvas.height;
        const r = 1 + Math.random() * 1.5;
        this.ctx.fillStyle = `hsla(${280 + Math.random() * 40}, 80%, 80%, ${0.4 + Math.random() * 0.3})`;
        this.ctx.beginPath();
        this.ctx.arc(x, y, r, 0, Math.PI * 2);
        this.ctx.fill();
      }
    } else if (config.weather === "storm") {
      // Intense particles handled by cinematic
    }
  }

  _spawnAmbientParticles() {
    const count = this.maxParticles;
    for (let i = 0; i < count; i++) this._spawnOneAmbient();
  }

  _spawnOneAmbient() {
    const config = BIOME_CONFIG[this.currentBiome] || BIOME_CONFIG.default;
    const x = Math.random() * (this.canvas?.width || 800);
    const y = Math.random() * (this.canvas?.height || 600);
    const p = new Particle(x, y, config);
    p.type = "ambient";
    p.life = 1; p.maxLife = 1;
    this.particles.push(p);
  }

  _spawnCinematicParticles(type, w, h) {
    const count = this.cinematicMaxParticles || 200;
    const config = BIOME_CONFIG.thien_kiep;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = Math.random() * Math.max(w, h) * 0.5;
      const x = w / 2 + Math.cos(angle) * r;
      const y = h / 2 + Math.sin(angle) * r;
      const p = new Particle(x, y, config);
      p.type = "cinematic";
      p.life = 1 + Math.random() * 2;
      p.maxLife = p.life;
      p.size = 3 + Math.random() * 5;
      p.opacity = 0.5 + Math.random() * 0.5;
      p.maxTrail = 15;
      this.cinematicParticles.push(p);
    }
  }

  _updateBiome() {
    const config = BIOME_CONFIG[this.currentBiome] || BIOME_CONFIG.default;
    if (this.canvas) {
      this.canvas.style.opacity = config.weather === "none" ? "0.5" : "0.7";
    }
  }

  _resize() {
    if (!this.canvas) return;
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = window.innerWidth * dpr;
    this.canvas.height = window.innerHeight * dpr;
    this.canvas.style.width = window.innerWidth + "px";
    this.canvas.style.height = window.innerHeight + "px";
    this.ctx.scale(dpr, dpr);
    if (this.flowField) {
      this.flowField.resize(window.innerWidth, window.innerHeight);
    } else {
      this.flowField = new FlowField(window.innerWidth, window.innerHeight, 40, this.noise);
    }
  }

  _onVisibilityChange() {
    if (document.hidden) {
      this.stopAmbient();
    } else if (this.mod.options.bat_tat_linh_khi) {
      this.startAmbient();
    }
  }

  /** Cleanup */
  destroy() {
    this.stopAmbient();
    window.removeEventListener("resize", this._resize);
    document.removeEventListener("visibilitychange", this._onVisibilityChange);
    this.canvas?.remove();
    this.canvas = null;
    this._qualityUnsub?.();
  }

  /** Public API cho avatar visual */
  getVisualForRealm(realm) {
    return CANH_GIOI_VISUAL[realm] || CANH_GIOI_VISUAL[0];
  }

  getVisualForBreakthrough(tuVi, tuViYeuCau) {
    return tuVi >= tuViYeuCau ? "breakthrough_ready" : "cultivating";
  }
}