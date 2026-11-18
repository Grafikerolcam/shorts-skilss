// Bölümden Shorts/Reels kesiti: seçilen sahnelerin sesini keser, kelime zamanlarını kaydırır.
//   node scripts/kes-short.mjs <bolum> <short-adı> <sahne,sahne,...>
//   ör: node scripts/kes-short.mjs deploytv-2 short-github 15,16
// Çıktı: public/<bolum>/shorts/<short-adı>.mp3, src/reels/<bolum>/shorts/<short-adı>.json (+ envelope)
// Yeni seslendirme yapmaz (ElevenLabs kotası harcanmaz).
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/(\w:)/, "$1")), "..");
const [bolum, name, list] = process.argv.slice(2);
if (!list) throw new Error("kullanım: node scripts/kes-short.mjs <bolum> <short-adı> <sahne,sahne,...>");
const sel = list.split(",").map(Number);
const script = JSON.parse(fs.readFileSync(path.join(root, "src/reels", bolum, "script.json"), "utf8"));
const voice = JSON.parse(fs.readFileSync(path.join(root, "src/reels", bolum, "voice.json"), "utf8"));
const src = path.join(root, "public", bolum, "voice.mp3");
const outDir = path.join(root, "public", bolum, "shorts");
const dataDir = path.join(root, "src/reels", bolum, "shorts");
fs.mkdirSync(outDir, { recursive: true });
fs.mkdirSync(dataDir, { recursive: true });

const PRE = 0.25;
const POST = 0.45;
const words = [];
const segs = [];
let offset = 0;
sel.forEach((s, k) => {
  const ws = voice.words.filter((w) => w.scene === s);
  if (!ws.length) throw new Error(`sahne ${s} boş`);
  const a = Math.max(0, ws[0].start - PRE);
  const b = ws.at(-1).end + POST;
  segs.push([a, b]);
  for (const w of ws) words.push({ text: w.text, start: +(w.start - a + offset).toFixed(3), end: +(w.end - a + offset).toFixed(3), scene: k });
  offset += b - a;
});

const filter =
  segs.map(([a, b], i) => `[0:a]atrim=${a.toFixed(3)}:${b.toFixed(3)},asetpts=PTS-STARTPTS,afade=t=in:d=0.03,afade=t=out:st=${(b - a - 0.06).toFixed(3)}:d=0.06[s${i}];`).join("") +
  segs.map((_, i) => `[s${i}]`).join("") +
  `concat=n=${segs.length}:v=0:a=1[o]`;
const mp3 = path.join(outDir, `${name}.mp3`);
execFileSync("ffmpeg", ["-y", "-v", "error", "-i", src, "-filter_complex", filter, "-map", "[o]", "-c:a", "libmp3lame", "-b:a", "160k", mp3]);
execFileSync("node", [path.join(root, "scripts/envelope.mjs"), mp3, path.join(dataDir, `${name}.envelope.json`), "30"], { stdio: "inherit" });

const out = {
  date: script.date,
  scenes: sel.map((s) => script.scenes[s]),
  voice: { duration: +words.at(-1).end.toFixed(3), words },
};
fs.writeFileSync(path.join(dataDir, `${name}.json`), JSON.stringify(out, null, 1));
console.log(`${name}: sahne ${sel.join(",")} · ${offset.toFixed(1)} s ses`);
