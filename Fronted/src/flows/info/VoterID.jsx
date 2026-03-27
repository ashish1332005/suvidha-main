/**
 * src/flows/info/VoterID.jsx
 * * FIXED: Removed all unused imports, components, and variables to ensure 0 warnings/errors.
 */

import { useState } from 'react'; // Removed useEffect, useRef
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
  green:      '#15803D',
  greenBg:    '#F0FDF4',
  greenBd:    '#86EFAC',
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
  white:      '#FFFFFF',
};

const F  = "'DM Sans','Segoe UI',system-ui,sans-serif";
const FM = "'DM Mono','Courier New',monospace";

const VOTER_CSS = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=DM+Mono:wght@500;600&display=swap');
*, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
@keyframes vtr-spin { to{transform:rotate(360deg)} }
.vtr-btn:hover:not(:disabled) { transform:translateY(-2px) !important; filter:brightness(1.07) !important; }
.vtr-form-grid { display:grid; grid-template-columns:1fr 1fr; gap:clamp(12px,1.6vw,18px); }
.vtr-svc-grid  { display:grid; grid-template-columns:repeat(2,1fr); gap:clamp(10px,1.4vw,14px); }
@media(max-width:640px) { .vtr-form-grid { grid-template-columns:1fr !important; } .vtr-svc-grid { grid-template-columns:1fr !important; } }
`;

const SVCS = [
  { id: 'new', icon: '🗳️', hi: 'नया मतदाता पंजीकरण', en: 'New Voter Registration', color: C.blue, steps: ['सेवा','जानकारी','OTP','समीक्षा','रसीद'], stepsEn:['Service','Fill Form','OTP','Review','Receipt'] },
  { id: 'correction', icon: '✏️', hi: 'विवरण सुधार', en: 'Correct Voter Details', color: C.purple, steps: ['सेवा','सुधार','OTP','समीक्षा','रसीद'], stepsEn:['Service','Correction','OTP','Review','Receipt'] },
  { id: 'search', icon: '🔍', hi: 'मतदाता खोज', en: 'Search Voter', color: C.teal, steps: ['सेवा','खोज','परिणाम'], stepsEn:['Service','Search','Results'] },
];

const FORM6 = [
  { key:'firstName', hi:'पहला नाम', en:'First Name', type:'text', req:true, ph:'जैसे: Ramesh' },
  { key:'lastName', hi:'अंतिम नाम', en:'Last Name', type:'text', req:true, ph:'जैसे: Sharma' },
  { key:'mobile', hi:'मोबाइल नंबर', en:'Mobile Number', type:'tel', req:true, ph:'10 digits' },
];

const FORM8 = [
  { key:'epic', hi:'EPIC / Voter ID नंबर', en:'Current EPIC No.', type:'text', req:true, ph:'RJ/01/123/...' },
  { key:'mobile', hi:'मोबाइल नंबर', en:'Mobile (for OTP)', type:'tel', req:true, ph:'10 digits' },
];

const DOCS = {
  new: [
    { hi:'आधार कार्ड / जन्म प्रमाण पत्र', en:'Aadhaar Card', req:true },
    { hi:'पते का प्रमाण', en:'Address Proof', req:true },
  ],
  correction: [
    { hi:'मौजूदा EPIC कार्ड की प्रति', en:'Existing EPIC Copy', req:true },
  ],
};

// ─────────────────────────────────────────────────────────────────
//  UI COMPONENTS (Removed unused ones)
// ─────────────────────────────────────────────────────────────────
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
            {!last && <div style={{ position:'absolute', top:'16px', left:'50%', right:'-50%', height:2, background: done ? color : C.rule, zIndex:0 }} />}
            <div style={{ width:30, height:30, borderRadius:'50%', zIndex:1, background: done || active ? color : C.white, border: `2.5px solid ${done || active ? color : C.rule}`, display:'flex', alignItems:'center', justifyContent:'center' }}>
              {done ? <CheckSVG size={13} /> : <span style={{ fontFamily:FM, fontSize:11, fontWeight:800, color: active ? C.white : C.ghostLight }}>{i + 1}</span>}
            </div>
            <div style={{ marginTop:4, textAlign:'center' }}>
              <div style={{ fontFamily:F, fontSize:10, fontWeight:700, color: active || done ? color : C.ghostLight }}>{s}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Card({ children, style = {}, glow }) {
  return (
    <div style={{ background: C.white, borderRadius:12, border: `1px solid ${glow ? `${glow}33` : C.rule}`, padding:20, boxShadow: '0 1px 5px rgba(10,35,66,.07)', marginBottom:12, ...style }}>
      {children}
    </div>
  );
}

function Btn({ children, onClick, ghost, disabled, danger, loading, color = C.blue }) {
  return (
    <button onClick={onClick} disabled={disabled || loading} className="vtr-btn" style={{ width:'100%', minHeight:56, borderRadius:10, background: ghost ? C.white : disabled ? '#C8D8E8' : danger ? C.red : color, color: ghost ? (danger ? C.red : color) : C.white, border: ghost ? `2px solid ${danger ? C.red : color}` : 'none', fontFamily:F, fontSize: 17, fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:9 }}>
      {loading ? <Spinner /> : children}
    </button>
  );
}

function IRow({ label, value, mono, accent, last }) {
  return (
    <div style={{ display:'flex', justifyContent:'space-between', padding:'10px 0', borderBottom: last ? 'none' : `1px solid ${C.rule}` }}>
      <div><div style={{ fontFamily:F, fontSize:13, color:C.muted, fontWeight:600 }}>{label}</div></div>
      <span style={{ fontFamily: mono ? FM : F, fontWeight: accent ? 800 : 600, color: C.ink }}>{value}</span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
//  MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────
export function VoterID({ setScreen }) {
  const [step, setStep] = useState(0);
  const [svc, setSvc] = useState(null);
  const [formData, setFormData] = useState({});
  const [docsOk, setDocsOk] = useState({});
  const [globalErr, setGlobalErr] = useState('');
  const [loading, setLoading] = useState(false);
  const [receipt, setReceipt] = useState(null);
  const [otp, setOtp] = useState('');

  const fields = svc?.id === 'correction' ? FORM8 : FORM6;
  const docsList = DOCS[svc?.id] || DOCS.new;
  const allDocsOk = docsList.every((_, i) => docsOk[i]);
  const accentColor = svc?.color || C.blue;

  const setF = (key, val) => { setFormData(d => ({ ...d, [key]: val })); setGlobalErr(''); };

  const goBack = () => { if (step === 0) setScreen?.('home'); else if (step === 1) { setStep(0); setSvc(null); } else setStep(s => s - 1); };

  const sendOtp = async () => { setLoading(true); try { await voterApi.sendOtp(formData.mobile); setStep(3); } catch (e) { setGlobalErr(e.message); } finally { setLoading(false); } };

  const verifyOtp = async () => { setLoading(true); try { await voterApi.verifyOtp(formData.mobile, otp); setStep(4); } catch (e) { setGlobalErr(e.message); } finally { setLoading(false); } };

  const submitApp = async () => { setLoading(true); try { const res = await voterApi.submitApplication({ formData }); setReceipt(res); setStep(5); } catch (e) { setGlobalErr(e.message); } finally { setLoading(false); } };

  return (
    <div style={{ flex:1, display:'flex', flexDirection:'column', background:C.surface }}>
      <style>{VOTER_CSS}</style>
      <div style={{ background:`linear-gradient(135deg,${C.navy},${C.blue})`, padding:'15px 40px', color:C.white }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <button onClick={goBack} style={{ background:'rgba(255,255,255,.1)', border:'1px solid rgba(255,255,255,.2)', borderRadius:8, color:C.white, padding:'5px 10px', cursor:'pointer' }}>← Back</button>
          <h1 style={{ fontSize:20, fontWeight:800 }}>{svc ? svc.hi : 'Voter Services'}</h1>
        </div>
        {svc && step > 0 && <div style={{ marginTop:15 }}><StepBar steps={svc.steps} current={step - 1} color={accentColor} /></div>}
      </div>

      <div style={{ flex:1, overflowY:'auto', padding:'20px 40px' }}>
        {globalErr && <div style={{ color:C.red, marginBottom:10, fontWeight:700 }}>{globalErr}</div>}

        {step === 0 && (
          <div className="vtr-svc-grid">
            {SVCS.map(s => (
              <button key={s.id} onClick={() => { setSvc(s); setStep(1); }} style={{ background:C.white, border:`1px solid ${C.rule}`, borderRadius:12, padding:15, textAlign:'left', cursor:'pointer' }}>
                <div style={{ fontSize:24, marginBottom:10 }}>{s.icon}</div>
                <div style={{ fontWeight:800, color:C.ink }}>{s.hi}</div>
              </button>
            ))}
          </div>
        )}

        {step === 1 && (
          <div>
            <div className="vtr-form-grid">
              {fields.map(f => (
                <div key={f.key}>
                  <div style={{ fontSize:12, fontWeight:700, marginBottom:5 }}>{f.hi} / {f.en}</div>
                  <input type={f.type} value={formData[f.key] || ''} onChange={e => setF(f.key, e.target.value)} placeholder={f.ph} style={{ width:'100%', height:50, padding:'0 15px', borderRadius:8, border:`1px solid ${C.rule}` }} />
                </div>
              ))}
            </div>
            <div style={{ margin:'20px 0' }}>
              {docsList.map((d, i) => (
                <div key={i} onClick={() => setDocsOk(dk => ({ ...dk, [i]: !dk[i] }))} style={{ display:'flex', gap:10, padding:10, background:docsOk[i]?C.greenBg:C.white, border:`1px solid ${docsOk[i]?C.greenBd:C.rule}`, borderRadius:8, marginBottom:8, cursor:'pointer' }}>
                  <div style={{ width:20, height:20, border:`2px solid ${C.rule}`, background:docsOk[i]?C.green:C.white, borderRadius:4 }} />
                  <span style={{ fontSize:13, fontWeight:600 }}>{d.hi}</span>
                </div>
              ))}
            </div>
            <Btn onClick={sendOtp} disabled={!allDocsOk} loading={loading}>Send OTP</Btn>
          </div>
        )}

        {step === 3 && (
          <Card style={{ textAlign:'center' }}>
            <h3>OTP दर्ज करें / Enter OTP</h3>
            <input type="text" value={otp} onChange={e => setOtp(e.target.value)} style={{ width:200, height:50, fontSize:24, textAlign:'center', marginTop:15 }} />
            <div style={{ marginTop:20 }}><Btn onClick={verifyOtp} loading={loading}>Verify</Btn></div>
          </Card>
        )}

        {step === 4 && (
          <div>
            <Card glow={accentColor}><h3>Review</h3><IRow label="Name" value={formData.firstName} last /></Card>
            <Btn onClick={submitApp} loading={loading}>Submit Application</Btn>
          </div>
        )}

        {step === 5 && receipt && (
          <Card glow={C.green} style={{ textAlign:'center' }}>
            <h2>Success!</h2>
            <IRow label="Reference No." value={receipt.referenceNo} mono accent last />
            <div style={{ marginTop:20 }}><Btn onClick={() => setScreen('home')}>Home</Btn></div>
          </Card>
        )}
      </div>
    </div>
  );
}

export default VoterID;
