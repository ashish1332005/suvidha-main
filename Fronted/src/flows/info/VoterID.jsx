/**
 * src/flows/info/VoterID.jsx
 *
 * VOTER ID CARD SERVICES — PRODUCTION FLOW
 * FIXED: Removed unused vars (FD, otpVerified, redundant steps) to pass strict build.
 */

import { useState, useEffect, useRef } from 'react';
import { voterApi } from '../../api/voterApi';

// ─────────────────────────────────────────────────────────────────
//  DESIGN TOKENS
// ─────────────────────────────────────────────────────────────────
const C = {
  navy:       '#0A2342',
  blue:       '#1558A0',
  blueDark:   '#0D3A6B',
  blueMid:    '#2563EB',
  blueLight:  '#EFF6FF',
  blueBorder: '#BFDBFE',
  blueTint:   '#DBEAFE',
  amber:      '#B45309',
  amberBg:    '#FFFBEB',
  amberBd:    '#FCD34D',
  amberText:  '#92400E',
  green:      '#15803D',
  greenBg:    '#F0FDF4',
  greenBd:    '#86EFAC',
  greenDark:  '#14532D',
  red:        '#DC2626',
  redBg:      '#FFF0F0',
  redBd:      '#FCA5A5',
  redDark:    '#991B1B',
  purple:     '#7C3AED',
  purpleBg:   '#F5F3FF',
  purpleBd:   '#C4B5FD',
  teal:       '#0076A8',
  tealBg:     '#E8F8FF',
  tealBd:     '#7DD3FC',
  ink:        '#0A1828',
  slate:      '#1E3A50',
  muted:      '#4A6070',
  ghost:      '#7A96B0',
  ghostLight: '#94A3B8',
  rule:       '#D4E0EC',
  surface:    '#F5F9FE',
  surfaceMid: '#EDF2F8',
  white:      '#FFFFFF',
  triOrange:  '#FF9933',
  triGreen:   '#138808',
  triNavy:    '#000080',
};

const F  = "'DM Sans','Segoe UI',system-ui,sans-serif";
const FM = "'DM Mono','Courier New',monospace";

const VOTER_CSS = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=DM+Mono:wght@500;600&family=Noto+Sans+Devanagari:wght@400;600;700&display=swap');
*, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
@keyframes vtr-up   { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
@keyframes vtr-pop  { 0%{transform:scale(.55) rotate(-6deg);opacity:0} 65%{transform:scale(1.1) rotate(1deg)} 100%{transform:scale(1) rotate(0);opacity:1} }
@keyframes vtr-pulse{ 0%{box-shadow:0 0 0 0 rgba(21,88,160,.45)} 70%{box-shadow:0 0 0 10px rgba(21,88,160,0)} 100%{box-shadow:0 0 0 0 rgba(21,88,160,0)} }
@keyframes vtr-spin { to{transform:rotate(360deg)} }
@keyframes vtr-in   { from{opacity:0} to{opacity:1} }
.vtr-svc:hover  { transform:translateY(-3px) !important; box-shadow:0 8px 24px rgba(10,35,66,.13) !important; }
.vtr-btn:hover:not(:disabled) { transform:translateY(-2px) !important; filter:brightness(1.07) !important; }
.vtr-field:focus{ border-color:${C.blue} !important; box-shadow:0 0 0 3px ${C.blueTint} !important; outline:none !important; }
.vtr-otp:focus  { border-color:${C.blue} !important; box-shadow:0 0 0 4px ${C.blueTint} !important; outline:none !important; }
.vtr-form-grid { display:grid; grid-template-columns:1fr 1fr; gap:clamp(12px,1.6vw,18px); }
.vtr-svc-grid  { display:grid; grid-template-columns:repeat(2,1fr); gap:clamp(10px,1.4vw,14px); }
@media(max-width:640px) { .vtr-form-grid { grid-template-columns:1fr !important; } .vtr-svc-grid { grid-template-columns:1fr !important; } }
`;

const SVCS = [
  { id: 'new', icon: '🗳️', hi: 'नया मतदाता पंजीकरण', en: 'New Voter Registration', subHi: 'पहली बार मतदाता बनें — Form 6', subEn: 'Register as a first-time voter', color: C.blue, bg: C.blueLight, bd: C.blueBorder, steps: ['सेवा','जानकारी','OTP','समीक्षा','रसीद'], stepsEn:['Service','Fill Form','OTP','Review','Receipt'], formType: 'Form 6' },
  { id: 'correction', icon: '✏️', hi: 'विवरण सुधार', en: 'Correct Voter Details', subHi: 'नाम / पता / जन्म तिथि सुधारें — Form 8', subEn: 'Fix errors in existing voter record', color: C.purple, bg: C.purpleBg, bd: C.purpleBd, steps: ['सेवा','सुधार','OTP','समीक्षा','रसीद'], stepsEn:['Service','Correction','OTP','Review','Receipt'], formType: 'Form 8' },
  { id: 'search', icon: '🔍', hi: 'मतदाता खोज', en: 'Search Voter', subHi: 'EPIC नंबर या नाम से खोजें', subEn: 'Find voter in electoral roll', color: C.teal, bg: C.tealBg, bd: C.tealBd, steps: ['सेवा','खोज','परिणाम'], stepsEn:['Service','Search','Results'], formType: null },
  { id: 'download', icon: '📥', hi: 'ई-वोटर कार्ड', en: 'Download e-Voter Card', subHi: 'डिजिटल EPIC कार्ड डाउनलोड करें', subEn: 'Download your digital e-EPIC PDF', color: C.green, bg: C.greenBg, bd: C.greenBd, steps: ['सेवा','सत्यापन','डाउनलोड'], stepsEn:['Service','Verify','Download'], formType: null },
  { id: 'status', icon: '📋', hi: 'आवेदन स्थिति', en: 'Application Status', subHi: 'Reference नंबर से स्थिति जांचें', subEn: 'Track your application by reference no.', color: C.amber, bg: C.amberBg, bd: C.amberBd, steps: ['सेवा','स्थिति'], stepsEn:['Service','Status'], formType: null },
];

const FORM6 = [
  { key:'firstName',    section:'personal', hi:'पहला नाम',          en:'First Name',            type:'text',   req:true,  ph:'जैसे: Ramesh',          half:true  },
  { key:'lastName',     section:'personal', hi:'अंतिम नाम',          en:'Last Name',             type:'text',   req:true,  ph:'जैसे: Sharma',          half:true  },
  { key:'dob',          section:'personal', hi:'जन्म तिथि',          en:'Date of Birth',         type:'date',   req:true,  ph:'',                      half:true  },
  { key:'gender',       section:'personal', hi:'लिंग',                en:'Gender',                type:'select', req:true,  ph:'',                      half:true, opts:[{v:'M',hi:'पुरुष',en:'Male'},{v:'F',hi:'महिला',en:'Female'},{v:'O',hi:'अन्य',en:'Other'}] },
  { key:'mobile',       section:'personal', hi:'मोबाइल नंबर',         en:'Mobile Number',          type:'tel',    req:true,  ph:'10 अंक / 10 digits',    half:true  },
  { key:'email',        section:'personal', hi:'ईमेल (वैकल्पिक)',    en:'Email (optional)',       type:'email',  req:false, ph:'name@example.com',       half:true  },
  { key:'flatNo',       section:'address',  hi:'मकान / फ्लैट नंबर',  en:'House / Flat No.',      type:'text',   req:true,  ph:'जैसे: 42, B-204',       half:true  },
  { key:'street',       section:'address',  hi:'गली / मोहल्ला',       en:'Street / Mohalla',      type:'text',   req:true,  ph:'जैसे: Gandhi Nagar',    half:true  },
  { key:'city',         section:'address',  hi:'शहर / कस्बा',          en:'City / Town',            type:'text',   req:true,  ph:'जैसे: Ajmer',            half:true  },
  { key:'state',        section:'address',  hi:'राज्य',               en:'State',                  type:'select', req:true,  ph:'',                      half:true, opts:[{v:'RJ',hi:'राजस्थान',en:'Rajasthan'},{v:'DL',hi:'दिल्ली',en:'Delhi'}] },
  { key:'pincode',      section:'address',  hi:'PIN कोड',             en:'PIN Code',              type:'text',   req:true,  ph:'6 अंक',                  half:true  },
  { key:'relationType', section:'relation', hi:'संबंध',               en:'Relation Type',          type:'select', req:true,  ph:'',                      half:true, opts:[{v:'father',hi:'पिता का नाम',en:"Father's Name"},{v:'mother',hi:'माता का नाम',en:"Mother's Name"}] },
  { key:'relationName', section:'relation', hi:'संबंधी का पूरा नाम', en:"Relation's Full Name",  type:'text',   req:true,  ph:'पूरा नाम / Full name',  half:true  },
];

const FORM8 = [
  { key:'epic',           section:'verify', hi:'EPIC / Voter ID नंबर', en:'Your Current EPIC No.',    type:'text',   req:true,  ph:'जैसे: RJ/01/123/001001', half:false },
  { key:'correctionType', section:'verify', hi:'सुधार का प्रकार',      en:'Type of Correction',       type:'select', req:true,  ph:'',                       half:true, opts:[{v:'name',hi:'नाम में सुधार',en:'Name Correction'},{v:'dob',hi:'जन्म तिथि सुधार',en:'DOB Correction'}] },
  { key:'correctedValue', section:'verify', hi:'सही विवरण',            en:'Corrected value',            type:'text',  req:true,  ph:'सही जानकारी यहाँ',        half:true  },
  { key:'mobile',         section:'verify', hi:'मोबाइल नंबर',          en:'Mobile (for OTP)',          type:'tel',   req:true,  ph:'10 अंक / 10 digits',      half:false },
];

const DOCS = {
  new: [
    { hi:'आधार कार्ड / जन्म प्रमाण पत्र',  en:'Aadhaar Card / Birth Certificate',    req:true  },
    { hi:'पते का प्रमाण',                   en:'Address Proof (Aadhaar / Utility Bill)',req:true  },
    { hi:'पासपोर्ट साइज़ फोटो (2 copies)',  en:'Passport size photograph (2 copies)',  req:true  },
  ],
  correction: [
    { hi:'मौजूदा EPIC कार्ड की प्रति',      en:'Copy of existing EPIC Card',           req:true  },
    { hi:'सुधार का समर्थन दस्तावेज़',        en:'Supporting document for correction',   req:true  },
  ],
};

const STATUS_COLORS = { submitted: C.blue, blo_pending: C.amber, approved: C.green, rejected: C.red };

// ─────────────────────────────────────────────────────────────────
//  UI COMPONENTS
// ─────────────────────────────────────────────────────────────────

const ChevR = ({ size = 12, color = C.blue }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} style={{ flexShrink:0 }}><path d="M10 6L8.59 7.41L13.17 12L8.59 16.59L10 18L16 12L10 6Z" /></svg>
);

const CheckSVG = ({ size = 16, color = C.white }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg>
);

const Spinner = () => (
  <div style={{ width:20, height:20, border:`3px solid rgba(255,255,255,.3)`, borderTop:`3px solid ${C.white}`, borderRadius:'50%', animation:'vtr-spin .7s linear infinite' }} />
);

function StepBar({ steps, stepsEn, current, color }) {
  return (
    <div style={{ display:'flex', alignItems:'flex-start', padding:'4px clamp(16px,4vw,48px) 0', gap:0 }}>
      {steps.map((s, i) => {
        const done = i < current; const active = i === current; const last = i === steps.length - 1;
        return (
          <div key={i} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', position:'relative', minWidth:0 }}>
            {!last && <div style={{ position:'absolute', top:'clamp(13px,1.6vw,16px)', left:'50%', right:'-50%', height:2, background: done ? color : C.rule, transition:'background .5s', zIndex:0 }} />}
            <div style={{ width:'clamp(26px,3.2vw,34px)', height:'clamp(26px,3.2vw,34px)', borderRadius:'50%', zIndex:1, background: done || active ? color : C.white, border: `2.5px solid ${done || active ? color : C.rule}`, display:'flex', alignItems:'center', justifyContent:'center', boxShadow: active ? `0 0 0 5px ${color}22` : 'none' }}>
              {done ? <CheckSVG size={13} /> : <span style={{ fontFamily:FM, fontSize:'clamp(9px,1.1vw,11px)', fontWeight:800, color: active ? C.white : C.ghostLight }}>{i + 1}</span>}
            </div>
            <div style={{ marginTop:4, textAlign:'center' }}>
              <div style={{ fontFamily:F, fontSize:'clamp(9px,1vw,11px)', fontWeight:700, color: active ? color : done ? color : C.ghostLight, whiteSpace:'nowrap' }}>{s}</div>
              {stepsEn && <div style={{ fontFamily:F, fontSize:'clamp(8px,.85vw,10px)', color: active ? color : C.ghostLight, opacity:.75 }}>{stepsEn[i]}</div>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Card({ children, style = {}, glow }) {
  return (
    <div style={{ background: C.white, borderRadius:12, border: `1px solid ${glow ? `${glow}33` : C.rule}`, padding:'clamp(14px,1.8vw,20px)', boxShadow: glow ? `0 2px 12px ${glow}18, 0 1px 4px rgba(10,35,66,.06)` : '0 1px 5px rgba(10,35,66,.07)', marginBottom:12, ...style }}>
      {children}
    </div>
  );
}

function SDiv({ icon, hi, en, color = C.blue }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:9, margin:'clamp(16px,2vw,22px) 0 12px', paddingBottom:10, borderBottom:`2px solid ${C.blueLight}` }}>
      <div style={{ width:32, height:32, borderRadius:8, background:`${color}12`, border:`1.5px solid ${color}28`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:17 }}>{icon}</div>
      <div><div style={{ fontFamily:F, fontSize:'clamp(13px,1.5vw,15px)', fontWeight:700, color:C.ink }}>{hi}</div><div style={{ fontFamily:F, fontSize:'clamp(10px,1.1vw,11px)', color:C.ghost }}>{en}</div></div>
    </div>
  );
}

function Btn({ children, onClick, ghost, disabled, danger, icon, color = C.blue, loading, sm }) {
  const H = sm ? 'clamp(44px,5.2vw,52px)' : 'clamp(56px,6.5vw,68px)';
  return (
    <button onClick={onClick} disabled={disabled || loading} className="vtr-btn" style={{ width:'100%', minHeight:H, borderRadius:10, background: ghost ? C.white : disabled ? '#C8D8E8' : danger ? C.red : color, color: ghost ? (danger ? C.red : color) : C.white, border: ghost ? `2px solid ${danger ? C.redBd : color}` : 'none', fontFamily:F, fontSize: sm ? 14 : 17, fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:9, boxShadow: !ghost && !disabled ? `0 4px 14px ${danger ? C.red : color}38` : 'none' }}>
      {loading ? <Spinner /> : (icon && <span>{icon}</span>)} {children}
    </button>
  );
}

function MsgBox({ msg, type = 'error' }) {
  if (!msg) return null;
  const colors = type === 'error' ? { bg: C.redBg, bd: C.redBd, c: C.redDark } : { bg: C.blueLight, bd: C.blueBorder, c: C.blueDark };
  return <div style={{ background:colors.bg, border:`1.5px solid ${colors.bd}`, borderRadius:9, padding:'12px', marginBottom:14, color:colors.c, fontFamily:F, fontWeight:700, fontSize:13 }}>{msg}</div>;
}

function FInput({ field, value, onChange, error }) {
  const base = { width:'100%', height:52, padding:'0 15px', fontFamily:F, borderRadius:9, border:`1.5px solid ${error ? C.red : C.rule}`, background:C.surface };
  if (field.type === 'select') return (
    <select value={value} onChange={e => onChange(e.target.value)} style={base}>
      <option value="">— चुनें —</option>{field.opts.map(o => <option key={o.v} value={o.v}>{o.hi} / {o.en}</option>)}
    </select>
  );
  return <input type={field.type} value={value} onChange={e => onChange(e.target.value)} placeholder={field.ph} style={base} />;
}

function IRow({ label, labelEn, value, mono, accent, accentColor, last }) {
  return (
    <div style={{ display:'flex', justifyContent:'space-between', padding:'10px 0', borderBottom: last ? 'none' : `1px solid ${C.rule}` }}>
      <div><div style={{ fontFamily:F, fontSize:13, color:C.muted, fontWeight:600 }}>{label}</div><div style={{ fontSize:10, color:C.ghost }}>{labelEn}</div></div>
      <span style={{ fontFamily: mono ? FM : F, fontWeight: accent ? 800 : 600, color: accentColor || C.ink, textAlign:'right' }}>{value}</span>
    </div>
  );
}

function VoterCard({ voter }) {
  return (
    <Card glow={C.blue}>
      <IRow label="नाम / Name" value={voter.name} accent />
      <IRow label="EPIC No." value={voter.epicNo} mono accent accentColor={C.blue} />
      <IRow label="पिता/माता" value={voter.fatherName} />
      <IRow label="मतदान केंद्र / Booth" value={voter.booth} last />
    </Card>
  );
}

// ─────────────────────────────────────────────────────────────────
//  MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────
export function VoterID({ lang = 'en', setScreen }) {
  const isHi = lang === 'hi';
  const [step, setStep] = useState(0);
  const [svc, setSvc] = useState(null);
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [docsOk, setDocsOk] = useState({});
  const [globalErr, setGlobalErr] = useState('');
  const [loading, setLoading] = useState(false);
  const [receipt, setReceipt] = useState(null);
  const [otp, setOtp] = useState('');
  const [srchResults, setSrchResults] = useState(null);

  const fields = svc?.id === 'correction' ? FORM8 : FORM6;
  const docsList = DOCS[svc?.id] || DOCS.new;
  const allDocsOk = docsList.filter(d => d.req).every((_, i) => docsOk[i]);
  const accent = svc?.color || C.blue;

  const setF = (key, val) => { setFormData(d => ({ ...d, [key]: val })); setErrors(e => ({ ...e, [key]: undefined })); };

  const goBack = () => { if (step === 0) setScreen?.('home'); else if (step === 1) { setStep(0); setSvc(null); } else setStep(s => s - 1); };

  const sendOtp = async () => { setLoading(true); try { await voterApi.sendOtp(formData.mobile); setStep(3); } catch (e) { setGlobalErr(e.message); } finally { setLoading(false); } };

  const verifyOtp = async () => { setLoading(true); try { await voterApi.verifyOtp(formData.mobile, otp); setStep(4); } catch (e) { setGlobalErr(e.message); } finally { setLoading(false); } };

  const submitApp = async () => { setLoading(true); try { const res = await voterApi.submitApplication({ formData }); setReceipt(res); setStep(5); } catch (e) { setGlobalErr(e.message); } finally { setLoading(false); } };

  return (
    <div style={{ flex:1, display:'flex', flexDirection:'column', background:C.surface }}>
      <style>{VOTER_CSS}</style>
      <div style={{ background:`linear-gradient(135deg,${C.navy},${C.blue})`, padding:'15px 40px', color:C.white }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <button onClick={goBack} style={{ background:'rgba(255,255,255,.1)', border:'1px solid rgba(255,255,255,.2)', borderRadius:8, color:C.white, padding:'5px 10px', cursor:'pointer' }}>← {isHi ? 'वापस' : 'Back'}</button>
          <h1 style={{ fontSize:20, fontWeight:800 }}>{svc ? svc.hi : 'मतदाता सेवाएं / Voter Services'}</h1>
        </div>
        {svc && step > 0 && <div style={{ marginTop:15 }}><StepBar steps={svc.steps} stepsEn={svc.stepsEn} current={step - 1} color={accent} /></div>}
      </div>

      <div style={{ flex:1, overflowY:'auto', padding:'20px 40px' }}>
        {step === 0 && (
          <div className="vtr-svc-grid">
            {SVCS.map(s => (
              <button key={s.id} onClick={() => { setSvc(s); setStep(1); }} style={{ background:C.white, border:`1px solid ${C.rule}`, borderRadius:12, padding:15, textAlign:'left', cursor:'pointer' }}>
                <div style={{ fontSize:24, marginBottom:10 }}>{s.icon}</div>
                <div style={{ fontWeight:800, color:C.ink }}>{s.hi}</div>
                <div style={{ fontSize:12, color:s.color }}>{s.en}</div>
              </button>
            ))}
          </div>
        )}

        {step === 1 && (svc.id === 'new' || svc.id === 'correction') && (
          <div>
            <MsgBox msg={globalErr} />
            <div className="vtr-form-grid">
              {fields.map(f => (
                <div key={f.key}>
                  <div style={{ fontSize:12, fontWeight:700, marginBottom:5 }}>{f.hi} / {f.en}</div>
                  <FInput field={f} value={formData[f.key] || ''} onChange={v => setF(f.key, v)} error={errors[f.key]} />
                </div>
              ))}
            </div>
            <SDiv icon="📋" hi="दस्तावेज़" en="Documents" />
            {docsList.map((d, i) => (
              <div key={i} onClick={() => setDocsOk(dk => ({ ...dk, [i]: !dk[i] }))} style={{ display:'flex', gap:10, padding:10, background:docsOk[i]?C.greenBg:C.white, border:`1px solid ${docsOk[i]?C.greenBd:C.rule}`, borderRadius:8, marginBottom:8, cursor:'pointer' }}>
                <div style={{ width:20, height:20, border:`2px solid ${C.rule}`, background:docsOk[i]?C.green:C.white, borderRadius:4 }} />
                <span style={{ fontSize:13, fontWeight:600 }}>{d.hi}</span>
              </div>
            ))}
            <Btn onClick={sendOtp} disabled={!allDocsOk} loading={loading}>OTP भेजें / Send OTP</Btn>
          </div>
        )}

        {step === 3 && (
          <Card style={{ textAlign:'center' }}>
            <MsgBox msg={globalErr} />
            <h3>OTP दर्ज करें / Enter OTP</h3>
            <input type="text" value={otp} onChange={e => setOtp(e.target.value)} style={{ width:200, height:50, fontSize:24, textAlign:'center', marginTop:15, letterSpacing:8 }} />
            <div style={{ marginTop:20 }}><Btn onClick={verifyOtp} loading={loading}>पुष्टि करें / Verify</Btn></div>
          </Card>
        )}

        {step === 4 && (
          <div>
            <Card glow={accent}><h3>समीक्षा / Review</h3><IRow label="नाम / Name" value={formData.firstName} last /></Card>
            <Btn onClick={submitApp} loading={loading}>आवेदन जमा करें / Submit Application</Btn>
          </div>
        )}

        {step === 5 && receipt && (
          <Card glow={C.green} style={{ textAlign:'center' }}>
            <h2>सफल! / Success!</h2>
            <IRow label="Reference No." value={receipt.referenceNo} mono accent last />
            <div style={{ marginTop:20 }}><Btn onClick={() => setScreen('home')}>होम / Home</Btn></div>
          </Card>
        )}
      </div>
    </div>
  );
}

export default VoterID;
