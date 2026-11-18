import { Composition } from "remotion";
import { TestGraphic } from "./reels/TestGraphic";
import { PopulerUrun, POPULER_URUN_SEC } from "./reels/populer-urun/PopulerUrun";
import { Telefon, TELEFON_FRAMES } from "./reels/telefon/Telefon";
import { Haber, HaberDikey, HABER_FRAMES } from "./reels/haber/Haber";
import { Bulten, BultenDikey, bultenFrames, shortFrames, BultenProps } from "./reels/haber/Bulten";
import dtv1Script from "./reels/deploytv-1/script.json";
import dtv1Voice from "./reels/deploytv-1/voice.json";
import dtv1Env from "./reels/deploytv-1/envelope.json";
import dtv1Credits from "../public/deploytv-1/img/CREDITS.json";
import dtv2Script from "./reels/deploytv-2/script.json";
import dtv2Voice from "./reels/deploytv-2/voice.json";
import dtv2Env from "./reels/deploytv-2/envelope.json";
import dtv2Credits from "../public/deploytv-2/img/CREDITS.json";
import s2_github from "./reels/deploytv-2/shorts/short-github.json";
import s2_github_env from "./reels/deploytv-2/shorts/short-github.envelope.json";
import s2_gta from "./reels/deploytv-2/shorts/short-gta.json";
import s2_gta_env from "./reels/deploytv-2/shorts/short-gta.envelope.json";
import s2_nvidia from "./reels/deploytv-2/shorts/short-nvidia.json";
import s2_nvidia_env from "./reels/deploytv-2/shorts/short-nvidia.envelope.json";
import s2_robot from "./reels/deploytv-2/shorts/short-robot.json";
import s2_robot_env from "./reels/deploytv-2/shorts/short-robot.envelope.json";
import { ProfilFoto, Banner, Kapak } from "./reels/haber/Marka";
import { Sistem, sistemFrames } from "./reels/sistem/Sistem";
import { SfxSampler, sfxSamplerDuration } from "./reels/sfx";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="TestGraphic"
        component={TestGraphic}
        durationInFrames={240}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="PopulerUrun"
        component={PopulerUrun}
        durationInFrames={POPULER_URUN_SEC * 30}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="Telefon"
        component={Telefon}
        durationInFrames={TELEFON_FRAMES}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="Haber"
        component={Haber}
        durationInFrames={HABER_FRAMES}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="HaberDikey"
        component={HaberDikey}
        durationInFrames={HABER_FRAMES}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="DeployTv-1"
        component={Bulten}
        defaultProps={{ slug: "deploytv-1", date: dtv1Script.date, scenes: dtv1Script.scenes, voice: dtv1Voice, envelope: dtv1Env, credits: dtv1Credits, face: { closed: "hazal/yuz_kapali.png", open: "hazal/yuz_acik.png" } } as BultenProps}
        durationInFrames={bultenFrames(dtv1Voice)}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="DeployTv-2"
        component={Bulten}
        defaultProps={{ slug: "deploytv-2", date: dtv2Script.date, scenes: dtv2Script.scenes, voice: dtv2Voice, envelope: dtv2Env, credits: dtv2Credits, face: { closed: "hazal/yuz_kapali.png", open: "hazal/yuz_acik.png" } } as BultenProps}
        durationInFrames={bultenFrames(dtv2Voice)}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="SfxSampler"
        component={SfxSampler}
        durationInFrames={sfxSamplerDuration(30)}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="DeployTv-2-Short-github"
        component={BultenDikey}
        durationInFrames={shortFrames(s2_github.voice)}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{ slug: "deploytv-2", date: s2_github.date, scenes: s2_github.scenes, voice: s2_github.voice, envelope: s2_github_env, credits: dtv2Credits, voiceSrc: "deploytv-2/shorts/short-github.mp3", face: { closed: "hazal/yuz_kapali.png", open: "hazal/yuz_acik.png" } } as BultenProps}
      />
      <Composition
        id="DeployTv-2-Short-gta"
        component={BultenDikey}
        durationInFrames={shortFrames(s2_gta.voice)}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{ slug: "deploytv-2", date: s2_gta.date, scenes: s2_gta.scenes, voice: s2_gta.voice, envelope: s2_gta_env, credits: dtv2Credits, voiceSrc: "deploytv-2/shorts/short-gta.mp3", face: { closed: "hazal/yuz_kapali.png", open: "hazal/yuz_acik.png" } } as BultenProps}
      />
      <Composition
        id="DeployTv-2-Short-nvidia"
        component={BultenDikey}
        durationInFrames={shortFrames(s2_nvidia.voice)}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{ slug: "deploytv-2", date: s2_nvidia.date, scenes: s2_nvidia.scenes, voice: s2_nvidia.voice, envelope: s2_nvidia_env, credits: dtv2Credits, voiceSrc: "deploytv-2/shorts/short-nvidia.mp3", face: { closed: "hazal/yuz_kapali.png", open: "hazal/yuz_acik.png" } } as BultenProps}
      />
      <Composition
        id="DeployTv-2-Short-robot"
        component={BultenDikey}
        durationInFrames={shortFrames(s2_robot.voice)}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{ slug: "deploytv-2", date: s2_robot.date, scenes: s2_robot.scenes, voice: s2_robot.voice, envelope: s2_robot_env, credits: dtv2Credits, voiceSrc: "deploytv-2/shorts/short-robot.mp3", face: { closed: "hazal/yuz_kapali.png", open: "hazal/yuz_acik.png" } } as BultenProps}
      />
      <Composition id="DeployTv-Profil" component={ProfilFoto} durationInFrames={1} fps={30} width={800} height={800} />
      <Composition id="DeployTv-Banner" component={Banner} durationInFrames={1} fps={30} width={2560} height={1440} />
      <Composition id="DeployTv-2-Kapak" component={Kapak} durationInFrames={1} fps={30} width={1280} height={720} defaultProps={{ img: "deploytv-2/img/jensen.jpg", face: "hazal/yuz_acik.png", badge: "HAFTALIK #2", line1: "NVIDIA'DA", line2: "DEPREM!" }} />
      <Composition id="Sistem" component={Sistem} durationInFrames={sistemFrames("full")} fps={30} width={1080} height={1920} defaultProps={{ variant: "full" as const }} />
      <Composition id="Sistem-60" component={Sistem} durationInFrames={sistemFrames("60")} fps={30} width={1080} height={1920} defaultProps={{ variant: "60" as const }} />
    </>
  );
};
