import { ImageResponse } from "next/og";
import { readFile } from "fs/promises";
import path from "path";

export const alt = "City of San Jose del Monte People's Budget Portal";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OgImage() {
  const sealBuffer = await readFile(
    path.join(process.cwd(), "public/San-Jose-del-Monte-Official-Seal.png")
  );
  const sealSrc = `data:image/png;base64,${sealBuffer.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          background: "#0a0a0a",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Radial blue glow centered */}
        <div
          style={{
            position: "absolute",
            width: 700,
            height: 700,
            borderRadius: "50%",
            background: "rgba(59,130,246,0.10)",
            top: -35,
            left: 250,
          }}
        />

        {/* GitHub tag — top left */}
        <div
          style={{
            position: "absolute",
            top: 32,
            left: 48,
            display: "flex",
            fontSize: 13,
            color: "rgba(255,255,255,0.22)",
            fontWeight: 500,
          }}
        >
          github.com/jeromepolicarpio/budget-csjdm
        </div>

        {/* Center column */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          {/* City seal */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={sealSrc}
            width={76}
            height={76}
            style={{
              borderRadius: "50%",
              border: "2px solid rgba(255,255,255,0.12)",
              marginBottom: 24,
            }}
          />

          {/* Badge */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: "rgba(59,130,246,0.12)",
              border: "1px solid rgba(59,130,246,0.28)",
              borderRadius: 999,
              padding: "6px 18px",
              fontSize: 13,
              fontWeight: 500,
              color: "#93c5fd",
              marginBottom: 20,
            }}
          >
            <div
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "#3b82f6",
              }}
            />
            San Jose del Monte, Bulacan · Open Data · Civic Tech
          </div>

          {/* Title */}
          <div
            style={{
              display: "flex",
              fontSize: 70,
              fontWeight: 800,
              lineHeight: 1.05,
              letterSpacing: "-0.03em",
              marginBottom: 14,
            }}
          >
            <span style={{ color: "#ffffff" }}>People&apos;s&nbsp;</span>
            <span style={{ color: "#3b82f6" }}>Budget</span>
            <span style={{ color: "#ffffff" }}>&nbsp;Portal</span>
          </div>

          {/* Tagline */}
          <div
            style={{
              display: "flex",
              fontSize: 22,
              color: "rgba(255,255,255,0.45)",
              marginBottom: 40,
            }}
          >
            Saan napunta ang pera ng bayan?
          </div>

          {/* Stats row */}
          <div
            style={{
              display: "flex",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 14,
              overflow: "hidden",
              background: "rgba(255,255,255,0.03)",
            }}
          >
            {(
              [
                { value: "BLGF", label: "Budget Data" },
                { value: "PhilGEPS", label: "Contracts" },
                { value: "DPWH", label: "Projects" },
                { value: "Live", label: "Open Source" },
              ] as const
            ).map((item, i) => (
              <div
                key={item.value}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  padding: "15px 42px",
                  borderRight:
                    i < 3 ? "1px solid rgba(255,255,255,0.08)" : "none",
                }}
              >
                <div
                  style={{ fontSize: 19, fontWeight: 700, color: "#ffffff" }}
                >
                  {item.value}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: "rgba(255,255,255,0.32)",
                    marginTop: 4,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                  }}
                >
                  {item.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live URL — bottom right */}
        <div
          style={{
            position: "absolute",
            bottom: 28,
            right: 48,
            display: "flex",
            fontSize: 13,
            color: "rgba(255,255,255,0.18)",
            fontWeight: 500,
          }}
        >
          budget-csjdm.vercel.app
        </div>
      </div>
    ),
    { ...size }
  );
}
