// The picture behind the card: a drawing that never dries.
//
// The canvas is never cleared. Every frame a few dozen marks are sampled from the scene as it
// is right now and laid over what is already there: thin pen lines for the sky, the swirls
// and the grass, a wide eraser where the ground should show, fat keylined colour strokes for
// the sun and the flowers, and a flat silhouette for the city.
//
// On a wide screen the card sits in the middle and the picture shows all round it. On a
// phone the card is nearly as wide as the screen, so the scene is arranged round it instead:
// the sun and the sky go in the band above the card, the city and the flowers below it.

export type SceneMode = "dark" | "light";

type Sample = { a: number; l: number; w: number; T: number; col: string | null; plain: boolean };
type Palette = {
  bg: string; ink: string; key: string; city: string;
  core: string[]; rays: string[]; petals: string[][];
};
// x, y (fractions of the picture), radius, spin
type Whirl = [number, number, number, number];
type Layout = { field: number; sun: [number, number, number]; stars: Whirl[]; swirls: Whirl[] };

const MARKS_PER_FRAME = 40;
const FLOWERS = 0.5; // share of the field's cells that hold a flower
const FIRST_COAT = 0.0055; // per frame: a new ground takes about three seconds to cover

// Colours are "r,g,b" so they drop straight into rgb() and rgba().
const CORE = ["255,244,200", "255,255,255", "255,214,90"];
const ORANGE = ["232,100,27", "245,140,60", "200,80,20"];
const CREAM = ["255,244,200", "255,255,255", "240,220,150"];

const PALETTES: Record<SceneMode, Palette> = {
  // Arles by day: dark olive ink on sunflower yellow
  light: {
    bg: "232,184,48", ink: "40,44,24", key: "40,44,24", city: "40,44,24",
    core: CORE, rays: ["232,100,27", "31,138,138", "255,244,200"],
    petals: [ORANGE, ["31,138,138", "70,170,165", "20,105,110"], CREAM],
  },
  // and by night: the same drawing inside out, yellow lines on olive-black
  dark: {
    bg: "29,32,18", ink: "232,184,48", key: "16,18,10", city: "12,14,8",
    core: CORE, rays: ["232,100,27", "47,179,174", "255,244,200"],
    petals: [ORANGE, ["47,179,174", "110,210,200", "31,138,138"], CREAM],
  },
};

const WIDE: Layout = {
  field: 0.82,
  sun: [0.87, 0.2, 0.1],
  stars: [[0.07, 0.14, 0.045, 1], [0.33, 0.08, 0.036, -1], [0.62, 0.1, 0.032, 1]],
  swirls: [[0.17, 0.44, 0.13, 1]],
};

// A tall screen, given where the card's top and bottom edges fall (fractions of the height).
function tall(top: number, bottom: number): Layout {
  const band = Math.max(0.12, top);
  return {
    field: Math.min(0.95, bottom + 0.017),
    sun: [0.78, band * 0.48, band * 0.48],
    stars: [[0.1, band * 0.23, 0.04, 1], [0.46, band * 0.16, 0.034, -1]],
    swirls: [[0.26, band * 0.6, band * 0.46, 1]],
  };
}

const hash = (n: number) => {
  const v = Math.sin(n * 127.1 + 11.7) * 43758.5453;
  return v - Math.floor(v);
};
const pick = <T,>(l: T[]) => l[(Math.random() * l.length) | 0];

export class Scene {
  private ctx: CanvasRenderingContext2D | null = null;
  private W = 0;
  private H = 0;
  private aspect = 1;
  private isTall = false;
  private rs = 1; // how much the lights shrink on a narrow picture
  private cs = 0.11; // size of one flower's cell
  private layout: Layout = WIDE;
  private raf = 0;
  private coat = 0;
  private t = 0;
  private t0 = performance.now();
  private visible = true;
  private still: boolean;
  private cur: Palette;
  private skyline = new Float32Array(512);
  private o: Sample = { a: 0, l: 1, w: 1, T: 0, col: null, plain: false };
  private o2: Sample = { a: 0, l: 1, w: 1, T: 0, col: null, plain: false };
  private observer: IntersectionObserver | null = null;
  private resizes: ResizeObserver | null = null;
  private onResize = () => { this.setup(); this.wake(); };

  constructor(private canvas: HTMLCanvasElement, private mode: SceneMode, private card: HTMLElement | null = null) {
    this.cur = PALETTES[mode];
    this.still = !!(window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches);
    window.addEventListener("resize", this.onResize);
    if ("ResizeObserver" in window) {
      // fonts arriving can change the card's height, and with it the picture's
      this.resizes = new ResizeObserver(this.onResize);
      this.resizes.observe(canvas);
    }
    if ("IntersectionObserver" in window) {
      // nothing is drawn while the picture is scrolled out of view
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
    this.resizes?.disconnect();
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
    this.isTall = this.aspect < 0.8;
    this.rs = Math.min(1, 0.25 + this.aspect * 0.55);
    this.cs = (this.isTall ? 0.12 : 0.11) * this.rs;
    if (this.isTall) {
      const k = this.card?.getBoundingClientRect();
      this.layout = k && k.height > 0 ? tall((k.top - r.top) / r.height, (k.bottom - r.top) / r.height) : tall(0.22, 0.88);
    } else {
      this.layout = WIDE;
    }
    // the skyline, as a height for each of 512 columns: low in the middle, taller at the edges
    const sky = this.skyline.fill(0);
    const scale = this.isTall ? 0.3 : 1;
    let x = -0.01, i = 0;
    while (x < 1.01) {
      const bw = this.isTall ? 0.03 + 0.05 * hash(i * 3.1) : (0.016 + 0.03 * hash(i * 3.1)) / Math.max(0.6, this.aspect / 1.6);
      const edge = Math.pow(Math.abs(x + bw / 2 - 0.5) * 2, 1.4);
      const ht = (0.025 + 0.04 * hash(i * 7.7) + edge * (0.03 + 0.1 * hash(i * 1.3))) * scale;
      for (let k = Math.max(0, Math.floor(x * 512)); k < Math.min(512, Math.floor((x + bw) * 512)); k++) sky[k] = ht;
      x += bw; i++;
    }
    this.ctx!.fillStyle = `rgb(${this.cur.bg})`;
    this.ctx!.fillRect(0, 0, w, h);
    this.coat = 1;
  }

  // At one point the picture wants either a fat colour mark (col) or some amount of pen ink (T).
  private sample(xf: number, yf: number, t: number, out: Sample) {
    const sc = this.layout, p = this.cur, a = this.aspect, rs = this.rs, R = Math.random;
    const X = xf * a, Y = yf;
    out.l = 1; out.w = 1; out.col = null; out.T = 0; out.plain = false;

    // flowers: one to a cell, each a single hue
    const cs = this.cs, ix = Math.floor(X / cs), iy = Math.floor((Y - sc.field + cs) / cs);
    if (iy >= 0) {
      const k = ix * 7.13 + iy * 31.7;
      if (hash(k + 9) > 1 - FLOWERS) {
        const fx = (ix + 0.5 + (hash(k) - 0.5) * 0.36) * cs, fy = sc.field - cs + (iy + 0.6 + (hash(k + 3) - 0.5) * 0.3) * cs;
        const fr = cs * (0.28 + 0.1 * hash(k + 5));
        const dx = X - fx, dy = Y - fy, q = Math.sqrt(dx * dx + dy * dy) / fr;
        if (q < 1) {
          if (q < 0.36) { out.col = p.ink; out.l = 0.22; out.w = 0.6; out.a = R() * 6.28; }
          else { out.col = pick(p.petals[(hash(k + 7) * 3) | 0]); out.l = 0.55; out.w = 0.8; out.a = Math.atan2(dy, dx) + 0.3 * Math.sin(t * 0.4 + k); }
          return;
        }
      }
    }
    const edge = sc.field + (this.isTall ? 0.006 : 0.012) * Math.sin(xf * 9 + 1);
    if (Y > edge) { // grass, in pen
      out.T = 0.14 + 0.16 * (0.5 + 0.5 * Math.sin(X * 21 + Y * 9));
      out.a = Math.PI / 2 + 0.6 * Math.sin(X * 34 + Y * 22 + t * 0.3);
      out.l = 0.8;
      return;
    }

    const top = edge - this.skyline[Math.min(511, Math.max(0, (xf * 512) | 0))];
    if (Y > top) { // the city: a flat silhouette, no keyline
      out.col = p.city; out.plain = true; out.l = 0.45; out.w = 0.9; out.a = Math.PI / 2;
      return;
    }

    // the sky: wind, with a whirl around every light
    const a0 = -0.22 + 0.4 * Math.sin(X * 2.6 + t * 0.04 + Y * 1.7) + 0.25 * Math.sin(Y * 7 - X * 1.3 - t * 0.02);
    let vx = Math.cos(a0), vy = Math.sin(a0), hit = -1, hq = 9;
    const sr = sc.sun[2] * rs, sdx = X - sc.sun[0] * a, sdy = Y - sc.sun[1], sd = Math.sqrt(sdx * sdx + sdy * sdy) + 1e-5;
    const sw = 4 * Math.exp(-(sd * sd) / (sr * sr * 6));
    vx += sw * (-sdy / sd); vy += sw * (sdx / sd);
    for (let i = 0; i < sc.stars.length; i++) {
      const s = sc.stars[i], r = s[2] * rs;
      const dx = X - s[0] * a, dy = Y - s[1], d = Math.sqrt(dx * dx + dy * dy) + 1e-5;
      const w = 2.8 * Math.exp(-(d * d) / (r * r * 2.2)) * s[3];
      vx += w * (-dy / d); vy += w * (dx / d);
      if (d < r * 1.35 && d / r < hq) { hit = i; hq = d / r; }
    }
    let light = 0;
    for (let i = 0; i < sc.swirls.length; i++) {
      const s = sc.swirls[i], r = s[2] * rs;
      const dx = X - s[0] * a, dy = Y - s[1], d = Math.sqrt(dx * dx + dy * dy) + 1e-5;
      const w = 3.4 * Math.exp(-(d * d) / (r * r * 1.7));
      vx += w * (-dy / d * s[3] - dx / d * 0.22); vy += w * (dx / d * s[3] - dy / d * 0.22);
      if (d < r * 2.1) {
        const band = Math.sin(d / rs * 58 - t * 0.35 + Math.atan2(dy, dx) * 2 * s[3]);
        light = Math.max(light, Math.max(0, band) * (1 - d / (r * 2.1)) * 1.2);
      }
    }
    out.a = Math.atan2(vy, vx);

    // the sun: the only thing in the sky painted in colour
    const q = sd / sr;
    if (q < 1) { out.col = pick(p.core); out.l = 0.7; return; }
    if (q < 2.7) {
      const ring = Math.sin(q * 5.2 - t * 0.8 + Math.atan2(sdy, sdx) * 3);
      if (ring > 0.05 || q < 1.45) { out.col = p.rays[ring > 0.62 ? 0 : ring > 0.3 ? 1 : 2]; out.l = 0.9; return; }
      out.T = 0.03;
      return;
    }
    if (hit >= 0) { // a star: a knot of pen lines
      const ring = Math.sin(hq * 12 - t * 0.8 + hit);
      out.T = hq < 0.3 ? 0.9 : ring > 0.1 ? 0.7 : 0.02;
      out.l = 0.8;
      return;
    }
    const n = 0.5 + 0.5 * Math.sin(X * 8 + Math.sin(Y * 7 + t * 0.04) * 2.2 + t * 0.03);
    out.T = Math.min(0.85, 0.04 + 0.1 * n * n + light * 0.7);
  }

  // One mark: a fat keylined colour stroke, a pen line, or a swipe of the eraser.
  private stroke(u: number, big: number) {
    const W = this.W, H = this.H, ctx = this.ctx!, o = this.o, o2 = this.o2, p = this.cur;
    const xf = Math.random(), yf = Math.random();
    this.sample(xf, yf, this.t, o);
    if (o.col && big === 1 && Math.random() < 0.6) return; // colour is thick: it needs fewer marks
    let len: number, wid: number, style: string, keyed = false;
    const a1 = o.a;
    if (o.col) {
      wid = u * (7 + 5 * Math.random()) * o.w * big;
      len = u * (22 + 28 * Math.random()) * o.l * big;
      style = `rgb(${o.col})`; keyed = !o.plain;
    } else if (Math.random() < o.T) {
      wid = u * 1.25;
      len = u * (22 + 42 * Math.random()) * o.l;
      style = `rgba(${p.ink},0.9)`;
    } else {
      wid = u * 4.4 * big;
      len = u * (16 + 22 * Math.random()) * o.l * big;
      style = `rgba(${p.bg},0.88)`;
    }
    const x = xf * W, y = yf * H;
    this.sample((x + Math.cos(a1) * len) / W, (y + Math.sin(a1) * len) / H, this.t, o2);
    let da = o2.a - a1;
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

  private frame(now: number) {
    if (!this.ctx) { this.setup(); if (!this.ctx) return; }
    this.t = (now - this.t0) / 1000;
    // marks are sized to the picture, a little larger on a phone
    const u = Math.sqrt(this.W * this.H) / (this.isTall ? 900 : 1100);
    // A fresh ground gets an undercoat of bigger marks, slow enough to watch going on. Under
    // reduced motion the same number of marks goes on in a few frames instead.
    const step = this.still ? 0.05 : FIRST_COAT;
    const budget = this.isTall ? 23600 : 36000;
    const n = Math.round(MARKS_PER_FRAME + budget * 2 * step * this.coat), big = 1 + 0.8 * this.coat;
    this.coat = Math.max(0, this.coat - step);
    for (let i = 0; i < n; i++) this.stroke(u, big);
  }
}
