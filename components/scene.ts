// The picture behind the handbill: a drawing that never dries.
//
// One canvas is never cleared. Every frame a hundred or so marks are sampled from the scene
// as it is right now and laid over what is already there: thin pen lines for the sky, the
// stems and the swirls, a wide eraser where the paper should show, and fat keylined colour
// strokes for the things that give off light (the sun, the hearts of the stars, the windows,
// the flowers). A second canvas on top holds the ticker tape, redrawn from scratch each frame.

export type SceneMode = "dark" | "light";

type Sample = { a: number; l: number; w: number; T: number; fat: number; col: string | null };
type Palette = {
  bg: string; ink: string; key: string; solid: boolean;
  core: string[]; rays: string[]; petals: string[][];
};

const MARKS_PER_FRAME = 120;
const CONFETTI = 80;

const HUES = {
  core: ["255,243,107", "255,230,0", "255,255,255"],
  rays: ["255,230,0", "255,46,126", "25,195,255"],
  petals: [
    ["255,212,0", "255,233,92", "255,184,0"],
    ["255,46,126", "255,111,165", "214,0,92"],
    ["25,195,255", "127,224,255", "10,155,230"],
  ],
};

const PALETTES: Record<SceneMode, Palette> = {
  dark: { bg: "11,11,12", ink: "236,230,216", key: "11,11,12", solid: false, ...HUES },
  light: { bg: "233,226,208", ink: "14,12,12", key: "14,12,12", solid: true, ...HUES },
};

const hash = (n: number) => {
  const v = Math.sin(n * 127.1 + 11.7) * 43758.5453;
  return v - Math.floor(v);
};
const pick = <T,>(l: T[]) => l[(Math.random() * l.length) | 0];

export class Scene {
  private ctx: CanvasRenderingContext2D | null = null;
  private sctx: CanvasRenderingContext2D | null = null;
  private W = 0;
  private H = 0;
  private aspect = 1;
  private raf = 0;
  private coat = 0;
  private t = 0;
  private t0 = performance.now();
  private last = this.t0;
  private visible = true;
  private still: boolean;
  private cur: Palette;
  private skyline = new Float32Array(512);
  private bits: any[] | null = null;
  private o: Sample = { a: 0, l: 1, w: 1, T: 0, fat: 1, col: null };
  private o2: Sample = { a: 0, l: 1, w: 1, T: 0, fat: 1, col: null };
  private sc = {
    rs: 1, field: 0.8, cs: 0.11,
    sun: [0.87, 0.2, 0.105],
    // x, y (fractions of the picture), radius, spin
    stars: [[0.06, 0.13, 0.05, 1], [0.19, 0.3, 0.034, -1], [0.31, 0.08, 0.04, 1], [0.5, 0.05, 0.03, -1], [0.66, 0.11, 0.034, 1], [0.05, 0.58, 0.032, 1], [0.96, 0.6, 0.034, -1]],
    swirls: [[0.17, 0.46, 0.14, 1], [0.44, 0.28, 0.11, -1]],
  };
  private observer: IntersectionObserver | null = null;
  private onResize = () => { this.setup(); this.wake(); };

  constructor(private canvas: HTMLCanvasElement, private sprites: HTMLCanvasElement, private mode: SceneMode) {
    this.cur = PALETTES[mode];
    this.still = !!(window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches);
    window.addEventListener("resize", this.onResize);
    if ("IntersectionObserver" in window) {
      // Nothing is drawn while the picture is scrolled out of view.
      this.observer = new IntersectionObserver((entries) => {
        this.visible = entries[0].isIntersecting;
        if (this.visible) this.wake(); else this.sleep();
      });
      this.observer.observe(canvas);
    }
    this.setup();
    this.wake();
  }

  destroy() {
    this.sleep();
    window.removeEventListener("resize", this.onResize);
    this.observer?.disconnect();
  }

  /** A new ground: the old picture is drawn over, it is not wiped. */
  setMode(mode: SceneMode) {
    if (mode === this.mode) return;
    this.mode = mode;
    this.cur = PALETTES[mode];
    this.coat = 1;
    this.wake();
  }

  /** Start again from a bare ground. */
  fresh() {
    if (!this.ctx) return;
    this.ctx.fillStyle = `rgb(${this.cur.bg})`;
    this.ctx.fillRect(0, 0, this.W, this.H);
    this.coat = 1;
    this.wake();
  }

  private sleep() {
    cancelAnimationFrame(this.raf);
    this.raf = 0;
  }

  private wake() {
    if (this.raf || !this.visible) return;
    const loop = (now: number) => {
      this.raf = requestAnimationFrame(loop);
      this.frame(now);
      if (this.still && !this.coat) this.sleep(); // reduced motion: paint the picture once, then hold it
    };
    this.raf = requestAnimationFrame(loop);
  }

  private setup() {
    const c = this.canvas;
    const r = c.getBoundingClientRect();
    if (r.width < 2 || r.height < 2) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const w = Math.round(r.width * dpr), h = Math.round(r.height * dpr);
    if (this.ctx && c.width === w && c.height === h) return;
    c.width = w; c.height = h;
    this.W = w; this.H = h; this.aspect = w / h;
    this.ctx = c.getContext("2d");
    this.sprites.width = w; this.sprites.height = h;
    this.sctx = this.sprites.getContext("2d");
    const rs = Math.min(1, 0.25 + this.aspect * 0.55);
    this.sc.rs = rs; this.sc.cs = 0.11 * rs;
    // the skyline, as a height for each of 512 columns: low in the middle, tall at the edges
    const sky = this.skyline.fill(0);
    let x = -0.01, i = 0;
    while (x < 1.01) {
      const bw = (0.016 + 0.03 * hash(i * 3.1)) / Math.max(0.6, this.aspect / 1.6);
      const edge = Math.pow(Math.abs(x + bw / 2 - 0.5) * 2, 1.4);
      const ht = 0.03 + 0.05 * hash(i * 7.7) + edge * (0.04 + 0.12 * hash(i * 1.3));
      for (let k = Math.max(0, Math.floor(x * 512)); k < Math.min(512, Math.floor((x + bw) * 512)); k++) sky[k] = ht;
      x += bw; i++;
    }
    this.bits = null;
    this.ctx!.fillStyle = `rgb(${this.cur.bg})`;
    this.ctx!.fillRect(0, 0, w, h);
    this.coat = 1;
  }

  // At one point the picture wants either a fat colour mark (col) or some amount of pen ink (T).
  private sample(xf: number, yf: number, t: number, out: Sample) {
    const sc = this.sc, p = this.cur, a = this.aspect, R = Math.random;
    const X = xf * a, Y = yf;
    out.l = 1; out.w = 1; out.fat = 1; out.col = null; out.T = 0;

    // flowers thrown on the parade route: one to a cell, each a single hue
    const cs = sc.cs, ix = Math.floor(X / cs), iy = Math.floor((Y - sc.field + cs) / cs);
    if (iy >= 0) {
      const k = ix * 7.13 + iy * 31.7;
      if (hash(k + 9) > 0.22) {
        const fx = (ix + 0.5 + (hash(k) - 0.5) * 0.36) * cs, fy = sc.field - cs + (iy + 0.6 + (hash(k + 3) - 0.5) * 0.3) * cs;
        const fr = cs * (0.28 + 0.1 * hash(k + 5));
        const dx = X - fx, dy = Y - fy, q = Math.sqrt(dx * dx + dy * dy) / fr;
        if (q < 1) {
          if (q < 0.36) { out.col = p.ink; out.l = 0.22; out.w = 0.6; out.a = R() * 6.28; }
          else { out.col = pick(p.petals[(hash(k + 7) * 3) | 0]); out.l = 0.55; out.w = 0.8; out.a = Math.atan2(dy, dx) + 0.4 * Math.sin(t * 0.7 + k); }
          return;
        }
      }
    }
    const edge = sc.field + 0.012 * Math.sin(xf * 9 + 1);
    if (Y > edge) { // stems, in pen
      out.T = 0.2 + 0.22 * (0.5 + 0.5 * Math.sin(X * 21 + Y * 9));
      out.a = Math.PI / 2 + 0.75 * Math.sin(X * 34 + Y * 22 + t * 0.5);
      out.l = 0.8;
      return;
    }

    const top = edge - this.skyline[Math.min(511, Math.max(0, (xf * 512) | 0))];
    if (Y > top) { // the city: a cut-out with coloured windows
      const gx = Math.floor(xf * 150), gy = Math.floor(Y * 100);
      const blink = Math.floor(t * 0.1 + hash(gx + gy * 17.3) * 9);
      out.a = Math.PI / 2;
      if ((gx & 1) && hash(gx * 3.7 + gy * 91.3 + blink * 5.1) > 0.78) { out.col = p.rays[(hash(gx * 9.1 + gy) * 3) | 0]; out.l = 0.12; out.w = 0.42; }
      else { out.T = p.solid ? 0.985 : 0; out.l = 0.5; out.fat = 4; }
      return;
    }

    // the sky: wind, with a whirl around every light
    const a0 = -0.22 + 0.4 * Math.sin(X * 2.6 + t * 0.05 + Y * 1.7) + 0.25 * Math.sin(Y * 7 - X * 1.3 - t * 0.03);
    let vx = Math.cos(a0), vy = Math.sin(a0), hit = -1, hq = 9;
    const sr = sc.sun[2] * sc.rs, sdx = X - sc.sun[0] * a, sdy = Y - sc.sun[1], sd = Math.sqrt(sdx * sdx + sdy * sdy) + 1e-5;
    const sw = 4 * Math.exp(-(sd * sd) / (sr * sr * 6));
    vx += sw * (-sdy / sd); vy += sw * (sdx / sd);
    for (let i = 0; i < sc.stars.length; i++) {
      const s = sc.stars[i], r = s[2] * sc.rs;
      const dx = X - s[0] * a, dy = Y - s[1], d = Math.sqrt(dx * dx + dy * dy) + 1e-5;
      const w = 2.8 * Math.exp(-(d * d) / (r * r * 2.2)) * s[3];
      vx += w * (-dy / d); vy += w * (dx / d);
      if (d < r * 1.35 && d / r < hq) { hit = i; hq = d / r; }
    }
    let light = 0;
    for (let i = 0; i < sc.swirls.length; i++) {
      const s = sc.swirls[i], r = s[2] * sc.rs;
      const dx = X - s[0] * a, dy = Y - s[1], d = Math.sqrt(dx * dx + dy * dy) + 1e-5;
      const w = 3.4 * Math.exp(-(d * d) / (r * r * 1.7));
      vx += w * (-dy / d * s[3] - dx / d * 0.22); vy += w * (dx / d * s[3] - dy / d * 0.22);
      if (d < r * 2.1) {
        const band = Math.sin(d / sc.rs * 58 - t * 0.5 + Math.atan2(dy, dx) * 2 * s[3]);
        light = Math.max(light, Math.max(0, band) * (1 - d / (r * 2.1)) * 1.4);
      }
    }
    out.a = Math.atan2(vy, vx);

    // the sun: the only thing in the sky painted in colour
    const q = sd / sr;
    if (q < 1) { out.col = pick(p.core); out.l = 0.7; return; }
    if (q < 3.2) {
      const ring = Math.sin(q * 5.2 - t * 1.3 + Math.atan2(sdy, sdx) * 3);
      if (ring > 0.05 || q < 1.45) { out.col = p.rays[ring > 0.62 ? 0 : ring > 0.3 ? 1 : 2]; out.l = 0.9; return; }
      out.T = 0.03;
      return;
    }
    if (hit >= 0) {
      if (hq < 0.3) { out.col = p.rays[hit % 3]; out.l = 0.3; out.w = 0.55; return; }
      const ring = Math.sin(hq * 12 - t * 1.1 + hit);
      out.T = ring > 0.1 ? 0.8 : 0.02;
      out.l = 0.8;
      return;
    }
    const n = 0.5 + 0.5 * Math.sin(X * 8 + Math.sin(Y * 7 + t * 0.05) * 2.2 + t * 0.04);
    out.T = Math.min(0.9, 0.05 + 0.15 * n * n + light * 0.8);
  }

  // One mark: a fat keylined colour stroke, a pen line, or a swipe of the eraser.
  private stroke(u: number, big: number) {
    const W = this.W, H = this.H, ctx = this.ctx!, o = this.o, o2 = this.o2, p = this.cur;
    const xf = Math.random(), yf = Math.random();
    this.sample(xf, yf, this.t, o);
    if (o.col && big === 1 && Math.random() < 0.6) return; // colour is thick: it needs fewer marks
    let len: number, wid: number, a1 = o.a, style: string, keyed = false;
    if (o.col) {
      wid = u * (7 + 5 * Math.random()) * o.w * big;
      len = u * (22 + 28 * Math.random()) * o.l * big;
      style = `rgb(${o.col})`; keyed = true;
    } else if (Math.random() < o.T) {
      wid = u * 1.25 * o.fat;
      len = u * (22 + 42 * Math.random()) * o.l;
      if (o.T > 0.55 && o.fat < 2 && Math.random() < 0.26) a1 += 1.05; // cross-hatch the dark parts
      style = `rgba(${p.ink},0.9)`;
    } else {
      wid = u * 4.4 * big;
      len = u * (16 + 22 * Math.random()) * o.l * big;
      style = `rgba(${p.bg},0.88)`;
    }
    const x = xf * W, y = yf * H;
    this.sample((x + Math.cos(a1) * len) / W, (y + Math.sin(a1) * len) / H, this.t, o2);
    let da = a1 === o.a ? o2.a - a1 : 0;
    while (da > Math.PI) da -= 2 * Math.PI;
    while (da < -Math.PI) da += 2 * Math.PI;
    if (Math.abs(da) > 1.3) da = 0; // the far end is in another part of the picture
    ctx.lineCap = "round"; ctx.lineJoin = "round";
    for (let pass = keyed ? 0 : 1; pass < 2; pass++) {
      ctx.lineWidth = pass ? wid : wid + u * 3;
      ctx.strokeStyle = pass ? style : `rgb(${p.key})`;
      let px = x - Math.cos(a1) * len * 0.5, py = y - Math.sin(a1) * len * 0.5, ang = a1 - da * 0.5;
      ctx.beginPath(); ctx.moveTo(px, py);
      for (let s = 0; s < 3; s++) { ang += da / 3; px += Math.cos(ang) * len / 3; py += Math.sin(ang) * len / 3; ctx.lineTo(px, py); }
      ctx.stroke();
    }
  }

  // Ticker tape in three colours, falling in front of the picture.
  private confetti(dt: number) {
    const c = this.sctx;
    if (!c) return;
    const W = this.W, H = this.H, p = this.cur;
    c.clearRect(0, 0, W, H);
    if (this.still) return;
    if (!this.bits) {
      this.bits = [];
      for (let i = 0; i < CONFETTI; i++) {
        this.bits.push({
          x: Math.random(), y: Math.random(), vy: 0.03 + Math.random() * 0.07, vx: (Math.random() - 0.5) * 0.02,
          r: Math.random() * 6, vr: (Math.random() - 0.5) * 3.4, s: 2.5 + Math.random() * 5.5, f: 0.6 + Math.random(),
          hue: Math.random() < 0.45 ? -1 : (Math.random() * 3) | 0, al: 0.45 + Math.random() * 0.5,
        });
      }
    }
    const u = Math.sqrt(W * H) / 1100;
    for (const f of this.bits) {
      f.y += f.vy * dt; f.x += (f.vx + Math.sin(this.t * f.f + f.r) * 0.012) * dt; f.r += f.vr * dt;
      if (f.y > 1.04) { f.y = -0.04; f.x = Math.random(); }
      c.save();
      c.translate(f.x * W, f.y * H); c.rotate(f.r); c.scale(1, Math.cos(f.r * 1.7));
      c.globalAlpha = f.al;
      c.fillStyle = `rgb(${f.hue < 0 ? p.ink : p.rays[f.hue]})`;
      c.fillRect(-f.s * u, -f.s * u * 0.32, f.s * u * 2, f.s * u * 0.64);
      c.restore();
    }
  }

  private frame(now: number) {
    if (!this.ctx) { this.setup(); if (!this.ctx) return; }
    this.t = (now - this.t0) / 1000;
    const dt = Math.min(0.05, (now - this.last) / 1000);
    this.last = now;
    const u = Math.sqrt(this.W * this.H) / 1100;
    this.coat = Math.max(0, this.coat - 0.012);
    // a fresh ground gets a quick undercoat of bigger marks, then the picture settles
    const n = Math.round(MARKS_PER_FRAME + 1100 * this.coat), big = 1 + 0.8 * this.coat;
    for (let i = 0; i < n; i++) this.stroke(u, big);
    this.confetti(dt);
  }
}
