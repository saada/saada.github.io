// Link cards (og:image / twitter:image) for every post under blog/.
//
//   bun run cards         render blog/<slug>/images/og-card.png from blog/<slug>/card.json
//                         (needs a local Chromium) and stamp ?v=<hash> into the post's meta
//   bun run cards:check   CI: every post has a card.json, a 1200x630 card, the full set of
//                         og/twitter tags, and meta that points at the current card
//
// card.json:
//   { "headline": "GuitarMood: a free guitar rig for <em>Omarchy</em>",
//     "kicker": "FCB1010 · TONE3000 · Qtractor", "tags": ["Omarchy", "Open source"],
//     "image": "images/guitarmood/full.jpg", "focus": "20% 30%",
//     "accent": "#7aa2f7", "imageWidth": 640, "headlinePx": 64, "fade": 55, "brightness": 1 }

import { createHash } from "node:crypto";
import { existsSync, mkdtempSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";

const ROOT = resolve(import.meta.dir ?? join(import.meta.dirname, ""), "..");
const BLOG = join(ROOT, "blog");
const SITE = "https://saada.github.io";
const W = 1200, H = 630;

type Card = {
  headline: string; kicker?: string; tags?: string[]; image: string;
  focus?: string; accent?: string; imageWidth?: number; headlinePx?: number;
  fade?: number; brightness?: number;  // fade: % of the picture that blends into the text side
};

const REQUIRED = [
  "og:title", "og:description", "og:image", "og:image:width", "og:image:height", "og:image:alt",
  "twitter:card", "twitter:title", "twitter:description", "twitter:image", "twitter:image:alt",
];

const posts = () => readdirSync(BLOG, { withFileTypes: true })
  .filter((d) => d.isDirectory() && existsSync(join(BLOG, d.name, "index.html")))
  .map((d) => d.name);

const escape = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
// Headlines may use <em> for the accent colour; nothing else is let through.
const headline = (s: string) => escape(s).replace(/&lt;(\/?)em&gt;/g, "<$1em>");

function pngSize(file: string): [number, number] {
  const b = readFileSync(file);
  if (b.toString("ascii", 1, 4) !== "PNG") return [0, 0];
  return [b.readUInt32BE(16), b.readUInt32BE(20)];
}

const hash = (file: string) => createHash("sha256").update(readFileSync(file)).digest("hex").slice(0, 10);
const meta = (html: string, key: string) =>
  html.match(new RegExp(`<meta[^>]+(?:name|property)="${key.replace(/:/g, ":")}"[^>]*content="([^"]*)"`))?.[1];

function render(slug: string) {
  const dir = join(BLOG, slug);
  const card: Card = JSON.parse(readFileSync(join(dir, "card.json"), "utf8"));
  const imageWidth = card.imageWidth ?? 620;
  const page = readFileSync(join(ROOT, "scripts/og-card.html"), "utf8")
    .replaceAll("{{ACCENT}}", card.accent ?? "#7aa2f7")
    .replaceAll("{{IMAGE}}", "file://" + join(dir, card.image))
    .replaceAll("{{FOCUS}}", card.focus ?? "center")
    .replaceAll("{{FADE}}", String(card.fade ?? 55))
    .replaceAll("{{BRIGHTNESS}}", String(card.brightness ?? 1))
    .replaceAll("{{IMAGE_WIDTH}}", String(imageWidth))
    // A long fade leaves room for text over the picture; a short one needs its own column.
    .replaceAll("{{TEXT_WIDTH}}", String(W - imageWidth + ((card.fade ?? 55) >= 40 ? 140 : 0)))
    .replaceAll("{{HEADLINE_PX}}", String(card.headlinePx ?? 64))
    .replaceAll("{{HEADLINE}}", headline(card.headline))
    .replaceAll("{{KICKER}}", escape(card.kicker ?? ""))
    .replaceAll("{{TAGS}}", (card.tags ?? []).map((t) => `<span>${escape(t)}</span>`).join(""));
  const tmp = mkdtempSync(join(tmpdir(), "og-card-"));
  writeFileSync(join(tmp, "card.html"), page);
  const out = join(dir, "images/og-card.png");
  const chromium = process.env.CHROMIUM ?? "chromium";
  const r = spawnSync(chromium, ["--headless", "--disable-gpu", "--hide-scrollbars", "--force-device-scale-factor=1",
    "--allow-file-access-from-files", `--window-size=${W},${H}`, `--screenshot=${out}`, "file://" + join(tmp, "card.html")],
    { encoding: "utf8" });
  if (r.status !== 0 || pngSize(out)[0] !== W) throw new Error(`${slug}: chromium failed\n${r.stderr}`);
  stamp(slug);
  console.log(`${slug}: images/og-card.png (${hash(out)})`);
}

/** The post's page plus any sub-pages (e.g. blog/<slug>/lab/) that share its card. A sub-page
 *  with no og:image of its own (a redirect, say) isn't shared, so it's skipped. */
function pages(slug: string): string[] {
  const dir = join(BLOG, slug);
  const out = [join(dir, "index.html")];
  for (const d of readdirSync(dir, { withFileTypes: true })) {
    const sub = join(dir, d.name, "index.html");
    if (d.isDirectory() && existsSync(sub) && /(?:name|property)="og:image"/.test(readFileSync(sub, "utf8"))) out.push(sub);
  }
  return out;
}

/** Point og:image / twitter:image at the current card, with ?v=<hash> so X refetches it. */
function stamp(slug: string) {
  const url = `${SITE}/blog/${slug}/images/og-card.png?v=${hash(join(BLOG, slug, "images/og-card.png"))}`;
  for (const file of pages(slug)) {
    let html = readFileSync(file, "utf8");
    for (const key of ["og:image", "twitter:image"]) {
      const re = new RegExp(`(<meta[^>]+(?:name|property)="${key}"[^>]*content=")[^"]*(")`);
      if (!re.test(html)) throw new Error(`${file}: no ${key} meta tag`);
      html = html.replace(re, `$1${url}$2`);
    }
    writeFileSync(file, html);
  }
}

function check(): number {
  let bad = 0;
  const fail = (slug: string, msg: string) => { console.error(`✗ ${slug}: ${msg}`); bad++; };
  for (const slug of posts()) {
    const dir = join(BLOG, slug);
    if (!existsSync(join(dir, "card.json"))) fail(slug, "no card.json (see scripts/og-cards.ts)");
    const png = join(dir, "images/og-card.png");
    if (!existsSync(png)) { fail(slug, "no images/og-card.png: run `bun run cards`"); continue; }
    const [w, h] = pngSize(png);
    if (w !== W || h !== H) fail(slug, `og-card.png is ${w}x${h}, want ${W}x${H}`);
    const want = `?v=${hash(png)}`;
    for (const file of pages(slug)) {
      const page = file.slice(BLOG.length + 1, -"/index.html".length) || slug;
      const html = readFileSync(file, "utf8");
      for (const key of REQUIRED) if (!meta(html, key)) fail(page, `missing <meta ${key}>`);
      if (meta(html, "twitter:card") !== "summary_large_image") fail(page, "twitter:card must be summary_large_image");
      for (const key of ["og:image", "twitter:image"])
        if (!meta(html, key)?.endsWith(want)) fail(page, `${key} doesn't point at the current card: run \`bun run cards\``);
    }
    if (bad === 0) console.log(`✓ ${slug}`);
  }
  return bad;
}

if (process.argv.includes("--check")) {
  process.exit(check() ? 1 : 0);
} else {
  const only = process.argv.slice(2).filter((a) => !a.startsWith("-"));
  for (const slug of only.length ? only : posts().filter((s) => existsSync(join(BLOG, s, "card.json")))) render(slug);
}
