/**
 * Generates responsive WebP derivatives for the static photos in
 * public/projects and public/services (originals are kept untouched).
 *   public/projects/foo.jpg → public/projects/foo-480.webp, -960.webp, -1440.webp
 * Usage: npx tsx scripts/optimise-static-images.ts
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const DIRS = ["public/projects", "public/services"];
const WIDTHS = [480, 960, 1440];

async function main() {
  for (const dir of DIRS) {
    for (const file of fs.readdirSync(dir)) {
      if (!/\.(jpe?g|png)$/i.test(file)) continue;
      const src = path.join(dir, file);
      const base = file.replace(/\.(jpe?g|png)$/i, "");
      const { width = 0 } = await sharp(src).metadata();
      for (const w of WIDTHS) {
        if (w > width) continue;
        const out = path.join(dir, `${base}-${w}.webp`);
        await sharp(src).resize({ width: w }).webp({ quality: 78 }).toFile(out);
        console.log(out);
      }
    }
  }
}
main();
