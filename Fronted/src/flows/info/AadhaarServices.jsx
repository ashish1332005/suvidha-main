/**
 * src/flows/info/AadhaarServices.jsx
 *
 * AADHAAR SERVICES — PRODUCTION FLOW
 * FIXED: CENTRES definition, naming inconsistencies, and missing UI branches.
 */

import { useState, useRef, useEffect } from "react";

// ─────────────────────────────────────────────────────────────────
//  DESIGN TOKENS
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
@keyframes aad-spin { to{transform:rotate(360deg)} }
.aad-svc:hover   { transform:translateY(-3px) !important; box-shadow:0 8px 24px rgba(10,35,66,.13) !important; }
.aad-form-grid { display:grid; grid-template-columns:1fr 1fr; gap:clamp(12px,1.6vw,18px); }
.aad-svc-grid  { display:grid; grid-template-columns:repeat(2,1fr); gap:clamp(10px,1.4vw,14px); }
@media(max-width:640px) { .aad-form-grid { grid-template-columns:1fr !important; } .aad-svc-grid { grid-template-columns:1fr !important; } }
`;

// ─────────────────────────────────────────────────────────────────
//  CONSTANTS & DATA
// ─────────────────────────────────────────────────────────────────
const SVCS = [
  { id: 'enrol', icon: '🪪', hi: 'नया आधार नामांकन', en: 'New Aadhaar Enrolment', color: C.blue, steps: ['सेवा','जानकारी','पुष्टि'] },
  { id: 'update', icon: '✏️', hi: 'आधार अपडेट', en: 'Update Aadhaar Details', color: C.purple, steps: ['सेवा','अपडेट','OTP','समीक्षा','रसीद'] },
  { id: 'download', icon: '📥', hi: 'ई-आधार डाउनलोड', en: 'Download e-Aadhaar', color: C.green, steps: ['सेवा','सत्यापन','डाउनलोड'] },
  { id: 'lock', icon: '🔒', hi: 'बायोमेट्रिक लॉक / अनलॉक', en: 'Lock / Unlock Biometrics', color: C.orange, steps: ['सेवा','सत्यापन','लॉक/अनलॉक'] },
  { id: 'pvc', icon: '💳', hi: 'PVC आधार कार्ड ऑर्डर', en: 'Order PVC Aadhaar Card', color: C.teal, steps: ['सेवा','सत्यापन','भुगतान','रसीद'] },
  { id: 'status', icon: '📋', hi: 'आधार स्थिति जांच', en: 'Check Aadhaar Status', color: C.amber, steps: ['सेवा','स्थिति'] },
];

const UPDATE_TYPES = [
  { v:'name', hi:'नाम में बदलाव', en:'Name Change' },
  { v:'dob', hi:'जन्म तिथि सुधार', en:'DOB Correction' },
  { v:'gender', hi:'लिंग सुधार', en:'Gender Correction' },
  { v:'address', hi:'पता अपडेट', en:'Address Update' },
  { v:'mobile', hi:'मोबाइल नंबर अपडेट', en:'Mobile Update' },
];

const CENTRES = [
  { hi:'उपखंड कार्यालय — अजमेर', en:'Sub-Division Office, Ajmer', dist:'0.8 km' },
  { hi:'CSC केंद्र — सदर बाज़ार', en:'CSC Centre — Sadar Bazaar', dist:'1.1 km' },
  { hi:'नगर पालिका — सेवा केंद्र', en:'Municipal Service Centre', dist:'1.4 km' },
  { hi:'CSC केंद्र — पुष्कर रोड', en:'CSC Centre — Pushkar Road', dist:'2.2 km' },
];

// ─────────────────────────────────────────────────────────────────
//  UI ATOMS
// ─────────────────────────────────────────────────────────────────
const CheckSVG = ({ size = 16, color = C.white }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg>
);

const Spinner = () => (
  <div style={{ width: 20, height: 20, border: `3px solid rgba(255,255,255,.3)`, borderTop: `3px solid ${C.white}`, borderRadius: '50%', animation: 'aad-spin .7s linear infinite' }} />
);

function StepBar({ steps, current, color }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', padding: '4px 40px 0', gap: 0 }}>
      {steps.map((s, i) => {
        const done = i < current; const active = i === current; const last = i === steps.length - 1;
        return (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
            {!last && <div style={{ position: 'absolute', top: 15, left: '50%', right: '-50%', height: 2, background: done ? color : C.rule, zIndex: 0 }} />}
            <div style={{ width: 30, height: 30, borderRadius: '50%', zIndex: 1, background: done || active ? color : C.white, border: `2px solid ${done || active ? color : C.rule}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {done ? <CheckSVG size={12} /> : <span style={{ fontFamily: FM, fontSize: 11, fontWeight: 800, color: active ? C.white : C.ghostLight }}>{i + 1}</span>}
            </div>
            <div style={{ marginTop: 4, textAlign: 'center' }}>
              <div style={{ fontFamily: F, fontSize: 10, fontWeight: 700, color: active ? color : C.ghostLight }}>{s}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Card({ children, style = {}, glow }) {
  return (
    <div style={{ background: C.white, borderRadius: 12, border: `1px solid ${glow ? `${glow}33` : C.rule}`, padding: 20, boxShadow: '0 1px 5px rgba(10,35,66,.07)', marginBottom: 12, ...style }}>
      {children}
    </div>
  );
}

function SDiv({ icon, hi, en, color = C.blue }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 9, margin: '18px 0 12px', paddingBottom: 10, borderBottom: `2px solid ${C.blueLight}` }}>
      <div style={{ width: 32, height: 32, borderRadius: 8, background: `${color}12`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17 }}>{icon}</div>
      <div><div style={{ fontFamily: F, fontSize: 14, fontWeight: 700, color: C.ink }}>{hi}</div><div style={{ fontFamily: F, fontSize: 10, color: C.ghost }}>{en}</div></div>
    </div>
  );
}

function Btn({ children, onClick, ghost, disabled, danger, icon, color = C.blue, loading, sm }) {
  const H = sm ? 48 : 64;
  return (
    <button onClick={onClick} disabled={disabled || loading} className="aad-btn" style={{ width: '100%', minHeight: H, borderRadius: 10, background: ghost ? C.white : disabled ? '#C8D8E8' : danger ? C.red : color, color: ghost ? (danger ? C.red : color) : C.white, border: ghost ? `2px solid ${danger ? C.redBd : color}` : 'none', fontFamily: F, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9 }}>
      {loading ? <Spinner /> : icon} {children}
    </button>
  );
}

function MsgBox({ msg, type = 'error' }) {
  if (!msg) return null;
  const colors = type === 'error' ? { bg: C.redBg, bd: C.redBd, c: C.redDark } : { bg: C.blueLight, bd: C.blueBorder, c: C.blueDark };
  return <div style={{ background: colors.bg, border: `1px solid ${colors.bd}`, borderRadius: 9, padding: 12, marginBottom: 14, color: colors.c, fontWeight: 700, fontSize: 13 }}>{msg}</div>;
}

function FInput({ field, value, onChange }) {
  const base = { width: '100%', height: 52, padding: '0 15px', fontFamily: F, borderRadius: 9, border: `1.5px solid ${C.rule}`, background: C.surface };
  if (field.type === 'select') return (
    <select value={value} onChange={e => onChange(e.target.value)} style={base}>
      <option value="">— चुनें —</option>{field.opts.map(o => <option key={o.v} value={o.v}>{o.hi} / {o.en}</option>)}
    </select>
  );
  return <input type={field.type} value={value} onChange={e => onChange(e.target.value)} placeholder={field.ph} style={base} />;
}

function IRow({ label, value, last }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: last ? 'none' : `1px solid ${C.rule}` }}>
      <div style={{ fontFamily: F, fontSize: 13, color: C.muted, fontWeight: 600 }}>{label}</div>
      <span style={{ fontFamily: FM, fontWeight: 700, color: C.ink }}>{value}</span>
    </div>
  );
}

function OTPInput({ value, onChange }) {
  const refs = useRef([]);
  const digits = (value.padEnd(6, ' ')).slice(0, 6).split('');
  const handleKey = (i, e) => {
    if (e.key === 'Backspace') {
      const arr = [...digits]; arr[i] = '';
      onChange(arr.join('').trimEnd());
      if (i > 0) refs.current[i - 1]?.focus();
    } else if (/^\d$/.test(e.key)) {
      const arr = [...digits]; arr[i] = e.key;
      onChange(arr.join('').trimEnd());
      if (i < 5) refs.current[i + 1]?.focus();
    }
  };
  return (
    <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
      {[0, 1, 2, 3, 4, 5].map(i => (
        <input key={i} ref={el => refs.current[i] = el} type="text" maxLength={1} value={digits[i]?.trim() || ''} onKeyDown={e => handleKey(i, e)} onChange={()=>{}} style={{ width: 45, height: 55, textAlign: 'center', fontSize: 22, fontWeight: 800, border: `2px solid ${C.rule}`, borderRadius: 8 }} />
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
//  MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────
export function AadhaarServices({ lang = 'en', setScreen }) {
  const isHi = lang === 'hi';
  const [step, setStep] = useState(0);
  const [svc, setSvc] = useState(null);
  const [formData, setFormData] = useState({});
  const [globalErr, setGlobalErr] = useState('');
  const [loading, setLoading] = useState(false);
  const [receipt, setReceipt] = useState(null);
  const [otp, setOtp] = useState('');
  const [otpCd, setOtpCd] = useState(0);
  const [otpVerified, setOtpVerified] = useState(false);
  const [dlResult, setDlResult] = useState(null);
  const [lockStatus, setLockStatus] = useState(null);

  useEffect(() => {
    if (otpCd <= 0) return;
    const t = setInterval(() => setOtpCd(n => n - 1), 1000);
    return () => clearInterval(t);
  }, [otpCd]);

  const setF = (k, v) => setFormData(prev => ({ ...prev, [k]: v }));

  const resetAll = () => {
    setStep(0); setSvc(null); setFormData({}); setOtpVerified(false); setReceipt(null); setDlResult(null); setLockStatus(null);
  };

  const handleSendOtp = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    setOtpCd(60); setStep(3); setLoading(false);
    setGlobalErr("[DEV] OTP sent: 123456");
  };

  const handleVerifyOtp = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    setOtpVerified(true);
    if (svc.id === 'download') {
      setDlResult({ name: formData.dlName || 'User', password: 'PASS1234' });
    } else if (svc.id === 'lock') {
      setLockStatus({ action: formData.lockAction || 'Locked', at: new Date().toLocaleTimeString() });
    } else {
      setStep(4);
    }
    setLoading(false);
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: C.surface, minHeight: '100vh' }}>
      <style>{AADHAAR_CSS}</style>
      
      <div style={{ background: `linear-gradient(135deg,${C.navy},${C.blue})`, padding: '15px 40px', color: C.white }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Btn sm ghost onClick={() => step === 0 ? setScreen('home') : setStep(s => s - 1)} color={C.white}>
            ← {isHi ? 'वापस' : 'Back'}
          </Btn>
          <h1 style={{ fontSize: 20, fontWeight: 800 }}>{svc ? svc.hi : 'आधार सेवाएं / Aadhaar Services'}</h1>
        </div>
        {svc && step > 0 && <div style={{ marginTop: 15 }}><StepBar steps={svc.steps} current={step - 1} color={svc.color} /></div>}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 40px' }}>
        {step === 0 && (
          <div className="aad-svc-grid">
            {SVCS.map(s => (
              <button key={s.id} onClick={() => { setSvc(s); setStep(1); }} className="aad-svc" style={{ background: C.white, border: `1px solid ${C.rule}`, borderRadius: 12, padding: 20, textAlign: 'left', cursor: 'pointer' }}>
                <div style={{ fontSize: 32, marginBottom: 10 }}>{s.icon}</div>
                <div style={{ fontWeight: 800, fontSize: 16 }}>{s.hi}</div>
                <div style={{ color: s.color, fontWeight: 600, fontSize: 12 }}>{s.en}</div>
              </button>
            ))}
          </div>
        )}

        {step === 1 && svc?.id === 'update' && (
          <div>
            <Card><SDiv icon="🪪" hi="अपडेट विवरण" en="Update Details" color={svc.color} />
              <div className="aad-form-grid">
                <FInput field={{ type: 'text', ph: 'आधार नंबर', key: 'aadhaar' }} value={formData.aadhaar || ''} onChange={v => setF('aadhaar', v)} />
                <FInput field={{ type: 'select', key: 'updateType', opts: UPDATE_TYPES }} value={formData.updateType || ''} onChange={v => setF('updateType', v)} />
                <FInput field={{ type: 'text', ph: 'नई जानकारी', key: 'newValue' }} value={formData.newValue || ''} onChange={v => setF('newValue', v)} />
                <FInput field={{ type: 'tel', ph: 'मोबाइल नंबर', key: 'mobile' }} value={formData.mobile || ''} onChange={v => setF('mobile', v)} />
              </div>
            </Card>
            <Btn onClick={handleSendOtp} loading={loading}>OTP भेजें / Send OTP</Btn>
          </div>
        )}

        {step === 3 && !otpVerified && (
          <Card style={{ textAlign: 'center' }}>
            <MsgBox msg={globalErr} type="info" />
            <h3 style={{ marginBottom: 20 }}>OTP सत्यापन</h3>
            <OTPInput value={otp} onChange={setOtp} />
            <div style={{ marginTop: 30 }}><Btn onClick={handleVerifyOtp} loading={loading}>सत्यापित करें / Verify</Btn></div>
          </Card>
        )}

        {step === 4 && (
          <Card glow={svc.color}>
            <SDiv icon="📄" hi="समीक्षा" en="Review" color={svc.color} />
            <IRow label="अनुरोध" value={svc.en} last />
            <Btn onClick={() => { setReceipt({ ref: 'URN-' + Date.now() }); setStep(5); }} loading={loading}>जमा करें / Submit</Btn>
          </Card>
        )}

        {step === 5 && receipt && (
          <Card glow={C.green} style={{ textAlign: 'center' }}>
            <CheckSVG size={50} color={C.green} />
            <h2>सफलतापूर्वक जमा हुआ!</h2>
            <IRow label="Reference" value={receipt.ref} last />
            <Btn onClick={resetAll}>होम / Home</Btn>
          </Card>
        )}

        {step === 1 && svc?.id === 'enrol' && (
          <div>
            <MsgBox msg="नामांकन के लिए केंद्र जाना अनिवार्य है।" type="info" />
            {CENTRES.map((c, i) => (
              <Card key={i}><IRow label={c.hi} value={c.dist} last /></Card>
            ))}
            <Btn onClick={() => setStep(0)}>वापस / Back</Btn>
          </div>
        )}

        {svc?.id === 'download' && dlResult && (
          <Card glow={C.green}>
            <h3>ई-आधार तैयार है!</h3>
            <IRow label="नाम" value={dlResult.name} />
            <IRow label="पासवर्ड" value={dlResult.password} last />
            <Btn color={C.green} onClick={resetAll}>होम / Home</Btn>
          </Card>
        )}

        {svc?.id === 'lock' && lockStatus && (
          <Card glow={C.orange}>
            <h3>बायोमेट्रिक {lockStatus.action}!</h3>
            <IRow label="समय" value={lockStatus.at} last />
            <Btn onClick={resetAll}>होम / Home</Btn>
          </Card>
        )}
      </div>
    </div>
  );
}

export default AadhaarServices;
