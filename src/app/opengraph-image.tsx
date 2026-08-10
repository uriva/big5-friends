import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const alt = "Big 5 Friends - Personality Comparisons";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(to bottom right, #090d16, #0f172a, #1e1b4b)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "sans-serif",
          color: "white",
          padding: "60px",
          position: "relative",
        }}
      >
        {/* Glow */}
        <div
          style={{
            position: "absolute",
            width: "600px",
            height: "600px",
            background: "radial-gradient(circle, rgba(99, 102, 241, 0.25) 0%, rgba(168, 85, 247, 0.15) 50%, transparent 70%)",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            borderRadius: "50%",
          }}
        />

        {/* Badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            background: "rgba(99, 102, 241, 0.15)",
            border: "1px solid rgba(99, 102, 241, 0.3)",
            padding: "8px 20px",
            borderRadius: "50px",
            color: "#a5b4fc",
            fontSize: "18px",
            fontWeight: 700,
            letterSpacing: "2px",
            textTransform: "uppercase",
            marginBottom: "24px",
          }}
        >
          ✨ Big 5 Friend Trait Assessment
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: "64px",
            fontWeight: 900,
            textAlign: "center",
            letterSpacing: "-1px",
            background: "linear-gradient(to right, #ffffff, #c7d2fe, #e9d5ff)",
            backgroundClip: "text",
            color: "transparent",
            marginBottom: "16px",
          }}
        >
          Big 5 Friends
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: "26px",
            color: "#94a3b8",
            textAlign: "center",
            maxWidth: "800px",
            lineHeight: 1.4,
            marginBottom: "40px",
          }}
        >
          Discover how friends perceive you & see who you are most similar to through pairwise personality comparisons.
        </div>

        {/* Trait Pills */}
        <div style={{ display: "flex", gap: "16px" }}>
          {[
            { letter: "O", name: "Openness", color: "#818cf8" },
            { letter: "C", name: "Conscientiousness", color: "#60a5fa" },
            { letter: "E", name: "Extraversion", color: "#fbbf24" },
            { letter: "A", name: "Agreeableness", color: "#34d399" },
            { letter: "N", name: "Neuroticism", color: "#f43f5e" },
          ].map((t) => (
            <div
              key={t.letter}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                background: "rgba(15, 23, 42, 0.8)",
                border: "1px solid rgba(51, 65, 85, 0.8)",
                padding: "10px 18px",
                borderRadius: "16px",
                color: t.color,
                fontSize: "18px",
                fontWeight: 700,
              }}
            >
              <span>{t.letter}</span>
              <span style={{ color: "#e2e8f0" }}>{t.name}</span>
            </div>
          ))}
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
