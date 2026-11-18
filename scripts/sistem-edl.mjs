// Ham kliplerden kurgu listesi: dolgu kelimeleri ve uzun boşlukları atar, altyazıyı düzeltir.
import fs from "node:fs";
const dir = "out/sistem-analiz";
const VARIANT = process.argv[2] || "full";
// 60 sn versiyonu: her klipten tutulacak kelime aralıkları [ilk, son]
const KEEP60 = {
  IMG_0113: [[0, 32]],
  IMG_0114: [[0, 18]],
  IMG_0117: [[15, 26]],
  IMG_0118: [[13, 21], [26, 32]],
  IMG_0119: [[0, 5], [10, 38], [40, 50], [72, 81]],
  IMG_0120: [[31, 39]],
  IMG_0121: [[4, 9], [40, 45]],
};
const CLIPS = [
  { id: "IMG_0113", drop: [] },
  { id: "IMG_0114", drop: [22] },
  { id: "IMG_0117", drop: [7, 14, 34, 66] },
  { id: "IMG_0118", drop: [5, 23] },
  { id: "IMG_0119", drop: [8, 9, 18] },
  { id: "IMG_0120", drop: [30] },
  { id: "IMG_0121", drop: [10, 33, 44] },
];
const FIX = { "Cloud'a": "Claude'a", Cloud: "Claude", Diplo: "Deploy", deploy: "DeployTv", Reel: "Reels", Studios: "Studio", ajandami: "ajandamı", "Kendisi--": "", "YouTube--": "" };
const DROPTEXT = { IMG_0120: { 20: true } }; // "TV" (deploy TV -> DeployTv) caption-only drop
const PRE = 0.08, POST = 0.14, GAP = 0.32;
const segs = [];
const words = [];
let t = 0;
for (const c of CLIPS) {
  const ws = JSON.parse(fs.readFileSync(`${dir}/${c.id}.json`, "utf8")).words.map((w, i) => ({ ...w, i }));
  const inKeep = (i) => VARIANT !== "60" || (KEEP60[c.id] ?? []).some(([a, b]) => i >= a && i <= b);
  const keep = ws.filter((w) => !c.drop.includes(w.i) && inKeep(w.i));
  // group consecutive kept words (by index) with small gaps
  let cur = null;
  const groups = [];
  for (const w of keep) {
    if (cur && w.i === cur.last + 1 && w.start - cur.end <= GAP) { cur.end = w.end; cur.last = w.i; cur.words.push(w); }
    else { cur = { start: w.start, end: w.end, last: w.i, words: [w] }; groups.push(cur); }
  }
  for (const g of groups) {
    const a = Math.max(0, g.start - PRE), b = g.end + POST;
    const fa = Math.round(a * 30), fb = Math.round(b * 30);
    const seg = { clip: c.id, from: fa, dur: fb - fa, at: Math.round(t * 30), firstWord: g.words[0].i, lastWord: g.words.at(-1).i };
    segs.push(seg);
    for (const w of g.words) {
      let text = FIX[w.text.replace(/[.,!?:"]+$/,"").replace(/^"/,"")] !== undefined ? w.text.replace(/^"?([^.,!?:"]+)/, (m, core) => FIX[core] ?? core) : w.text;
      if (DROPTEXT[c.id]?.[w.i]) text = "";
      text = text.replace(/^"|"$/g, "").replace(/[.,:;]$/, "").replace(/--$/, "");
      if (text) words.push({ text, clip: c.id, i: w.i, start: +(seg.at / 30 + (w.start - fa / 30)).toFixed(3), end: +(seg.at / 30 + (w.end - fa / 30)).toFixed(3) });
    }
    t += (fb - fa) / 30;
  }
}
fs.writeFileSync(VARIANT === "60" ? "src/reels/sistem/edl-60.json" : "src/reels/sistem/edl.json", JSON.stringify({ duration: +t.toFixed(3), segs, words }, null, 1));
console.log(segs.length, "kesit ·", t.toFixed(1), "s ·", words.length, "kelime");
console.log(words.map((w) => w.text).join(" "));
