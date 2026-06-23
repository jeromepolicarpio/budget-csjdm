import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "City of San Jose del Monte People's Budget Portal";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 50%, #f0f9ff 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, sans-serif",
          padding: "60px",
        }}
      >
        <div
          style={{
            background: "#16a34a",
            color: "white",
            fontSize: "14px",
            fontWeight: 600,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            padding: "6px 18px",
            borderRadius: "999px",
            marginBottom: "28px",
          }}
        >
          San Jose del Monte, Bulacan · Citizen-Built · Open Data
        </div>

        <div
          style={{
            fontSize: "64px",
            fontWeight: 800,
            color: "#111827",
            textAlign: "center",
            lineHeight: 1.1,
            marginBottom: "20px",
          }}
        >
          People&apos;s{" "}
          <span style={{ color: "#16a34a" }}>Budget Portal</span>
        </div>

        <div
          style={{
            fontSize: "26px",
            color: "#6b7280",
            textAlign: "center",
            maxWidth: "760px",
            lineHeight: 1.4,
            marginBottom: "48px",
          }}
        >
          Track how CSJDM spends your taxes — budget, contracts, and
          infrastructure. No spin. Just numbers.
        </div>

        <div
          style={{
            display: "flex",
            gap: "32px",
          }}
        >
          {[
            { label: "Budget Tracked", value: "Annual" },
            { label: "DPWH Projects", value: "Live" },
            { label: "PhilGEPS Contracts", value: "Live" },
          ].map((item) => (
            <div
              key={item.label}
              style={{
                background: "white",
                border: "1px solid #e5e7eb",
                borderRadius: "16px",
                padding: "20px 32px",
                textAlign: "center",
                boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
              }}
            >
              <div
                style={{
                  fontSize: "28px",
                  fontWeight: 700,
                  color: "#16a34a",
                  marginBottom: "4px",
                }}
              >
                {item.value}
              </div>
              <div style={{ fontSize: "14px", color: "#6b7280" }}>
                {item.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
