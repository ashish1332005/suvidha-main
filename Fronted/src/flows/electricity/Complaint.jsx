/**
 * flows/electricity/Complaint.jsx
 * Also used by gas & municipal — pass dept prop
 */
import { useState } from "react";
import api from "../../api/kioskApi";

const DEPT_THEME = {
  electricity: { C:"#0EA5E9", L:"#E0F2FE" },
  gas:         { C:"#F97316", L:"#FFF7ED" },
  municipal:   { C:"#8B5CF6", L:"#F5F3FF" },
  water:       { C:"#06B6D4", L:"#ECFEFF" },
};

const COMPLAINT_TYPES = {
  electricity: [
    "No Power Supply","Frequent Power Cuts","Voltage Fluctuation / Low Voltage",
    "Sparking / Burning Smell from Transformer","Meter Reading Issue",
    "Wrong / Excess Bill","Streetlight Not Working","Meter Damaged",
    "Wire Hanging / Loose Connection","New Meter Request","Other",
  ],
  gas: [
    "Gas Leakage","No Gas Supply","Low Gas Pressure",
    "Meter Reading Error","Wrong Bill","Pipeline Damage","Other",
  ],
  municipal: [
    "Garbage Not Collected","Road Damage / Pothole","Waterlogging",
    "Streetlight Issue","Sewage Overflow","Property Tax Query",
    "Birth / Death Certificate Issue","Tree Fallen","Other",
  ],
  water: [
    "No Water Supply","Low Water Pressure","Contaminated Water",
    "Meter Reading Issue","Pipe Leakage","Wrong Bill","Other",
  ],
};

function Btn({ children, onClick, disabled, ghost, color="#0EA5E9" }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      width:"100%", minHeight:"clamp(52px,6vw,62px)",
      border: ghost ? `2px solid ${color}` : "none",
      borderRadius:14,
      background: ghost ? "white" : disabled ? "#E2E8F0" : color,
      color: ghost ? color : disabled ? "#94A3B8" : "white",
      fontFamily:"var(--font-body)", fontSize:"clamp(15px,1.8vw,18px)",
      fontWeight:700, cursor: disabled ? "not-allowed" : "pointer",
      display:"flex", alignItems:"center", justifyContent:"center", gap:8,
      opacity: disabled ? 0.6 : 1,
    }}>{children}</button>
  );
}

function Fld({ label, value, onChange, placeholder, type="text", rows }) {
  const shared = {
    fontFamily:"var(--font-body)", fontSize:"clamp(14px,1.6vw,16px)",
    color:"#0A2342", background:"#F8FAFC",
    border:"2px solid #E2E8F0", borderRadius:12, outline:"none",
    padding:"clamp(12px,1.4vw,14px) 16px", width:"100%", boxSizing:"border-box",
  };
  return (
    <div style={{ marginBottom:14 }}>
      <label style={{ display:"block", fontFamily:"var(--font-body)", fontSize:12,
        fontWeight:700, color:"#64748B", marginBottom:7,
        letterSpacing:".06em", textTransform:"uppercase" }}>{label}</label>
      {rows
        ? <textarea value={value} onChange={e=>onChange(e.target.value)}
            placeholder={placeholder} rows={rows}
            style={{ ...shared, resize:"vertical", lineHeight:1.6 }} />
        : <input value={value} type={type} onChange={e=>onChange(e.target.value)}
            placeholder={placeholder} style={{ ...shared, height:"clamp(50px,5.5vw,56px)" }} />
      }
    </div>
  );
}

function ErrBox({ msg }) {
  if (!msg) return null;
  return (
    <div style={{ background:"#FEF2F2", border:"1.5px solid #FECACA", borderRadius:12,
      padding:"12px 16px", color:"#B91C1C", fontSize:14,
      fontFamily:"var(--font-body)", marginBottom:16 }}>
      ⚠ {msg}
    </div>
  );
}

function validate(form) {
  if (!form.type)                      return "Please select a complaint type.";
  if (!form.name.trim())               return "Please enter your name.";
  if (!/^[6-9]\d{9}$/.test(form.mobile.replace(/\s/g,"")))
                                        return "Please enter a valid 10-digit mobile number.";
  if (!form.desc.trim())               return "Please describe your issue.";
  if (form.desc.trim().length < 10)    return "Description must be at least 10 characters.";
  return null;
}

export function Complaint({ dept="electricity", flow, t, setScreen }) {
  const theme = DEPT_THEME[dept] || DEPT_THEME.electricity;
  const { C, L } = theme;
  const types = COMPLAINT_TYPES[dept] || COMPLAINT_TYPES.electricity;

  const [step,    setStep]    = useState(1);
  const [form,    setForm]    = useState({ name:"", mobile:"", type:"", desc:"" });
  const [result,  setResult]  = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  const f = (k) => (v) => { setForm(p=>({...p,[k]:v})); setError(""); };

  const handleSubmit = async () => {
    const err = validate(form);
    if (err) { setError(err); return; }
    setLoading(true); setError("");
    try {
      const r = await api.submitComplaint({
        name:        form.name.trim(),
        mobile:      form.mobile.replace(/\s/g,""),
        dept,
        type:        form.type,
        description: form.desc.trim(),
      });
      setResult(r);
      setStep(3);
    } catch (e) {
      setError(e.message);
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
          {flow?.label || "Lodge Complaint"} — {deptLabel}
        </h2>
      </div>

      <div style={{ flex:1, overflowY:"auto" }}>
        <div style={{ maxWidth:720, margin:"0 auto",
          padding:"clamp(20px,2.5vw,32px) clamp(16px,2.5vw,40px) 48px" }}>

          {/* Step 1 — Type selection */}
          {step === 1 && (
            <>
              <p style={{ fontFamily:"var(--font-body)", fontSize:11, fontWeight:700,
                letterSpacing:".08em", textTransform:"uppercase", color:"#94A3B8", marginBottom:12 }}>
                Select Complaint Type
              </p>
              <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:16 }}>
                {types.map(x => (
                  <button key={x} onClick={() => setForm(f=>({...f,type:x}))} style={{
                    padding:"clamp(12px,1.5vw,16px) clamp(14px,1.7vw,18px)",
                    border:`2px solid ${form.type===x ? C : "#E2E8F0"}`,
                    borderLeft:`5px solid ${form.type===x ? C : "#E2E8F0"}`,
                    borderRadius:14,
                    background: form.type===x ? L : "white",
                    textAlign:"left", cursor:"pointer",
                    fontFamily:"var(--font-body)",
                    fontSize:"clamp(14px,1.6vw,16px)",
                    fontWeight: form.type===x ? 700 : 500,
                    color: form.type===x ? C : "#374151",
                    display:"flex", alignItems:"center", gap:12,
                    transition:"border-color .2s, background .2s",
                  }}>
                    <div style={{ width:20, height:20, borderRadius:"50%",
                      border:`2px solid ${form.type===x ? C : "#CBD5E1"}`,
                      background: form.type===x ? C : "transparent",
                      flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center" }}>
                      {form.type===x && <div style={{ width:7, height:7, borderRadius:"50%", background:"white" }} />}
                    </div>
                    {x}
                  </button>
                ))}
              </div>
              {form.type && <Btn color={C} onClick={() => setStep(2)}>Proceed →</Btn>}
            </>
          )}

          {/* Step 2 — Form */}
          {step === 2 && (
            <>
              <ErrBox msg={error} />

              <div style={{ background:`${C}0D`, border:`1.5px solid ${C}30`, borderRadius:12,
                padding:"12px 16px", marginBottom:16,
                fontFamily:"var(--font-body)", fontSize:13, color:"#374151" }}>
                Complaint type: <strong style={{color:C}}>{form.type}</strong>
              </div>

              <Fld label="Your Full Name"    value={form.name}   onChange={f("name")}   placeholder="As per Aadhaar / any ID" />
              <Fld label="Mobile Number"     value={form.mobile} onChange={f("mobile")} placeholder="10-digit mobile number" type="tel" />
              <Fld label="Describe Your Issue" value={form.desc} onChange={f("desc")}  placeholder="Describe the problem in detail…" rows={4} />

              <Btn color={C} onClick={handleSubmit} disabled={loading}>
                {loading ? "Submitting…" : "Submit Complaint"}
              </Btn>
            </>
          )}

          {/* Step 3 — Success */}
          {step === 3 && result && (
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
                fontWeight:800, color:"#0A2342", marginBottom:6 }}>Complaint Registered!</h3>
              <p style={{ fontFamily:"var(--font-body)", fontSize:14, color:"#64748B", marginBottom:24 }}>
                We will address your issue within{" "}
                <strong>{result.eta || "24–48 hours"}</strong>
              </p>

              <div style={{ background:"white", border:"1.5px solid #E2E8F0", borderRadius:16,
                padding:"clamp(16px,2vw,24px)", marginBottom:16, textAlign:"left" }}>
                {[
                  ["Tracking ID",  result.ticketId, C],
                  ["Type",         form.type,       null],
                  ["Department",   deptLabel,       null],
                  ["Mobile",       form.mobile,     null],
                  ["Priority",     result.priority, result.priority==="CRITICAL" ? "#DC2626" : result.priority==="HIGH" ? "#D97706" : "#64748B"],
                  ["Status",       "Registered",    "#D97706"],
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

              <p style={{ fontSize:12, color:"#94A3B8", marginBottom:16 }}>
                📱 You will receive an SMS update on {form.mobile}
              </p>

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

// Named exports
export const ElecComplaint      = (p) => <Complaint {...p} dept="electricity" />;
export const GasComplaint       = (p) => <Complaint {...p} dept="gas" />;
export const MunicipalComplaint = (p) => <Complaint {...p} dept="municipal" />;