// DeployTv haftalık bülten şablonu (YouTube 1920x1080). Bölüm verisi: src/reels/<bolum>/script.json
// (sahne başına metin + başlık + görsel + öğeler), ses: public/<bolum>/voice.mp3, voice.json, envelope.json.
// Öğeler sesteki kelimeye bağlanır: { at: "kelime" } -> o kelime söylendiğinde ekrana gelir.
import React from "react";
import { Audio } from "@remotion/media";
import { AbsoluteFill, Img, interpolate, random, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Sfx } from "../sfx";
import { Bit, FaceSticker, sans, slab, usePopAt, VWord, clamp, TagCaptions } from "../cizgi/kit";

export type BItem =
  | { k: "chip"; at: string; t: string }
  | { k: "big"; at: string; to: number; dec?: number; pre?: string; suf?: string; label: string; color?: string }
  | { k: "stamp"; at: string; t: string; color?: string }
  | { k: "ticker"; at: string; ex: string; sym: string }
  | { k: "steps"; steps: { at: string; t: string }[] }
  | { k: "bars"; at: string; unit: string; bars: { n: string; v: number; c: string }[] }
  | { k: "quote"; at: string; t: string };

export type BScene = {
  text: string;
  tag: string;
  headline: string;
  title: string;
  accent?: string;
  img?: string;
  fit?: "cover" | "contain";
  pos?: string;
  imgBg?: string;
  src?: string;
  items: BItem[];
  outro?: boolean;
  /** commentary scene: quote cards + livelier anchor */
  yorum?: boolean;
};

export type Credit = { license?: string; artist?: string };

export type BultenProps = {
  slug: string;
  date: string;
  scenes: BScene[];
  voice: { duration: number; words: VWord[] };
  envelope: number[];
  credits: Record<string, Credit>;
  /** photo face sticker on the anchor robot: public paths of closed/open mouth frames */
  face?: { closed: string; open: string };
  /** audio path under public/ (default <slug>/voice.mp3) — used by shorts cut from an episode */
  voiceSrc?: string;
};

/** where the scene panel sits (landscape default; the vertical layout scales it) */
const LayoutCtx = React.createContext({ left: 800, top: 120, scale: 1 });

const FPS = 30;
const H = {
  bg1: "#0D1838",
  bg2: "#050913",
  red: "#E5383B",
  yellow: "#FFD23F",
  white: "#FFFFFF",
  edge: "rgba(255,255,255,0.14)",
  sub: "#9AA7C2",
  green: "#2ECC71",
};

export const bultenFrames = (v: { duration: number }) => Math.ceil((v.duration + 2.5) * FPS);

const Ctx = React.createContext<{ p: BultenProps; sceneStart: (i: number) => number; wAt: (s: number, m: string) => number }>(null!);

const makeTiming = (p: BultenProps) => {
  const words = p.voice.words;
  const sceneStart = (i: number) => (i === 0 ? 0 : Math.max(0, words.find((w) => w.scene === i)!.start - 0.3));
  const wAt = (s: number, m: string) => {
    const w = words.find((x) => x.scene === s && x.text.toLocaleLowerCase("tr").replace(/^[^\p{L}\p{N}]+/u, "").startsWith(m.toLocaleLowerCase("tr")));
    if (!w) throw new Error(`kelime bulunamadı: sahne ${s} "${m}"`);
    return w.start - sceneStart(s);
  };
  return { sceneStart, wAt };
};

/* ---------------- studio pieces ---------------- */
const Studio: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: `radial-gradient(ellipse 70% 80% at 30% 40%, ${H.bg1} 0%, ${H.bg2} 75%)` }}>
      <div style={{ position: "absolute", left: 60, top: 120, width: 680, height: 640, borderRadius: 30, background: "linear-gradient(160deg, #1A2B5E 0%, #0C1430 100%)", border: `2px solid ${H.edge}`, overflow: "hidden" }}>
        <div
          style={{
            position: "absolute",
            inset: -200,
            backgroundImage: "linear-gradient(rgba(120,160,255,0.10) 2px, transparent 2px), linear-gradient(90deg, rgba(120,160,255,0.10) 2px, transparent 2px)",
            backgroundSize: "60px 60px",
            translate: `${(frame * 0.6) % 60}px ${(frame * 0.3) % 60}px`,
          }}
        />
        <div style={{ position: "absolute", left: 120 + Math.sin(frame / 50) * 80, top: 140, width: 420, height: 420, borderRadius: 210, background: "radial-gradient(circle, #3D6BFF55 0%, transparent 70%)" }} />
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 260, background: "linear-gradient(to top, rgba(61,107,255,0.10), transparent)" }} />
    </AbsoluteFill>
  );
};

const Desk: React.FC = () => (
  <div style={{ position: "absolute", left: 70, top: 700, width: 660, height: 200 }}>
    <div style={{ position: "absolute", left: 0, top: 0, width: 660, height: 34, borderRadius: 14, background: "#DCE4F5" }} />
    <div
      style={{
        position: "absolute",
        left: 30,
        top: 30,
        width: 600,
        height: 170,
        background: "linear-gradient(180deg, #24346B, #121C3E)",
        borderRadius: "0 0 20px 20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 16,
        fontFamily: sans,
        fontWeight: 900,
        fontSize: 50,
        color: H.white,
        letterSpacing: 2,
      }}
    >
      <div style={{ width: 22, height: 22, borderRadius: 11, background: H.red, boxShadow: `0 0 20px ${H.red}` }} />
      DEPLOY<span style={{ color: H.red, marginLeft: -12 }}>TV</span>
    </div>
  </div>
);

const Anchor: React.FC<{ x?: number; y?: number; size?: number }> = ({ x = 400, y = 890, size = 640 }) => {
  const { p, sceneStart, wAt } = React.useContext(Ctx);
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const a = p.envelope[frame] ?? 0;
  const b = p.envelope[frame - 1] ?? 0;
  const talk = Math.min(1, Math.max(0, (a * 0.7 + b * 0.3 - 0.08) * 1.6));
  const words = p.voice.words;
  const scene = words.find((w) => t < w.end)?.scene ?? p.scenes.length - 1;
  let face: "normal" | "shock" | "happy" = "normal";
  const sc = p.scenes[scene];
  const stamp = sc?.items.find((i) => i.k === "stamp") as { at: string } | undefined;
  if (stamp) {
    const st = sceneStart(scene) + wAt(scene, stamp.at);
    if (t > st && t < st + 1.4) face = "shock";
  }
  if (sc?.outro || t < 2.2) face = "happy";
  if (sc?.yorum && face === "normal") face = "happy";
  const gesture = Math.sin(frame / 13) * 10 * Math.min(1, a * 2);
  const wave = sc?.outro ? 150 + Math.sin(frame / 4) * 18 : 30 + gesture;
  if (p.face) {
    const bob = Math.sin(frame / 9) * 8;
    const tilt = face === "shock" ? -8 : sc?.outro ? 5 : sc?.yorum ? Math.sin(frame / 11) * 6 : 0;
    return (
      <>
        <Bit id="anchor" x={x} y={y} size={size} face={face} talk={talk} armL={25 - gesture * 0.5} armR={wave} headless />
        <FaceSticker closed={staticFile(p.face.closed)} open={staticFile(p.face.open)} talk={talk} cx={x} cy={y - (505 - bob) * (size / 640)} w={330 * (size / 640)} tilt={tilt} />
      </>
    );
  }
  return <Bit id="anchor" x={x} y={y} size={size} face={face} talk={talk} armL={25 - gesture * 0.5} armR={wave} />;
};

const Logo: React.FC<{ size: number }> = ({ size }) => (
  <div style={{ display: "flex", alignItems: "center", gap: size * 0.15, fontFamily: sans, fontWeight: 900, fontSize: size, color: H.white }}>
    <div style={{ background: H.red, padding: `${size * 0.04}px ${size * 0.26}px`, borderRadius: size * 0.12 }}>DEPLOY</div>
    TV
  </div>
);

const Bugs: React.FC = () => {
  const { p } = React.useContext(Ctx);
  return (
    <>
      <div style={{ position: "absolute", left: 60, top: 36 }}>
        <Logo size={32} />
      </div>
      <div style={{ position: "absolute", right: 60, top: 44, fontFamily: sans, fontWeight: 800, fontSize: 26, color: H.sub, letterSpacing: 2 }}>{p.date}</div>
    </>
  );
};

const LowerThird: React.FC<{ s: BScene }> = ({ s }) => {
  const pp = usePopAt(0.15, 16, 160);
  return (
    <div style={{ position: "absolute", left: 60, top: 918, display: "flex", height: 74, fontFamily: sans, translate: `${interpolate(pp, [0, 1], [-1900, 0])}px 0px` }}>
      <div style={{ background: H.red, color: H.white, fontWeight: 900, fontSize: 30, padding: "0 28px", display: "flex", alignItems: "center", letterSpacing: 2 }}>{s.tag}</div>
      <div style={{ background: H.white, color: "#0B1430", fontWeight: 900, fontSize: 38, padding: "0 34px", display: "flex", alignItems: "center", whiteSpace: "nowrap" }}>{s.headline}</div>
    </div>
  );
};

const Ticker: React.FC = () => {
  const { p } = React.useContext(Ctx);
  const frame = useCurrentFrame();
  const seen = new Set<string>();
  const heads = p.scenes.filter((s, i) => i > 0 && !s.yorum && !s.outro && !seen.has(s.headline) && seen.add(s.headline)).map((s) => s.headline);
  const text = heads.join("   ●   ") + "   ●   ";
  const w = text.length * 15.5;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 1010, height: 50, background: "#0A1029", borderTop: `3px solid ${H.yellow}`, overflow: "hidden", fontFamily: sans }}>
      <div style={{ position: "absolute", top: 9, whiteSpace: "nowrap", color: H.white, fontWeight: 700, fontSize: 26, left: 220 - ((frame * 3) % w) }}>
        {text}
        {text}
        {text}
      </div>
      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, background: H.yellow, color: "#0A1029", fontWeight: 900, fontSize: 24, padding: "0 22px", display: "flex", alignItems: "center" }}>
        GÜNDEM
      </div>
    </div>
  );
};

/* ---------------- panel ---------------- */
const fmt = (v: number, dec: number) =>
  v >= 1000 ? Math.round(v).toLocaleString("tr-TR") : v.toFixed(dec).replace(".", ",");

const Pop: React.FC<{ at: number; y: number; children: React.ReactNode; mode?: "up" | "pop" }> = ({ at, y, children, mode = "up" }) => {
  const pp = usePopAt(at, 13, 210);
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: y,
        opacity: Math.min(1, pp * 2),
        translate: mode === "up" ? `0px ${interpolate(pp, [0, 1], [50, 0])}px` : undefined,
        scale: mode === "pop" ? String(interpolate(pp, [0, 1], [0.5, 1])) : undefined,
        transformOrigin: "0% 50%",
      }}
    >
      {children}
    </div>
  );
};

const heightOf = (it: BItem, narrow: boolean) => {
  if (it.k === "chip") {
    const w = it.t.length * (narrow ? 17 : 21) + 70;
    return w > (narrow ? 560 : 964) ? (narrow ? 122 : 138) : narrow ? 88 : 100;
  }
  if (it.k === "steps") return narrow ? 150 : 110;
  if (it.k === "quote") {
    const perLine = narrow ? 22 : 36;
    return Math.ceil(it.t.length / perLine) * 62 + 56;
  }
  return { big: narrow ? 185 : 205, stamp: 128, ticker: 150, bars: 175 }[it.k as "big" | "stamp" | "ticker" | "bars"];
};

const ItemView: React.FC<{ it: BItem; scene: number; narrow: boolean }> = ({ it, scene, narrow }) => {
  const { wAt } = React.useContext(Ctx);
  const frame = useCurrentFrame();
  const fs = narrow ? 30 : 36;
  if (it.k === "chip")
    return (
      <div style={{ display: "inline-flex", alignItems: "center", gap: 14, background: "rgba(255,255,255,0.10)", border: `2px solid ${H.edge}`, borderRadius: 20, padding: "14px 22px", fontWeight: 800, fontSize: fs, lineHeight: 1.18, maxWidth: "100%" }}>
        {it.t}
      </div>
    );
  if (it.k === "big") {
    const at = wAt(scene, it.at);
    const k = interpolate(frame / FPS, [at, at + 1.0], [0, 1], { ...clamp, easing: (x) => 1 - Math.pow(1 - x, 3) });
    const color = it.color ?? H.yellow;
    return (
      <div>
        <div style={{ fontWeight: 900, fontSize: narrow ? 104 : 124, lineHeight: 1, color, textShadow: `0 0 40px ${color}55`, whiteSpace: "nowrap" }}>
          {it.pre}
          {fmt(it.to * k, it.dec ?? 0)}
          <span style={{ fontSize: narrow ? 52 : 64 }}> {it.suf}</span>
        </div>
        <div style={{ color: H.sub, fontWeight: 800, fontSize: 30, marginTop: 10 }}>{it.label}</div>
      </div>
    );
  }
  if (it.k === "stamp") {
    const pp = usePopAt(wAt(scene, it.at), 9, 260);
    const color = it.color ?? H.red;
    return (
      <div
        style={{
          display: "inline-block",
          border: `8px solid ${color}`,
          color,
          borderRadius: 16,
          padding: "6px 26px",
          fontWeight: 900,
          fontSize: it.t.length > 16 ? (narrow ? 40 : 56) : narrow ? 52 : 68,
          letterSpacing: 2,
          rotate: "-3deg",
          opacity: pp > 0.02 ? 1 : 0,
          scale: String(interpolate(pp, [0, 1], [2.4, 1])),
          background: "rgba(0,0,0,0.25)",
          whiteSpace: "nowrap",
        }}
      >
        {it.t}
      </div>
    );
  }
  if (it.k === "quote")
    return (
      <div style={{ display: "flex", gap: 22, alignItems: "flex-start" }}>
        <div style={{ fontFamily: slab, fontWeight: 800, fontSize: 110, lineHeight: 0.8, color: H.yellow }}>“</div>
        <div style={{ fontFamily: slab, fontWeight: 800, fontSize: narrow ? 40 : 50, lineHeight: 1.22, color: H.white }}>{it.t}</div>
      </div>
    );
  if (it.k === "ticker")
    return (
      <div style={{ display: "inline-flex", alignItems: "center", gap: 24, background: "#0E1A12", border: `3px solid ${H.green}`, borderRadius: 22, padding: "18px 32px" }}>
        <span style={{ color: H.sub, fontWeight: 800, fontSize: 38 }}>{it.ex}</span>
        <span style={{ color: H.white, fontWeight: 900, fontSize: 70 }}>{it.sym}</span>
        <span style={{ color: H.green, fontWeight: 900, fontSize: 56 }}>▲</span>
      </div>
    );
  if (it.k === "steps")
    return (
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 12, fontWeight: 900, fontSize: fs }}>
        {it.steps.map((st, i) => {
          const pp = usePopAt(wAt(scene, st.at), 10, 260);
          return (
            <React.Fragment key={st.t}>
              {i > 0 && <span style={{ color: H.sub, opacity: pp }}>→</span>}
              <span style={{ background: H.yellow, color: "#0B1430", borderRadius: 14, padding: "12px 20px", opacity: pp, scale: String(interpolate(pp, [0, 1], [0.5, 1])) }}>{st.t}</span>
            </React.Fragment>
          );
        })}
      </div>
    );
  // bars
  const at = wAt(scene, it.at);
  const max = Math.max(...it.bars.map((b) => b.v));
  return (
    <div>
      {it.bars.map((b, i) => {
        const g = interpolate(frame / FPS, [at + i * 0.3, at + i * 0.3 + 0.8], [0, 1], { ...clamp, easing: (x) => 1 - Math.pow(1 - x, 3) });
        return (
          <div key={b.n} style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 14, opacity: Math.min(1, g * 3) }}>
            <div style={{ width: 170, fontWeight: 900, fontSize: 30 }}>{b.n}</div>
            <div style={{ width: (narrow ? 230 : 520) * (b.v / max) * g, height: 56, borderRadius: 12, background: b.c }} />
            <div style={{ fontWeight: 900, fontSize: 34, color: H.yellow, whiteSpace: "nowrap" }}>
              {fmt(b.v * g, 0)} {it.unit}
            </div>
          </div>
        );
      })}
    </div>
  );
};

const itemAt = (it: BItem) => (it.k === "steps" ? it.steps[0].at : it.at);

const ScenePanel: React.FC<{ s: BScene; i: number }> = ({ s, i }) => {
  const { p, wAt } = React.useContext(Ctx);
  const L = React.useContext(LayoutCtx);
  const frame = useCurrentFrame();
  const pp = usePopAt(0, 15, 170);
  const narrow = !!s.img;
  let y = 0;
  const credit = s.img ? p.credits[s.img] : undefined;
  const creditText = credit ? `Görsel: ${credit.artist || "—"} · ${credit.license ?? ""} · Wikimedia Commons` : "";
  return (
    <div
      style={{
        position: "absolute",
        left: L.left,
        top: L.top,
        scale: String(L.scale),
        transformOrigin: "0 0",
        width: 1060,
        height: 760,
        borderRadius: 30,
        background: "linear-gradient(160deg, rgba(255,255,255,0.09), rgba(255,255,255,0.03))",
        border: `2px solid ${H.edge}`,
        boxShadow: "0 40px 100px rgba(0,0,0,0.5)",
        overflow: "hidden",
        fontFamily: sans,
        color: H.white,
        translate: `${interpolate(pp, [0, 1], [400, 0])}px 0px`,
        opacity: pp,
      }}
    >
      <div style={{ padding: "34px 48px 0", display: "flex", alignItems: "center", gap: 18 }}>
        <div style={{ width: 14, height: 46, borderRadius: 7, background: s.accent ?? H.yellow }} />
        <div style={{ fontWeight: 900, fontSize: 50, letterSpacing: 1 }}>{s.title}</div>
      </div>
      {s.img && (
        <div style={{ position: "absolute", right: 48, top: 130, width: 380, height: 500 }}>
          <div
            style={{
              width: 380,
              height: 470,
              borderRadius: 24,
              overflow: "hidden",
              background: s.imgBg ?? "#000",
              border: `3px solid ${H.edge}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              scale: String(interpolate(usePopAt(0.2, 14, 150), [0, 1], [0.85, 1])),
            }}
          >
            <Img
              src={staticFile(`${p.slug}/img/${s.img}`)}
              style={{
                width: s.fit === "contain" ? "72%" : "100%",
                height: s.fit === "contain" ? "72%" : "100%",
                objectFit: s.fit ?? "cover",
                objectPosition: s.pos ?? "50% 50%",
                scale: String(1 + frame / 3000),
              }}
            />
          </div>
          {creditText && <div style={{ marginTop: 8, color: H.sub, fontSize: 16, fontWeight: 700, lineHeight: 1.2 }}>{creditText}</div>}
        </div>
      )}
      <div style={{ position: "absolute", left: 48, top: 135, width: narrow ? 560 : 964, bottom: 60 }}>
        {s.items.map((it, j) => {
          const top = y;
          y += heightOf(it, narrow);
          return (
            <Pop key={j} at={wAt(i, itemAt(it)) - (it.k === "big" ? 0.2 : 0)} y={top} mode={it.k === "stamp" || it.k === "ticker" ? "pop" : "up"}>
              <ItemView it={it} scene={i} narrow={narrow} />
            </Pop>
          );
        })}
        {s.outro && <Outro i={i} />}
      </div>
      {s.src && <div style={{ position: "absolute", left: 48, bottom: 20, color: H.sub, fontWeight: 700, fontSize: 21 }}>{s.src}</div>}
    </div>
  );
};

const Outro: React.FC<{ i: number }> = ({ i }) => {
  const { wAt } = React.useContext(Ctx);
  const frame = useCurrentFrame();
  const q = wAt(i, "hangisiydi");
  const click = wAt(i, "abone");
  const clicked = frame / FPS > click + 0.3;
  const press = interpolate(frame / FPS, [click + 0.2, click + 0.3, click + 0.45], [1, 0.9, 1], clamp);
  return (
    <>
      <Pop at={q - 0.6} y={0}>
        <div style={{ fontFamily: slab, fontWeight: 800, fontSize: 58, lineHeight: 1.15 }}>
          Haftanın en büyük
          <br />
          haberi hangisiydi? 💬
        </div>
      </Pop>
      <Pop at={wAt(i, "beğenmeyi") - 0.2} y={260} mode="pop">
        <div style={{ display: "flex", alignItems: "center", gap: 26 }}>
          <div style={{ background: "rgba(255,255,255,0.12)", color: H.white, fontWeight: 900, fontSize: 46, padding: "22px 32px", borderRadius: 18, whiteSpace: "nowrap" }}>👍 BEĞEN</div>
          <div style={{ background: clicked ? "#3A3F55" : H.red, color: H.white, fontWeight: 900, fontSize: 46, padding: "22px 36px", borderRadius: 18, whiteSpace: "nowrap", scale: String(press) }}>
            {clicked ? "ABONE OLUNDU ✓" : "ABONE OL"}
          </div>
          <div style={{ fontSize: 72, rotate: clicked ? `${Math.sin(frame / 2) * 18}deg` : "0deg" }}>🔔</div>
        </div>
      </Pop>
    </>
  );
};

/* ---------------- sting ---------------- */
const Sting: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const inn = spring({ frame, fps, config: { damping: 12, stiffness: 140 } });
  const out = interpolate(frame, [50, 62], [0, 1], clamp);
  return (
    <AbsoluteFill style={{ background: H.bg2, opacity: 1 - out, justifyContent: "center", alignItems: "center", fontFamily: sans }}>
      {new Array(18).fill(0).map((_, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: random(`lx${i}`) * 1920,
            top: 0,
            bottom: 0,
            width: 2,
            background: i % 3 ? "#3D6BFF44" : `${H.red}66`,
            translate: `${(frame * (6 + random(`ls${i}`) * 10)) % 400}px 0px`,
          }}
        />
      ))}
      <div style={{ scale: String(interpolate(inn, [0, 1], [1.6, 1]) * (1 + out * 0.3)) }}>
        <Logo size={150} />
      </div>
      <div style={{ position: "absolute", top: 660, color: H.sub, fontWeight: 800, fontSize: 36, letterSpacing: 8, opacity: inn }}>HAFTALIK TEKNOLOJİ BÜLTENİ</div>
    </AbsoluteFill>
  );
};

/* ---------------- sound for items ---------------- */
const itemSfx = (it: BItem): [string, number, number?] => {
  switch (it.k) {
    case "chip":
      return ["pop_dry", 0.22];
    case "big":
      return ["ui_tech-slide", 0.22];
    case "stamp":
      return ["impact_drum-deep", 0.32, 1.0];
    case "ticker":
      return ["ding_announce", 0.18, 1.4];
    case "bars":
      return ["whoosh_small-sweep", 0.25];
    case "quote":
      return ["pop_message", 0.22];
    default:
      return ["ui_cool-click", 0.3];
  }
};

const sfxHits = (p: BultenProps, { sceneStart, wAt }: ReturnType<typeof makeTiming>) => {
  const hits: [number, string, number, number?][] = [];
  p.scenes.forEach((s, i) => {
    for (const it of s.items) {
      const [name, vol, max] = itemSfx(it);
      if (it.k === "steps") it.steps.forEach((st) => hits.push([sceneStart(i) + wAt(i, st.at), "ui_cool-click", 0.3]));
      else hits.push([sceneStart(i) + wAt(i, it.at), name, vol, max]);
    }
    if (s.outro) {
      hits.push([sceneStart(i) + wAt(i, "abone") + 0.25, "ui_cool-click", 0.45]);
      hits.push([sceneStart(i) + wAt(i, "abone") + 0.5, "ding_bell", 0.28, 1.5]);
    }
  });
  return hits;
};

const SfxLayer: React.FC<{ hits: [number, string, number, number?][]; starts: number[] }> = ({ hits, starts }) => (
  <>
    {starts.slice(1).map((t, i) => (
      <Sequence key={`t${i}`} name="sfx: geçiş" from={Math.round((t - 0.1) * FPS)}>
        <Sfx name="whoosh_cinematic-fast" volume={0.22} />
      </Sequence>
    ))}
    {hits.map(([t, name, vol, max], i) => (
      <Sequence key={i} name={`sfx: ${name}`} from={Math.max(0, Math.round(t * FPS))} durationInFrames={max ? Math.round(max * FPS) : undefined}>
        <Sfx name={name} volume={vol} />
      </Sequence>
    ))}
  </>
);

export const Bulten: React.FC<BultenProps> = (p) => {
  const timing = makeTiming(p);
  const { sceneStart } = timing;
  const total = bultenFrames(p.voice);
  const n = p.scenes.length;
  const hits = sfxHits(p, timing);
  return (
    <Ctx.Provider value={{ p, ...timing }}>
      <AbsoluteFill style={{ background: H.bg2 }}>
        <Studio />
        <Anchor />
        <Desk />
        {p.scenes.map((s, i) => {
          const a = Math.round(sceneStart(i) * FPS);
          const b = i === n - 1 ? total : Math.round(sceneStart(i + 1) * FPS);
          return (
            <Sequence key={i} name={`${i}: ${s.tag} · ${s.title}`} from={a} durationInFrames={b - a}>
              <ScenePanel s={s} i={i} />
              <LowerThird s={s} />
            </Sequence>
          );
        })}
        <Ticker />
        <Bugs />
        <Sequence durationInFrames={64} name="Jenerik">
          <Sting />
        </Sequence>
        <Sequence durationInFrames={60} name="sfx: jenerik">
          <Sfx name="whoosh_impact" volume={0.45} />
        </Sequence>
        <SfxLayer hits={hits} starts={p.scenes.map((_, i) => sceneStart(i))} />
        <Audio src={staticFile(p.voiceSrc ?? `${p.slug}/voice.mp3`)} volume={0.95} />
      </AbsoluteFill>
    </Ctx.Provider>
  );
};

/* ---------------- vertical (Shorts / Reels 1080x1920) ---------------- */
// Safe area: top 220, bottom 420 (Shorts/IG UI), right 140.
export const SHORT_END = 2.8;
export const shortFrames = (v: { duration: number }) => Math.ceil((v.duration + SHORT_END) * FPS);

const HookV: React.FC<{ s: BScene }> = ({ s }) => {
  const pp = usePopAt(0.05, 14, 200);
  return (
    <div style={{ position: "absolute", left: 60, right: 60, top: 205, display: "flex", flexDirection: "column", alignItems: "center", gap: 14, fontFamily: sans, opacity: pp, scale: String(interpolate(pp, [0, 1], [0.85, 1])) }}>
      <div style={{ background: s.yorum ? H.yellow : H.red, color: s.yorum ? "#0B1430" : H.white, fontWeight: 900, fontSize: 30, padding: "6px 22px", borderRadius: 10, letterSpacing: 2 }}>
        {s.yorum ? "💬 YORUMUM" : s.tag}
      </div>
      <div style={{ color: H.white, fontWeight: 900, fontSize: s.headline.length > 30 ? 52 : 60, lineHeight: 1.1, textAlign: "center", textShadow: "0 6px 30px rgba(0,0,0,0.6)" }}>{s.headline}</div>
    </div>
  );
};

const EndCardV: React.FC = () => {
  const frame = useCurrentFrame();
  const pp = usePopAt(0, 13, 200);
  const clicked = frame > 40;
  return (
    <AbsoluteFill style={{ background: `rgba(5,9,19,${0.88 * Math.min(1, pp * 1.5)})`, justifyContent: "center", alignItems: "center", flexDirection: "column", gap: 44, fontFamily: sans, color: H.white }}>
      <div style={{ scale: String(interpolate(pp, [0, 1], [1.4, 1])), opacity: pp }}>
        <Logo size={96} />
      </div>
      <div style={{ fontFamily: slab, fontWeight: 800, fontSize: 56, textAlign: "center", lineHeight: 1.2, opacity: pp }}>
        Haftanın tüm haberleri
        <br />
        <span style={{ color: H.yellow }}>tam bölümde</span> 👀
      </div>
      <div style={{ background: clicked ? "#3A3F55" : H.red, fontWeight: 900, fontSize: 50, padding: "22px 44px", borderRadius: 20, opacity: pp, scale: String(interpolate(frame, [36, 40, 45], [1, 0.9, 1], clamp)) }}>
        {clicked ? "ABONE OLUNDU ✓" : "ABONE OL"} 🔔
      </div>
    </AbsoluteFill>
  );
};

export const BultenDikey: React.FC<BultenProps> = (p) => {
  const frame = useCurrentFrame();
  const timing = makeTiming(p);
  const { sceneStart } = timing;
  const n = p.scenes.length;
  const voiceEnd = Math.round((p.voice.duration + 0.3) * FPS);
  const hits = sfxHits(p, timing);
  return (
    <Ctx.Provider value={{ p, ...timing }}>
      <LayoutCtx.Provider value={{ left: 37, top: 395, scale: 0.95 }}>
        <AbsoluteFill style={{ background: `radial-gradient(ellipse 90% 60% at 50% 40%, ${H.bg1} 0%, ${H.bg2} 75%)` }}>
          <AbsoluteFill
            style={{
              backgroundImage: "linear-gradient(rgba(120,160,255,0.07) 2px, transparent 2px), linear-gradient(90deg, rgba(120,160,255,0.07) 2px, transparent 2px)",
              backgroundSize: "60px 60px",
              backgroundPosition: `${(frame * 0.6) % 60}px ${(frame * 0.3) % 60}px`,
            }}
          />
          <div style={{ position: "absolute", left: 0, right: 0, top: 120, display: "flex", justifyContent: "center", alignItems: "center", gap: 18 }}>
            <Logo size={34} />
            <span style={{ fontFamily: sans, color: H.sub, fontWeight: 800, fontSize: 26, letterSpacing: 2 }}>{p.date}</span>
          </div>
          <div style={{ position: "absolute", left: 0, right: 0, top: 1150, height: 770, background: "radial-gradient(ellipse 50% 45% at 50% 30%, #3D6BFF33 0%, transparent 70%)" }} />
          <Anchor x={540} y={1640} size={460} />
          {p.scenes.map((s, i) => {
            const a = Math.round(sceneStart(i) * FPS);
            const b = i === n - 1 ? voiceEnd : Math.round(sceneStart(i + 1) * FPS);
            return (
              <Sequence key={i} name={`${i}: ${s.tag} · ${s.title}`} from={a} durationInFrames={b - a}>
                <ScenePanel s={s} i={i} />
                <HookV s={s} />
              </Sequence>
            );
          })}
          <TagCaptions words={p.voice.words} y={1450} />
          <Sequence from={voiceEnd} name="Kapanış">
            <EndCardV />
          </Sequence>
          <Sequence durationInFrames={40} name="sfx: açılış">
            <Sfx name="whoosh_impact" volume={0.35} />
          </Sequence>
          <Sequence from={voiceEnd} durationInFrames={40} name="sfx: kapanış">
            <Sfx name="whoosh_small-sweep" volume={0.35} />
          </Sequence>
          <Sequence from={voiceEnd + 40} durationInFrames={45} name="sfx: abone">
            <Sfx name="ding_bell" volume={0.28} />
          </Sequence>
          <SfxLayer hits={hits} starts={p.scenes.map((_, i) => sceneStart(i))} />
          <Audio src={staticFile(p.voiceSrc ?? `${p.slug}/voice.mp3`)} volume={0.95} />
        </AbsoluteFill>
      </LayoutCtx.Provider>
    </Ctx.Provider>
  );
};
