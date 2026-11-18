import React from "react";
import { AbsoluteFill, Sequence, useVideoConfig } from "remotion";
import {
  CinematicBackdrop,
  CTA,
  Flash,
  FloatingCard,
  Grade,
  NeonTitle,
  Spinner,
  Word,
  WordCaptions,
} from "./components";
import { Sfx } from "./sfx";

const sentence =
  "Mobius şeridi konusu size hiç mantıklı gelmiyor mu? Birkaç dakikada tüm dönem podcast formunda hazır. Kayıt linki açıklamada.";

// Placeholder timings (real edits get these from Whisper word timestamps).
const words: Word[] = sentence.split(" ").map((text, i) => ({
  text,
  startMs: 250 + i * 400,
  endMs: 250 + (i + 1) * 400,
}));

export const TestGraphic: React.FC = () => {
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill>
      <CinematicBackdrop />

      <Sequence name="Neon başlık" from={0.2 * fps} durationInFrames={2.3 * fps}>
        <NeonTitle lines={["MOBİUS", "ŞERİDİ"]} durationInFrames={2.3 * fps} />
      </Sequence>

      <Sequence name="Yükleniyor" from={1.7 * fps} durationInFrames={1.0 * fps}>
        <Spinner durationInFrames={1.0 * fps} y={330} />
      </Sequence>

      <Sequence name="Geçiş 1" from={2.5 * fps} durationInFrames={10}>
        <Flash />
      </Sequence>

      <Sequence name="Podcast kartı" from={2.6 * fps} durationInFrames={3.0 * fps}>
        <FloatingCard
          title="Kuantum Fiziği Ders Notları"
          subtitle="Fizik Dersleri · Podcast"
          durationInFrames={3.0 * fps}
        />
      </Sequence>

      <Sequence name="Geçiş 2" from={5.6 * fps} durationInFrames={10}>
        <Flash />
      </Sequence>

      <Sequence name="CTA" from={5.8 * fps}>
        <CTA line1="Kayıt için:" line2="linki açıklamada" />
      </Sequence>

      {/* ---- SFX ---- */}
      <Sequence name="sfx: başlık whoosh+darbe" from={0.1 * fps} durationInFrames={2.2 * fps}>
        <Sfx name="whoosh_impact" volume={0.55} />
      </Sequence>
      <Sequence name="sfx: başlık ışıltı" from={0.3 * fps} durationInFrames={1.2 * fps}>
        <Sfx name="magic_fairy-sparkle" volume={0.3} />
      </Sequence>
      <Sequence name="sfx: yükleniyor" from={1.7 * fps}>
        <Sfx name="pop_bubble-alert" volume={0.6} />
      </Sequence>
      <Sequence name="sfx: geçiş whoosh" from={2.3 * fps}>
        <Sfx name="whoosh_small-sweep" volume={0.5} />
      </Sequence>
      <Sequence name="sfx: kart pop" from={2.62 * fps}>
        <Sfx name="pop_message" volume={0.55} />
      </Sequence>
      <Sequence name="sfx: geçiş 2" from={5.45 * fps}>
        <Sfx name="whoosh_short-sweep" volume={0.5} />
      </Sequence>
      <Sequence name="sfx: CTA ding" from={5.85 * fps}>
        <Sfx name="ding_correct-answer" volume={0.4} />
      </Sequence>

      <Grade />

      <Sequence name="Altyazı">
        <WordCaptions words={words} />
      </Sequence>
    </AbsoluteFill>
  );
};
