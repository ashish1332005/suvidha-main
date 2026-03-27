// /**
//  * constants.js
//  * ─────────────────────────────────────────────────────────────────
//  * Shared across TopBar.jsx, HomeScreen.jsx, LanguageScreen.jsx
//  * • GLOBAL_CSS   — CSS variables, animations, grid helpers
//  * • I            — SVG icon path strings
//  * • DATA         — all kiosk content (alerts, schemes, depts…)
//  * • HELPERS      — date/clock utilities, useClock hook
//  * • Ic           — SVG icon component
//  * • SuvidhaLogo  — brand chakra mark
//  */

// import { useState, useEffect } from "react";

// // ═══════════════════════════════════════════════════════════════
// //  GLOBAL CSS
// // ═══════════════════════════════════════════════════════════════
// export const GLOBAL_CSS = `
//   @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;600;700&family=Noto+Sans+Devanagari:wght@400;500;600;700;800&display=swap');

//   *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

//   :root {
//     --navy:      #06172B;
//     --navy2:     #0A2240;
//     --navy3:     #0D2D50;
//     --blue:      #1355A0;
//     --blue2:     #1A6BC7;
//     --accent:    #F97316;
//     --accent2:   #FFAD60;
//     --green:     #15803D;
//     --green2:    #22C55E;
//     --red:       #B91C1C;
//     --red2:      #EF4444;
//     --amber:     #B45309;
//     --amber2:    #F59E0B;
//     --surface:   #F1F5FA;
//     --card:      #FFFFFF;
//     --border:    #D1DFEF;
//     --text1:     #0A1828;
//     --text2:     #4A6070;
//     --text3:     #8AA0B4;
//     --hi-font:   'Noto Sans Devanagari', sans-serif;
//     --en-font:   'Baloo 2', sans-serif;
//     --mono:      'JetBrains Mono', monospace;
//     --shadow-sm: 0 1px 4px  rgba(6,23,43,.07);
//     --shadow-md: 0 4px 16px rgba(6,23,43,.10);
//     --shadow-lg: 0 8px 32px rgba(6,23,43,.14);
//   }

//   html { scroll-behavior: smooth; }
//   body { background: var(--surface); }

//   button { cursor: pointer; }
//   button:active { transform: scale(.97); }

//   /* ── Animations ── */
//   @keyframes fadeUp   { from { opacity:0; transform:translateY(12px) } to { opacity:1; transform:translateY(0) } }
//   @keyframes fadeIn   { from { opacity:0 } to { opacity:1 } }
//   @keyframes pulse    { 0%,100% { opacity:1 } 50% { opacity:.35 } }
//   @keyframes slide    { 0% { transform:translateX(0) } 100% { transform:translateX(-50%) } }
//   @keyframes dotPulse { 0%   { box-shadow:0 0 0 0   rgba(34,197,94,.5) }
//                         70%  { box-shadow:0 0 0 7px  rgba(34,197,94,0)  }
//                         100% { box-shadow:0 0 0 0   rgba(34,197,94,0)  } }

//   .fade-up   { animation: fadeUp .38s             cubic-bezier(.22,1,.36,1) both; }
//   .fade-up-1 { animation: fadeUp .38s  .05s       cubic-bezier(.22,1,.36,1) both; }
//   .fade-up-2 { animation: fadeUp .38s  .10s       cubic-bezier(.22,1,.36,1) both; }
//   .fade-up-3 { animation: fadeUp .38s  .15s       cubic-bezier(.22,1,.36,1) both; }
//   .fade-up-4 { animation: fadeUp .38s  .20s       cubic-bezier(.22,1,.36,1) both; }
//   .fade-up-5 { animation: fadeUp .38s  .25s       cubic-bezier(.22,1,.36,1) both; }

//   .live-dot  { animation: pulse    1.6s ease-in-out infinite; }
//   .green-dot { animation: dotPulse 1.6s ease-in-out infinite; }

//   /* ── Scrollbar ── */
//   ::-webkit-scrollbar       { width: 6px; }
//   ::-webkit-scrollbar-track { background: transparent; }
//   ::-webkit-scrollbar-thumb { background: #B0C4D8; border-radius: 99px; }

//   /* ── Layout grids ── */
//   .dept-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:clamp(8px,1vw,14px); }
//   .svc-grid  { display:grid; grid-template-columns:repeat(4,1fr); gap:clamp(7px,.9vw,12px); }
//   .help-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:clamp(7px,.9vw,12px); }
//   .doc-grid  { display:grid; grid-template-columns:repeat(2,1fr); gap:8px; }
//   .two-col   { display:grid; grid-template-columns:1fr 1fr; gap:14px; margin-bottom:14px; }

//   @media (max-width:900px) {
//     .dept-grid { grid-template-columns:repeat(2,1fr) !important; }
//     .help-grid { grid-template-columns:repeat(3,1fr) !important; }
//     .two-col   { grid-template-columns:1fr !important; }
//   }
//   @media (max-width:600px) {
//     .dept-grid { grid-template-columns:repeat(2,1fr) !important; }
//     .svc-grid  { grid-template-columns:repeat(2,1fr) !important; }
//     .help-grid { grid-template-columns:repeat(2,1fr) !important; }
//     .doc-grid  { grid-template-columns:1fr !important; }
//     .two-col   { grid-template-columns:1fr !important; }
//   }
// `;

// // ═══════════════════════════════════════════════════════════════
// //  SVG ICON PATHS
// // ═══════════════════════════════════════════════════════════════
// export const I = {
//   home:    "M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z",
//   large:   "M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z",
//   lang:    "M12.87 15.07l-2.54-2.51.03-.03c1.74-1.94 2.98-4.17 3.71-6.53H17V4h-7V2H8v2H1v1.99h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z",
//   shield:  "M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z",
//   elec:    "M7 2v11h3v9l7-12h-4l4-8z",
//   gas:     "M12 2C12 2 9 7 9 11C9 11 7 9.5 7 7.5C5 10 4 13 4 15C4 19.42 7.58 23 12 23C16.42 23 20 19.42 20 15C20 10 12 2 12 2Z",
//   muni:    "M2 20V8L12 2L22 8V20H16V14H8V20H2Z",
//   info:    "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z",
//   search:  "M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z",
//   bus:     "M4 16c0 .88.39 1.67 1 2.22V20c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h8v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1.78c.61-.55 1-1.34 1-2.22V6c0-3.5-3.58-4-8-4s-8 .5-8 4v10zm3.5 1c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm9 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm1.5-6H6V6h12v5z",
//   hosp:    "M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm7 13H5v-.23c0-.62.28-1.2.76-1.58C7.47 15.82 9.64 15 12 15s4.53.82 6.24 2.19c.48.38.76.97.76 1.58V19z",
//   pill:    "M20.49 3.51c-1.96-1.96-5.13-1.96-7.09 0L3.51 13.41c-1.96 1.96-1.96 5.13 0 7.09 1.96 1.96 5.13 1.96 7.09 0l9.89-9.89c1.96-1.97 1.96-5.14 0-7.1zm-14.14 15.2c-1.18-1.18-1.18-3.09 0-4.24L9 11.83l4.24 4.24-2.65 2.65c-1.18 1.17-3.09 1.17-4.24-.01zM19.07 9.17L15.83 12 11.59 7.76l3.24-3.24c1.18-1.18 3.09-1.18 4.24 0 1.18 1.17 1.18 3.08 0 4.65z",
//   doc:     "M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z",
//   warn:    "M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z",
//   check:   "M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z",
//   locate:  "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z",
//   sun:     "M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0 .39-.39.39-1.03 0-1.41l-1.06-1.06zm1.06-12.37l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06c.39-.39.39-1.03 0-1.41s-1.03-.39-1.41 0zM7.05 18.36l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06c.39-.39.39-1.03 0-1.41s-1.03-.39-1.41 0z",
//   phone:   "M6.62 10.79C8.06 13.62 10.38 15.93 13.21 17.38L15.41 15.18C15.68 14.91 16.08 14.82 16.43 14.94C17.55 15.31 18.76 15.51 20 15.51C20.55 15.51 21 15.96 21 16.51V20C21 20.55 20.55 21 20 21C10.61 21 3 13.39 3 4C3 3.45 3.45 3 4 3H7.5C8.05 3 8.5 3.45 8.5 4C8.5 5.25 8.7 6.45 9.07 7.57C9.18 7.92 9.1 8.31 8.82 8.59L6.62 10.79Z",
//   voter:   "M18 4H6c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-4 10h-4v-2h4v2zm2-4H8V8h8v2z",
//   aadh:    "M12 1C5.93 1 1 5.93 1 12s4.93 11 11 11 11-4.93 11-11S18.07 1 12 1zm0 4c1.86 0 3.38 1.52 3.38 3.38S13.86 11.75 12 11.75 8.63 10.23 8.63 8.38 10.14 5 12 5zm0 14.5c-2.83 0-5.33-1.46-6.79-3.67C6.5 13.83 10 13 12 13s5.5.83 6.79 2.83C17.33 18.04 14.83 19.5 12 19.5z",
//   scroll:  "M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zM6 20V4h7v5h5v11H6z",
//   scholar: "M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82zM12 3L1 9l11 6 9-4.91V17h2V9L12 3z",
//   pension: "M20 4H4v2h16V4zm1 10v-2l-1-5H4l-1 5v2h1v6h10v-6h4v6h2v-6h1zm-9 4H6v-4h6v4z",
//   farmer:  "M12 22c4.97 0 9-4.03 9-9-4.97 0-9 4.03-9 9zm0 0c0-4.97-4.03-9-9-9 0 4.97 4.03 9 9 9zm0-18C9.24 4 7 6.24 7 9c0 1.29.47 2.46 1.24 3.36C9.46 13.28 10.67 14 12 14s2.54-.72 3.76-1.64C16.53 11.46 17 10.29 17 9c0-2.76-2.24-5-5-5z",
//   ration:  "M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z",
//   divyang: "M12 2c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm9 7h-6v13h-2v-6h-2v6H9V9H3V7h18v2z",
//   chevR:   "M10 6L8.59 7.41 13.17 12 8.59 16.59 10 18l6-6z",
//   fire:    "M19.48 12.35c-1.57-4.08-7.16-4.3-5.81-10.23.1-.44-.37-.78-.75-.55C9.29 3.71 6.68 8 8.87 13.62c.18.46-.36.89-.75.59-1.81-1.37-2-3.34-1.84-4.75.06-.52-.62-.77-.91-.34C4.69 10.16 4 11.84 4 14c0 4.22 3.8 7.99 8 8 4.2.01 8-3.77 8-8 0-1.23-.26-2.4-.52-3.65z",
//   police:  "M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z",
//   women:   "M13 11.5V17h3l-4 4-4-4h3v-5.5c-2.28-.46-4-2.48-4-4.91V4h1.5v6.5h1.5V4H11v6.5h1.5V4H14v2.59c0 2.43-1.72 4.45-4 4.91z",
//   child:   "M11.5 2C9.01 2 7 4.01 7 6.5S9.01 11 11.5 11 16 8.99 16 6.5 13.99 2 11.5 2zM21 23v-1c0-2.67-5.33-4-8-4s-8 1.33-8 4v1h16z",
//   cyber:   "M20 4H4c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm-5 11.5h-2V13H9.5v-2H11V9h2v2h1.5v2H13v2.5z",
//   water:   "M12 2c-5.33 4.55-8 8.48-8 11.8 0 4.98 3.8 8.2 8 8.2s8-3.22 8-8.2c0-3.32-2.67-7.25-8-11.8z",
//   medal:   "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
//   star:    "M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z",
//   tick2:   "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z",
// };

// // ═══════════════════════════════════════════════════════════════
// //  SHARED COMPONENT — SVG Icon
// // ═══════════════════════════════════════════════════════════════
// export function Ic({ d, size = 20, color = "currentColor", style: s = {} }) {
//   return (
//     <svg
//       width={size} height={size} viewBox="0 0 24 24" fill={color}
//       aria-hidden style={{ flexShrink: 0, display: "block", ...s }}
//     >
//       <path d={d} />
//     </svg>
//   );
// }

// // ═══════════════════════════════════════════════════════════════
// //  SUVIDHA LOGO MARK
// // ═══════════════════════════════════════════════════════════════
// export function SuvidhaLogo({ size = 40 }) {
//   return (
//     <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-label="SUVIDHA logo">
//       <circle cx="20" cy="20" r="18" stroke="#F97316" strokeWidth="2.5" fill="none" />
//       <circle cx="20" cy="20" r="6"  fill="#F97316" />
//       <circle cx="20" cy="20" r="2.5" fill="white" />
//       {Array.from({ length: 8 }).map((_, i) => {
//         const a = (i * 45 * Math.PI) / 180;
//         return (
//           <line key={i}
//             x1={20 + 8  * Math.cos(a)} y1={20 + 8  * Math.sin(a)}
//             x2={20 + 15 * Math.cos(a)} y2={20 + 15 * Math.sin(a)}
//             stroke="#F97316" strokeWidth="2" strokeLinecap="round"
//           />
//         );
//       })}
//     </svg>
//   );
// }

// // ═══════════════════════════════════════════════════════════════
// //  DATE / CLOCK HELPERS
// // ═══════════════════════════════════════════════════════════════
// const HI_MONTHS = ["जनवरी","फरवरी","मार्च","अप्रैल","मई","जून","जुलाई","अगस्त","सितंबर","अक्तूबर","नवंबर","दिसंबर"];
// const HI_DAYS   = ["रविवार","सोमवार","मंगलवार","बुधवार","गुरुवार","शुक्रवार","शनिवार"];
// const HI_D      = ["०","१","२","३","४","५","६","७","८","९"];
// const toHi      = n => String(n).split("").map(d => HI_D[+d]).join("");

// export const hiDate = () => {
//   const d = new Date();
//   return `${HI_DAYS[d.getDay()]}, ${toHi(d.getDate())} ${HI_MONTHS[d.getMonth()]} ${toHi(d.getFullYear())}`;
// };

// export const enDate = () =>
//   new Date().toLocaleDateString("en-IN", { weekday:"short", day:"numeric", month:"short", year:"numeric" });

// export function useClock(ms = 1000) {
//   const [t, setT] = useState(new Date());
//   useEffect(() => {
//     const id = setInterval(() => setT(new Date()), ms);
//     return () => clearInterval(id);
//   }, [ms]);
//   return t;
// }

// // ═══════════════════════════════════════════════════════════════
// //  ALL KIOSK DATA
// // ═══════════════════════════════════════════════════════════════

// export const ALERTS_DATA = [
//   { type:"warn",  hi:"वार्ड 12–15: आज शाम 4–7 बजे बिजली रखरखाव कार्य",   en:"Ward 12–15: Power maintenance 4–7 PM today",   icon:I.warn  },
//   { type:"warn",  hi:"जल आपूर्ति कल सुबह 6–9 बजे बंद रहेगी — Zone B",     en:"Water supply off tomorrow 6–9 AM — Zone B",    icon:I.water },
//   { type:"green", hi:"माधोगंज: बिजली आपूर्ति दोपहर 2:30 बजे बहाल हुई",    en:"Madhoganj: Power restored at 2:30 PM today",   icon:I.check },
//   { type:"info",  hi:"नगर पालिका कार्यालय: शनिवार को बंद रहेगा",           en:"Municipal office closed this Saturday",         icon:I.info  },
// ];

// export const SCHEMES_DATA = [
//   { hi:"PM Awas Yojana — मुफ्त मकान के लिए यहाँ आवेदन करें",               en:"PM Awas Yojana — Apply for free housing"         },
//   { hi:"PM Ujjwala 3.0 — निःशुल्क गैस कनेक्शन उपलब्ध है",                  en:"PM Ujjwala 3.0 — Free LPG connection"            },
//   { hi:"Ayushman Bharat — 5 लाख रुपये तक मुफ्त इलाज",                      en:"Ayushman Bharat — Free treatment up to ₹5 lakh" },
//   { hi:"PM Kisan Samman Nidhi — किसानों के लिए ₹6000 प्रतिवर्ष",           en:"PM Kisan — ₹6000/year direct benefit for farmers"},
//   { hi:"वृद्धावस्था पेंशन — 60 वर्ष से ऊपर ₹1000/माह",                    en:"Old Age Pension — ₹1000/month for citizens 60+" },
// ];

// export const DEPTS = [
//   { key:"elec", hi:"बिजली विभाग", en:"Electricity",  icon:I.elec, color:"#1355A0", light:"#E8F2FF", topBar:"#1355A0", subHi:"बिल · नया कनेक्शन · शिकायत", subEn:"Bill · Connection · Complaint"  },
//   { key:"gas",  hi:"गैस विभाग",   en:"Gas Services", icon:I.gas,  color:"#C95A00", light:"#FFF3EA", topBar:"#C95A00", subHi:"बिल · गैस लीक · कनेक्शन",    subEn:"Bill · Gas Leak · Connection"   },
//   { key:"muni", hi:"नगर पालिका",  en:"Municipal",    icon:I.muni, color:"#0B7A45", light:"#E6F5EE", topBar:"#0B7A45", subHi:"संपत्ति कर · प्रमाण पत्र",   subEn:"Property Tax · Certificates"    },
//   { key:"info", hi:"जन सूचना",    en:"Public Info",  icon:I.info, color:"#7C3AED", light:"#F5F3FF", topBar:"#7C3AED", subHi:"योजनाएं · हेल्पलाइन · खोज",  subEn:"Schemes · Helplines · Locator"  },
// ];

// export const QUICK_SVCS = [
//   { hi:"मतदाता पहचान", en:"Voter ID",       icon:I.voter,   color:"#1355A0", bg:"#EBF4FF" },
//   { hi:"आधार सेवाएं",  en:"Aadhaar",        icon:I.aadh,    color:"#0B7A45", bg:"#E6F5EE" },
//   { hi:"जाति/निवास",   en:"Caste/Domicile", icon:I.scroll,  color:"#C95A00", bg:"#FFF3EA" },
//   { hi:"छात्रवृत्ति",  en:"Scholarship",    icon:I.scholar, color:"#7C3AED", bg:"#F5F3FF" },
//   { hi:"वृद्ध पेंशन",  en:"Old Age Pension",icon:I.pension, color:"#D4580A", bg:"#FFF3EA" },
//   { hi:"दिव्यांग",     en:"Divyang/UDID",   icon:I.divyang, color:"#0076A8", bg:"#E8F8FF" },
//   { hi:"किसान सेवा",   en:"Farmer Services",icon:I.farmer,  color:"#0B7A45", bg:"#E6F5EE" },
//   { hi:"राशन कार्ड",   en:"Ration Card",    icon:I.ration,  color:"#B91C1C", bg:"#FFF0F0" },
// ];

// export const HEALTH_DATA = [
//   { hi:"जिला सरकारी अस्पताल",         en:"Govt. District Hospital",  dist:"0.8 km", phone:"0145-262001", urgent:true   },
//   { hi:"सामुदायिक स्वास्थ्य केंद्र",  en:"Community Health Centre",  dist:"1.2 km", phone:"0145-262100", urgent:false  },
//   { hi:"जन औषधि केंद्र",              en:"Jan Aushadhi Kendra",       dist:"0.3 km", phone:"98290-XXXXX", medicine:true },
//   { hi:"उप जिला अस्पताल",             en:"Sub District Hospital",     dist:"3.4 km", phone:"0145-262500", urgent:false  },
// ];

// export const BUSES_DATA = [
//   { no:"14A", fromHi:"नया बाज़ार",  toHi:"रेलवे स्टेशन", fromEn:"Naya Bazaar",  toEn:"Railway Stn",  next:"8 min",  color:"#1355A0" },
//   { no:"22",  fromHi:"सिविल लाइंस", toHi:"पुष्कर रोड",   fromEn:"Civil Lines",  toEn:"Pushkar Road", next:"12 min", color:"#0B7A45" },
//   { no:"31B", fromHi:"अजमेर सिटी", toHi:"आना सागर झील", fromEn:"Ajmer City",   toEn:"Ana Sagar",    next:"5 min",  color:"#C95A00" },
// ];

// export const HELPLINES_DATA = [
//   { hi:"आपातकाल",        en:"Emergency",       no:"112",         color:"#B91C1C", bg:"#FFF0F0", icon:I.shield },
//   { hi:"बिजली शिकायत",   en:"Electricity",     no:"1912",        color:"#1355A0", bg:"#EBF4FF", icon:I.elec   },
//   { hi:"गैस आपातकाल",    en:"Gas Emergency",   no:"1906",        color:"#C95A00", bg:"#FFF3EA", icon:I.fire   },
//   { hi:"एम्बुलेंस",       en:"Ambulance",       no:"108",         color:"#B91C1C", bg:"#FFF0F0", icon:I.hosp   },
//   { hi:"दमकल",            en:"Fire Brigade",    no:"101",         color:"#C95A00", bg:"#FFF3EA", icon:I.fire   },
//   { hi:"पुलिस",           en:"Police",          no:"100",         color:"#1355A0", bg:"#EBF4FF", icon:I.police },
//   { hi:"महिला हेल्पलाइन", en:"Women Helpline",  no:"181",         color:"#7C3AED", bg:"#F5F3FF", icon:I.women  },
//   { hi:"बाल सहायता",      en:"Child Helpline",  no:"1098",        color:"#0B7A45", bg:"#E6F5EE", icon:I.child  },
//   { hi:"वरिष्ठ नागरिक",  en:"Senior Citizen",  no:"14567",       color:"#C95A00", bg:"#FFF3EA", icon:I.large  },
//   { hi:"साइबर अपराध",    en:"Cyber Crime",     no:"1930",        color:"#0076A8", bg:"#E8F8FF", icon:I.cyber  },
//   { hi:"जल आपूर्ति",     en:"Water Supply",    no:"1916",        color:"#0076A8", bg:"#E8F8FF", icon:I.water  },
//   { hi:"कलेक्टर",         en:"Dist. Collector", no:"0145-262XXX", color:"#1355A0", bg:"#EBF4FF", icon:I.muni   },
// ];

// export const DOCS_DATA = [
//   { hi:"आधार कार्ड",         en:"Aadhaar Card",           useHi:"सभी सेवाएं",        useEn:"All services",        icon:I.aadh    },
//   { hi:"मतदाता पहचान पत्र",  en:"Voter ID",               useHi:"मतदान सेवाएं",      useEn:"Voter services",      icon:I.voter   },
//   { hi:"पासपोर्ट फोटो",      en:"Passport Photo",          useHi:"सभी आवेदन",         useEn:"All applications",    icon:I.large   },
//   { hi:"पता प्रमाण",          en:"Address Proof",           useHi:"बिल, प्रमाण पत्र", useEn:"Bills, certificates", icon:I.doc     },
//   { hi:"आय प्रमाण पत्र",     en:"Income Certificate",      useHi:"योजनाएं",            useEn:"Schemes",             icon:I.scroll  },
//   { hi:"भूमि रिकॉर्ड",        en:"Land Record / Khasra",    useHi:"किसान योजनाएं",    useEn:"Farmer schemes",      icon:I.farmer  },
//   { hi:"अंक तालिका",          en:"Marksheet / Certificate", useHi:"शिक्षा सेवाएं",    useEn:"Education services",  icon:I.scholar },
//   { hi:"चिकित्सा प्रमाण",    en:"Medical Certificate",     useHi:"दिव्यांग, पेंशन",  useEn:"Divyang, pension",    icon:I.pill    },
// ];