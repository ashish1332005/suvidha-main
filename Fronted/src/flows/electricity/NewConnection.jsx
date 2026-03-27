/**
 * flows/electricity/NewConnection.jsx
 * Full Aadhaar validation, duplicate detection, real API
 */
import { useState } from "react";
import api from "../../api/kioskApi";

const DEPT_THEME = {
  electricity: { C:"#0EA5E9", L:"#E0F2FE", docs:["Aadhaar Card (Original + Photocopy)","Proof of Address (Ration Card / Rent Agreement)","Passport Size Photo (2 copies)","Property / Site Plan","NOC (if rented property)"], fee:"₹200 – ₹500", time:"7–15 Working Days" },
  gas:         { C:"#F97316", L:"#FFF7ED", docs:["Aadhaar Card","Proof of Address","Passport Size Photo","NOC from Landlord (if rented)"], fee:"₹500 – ₹1000", time:"10–20 Working Days" },
  municipal:   { C:"#8B5CF6", L:"#F5F3FF", docs:["Aadhaar Card","Property Documents","Site Plan"], fee:"₹100 – ₹300", time:"5–10 Working Days" },
};

const STEPS = ["Documents", "Application Form", "Review", "Done"];
const CATEGORIES = ["Domestic","Commercial","Industrial"];

function Btn({ children, onClick, disabled, ghost, color="#0EA5E9" }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      width:"100%", minHeight:"clamp(52px,6vw,62px)",
      border: ghost ? `2px solid ${color}` : "none", borderRadius:14,
      background: ghost ? "white" : disabled ? "#E2E8F0" : color,
      color: ghost ? color : disabled ? "#94A3B8" : "white",
      fontFamily:"var(--font-body)", fontSize:"clamp(15px,1.8vw,18px)",
      fontWeight:700, cursor: disabled ? "not-allowed" : "pointer",
      display:"flex", alignItems:"center", justifyContent:"center", gap:8,
      opacity: disabled ? 0.6 : 1,
    }}>{children}</button>
  );
}

function Fld({ label, value, onChange, placeholder, type="text", error }) {
  return (
    <div style={{ marginBottom:14 }}>
      <label style={{ display:"block", fontFamily:"var(--font-body)", fontSize:12,
        fontWeight:700, color: error ? "#B91C1C" : "#64748B", marginBottom:7,
        letterSpacing:".06em", textTransform:"uppercase" }}>{label}</label>
      <input value={value} type={type} onChange={e=>onChange(e.target.value)}
        placeholder={placeholder} style={{
          width:"100%", height:"clamp(50px,5.5vw,56px)", padding:"0 16px",
          fontFamily:"var(--font-body)", fontSize:"clamp(14px,1.6vw,16px)",
          color:"#0A2342", background:"#F8FAFC",
          border:`2px solid ${error ? "#FECACA" : "#E2E8F0"}`,
          borderRadius:12, outline:"none", boxSizing:"border-box",
        }} />
      {error && <p style={{ color:"#B91C1C", fontSize:12, marginTop:4 }}>{error}</p>}
    </div>
  );
}

function StepBar({ cur, C }) {
  return (
    <div style={{ display:"flex", gap:6, padding:"12px clamp(16px,2.5vw,40px)",
      background:"white", borderBottom:"1px solid #E2E8F0" }}>
      {STEPS.map((s,i) => (
        <div key={s} style={{ flex:1 }}>
          <div style={{ height:5, borderRadius:3,
            background: i < cur ? C : "#E2E8F0", transition:"background .4s" }} />
          <span style={{ display:"block", textAlign:"center", marginTop:4,
            fontSize:10, fontWeight:600, color: i < cur ? C : "#94A3B8",
            textTransform:"uppercase", letterSpacing:".05em" }}>{s}</span>
        </div>
      ))}
    </div>
  );
}

function Row({ label, val, hi, hc="#0A2342" }) {
  return (
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center",
      padding:"10px 0", borderBottom:"1px solid #F1F5F9", gap:12 }}>
      <span style={{ fontSize:14, color:"#64748B", fontWeight:500 }}>{label}</span>
      <span style={{ fontSize: hi ? 15 : 14, fontWeight: hi ? 700 : 500,
        color: hi ? hc : "#0A2342", textAlign:"right" }}>{val}</span>
    </div>
  );
}

// Aadhaar format: XXXX XXXX XXXX
function formatAadhaar(val) {
  const digits = val.replace(/\D/g,"").slice(0,12);
  return digits.replace(/(\d{4})(?=\d)/g,"$1 ").trim();
}

function validateForm(form) {
  const errs = {};
  if (!form.name.trim() || form.name.trim().length < 2)
    errs.name = "Enter full name (min 2 characters)";
  if (!/^[6-9]\d{9}$/.test(form.mobile.replace(/\s/g,"")))
    errs.mobile = "Enter valid 10-digit mobile number";
  const aadhaarDigits = form.aadhaar.replace(/\s/g,"");
  if (!/^\d{12}$/.test(aadhaarDigits))
    errs.aadhaar = "Aadhaar must be exactly 12 digits";
  if (!form.address.trim() || form.address.trim().length < 10)
    errs.address = "Enter complete address (min 10 characters)";
  const load = parseFloat(form.load);
  if (!form.load || isNaN(load) || load < 0.5 || load > 1000)
    errs.load = "Enter load between 0.5 and 1000 kW";
  return errs;
}

export function NewConnection({ dept="electricity", t, setScreen }) {
  const theme = DEPT_THEME[dept] || DEPT_THEME.electricity;
  const { C, L } = theme;

  const [step,     setStep]     = useState(1);
  const [form,     setForm]     = useState({ name:"", mobile:"", aadhaar:"", address:"", load:"", category:"Domestic" });
  const [errs,     setErrs]     = useState({});
  const [apiError, setApiError] = useState("");
  const [loading,  setLoading]  = useState(false);
  const [result,   setResult]   = useState(null);

  const f = (k) => (v) => { setForm(p=>({...p,[k]:v})); setErrs(e=>({...e,[k]:""})); setApiError(""); };

  const goToReview = () => {
    const e = validateForm(form);
    if (Object.keys(e).length) { setErrs(e); return; }
    setStep(3);
  };

  const handleSubmit = async () => {
    setLoading(true); setApiError("");
    try {
      const r = await api.applyConnection({
        name:           form.name.trim(),
        mobile:         form.mobile.replace(/\s/g,""),
        aadhaar:        form.aadhaar.replace(/\s/g,""),
        address:        form.address.trim(),
        dept,
        sanctionedLoad: parseFloat(form.load),
        category:       form.category,
      });
      setResult(r);
      setStep(4);
    } catch (e) {
      setApiError(e.message);
    } finally { setLoading(false); }
  };

  const deptLabel = dept.charAt(0).toUpperCase() + dept.slice(1);

  return (
    <div style={{ flex:1, display:"flex", flexDirection:"column", background:"#F0F4F8" }}>
      <div style={{ background:"white", borderBottom:"3px solid #E2E8F0",
        padding:"clamp(14px,1.8vw,20px) clamp(16px,2.5vw,40px)" }}>
        <button onClick={() => step > 1 ? setStep(s=>s-1) : setScreen("dept")}
          style={{ background:"none", border:"none", cursor:"pointer",
            display:"flex", alignItems:"center", gap:6, color:"#64748B",
            fontFamily:"var(--font-body)", fontSize:14, fontWeight:600, marginBottom:12 }}>
          ← Back
        </button>
        <h2 style={{ fontFamily:"var(--font-head)", fontSize:"clamp(16px,2vw,24px)",
          fontWeight:700, color:"#0A2342", margin:0 }}>
          New {deptLabel} Connection
        </h2>
      </div>
      <StepBar cur={step} C={C} />

      <div style={{ flex:1, overflowY:"auto" }}>
        <div style={{ maxWidth:720, margin:"0 auto",
          padding:"clamp(20px,2.5vw,32px) clamp(16px,2.5vw,40px) 48px" }}>

          {/* Step 1 – Documents */}
          {step === 1 && (
            <>
              <div style={{ background:"white", border:"1.5px solid #E2E8F0", borderRadius:16,
                padding:"clamp(16px,2vw,24px)", marginBottom:16 }}>
                <p style={{ fontFamily:"var(--font-body)", fontSize:11, fontWeight:700,
                  letterSpacing:".08em", textTransform:"uppercase", color:"#94A3B8", marginBottom:14 }}>
                  Documents Required
                </p>
                {theme.docs.map((d,i) => (
                  <div key={i} style={{ display:"flex", gap:12, alignItems:"flex-start",
                    marginBottom: i < theme.docs.length-1 ? 14 : 0 }}>
                    <div style={{ width:24, height:24, borderRadius:"50%",
                      background:`${C}18`, border:`1.5px solid ${C}40`,
                      display:"flex", alignItems:"center", justifyContent:"center",
                      flexShrink:0, marginTop:1 }}>
                      <span style={{ fontFamily:"var(--font-head)", fontSize:11,
                        fontWeight:800, color:C }}>{i+1}</span>
                    </div>
                    <span style={{ fontFamily:"var(--font-body)",
                      fontSize:"clamp(13px,1.5vw,15px)", color:"#374151", lineHeight:1.5 }}>{d}</span>
                  </div>
                ))}
              </div>

              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:16 }}>
                {[["Application Fee", theme.fee], ["Processing Time", theme.time]].map(([l,v]) => (
                  <div key={l} style={{ background:"white", border:"1.5px solid #E2E8F0",
                    borderRadius:14, padding:14, textAlign:"center" }}>
                    <p style={{ fontFamily:"var(--font-body)", fontSize:11, fontWeight:700,
                      letterSpacing:".06em", textTransform:"uppercase", color:"#94A3B8", marginBottom:6 }}>{l}</p>
                    <p style={{ fontFamily:"var(--font-head)", fontSize:"clamp(15px,1.8vw,20px)",
                      fontWeight:800, color:C, margin:0 }}>{v}</p>
                  </div>
                ))}
              </div>

              <Btn color={C} onClick={() => setStep(2)}>
                I Have All Documents — Proceed →
              </Btn>
            </>
          )}

          {/* Step 2 – Application Form */}
          {step === 2 && (
            <>
              {apiError && (
                <div style={{ background:"#FEF2F2", border:"1.5px solid #FECACA", borderRadius:12,
                  padding:"12px 16px", color:"#B91C1C", fontSize:14,
                  fontFamily:"var(--font-body)", marginBottom:16 }}>
                  ⚠ {apiError}
                </div>
              )}

              <Fld label="Applicant Full Name" value={form.name}   onChange={f("name")}
                placeholder="As on Aadhaar Card" error={errs.name} />
              <Fld label="Mobile Number"       value={form.mobile} onChange={f("mobile")}
                placeholder="10-digit mobile" type="tel" error={errs.mobile} />

              {/* Aadhaar with auto-format */}
              <div style={{ marginBottom:14 }}>
                <label style={{ display:"block", fontFamily:"var(--font-body)", fontSize:12,
                  fontWeight:700, color: errs.aadhaar ? "#B91C1C" : "#64748B", marginBottom:7,
                  letterSpacing:".06em", textTransform:"uppercase" }}>
                  Aadhaar Number
                </label>
                <input
                  value={form.aadhaar}
                  onChange={e => { const v=formatAadhaar(e.target.value); f("aadhaar")(v); }}
                  placeholder="XXXX XXXX XXXX"
                  maxLength={14}
                  inputMode="numeric"
                  style={{ width:"100%", height:"clamp(50px,5.5vw,56px)", padding:"0 16px",
                    fontFamily:"var(--font-head)", fontSize:"clamp(16px,1.8vw,20px)",
                    letterSpacing:"0.15em", color:"#0A2342", background:"#F8FAFC",
                    border:`2px solid ${errs.aadhaar ? "#FECACA" : "#E2E8F0"}`,
                    borderRadius:12, outline:"none", boxSizing:"border-box" }}
                />
                {errs.aadhaar
                  ? <p style={{ color:"#B91C1C", fontSize:12, marginTop:4 }}>{errs.aadhaar}</p>
                  : <p style={{ color:"#94A3B8", fontSize:12, marginTop:4 }}>
                      🔒 Your Aadhaar is encrypted and never stored in plain text
                    </p>}
              </div>

              <Fld label="Connection Address" value={form.address} onChange={f("address")}
                placeholder="Complete address where connection is needed" error={errs.address} />

              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:14 }}>
                <Fld label="Load Required (kW)" value={form.load} onChange={f("load")}
                  placeholder="e.g. 2 or 5" type="number" error={errs.load} />
                <div>
                  <label style={{ display:"block", fontFamily:"var(--font-body)", fontSize:12,
                    fontWeight:700, color:"#64748B", marginBottom:7,
                    letterSpacing:".06em", textTransform:"uppercase" }}>
                    Category
                  </label>
                  <select value={form.category} onChange={e => f("category")(e.target.value)}
                    style={{ width:"100%", height:"clamp(50px,5.5vw,56px)", padding:"0 16px",
                      fontFamily:"var(--font-body)", fontSize:"clamp(14px,1.6vw,16px)",
                      color:"#0A2342", background:"#F8FAFC",
                      border:"2px solid #E2E8F0", borderRadius:12, outline:"none" }}>
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <Btn color={C} onClick={goToReview}>Review Application →</Btn>
            </>
          )}

          {/* Step 3 – Review */}
          {step === 3 && (
            <>
              {apiError && (
                <div style={{ background:"#FEF2F2", border:"1.5px solid #FECACA", borderRadius:12,
                  padding:"12px 16px", color:"#B91C1C", fontSize:14,
                  fontFamily:"var(--font-body)", marginBottom:16 }}>
                  ⚠ {apiError}
                </div>
              )}

              <div style={{ background:"white", border:"1.5px solid #E2E8F0", borderRadius:16,
                padding:"clamp(16px,2vw,24px)", marginBottom:14 }}>
                <p style={{ fontFamily:"var(--font-body)", fontSize:11, fontWeight:700,
                  letterSpacing:".08em", textTransform:"uppercase", color:"#94A3B8", marginBottom:12 }}>
                  Review Application
                </p>
                <Row label="Name"     val={form.name} />
                <Row label="Mobile"   val={form.mobile} />
                <Row label="Aadhaar"  val={`XXXX XXXX ${form.aadhaar.replace(/\s/g,"").slice(-4)}`} />
                <Row label="Address"  val={form.address} />
                <Row label="Load"     val={`${form.load} kW`} />
                <Row label="Category" val={form.category} />
                <Row label="Est. Fee" val={theme.fee} hi hc={C} />
              </div>

              <div style={{ background:"#FFFBEB", border:"1.5px solid #FDE68A", borderRadius:12,
                padding:"12px 16px", color:"#92400E", fontSize:13,
                fontFamily:"var(--font-body)", lineHeight:1.6, marginBottom:16 }}>
                ⚠️ Bring <strong>original documents</strong> when visiting the office. Application
                number will be sent via SMS.
              </div>

              <Btn color={C} onClick={handleSubmit} disabled={loading}>
                {loading ? "Submitting…" : "Submit Application"}
              </Btn>
              <div style={{ height:10 }} />
              <Btn ghost color={C} onClick={() => setStep(2)}>← Edit Details</Btn>
            </>
          )}

          {/* Step 4 – Success */}
          {step === 4 && result && (
            <div style={{ textAlign:"center" }}>
              <div style={{ width:80, height:80, borderRadius:"50%",
                background:"#DCFCE7", border:"3px solid #86EFAC",
                display:"flex", alignItems:"center", justifyContent:"center",
                margin:"0 auto 20px" }}>
                <svg width={40} height={40} viewBox="0 0 24 24" fill="#16A34A">
                  <path d="M9 16.17L4.83 12L3.41 13.41L9 19L21 7L19.59 5.59L9 16.17Z"/>
                </svg>
              </div>
              <h3 style={{ fontFamily:"var(--font-head)", fontSize:"clamp(20px,2.5vw,28px)",
                fontWeight:800, color:"#0A2342", marginBottom:6 }}>Application Submitted!</h3>
              <p style={{ fontFamily:"var(--font-body)", fontSize:14, color:"#64748B", marginBottom:24 }}>
                Your new connection request has been received. Processing time: <strong>{theme.time}</strong>
              </p>

              <div style={{ background:"white", border:"1.5px solid #E2E8F0", borderRadius:16,
                padding:"clamp(16px,2vw,24px)", marginBottom:16, textAlign:"left" }}>
                {[
                  ["Application No.", result.applicationNo, C],
                  ["Applicant",       form.name,            null],
                  ["Department",      deptLabel,            null],
                  ["Mobile",          form.mobile,          null],
                  ["Processing",      theme.time,           null],
                  ["Status",          "Under Review",       "#D97706"],
                ].map(([l,v,hc]) => (
                  <div key={l} style={{ display:"flex", justifyContent:"space-between",
                    padding:"10px 0", borderBottom:"1px solid #F1F5F9", gap:12 }}>
                    <span style={{ fontSize:14, color:"#64748B", fontWeight:500 }}>{l}</span>
                    <span style={{ fontSize:14, fontWeight: hc ? 700 : 500,
                      color: hc || "#0A2342", textAlign:"right",
                      fontFamily: hc ? "var(--font-head)" : "var(--font-body)" }}>{v}</span>
                  </div>
                ))}
              </div>

              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                <Btn onClick={() => window.print()} color="#16A34A">Print</Btn>
                <Btn ghost color={C} onClick={() => setScreen("home")}>Return Home</Btn>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export const ElecNewConnection  = (p) => <NewConnection {...p} dept="electricity" />;
export const GasNewConnection   = (p) => <NewConnection {...p} dept="gas" />;