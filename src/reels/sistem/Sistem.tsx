// "Claude'a YouTube kanalı açtırdım" — Hazal'ın kendi hesabı için anlatım reels'i.
// Ham 4K klipler: public/sistem/IMG_*.mp4, kurgu listesi: edl.json (scripts/sistem-edl.mjs üretir).
// 1080x1920 tasarlanır, --scale=2 ile 2160x3840 (orijinal çözünürlük) render edilir.
import React from "react";
import { AbsoluteFill, interpolate, OffthreadVideo, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig, random } from "remotion";
import { C, fontFamily } from "../theme";
import { NeonTitle, Grade, Flash } from "../components";
import { Sfx } from "../sfx";
import edlFull from "./edl.json";
import edl60 from "./edl-60.json";

type EDL = typeof edlFull;
export type SistemProps = { variant: "full" | "60" };
const pick = (v: SistemProps["variant"]): EDL => (v === "60" ? (edl60 as EDL) : edlFull);

const FPS = 30;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const END_HOLD = 1.4;
export const sistemFrames = (v: SistemProps["variant"]) => Math.ceil((pick(v).duration + END_HOLD) * FPS);

const SCREEN = new Set(["IMG_0114", "IMG_0118", "IMG_0120"]);

/** output time (s) of word i of a clip, or null when the cut leaves it out */
const makeWt = (edl: EDL) => (clip: string, i: number): number | null => edl.words.find((x) => x.clip === clip && x.i === i)?.start ?? null;
const f = (s: number) => Math.round(s * FPS);

/* ---------------- video track ---------------- */
const Footage: React.FC<{ edl: EDL }> = ({ edl }) => {
  const counters: Record<string, number> = {};
  return (
    <>
      {edl.segs.map((s, k) => {
        const n = (counters[s.clip] = (counters[s.clip] ?? -1) + 1);
        const screen = SCREEN.has(s.clip);
        const zoom = screen ? 1.04 + (n % 2) * 0.06 : n % 2 ? 1.12 : 1.0;
        const ox = screen ? 0 : n % 2 ? (random(`x${k}`) - 0.5) * 30 : 0;
        return (
          <Sequence key={k} from={s.at} durationInFrames={k === edl.segs.length - 1 ? s.dur + Math.round(END_HOLD * FPS) : s.dur} name={`${s.clip} #${s.firstWord}-${s.lastWord}`}>
            <Shot src={staticFile(`sistem/${s.clip}.mp4`)} trim={s.from} zoom={zoom} ox={ox} drift={screen} />
          </Sequence>
        );
      })}
    </>
  );
};

const Shot: React.FC<{ src: string; trim: number; zoom: number; ox: number; drift: boolean }> = ({ src, trim, zoom, ox, drift }) => {
  const frame = useCurrentFrame();
  const z = zoom * (1 + (drift ? frame * 0.0006 : frame * 0.00025));
  return (
    <AbsoluteFill style={{ overflow: "hidden", background: "#000" }}>
      <OffthreadVideo src={src} trimBefore={trim} style={{ width: "100%", height: "100%", objectFit: "cover", scale: String(z), translate: `${ox}px 0px`, filter: "contrast(1.06) saturate(1.08)" }} />
    </AbsoluteFill>
  );
};

/* ---------------- graphics ---------------- */
/** dark band so text reads over busy screen footage */
const Scrim: React.FC<{ y: number; h: number; dur: number }> = ({ y, h, dur }) => {
  const frame = useCurrentFrame();
  const a = interpolate(frame, [0, 6, dur - 6, dur], [0, 1, 1, 0], clamp);
  return <div style={{ position: "absolute", left: 0, right: 0, top: y, height: h, opacity: a, background: "linear-gradient(to bottom, transparent, rgba(0,0,0,0.72) 25%, rgba(0,0,0,0.72) 75%, transparent)" }} />;
};
const withScrim = (y: number, h: number, d: number, el: React.ReactNode) => (
  <>
    <Scrim y={y} h={h} dur={d} />
    {el}
  </>
);
const usePop = (stiff = 220) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame, fps, config: { damping: 13, stiffness: stiff, mass: 0.7 } });
};
const useOut = (dur: number) => interpolate(useCurrentFrame(), [dur - 7, dur], [0, 1], clamp);

const Chip: React.FC<{ text: string; y: number; dur: number; accent?: string; size?: number }> = ({ text, y, dur, accent = C.neonYellow, size = 46 }) => {
  const p = usePop();
  const o = useOut(dur);
  return (
    <div style={{ position: "absolute", top: y, width: "100%", display: "flex", justifyContent: "center", opacity: p * (1 - o), scale: String(interpolate(p, [0, 1], [0.6, 1]) * (1 - o * 0.1)) }}>
      <div style={{ fontFamily, fontWeight: 800, fontSize: size, color: C.white, background: "rgba(14,16,22,0.78)", border: `3px solid ${accent}`, borderRadius: 28, padding: "18px 34px", boxShadow: `0 0 30px ${accent}55, 0 20px 50px rgba(0,0,0,0.5)`, maxWidth: 900, textAlign: "center", lineHeight: 1.15 }}>
        {text}
      </div>
    </div>
  );
};

const Stamp: React.FC<{ text: string; y: number; dur: number; color?: string }> = ({ text, y, dur, color = "#FF4D4D" }) => {
  const p = usePop(320);
  const o = useOut(dur);
  return (
    <div style={{ position: "absolute", top: y, width: "100%", display: "flex", justifyContent: "center", opacity: (p > 0.02 ? 1 : 0) * (1 - o) }}>
      <div style={{ fontFamily, fontWeight: 900, fontSize: 70, color, border: `9px solid ${color}`, borderRadius: 18, padding: "6px 30px", rotate: "-5deg", background: "rgba(0,0,0,0.35)", scale: String(interpolate(p, [0, 1], [2.3, 1])), letterSpacing: 2, whiteSpace: "nowrap" }}>
        {text}
      </div>
    </div>
  );
};

const Checklist: React.FC<{ items: { t: string; at: number }[]; y: number; dur: number }> = ({ items, y, dur }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const o = useOut(dur);
  return (
    <div style={{ position: "absolute", top: y, left: 150, right: 150, display: "flex", flexDirection: "column", gap: 18, opacity: 1 - o }}>
      {items.map((it) => {
        const p = spring({ frame: frame - it.at, fps, config: { damping: 13, stiffness: 220 } });
        return (
          <div key={it.t} style={{ display: "flex", alignItems: "center", gap: 20, fontFamily, fontWeight: 800, fontSize: 46, color: C.white, background: "rgba(14,16,22,0.78)", borderRadius: 22, padding: "14px 26px", opacity: p, translate: `${interpolate(p, [0, 1], [-80, 0])}px 0px` }}>
            <div style={{ width: 48, height: 48, borderRadius: 24, background: "#2ECC71", color: "#06240F", fontSize: 34, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900 }}>✓</div>
            {it.t}
          </div>
        );
      })}
    </div>
  );
};

const BigCount: React.FC<{ to: number; label: string; y: number; dur: number; suffix?: string }> = ({ to, label, y, dur, suffix = "" }) => {
  const frame = useCurrentFrame();
  const p = usePop();
  const o = useOut(dur);
  const v = Math.round(interpolate(frame, [0, 24], [0, to], { ...clamp, easing: (x) => 1 - Math.pow(1 - x, 3) }));
  return (
    <div style={{ position: "absolute", top: y, width: "100%", textAlign: "center", fontFamily, opacity: p * (1 - o), scale: String(interpolate(p, [0, 1], [0.7, 1])) }}>
      <div style={{ fontWeight: 900, fontSize: 230, lineHeight: 1, color: C.neonYellow, textShadow: `0 0 40px ${C.neonGlow}, 0 10px 30px rgba(0,0,0,0.7)` }}>
        {v}
        {suffix}
      </div>
      <div style={{ fontWeight: 800, fontSize: 54, color: C.white, textShadow: "0 4px 14px rgba(0,0,0,0.7)" }}>{label}</div>
    </div>
  );
};

const Logo: React.FC<{ size: number }> = ({ size }) => (
  <div style={{ display: "flex", alignItems: "center", gap: size * 0.15, fontFamily, fontWeight: 900, fontSize: size, color: C.white }}>
    <div style={{ background: "#E5383B", padding: `${size * 0.04}px ${size * 0.26}px`, borderRadius: size * 0.12 }}>DEPLOY</div>
    TV
  </div>
);

const LogoPop: React.FC<{ y: number; dur: number; sub?: string }> = ({ y, dur, sub }) => {
  const p = usePop();
  const o = useOut(dur);
  return (
    <div style={{ position: "absolute", top: y, width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: 14, opacity: p * (1 - o), scale: String(interpolate(p, [0, 1], [0.5, 1])), filter: "drop-shadow(0 20px 40px rgba(0,0,0,0.6))" }}>
      <Logo size={96} />
      {sub && <div style={{ fontFamily, fontWeight: 800, fontSize: 36, color: C.neonYellow, letterSpacing: 4 }}>{sub}</div>}
    </div>
  );
};

/** phone mockup playing the real Short */
const Phone: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const p = usePop(160);
  const o = useOut(dur);
  return (
    <div style={{ position: "absolute", left: 800, top: 560, width: 240, height: 500, perspective: 1600, opacity: p * (1 - o) }}>
      <div style={{ width: "100%", height: "100%", borderRadius: 52, background: "#0B0B0D", padding: 14, boxShadow: "0 50px 120px rgba(0,0,0,0.7), 0 0 0 3px #2A2D33", rotate: `y ${interpolate(p, [0, 1], [40, 14]) + Math.sin(frame / 30) * 3}deg`, translate: `0px ${interpolate(p, [0, 1], [200, 0]) + o * 120}px` }}>
        <div style={{ width: "100%", height: "100%", borderRadius: 40, overflow: "hidden", background: "#000" }}>
          <OffthreadVideo src={staticFile("sistem/short-nvidia.mp4")} muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>
      </div>
    </div>
  );
};

/** 16:9 screen card playing the real episode */
const EpisodeCard: React.FC<{ dur: number }> = ({ dur }) => {
  const p = usePop(170);
  const o = useOut(dur);
  return (
    <div style={{ position: "absolute", left: 70, right: 70, top: 300, opacity: p * (1 - o), scale: String(interpolate(p, [0, 1], [0.8, 1])), rotate: `${interpolate(p, [0, 1], [-4, -1.5])}deg` }}>
      <div style={{ borderRadius: 28, overflow: "hidden", border: "4px solid rgba(255,255,255,0.85)", boxShadow: "0 40px 100px rgba(0,0,0,0.7)", aspectRatio: "16 / 9" }}>
        <OffthreadVideo src={staticFile("sistem/bolum2-giris.mp4")} muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </div>
      <div style={{ marginTop: 16, display: "flex", justifyContent: "center" }}>
        <div style={{ fontFamily, fontWeight: 800, fontSize: 34, color: C.white, background: "#E5383B", borderRadius: 12, padding: "6px 20px" }}>▶ YouTube · 15:08</div>
      </div>
    </div>
  );
};

const Platforms: React.FC<{ items: { t: string; c: string; at: number }[]; dur: number }> = ({ items, dur }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const o = useOut(dur);
  return (
    <div style={{ position: "absolute", top: 1430, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 14, flexWrap: "wrap", padding: "0 60px", opacity: 1 - o }}>
      {items.map((it) => {
        const p = spring({ frame: frame - it.at, fps, config: { damping: 12, stiffness: 240 } });
        return (
          <div key={it.t} style={{ fontFamily, fontWeight: 900, fontSize: 32, color: C.white, background: it.c, borderRadius: 16, padding: "8px 18px", opacity: p, scale: String(interpolate(p, [0, 1], [0.4, 1])) }}>
            {it.t}
          </div>
        );
      })}
    </div>
  );
};

const MoneyRain: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const o = useOut(dur);
  return (
    <AbsoluteFill style={{ opacity: 1 - o, pointerEvents: "none" }}>
      {new Array(16).fill(0).map((_, i) => {
        const x = (i % 2 ? 860 : 0) + random(`mx${i}`) * 180;
        const sp = 9 + random(`ms${i}`) * 8;
        const y = -150 + ((frame - random(`md${i}`) * 30) * sp) % 2100;
        return (
          <div key={i} style={{ position: "absolute", left: x, top: y, fontSize: 80 + random(`mz${i}`) * 50, rotate: `${Math.sin(frame / 8 + i) * 25}deg`, opacity: frame > random(`md${i}`) * 30 ? 0.9 : 0 }}>
            💸
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

/* ---------------- captions (one word, Montserrat 800) ---------------- */
const Captions: React.FC<{ edl: EDL }> = ({ edl }) => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const w = edl.words.find((x, k) => t >= x.start - 0.02 && t < Math.max(x.end, (edl.words[k + 1]?.start ?? x.end + 0.3) - 0.02));
  if (!w) return null;
  const local = (t - w.start) * FPS;
  const p = spring({ frame: local, fps: FPS, config: { damping: 14, stiffness: 260, mass: 0.6 } });
  const key = /claude|deploytv|youtube|instagram|shorts|elevenlabs|skill|panel|para|gün|klon/i.test(w.text);
  return (
    <div style={{ position: "absolute", top: 1330, width: "100%", textAlign: "center", fontFamily, fontWeight: 800, fontSize: 78, color: key ? C.neonYellow : C.white, letterSpacing: -0.5, textShadow: "0 4px 16px rgba(0,0,0,0.75), 0 0 3px rgba(0,0,0,0.9)", scale: String(interpolate(p, [0, 1], [0.8, 1])), opacity: interpolate(local, [0, 2], [0, 1], clamp) }}>
      {w.text}
    </div>
  );
};

/* ---------------- end card ---------------- */
const EndCard: React.FC<{ dur: number }> = ({ dur }) => {
  const p = usePop(140);
  const frame = useCurrentFrame();
  return (
    <div style={{ position: "absolute", top: 200, width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: 20, opacity: p }}>
      <div style={{ fontFamily, fontWeight: 900, fontSize: 104, lineHeight: 1, color: C.neonYellow, textAlign: "center", textShadow: `0 0 30px ${C.neonGlow}, 0 8px 24px rgba(0,0,0,0.7)`, scale: String(interpolate(p, [0, 1], [1.4, 1])) }}>
        SİZCE
        <br />
        BAŞARACAK MI?
      </div>
      <div style={{ fontFamily, fontWeight: 800, fontSize: 44, color: C.white, background: "rgba(14,16,22,0.8)", borderRadius: 22, padding: "16px 30px", textAlign: "center", lineHeight: 1.2, opacity: interpolate(frame, [12, 22], [0, 1], clamp) }}>
        Takip et, 10 günü birlikte izleyelim
        <br />
        <span style={{ color: C.neonYellow }}>Gün 1 / 10</span>
      </div>
    </div>
  );
};

/* ---------------- timeline of graphics ---------------- */
type G = { at: number; until: number; el: React.ReactNode; sfx?: [string, number, number?]; name: string };

const buildGraphics = (edl: EDL): G[] => {
  const g: G[] = [];
  const W = makeWt(edl);
  const MISSING = -1e6;
  const wt = (c: string, i: number) => W(c, i) ?? MISSING;
  const add = (name: string, a: number, b: number, el: (dur: number) => React.ReactNode, sfx?: [string, number, number?]) => {
    if (a < 0 || b < 0) return; // word cut from this version
    if (b - a < 0.4) return;
    g.push({ name, at: a, until: b, el: el(f(b) - f(a)), sfx });
  };
  /** end of a graphic: the given word, or a fallback some seconds after the start if that word was cut */
  const til = (a: number, b: number, fallback = 3) => (b > a ? b : a + fallback);
  // 1 — hook
  add("neon: para", wt("IMG_0113", 13) - 0.1, til(wt("IMG_0113", 13) - 0.1, wt("IMG_0113", 20)), (d) => <NeonTitle lines={["YAPAY ZEKAYLA", "PARA KAZANMA?"]} durationInFrames={d} y={215} size={88} />, ["magic_sparkle-intro", 0.4, 2]);
  add("chip: dosyalar", wt("IMG_0113", 28) - 0.05, til(wt("IMG_0113", 28) - 0.05, wt("IMG_0114", 0)), (d) => <Chip text="📁 Tüm dosyaları paylaşacağım" y={240} dur={d} />, ["pop_bubble-alert", 0.45]);
  // 2 — skill
  add("neon: skill", wt("IMG_0114", 1) - 0.1, til(wt("IMG_0114", 1) - 0.1, wt("IMG_0114", 10)), (d) => withScrim(560, 420, d, <NeonTitle lines={["CLAUDE", "SKILL DOSYASI"]} durationInFrames={d} y={640} size={110} />), ["magic_sparkle-intro", 0.4, 2]);
  add("chip: özelleştirdim", wt("IMG_0114", 14), til(wt("IMG_0114", 14), wt("IMG_0114", 19)), (d) => <Chip text="Hazırı var ama ben özelleştirdim ✍️" y={760} dur={d} />, ["pop_bubble-alert", 0.4]);
  add("chip: haberler", wt("IMG_0114", 23) - 0.05, til(wt("IMG_0114", 23) - 0.05, wt("IMG_0117", 0)), (d) => <Chip text="📰 Popüler teknoloji haberleri" y={760} dur={d} accent="#5AB0FF" />, ["pop_message", 0.4]);
  // 3 — channel idea + voice
  add("logo: kanal", wt("IMG_0117", 5) - 0.05, til(wt("IMG_0117", 5) - 0.05, wt("IMG_0117", 15) - 0.1), (d) => <LogoPop y={225} dur={d} sub="TEKNOLOJİ HABER KANALI" />, ["magic_fairy-sparkle", 0.3]);
  add("checklist", wt("IMG_0117", 15) - 0.1, til(wt("IMG_0117", 15) - 0.1, wt("IMG_0117", 27)), (d) => (
    <Checklist y={215} dur={d} items={[{ t: "Gündemi takip edecek", at: 0 }, { t: "Her gün video hazırlayacak", at: f(wt("IMG_0117", 19) - wt("IMG_0117", 15) + 0.1) }, { t: "Kendi yorumlarını katacak", at: f(wt("IMG_0117", 23) - wt("IMG_0117", 15) + 0.1) }]} />
  ), ["pop_cluster", 0.4]);
  add("neon: ses klonu", wt("IMG_0117", 32) - 0.1, til(wt("IMG_0117", 32) - 0.1, wt("IMG_0117", 36)), (d) => <NeonTitle lines={["SES KLONU"]} durationInFrames={d} y={230} size={104} />, ["magic_sparkle-intro", 0.4, 2]);
  add("stamp: tam olmadı", wt("IMG_0117", 40), til(wt("IMG_0117", 40), wt("IMG_0117", 47)), (d) => <Stamp text="TAM OLMADI 😅" y={250} dur={d} />, ["impact_drum-deep", 0.35, 1]);
  add("chip: reels skill", wt("IMG_0117", 60), til(wt("IMG_0117", 60), wt("IMG_0118", 0)), (d) => <Chip text="🎬 reels-studio skill'i" y={240} dur={d} />, ["pop_bubble-alert", 0.4]);
  // 4 — what it made
  add("count: 15 dk", wt("IMG_0118", 15) - 0.1, til(wt("IMG_0118", 15) - 0.1, wt("IMG_0118", 22)), (d) => withScrim(480, 480, d, <BigCount to={15} label="dakikalık YouTube videosu" y={560} dur={d} />), ["magic_wand-sparkle", 0.4]);
  add("card: bölüm", wt("IMG_0118", 26) - 0.3, til(wt("IMG_0118", 26) - 0.3, wt("IMG_0118", 38)), (d) => <EpisodeCard dur={d} />, ["whoosh_small-sweep", 0.4]);
  add("chip: youtube", wt("IMG_0118", 40), til(wt("IMG_0118", 40), wt("IMG_0119", 0)), (d) => <Chip text="▶ YouTube: DeployTv" y={760} dur={d} accent="#E5383B" />, ["pop_dry", 0.45]);
  // 5 — panel + rules
  add("chip: panel", wt("IMG_0119", 3), til(wt("IMG_0119", 3), wt("IMG_0119", 13)), (d) => <Chip text="📊 Hepsi tek panelde" y={240} dur={d} />, ["pop_bubble-alert", 0.4]);
  add("phone: short", wt("IMG_0119", 22), til(wt("IMG_0119", 22), wt("IMG_0119", 38) + 0.4), (d) => <Phone dur={d} />, ["whoosh_small-sweep", 0.4]);
  add("platforms", wt("IMG_0119", 25), til(wt("IMG_0119", 25), wt("IMG_0119", 38) + 0.4), (d) => (
    <Platforms dur={d} items={[{ t: "YouTube Shorts", c: "#E5383B", at: 0 }, { t: "YouTube video", c: "#B3122A", at: f(wt("IMG_0119", 29) - wt("IMG_0119", 25)) }, { t: "Instagram Reels", c: "#C13584", at: f(wt("IMG_0119", 33) - wt("IMG_0119", 25)) }]} />
  ), ["pop_cluster", 0.4]);
  add("neon: 10 gün", wt("IMG_0119", 40) - 0.1, til(wt("IMG_0119", 40) - 0.1, wt("IMG_0119", 49)), (d) => <NeonTitle lines={["10 GÜN"]} durationInFrames={d} y={220} size={140} />, ["magic_sparkle-intro", 0.4, 2]);
  add("money", wt("IMG_0119", 55), til(wt("IMG_0119", 55), wt("IMG_0119", 71)), (d) => <MoneyRain dur={d} />, ["fx_coins", 0.0]);
  add("chip: herkes", wt("IMG_0119", 55), til(wt("IMG_0119", 55), wt("IMG_0119", 71)), (d) => <Chip text="“Shorts'la şu kadar kazandım…”" y={240} dur={d} accent="#2ECC71" />, ["pop_message", 0.4]);
  add("stamp: filtresiz", wt("IMG_0119", 76) - 0.05, til(wt("IMG_0119", 76) - 0.05, wt("IMG_0119", 82)), (d) => <Stamp text="FİLTRESİZ DENEY" y={250} dur={d} />, ["impact_drum-deep", 0.35, 1]);
  add("neon: sıfırdan", wt("IMG_0119", 98) - 0.1, til(wt("IMG_0119", 98) - 0.1, wt("IMG_0120", 0)), (d) => <NeonTitle lines={["SIFIRDAN", "10 GÜNDE"]} durationInFrames={d} y={215} size={92} />, ["magic_sparkle-intro", 0.4, 2]);
  // 6 — panel on screen
  add("neon: panel", wt("IMG_0120", 19) - 0.1, til(wt("IMG_0120", 19) - 0.1, wt("IMG_0120", 26)), (d) => withScrim(560, 420, d, <NeonTitle lines={["DEPLOYTV", "PANELİ"]} durationInFrames={d} y={640} size={116} />), ["magic_sparkle-intro", 0.4, 2]);
  add("count: 31", wt("IMG_0120", 35) - 0.1, til(wt("IMG_0120", 35) - 0.1, wt("IMG_0120", 40) + 0.3), (d) => withScrim(480, 480, d, <BigCount to={31} label="izlenme · ilk gün" y={560} dur={d} />), ["magic_wand-sparkle", 0.4]);
  add("chip: takvim", wt("IMG_0120", 41), til(wt("IMG_0120", 41), wt("IMG_0121", 0)), (d) => <Chip text="🗓️ Sıradaki paylaşımlar da burada" y={760} dur={d} />, ["pop_bubble-alert", 0.4]);
  // 7 — opinion + CTA
  add("chip: 15 dk izledim", wt("IMG_0121", 4), til(wt("IMG_0121", 4), wt("IMG_0121", 11)), (d) => <Chip text="✅ 15 dakikanın hepsini izledim" y={240} dur={d} accent="#2ECC71" />, ["ding_correct-answer", 0.35]);
  add("chip: yorum", wt("IMG_0121", 28), til(wt("IMG_0121", 28), wt("IMG_0121", 40)), (d) => <Chip text="💬 Yorumlara yaz" y={240} dur={d} />, ["pop_message", 0.4]);
  add("end", wt("IMG_0121", 40) - 0.1, edl.duration + END_HOLD, (d) => <EndCard dur={d} />, ["riser_reverse-impact", 0.3, 1.2]);
  return g;
};

export const Sistem: React.FC<SistemProps> = ({ variant }) => {
  const edl = pick(variant);
  const GRAPHICS = buildGraphics(edl);
  const clipStarts = edl.segs.filter((s, k) => k > 0 && edl.segs[k - 1].clip !== s.clip).map((s) => s.at);
  return (
  <AbsoluteFill style={{ background: "#000" }}>
    <Footage edl={edl} />
    <Grade />
    {GRAPHICS.map((g) => (
      <Sequence key={g.name} name={g.name} from={f(g.at)} durationInFrames={Math.max(1, f(g.until) - f(g.at))}>
        {g.el}
      </Sequence>
    ))}
    <Captions edl={edl} />
    {clipStarts.map((a) => (
      <Sequence key={`fl${a}`} from={a} durationInFrames={8} name="flash">
        <Flash />
      </Sequence>
    ))}
    {clipStarts.map((a) => (
      <Sequence key={`wh${a}`} from={Math.max(0, a - 5)} durationInFrames={20} name="sfx: geçiş">
        <Sfx name="whoosh_short-sweep" volume={0.22} />
      </Sequence>
    ))}
    {GRAPHICS.filter((g) => g.sfx && g.sfx[1] > 0).map((g) => (
      <Sequence key={`s${g.name}`} from={Math.max(0, f(g.at) - 3)} durationInFrames={g.sfx![2] ? f(g.sfx![2]) : 45} name={`sfx: ${g.sfx![0]}`}>
        <Sfx name={g.sfx![0]} volume={g.sfx![1] * 0.75} />
      </Sequence>
    ))}
  </AbsoluteFill>
  );
};
