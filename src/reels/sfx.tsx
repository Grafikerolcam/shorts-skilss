import React from "react";
import { Audio } from "@remotion/media";
import { AbsoluteFill, Sequence, staticFile, useVideoConfig } from "remotion";
import catalog from "./sfx-catalog.json";
import { C, fontFamily } from "./theme";

// Studio-recorded SFX in public/sfx/ — Mixkit (scripts/get-mixkit-sfx.sh, Mixkit SFX Free License:
// commercial + social OK, no attribution) and a few Kenney CC0. Name = <category>_<variant>.
export const SFX_USE: Record<string, string> = {
  "pop_bubble-alert.wav": "Altyazı/sticker/emoji belirince (ana bubble pop)",
  "pop_dry.wav": "Kuru, kısa pop — ikon, madde",
  "pop_hard.wav": "Sert pop — vurgulu kelime",
  "pop_message.wav": "Mesaj balonu, bildirim kartı",
  "pop_cluster.wav": "Art arda öğeler (liste)",
  "pop_soap-bubble.wav": "Sabun köpüğü — yumuşak, sevimli",
  "pop_egg-bubble.wav": "Tombul bubble pop",
  "pop_cartoon-bubbles.wav": "Çizgi film baloncuklar (uzun, kırp)",
  "pop_cartoon-bubbles-many.wav": "Baloncuk patlaması",
  "pop_plastic-click.wav": "Mini tık-pop",
  "pop_explainer-whoosh.wav": "Explainer tarzı minik pop+whoosh",
  "whoosh_quick-accent.wav": "Hızlı vurgu whoosh — grafik girişi",
  "whoosh_small-sweep.wav": "Küçük sweep — kart/yazı girişi",
  "whoosh_fast-sweep.wav": "Hızlı sweep — whip pan",
  "whoosh_air-sweep.wav": "Hava sweep — geçiş",
  "whoosh_short-sweep.wav": "Çok kısa sweep — punch-in",
  "whoosh_fast-transition.wav": "Hızlı geçiş",
  "whoosh_cinematic-fast.wav": "Sinematik hızlı whoosh",
  "whoosh_cinematic.wav": "Sinematik whoosh — sahne değişimi",
  "whoosh_air.wav": "Uzun hava whoosh",
  "whoosh_trailer-hit.wav": "Whoosh + vuruş — büyük reveal",
  "whoosh_impact.wav": "Whoosh + impact — başlık",
  "impact_big-cinematic.wav": "Büyük sinematik darbe — neon başlık (kırp)",
  "impact_logo-intro.wav": "Logo/intro darbesi",
  "impact_deep-whoosh.wav": "Derin whoosh darbe",
  "impact_drum-deep.wav": "Derin davul vuruşu",
  "impact_heartbeat.wav": "Kalp atışı darbesi — gerilim",
  "riser_trailer.wav": "Kısa riser → açıklama öncesi",
  "riser_drama.wav": "Uzun dramatik riser (kırp)",
  "riser_stutter.wav": "Kekeleyen intro riser",
  "riser_reverse-impact.wav": "Ters darbe → kesmeye biter",
  "magic_wand-sparkle.wav": "Sihirli değnek ışıltı",
  "magic_sparkle-poof.wav": "Işıltı + puf — belirme",
  "magic_glitter.wav": "Sim/parıltı (uzun)",
  "magic_fairy-sparkle.wav": "Peri ışıltısı — kısa",
  "magic_sparkle-intro.wav": "Işıltılı intro",
  "magic_light-transition.wav": "Büyülü ışık geçişi",
  "magic_sparkle-transition.wav": "Işıltılı geçiş — kısa",
  "ding_correct-answer.wav": "Doğru cevap",
  "ding_correct-reward.wav": "Ödül, A+",
  "ding_positive.wav": "Pozitif bildirim",
  "ding_confirmation.wav": "Onay tonu",
  "ding_bell.wav": "Zil bildirimi",
  "ding_announce.wav": "Duyuru tonu",
  "ding_reveal.wav": "Reveal / ortaya çıkış",
  "fail_wrong-answer.wav": "Yanlış cevap, F-",
  "ui_cool-click.wav": "Arayüz tık",
  "ui_mouse-clicks.wav": "Mouse tıklamaları",
  "ui_check.wav": "Tik/kutucuk işaretleme",
  "ui_switch.wav": "Işık düğmesi",
  "ui_app-open.wav": "Uygulama açılışı",
  "ui_tech-slide.wav": "Teknoloji kayma geçişi",
  "typing_laptop-fast.wav": "Laptop'ta hızlı yazma (kırp)",
  "typing_phone.wav": "Telefonda yazma (kırp)",
  "camera_digital-shutter.wav": "Dijital deklanşör — ekran görüntüsü",
  "camera_classic-click.wav": "Klasik fotoğraf tık",
  "glitch_quick.wav": "Hızlı glitch",
  "glitch_intro-text.wav": "Glitch'li yazı girişi",
  "glitch_short.wav": "Kısa glitch",
  "glitch_digital-break.wav": "Dijital kırılma",
  "fx_tape-rewind.wav": "Kaset geri sarma — 'geri saralım'",
  "fx_heartbeat.wav": "Tek kalp atışı",
  "kenney_clock-ticking.wav": "Saat tiktak — zaman baskısı",
  "kenney_card-slide.wav": "Kağıt/kart kayması",
  "kenney_scroll.wav": "Kaydırma",
  "kenney_glass.wav": "Cam 'tink'",
  "kenney_drop.wav": "Damla",
};

/** Place a sound effect at the current Sequence position. Volume ~0.3–0.6 under the voice.
 *  Long files (risers, typing, impacts): wrap in a Sequence with durationInFrames to cut them. */
export const Sfx: React.FC<{ name: string; volume?: number }> = ({ name, volume = 0.5 }) => (
  <Audio src={staticFile(`sfx/${name}.wav`)} volume={volume} />
);

const MAX_PLAY = 3.2; // seconds a sound plays in the sampler
const slot = (dur: number) => Math.max(1.6, Math.min(dur, MAX_PLAY) + 0.5);

export const sfxSamplerDuration = (fps: number) =>
  Math.ceil(catalog.reduce((a, s) => a + slot(s.dur), 0) * fps);

/** Audition reel: shows each sound's name + use while it plays. */
export const SfxSampler: React.FC = () => {
  const { fps } = useVideoConfig();
  let t = 0;
  return (
    <AbsoluteFill style={{ background: "#0B0D0F", fontFamily }}>
      {catalog.map((s, i) => {
        const len = slot(s.dur);
        const from = Math.round(t * fps);
        t += len;
        const name = s.file.replace(".wav", "");
        const play = Math.round(Math.min(s.dur, MAX_PLAY) * fps);
        return (
          <Sequence key={s.file} name={name} from={from} durationInFrames={Math.round(len * fps)}>
            <Sequence from={6} durationInFrames={play}>
              <Audio
                src={staticFile(`sfx/${s.file}`)}
                volume={(f) => 0.8 * Math.min(1, Math.max(0, (play - f) / 8))}
              />
            </Sequence>
            <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", textAlign: "center", padding: 90 }}>
              <div style={{ color: C.sub, fontSize: 44, fontWeight: 700 }}>
                {i + 1} / {catalog.length}
              </div>
              <div style={{ color: C.neonYellow, fontSize: 84, fontWeight: 900, marginTop: 20, textShadow: `0 0 30px ${C.neonGlow}88` }}>
                {name}
              </div>
              <div style={{ color: C.white, fontSize: 52, fontWeight: 800, marginTop: 30 }}>{SFX_USE[s.file] ?? ""}</div>
            </AbsoluteFill>
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
