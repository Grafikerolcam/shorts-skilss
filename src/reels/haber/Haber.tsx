import React from "react";
import { Audio } from "@remotion/media";
import { AbsoluteFill, interpolate, random, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Sfx } from "../sfx";
import { Bit, slab, sans, usePopAt, VWord, clamp } from "../cizgi/kit";
import voice from "./voice.json";
import envelope from "./envelope.json";

// DeployTv — YouTube haber bülteni (1920x1080). Sunucu şimdilik Bit (dudak senkronlu);
// gerçekçi avatar gelince sol paneldeki <Anchor/> yerine avatar videosu konur.
// Kaynaklar (17 Kas 2026): Nvidia SEC bildirimi + The National/CNBC (Huang istifası, Q3 beklentisi);
// The National/CNBC (Anthropic halka arz); Google Blog (Gemini 4 Carbon); SiliconANGLE (OpenAI yatırımı).

const FPS = 30;
const words = voice.words as VWord[];
const env = envelope as number[];
const N = Math.max(...words.map((w) => w.scene)) + 1;
export const HABER_FRAMES = Math.ceil((voice.duration + 2.0) * FPS);

const sceneStart = (i: number) => (i === 0 ? 0 : Math.max(0, words.find((w) => w.scene === i)!.start - 0.25));
const sceneEnd = (i: number) => (i === N - 1 ? HABER_FRAMES / FPS : sceneStart(i + 1));
const wAt = (s: number, m: string) => {
  const w = words.find((x) => x.scene === s && x.text.toLocaleLowerCase("tr").startsWith(m.toLocaleLowerCase("tr")));
  if (!w) throw new Error(`kelime yok: ${s}/${m}`);
  return w.start - sceneStart(s);
};

const H = {
  bg1: "#0D1838",
  bg2: "#050913",
  red: "#E5383B",
  yellow: "#FFD23F",
  white: "#FFFFFF",
  panel: "rgba(255,255,255,0.06)",
  edge: "rgba(255,255,255,0.14)",
  sub: "#9AA7C2",
  green: "#2ECC71",
};

const HEADLINES = [
  "BU HAFTA TEKNOLOJİDE 4 BÜYÜK GELİŞME",
  "NVIDIA CEO'SU JENSEN HUANG İSTİFA ETTİ",
  "ANTHROPIC NASDAQ'TA HALKA ARZ OLUYOR",
  "GOOGLE GEMINI 4 CARBON KULLANIMA AÇILDI",
  "OPENAI'A 11 MİLYAR DOLARLIK YATIRIM",
  "ABONE OLMAYI UNUTMAYIN",
];
const TAGS = ["GÜNDEM", "HABER 1/4", "HABER 2/4", "HABER 3/4", "HABER 4/4", "DEPLOYTV"];
const SOURCES = [
  "",
  "Kaynak: Nvidia SEC bildirimi · CNBC · The National",
  "Kaynak: CNBC · The National (halka arz izahnamesi)",
  "Kaynak: Google Blog",
  "Kaynak: SiliconANGLE (raporlara göre)",
  "",
];

/* ---------------- studio ---------------- */
const Studio: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: `radial-gradient(ellipse 70% 80% at 30% 40%, ${H.bg1} 0%, ${H.bg2} 75%)` }}>
      {/* video wall behind anchor */}
      <div
        style={{
          position: "absolute",
          left: 60,
          top: 120,
          width: 680,
          height: 640,
          borderRadius: 30,
          background: "linear-gradient(160deg, #1A2B5E 0%, #0C1430 100%)",
          border: `2px solid ${H.edge}`,
          overflow: "hidden",
        }}
      >
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
      {/* floor light */}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 260, background: "linear-gradient(to top, rgba(61,107,255,0.10), transparent)" }} />
    </AbsoluteFill>
  );
};

const Desk: React.FC<{ x?: number; y?: number }> = ({ x = 70, y = 700 }) => (
  <div style={{ position: "absolute", left: x, top: y, width: 660, height: 200 }}>
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
        fontSize: 46,
        color: H.white,
        letterSpacing: 2,
      }}
    >
      <div style={{ width: 22, height: 22, borderRadius: 11, background: H.red, boxShadow: `0 0 20px ${H.red}` }} />
      DEPLOYTV
    </div>
  </div>
);

const Anchor: React.FC<{ x?: number; y?: number; size?: number }> = ({ x = 400, y = 890, size = 640 }) => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const a = env[frame] ?? 0;
  const b = env[frame - 1] ?? 0;
  const talk = Math.min(1, Math.max(0, (a * 0.7 + b * 0.3 - 0.08) * 1.6));
  const scene = words.find((w) => t < w.end)?.scene ?? N - 1;
  let face: "normal" | "shock" | "happy" | "wink" = "normal";
  if (scene === 1 && t > sceneStart(1) + wAt(1, "istifa") && t < sceneStart(1) + wAt(1, "istifa") + 1.6) face = "shock";
  if (scene === N - 1) face = "happy";
  if (scene === 4 && t > sceneStart(4) + wAt(4, "kulüb")) face = "wink";
  const gesture = Math.sin(frame / 13) * 10 * Math.min(1, a * 2);
  const wave = scene === N - 1 ? 150 + Math.sin(frame / 4) * 18 : 30 + gesture;
  return <Bit id="anchor" x={x} y={y} size={size} face={face} talk={talk} armL={25 - gesture * 0.5} armR={wave} />;
};

/* ---------------- graphics ---------------- */
const LogoBug: React.FC = () => (
  <div style={{ position: "absolute", left: 60, top: 40, display: "flex", alignItems: "center", gap: 14, fontFamily: sans, fontWeight: 900, fontSize: 30, color: H.white, letterSpacing: 2 }}>
    <div style={{ background: H.red, padding: "6px 14px", borderRadius: 8 }}>DEPLOY</div>
    TV
  </div>
);

const DateBug: React.FC = () => (
  <div style={{ position: "absolute", right: 60, top: 44, fontFamily: sans, fontWeight: 800, fontSize: 26, color: H.sub, letterSpacing: 2 }}>17 KASIM 2026</div>
);

const LowerThird: React.FC<{ scene: number }> = ({ scene }) => {
  const p = usePopAt(0.15, 16, 160);
  return (
    <div style={{ position: "absolute", left: 60, top: 918, display: "flex", height: 74, fontFamily: sans, translate: `${interpolate(p, [0, 1], [-1900, 0])}px 0px` }}>
      <div style={{ background: H.red, color: H.white, fontWeight: 900, fontSize: 30, padding: "0 28px", display: "flex", alignItems: "center", letterSpacing: 2 }}>{TAGS[scene]}</div>
      <div style={{ background: H.white, color: "#0B1430", fontWeight: 900, fontSize: 38, padding: "0 34px", display: "flex", alignItems: "center" }}>{HEADLINES[scene]}</div>
    </div>
  );
};

const Ticker: React.FC = () => {
  const frame = useCurrentFrame();
  const text = HEADLINES.slice(1, 5).join("   ●   ") + "   ●   ";
  const w = 2600;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 1010, height: 50, background: "#0A1029", borderTop: `3px solid ${H.yellow}`, overflow: "hidden", fontFamily: sans }}>
      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, zIndex: 2, background: H.yellow, color: "#0A1029", fontWeight: 900, fontSize: 24, padding: "0 22px", display: "flex", alignItems: "center" }}>
        SON DAKİKA
      </div>
      <div style={{ position: "absolute", top: 9, whiteSpace: "nowrap", color: H.white, fontWeight: 700, fontSize: 26, left: 220 - ((frame * 3) % w) }}>
        {text}
        {text}
        {text}
      </div>
    </div>
  );
};

/* ---------------- story panel building blocks ---------------- */
const PANEL = { x: 800, y: 120, w: 1060, h: 760 };
const PanelPos = React.createContext({ x: PANEL.x, y: PANEL.y });

const Panel: React.FC<{ title: string; source?: string; children: React.ReactNode; accent?: string }> = ({ title, source, children, accent = H.yellow }) => {
  const p = usePopAt(0, 15, 170);
  const pos = React.useContext(PanelPos);
  return (
    <div
      style={{
        position: "absolute",
        left: pos.x,
        top: pos.y,
        width: PANEL.w,
        height: PANEL.h,
        borderRadius: 30,
        background: "linear-gradient(160deg, rgba(255,255,255,0.09), rgba(255,255,255,0.03))",
        border: `2px solid ${H.edge}`,
        boxShadow: "0 40px 100px rgba(0,0,0,0.5)",
        overflow: "hidden",
        fontFamily: sans,
        color: H.white,
        translate: `${interpolate(p, [0, 1], [400, 0])}px 0px`,
        opacity: p,
      }}
    >
      <div style={{ padding: "34px 48px 0", display: "flex", alignItems: "center", gap: 18 }}>
        <div style={{ width: 14, height: 46, borderRadius: 7, background: accent }} />
        <div style={{ fontWeight: 900, fontSize: 52, letterSpacing: 1 }}>{title}</div>
      </div>
      <div style={{ position: "absolute", left: 48, right: 48, top: 130, bottom: 60 }}>{children}</div>
      {source && <div style={{ position: "absolute", left: 48, bottom: 20, color: H.sub, fontWeight: 700, fontSize: 22 }}>{source}</div>}
    </div>
  );
};

const Item: React.FC<{ at: number; x?: number; y: number; w?: number; children: React.ReactNode; from?: "up" | "pop" }> = ({ at, x = 0, y, w, children, from = "up" }) => {
  const p = usePopAt(at, 13, 210);
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: w,
        opacity: Math.min(1, p * 2),
        translate: from === "up" ? `0px ${interpolate(p, [0, 1], [50, 0])}px` : undefined,
        scale: from === "pop" ? String(interpolate(p, [0, 1], [0.5, 1])) : undefined,
      }}
    >
      {children}
    </div>
  );
};

const Chip: React.FC<{ children: React.ReactNode; color?: string }> = ({ children, color = "rgba(255,255,255,0.10)" }) => (
  <div style={{ display: "inline-flex", alignItems: "center", gap: 14, background: color, border: `2px solid ${H.edge}`, borderRadius: 20, padding: "18px 26px", fontWeight: 800, fontSize: 38 }}>
    {children}
  </div>
);

const BigNum: React.FC<{ at: number; to: number; decimals?: number; prefix?: string; suffix: string; label: string; color?: string }> = ({
  at,
  to,
  decimals = 0,
  prefix = "",
  suffix,
  label,
  color = H.yellow,
}) => {
  const frame = useCurrentFrame();
  const k = interpolate(frame / FPS, [at, at + 1.0], [0, 1], { ...clamp, easing: (x) => 1 - Math.pow(1 - x, 3) });
  const v = (to * k).toFixed(decimals).replace(".", ",");
  return (
    <div>
      <div style={{ fontWeight: 900, fontSize: 130, lineHeight: 1, color, textShadow: `0 0 40px ${color}55` }}>
        {prefix}
        {v}
        <span style={{ fontSize: 70 }}> {suffix}</span>
      </div>
      <div style={{ color: H.sub, fontWeight: 800, fontSize: 34, marginTop: 10 }}>{label}</div>
    </div>
  );
};

const StampBox: React.FC<{ at: number; color?: string; children: React.ReactNode }> = ({ at, color = H.red, children }) => {
  const p = usePopAt(at, 9, 260);
  return (
    <div
      style={{
        display: "inline-block",
        border: `8px solid ${color}`,
        color,
        borderRadius: 16,
        padding: "8px 30px",
        fontWeight: 900,
        fontSize: 76,
        letterSpacing: 2,
        rotate: "-4deg",
        opacity: p > 0.02 ? 1 : 0,
        scale: String(interpolate(p, [0, 1], [2.4, 1])),
        background: "rgba(0,0,0,0.25)",
      }}
    >
      {children}
    </div>
  );
};

/* ---------------- scenes ---------------- */
const Intro: React.FC = () => {
  const items = HEADLINES.slice(1, 5);
  const at = wAt(0, "dört");
  return (
    <>
      <Panel title="BU HAFTA">
        {items.map((h, i) => (
          <Item key={h} at={at + 0.15 + i * 0.18} y={i * 140}>
            <Chip>
              <span style={{ color: H.yellow, fontWeight: 900 }}>{i + 1}</span>
              {h.charAt(0) + h.slice(1).toLocaleLowerCase("tr")}
            </Chip>
          </Item>
        ))}
      </Panel>
    </>
  );
};

const Nvidia: React.FC = () => (
  <Panel title="NVIDIA'DA DEPREM" source={SOURCES[1]} accent={H.green}>
    <Item at={wAt(1, "istifa")} y={0} from="pop">
      <StampBox at={wAt(1, "istifa")}>CEO İSTİFA ETTİ</StampBox>
    </Item>
    <Item at={wAt(1, "12")} y={150}>
      <Chip>📅 12 Kasım · anında yürürlükte</Chip>
    </Item>
    <Item at={wAt(1, "geçici")} y={260}>
      <Chip>
        👤 Geçici CEO: <span style={{ color: H.yellow }}>Colette Kress</span> (CFO)
      </Chip>
    </Item>
    <Item at={wAt(1, "109") - 0.2} y={390}>
      <BigNum at={wAt(1, "109")} to={109} prefix="$" suffix="milyar" label="3. çeyrek gelir beklentisi (+%91) · bilanço bugün" />
    </Item>
  </Panel>
);

const Anthropic: React.FC = () => (
  <Panel title="ANTHROPIC HALKA ARZ" source={SOURCES[2]} accent="#D97757">
    <Item at={wAt(2, "nasdaq")} y={0} from="pop">
      <div style={{ display: "inline-flex", alignItems: "center", gap: 24, background: "#0E1A12", border: `3px solid ${H.green}`, borderRadius: 22, padding: "20px 34px" }}>
        <span style={{ color: H.sub, fontWeight: 800, fontSize: 40 }}>NASDAQ</span>
        <span style={{ color: H.white, fontWeight: 900, fontSize: 72 }}>ANT</span>
        <span style={{ color: H.green, fontWeight: 900, fontSize: 60 }}>▲</span>
      </div>
    </Item>
    <Item at={wAt(2, "19")} y={160}>
      <Chip>📅 İlk işlem günü: 19 Kasım (beklenen)</Chip>
    </Item>
    <Item at={wAt(2, "fiyat")} y={270}>
      <Chip>
        💵 Fiyat aralığı: <span style={{ color: H.yellow }}>70 – 78 $</span> / hisse
      </Chip>
    </Item>
    <Item at={wAt(2, "1,3") - 0.2} y={400}>
      <BigNum at={wAt(2, "1,3")} to={1.3} decimals={1} prefix="$" suffix="trilyon+" label="tahmini piyasa değeri (1,3 – 1,45 trilyon $)" />
    </Item>
  </Panel>
);

const Gemini: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <Panel title="GEMINI 4 CARBON" source={SOURCES[3]} accent="#4C8DF6">
      <Item at={wAt(3, "gemini")} y={0} from="pop">
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 26,
            padding: "26px 40px",
            borderRadius: 26,
            background: "linear-gradient(120deg, #1B3A8A, #4C8DF6 60%, #9B72F2)",
            boxShadow: "0 0 60px #4C8DF666",
          }}
        >
          <span style={{ fontSize: 80, rotate: `${frame * 2}deg`, display: "inline-block" }}>✦</span>
          <div>
            <div style={{ fontWeight: 900, fontSize: 64 }}>Gemini 4 Carbon</div>
            <div style={{ fontWeight: 800, fontSize: 32, opacity: 0.85 }}>Google'ın en güçlü modeli</div>
          </div>
        </div>
      </Item>
      <Item at={wAt(3, "siber")} y={210}>
        <Chip>🛡️ Önce 2 hafta: siber güvenlik ekipleri</Chip>
      </Item>
      <Item at={wAt(3, "geliştiriciler")} y={340}>
        <Chip>👩‍💻 Geliştiriciler</Chip>
      </Item>
      <Item at={wAt(3, "şirketler")} x={420} y={340}>
        <Chip>🏢 Şirketler</Chip>
      </Item>
      <Item at={wAt(3, "ultra")} y={460}>
        <Chip>⭐ Google AI Ultra aboneleri</Chip>
      </Item>
    </Panel>
  );
};

const OpenAI: React.FC = () => {
  const frame = useCurrentFrame();
  const barAt = wAt(4, "1,25");
  const grow = (d: number) => interpolate(frame / FPS, [barAt + d, barAt + d + 0.8], [0, 1], { ...clamp, easing: (x) => 1 - Math.pow(1 - x, 3) });
  const bars = [
    { n: "OpenAI", v: 1.25, c: "#10A37F", d: 0 },
    { n: "Anthropic*", v: 1.3, c: "#D97757", d: 0.25 },
  ];
  return (
    <Panel title="TRİLYON DOLAR KULÜBÜ" source={SOURCES[4] + " · *halka arz tahmini"} accent="#10A37F">
      <Item at={wAt(4, "11")} y={0}>
        <BigNum at={wAt(4, "11")} to={11} prefix="+$" suffix="milyar" label="OpenAI'a yeni yatırım (ilk kapanış)" color={H.green} />
      </Item>
      {bars.map((b, i) => (
        <div key={b.n} style={{ position: "absolute", left: 0, top: 250 + i * 120, display: "flex", alignItems: "center", gap: 20, opacity: Math.min(1, grow(b.d) * 3) }}>
          <div style={{ width: 230, fontWeight: 900, fontSize: 38 }}>{b.n}</div>
          <div style={{ width: 560 * (b.v / 1.45) * grow(b.d), height: 66, borderRadius: 14, background: b.c }} />
          <div style={{ fontWeight: 900, fontSize: 40, color: H.yellow }}>{(b.v * grow(b.d)).toFixed(2).replace(".", ",")} T$</div>
        </div>
      ))}
      <Item at={wAt(4, "kulüb")} x={560} y={460} from="pop">
        <StampBox at={wAt(4, "kulüb")} color={H.yellow}>
          🏆 TRİLYON
        </StampBox>
      </Item>
    </Panel>
  );
};

const Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const click = wAt(5, "abone");
  const clicked = frame / FPS > click + 0.3;
  const press = interpolate(frame / FPS, [click + 0.2, click + 0.3, click + 0.45], [1, 0.9, 1], clamp);
  return (
    <Panel title="SIRA SİZDE">
      <Item at={wAt(5, "hangi")} y={0}>
        <div style={{ fontFamily: slab, fontWeight: 800, fontSize: 60, lineHeight: 1.15 }}>
          Hangi haber sizi
          <br />
          en çok şaşırttı? 💬
        </div>
      </Item>
      <Item at={click - 0.4} y={300} from="pop">
        <div style={{ display: "flex", alignItems: "center", gap: 30 }}>
          <div
            style={{
              background: clicked ? "#3A3F55" : H.red,
              color: H.white,
              fontWeight: 900,
              fontSize: 56,
              padding: "24px 50px",
              borderRadius: 18,
              scale: String(press),
            }}
          >
            {clicked ? "ABONE OLUNDU ✓" : "ABONE OL"}
          </div>
          <div style={{ fontSize: 80, rotate: clicked ? `${Math.sin(frame / 2) * 18}deg` : "0deg" }}>🔔</div>
        </div>
      </Item>
    </Panel>
  );
};

const SCENES = [Intro, Nvidia, Anthropic, Gemini, OpenAI, Outro];

const sfxList = (): [number, number, string, number, number?][] => [
  [0, 0.0, "whoosh_impact", 0.5, 2.0],
  [0, 0.05, "impact_logo-intro", 0.35, 2.0],
  [0, wAt(0, "dört") + 0.15, "pop_cluster", 0.35],
  [1, wAt(1, "istifa"), "impact_drum-deep", 0.4, 1.2],
  [1, wAt(1, "12"), "pop_dry", 0.3],
  [1, wAt(1, "geçici"), "pop_dry", 0.3],
  [1, wAt(1, "109"), "ui_tech-slide", 0.3],
  [2, wAt(2, "nasdaq"), "ding_announce", 0.25, 1.5],
  [2, wAt(2, "fiyat"), "pop_dry", 0.3],
  [2, wAt(2, "1,3"), "ui_tech-slide", 0.3],
  [3, wAt(3, "gemini"), "magic_sparkle-intro", 0.25, 2.0],
  [3, wAt(3, "siber"), "pop_dry", 0.3],
  [3, wAt(3, "geliştiriciler"), "pop_dry", 0.3],
  [3, wAt(3, "ultra"), "pop_dry", 0.3],
  [4, wAt(4, "11"), "ui_tech-slide", 0.3],
  [4, wAt(4, "1,25"), "whoosh_small-sweep", 0.3],
  [4, wAt(4, "kulüb"), "ding_correct-reward", 0.3],
  [5, wAt(5, "abone") + 0.25, "ui_cool-click", 0.5],
  [5, wAt(5, "abone") + 0.5, "ding_bell", 0.3, 1.5],
];

export const Haber: React.FC = () => (
  <AbsoluteFill style={{ background: H.bg2 }}>
    <Studio />
    <Anchor />
    <Desk />
    {SCENES.slice(0, N).map((Sc, i) => {
      const a = Math.round(sceneStart(i) * FPS);
      const b = Math.round(sceneEnd(i) * FPS);
      return (
        <Sequence key={i} name={`Bölüm ${i}: ${TAGS[i]}`} from={a} durationInFrames={b - a}>
          <Sc />
          <LowerThird scene={i} />
        </Sequence>
      );
    })}
    <Ticker />
    <LogoBug />
    <DateBug />
    {/* re-draw intro sting above everything */}
    <Sequence durationInFrames={64}>
      <IntroStingOnTop />
    </Sequence>
    {new Array(N - 1).fill(0).map((_, i) => (
      <Sequence key={`t${i}`} name="sfx: geçiş" from={Math.round((sceneStart(i + 1) - 0.1) * FPS)}>
        <Sfx name="whoosh_cinematic-fast" volume={0.3} />
      </Sequence>
    ))}
    {sfxList().map(([s, t, n, v, max], i) => (
      <Sequence key={i} name={`sfx: ${n}`} from={Math.max(0, Math.round((sceneStart(s) + t) * FPS))} durationInFrames={max ? Math.round(max * FPS) : undefined}>
        <Sfx name={n} volume={v} />
      </Sequence>
    ))}
    <Audio src={staticFile("haber/voice.mp3")} volume={0.95} />
  </AbsoluteFill>
);

const IntroStingOnTop: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const logoIn = spring({ frame, fps, config: { damping: 12, stiffness: 140 } });
  const logoOut = interpolate(frame, [50, 62], [0, 1], clamp);
  return (
    <AbsoluteFill style={{ background: H.bg2, opacity: 1 - logoOut, justifyContent: "center", alignItems: "center", fontFamily: sans }}>
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
      <div style={{ display: "flex", alignItems: "center", gap: 26, scale: String(interpolate(logoIn, [0, 1], [1.6, 1]) * (1 + logoOut * 0.3)) }}>
        <div style={{ background: H.red, color: H.white, fontWeight: 900, fontSize: 130, padding: "4px 34px", borderRadius: 16 }}>DEPLOY</div>
        <div style={{ color: H.white, fontWeight: 900, fontSize: 130 }}>TV</div>
      </div>
      <div style={{ position: "absolute", top: 640, color: H.sub, fontWeight: 800, fontSize: 36, letterSpacing: 8, opacity: logoIn }}>HAFTALIK TEKNOLOJİ BÜLTENİ</div>
    </AbsoluteFill>
  );
};

/* ================= Reels (9:16) versiyonu ================= */
const LowerThirdV: React.FC<{ scene: number }> = ({ scene }) => {
  const p = usePopAt(0.15, 16, 160);
  return (
    <div style={{ position: "absolute", left: 90, right: 90, top: 735, fontFamily: sans, translate: `${interpolate(p, [0, 1], [-1200, 0])}px 0px` }}>
      <div style={{ display: "inline-block", background: H.red, color: H.white, fontWeight: 900, fontSize: 32, padding: "8px 22px", letterSpacing: 2 }}>{TAGS[scene]}</div>
      <div style={{ background: H.white, color: "#0B1430", fontWeight: 900, fontSize: 46, lineHeight: 1.15, padding: "14px 24px" }}>{HEADLINES[scene]}</div>
    </div>
  );
};

const StingV: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const logoIn = spring({ frame, fps, config: { damping: 12, stiffness: 140 } });
  const logoOut = interpolate(frame, [50, 62], [0, 1], clamp);
  return (
    <AbsoluteFill style={{ background: H.bg2, opacity: 1 - logoOut, justifyContent: "center", alignItems: "center", fontFamily: sans }}>
      {new Array(14).fill(0).map((_, i) => (
        <div key={i} style={{ position: "absolute", top: random(`vy${i}`) * 1920, left: 0, right: 0, height: 2, background: i % 3 ? "#3D6BFF44" : `${H.red}66`, translate: `0px ${(frame * (6 + random(`vs${i}`) * 10)) % 400}px` }} />
      ))}
      <div style={{ textAlign: "center", scale: String(interpolate(logoIn, [0, 1], [1.6, 1]) * (1 + logoOut * 0.3)) }}>
        <div style={{ display: "inline-block", background: H.red, color: H.white, fontWeight: 900, fontSize: 150, padding: "4px 40px", borderRadius: 18 }}>DEPLOY</div>
        <div style={{ color: H.white, fontWeight: 900, fontSize: 150, marginTop: 10 }}>TV</div>
        <div style={{ color: H.sub, fontWeight: 800, fontSize: 36, letterSpacing: 6, marginTop: 20, opacity: logoIn }}>HAFTALIK TEKNOLOJİ BÜLTENİ</div>
      </div>
    </AbsoluteFill>
  );
};

export const HaberDikey: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: `radial-gradient(ellipse 90% 60% at 50% 30%, ${H.bg1} 0%, ${H.bg2} 75%)` }}>
      <AbsoluteFill
        style={{
          backgroundImage: "linear-gradient(rgba(120,160,255,0.07) 2px, transparent 2px), linear-gradient(90deg, rgba(120,160,255,0.07) 2px, transparent 2px)",
          backgroundSize: "60px 60px",
          backgroundPosition: `${(frame * 0.6) % 60}px ${(frame * 0.3) % 60}px`,
        }}
      />
      <div style={{ position: "absolute", left: 0, right: 0, top: 230, display: "flex", justifyContent: "center", gap: 14, alignItems: "center", fontFamily: sans, fontWeight: 900, fontSize: 34, color: H.white, letterSpacing: 2 }}>
        <div style={{ background: H.red, padding: "6px 16px", borderRadius: 8 }}>DEPLOY</div>
        TV
        <span style={{ color: H.sub, fontWeight: 800, fontSize: 26, marginLeft: 18 }}>17 KASIM 2026</span>
      </div>
      <Anchor x={540} y={650} size={380} />
      <Desk x={210} y={525} />
      <PanelPos.Provider value={{ x: 0, y: 0 }}>
        {SCENES.slice(0, N).map((Sc, i) => {
          const a = Math.round(sceneStart(i) * FPS);
          const b = Math.round(sceneEnd(i) * FPS);
          return (
            <Sequence key={i} name={`Bölüm ${i}: ${TAGS[i]}`} from={a} durationInFrames={b - a}>
              <div style={{ position: "absolute", left: 116, top: 925, width: PANEL.w, height: PANEL.h, scale: "0.8", transformOrigin: "0 0" }}>
                <Sc />
              </div>
              <LowerThirdV scene={i} />
            </Sequence>
          );
        })}
      </PanelPos.Provider>
      <Sequence durationInFrames={64}>
        <StingV />
      </Sequence>
      {new Array(N - 1).fill(0).map((_, i) => (
        <Sequence key={`t${i}`} name="sfx: geçiş" from={Math.round((sceneStart(i + 1) - 0.1) * FPS)}>
          <Sfx name="whoosh_cinematic-fast" volume={0.3} />
        </Sequence>
      ))}
      {sfxList().map(([sc, t, n, v, max], i) => (
        <Sequence key={i} name={`sfx: ${n}`} from={Math.max(0, Math.round((sceneStart(sc) + t) * FPS))} durationInFrames={max ? Math.round(max * FPS) : undefined}>
          <Sfx name={n} volume={v} />
        </Sequence>
      ))}
      <Audio src={staticFile("haber/voice.mp3")} volume={0.95} />
    </AbsoluteFill>
  );
};
