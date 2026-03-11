import { useState } from "react";

function DometrikIcon({
  size = 1024,
  bg = "#1C1C1E",
  frameColor = "#8A8A8E",
  markerColor = "#4A9EFF",
  dColor = "#F2F2F7",
  radius,
}) {
  // All geometry is relative to a 100×100 viewBox
  // Stroke widths scale proportionally — no fixed px values
  const sw = 6.5;
  const dsw = sw + 2;
  const r = radius !== undefined ? radius : size * 0.225; // iOS superellipse ~22.5%

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      style={{ borderRadius: r, display: "block", flexShrink: 0 }}
    >
      {/* Background */}
      <rect width="100" height="100" fill={bg} rx={(r / size) * 100} />

      {/* Frame — tightened inward, better optical centering */}
      <path
        d="M 30,88 L 13,88 L 13,22 Q 13,13 22,13 L 88,13"
        fill="none"
        stroke={frameColor}
        strokeWidth={sw}
        strokeLinecap="square"
        strokeLinejoin="miter"
      />

      {/* Marker — enlarged for legibility, accent color */}
      <rect x="25.5" y="25.5" width="9" height="9" rx="1.5" fill={markerColor} />

      {/* D vertical stem */}
      <path
        d="M 48,34 L 48,86"
        fill="none"
        stroke={dColor}
        strokeWidth={dsw}
        strokeLinecap="round"
      />
      {/* D curve — pulled in slightly so it doesn't crowd right edge */}
      <path
        d="M 48,34 C 72,34 72,86 48,86"
        fill="none"
        stroke={dColor}
        strokeWidth={dsw}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const SIZES = [
  { label: "20", desc: "Notification", s: 20 },
  { label: "29", desc: "Settings", s: 29 },
  { label: "60", desc: "iPhone", s: 60 },
  { label: "76", desc: "iPad", s: 76 },
  { label: "120", desc: "@2x", s: 120 },
  { label: "180", desc: "@3x", s: 180 },
  { label: "1024", desc: "App Store", s: 180, export: 1024 },
];

const THEMES = [
  { label: "Dark", bg: "#1C1C1E", frameColor: "#8A8A8E", markerColor: "#4A9EFF", dColor: "#F2F2F7" },
  { label: "Midnight", bg: "#0A0F1E", frameColor: "#334155", markerColor: "#60A5FA", dColor: "#E2E8F0" },
  { label: "Warm", bg: "#1A1208", frameColor: "#78716C", markerColor: "#F59E0B", dColor: "#FAFAF9" },
  { label: "Slate", bg: "#0F172A", frameColor: "#475569", markerColor: "#818CF8", dColor: "#F1F5F9" },
];

export default function App() {
  const [theme, setTheme] = useState(0);
  const t = THEMES[theme];

  return (
    <div style={{
      minHeight: "100vh",
      background: "#090909",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 48,
      fontFamily: "'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
      padding: "40px 20px",
    }}>

      {/* Hero */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
        <DometrikIcon size={200} {...t} />
        <div style={{ textAlign: "center" }}>
          <div style={{ color: "#F2F2F7", fontSize: 22, fontWeight: 600, letterSpacing: "-0.3px" }}>Dometrik</div>
          <div style={{ color: "#636366", fontSize: 12, letterSpacing: "0.08em", marginTop: 3 }}>APP ICON</div>
        </div>
      </div>

      {/* Theme picker */}
      <div style={{ display: "flex", gap: 8 }}>
        {THEMES.map((th, i) => (
          <button
            key={th.label}
            onClick={() => setTheme(i)}
            style={{
              background: i === theme ? "#2C2C2E" : "transparent",
              border: `1px solid ${i === theme ? "#48484A" : "#2C2C2E"}`,
              borderRadius: 8,
              padding: "6px 14px",
              color: i === theme ? "#F2F2F7" : "#636366",
              fontSize: 12,
              cursor: "pointer",
              letterSpacing: "0.05em",
              transition: "all 0.15s",
            }}
          >
            {th.label}
          </button>
        ))}
      </div>

      {/* Size grid */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12, width: "100%", maxWidth: 600 }}>
        <div style={{ color: "#48484A", fontSize: 11, letterSpacing: "0.1em", textAlign: "center" }}>iOS ICON SIZES</div>
        <div style={{
          background: "#111",
          border: "1px solid #1C1C1E",
          borderRadius: 16,
          overflow: "hidden",
        }}>
          {SIZES.map((item, i) => (
            <div key={item.label} style={{
              display: "flex",
              alignItems: "center",
              padding: "12px 20px",
              borderBottom: i < SIZES.length - 1 ? "1px solid #1C1C1E" : "none",
              gap: 16,
            }}>
              <div style={{ width: item.s, height: item.s, flexShrink: 0 }}>
                <DometrikIcon size={item.s} {...t} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ color: "#F2F2F7", fontSize: 13 }}>{item.export || item.s}×{item.export || item.s}pt</div>
                <div style={{ color: "#48484A", fontSize: 11, marginTop: 1 }}>{item.desc}</div>
              </div>
              <div style={{
                width: 6, height: 6, borderRadius: "50%",
                background: item.s >= 60 ? "#30D158" : "#FF9F0A",
              }} title={item.s >= 60 ? "Full detail" : "Simplified"} />
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 16, justifyContent: "center", marginTop: 4 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#30D158" }} />
            <span style={{ color: "#48484A", fontSize: 11 }}>Full detail legible</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#FF9F0A" }} />
            <span style={{ color: "#48484A", fontSize: 11 }}>Marker fades — acceptable at notif size</span>
          </div>
        </div>
      </div>

      {/* Android adaptive */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12, alignItems: "center" }}>
        <div style={{ color: "#48484A", fontSize: 11, letterSpacing: "0.1em" }}>ANDROID ADAPTIVE</div>
        <div style={{ display: "flex", gap: 24, alignItems: "flex-end" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
            <DometrikIcon size={96} {...t} radius={48} />
            <span style={{ color: "#48484A", fontSize: 10 }}>Circle</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
            <DometrikIcon size={96} {...t} radius={0} />
            <span style={{ color: "#48484A", fontSize: 10 }}>Square</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
            <DometrikIcon size={96} {...t} radius={24} />
            <span style={{ color: "#48484A", fontSize: 10 }}>Squircle</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
            <div style={{
              width: 96, height: 96, borderRadius: 48,
              background: "#1C1C1E",
              display: "flex", alignItems: "center", justifyContent: "center",
              overflow: "hidden",
            }}>
              <DometrikIcon size={116} {...t} radius={0} />
            </div>
            <span style={{ color: "#48484A", fontSize: 10 }}>Foreground layer</span>
          </div>
        </div>
      </div>
    </div>
  );
}