// Ses dosyasından kare başına ses seviyesi (dudak senkronu için): node scripts/envelope.mjs <ses.mp3> <çıktı.json> [fps]
import { execFileSync } from "node:child_process";
import fs from "node:fs";
const [, , input, output, fpsArg] = process.argv;
const fps = Number(fpsArg || 30), sr = 6000;
const raw = execFileSync("ffmpeg", ["-v", "error", "-i", input, "-ac", "1", "-ar", String(sr), "-f", "s16le", "-"], { maxBuffer: 1 << 30 });
const s = new Int16Array(raw.buffer, raw.byteOffset, raw.length / 2);
const per = sr / fps, out = [];
for (let i = 0; i * per < s.length; i++) {
  let sum = 0; const a = Math.floor(i * per), b = Math.min(s.length, Math.floor((i + 1) * per));
  for (let j = a; j < b; j++) sum += (s[j] / 32768) ** 2;
  out.push(Math.sqrt(sum / Math.max(1, b - a)));
}
const peak = Math.max(...out.toSorted((x, y) => y - x).slice(0, Math.ceil(out.length * 0.05)).slice(-1), 1e-6);
fs.writeFileSync(output, JSON.stringify(out.map((v) => +Math.min(1, v / peak).toFixed(3))));
console.log(`${out.length} kare zarf -> ${output}`);
