/**
 * flows/municipal/MuniGeneric.jsx
 *
 * Reusable municipal service flow for:
 *   - Sanitation Complaint (muni_sanitation)
 *   - NOC Application (muni_noc)
 *   - Building Plan Enquiry (muni_building)
 *   - Street Light Issue (muni_streetlight)
 *   - Any other municipal service
 *
 * API: api.submitService({ name, mobile, dept:"municipal", serviceLabel, description })
 *      → { requestId, status }
 */

import { useState } from "react";
import api from "../../api/kioskApi";

const C = "#8B5CF6";
const L = "#F5F3FF";

// ── Service configs ───────────────────────────────────────────────────────────
const SERVICE_CONFIGS = {
  muni_sanitation: {
    title:       "Sanitation Complaint",
    desc:        "Report sanitation and garbage-related issues in your area — uncollected waste, overflowing bins, or unhygienic conditions.",
    icon:        "M19 9L12 2L5 9V11H7V20H10V14H14V20H17V11H19V9Z",
    fields: [
      { k:"name",     l:"Your Full Name",   p:"As per Aadhaar",               t:"text", req:true },
      { k:"mobile",   l:"Mobile Number",    p:"10-digit mobile number",       t:"tel",  req:true },
      { k:"ward",     l:"Ward Number / Area", p:"Ward no. or locality name", t:"text",  req:true },
      { k:"address",  l:"Exact Location",   p:"Street, landmark, area",      t:"text",  req:true },
      { k:"details",  l:"Issue Description",p:"Describe the sanitation issue in detail…", t:"textarea", req:true },
    ],
    eta: "24–48 hours",
  },
  muni_streetlight: {
    title:       "Street Light Issue",
    desc:        "Report non-functioning or damaged street lights in your area. Your complaint will be forwarded to the AMC electrical team.",
    icon:        "M12 7C9.24 7 7 9.24 7 12C7 14.76 9.24 17 12 17C14.76 17 17 14.76 17 12C17 9.24 14.76 7 12 7ZM12 2C12.55 2 13 2.45 13 3V5.07C15.95 5.54 18.28 7.57 19.21 10.3L21 9.28V11L19 12L18.48 12.12C18.17 13.28 17.56 14.31 16.73 15.1L17.29 17H15.15L14.58 15.6C13.77 15.85 12.9 16 12 16C11.1 16 10.23 15.85 9.42 15.6L8.85 17H6.71L7.27 15.1C6.44 14.31 5.83 13.28 5.52 12.12L3.5 12L1.5 11V9.28L3.28 10.3C4.21 7.58 6.54 5.54 9.5 5.07V3C9.5 2.45 9.95 2 10.5 2H12ZM11 8V12H13V8H11Z",
    fields: [
      { k:"name",     l:"Your Full Name",   p:"As per Aadhaar",               t:"text",  req:true },
      { k:"mobile",   l:"Mobile Number",    p:"10-digit mobile number",       t:"tel",   req:true },
      { k:"location", l:"Street Light Location", p:"Street / road name, area, landmark", t:"text", req:true },
      { k:"issue",    l:"Issue Type",       p:"Not working / Flickering / Damaged", t:"text", req:true },
      { k:"details",  l:"Additional Details", p:"How many lights affected, since when…", t:"textarea", req:false },
    ],
    eta: "24–72 hours",
  },
  muni_noc: {
    title:       "NOC Application",
    desc:        "Apply for No Objection Certificate from AMC for property transactions, business registration, or construction purposes.",
    icon:        "M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2ZM18 20H6V4H13V9H18V20ZM12 11H14V13H12V11ZM8 11H10V13H8V11ZM12 15H14V17H12V15ZM8 15H10V17H8V15Z",
    fields: [
      { k:"name",     l:"Applicant's Full Name",  p:"As per Aadhaar",          t:"text",  req:true },
      { k:"mobile",   l:"Mobile Number",          p:"10-digit mobile number",  t:"tel",   req:true },
      { k:"purpose",  l:"Purpose of NOC",         p:"Property sale / Business / Construction / Other", t:"text", req:true },
      { k:"property", l:"Property Address / Plot No.", p:"Complete property details", t:"text", req:true },
      { k:"details",  l:"Additional Information", p:"Any other relevant details…", t:"textarea", req:false },
    ],
    eta: "7–15 Working Days",
  },
  muni_waterlog: {
    title:       "Waterlogging Complaint",
    desc:        "Report waterlogging or drainage issues causing inconvenience or health hazards in public areas or residential streets.",
    icon:        "M12 2C7.58 2 4 5.58 4 10C4 14.42 7.58 18 12 18C16.42 18 20 14.42 20 10C20 5.58 16.42 2 12 2ZM12 16C8.69 16 6 13.31 6 10C6 6.69 8.69 4 12 4C15.31 4 18 6.69 18 10C18 13.31 15.31 16 12 16ZM11 7H13V11H11V7ZM11 13H13V15H11V13Z",
    fields: [
      { k:"name",     l:"Your Full Name",    p:"As per Aadhaar",               t:"text",  req:true },
      { k:"mobile",   l:"Mobile Number",     p:"10-digit mobile number",       t:"tel",   req:true },
      { k:"area",     l:"Affected Area",     p:"Street / colony / ward name",  t:"text",  req:true },
      { k:"severity", l:"Severity",          p:"Minor puddle / Ankle-deep / Knee-deep / Road blocked", t:"text", req:true },
      { k:"details",  l:"Description",       p:"Duration, nearest landmark, any injury/damage…", t:"textarea", req:true },
    ],
    eta: "24–48 hours",
  },
  // Default fallback config
  default: {
    title:       "Municipal Service Request",
    desc:        "Submit a general service request or enquiry to the Ajmer Municipal Corporation.",
    icon:        "M12 2L2 7L12 12L22 7L12 2ZM2 17L12 22L22 17L12 12L2 17ZM2 12L12 17L22 12L12 7L2 12Z",
    fields: [
      { k:"name",     l:"Your Full Name",    p:"As per Aadhaar",               t:"text",  req:true },
      { k:"mobile",   l:"Mobile Number",     p:"10-digit mobile number",       t:"tel",   req:true },
      { k:"subject",  l:"Subject / Request", p:"Brief subject of your request",t:"text",  req:true },
      { k:"details",  l:"Details",           p:"Describe your request in detail…", t:"textarea", req:true },
    ],
    eta: "3–7 Working Days",
  },
};

// ── Shared UI ─────────────────────────────────────────────────────────────────
function Btn({ children, onClick, disabled, ghost }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      width:"100%", minHeight:"clamp(52px,6vw,62px)",
      border: ghost ? `2px solid ${C}` : "none", borderRadius:14,
      background: ghost ? "white" : disabled ? "#E2E8F0" : C,
      color: ghost ? C : disabled ? "#94A3B8" : "white",
      fontFamily:"var(--font-body)", fontSize:"clamp(15px,1.8vw,18px)",
      fontWeight:700, cursor: disabled ? "not-allowed" : "pointer",
      display:"flex", alignItems:"center", justifyContent:"center", gap:8,
      opacity: disabled ? 0.6 : 1,
    }}>{children}</button>
  );
}

function Card({ children, style = {} }) {
  return (
    <div style={{ background:"white", border:"1.5px solid #E2E8F0", borderRadius:16,
      padding:"clamp(16px,2vw,24px)", boxShadow:"0 1px 4px rgba(10,35,66,.07)",
      marginBottom:16, ...style }}>
      {children}
    </div>
  );
}

function Row({ label, val }) {
  return (
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start",
      padding:"clamp(9px,1.1vw,13px) 0", borderBottom:"1px solid #F1F5F9", gap:12 }}>
      <span style={{ fontSize:"clamp(13px,1.4vw,15px)", color:"#64748B",
        fontWeight:500, flexShrink:0, minWidth:"35%" }}>{label}</span>
      <span style={{ fontSize:"clamp(13px,1.4vw,15px)", fontWeight:500, color:"#0A2342",
        textAlign:"right", wordBreak:"break-word", maxWidth:"60%" }}>{val || "—"}</span>
    </div>
  );
}

function Fld({ label, value, onChange, placeholder, type = "text", required = false }) {
  const base = {
    width:"100%", fontFamily:"var(--font-body)", fontSize:"clamp(14px,1.6vw,16px)",
    color:"#0A2342", background:"#F8FAFC", border:"2px solid #E2E8F0",
    borderRadius:12, outline:"none", boxSizing:"border-box",
  };
  return (
    <div style={{ marginBottom:14 }}>
      <label style={{ display:"block", fontFamily:"var(--font-body)", fontSize:12,
        fontWeight:700, color:"#64748B", marginBottom:7,
        letterSpacing:".06em", textTransform:"uppercase" }}>
        {label}{required && <span style={{ color:"#DC2626", marginLeft:3 }}>*</span>}
      </label>
      {type === "textarea"
        ? <textarea value={value} onChange={e => onChange(e.target.value)}
            placeholder={placeholder} rows={4}
            style={{ ...base, padding:"14px 16px", resize:"vertical", lineHeight:1.6, minHeight:100 }} />
        : <input value={value} type={type} onChange={e => onChange(e.target.value)}
            placeholder={placeholder}
            style={{ ...base, height:"clamp(50px,5.5vw,56px)", padding:"0 16px" }} />
      }
    </div>
  );
}

function ErrBox({ msg }) {
  if (!msg) return null;
  return (
    <div style={{ background:"#FEF2F2", border:"1.5px solid #FECACA", borderRadius:12,
      padding:"12px 16px", color:"#B91C1C", fontSize:"clamp(13px,1.4vw,15px)",
      fontFamily:"var(--font-body)", marginBottom:16 }}>⚠ {msg}</div>
  );
}

// ── Validation ────────────────────────────────────────────────────────────────
function validateFields(fields, form) {
  for (const f of fields) {
    if (!f.req) continue;
    const val = (form[f.k] || "").trim();
    if (!val) return `"${f.l}" is required.`;
    if (f.t === "tel" && !/^[6-9]\d{9}$/.test(val.replace(/\s/g, "")))
      return "Please enter a valid 10-digit mobile number.";
  }
  return null;
}

// ── Main ──────────────────────────────────────────────────────────────────────
export function MuniGeneric({ t, flow, setScreen }) {
  const cfg = SERVICE_CONFIGS[flow?.subType] || SERVICE_CONFIGS.default;
  const serviceLabel = flow?.label || cfg.title;

  const [step,    setStep]    = useState(1);
  const [form,    setForm]    = useState({});
  const [result,  setResult]  = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  const setF = (k) => (v) => { setForm(p => ({ ...p, [k]: v })); setError(""); };

  const handleSubmit = async () => {
    const err = validateFields(cfg.fields, form);
    if (err) { setError(err); return; }

    const description = cfg.fields
      .filter(f => form[f.k])
      .map(f => `${f.l}: ${form[f.k]}`)
      .join(" | ");

    setLoading(true); setError("");
    try {
      const r = await api.submitService({
        name:         (form.name || "Applicant").trim(),
        mobile:       (form.mobile || "").replace(/\s/g, ""),
        dept:         "municipal",
        serviceLabel: serviceLabel,
        description:  description,
      });
      setResult(r);
      setStep(3);
    } catch (e) {
      setError(e.message || "Something went wrong. Please try again.");
    } finally { setLoading(false); }
  };

  return (
    <div style={{ flex:1, display:"flex", flexDirection:"column", background:"#F0F4F8" }}>

      {/* Header */}
      <div style={{ background:"white", borderBottom:`4px solid ${C}`,
        padding:"clamp(14px,1.8vw,20px) clamp(16px,2.5vw,40px)", flexShrink:0 }}>
        <button onClick={() => step > 1 && step < 3 ? setStep(s => s - 1) : setScreen("dept")}
          style={{ background:"none", border:"none", cursor:"pointer",
            display:"flex", alignItems:"center", gap:6, color:"#64748B",
            fontFamily:"var(--font-body)", fontSize:"clamp(13px,1.4vw,15px)",
            fontWeight:600, marginBottom:12, padding:"4px 0" }}>
          <svg width={16} height={16} viewBox="0 0 24 24" fill="#64748B">
            <path d="M20 11H7.83L13.42 5.41L12 4L4 12L12 20L13.41 18.59L7.83 13H20V11Z"/>
          </svg>
          {t?.back || "Back"}
        </button>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <div style={{ width:46, height:46, borderRadius:12, background:L,
            border:"1.5px solid #DDD6FE", display:"flex", alignItems:"center",
            justifyContent:"center", flexShrink:0 }}>
            <svg width={22} height={22} viewBox="0 0 24 24" fill={C}>
              <path d={cfg.icon}/>
            </svg>
          </div>
          <div>
            <h2 style={{ fontFamily:"var(--font-head)", fontSize:"clamp(16px,2vw,24px)",
              fontWeight:700, color:"#0A2342", margin:0 }}>{cfg.title}</h2>
            <p style={{ fontFamily:"var(--font-body)", fontSize:12, color:"#94A3B8", marginTop:3 }}>
              Municipal Corporation · AMC, Ajmer
            </p>
          </div>
        </div>
      </div>

      {/* Steps */}
      <div style={{ display:"flex", gap:6, padding:"12px clamp(16px,2.5vw,40px)",
        background:"white", borderBottom:"1px solid #E2E8F0" }}>
        {["Form", "Review", "Done"].map((s, i) => (
          <div key={s} style={{ flex:1 }}>
            <div style={{ height:5, borderRadius:3, background: i < step ? C : "#E2E8F0" }} />
            <span style={{ display:"block", textAlign:"center", marginTop:4,
              fontSize:10, fontWeight:600, letterSpacing:".05em",
              color: i < step ? C : "#94A3B8", textTransform:"uppercase" }}>{s}</span>
          </div>
        ))}
      </div>

      <div style={{ flex:1, overflowY:"auto" }}>
        <div style={{ maxWidth:720, margin:"0 auto",
          padding:"clamp(20px,2.5vw,32px) clamp(16px,2.5vw,40px) 60px" }}>

          {/* ── Step 1: Form ── */}
          {step === 1 && (
            <>
              <Card style={{ background:L, border:"1.5px solid #DDD6FE", marginBottom:16 }}>
                <p style={{ fontFamily:"var(--font-body)", fontSize:"clamp(13px,1.4vw,15px)",
                  color:"#374151", lineHeight:1.7 }}>{cfg.desc}</p>
              </Card>

              {cfg.eta && (
                <div style={{ background:"#F0FDF4", border:"1.5px solid #BBF7D0",
                  borderRadius:12, padding:"10px 16px", marginBottom:16,
                  fontFamily:"var(--font-body)", fontSize:13, color:"#166534" }}>
                  ⏱ Estimated resolution time: <strong>{cfg.eta}</strong>
                </div>
              )}

              <ErrBox msg={error} />

              {cfg.fields.map(f => (
                <Fld key={f.k} label={f.l} value={form[f.k] || ""}
                  onChange={setF(f.k)} placeholder={f.p}
                  type={f.t === "textarea" ? "textarea" : f.t}
                  required={f.req} />
              ))}

              <Btn onClick={() => {
                const err = validateFields(cfg.fields, form);
                if (err) { setError(err); return; }
                setError(""); setStep(2);
              }}>Review Details →</Btn>
            </>
          )}

          {/* ── Step 2: Review ── */}
          {step === 2 && (
            <>
              <Card style={{ marginBottom:14 }}>
                <p style={{ fontFamily:"var(--font-body)", fontSize:11, fontWeight:700,
                  letterSpacing:".08em", textTransform:"uppercase",
                  color:"#94A3B8", marginBottom:14 }}>Review Your Request</p>
                {cfg.fields
                  .filter(f => form[f.k])
                  .map(f => <Row key={f.k} label={f.l} val={form[f.k]} />)
                }
                <Row label="Service Type" val={cfg.title} />
                <Row label="Department"   val="Municipal (AMC)" />
              </Card>

              <ErrBox msg={error} />

              <Btn onClick={handleSubmit} disabled={loading}>
                {loading ? "Submitting…" : "Confirm & Submit →"}
              </Btn>
              <div style={{ height:10 }} />
              <Btn ghost onClick={() => setStep(1)}>✎ Edit Details</Btn>
            </>
          )}

          {/* ── Step 3: Success ── */}
          {step === 3 && result && (
            <div style={{ textAlign:"center" }}>
              <div style={{ width:"clamp(72px,9vw,96px)", height:"clamp(72px,9vw,96px)",
                borderRadius:"50%", background:"#DCFCE7", border:"3px solid #86EFAC",
                display:"flex", alignItems:"center", justifyContent:"center",
                margin:"0 auto clamp(16px,2vw,24px)", animation:"muniGenPop .5s ease" }}>
                <svg width={42} height={42} viewBox="0 0 24 24" fill="#16A34A">
                  <path d="M9 16.17L4.83 12L3.41 13.41L9 19L21 7L19.59 5.59L9 16.17Z"/>
                </svg>
              </div>

              <h3 style={{ fontFamily:"var(--font-head)",
                fontSize:"clamp(20px,2.8vw,30px)", fontWeight:800, color:"#0A2342", marginBottom:6 }}>
                Request Submitted!
              </h3>
              <p style={{ fontFamily:"var(--font-body)", fontSize:14, color:"#64748B", marginBottom:24 }}>
                Your {cfg.title} request has been received by AMC
              </p>

              <Card style={{ textAlign:"left", marginBottom:12 }}>
                <p style={{ fontFamily:"var(--font-body)", fontSize:11, fontWeight:700,
                  letterSpacing:".08em", textTransform:"uppercase",
                  color:"#94A3B8", marginBottom:14 }}>Request Summary</p>
                <Row label="Request ID"    val={result.requestId} />
                <Row label="Service"       val={cfg.title} />
                <Row label="Submitted on"  val={new Date().toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" })} />
                {cfg.eta && <Row label="Est. Resolution" val={cfg.eta} />}
                <Row label="Status"        val={result.status || "Submitted"} />
              </Card>

              <div style={{ background:L, border:"1.5px solid #DDD6FE",
                borderRadius:12, padding:"clamp(12px,1.4vw,16px)", marginBottom:20,
                fontFamily:"var(--font-body)", fontSize:"clamp(12px,1.3vw,14px)",
                color:"#4C1D95", lineHeight:1.7, textAlign:"left" }}>
                📋 <strong>Request ID:</strong>{" "}
                <strong style={{ fontFamily:"var(--font-head)", color:C }}>{result.requestId}</strong>
                <br/>
                Use this ID to track your request at the AMC office or helpline <strong>1800-180-XXXX</strong>.
                <br/>
                📱 SMS updates will be sent to your registered mobile.
              </div>

              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                <Btn color="#16A34A" onClick={() => window.print()}>🖨 Print</Btn>
                <Btn ghost onClick={() => setScreen("home")}>Return to Home</Btn>
              </div>
            </div>
          )}

        </div>
      </div>
      <style>{`@keyframes muniGenPop{0%{transform:scale(.4);opacity:0}70%{transform:scale(1.1)}100%{transform:scale(1);opacity:1}}`}</style>
    </div>
  );
}