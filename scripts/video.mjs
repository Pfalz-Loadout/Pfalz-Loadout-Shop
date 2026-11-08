/**
 * Video-Pipeline: Rohclip → Web-Loop (MP4 + WebM, Desktop + Mobil) + Posterbild.
 *
 *   node scripts/video.mjs <eingabe.mp4> <name> [--pingpong] [--slow 1.25]
 *
 * --pingpong  spielt den Clip vorwärts + rückwärts → nahtloser Loop
 *             (z. B. Tasche öffnet sich und schließt sich wieder)
 * --slow x    verlangsamt um Faktor x (schwerer, „Kino“-Eindruck)
 * Ausgabe: public/videos/<name>.mp4|.webm, <name>-mobil.mp4|.webm, <name>-poster.jpg
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import ffmpeg from 'ffmpeg-static';

const [, , input, name, ...rest] = process.argv;
if (!input || !name) {
  console.error('Aufruf: node scripts/video.mjs <eingabe.mp4> <name> [--pingpong] [--slow 1.25]');
  process.exit(1);
}
const pingpong = rest.includes('--pingpong');
const slowIdx = rest.indexOf('--slow');
const slow = slowIdx >= 0 ? Number(rest[slowIdx + 1]) : 1;
const out = path.resolve('public/videos');
fs.mkdirSync(out, { recursive: true });

const run = (args) => execFileSync(ffmpeg, ['-y', '-hide_banner', '-loglevel', 'error', ...args], { stdio: 'inherit' });

function filter(width) {
  const base = `setpts=${slow}*PTS,scale=${width}:-2:flags=lanczos,fps=30`;
  return pingpong ? `[0:v]${base},split[a][b];[b]reverse[r];[a][r]concat=n=2:v=1[v]` : `[0:v]${base}[v]`;
}

for (const [suffix, width, crf264, crfVp9] of [
  ['', 720, 26, 38],
  ['-mobil', 480, 28, 40],
]) {
  const f = filter(width);
  run(['-i', input, '-filter_complex', f, '-map', '[v]', '-an', '-c:v', 'libx264', '-preset', 'slow', '-crf', String(crf264), '-pix_fmt', 'yuv420p', '-movflags', '+faststart', path.join(out, `${name}${suffix}.mp4`)]);
  run(['-i', input, '-filter_complex', f, '-map', '[v]', '-an', '-c:v', 'libvpx-vp9', '-crf', String(crfVp9), '-b:v', '0', '-row-mt', '1', path.join(out, `${name}${suffix}.webm`)]);
}
// Posterbild = erstes Bild
run(['-i', input, '-vf', 'scale=720:-2', '-frames:v', '1', '-q:v', '3', path.join(out, `${name}-poster.jpg`)]);

for (const f of fs.readdirSync(out).filter((f) => f.startsWith(name))) {
  console.log(`${f.padEnd(32)} ${(fs.statSync(path.join(out, f)).size / 1024).toFixed(0)} KB`);
}
