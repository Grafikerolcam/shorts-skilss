import { loadFont } from "@remotion/google-fonts/Montserrat";

// Reels house style (from the reference reel): bold rounded captions, neon keyword titles,
// warm tungsten / teal-shadow cinematic look.
export const { fontFamily } = loadFont("normal", {
  weights: ["700", "800", "900"],
  subsets: ["latin", "latin-ext"],
});

export const C = {
  white: "#FFFFFF",
  neonYellow: "#FFE45C",
  neonGlow: "#FFC21A",
  amber: "#FFB15C",
  teal: "#0F2A2A",
  ink: "#07090A",
  cardBg: "rgba(18, 20, 24, 0.72)",
  cardEdge: "rgba(255,255,255,0.12)",
  sub: "#A7ADB5",
};

// Safe area for 1080x1920 (Instagram UI covers the bottom ~350px and right ~140px).
export const SAFE = { side: 90, top: 220, bottom: 420 };
