/**
 * flows/OutageReport.jsx — SUVIDHA Government Kiosk
 * ════════════════════════════════════════════════════════════════
 * Covers:  electricity · gas · water  (dept prop)
 * ✅ Fully bilingual — ALL text switches Hindi ↔ English
 * ✅ SVG icons only — ZERO emojis
 * ✅ DM Sans + DM Mono + Noto Sans Devanagari
 * ✅ 3-step wizard: Form → Review → Confirmation
 * ✅ Real API call via kioskApi · Duplicate detection · Priority badge
 * ✅ Elder/Senior mode — larger targets, bigger fonts
 * ✅ Full form validation with bilingual error messages
 * ✅ Shake animation on error, staggered entry animations
 * ✅ Copy Report ID · Print receipt · SMS confirmation banner
 * ✅ Gas-leak emergency override UI
 * ✅ Responsive: Kiosk 1280 · Laptop 1024 · Mobile 360
 */

import { useState, useRef, useEffect, useCallback } from "react";
import api from "../../api/kioskApi";

// ─── DESIGN TOKENS ─────────────────────────────────────────────────────────────
const C = {
  navy:      "#071828", navyMid:  "#0A2342", navyDp:   "#060F1A",
  blue:      "#1558A0", blueMid:  "#1E7AD4", blueLight:"#EBF4FF", blueBd:  "#BFDBF7",
  green:     "#15803D", greenBg:  "#F0FDF4", greenBd:  "#86EFAC", greenDp: "#14532D",
  red:       "#C0222A", redBg:    "#FFF0F0", redBd:    "#FECACA", redDp:   "#991B1B",
  amber:     "#B45309", amberBg:  "#FFFBEB", amberBd:  "#FCD34D",
  orange:    "#D4580A", orangeBg: "#FFF3EA", orangeBd: "#FED7AA",
  ink:       "#0A1828", slate:    "#1E3A50", muted:    "#4A6070",
  ghost:     "#7A96B0", ghostLt:  "#94A3B8",
  rule:      "#DDE6F0", surface:  "#F5F9FE", bg:       "#EEF2F7",
  white:     "#FFFFFF",
  triOg:     "#FF9933", triGn:    "#138808",
};
const F  = "'DM Sans','Noto Sans Devanagari','Segoe UI',system-ui,sans-serif";
const FM = "'DM Mono','Courier New',monospace";

// ─── DEPARTMENT THEMES ────────────────────────────────────────────────────────
const DEPT = {
  electricity: {
    color:    "#1558A0", colorMid: "#1E7AD4",
    light:    "#EBF4FF", border:   "#BFDBF7",
    helpline: "1912",
    icon: "M13 2L4.5 13.5H11L10 22L19.5 10.5H13L13 2Z",
    hiName: "बिजली विभाग",           enName: "Electricity Dept.",
    hiTitle:"बिजली आपूर्ति समस्या रिपोर्ट",  enTitle:"Report Power Outage / Fault",
    hiSub:  "बिजली गुल · वोल्टेज समस्या · तकनीकी खराबी",
    enSub:  "Power outage · Voltage issue · Technical fault",
    hiAlert:"खतरनाक तार या बिजली उपकरण को कभी न छुएं — तुरंत कॉल करें",
    enAlert:"Never touch fallen wires or damaged equipment — call immediately",
    hiWarn: "बिजली संकट / आग की स्थिति में स्विच बंद करें फिर कॉल करें",
    enWarn: "For electrical hazard or fire — switch off mains, then call",
    issueopts: [
      { v:"outage",    hi:"बिजली गुल",         en:"Power Outage"       },
      { v:"low",       hi:"कम वोल्टेज",         en:"Low Voltage"        },
      { v:"fluctuate", hi:"उतार-चढ़ाव",          en:"Fluctuation"        },
      { v:"wire",      hi:"खतरनाक तार",          en:"Fallen / Bare Wire" },
      { v:"meter",     hi:"मीटर खराबी",          en:"Faulty Meter"       },
      { v:"bill",      hi:"बिल समस्या",           en:"Billing Issue"      },
      { v:"other",     hi:"अन्य समस्या",           en:"Other"              },
    ],
  },
  gas: {
    color:    "#D4580A", colorMid: "#F97316",
    light:    "#FFF3EA", border:   "#FED7AA",
    helpline: "1906",
    icon: "M12 2s-3 5-3 9c0 0-2-1.5-2-3.5C5 10 4 13 4 15c0 4.42 3.58 8 8 8s8-3.58 8-8c0-5-8-13-8-13zm0 19c-3.31 0-6-2.69-6-6 0-1.5.5-3 1.5-4.5 0 1.5 1.5 2.5 1.5 2.5 0-3 2-5.5 3-8 1 2.5 3 5 3 8 0 0 1.5-1 1.5-2.5C20.5 12 21 13.5 21 15c0 3.31-2.69 6-6 6z",
    hiName: "गैस सेवाएं",              enName: "Gas Services",
    hiTitle:"गैस लीक / समस्या रिपोर्ट",  enTitle:"Report Gas Leak / Issue",
    hiSub:  "गैस रिसाव · आपूर्ति बाधा · तकनीकी समस्या",
    enSub:  "Gas leak · Supply disruption · Technical issue",
    hiAlert:"गैस की गंध: स्विच न छुएं, खिड़कियां खोलें, घर खाली करें, फिर कॉल करें",
    enAlert:"Gas smell: Do NOT use switches, open windows, evacuate, then call",
    hiWarn: "आग या माचिस का उपयोग बिल्कुल न करें — यह जानलेवा हो सकता है",
    enWarn: "Do not use any flames or lighters — this can be fatal",
    issueopts: [
      { v:"leak",      hi:"गैस रिसाव",           en:"Gas Leak"           },
      { v:"nosupply",  hi:"आपूर्ति बंद",          en:"No Gas Supply"      },
      { v:"pressure",  hi:"कम दबाव",              en:"Low Pressure"       },
      { v:"connect",   hi:"कनेक्शन समस्या",       en:"Connection Issue"   },
      { v:"bill",      hi:"बिल समस्या",            en:"Billing Issue"      },
      { v:"other",     hi:"अन्य",                  en:"Other"              },
    ],
  },
  water: {
    color:    "#0076A8", colorMid: "#0EA5E9",
    light:    "#E8F8FF", border:   "#BAE6FD",
    helpline: "1916",
    icon: "M12 2c-5.33 4.55-8 8.48-8 11.8 0 4.98 3.8 8.2 8 8.2s8-3.22 8-8.2c0-3.32-2.67-7.25-8-11.8z",
    hiName: "जल आपूर्ति",               enName: "Water Supply",
    hiTitle:"जल आपूर्ति समस्या रिपोर्ट", enTitle:"Report Water Supply Issue",
    hiSub:  "आपूर्ति बाधा · पाइप रिसाव · जल गुणवत्ता",
    enSub:  "Supply disruption · Pipe leakage · Water quality",
    hiAlert:"जल आपातकाल के लिए तुरंत कॉल करें — दूषित जल न पीएं",
    enAlert:"Call immediately for water emergency — do not drink contaminated water",
    hiWarn: "पाइप रिसाव की सूचना तुरंत दें ताकि जलापूर्ति बाधित न हो",
    enWarn: "Report pipe leaks immediately to prevent supply disruption",
    issueopts: [
      { v:"nosupply",  hi:"आपूर्ति बंद",           en:"No Water Supply"    },
      { v:"low",       hi:"कम दबाव",               en:"Low Pressure"       },
      { v:"leak",      hi:"पाइप रिसाव",             en:"Pipe Leakage"       },
      { v:"quality",   hi:"गुणवत्ता समस्या",        en:"Water Quality Issue"},
      { v:"drain",     hi:"नाली समस्या",             en:"Drainage Issue"     },
      { v:"other",     hi:"अन्य",                    en:"Other"              },
    ],
  },
  municipal: {
    color:    "#15803D", colorMid: "#16A34A",
    light:    "#F0FDF4", border:   "#86EFAC",
    helpline: "0145-262001",
    icon: "M2 20V8L12 2L22 8V20H16V14H8V20H2ZM4 18H6V12H18V18H20V9L12 4.5L4 9V18ZM8 20V16H16V20H8Z",
    hiName: "नगर पालिका",             enName: "Municipal Corp.",
    hiTitle:"नगरपालिका शिकायत दर्ज",   enTitle:"File Municipal Complaint",
    hiSub:  "सफाई · सड़क · प्रकाश · नाली",
    enSub:  "Sanitation · Road · Lighting · Drainage",
    hiAlert:"आपातकालीन स्थिति में नगरपालिका नंबर पर तुरंत कॉल करें",
    enAlert:"For municipal emergency — call the helpline immediately",
    hiWarn: "शिकायत दर्ज होने के 48 घंटे में समाधान का प्रयास किया जाएगा",
    enWarn: "Resolution will be attempted within 48 hours of registration",
    issueopts: [
      { v:"sanitation",hi:"सफाई / कचरा",            en:"Sanitation / Garbage"},
      { v:"road",      hi:"सड़क गड्ढा",              en:"Road Pothole"        },
      { v:"light",     hi:"स्ट्रीट लाइट",            en:"Street Light"        },
      { v:"drain",     hi:"नाली / जलभराव",            en:"Drain / Waterlogging"},
      { v:"tree",      hi:"पेड़ / खतरा",              en:"Tree / Hazard"       },
      { v:"other",     hi:"अन्य",                    en:"Other"               },
    ],
  },
};

// ─── SINCE OPTIONS ────────────────────────────────────────────────────────────
const SINCE = [
  { v:"30min",   hi:"30 मिनट से",  en:"Since 30 minutes" },
  { v:"1hr",     hi:"1 घंटे से",   en:"Since 1 hour"     },
  { v:"2hr",     hi:"2 घंटे से",   en:"Since 2 hours"    },
  { v:"4hr",     hi:"4 घंटे से",   en:"Since 4 hours"    },
  { v:"morning", hi:"आज सुबह से",  en:"Since this morning"},
  { v:"yest",    hi:"कल से",       en:"Since yesterday"  },
  { v:"2days",   hi:"2 दिन से",    en:"Since 2 days"     },
];

// ─── CSS ─────────────────────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700;9..40,800;9..40,900&family=DM+Mono:wght@500;600;700&family=Noto+Sans+Devanagari:wght@400;500;600;700;800&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
body{font-family:'DM Sans','Noto Sans Devanagari',sans-serif}

@keyframes or-up   {from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
@keyframes or-pop  {0%{opacity:0;transform:scale(.82)}80%{transform:scale(1.04)}100%{opacity:1;transform:scale(1)}}
@keyframes or-dot  {0%,100%{box-shadow:0 0 0 0 rgba(22,163,74,.55)}70%{box-shadow:0 0 0 9px rgba(22,163,74,0)}}
@keyframes or-rdot {0%,100%{box-shadow:0 0 0 0 rgba(192,34,42,.5)}70%{box-shadow:0 0 0 8px rgba(192,34,42,0)}}
@keyframes or-pulse{0%,100%{opacity:1}50%{opacity:.35}}
@keyframes or-spin {to{transform:rotate(360deg)}}
@keyframes or-shake{0%,100%{transform:translateX(0)}20%,60%{transform:translateX(-5px)}40%,80%{transform:translateX(5px)}}
@keyframes or-draw {from{stroke-dashoffset:50}to{stroke-dashoffset:0}}

.or-s1{animation:or-up .38s cubic-bezier(.22,.68,0,1.2) .04s both}
.or-s2{animation:or-up .38s cubic-bezier(.22,.68,0,1.2) .09s both}
.or-s3{animation:or-up .38s cubic-bezier(.22,.68,0,1.2) .14s both}
.or-s4{animation:or-up .38s cubic-bezier(.22,.68,0,1.2) .19s both}
.or-s5{animation:or-up .38s cubic-bezier(.22,.68,0,1.2) .24s both}
.or-s6{animation:or-up .38s cubic-bezier(.22,.68,0,1.2) .29s both}
.or-s7{animation:or-up .38s cubic-bezier(.22,.68,0,1.2) .34s both}
.or-s8{animation:or-up .38s cubic-bezier(.22,.68,0,1.2) .39s both}
.or-pop{animation:or-pop .5s cubic-bezier(.22,.68,0,1.2) both}
.or-shake{animation:or-shake .38s ease}

::-webkit-scrollbar{width:4px;height:4px}
::-webkit-scrollbar-track{background:#EEF2F7}
::-webkit-scrollbar-thumb{background:#BDC9D8;border-radius:99px}

/* FIELD */
.or-input,.or-select,.or-textarea{
  width:100%;font-family:'DM Sans','Noto Sans Devanagari',system-ui,sans-serif;
  font-size:clamp(13px,1.4vw,15px);color:#0A1828;background:#F5F9FE;
  border:1.5px solid #DDE6F0;border-radius:10px;outline:none;
  transition:border-color .16s,box-shadow .16s,background .16s;
}
.or-input,.or-select{height:clamp(48px,5.6vw,58px);padding:0 clamp(13px,1.6vw,18px)}
.or-textarea{padding:clamp(12px,1.4vw,16px) clamp(13px,1.6vw,18px);min-height:clamp(80px,9vw,100px);resize:vertical;line-height:1.6}
.or-input:focus,.or-select:focus,.or-textarea:focus{
  border-color:var(--dc);box-shadow:0 0 0 3.5px color-mix(in srgb,var(--dc) 12%,transparent);background:#fff
}
.or-input.err,.or-select.err{border-color:#C0222A;background:#FFF8F8;box-shadow:0 0 0 3px rgba(192,34,42,.08)}
.or-input::placeholder,.or-textarea::placeholder{color:#94A3B8}
.or-select{
  appearance:none;cursor:pointer;
  background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='%237A96B0'%3E%3Cpath d='M7 10l5 5 5-5z'/%3E%3C/svg%3E");
  background-repeat:no-repeat;background-position:right 14px center;padding-right:42px;
}
.or-select.err{background-color:#FFF8F8}

/* BUTTONS */
.or-primary{
  width:100%;height:clamp(52px,6vw,62px);border:none;border-radius:12px;
  font-family:'DM Sans','Noto Sans Devanagari',system-ui,sans-serif;
  font-size:clamp(14px,1.6vw,17px);font-weight:800;color:#fff;letter-spacing:-.01em;
  cursor:pointer;display:flex;align-items:center;justify-content:center;gap:9px;
  transition:opacity .15s,transform .12s,box-shadow .15s;
}
.or-primary:hover:not(:disabled){opacity:.91;box-shadow:0 6px 22px rgba(0,0,0,.2)}
.or-primary:active:not(:disabled){transform:scale(.977)}
.or-primary:disabled{opacity:.5;cursor:not-allowed}

.or-ghost{
  width:100%;height:clamp(52px,6vw,62px);border-radius:12px;
  font-family:'DM Sans','Noto Sans Devanagari',system-ui,sans-serif;
  font-size:clamp(14px,1.6vw,17px);font-weight:700;
  cursor:pointer;display:flex;align-items:center;justify-content:center;gap:9px;
  transition:background .15s,transform .12s;background:#fff;
}
.or-ghost:hover{background:#F5F9FE}
.or-ghost:active{transform:scale(.977)}

/* SEGMENT PILLS */
.or-pill{
  border-radius:9px;border:1.5px solid #DDE6F0;background:#fff;
  font-family:'DM Sans','Noto Sans Devanagari',system-ui,sans-serif;
  cursor:pointer;text-align:center;transition:all .16s;
  padding:clamp(10px,1.2vw,13px) clamp(9px,1vw,12px);
  display:flex;flex-direction:column;align-items:center;gap:3px;
}
.or-pill.active{color:var(--dc);background:var(--dl);border-color:var(--dc)}
.or-pill:hover:not(.active){background:#F5F9FE;border-color:#C8D8E8}

/* GRID HELPERS */
.or-2col{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.or-3col{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}
.or-act {display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:20px}
@media(max-width:640px){.or-2col,.or-3col,.or-act{grid-template-columns:1fr!important}}
@media(min-width:641px) and (max-width:900px){.or-3col{grid-template-columns:repeat(2,1fr)!important}}

/* MISC */
*:focus-visible{outline:2.5px solid var(--dc,#1558A0);outline-offset:3px;border-radius:4px}
`;

// ─── SVG PATHS ────────────────────────────────────────────────────────────────
const I = {
  back:    "M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z",
  check:   "M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z",
  warn:    "M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z",
  info:    "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z",
  phone:   "M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.19 2.2z",
  print:   "M19 8H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3zm-3 11H8v-5h8v5zm3-7c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-1-9H6v4h12V3z",
  home:    "M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z",
  copy:    "M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z",
  loc:     "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z",
  person:  "M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z",
  mobile:  "M17 1.01L7 1c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-1.99-2-1.99zM17 19H7V5h10v14z",
  clock:   "M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z",
  note:    "M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.89 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm4 18H6V4h7v5h5v11zm-3-7H9v-2h6v2zm0 4H9v-2h6v2zm-2-10V3.5L18.5 9H13z",
  shield:  "M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5L12 1z",
  sms:     "M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z",
  ticket:  "M22 10V6c0-1.11-.9-2-2-2H4c-1.1 0-2 .9-2 2v4c1.1 0 2 .9 2 2s-.9 2-2 2v4c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2v-4c-1.1 0-2-.9-2-2s.9-2 2-2zm-9 7.5h-2v-2h2v2zm0-4.5h-2v-2h2v2zm0-4.5h-2v-2h2v2z",
  spin:    "M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z",
  priority:"M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5L12 1zm0 4l6 2.67v4.74c0 3.2-2.42 6.2-6 7.5-3.58-1.3-6-4.3-6-7.5V7.67L12 5z",
  ward:    "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5",
  ok:      "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z",
  merge:   "M17 20.41L18.41 19 15 15.59 13.59 17 17 20.41zM7.5 8H11v5.59L5.59 19 7 20.41l6-6V8h3.5L12 3.5 7.5 8z",
  star:    "M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z",
};

// ─── ICON PRIMITIVE ───────────────────────────────────────────────────────────
function Ic({ path, size = 20, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}
      aria-hidden="true" style={{ flexShrink: 0, display: "block" }}>
      <path d={path} />
    </svg>
  );
}

// ─── VALIDATION ───────────────────────────────────────────────────────────────
function validate(f, isHi) {
  const e = {};
  if (!f.name.trim() || f.name.trim().length < 2)
    e.name = isHi ? "पूरा नाम आवश्यक है (न्यूनतम 2 अक्षर)" : "Full name required (min 2 chars)";
  if (!/^[6-9]\d{9}$/.test(f.mobile.replace(/[\s-]/g, "")))
    e.mobile = isHi ? "10 अंक का वैध मोबाइल नंबर दर्ज करें" : "Enter valid 10-digit mobile number";
  if (!f.area.trim() || f.area.trim().length < 3)
    e.area = isHi ? "क्षेत्र / मोहल्ला का नाम दर्ज करें" : "Enter area / locality name";
  if (!f.issueType)
    e.issueType = isHi ? "समस्या का प्रकार चुनें" : "Please select issue type";
  return e;
}

// ─── SHARED ATOMS ─────────────────────────────────────────────────────────────
function Card({ children, style = {} }) {
  return (
    <div style={{
      background: C.white, border: `1.5px solid ${C.rule}`, borderRadius: 14,
      padding: "clamp(16px,2vw,24px)",
      boxShadow: "0 1px 3px rgba(7,24,56,.04),0 4px 14px rgba(7,24,56,.03)",
      marginBottom: 14, ...style,
    }}>
      {children}
    </div>
  );
}

function SecHead({ icon, hi, en, color, elder }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "clamp(14px,1.7vw,18px)" }}>
      <div style={{ width: 3, height: 36, borderRadius: 2, background: `linear-gradient(180deg,${color},${color}60)`, flexShrink: 0 }} />
      <div style={{ width: 36, height: 36, borderRadius: 10, background: color + "14", border: `1.5px solid ${color}22`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <Ic path={icon} size={17} color={color} />
      </div>
      <div>
        <div style={{ fontFamily: F, fontSize: elder ? "clamp(14px,1.6vw,18px)" : "clamp(13px,1.5vw,16px)", fontWeight: 800, color: C.ink, lineHeight: 1.2, letterSpacing: "-.01em" }}>{hi}</div>
        <div style={{ fontFamily: F, fontSize: elder ? "clamp(11px,1.1vw,13px)" : "clamp(9px,.95vw,11px)", color: C.ghostLt, marginTop: 1.5 }}>{en}</div>
      </div>
    </div>
  );
}

function FieldWrap({ label, labelEn, required, error, elder, children }) {
  return (
    <div>
      <label style={{ display: "block", marginBottom: 7 }}>
        <span style={{ fontFamily: F, fontSize: elder ? "clamp(11px,1.1vw,13px)" : "clamp(10px,1vw,12px)", fontWeight: 800, color: error ? C.red : C.muted, letterSpacing: ".07em", textTransform: "uppercase" }}>
          {label}{required && <span style={{ color: C.red, marginLeft: 3 }}>*</span>}
        </span>
        {labelEn && <span style={{ display: "block", fontFamily: F, fontSize: "clamp(9px,.9vw,10px)", color: C.ghostLt, marginTop: 1 }}>{labelEn}</span>}
      </label>
      {children}
      {error && (
        <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 5 }}>
          <Ic path={I.warn} size={12} color={C.red} />
          <span style={{ fontFamily: F, fontSize: "clamp(11px,1.1vw,12px)", color: C.red, fontWeight: 600, lineHeight: 1.3 }}>{error}</span>
        </div>
      )}
    </div>
  );
}

function ReviewRow({ icon, label, labelEn, val, mono, accent, last }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "clamp(9px,1.1vw,13px) clamp(14px,1.7vw,20px)", borderBottom: last ? "none" : `1px solid ${C.rule}`, gap: 14 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 7, flexShrink: 0, maxWidth: "48%" }}>
        {icon && <Ic path={icon} size={13} color={C.ghost} />}
        <div>
          <div style={{ fontFamily: F, fontSize: "clamp(11px,1.2vw,13px)", color: C.muted, fontWeight: 500 }}>{label}</div>
          {labelEn && <div style={{ fontFamily: F, fontSize: "clamp(9px,.95vw,10px)", color: C.ghostLt, marginTop: 1 }}>{labelEn}</div>}
        </div>
      </div>
      <span style={{ fontFamily: mono ? FM : F, fontSize: accent ? "clamp(13px,1.5vw,16px)" : "clamp(12px,1.3vw,14px)", fontWeight: accent ? 800 : 600, color: accent || (mono ? C.blue : C.ink), textAlign: "right", wordBreak: "break-all", lineHeight: 1.4 }}>{val}</span>
    </div>
  );
}

// ─── STEP PROGRESS BAR ────────────────────────────────────────────────────────
function Steps({ step, deptColor, isHi, elder }) {
  const labels = isHi
    ? ["विवरण दर्ज करें", "समीक्षा करें", "पुष्टि"]
    : ["Enter Details",   "Review",        "Confirmation"];
  return (
    <div style={{ display: "flex", alignItems: "flex-start", padding: "clamp(12px,1.5vw,18px) clamp(18px,2.5vw,36px) clamp(10px,1.2vw,14px)" }}>
      {labels.map((lbl, i) => {
        const n = i + 1;
        const done   = step > n;
        const active = step === n;
        return (
          <div key={i} style={{ display: "flex", alignItems: "flex-start", flex: i < labels.length - 1 ? 1 : "initial" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
              <div style={{
                width: elder ? 38 : 31, height: elder ? 38 : 31, borderRadius: "50%", flexShrink: 0,
                background: done || active ? deptColor : "#DDE6F0",
                border: active ? `3px solid ${deptColor}` : done ? "none" : "2px solid #C8D8E8",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: active ? `0 0 0 5px ${deptColor}1A` : "none",
                transition: "all .3s ease",
              }}>
                {done
                  ? <Ic path={I.check} size={elder ? 19 : 15} color={C.white} />
                  : <span style={{ fontFamily: FM, fontSize: elder ? 15 : 12, fontWeight: 800, color: active ? C.white : C.ghost }}>{n}</span>
                }
              </div>
              <span style={{ fontFamily: F, fontSize: elder ? "clamp(10px,1vw,12px)" : "clamp(9px,.88vw,10px)", fontWeight: active || done ? 700 : 500, color: active ? deptColor : done ? deptColor : C.ghost, whiteSpace: "nowrap", lineHeight: 1.2 }}>
                {lbl}
              </span>
            </div>
            {i < labels.length - 1 && (
              <div style={{ flex: 1, height: 2, background: done ? deptColor : "#DDE6F0", margin: `${elder ? 19 : 15}px 6px 0`, transition: "background .35s" }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════════
//  MAIN EXPORT
// ════════════════════════════════════════════════════════════════════════════════
export function OutageReport({ dept = "electricity", lang = "en", setScreen, senior }) {
  const isHi  = lang === "hi";
  const elder = !!senior;
  const th    = DEPT[dept] || DEPT.electricity;
  const DC    = th.color;
  const DL    = th.light;

  /* ── STATE ── */
  const [step,    setStep]  = useState(1);
  const [form,    setForm]  = useState({ name: "", mobile: "", area: "", ward: "", since: "", issueType: "", remarks: "" });
  const [errs,    setErrs]  = useState({});
  const [result,  setRes]   = useState(null);
  const [loading, setLoad]  = useState(false);
  const [apiErr,  setAErr]  = useState("");
  const [shake,   setShake] = useState(false);
  const [copied,  setCopied]= useState(false);
  const bodyRef = useRef(null);

  const set = useCallback((k) => (v) => { setForm(p => ({ ...p, [k]: v })); setErrs(e => ({ ...e, [k]: "" })); setAErr(""); }, []);

  useEffect(() => { bodyRef.current?.scrollTo({ top: 0, behavior: "smooth" }); }, [step]);

  /* ── STEP 1 → 2 ── */
  const goReview = () => {
    const e = validate(form, isHi);
    if (Object.keys(e).length) {
      setErrs(e);
      setShake(true);
      setTimeout(() => setShake(false), 400);
      bodyRef.current?.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setStep(2);
  };

  /* ── STEP 2 → 3 (API) ── */
  const submit = async () => {
    setLoad(true); setAErr("");
    try {
      const r = await api.reportOutage({
        name:      form.name.trim(),
        mobile:    form.mobile.replace(/[\s-]/g, ""),
        area:      form.area.trim(),
        ward:      form.ward.trim(),
        since:     form.since,
        issueType: form.issueType,
        remarks:   form.remarks.trim(),
        dept,
      });
      setRes(r);
      setStep(3);
    } catch (err) {
      setAErr(isHi ? `सबमिट त्रुटि: ${err.message}` : `Submission error: ${err.message}`);
    } finally { setLoad(false); }
  };

  const doCopy = () => {
    navigator.clipboard?.writeText(result?.reportId ?? "").catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  /* ── DERIVED ── */
  const selIssue = th.issueopts.find(o => o.v === form.issueType);
  const selSince = SINCE.find(o => o.v === form.since);
  const isGasLeak = dept === "gas" && form.issueType === "leak";
  const priColor  = result?.priority === "CRITICAL" ? C.red : result?.priority === "HIGH" ? C.orange : C.amber;
  const priBg     = result?.priority === "CRITICAL" ? C.redBg : result?.priority === "HIGH" ? C.orangeBg : C.amberBg;
  const priBd     = result?.priority === "CRITICAL" ? C.redBd : result?.priority === "HIGH" ? C.orangeBd : C.amberBd;
  const alertColor = (dept === "gas" || dept === "electricity") ? C.red : C.amber;
  const alertBg    = (dept === "gas") ? "#FFF5F0" : C.redBg;
  const alertBd    = (dept === "gas") ? C.orangeBd : C.redBd;

  /* ── FONT SIZES ── */
  const fxs = elder ? "clamp(11px,1.1vw,12px)" : "clamp(9px,.95vw,11px)";
  const fsm = elder ? "clamp(12px,1.2vw,14px)" : "clamp(11px,1.1vw,12px)";
  const fmd = elder ? "clamp(14px,1.5vw,16px)" : "clamp(12px,1.3vw,14px)";
  const flg = elder ? "clamp(16px,1.9vw,20px)" : "clamp(14px,1.6vw,17px)";

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", background: C.bg, fontFamily: F, "--dc": DC, "--dl": DL }}>
      <style>{CSS}</style>

      {/* ══════════════════════════════════════════════════════════
          HEADER — dark gradient, SUVIDHA design system
      ══════════════════════════════════════════════════════════ */}
      <header style={{
        background: `linear-gradient(140deg, ${C.navy} 0%, ${C.navyMid} 55%, #0F3464 100%)`,
        borderBottom: `4px solid ${DC}`,
        padding: "clamp(12px,1.7vw,18px) clamp(16px,2.2vw,28px)",
        display: "flex", alignItems: "center", gap: 14, flexShrink: 0,
        boxShadow: "0 4px 22px rgba(7,24,56,.26)",
        position: "relative", overflow: "hidden",
      }}>
        {/* Dot texture */}
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", opacity: .042, backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "23px 23px" }} />
        {/* Tricolor stripe */}
        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 4, background: `linear-gradient(180deg,${C.triOg} 33.33%,#fff 33.33%,#fff 66.66%,${C.triGn} 66.66%)`, zIndex: 2 }} />
        {/* Radial glow right */}
        <div style={{ position: "absolute", right: -50, top: -50, width: 200, height: 200, borderRadius: "50%", background: `radial-gradient(circle, ${DC}28 0%, transparent 70%)`, pointerEvents: "none" }} />

        {/* Back */}
        <button
          onClick={() => step > 1 ? setStep(s => s - 1) : setScreen("dept")}
          style={{ background: "rgba(255,255,255,.08)", border: "1.5px solid rgba(255,255,255,.16)", borderRadius: 9, padding: "clamp(8px,.9vw,11px) clamp(10px,1.2vw,14px)", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, flexShrink: 0, zIndex: 1, transition: "background .15s" }}
        >
          <Ic path={I.back} size={16} color="rgba(255,255,255,.85)" />
          <span style={{ fontFamily: F, fontSize: elder ? "clamp(12px,1.2vw,14px)" : "clamp(11px,1.1vw,13px)", fontWeight: 700, color: "rgba(255,255,255,.85)", whiteSpace: "nowrap" }}>
            {isHi ? "वापस" : "Back"}
          </span>
        </button>

        {/* Dept icon + title */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1, minWidth: 0, zIndex: 1 }}>
          <div style={{ width: elder ? 48 : 40, height: elder ? 48 : 40, borderRadius: 12, background: `${DC}22`, border: `1.5px solid ${DC}44`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <svg viewBox="0 0 24 24" fill={DC} aria-hidden="true" style={{ width: elder ? 25 : 20, height: elder ? 25 : 20 }}>
              <path d={th.icon} />
            </svg>
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontFamily: F, fontSize: elder ? "clamp(15px,1.9vw,22px)" : "clamp(13px,1.6vw,19px)", fontWeight: 900, color: C.white, lineHeight: 1.1, letterSpacing: "-.015em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {isHi ? th.hiTitle : th.enTitle}
            </div>
            <div style={{ fontFamily: F, fontSize: elder ? "clamp(10px,1vw,12px)" : "clamp(9px,.9vw,11px)", color: "rgba(255,255,255,.38)", marginTop: 3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {isHi ? th.hiSub : th.enSub}
            </div>
          </div>
        </div>

        {/* Helpline pill */}
        <div style={{ background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.13)", borderRadius: 11, padding: "clamp(7px,.9vw,11px) clamp(11px,1.4vw,16px)", textAlign: "center", flexShrink: 0, zIndex: 1 }}>
          <div style={{ fontFamily: F, fontSize: 8, color: "rgba(255,255,255,.3)", fontWeight: 700, letterSpacing: ".09em", textTransform: "uppercase", marginBottom: 3 }}>
            {isHi ? "हेल्पलाइन" : "Helpline"}
          </div>
          <div style={{ fontFamily: FM, fontSize: "clamp(15px,1.9vw,22px)", fontWeight: 900, color: DC, letterSpacing: ".04em", lineHeight: 1 }}>
            {th.helpline}
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4, marginTop: 3 }}>
            <div style={{ width: 5, height: 5, borderRadius: "50%", background: C.green, animation: "or-dot 1.7s ease-in-out infinite" }} />
            <span style={{ fontFamily: F, fontSize: 7, color: C.green, fontWeight: 700, letterSpacing: ".06em" }}>24×7</span>
          </div>
        </div>
      </header>

      {/* STEP BAR */}
      <div style={{ background: C.white, borderBottom: `1px solid ${C.rule}`, flexShrink: 0 }}>
        <Steps step={step} deptColor={DC} isHi={isHi} elder={elder} />
      </div>

      {/* ══════════════════════════════════════════════════════════
          SCROLLABLE BODY
      ══════════════════════════════════════════════════════════ */}
      <div ref={bodyRef} style={{ flex: 1, overflowY: "auto", padding: "clamp(14px,1.9vw,22px) clamp(14px,2.2vw,28px) 40px" }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>

          {/* ════════════ STEP 1 — FORM ════════════ */}
          {step === 1 && (
            <div key="step1" className={shake ? "or-shake" : ""}>

              {/* ── EMERGENCY BANNER ── */}
              <div className="or-s1" style={{ background: alertBg, border: `1.5px solid ${alertBd}`, borderRadius: 13, padding: "clamp(13px,1.6vw,18px) clamp(14px,1.8vw,22px)", marginBottom: 14, display: "flex", gap: 13, alignItems: "flex-start" }}>
                <div style={{ width: 4, alignSelf: "stretch", borderRadius: 2, background: alertColor, flexShrink: 0 }} />
                <div style={{ width: 40, height: 40, borderRadius: 11, background: alertColor + "14", border: `1.5px solid ${alertColor}28`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Ic path={I.warn} size={19} color={alertColor} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 5 }}>
                    <span style={{ fontFamily: F, fontSize: 9, fontWeight: 800, letterSpacing: ".09em", textTransform: "uppercase", color: alertColor, background: alertColor + "14", border: `1px solid ${alertColor}28`, borderRadius: 4, padding: "2px 8px" }}>
                      {isHi ? "आपातकाल" : "EMERGENCY"}
                    </span>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: alertColor, animation: "or-rdot 1.4s ease-in-out infinite" }} />
                  </div>
                  <div style={{ fontFamily: F, fontSize: elder ? "clamp(13px,1.5vw,16px)" : "clamp(12px,1.4vw,14px)", fontWeight: 800, color: alertColor, lineHeight: 1.4, marginBottom: 4 }}>
                    {isHi ? th.hiAlert : th.enAlert}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                    <div style={{ fontFamily: FM, fontSize: "clamp(22px,2.8vw,32px)", fontWeight: 900, color: alertColor, letterSpacing: ".05em", lineHeight: 1 }}>
                      {th.helpline}
                    </div>
                    <div style={{ fontFamily: F, fontSize: fxs, color: C.muted, lineHeight: 1.5, maxWidth: 380 }}>
                      {isHi ? th.hiWarn : th.enWarn}
                    </div>
                  </div>
                </div>
              </div>

              {/* ── API ERROR ── */}
              {apiErr && (
                <div className="or-s1" style={{ background: C.redBg, border: `1.5px solid ${C.redBd}`, borderRadius: 11, padding: "clamp(11px,1.3vw,14px) clamp(13px,1.6vw,16px)", marginBottom: 14, display: "flex", alignItems: "center", gap: 9 }}>
                  <Ic path={I.warn} size={17} color={C.red} />
                  <span style={{ fontFamily: F, fontSize: fsm, color: C.red, fontWeight: 600 }}>{apiErr}</span>
                </div>
              )}

              {/* ── ISSUE TYPE SELECTOR ── */}
              <Card className="or-s2" style={{ marginBottom: 14 }}>
                <SecHead icon={I.ticket}
                  hi={isHi ? "समस्या का प्रकार चुनें" : "Select Issue Type"}
                  en={isHi ? "Select Issue Type · एक विकल्प चुनें" : "एक विकल्प चुनें · Select one option"}
                  color={DC} elder={elder} />
                <div className="or-3col">
                  {th.issueopts.map(opt => (
                    <button key={opt.v}
                      className={`or-pill${form.issueType === opt.v ? " active" : ""}`}
                      onClick={() => { set("issueType")(opt.v); setErrs(e => ({ ...e, issueType: "" })); }}>
                      <span style={{ fontFamily: F, fontSize: elder ? "clamp(12px,1.3vw,14px)" : "clamp(11px,1.1vw,13px)", fontWeight: 800, color: form.issueType === opt.v ? DC : C.ink }}>
                        {isHi ? opt.hi : opt.en}
                      </span>
                      <span style={{ fontFamily: F, fontSize: fxs, color: form.issueType === opt.v ? DC + "88" : C.ghost }}>
                        {isHi ? opt.en : opt.hi}
                      </span>
                    </button>
                  ))}
                </div>
                {errs.issueType && (
                  <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 10 }}>
                    <Ic path={I.warn} size={12} color={C.red} />
                    <span style={{ fontFamily: F, fontSize: "clamp(11px,1.1vw,12px)", color: C.red, fontWeight: 600 }}>{errs.issueType}</span>
                  </div>
                )}
                {/* Gas leak special critical banner */}
                {isGasLeak && (
                  <div style={{ marginTop: 13, background: C.redBg, border: `1.5px solid ${C.redBd}`, borderRadius: 10, padding: "clamp(10px,1.2vw,13px) clamp(13px,1.5vw,16px)", display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: C.red, animation: "or-rdot 1.2s ease-in-out infinite", flexShrink: 0 }} />
                    <span style={{ fontFamily: F, fontSize: elder ? "clamp(12px,1.3vw,14px)" : "clamp(11px,1.2vw,13px)", color: C.red, fontWeight: 800, lineHeight: 1.4 }}>
                      {isHi
                        ? "गैस रिसाव — अभी 1906 पर कॉल करें। स्विच, आग, या मोबाइल का उपयोग घर के अंदर न करें!"
                        : "Gas Leak — Call 1906 RIGHT NOW. Do NOT use switches, flames, or mobile inside premises!"}
                    </span>
                  </div>
                )}
              </Card>

              {/* ── PERSONAL DETAILS ── */}
              <Card className="or-s3" style={{ marginBottom: 14 }}>
                <SecHead icon={I.person}
                  hi={isHi ? "व्यक्तिगत विवरण" : "Personal Details"}
                  en={isHi ? "Personal Details" : "व्यक्तिगत विवरण"}
                  color={DC} elder={elder} />
                <div className="or-2col" style={{ gap: 13 }}>
                  <FieldWrap
                    label={isHi ? "पूरा नाम" : "Full Name"}
                    labelEn={isHi ? "Full Name" : "पूरा नाम"}
                    required error={errs.name} elder={elder}>
                    <input className={`or-input${errs.name ? " err" : ""}`}
                      value={form.name}
                      onChange={e => set("name")(e.target.value)}
                      placeholder={isHi ? "आवेदक का पूरा नाम" : "Applicant's full name"}
                      autoComplete="name"
                    />
                  </FieldWrap>
                  <FieldWrap
                    label={isHi ? "मोबाइल नंबर" : "Mobile Number"}
                    labelEn={isHi ? "Mobile Number" : "मोबाइल नंबर"}
                    required error={errs.mobile} elder={elder}>
                    <input className={`or-input${errs.mobile ? " err" : ""}`}
                      value={form.mobile}
                      onChange={e => set("mobile")(e.target.value.replace(/[^0-9\s-]/g, ""))}
                      placeholder={isHi ? "10 अंक मोबाइल नंबर" : "10-digit mobile number"}
                      type="tel" maxLength={12} inputMode="numeric"
                      autoComplete="tel"
                    />
                  </FieldWrap>
                </div>
              </Card>

              {/* ── LOCATION ── */}
              <Card className="or-s4" style={{ marginBottom: 14 }}>
                <SecHead icon={I.loc}
                  hi={isHi ? "स्थान की जानकारी" : "Location Details"}
                  en={isHi ? "Location Details" : "स्थान की जानकारी"}
                  color={DC} elder={elder} />
                <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
                  <FieldWrap
                    label={isHi ? "क्षेत्र / मोहल्ला / सड़क" : "Area / Locality / Street"}
                    labelEn={isHi ? "Area / Locality / Street" : "क्षेत्र / मोहल्ला / सड़क"}
                    required error={errs.area} elder={elder}>
                    <input className={`or-input${errs.area ? " err" : ""}`}
                      value={form.area}
                      onChange={e => set("area")(e.target.value)}
                      placeholder={isHi ? "उदा. पुष्कर रोड, वार्ड 12, अजमेर" : "e.g. Pushkar Road, Ward 12, Ajmer"}
                    />
                  </FieldWrap>
                  <div className="or-2col" style={{ gap: 13 }}>
                    <FieldWrap
                      label={isHi ? "वार्ड नंबर" : "Ward Number"}
                      labelEn={isHi ? "Ward No. (Optional)" : "वार्ड नंबर (वैकल्पिक)"}
                      elder={elder}>
                      <input className="or-input"
                        value={form.ward}
                        onChange={e => set("ward")(e.target.value)}
                        placeholder={isHi ? "उदा. वार्ड 7" : "e.g. Ward 7"}
                      />
                    </FieldWrap>
                    <FieldWrap
                      label={isHi ? "समस्या कब से?" : "Issue Since"}
                      labelEn={isHi ? "Duration (Optional)" : "कितने समय से (वैकल्पिक)"}
                      elder={elder}>
                      <select className="or-select"
                        value={form.since}
                        onChange={e => set("since")(e.target.value)}>
                        <option value="">{isHi ? "— समय चुनें —" : "— Select time —"}</option>
                        {SINCE.map(o => (
                          <option key={o.v} value={o.v}>{isHi ? o.hi : o.en}</option>
                        ))}
                      </select>
                    </FieldWrap>
                  </div>
                </div>
              </Card>

              {/* ── ADDITIONAL REMARKS ── */}
              <Card className="or-s5" style={{ marginBottom: 14 }}>
                <SecHead icon={I.note}
                  hi={isHi ? "अतिरिक्त विवरण" : "Additional Details"}
                  en={isHi ? "Optional remarks / any extra info" : "वैकल्पिक टिप्पणी"}
                  color={DC} elder={elder} />
                <textarea className="or-textarea"
                  value={form.remarks}
                  onChange={e => set("remarks")(e.target.value)}
                  placeholder={isHi
                    ? "समस्या का कोई और विवरण जो आप जोड़ना चाहें... (वैकल्पिक)"
                    : "Any additional details about the issue... (optional)"}
                  rows={3}
                />
                <div style={{ fontFamily: F, fontSize: fxs, color: C.ghostLt, marginTop: 5, textAlign: "right" }}>
                  {form.remarks.length} / 500 {isHi ? "अक्षर" : "chars"}
                </div>
              </Card>

              {/* ── QUICK-FILL CHIPS (example areas) ── */}
              <div className="or-s6" style={{ marginBottom: 14 }}>
                <div style={{ fontFamily: F, fontSize: fxs, color: C.ghost, fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase", marginBottom: 7 }}>
                  {isHi ? "त्वरित क्षेत्र भरें:" : "Quick Area Fill:"}
                </div>
                <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
                  {["Pushkar Road", "Civil Lines", "Naya Bazaar", "Ana Sagar", "Foysagar"].map(a => (
                    <button key={a}
                      onClick={() => set("area")(a)}
                      style={{ background: form.area === a ? DL : C.surface, border: `1.5px solid ${form.area === a ? DC + "44" : C.rule}`, borderRadius: 7, padding: "4px 12px", cursor: "pointer", fontFamily: F, fontSize: "clamp(10px,1vw,12px)", color: form.area === a ? DC : C.slate, fontWeight: 600, transition: "all .15s" }}>
                      {a}
                    </button>
                  ))}
                </div>
              </div>

              {/* ── NEXT BUTTON ── */}
              <div className="or-s7">
                <button className="or-primary"
                  style={{ background: `linear-gradient(135deg,${DC},${th.colorMid})`, boxShadow: `0 4px 20px ${DC}44` }}
                  onClick={goReview}>
                  <Ic path={I.check} size={19} color={C.white} />
                  {isHi ? "अगला — विवरण समीक्षा करें" : "Next — Review Details"}
                </button>
              </div>
            </div>
          )}

          {/* ════════════ STEP 2 — REVIEW ════════════ */}
          {step === 2 && (
            <div key="step2">

              {/* Review hero */}
              <div className="or-s1" style={{ background: `linear-gradient(135deg,${DC}0D,${DC}1C)`, border: `1.5px solid ${DC}2A`, borderRadius: 14, padding: "clamp(15px,1.8vw,22px)", marginBottom: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 5 }}>
                  <div style={{ width: 3, height: 38, borderRadius: 2, background: `linear-gradient(180deg,${DC},${DC}60)` }} />
                  <div style={{ fontFamily: F, fontSize: elder ? "clamp(15px,1.8vw,20px)" : "clamp(14px,1.6vw,18px)", fontWeight: 800, color: C.ink }}>
                    {isHi ? "विवरण की समीक्षा करें" : "Review Your Details"}
                  </div>
                </div>
                <div style={{ fontFamily: F, fontSize: fxs, color: C.muted, paddingLeft: 13, lineHeight: 1.6 }}>
                  {isHi
                    ? "सबमिट करने से पहले कृपया सभी जानकारी जांच लें। गलती होने पर 'संपादित करें' दबाएं।"
                    : "Please verify all information before submitting. Press 'Edit' to make changes."}
                </div>
              </div>

              {/* Selected issue badge */}
              <div className="or-s2" style={{ marginBottom: 14 }}>
                <div style={{ background: DL, border: `1.5px solid ${DC}2A`, borderRadius: 12, padding: "clamp(11px,1.3vw,15px) clamp(14px,1.7vw,18px)", display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: `${DC}14`, border: `1.5px solid ${DC}22`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <svg viewBox="0 0 24 24" fill={DC} aria-hidden="true" style={{ width: 19, height: 19 }}>
                      <path d={th.icon} />
                    </svg>
                  </div>
                  <div>
                    <div style={{ fontFamily: F, fontSize: fxs, color: DC, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".07em" }}>
                      {isHi ? "चयनित समस्या" : "Selected Issue"}
                    </div>
                    <div style={{ fontFamily: F, fontSize: fmd, fontWeight: 800, color: C.ink, marginTop: 2 }}>
                      {selIssue ? (isHi ? selIssue.hi : selIssue.en) : "—"}
                    </div>
                    <div style={{ fontFamily: F, fontSize: fxs, color: C.ghost }}>
                      {selIssue ? (isHi ? selIssue.en : selIssue.hi) : ""}
                    </div>
                  </div>
                </div>
              </div>

              {/* Summary card */}
              <div className="or-s3" style={{ background: C.white, border: `1.5px solid ${C.rule}`, borderRadius: 14, overflow: "hidden", boxShadow: "0 1px 3px rgba(7,24,56,.04)", marginBottom: 14 }}>
                <div style={{ background: C.surface, borderBottom: `1px solid ${C.rule}`, padding: "clamp(9px,1.1vw,13px) clamp(14px,1.7vw,20px)", display: "flex", alignItems: "center", gap: 8 }}>
                  <Ic path={I.person} size={13} color={C.ghost} />
                  <span style={{ fontFamily: F, fontSize: 10, fontWeight: 800, color: C.muted, letterSpacing: ".08em", textTransform: "uppercase" }}>
                    {isHi ? "सम्पूर्ण विवरण · Full Summary" : "Full Summary · सम्पूर्ण विवरण"}
                  </span>
                </div>
                <ReviewRow icon={I.person} label={isHi ? "नाम"      : "Full Name"}     labelEn={isHi ? "Full Name"    : "नाम"}            val={form.name}   />
                <ReviewRow icon={I.mobile} label={isHi ? "मोबाइल"  : "Mobile"}         labelEn={isHi ? "Mobile"       : "मोबाइल"}          val={form.mobile} mono />
                <ReviewRow icon={I.loc}    label={isHi ? "क्षेत्र"  : "Area"}           labelEn={isHi ? "Area"         : "क्षेत्र"}          val={form.area}   />
                {form.ward && (
                  <ReviewRow             label={isHi ? "वार्ड"     : "Ward No."}        labelEn={isHi ? "Ward"         : "वार्ड नंबर"}       val={form.ward}   />
                )}
                <ReviewRow icon={I.ticket} label={isHi ? "समस्या"  : "Issue Type"}     labelEn={isHi ? "Issue Type"   : "समस्या प्रकार"}    val={selIssue ? (isHi ? selIssue.hi : selIssue.en) : "—"} />
                {form.since && (
                  <ReviewRow icon={I.clock} label={isHi ? "कब से"  : "Issue Since"}     labelEn={isHi ? "Since"        : "कब से"}            val={selSince ? (isHi ? selSince.hi : selSince.en) : form.since} />
                )}
                <ReviewRow icon={I.note}   label={isHi ? "टिप्पणी" : "Remarks"}        labelEn={isHi ? "Remarks"      : "टिप्पणी"}          val={form.remarks || (isHi ? "(कोई नहीं)" : "(None)")} last />
              </div>

              {/* Dept info row */}
              <div className="or-s4" style={{ background: DL, border: `1.5px solid ${DC}22`, borderRadius: 13, padding: "clamp(11px,1.4vw,16px) clamp(14px,1.7vw,18px)", marginBottom: 14, display: "flex", gap: 12, alignItems: "center" }}>
                <div style={{ width: 40, height: 40, borderRadius: 11, background: `${DC}16`, border: `1.5px solid ${DC}22`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <svg viewBox="0 0 24 24" fill={DC} aria-hidden="true" style={{ width: 19, height: 19 }}>
                    <path d={th.icon} />
                  </svg>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: F, fontSize: fsm, fontWeight: 800, color: DC }}>
                    {isHi ? th.hiName : th.enName}
                  </div>
                  <div style={{ fontFamily: F, fontSize: fxs, color: C.muted, marginTop: 2, lineHeight: 1.5 }}>
                    {isHi
                      ? "शिकायत दर्ज होने पर SMS प्राप्त होगी · Report ID को सुरक्षित रखें"
                      : "You'll receive SMS on registration · Keep your Report ID safe"}
                  </div>
                </div>
                <div style={{ textAlign: "center", flexShrink: 0 }}>
                  <div style={{ fontFamily: F, fontSize: 8, color: C.ghost, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", marginBottom: 2 }}>{isHi ? "हेल्पलाइन" : "Helpline"}</div>
                  <div style={{ fontFamily: FM, fontSize: "clamp(16px,2.1vw,24px)", fontWeight: 900, color: DC }}>{th.helpline}</div>
                </div>
              </div>

              {/* API error */}
              {apiErr && (
                <div style={{ background: C.redBg, border: `1.5px solid ${C.redBd}`, borderRadius: 11, padding: "clamp(11px,1.3vw,14px) clamp(13px,1.6vw,16px)", marginBottom: 14, display: "flex", alignItems: "center", gap: 9 }}>
                  <Ic path={I.warn} size={17} color={C.red} />
                  <span style={{ fontFamily: F, fontSize: fsm, color: C.red, fontWeight: 600 }}>{apiErr}</span>
                </div>
              )}

              {/* ACTION BUTTONS */}
              <div className="or-s5 or-act">
                <button className="or-ghost"
                  style={{ border: `1.5px solid ${C.rule}`, color: C.slate }}
                  onClick={() => setStep(1)}>
                  <Ic path={I.back} size={17} color={C.slate} />
                  {isHi ? "संपादित करें" : "Edit Details"}
                </button>
                <button className="or-primary"
                  disabled={loading}
                  style={{ background: loading ? C.ghostLt : `linear-gradient(135deg,${DC},${th.colorMid})`, boxShadow: loading ? "none" : `0 4px 20px ${DC}44` }}
                  onClick={submit}>
                  {loading ? (
                    <>
                      <svg width={19} height={19} viewBox="0 0 24 24" fill={C.white} style={{ animation: "or-spin .75s linear infinite" }} aria-hidden="true">
                        <path d={I.spin} />
                      </svg>
                      {isHi ? "सबमिट हो रहा है..." : "Submitting..."}
                    </>
                  ) : (
                    <>
                      <Ic path={I.check} size={19} color={C.white} />
                      {isHi ? "रिपोर्ट सबमिट करें" : "Submit Report"}
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* ════════════ STEP 3 — CONFIRMATION ════════════ */}
          {step === 3 && result && (
            <div key="step3">

              {/* Success animation */}
              <div className="or-s1 or-pop" style={{ textAlign: "center", marginBottom: 24 }}>
                <div style={{ width: elder ? 96 : 80, height: elder ? 96 : 80, borderRadius: "50%", background: "#DCFCE7", border: `3px solid ${C.greenBd}`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px", boxShadow: "0 0 0 8px rgba(22,163,74,.1)" }}>
                  <svg width={elder ? 48 : 40} height={elder ? 48 : 40} viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polyline points="20 6 9 17 4 12"
                      style={{ strokeDasharray: 50, strokeDashoffset: 0, animation: "or-draw .55s ease .15s both" }} />
                  </svg>
                </div>
                <div style={{ fontFamily: F, fontSize: elder ? "clamp(22px,2.8vw,32px)" : "clamp(19px,2.4vw,27px)", fontWeight: 900, color: C.ink, letterSpacing: "-.02em", marginBottom: 8 }}>
                  {isHi ? "शिकायत दर्ज हो गई!" : "Report Submitted!"}
                </div>
                <div style={{ fontFamily: F, fontSize: elder ? "clamp(13px,1.5vw,16px)" : "clamp(12px,1.4vw,14px)", color: C.muted, maxWidth: 440, margin: "0 auto", lineHeight: 1.7 }}>
                  {result.message ?? (isHi
                    ? `हमारी टीम ${result.eta ?? "24 घंटे"} के अंदर समस्या सुलझाने का प्रयास करेगी।`
                    : `Our team will work to resolve the issue within ${result.eta ?? "24 hours"}.`)}
                </div>
              </div>

              {/* Priority badge */}
              <div className="or-s2" style={{ display: "flex", justifyContent: "center", marginBottom: 18 }}>
                <div style={{ background: priBg, border: `1.5px solid ${priBd}`, borderRadius: 999, padding: "8px 24px", display: "flex", alignItems: "center", gap: 9 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: priColor, animation: result?.priority === "CRITICAL" ? "or-rdot 1.3s ease-in-out infinite" : "or-pulse 2s infinite" }} />
                  <span style={{ fontFamily: F, fontSize: elder ? 15 : 13, fontWeight: 800, color: priColor, letterSpacing: ".08em", textTransform: "uppercase" }}>
                    {result.priority ?? "NORMAL"} {isHi ? "प्राथमिकता" : "PRIORITY"}
                  </span>
                </div>
              </div>

              {/* Report ID hero block */}
              <div className="or-s3" style={{ background: `linear-gradient(140deg,${C.navy},${C.navyMid})`, borderRadius: 14, padding: "clamp(18px,2.2vw,28px)", marginBottom: 14, textAlign: "center", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", inset: 0, pointerEvents: "none", opacity: .04, backgroundImage: "radial-gradient(circle,white 1px,transparent 1px)", backgroundSize: "22px 22px" }} />
                <div style={{ position: "absolute", inset: 0, opacity: .07, background: `radial-gradient(ellipse at 70% 40%,${DC},transparent 60%)`, pointerEvents: "none" }} />
                <div style={{ position: "relative", zIndex: 1 }}>
                  <div style={{ fontFamily: F, fontSize: 10, color: "rgba(255,255,255,.32)", fontWeight: 700, letterSpacing: ".13em", textTransform: "uppercase", marginBottom: 10 }}>
                    {isHi ? "रिपोर्ट संदर्भ क्रमांक" : "REPORT REFERENCE NUMBER"}
                  </div>
                  <div style={{ fontFamily: FM, fontSize: "clamp(24px,3.2vw,38px)", fontWeight: 900, color: DC, letterSpacing: ".07em", marginBottom: 14, textShadow: `0 0 30px ${DC}55` }}>
                    {result.reportId}
                  </div>
                  <button onClick={doCopy} style={{ background: copied ? "rgba(22,163,74,.22)" : "rgba(255,255,255,.1)", border: `1px solid ${copied ? "#4ADE8066" : "rgba(255,255,255,.2)"}`, borderRadius: 9, padding: "9px 22px", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 7, transition: "all .22s" }}>
                    <Ic path={copied ? I.check : I.copy} size={14} color={copied ? "#4ADE80" : "rgba(255,255,255,.75)"} />
                    <span style={{ fontFamily: F, fontSize: elder ? 14 : 12, color: copied ? "#4ADE80" : "rgba(255,255,255,.75)", fontWeight: 700 }}>
                      {copied ? (isHi ? "ID कॉपी हो गई!" : "ID Copied!") : (isHi ? "Report ID कॉपी करें" : "Copy Report ID")}
                    </span>
                  </button>
                </div>
              </div>

              {/* Detailed summary */}
              <div className="or-s4" style={{ background: C.white, border: `1.5px solid ${C.rule}`, borderRadius: 14, overflow: "hidden", boxShadow: "0 1px 3px rgba(7,24,56,.04)", marginBottom: 14 }}>
                <div style={{ background: C.surface, borderBottom: `1px solid ${C.rule}`, padding: "clamp(10px,1.2vw,14px) clamp(14px,1.7vw,20px)" }}>
                  <span style={{ fontFamily: F, fontSize: 10, fontWeight: 800, color: C.muted, letterSpacing: ".08em", textTransform: "uppercase" }}>
                    {isHi ? "रिपोर्ट सारांश · Report Summary" : "Report Summary · रिपोर्ट सारांश"}
                  </span>
                </div>
                <ReviewRow icon={I.ticket}   label={isHi ? "रिपोर्ट ID"        : "Report ID"}        labelEn={isHi ? "Report ID"       : "रिपोर्ट ID"}         val={result.reportId}   mono accent={DC}        />
                <ReviewRow icon={I.person}   label={isHi ? "नाम"               : "Full Name"}         labelEn={isHi ? "Name"            : "नाम"}                  val={form.name}                                 />
                <ReviewRow icon={I.mobile}   label={isHi ? "मोबाइल"            : "Mobile"}            labelEn={isHi ? "Mobile"          : "मोबाइल"}               val={form.mobile}       mono                    />
                <ReviewRow icon={I.loc}      label={isHi ? "क्षेत्र"            : "Area"}              labelEn={isHi ? "Area"            : "क्षेत्र"}               val={form.area}                                 />
                <ReviewRow icon={I.ticket}   label={isHi ? "समस्या प्रकार"      : "Issue Type"}        labelEn={isHi ? "Issue"           : "समस्या"}               val={selIssue ? (isHi ? selIssue.hi : selIssue.en) : "—"} />
                <ReviewRow icon={I.priority} label={isHi ? "प्राथमिकता"         : "Priority"}          labelEn={isHi ? "Priority"        : "प्राथमिकता"}            val={result.priority ?? "NORMAL"} accent={priColor} />
                <ReviewRow icon={I.clock}    label={isHi ? "अपेक्षित समाधान"    : "Expected ETA"}      labelEn={isHi ? "ETA"             : "अनुमानित समय"}          val={result.eta ?? (isHi ? "24 घंटे" : "24 hours")}  />
                <ReviewRow icon={I.sms}      label={isHi ? "SMS स्थिति"         : "SMS Status"}        labelEn={isHi ? "Sending to"      : "पर भेज रहे हैं"}        val={isHi ? `${form.mobile} पर भेजा जा रहा है` : `Sending to ${form.mobile}`} accent={C.green} last />
              </div>

              {/* Duplicate detected */}
              {result.isDuplicate && (
                <div className="or-s5" style={{ background: C.amberBg, border: `1.5px solid ${C.amberBd}`, borderRadius: 12, padding: "clamp(12px,1.5vw,16px) clamp(14px,1.7vw,18px)", marginBottom: 14, display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <div style={{ width: 3, alignSelf: "stretch", background: C.amber, borderRadius: 2, flexShrink: 0 }} />
                  <div style={{ width: 34, height: 34, borderRadius: 9, background: C.amberBg, border: `1.5px solid ${C.amberBd}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Ic path={I.merge} size={17} color={C.amber} />
                  </div>
                  <div>
                    <div style={{ fontFamily: F, fontSize: fsm, fontWeight: 800, color: C.amber, marginBottom: 4 }}>
                      {isHi ? "पहले से दर्ज शिकायत मिली" : "Existing Report Detected"}
                    </div>
                    <div style={{ fontFamily: F, fontSize: fxs, color: C.muted, lineHeight: 1.6 }}>
                      {isHi
                        ? `इस क्षेत्र के लिए पहले से रिपोर्ट दर्ज है (ID: ${result.existingId})। आपकी रिपोर्ट उसमें जोड़ दी गई है।`
                        : `An existing report was found for this area (ID: ${result.existingId}). Your report has been merged with it.`}
                    </div>
                  </div>
                </div>
              )}

              {/* SMS confirmation strip */}
              <div className="or-s6" style={{ background: C.greenBg, border: `1.5px solid ${C.greenBd}`, borderRadius: 12, padding: "clamp(12px,1.4vw,15px) clamp(14px,1.7vw,18px)", marginBottom: 22, display: "flex", gap: 11, alignItems: "center" }}>
                <div style={{ width: 34, height: 34, borderRadius: 9, background: "#DCFCE7", border: `1.5px solid ${C.greenBd}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Ic path={I.sms} size={16} color={C.green} />
                </div>
                <div style={{ fontFamily: F, fontSize: fxs, color: C.greenDp, fontWeight: 600, lineHeight: 1.6 }}>
                  {isHi
                    ? `SMS पुष्टि ${form.mobile} पर भेजी जा रही है — Report ID: ${result.reportId} — स्क्रीनशॉट लेकर सुरक्षित रखें`
                    : `SMS confirmation sending to ${form.mobile} — Report ID: ${result.reportId} — Take a screenshot to keep`}
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="or-s7 or-act">
                <button className="or-primary"
                  style={{ background: "linear-gradient(135deg,#15803D,#16A34A)", boxShadow: "0 4px 18px rgba(21,128,61,.32)" }}
                  onClick={() => window.print?.()}>
                  <Ic path={I.print} size={18} color={C.white} />
                  {isHi ? "रसीद प्रिंट करें" : "Print Receipt"}
                </button>
                <button className="or-ghost"
                  style={{ border: `1.5px solid ${C.rule}`, color: C.slate }}
                  onClick={() => setScreen("home")}>
                  <Ic path={I.home} size={17} color={C.slate} />
                  {isHi ? "होम पर वापस जाएं" : "Return to Home"}
                </button>
              </div>

            </div>
          )}

        </div>
      </div>

      {/* ── FOOTER STRIP ── */}
      <footer style={{ background: C.white, borderTop: `1px solid ${C.rule}`, padding: "clamp(9px,1vw,12px) clamp(16px,2.2vw,28px)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8, flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <Ic path={I.shield} size={12} color={C.green} />
          <span style={{ fontFamily: F, fontSize: "clamp(9px,.9vw,11px)", color: C.ghost, fontWeight: 600 }}>
            {isHi ? "सुरक्षित · एन्क्रिप्टेड · सरकारी पोर्टल" : "Secure · Encrypted · Government Portal"}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: C.green, animation: "or-pulse 2s infinite" }} />
          <span style={{ fontFamily: FM, fontSize: "clamp(9px,.9vw,10px)", color: C.ghostLt, letterSpacing: ".04em" }}>
            SUVIDHA · C-DAC · 24×7 · v2.1
          </span>
        </div>
      </footer>
    </div>
  );
}

// ── NAMED SHORTCUTS ──────────────────────────────────────────────────────────
export const ElecOutage    = (p) => <OutageReport {...p} dept="electricity" />;
export const GasLeak       = (p) => <OutageReport {...p} dept="gas"         />;
export const WaterReport   = (p) => <OutageReport {...p} dept="water"       />;
export const MunicipalComp = (p) => <OutageReport {...p} dept="municipal"   />;