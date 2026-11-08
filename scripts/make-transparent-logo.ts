/**
 * Derives a transparent logo from public/brand/dons-hvac-logo.png (supplied
 * by the client on an opaque #f7f7f7 background). Only background pixels
 * connected to the image border are removed (flood fill), with a soft alpha
 * ramp at the edges; the logo artwork itself is untouched.
 * Usage: npx tsx scripts/make-transparent-logo.ts
 */
import sharp from "sharp";

const SRC = "public/brand/dons-hvac-logo.png";

async function main() {
  const { data, info } = await sharp(SRC).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: w, height: h } = info;
  const bg = [data[0], data[1], data[2]];
  const dist = (i: number) =>
    Math.hypot(data[i] - bg[0], data[i + 1] - bg[1], data[i + 2] - bg[2]);
  const HARD = 18; // fully transparent below this distance
  const SOFT = 70; // fully opaque above this distance
  const visited = new Uint8Array(w * h);
  const stack: number[] = [];
  for (let x = 0; x < w; x++) stack.push(x, (h - 1) * w + x);
  for (let y = 0; y < h; y++) stack.push(y * w, y * w + w - 1);
  while (stack.length) {
    const p = stack.pop()!;
    if (visited[p]) continue;
    const i = p * 4;
    const d = dist(i);
    if (d >= SOFT) continue;
    visited[p] = 1;
    const a = d <= HARD ? 0 : Math.round(((d - HARD) / (SOFT - HARD)) * 255);
    data[i + 3] = Math.min(data[i + 3], a);
    if (d > HARD) continue; // edge pixel: soften but do not spread further
    const x = p % w, y = (p / w) | 0;
    if (x > 0) stack.push(p - 1);
    if (x < w - 1) stack.push(p + 1);
    if (y > 0) stack.push(p - w);
    if (y < h - 1) stack.push(p + w);
  }
  const img = sharp(data, { raw: { width: w, height: h, channels: 4 } }).trim({ background: { r: 0, g: 0, b: 0, alpha: 0 }, threshold: 1 });
  await img.clone().png({ compressionLevel: 9 }).toFile("public/brand/dons-hvac-logo-transparent.png");
  await img.clone().webp({ quality: 92, alphaQuality: 100 }).toFile("public/brand/dons-hvac-logo-transparent.webp");
  const meta = await sharp("public/brand/dons-hvac-logo-transparent.png").metadata();
  console.log(`wrote transparent logo ${meta.width}x${meta.height}`);
}
main();
