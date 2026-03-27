/**
 * flows/gas/GenericService.jsx
 *
 * Handles multiple gas service types:
 *   gas_newconn   — New Gas Connection
 *   gas_transfer  — Connection Transfer / Name Change
 *   gas_meter     — Meter Issue / Replacement
 *   gas_scheme    — Gas Subsidy Scheme Enquiry
 *   gas_subsidy   — Subsidy Not Received
 *
 * FLOW:  Step 1 → Form  →  Step 2 → Review  →  API  →  Step 3 → Success
 *
 * API:  api.submitService({ name, mobile, dept:"gas", serviceLabel, description })
 *       → { requestId, status }
 *
 *       gas_newconn also uses:
 *       api.applyConnection({ name, mobile, aadhaar, address, dept:"gas", sanctionedLoad, category })
 *       → { applicationNo, status }
 */

import { useState } from "react";
import api from "../../api/kioskApi";

const C = "#F97316";   // Gas orange
const L = "#FFF7ED";
const BD = "#FED7AA";

// ── Service configs — fields & copy per subType ───────────────────────────────
const SERVICE_CONFIGS = {
  gas_newconn: {
    title:      "New Gas Connection",
    titleHi:    "नया गैस कनेक्शन",
    desc:       "Apply for a new domestic or commercial PNG (Piped Natural Gas) or LPG connection. An AVVNL Gas technician will visit for inspection within 7–10 days.",
    fee:        "₹500 – ₹2,000 (connection + deposit)",
    time:       "15–30 Working Days",
    eta:        "Field inspection: 7–10 days",
    useFullConnection: true,   // uses api.applyConnection
    docs: [
      "Aadhaar Card (original + photocopy)",
      "Address proof — electricity bill / rent agreement",
      "Property ownership document or NOC from owner",
      "Passport photo (2 copies)",
    ],
    fields: [
      { k:"name",       l:"Full Name",              p:"As per Aadhaar",                     t:"text", req:true  },
      { k:"mobile",     l:"Mobile Number",          p:"10-digit mobile number",             t:"tel",  req:true  },
      { k:"aadhaar",    l:"Aadhaar Number",         p:"12-digit Aadhaar (no spaces)",       t:"text", req:true  },
      { k:"address",    l:"Connection Address",     p:"Full address where gas is needed",   t:"text", req:true  },
      { k:"category",   l:"Connection Type",        p:"Domestic / Commercial",              t:"text", req:true  },
      { k:"load",       l:"Estimated Monthly Usage (SCM)", p:"e.g. 5 (for domestic use)",  t:"text", req:false },
    ],
  },

  gas_transfer: {
    title:      "Connection Transfer / Name Change",
    titleHi:    "कनेक्शन ट्रांसफर",
    desc:       "Transfer your gas connection to a new address or apply for name change on existing connection due to inheritance, marriage, or property sale.",
    fee:        "₹100 – ₹300 (admin charges)",
    time:       "10–15 Working Days",
    eta:        "Documents verified: 3–5 days",
    docs: [
      "Existing gas consumer card",
      "Aadhaar Card of new / transferee",
      "Reason for transfer (sale deed / marriage certificate / death certificate)",
      "NOC from previous consumer (if applicable)",
    ],
    fields: [
      { k:"name",        l:"Applicant's Full Name",  p:"Person applying for transfer",       t:"text", req:true  },
      { k:"mobile",      l:"Mobile Number",          p:"10-digit mobile number",             t:"tel",  req:true  },
      { k:"consumerNo",  l:"Existing Consumer No.",  p:"From your current gas bill / card",  t:"text", req:true  },
      { k:"reason",      l:"Reason for Transfer",    p:"Property sale / Marriage / Inheritance / Address change", t:"text", req:true },
      { k:"newAddress",  l:"New Address (if change)",p:"Leave blank if only name change",    t:"text", req:false },
    ],
  },

  gas_meter: {
    title:      "Meter Issue / Replacement",
    titleHi:    "मीटर समस्या",
    desc:       "Report meter not working, damaged meter, incorrect readings, or request meter replacement. A technician will visit for inspection.",
    fee:        "Free (warranty) / ₹200–₹500 (if damage by consumer)",
    time:       "3–7 Working Days",
    eta:        "Technician visit: 2–3 days",
    docs: [
      "Recent gas bill (with meter number)",
      "Aadhaar Card",
      "Photo of faulty meter (if possible)",
    ],
    fields: [
      { k:"name",        l:"Consumer Name",          p:"As per gas account",                 t:"text", req:true  },
      { k:"mobile",      l:"Mobile Number",          p:"10-digit mobile number",             t:"tel",  req:true  },
      { k:"consumerNo",  l:"Consumer Number",        p:"From your gas bill",                 t:"text", req:true  },
      { k:"meterNo",     l:"Meter Number",           p:"Printed on the meter / bill",        t:"text", req:false },
      { k:"issue",       l:"Meter Issue",            p:"Not working / High reading / Damaged / Other", t:"text", req:true  },
      { k:"details",     l:"Additional Details",     p:"When did the issue start? Any other observation…", t:"textarea", req:false },
    ],
  },

  gas_scheme: {
    title:      "Gas Subsidy Scheme Enquiry",
    titleHi:    "गैस सब्सिडी स्कीम",
    desc:       "Enquire about PMUY (Pradhan Mantri Ujjwala Yojana) and other government gas subsidy schemes. Register your interest and a representative will contact you.",
    fee:        "Free",
    time:       "2–5 Working Days (representative will call)",
    eta:        "Callback within 2 working days",
    docs: [
      "Aadhaar Card",
      "BPL / Ration Card",
      "Bank passbook (for subsidy transfer)",
    ],
    fields: [
      { k:"name",      l:"Full Name",          p:"As per Aadhaar",                         t:"text", req:true  },
      { k:"mobile",    l:"Mobile Number",      p:"10-digit mobile number",                 t:"tel",  req:true  },
      { k:"district",  l:"District",           p:"e.g. Ajmer",                             t:"text", req:true  },
      { k:"ward",      l:"Ward / Village",     p:"Ward number or village name",            t:"text", req:false },
      { k:"scheme",    l:"Scheme of Interest", p:"PMUY / Gas Subsidy / Other",             t:"text", req:false },
    ],
  },

  gas_subsidy: {
    title:      "Subsidy Not Received",
    titleHi:    "सब्सिडी नहीं मिली",
    desc:       "Lodge a complaint if your LPG subsidy has not been credited to your bank account. Our team will investigate and ensure you receive your due subsidy.",
    fee:        "Free",
    time:       "5–7 Working Days",
    eta:        "Investigation started within 2 days",
    docs: [
      "Recent gas bill / booking slip",
      "Bank passbook (showing missing credit)",
      "Aadhaar-linked bank account details",
    ],
    fields: [
      { k:"name",        l:"Consumer Name",          p:"As per gas account",                 t:"text", req:true  },
      { k:"mobile",      l:"Mobile Number",          p:"10-digit mobile number",             t:"tel",  req:true  },
      { k:"consumerNo",  l:"Consumer / LPG ID",      p:"From your gas card or bill",         t:"text", req:true  },
      { k:"bankAccount", l:"Bank Account (last 4 digits)", p:"For verification only",        t:"text", req:false },
      { k:"period",      l:"Missing Subsidy Period", p:"e.g. Jan 2025 – Mar 2025",          t:"text", req:true  },
      { k:"amount",      l:"Expected Amount (approx)", p:"e.g. ₹450",                       t:"text", req:false },
    ],
  },

  // Fallback default
  default: {
    title:      "Gas Service Request",
    desc:       "Submit a gas service request to AVVNL Gas. Our team will review and contact you.",
    fee:        "Varies by service",
    time:       "3–7 Working Days",
    eta:        "Response within 3 working days",
    docs:       ["Aadhaar Card", "Recent gas bill"],
    fields: [
      { k:"name",    l:"Full Name",       p:"As per Aadhaar",            t:"text", req:true  },
      { k:"mobile",  l:"Mobile Number",  p:"10-digit mobile",           t:"tel",  req:true  },
      { k:"details", l:"Service Details",p:"Describe your request…",    t:"textarea", req:true  },
    ],
  },
};

// ── Shared UI ─────────────────────────────────────────────────────────────────
function Btn({ children, onClick, disabled, ghost, green }) {
  const bg = green ? "#16A34A" : ghost ? "white" : disabled ? "#E2E8F0" : C;
  return (
    <button onClick={onClick} disabled={disabled} style={{
      width:"100%", minHeight:"clamp(52px,6vw,62px)",
      border: ghost ? `2px solid ${C}` : "none", borderRadius:14,
      background: bg,
      color: ghost ? C : disabled ? "#94A3B8" : "white",
      fontFamily:"var(--font-body)", fontSize:"clamp(15px,1.8vw,18px)",
      fontWeight:700, cursor: disabled ? "not-allowed" : "pointer",
      display:"flex", alignItems:"center", justifyContent:"center", gap:8,
      opacity: disabled ? 0.6 : 1, transition:"opacity .2s",
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

function Row({ label, val, hi, hc }) {
  return (
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start",
      padding:"clamp(9px,1.1vw,13px) 0", borderBottom:"1px solid #F1F5F9", gap:12 }}>
      <span style={{ fontSize:"clamp(13px,1.4vw,15px)", color:"#64748B",
        fontWeight:500, flexShrink:0, minWidth:"35%" }}>{label}</span>
      <span style={{ fontSize: hi?"clamp(14px,1.6vw,17px)":"clamp(13px,1.4vw,15px)",
        fontWeight: hi?700:500, color: hc||"#0A2342",
        textAlign:"right", wordBreak:"break-word",
        fontFamily: hi?"var(--font-head)":"var(--font-body)" }}>{val || "—"}</span>
    </div>
  );
}

function Fld({ label, value, onChange, placeholder, type = "text", required = false, error }) {
  const isTextarea = type === "textarea";
  const base = {
    width:"100%", fontFamily:"var(--font-body)", fontSize:"clamp(14px,1.6vw,16px)",
    color:"#0A2342", background:"#F8FAFC",
    border:`2px solid ${error ? "#FECACA" : "#E2E8F0"}`,
    borderRadius:12, outline:"none", boxSizing:"border-box",
    transition:"border-color .2s",
  };
  return (
    <div style={{ marginBottom:14 }}>
      <label style={{ display:"block", fontFamily:"var(--font-body)", fontSize:12,
        fontWeight:700, color: error ? "#B91C1C" : "#64748B", marginBottom:7,
        letterSpacing:".06em", textTransform:"uppercase" }}>
        {label}{required && <span style={{ color:"#DC2626", marginLeft:3 }}>*</span>}
      </label>
      {isTextarea
        ? <textarea value={value} onChange={e => onChange(e.target.value)}
            placeholder={placeholder} rows={4}
            style={{ ...base, padding:"14px 16px", resize:"vertical", lineHeight:1.6, minHeight:90 }} />
        : <input value={value} type={type} onChange={e => onChange(e.target.value)}
            placeholder={placeholder}
            style={{ ...base, height:"clamp(50px,5.5vw,56px)", padding:"0 16px" }} />
      }
      {error && <p style={{ color:"#B91C1C", fontSize:12, marginTop:4 }}>{error}</p>}
    </div>
  );
}

function ErrBox({ msg }) {
  if (!msg) return null;
  return (
    <div style={{ background:"#FEF2F2", border:"1.5px solid #FECACA", borderRadius:12,
      padding:"12px 16px", color:"#B91C1C", fontSize:"clamp(13px,1.4vw,15px)",
      fontFamily:"var(--font-body)", marginBottom:16, display:"flex", gap:10, alignItems:"flex-start" }}>
      <svg width={18} height={18} viewBox="0 0 24 24" fill="#B91C1C" style={{ flexShrink:0, marginTop:1 }}>
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
      </svg>
      <span>{msg}</span>
    </div>
  );
}

function StepBar({ step }) {
  const STEPS = ["Form", "Review", "Done"];
  return (
    <div style={{ display:"flex", gap:6, padding:"12px clamp(16px,2.5vw,40px)",
      background:"white", borderBottom:"1px solid #E2E8F0" }}>
      {STEPS.map((s, i) => (
        <div key={s} style={{ flex:1 }}>
          <div style={{ height:5, borderRadius:3, background: i < step ? C : "#E2E8F0", transition:"background .4s" }} />
          <span style={{ display:"block", textAlign:"center", marginTop:4,
            fontSize:10, fontWeight:600, letterSpacing:".05em",
            color: i < step ? C : "#94A3B8", textTransform:"uppercase" }}>{s}</span>
        </div>
      ))}
    </div>
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
    if (f.k === "aadhaar" && !/^\d{12}$/.test(val.replace(/\s/g, "")))
      return "Aadhaar must be exactly 12 digits (no spaces).";
  }
  return null;
}

function buildDescription(fields, form) {
  return fields
    .filter(f => form[f.k])
    .map(f => `${f.l}: ${form[f.k]}`)
    .join(" | ");
}

// ── Main Component ────────────────────────────────────────────────────────────
export function GasGeneric({ t, flow, setScreen }) {
  const subType = flow?.subType || "default";
  const cfg = SERVICE_CONFIGS[subType] || SERVICE_CONFIGS.default;
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

    const name   = (form.name || "Applicant").trim();
    const mobile = (form.mobile || "").replace(/\s/g, "");

    setLoading(true); setError("");
    try {
      let r;
      if (cfg.useFullConnection) {
        // New connection uses dedicated endpoint
        r = await api.applyConnection({
          name:          name,
          mobile:        mobile,
          aadhaar:       (form.aadhaar || "").replace(/\s/g, ""),
          address:       form.address || "",
          dept:          "gas",
          sanctionedLoad: parseFloat(form.load || "5"),
          category:      form.category || "Domestic",
        });
        // Normalise response to { requestId }
        r = { requestId: r.applicationNo, status: r.status };
      } else {
        r = await api.submitService({
          name:         name,
          mobile:       mobile,
          dept:         "gas",
          serviceLabel: serviceLabel,
          description:  buildDescription(cfg.fields, form),
        });
      }
      setResult(r);
      setStep(3);
    } catch (e) {
      setError(e.message || "Something went wrong. Please try again.");
    } finally { setLoading(false); }
  };

  const handleReview = () => {
    const err = validateFields(cfg.fields, form);
    if (err) { setError(err); return; }
    setError(""); setStep(2);
  };

  return (
    <div style={{ flex:1, display:"flex", flexDirection:"column", background:"#F0F4F8" }}>

      {/* ── Header ── */}
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
            border:`1.5px solid ${BD}`, display:"flex", alignItems:"center",
            justifyContent:"center", flexShrink:0 }}>
            <svg width={22} height={22} viewBox="0 0 24 24" fill={C}>
              <path d="M17.66 11.2c-.23-.3-.51-.56-.77-.82-.67-.6-1.43-1.03-2.07-1.66C13.33 7.26 13 4.85 13.95 3c-.95.23-1.78.75-2.49 1.32-2.59 2.08-3.61 5.75-2.39 8.9.04.1.08.2.08.33 0 .22-.15.42-.35.5-.23.1-.47.04-.66-.12a.58.58 0 01-.14-.17c-1.13-1.43-1.31-3.48-.55-5.12C5.78 10 4.87 12.3 5 14.47c.06.5.12 1 .29 1.5.14.6.41 1.2.71 1.73 1.08 1.73 2.95 2.97 5 3.2 2.2.27 4.52-.17 6.01-1.87 1.58-1.8 2.13-4.31 1.34-6.62l-.04-.1c-.22-.61-.5-1.2-.9-1.71l.25.7z"/>
            </svg>
          </div>
          <div>
            <h2 style={{ fontFamily:"var(--font-head)", fontSize:"clamp(16px,2vw,24px)",
              fontWeight:700, color:"#0A2342", margin:0 }}>{cfg.title}</h2>
            <p style={{ fontFamily:"var(--font-body)", fontSize:12, color:"#94A3B8", marginTop:3 }}>
              AVVNL Gas · Ajmer
            </p>
          </div>
        </div>
      </div>

      <StepBar step={step} />

      {/* ── Content ── */}
      <div style={{ flex:1, overflowY:"auto" }}>
        <div style={{ maxWidth:720, margin:"0 auto",
          padding:"clamp(20px,2.5vw,32px) clamp(16px,2.5vw,40px) 60px" }}>

          {/* ─────────────── STEP 1: Form ─────────────── */}
          {step === 1 && (
            <>
              {/* Desc */}
              <Card style={{ background:L, border:`1.5px solid ${BD}`, marginBottom:14 }}>
                <p style={{ fontFamily:"var(--font-body)", fontSize:"clamp(13px,1.4vw,15px)",
                  color:"#374151", lineHeight:1.7 }}>{cfg.desc}</p>
              </Card>

              {/* Fee + Time */}
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:14 }}>
                {[["Service Fee", cfg.fee], ["Processing Time", cfg.time]].map(([l, v]) => (
                  <Card key={l} style={{ textAlign:"center", padding:16, marginBottom:0 }}>
                    <p style={{ fontFamily:"var(--font-body)", fontSize:11, fontWeight:700,
                      letterSpacing:".06em", textTransform:"uppercase",
                      color:"#94A3B8", marginBottom:8 }}>{l}</p>
                    <p style={{ fontFamily:"var(--font-head)", fontSize:"clamp(13px,1.7vw,18px)",
                      fontWeight:800, color:C, lineHeight:1.3 }}>{v}</p>
                  </Card>
                ))}
              </div>

              {/* Docs */}
              {cfg.docs && (
                <Card style={{ marginBottom:16 }}>
                  <p style={{ fontFamily:"var(--font-body)", fontSize:11, fontWeight:700,
                    letterSpacing:".08em", textTransform:"uppercase",
                    color:"#94A3B8", marginBottom:14 }}>Documents Required</p>
                  {cfg.docs.map((doc, i) => (
                    <div key={i} style={{ display:"flex", gap:12, alignItems:"flex-start",
                      marginBottom: i < cfg.docs.length - 1 ? 12 : 0 }}>
                      <div style={{ width:24, height:24, borderRadius:"50%",
                        background:L, border:`1.5px solid ${BD}`,
                        display:"flex", alignItems:"center", justifyContent:"center",
                        flexShrink:0, marginTop:1 }}>
                        <span style={{ fontFamily:"var(--font-head)", fontSize:11, fontWeight:800, color:C }}>{i+1}</span>
                      </div>
                      <span style={{ fontFamily:"var(--font-body)", fontSize:"clamp(13px,1.4vw,15px)",
                        color:"#374151", lineHeight:1.5 }}>{doc}</span>
                    </div>
                  ))}
                </Card>
              )}

              {/* ETA note */}
              <div style={{ background:"#F0FDF4", border:"1.5px solid #BBF7D0",
                borderRadius:12, padding:"10px 16px", marginBottom:20,
                fontFamily:"var(--font-body)", fontSize:13, color:"#166534" }}>
                ⏱ Estimated response: <strong>{cfg.eta}</strong>
              </div>

              {/* Form fields */}
              <ErrBox msg={error} />
              {cfg.fields.map(f => (
                <Fld key={f.k} label={f.l} value={form[f.k] || ""}
                  onChange={setF(f.k)} placeholder={f.p}
                  type={f.t === "textarea" ? "textarea" : f.t}
                  required={f.req} />
              ))}

              <Btn onClick={handleReview}>Review Application →</Btn>
            </>
          )}

          {/* ─────────────── STEP 2: Review ─────────────── */}
          {step === 2 && (
            <>
              <Card>
                <p style={{ fontFamily:"var(--font-body)", fontSize:11, fontWeight:700,
                  letterSpacing:".08em", textTransform:"uppercase",
                  color:"#94A3B8", marginBottom:14 }}>Review Your Application</p>
                {cfg.fields
                  .filter(f => form[f.k])
                  .map(f => (
                    <Row key={f.k} label={f.l}
                      val={f.k === "aadhaar" ? "XXXX-XXXX-" + (form[f.k] || "").slice(-4) : form[f.k]} />
                  ))
                }
                <Row label="Service Type" val={cfg.title} />
                <Row label="Fee"          val={cfg.fee} hi hc={C} />
              </Card>

              <div style={{ background:"#FFFBEB", border:"1.5px solid #FDE68A",
                borderRadius:12, padding:"12px 16px", marginBottom:16,
                fontFamily:"var(--font-body)", fontSize:"clamp(12px,1.3vw,14px)",
                color:"#78350F", lineHeight:1.5 }}>
                ⚠️ Please verify all details before submitting.
              </div>

              <ErrBox msg={error} />
              <Btn onClick={handleSubmit} disabled={loading}>
                {loading ? "Submitting…" : "Confirm & Submit →"}
              </Btn>
              <div style={{ height:10 }} />
              <Btn ghost onClick={() => setStep(1)}>✎ Edit Details</Btn>
            </>
          )}

          {/* ─────────────── STEP 3: Success ─────────────── */}
          {step === 3 && result && (
            <div style={{ textAlign:"center" }}>
              <div style={{ width:"clamp(72px,9vw,96px)", height:"clamp(72px,9vw,96px)",
                borderRadius:"50%", background:"#DCFCE7", border:"3px solid #86EFAC",
                display:"flex", alignItems:"center", justifyContent:"center",
                margin:"0 auto clamp(16px,2vw,24px)", animation:"gasGenPop .5s ease" }}>
                <svg width={42} height={42} viewBox="0 0 24 24" fill="#16A34A">
                  <path d="M9 16.17L4.83 12L3.41 13.41L9 19L21 7L19.59 5.59L9 16.17Z"/>
                </svg>
              </div>

              <h3 style={{ fontFamily:"var(--font-head)",
                fontSize:"clamp(20px,2.8vw,30px)", fontWeight:800, color:"#0A2342", marginBottom:6 }}>
                Application Submitted!
              </h3>
              <p style={{ fontFamily:"var(--font-body)", fontSize:"clamp(13px,1.4vw,15px)",
                color:"#64748B", marginBottom:24 }}>
                Your {cfg.title} request has been received by AVVNL Gas
              </p>

              <Card style={{ textAlign:"left", marginBottom:12 }}>
                <p style={{ fontFamily:"var(--font-body)", fontSize:11, fontWeight:700,
                  letterSpacing:".08em", textTransform:"uppercase",
                  color:"#94A3B8", marginBottom:14 }}>Request Summary</p>
                <Row label="Request / App. No." val={result.requestId || result.applicationNo} hi hc={C} />
                <Row label="Service"             val={cfg.title} />
                <Row label="Submitted on"        val={new Date().toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" })} />
                <Row label="Processing Time"     val={cfg.time} />
                <Row label="Est. Next Step"      val={cfg.eta} />
                <Row label="Status"              val={result.status || "Submitted"} hi hc="#D97706" />
              </Card>

              <div style={{ background:L, border:`1.5px solid ${BD}`,
                borderRadius:12, padding:"clamp(12px,1.4vw,16px)", marginBottom:20,
                fontFamily:"var(--font-body)", fontSize:"clamp(12px,1.3vw,14px)",
                color:"#78350F", lineHeight:1.7, textAlign:"left" }}>
                📋 <strong>Reference ID:</strong>{" "}
                <strong style={{ fontFamily:"var(--font-head)", color:C }}>
                  {result.requestId || result.applicationNo}
                </strong>
                <br/>
                Save this for follow-up. SMS updates sent to <strong>{form.mobile}</strong>.
                <br/>
                📞 AVVNL Gas Helpline: <strong>1800-233-3555</strong>
              </div>

              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                <Btn green onClick={() => window.print()}>🖨 Print</Btn>
                <Btn ghost onClick={() => setScreen("home")}>Return to Home</Btn>
              </div>
            </div>
          )}

        </div>
      </div>
      <style>{`@keyframes gasGenPop{0%{transform:scale(.4);opacity:0}70%{transform:scale(1.1)}100%{transform:scale(1);opacity:1}}`}</style>
    </div>
  );
}