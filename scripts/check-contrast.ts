/**
 * Verifies WCAG 2.x contrast for the colour pairs the design system uses.
 * Reads tokens straight from src/app/globals.css so they cannot drift.
 * Usage: npm run audit:contrast
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";

const css = readFileSync(join(process.cwd(), "src/app/globals.css"), "utf8");
const token = (name: string): string => {
  const m = css.match(new RegExp(`--color-${name}:\\s*(#[0-9a-fA-F]{6})`));
  if (!m) throw new Error(`token --color-${name} not found`);
  return m[1];
};
const lum = (hex: string) => {
  const c = [1, 3, 5]
    .map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
};
const ratio = (a: string, b: string) => {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
};

// [foreground, background, minimum, usage]
const pairs: Array<[string, string, number, string]> = [
  ["ink", "limestone-100", 4.5, "body text"],
  ["ink", "limestone-50", 4.5, "body text on panels"],
  ["ink-muted", "limestone-100", 4.5, "secondary text"],
  ["ink-muted", "limestone-50", 4.5, "secondary text"],
  ["ink-muted", "limestone-200", 4.5, "secondary text on tinted panels"],
  ["ink-soft", "limestone-100", 4.5, "tertiary text"],
  ["copper-700", "limestone-100", 4.5, "links / accents on light"],
  ["copper-700", "limestone-50", 4.5, "links / accents on light"],
  ["copper-700", "limestone-200", 4.5, "links on tinted panels"],
  ["ice-700", "limestone-50", 4.5, "cooling accent text on light"],
  ["ember-700", "limestone-50", 4.5, "hot-water accent text on light"],
  ["midnight-900", "limestone-100", 4.5, "headings"],
  ["midnight-700", "limestone-50", 4.5, "brand navy text"],
  ["limestone-100", "midnight-900", 4.5, "text on dark"],
  ["midnight-100", "midnight-900", 4.5, "secondary text on dark"],
  ["midnight-300", "midnight-900", 4.5, "muted text on dark"],
  ["midnight-300", "midnight-800", 4.5, "muted text on dark glass"],
  ["copper-300", "midnight-900", 4.5, "heat accent on dark"],
  ["copper-500", "midnight-900", 4.5, "brand orange on dark"],
  ["ice-300", "midnight-900", 4.5, "cool accent on dark"],
  ["ice-500", "midnight-900", 4.5, "cool accent on dark"],
  ["ember-300", "midnight-900", 4.5, "hot-water accent on dark"],
  ["midnight-950", "copper-500", 4.5, "primary button (brand orange)"],
  ["midnight-950", "copper-400", 4.5, "primary button gradient end"],
  ["midnight-950", "copper-300", 4.5, "primary button hover"],
  ["midnight-950", "ice-500", 4.5, "selected cooling control"],
  ["midnight-950", "ember-500", 4.5, "selected hot-water control"],
  ["danger-700", "limestone-50", 4.5, "error text"],
  ["success-700", "limestone-50", 4.5, "success text"],
  ["copper-500", "limestone-100", 3, "focus ring / non-text UI"],
  ["ice-300", "midnight-900", 3, "focus ring on dark"],
];

let failed = 0;
for (const [fg, bg, min, usage] of pairs) {
  const r = ratio(token(fg), token(bg));
  const ok = r >= min;
  if (!ok) failed++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${r.toFixed(2).padStart(5)}:1  (min ${min})  ${fg} on ${bg} — ${usage}`);
}
const white = ratio("#ffffff", token("midnight-900"));
console.log(`${white >= 4.5 ? "PASS" : "FAIL"}  ${white.toFixed(2).padStart(5)}:1  (min 4.5)  white on midnight-900 — text on dark`);
if (white < 4.5) failed++;
process.exit(failed ? 1 : 0);
