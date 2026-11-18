import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  random,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { C, fontFamily } from "./theme";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/* ---------- Word-by-word caption (one word on screen at a time, small pop) ---------- */
export type Word = { text: string; startMs: number; endMs: number };

export const WordCaptions: React.FC<{ words: Word[]; y?: number; size?: number }> = ({
  words,
  y = 1180,
  size = 78,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const ms = (frame / fps) * 1000;
  const w = words.find((x) => ms >= x.startMs && ms < x.endMs);
  if (!w) return null;
  const local = ((ms - w.startMs) / 1000) * fps;
  const pop = spring({ frame: local, fps, config: { damping: 14, stiffness: 260, mass: 0.6 } });
  return (
    <div
      style={{
        position: "absolute",
        top: y,
        width: "100%",
        textAlign: "center",
        fontFamily,
        fontWeight: 800,
        fontSize: size,
        color: C.white,
        letterSpacing: -0.5,
        textShadow: "0 4px 14px rgba(0,0,0,0.55), 0 0 2px rgba(0,0,0,0.8)",
        scale: String(interpolate(pop, [0, 1], [0.82, 1])),
        opacity: interpolate(local, [0, 2], [0, 1], clamp),
      }}
    >
      {w.text}
    </div>
  );
};

/* ---------- Neon keyword title ("MOBIUS ŞERİDİ") ---------- */
export const NeonTitle: React.FC<{
  lines: string[];
  durationInFrames: number;
  y?: number;
  color?: string;
  glow?: string;
  size?: number;
}> = ({ lines, durationInFrames, y = 560, color = C.neonYellow, glow = C.neonGlow, size = 132 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const inP = spring({ frame, fps, config: { damping: 11, stiffness: 180 } });
  const out = interpolate(frame, [durationInFrames - 6, durationInFrames], [0, 1], clamp);
  // neon flicker during the first ~10 frames
  const flicker = frame < 10 ? (random(`f${frame}`) > 0.35 ? 1 : 0.35) : 1;
  const breathe = 0.85 + 0.15 * Math.sin(frame / 5);
  return (
    <div
      style={{
        position: "absolute",
        top: y,
        width: "100%",
        textAlign: "center",
        fontFamily,
        fontWeight: 900,
        fontSize: size,
        lineHeight: 0.98,
        letterSpacing: -2,
        color,
        opacity: flicker * (1 - out),
        scale: String(interpolate(inP, [0, 1], [1.6, 1]) * interpolate(out, [0, 1], [1, 1.25])),
        filter: `blur(${interpolate(inP, [0, 1], [14, 0]) + out * 18}px)`,
        textShadow: `0 0 ${18 * breathe}px ${glow}, 0 0 ${48 * breathe}px ${glow}, 0 0 ${110 * breathe}px ${glow}aa, 0 6px 20px rgba(0,0,0,0.6)`,
      }}
    >
      {lines.map((l) => (
        <div key={l}>{l}</div>
      ))}
    </div>
  );
};

/* ---------- Floating glass card (podcast / notes UI) ---------- */
export const FloatingCard: React.FC<{
  title: string;
  subtitle: string;
  durationInFrames: number;
  x?: number;
  y?: number;
}> = ({ title, subtitle, durationInFrames, x = 150, y = 300 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 16, stiffness: 120 } });
  const exit = interpolate(frame, [durationInFrames - 8, durationInFrames], [0, 1], clamp);
  const progress = interpolate(frame, [0, durationInFrames], [0.18, 0.62], clamp);
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: 780,
        perspective: 1400,
        opacity: enter * (1 - exit),
        translate: `0px ${interpolate(enter, [0, 1], [80, 0]) + Math.sin(frame / 18) * 10 - exit * 60}px`,
      }}
    >
      <div
        style={{
          rotate: `x ${interpolate(enter, [0, 1], [35, 10])}deg`,
          background: C.cardBg,
          border: `1.5px solid ${C.cardEdge}`,
          borderRadius: 36,
          padding: "36px 40px",
          backdropFilter: "blur(18px)",
          boxShadow: "0 40px 90px rgba(0,0,0,0.6)",
          fontFamily,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
          <div
            style={{
              width: 120,
              height: 120,
              borderRadius: 22,
              background: "radial-gradient(circle at 50% 45%, #FFD27A 0%, #8A5A1C 35%, #15161A 70%)",
              boxShadow: "0 0 40px #FFB15C55",
            }}
          />
          <div style={{ flex: 1 }}>
            <div style={{ color: C.white, fontWeight: 800, fontSize: 40, lineHeight: 1.1 }}>{title}</div>
            <div style={{ color: C.sub, fontWeight: 700, fontSize: 28, marginTop: 8 }}>{subtitle}</div>
          </div>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 32,
              border: `3px solid ${C.white}`,
              color: C.white,
              fontSize: 44,
              lineHeight: "56px",
              textAlign: "center",
              fontWeight: 700,
            }}
          >
            +
          </div>
        </div>
        <div style={{ marginTop: 34, height: 8, borderRadius: 4, background: "rgba(255,255,255,0.18)" }}>
          <div style={{ width: `${progress * 100}%`, height: 8, borderRadius: 4, background: C.white }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", color: C.sub, fontSize: 24, marginTop: 12, fontWeight: 700 }}>
          <span>{`${Math.floor((progress * 224) / 60)}:${String(Math.floor(progress * 224) % 60).padStart(2, "0")}`}</span>
          <span>3:44</span>
        </div>
      </div>
    </div>
  );
};

/* ---------- Loading spinner ("brain buffering" joke) ---------- */
export const Spinner: React.FC<{ x?: number; y?: number; size?: number; durationInFrames: number }> = ({
  x = 540,
  y = 380,
  size = 200,
  durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 12 } });
  const exit = interpolate(frame, [durationInFrames - 6, durationInFrames], [1, 0], clamp);
  const step = Math.floor(frame / 2) % 12;
  return (
    <div style={{ position: "absolute", left: x - size / 2, top: y - size / 2, width: size, height: size, scale: String(enter), opacity: exit }}>
      {new Array(12).fill(0).map((_, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: size / 2 - 9,
            top: 0,
            width: 18,
            height: size * 0.28,
            borderRadius: 9,
            background: C.white,
            transformOrigin: `9px ${size / 2}px`,
            rotate: `${i * 30}deg`,
            opacity: 0.18 + 0.82 * (((i - step + 12) % 12) / 11),
            boxShadow: "0 0 18px rgba(255,255,255,0.5)",
          }}
        />
      ))}
    </div>
  );
};

/* ---------- Cinematic stand-in background: warm practicals, teal shadows, slow push ---------- */
export const CinematicBackdrop: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const push = interpolate(frame, [0, durationInFrames], [1, 1.08]);
  return (
    <AbsoluteFill style={{ background: C.ink, overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          scale: String(push),
          background: [
            "radial-gradient(ellipse 22% 9% at 24% 30%, #FFC77Acc 0%, transparent 100%)",
            "radial-gradient(ellipse 18% 8% at 78% 26%, #FFB25Cbb 0%, transparent 100%)",
            "radial-gradient(ellipse 60% 30% at 50% 78%, #6B3A1A99 0%, transparent 100%)",
            "radial-gradient(ellipse 80% 60% at 50% 45%, #1C2B2B 0%, #0A1112 70%, #050707 100%)",
          ].join(","),
        }}
      />
      {/* stand-in subject silhouette */}
      <AbsoluteFill
        style={{
          scale: String(push),
          background: "radial-gradient(ellipse 17% 11% at 50% 47%, #E9B98F 0%, #B07A55 55%, transparent 72%), radial-gradient(ellipse 30% 30% at 50% 82%, #8F8578 0%, #4A443D 55%, transparent 75%)",
          opacity: 0.9,
        }}
      />
    </AbsoluteFill>
  );
};

export const Grade: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <>
      {/* vignette */}
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 75% 60% at 50% 48%, transparent 45%, rgba(0,0,0,0.75) 100%)" }} />
      {/* animated film grain */}
      <AbsoluteFill style={{ opacity: 0.09, mixBlendMode: "overlay" }}>
        <svg width="100%" height="100%">
          <filter id="g">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={frame % 24} />
          </filter>
          <rect width="100%" height="100%" filter="url(#g)" />
        </svg>
      </AbsoluteFill>
    </>
  );
};

/* ---------- Whip flash between beats ---------- */
export const Flash: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill
      style={{
        background: "radial-gradient(circle at 50% 45%, #FFF6DD 0%, #FFB15C 40%, transparent 75%)",
        opacity: interpolate(frame, [0, 2, 7], [0, 0.85, 0], clamp),
        mixBlendMode: "screen",
      }}
    />
  );
};

export const CTA: React.FC<{ line1: string; line2: string }> = ({ line1, line2 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame, fps, config: { damping: 15 } });
  return (
    <div
      style={{
        position: "absolute",
        top: 1330,
        width: "100%",
        textAlign: "center",
        fontFamily,
        fontWeight: 900,
        fontSize: 60,
        lineHeight: 1.05,
        color: C.neonYellow,
        textShadow: "0 0 18px #FFC21A99, 0 4px 14px rgba(0,0,0,0.7)",
        opacity: p,
        translate: `0px ${interpolate(p, [0, 1], [30, 0])}px`,
      }}
    >
      <div>{line1}</div>
      <div>{line2}</div>
    </div>
  );
};

export const ease = Easing.bezier(0.16, 1, 0.3, 1);

/* ---------- Animated tech background (no footage): dark teal, moving grid floor, drifting glows ---------- */
export const TechBackdrop: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const push = interpolate(frame, [0, durationInFrames], [1, 1.08]);
  const ox = Math.sin(frame / 70) * 120;
  const oy = Math.cos(frame / 90) * 80;
  return (
    <AbsoluteFill style={{ background: "#040707", overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          scale: String(push),
          background: [
            `radial-gradient(circle 420px at ${300 + ox}px ${520 + oy}px, #FFB15C33 0%, transparent 100%)`,
            `radial-gradient(circle 520px at ${800 - ox}px ${1250 - oy}px, #1FA39A30 0%, transparent 100%)`,
            "radial-gradient(ellipse 90% 60% at 50% 40%, #102424 0%, #071010 60%, #030505 100%)",
          ].join(","),
        }}
      />
      <div style={{ position: "absolute", left: -540, right: -540, top: 1080, height: 1400, perspective: 900 }}>
        <div
          style={{
            width: "100%",
            height: "100%",
            rotate: "x 72deg",
            transformOrigin: "50% 0%",
            backgroundImage:
              "linear-gradient(#2FE0D044 2px, transparent 2px), linear-gradient(90deg, #2FE0D044 2px, transparent 2px)",
            backgroundSize: "120px 120px",
            backgroundPosition: `0px ${(frame * 4) % 120}px`,
            maskImage: "linear-gradient(to bottom, black 0%, transparent 70%)",
            WebkitMaskImage: "linear-gradient(to bottom, black 0%, transparent 70%)",
          }}
        />
      </div>
      {new Array(26).fill(0).map((_, i) => {
        const x = random(`px${i}`) * 1080;
        const sp = 0.4 + random(`ps${i}`) * 1.2;
        const y = 1920 - ((random(`py${i}`) * 1920 + frame * sp * 2) % 1920);
        const r = 2 + random(`pr${i}`) * 4;
        return (
          <div key={i} style={{ position: "absolute", left: x, top: y, width: r, height: r, borderRadius: r, background: i % 3 ? "#7FF5EA" : "#FFD27A", opacity: 0.35, boxShadow: `0 0 ${r * 4}px currentColor` }} />
        );
      })}
    </AbsoluteFill>
  );
};
