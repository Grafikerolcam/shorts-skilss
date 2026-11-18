// Lists Mixkit free SFX (id + title) for the given category slugs.
// usage: node scripts/mixkit-list.mjs pop bubbles whoosh ...
const cats = process.argv.slice(2);
const out = [];
for (const c of cats) {
  const res = await fetch(`https://mixkit.co/free-sound-effects/${c}/`, { headers: { "User-Agent": "Mozilla/5.0" } });
  if (!res.ok) { console.error(c, res.status); continue; }
  const html = await res.text();
  const re = /data-audio-player-item-id-value="(\d+)"[\s\S]*?item-grid-card__title">\s*([^<]+?)\s*<\/h2>/g;
  let m;
  while ((m = re.exec(html))) out.push({ cat: c, id: m[1], title: m[2].trim() });
}
for (const x of out) console.log(`${x.cat}\t${x.id}\t${x.title}`);
