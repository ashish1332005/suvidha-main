/**
 * DeptScreen.jsx — Premium Government Kiosk Department Screen
 * ✅ Professional Govt. UI/UX — authoritative, trustworthy, accessible
 * ✅ Fully bilingual (Hindi primary, English secondary) via `t` prop
 * ✅ Elder/Senior mode — larger tap targets, bigger fonts
 * ✅ Responsive: Kiosk 1280px · Laptop 1024px · Mobile 360px
 * ✅ Animated — staggered entry, hover states, active feedback
 */

import { DC } from "../data/constants";

// ─── GLOBAL CSS ───────────────────────────────────────────────────
const DEPT_CSS = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700;9..40,800;9..40,900&family=DM+Mono:wght@500;600&family=Noto+Sans+Devanagari:wght@400;500;600;700;800&display=swap');

:root {
  --font-sans: 'DM Sans','Noto Sans Devanagari','Segoe UI',system-ui,sans-serif;
  --font-mono: 'DM Mono','Courier New',monospace;
}

@keyframes ds-fade-up   { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
@keyframes ds-fade-in   { from{opacity:0} to{opacity:1} }
@keyframes ds-scale-in  { from{opacity:0;transform:scale(.96)} to{opacity:1;transform:scale(1)} }
@keyframes ds-pulse-dot { 0%,100%{box-shadow:0 0 0 0 rgba(220,38,38,.4)} 70%{box-shadow:0 0 0 8px rgba(220,38,38,0)} 100%{box-shadow:0 0 0 0 rgba(220,38,38,0)} }
@keyframes ds-shimmer   { from{background-position:200% 0} to{background-position:-200% 0} }

.ds-root {
  flex: 1;
  background: #EEF2F7;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  font-family: var(--font-sans);
  animation: ds-fade-in .3s ease;
}

/* ── SERVICE CARD ── */
.ds-svc-card {
  background: white;
  border-radius: 14px;
  border: 1.5px solid #DDE6F0;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: clamp(12px,1.4vw,16px);
  padding: clamp(14px,1.7vw,18px) clamp(14px,1.6vw,18px);
  text-align: left;
  width: 100%;
  box-shadow: 0 1px 4px rgba(7,24,56,.05), 0 4px 16px rgba(7,24,56,.04);
  position: relative;
  overflow: hidden;
  transition: transform .18s cubic-bezier(.34,1.56,.64,1), box-shadow .18s ease, border-color .18s ease;
  animation: ds-fade-up .38s ease both;
}
.ds-svc-card::before {
  content:'';
  position: absolute;
  left: 0; top: 0; bottom: 0;
  width: 4px;
  background: var(--dept-color, #1558A0);
  border-radius: 2px 0 0 2px;
}
.ds-svc-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(7,24,56,.1), 0 1px 4px rgba(7,24,56,.06);
  border-color: var(--dept-color, #1558A0);
}
.ds-svc-card:active {
  transform: translateY(0) scale(.99);
}

/* Emergency card */
.ds-svc-card.emergency {
  background: linear-gradient(135deg, #FFF5F5 0%, #FFF0F0 100%);
  border-color: #FCA5A5;
  --dept-color: #DC2626;
}
.ds-svc-card.emergency::before { background: #DC2626; }
.ds-svc-card.emergency:hover   { border-color: #EF4444; box-shadow: 0 4px 20px rgba(220,38,38,.12); }

/* ── BREADCRUMB ── */
.ds-breadcrumb {
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: var(--font-sans);
  font-size: clamp(11px,1.1vw,13px);
  color: #94A3B8;
  font-weight: 500;
}
.ds-breadcrumb-sep {
  width: 4px; height: 4px;
  border-radius: 50%;
  background: #CBD5E1;
  flex-shrink: 0;
}

/* ── SECTION LABEL ── */
.ds-section-label {
  font-family: var(--font-sans);
  font-size: clamp(10px,1vw,11px);
  font-weight: 800;
  letter-spacing: .1em;
  text-transform: uppercase;
  color: #94A3B8;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
}
.ds-section-label::after {
  content:'';
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, #E2E8F0 0%, transparent 100%);
}

/* ── BADGE ── */
.ds-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 9px;
  border-radius: 4px;
  font-family: var(--font-sans);
  font-size: 10px;
  font-weight: 800;
  letter-spacing: .07em;
  text-transform: uppercase;
}

/* STAT PILL */
.ds-stat-pill {
  background: rgba(255,255,255,.12);
  border: 1px solid rgba(255,255,255,.18);
  border-radius: 8px;
  padding: clamp(8px,1vw,10px) clamp(12px,1.4vw,16px);
  text-align: center;
  flex-shrink: 0;
}

/* BACK BUTTON */
.ds-back-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-family: var(--font-sans);
  font-size: clamp(13px,1.3vw,14px);
  font-weight: 600;
  color: #64748B;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 6px 10px 6px 0;
  border-radius: 6px;
  transition: color .15s;
}
.ds-back-btn:hover { color: #0A2342; }

/* ARROW CHIP */
.ds-arrow-chip {
  width: 32px; height: 32px;
  border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
  transition: transform .18s ease;
}
.ds-svc-card:hover .ds-arrow-chip {
  transform: translateX(3px);
}

/* GRID */
.ds-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 320px), 1fr));
  gap: clamp(9px,1.2vw,13px);
}
@media (max-width: 600px) {
  .ds-grid { grid-template-columns: 1fr !important; }
}

/* EMERGENCY PULSE */
.ds-emerg-dot {
  width: 10px; height: 10px;
  border-radius: 50%;
  background: #DC2626;
  animation: ds-pulse-dot 1.6s ease-in-out infinite;
  flex-shrink: 0;
}

/* STAGGER DELAYS */
.ds-svc-card:nth-child(1)  { animation-delay: .04s }
.ds-svc-card:nth-child(2)  { animation-delay: .07s }
.ds-svc-card:nth-child(3)  { animation-delay: .10s }
.ds-svc-card:nth-child(4)  { animation-delay: .13s }
.ds-svc-card:nth-child(5)  { animation-delay: .16s }
.ds-svc-card:nth-child(6)  { animation-delay: .19s }
.ds-svc-card:nth-child(7)  { animation-delay: .22s }
.ds-svc-card:nth-child(8)  { animation-delay: .25s }
.ds-svc-card:nth-child(9)  { animation-delay: .28s }
.ds-svc-card:nth-child(10) { animation-delay: .31s }
.ds-svc-card:nth-child(11) { animation-delay: .34s }
.ds-svc-card:nth-child(12) { animation-delay: .37s }
.ds-svc-card:nth-child(13) { animation-delay: .40s }
`;

// ─── SVG ICON ─────────────────────────────────────────────────────
function Ic({ path, size = 20, color = "currentColor", style: s = {} }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}
      aria-hidden="true" style={{ flexShrink: 0, display: "block", ...s }}>
      <path d={path} />
    </svg>
  );
}

// ─── SERVICE ICON PATHS ───────────────────────────────────────────
const SVC = {
  bill:       "M20 4H4C2.9 4 2 4.9 2 6V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4ZM20 18H4V8H20V18ZM6 10H8V12H6V10ZM10 10H18V12H10V10ZM6 14H8V16H6V14ZM10 14H16V16H10V14Z",
  newConn:    "M17 12H13V8H11V12H7V14H11V18H13V14H17V12ZM19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM19 19H5V5H19V19Z",
  complaint:  "M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2ZM20 16H6L4 18V4H20V16Z",
  alert:      "M12 2L1 21H23L12 2ZM12 6L19.53 19H4.47L12 6ZM11 10V14H13V10H11ZM11 16V18H13V16H11Z",
  outage:     "M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 17H11V15H13V17ZM13 13H11V7H13V13Z",
  history:    "M13 3C8.03 3 4 7.03 4 12H1L4.89 15.89L4.96 16.03L9 12H6C6 8.13 9.13 5 13 5C16.87 5 20 8.13 20 12C20 15.87 16.87 19 13 19C11.07 19 9.32 18.21 8.06 16.94L6.64 18.36C8.27 19.99 10.51 21 13 21C17.97 21 22 16.97 22 12C22 7.03 17.97 3 13 3ZM12 8V13L16.28 15.54L17 14.33L13.5 12.25V8H12Z",
  shield:     "M12 1L3 5V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V5L12 1ZM11 15L7 11L8.41 9.59L11 12.17L15.59 7.58L17 9L11 15Z",
  bolt:       "M13 2L4.5 13.5H11L10 22L19.5 10.5H13L13 2Z",
  edit:       "M3 17.25V21H6.75L17.81 9.94L14.06 6.19L3 17.25ZM20.71 7.04C21.1 6.65 21.1 6.02 20.71 5.63L18.37 3.29C17.98 2.9 17.35 2.9 16.96 3.29L15.13 5.12L18.88 8.87L20.71 7.04Z",
  transfer:   "M7.41 8.59L12 13.17L16.59 8.59L18 10L12 16L6 10L7.41 8.59ZM6 6H18V8H6V6Z",
  meter:      "M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20ZM12.5 7H11V13L16.25 16.15L17 14.92L12.5 12.25V7Z",
  star:       "M12 17.27L18.18 21L16.54 13.97L22 9.24L14.81 8.62L12 2L9.19 8.62L2 9.24L7.45 13.97L5.82 21L12 17.27Z",
  rupee:      "M11.8 10.9C9.53 10.31 8.8 9.7 8.8 8.75C8.8 7.66 9.81 6.9 11.5 6.9C13.28 6.9 13.94 7.75 14 9H16.21C16.14 7.28 15.09 5.7 13 5.19V3H10V5.16C8.06 5.58 6.5 6.84 6.5 8.77C6.5 11.08 8.41 12.23 11.2 12.9C13.7 13.5 14.2 14.38 14.2 15.31C14.2 16 13.71 17.1 11.5 17.1C9.44 17.1 8.63 16.18 8.5 15H6.32C6.44 17.19 8.08 18.42 10 18.83V21H13V18.85C14.95 18.48 16.5 17.35 16.5 15.3C16.5 12.46 14.07 11.49 11.8 10.9Z",
  water:      "M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.58 20 4 16.42 4 12C4 7.58 7.58 4 12 4C16.42 4 20 7.58 20 12C20 16.42 16.42 20 12 20ZM10.5 15.5C10.5 16.33 11.17 17 12 17C12.83 17 13.5 16.33 13.5 15.5C13.5 14.33 12 12 12 12C12 12 10.5 14.33 10.5 15.5Z",
  person:     "M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z",
  doc:        "M14 6L13 4H5V21H7V14H12L13 16H20V6H14ZM18 14H14L13 12H7V6H12L13 8H18V14Z",
  house:      "M10 20V14H14V20H19V12H22L12 3L2 12H5V20H10Z",
  leaf:       "M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22L6.66 19.7C7.14 19.87 7.64 20 8 20C19 20 22 3 22 3C21 5 14 5.25 9 6.25C4 7.25 2 11.5 2 13.5C2 15.5 3.75 17.25 3.75 17.25C7 8 17 8 17 8Z",
  heart:      "M12 21.35L10.55 20.03C5.4 15.36 2 12.27 2 8.5C2 5.41 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.08C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.41 22 8.5C22 12.27 18.6 15.36 13.45 20.03L12 21.35Z",
  flame:      "M12 2C12 2 9 7 9 11C9 11 7 9.5 7 7.5C5 10 4 13 4 15C4 19.42 7.58 23 12 23C16.42 23 20 19.42 20 15C20 10 12 2 12 2Z",
  grad:       "M12 3L1 9L12 15L21 10.09V17H23V9L12 3ZM5 13.18V17.18L12 21L19 17.18V13.18L12 17L5 13.18Z",
  pin:        "M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9C9.5 7.62 10.62 6.5 12 6.5C13.38 6.5 14.5 7.62 14.5 9C14.5 10.38 13.38 11.5 12 11.5Z",
  phone:      "M6.62 10.79C8.06 13.62 10.38 15.93 13.21 17.38L15.41 15.18C15.68 14.91 16.08 14.82 16.43 14.94C17.55 15.31 18.76 15.51 20 15.51C20.55 15.51 21 15.96 21 16.51V20C21 20.55 20.55 21 20 21C10.61 21 3 13.39 3 4C3 3.45 3.45 3 4 3H7.5C8.05 3 8.5 3.45 8.5 4C8.5 5.25 8.7 6.45 9.07 7.57C9.18 7.92 9.1 8.31 8.82 8.59L6.62 10.79Z",
  faq:        "M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 19H11V17H13V19ZM15.07 11.25L14.17 12.17C13.45 12.9 13 13.5 13 15H11V14.5C11 13.4 11.45 12.4 12.17 11.67L13.41 10.41C13.78 10.05 14 9.55 14 9C14 7.9 13.1 7 12 7C10.9 7 10 7.9 10 9H8C8 6.79 9.79 5 12 5C14.21 5 16 6.79 16 9C16 9.88 15.64 10.68 15.07 11.25Z",
  back:       "M20 11H7.83L13.42 5.41L12 4L4 12L12 20L13.41 18.59L7.83 13H20V11Z",
  chevR:      "M10 6L8.59 7.41L13.17 12L8.59 16.59L10 18L16 12L10 6Z",
  propTax:    "M10 20V14H14V20H19V12H22L12 3L2 12H5V20H10Z",
  cert:       "M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2ZM16 18H8V16H16V18ZM16 14H8V12H16V14ZM13 9V3.5L18.5 9H13Z",
  track:      "M13 3C8.03 3 4 7.03 4 12H1L4.89 15.89L4.96 16.03L9 12H6C6 8.13 9.13 5 13 5C16.87 5 20 8.13 20 12C20 15.87 16.87 19 13 19C11.07 19 9.32 18.21 8.06 16.94L6.64 18.36C8.27 19.99 10.51 21 13 21C17.97 21 22 16.97 22 12C22 7.03 17.97 3 13 3ZM12 8V13L16.28 15.54L17 14.33L13.5 12.25V8H12Z",
  sanit:      "M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2ZM20 16H6L4 18V4H20V16ZM11 13H13V15H11V13ZM11 7H13V11H11V7Z",
  light:      "M9 21C9 21.55 9.45 22 10 22H14C14.55 22 15 21.55 15 21V20H9V21ZM12 2C8.14 2 5 5.14 5 9C5 11.38 6.19 13.47 8 14.74V17C8 17.55 8.45 18 9 18H15C15.55 18 16 17.55 16 17V14.74C17.81 13.47 19 11.38 19 9C19 5.14 15.86 2 12 2ZM14.85 13.1L14 13.7V16H10V13.7L9.15 13.1C7.8 12.16 7 10.63 7 9C7 6.24 9.24 4 12 4C14.76 4 17 6.24 17 9C17 10.63 16.2 12.16 14.85 13.1Z",
};

const DEPT_ICONS = {
  electricity: "M13 2L4.5 13.5H11L10 22L19.5 10.5H13L13 2Z",
  gas:         "M12 2C12 2 9 7 9 11C9 11 7 9.5 7 7.5C5 10 4 13 4 15C4 19.42 7.58 23 12 23C16.42 23 20 19.42 20 15C20 10 12 2 12 2Z",
  municipal:   "M2 20V8L12 2L22 8V20H16V14H8V20H2ZM4 18H6V12H18V18H20V9L12 4.5L4 9V18ZM8 20V16H16V20H8Z",
  info:        "M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 17H11V11H13V17ZM13 9H11V7H13V9Z",
};

// ─── DEPT META ────────────────────────────────────────────────────
// Bilingual dept names + taglines
const DEPT_META = {
  electricity: {
    nameHi: "बिजली विभाग",      nameEn: "Electricity Department",
    tagHi:  "विद्युत सेवाएं",   tagEn:  "Power & Connection Services",
    helpNo: "1912",
    helpLabelHi: "बिजली शिकायत",helpLabelEn: "Helpline",
  },
  gas: {
    nameHi: "गैस सेवाएं",        nameEn: "Gas Services",
    tagHi:  "रसोई गैस सेवाएं",  tagEn:  "LPG & Piped Gas Services",
    helpNo: "1906",
    helpLabelHi: "गैस आपातकाल", helpLabelEn: "Emergency",
  },
  municipal: {
    nameHi: "नगर पालिका",        nameEn: "Municipal Corporation",
    tagHi:  "नागरिक सुविधाएं",  tagEn:  "Urban Civic Services",
    helpNo: "1916",
    helpLabelHi: "जल आपूर्ति",  helpLabelEn: "Water Helpline",
  },
  info: {
    nameHi: "सूचना केंद्र",      nameEn: "Information Centre",
    tagHi:  "योजनाएं व सेवाएं", tagEn:  "Schemes, Helplines & Locator",
    helpNo: "1800-180-1551",
    helpLabelHi: "सूचना",        helpLabelEn: "Info Line",
  },
};

// ─── MENU BUILDER (unchanged logic, same subType keys) ────────────
function getMenus(t) {
  return {
    electricity: [
      { icon:SVC.bill,      label:t.elec.billPay,      subType:"elec_bill",       er:false },
      { icon:SVC.newConn,   label:t.elec.newConn,      subType:"elec_newconn",    er:false },
      { icon:SVC.complaint, label:t.elec.complaint,    subType:"elec_complaint",  er:false },
      { icon:SVC.outage,    label:t.elec.outage,       subType:"elec_outage",     er:false },
      { icon:SVC.history,   label:t.elec.history,      subType:"elec_history",    er:false },
      { icon:SVC.shield,    label:t.elec.theft,        subType:"elec_theft",      er:false },
      { icon:SVC.bolt,      label:t.elec.loadEnhance,  subType:"elec_load",       er:false },
      { icon:SVC.edit,      label:t.elec.nameChange,   subType:"elec_namechange", er:false },
    ],
    gas: [
      { icon:SVC.bill,      label:t.gas.billPay,    subType:"gas_bill",      er:false },
      { icon:SVC.alert,     label:t.gas.leak,        subType:"gas_leak",      er:true  },
      { icon:SVC.newConn,   label:t.gas.newConn,    subType:"gas_newconn",   er:false },
      { icon:SVC.transfer,  label:t.gas.transfer,   subType:"gas_transfer",  er:false },
      { icon:SVC.meter,     label:t.gas.meter,      subType:"gas_meter",     er:false },
      { icon:SVC.star,      label:t.gas.scheme,     subType:"gas_scheme",    er:false },
      { icon:SVC.complaint, label:t.gas.complaint,  subType:"gas_complaint", er:false },
      { icon:SVC.rupee,     label:t.gas.subsidy,    subType:"gas_subsidy",   er:false },
    ],
    municipal: [
      { label:t.muni.propTax,   subType:"muni_proptax",     icon:SVC.propTax,  er:false },
      { label:t.muni.water,     subType:"muni_water",       icon:SVC.water,    er:false },
      { label:t.muni.birth,     subType:"muni_certificate", icon:SVC.cert,     cert:"birth",    er:false },
      { label:t.muni.death,     subType:"muni_certificate", icon:SVC.cert,     cert:"death",    er:false },
      { label:t.muni.marriage,  subType:"muni_certificate", icon:SVC.cert,     cert:"marriage", er:false },
      { label:t.muni.trade,     subType:"muni_certificate", icon:SVC.cert,     cert:"trade",    er:false },
      { label:t.muni.building,  subType:"muni_certificate", icon:SVC.cert,     cert:"building", er:false },
      { label:t.muni.park,      subType:"muni_certificate", icon:SVC.cert,     cert:"park",     er:false },
      { label:"Lodge Complaint",subType:"muni_complaint",   icon:SVC.complaint,er:false },
      { label:"New Water Conn.",subType:"muni_newwater",    icon:SVC.water,    er:false },
      { label:"Track Status",   subType:"muni_track",       icon:SVC.track,    er:false },
      { label:"Sanitation",     subType:"muni_sanitation",  icon:SVC.sanit,    er:false },
      { label:"Street Light",   subType:"muni_streetlight", icon:SVC.light,    er:false },
    ],
    info: [
      { icon:SVC.house,     label:t.info.pmAwas,      subType:"info_scheme",    er:false },
      { icon:SVC.leaf,      label:t.info.pmKisan,     subType:"info_scheme",    er:false },
      { icon:SVC.heart,     label:t.info.ayushman,    subType:"info_scheme",    er:false },
      { icon:SVC.flame,     label:t.info.ujjwala,     subType:"info_scheme",    er:false },
      { icon:SVC.grad,      label:t.info.scholarship, subType:"info_scheme",    er:false },
      { icon:SVC.pin,       label:t.info.locator,     subType:"info_helpline",  er:false },
      { icon:SVC.phone,     label:t.info.helpline,    subType:"info_helpline",  er:false },
      { icon:SVC.faq,       label:t.info.faq,         subType:"info_helpline",  er:false },
    ],
  };
}

const getDeptTitle = (t) => ({
  electricity: t.elec.title,
  gas:         t.gas.title,
  municipal:   t.muni.title,
  info:        t.info.title,
});

// ═══════════════════════════════════════════════════════════════
//  DEPT SCREEN
// ═══════════════════════════════════════════════════════════════
export function DeptScreen({ t, dept, lang = "en", setScreen, setFlow, senior }) {
  const isHi    = lang === "hi";
  const c       = DC[dept];
  const items   = getMenus(t)[dept] || [];
  const title   = getDeptTitle(t)[dept];
  const deptIcon= DEPT_ICONS[dept];
  const meta    = DEPT_META[dept];
  const hasEmerg= items.some(m => m.er);

  // Split emergency items from regular
  const emergItems  = items.filter(m => m.er);
  const regularItems= items.filter(m => !m.er);

  const handleSelect = (m) => {
    setFlow({ subType:m.subType, label:m.label, dept, cert:m.cert||null });
    setScreen("flow");
  };

  return (
    <div className="ds-root">
      <style>{DEPT_CSS}</style>

      {/* ══════════════════════════════════════════════
          HEADER — gradient, dept color accent
      ══════════════════════════════════════════════ */}
      <div style={{
        background:`linear-gradient(135deg, #071828 0%, #0A2340 60%, ${c.color}22 100%)`,
        borderBottom:`4px solid ${c.color}`,
        padding:"clamp(14px,1.8vw,22px) clamp(16px,2.5vw,40px) clamp(16px,2vw,24px)",
        flexShrink:0,
        position:"relative",
        overflow:"hidden",
      }}>
        {/* decorative diagonal stripe */}
        <div style={{
          position:"absolute", right:0, top:0, bottom:0, width:"30%",
          background:`linear-gradient(135deg, transparent 40%, ${c.color}08 100%)`,
          pointerEvents:"none",
        }}/>
        {/* subtle dot grid */}
        <div style={{
          position:"absolute", inset:0, pointerEvents:"none", opacity:.04,
          backgroundImage:`radial-gradient(circle, white 1px, transparent 1px)`,
          backgroundSize:"24px 24px",
        }}/>

        {/* BACK BUTTON */}
        <button className="ds-back-btn" onClick={() => setScreen("home")} style={{ color:"rgba(255,255,255,.6)", marginBottom:14 }}>
          <Ic path={SVC.back} size={16} color="rgba(255,255,255,.6)" />
          <span style={{ fontFamily:"var(--font-sans)", fontSize:"clamp(12px,1.2vw,14px)", fontWeight:600, letterSpacing:".01em" }}>
            {isHi ? "← होम" : "← Home"}
          </span>
        </button>

        {/* HEADER BODY */}
        <div style={{ display:"flex", alignItems:"flex-start", gap:"clamp(14px,1.8vw,20px)", flexWrap:"wrap", position:"relative", zIndex:1 }}>

          {/* Dept Icon Box */}
          <div style={{
            width:"clamp(52px,6vw,68px)", height:"clamp(52px,6vw,68px)",
            borderRadius:16, flexShrink:0,
            background:`linear-gradient(135deg, ${c.color} 0%, ${c.color}BB 100%)`,
            boxShadow:`0 6px 24px ${c.color}44`,
            display:"flex", alignItems:"center", justifyContent:"center",
            border:`2px solid ${c.color}60`,
          }}>
            <Ic path={deptIcon} size={28} color="white" />
          </div>

          {/* Dept name + breadcrumb */}
          <div style={{ flex:1, minWidth:0, paddingTop:2 }}>
            {/* Breadcrumb */}
            <div className="ds-breadcrumb" style={{ marginBottom:6 }}>
              <span style={{ color:"rgba(255,255,255,.35)" }}>SUVIDHA</span>
              <div className="ds-breadcrumb-sep"/>
              <span style={{ color:`${c.color}CC`, fontWeight:600 }}>
                {isHi ? meta.nameHi : meta.nameEn}
              </span>
            </div>

            {/* Title */}
            <h2 style={{
              fontFamily:"var(--font-sans)",
              fontSize:"clamp(20px,2.6vw,30px)",
              fontWeight:800, color:"white", lineHeight:1.15,
              marginBottom:4, letterSpacing:"-.01em",
            }}>
              {isHi ? meta.nameHi : meta.nameEn}
            </h2>
            <p style={{
              fontFamily:"var(--font-sans)",
              fontSize:"clamp(11px,1.2vw,13px)",
              color:"rgba(255,255,255,.42)", fontWeight:500,
            }}>
              {isHi ? meta.tagHi : meta.tagEn}
            </p>
          </div>

          {/* STAT PILLS — right side */}
          <div style={{ display:"flex", gap:8, alignItems:"center", flexShrink:0, flexWrap:"wrap" }}>
            {/* Service count */}
            <div className="ds-stat-pill">
              <div style={{
                fontFamily:"var(--font-mono)",
                fontSize:"clamp(18px,2.2vw,24px)", fontWeight:700,
                color:"white", lineHeight:1,
              }}>{items.length}</div>
              <div style={{ fontFamily:"var(--font-sans)", fontSize:9, color:"rgba(255,255,255,.4)", fontWeight:700, letterSpacing:".08em", textTransform:"uppercase", marginTop:3 }}>
                {isHi ? "सेवाएं" : "Services"}
              </div>
            </div>

            {/* Helpline pill */}
            <div style={{
              background:`${c.color}22`,
              border:`1.5px solid ${c.color}44`,
              borderRadius:8, padding:"clamp(8px,1vw,10px) clamp(12px,1.4vw,16px)",
              textAlign:"center", flexShrink:0,
            }}>
              <div style={{ fontFamily:"var(--font-sans)", fontSize:9, color:`${c.color}AA`, fontWeight:700, letterSpacing:".08em", textTransform:"uppercase", marginBottom:3 }}>
                {isHi ? meta.helpLabelHi : meta.helpLabelEn}
              </div>
              <div style={{ fontFamily:"var(--font-mono)", fontSize:"clamp(13px,1.5vw,17px)", fontWeight:800, color:c.color, lineHeight:1, letterSpacing:".02em" }}>
                {meta.helpNo}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════
          EMERGENCY BANNER (gas leak only)
      ══════════════════════════════════════════════ */}
      {hasEmerg && (
        <div style={{
          background:"linear-gradient(135deg,#450A0A,#7F1D1D)",
          borderBottom:"3px solid #DC2626",
          padding:"clamp(10px,1.2vw,14px) clamp(16px,2.5vw,40px)",
          display:"flex", alignItems:"center", gap:14, flexShrink:0,
        }}>
          <div className="ds-emerg-dot"/>
          <div style={{ flex:1 }}>
            <span style={{ fontFamily:"var(--font-sans)", fontSize:"clamp(12px,1.3vw,14px)", color:"white", fontWeight:700 }}>
              {isHi
                ? "गैस आपातकाल? तुरंत "
                : "Gas emergency? Call "}
              <span style={{ fontFamily:"var(--font-mono)", fontSize:"clamp(14px,1.5vw,16px)", color:"#FCA5A5", fontWeight:800 }}>1906</span>
              {isHi
                ? " पर कॉल करें। बिजली के स्विच न छुएं।"
                : " immediately. Do not use any electrical switches."}
            </span>
          </div>
          <div style={{ background:"#DC2626", borderRadius:6, padding:"4px 12px", flexShrink:0 }}>
            <span style={{ fontFamily:"var(--font-sans)", fontSize:10, fontWeight:800, color:"white", letterSpacing:".1em" }}>
              {isHi ? "आपातकाल" : "EMERGENCY"}
            </span>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════
          COLOUR ACCENT BAR (dept-specific thin strip)
      ══════════════════════════════════════════════ */}
      <div style={{
        height:3,
        background:`linear-gradient(90deg, ${c.color} 0%, ${c.color}44 60%, transparent 100%)`,
        flexShrink:0,
      }}/>

      {/* ══════════════════════════════════════════════
          SERVICE LIST
      ══════════════════════════════════════════════ */}
      <div style={{
        padding:"clamp(16px,2vw,28px) clamp(16px,2.5vw,40px) 40px",
        flex:1, overflowY:"auto",
      }}>

        {/* Emergency services section (if any) */}
        {emergItems.length > 0 && (
          <div style={{ marginBottom:20 }}>
            <div className="ds-section-label" style={{ color:"#DC2626" }}>
              <div className="ds-emerg-dot" style={{ width:7, height:7 }}/>
              {isHi ? "आपातकालीन सेवाएं" : "Emergency Services"}
            </div>
            <div className="ds-grid">
              {emergItems.map((m,i) => (
                <ServiceCard
                  key={i} item={m}
                  deptColor={c.color} deptLight={c.light}
                  senior={senior} isHi={isHi}
                  onClick={() => handleSelect(m)}
                  index={i}
                />
              ))}
            </div>
          </div>
        )}

        {/* Regular services */}
        <div className="ds-section-label">
          {isHi ? "सभी सेवाएं" : "All Services"}
        </div>
        <div className="ds-grid">
          {regularItems.map((m,i) => (
            <ServiceCard
              key={i} item={m}
              deptColor={c.color} deptLight={c.light}
              senior={senior} isHi={isHi}
              onClick={() => handleSelect(m)}
              index={i}
            />
          ))}
        </div>

        {/* Help footer */}
        <div style={{
          marginTop:28,
          background:"white",
          borderRadius:12,
          border:"1.5px solid #DDE6F0",
          padding:"clamp(14px,1.7vw,18px) clamp(16px,2vw,22px)",
          display:"flex", alignItems:"center", justifyContent:"space-between",
          gap:14, flexWrap:"wrap",
          boxShadow:"0 1px 4px rgba(7,24,56,.04)",
        }}>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <div style={{
              width:38, height:38, borderRadius:10, flexShrink:0,
              background:c.light, border:`1.5px solid ${c.color}20`,
              display:"flex", alignItems:"center", justifyContent:"center",
            }}>
              <Ic path={SVC.faq} size={18} color={c.color}/>
            </div>
            <div>
              <div style={{ fontFamily:"var(--font-sans)", fontSize:"clamp(13px,1.4vw,14px)", fontWeight:700, color:"#0A1828", lineHeight:1.2 }}>
                {isHi ? "सहायता चाहिए?" : "Need Help?"}
              </div>
              <div style={{ fontFamily:"var(--font-sans)", fontSize:"clamp(10px,1vw,12px)", color:"#64748B", marginTop:2 }}>
                {isHi
                  ? "हमारे कार्यालय से संपर्क करें या हेल्पलाइन पर कॉल करें"
                  : "Contact our office or call the helpline for assistance"}
              </div>
            </div>
          </div>
          <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
            <div style={{
              background:`${c.color}10`, border:`1.5px solid ${c.color}25`,
              borderRadius:8, padding:"8px 16px",
              display:"flex", alignItems:"center", gap:8,
            }}>
              <Ic path={SVC.phone} size={14} color={c.color}/>
              <div>
                <div style={{ fontFamily:"var(--font-sans)", fontSize:9, color:c.color, fontWeight:700, letterSpacing:".08em", textTransform:"uppercase" }}>
                  {isHi ? meta.helpLabelHi : meta.helpLabelEn}
                </div>
                <div style={{ fontFamily:"var(--font-mono)", fontSize:"clamp(13px,1.4vw,15px)", fontWeight:800, color:c.color, lineHeight:1 }}>
                  {meta.helpNo}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  SERVICE CARD — individual row
// ═══════════════════════════════════════════════════════════════
function ServiceCard({ item, deptColor, deptLight, senior, isHi, onClick, index }) {
  const E = { bg:"#FFF5F5", border:"#FCA5A5", color:"#DC2626", light:"#FEE2E2" };
  const isEmergency = item.er;
  const accent  = isEmergency ? E.color  : deptColor;
  const iconBg  = isEmergency ? E.light  : deptLight;
  const labelSz = senior ? "clamp(16px,1.9vw,20px)" : "clamp(14px,1.6vw,16px)";

  return (
    <button
      className={`ds-svc-card ${isEmergency ? "emergency" : ""}`}
      style={{ "--dept-color": accent }}
      onClick={onClick}
    >
      {/* ICON */}
      <div style={{
        width:"clamp(42px,4.8vw,52px)", height:"clamp(42px,4.8vw,52px)",
        borderRadius:12, background:iconBg,
        border:`1.5px solid ${accent}18`,
        display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0,
        transition:"transform .18s ease",
      }}>
        <Ic path={item.icon} size={21} color={accent}/>
      </div>

      {/* LABEL + BADGES */}
      <div style={{ flex:1, minWidth:0 }}>
        <span style={{
          fontFamily:"var(--font-sans)",
          fontSize:labelSz,
          fontWeight: isEmergency ? 700 : 600,
          color: isEmergency ? E.color : "#0A1828",
          lineHeight:1.3, display:"block",
        }}>
          {item.label}
        </span>

        {/* Emergency badge */}
        {isEmergency && (
          <span className="ds-badge" style={{ background:"#DC2626", color:"white", marginTop:5 }}>
            <div style={{ width:5, height:5, borderRadius:"50%", background:"white", animation:"ds-pulse-dot 1.4s infinite" }}/>
            {isHi ? "आपातकाल · CALL 1906" : "EMERGENCY · CALL 1906"}
          </span>
        )}

        {/* Cert sub-type chip */}
        {item.cert && !isEmergency && (
          <span className="ds-badge" style={{ background:`${deptColor}12`, color:deptColor, border:`1px solid ${deptColor}20`, marginTop:5, fontSize:9 }}>
            {item.cert.toUpperCase()} {isHi ? "प्रमाण पत्र" : "CERTIFICATE"}
          </span>
        )}
      </div>

      {/* ARROW CHIP */}
      <div className="ds-arrow-chip" style={{ background: isEmergency ? E.light : "#F0F4F8" }}>
        <Ic path={SVC.chevR} size={15} color={isEmergency ? E.color : "#94A3B8"}/>
      </div>
    </button>
  );
}