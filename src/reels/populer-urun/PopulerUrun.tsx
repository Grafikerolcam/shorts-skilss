import React from "react";
import { AbsoluteFill, interpolate, Sequence, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { C, fontFamily } from "../theme";
import { CTA, ease, Flash, Grade, NeonTitle, TechBackdrop, Word, WordCaptions } from "../components";
import { Sfx } from "../sfx";

// "Dünyanın en popüler teknoloji ürünü" — tamamen animasyon, çekim yok. 31 s @ 30 fps.
// Kaynaklar: OpenAI (Şubat 2026: haftalık 900M+), UBS (Şubat 2023: 2 ayda 100M),
// Apple Türkiye 2025 en popüler ücretsiz iPhone uygulamaları (1. ChatGPT, 2. Temu, 3. Google Gemini).

export const POPULER_URUN_SEC = 31;
const FPS = 30;
const f = (s: number) => Math.round(s * FPS);
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/* ---------- captions: phrase spread evenly over [start, end] ---------- */
const phrase = (text: string, start: number, end: number): Word[] => {
  const ws = text.split(" ");
  const step = ((end - start) * 1000) / ws.length;
  return ws.map((t, i) => ({ text: t, startMs: start * 1000 + i * step, endMs: start * 1000 + (i + 1) * step }));
};
const words: Word[] = [
  ...phrase("Dünyanın en popüler teknoloji ürünü ne?", 0.3, 3.0),
  ...phrase("iPhone mu? Instagram mı? TikTok mu?", 3.3, 5.25),
  ...phrase("Hiçbiri.", 5.4, 6.3),
  ...phrase("Cevap:", 6.5, 7.0),
  ...phrase("Herkesin cebinde.", 8.2, 9.4),
  ...phrase("Her hafta 900 milyondan fazla kişi kullanıyor.", 9.8, 13.2),
  ...phrase("100 milyon kullanıcıya ulaşmak...", 13.7, 15.0),
  ...phrase("Instagram'a 2,5 yıl", 15.0, 15.9),
  ...phrase("TikTok'a 9 ay", 15.9, 16.85),
  ...phrase("ChatGPT'ye sadece", 16.9, 17.8),
  ...phrase("2 ay!", 17.8, 18.9),
  ...phrase("Türkiye'de de yılın 1 numarası.", 19.3, 22.2),
  ...phrase("Peki nasıl çalışıyor?", 22.8, 24.0),
  ...phrase("Aslında sadece sıradaki kelimeyi tahmin ediyor.", 24.1, 26.9),
];

/* ---------- scene wrapper: punch-in on enter, whip-blur on exit ---------- */
const Scene: React.FC<{ dur: number; children: React.ReactNode }> = ({ dur, children }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 16, stiffness: 170 } });
  const exit = interpolate(frame, [dur - 5, dur], [0, 1], clamp);
  return (
    <AbsoluteFill
      style={{
        opacity: enter * (1 - exit),
        scale: String(interpolate(enter, [0, 1], [1.14, 1]) * (1 + exit * 0.08)),
        filter: `blur(${(1 - enter) * 10 + exit * 16}px)`,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

const usePop = (at: number, damping = 13) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - f(at), fps, config: { damping, stiffness: 220, mass: 0.7 } });
};

const glass: React.CSSProperties = {
  background: "rgba(18, 22, 24, 0.72)",
  border: "1.5px solid rgba(255,255,255,0.13)",
  borderRadius: 34,
  boxShadow: "0 30px 80px rgba(0,0,0,0.55)",
  fontFamily,
};

const Footnote: React.FC<{ text: string }> = ({ text }) => (
  <div style={{ position: "absolute", top: 1300, width: "100%", textAlign: "center", fontFamily, fontWeight: 700, fontSize: 26, color: "#8C949C" }}>
    {text}
  </div>
);

/* ---------- S2: guesses get crossed out ---------- */
const GuessCard: React.FC<{ emoji: string; name: string; y: number; inAt: number; xAt: number }> = ({ emoji, name, y, inAt, xAt }) => {
  const p = usePop(inAt);
  const x = usePop(xAt, 10);
  return (
    <div
      style={{
        ...glass,
        position: "absolute",
        left: 170,
        top: y,
        width: 740,
        height: 190,
        display: "flex",
        alignItems: "center",
        gap: 40,
        padding: "0 50px",
        opacity: p,
        scale: String(interpolate(p, [0, 1], [0.6, 1])),
        filter: `grayscale(${x}) brightness(${1 - x * 0.45})`,
      }}
    >
      <div style={{ fontSize: 100 }}>{emoji}</div>
      <div style={{ color: C.white, fontWeight: 900, fontSize: 72 }}>{name}</div>
      <div
        style={{
          position: "absolute",
          right: 40,
          top: -10,
          fontSize: 190,
          fontWeight: 900,
          color: "#FF3B3B",
          textShadow: "0 0 30px #FF3B3B99",
          opacity: x > 0.01 ? 1 : 0,
          scale: String(interpolate(x, [0, 1], [2.4, 1])),
          rotate: "-8deg",
          filter: "none",
        }}
      >
        ✕
      </div>
    </div>
  );
};

/* ---------- S3: reveal ---------- */
const ChatIcon: React.FC<{ at: number }> = ({ at }) => {
  const frame = useCurrentFrame();
  const p = usePop(at, 9);
  return (
    <div style={{ position: "absolute", left: 540 - 150, top: 300, width: 300, height: 300, scale: String(p) }}>
      <div
        style={{
          position: "absolute",
          inset: -260,
          background: "conic-gradient(from 0deg, transparent 0deg, #FFE45C30 12deg, transparent 24deg, transparent 45deg, #FFE45C30 57deg, transparent 69deg, transparent 90deg, #FFE45C30 102deg, transparent 114deg, transparent 135deg, #FFE45C30 147deg, transparent 159deg, transparent 180deg, #FFE45C30 192deg, transparent 204deg, transparent 225deg, #FFE45C30 237deg, transparent 249deg, transparent 270deg, #FFE45C30 282deg, transparent 294deg, transparent 315deg, #FFE45C30 327deg, transparent 339deg)",
          rotate: `${frame * 0.6}deg`,
          maskImage: "radial-gradient(circle, black 20%, transparent 65%)",
          WebkitMaskImage: "radial-gradient(circle, black 20%, transparent 65%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: 80,
          borderBottomLeftRadius: 16,
          background: "linear-gradient(145deg, #FFFFFF, #E9F7F4)",
          boxShadow: "0 0 60px #FFE45Caa, 0 0 140px #FFC21A66",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 26,
        }}
      >
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              background: "#0B1414",
              translate: `0px ${Math.sin(frame / 4 - i * 0.9) * 14}px`,
            }}
          />
        ))}
      </div>
    </div>
  );
};

/* ---------- S4: counter + crowd ---------- */
const Counter: React.FC = () => {
  const frame = useCurrentFrame();
  const t = interpolate(frame, [f(0.3), f(1.8)], [0, 1], { ...clamp, easing: ease });
  const n = Math.round(900 * t);
  const done = usePop(1.8, 8);
  const cols = 14,
    rows = 5;
  return (
    <AbsoluteFill style={{ fontFamily }}>
      <div style={{ position: "absolute", top: 250, width: "100%", textAlign: "center", color: C.sub, fontWeight: 800, fontSize: 52, letterSpacing: 4 }}>
        HER HAFTA
      </div>
      <div
        style={{
          position: "absolute",
          top: 320,
          width: "100%",
          textAlign: "center",
          color: C.neonYellow,
          fontWeight: 900,
          fontSize: 290,
          lineHeight: 1,
          letterSpacing: -8,
          textShadow: `0 0 30px ${C.neonGlow}, 0 0 90px ${C.neonGlow}88`,
          scale: String(1 + done * 0.06 - interpolate(frame, [f(1.8), f(2.4)], [0, 0.06], clamp)),
        }}
      >
        {n}
      </div>
      <div style={{ position: "absolute", top: 620, width: "100%", textAlign: "center", color: C.white, fontWeight: 900, fontSize: 96 }}>
        MİLYON<span style={{ color: C.neonYellow }}>+</span>
      </div>
      <div style={{ position: "absolute", left: 540 - (cols * 62) / 2, top: 790, display: "grid", gridTemplateColumns: `repeat(${cols}, 62px)`, rowGap: 10 }}>
        {new Array(cols * rows).fill(0).map((_, i) => {
          const on = t * cols * rows > i;
          return (
            <div key={i} style={{ fontSize: 44, textAlign: "center", opacity: on ? 1 : 0.15, filter: on ? "none" : "grayscale(1)" }}>
              👤
            </div>
          );
        })}
      </div>
      <Footnote text="Kaynak: OpenAI, Şubat 2026" />
    </AbsoluteFill>
  );
};

/* ---------- S5: race to 100M ---------- */
const Bar: React.FC<{ emoji: string; name: string; months: number; label: string; y: number; at: number; hero?: boolean }> = ({
  emoji,
  name,
  months,
  label,
  y,
  at,
  hero,
}) => {
  const frame = useCurrentFrame();
  const show = usePop(at - 0.25);
  const grow = interpolate(frame, [f(at), f(at + 0.7)], [0, 1], { ...clamp, easing: ease });
  const w = Math.max(70, (months / 30) * 640) * grow;
  const col = hero ? C.neonYellow : "#5FD9CF";
  return (
    <div style={{ position: "absolute", left: 110, top: y, width: 860, fontFamily, opacity: show }}>
      <div style={{ color: hero ? C.neonYellow : C.white, fontWeight: 900, fontSize: 50, marginBottom: 16 }}>
        {emoji} {name}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 26 }}>
        <div
          style={{
            width: w,
            height: 70,
            borderRadius: 18,
            background: `linear-gradient(90deg, ${col}88, ${col})`,
            boxShadow: hero ? `0 0 40px ${C.neonGlow}` : "none",
          }}
        />
        <div style={{ color: hero ? C.neonYellow : C.white, fontWeight: 900, fontSize: 54, opacity: grow }}>{label}</div>
      </div>
    </div>
  );
};

const Race: React.FC = () => {
  const stamp = usePop(4.3, 8);
  return (
    <AbsoluteFill style={{ fontFamily }}>
      <div style={{ position: "absolute", top: 240, width: "100%", textAlign: "center", color: C.white, fontWeight: 900, fontSize: 70, lineHeight: 1.05 }}>
        100 MİLYON KULLANICI
        <div style={{ color: C.sub, fontSize: 44, fontWeight: 800, marginTop: 10 }}>kaç sürede?</div>
      </div>
      <Bar emoji="📸" name="Instagram" months={30} label="2,5 yıl" y={460} at={1.5} />
      <Bar emoji="🎵" name="TikTok" months={9} label="9 ay" y={660} at={2.4} />
      <Bar emoji="💬" name="ChatGPT" months={2} label="2 ay" y={860} at={3.4} hero />
      <div
        style={{
          position: "absolute",
          left: 440,
          top: 870,
          color: C.neonYellow,
          fontWeight: 900,
          fontSize: 120,
          rotate: "-8deg",
          opacity: stamp,
          scale: String(interpolate(stamp, [0, 1], [2.2, 1])),
          textShadow: `0 0 26px ${C.neonGlow}, 0 0 70px ${C.neonGlow}88`,
        }}
      >
        REKOR!
      </div>
      <Footnote text="Kaynak: UBS, Şubat 2023" />
    </AbsoluteFill>
  );
};

/* ---------- S6: phone with Turkey chart ---------- */
const Phone: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 15, stiffness: 110 } });
  const rows = [
    { n: 1, e: "💬", name: "ChatGPT", at: 1.0 },
    { n: 2, e: "🛍️", name: "Temu", at: 0.6 },
    { n: 3, e: "✨", name: "Google Gemini", at: 0.4 },
  ];
  const hero = usePop(1.0, 9);
  return (
    <AbsoluteFill style={{ perspective: 1600 }}>
      <div
        style={{
          position: "absolute",
          left: 540 - 260,
          top: 240,
          width: 520,
          height: 880,
          borderRadius: 70,
          background: "#0C0F10",
          border: "10px solid #2A2F33",
          boxShadow: "0 50px 120px rgba(0,0,0,0.7), inset 0 0 0 2px #444",
          rotate: `y ${interpolate(enter, [0, 1], [-40, -10]) + Math.sin(frame / 25) * 4}deg`,
          translate: `0px ${interpolate(enter, [0, 1], [200, 0])}px`,
          overflow: "hidden",
          fontFamily,
        }}
      >
        <div style={{ position: "absolute", left: 190, top: 18, width: 120, height: 34, borderRadius: 17, background: "#000" }} />
        <div style={{ padding: "90px 36px 0" }}>
          <div style={{ color: C.sub, fontWeight: 800, fontSize: 24, letterSpacing: 2 }}>TÜRKİYE · 2025</div>
          <div style={{ color: C.white, fontWeight: 900, fontSize: 40, lineHeight: 1.1, marginTop: 8 }}>En popüler ücretsiz iPhone uygulamaları</div>
          {rows.map((r) => {
            const p = usePopAt(frame, fps, r.at);
            const isHero = r.n === 1;
            return (
              <div
                key={r.n}
                style={{
                  marginTop: 28,
                  display: "flex",
                  alignItems: "center",
                  gap: 22,
                  padding: "22px 20px",
                  borderRadius: 26,
                  background: isHero ? `rgba(255,228,92,${0.18 * hero})` : "rgba(255,255,255,0.06)",
                  border: isHero ? `2px solid rgba(255,228,92,${hero})` : "2px solid transparent",
                  boxShadow: isHero ? `0 0 ${40 * hero}px ${C.neonGlow}88` : "none",
                  opacity: p,
                  translate: `${interpolate(p, [0, 1], [120, 0])}px 0px`,
                }}
              >
                <div style={{ color: isHero ? C.neonYellow : C.sub, fontWeight: 900, fontSize: 44, width: 40 }}>{r.n}</div>
                <div style={{ width: 84, height: 84, borderRadius: 20, background: "#1D2326", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 52 }}>
                  {r.e}
                </div>
                <div style={{ color: C.white, fontWeight: 800, fontSize: 34 }}>{r.name}</div>
              </div>
            );
          })}
        </div>
      </div>
      <Footnote text="Kaynak: Apple, Türkiye 2025 listesi" />
    </AbsoluteFill>
  );
};
const usePopAt = (frame: number, fps: number, at: number) =>
  spring({ frame: frame - f(at), fps, config: { damping: 14, stiffness: 220, mass: 0.7 } });

/* ---------- S7: next-word prediction ---------- */
const Predict: React.FC = () => {
  const frame = useCurrentFrame();
  const bubble = usePop(0.2);
  const typed = "Gökyüzü bugün çok";
  const chars = Math.floor(interpolate(frame, [f(0.8), f(1.5)], [0, typed.length], clamp));
  const cands = [
    { w: "mavi", p: 72 },
    { w: "güzel", p: 18 },
    { w: "karanlık", p: 6 },
  ];
  const win = usePop(3.2, 9);
  const cursorOn = Math.floor(frame / 8) % 2 === 0;
  return (
    <AbsoluteFill style={{ fontFamily }}>
      <div
        style={{
          position: "absolute",
          right: 110,
          top: 250,
          maxWidth: 640,
          padding: "26px 36px",
          borderRadius: 40,
          borderBottomRightRadius: 10,
          background: "#2F6F68",
          color: C.white,
          fontWeight: 800,
          fontSize: 46,
          opacity: bubble,
          scale: String(interpolate(bubble, [0, 1], [0.7, 1])),
          transformOrigin: "100% 100%",
        }}
      >
        Cümleyi tamamla 👇
      </div>
      <div style={{ ...glass, position: "absolute", left: 90, top: 430, width: 900, padding: "36px 40px", fontSize: 62, fontWeight: 900, color: C.white }}>
        {typed.slice(0, chars)}{" "}
        <span
          style={{
            color: C.neonYellow,
            textShadow: `0 0 20px ${C.neonGlow}`,
            opacity: win,
            display: "inline-block",
            translate: `0px ${interpolate(win, [0, 1], [60, 0])}px`,
          }}
        >
          {win > 0.01 ? "mavi" : ""}
        </span>
        <span style={{ opacity: cursorOn && win < 0.5 ? 1 : 0, color: C.neonYellow }}>|</span>
      </div>
      {cands.map((c, i) => {
        const at = 1.6 + i * 0.15;
        const p = usePopAt(frame, 30, at);
        const fill = interpolate(frame, [f(at + 0.2), f(at + 1.0)], [0, c.p / 100], { ...clamp, easing: ease });
        const hero = i === 0;
        return (
          <div
            key={c.w}
            style={{
              ...glass,
              position: "absolute",
              left: 150,
              top: 660 + i * 150,
              width: 780,
              height: 120,
              borderRadius: 26,
              overflow: "hidden",
              opacity: p * (hero ? 1 : 1 - win * 0.6),
              translate: `${interpolate(p, [0, 1], [-140, 0])}px 0px`,
              border: hero ? `2px solid rgba(255,228,92,${win})` : glass.border,
              boxShadow: hero ? `0 0 ${50 * win}px ${C.neonGlow}aa` : glass.boxShadow,
            }}
          >
            <div style={{ position: "absolute", inset: 0, width: `${fill * 100}%`, background: hero ? "#FFE45C40" : "#5FD9CF30" }} />
            <div style={{ position: "absolute", left: 36, top: 26, color: C.white, fontWeight: 900, fontSize: 54 }}>{c.w}</div>
            <div style={{ position: "absolute", right: 36, top: 30, color: hero ? C.neonYellow : C.sub, fontWeight: 900, fontSize: 48 }}>
              %{Math.round(fill * 100)}
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

/* ---------- S8: CTA with use-case chips ---------- */
const Chips: React.FC = () => {
  const frame = useCurrentFrame();
  const chips = [
    { t: "📚 Ödev", x: 120, y: 700, at: 0.7 },
    { t: "💻 Kod", x: 610, y: 760, at: 0.85 },
    { t: "✍️ Yazı", x: 180, y: 900, at: 1.0 },
    { t: "🍳 Tarif", x: 590, y: 960, at: 1.15 },
  ];
  return (
    <AbsoluteFill style={{ fontFamily }}>
      {chips.map((c, i) => {
        const p = usePopAt(frame, 30, c.at);
        return (
          <div
            key={c.t}
            style={{
              ...glass,
              position: "absolute",
              left: c.x,
              top: c.y + Math.sin(frame / 14 + i) * 10,
              padding: "22px 36px",
              borderRadius: 60,
              color: C.white,
              fontWeight: 900,
              fontSize: 50,
              opacity: p,
              scale: String(p),
              rotate: `${(i % 2 ? 1 : -1) * 4}deg`,
            }}
          >
            {c.t}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

/* ---------- timeline ---------- */
const SC = {
  hook: [0, 3.2],
  guess: [3.2, 6.5],
  reveal: [6.5, 9.5],
  count: [9.5, 13.5],
  race: [13.5, 19.0],
  phone: [19.0, 22.6],
  predict: [22.6, 27.0],
  cta: [27.0, 31.0],
} as const;

const At: React.FC<{ s: readonly [number, number]; name: string; children: React.ReactNode }> = ({ s, name, children }) => (
  <Sequence name={name} from={f(s[0])} durationInFrames={f(s[1] - s[0])}>
    <Scene dur={f(s[1] - s[0])}>{children}</Scene>
  </Sequence>
);

const sfx: [number, string, number, number?][] = [
  // [saniye, ses, seviye, maks süre]
  [0.0, "whoosh_impact", 0.55, 2.2],
  [0.25, "magic_fairy-sparkle", 0.3],
  [3.0, "whoosh_small-sweep", 0.45],
  [3.3, "pop_bubble-alert", 0.55],
  [3.95, "pop_bubble-alert", 0.55],
  [4.6, "pop_bubble-alert", 0.55],
  [5.3, "fail_wrong-answer", 0.45],
  [5.1, "riser_trailer", 0.3],
  [7.0, "impact_big-cinematic", 0.5, 1.8],
  [7.05, "magic_sparkle-poof", 0.35],
  [9.3, "whoosh_quick-accent", 0.45],
  [11.3, "ding_positive", 0.4, 1.5],
  [13.3, "whoosh_small-sweep", 0.45],
  [15.0, "whoosh_short-sweep", 0.35],
  [15.9, "whoosh_short-sweep", 0.35],
  [16.9, "whoosh_short-sweep", 0.4],
  [17.8, "ding_correct-answer", 0.45],
  [18.8, "whoosh_cinematic-fast", 0.45],
  [19.4, "pop_dry", 0.45],
  [19.6, "pop_dry", 0.45],
  [20.0, "ding_correct-reward", 0.4],
  [22.4, "whoosh_small-sweep", 0.45],
  [22.8, "pop_message", 0.5],
  [23.4, "typing_phone", 0.35, 0.8],
  [24.2, "pop_cluster", 0.4],
  [25.8, "ding_reveal", 0.4, 1.6],
  [26.8, "whoosh_impact", 0.5, 2.2],
  [27.7, "pop_cluster", 0.45],
  [28.6, "ding_announce", 0.3, 2.0],
];

export const PopulerUrun: React.FC = () => (
  <AbsoluteFill style={{ background: "#040707" }}>
    <TechBackdrop />

    <At s={SC.hook} name="Kanca">
      <NeonTitle lines={["EN POPÜLER", "ÜRÜN?"]} durationInFrames={f(3.2)} y={470} size={128} />
    </At>
    <At s={SC.guess} name="Tahminler">
      <GuessCard emoji="📱" name="iPhone" y={330} inAt={0.1} xAt={2.1} />
      <GuessCard emoji="📸" name="Instagram" y={570} inAt={0.75} xAt={2.3} />
      <GuessCard emoji="🎵" name="TikTok" y={810} inAt={1.4} xAt={2.5} />
    </At>
    <At s={SC.reveal} name="Cevap">
      <ChatIcon at={0.45} />
      <Sequence from={f(0.5)}>
        <NeonTitle lines={["CHATGPT"]} durationInFrames={f(2.5)} y={700} size={150} />
      </Sequence>
    </At>
    <At s={SC.count} name="Sayaç">
      <Counter />
    </At>
    <At s={SC.race} name="Yarış">
      <Race />
    </At>
    <At s={SC.phone} name="Türkiye">
      <Phone />
    </At>
    <At s={SC.predict} name="Nasıl çalışır">
      <Predict />
    </At>
    <At s={SC.cta} name="CTA">
      <NeonTitle lines={["SIRA", "SENDE"]} durationInFrames={f(4.2)} y={300} size={150} />
      <Chips />
      <Sequence from={f(1.6)}>
        <CTA line1="En çok ne için" line2="kullanıyorsun? 👇" />
      </Sequence>
    </At>

    {[3.2, 6.5, 9.5, 13.5, 19.0, 22.6, 27.0].map((t) => (
      <Sequence key={t} name="flaş" from={f(t) - 1} durationInFrames={10}>
        <Flash />
      </Sequence>
    ))}

    {sfx.map(([t, name, vol, max], i) => (
      <Sequence key={i} name={`sfx: ${name}`} from={f(t)} durationInFrames={max ? f(max) : undefined}>
        <Sfx name={name} volume={vol} />
      </Sequence>
    ))}

    <Grade />
    <WordCaptions words={words} />
  </AbsoluteFill>
);
