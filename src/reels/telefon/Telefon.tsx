import React from "react";
import { Audio } from "@remotion/media";
import { AbsoluteFill, interpolate, random, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Sfx } from "../sfx";
import { Bit, Bubble, Card, Cep, Clock, K, PaperGrain, Room, slab, sans, Stamp, Sunburst, TagCaptions, TapeLabel, usePopAt, VWord, clamp } from "../cizgi/kit";
import voice from "./voice.json";

// "Telefonun seni dinliyor mu?" — çizgi karakter anlatımı, ElevenLabs seslendirme.
// Kaynak: Northeastern Üniv. 2018 (17.260 Android uygulaması; gizli mikrofon kaydı bulunamadı,
// bazı uygulamaların ekran kaydını 3. taraflara gönderdiği görüldü).

const FPS = 30;
const words = voice.words as VWord[];
const N_SCENES = Math.max(...words.map((w) => w.scene)) + 1;
export const TELEFON_FRAMES = Math.ceil((voice.duration + 1.6) * FPS);

const sceneStart = (i: number) => (i === 0 ? 0 : Math.max(0, words.find((w) => w.scene === i)!.start - 0.12));
const sceneEnd = (i: number) => (i === N_SCENES - 1 ? TELEFON_FRAMES / FPS : sceneStart(i + 1));
/** scene-local time (s) when a word starting with `m` is spoken in scene `s` */
const wAt = (s: number, m: string) => {
  const w = words.find((x) => x.scene === s && x.text.toLocaleLowerCase("tr").startsWith(m.toLocaleLowerCase("tr")));
  if (!w) throw new Error(`kelime yok: ${s}/${m}`);
  return w.start - sceneStart(s);
};

/* ---------- scene wrapper ---------- */
const SceneWrap: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const p = usePopAt(0, 14, 220);
  return <AbsoluteFill style={{ scale: String(interpolate(p, [0, 1], [1.08, 1])), opacity: Math.min(1, p * 3) }}>{children}</AbsoluteFill>;
};

/* ---------- props ---------- */
const Magnifier: React.FC = () => (
  <g stroke={K.ink} strokeWidth={5}>
    <line x1={0} y1={0} x2={22} y2={-40} strokeWidth={10} strokeLinecap="round" />
    <circle cx={36} cy={-70} r={34} fill="#CFEFFF" />
    <path d="M22 -84 Q30 -94 44 -92" stroke="#FFFFFF" fill="none" strokeLinecap="round" />
  </g>
);

const Mic: React.FC<{ x: number; y: number; at: number }> = ({ x, y, at }) => {
  const p = usePopAt(at, 10, 200);
  const frame = useCurrentFrame();
  return (
    <svg style={{ position: "absolute", left: x, top: y, scale: String(p), filter: "drop-shadow(0 10px 0 rgba(0,0,0,0.16))" }} width={300} height={380} viewBox="0 0 300 380" overflow="visible">
      <g stroke={K.ink} strokeWidth={8} strokeLinecap="round" fill="none" style={{ paintOrder: "stroke" }}>
        <rect x={95} y={20} width={110} height={190} rx={55} fill="#D9D3C7" />
        {[70, 100, 130, 160].map((yy) => (
          <line key={yy} x1={120} y1={yy} x2={180} y2={yy} strokeWidth={6} />
        ))}
        <path d="M60 150 Q60 270 150 270 Q240 270 240 150" />
        <line x1={150} y1={270} x2={150} y2={330} />
        <line x1={95} y1={340} x2={205} y2={340} />
      </g>
      {[0, 1, 2].map((i) => {
        const k = ((frame / 30 + i * 0.33) % 1);
        return <circle key={i} cx={150} cy={115} r={110 + k * 90} fill="none" stroke={K.ink} strokeWidth={5} opacity={(1 - k) * 0.35} />;
      })}
    </svg>
  );
};

const AppGrid: React.FC<{ from: number; to: number }> = ({ from, to }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const cols = 6,
    rows = 5,
    cell = 118;
  const colors = [K.orange, K.mint, K.mustard, "#7DA7E0", "#E58A6E", "#B08BD9", K.green];
  return (
    <div style={{ position: "absolute", left: 540 - (cols * cell) / 2, top: 390 }}>
      {new Array(cols * rows).fill(0).map((_, i) => {
        const at = from + (to - from) * (i / (cols * rows));
        const t = frame / fps - at;
        const s = interpolate(t, [0, 0.15, 0.25], [0, 1.15, 1], clamp);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: (i % cols) * cell,
              top: Math.floor(i / cols) * cell,
              width: 92,
              height: 92,
              borderRadius: 24,
              background: colors[Math.floor(random(`c${i}`) * colors.length)],
              border: `5px solid ${K.ink}`,
              boxShadow: "0 6px 0 rgba(0,0,0,0.2)",
              scale: String(s),
              rotate: `${(random(`a${i}`) - 0.5) * 10}deg`,
            }}
          >
            <div style={{ margin: "24px auto", width: 34, height: 34, borderRadius: 10, background: "rgba(255,255,255,0.65)" }} />
          </div>
        );
      })}
    </div>
  );
};

const FlyingShots: React.FC<{ from: number; to: number; sx: number; sy: number; tx: number; ty: number }> = ({ from, to, sx, sy, tx, ty }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const n = 5;
  return (
    <>
      {new Array(n).fill(0).map((_, i) => {
        const at = from + ((to - from) * i) / n;
        const k = interpolate(frame / fps, [at, at + 0.7], [0, 1], clamp);
        if (k <= 0 || k >= 1) return null;
        const x = sx + (tx - sx) * k;
        const y = sy + (ty - sy) * k - Math.sin(k * Math.PI) * 180;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: 110,
              height: 170,
              background: "#FFFDF7",
              border: `5px solid ${K.ink}`,
              borderRadius: 14,
              rotate: `${k * 40 - 20}deg`,
              scale: String(1 - k * 0.4),
              boxShadow: "0 6px 0 rgba(0,0,0,0.2)",
            }}
          >
            {[22, 44, 66, 88].map((yy) => (
              <div key={yy} style={{ position: "absolute", left: 14, top: yy, width: yy === 22 ? 50 : 70, height: 9, borderRadius: 5, background: "#C9C0AE" }} />
            ))}
          </div>
        );
      })}
    </>
  );
};

const Toggle: React.FC<{ offAt?: number }> = ({ offAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const k = offAt === undefined ? 0 : interpolate(frame / fps, [offAt, offAt + 0.18], [0, 1], clamp);
  return (
    <div style={{ width: 96, height: 56, borderRadius: 28, background: k > 0.5 ? "#B9B2A6" : K.green, border: `4px solid ${K.ink}`, position: "relative" }}>
      <div style={{ position: "absolute", top: 4, left: 4 + (1 - k) * 40, width: 40, height: 40, borderRadius: 20, background: "#FFF", border: `3px solid ${K.ink}` }} />
    </div>
  );
};

const Crumb: React.FC<{ at: number; text: string; last?: boolean }> = ({ at, text, last }) => {
  const p = usePopAt(at, 10, 260);
  return (
    <span style={{ display: "inline-block", opacity: Math.min(1, p * 2), scale: String(interpolate(p, [0, 1], [0.6, 1])), color: last ? K.orange : K.ink }}>
      {text}
      {!last && <span style={{ color: "#A99F8C" }}> › </span>}
    </span>
  );
};

/* ---------- scenes ---------- */
const S0: React.FC = () => (
  <Room wall={K.wall.mustard} pattern="stripes">
    <TapeLabel text="TELEFON SENİ DİNLİYOR MU?" />
    <Clock x={80} y={380} />
    <Bubble x={150} y={560} at={wAt(0, "kahve")}>Kahve ☕</Bubble>
    <Card x={500} y={470} w={400} at={wAt(0, "reklam") - 0.05} rot={5} from="right">
      <div style={{ padding: "20px 26px" }}>
        <div style={{ fontSize: 26, fontWeight: 800, color: "#9A8F7B" }}>Reklam · Sponsorlu</div>
        <div style={{ fontSize: 96, textAlign: "center", margin: "6px 0" }}>☕</div>
        <div style={{ fontFamily: slab, fontSize: 46, fontWeight: 800, lineHeight: 1.05 }}>Kahve %50 indirim!</div>
      </div>
    </Card>
    <BitAt0 />
    <Cep id="cep0" x={820} y={1185} size={290} face="side" enterAt={0.3} />
  </Room>
);
const BitAt0: React.FC = () => {
  const frame = useCurrentFrame();
  const shock = frame / FPS >= wAt(0, "reklam");
  return <Bit id="bit0" x={300} y={1185} size={480} face={shock ? "shock" : "normal"} armL={shock ? 150 : 15} armR={shock ? 150 : 15} enterAt={0.1} />;
};

const S1: React.FC = () => (
  <Room wall={K.wall.navy} pattern="stars">
    <TapeLabel text="17.000 UYGULAMA" />
    <AppGrid from={0.2} to={wAt(1, "tek") + 0.4} />
    <Stamp x={330} y={600} at={wAt(1, "17")} color={K.mustard} rot={-8} size={110}>
      17.000
    </Stamp>
    <Bit id="bit1" x={250} y={1185} size={380} face="side" armR={70} hold={<Magnifier />} />
    <Cep id="cep1" x={850} y={1185} size={240} face="normal" enterAt={0.5} />
  </Room>
);

const S2: React.FC = () => {
  const stamp = wAt(2, "bulamad");
  const frame = useCurrentFrame();
  const happy = frame / FPS >= stamp;
  return (
    <Room wall={K.wall.beige} pattern="stripes">
      <TapeLabel text="SONUÇ?" />
      <Mic x={390} y={430} at={0.1} />
      <Stamp x={300} y={640} at={stamp} color={K.green} rot={-9} size={84}>
        KAYIT YOK ✓
      </Stamp>
      <Bit id="bit2" x={230} y={1185} size={400} face={happy ? "happy" : "normal"} armL={happy ? 140 : 10} armR={happy ? 140 : 10} />
      <Cep id="cep2" x={860} y={1185} size={260} face={happy ? "happy" : "side"} enterAt={0.2} />
    </Room>
  );
};

const S3: React.FC = () => {
  const kayit = wAt(3, "kaydedip");
  return (
    <Room wall={K.wall.purple} pattern="stars">
      <TapeLabel text="ASIL ŞOK" />
      <Card x={140} y={430} at={kayit - 0.1} rot={-4}>
        <div style={{ padding: "12px 24px", fontWeight: 900, fontSize: 46, color: K.red }}>● REC</div>
      </Card>
      <Card x={640} y={430} w={300} at={0.2} rot={3} bg="#E9E2D3">
        <div style={{ padding: "18px 20px", textAlign: "center" }}>
          <div style={{ fontSize: 100 }}>🏢</div>
          <div style={{ fontFamily: slab, fontWeight: 800, fontSize: 40 }}>Başka şirketler</div>
        </div>
      </Card>
      <FlyingShots from={kayit + 0.1} to={kayit + 2.4} sx={260} sy={760} tx={720} ty={520} />
      <Cep id="cep3" x={300} y={1185} size={420} face="shock" screen="#F6C9C0" />
      <Bit id="bit3" x={830} y={1185} size={340} face="angry" armL={40} armR={40} enterAt={0.25} />
    </Room>
  );
};

const Clue: React.FC<{ x: number; y: number; at: number; emoji: string; text: string; rot: number }> = ({ x, y, at, emoji, text, rot }) => (
  <Card x={x} y={y} at={at} rot={rot}>
    <div style={{ padding: "14px 24px", display: "flex", alignItems: "center", gap: 14, fontFamily: slab, fontWeight: 800, fontSize: 46 }}>
      <span style={{ fontSize: 56 }}>{emoji}</span>
      {text}
    </div>
  </Card>
);

const S4: React.FC = () => (
  <Room wall={K.wall.sky} pattern="dots">
    <TapeLabel text="ASIL SEBEP" />
    <Clue x={110} y={420} at={wAt(4, "konum")} emoji="📍" text="Konum" rot={-5} />
    <Clue x={560} y={470} at={wAt(4, "arama")} emoji="🔍" text="Aramalar" rot={4} />
    <Clue x={200} y={610} at={wAt(4, "arkada")} emoji="👥" text="Arkadaşlar" rot={-2} />
    <Card x={300} y={800} w={480} at={0.15} rot={0} bg={K.mustard}>
      <div style={{ padding: "18px 26px", textAlign: "center", fontFamily: sans, fontWeight: 900, fontSize: 44 }}>🎯 SANA ÖZEL REKLAM</div>
    </Card>
    <Cep id="cep4" x={880} y={1185} size={260} face="wink" />
    <Bit id="bit4" x={170} y={1185} size={300} face="side" enterAt={0.3} />
  </Room>
);

const S5: React.FC = () => {
  const off = wAt(5, "kapat");
  const rows = [
    { e: "💬", t: "Mesajlar" },
    { e: "🎵", t: "Müzik" },
    { e: "❓", t: "TuhafApp", bad: true },
  ];
  const frame = useCurrentFrame();
  const flash = interpolate(frame / FPS, [wAt(5, "tanımad"), wAt(5, "tanımad") + 0.3], [0, 1], clamp);
  return (
    <Room wall={K.wall.mint} pattern="stripes">
      <TapeLabel text="HEMEN KONTROL ET" />
      <Card x={300} y={400} w={620} at={0.1} from="up" bg="#FFFDF7">
        <div style={{ padding: "26px 30px" }}>
          <div style={{ fontFamily: slab, fontWeight: 800, fontSize: 38, minHeight: 50 }}>
            <Crumb at={wAt(5, "ayarlar")} text="Ayarlar" />
            <Crumb at={wAt(5, "gizlilik")} text="Gizlilik" />
            <Crumb at={wAt(5, "mikrofon")} text="Mikrofon" last />
          </div>
          {rows.map((r) => (
            <div
              key={r.t}
              style={{
                marginTop: 22,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "16px 18px",
                borderRadius: 18,
                background: r.bad ? `rgba(217,72,59,${0.18 * flash})` : "rgba(0,0,0,0.04)",
                border: r.bad ? `4px solid rgba(217,72,59,${flash})` : "4px solid transparent",
              }}
            >
              <span style={{ fontWeight: 800, fontSize: 40 }}>
                {r.e} {r.t}
              </span>
              <Toggle offAt={r.bad ? off : undefined} />
            </div>
          ))}
        </div>
      </Card>
      <Bit id="bit5" x={170} y={1185} size={360} face={frame / FPS >= off ? "wink" : "normal"} armR={110} />
    </Room>
  );
};

const S6: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Sunburst cy={760} />
      <TapeLabel text="BİRİNE GÖNDER 📤" />
      {[0, 1, 2].map((i) => {
        const k = ((frame / FPS) * 0.6 + i / 3) % 1;
        return (
          <div key={i} style={{ position: "absolute", left: -120 + k * 1300, top: 520 + i * 90 - Math.sin(k * Math.PI) * 120, fontSize: 90, rotate: "10deg" }}>
            ✈️
          </div>
        );
      })}
      <div style={{ position: "absolute", left: 0, right: 0, top: 1185, bottom: 0, background: "#6B8F4E" }} />
      <Bit id="bit6" x={380} y={1190} size={440} face="happy" armL={150} armR={150} />
      <Cep id="cep6" x={720} y={1190} size={300} face="happy" armL={120} armR={120} enterAt={0.15} />
    </AbsoluteFill>
  );
};

const SCENES = [S0, S1, S2, S3, S4, S5, S6];

/* ---------- sound design (scene-local seconds) ---------- */
type Hit = [number, number, string, number, number?]; // [scene, t, sfx, vol, maxSec]
const hits = (): Hit[] => [
  [0, 0.1, "pop_bubble-alert", 0.4],
  [0, wAt(0, "kahve"), "pop_message", 0.45],
  [0, wAt(0, "reklam") - 0.15, "whoosh_quick-accent", 0.4],
  [0, wAt(0, "reklam"), "pop_hard", 0.45],
  [1, 0.25, "pop_cluster", 0.35],
  [1, wAt(1, "17"), "impact_drum-deep", 0.4, 1.2],
  [2, 0.1, "pop_dry", 0.4],
  [2, wAt(2, "bulamad"), "ding_correct-answer", 0.4],
  [3, wAt(3, "kaydedip") - 0.1, "camera_digital-shutter", 0.45],
  [3, wAt(3, "kaydedip") + 0.6, "camera_digital-shutter", 0.35],
  [3, wAt(3, "kaydedip") + 1.1, "whoosh_small-sweep", 0.3],
  [4, wAt(4, "konum"), "pop_bubble-alert", 0.4],
  [4, wAt(4, "arama"), "pop_bubble-alert", 0.4],
  [4, wAt(4, "arkada"), "pop_bubble-alert", 0.4],
  [5, wAt(5, "ayarlar"), "ui_cool-click", 0.4],
  [5, wAt(5, "gizlilik"), "ui_cool-click", 0.4],
  [5, wAt(5, "mikrofon"), "ui_cool-click", 0.4],
  [5, wAt(5, "kapat"), "ui_switch", 0.55],
  [6, 0.05, "magic_sparkle-poof", 0.35],
  [6, 0.6, "ding_correct-reward", 0.3],
];

export const Telefon: React.FC = () => {
  const list = hits();
  return (
    <AbsoluteFill style={{ background: K.paper }}>
      {SCENES.slice(0, N_SCENES).map((Sc, i) => {
        const a = Math.round(sceneStart(i) * FPS);
        const b = Math.round(sceneEnd(i) * FPS);
        return (
          <Sequence key={i} name={`Sahne ${i + 1}`} from={a} durationInFrames={b - a}>
            <SceneWrap>
              <Sc />
            </SceneWrap>
          </Sequence>
        );
      })}
      {new Array(N_SCENES - 1).fill(0).map((_, i) => (
        <Sequence key={`w${i}`} name="sfx: geçiş" from={Math.round((sceneStart(i + 1) - 0.18) * FPS)}>
          <Sfx name="whoosh_short-sweep" volume={0.3} />
        </Sequence>
      ))}
      {list.map(([s, t, name, vol, max], i) => (
        <Sequence key={i} name={`sfx: ${name}`} from={Math.max(0, Math.round((sceneStart(s) + t) * FPS))} durationInFrames={max ? Math.round(max * FPS) : undefined}>
          <Sfx name={name} volume={vol} />
        </Sequence>
      ))}
      {!voice.fake && <Audio src={staticFile("telefon/voice.mp3")} volume={0.85} />}
      <PaperGrain />
      <TagCaptions words={words} />
    </AbsoluteFill>
  );
};
