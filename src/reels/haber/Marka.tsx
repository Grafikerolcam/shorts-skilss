// DeployTv kanal görselleri: profil fotoğrafı (800x800) ve YouTube banner (2560x1440).
import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { sans } from "../cizgi/kit";

const bg = "radial-gradient(ellipse 80% 80% at 40% 35%, #1A2B5E 0%, #050913 75%)";
const grid: React.CSSProperties = {
  backgroundImage: "linear-gradient(rgba(120,160,255,0.09) 2px, transparent 2px), linear-gradient(90deg, rgba(120,160,255,0.09) 2px, transparent 2px)",
  backgroundSize: "60px 60px",
};

const Logo: React.FC<{ size: number }> = ({ size }) => (
  <div style={{ display: "flex", alignItems: "center", gap: size * 0.15, fontFamily: sans, fontWeight: 900, fontSize: size, color: "#fff" }}>
    <div style={{ background: "#E5383B", padding: `${size * 0.04}px ${size * 0.26}px`, borderRadius: size * 0.12 }}>DEPLOY</div>
    TV
  </div>
);

export const ProfilFoto: React.FC = () => (
  <AbsoluteFill style={{ background: bg, justifyContent: "center", alignItems: "center", fontFamily: sans }}>
    <AbsoluteFill style={grid} />
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
      <div style={{ background: "#E5383B", color: "#fff", fontWeight: 900, fontSize: 112, padding: "8px 36px", borderRadius: 24 }}>DEPLOY</div>
      <div style={{ color: "#fff", fontWeight: 900, fontSize: 150, lineHeight: 1 }}>TV</div>
    </div>
  </AbsoluteFill>
);

export const Banner: React.FC = () => (
  <AbsoluteFill style={{ background: bg, fontFamily: sans }}>
    <AbsoluteFill style={grid} />
    {/* güvenli alan 1546x423, ortada */}
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", flexDirection: "column", gap: 26 }}>
      <Logo size={130} />
      <div style={{ color: "#FFD23F", fontWeight: 900, fontSize: 52, letterSpacing: 6 }}>HAFTALIK TEKNOLOJİ BÜLTENİ</div>
      <div style={{ color: "#9AA7C2", fontWeight: 800, fontSize: 36 }}>Yapay zeka · Robotik · Teknoloji devleri · GitHub · Uzay</div>
    </AbsoluteFill>
  </AbsoluteFill>
);

/** YouTube kapak (1280x720): sol görsel, sağda yüz sticker, büyük başlık */
export const Kapak: React.FC<{ img: string; face: string; line1: string; line2: string; badge: string }> = ({ img, face, line1, line2, badge }) => (
  <AbsoluteFill style={{ background: bg, fontFamily: sans }}>
    <Img src={staticFile(img)} style={{ position: "absolute", left: 0, top: 0, width: 760, height: 720, objectFit: "cover", filter: "saturate(1.15) contrast(1.05)" }} />
    <div style={{ position: "absolute", left: 0, top: 0, width: 1280, height: 720, background: "linear-gradient(90deg, rgba(5,9,19,0.1) 0%, rgba(5,9,19,0.55) 45%, #050913 62%)" }} />
    <div style={{ position: "absolute", left: 40, top: 36, background: "#E5383B", color: "#fff", fontWeight: 900, fontSize: 40, padding: "6px 22px", borderRadius: 12 }}>{badge}</div>
    <div style={{ position: "absolute", left: 40, bottom: 40, color: "#fff", fontWeight: 900, fontSize: 112, lineHeight: 0.98, textShadow: "0 8px 30px rgba(0,0,0,0.85)", letterSpacing: -1 }}>
      {line1}
      <br />
      <span style={{ color: "#FFD23F" }}>{line2}</span>
    </div>
    <div style={{ position: "absolute", right: 70, top: 70, width: 400, height: 500, rotate: "6deg", filter: "drop-shadow(0 0 0 #fff) drop-shadow(8px 0 0 #fff) drop-shadow(-8px 0 0 #fff) drop-shadow(0 8px 0 #fff) drop-shadow(0 -8px 0 #fff) drop-shadow(0 20px 30px rgba(0,0,0,0.6))" }}>
      <Img src={staticFile(face)} style={{ width: "100%", height: "100%", objectFit: "cover", clipPath: "ellipse(44% 48% at 50% 50%)" }} />
    </div>
    <div style={{ position: "absolute", right: 40, bottom: 40 }}>
      <Logo size={38} />
    </div>
  </AbsoluteFill>
);
