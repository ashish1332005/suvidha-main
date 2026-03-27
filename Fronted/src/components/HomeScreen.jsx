/**
 * components/HomeScreen.jsx — SUVIDHA Kiosk
 *
 * ✅ Professional Government Kiosk UI — production level
 * ✅ Fully bilingual — ALL text switches Hindi ↔ English via lang prop
 * ✅ Elder/Senior mode — ALL text scales up via senior prop from TopBar
 * ✅ SVG icons only — zero emojis
 * ✅ DM Sans + DM Mono + Noto Sans Devanagari
 * ✅ Staggered entry animations
 * ✅ Tricolor accent system
 * ✅ Responsive: Kiosk 1280 · Laptop 1024 · Mobile 360
 * ✅ Compatible with TopBar.jsx (lang, senior, setScreen, setDept, setFlow)
 */

import { useState, useEffect } from "react";

// ══════════════════════════════════════════════════════════════════════════════
//  SVG ICON PRIMITIVE
// ══════════════════════════════════════════════════════════════════════════════
function Ic({ path, size = 20, color = "currentColor", style: s }) {
  return (
    <svg
      width={size} height={size} viewBox="0 0 24 24"
      fill={color} aria-hidden="true"
      style={{ flexShrink: 0, display: "block", ...s }}
    >
      <path d={path} />
    </svg>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  ICON PATHS
// ══════════════════════════════════════════════════════════════════════════════
const IC = {
  elec:    "M13 2L4.5 13.5H11L10 22L19.5 10.5H13L13 2Z",
  gas:     "M12 2C12 2 9 7 9 11C9 11 7 9.5 7 7.5C5 10 4 13 4 15C4 19.42 7.58 23 12 23C16.42 23 20 19.42 20 15C20 10 12 2 12 2ZM12 21C8.69 21 6 18.31 6 15C6 13.5 6.5 12 7.5 10.5C7.5 12 9 13 9 13C9 10 11 7.5 12 5C13 7.5 15 10 15 13C15 13 16.5 12 16.5 10.5C17.5 12 18 13.5 18 15C18 18.31 15.31 21 12 21Z",
  muni:    "M2 20V8L12 2L22 8V20H16V14H8V20H2ZM4 18H6V12H18V18H20V9L12 4.5L4 9V18ZM8 20V16H16V20H8Z",
  info:    "M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 17H11V11H13V17ZM13 9H11V7H13V9Z",
  shield:  "M12 1L3 5V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V5L12 1Z",
  phone:   "M6.62 10.79C8.06 13.62 10.38 15.93 13.21 17.38L15.41 15.18C15.68 14.91 16.08 14.82 16.43 14.94C17.55 15.31 18.76 15.51 20 15.51C20.55 15.51 21 15.96 21 16.51V20C21 20.55 20.55 21 20 21C10.61 21 3 13.39 3 4C3 3.45 3.45 3 4 3H7.5C8.05 3 8.5 3.45 8.5 4C8.5 5.25 8.7 6.45 9.07 7.57C9.18 7.92 9.1 8.31 8.82 8.59L6.62 10.79Z",
  chevR:   "M10 6L8.59 7.41L13.17 12L8.59 16.59L10 18L16 12L10 6Z",
  search:  "M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z",
  bus:     "M4 16c0 .88.39 1.67 1 2.22V20c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h8v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1.78c.61-.55 1-1.34 1-2.22V6c0-3.5-3.58-4-8-4s-8 .5-8 4v10zm3.5 1c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm9 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm1.5-6H6V6h12v5z",
  hosp:    "M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm7 13H5v-.23c0-.62.28-1.2.76-1.58C7.47 15.82 9.64 15 12 15s4.53.82 6.24 2.19c.48.38.76.97.76 1.58V19z",
  pill2:   "M20.49 3.51c-1.96-1.96-5.13-1.96-7.09 0L3.51 13.41c-1.96 1.96-1.96 5.13 0 7.09 1.96 1.96 5.13 1.96 7.09 0l9.89-9.89c1.96-1.97 1.96-5.14 0-7.1zm-14.14 15.2c-1.18-1.18-1.18-3.09 0-4.24L9 11.83l4.24 4.24-2.65 2.65c-1.18 1.17-3.09 1.17-4.24-.01zM19.07 9.17L15.83 12 11.59 7.76l3.24-3.24c1.18-1.18 3.09-1.18 4.24 0 1.18 1.17 1.18 3.08 0 4.65z",
  doc:     "M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z",
  warn:    "M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z",
  check:   "M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z",
  info2:   "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z",
  locate:  "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z",
  sun:     "M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0 .39-.39.39-1.03 0-1.41l-1.06-1.06zm1.06-12.37l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06c.39-.39.39-1.03 0-1.41s-1.03-.39-1.41 0zM7.05 18.36l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06c.39-.39.39-1.03 0-1.41s-1.03-.39-1.41 0z",
  senior:  "M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z",
  medal:   "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
  house:   "M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z",
  voter:   "M18 4H6c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-5 11.5h-2V13H9.5v-2H11V9h2v2h1.5v2H13v2.5z",
  aadhaar: "M12 1C5.93 1 1 5.93 1 12s4.93 11 11 11 11-4.93 11-11S18.07 1 12 1zm0 4c1.86 0 3.38 1.52 3.38 3.38S13.86 11.75 12 11.75 8.63 10.23 8.63 8.38 10.14 5 12 5zm0 14.5c-2.83 0-5.33-1.46-6.79-3.67C6.5 13.83 10 13 12 13s5.5.83 6.79 2.83C17.33 18.04 14.83 19.5 12 19.5z",
  scroll:  "M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zM6 20V4h7v5h5v11H6z",
  pension: "M20 4H4v2h16V4zm1 10v-2l-1-5H4l-1 5v2h1v6h10v-6h4v6h2v-6h1zm-9 4H6v-4h6v4z",
  divyang: "M12 2c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm9 7h-6v13h-2v-6h-2v6H9V9H3V7h18v2z",
  farmer:  "M12 22c4.97 0 9-4.03 9-9-4.97 0-9 4.03-9 9zm0 0c0-4.97-4.03-9-9-9 0 4.97 4.03 9 9 9zm0-18C9.24 4 7 6.24 7 9c0 1.29.47 2.46 1.24 3.36C9.46 13.28 10.67 14 12 14s2.54-.72 3.76-1.64C16.53 11.46 17 10.29 17 9c0-2.76-2.24-5-5-5z",
  ration:  "M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z",
  scholar: "M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82zM12 3L1 9l11 6 9-4.91V17h2V9L12 3z",
  fire:    "M19.48 12.35c-1.57-4.08-7.16-4.3-5.81-10.23.1-.44-.37-.78-.75-.55C9.29 3.71 6.68 8 8.87 13.62c.18.46-.36.89-.75.59-1.81-1.37-2-3.34-1.84-4.75.06-.52-.62-.77-.91-.34C4.69 10.16 4 11.84 4 14c0 4.22 3.8 7.99 8 8 4.2.01 8-3.77 8-8 0-1.23-.26-2.4-.52-3.65z",
  police:  "M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z",
  women:   "M13 11.5V17h3l-4 4-4-4h3v-5.5c-2.28-.46-4-2.48-4-4.91V4h1.5v6.5h1.5V4H11v6.5h1.5V4H14v2.59c0 2.43-1.72 4.45-4 4.91z",
  child:   "M11.5 2C9.01 2 7 4.01 7 6.5S9.01 11 11.5 11 16 8.99 16 6.5 13.99 2 11.5 2zM21 23v-1c0-2.67-5.33-4-8-4s-8 1.33-8 4v1h16zm-9-11c-3.33 0-10 1.67-10 5v2h20v-2c0-3.33-6.67-5-10-5z",
  cyber:   "M20 4H4c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm-5 11.5h-2V13H9.5v-2H11V9h2v2h1.5v2H13v2.5z",
  water:   "M12 2c-5.33 4.55-8 8.48-8 11.8 0 4.98 3.8 8.2 8 8.2s8-3.22 8-8.2c0-3.32-2.67-7.25-8-11.8z",
  govt:    "M12 3L2 12h3v9h6v-5h2v5h6v-9h3L12 3z",
};

// ══════════════════════════════════════════════════════════════════════════════
//  DATE / TIME HELPERS
// ══════════════════════════════════════════════════════════════════════════════
const HI_MONTHS = ["जनवरी","फरवरी","मार्च","अप्रैल","मई","जून","जुलाई","अगस्त","सितंबर","अक्तूबर","नवंबर","दिसंबर"];
const HI_DAYS   = ["रविवार","सोमवार","मंगलवार","बुधवार","गुरुवार","शुक्रवार","शनिवार"];
const HI_D      = ["०","१","२","३","४","५","६","७","८","९"];
const toHi      = n => String(n).split("").map(d => HI_D[+d]).join("");
const getHindiDate = () => {
  const d = new Date();
  return `${HI_DAYS[d.getDay()]}, ${toHi(d.getDate())} ${HI_MONTHS[d.getMonth()]} ${toHi(d.getFullYear())}`;
};
const getEnDate = () =>
  new Date().toLocaleDateString("en-IN", { weekday:"long", day:"numeric", month:"long", year:"numeric" });

// ══════════════════════════════════════════════════════════════════════════════
//  GLOBAL CSS
// ══════════════════════════════════════════════════════════════════════════════
const GLOBAL_CSS = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700;9..40,800;9..40,900&family=DM+Mono:wght@500;600;700&family=Noto+Sans+Devanagari:wght@400;500;600;700;800&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

::-webkit-scrollbar { width: 4px; height: 4px; }
::-webkit-scrollbar-track { background: #E8EEF4; }
::-webkit-scrollbar-thumb { background: #B8CCD8; border-radius: 99px; }

/* ── Entry animations ── */
@keyframes hs-up    { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:none; } }
@keyframes hs-dot   { 0%,100% { box-shadow:0 0 0 0 rgba(22,163,74,.5); } 70% { box-shadow:0 0 0 7px rgba(22,163,74,0); } }
@keyframes hs-pulse { 0%,100% { opacity:1; } 50% { opacity:.35; } }
@keyframes hs-marq  { 0% { transform:translateX(0); } 100% { transform:translateX(-50%); } }
@keyframes hs-fadein{ from{opacity:0;transform:translateY(4px);} to{opacity:1;transform:none;} }

.hs-s1 { animation: hs-up .4s ease .04s both; }
.hs-s2 { animation: hs-up .4s ease .09s both; }
.hs-s3 { animation: hs-up .4s ease .14s both; }
.hs-s4 { animation: hs-up .4s ease .19s both; }
.hs-s5 { animation: hs-up .4s ease .24s both; }
.hs-s6 { animation: hs-up .4s ease .29s both; }
.hs-s7 { animation: hs-up .4s ease .34s both; }
.hs-s8 { animation: hs-up .4s ease .39s both; }
.hs-s9 { animation: hs-up .4s ease .44s both; }

/* ── Responsive grids ── */
.hs-dept-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: clamp(10px, 1.4vw, 15px);
  margin-bottom: 14px;
}
.hs-svc-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: clamp(8px, 1vw, 12px);
}
.hs-help-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: clamp(7px, .95vw, 10px);
}
.hs-doc-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 9px;
}
.hs-two-col {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
  margin-bottom: 14px;
}

@media (max-width: 680px) {
  .hs-dept-grid  { grid-template-columns: 1fr !important; }
  .hs-svc-grid   { grid-template-columns: repeat(2,1fr) !important; }
  .hs-help-grid  { grid-template-columns: repeat(2,1fr) !important; }
  .hs-doc-grid   { grid-template-columns: 1fr !important; }
  .hs-two-col    { grid-template-columns: 1fr !important; }
}
@media (min-width:681px) and (max-width:1023px) {
  .hs-help-grid  { grid-template-columns: repeat(3,1fr) !important; }
}

/* ── Card base ── */
.hs-card {
  background: white;
  border: 1.5px solid #DDE6F0;
  border-radius: 14px;
  padding: clamp(14px, 1.8vw, 20px);
  box-shadow: 0 1px 4px rgba(7,24,56,.05), 0 4px 18px rgba(7,24,56,.04);
  margin-bottom: 14px;
}

/* ── Dept card ── */
.hs-dept-card {
  background: white;
  border: 1.5px solid #DDE6F0;
  border-radius: 14px;
  overflow: hidden;
  cursor: pointer;
  text-align: left;
  width: 100%;
  box-shadow: 0 1px 4px rgba(7,24,56,.05), 0 4px 16px rgba(7,24,56,.04);
  transition: transform .2s cubic-bezier(.34,1.56,.64,1), box-shadow .2s ease, border-color .2s ease;
  display: flex;
  flex-direction: column;
}
.hs-dept-card:hover  { transform: translateY(-3px); box-shadow: 0 6px 24px rgba(7,24,56,.12); }
.hs-dept-card:active { transform: translateY(0) scale(.98); }

/* ── Quick service button ── */
.hs-svc-btn {
  border-radius: 12px;
  border: 1.5px solid transparent;
  cursor: pointer;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: clamp(10px, 1.3vw, 16px) 8px;
  transition: box-shadow .15s, transform .1s;
}
.hs-svc-btn:hover  { box-shadow: 0 3px 14px rgba(7,24,56,.09); }
.hs-svc-btn:active { transform: scale(.96); }

/* ── Helpline card ── */
.hs-help-card {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 5px;
  border-radius: 12px;
  padding: clamp(10px, 1.2vw, 14px);
  cursor: pointer;
  border: 1.5px solid transparent;
  transition: border-color .15s, transform .12s;
}
.hs-help-card:hover  { border-color: currentColor; }
.hs-help-card:active { transform: scale(.95); }

/* ── Feedback button ── */
.hs-fb-btn {
  background: rgba(255,255,255,.08);
  border: 1px solid rgba(255,255,255,.18);
  border-radius: 10px;
  padding: clamp(8px,1vw,11px) clamp(11px,1.3vw,15px);
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  transition: background .15s, transform .1s;
}
.hs-fb-btn:hover  { background: rgba(255,255,255,.15); }
.hs-fb-btn:active { transform: scale(.94); }

/* ── Search input ── */
.hs-input {
  flex: 1;
  min-width: clamp(180px, 28vw, 300px);
  height: clamp(46px, 5.4vw, 56px);
  padding: 0 clamp(12px, 1.6vw, 16px);
  font-family: 'DM Sans', 'Noto Sans Devanagari', sans-serif;
  color: #0A1828;
  background: #F5F9FE;
  border: 1.5px solid #C8D8E8;
  border-radius: 9px;
  outline: none;
  transition: border-color .15s, box-shadow .15s;
}
.hs-input:focus {
  border-color: #1558A0;
  box-shadow: 0 0 0 3px rgba(21,88,160,.10);
}

*:focus-visible {
  outline: 2.5px solid #1558A0;
  outline-offset: 3px;
  border-radius: 4px;
}
`;

// ══════════════════════════════════════════════════════════════════════════════
//  BILINGUAL DATA
// ══════════════════════════════════════════════════════════════════════════════

const SCHEMES = [
  { hi:"PM Awas Yojana — मुफ्त मकान के लिए यहाँ आवेदन करें",            en:"PM Awas Yojana — Apply for free housing here"            },
  { hi:"PM Ujjwala 3.0 — निःशुल्क LPG कनेक्शन उपलब्ध है",              en:"PM Ujjwala 3.0 — Free LPG connection available"           },
  { hi:"सौभाग्य योजना — मुफ्त बिजली कनेक्शन के लिए आवेदन करें",        en:"Saubhagya Scheme — Apply for free electricity connection"  },
  { hi:"Ayushman Bharat — ₹5 लाख तक मुफ्त इलाज पाएं",                  en:"Ayushman Bharat — Free treatment up to ₹5 lakh"           },
  { hi:"PM Kisan Samman Nidhi — किसानों को ₹6000 प्रतिवर्ष",            en:"PM Kisan — ₹6000/year direct benefit transfer to farmers"  },
  { hi:"वृद्धावस्था पेंशन — 60+ नागरिकों के लिए ₹1000/माह",            en:"Old Age Pension — ₹1000/month for citizens above 60"       },
];

const ALERTS_DATA = [
  { type:"warn",  hi:"वार्ड 12–15: आज शाम 4–7 बजे बिजली रखरखाव कार्य",  en:"Ward 12–15: Planned power maintenance 4–7 PM today"  },
  { type:"warn",  hi:"Zone B: कल सुबह 6–9 बजे जल आपूर्ति बंद रहेगी",    en:"Zone B: Water supply off tomorrow 6–9 AM"             },
  { type:"green", hi:"माधोगंज: बिजली आपूर्ति दोपहर 2:30 बजे बहाल हुई",  en:"Madhoganj: Power restored today at 2:30 PM"           },
  { type:"info",  hi:"नगर पालिका कार्यालय: इस शनिवार बंद रहेगा",         en:"Municipal Office: Closed this Saturday"               },
];

const DEPT_CONFIG = {
  electricity: {
    color:"#1558A0", light:"#EBF4FF", topBar:"#0E4D99", icon:IC.elec,
    nameHi:"बिजली विभाग",   nameEn:"Electricity Dept.",
    subHi:"बिल · नया कनेक्शन · शिकायत", subEn:"Bill · New Connection · Complaint",
  },
  gas: {
    color:"#C25000", light:"#FFF0E6", topBar:"#B54800", icon:IC.gas,
    nameHi:"गैस एवं LPG",   nameEn:"Gas & LPG",
    subHi:"बिल · गैस लीक · कनेक्शन", subEn:"Bill · Gas Leak · Connection",
  },
  municipal: {
    color:"#0B6E3A", light:"#E5F5EC", topBar:"#096633", icon:IC.muni,
    nameHi:"नगर पालिका",    nameEn:"Municipal Corp.",
    subHi:"संपत्ति कर · प्रमाण पत्र", subEn:"Property Tax · Certificates",
  },
  info: {
    color:"#6D28D9", light:"#F3EFFB", topBar:"#5B21B6", icon:IC.info,
    nameHi:"जानकारी केंद्र", nameEn:"Info & Schemes",
    subHi:"योजनाएं · हेल्पलाइन · खोज", subEn:"Schemes · Helplines · Locator",
  },
};

const QUICK_SVCS = [
  { hi:"मतदाता पहचान पत्र", en:"Voter ID Card",      icon:IC.voter,   color:"#1558A0", bg:"#EBF4FF", screen:"voter"   },
  { hi:"आधार सेवाएं",        en:"Aadhaar Services",  icon:IC.aadhaar, color:"#0B6E3A", bg:"#E5F5EC", screen:"aadhaar" },
  { hi:"जाति / निवास",       en:"Caste / Domicile",  icon:IC.scroll,  color:"#C25000", bg:"#FFF0E6", screen:null      },
  { hi:"छात्रवृत्ति",         en:"Scholarships",      icon:IC.scholar, color:"#6D28D9", bg:"#F3EFFB", screen:null      },
  { hi:"वृद्धावस्था पेंशन",  en:"Old Age Pension",   icon:IC.pension, color:"#B45309", bg:"#FFFBEB", flow:"pm_yojana" },
  { hi:"दिव्यांग / UDID",    en:"Divyang / UDID",    icon:IC.divyang, color:"#0369A1", bg:"#E0F2FE", screen:null      },
  { hi:"किसान सेवाएं",       en:"Farmer Services",   icon:IC.farmer,  color:"#0B6E3A", bg:"#E5F5EC", flow:"pm_yojana" },
  { hi:"राशन कार्ड (PDS)",   en:"Ration Card (PDS)", icon:IC.ration,  color:"#B91C1C", bg:"#FEF2F2", screen:null      },
];

const HEALTH = [
  { hi:"जिला सरकारी अस्पताल",        en:"Govt. District Hospital",  dist:"0.8 km", phone:"0145-262001", urgent:true   },
  { hi:"सामुदायिक स्वास्थ्य केंद्र", en:"Community Health Centre",  dist:"1.2 km", phone:"0145-262100", urgent:false  },
  { hi:"जन औषधि केंद्र",             en:"Jan Aushadhi Kendra",      dist:"0.3 km", phone:"98290-XXXXX", medicine:true },
  { hi:"उप जिला अस्पताल",            en:"Sub-District Hospital",    dist:"3.4 km", phone:"0145-262500", urgent:false  },
];

const BUSES = [
  { no:"14A", color:"#1558A0", fromHi:"नया बाज़ार",   toHi:"रेलवे स्टेशन",  fromEn:"Naya Bazaar",  toEn:"Railway Station", nextHi:"8 मिनट",  nextEn:"8 min"  },
  { no:"22",  color:"#0B6E3A", fromHi:"सिविल लाइंस", toHi:"पुष्कर रोड",    fromEn:"Civil Lines",  toEn:"Pushkar Road",    nextHi:"12 मिनट", nextEn:"12 min" },
  { no:"31B", color:"#C25000", fromHi:"अजमेर सिटी",  toHi:"आना सागर झील",  fromEn:"Ajmer City",   toEn:"Ana Sagar Lake",  nextHi:"5 मिनट",  nextEn:"5 min"  },
];

const HELPLINES = [
  { hi:"राष्ट्रीय आपातकाल",  en:"National Emergency",     no:"112",          icon:IC.shield, color:"#B91C1C", bg:"#FEF2F2" },
  { hi:"बिजली शिकायत",       en:"Electricity Complaint",  no:"1912",         icon:IC.elec,   color:"#1558A0", bg:"#EBF4FF" },
  { hi:"गैस आपातकाल",        en:"Gas Emergency",          no:"1906",         icon:IC.fire,   color:"#C25000", bg:"#FFF0E6" },
  { hi:"एम्बुलेंस",           en:"Ambulance",              no:"108",          icon:IC.hosp,   color:"#B91C1C", bg:"#FEF2F2" },
  { hi:"दमकल विभाग",         en:"Fire Brigade",           no:"101",          icon:IC.fire,   color:"#C25000", bg:"#FFF0E6" },
  { hi:"पुलिस नियंत्रण",     en:"Police Control",         no:"100",          icon:IC.police, color:"#1558A0", bg:"#EBF4FF" },
  { hi:"महिला हेल्पलाइन",    en:"Women Helpline",         no:"181",          icon:IC.women,  color:"#6D28D9", bg:"#F3EFFB" },
  { hi:"बाल सहायता",          en:"Child Helpline",         no:"1098",         icon:IC.child,  color:"#0B6E3A", bg:"#E5F5EC" },
  { hi:"वरिष्ठ नागरिक",      en:"Senior Citizen",         no:"14567",        icon:IC.senior, color:"#B45309", bg:"#FFFBEB" },
  { hi:"साइबर अपराध",        en:"Cyber Crime",            no:"1930",         icon:IC.cyber,  color:"#0369A1", bg:"#E0F2FE" },
  { hi:"जल आपूर्ति",          en:"Water Supply",           no:"1916",         icon:IC.water,  color:"#0369A1", bg:"#E0F2FE" },
  { hi:"जिला कलेक्टर",       en:"District Collector",     no:"0145-262XXX",  icon:IC.govt,   color:"#1558A0", bg:"#EBF4FF" },
];

const DOCS = [
  { hi:"आधार कार्ड",          en:"Aadhaar Card",            useHi:"सभी सेवाएं",            useEn:"All services",          icon:IC.aadhaar },
  { hi:"मतदाता पहचान पत्र",  en:"Voter ID Card",           useHi:"मतदाता सेवाएं",         useEn:"Voter services",        icon:IC.voter   },
  { hi:"पासपोर्ट फोटो",       en:"Passport Photo",          useHi:"सभी आवेदन",             useEn:"All applications",      icon:IC.senior  },
  { hi:"पता प्रमाण",           en:"Address Proof",           useHi:"बिल, प्रमाण पत्र",     useEn:"Bills, certificates",   icon:IC.house   },
  { hi:"आय प्रमाण पत्र",      en:"Income Certificate",      useHi:"योजनाएं, छात्रवृत्ति",  useEn:"Schemes, scholarships", icon:IC.doc     },
  { hi:"भूमि रिकॉर्ड / खसरा", en:"Land Record / Khasra",   useHi:"किसान योजनाएं",         useEn:"Farmer schemes",        icon:IC.farmer  },
  { hi:"अंक तालिका / प्रमाण", en:"Marksheet / Certificate", useHi:"शिक्षा सेवाएं",         useEn:"Education services",    icon:IC.scholar },
  { hi:"चिकित्सा प्रमाण",     en:"Medical Certificate",     useHi:"दिव्यांग, पेंशन",       useEn:"Divyang, pension",      icon:IC.pill2   },
];

// ══════════════════════════════════════════════════════════════════════════════
//  FONT SHORTHAND
// ══════════════════════════════════════════════════════════════════════════════
const F  = "'DM Sans','Noto Sans Devanagari','Segoe UI',system-ui,sans-serif";
const FM = "'DM Mono','Courier New',monospace";

// ══════════════════════════════════════════════════════════════════════════════
//  SHARED SUB-COMPONENTS
// ══════════════════════════════════════════════════════════════════════════════

function Card({ children, style = {}, className = "" }) {
  return (
    <div className={`hs-card ${className}`} style={style}>
      {children}
    </div>
  );
}

function SectionHead({ iconPath, titleHi, titleEn, sub, color = "#1558A0", isHi, senior }) {
  const scale = senior ? 1.20 : 1;
  return (
    <div style={{ display:"flex", alignItems:"center", gap:11, marginBottom:"clamp(13px,1.6vw,18px)" }}>
      <div style={{ width:4, height:38, borderRadius:3, background:`linear-gradient(180deg,${color},${color}80)`, flexShrink:0 }} />
      <div style={{ width:36, height:36, borderRadius:10, background:`${color}14`, border:`1.5px solid ${color}26`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
        <Ic path={iconPath} size={18} color={color} />
      </div>
      <div>
        <div style={{ fontFamily:F, fontSize:Math.round(15*scale), fontWeight:700, color:"#0A1828", lineHeight:1.25, letterSpacing:"-.01em" }}>
          {isHi ? titleHi : titleEn}
        </div>
        {sub && (
          <div style={{ fontFamily:F, fontSize:Math.round(10*scale), color:"#94A3B8", marginTop:2, fontWeight:500 }}>
            {sub}
          </div>
        )}
      </div>
    </div>
  );
}

function DataRow({ label, val, mono, last }) {
  return (
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"clamp(8px,1vw,11px) 0", borderBottom:last?"none":"1px solid #EDF2F7", gap:14 }}>
      <div style={{ fontFamily:F, fontSize:"clamp(12px,1.2vw,13px)", color:"#4A6070", fontWeight:500 }}>{label}</div>
      <span style={{ fontFamily:mono?FM:F, fontSize:"clamp(12px,1.2vw,13px)", fontWeight:700, color:mono?"#1558A0":"#18283A", letterSpacing:mono?".04em":"normal", textAlign:"right" }}>{val}</span>
    </div>
  );
}

function Dots({ count, active, activeColor }) {
  return (
    <div style={{ display:"flex", gap:4, flexShrink:0 }}>
      {Array.from({length:count}).map((_,i) => (
        <div key={i} style={{ width:i===active?16:6, height:6, borderRadius:999, background:i===active?activeColor:"#D4E0EC", transition:"width .4s,background .4s" }} />
      ))}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  LANGUAGE SCREEN
// ══════════════════════════════════════════════════════════════════════════════
export function LanguageScreen({ setLang, setScreen }) {
  const [tick, setTick] = useState(0);
  useEffect(() => { const id = setInterval(() => setTick(t => t+1), 1000); return () => clearInterval(id); }, []);

  const now = new Date();
  const timeStr = now.toLocaleTimeString("en-IN", { hour:"2-digit", minute:"2-digit", second:"2-digit", hour12:true });

  const pick = code => { setLang(code); setScreen("home"); };

  const EMERGENCY_PILLS = [
    { no:"112",  hiL:"आपातकाल",   enL:"Emergency",  icon:IC.shield, color:"#B91C1C", bg:"rgba(185,28,28,.16)" },
    { no:"1912", hiL:"बिजली",      enL:"Electricity",icon:IC.elec,   color:"#1558A0", bg:"rgba(21,88,160,.14)" },
    { no:"1906", hiL:"गैस",        enL:"Gas",        icon:IC.fire,   color:"#C25000", bg:"rgba(194,80,0,.14)"  },
    { no:"108",  hiL:"एम्बुलेंस", enL:"Ambulance",  icon:IC.hosp,   color:"#B91C1C", bg:"rgba(185,28,28,.14)" },
  ];

  return (
    <div style={{
      minHeight:"100vh", display:"flex", flexDirection:"column",
      alignItems:"center", justifyContent:"center",
      background:"linear-gradient(160deg,#050E1C 0%,#071828 50%,#091E35 100%)",
      padding:"clamp(32px,5vw,64px) clamp(24px,4vw,56px)",
      position:"relative", overflow:"hidden", fontFamily:F,
    }}>
      <style>{GLOBAL_CSS}</style>

      {/* Tricolor stripe */}
      <div style={{ position:"absolute", top:0, left:0, right:0, height:6, background:"linear-gradient(90deg,#FF9933 33.33%,#FFFFFF 33.33%,#FFFFFF 66.66%,#138808 66.66%)", zIndex:10 }} />
      <div style={{ position:"absolute", inset:0, pointerEvents:"none", opacity:.035, backgroundImage:"radial-gradient(circle,white 1px,transparent 1px)", backgroundSize:"30px 30px" }} />
      <div style={{ position:"absolute", inset:0, pointerEvents:"none", background:"radial-gradient(ellipse 60% 52% at 50% 40%,rgba(21,88,160,.20) 0%,transparent 70%)" }} />

      {/* Clock */}
      <div style={{ position:"absolute", top:24, right:28, textAlign:"right", zIndex:2 }}>
        <div style={{ fontFamily:FM, fontSize:"clamp(15px,2vw,22px)", fontWeight:700, color:"white", letterSpacing:".08em" }}>{timeStr}</div>
        <div style={{ fontFamily:F, fontSize:"clamp(9px,.9vw,11px)", color:"rgba(255,255,255,.26)", marginTop:4, lineHeight:1.8 }}>
          {getHindiDate()}<br />{getEnDate()}
        </div>
      </div>

      <div style={{ position:"relative", zIndex:1, display:"flex", flexDirection:"column", alignItems:"center", width:"100%", maxWidth:620 }}>

        {/* Shield emblem */}
        <div className="hs-s1" style={{ width:"clamp(68px,8.5vw,90px)", height:"clamp(68px,8.5vw,90px)", background:"linear-gradient(135deg,#1254A0,#1E7AD4)", borderRadius:"clamp(16px,2vw,22px)", display:"flex", alignItems:"center", justifyContent:"center", marginBottom:"clamp(18px,2.4vw,26px)", boxShadow:"0 10px 40px rgba(21,88,160,.45),0 2px 8px rgba(0,0,0,.3)" }}>
          <Ic path={IC.shield} size={42} color="white" />
        </div>

        <h1 className="hs-s2" style={{ fontFamily:F, fontSize:"clamp(38px,6.5vw,64px)", fontWeight:900, color:"white", letterSpacing:".12em", marginBottom:10, textAlign:"center", lineHeight:1 }}>SUVIDHA</h1>

        <p className="hs-s2" style={{ fontFamily:F, fontSize:"clamp(11px,1.3vw,14px)", color:"#4A6A8A", textAlign:"center", maxWidth:420, lineHeight:1.85, marginBottom:6 }}>
          Smart Urban Virtual Interactive Digital Helpdesk Assistant
        </p>

        <p className="hs-s3" style={{ fontFamily:F, fontSize:"clamp(9px,1vw,11px)", color:"#243A58", textAlign:"center", marginBottom:"clamp(22px,3vw,34px)", fontWeight:700, letterSpacing:".09em", textTransform:"uppercase" }}>
          C-DAC · MeitY · Government of India
        </p>

        {/* Scheme marquee */}
        <div className="hs-s3" style={{ width:"100%", background:"rgba(21,88,160,.13)", border:"1px solid rgba(21,88,160,.24)", borderRadius:10, padding:"clamp(8px,1vw,11px) 0", marginBottom:"clamp(24px,3vw,36px)", overflow:"hidden" }}>
          <div style={{ display:"flex", width:"max-content", animation:"hs-marq 36s linear infinite" }}>
            {[...SCHEMES,...SCHEMES].map((s,i) => (
              <span key={i} style={{ fontFamily:F, fontSize:"clamp(10px,1.2vw,13px)", color:"#93C5FD", fontWeight:600, whiteSpace:"nowrap", padding:"0 28px" }}>
                {s.hi} &nbsp;· &nbsp;{s.en} &nbsp;·
              </span>
            ))}
          </div>
        </div>

        {/* Language selection */}
        <div className="hs-s4" style={{ display:"flex", gap:"clamp(14px,2.2vw,24px)", flexWrap:"wrap", justifyContent:"center", width:"100%", marginBottom:"clamp(24px,3vw,34px)" }}>
          {[
            { code:"en", primaryLabel:"English",  line1:"Continue in English",  line2:"अंग्रेज़ी में जारी रखें" },
            { code:"hi", primaryLabel:"हिंदी",    line1:"हिंदी में जारी रखें", line2:"Continue in Hindi"        },
          ].map(l => (
            <button
              key={l.code}
              onClick={() => pick(l.code)}
              style={{
                background:"rgba(255,255,255,.055)",
                border:"1.5px solid rgba(255,255,255,.13)",
                borderRadius:"clamp(12px,1.6vw,18px)",
                cursor:"pointer", textAlign:"center", flex:1,
                minWidth:"clamp(148px,18vw,210px)", maxWidth:260,
                display:"flex", flexDirection:"column", alignItems:"center", gap:10,
                padding:"clamp(22px,3vw,36px) clamp(32px,5vw,60px)",
              }}
              onMouseEnter={e => { e.currentTarget.style.background="rgba(255,255,255,.10)"; e.currentTarget.style.borderColor="rgba(255,255,255,.26)"; }}
              onMouseLeave={e => { e.currentTarget.style.background="rgba(255,255,255,.055)"; e.currentTarget.style.borderColor="rgba(255,255,255,.13)"; }}
            >
              {/* Indian flag */}
              <div style={{ width:42, height:27, borderRadius:5, overflow:"hidden", display:"flex", flexDirection:"column", border:"1.5px solid rgba(255,255,255,.16)", flexShrink:0 }}>
                <div style={{ flex:1, background:"#FF9933" }} />
                <div style={{ flex:1, background:"white", display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <div style={{ width:8, height:8, borderRadius:"50%", border:"1.5px solid #000080" }} />
                </div>
                <div style={{ flex:1, background:"#138808" }} />
              </div>
              <span style={{ fontFamily:F, fontSize:"clamp(22px,3vw,32px)", fontWeight:900, color:"white", lineHeight:1.15 }}>{l.primaryLabel}</span>
              <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
                <span style={{ fontFamily:F, fontSize:"clamp(10px,1.15vw,13px)", color:"#4A7AAA", lineHeight:1.5 }}>{l.line1}</span>
                <span style={{ fontFamily:F, fontSize:"clamp(9px,1vw,11px)", color:"#2E4A68", lineHeight:1.4 }}>{l.line2}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Emergency pills */}
        <div className="hs-s5" style={{ display:"flex", gap:"clamp(6px,.9vw,10px)", flexWrap:"wrap", justifyContent:"center", marginBottom:28 }}>
          {EMERGENCY_PILLS.map(h => (
            <div key={h.no} style={{ display:"flex", alignItems:"center", gap:9, background:h.bg, border:`1px solid ${h.color}32`, borderRadius:10, padding:"clamp(7px,.9vw,10px) clamp(12px,1.5vw,16px)" }}>
              <div style={{ width:26, height:26, borderRadius:7, background:"rgba(255,255,255,.09)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                <Ic path={h.icon} size={14} color={h.color} />
              </div>
              <div>
                <div style={{ display:"flex", gap:5, alignItems:"center" }}>
                  <span style={{ fontFamily:F, fontSize:9, color:h.color, fontWeight:800, textTransform:"uppercase", letterSpacing:".08em" }}>{h.hiL}</span>
                  <span style={{ fontSize:8, color:"rgba(255,255,255,.2)" }}>·</span>
                  <span style={{ fontFamily:F, fontSize:9, color:"rgba(255,255,255,.35)", fontWeight:600 }}>{h.enL}</span>
                </div>
                <div style={{ fontFamily:FM, fontSize:"clamp(14px,1.7vw,18px)", fontWeight:800, color:h.color, lineHeight:1 }}>{h.no}</div>
              </div>
            </div>
          ))}
        </div>

        <p className="hs-s6" style={{ fontFamily:F, fontSize:"clamp(9px,.9vw,11px)", color:"#162540", textAlign:"center", letterSpacing:".03em" }}>
          Citizen Kiosk v2.0 &nbsp;·&nbsp; Helpline: 1800-180-6127 &nbsp;·&nbsp; {now.getFullYear()}
        </p>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  HOME SCREEN
// ══════════════════════════════════════════════════════════════════════════════
export function HomeScreen({ t, lang = "en", senior = false, setScreen, setDept, setFlow }) {
  const isHi = lang === "hi";
  const ef   = (base) => senior ? Math.round(base * 1.20) : base;

  const [alertIdx,   setAIdx]     = useState(0);
  const [schemeIdx,  setSIdx]     = useState(0);
  const [statusVal,  setStatusVal]= useState("");
  const [statusRes,  setStatusRes]= useState(null);
  const [feedback,   setFeedback] = useState(null);

  useEffect(() => {
    const t2 = setInterval(() => setAIdx(i => (i+1) % ALERTS_DATA.length), 4800);
    const t3 = setInterval(() => setSIdx(i => (i+1) % SCHEMES.length),     5500);
    return () => { clearInterval(t2); clearInterval(t3); };
  }, [lang]);

  const al    = ALERTS_DATA[alertIdx];
  const sc    = SCHEMES[schemeIdx];
  const alAcc = al.type==="warn" ? "#92400E" : al.type==="green" ? "#065F46" : "#1E40AF";
  const alBg  = al.type==="warn" ? "#FFFBEB" : al.type==="green" ? "#ECFDF5" : "#EFF6FF";
  const alBd  = al.type==="warn" ? "#FCD34D" : al.type==="green" ? "#6EE7B7" : "#BFDBFE";
  const alIco = al.type==="warn" ? IC.warn   : al.type==="green" ? IC.check  : IC.info2;

  const doStatus = () => {
    if (!statusVal.trim()) return;
    setStatusRes({
      ref:         statusVal.trim(),
      dept:        isHi ? "नगर पालिका" : "Municipal Corp.",
      date:        "15 Mar 2025",
      statusLabel: isHi ? "समीक्षाधीन" : "Under Review",
    });
  };

  const rateLabels = isHi ? ["खराब","ठीक","अच्छा","बेहतरीन"] : ["Poor","OK","Good","Excellent"];
  const rateAlt    = isHi ? ["Poor","OK","Good","Excellent"]   : ["खराब","ठीक","अच्छा","बेहतरीन"];

  return (
    <div style={{ fontFamily:F, background:"#EEF2F7", minHeight:"100vh" }}>
      <style>{GLOBAL_CSS}</style>

      {/* MAX-WIDTH CENTERED WRAPPER */}
      <div style={{ maxWidth:1320, margin:"0 auto", padding:"clamp(14px,2vw,26px) clamp(14px,2.5vw,36px)" }}>

        {/* ════════════════════════════════════════════════════════════
            1. STATUS / DATE BAR
        ════════════════════════════════════════════════════════════ */}
        <div className="hs-s1" style={{
          background:"linear-gradient(135deg,#060F1E 0%,#0C2040 55%,#1558A018 100%)",
          border:"1px solid #1558A028",
          borderBottom:"4px solid #E8750A",
          borderRadius:16,
          padding:"clamp(14px,1.8vw,20px) clamp(18px,2.2vw,28px)",
          marginBottom:14,
          display:"flex", justifyContent:"space-between", alignItems:"center",
          gap:14, flexWrap:"wrap",
          boxShadow:"0 6px 24px rgba(6,15,30,.28)",
          position:"relative", overflow:"hidden",
        }}>
          <div style={{ position:"absolute", inset:0, pointerEvents:"none", opacity:.04, backgroundImage:"radial-gradient(circle,white 1px,transparent 1px)", backgroundSize:"26px 26px" }} />

          {/* Left: Date + live */}
          <div style={{ position:"relative", zIndex:1 }}>
            <div style={{ fontFamily:F, fontSize:ef(11), color:"rgba(255,255,255,.34)", fontWeight:600, letterSpacing:".07em", textTransform:"uppercase", marginBottom:5 }}>
              {isHi ? getHindiDate() : getEnDate()}
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
              <div style={{ width:8, height:8, borderRadius:"50%", background:"#16A34A", animation:"hs-dot 1.7s ease-in-out infinite", flexShrink:0 }} />
              <span style={{ fontFamily:F, fontSize:ef(11), color:"rgba(255,255,255,.40)", fontWeight:700, letterSpacing:".06em", textTransform:"uppercase" }}>
                {isHi ? "सेवाएं सक्रिय हैं" : "Services Active"}
              </span>
            </div>
            {/* Tricolor accent */}
            <div style={{ display:"flex", gap:4 }}>
              <div style={{ width:16, height:4, borderRadius:2, background:"#FF9933" }} />
              <div style={{ width:16, height:4, borderRadius:2, background:"white" }} />
              <div style={{ width:16, height:4, borderRadius:2, background:"#138808" }} />
            </div>
          </div>

          {/* Right: Weather + Elder badge */}
          <div style={{ display:"flex", gap:9, alignItems:"center", position:"relative", zIndex:1 }}>
            {senior && (
              <div style={{ background:"rgba(234,179,8,.18)", border:"1.5px solid rgba(234,179,8,.36)", borderRadius:10, padding:"clamp(8px,1vw,11px) clamp(13px,1.6vw,18px)", textAlign:"center" }}>
                <div style={{ display:"flex", justifyContent:"center", marginBottom:4 }}><Ic path={IC.senior} size={18} color="#FCD34D" /></div>
                <div style={{ fontFamily:F, fontSize:ef(9), color:"#FCD34D", fontWeight:800, letterSpacing:".06em", textAlign:"center", whiteSpace:"nowrap", lineHeight:1.5 }}>
                  {isHi ? "बड़ा अक्षर · ON" : "Large Text · ON"}
                </div>
              </div>
            )}
            <div style={{ background:"rgba(255,255,255,.09)", border:"1px solid rgba(255,255,255,.14)", borderRadius:10, padding:"clamp(8px,1vw,11px) clamp(13px,1.6vw,18px)", textAlign:"center", minWidth:72 }}>
              <div style={{ display:"flex", justifyContent:"center", marginBottom:4 }}><Ic path={IC.sun} size={18} color="#FCD34D" /></div>
              <div style={{ fontFamily:FM, fontSize:ef(18), fontWeight:700, color:"white", lineHeight:1 }}>28°C</div>
              <div style={{ fontFamily:F, fontSize:8, color:"rgba(255,255,255,.28)", fontWeight:700, letterSpacing:".08em", textTransform:"uppercase", marginTop:3 }}>
                {isHi ? "अजमेर" : "AJMER"}
              </div>
            </div>
          </div>
        </div>

        {/* ════════════════════════════════════════════════════════════
            2. ALERT BANNER
        ════════════════════════════════════════════════════════════ */}
        <div
          key={`alert-${alertIdx}-${lang}`}
          className="hs-s2"
          style={{
            background:alBg, border:`1.5px solid ${alBd}`, borderRadius:12,
            padding:"clamp(11px,1.4vw,15px) clamp(14px,1.8vw,22px)",
            marginBottom:11, display:"flex", alignItems:"center", gap:13,
            animation:"hs-fadein .38s ease",
          }}
        >
          <div style={{ width:4, height:40, borderRadius:3, background:alAcc, flexShrink:0 }} />
          <div style={{ width:36, height:36, borderRadius:10, background:`${alAcc}16`, border:`1.5px solid ${alAcc}28`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
            <Ic path={alIco} size={17} color={alAcc} />
          </div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontFamily:F, fontSize:ef(14), fontWeight:700, color:alAcc, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
              {isHi ? al.hi : al.en}
            </div>
            <div style={{ fontFamily:F, fontSize:ef(11), color:"#64748B", marginTop:2, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
              {isHi ? al.en : al.hi}
            </div>
          </div>
          <Dots count={ALERTS_DATA.length} active={alertIdx} activeColor={alAcc} />
        </div>

        {/* ════════════════════════════════════════════════════════════
            3. SCHEME TICKER
        ════════════════════════════════════════════════════════════ */}
        <div
          key={`scheme-${schemeIdx}-${lang}`}
          className="hs-s2"
          style={{
            background:"#FFFBEB", border:"1.5px solid #FDE68A", borderRadius:12,
            padding:"clamp(11px,1.4vw,15px) clamp(14px,1.8vw,22px)",
            marginBottom:16, display:"flex", gap:13, alignItems:"center",
            animation:"hs-fadein .38s ease",
          }}
        >
          <div style={{ width:4, height:40, borderRadius:3, background:"#92400E", flexShrink:0 }} />
          <div style={{ width:36, height:36, borderRadius:10, background:"rgba(217,119,6,.15)", border:"1px solid rgba(217,119,6,.28)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
            <Ic path={IC.medal} size={17} color="#B45309" />
          </div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontFamily:F, fontSize:9, fontWeight:800, color:"#92400E", letterSpacing:".12em", textTransform:"uppercase", marginBottom:3 }}>
              {isHi ? "सरकारी योजना · GOVT SCHEME" : "GOVT SCHEME · सरकारी योजना"}
            </div>
            <div style={{ fontFamily:F, fontSize:ef(14), fontWeight:700, color:"#0A1828", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
              {isHi ? sc.hi : sc.en}
            </div>
            <div style={{ fontFamily:F, fontSize:ef(11), color:"#78716C", marginTop:2, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
              {isHi ? sc.en : sc.hi}
            </div>
          </div>
          <Dots count={SCHEMES.length} active={schemeIdx} activeColor="#B45309" />
        </div>

        {/* ════════════════════════════════════════════════════════════
            4. DEPARTMENT GRID  (2 × 2)
        ════════════════════════════════════════════════════════════ */}
        <div className="hs-dept-grid hs-s3">
          {Object.entries(DEPT_CONFIG).map(([key, dc]) => (
            <button key={key} className="hs-dept-card" onClick={() => { setDept && setDept(key); setScreen("dept"); }}>

              {/* Color top bar */}
              <div style={{ height:5, background:dc.topBar, flexShrink:0 }} />

              <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-start", padding:"clamp(16px,2vw,24px) clamp(14px,1.8vw,22px) clamp(14px,1.8vw,22px)", gap:"clamp(10px,1.3vw,15px)", flex:1 }}>

                {/* Dept icon bubble */}
                <div style={{ width:ef(54), height:ef(54), borderRadius:14, background:dc.light, border:`1.5px solid ${dc.color}20`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                  <Ic path={dc.icon} size={ef(28)} color={dc.color} />
                </div>

                {/* Name + subtitle */}
                <div style={{ flex:1 }}>
                  <div style={{ fontFamily:F, fontSize:ef(19), fontWeight:800, color:"#0A1828", marginBottom:5, lineHeight:1.2, letterSpacing:"-.01em" }}>
                    {isHi ? dc.nameHi : dc.nameEn}
                  </div>
                  <div style={{ fontFamily:F, fontSize:ef(12), color:"#334E68", lineHeight:1.7, fontWeight:500 }}>
                    {isHi ? dc.subHi : dc.subEn}
                  </div>
                  <div style={{ fontFamily:F, fontSize:ef(11), color:"#94A3B8", lineHeight:1.5, marginTop:2 }}>
                    {isHi ? dc.subEn : dc.subHi}
                  </div>
                </div>

                {/* CTA */}
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", width:"100%", marginTop:"auto", paddingTop:10, borderTop:`1px solid ${dc.color}18` }}>
                  <span style={{ fontFamily:F, fontSize:ef(12), fontWeight:700, color:dc.color, display:"flex", alignItems:"center", gap:5 }}>
                    {isHi ? "सेवाएं देखें" : "View Services"}
                    <Ic path={IC.chevR} size={14} color={dc.color} />
                  </span>
                  <div style={{ width:32, height:32, borderRadius:8, background:`${dc.color}12`, border:`1.5px solid ${dc.color}22`, display:"flex", alignItems:"center", justifyContent:"center" }}>
                    <Ic path={IC.chevR} size={14} color={dc.color} />
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* ════════════════════════════════════════════════════════════
            5. QUICK SERVICES  (4 × 2 grid)
        ════════════════════════════════════════════════════════════ */}
        <Card className="hs-s4">
          <SectionHead
            iconPath={IC.elec}
            titleHi="त्वरित सरकारी सेवाएं"
            titleEn="Quick Government Services"
            sub={isHi ? "तुरंत पहुंच के लिए टैप करें" : "Tap for instant access"}
            color="#1558A0" isHi={isHi} senior={senior}
          />
          <div className="hs-svc-grid">
            {QUICK_SVCS.map((sv, i) => (
              <button
                key={i}
                className="hs-svc-btn"
                style={{ background:sv.bg, borderColor:`${sv.color}22` }}
                onClick={() => {
                  if (sv.screen) { setScreen(sv.screen); return; }
                  if (sv.flow && setFlow) { setFlow({ subType:sv.flow }); setScreen("flow"); }
                }}
              >
                <div style={{ width:ef(44), height:ef(44), borderRadius:12, background:"white", border:`1.5px solid ${sv.color}24`, display:"flex", alignItems:"center", justifyContent:"center", boxShadow:`0 2px 8px ${sv.color}18` }}>
                  <Ic path={sv.icon} size={ef(20)} color={sv.color} />
                </div>
                <div style={{ fontFamily:F, fontSize:ef(12), fontWeight:700, color:sv.color, lineHeight:1.3, textAlign:"center" }}>
                  {isHi ? sv.hi : sv.en}
                </div>
                <div style={{ fontFamily:F, fontSize:ef(10), color:"#64748B", lineHeight:1.3, textAlign:"center" }}>
                  {isHi ? sv.en : sv.hi}
                </div>
              </button>
            ))}
          </div>
        </Card>

        {/* ════════════════════════════════════════════════════════════
            6. APPLICATION STATUS TRACKER
        ════════════════════════════════════════════════════════════ */}
        <Card className="hs-s5">
          <SectionHead
            iconPath={IC.search}
            titleHi="आवेदन की स्थिति जांचें"
            titleEn="Track Your Application"
            sub={isHi ? "संदर्भ क्रमांक दर्ज करके स्थिति देखें" : "Enter reference number to check status"}
            color="#1558A0" isHi={isHi} senior={senior}
          />
          {!statusRes ? (
            <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
              <input
                className="hs-input"
                value={statusVal}
                onChange={e => setStatusVal(e.target.value)}
                onKeyDown={e => e.key==="Enter" && doStatus()}
                placeholder={isHi ? "Application / Reference No. दर्ज करें" : "Enter Application / Reference No."}
                style={{ fontSize:ef(14) }}
              />
              <button onClick={doStatus} style={{
                height:"clamp(46px,5.4vw,56px)", minWidth:"clamp(100px,10vw,124px)",
                background:"linear-gradient(135deg,#1254A0,#1E7AD4)", border:"none",
                borderRadius:9, color:"white", fontFamily:F, fontSize:ef(14), fontWeight:700,
                cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:7,
                boxShadow:"0 3px 12px rgba(21,88,160,.30)", whiteSpace:"nowrap",
              }}>
                <Ic path={IC.search} size={15} color="white" />
                {isHi ? "जांचें" : "Search"}
              </button>
            </div>
          ) : (
            <div style={{ background:"#ECFDF5", border:"1.5px solid #6EE7B7", borderRadius:12, padding:"clamp(13px,1.7vw,19px)" }}>
              <div style={{ display:"flex", gap:12, alignItems:"flex-start", marginBottom:14 }}>
                <div style={{ width:34, height:34, borderRadius:9, background:"#D1FAE5", border:"1.5px solid #6EE7B7", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                  <Ic path={IC.check} size={17} color="#065F46" />
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontFamily:F, fontSize:ef(15), fontWeight:700, color:"#065F46", marginBottom:10 }}>
                    {isHi ? "आवेदन मिल गया" : "Application Found"}
                  </div>
                  <DataRow label={isHi?"संदर्भ क्रमांक":"Reference No."} val={statusRes.ref}         mono />
                  <DataRow label={isHi?"विभाग":"Department"}              val={statusRes.dept}              />
                  <DataRow label={isHi?"दिनांक":"Date"}                   val={statusRes.date}              />
                  <DataRow label={isHi?"स्थिति":"Status"}                 val={statusRes.statusLabel}  last />
                </div>
              </div>
              <button
                onClick={() => { setStatusRes(null); setStatusVal(""); }}
                style={{ background:"none", border:"1.5px solid #6EE7B7", borderRadius:8, padding:"7px 18px", cursor:"pointer", fontFamily:F, fontSize:ef(12), color:"#065F46", fontWeight:700 }}
              >
                {isHi ? "← वापस" : "← Back"}
              </button>
            </div>
          )}
        </Card>

        {/* ════════════════════════════════════════════════════════════
            7. TWO-COL: HEALTH  +  (BUS + JAN AUSHADHI)
        ════════════════════════════════════════════════════════════ */}
        <div className="hs-two-col hs-s6">

          {/* NEARBY HEALTH */}
          <Card style={{ marginBottom:0 }}>
            <SectionHead
              iconPath={IC.hosp}
              titleHi="नजदीकी स्वास्थ्य सेवाएं"
              titleEn="Nearby Health Services"
              color="#B91C1C" isHi={isHi} senior={senior}
            />
            <div style={{ display:"flex", flexDirection:"column", gap:9 }}>
              {HEALTH.map((h, i) => (
                <div key={i} style={{
                  display:"flex", gap:11, alignItems:"flex-start",
                  padding:"clamp(9px,1.1vw,13px)", borderRadius:10,
                  background: h.urgent?"#FEF2F2":h.medicine?"#ECFDF5":"#F8FAFC",
                  border:`1.5px solid ${h.urgent?"#FECACA":h.medicine?"#6EE7B7":"#E2E8F0"}`,
                }}>
                  <div style={{ width:34, height:34, borderRadius:9, flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center", background:h.urgent?"#FEE2E2":h.medicine?"#D1FAE5":"#EBF4FF", border:`1.5px solid ${h.urgent?"#FCA5A5":h.medicine?"#6EE7B7":"#BFDBF7"}` }}>
                    <Ic path={h.medicine?IC.pill2:IC.hosp} size={16} color={h.urgent?"#DC2626":h.medicine?"#065F46":"#1558A0"} />
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontFamily:F, fontSize:ef(13), fontWeight:700, color:"#0A1828", lineHeight:1.25 }}>
                      {isHi ? h.hi : h.en}
                    </div>
                    <div style={{ fontFamily:F, fontSize:ef(11), color:"#64748B", marginTop:2 }}>
                      {isHi ? h.en : h.hi}
                    </div>
                    <div style={{ display:"flex", gap:10, marginTop:6, flexWrap:"wrap", alignItems:"center" }}>
                      <span style={{ fontFamily:F, fontSize:ef(11), color:h.urgent?"#DC2626":"#16A34A", fontWeight:700, display:"flex", alignItems:"center", gap:4 }}>
                        <Ic path={IC.locate} size={11} color={h.urgent?"#DC2626":"#16A34A"} />{h.dist}
                      </span>
                      <span style={{ fontFamily:FM, fontSize:ef(11), color:"#1558A0", fontWeight:600 }}>{h.phone}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* BUS + JAN AUSHADHI stack */}
          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>

            {/* LIVE BUS ROUTES */}
            <Card style={{ marginBottom:0, flex:1 }}>
              <SectionHead
                iconPath={IC.bus}
                titleHi="नजदीकी बस मार्ग"
                titleEn="Live Bus Routes"
                color="#0A2342" isHi={isHi} senior={senior}
              />
              <div style={{ display:"flex", flexDirection:"column", gap:9 }}>
                {BUSES.map((b, i) => (
                  <div key={i} style={{ display:"flex", gap:11, alignItems:"center", padding:"clamp(9px,1.1vw,13px)", background:"#F8FAFC", border:"1.5px solid #E2E8F0", borderRadius:10 }}>
                    <div style={{ width:42, height:42, borderRadius:11, background:b.color, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, boxShadow:`0 3px 10px ${b.color}32` }}>
                      <span style={{ fontFamily:FM, fontSize:ef(12), fontWeight:800, color:"white" }}>{b.no}</span>
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontFamily:F, fontSize:ef(13), fontWeight:700, color:"#0A1828", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
                        {isHi ? `${b.fromHi} → ${b.toHi}` : `${b.fromEn} → ${b.toEn}`}
                      </div>
                      <div style={{ fontFamily:F, fontSize:ef(11), color:"#64748B", marginTop:1, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
                        {isHi ? `${b.fromEn} → ${b.toEn}` : `${b.fromHi} → ${b.toHi}`}
                      </div>
                      <div style={{ display:"flex", alignItems:"center", gap:6, marginTop:5 }}>
                        <div style={{ width:7, height:7, borderRadius:"50%", background:"#16A34A", animation:"hs-dot 1.5s ease-in-out infinite", flexShrink:0 }} />
                        <span style={{ fontFamily:F, fontSize:ef(11), color:"#16A34A", fontWeight:700 }}>
                          {isHi ? `अगली बस: ${b.nextHi}` : `Next: ${b.nextEn}`}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* JAN AUSHADHI */}
            <div style={{ background:"linear-gradient(135deg,#ECFDF5,#F0FFF4)", border:"1.5px solid #6EE7B7", borderRadius:14, padding:"clamp(13px,1.6vw,18px)", display:"flex", gap:13, alignItems:"flex-start" }}>
              <div style={{ width:48, height:48, borderRadius:13, background:"#D1FAE5", border:"1.5px solid #6EE7B7", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, boxShadow:"0 3px 10px rgba(6,95,70,.14)" }}>
                <Ic path={IC.pill2} size={24} color="#065F46" />
              </div>
              <div>
                <div style={{ fontFamily:F, fontSize:ef(14), fontWeight:800, color:"#065F46", marginBottom:5, display:"flex", alignItems:"center", gap:10, flexWrap:"wrap" }}>
                  {isHi ? "जन औषधि केंद्र" : "Jan Aushadhi Kendra"}
                  <span style={{ background:"#D1FAE5", border:"1px solid #6EE7B7", borderRadius:5, padding:"2px 9px", fontSize:9, fontWeight:800, color:"#065F46", letterSpacing:".08em" }}>
                    {isHi ? "खुला है" : "OPEN"}
                  </span>
                </div>
                <div style={{ fontFamily:F, fontSize:ef(12), color:"#374151", lineHeight:1.65 }}>
                  {isHi ? "सस्ती जेनेरिक दवाइयां उपलब्ध" : "Affordable generic medicines available"}
                </div>
                <div style={{ fontFamily:F, fontSize:ef(12), color:"#6B7280", marginTop:2 }}>
                  {isHi ? "50–90% सस्ती · Generic medicines" : "50–90% cheaper · सस्ती दवाइयां"}
                </div>
                <div style={{ fontFamily:F, fontSize:ef(11), color:"#16A34A", marginTop:7, display:"flex", alignItems:"center", gap:5, fontWeight:600 }}>
                  <Ic path={IC.locate} size={11} color="#16A34A" />
                  0.3 km
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ════════════════════════════════════════════════════════════
            8. HELPLINES  (4-col grid)
        ════════════════════════════════════════════════════════════ */}
        <Card className="hs-s7">
          <SectionHead
            iconPath={IC.phone}
            titleHi="जिला आपातकालीन हेल्पलाइन"
            titleEn="District Emergency Helplines"
            sub={isHi ? "छूकर कॉल करें" : "Tap to call"}
            color="#B91C1C" isHi={isHi} senior={senior}
          />
          <div className="hs-help-grid">
            {HELPLINES.map((h, i) => (
              <div key={i} className="hs-help-card" style={{ background:h.bg, borderColor:`${h.color}28`, color:h.color }}>
                <div style={{ width:34, height:34, borderRadius:9, background:"white", border:`1.5px solid ${h.color}22`, display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <Ic path={h.icon} size={17} color={h.color} />
                </div>
                <div style={{ fontFamily:F, fontSize:ef(12), fontWeight:700, color:"#0A1828", lineHeight:1.25, marginTop:3 }}>
                  {isHi ? h.hi : h.en}
                </div>
                <div style={{ fontFamily:F, fontSize:ef(10), color:"#64748B", lineHeight:1.25 }}>
                  {isHi ? h.en : h.hi}
                </div>
                <div style={{ fontFamily:FM, fontSize:ef(16), fontWeight:800, color:h.color, marginTop:4, letterSpacing:".02em", lineHeight:1 }}>
                  {h.no}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* ════════════════════════════════════════════════════════════
            9. COMMONLY REQUIRED DOCUMENTS
        ════════════════════════════════════════════════════════════ */}
        <Card className="hs-s8">
          <SectionHead
            iconPath={IC.doc}
            titleHi="अक्सर लगने वाले दस्तावेज़"
            titleEn="Commonly Required Documents"
            sub={isHi ? "कार्यालय जाने से पहले ये तैयार रखें" : "Keep these ready before visiting any office"}
            color="#0A2342" isHi={isHi} senior={senior}
          />
          <div className="hs-doc-grid">
            {DOCS.map((d, i) => (
              <div key={i} style={{ display:"flex", gap:11, alignItems:"center", padding:"clamp(10px,1.2vw,14px)", background:"#F8FAFC", border:"1.5px solid #E2E8F0", borderRadius:11 }}>
                <div style={{ width:38, height:38, borderRadius:10, background:"#EBF4FF", border:"1.5px solid #BFDBF7", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                  <Ic path={d.icon} size={18} color="#1558A0" />
                </div>
                <div style={{ minWidth:0 }}>
                  <div style={{ fontFamily:F, fontSize:ef(13), fontWeight:700, color:"#0A1828" }}>
                    {isHi ? d.hi : d.en}
                  </div>
                  <div style={{ fontFamily:F, fontSize:ef(11), color:"#64748B", marginTop:2, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
                    {isHi ? `${d.en} · ${d.useHi}` : `${d.hi} · ${d.useEn}`}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* ════════════════════════════════════════════════════════════
            10. FEEDBACK
        ════════════════════════════════════════════════════════════ */}
        <div className="hs-s9" style={{
          background:"linear-gradient(135deg,#060F1E 0%,#0C2040 55%,#1558A018 100%)",
          border:"1px solid #1558A028",
          borderRadius:16,
          padding:"clamp(18px,2.2vw,26px) clamp(20px,2.4vw,30px)",
          display:"flex", justifyContent:"space-between", alignItems:"center",
          boxShadow:"0 6px 24px rgba(6,15,30,.26)", flexWrap:"wrap", gap:18,
          position:"relative", overflow:"hidden",
        }}>
          <div style={{ position:"absolute", inset:0, pointerEvents:"none", opacity:.04, backgroundImage:"radial-gradient(circle,white 1px,transparent 1px)", backgroundSize:"26px 26px" }} />

          <div style={{ position:"relative", zIndex:1, display:"flex", alignItems:"flex-start", gap:12 }}>
            <div style={{ width:4, height:46, borderRadius:3, background:"linear-gradient(180deg,#E8750A,#F97316)", flexShrink:0, marginTop:2 }} />
            <div>
              <div style={{ fontFamily:F, fontSize:ef(17), fontWeight:700, color:"white", marginBottom:5, lineHeight:1.3 }}>
                {feedback
                  ? `${feedback} — ${isHi ? "आपकी प्रतिक्रिया के लिए धन्यवाद!" : "Thank you for your feedback!"}`
                  : (isHi ? "आपका अनुभव कैसा रहा?" : "Rate Your Experience")}
              </div>
              <div style={{ fontFamily:F, fontSize:ef(12), color:"rgba(255,255,255,.38)" }}>
                {isHi
                  ? "आपकी प्रतिक्रिया सेवाएं बेहतर बनाने में मदद करती है"
                  : "Your feedback helps us improve our services"}
              </div>
            </div>
          </div>

          {!feedback && (
            <div style={{ display:"flex", gap:7, position:"relative", zIndex:1, flexWrap:"wrap" }}>
              {rateLabels.map((r, i) => (
                <button key={r} className="hs-fb-btn" onClick={() => setFeedback(r)}>
                  <div style={{ display:"flex", gap:2 }}>
                    {Array.from({length:i+1}).map((_,j) => (
                      <Ic key={j} path={IC.medal} size={10} color="#FCD34D" />
                    ))}
                    {Array.from({length:3-i}).map((_,j) => (
                      <Ic key={`e${j}`} path={IC.medal} size={10} color="rgba(255,255,255,.18)" />
                    ))}
                  </div>
                  <span style={{ fontFamily:F, fontSize:ef(11), fontWeight:700, color:"white", lineHeight:1.3 }}>{r}</span>
                  <span style={{ fontFamily:F, fontSize:9, color:"rgba(255,255,255,.36)", lineHeight:1 }}>{rateAlt[i]}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ════════════════════════════════════════════════════════════
            FOOTER
        ════════════════════════════════════════════════════════════ */}
        <div style={{ marginTop:20, paddingBottom:12, display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:9 }}>
          <div style={{ display:"flex", alignItems:"center", gap:7 }}>
            <Ic path={IC.shield} size={13} color="#16A34A" />
            <span style={{ fontFamily:F, fontSize:ef(11), color:"#7A96B0", fontWeight:600 }}>
              {isHi ? "सुरक्षित · सरकारी पोर्टल · C-DAC" : "Secure · Government Portal · C-DAC"}
            </span>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:7 }}>
            <div style={{ width:7, height:7, borderRadius:"50%", background:"#16A34A", animation:"hs-pulse 2.2s infinite" }} />
            <span style={{ fontFamily:F, fontSize:ef(10), color:"#94A3B8" }}>
              SUVIDHA Kiosk v2.0 · MeitY · 24×7
            </span>
          </div>
        </div>

      </div>{/* end max-width wrapper */}
    </div>
  );
}