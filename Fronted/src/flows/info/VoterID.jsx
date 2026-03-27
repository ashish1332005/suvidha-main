/**
 * src/flows/info/VoterID.jsx
 *
 * VOTER ID CARD SERVICES — PRODUCTION FLOW
 * ==========================================
 * Matches the design system of HomeScreen.jsx exactly:
 *   — DM Sans + DM Mono fonts
 *   — Same color tokens, border radii, shadows
 *   — Same responsive clamp() grid patterns
 *   — Fully bilingual: Hindi + English on every label
 *   — Elder-friendly: large touch targets, 60–72px buttons
 *   — Kiosk (1280px) · Laptop (1024px) · Mobile (360px) responsive
 *
 * 5 Services:
 *  1. नया मतदाता पंजीकरण   — New Voter Registration  (Form 6)
 *  2. विवरण सुधार           — Correct Voter Details   (Form 8)
 *  3. मतदाता खोज            — Search Voter (EPIC / Name)
 *  4. ई-वोटर कार्ड          — Download e-EPIC
 *  5. आवेदन स्थिति           — Application Status
 *
 * Flow: Select Service → Fill Form → OTP Verify → Review → Receipt
 * Data: voterApi.js → kiosk-backend/routes/voter.js
 *
 * Usage in DeptScreen / OtherFlows:
 *   import VoterID from '../../flows/info/VoterID';
 *   <VoterID lang={lang} setScreen={setScreen} />
 */

import { useState, useEffect, useRef } from 'react';
import { voterApi } from '../../api/voterApi';

// ─────────────────────────────────────────────────────────────────
//  DESIGN TOKENS — identical to HomeScreen.jsx
// ─────────────────────────────────────────────────────────────────
const C = {
  // Primary navy/blue palette
  navy:       '#0A2342',
  blue:       '#1558A0',
  blueDark:   '#0D3A6B',
  blueMid:    '#2563EB',
  blueLight:  '#EFF6FF',
  blueBorder: '#BFDBFE',
  blueTint:   '#DBEAFE',

  // Amber / warning
  amber:      '#B45309',
  amberBg:    '#FFFBEB',
  amberBd:    '#FCD34D',
  amberText:  '#92400E',

  // Green / success
  green:      '#15803D',
  greenBg:    '#F0FDF4',
  greenBd:    '#86EFAC',
  greenDark:  '#14532D',

  // Red / error
  red:        '#DC2626',
  redBg:      '#FFF0F0',
  redBd:      '#FCA5A5',
  redDark:    '#991B1B',

  // Purple (correction service)
  purple:     '#7C3AED',
  purpleBg:   '#F5F3FF',
  purpleBd:   '#C4B5FD',

  // Teal (search service)
  teal:       '#0076A8',
  tealBg:     '#E8F8FF',
  tealBd:     '#7DD3FC',

  // Neutrals
  ink:        '#0A1828',
  slate:      '#1E3A50',
  muted:      '#4A6070',
  ghost:      '#7A96B0',
  ghostLight: '#94A3B8',
  rule:       '#D4E0EC',
  surface:    '#F5F9FE',
  surfaceMid: '#EDF2F8',
  white:      '#FFFFFF',

  // Tricolor
  triOrange:  '#FF9933',
  triGreen:   '#138808',
  triNavy:    '#000080',
};

// Font stacks — same as HomeScreen
const F  = "'DM Sans','Segoe UI',system-ui,sans-serif";
const FM = "'DM Mono','Courier New',monospace";
const FD = "'Noto Sans Devanagari','Mangal',sans-serif"; // for heavy Hindi

// ─────────────────────────────────────────────────────────────────
//  GLOBAL CSS
// ─────────────────────────────────────────────────────────────────
const VOTER_CSS = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=DM+Mono:wght@500;600&family=Noto+Sans+Devanagari:wght@400;600;700&display=swap');
*, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }

@keyframes vtr-up   { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
@keyframes vtr-pop  { 0%{transform:scale(.55) rotate(-6deg);opacity:0} 65%{transform:scale(1.1) rotate(1deg)} 100%{transform:scale(1) rotate(0);opacity:1} }
@keyframes vtr-dot  { 0%{box-shadow:0 0 0 0 rgba(22,163,74,.55)} 70%{box-shadow:0 0 0 8px rgba(22,163,74,0)} 100%{box-shadow:0 0 0 0 rgba(22,163,74,0)} }
@keyframes vtr-pulse{ 0%{box-shadow:0 0 0 0 rgba(21,88,160,.45)} 70%{box-shadow:0 0 0 10px rgba(21,88,160,0)} 100%{box-shadow:0 0 0 0 rgba(21,88,160,0)} }
@keyframes vtr-spin { to{transform:rotate(360deg)} }
@keyframes vtr-in   { from{opacity:0} to{opacity:1} }

.vtr-svc:hover  { transform:translateY(-3px) !important; box-shadow:0 8px 24px rgba(10,35,66,.13) !important; }
.vtr-btn:hover:not(:disabled) { transform:translateY(-2px) !important; filter:brightness(1.07) !important; }
.vtr-ghost:hover { background:${C.blueLight} !important; }
.vtr-doc:hover  { background:${C.blueLight} !important; border-color:${C.blueBorder} !important; }
.vtr-field:focus{ border-color:${C.blue} !important; box-shadow:0 0 0 3px ${C.blueTint} !important; outline:none !important; }
.vtr-otp:focus  { border-color:${C.blue} !important; box-shadow:0 0 0 4px ${C.blueTint} !important; outline:none !important; }

/* 2-col form grid, stacks on mobile */
.vtr-form-grid { display:grid; grid-template-columns:1fr 1fr; gap:clamp(12px,1.6vw,18px); }
.vtr-svc-grid  { display:grid; grid-template-columns:repeat(2,1fr); gap:clamp(10px,1.4vw,14px); }
@media(max-width:640px) {
  .vtr-form-grid { grid-template-columns:1fr !important; }
  .vtr-svc-grid  { grid-template-columns:1fr !important; }
}
`;

// ─────────────────────────────────────────────────────────────────
//  SERVICES CONFIG
// ─────────────────────────────────────────────────────────────────
const SVCS = [
  {
    id:    'new',
    icon:  '🗳️',
    hi:    'नया मतदाता पंजीकरण',
    en:    'New Voter Registration',
    subHi: 'पहली बार मतदाता बनें — Form 6',
    subEn: 'Register as a first-time voter',
    color: C.blue, bg: C.blueLight, bd: C.blueBorder,
    steps: ['सेवा','जानकारी','OTP','समीक्षा','रसीद'],
    stepsEn:['Service','Fill Form','OTP','Review','Receipt'],
    formType: 'Form 6',
  },
  {
    id:    'correction',
    icon:  '✏️',
    hi:    'विवरण सुधार',
    en:    'Correct Voter Details',
    subHi: 'नाम / पता / जन्म तिथि सुधारें — Form 8',
    subEn: 'Fix errors in existing voter record',
    color: C.purple, bg: C.purpleBg, bd: C.purpleBd,
    steps: ['सेवा','सुधार','OTP','समीक्षा','रसीद'],
    stepsEn:['Service','Correction','OTP','Review','Receipt'],
    formType: 'Form 8',
  },
  {
    id:    'search',
    icon:  '🔍',
    hi:    'मतदाता खोज',
    en:    'Search Voter',
    subHi: 'EPIC नंबर या नाम से खोजें',
    subEn: 'Find voter in electoral roll',
    color: C.teal, bg: C.tealBg, bd: C.tealBd,
    steps: ['सेवा','खोज','परिणाम'],
    stepsEn:['Service','Search','Results'],
    formType: null,
  },
  {
    id:    'download',
    icon:  '📥',
    hi:    'ई-वोटर कार्ड',
    en:    'Download e-Voter Card',
    subHi: 'डिजिटल EPIC कार्ड डाउनलोड करें',
    subEn: 'Download your digital e-EPIC PDF',
    color: C.green, bg: C.greenBg, bd: C.greenBd,
    steps: ['सेवा','सत्यापन','डाउनलोड'],
    stepsEn:['Service','Verify','Download'],
    formType: null,
  },
  {
    id:    'status',
    icon:  '📋',
    hi:    'आवेदन स्थिति',
    en:    'Application Status',
    subHi: 'Reference नंबर से स्थिति जांचें',
    subEn: 'Track your application by reference no.',
    color: C.amber, bg: C.amberBg, bd: C.amberBd,
    steps: ['सेवा','स्थिति'],
    stepsEn:['Service','Status'],
    formType: null,
  },
];

// ─────────────────────────────────────────────────────────────────
//  FORM FIELD CONFIGS
// ─────────────────────────────────────────────────────────────────

// Form 6 — New Registration
const FORM6 = [
  // PERSONAL section
  { key:'firstName',    section:'personal', hi:'पहला नाम',          en:'First Name',            type:'text',   req:true,  ph:'जैसे: Ramesh',          half:true  },
  { key:'lastName',     section:'personal', hi:'अंतिम नाम',          en:'Last Name',             type:'text',   req:true,  ph:'जैसे: Sharma',          half:true  },
  { key:'dob',          section:'personal', hi:'जन्म तिथि',          en:'Date of Birth',         type:'date',   req:true,  ph:'',                      half:true  },
  { key:'gender',       section:'personal', hi:'लिंग',               en:'Gender',                type:'select', req:true,  ph:'',                      half:true,
    opts:[{v:'M',hi:'पुरुष',en:'Male'},{v:'F',hi:'महिला',en:'Female'},{v:'O',hi:'अन्य',en:'Other'}] },
  { key:'mobile',       section:'personal', hi:'मोबाइल नंबर',        en:'Mobile Number',         type:'tel',    req:true,  ph:'10 अंक / 10 digits',    half:true  },
  { key:'email',        section:'personal', hi:'ईमेल (वैकल्पिक)',    en:'Email (optional)',       type:'email',  req:false, ph:'name@example.com',       half:true  },
  // ADDRESS section
  { key:'flatNo',       section:'address',  hi:'मकान / फ्लैट नंबर',  en:'House / Flat No.',      type:'text',   req:true,  ph:'जैसे: 42, B-204',       half:true  },
  { key:'street',       section:'address',  hi:'गली / मोहल्ला',       en:'Street / Mohalla',      type:'text',   req:true,  ph:'जैसे: Gandhi Nagar',    half:true  },
  { key:'landmark',     section:'address',  hi:'पास का निशान',        en:'Landmark',              type:'text',   req:false, ph:'जैसे: Near SBI Bank',   half:true  },
  { key:'city',         section:'address',  hi:'शहर / कस्बा',         en:'City / Town',           type:'text',   req:true,  ph:'जैसे: Ajmer',           half:true  },
  { key:'district',     section:'address',  hi:'जिला',               en:'District',              type:'text',   req:true,  ph:'जैसे: Ajmer',           half:true  },
  { key:'state',        section:'address',  hi:'राज्य',              en:'State',                 type:'select', req:true,  ph:'',                      half:true,
    opts:[{v:'RJ',hi:'राजस्थान',en:'Rajasthan'},{v:'DL',hi:'दिल्ली',en:'Delhi'},{v:'MP',hi:'मध्य प्रदेश',en:'Madhya Pradesh'},{v:'UP',hi:'उत्तर प्रदेश',en:'Uttar Pradesh'},{v:'GJ',hi:'गुजरात',en:'Gujarat'},{v:'MH',hi:'महाराष्ट्र',en:'Maharashtra'},{v:'HR',hi:'हरियाणा',en:'Haryana'},{v:'PB',hi:'पंजाब',en:'Punjab'},{v:'UK',hi:'उत्तराखंड',en:'Uttarakhand'},{v:'OT',hi:'अन्य',en:'Other'}] },
  { key:'pincode',      section:'address',  hi:'PIN कोड',            en:'PIN Code',              type:'text',   req:true,  ph:'6 अंक',                  half:true  },
  // RELATION section
  { key:'relationType', section:'relation', hi:'संबंध',              en:'Relation Type',         type:'select', req:true,  ph:'',                      half:true,
    opts:[{v:'father',hi:'पिता का नाम',en:"Father's Name"},{v:'mother',hi:'माता का नाम',en:"Mother's Name"},{v:'spouse',hi:'पति/पत्नी का नाम',en:"Spouse's Name"}] },
  { key:'relationName', section:'relation', hi:'संबंधी का पूरा नाम', en:"Relation's Full Name",  type:'text',   req:true,  ph:'पूरा नाम / Full name',  half:true  },
];

// Form 8 — Correction
const FORM8 = [
  { key:'epic',           section:'verify', hi:'EPIC / Voter ID नंबर', en:'Your Current EPIC No.',    type:'text',   req:true,  ph:'जैसे: RJ/01/123/001001', half:false },
  { key:'correctionType', section:'verify', hi:'सुधार का प्रकार',      en:'Type of Correction',       type:'select', req:true,  ph:'',                       half:true,
    opts:[{v:'name',hi:'नाम में सुधार',en:'Name Correction'},{v:'dob',hi:'जन्म तिथि सुधार',en:'DOB Correction'},{v:'address',hi:'पते में सुधार',en:'Address Correction'},{v:'photo',hi:'फोटो सुधार',en:'Photo Correction'},{v:'gender',hi:'लिंग सुधार',en:'Gender Correction'},{v:'father',hi:'पिता का नाम सुधार',en:"Father's Name Correction"}] },
  { key:'currentValue',   section:'verify', hi:'वर्तमान (गलत) विवरण', en:'Current (incorrect) value', type:'text',  req:false, ph:'मौजूदा गलत जानकारी',     half:true  },
  { key:'correctedValue', section:'verify', hi:'सही विवरण',            en:'Corrected value',           type:'text',  req:true,  ph:'सही जानकारी यहाँ',        half:true  },
  { key:'mobile',         section:'verify', hi:'मोबाइल नंबर',          en:'Mobile (for OTP)',          type:'tel',   req:true,  ph:'10 अंक / 10 digits',      half:false },
];

// Documents checklist per service
const DOCS = {
  new: [
    { hi:'आधार कार्ड / जन्म प्रमाण पत्र',  en:'Aadhaar Card / Birth Certificate',    req:true  },
    { hi:'पते का प्रमाण',                    en:'Address Proof (Aadhaar / Utility Bill)',req:true  },
    { hi:'पासपोर्ट साइज़ फोटो (2 copies)',  en:'Passport size photograph (2 copies)',  req:true  },
    { hi:'स्वयं घोषणा पत्र',                 en:'Self-declaration (signed)',            req:true  },
  ],
  correction: [
    { hi:'मौजूदा EPIC कार्ड की प्रति',      en:'Copy of existing EPIC Card',           req:true  },
    { hi:'सुधार का समर्थन दस्तावेज़',        en:'Supporting document for correction',   req:true  },
    { hi:'आधार कार्ड',                        en:'Aadhaar Card',                         req:true  },
  ],
};

// Status colors map (matches backend STATUS_LABELS)
const STATUS_COLORS = {
  submitted:    C.blue,
  blo_pending:  C.amber,
  blo_done:     C.green,
  eci_review:   C.purple,
  approved:     C.green,
  rejected:     C.red,
  card_printed: C.green,
  dispatched:   C.green,
  delivered:    C.green,
};

// ─────────────────────────────────────────────────────────────────
//  MICRO COMPONENTS
// ─────────────────────────────────────────────────────────────────

// Chevron right SVG
const ChevR = ({ size = 12, color = C.blue }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} aria-hidden="true" style={{ flexShrink:0 }}>
    <path d="M10 6L8.59 7.41L13.17 12L8.59 16.59L10 18L16 12L10 6Z" />
  </svg>
);

// Check SVG
const CheckSVG = ({ size = 16, color = C.white }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} aria-hidden="true">
    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
  </svg>
);

// Spinner
const Spinner = () => (
  <div style={{ width:20, height:20, border:`3px solid rgba(255,255,255,.3)`, borderTop:`3px solid ${C.white}`, borderRadius:'50%', animation:'vtr-spin .7s linear infinite', flexShrink:0 }} />
);

// Step progress bar
function StepBar({ steps, stepsEn, current, color }) {
  return (
    <div style={{ display:'flex', alignItems:'flex-start', padding:'4px clamp(16px,4vw,48px) 0', gap:0 }}>
      {steps.map((s, i) => {
        const done   = i < current;
        const active = i === current;
        const last   = i === steps.length - 1;
        return (
          <div key={i} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', position:'relative', minWidth:0 }}>
            {/* Connector line */}
            {!last && (
              <div style={{
                position:'absolute', top:'clamp(13px,1.6vw,16px)',
                left:'50%', right:'-50%',
                height:2,
                background: done ? color : C.rule,
                transition:'background .5s', zIndex:0,
              }} />
            )}
            {/* Circle */}
            <div style={{
              width:'clamp(26px,3.2vw,34px)', height:'clamp(26px,3.2vw,34px)',
              borderRadius:'50%', flexShrink:0, zIndex:1,
              background: done ? color : active ? color : C.white,
              border: `2.5px solid ${done || active ? color : C.rule}`,
              display:'flex', alignItems:'center', justifyContent:'center',
              boxShadow: active ? `0 0 0 5px ${color}22` : 'none',
              transition:'all .4s',
            }}>
              {done
                ? <CheckSVG size={13} />
                : <span style={{ fontFamily:FM, fontSize:'clamp(9px,1.1vw,11px)', fontWeight:800, color: active ? C.white : C.ghostLight }}>{i + 1}</span>
              }
            </div>
            {/* Label */}
            <div style={{ marginTop:4, textAlign:'center', padding:'0 2px' }}>
              <div style={{ fontFamily:F, fontSize:'clamp(9px,1vw,11px)', fontWeight:700, color: active ? color : done ? color : C.ghostLight, lineHeight:1.2, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{s}</div>
              {stepsEn && <div style={{ fontFamily:F, fontSize:'clamp(8px,.85vw,10px)', color: active ? color : C.ghostLight, opacity:.75, lineHeight:1 }}>{stepsEn[i]}</div>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Card
function Card({ children, style = {}, glow }) {
  return (
    <div style={{
      background: C.white, borderRadius:12,
      border: `1px solid ${glow ? `${glow}33` : C.rule}`,
      padding:'clamp(14px,1.8vw,20px)',
      boxShadow: glow ? `0 2px 12px ${glow}18, 0 1px 4px rgba(10,35,66,.06)` : '0 1px 5px rgba(10,35,66,.07)',
      marginBottom:12, ...style,
    }}>
      {children}
    </div>
  );
}

// Section divider
function SDiv({ icon, hi, en, color = C.blue }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:9, margin:'clamp(16px,2vw,22px) 0 clamp(12px,1.5vw,16px)', paddingBottom:10, borderBottom:`2px solid ${C.blueLight}` }}>
      <div style={{ width:32, height:32, borderRadius:8, background:`${color}12`, border:`1.5px solid ${color}28`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:17, flexShrink:0 }}>{icon}</div>
      <div>
        <div style={{ fontFamily:F, fontSize:'clamp(13px,1.5vw,15px)', fontWeight:700, color:C.ink }}>{hi}</div>
        <div style={{ fontFamily:F, fontSize:'clamp(10px,1.1vw,11px)', color:C.ghost }}>{en}</div>
      </div>
    </div>
  );
}

// Big primary button (elder-friendly height)
function Btn({ children, onClick, ghost, disabled, danger, icon, color = C.blue, loading: isLoading, sm }) {
  const H  = sm ? 'clamp(44px,5.2vw,52px)' : 'clamp(56px,6.5vw,68px)';
  const FS = sm ? 'clamp(13px,1.4vw,15px)' : 'clamp(15px,1.8vw,18px)';
  const bg = ghost ? C.white : disabled || isLoading ? '#C8D8E8' : danger ? C.red : color;
  const fg = ghost ? (danger ? C.red : color) : disabled ? C.ghost : C.white;
  const bd = ghost ? `2px solid ${danger ? C.redBd : color}` : 'none';

  return (
    <button
      onClick={onClick} disabled={disabled || isLoading}
      className={ghost ? 'vtr-btn vtr-ghost' : 'vtr-btn'}
      style={{
        width:'100%', minHeight:H, border:bd, borderRadius:10,
        background:bg, color:fg, fontFamily:F, fontSize:FS, fontWeight:700,
        cursor: disabled || isLoading ? 'not-allowed' : 'pointer',
        display:'flex', alignItems:'center', justifyContent:'center', gap:9,
        opacity: disabled && !isLoading ? .55 : 1,
        boxShadow: !ghost && !disabled && !isLoading ? `0 4px 14px ${danger ? C.red : color}38` : 'none',
        transition:'transform .15s, filter .15s, box-shadow .15s',
        letterSpacing:'.01em',
      }}
    >
      {isLoading ? <Spinner /> : (icon && <span style={{ fontSize:'1.15em', lineHeight:1 }}>{icon}</span>)}
      {children}
    </button>
  );
}

// Error / info box
function MsgBox({ msg, type = 'error' }) {
  if (!msg) return null;
  const map = {
    error:   { bg: C.redBg,   bd: C.redBd,   color: C.redDark,  icon:'⚠️' },
    warning: { bg: C.amberBg, bd: C.amberBd,  color: C.amberText,icon:'⚠️' },
    success: { bg: C.greenBg, bd: C.greenBd,  color: C.greenDark,icon:'✅' },
    info:    { bg: C.blueLight,bd: C.blueBorder,color: C.blueDark,icon:'ℹ️' },
  };
  const t = map[type] || map.error;
  return (
    <div style={{ background:t.bg, border:`1.5px solid ${t.bd}`, borderRadius:9, padding:'clamp(11px,1.4vw,14px) clamp(14px,1.7vw,18px)', marginBottom:14, display:'flex', gap:11, alignItems:'center', animation:'vtr-in .3s ease' }}>
      <span style={{ fontSize:20, flexShrink:0 }}>{t.icon}</span>
      <div style={{ fontFamily:F, fontSize:'clamp(12px,1.4vw,14px)', fontWeight:700, color:t.color, lineHeight:1.5 }}>{msg}</div>
    </div>
  );
}

// Field label (bilingual)
function FLabel({ hi, en, required }) {
  return (
    <label style={{ display:'block', marginBottom:6 }}>
      <div style={{ fontFamily:F, fontSize:'clamp(12px,1.4vw,14px)', fontWeight:700, color:C.ink, lineHeight:1.2 }}>
        {hi}{required && <span style={{ color:C.red, marginLeft:2 }}>*</span>}
      </div>
      <div style={{ fontFamily:F, fontSize:'clamp(10px,1.1vw,11px)', color:C.ghost, marginTop:1 }}>{en}</div>
    </label>
  );
}

// Text / date / tel / email / select input
function FInput({ field, value, onChange, error }) {
  const base = {
    width:'100%', height:'clamp(48px,5.6vw,58px)', padding:'0 clamp(12px,1.4vw,15px)',
    fontFamily:F, fontSize:'clamp(14px,1.6vw,16px)', color:C.ink,
    background:C.surface, borderRadius:9, transition:'border-color .2s, box-shadow .2s',
    border:`1.5px solid ${error ? C.red : value ? C.blue : C.rule}`,
    boxShadow: error ? `0 0 0 3px ${C.redBg}` : value ? `0 0 0 3px ${C.blueTint}` : 'none',
  };

  if (field.type === 'select') {
    return (
      <select value={value} onChange={e => onChange(e.target.value)} className="vtr-field" style={{ ...base, cursor:'pointer', appearance:'auto' }}>
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
      placeholder={field.ph} className="vtr-field"
      maxLength={field.key === 'mobile' || field.key === 'pincode' ? field.key === 'pincode' ? 6 : 10 : undefined}
      style={base}
    />
  );
}

// Info row for receipt/result display
function IRow({ label, labelEn, value, mono, accent, accentColor, last }) {
  return (
    <div style={{
      display:'flex', justifyContent:'space-between', alignItems:'flex-start',
      padding:'clamp(9px,1.1vw,12px) 0',
      borderBottom: last ? 'none' : `1px solid ${C.rule}`, gap:12,
    }}>
      <div style={{ flexShrink:0, maxWidth:'42%' }}>
        <div style={{ fontFamily:F, fontSize:'clamp(11px,1.2vw,13px)', color:C.muted, fontWeight:500, lineHeight:1.2 }}>{label}</div>
        {labelEn && <div style={{ fontFamily:F, fontSize:'clamp(9px,1vw,11px)', color:C.ghostLight, marginTop:1 }}>{labelEn}</div>}
      </div>
      <span style={{
        fontFamily: mono ? FM : F,
        fontSize:   accent ? 'clamp(14px,1.6vw,16px)' : 'clamp(12px,1.4vw,14px)',
        fontWeight: accent ? 800 : 600,
        color:      accentColor || (mono ? C.blue : C.ink),
        textAlign:'right', maxWidth:'55%', wordBreak:'break-all', lineHeight:1.4,
      }}>{value}</span>
    </div>
  );
}

// 6-digit OTP input boxes
function OTPInput({ value, onChange, onSubmit }) {
  const refs  = useRef([]);
  const digits = (value.padEnd(6, ' ')).slice(0, 6).split('');

  const handleKey = (i, e) => {
    if (e.key === 'Backspace') {
      const arr = digits.map(d => d.trim());
      arr[i] = '';
      onChange(arr.join('').trimEnd());
      if (i > 0) refs.current[i - 1]?.focus();
      return;
    }
    if (e.key === 'Enter' && value.replace(/\s/g, '').length === 6) { onSubmit?.(); return; }
    if (/^\d$/.test(e.key)) {
      const arr = digits.map(d => d.trim());
      arr[i] = e.key;
      onChange(arr.join('').trimEnd());
      if (i < 5) refs.current[i + 1]?.focus();
    }
  };

  return (
    <div style={{ display:'flex', gap:'clamp(8px,1.2vw,14px)', justifyContent:'center', margin:'0 auto', maxWidth:400 }}>
      {[0,1,2,3,4,5].map(i => {
        const filled = digits[i]?.trim();
        return (
          <input
            key={i} ref={el => refs.current[i] = el}
            type="text" inputMode="numeric" maxLength={1}
            value={filled || ''}
            onKeyDown={e => handleKey(i, e)}
            onChange={() => {}}
            className="vtr-otp"
            style={{
              width:'clamp(44px,6vw,58px)', height:'clamp(54px,7vw,66px)',
              textAlign:'center', fontFamily:FM,
              fontSize:'clamp(22px,3vw,30px)', fontWeight:800,
              color: filled ? C.blue : C.ink,
              background: filled ? C.blueLight : C.surface,
              border:`2px solid ${filled ? C.blue : C.rule}`,
              borderRadius:10, transition:'border-color .2s, box-shadow .2s, background .2s',
            }}
          />
        );
      })}
    </div>
  );
}

// Voter result card
function VoterCard({ voter }) {
  return (
    <Card glow={C.blue} style={{ animation:'vtr-up .35s ease' }}>
      <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:12, paddingBottom:12, borderBottom:`1.5px solid ${C.blueLight}` }}>
        <div style={{ width:48, height:48, borderRadius:12, background:C.blueLight, border:`2px solid ${C.blueBorder}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:26, flexShrink:0 }}>🗳️</div>
        <div>
          <div style={{ fontFamily:F, fontSize:'clamp(14px,1.7vw,17px)', fontWeight:800, color:C.ink }}>{voter.name}</div>
          <div style={{ fontFamily:FM, fontSize:'clamp(12px,1.4vw,14px)', fontWeight:600, color:C.blue, marginTop:2 }}>{voter.epicNo}</div>
        </div>
      </div>
      <IRow label="पिता/माता"    labelEn="Father / Mother"     value={voter.fatherName} />
      <IRow label="जन्म तिथि"   labelEn="Date of Birth"       value={voter.dob} mono />
      <IRow label="लिंग"         labelEn="Gender"               value={voter.gender} />
      <IRow label="पता"          labelEn="Address"              value={voter.address} />
      <IRow label="जिला / राज्य" labelEn="District / State"     value={`${voter.district}, ${voter.state} — ${voter.pincode}`} />
      <IRow label="मतदान केंद्र" labelEn="Booth"                value={voter.booth} />
      <IRow label="विधानसभा"    labelEn="Assembly Constituency" value={voter.assembly} last />
    </Card>
  );
}

// ─────────────────────────────────────────────────────────────────
//  MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────
export function VoterID({ lang = 'en', setScreen }) {
  const isHi = lang === 'hi';

  // Core flow state
  const [step,          setStep]        = useState(0);
  const [svc,           setSvc]         = useState(null);   // selected SVCS object
  const [formData,      setFormData]    = useState({});
  const [errors,        setErrors]      = useState({});
  const [docsOk,        setDocsOk]      = useState({});
  const [globalErr,     setGlobalErr]   = useState('');
  const [loading,       setLoading]     = useState(false);
  const [receipt,       setReceipt]     = useState(null);

  // OTP state
  const [otp,           setOtp]         = useState('');
  const [otpCountdown,  setOtpCd]       = useState(0);
  const [otpVerified,   setOtpVerified] = useState(false);

  // Search state
  const [srchEpic,      setSrchEpic]    = useState('');
  const [srchName,      setSrchName]    = useState('');
  const [srchDob,       setSrchDob]     = useState('');
  const [srchResults,   setSrchResults] = useState(null);

  // Download state
  const [dlEpic,        setDlEpic]      = useState('');
  const [dlDob,         setDlDob]       = useState('');
  const [dlResult,      setDlResult]    = useState(null);

  // Status state
  const [stRef,         setStRef]       = useState('');
  const [stResult,      setStResult]    = useState(null);

  // OTP countdown timer
  useEffect(() => {
    if (otpCountdown <= 0) return;
    const timer = setInterval(() => setOtpCd(n => (n <= 1 ? 0 : n - 1)), 1000);
    return () => clearInterval(timer);
  }, [otpCountdown]);

  // ── Helpers ──────────────────────────────────────────────────
  const fields     = svc?.id === 'correction' ? FORM8 : FORM6;
  const docsList   = DOCS[svc?.id] || DOCS.new;
  const allDocsOk  = docsList.filter(d => d.req).every((_, i) => docsOk[i]);
  const steps      = svc ? svc.steps : [];
  const stepsEn    = svc ? svc.stepsEn : [];
  const accent     = svc?.color || C.blue;

  const setF = (key, val) => {
    setFormData(d => ({ ...d, [key]: val }));
    setErrors(e => ({ ...e, [key]: undefined }));
    setGlobalErr('');
  };

  const validate = () => {
    const errs = {};
    fields.forEach(f => {
      if (f.req && !formData[f.key]?.trim()) errs[f.key] = `${f.hi} आवश्यक है / ${f.en} is required`;
    });
    if (formData.mobile && !/^\d{10}$/.test(formData.mobile.replace(/\s/g, ''))) errs.mobile = 'मोबाइल 10 अंक का होना चाहिए / Must be 10 digits';
    if (formData.pincode && !/^\d{6}$/.test(formData.pincode)) errs.pincode = 'PIN 6 अंक का होना चाहिए / Must be 6 digits';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const goBack = () => {
    setGlobalErr('');
    if (step === 0) setScreen?.('home');
    else if (step === 1) { setStep(0); setSvc(null); setFormData({}); setErrors({}); setDocsOk({}); }
    else setStep(s => s - 1);
  };

  // ── API calls ────────────────────────────────────────────────
  const sendOtp = async () => {
    if (!validate()) return;
    setLoading(true); setGlobalErr('');
    try {
      const res = await voterApi.sendOtp(formData.mobile.replace(/\s/g, ''));
      setOtpCd(60); setOtp(''); setStep(3);
      if (res._devOtp) setGlobalErr(`[DEV] OTP: ${res._devOtp}`); // remove in prod
    } catch (e) { setGlobalErr(e.message || 'OTP भेजने में समस्या / Failed to send OTP'); }
    finally { setLoading(false); }
  };

  const verifyOtp = async () => {
    const clean = otp.replace(/\s/g, '');
    if (clean.length < 6) { setGlobalErr('6 अंक का OTP दर्ज करें / Enter 6-digit OTP'); return; }
    setLoading(true); setGlobalErr('');
    try {
      await voterApi.verifyOtp(formData.mobile.replace(/\s/g, ''), clean);
      setOtpVerified(true); setStep(4);
    } catch (e) { setGlobalErr(e.message || 'गलत OTP / Incorrect OTP'); }
    finally { setLoading(false); }
  };

  const submitNew = async () => {
    setLoading(true); setGlobalErr('');
    try {
      const res = await voterApi.submitApplication({ formData, lang });
      setReceipt(res); setStep(5);
    } catch (e) { setGlobalErr(e.message || 'आवेदन जमा में समस्या / Submission failed'); }
    finally { setLoading(false); }
  };

  const submitCorrection = async () => {
    setLoading(true); setGlobalErr('');
    try {
      const res = await voterApi.submitCorrection({ formData, lang });
      setReceipt(res); setStep(5);
    } catch (e) { setGlobalErr(e.message || 'सुधार जमा में समस्या / Correction failed'); }
    finally { setLoading(false); }
  };

  const doSearch = async () => {
    if (!srchEpic && srchName.trim().length < 3) { setGlobalErr('EPIC नंबर या कम से कम 3 अक्षर का नाम दर्ज करें / Enter EPIC or name (min 3 chars)'); return; }
    setLoading(true); setGlobalErr('');
    try {
      const res = await voterApi.searchVoter({ epic: srchEpic, name: srchName, dob: srchDob });
      setSrchResults(res); setStep(3);
    } catch (e) { setGlobalErr(e.message || 'खोज में समस्या / Search failed'); }
    finally { setLoading(false); }
  };

  const doDownload = async () => {
    if (!dlEpic.trim() || !dlDob) { setGlobalErr('EPIC नंबर और जन्म तिथि दर्ज करें / Enter EPIC and DOB'); return; }
    setLoading(true); setGlobalErr('');
    try {
      const res = await voterApi.downloadEpic({ epic: dlEpic.trim(), dob: dlDob });
      setDlResult(res); setStep(3);
    } catch (e) { setGlobalErr(e.message || 'Voter Card नहीं मिला / Not found'); }
    finally { setLoading(false); }
  };

  const doStatus = async () => {
    if (!stRef.trim()) { setGlobalErr('Reference नंबर दर्ज करें / Enter reference number'); return; }
    setLoading(true); setGlobalErr('');
    try {
      const res = await voterApi.getApplicationStatus(stRef.trim());
      setStResult(res); setStep(3);
    } catch (e) { setGlobalErr(e.message || 'स्थिति नहीं मिली / Status not found'); }
    finally { setLoading(false); }
  };

  // ── RENDER ───────────────────────────────────────────────────
  return (
    <div style={{ flex:1, display:'flex', flexDirection:'column', background:C.surface, minHeight:'100vh' }}>
      <style>{VOTER_CSS}</style>

      {/* ═══════════════════ HEADER ═══════════════════ */}
      <div style={{
        background:`linear-gradient(135deg,${C.navy} 0%,${C.blue} 100%)`,
        padding:'clamp(12px,1.6vw,18px) clamp(16px,3vw,40px)',
        boxShadow:`0 4px 20px ${C.navy}44`, position:'sticky', top:0, zIndex:50,
      }}>
        {/* Tricolor top stripe */}
        <div style={{ position:'absolute', top:0, left:0, right:0, height:4,
          background:`linear-gradient(90deg,${C.triOrange} 33.33%,${C.white} 33.33%,${C.white} 66.66%,${C.triGreen} 66.66%)` }} />

        {/* Back + title row */}
        <div style={{ display:'flex', alignItems:'center', gap:12, marginTop:4, marginBottom: step > 0 && svc ? 12 : 0 }}>
          <button onClick={goBack} style={{
            background:'rgba(255,255,255,.1)', border:'1.5px solid rgba(255,255,255,.22)',
            borderRadius:8, padding:'6px 14px', cursor:'pointer', color:C.white,
            fontFamily:F, fontSize:'clamp(11px,1.2vw,13px)', fontWeight:600,
            display:'flex', alignItems:'center', gap:5, flexShrink:0,
            transition:'background .15s',
          }}
          onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,.18)'}
          onMouseLeave={e => e.currentTarget.style.background='rgba(255,255,255,.1)'}>
            ← {isHi ? 'वापस' : 'Back'}
          </button>

          <div style={{ display:'flex', alignItems:'center', gap:11, flex:1 }}>
            <div style={{ width:'clamp(38px,4.5vw,50px)', height:'clamp(38px,4.5vw,50px)', borderRadius:10, background:'rgba(255,255,255,.14)', border:'1.5px solid rgba(255,255,255,.22)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'clamp(20px,2.5vw,28px)', flexShrink:0 }}>
              {svc ? svc.icon : '🗳️'}
            </div>
            <div>
              <h1 style={{ fontFamily:F, fontSize:'clamp(14px,1.8vw,20px)', fontWeight:800, color:C.white, lineHeight:1.1, margin:0 }}>
                मतदाता पहचान पत्र सेवाएं
              </h1>
              <div style={{ fontFamily:F, fontSize:'clamp(10px,1vw,12px)', color:'rgba(255,255,255,.5)', marginTop:2 }}>
                {svc ? `${svc.hi} · ${svc.en}` : 'Voter ID Card Services · Election Commission of India'}
              </div>
            </div>
          </div>

          {/* ECI badge */}
          <div style={{ background:'rgba(255,255,255,.1)', border:'1px solid rgba(255,255,255,.18)', borderRadius:8, padding:'5px 11px', textAlign:'center', flexShrink:0 }}>
            <div style={{ fontFamily:F, fontSize:9, color:'rgba(255,255,255,.4)', fontWeight:700, letterSpacing:'.08em', textTransform:'uppercase' }}>ECI</div>
            <div style={{ fontFamily:FM, fontSize:'clamp(11px,1.2vw,13px)', color:C.white, fontWeight:800, letterSpacing:'.04em', marginTop:1 }}>1950</div>
          </div>
        </div>

        {/* Step progress bar */}
        {svc && step > 0 && step < 6 && (
          <div style={{ background:'rgba(255,255,255,.07)', borderRadius:10, padding:'10px 0 8px', marginTop:2 }}>
            <StepBar steps={svc.steps} stepsEn={svc.stepsEn} current={step - 1} color={accent} />
          </div>
        )}
      </div>

      {/* ═══════════════════ SCROLLABLE BODY ═══════════════════ */}
      <div style={{ flex:1, overflowY:'auto' }}>
        <div style={{ maxWidth:740, margin:'0 auto', padding:'clamp(18px,2.5vw,32px) clamp(14px,3vw,32px) 80px', animation:'vtr-up .38s ease' }}>

          {/* ──────────────────────────────────────────────────
              STEP 0: SERVICE SELECTION
          ────────────────────────────────────────────────── */}
          {step === 0 && (
            <>
              {/* Info banner */}
              <div style={{ background:C.blueLight, border:`1px solid ${C.blueBorder}`, borderRadius:10, padding:'clamp(13px,1.6vw,17px)', marginBottom:18, display:'flex', gap:12 }}>
                <span style={{ fontSize:24, flexShrink:0 }}>ℹ️</span>
                <div>
                  <div style={{ fontFamily:F, fontSize:'clamp(13px,1.5vw,15px)', fontWeight:700, color:C.ink, marginBottom:4 }}>
                    मतदाता सेवाएं / Voter Services
                  </div>
                  <div style={{ fontFamily:F, fontSize:'clamp(11px,1.2vw,13px)', color:C.muted, lineHeight:1.8 }}>
                    18 वर्ष या अधिक आयु के भारतीय नागरिक नीचे दी गई सेवाओं का लाभ उठा सकते हैं।
                    <br />Indian citizens aged 18+ can avail the services below. For help call <strong style={{ color:C.blue }}>1950</strong> (Voter Helpline).
                  </div>
                </div>
              </div>

              {/* Service cards grid */}
              <div className="vtr-svc-grid" style={{ marginBottom:18 }}>
                {SVCS.map(s => (
                  <button
                    key={s.id}
                    className="vtr-svc"
                    onClick={() => { setSvc(s); setStep(1); setFormData({}); setErrors({}); setDocsOk({}); setGlobalErr(''); setOtp(''); setOtpVerified(false); setReceipt(null); setSrchResults(null); setDlResult(null); setStResult(null); }}
                    style={{
                      background:C.white, border:`1px solid ${C.rule}`,
                      borderRadius:12, padding:0, cursor:'pointer', textAlign:'left',
                      display:'flex', flexDirection:'column', overflow:'hidden',
                      boxShadow:'0 1px 5px rgba(10,35,66,.07)',
                      transition:'transform .2s, box-shadow .2s',
                    }}
                  >
                    <div style={{ height:4, background:s.color }} />
                    <div style={{ padding:'clamp(13px,1.7vw,18px)' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:9 }}>
                        <div style={{ width:'clamp(38px,4.5vw,48px)', height:'clamp(38px,4.5vw,48px)', borderRadius:10, background:s.bg, border:`1px solid ${s.bd}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'clamp(19px,2.3vw,26px)', flexShrink:0 }}>{s.icon}</div>
                        <div>
                          <div style={{ fontFamily:F, fontSize:'clamp(13px,1.5vw,15px)', fontWeight:800, color:C.ink, lineHeight:1.15 }}>{s.hi}</div>
                          <div style={{ fontFamily:F, fontSize:'clamp(10px,1.1vw,12px)', color:s.color, fontWeight:700, marginTop:2 }}>{s.en}</div>
                          {s.formType && <div style={{ fontFamily:FM, fontSize:'clamp(9px,1vw,11px)', color:C.ghost, marginTop:2 }}>{s.formType}</div>}
                        </div>
                      </div>
                      <div style={{ fontFamily:F, fontSize:'clamp(11px,1.2vw,13px)', color:C.slate, lineHeight:1.65, marginBottom:8 }}>{s.subHi}</div>
                      <div style={{ fontFamily:F, fontSize:'clamp(10px,1vw,11px)', color:C.ghost }}>{s.subEn}</div>
                      <div style={{ display:'flex', alignItems:'center', gap:4, marginTop:10 }}>
                        <span style={{ fontFamily:F, fontSize:'clamp(10px,1.1vw,12px)', fontWeight:700, color:s.color }}>आगे बढ़ें / Proceed</span>
                        <ChevR size={11} color={s.color} />
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Documents required preview */}
              <Card>
                <div style={{ display:'flex', alignItems:'center', gap:9, marginBottom:12 }}>
                  <span style={{ fontSize:18 }}>📋</span>
                  <div style={{ fontFamily:F, fontSize:'clamp(12px,1.4vw,14px)', fontWeight:700, color:C.ink }}>
                    नए पंजीकरण के लिए आवश्यक दस्तावेज़ / Documents for New Registration
                  </div>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                  {DOCS.new.map((d, i) => (
                    <div key={i} style={{ display:'flex', gap:9, alignItems:'center', padding:'9px 11px', background:C.surface, border:`1px solid ${C.rule}`, borderRadius:8 }}>
                      <span style={{ fontSize:16, flexShrink:0 }}>📄</span>
                      <div>
                        <div style={{ fontFamily:F, fontSize:'clamp(11px,1.2vw,13px)', fontWeight:700, color:C.ink }}>{d.hi}</div>
                        <div style={{ fontFamily:F, fontSize:'clamp(9px,1vw,10px)', color:C.ghost }}>{d.en}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </>
          )}

          {/* ──────────────────────────────────────────────────
              STEP 1 (new): FORM 6 — Full Registration Form
          ────────────────────────────────────────────────── */}
          {step === 1 && svc?.id === 'new' && (
            <>
              <MsgBox msg={globalErr} type={globalErr.startsWith('[DEV]') ? 'info' : 'error'} />

              {/* Service badge */}
              <div style={{ display:'flex', alignItems:'center', gap:11, padding:'11px 14px', background:svc.bg, border:`1px solid ${svc.bd}`, borderRadius:10, marginBottom:18 }}>
                <span style={{ fontSize:24 }}>{svc.icon}</span>
                <div>
                  <div style={{ fontFamily:F, fontSize:'clamp(13px,1.5vw,15px)', fontWeight:700, color:svc.color }}>{svc.hi} · {svc.en}</div>
                  <div style={{ fontFamily:F, fontSize:'clamp(10px,1.1vw,12px)', color:C.muted }}>{svc.formType} — Election Commission of India</div>
                </div>
              </div>

              {/* PERSONAL section */}
              <SDiv icon="👤" hi="व्यक्तिगत जानकारी" en="Personal Information" color={svc.color} />
              <div className="vtr-form-grid">
                {FORM6.filter(f => f.section === 'personal').map(f => (
                  <div key={f.key} style={{ display:'flex', flexDirection:'column', gap:0 }}>
                    <FLabel hi={f.hi} en={f.en} required={f.req} />
                    <FInput field={f} value={formData[f.key] || ''} onChange={v => setF(f.key, v)} error={errors[f.key]} />
                    {errors[f.key] && <span style={{ fontFamily:F, fontSize:11, color:C.red, marginTop:3 }}>⚠ {errors[f.key]}</span>}
                  </div>
                ))}
              </div>

              {/* ADDRESS section */}
              <SDiv icon="🏠" hi="स्थायी पता" en="Permanent Residential Address" color={svc.color} />
              <div className="vtr-form-grid">
                {FORM6.filter(f => f.section === 'address').map(f => (
                  <div key={f.key} style={{ display:'flex', flexDirection:'column', gap:0 }}>
                    <FLabel hi={f.hi} en={f.en} required={f.req} />
                    <FInput field={f} value={formData[f.key] || ''} onChange={v => setF(f.key, v)} error={errors[f.key]} />
                    {errors[f.key] && <span style={{ fontFamily:F, fontSize:11, color:C.red, marginTop:3 }}>⚠ {errors[f.key]}</span>}
                  </div>
                ))}
              </div>

              {/* RELATION section */}
              <SDiv icon="👨‍👩‍👧" hi="संबंधी जानकारी" en="Relation Details (Father / Mother / Spouse)" color={svc.color} />
              <div className="vtr-form-grid">
                {FORM6.filter(f => f.section === 'relation').map(f => (
                  <div key={f.key} style={{ display:'flex', flexDirection:'column', gap:0 }}>
                    <FLabel hi={f.hi} en={f.en} required={f.req} />
                    <FInput field={f} value={formData[f.key] || ''} onChange={v => setF(f.key, v)} error={errors[f.key]} />
                    {errors[f.key] && <span style={{ fontFamily:F, fontSize:11, color:C.red, marginTop:3 }}>⚠ {errors[f.key]}</span>}
                  </div>
                ))}
              </div>

              {/* Document checklist */}
              <SDiv icon="📋" hi="दस्तावेज़ पुष्टि" en="Document Availability Checklist" color={svc.color} />
              <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:16 }}>
                {docsList.map((d, i) => (
                  <div
                    key={i}
                    className="vtr-doc"
                    onClick={() => setDocsOk(dk => ({ ...dk, [i]: !dk[i] }))}
                    style={{
                      display:'flex', gap:12, alignItems:'center', padding:'11px 14px',
                      background: docsOk[i] ? C.greenBg : C.surface,
                      border:`1.5px solid ${docsOk[i] ? C.greenBd : C.rule}`,
                      borderRadius:9, cursor:'pointer', transition:'background .2s, border-color .2s',
                    }}
                  >
                    <div style={{ width:22, height:22, borderRadius:5, flexShrink:0, background: docsOk[i] ? C.green : C.white, border:`2px solid ${docsOk[i] ? C.green : C.rule}`, display:'flex', alignItems:'center', justifyContent:'center', transition:'all .2s' }}>
                      {docsOk[i] && <CheckSVG size={12} />}
                    </div>
                    <div>
                      <div style={{ fontFamily:F, fontSize:'clamp(12px,1.4vw,14px)', fontWeight:700, color:C.ink }}>{d.hi}{d.req && <span style={{ color:C.red, marginLeft:2 }}>*</span>}</div>
                      <div style={{ fontFamily:F, fontSize:'clamp(10px,1.1vw,12px)', color:C.ghost, marginTop:1 }}>{d.en}</div>
                    </div>
                  </div>
                ))}
              </div>

              {!allDocsOk && (
                <MsgBox msg="सभी आवश्यक (*) दस्तावेज़ उपलब्ध हैं यह पुष्टि करें / Confirm all required documents are available" type="warning" />
              )}

              <Btn onClick={sendOtp} disabled={!allDocsOk} loading={loading} icon="📱" color={accent}>
                OTP भेजें और आगे बढ़ें / Send OTP & Continue →
              </Btn>
            </>
          )}

          {/* ──────────────────────────────────────────────────
              STEP 1 (correction): FORM 8
          ────────────────────────────────────────────────── */}
          {step === 1 && svc?.id === 'correction' && (
            <>
              <MsgBox msg={globalErr} type="error" />
              <div style={{ display:'flex', alignItems:'center', gap:11, padding:'11px 14px', background:svc.bg, border:`1px solid ${svc.bd}`, borderRadius:10, marginBottom:18 }}>
                <span style={{ fontSize:24 }}>{svc.icon}</span>
                <div>
                  <div style={{ fontFamily:F, fontSize:'clamp(13px,1.5vw,15px)', fontWeight:700, color:svc.color }}>{svc.hi} · {svc.en}</div>
                  <div style={{ fontFamily:F, fontSize:'clamp(10px,1.1vw,12px)', color:C.muted }}>Form 8 — Election Commission of India</div>
                </div>
              </div>

              <SDiv icon="✏️" hi="सुधार विवरण" en="Correction Details" color={svc.color} />
              <div className="vtr-form-grid">
                {FORM8.map(f => (
                  <div key={f.key} style={{ display:'flex', flexDirection:'column', gap:0, gridColumn: f.half ? 'auto' : '1 / -1' }}>
                    <FLabel hi={f.hi} en={f.en} required={f.req} />
                    <FInput field={f} value={formData[f.key] || ''} onChange={v => setF(f.key, v)} error={errors[f.key]} />
                    {errors[f.key] && <span style={{ fontFamily:F, fontSize:11, color:C.red, marginTop:3 }}>⚠ {errors[f.key]}</span>}
                  </div>
                ))}
              </div>

              <SDiv icon="📋" hi="सहायक दस्तावेज़" en="Supporting Documents Checklist" color={svc.color} />
              <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:16 }}>
                {docsList.map((d, i) => (
                  <div key={i} className="vtr-doc" onClick={() => setDocsOk(dk => ({ ...dk, [i]: !dk[i] }))}
                    style={{ display:'flex', gap:12, alignItems:'center', padding:'11px 14px', background: docsOk[i] ? C.greenBg : C.surface, border:`1.5px solid ${docsOk[i] ? C.greenBd : C.rule}`, borderRadius:9, cursor:'pointer', transition:'background .2s, border-color .2s' }}>
                    <div style={{ width:22, height:22, borderRadius:5, flexShrink:0, background: docsOk[i] ? C.green : C.white, border:`2px solid ${docsOk[i] ? C.green : C.rule}`, display:'flex', alignItems:'center', justifyContent:'center' }}>
                      {docsOk[i] && <CheckSVG size={12} />}
                    </div>
                    <div>
                      <div style={{ fontFamily:F, fontSize:'clamp(12px,1.4vw,14px)', fontWeight:700, color:C.ink }}>{d.hi}{d.req && <span style={{ color:C.red }}>*</span>}</div>
                      <div style={{ fontFamily:F, fontSize:'clamp(10px,1.1vw,12px)', color:C.ghost }}>{d.en}</div>
                    </div>
                  </div>
                ))}
              </div>
              {!allDocsOk && <MsgBox msg="सभी आवश्यक दस्तावेज़ की पुष्टि करें / Confirm required documents" type="warning" />}
              <Btn onClick={sendOtp} disabled={!allDocsOk} loading={loading} icon="📱" color={accent}>
                OTP भेजें / Send OTP →
              </Btn>
            </>
          )}

          {/* ──────────────────────────────────────────────────
              STEP 1 (search): SEARCH FORM
          ────────────────────────────────────────────────── */}
          {step === 1 && svc?.id === 'search' && (
            <>
              <MsgBox msg={globalErr} type="error" />
              <Card glow={C.teal}>
                <SDiv icon="🔍" hi="मतदाता खोज" en="Search Electoral Roll" color={C.teal} />

                <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                  <div>
                    <FLabel hi="EPIC / Voter ID नंबर" en="EPIC Number (optional if name is given)" />
                    <FInput field={{ type:'text', ph:'जैसे: RJ/01/123/001001', key:'epic' }} value={srchEpic} onChange={setSrchEpic} />
                  </div>
                  <div style={{ textAlign:'center', fontFamily:F, fontSize:12, color:C.ghostLight, fontWeight:700 }}>— अथवा / OR —</div>
                  <div>
                    <FLabel hi="पूरा नाम" en="Full Name (minimum 3 characters)" />
                    <FInput field={{ type:'text', ph:'जैसे: Ramesh Sharma', key:'name' }} value={srchName} onChange={setSrchName} />
                  </div>
                  <div>
                    <FLabel hi="जन्म तिथि (वैकल्पिक)" en="Date of Birth (optional — helps narrow results)" />
                    <FInput field={{ type:'date', ph:'', key:'dob' }} value={srchDob} onChange={setSrchDob} />
                  </div>
                </div>
              </Card>
              <Btn onClick={doSearch} loading={loading} icon="🔍" color={C.teal}>
                मतदाता खोजें / Search Voter →
              </Btn>
            </>
          )}

          {/* ──────────────────────────────────────────────────
              STEP 1 (download): e-EPIC VERIFY
          ────────────────────────────────────────────────── */}
          {step === 1 && svc?.id === 'download' && (
            <>
              <MsgBox msg={globalErr} type="error" />
              <Card glow={C.green}>
                <SDiv icon="📥" hi="पहचान सत्यापन" en="Identity Verification for e-EPIC Download" color={C.green} />
                <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                  <div>
                    <FLabel hi="EPIC / Voter ID नंबर *" en="Your Voter ID / EPIC Number *" required />
                    <FInput field={{ type:'text', ph:'जैसे: RJ/01/123/001001', key:'epic' }} value={dlEpic} onChange={setDlEpic} />
                  </div>
                  <div>
                    <FLabel hi="जन्म तिथि *" en="Date of Birth *" required />
                    <FInput field={{ type:'date', ph:'', key:'dob' }} value={dlDob} onChange={setDlDob} />
                  </div>
                </div>
                <div style={{ marginTop:14, padding:'10px 14px', background:C.amberBg, border:`1px solid ${C.amberBd}`, borderRadius:8, fontFamily:F, fontSize:'clamp(11px,1.2vw,13px)', color:C.amberText }}>
                  🔒 आपकी जानकारी सुरक्षित है। EPIC नंबर और जन्म तिथि का उपयोग केवल सत्यापन के लिए किया जाएगा।<br />
                  Your data is secure. EPIC and DOB are used only for identity verification.
                </div>
              </Card>
              <Btn onClick={doDownload} loading={loading} icon="📥" color={C.green}>
                सत्यापित करें और डाउनलोड करें / Verify & Download →
              </Btn>
            </>
          )}

          {/* ──────────────────────────────────────────────────
              STEP 1 (status): STATUS CHECK
          ────────────────────────────────────────────────── */}
          {step === 1 && svc?.id === 'status' && (
            <>
              <MsgBox msg={globalErr} type="error" />
              <Card glow={C.amber}>
                <SDiv icon="🔍" hi="आवेदन स्थिति" en="Track Your Application" color={C.amber} />
                <FLabel hi="Reference / Application नंबर *" en="Enter reference number from your receipt *" required />
                <FInput field={{ type:'text', ph:'जैसे: VTR-20250315-AB1234', key:'stRef' }} value={stRef} onChange={setStRef} />
                <div style={{ marginTop:12, fontFamily:F, fontSize:'clamp(11px,1.2vw,13px)', color:C.muted }}>
                  📞 Voter Helpline: <strong style={{ color:C.blue }}>1950</strong> &nbsp;|&nbsp; ECI Portal: <strong>voters.eci.gov.in</strong>
                </div>
              </Card>
              <Btn onClick={doStatus} loading={loading} icon="🔍" color={C.amber}>
                स्थिति जांचें / Check Status →
              </Btn>
            </>
          )}

          {/* ──────────────────────────────────────────────────
              STEP 3 (new/correction): OTP VERIFICATION
          ────────────────────────────────────────────────── */}
          {step === 3 && (svc?.id === 'new' || svc?.id === 'correction') && (
            <>
              <MsgBox msg={globalErr} type={globalErr.startsWith('[DEV]') ? 'info' : 'error'} />
              <Card glow={accent} style={{ textAlign:'center' }}>
                <div style={{ marginBottom:22 }}>
                  <div style={{ width:72, height:72, borderRadius:'50%', background:C.blueLight, border:`3px solid ${C.blueBorder}`, display:'inline-flex', alignItems:'center', justifyContent:'center', fontSize:36, marginBottom:14, animation:'vtr-pulse 2s ease-in-out infinite' }}>📱</div>
                  <div style={{ fontFamily:F, fontSize:'clamp(16px,2vw,20px)', fontWeight:800, color:C.ink, marginBottom:7 }}>OTP सत्यापन / OTP Verification</div>
                  <div style={{ fontFamily:F, fontSize:'clamp(12px,1.4vw,14px)', color:C.muted, lineHeight:1.7 }}>
                    <strong style={{ color:C.blue }}>+91 {formData.mobile}</strong> पर 6 अंक का OTP भेजा गया है।<br />
                    A 6-digit OTP has been sent to your registered mobile.
                  </div>
                </div>
                <OTPInput value={otp} onChange={setOtp} onSubmit={verifyOtp} />
                <div style={{ marginTop:14 }}>
                  {otpCountdown > 0
                    ? <span style={{ fontFamily:F, fontSize:13, color:C.ghost }}>
                        OTP दोबारा भेजने के लिए / Resend in <strong style={{ color:C.blue }}>{otpCountdown}s</strong>
                      </span>
                    : <button onClick={() => { voterApi.sendOtp(formData.mobile); setOtpCd(60); setOtp(''); }}
                        style={{ background:'none', border:'none', cursor:'pointer', fontFamily:F, fontSize:13, color:C.blue, fontWeight:700 }}>
                        🔄 OTP दोबारा भेजें / Resend OTP
                      </button>
                  }
                </div>
              </Card>
              <Btn onClick={verifyOtp} disabled={otp.replace(/\s/g,'').length < 6} loading={loading} icon="✅" color={accent}>
                OTP सत्यापित करें / Verify OTP →
              </Btn>
            </>
          )}

          {/* ──────────────────────────────────────────────────
              STEP 3 (search): SEARCH RESULTS
          ────────────────────────────────────────────────── */}
          {step === 3 && svc?.id === 'search' && (
            <>
              {srchResults?.total === 0 ? (
                <Card>
                  <div style={{ textAlign:'center', padding:'28px 0' }}>
                    <div style={{ fontSize:52, marginBottom:14 }}>🔍</div>
                    <div style={{ fontFamily:F, fontSize:'clamp(15px,1.8vw,18px)', fontWeight:700, color:C.ink, marginBottom:7 }}>कोई मतदाता नहीं मिला</div>
                    <div style={{ fontFamily:F, fontSize:'clamp(12px,1.3vw,14px)', color:C.muted, marginBottom:22 }}>No voter found. Please check the details and try again.<br />सही जानकारी देकर पुनः खोजें।</div>
                    <Btn ghost sm onClick={() => { setStep(1); setSrchResults(null); }} color={C.teal}>← दोबारा खोजें / Search Again</Btn>
                  </div>
                </Card>
              ) : (
                <>
                  <div style={{ fontFamily:F, fontSize:'clamp(13px,1.5vw,15px)', fontWeight:700, color:C.ink, marginBottom:13 }}>
                    {srchResults?.total} {isHi ? 'मतदाता मिले' : 'voter(s) found'}
                  </div>
                  {srchResults?.voters?.map((v, i) => <VoterCard key={i} voter={v} />)}
                  <Btn ghost sm onClick={() => { setStep(1); setSrchResults(null); }} color={C.teal}>← नई खोज / New Search</Btn>
                </>
              )}
            </>
          )}

          {/* ──────────────────────────────────────────────────
              STEP 3 (download): DOWNLOAD RESULT
          ────────────────────────────────────────────────── */}
          {step === 3 && svc?.id === 'download' && dlResult && (
            <Card glow={C.green}>
              <div style={{ textAlign:'center', marginBottom:20 }}>
                <div style={{ width:72, height:72, borderRadius:'50%', background:C.greenBg, border:`3px solid ${C.greenBd}`, display:'inline-flex', alignItems:'center', justifyContent:'center', fontSize:36, marginBottom:12, animation:'vtr-pop .5s ease' }}>📥</div>
                <div style={{ fontFamily:F, fontSize:'clamp(16px,2vw,20px)', fontWeight:800, color:C.green }}>ई-वोटर कार्ड तैयार है / e-Voter Card Ready</div>
                <div style={{ fontFamily:F, fontSize:13, color:C.muted, marginTop:4 }}>Identity verified. Your e-EPIC is ready for download.</div>
              </div>
              <VoterCard voter={dlResult.voter} />
              <div style={{ marginTop:16 }}>
                <Btn onClick={() => { window.open(dlResult.downloadUrl, '_blank'); }} color={C.green} icon="📥">
                  ई-वोटर कार्ड PDF डाउनलोड करें / Download e-EPIC PDF
                </Btn>
              </div>
              <div style={{ marginTop:10, fontFamily:F, fontSize:11, color:C.ghost, textAlign:'center' }}>
                ⏱ Download link expires in {Math.ceil(dlResult.expiresIn / 60)} minutes
              </div>
            </Card>
          )}

          {/* ──────────────────────────────────────────────────
              STEP 3 (status): STATUS RESULT
          ────────────────────────────────────────────────── */}
          {step === 3 && svc?.id === 'status' && stResult && (
            <Card glow={STATUS_COLORS[stResult.application?.status] || C.blue}>
              <SDiv icon="📋" hi="आवेदन की स्थिति" en="Application Status Details" color={STATUS_COLORS[stResult.application?.status] || C.blue} />
              {(() => {
                const a = stResult.application;
                return (
                  <>
                    <IRow label="Reference No."     labelEn="संदर्भ क्रमांक"    value={a.referenceNo}  mono accent accentColor={C.blue} />
                    <IRow label="सेवा / Service"    labelEn="Form Type"          value={a.serviceLabel} />
                    <IRow label="आवेदक / Applicant" labelEn="Name"               value={a.applicantName} accent accentColor={C.ink} />
                    <IRow label="दिनांक / Date"     labelEn="Submitted on"       value={new Date(a.submittedAt).toLocaleString('en-IN')} />
                    <IRow label="ETA"               labelEn="अनुमानित समय"       value={a.eta} />
                    <IRow label="स्थिति / Status"   labelEn="Current Status"
                      value={`${a.statusHi} / ${a.statusEn}`}
                      accent accentColor={a.statusColor} last />
                  </>
                );
              })()}

              {/* Status note */}
              <div style={{ marginTop:12, padding:'11px 14px', background:C.surface, border:`1px solid ${C.rule}`, borderRadius:9 }}>
                <div style={{ fontFamily:F, fontSize:'clamp(11px,1.2vw,13px)', color:C.muted }}>{stResult.application?.note}</div>
              </div>

              {/* Timeline */}
              {stResult.application?.timeline?.length > 0 && (
                <>
                  <SDiv icon="🕒" hi="गतिविधि समयरेखा" en="Activity Timeline" color={C.blue} />
                  <div style={{ display:'flex', flexDirection:'column', gap:0 }}>
                    {stResult.application.timeline.map((t, i) => (
                      <div key={i} style={{ display:'flex', gap:12, alignItems:'flex-start', paddingBottom:12 }}>
                        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', flexShrink:0 }}>
                          <div style={{ width:12, height:12, borderRadius:'50%', background:C.blue, border:`2px solid ${C.blueBorder}`, marginTop:3 }} />
                          {i < stResult.application.timeline.length - 1 && <div style={{ width:2, height:20, background:C.rule, marginTop:3 }} />}
                        </div>
                        <div>
                          <div style={{ fontFamily:F, fontSize:'clamp(12px,1.3vw,14px)', fontWeight:700, color:C.ink }}>{t.label}</div>
                          <div style={{ fontFamily:FM, fontSize:'clamp(10px,1.1vw,12px)', color:C.ghost, marginTop:2 }}>{new Date(t.date).toLocaleString('en-IN')}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              <div style={{ marginTop:8 }}>
                <Btn ghost sm onClick={() => { setStep(1); setStResult(null); setStRef(''); }} color={C.amber}>← नई खोज / New Search</Btn>
              </div>
            </Card>
          )}

          {/* ──────────────────────────────────────────────────
              STEP 4: REVIEW & CONFIRM
          ────────────────────────────────────────────────── */}
          {step === 4 && (svc?.id === 'new' || svc?.id === 'correction') && (
            <>
              <MsgBox msg={globalErr} type="error" />

              {/* OTP verified badge */}
              <div style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 14px', background:C.greenBg, border:`1px solid ${C.greenBd}`, borderRadius:10, marginBottom:16 }}>
                <span style={{ fontSize:20 }}>✅</span>
                <div style={{ fontFamily:F, fontSize:'clamp(12px,1.4vw,14px)', fontWeight:700, color:C.green }}>
                  OTP सत्यापित हो गया / OTP Verified Successfully · {formData.mobile}
                </div>
              </div>

              <Card glow={accent}>
                <SDiv icon="📄" hi="आवेदन समीक्षा" en="Review Your Application Before Submitting" color={accent} />
                <IRow label="सेवा प्रकार / Service" labelEn="Form Type" value={`${svc.hi} · ${svc.en} · ${svc.formType}`} />

                {svc.id === 'new' && (
                  <>
                    <IRow label="नाम / Full Name"      labelEn="Applicant"  value={`${formData.firstName||''} ${formData.lastName||''}`.trim()} accent accentColor={C.ink} />
                    <IRow label="जन्म तिथि / DOB"      labelEn="Date"       value={formData.dob} />
                    <IRow label="लिंग / Gender"          labelEn=""           value={formData.gender==='M'?'Male / पुरुष':formData.gender==='F'?'Female / महिला':'Other / अन्य'} />
                    <IRow label="मोबाइल / Mobile"        labelEn="Phone"      value={formData.mobile} mono />
                    <IRow label="ईमेल / Email"            labelEn=""           value={formData.email || '—'} />
                    <IRow label="पूरा पता / Address"    labelEn="Permanent"  value={`${formData.flatNo||''}, ${formData.street||''}, ${formData.landmark?formData.landmark+', ':''} ${formData.city||''}, ${formData.state||''} — ${formData.pincode||''}`} />
                    <IRow label="संबंध / Relation"      labelEn=""           value={`${formData.relationType==='father'?"Father's Name / पिता":formData.relationType==='mother'?"Mother's Name / माता":"Spouse / पति-पत्नी"}: ${formData.relationName||''}`} last />
                  </>
                )}
                {svc.id === 'correction' && (
                  <>
                    <IRow label="EPIC No."             labelEn="Voter ID"    value={formData.epic} mono accent accentColor={C.blue} />
                    <IRow label="सुधार प्रकार"         labelEn="Correction"  value={formData.correctionType} />
                    <IRow label="वर्तमान विवरण"        labelEn="Current"     value={formData.currentValue || '—'} />
                    <IRow label="सही विवरण"            labelEn="Corrected"   value={formData.correctedValue} accent accentColor={C.green} last />
                  </>
                )}
              </Card>

              {/* Declaration */}
              <div style={{ background:C.amberBg, border:`1px solid ${C.amberBd}`, borderRadius:10, padding:'14px 17px', marginBottom:16 }}>
                <div style={{ fontFamily:F, fontSize:'clamp(12px,1.3vw,14px)', fontWeight:700, color:C.amberText, marginBottom:6 }}>📜 घोषणा / Declaration</div>
                <div style={{ fontFamily:F, fontSize:'clamp(11px,1.2vw,13px)', color:C.slate, lineHeight:1.9 }}>
                  मैं घोषित करता/करती हूँ कि ऊपर दी गई सभी जानकारी मेरी जानकारी में सत्य एवं सही है।<br />
                  I hereby declare that all information provided above is true and correct to the best of my knowledge.
                </div>
              </div>

              <div style={{ display:'grid', gridTemplateColumns:'1fr 1.6fr', gap:10 }}>
                <Btn ghost sm onClick={() => setStep(1)} color={C.ghost}>← संपादन / Edit</Btn>
                <Btn sm onClick={svc.id === 'new' ? submitNew : submitCorrection} loading={loading} icon="📤" color={accent}>
                  आवेदन जमा करें / Submit Application →
                </Btn>
              </div>
            </>
          )}

          {/* ──────────────────────────────────────────────────
              STEP 5: RECEIPT / SUCCESS
          ────────────────────────────────────────────────── */}
          {step === 5 && receipt && (
            <div style={{ animation:'vtr-up .45s ease' }}>

              {/* Success icon */}
              <div style={{ textAlign:'center', marginBottom:22 }}>
                <div style={{ width:100, height:100, borderRadius:'50%', background:C.greenBg, border:`4px solid ${C.greenBd}`, display:'inline-flex', alignItems:'center', justifyContent:'center', animation:'vtr-pop .6s cubic-bezier(.34,1.56,.64,1)' }}>
                  <CheckSVG size={52} color={C.green} />
                </div>
                <h2 style={{ fontFamily:F, fontSize:'clamp(20px,2.8vw,30px)', fontWeight:800, color:C.ink, marginTop:16, marginBottom:6 }}>
                  आवेदन सफलतापूर्वक जमा हुआ! 🎉
                </h2>
                <p style={{ fontFamily:F, fontSize:'clamp(12px,1.4vw,14px)', color:C.muted }}>Application submitted successfully to Election Commission of India</p>
              </div>

              {/* Receipt card */}
              <Card glow={C.green}>
                <SDiv icon="🧾" hi="आवेदन रसीद" en="Official Application Receipt" color={C.green} />
                <IRow label="Reference No."        labelEn="संदर्भ क्रमांक"   value={receipt.referenceNo}       mono accent accentColor={C.blue} />
                <IRow label="सेवा / Service"       labelEn="Form Type"         value={receipt.serviceLabel} />
                <IRow label="आवेदक / Applicant"   labelEn="Name"              value={receipt.applicantName}     accent accentColor={C.ink} />
                <IRow label="मोबाइल / Mobile"      labelEn="Phone"             value={receipt.mobile}            mono />
                <IRow label="जमा दिनांक / Date"    labelEn="Submitted at"      value={new Date(receipt.submittedAt).toLocaleString('en-IN')} />
                <IRow label="अनुमानित समय / ETA"   labelEn="Expected delivery" value={receipt.eta} />
                <IRow label="स्थिति / Status"       labelEn="Current"           value="📋 Submitted / जमा हुआ"  accent accentColor={C.green} last />
              </Card>

              {/* Next steps */}
              <Card>
                <SDiv icon="📅" hi="आगे की प्रक्रिया" en="What Happens Next" color={C.blue} />
                {[
                  ['1️⃣', 'Booth Level Officer (BLO) आपके पते पर 7 दिनों में सत्यापन करेंगे', 'BLO will visit your address within 7 days for field verification'],
                  ['2️⃣', 'सत्यापन के बाद आवेदन Election Commission को भेजा जाएगा', 'After verification, your application will be forwarded to ECI'],
                  ['3️⃣', 'Voter ID / EPIC कार्ड 30–45 कार्य दिवसों में डाक से मिलेगा', 'Voter ID card will be delivered by post in 30–45 working days'],
                  ['4️⃣', 'Reference नंबर से status track करें — voters.eci.gov.in पर', 'Track status at voters.eci.gov.in or call 1950'],
                ].map(([ic, hi, en]) => (
                  <div key={ic} style={{ display:'flex', gap:12, marginBottom:11 }}>
                    <span style={{ fontSize:17, flexShrink:0, marginTop:2 }}>{ic}</span>
                    <div>
                      <div style={{ fontFamily:F, fontSize:'clamp(12px,1.3vw,14px)', fontWeight:700, color:C.ink }}>{hi}</div>
                      <div style={{ fontFamily:F, fontSize:'clamp(10px,1.1vw,12px)', color:C.ghost, marginTop:2 }}>{en}</div>
                    </div>
                  </div>
                ))}
              </Card>

              {/* Reference reminder */}
              <div style={{ background:C.blueLight, border:`1px solid ${C.blueBorder}`, borderRadius:10, padding:'13px 16px', marginBottom:18, display:'flex', gap:12, alignItems:'center' }}>
                <span style={{ fontSize:22 }}>📞</span>
                <div style={{ fontFamily:F, fontSize:'clamp(11px,1.2vw,13px)', color:C.slate, lineHeight:1.7 }}>
                  <strong>Reference No. याद रखें:</strong> <span style={{ fontFamily:FM, color:C.blue, fontWeight:800 }}>{receipt.referenceNo}</span><br />
                  Voter Helpline: <strong>1950</strong> &nbsp;·&nbsp; Portal: <strong>voters.eci.gov.in</strong>
                </div>
              </div>

              {/* Action buttons */}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                <Btn onClick={() => window.print()} color={C.green} icon="🖨️">रसीद प्रिंट करें / Print</Btn>
                <Btn ghost onClick={() => setScreen?.('home')} color={C.blue} icon="🏠">होम पर जाएं / Home</Btn>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default VoterID;