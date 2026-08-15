import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const size = {
  width: 180,
  height: 180,
};
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #4338ca 0%, #6366f1 40%, #7c3aed 70%, #9333ea 100%)",
          borderRadius: "40px",
          position: "relative",
          boxShadow: "inset 0 0 0 4px rgba(255, 255, 255, 0.2)",
        }}
      >
        {/* Glow */}
        <div
          style={{
            position: "absolute",
            width: "120px",
            height: "120px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(255, 255, 255, 0.35) 0%, rgba(168, 85, 247, 0.2) 50%, transparent 70%)",
          }}
        />

        {/* Five subtle trait accent dots in the background */}
        <div
          style={{
            position: "absolute",
            width: "10px",
            height: "10px",
            borderRadius: "50%",
            backgroundColor: "#a5b4fc",
            top: "28px",
            left: "90px",
          }}
        />
        <div
          style={{
            position: "absolute",
            width: "10px",
            height: "10px",
            borderRadius: "50%",
            backgroundColor: "#67e8f9",
            top: "56px",
            right: "32px",
          }}
        />
        <div
          style={{
            position: "absolute",
            width: "10px",
            height: "10px",
            borderRadius: "50%",
            backgroundColor: "#fde047",
            bottom: "32px",
            right: "48px",
          }}
        />
        <div
          style={{
            position: "absolute",
            width: "10px",
            height: "10px",
            borderRadius: "50%",
            backgroundColor: "#6ee7b7",
            bottom: "32px",
            left: "48px",
          }}
        />
        <div
          style={{
            position: "absolute",
            width: "10px",
            height: "10px",
            borderRadius: "50%",
            backgroundColor: "#fda4af",
            top: "56px",
            left: "32px",
          }}
        />

        {/* Center Sparkles */}
        <svg
          width="104"
          height="104"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path
            d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"
            fill="white"
          />
          <path
            d="M5 3v4M3 5h4M19 17v4M17 19h4"
            stroke="white"
            strokeWidth="1.8"
          />
        </svg>
      </div>
    ),
    {
      ...size,
    }
  );
}
