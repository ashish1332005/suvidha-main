/**
 * src/flows/info/AadhaarServices.jsx
 *
 * AADHAAR SERVICES — PRODUCTION FLOW
 * ====================================
 * Matches VoterID.jsx design system exactly:
 *   — DM Sans + DM Mono fonts
 *   — Same color tokens, border radii, shadows
 *   — Same responsive clamp() grid patterns
 *   — Fully bilingual: Hindi + English on every label
 *   — Elder-friendly: large touch targets, 60–72px buttons
 *   — Kiosk (1280px) · Laptop (1024px) · Mobile (360px) responsive
 *
 * 6 Services:
 *  1. नया आधार नामांकन        — New Aadhaar Enrolment
 *  2. आधार अपडेट              — Update Aadhaar Details (Name/DOB/Address/Mobile)
 *  3. आधार डाउनलोड            — Download e-Aadhaar PDF
 *  4. आधार लॉक / अनलॉक        — Lock / Unlock Biometrics
 *  5. PVC आधार कार्ड ऑर्डर   — Order PVC Aadhaar Card
 *  6. आधार स्थिति जांच         — Check Enrolment / Update Status
 *
 * Usage:
 *   import { AadhaarServices } from '../../flows/info/AadhaarServices';
 *   <AadhaarServices lang={lang} setScreen={setScreen} />
 */

import { useState, useCallback } from "react";
// ─────────────────────────────────────────────────────────────────
//  DESIGN TOKENS — identical to VoterID.jsx / HomeScreen.jsx
// ─────────────────────────────────────────────────────────────────
const C = {
  navy:        '#0A2342',
  blue:        '#1558A0',
  blueDark:    '#0D3A6B',
  blueMid:     '#2563EB',
  blueLight:   '#EFF6FF',
  blueBorder:  '#BFDBFE',
  blueTint:    '#DBEAFE',
  amber:       '#B45309',
  amberBg:     '#FFFBEB',
  amberBd:     '#FCD34D',
  amberText:   '#92400E',
  green:       '#15803D',
  greenBg:     '#F0FDF4',
  greenBd:     '#86EFAC',
  greenDark:   '#14532D',
  red:         '#DC2626',
  redBg:       '#FFF0F0',
  redBd:       '#FCA5A5',
  redDark:     '#991B1B',
  purple:      '#7C3AED',
  purpleBg:    '#F5F3FF',
  purpleBd:    '#C4B5FD',
  teal:        '#0076A8',
  tealBg:      '#E8F8FF',
  tealBd:      '#7DD3FC',
  orange:      '#C2410C',
  orangeBg:    '#FFF7ED',
  orangeBd:    '#FED7AA',
  ink:         '#0A1828',
  slate:       '#1E3A50',
  muted:       '#4A6070',
  ghost:       '#7A96B0',
  ghostLight:  '#94A3B8',
  rule:        '#D4E0EC',
  surface:     '#F5F9FE',
  surfaceMid:  '#EDF2F8',
  white:       '#FFFFFF',
  triOrange:   '#FF9933',
  triGreen:    '#138808',
  triNavy:     '#000080',
};

const F  = "'DM Sans','Segoe UI',system-ui,sans-serif";
const FM = "'DM Mono','Courier New',monospace";

// ─────────────────────────────────────────────────────────────────
//  GLOBAL CSS
// ─────────────────────────────────────────────────────────────────
const AADHAAR_CSS = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=DM+Mono:wght@500;600&family=Noto+Sans+Devanagari:wght@400;600;700&display=swap');
*, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }

@keyframes aad-up   { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
@keyframes aad-pop  { 0%{transform:scale(.55) rotate(-6deg);opacity:0} 65%{transform:scale(1.1) rotate(1deg)} 100%{transform:scale(1) rotate(0);opacity:1} }
@keyframes aad-dot  { 0%{box-shadow:0 0 0 0 rgba(22,163,74,.55)} 70%{box-shadow:0 0 0 8px rgba(22,163,74,0)} 100%{box-shadow:0 0 0 0 rgba(22,163,74,0)} }
@keyframes aad-pulse{ 0%{box-shadow:0 0 0 0 rgba(21,88,160,.45)} 70%{box-shadow:0 0 0 10px rgba(21,88,160,0)} 100%{box-shadow:0 0 0 0 rgba(21,88,160,0)} }
@keyframes aad-spin { to{transform:rotate(360deg)} }
@keyframes aad-in   { from{opacity:0} to{opacity:1} }

.aad-svc:hover   { transform:translateY(-3px) !important; box-shadow:0 8px 24px rgba(10,35,66,.13) !important; }
.aad-btn:hover:not(:disabled) { transform:translateY(-2px) !important; filter:brightness(1.07) !important; }
.aad-ghost:hover { background:${C.blueLight} !important; }
.aad-doc:hover   { background:${C.blueLight} !important; border-color:${C.blueBorder} !important; }
.aad-field:focus { border-color:${C.blue} !important; box-shadow:0 0 0 3px ${C.blueTint} !important; outline:none !important; }
.aad-otp:focus   { border-color:${C.blue} !important; box-shadow:0 0 0 4px ${C.blueTint} !important; outline:none !important; }

.aad-form-grid { display:grid; grid-template-columns:1fr 1fr; gap:clamp(12px,1.6vw,18px); }
.aad-svc-grid  { display:grid; grid-template-columns:repeat(2,1fr); gap:clamp(10px,1.4vw,14px); }
@media(max-width:640px) {
  .aad-form-grid { grid-template-columns:1fr !important; }
  .aad-svc-grid  { grid-template-columns:1fr !important; }
}
`;

// ─────────────────────────────────────────────────────────────────
//  SERVICES CONFIG
// ─────────────────────────────────────────────────────────────────
const SVCS = [
  {
    id:      'enrol',
    icon:    '🪪',
    hi:      'नया आधार नामांकन',
    en:      'New Aadhaar Enrolment',
    subHi:   'पहली बार आधार बनवाएं — नजदीकी केंद्र पर',
    subEn:   'Register for Aadhaar at your nearest enrolment centre',
    color:   C.blue,   bg: C.blueLight, bd: C.blueBorder,
    steps:   ['सेवा','जानकारी','पुष्टि'],
    stepsEn: ['Service','Details','Confirm'],
  },
  {
    id:      'update',
    icon:    '✏️',
    hi:      'आधार अपडेट',
    en:      'Update Aadhaar Details',
    subHi:   'नाम · जन्म तिथि · पता · मोबाइल · ईमेल अपडेट करें',
    subEn:   'Correct or update your Aadhaar information',
    color:   C.purple, bg: C.purpleBg, bd: C.purpleBd,
    steps:   ['सेवा','अपडेट','OTP','समीक्षा','रसीद'],
    stepsEn: ['Service','Details','OTP','Review','Receipt'],
  },
  {
    id:      'download',
    icon:    '📥',
    hi:      'ई-आधार डाउनलोड',
    en:      'Download e-Aadhaar',
    subHi:   'Aadhaar नंबर या EID से PDF डाउनलोड करें',
    subEn:   'Download password-protected Aadhaar PDF',
    color:   C.green,  bg: C.greenBg,  bd: C.greenBd,
    steps:   ['सेवा','सत्यापन','डाउनलोड'],
    stepsEn: ['Service','Verify','Download'],
  },
  {
    id:      'lock',
    icon:    '🔒',
    hi:      'बायोमेट्रिक लॉक / अनलॉक',
    en:      'Lock / Unlock Biometrics',
    subHi:   'धोखाधड़ी से सुरक्षा — बायोमेट्रिक लॉक करें',
    subEn:   'Protect against fraud by locking your biometrics',
    color:   C.orange, bg: C.orangeBg, bd: C.orangeBd,
    steps:   ['सेवा','सत्यापन','लॉक/अनलॉक'],
    stepsEn: ['Service','Verify','Lock/Unlock'],
  },
  {
    id:      'pvc',
    icon:    '💳',
    hi:      'PVC आधार कार्ड ऑर्डर',
    en:      'Order PVC Aadhaar Card',
    subHi:   '₹50 में मजबूत PVC कार्ड मंगाएं — डाक से घर पर',
    subEn:   'Order a durable PVC card (₹50) delivered by post',
    color:   C.teal,   bg: C.tealBg,   bd: C.tealBd,
    steps:   ['सेवा','सत्यापन','भुगतान','रसीद'],
    stepsEn: ['Service','Verify','Payment','Receipt'],
  },
  {
    id:      'status',
    icon:    '📋',
    hi:      'आधार स्थिति जांच',
    en:      'Check Aadhaar Status',
    subHi:   'नामांकन / अपडेट की स्थिति जांचें — EID से',
    subEn:   'Track your enrolment or update request',
    color:   C.amber,  bg: C.amberBg,  bd: C.amberBd,
    steps:   ['सेवा','स्थिति'],
    stepsEn: ['Service','Status'],
  },
];

// ─────────────────────────────────────────────────────────────────
//  UPDATE FIELD TYPES
// ─────────────────────────────────────────────────────────────────
const UPDATE_TYPES = [
  { v:'name',    hi:'नाम में बदलाव',         en:'Name Change / Correction'   },
  { v:'dob',     hi:'जन्म तिथि सुधार',       en:'Date of Birth Correction'   },
  { v:'gender',  hi:'लिंग सुधार',             en:'Gender Correction'          },
  { v:'address', hi:'पता अपडेट',              en:'Address Update'             },
  { v:'mobile',  hi:'मोबाइल नंबर अपडेट',     en:'Mobile Number Update'       },
  { v:'email',   hi:'ईमेल अपडेट',             en:'Email Update'               },
  { v:'photo',   hi:'फोटो अपडेट',             en:'Photo Update'               },
];

// ─────────────────────────────────────────────────────────────────
//  DOCUMENTS REQUIRED PER SERVICE
// ─────────────────────────────────────────────────────────────────
const DOCS_ENROL = [
  { hi:'जन्म प्रमाण पत्र (POB)',            en:'Proof of Birth (Birth Certificate / Passport)', req: true  },
  { hi:'पहचान प्रमाण (POI)',               en:'Proof of Identity (Passport / PAN / Voter ID)',  req: true  },
  { hi:'पते का प्रमाण (POA)',              en:'Proof of Address (Aadhaar / Utility Bill)',       req: true  },
  { hi:'पासपोर्ट साइज़ फोटो (2 copies)',  en:'Passport size photo (2 copies)',                 req: false },
];

const DOCS_UPDATE = [
  { hi:'मौजूदा आधार कार्ड / EID स्लिप',   en:'Existing Aadhaar / Enrolment ID Slip',           req: true  },
  { hi:'अपडेट का समर्थन दस्तावेज़',        en:'Supporting document for the change requested',   req: true  },
  { hi:'मोबाइल नंबर (OTP के लिए)',         en:'Registered mobile number (for OTP)',              req: true  },
];

// ─────────────────────────────────────────────────────────────────
//  NEARBY CENTRES (static demo data)
// ─────────────────────────────────────────────────────────────────
const CENTRES = [
  { hi:'उपखंड कार्यालय — अजमेर',          en:'Sub-Division Office, Ajmer',             dist:'0.8 km', timings:'Mon–Sat 10AM–5PM', phone:'0145-262111'  },
  { hi:'CSC केंद्र — सदर बाज़ार',          en:'CSC Centre — Sadar Bazaar',              dist:'1.1 km', timings:'Mon–Sat 9AM–6PM',  phone:'98290-11111'  },
  { hi:'नगर पालिका — सेवा केंद्र',         en:'Municipal Service Centre',               dist:'1.4 km', timings:'Mon–Fri 10AM–4PM', phone:'0145-262200'  },
  { hi:'CSC केंद्र — पुष्कर रोड',          en:'CSC Centre — Pushkar Road',              dist:'2.2 km', timings:'Mon–Sun 9AM–7PM',  phone:'98290-22222'  },
];

// ─────────────────────────────────────────────────────────────────
//  MICRO COMPONENTS (mirrors VoterID.jsx exactly)
// ─────────────────────────────────────────────────────────────────
const ChevR = ({ size = 12, color = C.blue }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} aria-hidden="true" style={{ flexShrink: 0 }}>
    <path d="M10 6L8.59 7.41L13.17 12L8.59 16.59L10 18L16 12L10 6Z" />
  </svg>
);

const CheckSVG = ({ size = 16, color = C.white }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} aria-hidden="true">
    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
  </svg>
);

const LocPin = ({ size = 14, color = C.green }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} aria-hidden="true" style={{ flexShrink: 0 }}>
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
  </svg>
);

const PhoneIcon = ({ size = 13, color = C.blue }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} aria-hidden="true" style={{ flexShrink: 0 }}>
    <path d="M6.62 10.79C8.06 13.62 10.38 15.93 13.21 17.38L15.41 15.18C15.68 14.91 16.08 14.82 16.43 14.94C17.55 15.31 18.76 15.51 20 15.51C20.55 15.51 21 15.96 21 16.51V20C21 20.55 20.55 21 20 21C10.61 21 3 13.39 3 4C3 3.45 3.45 3 4 3H7.5C8.05 3 8.5 3.45 8.5 4C8.5 5.25 8.7 6.45 9.07 7.57C9.18 7.92 9.1 8.31 8.82 8.59L6.62 10.79Z" />
  </svg>
);

const Spinner = () => (
  <div style={{ width: 20, height: 20, border: `3px solid rgba(255,255,255,.3)`, borderTop: `3px solid ${C.white}`, borderRadius: '50%', animation: 'aad-spin .7s linear infinite', flexShrink: 0 }} />
);

// Step progress bar
function StepBar({ steps, stepsEn, current, color }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', padding: '4px clamp(16px,4vw,48px) 0', gap: 0 }}>
      {steps.map((s, i) => {
        const done   = i < current;
        const active = i === current;
        const last   = i === steps.length - 1;
        return (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', minWidth: 0 }}>
            {!last && (
              <div style={{
                position: 'absolute', top: 'clamp(13px,1.6vw,16px)',
                left: '50%', right: '-50%', height: 2,
                background: done ? color : C.rule, transition: 'background .5s', zIndex: 0,
              }} />
            )}
            <div style={{
              width: 'clamp(26px,3.2vw,34px)', height: 'clamp(26px,3.2vw,34px)',
              borderRadius: '50%', flexShrink: 0, zIndex: 1,
              background: done ? color : active ? color : C.white,
              border: `2.5px solid ${done || active ? color : C.rule}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: active ? `0 0 0 5px ${color}22` : 'none',
              transition: 'all .4s',
            }}>
              {done
                ? <CheckSVG size={13} />
                : <span style={{ fontFamily: FM, fontSize: 'clamp(9px,1.1vw,11px)', fontWeight: 800, color: active ? C.white : C.ghostLight }}>{i + 1}</span>
              }
            </div>
            <div style={{ marginTop: 4, textAlign: 'center', padding: '0 2px' }}>
              <div style={{ fontFamily: F, fontSize: 'clamp(9px,1vw,11px)', fontWeight: 700, color: active ? color : done ? color : C.ghostLight, lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s}</div>
              {stepsEn && <div style={{ fontFamily: F, fontSize: 'clamp(8px,.85vw,10px)', color: active ? color : C.ghostLight, opacity: .75, lineHeight: 1 }}>{stepsEn[i]}</div>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Card({ children, style = {}, glow }) {
  return (
    <div style={{
      background: C.white, borderRadius: 12,
      border: `1px solid ${glow ? `${glow}33` : C.rule}`,
      padding: 'clamp(14px,1.8vw,20px)',
      boxShadow: glow ? `0 2px 12px ${glow}18, 0 1px 4px rgba(10,35,66,.06)` : '0 1px 5px rgba(10,35,66,.07)',
      marginBottom: 12, ...style,
    }}>
      {children}
    </div>
  );
}

function SDiv({ icon, hi, en, color = C.blue }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 9, margin: 'clamp(16px,2vw,22px) 0 clamp(12px,1.5vw,16px)', paddingBottom: 10, borderBottom: `2px solid ${C.blueLight}` }}>
      <div style={{ width: 32, height: 32, borderRadius: 8, background: `${color}12`, border: `1.5px solid ${color}28`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, flexShrink: 0 }}>{icon}</div>
      <div>
        <div style={{ fontFamily: F, fontSize: 'clamp(13px,1.5vw,15px)', fontWeight: 700, color: C.ink }}>{hi}</div>
        <div style={{ fontFamily: F, fontSize: 'clamp(10px,1.1vw,11px)', color: C.ghost }}>{en}</div>
      </div>
    </div>
  );
}

function Btn({ children, onClick, ghost, disabled, danger, icon, color = C.blue, loading: isLoading, sm }) {
  const H  = sm ? 'clamp(44px,5.2vw,52px)' : 'clamp(56px,6.5vw,68px)';
  const FS = sm ? 'clamp(13px,1.4vw,15px)' : 'clamp(15px,1.8vw,18px)';
  const bg = ghost ? C.white : disabled || isLoading ? '#C8D8E8' : danger ? C.red : color;
  const fg = ghost ? (danger ? C.red : color) : disabled ? C.ghost : C.white;
  const bd = ghost ? `2px solid ${danger ? C.redBd : color}` : 'none';
  return (
    <button onClick={onClick} disabled={disabled || isLoading}
      className={ghost ? 'aad-btn aad-ghost' : 'aad-btn'}
      style={{
        width: '100%', minHeight: H, border: bd, borderRadius: 10,
        background: bg, color: fg, fontFamily: F, fontSize: FS, fontWeight: 700,
        cursor: disabled || isLoading ? 'not-allowed' : 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9,
        opacity: disabled && !isLoading ? .55 : 1,
        boxShadow: !ghost && !disabled && !isLoading ? `0 4px 14px ${danger ? C.red : color}38` : 'none',
        transition: 'transform .15s, filter .15s, box-shadow .15s', letterSpacing: '.01em',
      }}>
      {isLoading ? <Spinner /> : (icon && <span style={{ fontSize: '1.15em', lineHeight: 1 }}>{icon}</span>)}
      {children}
    </button>
  );
}

function MsgBox({ msg, type = 'error' }) {
  if (!msg) return null;
  const map = {
    error:   { bg: C.redBg,    bd: C.redBd,     color: C.redDark,  icon: '⚠️' },
    warning: { bg: C.amberBg,  bd: C.amberBd,   color: C.amberText,icon: '⚠️' },
    success: { bg: C.greenBg,  bd: C.greenBd,   color: C.greenDark,icon: '✅' },
    info:    { bg: C.blueLight,bd: C.blueBorder, color: C.blueDark, icon: 'ℹ️' },
  };
  const t = map[type] || map.error;
  return (
    <div style={{ background: t.bg, border: `1.5px solid ${t.bd}`, borderRadius: 9, padding: 'clamp(11px,1.4vw,14px) clamp(14px,1.7vw,18px)', marginBottom: 14, display: 'flex', gap: 11, alignItems: 'center', animation: 'aad-in .3s ease' }}>
      <span style={{ fontSize: 20, flexShrink: 0 }}>{t.icon}</span>
      <div style={{ fontFamily: F, fontSize: 'clamp(12px,1.4vw,14px)', fontWeight: 700, color: t.color, lineHeight: 1.5 }}>{msg}</div>
    </div>
  );
}

function FLabel({ hi, en, required }) {
  return (
    <label style={{ display: 'block', marginBottom: 6 }}>
      <div style={{ fontFamily: F, fontSize: 'clamp(12px,1.4vw,14px)', fontWeight: 700, color: C.ink, lineHeight: 1.2 }}>
        {hi}{required && <span style={{ color: C.red, marginLeft: 2 }}>*</span>}
      </div>
      <div style={{ fontFamily: F, fontSize: 'clamp(10px,1.1vw,11px)', color: C.ghost, marginTop: 1 }}>{en}</div>
    </label>
  );
}

function FInput({ field, value, onChange, error }) {
  const base = {
    width: '100%', height: 'clamp(48px,5.6vw,58px)', padding: '0 clamp(12px,1.4vw,15px)',
    fontFamily: F, fontSize: 'clamp(14px,1.6vw,16px)', color: C.ink,
    background: C.surface, borderRadius: 9, transition: 'border-color .2s, box-shadow .2s',
    border: `1.5px solid ${error ? C.red : value ? C.blue : C.rule}`,
    boxShadow: error ? `0 0 0 3px ${C.redBg}` : value ? `0 0 0 3px ${C.blueTint}` : 'none',
  };
  if (field.type === 'select') {
    return (
      <select value={value} onChange={e => onChange(e.target.value)} className="aad-field" style={{ ...base, cursor: 'pointer', appearance: 'auto' }}>
        <option value="">— चुनें / Select —</option>
        {field.opts.map(o => (
          <option key={o.v} value={o.v}>{o.hi} / {o.en}</option>
        ))}
      </select>
    );
  }
  return (
    <input
      type={field.type} value={value} onChange={e => onChange(e.target.value)}
      placeholder={field.ph} className="aad-field"
      maxLength={field.key === 'mobile' ? 10 : field.key === 'aadhaar' ? 12 : field.key === 'eid' ? 28 : field.key === 'pincode' ? 6 : undefined}
      style={base}
    />
  );
}

function IRow({ label, labelEn, value, mono, accent, accentColor, last }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: 'clamp(9px,1.1vw,12px) 0', borderBottom: last ? 'none' : `1px solid ${C.rule}`, gap: 12 }}>
      <div style={{ flexShrink: 0, maxWidth: '42%' }}>
        <div style={{ fontFamily: F, fontSize: 'clamp(11px,1.2vw,13px)', color: C.muted, fontWeight: 500, lineHeight: 1.2 }}>{label}</div>
        {labelEn && <div style={{ fontFamily: F, fontSize: 'clamp(9px,1vw,11px)', color: C.ghostLight, marginTop: 1 }}>{labelEn}</div>}
      </div>
      <span style={{
        fontFamily: mono ? FM : F,
        fontSize: accent ? 'clamp(14px,1.6vw,16px)' : 'clamp(12px,1.4vw,14px)',
        fontWeight: accent ? 800 : 600,
        color: accentColor || (mono ? C.blue : C.ink),
        textAlign: 'right', maxWidth: '55%', wordBreak: 'break-all', lineHeight: 1.4,
      }}>{value}</span>
    </div>
  );
}

// 6-digit OTP input boxes (identical to VoterID)
function OTPInput({ value, onChange, onSubmit }) {
  const refs   = useRef([]);
  const digits = (value.padEnd(6, ' ')).slice(0, 6).split('');
  const handleKey = (i, e) => {
    if (e.key === 'Backspace') {
      const arr = digits.map(d => d.trim()); arr[i] = '';
      onChange(arr.join('').trimEnd());
      if (i > 0) refs.current[i - 1]?.focus(); return;
    }
    if (e.key === 'Enter' && value.replace(/\s/g, '').length === 6) { onSubmit?.(); return; }
    if (/^\d$/.test(e.key)) {
      const arr = digits.map(d => d.trim()); arr[i] = e.key;
      onChange(arr.join('').trimEnd());
      if (i < 5) refs.current[i + 1]?.focus();
    }
  };
  return (
    <div style={{ display: 'flex', gap: 'clamp(8px,1.2vw,14px)', justifyContent: 'center', margin: '0 auto', maxWidth: 400 }}>
      {[0, 1, 2, 3, 4, 5].map(i => {
        const filled = digits[i]?.trim();
        return (
          <input key={i} ref={el => refs.current[i] = el}
            type="text" inputMode="numeric" maxLength={1}
            value={filled || ''} onKeyDown={e => handleKey(i, e)} onChange={() => {}}
            className="aad-otp"
            style={{
              width: 'clamp(44px,6vw,58px)', height: 'clamp(54px,7vw,66px)',
              textAlign: 'center', fontFamily: FM, fontSize: 'clamp(22px,3vw,30px)', fontWeight: 800,
              color: filled ? C.blue : C.ink,
              background: filled ? C.blueLight : C.surface,
              border: `2px solid ${filled ? C.blue : C.rule}`,
              borderRadius: 10, transition: 'border-color .2s, box-shadow .2s, background .2s',
            }}
          />
        );
      })}
    </div>
  );
}

// Masked Aadhaar display: XXXX XXXX 1234
const maskAadhaar = (n) => {
  const clean = (n || '').replace(/\D/g, '');
  if (clean.length < 4) return clean;
  return `XXXX XXXX ${clean.slice(-4)}`;
};

// ─────────────────────────────────────────────────────────────────
//  MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────
export function AadhaarServices({ lang = 'en', setScreen }) {
  const isHi = lang === 'hi';

  // Core state
  const [step,        setStep]      = useState(0);
  const [svc,         setSvc]       = useState(null);
  const [formData,    setFormData]  = useState({});
  const [errors,      setErrors]    = useState({});
  const [docsOk,      setDocsOk]    = useState({});
  const [globalErr,   setGlobalErr] = useState('');
  const [loading,     setLoading]   = useState(false);
  const [receipt,     setReceipt]   = useState(null);

  // OTP
  const [otp,         setOtp]       = useState('');
  const [otpCd,       setOtpCd]     = useState(0);
  const [otpVerified, setOtpVerif]  = useState(false);
  const [devOtp,      setDevOtp]    = useState('');

  // Service-specific
  const [dlResult,    setDlResult]  = useState(null);   // download result
  const [lockStatus,  setLockStat]  = useState(null);   // lock/unlock result
  const [statusRes,   setStatusRes] = useState(null);   // status check result
  const [pvcResult,   setPvcResult] = useState(null);   // PVC order result

  // OTP countdown
  useEffect(() => {
    if (otpCd <= 0) return;
    const t = setInterval(() => setOtpCd(n => (n <= 1 ? 0 : n - 1)), 1000);
    return () => clearInterval(t);
  }, [otpCd]);

  // ── Helpers ──────────────────────────────────────────────────
  const accent = svc?.color || C.blue;

  const setF = (key, val) => {
    setFormData(d => ({ ...d, [key]: val }));
    setErrors(e => ({ ...e, [key]: undefined }));
    setGlobalErr('');
  };

  const goBack = () => {
    setGlobalErr('');
    if (step === 0) { setScreen?.('home'); return; }
    if (step === 1) { setStep(0); setSvc(null); setFormData({}); setErrors({}); setDocsOk({}); return; }
    setStep(s => s - 1);
  };

  const resetAll = () => { setStep(0); setSvc(null); setFormData({}); setErrors({}); setDocsOk({}); setGlobalErr(''); setOtp(''); setOtpVerif(false); setReceipt(null); setDlResult(null); setLockStat(null); setStatusRes(null); setPvcResult(null); setDevOtp(''); };

  // ── Mock API helpers (dev mode — replace with real API calls) ──
  const mockDelay = (ms = 1200) => new Promise(r => setTimeout(r, ms));

  const sendOtp = async (mobile) => {
    await mockDelay(900);
    const otp6 = String(Math.floor(100000 + Math.random() * 900000));
    setDevOtp(otp6);
    console.log(`[AadhaarDEV] OTP for ${mobile}: ${otp6}`);
    return otp6;
  };

  const verifyOtpMock = async (mobile, enteredOtp) => {
    await mockDelay(700);
    if (enteredOtp !== devOtp) throw new Error('गलत OTP / Incorrect OTP. Please try again.');
    return true;
  };

  // ── Flow: Update — Step 1 → OTP → Review → Receipt ───────────
  const submitUpdateOtp = async () => {
    const errs = {};
    if (!formData.aadhaar?.trim()) errs.aadhaar = 'आधार नंबर आवश्यक है / Aadhaar required';
    else if (!/^\d{12}$/.test(formData.aadhaar.replace(/\s/g, ''))) errs.aadhaar = '12 अंक का आधार नंबर / 12-digit Aadhaar';
    if (!formData.updateType) errs.updateType = 'सुधार का प्रकार चुनें / Select update type';
    if (!formData.newValue?.trim()) errs.newValue = 'नई जानकारी आवश्यक है / New value required';
    if (!formData.mobile?.trim()) errs.mobile = 'मोबाइल आवश्यक है / Mobile required';
    else if (!/^\d{10}$/.test(formData.mobile.replace(/\s/g, ''))) errs.mobile = '10 अंक का मोबाइल / 10-digit mobile';
    const allDocOk = DOCS_UPDATE.filter(d => d.req).every((_, i) => docsOk[i]);
    if (!allDocOk) { setGlobalErr('सभी आवश्यक (*) दस्तावेज़ की पुष्टि करें / Confirm all required documents'); return; }
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setLoading(true); setGlobalErr('');
    try {
      const otp6 = await sendOtp(formData.mobile);
      setGlobalErr(`[DEV] आपका OTP है: ${otp6}`);
      setOtp(''); setOtpCd(60); setStep(3);
    } catch (e) { setGlobalErr(e.message); }
    finally { setLoading(false); }
  };

  const confirmOtp = async () => {
    const clean = otp.replace(/\s/g, '');
    if (clean.length < 6) { setGlobalErr('6 अंक का OTP दर्ज करें / Enter 6-digit OTP'); return; }
    setLoading(true); setGlobalErr('');
    try {
      await verifyOtpMock(formData.mobile, clean);
      setOtpVerif(true); setStep(4);
    } catch (e) { setGlobalErr(e.message); }
    finally { setLoading(false); }
  };

  const submitUpdate = async () => {
    setLoading(true); setGlobalErr('');
    try {
      await mockDelay(1400);
      const ref = `URN-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
      setReceipt({
        referenceNo:   ref,
        serviceLabel:  'आधार अपडेट / Aadhaar Update',
        aadhaar:       maskAadhaar(formData.aadhaar),
        updateType:    UPDATE_TYPES.find(u => u.v === formData.updateType)?.hi || formData.updateType,
        mobile:        formData.mobile,
        submittedAt:   new Date().toISOString(),
        eta:           '90 दिन के अंदर / Within 90 days',
        note:          'आपका अनुरोध UIDAI को भेज दिया गया है। SMS से अपडेट मिलेगी।',
      });
      setStep(5);
    } catch (e) { setGlobalErr(e.message); }
    finally { setLoading(false); }
  };

  // ── Flow: Download ────────────────────────────────────────────
  const submitDownload = async () => {
    const errs = {};
    if (!formData.dlAadhaar?.trim() && !formData.dlEid?.trim()) errs.dlAadhaar = 'आधार नंबर या EID दर्ज करें / Enter Aadhaar or EID';
    if (!formData.dlMobile?.trim()) errs.dlMobile = 'मोबाइल नंबर आवश्यक है / Mobile required';
    else if (!/^\d{10}$/.test(formData.dlMobile.replace(/\s/g, ''))) errs.dlMobile = '10 अंक का मोबाइल / 10-digit mobile';
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setLoading(true); setGlobalErr('');
    try {
      const otp6 = await sendOtp(formData.dlMobile);
      setGlobalErr(`[DEV] OTP: ${otp6}`);
      setOtp(''); setOtpCd(60); setStep(3);
    } catch (e) { setGlobalErr(e.message); }
    finally { setLoading(false); }
  };

  const confirmDownloadOtp = async () => {
    const clean = otp.replace(/\s/g, '');
    if (clean.length < 6) { setGlobalErr('6 अंक का OTP दर्ज करें / Enter 6-digit OTP'); return; }
    setLoading(true); setGlobalErr('');
    try {
      await verifyOtpMock(formData.dlMobile, clean);
      await mockDelay(600);
      setDlResult({
        aadhaar:     maskAadhaar(formData.dlAadhaar || '000000000000'),
        name:        'Ramesh Kumar Sharma',
        dob:         '01/01/1990',
        gender:      'Male',
        address:     '12-A, Gandhi Nagar, Ajmer, Rajasthan — 305001',
        downloadUrl: 'https://eaadhaar.uidai.gov.in/',
        password:    `${(formData.dlName || 'Name').slice(0, 4).toUpperCase()}${formData.dlDob?.replace(/-/g, '').slice(-4) || '1990'}`,
      });
      setStep(3);
    } catch (e) { setGlobalErr(e.message); }
    finally { setLoading(false); }
  };

  // ── Flow: Lock/Unlock ─────────────────────────────────────────
  const submitLock = async () => {
    const errs = {};
    if (!formData.lockAadhaar?.trim()) errs.lockAadhaar = 'आधार नंबर आवश्यक / Aadhaar required';
    else if (!/^\d{12}$/.test(formData.lockAadhaar.replace(/\s/g, ''))) errs.lockAadhaar = '12 अंक का आधार नंबर / 12 digits';
    if (!formData.lockAction) errs.lockAction = 'क्रिया चुनें / Select action';
    if (!formData.lockMobile?.trim()) errs.lockMobile = 'मोबाइल आवश्यक / Mobile required';
    else if (!/^\d{10}$/.test(formData.lockMobile.replace(/\s/g, ''))) errs.lockMobile = '10 अंक का मोबाइल / 10 digits';
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setLoading(true); setGlobalErr('');
    try {
      const otp6 = await sendOtp(formData.lockMobile);
      setGlobalErr(`[DEV] OTP: ${otp6}`);
      setOtp(''); setOtpCd(60); setStep(3);
    } catch (e) { setGlobalErr(e.message); }
    finally { setLoading(false); }
  };

  const confirmLockOtp = async () => {
    const clean = otp.replace(/\s/g, '');
    if (clean.length < 6) { setGlobalErr('6 अंक का OTP दर्ज करें / Enter 6-digit OTP'); return; }
    setLoading(true); setGlobalErr('');
    try {
      await verifyOtpMock(formData.lockMobile, clean);
      await mockDelay(500);
      const isLocking = formData.lockAction === 'lock';
      setLockStat({
        action:   isLocking ? 'locked' : 'unlocked',
        aadhaar:  maskAadhaar(formData.lockAadhaar),
        msg:      isLocking
          ? 'बायोमेट्रिक सफलतापूर्वक लॉक हो गई। / Biometrics locked successfully.'
          : 'बायोमेट्रिक सफलतापूर्वक अनलॉक हो गई। / Biometrics unlocked successfully.',
        at:       new Date().toISOString(),
      });
      setStep(3);
    } catch (e) { setGlobalErr(e.message); }
    finally { setLoading(false); }
  };

  // ── Flow: PVC Order ───────────────────────────────────────────
  const submitPvc = async () => {
    const errs = {};
    if (!formData.pvcAadhaar?.trim()) errs.pvcAadhaar = 'आधार नंबर आवश्यक / Aadhaar required';
    else if (!/^\d{12}$/.test(formData.pvcAadhaar.replace(/\s/g, ''))) errs.pvcAadhaar = '12 अंक / 12 digits';
    if (!formData.pvcMobile?.trim()) errs.pvcMobile = 'मोबाइल आवश्यक / Mobile required';
    else if (!/^\d{10}$/.test(formData.pvcMobile.replace(/\s/g, ''))) errs.pvcMobile = '10 अंक / 10 digits';
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setLoading(true); setGlobalErr('');
    try {
      const otp6 = await sendOtp(formData.pvcMobile);
      setGlobalErr(`[DEV] OTP: ${otp6}`);
      setOtp(''); setOtpCd(60); setStep(3);
    } catch (e) { setGlobalErr(e.message); }
    finally { setLoading(false); }
  };

  const confirmPvcOtp = async () => {
    const clean = otp.replace(/\s/g, '');
    if (clean.length < 6) { setGlobalErr('6 अंक का OTP दर्ज करें'); return; }
    setLoading(true); setGlobalErr('');
    try {
      await verifyOtpMock(formData.pvcMobile, clean);
      setStep(4);
    } catch (e) { setGlobalErr(e.message); }
    finally { setLoading(false); }
  };

  const submitPvcPayment = async () => {
    setLoading(true); setGlobalErr('');
    try {
      await mockDelay(1500);
      const ref = `PVC-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
      setPvcResult({
        referenceNo:  ref,
        aadhaar:      maskAadhaar(formData.pvcAadhaar),
        amount:       50,
        txnId:        `TXN${Date.now()}`,
        eta:          '15–20 कार्य दिवस / working days',
        submittedAt:  new Date().toISOString(),
      });
      setStep(5);
    } catch (e) { setGlobalErr(e.message); }
    finally { setLoading(false); }
  };

  // ── Flow: Status ──────────────────────────────────────────────
  const checkStatus = async () => {
    if (!formData.eidInput?.trim()) { setGlobalErr('EID / URN नंबर दर्ज करें / Enter EID or URN'); return; }
    setLoading(true); setGlobalErr('');
    try {
      await mockDelay(1000);
      setStatusRes({
        eid:       formData.eidInput,
        status:    'under_process',
        statusHi:  'प्रक्रिया में है',
        statusEn:  'Under Process',
        color:     C.amber,
        name:      'Ramesh Kumar Sharma',
        submitDate:'15 Feb 2026',
        updatedOn: '20 Feb 2026',
        eta:       '30–45 दिन / days',
        message:   'आपका अनुरोध UIDAI में प्रक्रिया में है। पूरा होने पर SMS मिलेगी। / Your request is being processed at UIDAI. You will receive an SMS on completion.',
      });
      setStep(3);
    } catch (e) { setGlobalErr(e.message); }
    finally { setLoading(false); }
  };

  // ── Flow: Enrol — just info + nearby centres ──────────────────
  // (Actual biometric enrolment can't be done digitally; we show info + nearest centre)

  // ─────────────────────────────────────────────────────────────
  //  RENDER
  // ─────────────────────────────────────────────────────────────
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: C.surface, minHeight: '100vh' }}>
      <style>{AADHAAR_CSS}</style>

      {/* ═══════════════════ HEADER ═══════════════════ */}
      <div style={{
        background: `linear-gradient(135deg,${C.navy} 0%,${C.blue} 100%)`,
        padding: 'clamp(12px,1.6vw,18px) clamp(16px,3vw,40px)',
        boxShadow: `0 4px 20px ${C.navy}44`,
        position: 'sticky', top: 0, zIndex: 50,
      }}>
        {/* Tricolor stripe */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4,
          background: `linear-gradient(90deg,${C.triOrange} 33.33%,${C.white} 33.33%,${C.white} 66.66%,${C.triGreen} 66.66%)` }} />

        {/* Back + title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 4, marginBottom: step > 0 && svc ? 12 : 0 }}>
          <button onClick={goBack} style={{
            background: 'rgba(255,255,255,.1)', border: '1.5px solid rgba(255,255,255,.22)',
            borderRadius: 8, padding: '6px 14px', cursor: 'pointer', color: C.white,
            fontFamily: F, fontSize: 'clamp(11px,1.2vw,13px)', fontWeight: 600,
            display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0,
          }}>
            ← {isHi ? 'वापस' : 'Back'}
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 11, flex: 1 }}>
            <div style={{ width: 'clamp(38px,4.5vw,50px)', height: 'clamp(38px,4.5vw,50px)', borderRadius: 10, background: 'rgba(255,255,255,.14)', border: '1.5px solid rgba(255,255,255,.22)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 'clamp(20px,2.5vw,28px)', flexShrink: 0 }}>
              {svc ? svc.icon : '🪪'}
            </div>
            <div>
              <h1 style={{ fontFamily: F, fontSize: 'clamp(14px,1.8vw,20px)', fontWeight: 800, color: C.white, lineHeight: 1.1, margin: 0 }}>
                आधार सेवाएं
              </h1>
              <div style={{ fontFamily: F, fontSize: 'clamp(10px,1vw,12px)', color: 'rgba(255,255,255,.5)', marginTop: 2 }}>
                {svc ? `${svc.hi} · ${svc.en}` : 'Aadhaar Services · UIDAI · Govt. of India'}
              </div>
            </div>
          </div>

          {/* UIDAI badge */}
          <div style={{ background: 'rgba(255,255,255,.1)', border: '1px solid rgba(255,255,255,.18)', borderRadius: 8, padding: '5px 11px', textAlign: 'center', flexShrink: 0 }}>
            <div style={{ fontFamily: F, fontSize: 9, color: 'rgba(255,255,255,.4)', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase' }}>UIDAI</div>
            <div style={{ fontFamily: FM, fontSize: 'clamp(11px,1.2vw,13px)', color: C.white, fontWeight: 800, letterSpacing: '.04em', marginTop: 1 }}>1947</div>
          </div>
        </div>

        {/* Step bar */}
        {svc && step > 0 && step < (svc.steps.length + 1) && (
          <div style={{ background: 'rgba(255,255,255,.07)', borderRadius: 10, padding: '10px 0 8px', marginTop: 2 }}>
            <StepBar steps={svc.steps} stepsEn={svc.stepsEn} current={step - 1} color={accent} />
          </div>
        )}
      </div>

      {/* ═══════════════════ BODY ═══════════════════ */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <div style={{ maxWidth: 740, margin: '0 auto', padding: 'clamp(18px,2.5vw,32px) clamp(14px,3vw,32px) 80px', animation: 'aad-up .38s ease' }}>

          {/* ────────────────────────────────────────────
              STEP 0: SERVICE SELECTION
          ──────────────────────────────────────────── */}
          {step === 0 && (
            <>
              {/* Info banner */}
              <div style={{ background: C.blueLight, border: `1px solid ${C.blueBorder}`, borderRadius: 10, padding: 'clamp(13px,1.6vw,17px)', marginBottom: 18, display: 'flex', gap: 12 }}>
                <span style={{ fontSize: 24, flexShrink: 0 }}>🪪</span>
                <div>
                  <div style={{ fontFamily: F, fontSize: 'clamp(13px,1.5vw,15px)', fontWeight: 700, color: C.ink, marginBottom: 4 }}>
                    आधार सेवाएं / Aadhaar Services
                  </div>
                  <div style={{ fontFamily: F, fontSize: 'clamp(11px,1.2vw,13px)', color: C.muted, lineHeight: 1.8 }}>
                    नीचे दी गई सेवाओं से आधार से जुड़े सभी काम करें।
                    <br />Complete all Aadhaar-related services below. For help call <strong style={{ color: C.blue }}>1947</strong> (UIDAI Helpline) or visit <strong>uidai.gov.in</strong>
                  </div>
                </div>
              </div>

              {/* Service cards */}
              <div className="aad-svc-grid" style={{ marginBottom: 18 }}>
                {SVCS.map(s => (
                  <button key={s.id} className="aad-svc"
                    onClick={() => {
                      setSvc(s); setStep(1); setFormData({}); setErrors({});
                      setDocsOk({}); setGlobalErr(''); setOtp(''); setOtpVerif(false);
                      setReceipt(null); setDlResult(null); setLockStat(null);
                      setStatusRes(null); setPvcResult(null); setDevOtp('');
                    }}
                    style={{
                      background: C.white, border: `1px solid ${C.rule}`, borderRadius: 12,
                      padding: 0, cursor: 'pointer', textAlign: 'left',
                      display: 'flex', flexDirection: 'column', overflow: 'hidden',
                      boxShadow: '0 1px 5px rgba(10,35,66,.07)',
                      transition: 'transform .2s, box-shadow .2s',
                    }}>
                    <div style={{ height: 4, background: s.color }} />
                    <div style={{ padding: 'clamp(13px,1.7vw,18px)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 9 }}>
                        <div style={{ width: 'clamp(38px,4.5vw,48px)', height: 'clamp(38px,4.5vw,48px)', borderRadius: 10, background: s.bg, border: `1px solid ${s.bd}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 'clamp(19px,2.3vw,26px)', flexShrink: 0 }}>{s.icon}</div>
                        <div>
                          <div style={{ fontFamily: F, fontSize: 'clamp(13px,1.5vw,15px)', fontWeight: 800, color: C.ink, lineHeight: 1.15 }}>{s.hi}</div>
                          <div style={{ fontFamily: F, fontSize: 'clamp(10px,1.1vw,12px)', color: s.color, fontWeight: 700, marginTop: 2 }}>{s.en}</div>
                        </div>
                      </div>
                      <div style={{ fontFamily: F, fontSize: 'clamp(11px,1.2vw,13px)', color: C.slate, lineHeight: 1.65, marginBottom: 8 }}>{s.subHi}</div>
                      <div style={{ fontFamily: F, fontSize: 'clamp(10px,1vw,11px)', color: C.ghost }}>{s.subEn}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 10 }}>
                        <span style={{ fontFamily: F, fontSize: 'clamp(10px,1.1vw,12px)', fontWeight: 700, color: s.color }}>आगे बढ़ें / Proceed</span>
                        <ChevR size={11} color={s.color} />
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {/* UIDAI info + helpline */}
              <Card>
                <SDiv icon="ℹ️" hi="उपयोगी जानकारी" en="Important Information — UIDAI" color={C.blue} />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {[
                    { icon: '📞', hi: 'UIDAI हेल्पलाइन', en: 'UIDAI Helpline', val: '1947', color: C.blue },
                    { icon: '🌐', hi: 'आधार पोर्टल', en: 'Aadhaar Portal', val: 'uidai.gov.in', color: C.teal },
                    { icon: '📩', hi: 'ईमेल सहायता', en: 'Email Support', val: 'help@uidai.gov.in', color: C.purple },
                    { icon: '🕐', hi: 'सेवा समय', en: 'Service Hours', val: '24×7 Online', color: C.green },
                  ].map((item, i) => (
                    <div key={i} style={{ display: 'flex', gap: 10, padding: '10px 12px', background: C.surface, border: `1px solid ${C.rule}`, borderRadius: 8, alignItems: 'center' }}>
                      <span style={{ fontSize: 20, flexShrink: 0 }}>{item.icon}</span>
                      <div>
                        <div style={{ fontFamily: F, fontSize: 'clamp(11px,1.2vw,12px)', fontWeight: 700, color: C.ink }}>{item.hi}</div>
                        <div style={{ fontFamily: F, fontSize: 'clamp(9px,1vw,10px)', color: C.ghost }}>{item.en}</div>
                        <div style={{ fontFamily: FM, fontSize: 'clamp(12px,1.3vw,14px)', fontWeight: 800, color: item.color, marginTop: 2 }}>{item.val}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </>
          )}

          {/* ────────────────────────────────────────────
              STEP 1 (enrol): NEARBY CENTRES INFO
          ──────────────────────────────────────────── */}
          {step === 1 && svc?.id === 'enrol' && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '11px 14px', background: svc.bg, border: `1px solid ${svc.bd}`, borderRadius: 10, marginBottom: 18 }}>
                <span style={{ fontSize: 24 }}>{svc.icon}</span>
                <div>
                  <div style={{ fontFamily: F, fontSize: 'clamp(13px,1.5vw,15px)', fontWeight: 700, color: svc.color }}>{svc.hi} · {svc.en}</div>
                  <div style={{ fontFamily: F, fontSize: 'clamp(10px,1.1vw,12px)', color: C.muted }}>बायोमेट्रिक नामांकन व्यक्तिगत रूप से किया जाता है / Biometric enrolment requires physical visit</div>
                </div>
              </div>

              {/* Important note */}
              <MsgBox msg="नया आधार नामांकन बायोमेट्रिक (अंगुली की छाप + आँख की पुतली) के कारण ऑनलाइन नहीं हो सकता। नजदीकी नामांकन केंद्र पर जाएं। / New Aadhaar enrolment requires biometrics and must be done in person at an enrolment centre." type="info" />

              <SDiv icon="📋" hi="नामांकन के लिए आवश्यक दस्तावेज़" en="Documents Required for New Enrolment" color={svc.color} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 18 }}>
                {DOCS_ENROL.map((d, i) => (
                  <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '11px 14px', background: C.surface, border: `1px solid ${C.rule}`, borderRadius: 9 }}>
                    <span style={{ fontSize: 18, flexShrink: 0 }}>{d.req ? '📄' : '📎'}</span>
                    <div>
                      <div style={{ fontFamily: F, fontSize: 'clamp(12px,1.4vw,14px)', fontWeight: 700, color: C.ink }}>{d.hi}{d.req && <span style={{ color: C.red }}>*</span>}</div>
                      <div style={{ fontFamily: F, fontSize: 'clamp(10px,1.1vw,12px)', color: C.ghost }}>{d.en}</div>
                    </div>
                  </div>
                ))}
              </div>

              <SDiv icon="📍" hi="नजदीकी आधार नामांकन केंद्र" en="Nearby Aadhaar Enrolment Centres" color={C.green} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginBottom: 18 }}>
                {CENTRES.map((c, i) => (
                  <div key={i} style={{ display: 'flex', gap: 12, padding: '12px 14px', background: C.white, border: `1px solid ${C.rule}`, borderRadius: 10, boxShadow: '0 1px 4px rgba(10,35,66,.05)', alignItems: 'flex-start' }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: C.greenBg, border: `1px solid ${C.greenBd}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>🏢</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: F, fontSize: 'clamp(12px,1.4vw,14px)', fontWeight: 700, color: C.ink }}>{c.hi}</div>
                      <div style={{ fontFamily: F, fontSize: 'clamp(10px,1.1vw,12px)', color: C.ghost, marginTop: 1 }}>{c.en}</div>
                      <div style={{ display: 'flex', gap: 14, marginTop: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontFamily: F, fontSize: 'clamp(10px,1.1vw,12px)', color: C.green, fontWeight: 700 }}>
                          <LocPin size={12} color={C.green} />{c.dist}
                        </span>
                        <span style={{ fontFamily: F, fontSize: 'clamp(10px,1.1vw,12px)', color: C.muted }}>🕐 {c.timings}</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontFamily: FM, fontSize: 'clamp(10px,1.1vw,12px)', color: C.blue, fontWeight: 600 }}>
                          <PhoneIcon size={11} color={C.blue} />{c.phone}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Locate more */}
              <div style={{ background: C.amberBg, border: `1px solid ${C.amberBd}`, borderRadius: 10, padding: '13px 16px', marginBottom: 16, display: 'flex', gap: 12, alignItems: 'center' }}>
                <span style={{ fontSize: 20 }}>🔍</span>
                <div style={{ fontFamily: F, fontSize: 'clamp(11px,1.2vw,13px)', color: C.amberText, lineHeight: 1.7 }}>
                  अधिक केंद्रों के लिए: <strong>appointments.uidai.gov.in</strong> पर जाएं या <strong>1947</strong> पर कॉल करें।<br />
                  Find more centres at <strong>appointments.uidai.gov.in</strong> or call <strong>1947</strong>.
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <Btn ghost sm onClick={() => setStep(0)} color={C.ghost}>← वापस / Back</Btn>
                <Btn sm onClick={() => window.open('https://appointments.uidai.gov.in/', '_blank')} color={svc.color} icon="📅">
                  अपॉइंटमेंट बुक / Book Appointment
                </Btn>
              </div>
            </>
          )}

          {/* ────────────────────────────────────────────
              STEP 1 (update): UPDATE FORM
          ──────────────────────────────────────────── */}
          {step === 1 && svc?.id === 'update' && (
            <>
              <MsgBox msg={globalErr} type={globalErr.startsWith('[DEV]') ? 'info' : 'error'} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '11px 14px', background: svc.bg, border: `1px solid ${svc.bd}`, borderRadius: 10, marginBottom: 18 }}>
                <span style={{ fontSize: 24 }}>{svc.icon}</span>
                <div>
                  <div style={{ fontFamily: F, fontSize: 'clamp(13px,1.5vw,15px)', fontWeight: 700, color: svc.color }}>{svc.hi} · {svc.en}</div>
                  <div style={{ fontFamily: F, fontSize: 'clamp(10px,1.1vw,12px)', color: C.muted }}>UIDAI Self-Service Update Portal</div>
                </div>
              </div>

              <SDiv icon="🪪" hi="आधार विवरण" en="Aadhaar Information" color={svc.color} />
              <div className="aad-form-grid">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 0, gridColumn: '1 / -1' }}>
                  <FLabel hi="12 अंक का आधार नंबर" en="12-digit Aadhaar Number *" required />
                  <FInput field={{ type: 'text', ph: '1234 5678 9012', key: 'aadhaar' }} value={formData.aadhaar || ''} onChange={v => setF('aadhaar', v)} error={errors.aadhaar} />
                  {errors.aadhaar && <span style={{ fontFamily: F, fontSize: 11, color: C.red, marginTop: 3 }}>⚠ {errors.aadhaar}</span>}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                  <FLabel hi="अपडेट का प्रकार" en="What would you like to update? *" required />
                  <FInput field={{ type: 'select', key: 'updateType', opts: UPDATE_TYPES }} value={formData.updateType || ''} onChange={v => setF('updateType', v)} error={errors.updateType} />
                  {errors.updateType && <span style={{ fontFamily: F, fontSize: 11, color: C.red, marginTop: 3 }}>⚠ {errors.updateType}</span>}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                  <FLabel hi="नई / सही जानकारी" en="New / Corrected Value *" required />
                  <FInput field={{ type: 'text', ph: 'सही जानकारी यहाँ दर्ज करें', key: 'newValue' }} value={formData.newValue || ''} onChange={v => setF('newValue', v)} error={errors.newValue} />
                  {errors.newValue && <span style={{ fontFamily: F, fontSize: 11, color: C.red, marginTop: 3 }}>⚠ {errors.newValue}</span>}
                </div>
              </div>

              <SDiv icon="📱" hi="पंजीकृत मोबाइल" en="Registered Mobile Number (for OTP)" color={svc.color} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0, marginBottom: 16 }}>
                <FLabel hi="मोबाइल नंबर" en="Mobile Number linked with Aadhaar *" required />
                <FInput field={{ type: 'tel', ph: '10 अंक / 10 digits', key: 'mobile' }} value={formData.mobile || ''} onChange={v => setF('mobile', v)} error={errors.mobile} />
                {errors.mobile && <span style={{ fontFamily: F, fontSize: 11, color: C.red, marginTop: 3 }}>⚠ {errors.mobile}</span>}
              </div>

              <SDiv icon="📋" hi="सहायक दस्तावेज़" en="Supporting Documents Checklist" color={svc.color} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
                {DOCS_UPDATE.map((d, i) => (
                  <div key={i} className="aad-doc"
                    onClick={() => setDocsOk(dk => ({ ...dk, [i]: !dk[i] }))}
                    style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '11px 14px', background: docsOk[i] ? C.greenBg : C.surface, border: `1.5px solid ${docsOk[i] ? C.greenBd : C.rule}`, borderRadius: 9, cursor: 'pointer', transition: 'background .2s, border-color .2s' }}>
                    <div style={{ width: 22, height: 22, borderRadius: 5, flexShrink: 0, background: docsOk[i] ? C.green : C.white, border: `2px solid ${docsOk[i] ? C.green : C.rule}`, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .2s' }}>
                      {docsOk[i] && <CheckSVG size={12} />}
                    </div>
                    <div>
                      <div style={{ fontFamily: F, fontSize: 'clamp(12px,1.4vw,14px)', fontWeight: 700, color: C.ink }}>{d.hi}{d.req && <span style={{ color: C.red }}>*</span>}</div>
                      <div style={{ fontFamily: F, fontSize: 'clamp(10px,1.1vw,12px)', color: C.ghost }}>{d.en}</div>
                    </div>
                  </div>
                ))}
              </div>

              <Btn onClick={submitUpdateOtp} loading={loading} icon="📱" color={accent}>
                OTP भेजें और जारी रखें / Send OTP & Continue →
              </Btn>
            </>
          )}

          {/* ────────────────────────────────────────────
              STEP 1 (download): DOWNLOAD FORM
          ──────────────────────────────────────────── */}
          {step === 1 && svc?.id === 'download' && (
            <>
              <MsgBox msg={globalErr} type={globalErr.startsWith('[DEV]') ? 'info' : 'error'} />
              <Card glow={C.green}>
                <SDiv icon="📥" hi="ई-आधार डाउनलोड" en="Download e-Aadhaar PDF" color={C.green} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div>
                    <FLabel hi="आधार नंबर (या EID नंबर)" en="12-digit Aadhaar Number (or 28-digit EID)" />
                    <FInput field={{ type: 'text', ph: '1234 5678 9012', key: 'dlAadhaar' }} value={formData.dlAadhaar || ''} onChange={v => setF('dlAadhaar', v)} error={errors.dlAadhaar} />
                    {errors.dlAadhaar && <span style={{ fontFamily: F, fontSize: 11, color: C.red, marginTop: 3 }}>⚠ {errors.dlAadhaar}</span>}
                  </div>
                  <div>
                    <FLabel hi="पूरा नाम (आधार में)" en="Full Name as in Aadhaar (for PDF password)" />
                    <FInput field={{ type: 'text', ph: 'जैसे: Ramesh Kumar', key: 'dlName' }} value={formData.dlName || ''} onChange={v => setF('dlName', v)} />
                  </div>
                  <div>
                    <FLabel hi="जन्म तिथि" en="Date of Birth (for PDF password)" />
                    <FInput field={{ type: 'date', ph: '', key: 'dlDob' }} value={formData.dlDob || ''} onChange={v => setF('dlDob', v)} />
                  </div>
                  <div>
                    <FLabel hi="पंजीकृत मोबाइल नंबर *" en="Registered Mobile Number (OTP will be sent) *" required />
                    <FInput field={{ type: 'tel', ph: '10 अंक / 10 digits', key: 'dlMobile' }} value={formData.dlMobile || ''} onChange={v => setF('dlMobile', v)} error={errors.dlMobile} />
                    {errors.dlMobile && <span style={{ fontFamily: F, fontSize: 11, color: C.red, marginTop: 3 }}>⚠ {errors.dlMobile}</span>}
                  </div>
                </div>
                <div style={{ marginTop: 14, padding: '10px 14px', background: C.amberBg, border: `1px solid ${C.amberBd}`, borderRadius: 8, fontFamily: F, fontSize: 'clamp(11px,1.2vw,13px)', color: C.amberText }}>
                  🔒 PDF का पासवर्ड: नाम के पहले 4 अक्षर (Capital) + जन्म वर्ष (जैसे: <strong>RAME1990</strong>)<br />
                  PDF Password: First 4 letters of name (CAPS) + birth year (e.g., <strong>RAME1990</strong>)
                </div>
              </Card>
              <Btn onClick={submitDownload} loading={loading} icon="📱" color={C.green}>
                OTP भेजें / Send OTP →
              </Btn>
            </>
          )}

          {/* ────────────────────────────────────────────
              STEP 1 (lock): LOCK / UNLOCK FORM
          ──────────────────────────────────────────── */}
          {step === 1 && svc?.id === 'lock' && (
            <>
              <MsgBox msg={globalErr} type={globalErr.startsWith('[DEV]') ? 'info' : 'error'} />

              <div style={{ background: C.orangeBg, border: `1px solid ${C.orangeBd}`, borderRadius: 10, padding: '13px 16px', marginBottom: 16, display: 'flex', gap: 12 }}>
                <span style={{ fontSize: 22, flexShrink: 0 }}>🛡️</span>
                <div style={{ fontFamily: F, fontSize: 'clamp(11px,1.2vw,13px)', color: C.orange, lineHeight: 1.7 }}>
                  <strong>बायोमेट्रिक लॉक</strong> करने के बाद कोई भी आपकी अंगुली की छाप या आँख की पुतली से आधार सत्यापन नहीं कर पाएगा।<br />
                  After <strong>locking biometrics</strong>, no authentication via fingerprint or iris will be possible until unlocked.
                </div>
              </div>

              <Card glow={C.orange}>
                <SDiv icon="🔒" hi="बायोमेट्रिक लॉक / अनलॉक" en="Biometric Lock / Unlock" color={C.orange} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div>
                    <FLabel hi="12 अंक का आधार नंबर *" en="12-digit Aadhaar Number *" required />
                    <FInput field={{ type: 'text', ph: '1234 5678 9012', key: 'lockAadhaar' }} value={formData.lockAadhaar || ''} onChange={v => setF('lockAadhaar', v)} error={errors.lockAadhaar} />
                    {errors.lockAadhaar && <span style={{ fontFamily: F, fontSize: 11, color: C.red, marginTop: 3 }}>⚠ {errors.lockAadhaar}</span>}
                  </div>
                  <div>
                    <FLabel hi="क्रिया चुनें *" en="Select Action *" required />
                    <FInput
                      field={{ type: 'select', key: 'lockAction', opts: [
                        { v: 'lock',   hi: '🔒 बायोमेट्रिक लॉक करें',     en: 'Lock Biometrics'   },
                        { v: 'unlock', hi: '🔓 बायोमेट्रिक अनलॉक करें',   en: 'Unlock Biometrics' },
                      ]}}
                      value={formData.lockAction || ''} onChange={v => setF('lockAction', v)} error={errors.lockAction}
                    />
                    {errors.lockAction && <span style={{ fontFamily: F, fontSize: 11, color: C.red, marginTop: 3 }}>⚠ {errors.lockAction}</span>}
                  </div>
                  <div>
                    <FLabel hi="पंजीकृत मोबाइल नंबर *" en="Registered Mobile (OTP) *" required />
                    <FInput field={{ type: 'tel', ph: '10 अंक / 10 digits', key: 'lockMobile' }} value={formData.lockMobile || ''} onChange={v => setF('lockMobile', v)} error={errors.lockMobile} />
                    {errors.lockMobile && <span style={{ fontFamily: F, fontSize: 11, color: C.red, marginTop: 3 }}>⚠ {errors.lockMobile}</span>}
                  </div>
                </div>
              </Card>
              <Btn onClick={submitLock} loading={loading} icon="📱" color={C.orange}>
                OTP भेजें / Send OTP →
              </Btn>
            </>
          )}

          {/* ────────────────────────────────────────────
              STEP 1 (pvc): PVC ORDER FORM
          ──────────────────────────────────────────── */}
          {step === 1 && svc?.id === 'pvc' && (
            <>
              <MsgBox msg={globalErr} type={globalErr.startsWith('[DEV]') ? 'info' : 'error'} />

              <div style={{ display: 'flex', gap: 14, padding: '13px 16px', background: C.tealBg, border: `1px solid ${C.tealBd}`, borderRadius: 10, marginBottom: 16 }}>
                <span style={{ fontSize: 24, flexShrink: 0 }}>💳</span>
                <div>
                  <div style={{ fontFamily: F, fontSize: 'clamp(13px,1.5vw,15px)', fontWeight: 700, color: C.teal }}>₹50 शुल्क / Fee</div>
                  <div style={{ fontFamily: F, fontSize: 'clamp(10px,1.1vw,12px)', color: C.muted, marginTop: 2 }}>
                    PVC Aadhaar Card — UPI / Debit Card / Net Banking से भुगतान करें। डाक से 15–20 दिन में मिलेगा।<br />
                    Pay ₹50 via UPI / Debit Card. Card delivered by India Post in 15–20 days.
                  </div>
                </div>
              </div>

              <Card glow={C.teal}>
                <SDiv icon="💳" hi="PVC कार्ड ऑर्डर" en="Order PVC Aadhaar Card" color={C.teal} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div>
                    <FLabel hi="12 अंक का आधार नंबर *" en="12-digit Aadhaar Number *" required />
                    <FInput field={{ type: 'text', ph: '1234 5678 9012', key: 'pvcAadhaar' }} value={formData.pvcAadhaar || ''} onChange={v => setF('pvcAadhaar', v)} error={errors.pvcAadhaar} />
                    {errors.pvcAadhaar && <span style={{ fontFamily: F, fontSize: 11, color: C.red, marginTop: 3 }}>⚠ {errors.pvcAadhaar}</span>}
                  </div>
                  <div>
                    <FLabel hi="पंजीकृत मोबाइल नंबर *" en="Registered Mobile (OTP) *" required />
                    <FInput field={{ type: 'tel', ph: '10 अंक / 10 digits', key: 'pvcMobile' }} value={formData.pvcMobile || ''} onChange={v => setF('pvcMobile', v)} error={errors.pvcMobile} />
                    {errors.pvcMobile && <span style={{ fontFamily: F, fontSize: 11, color: C.red, marginTop: 3 }}>⚠ {errors.pvcMobile}</span>}
                  </div>
                  <div>
                    <FLabel hi="डिलीवरी पता (यदि अलग हो)" en="Delivery Address (if different from Aadhaar address)" />
                    <textarea
                      value={formData.pvcAddress || ''}
                      onChange={e => setF('pvcAddress', e.target.value)}
                      placeholder="वैकल्पिक / Optional — leave blank to use Aadhaar registered address"
                      className="aad-field"
                      rows={3}
                      style={{ width: '100%', padding: '12px 14px', fontFamily: F, fontSize: 'clamp(13px,1.5vw,15px)', color: C.ink, background: C.surface, borderRadius: 9, border: `1.5px solid ${C.rule}`, resize: 'vertical', outline: 'none' }}
                    />
                  </div>
                </div>
              </Card>
              <Btn onClick={submitPvc} loading={loading} icon="📱" color={C.teal}>
                OTP भेजें / Send OTP →
              </Btn>
            </>
          )}

          {/* ────────────────────────────────────────────
              STEP 1 (status): STATUS FORM
          ──────────────────────────────────────────── */}
          {step === 1 && svc?.id === 'status' && (
            <>
              <MsgBox msg={globalErr} type="error" />
              <Card glow={C.amber}>
                <SDiv icon="🔍" hi="आधार स्थिति जांच" en="Track Aadhaar Enrolment / Update Status" color={C.amber} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div>
                    <FLabel hi="EID / URN नंबर *" en="Enrolment ID (28 digits) or Update Request Number *" required />
                    <FInput field={{ type: 'text', ph: 'जैसे: 1234/12345/123456 या URN-...', key: 'eidInput' }} value={formData.eidInput || ''} onChange={v => setF('eidInput', v)} />
                    <div style={{ fontFamily: F, fontSize: 11, color: C.ghost, marginTop: 4 }}>
                      📄 EID नंबर आधार नामांकन स्लिप पर मिलेगा / EID found on your enrolment slip
                    </div>
                  </div>
                </div>
                <div style={{ marginTop: 14, fontFamily: F, fontSize: 'clamp(11px,1.2vw,13px)', color: C.muted }}>
                  📞 UIDAI Helpline: <strong style={{ color: C.blue }}>1947</strong> &nbsp;·&nbsp; Portal: <strong>uidai.gov.in</strong>
                </div>
              </Card>
              <Btn onClick={checkStatus} loading={loading} icon="🔍" color={C.amber}>
                स्थिति जांचें / Check Status →
              </Btn>
            </>
          )}

          {/* ────────────────────────────────────────────
              OTP STEP (update / download / lock / pvc)
              step === 3 for these flows
          ──────────────────────────────────────────── */}
          {step === 3 && (svc?.id === 'update' || (svc?.id === 'download' && !dlResult) || (svc?.id === 'lock' && !lockStatus) || (svc?.id === 'pvc' && !pvcResult)) && (
            <>
              <MsgBox msg={globalErr} type={globalErr.startsWith('[DEV]') ? 'info' : 'error'} />
              <Card glow={accent} style={{ textAlign: 'center' }}>
                <div style={{ marginBottom: 22 }}>
                  <div style={{ width: 72, height: 72, borderRadius: '50%', background: C.blueLight, border: `3px solid ${C.blueBorder}`, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, marginBottom: 14, animation: 'aad-pulse 2s ease-in-out infinite' }}>📱</div>
                  <div style={{ fontFamily: F, fontSize: 'clamp(16px,2vw,20px)', fontWeight: 800, color: C.ink, marginBottom: 7 }}>OTP सत्यापन / OTP Verification</div>
                  <div style={{ fontFamily: F, fontSize: 'clamp(12px,1.4vw,14px)', color: C.muted, lineHeight: 1.7 }}>
                    <strong style={{ color: C.blue }}>+91 {formData.mobile || formData.dlMobile || formData.lockMobile || formData.pvcMobile}</strong> पर 6 अंक का OTP भेजा गया है।<br />
                    A 6-digit OTP has been sent to your registered mobile number.
                  </div>
                </div>
                <OTPInput value={otp} onChange={setOtp}
                  onSubmit={svc?.id === 'update' ? confirmOtp : svc?.id === 'download' ? confirmDownloadOtp : svc?.id === 'lock' ? confirmLockOtp : confirmPvcOtp}
                />
                <div style={{ marginTop: 14 }}>
                  {otpCd > 0
                    ? <span style={{ fontFamily: F, fontSize: 13, color: C.ghost }}>Resend in <strong style={{ color: C.blue }}>{otpCd}s</strong></span>
                    : <button onClick={() => { sendOtp(formData.mobile || formData.dlMobile || formData.lockMobile || formData.pvcMobile); setOtpCd(60); setOtp(''); }}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: F, fontSize: 13, color: C.blue, fontWeight: 700 }}>
                        🔄 OTP दोबारा भेजें / Resend OTP
                      </button>
                  }
                </div>
              </Card>
              <Btn
                onClick={svc?.id === 'update' ? confirmOtp : svc?.id === 'download' ? confirmDownloadOtp : svc?.id === 'lock' ? confirmLockOtp : confirmPvcOtp}
                disabled={otp.replace(/\s/g, '').length < 6}
                loading={loading} icon="✅" color={accent}>
                OTP सत्यापित करें / Verify OTP →
              </Btn>
            </>
          )}

          {/* ────────────────────────────────────────────
              DOWNLOAD RESULT (step 3 with dlResult set)
          ──────────────────────────────────────────── */}
          {step === 3 && svc?.id === 'download' && dlResult && (
            <Card glow={C.green}>
              <div style={{ textAlign: 'center', marginBottom: 20 }}>
                <div style={{ width: 72, height: 72, borderRadius: '50%', background: C.greenBg, border: `3px solid ${C.greenBd}`, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, marginBottom: 12, animation: 'aad-pop .5s ease' }}>📥</div>
                <div style={{ fontFamily: F, fontSize: 'clamp(16px,2vw,20px)', fontWeight: 800, color: C.green }}>ई-आधार तैयार है / e-Aadhaar Ready</div>
                <div style={{ fontFamily: F, fontSize: 13, color: C.muted, marginTop: 4 }}>Identity verified. Your e-Aadhaar PDF is ready.</div>
              </div>
              <IRow label="आधार नंबर" labelEn="Aadhaar (masked)" value={dlResult.aadhaar} mono accent accentColor={C.blue} />
              <IRow label="नाम / Name" labelEn="" value={dlResult.name} />
              <IRow label="जन्म तिथि / DOB" labelEn="" value={dlResult.dob} />
              <IRow label="लिंग / Gender" labelEn="" value={dlResult.gender} />
              <IRow label="पता / Address" labelEn="" value={dlResult.address} last />

              <div style={{ margin: '14px 0 8px', padding: '11px 14px', background: C.amberBg, border: `1px solid ${C.amberBd}`, borderRadius: 9, fontFamily: F, fontSize: 'clamp(11px,1.2vw,13px)', color: C.amberText }}>
                🔑 PDF पासवर्ड: <strong style={{ fontFamily: FM }}>{dlResult.password}</strong><br />
                PDF Password (नाम के पहले 4 अक्षर + जन्म वर्ष)
              </div>

              <div style={{ marginTop: 12 }}>
                <Btn onClick={() => window.open(dlResult.downloadUrl, '_blank')} color={C.green} icon="📥">
                  ई-आधार PDF डाउनलोड करें / Download e-Aadhaar PDF
                </Btn>
              </div>
              <div style={{ marginTop: 10, textAlign: 'center' }}>
                <Btn ghost sm onClick={resetAll} color={C.blue}>← नई सेवा / New Service</Btn>
              </div>
            </Card>
          )}

          {/* ────────────────────────────────────────────
              LOCK RESULT (step 3 with lockStatus set)
          ──────────────────────────────────────────── */}
          {step === 3 && svc?.id === 'lock' && lockStatus && (
            <Card glow={lockStatus.action === 'locked' ? C.orange : C.green}>
              <div style={{ textAlign: 'center', marginBottom: 18 }}>
                <div style={{ fontSize: 64, marginBottom: 12, animation: 'aad-pop .5s ease' }}>
                  {lockStatus.action === 'locked' ? '🔒' : '🔓'}
                </div>
                <div style={{ fontFamily: F, fontSize: 'clamp(16px,2vw,20px)', fontWeight: 800, color: lockStatus.action === 'locked' ? C.orange : C.green }}>
                  {lockStatus.action === 'locked' ? 'बायोमेट्रिक लॉक हो गई!' : 'बायोमेट्रिक अनलॉक हो गई!'}
                </div>
                <div style={{ fontFamily: F, fontSize: 13, color: C.muted, marginTop: 6 }}>{lockStatus.msg}</div>
              </div>
              <IRow label="आधार नंबर" labelEn="Aadhaar (masked)" value={lockStatus.aadhaar} mono accent accentColor={C.blue} />
              <IRow label="स्थिति / Status" labelEn="Action Performed" value={lockStatus.action === 'locked' ? '🔒 Locked / लॉक' : '🔓 Unlocked / अनलॉक'} accent accentColor={lockStatus.action === 'locked' ? C.orange : C.green} />
              <IRow label="समय / Time" labelEn="Timestamp" value={new Date(lockStatus.at).toLocaleString('en-IN')} last />
              <div style={{ marginTop: 14 }}>
                <Btn ghost sm onClick={resetAll} color={C.blue}>← नई सेवा / New Service</Btn>
              </div>
            </Card>
          )}

          {/* ────────────────────────────────────────────
              STATUS RESULT (step 3)
          ──────────────────────────────────────────── */}
          {step === 3 && svc?.id === 'status' && statusRes && (
            <Card glow={statusRes.color}>
              <SDiv icon="📋" hi="आधार स्थिति / Aadhaar Status" en="Enrolment / Update Tracking Details" color={statusRes.color} />
              <IRow label="EID / URN" labelEn="Reference" value={statusRes.eid} mono accent accentColor={C.blue} />
              <IRow label="नाम / Name" labelEn="Applicant" value={statusRes.name} />
              <IRow label="जमा दिनांक" labelEn="Submitted On" value={statusRes.submitDate} />
              <IRow label="अंतिम अपडेट" labelEn="Last Updated" value={statusRes.updatedOn} />
              <IRow label="ETA" labelEn="Estimated Time" value={statusRes.eta} />
              <IRow label="स्थिति / Status" labelEn="Current Status" value={`${statusRes.statusHi} / ${statusRes.statusEn}`} accent accentColor={statusRes.color} last />
              <div style={{ marginTop: 12, padding: '11px 14px', background: C.surface, border: `1px solid ${C.rule}`, borderRadius: 9 }}>
                <div style={{ fontFamily: F, fontSize: 'clamp(11px,1.2vw,13px)', color: C.muted }}>{statusRes.message}</div>
              </div>
              <div style={{ marginTop: 14 }}>
                <Btn ghost sm onClick={() => { setStep(1); setStatusRes(null); setFormData(f => ({ ...f, eidInput: '' })); }} color={C.amber}>← नई खोज / New Search</Btn>
              </div>
            </Card>
          )}

          {/* ────────────────────────────────────────────
              STEP 4 (update): REVIEW BEFORE SUBMIT
          ──────────────────────────────────────────── */}
          {step === 4 && svc?.id === 'update' && (
            <>
              <MsgBox msg={globalErr} type="error" />
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: C.greenBg, border: `1px solid ${C.greenBd}`, borderRadius: 10, marginBottom: 16 }}>
                <span style={{ fontSize: 20 }}>✅</span>
                <div style={{ fontFamily: F, fontSize: 'clamp(12px,1.4vw,14px)', fontWeight: 700, color: C.green }}>
                  OTP सत्यापित / OTP Verified · +91 {formData.mobile}
                </div>
              </div>
              <Card glow={accent}>
                <SDiv icon="📄" hi="समीक्षा / Review" en="Review Your Update Request Before Submitting" color={accent} />
                <IRow label="आधार नंबर" labelEn="Aadhaar (masked)" value={maskAadhaar(formData.aadhaar)} mono accent accentColor={C.blue} />
                <IRow label="अपडेट प्रकार" labelEn="Update Type" value={UPDATE_TYPES.find(u => u.v === formData.updateType)?.hi || formData.updateType} />
                <IRow label="नई जानकारी" labelEn="New Value" value={formData.newValue} accent accentColor={C.ink} last />
              </Card>
              <div style={{ background: C.amberBg, border: `1px solid ${C.amberBd}`, borderRadius: 10, padding: '13px 16px', marginBottom: 16 }}>
                <div style={{ fontFamily: F, fontSize: 'clamp(12px,1.3vw,14px)', fontWeight: 700, color: C.amberText, marginBottom: 5 }}>📜 घोषणा / Declaration</div>
                <div style={{ fontFamily: F, fontSize: 'clamp(11px,1.2vw,13px)', color: C.slate, lineHeight: 1.9 }}>
                  मैं घोषित करता/करती हूँ कि दी गई जानकारी सत्य है।<br />
                  I declare that the information provided is true and correct.
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: 10 }}>
                <Btn ghost sm onClick={() => setStep(1)} color={C.ghost}>← संपादन / Edit</Btn>
                <Btn sm onClick={submitUpdate} loading={loading} icon="📤" color={accent}>
                  अनुरोध जमा करें / Submit Update →
                </Btn>
              </div>
            </>
          )}

          {/* ────────────────────────────────────────────
              STEP 4 (pvc): PAYMENT
          ──────────────────────────────────────────── */}
          {step === 4 && svc?.id === 'pvc' && (
            <>
              <MsgBox msg={globalErr} type="error" />
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: C.greenBg, border: `1px solid ${C.greenBd}`, borderRadius: 10, marginBottom: 16 }}>
                <span style={{ fontSize: 20 }}>✅</span>
                <div style={{ fontFamily: F, fontSize: 'clamp(12px,1.4vw,14px)', fontWeight: 700, color: C.green }}>
                  OTP सत्यापित / OTP Verified · +91 {formData.pvcMobile}
                </div>
              </div>
              <Card glow={C.teal}>
                <SDiv icon="💳" hi="भुगतान / Payment" en="Pay ₹50 for PVC Aadhaar Card" color={C.teal} />
                <IRow label="आधार नंबर" labelEn="Aadhaar (masked)" value={maskAadhaar(formData.pvcAadhaar)} mono accent accentColor={C.blue} />
                <IRow label="शुल्क / Charge" labelEn="PVC Card Fee" value="₹ 50.00" accent accentColor={C.green} />
                <IRow label="डिलीवरी / Delivery" labelEn="Delivery Method" value="India Post — 15–20 days" />
                <IRow label="पता / Address" labelEn="Delivered to" value={formData.pvcAddress || 'Aadhaar registered address'} last />

                <div style={{ marginTop: 16 }}>
                  <div style={{ fontFamily: F, fontSize: 'clamp(12px,1.4vw,14px)', fontWeight: 700, color: C.ink, marginBottom: 10 }}>भुगतान विधि / Payment Method</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    {['UPI', 'Debit Card', 'Net Banking', 'Cash'].map(m => (
                      <button key={m}
                        onClick={() => setF('payMethod', m)}
                        style={{
                          padding: '11px 14px', borderRadius: 9, cursor: 'pointer',
                          background: formData.payMethod === m ? C.tealBg : C.surface,
                          border: `1.5px solid ${formData.payMethod === m ? C.teal : C.rule}`,
                          fontFamily: F, fontSize: 'clamp(12px,1.3vw,14px)', fontWeight: 700,
                          color: formData.payMethod === m ? C.teal : C.ink,
                          display: 'flex', alignItems: 'center', gap: 7,
                        }}>
                        <span>{m === 'UPI' ? '📲' : m === 'Debit Card' ? '💳' : m === 'Net Banking' ? '🌐' : '💵'}</span>
                        {m}
                      </button>
                    ))}
                  </div>
                </div>
              </Card>
              <Btn onClick={submitPvcPayment} disabled={!formData.payMethod} loading={loading} icon="💳" color={C.teal}>
                ₹50 भुगतान करें / Pay ₹50 →
              </Btn>
            </>
          )}

          {/* ────────────────────────────────────────────
              STEP 5: SUCCESS RECEIPT (update)
          ──────────────────────────────────────────── */}
          {step === 5 && svc?.id === 'update' && receipt && (
            <div style={{ animation: 'aad-up .45s ease' }}>
              <div style={{ textAlign: 'center', marginBottom: 22 }}>
                <div style={{ width: 100, height: 100, borderRadius: '50%', background: C.greenBg, border: `4px solid ${C.greenBd}`, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', animation: 'aad-pop .6s cubic-bezier(.34,1.56,.64,1)' }}>
                  <CheckSVG size={52} color={C.green} />
                </div>
                <h2 style={{ fontFamily: F, fontSize: 'clamp(20px,2.8vw,28px)', fontWeight: 800, color: C.ink, marginTop: 16, marginBottom: 6 }}>
                  अपडेट अनुरोध जमा हुआ! 🎉
                </h2>
                <p style={{ fontFamily: F, fontSize: 'clamp(12px,1.4vw,14px)', color: C.muted }}>Update request submitted to UIDAI successfully</p>
              </div>

              <Card glow={C.green}>
                <SDiv icon="🧾" hi="रसीद / Receipt" en="Official Update Request Receipt" color={C.green} />
                <IRow label="URN / Reference" labelEn="Update Request No." value={receipt.referenceNo} mono accent accentColor={C.blue} />
                <IRow label="सेवा / Service" labelEn="Request Type" value={receipt.serviceLabel} />
                <IRow label="आधार" labelEn="Aadhaar (masked)" value={receipt.aadhaar} mono />
                <IRow label="अपडेट प्रकार" labelEn="Update Type" value={receipt.updateType} />
                <IRow label="मोबाइल" labelEn="Registered Mobile" value={receipt.mobile} mono />
                <IRow label="जमा दिनांक" labelEn="Submitted At" value={new Date(receipt.submittedAt).toLocaleString('en-IN')} />
                <IRow label="ETA" labelEn="Expected" value={receipt.eta} last />
              </Card>

              <Card>
                <SDiv icon="📅" hi="आगे की प्रक्रिया" en="What Happens Next" color={C.blue} />
                {[
                  ['1️⃣', 'UIDAI आपके अनुरोध की समीक्षा करेगी', 'UIDAI will review your update request'],
                  ['2️⃣', 'सत्यापन के बाद आधार में अपडेट किया जाएगा', 'After verification, Aadhaar will be updated'],
                  ['3️⃣', 'SMS से सूचना मिलेगी — 90 दिन के भीतर', 'SMS notification upon completion — within 90 days'],
                  ['4️⃣', 'URN से uidai.gov.in पर status track करें', 'Track at uidai.gov.in or call 1947'],
                ].map(([ic, hi, en]) => (
                  <div key={ic} style={{ display: 'flex', gap: 12, marginBottom: 11 }}>
                    <span style={{ fontSize: 17, flexShrink: 0, marginTop: 2 }}>{ic}</span>
                    <div>
                      <div style={{ fontFamily: F, fontSize: 'clamp(12px,1.3vw,14px)', fontWeight: 700, color: C.ink }}>{hi}</div>
                      <div style={{ fontFamily: F, fontSize: 'clamp(10px,1.1vw,12px)', color: C.ghost, marginTop: 2 }}>{en}</div>
                    </div>
                  </div>
                ))}
              </Card>

              <div style={{ background: C.blueLight, border: `1px solid ${C.blueBorder}`, borderRadius: 10, padding: '13px 16px', marginBottom: 18, display: 'flex', gap: 12, alignItems: 'center' }}>
                <span style={{ fontSize: 22 }}>📞</span>
                <div style={{ fontFamily: F, fontSize: 'clamp(11px,1.2vw,13px)', color: C.slate, lineHeight: 1.7 }}>
                  <strong>URN सुरक्षित रखें:</strong> <span style={{ fontFamily: FM, color: C.blue, fontWeight: 800 }}>{receipt.referenceNo}</span><br />
                  UIDAI Helpline: <strong>1947</strong> · Portal: <strong>uidai.gov.in</strong>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <Btn onClick={() => window.print()} color={C.green} icon="🖨️">रसीद प्रिंट / Print</Btn>
                <Btn ghost onClick={() => setScreen?.('home')} color={C.blue} icon="🏠">होम / Home</Btn>
              </div>
            </div>
          )}

          {/* ────────────────────────────────────────────
              STEP 5: SUCCESS RECEIPT (pvc)
          ──────────────────────────────────────────── */}
          {step === 5 && svc?.id === 'pvc' && pvcResult && (
            <div style={{ animation: 'aad-up .45s ease' }}>
              <div style={{ textAlign: 'center', marginBottom: 22 }}>
                <div style={{ width: 100, height: 100, borderRadius: '50%', background: C.tealBg, border: `4px solid ${C.tealBd}`, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', animation: 'aad-pop .6s cubic-bezier(.34,1.56,.64,1)', fontSize: 52 }}>💳</div>
                <h2 style={{ fontFamily: F, fontSize: 'clamp(20px,2.8vw,28px)', fontWeight: 800, color: C.ink, marginTop: 16, marginBottom: 6 }}>
                  PVC कार्ड ऑर्डर हो गया! 🎉
                </h2>
                <p style={{ fontFamily: F, fontSize: 'clamp(12px,1.4vw,14px)', color: C.muted }}>PVC Aadhaar Card order placed successfully</p>
              </div>

              <Card glow={C.teal}>
                <SDiv icon="🧾" hi="ऑर्डर रसीद" en="PVC Card Order Receipt" color={C.teal} />
                <IRow label="Order Ref." labelEn="संदर्भ क्रमांक" value={pvcResult.referenceNo} mono accent accentColor={C.blue} />
                <IRow label="आधार" labelEn="Aadhaar (masked)" value={pvcResult.aadhaar} mono />
                <IRow label="भुगतान / Amount" labelEn="Paid" value={`₹ ${pvcResult.amount}`} accent accentColor={C.green} />
                <IRow label="Transaction ID" labelEn="TXN" value={pvcResult.txnId} mono />
                <IRow label="डिलीवरी ETA" labelEn="Delivery Time" value={pvcResult.eta} />
                <IRow label="ऑर्डर दिनांक" labelEn="Ordered At" value={new Date(pvcResult.submittedAt).toLocaleString('en-IN')} last />
              </Card>

              <div style={{ background: C.blueLight, border: `1px solid ${C.blueBorder}`, borderRadius: 10, padding: '13px 16px', marginBottom: 18, display: 'flex', gap: 12, alignItems: 'center' }}>
                <span style={{ fontSize: 22 }}>📮</span>
                <div style={{ fontFamily: F, fontSize: 'clamp(11px,1.2vw,13px)', color: C.slate, lineHeight: 1.7 }}>
                  PVC कार्ड India Post द्वारा <strong>15–20 कार्य दिवसों</strong> में आपके पते पर पहुंचेगा।<br />
                  Your PVC card will be delivered via India Post in 15–20 working days.
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <Btn onClick={() => window.print()} color={C.teal} icon="🖨️">रसीद प्रिंट / Print</Btn>
                <Btn ghost onClick={() => setScreen?.('home')} color={C.blue} icon="🏠">होम / Home</Btn>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default AadhaarServices;
