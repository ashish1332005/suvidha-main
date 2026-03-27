/**
 * flows/municipal/WaterConnection.jsx
 *
 * New Water Connection application.
 * subType: "muni_newwater"
 *
 * API: api.applyConnection({ name, mobile, aadhaar, address, dept:"municipal", sanctionedLoad, category })
 *      → { applicationNo, status }
 *
 * Also uses: api.trackConnection(appNo) for status tracking
 */

import { useState } from "react";
import api from "../../api/kioskApi";

const C  = "#06B6D4";   // Cyan — water theme
const L  = "#ECFEFF";
const BD = "#A5F3FC";

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

function Row({ label, val, hi, hc }) {
  return (
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start",
      padding:"clamp(9px,1.1vw,13px) 0", borderBottom:"1px solid #F1F5F9", gap:12 }}>
      <span style={{ fontSize:"clamp(13px,1.4vw,15px)", color:"#64748B",
        fontWeight:500, flexShrink:0, minWidth:"38%" }}>{label}</span>
      <span style={{ fontSize: hi?"clamp(14px,1.6vw,17px)":"clamp(13px,1.4vw,15px)",
        fontWeight: hi?700:500, color: hc||"#0A2342",
        textAlign:"right", wordBreak:"break-word",
        fontFamily: hi?"var(--font-head)":"var(--font-body)" }}>{val}</span>
    </div>
  );
}

function Fld({ label, value, onChange, placeholder, type = "text", required = false, hint }) {
  return (
    <div style={{ marginBottom:14 }}>
      <label style={{ display:"block", fontFamily:"var(--font-body)", fontSize:12,
        fontWeight:700, color:"#64748B", marginBottom:7,
        letterSpacing:".06em", textTransform:"uppercase" }}>
        {label}{required && <span style={{ color:"#DC2626", marginLeft:3 }}>*</span>}
      </label>
      <input value={value} type={type} onChange={e => onChange(e.target.value)}
        placeholder={placeholder} style={{
          width:"100%", height:"clamp(50px,5.5vw,56px)", padding:"0 16px",
          fontFamily:"var(--font-body)", fontSize:"clamp(14px,1.6vw,16px)",
          color:"#0A2342", background:"#F8FAFC",
          border:"2px solid #E2E8F0", borderRadius:12, outline:"none",
          boxSizing:"border-box",
        }} />
      {hint && <p style={{ fontFamily:"var(--font-body)", fontSize:11,
        color:"#94A3B8", marginTop:5 }}>{hint}</p>}
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

function StepBar({ step }) {
  const STEPS = ["Docs", "Form", "Review", "Done"];
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

// ── Main ──────────────────────────────────────────────────────────────────────
export function WaterConnection({ t, flow, setScreen }) {
  const [step,    setStep]    = useState(1);
  const [form,    setForm]    = useState({
    name:"", mobile:"", aadhaar:"", address:"", category:"Domestic",
  });
  const [result,  setResult]  = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  const setF = (k) => (v) => { setForm(p => ({ ...p, [k]: v })); setError(""); };

  const DOCS = [
    "Aadhaar Card (original + photocopy)",
    "Address proof — electricity bill / rent agreement (recent)",
    "Land / property ownership document or NOC from owner",
    "Passport photo (2 copies)",
    "AMC No Dues certificate (if transferring from previous owner)",
  ];

  const validate = () => {
    if (!form.name.trim())    return "Please enter your full name.";
    if (!/^[6-9]\d{9}$/.test(form.mobile.replace(/\s/g,"")))
                               return "Please enter a valid 10-digit mobile number.";
    if (!/^\d{12}$/.test(form.aadhaar.replace(/\s/g,"")))
                               return "Aadhaar must be 12 digits (no spaces).";
    if (form.address.trim().length < 10)
                               return "Please enter complete address (min 10 characters).";
    return null;
  };

  const handleSubmit = async () => {
    const err = validate();
    if (err) { setError(err); return; }
    setLoading(true); setError("");
    try {
      const r = await api.applyConnection({
        name:          form.name.trim(),
        mobile:        form.mobile.replace(/\s/g, ""),
        aadhaar:       form.aadhaar.replace(/\s/g, ""),
        address:       form.address.trim(),
        dept:          "municipal",
        sanctionedLoad: parseFloat(form.load || "1"),
        category:      form.category,
      });
      setResult(r);
      setStep(4);
    } catch (e) {
      setError(e.message);
    } finally { setLoading(false); }
  };

  return (
    <div style={{ flex:1, display:"flex", flexDirection:"column", background:"#F0F4F8" }}>

      {/* Header */}
      <div style={{ background:"white", borderBottom:`4px solid ${C}`,
        padding:"clamp(14px,1.8vw,20px) clamp(16px,2.5vw,40px)", flexShrink:0 }}>
        <button onClick={() => step > 1 && step < 4 ? setStep(s => s - 1) : setScreen("dept")}
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
              <path d="M12 2C7.58 2 4 5.58 4 10C4 14.42 7.58 18 12 18C13.06 18 14.08 17.8 15 17.44V20H9V22H15V20H17V17.44C17.92 17.8 18.94 18 20 18C21.1 18 22 17.1 22 16V14C22 13.45 21.55 13 21 13H19C18.45 13 18 13.45 18 14V16C18 16 17.06 15.66 16 15.17V14C16 10.69 14.21 7.81 11.5 6.29C11.82 5.6 12 4.82 12 4C12 2.9 11.1 2 10 2H12ZM10 4C10.55 4 11 4.45 11 5C11 5.55 10.55 6 10 6C9.45 6 9 5.55 9 5C9 4.45 9.45 4 10 4Z"/>
            </svg>
          </div>
          <div>
            <h2 style={{ fontFamily:"var(--font-head)", fontSize:"clamp(16px,2vw,24px)",
              fontWeight:700, color:"#0A2342", margin:0 }}>New Water Connection</h2>
            <p style={{ fontFamily:"var(--font-body)", fontSize:12, color:"#94A3B8", marginTop:3 }}>
              AMC / PHED · Ajmer
            </p>
          </div>
        </div>
      </div>

      <StepBar step={step} />

      <div style={{ flex:1, overflowY:"auto" }}>
        <div style={{ maxWidth:720, margin:"0 auto",
          padding:"clamp(20px,2.5vw,32px) clamp(16px,2.5vw,40px) 60px" }}>

          {/* ── Step 1: Documents info ── */}
          {step === 1 && (
            <>
              <Card style={{ background:L, border:`1.5px solid ${BD}`, marginBottom:14 }}>
                <p style={{ fontFamily:"var(--font-body)", fontSize:"clamp(13px,1.4vw,15px)",
                  color:"#374151", lineHeight:1.7 }}>
                  Apply for a new municipal water connection for your residential or commercial property.
                  Processing fee of <strong>₹1,500 – ₹5,000</strong> will be collected at the AMC office.
                  Connection typically installed within <strong>15–30 working days</strong> after approval.
                </p>
              </Card>

              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:14 }}>
                {[["Connection Fee", "₹1,500 – ₹5,000"], ["Approval Time", "15–30 Working Days"]].map(([l, v]) => (
                  <Card key={l} style={{ textAlign:"center", padding:16, marginBottom:0 }}>
                    <p style={{ fontFamily:"var(--font-body)", fontSize:11, fontWeight:700,
                      letterSpacing:".06em", textTransform:"uppercase",
                      color:"#94A3B8", marginBottom:8 }}>{l}</p>
                    <p style={{ fontFamily:"var(--font-head)", fontSize:"clamp(14px,1.8vw,20px)",
                      fontWeight:800, color:C }}>{v}</p>
                  </Card>
                ))}
              </div>

              <Card style={{ marginBottom:16 }}>
                <p style={{ fontFamily:"var(--font-body)", fontSize:11, fontWeight:700,
                  letterSpacing:".08em", textTransform:"uppercase",
                  color:"#94A3B8", marginBottom:16 }}>Documents Required</p>
                {DOCS.map((doc, i) => (
                  <div key={i} style={{ display:"flex", gap:12, alignItems:"flex-start",
                    marginBottom: i < DOCS.length - 1 ? 14 : 0 }}>
                    <div style={{ width:26, height:26, borderRadius:"50%",
                      background:L, border:`1.5px solid ${BD}`,
                      display:"flex", alignItems:"center", justifyContent:"center",
                      flexShrink:0, marginTop:1 }}>
                      <span style={{ fontFamily:"var(--font-head)",
                        fontSize:11, fontWeight:800, color:C }}>{i + 1}</span>
                    </div>
                    <span style={{ fontFamily:"var(--font-body)",
                      fontSize:"clamp(13px,1.5vw,15px)", color:"#374151", lineHeight:1.6 }}>{doc}</span>
                  </div>
                ))}
              </Card>

              <div style={{ background:"#FFFBEB", border:"1.5px solid #FDE68A",
                borderRadius:12, padding:"12px 16px", marginBottom:20,
                fontFamily:"var(--font-body)", fontSize:"clamp(12px,1.3vw,14px)",
                color:"#78350F", lineHeight:1.6 }}>
                📌 Keep all original documents ready. A field officer will visit your property
                for site inspection before final approval.
              </div>

              <Btn onClick={() => setStep(2)}>
                I Have All Documents — Apply Now →
              </Btn>
            </>
          )}

          {/* ── Step 2: Form ── */}
          {step === 2 && (
            <>
              <div style={{ background:`${C}0D`, border:`1.5px solid ${C}25`,
                borderRadius:12, padding:"12px 16px", marginBottom:20,
                fontFamily:"var(--font-body)", fontSize:13, color:"#374151" }}>
                Fields marked <span style={{ color:"#DC2626" }}>*</span> are required
              </div>
              <ErrBox msg={error} />

              <Fld label="Full Name" value={form.name} onChange={setF("name")}
                placeholder="As per Aadhaar" required />
              <Fld label="Mobile Number" value={form.mobile} onChange={setF("mobile")}
                placeholder="10-digit mobile number" type="tel" required />
              <Fld label="Aadhaar Number" value={form.aadhaar} onChange={setF("aadhaar")}
                placeholder="12-digit Aadhaar (no spaces)" type="text" required
                hint="Stored securely as encrypted hash — never stored in plain text" />
              <Fld label="Property Address" value={form.address} onChange={setF("address")}
                placeholder="Complete address where connection is needed" required />

              {/* Category selector */}
              <div style={{ marginBottom:14 }}>
                <label style={{ display:"block", fontFamily:"var(--font-body)", fontSize:12,
                  fontWeight:700, color:"#64748B", marginBottom:7,
                  letterSpacing:".06em", textTransform:"uppercase" }}>
                  Connection Category <span style={{ color:"#DC2626" }}>*</span>
                </label>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8 }}>
                  {["Domestic", "Commercial", "Industrial"].map(cat => (
                    <button key={cat} onClick={() => setForm(p => ({ ...p, category:cat }))} style={{
                      padding:"clamp(10px,1.2vw,14px) 8px",
                      border:`2px solid ${form.category === cat ? C : "#E2E8F0"}`,
                      borderRadius:10, background: form.category === cat ? L : "white",
                      cursor:"pointer", fontFamily:"var(--font-body)",
                      fontSize:"clamp(13px,1.4vw,15px)", fontWeight: form.category === cat ? 700 : 500,
                      color: form.category === cat ? C : "#374151",
                    }}>{cat}</button>
                  ))}
                </div>
              </div>

              <Fld label="Required Water Load (KL/month)" value={form.load || ""}
                onChange={setF("load")}
                placeholder="e.g. 10 (approx monthly usage in KL)"
                hint="Domestic: 5–15 KL · Commercial: 20–100 KL" />

              <Btn onClick={() => {
                const err = validate();
                if (err) { setError(err); return; }
                setError(""); setStep(3);
              }}>Review Application →</Btn>
            </>
          )}

          {/* ── Step 3: Review ── */}
          {step === 3 && (
            <>
              <Card style={{ marginBottom:14 }}>
                <p style={{ fontFamily:"var(--font-body)", fontSize:11, fontWeight:700,
                  letterSpacing:".08em", textTransform:"uppercase",
                  color:"#94A3B8", marginBottom:14 }}>Review Application</p>
                <Row label="Full Name"         val={form.name} />
                <Row label="Mobile Number"     val={form.mobile} />
                <Row label="Aadhaar"           val={"XXXX-XXXX-" + form.aadhaar.replace(/\s/g,"").slice(-4)} />
                <Row label="Property Address"  val={form.address} />
                <Row label="Category"          val={form.category} />
                {form.load && <Row label="Load Required" val={`${form.load} KL/month`} />}
                <Row label="Dept"              val="Municipal (PHED / AMC)" />
                <Row label="Fee Payable"       val="₹1,500 – ₹5,000 at AMC Office" hi hc={C} />
              </Card>

              <div style={{ background:"#FFFBEB", border:"1.5px solid #FDE68A",
                borderRadius:12, padding:"12px 16px", marginBottom:16,
                fontFamily:"var(--font-body)", fontSize:"clamp(12px,1.3vw,14px)",
                color:"#78350F", lineHeight:1.5 }}>
                ⚠️ Please bring original documents for site verification. A field officer
                will visit within 7–10 days.
              </div>

              <ErrBox msg={error} />

              <Btn onClick={handleSubmit} disabled={loading}>
                {loading ? "Submitting Application…" : "Confirm & Submit Application"}
              </Btn>
              <div style={{ height:10 }} />
              <Btn ghost onClick={() => setStep(2)}>✎ Edit Details</Btn>
            </>
          )}

          {/* ── Step 4: Success ── */}
          {step === 4 && result && (
            <div style={{ textAlign:"center" }}>
              <div style={{ width:"clamp(72px,9vw,96px)", height:"clamp(72px,9vw,96px)",
                borderRadius:"50%", background:"#DCFCE7", border:"3px solid #86EFAC",
                display:"flex", alignItems:"center", justifyContent:"center",
                margin:"0 auto clamp(16px,2vw,24px)", animation:"waterConnPop .5s ease" }}>
                <svg width={42} height={42} viewBox="0 0 24 24" fill="#16A34A">
                  <path d="M9 16.17L4.83 12L3.41 13.41L9 19L21 7L19.59 5.59L9 16.17Z"/>
                </svg>
              </div>

              <h3 style={{ fontFamily:"var(--font-head)",
                fontSize:"clamp(20px,2.8vw,30px)", fontWeight:800, color:"#0A2342", marginBottom:6 }}>
                Application Submitted!
              </h3>
              <p style={{ fontFamily:"var(--font-body)", fontSize:14, color:"#64748B", marginBottom:24 }}>
                New water connection application received
              </p>

              <Card style={{ textAlign:"left", marginBottom:12 }}>
                <p style={{ fontFamily:"var(--font-body)", fontSize:11, fontWeight:700,
                  letterSpacing:".08em", textTransform:"uppercase",
                  color:"#94A3B8", marginBottom:14 }}>Application Details</p>
                <Row label="Application No." val={result.applicationNo} hi hc={C} />
                <Row label="Applicant"        val={form.name} />
                <Row label="Category"         val={form.category} />
                <Row label="Status"           val={result.status || "Submitted"} hi hc="#D97706" />
                <Row label="Next Step"        val="Field officer visit (7–10 days)" />
                <Row label="Processing Time"  val="15–30 Working Days after inspection" />
              </Card>

              <div style={{ background:"#ECFEFF", border:"1.5px solid #A5F3FC",
                borderRadius:12, padding:"clamp(12px,1.4vw,16px)", marginBottom:20,
                fontFamily:"var(--font-body)", fontSize:"clamp(12px,1.3vw,14px)",
                color:"#155E75", lineHeight:1.7, textAlign:"left" }}>
                📋 <strong>Application No.:</strong>{" "}
                <strong style={{ fontFamily:"var(--font-head)", color:C }}>
                  {result.applicationNo}
                </strong>
                <br />
                Save this to track status at the AMC office or on the AMC helpline.
                <br />
                📱 SMS updates will be sent to <strong>{form.mobile}</strong>
              </div>

              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                <Btn color="#16A34A" onClick={() => window.print()}>🖨 Print Acknowledgement</Btn>
                <Btn ghost onClick={() => setScreen("home")}>Return to Home</Btn>
              </div>
            </div>
          )}

        </div>
      </div>
      <style>{`@keyframes waterConnPop{0%{transform:scale(.4);opacity:0}70%{transform:scale(1.1)}100%{transform:scale(1);opacity:1}}`}</style>
    </div>
  );
}