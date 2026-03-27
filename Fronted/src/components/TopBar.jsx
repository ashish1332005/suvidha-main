/**
 * components/TopBar.jsx
 *
 * ✅ Production-grade Government Kiosk TopBar + Ticker + Wrapper
 * ✅ EN shows English only, HI shows Hindi only (no mixed lines)
 * ✅ No emojis — SVG only
 * ✅ Accessible, touch-friendly, no hover-only UX
 * ✅ Responsive: kiosk (1280), laptop (1024), mobile (360)
 *
 * IMPORTANT:
 * - Expects bilingual ALERTS in ../data/constants:
 *   export const ALERTS = [{ hi:"...", en:"..." }, ...]
 * - If your ALERTS is still a string array, see the compatibility mapper below.
 */

import { useEffect, useMemo, useState } from "react";
import { ALERTS as RAW_ALERTS } from "../data/constants";

// ────────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────────
const FONT_BODY = "'DM Sans','Noto Sans Devanagari','Segoe UI',system-ui,sans-serif";
const FONT_MONO = "'DM Mono','Courier New',monospace";

function clampPx(min, vw, max) {
  return `clamp(${min}px, ${vw}vw, ${max}px)`;
}

// ────────────────────────────────────────────────────────────────
// ICON primitive
// ────────────────────────────────────────────────────────────────
function Icon({ d, size = 18, color = "currentColor" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={color}
      aria-hidden="true"
      focusable="false"
      style={{ flexShrink: 0, display: "block" }}
    >
      <path d={d} />
    </svg>
  );
}

// ────────────────────────────────────────────────────────────────
// SVG Paths used in TopBar
// ────────────────────────────────────────────────────────────────
const PATH = {
  home: "M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z",
  lang:
    "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z",
  accessibility:
    "M20.5 6c-2.61.7-5.67 1-8.5 1s-5.89-.3-8.5-1L3 8c1.86.5 4 .83 6 1v13h2v-6h2v6h2V9c2-.17 4.14-.5 6-1l-.5-2zM12 6c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z",
  shield:
    "M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z",
};

// ────────────────────────────────────────────────────────────────
// ALERTS normalization (compatibility)
// If your constants ALERTS is: ["text1", "text2"...], it will map to {en,hi}
// Better: provide array of {en,hi}
// ────────────────────────────────────────────────────────────────
function normalizeAlerts(alerts) {
  if (!Array.isArray(alerts)) return [];
  if (alerts.length === 0) return [];
  if (typeof alerts[0] === "string") {
    return alerts.map((s) => ({ en: s, hi: s }));
  }
  return alerts.map((a) => ({
    en: a?.en ?? "",
    hi: a?.hi ?? a?.en ?? "",
    type: a?.type,
  }));
}

// ────────────────────────────────────────────────────────────────
// Live Clock (24h)
// ────────────────────────────────────────────────────────────────
export function Clock({ lang = "en" }) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const dateStr =
    lang === "hi"
      ? now.toLocaleDateString("hi-IN", { day: "2-digit", month: "short", year: "numeric" })
      : now.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

  return (
    <div style={{ textAlign: "right", lineHeight: 1.15 }}>
      <div
        style={{
          fontFamily: FONT_MONO,
          fontSize: clampPx(14, 1.5, 18),
          fontWeight: 700,
          color: "white",
          letterSpacing: ".08em",
        }}
        aria-label="Current time"
      >
        {now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: false })}
      </div>

      <div
        style={{
          fontFamily: FONT_BODY,
          fontSize: clampPx(9, 0.9, 11),
          fontWeight: 600,
          color: "rgba(125,170,208,.7)",
          letterSpacing: ".08em",
          textTransform: "uppercase",
          marginTop: 3,
        }}
        aria-label="Current date"
      >
        {dateStr}
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────
// Ticker (language-pure)
// ────────────────────────────────────────────────────────────────
export function Ticker({ lang = "en" }) {
  const ALERTS = useMemo(() => normalizeAlerts(RAW_ALERTS), []);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (!ALERTS.length) return;
    const id = setInterval(() => setIdx((x) => (x + 1) % ALERTS.length), 4500);
    return () => clearInterval(id);
  }, [ALERTS.length]);

  const isHi = lang === "hi";
  const msg = ALERTS.length ? (isHi ? ALERTS[idx].hi : ALERTS[idx].en) : "";

  const labelLive = isHi ? "लाइव" : "LIVE";

  return (
    <div
      style={{
        background: "#06101B",
        height: 38,
        padding: `0 ${clampPx(14, 2.5, 40)}`,
        display: "flex",
        alignItems: "center",
        gap: 14,
        flexShrink: 0,
        borderBottom: "1px solid rgba(255,255,255,.06)",
      }}
      role="status"
      aria-live="polite"
    >
      {/* LIVE badge */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          flexShrink: 0,
          padding: "3px 10px",
          background: "#B91C1C",
          borderRadius: 4,
          border: "1px solid rgba(255,255,255,.14)",
        }}
        aria-label={labelLive}
      >
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: "white",
            display: "inline-block",
            animation: "topbar-pulse 1.5s ease-in-out infinite",
          }}
        />
        <span
          style={{
            fontFamily: FONT_BODY,
            fontSize: 10,
            fontWeight: 900,
            color: "white",
            letterSpacing: ".14em",
          }}
        >
          {labelLive}
        </span>
      </div>

      <span style={{ width: 1, height: 16, background: "rgba(255,255,255,.1)", flexShrink: 0 }} />

      {/* Message */}
      <div
        key={`${idx}-${lang}`}
        style={{
          fontFamily: FONT_BODY,
          fontSize: clampPx(11, 1.2, 13),
          fontWeight: 600,
          color: "#E5C14B",
          flex: 1,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          letterSpacing: ".01em",
          animation: "topbar-fadein .35s ease",
        }}
        title={msg}
      >
        {msg}
      </div>

      {/* Counter */}
      {!!ALERTS.length && (
        <div
          style={{
            fontFamily: FONT_MONO,
            fontSize: 10,
            fontWeight: 700,
            color: "rgba(125,170,208,.55)",
            letterSpacing: ".06em",
            flexShrink: 0,
          }}
        >
          {idx + 1}/{ALERTS.length}
        </div>
      )}

      <style>{`
        @keyframes topbar-pulse { 0%,100%{opacity:1} 50%{opacity:.25} }
        @keyframes topbar-fadein { from{opacity:0;transform:translateY(4px)} to{opacity:1;transform:translateY(0)} }
      `}</style>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────
// SUVIDHA Logo Mark (pure SVG)
// ────────────────────────────────────────────────────────────────
function SuvidhaLogo({ size = 36 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none" aria-label="SUVIDHA logo">
      <circle cx="18" cy="18" r="17" stroke="#F97316" strokeWidth="2" fill="none" />
      {Array.from({ length: 8 }).map((_, i) => {
        const angle = (i * 45 * Math.PI) / 180;
        const x1 = 18 + 8 * Math.cos(angle);
        const y1 = 18 + 8 * Math.sin(angle);
        const x2 = 18 + 14 * Math.cos(angle);
        const y2 = 18 + 14 * Math.sin(angle);
        return (
          <line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="#F97316"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        );
      })}
      <circle cx="18" cy="18" r="5" fill="#F97316" />
      <circle cx="18" cy="18" r="2" fill="white" />
    </svg>
  );
}

// ────────────────────────────────────────────────────────────────
// TopBar (production kiosk)
// - EN => English only labels
// - HI => Hindi only labels
// ────────────────────────────────────────────────────────────────
export function TopBar({ t, lang, setLang, senior, setSenior, screen, setScreen }) {
  const isHi = lang === "hi";

  const labels = useMemo(
    () => ({
      home: isHi ? "होम" : "Home",
      largeText: isHi ? "बड़ा अक्षर" : "Large Text",
      normalText: isHi ? "सामान्य" : "Normal",
      switchTo: isHi ? "English" : "हिंदी", // opposite language
      tagline: isHi ? "नागरिक सेवा केंद्र" : "Citizen Service Centre",
      cdac: "C-DAC · MeitY · Govt. of India",
      a11yOn: isHi ? "बड़ा अक्षर चालू" : "Large text ON",
      a11yOff: isHi ? "बड़ा अक्षर बंद" : "Large text OFF",
    }),
    [isHi]
  );

  return (
    <header
      style={{
        background: "linear-gradient(180deg,#0C2240 0%,#0A1E38 100%)",
        height: "clamp(60px, 7vw, 74px)",
        padding: `0 ${clampPx(14, 2.5, 40)}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        flexShrink: 0,
        borderBottom: "3px solid #E8750A",
        position: "sticky",
        top: 0,
        zIndex: 200,
        boxShadow: "0 2px 18px rgba(0,0,0,.38)",
      }}
    >
      {/* LEFT: Brand */}
      <div style={{ display: "flex", alignItems: "center", gap: clampPx(10, 1.5, 18), minWidth: 0 }}>
        <SuvidhaLogo size={34} />

        <span style={{ width: 1, height: 32, background: "rgba(255,255,255,.1)" }} />

        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontFamily: FONT_BODY,
              fontSize: clampPx(16, 2.0, 22),
              fontWeight: 900,
              color: "white",
              letterSpacing: ".12em",
              lineHeight: 1,
            }}
          >
            SUVIDHA
          </div>

          <div
            style={{
              fontFamily: FONT_BODY,
              fontSize: clampPx(9, 0.9, 10),
              fontWeight: 700,
              color: "rgba(125,170,208,.9)",
              letterSpacing: ".08em",
              textTransform: "uppercase",
              marginTop: 4,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              maxWidth: 320,
            }}
            title={labels.tagline}
          >
            {labels.tagline}
          </div>
        </div>

        {/* Govt badge (auto-hide on very small screens via maxWidth) */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "5px 12px",
            border: "1px solid rgba(255,255,255,.08)",
            borderRadius: 6,
            background: "rgba(255,255,255,.03)",
            maxWidth: "34vw",
          }}
        >
          <svg width={14} height={14} viewBox="0 0 24 24" fill="rgba(125,170,208,.85)" aria-hidden="true">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6z" />
          </svg>
          <span
            style={{
              fontFamily: FONT_BODY,
              fontSize: clampPx(9, 0.85, 10),
              fontWeight: 700,
              color: "rgba(125,170,208,.75)",
              letterSpacing: ".05em",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
            title={labels.cdac}
          >
            {labels.cdac}
          </span>
        </div>
      </div>

      {/* RIGHT: Actions */}
      <div style={{ display: "flex", alignItems: "center", gap: clampPx(6, 0.8, 10), flexShrink: 0 }}>
        {/* Home */}
        {screen !== "language" && (
          <NavButton onClick={() => setScreen("home")} label={labels.home}>
            <Icon d={PATH.home} size={15} color="rgba(255,255,255,.78)" />
          </NavButton>
        )}

        {/* Senior / Large Text */}
        <NavButton
          onClick={() => setSenior((s) => !s)}
          label={senior ? labels.normalText : labels.largeText}
          active={senior}
          ariaPressed={senior}
          ariaLabel={senior ? labels.a11yOn : labels.a11yOff}
        >
          <Icon d={PATH.accessibility} size={15} color={senior ? "white" : "rgba(255,255,255,.78)"} />
        </NavButton>

        <span style={{ width: 1, height: 22, background: "rgba(255,255,255,.1)", margin: "0 2px" }} />

        {/* Language Toggle */}
        <button
          type="button"
          onClick={() => setLang((l) => (l === "en" ? "hi" : "en"))}
          style={langBtnStyle}
          aria-label={isHi ? "Switch to English" : "हिंदी में बदलें"}
        >
          <Icon d={PATH.lang} size={14} color="rgba(125,170,208,.95)" />
          <span
            style={{
              fontFamily: FONT_BODY,
              fontSize: clampPx(12, 1.3, 14),
              fontWeight: 800,
              color: "white",
              letterSpacing: ".04em",
              whiteSpace: "nowrap",
            }}
          >
            {labels.switchTo}
          </span>
        </button>

        <span style={{ width: 1, height: 22, background: "rgba(255,255,255,.1)", margin: "0 2px" }} />

        <Clock lang={lang} />
      </div>

      <style>{`
        /* Touch optimizations */
        button { -webkit-tap-highlight-color: transparent; }
        @media (max-width: 520px) {
          /* Reduce govt badge on small */
          header > div:first-child > div:last-child { display:none; }
        }
      `}</style>
    </header>
  );
}

const langBtnStyle = {
  height: "clamp(36px, 4vw, 44px)",
  padding: `0 ${clampPx(10, 1.3, 16)}`,
  background: "rgba(255,255,255,.06)",
  border: "1.5px solid rgba(255,255,255,.14)",
  borderRadius: 7,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  gap: 8,
};

// ────────────────────────────────────────────────────────────────
// Nav Button
// ────────────────────────────────────────────────────────────────
function NavButton({ onClick, label, active = false, children, ariaPressed, ariaLabel }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={ariaPressed}
      aria-label={ariaLabel || label}
      style={{
        height: "clamp(36px, 4vw, 44px)",
        padding: `0 ${clampPx(10, 1.3, 16)}`,
        background: active ? "rgba(249,115,22,.22)" : "rgba(255,255,255,.06)",
        border: `1.5px solid ${active ? "rgba(249,115,22,.55)" : "rgba(255,255,255,.12)"}`,
        borderRadius: 7,
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: 8,
      }}
    >
      {children}
      <span
        style={{
          fontFamily: FONT_BODY,
          fontSize: clampPx(11, 1.2, 13),
          fontWeight: 800,
          color: active ? "#FED7AA" : "rgba(255,255,255,.78)",
          whiteSpace: "nowrap",
          letterSpacing: ".02em",
        }}
      >
        {label}
      </span>
    </button>
  );
}

// ────────────────────────────────────────────────────────────────
// Page Wrapper
// ────────────────────────────────────────────────────────────────
export function W({ children }) {
  return (
    <div style={{ flex: 1, background: "#F0F4F8", minHeight: "calc(100vh - 74px)" }}>
      <div
        className="wrap"
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: `clamp(12px, 2vw, 20px) ${clampPx(12, 2.5, 40)}`,
        }}
      >
        {children}
      </div>
    </div>
  );
}