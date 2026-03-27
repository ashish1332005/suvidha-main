/**
 * flows/gas/GasComplaint.jsx
 * Production-level Gas Complaint flow
 * - Real API via kioskApi.js
 * - Consumer number lookup (optional)
 * - Priority auto-detection (CRITICAL for hazards)
 * - Ticket tracking
 * - Print support
 */

import { useState, useRef, useEffect } from "react";
import api from "../../api/kioskApi";

const C = "#F97316";
const STEPS = ["Issue Type", "Your Details", "Review", "Done"];

const COMPLAINT_TYPES = [
  { id: "no_supply",      label: "No Gas Supply",           priority: "HIGH",     eta: "4–8 hours" },
  { id: "low_pressure",   label: "Low Gas Pressure",        priority: "MEDIUM",   eta: "24–48 hours" },
  { id: "meter_fault",    label: "Meter Not Working",       priority: "MEDIUM",   eta: "24–48 hours" },
  { id: "billing",        label: "Wrong Bill / Overcharge", priority: "LOW",      eta: "3–5 working days" },
  { id: "connection",     label: "Connection Issue",        priority: "MEDIUM",   eta: "24–48 hours" },
  { id: "subsidy",        label: "Subsidy Not Received",    priority: "LOW",      eta: "5–7 working days" },
  { id: "sparking",       label: "Sparking / Burning Smell",priority: "CRITICAL", eta: "2–4 hours" },
  { id: "cylinder",       label: "Cylinder Not Delivered",  priority: "MEDIUM",   eta: "24–48 hours" },
  { id: "other",          label: "Other Issue",             priority: "MEDIUM",   eta: "24–48 hours" },
];

// ─── Sub-components ────────────────────────────────────────────────────────────
function Ic({ p, s = 20, c = "currentColor" }) {
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill={c} style={{ flexShrink: 0 }}>
      <path d={p} />
    </svg>
  );
}

function StepBar({ cur }) {
  return (
    <div style={{ display:"flex", gap:6, padding:"12px clamp(16px,2.5vw,40px)",
      background:"white", borderBottom:"1px solid #E2E8F0" }}>
      {STEPS.map((s, i) => (
        <div key={s} style={{ flex:1 }}>
          <div style={{ height:5, borderRadius:3,
            background: i < cur ? C : "#E2E8F0", transition:"background .4s" }} />
          <span style={{ display:"block", textAlign:"center", marginTop:4,
            fontSize:10, fontWeight:600, letterSpacing:".05em",
            color: i < cur ? C : "#94A3B8", textTransform:"uppercase" }}>{s}</span>
        </div>
      ))}
    </div>
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

function RowItem({ label, val, hi, hc = "#0A2342" }) {
  return (
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center",
      padding:"clamp(10px,1.2vw,13px) 0", borderBottom:"1px solid #F1F5F9", gap:12 }}>
      <span style={{ fontSize:"clamp(13px,1.4vw,15px)", color:"#64748B", fontWeight:500, flexShrink:0 }}>{label}</span>
      <span style={{ fontSize: hi ? "clamp(14px,1.6vw,17px)" : "clamp(13px,1.4vw,15px)",
        fontWeight: hi ? 700 : 500, color: hi ? hc : "#0A2342", textAlign:"right",
        fontFamily: hi ? "var(--font-head)" : "var(--font-body)" }}>{val}</span>
    </div>
  );
}

function Btn({ children, onClick, ghost, disabled, color = C, small }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      width:"100%", minHeight: small ? 44 : "clamp(52px,6vw,62px)",
      border: ghost ? `2px solid ${color}` : "none", borderRadius:14,
      background: ghost ? "white" : disabled ? "#E2E8F0" : color,
      color: ghost ? color : disabled ? "#94A3B8" : "white",
      fontFamily:"var(--font-body)", fontSize: small ? "clamp(13px,1.5vw,15px)" : "clamp(15px,1.8vw,18px)",
      fontWeight:700, cursor: disabled ? "not-allowed" : "pointer",
      display:"flex", alignItems:"center", justifyContent:"center", gap:8,
      opacity: disabled ? 0.6 : 1,
    }}>{children}</button>
  );
}

function Fld({ label, value, onChange, placeholder, type = "text", error, rows }) {
  const common = {
    width:"100%", padding:"clamp(12px,1.4vw,14px) 16px",
    fontFamily:"var(--font-body)", fontSize:"clamp(14px,1.6vw,16px)",
    color:"#0A2342", background:"#F8FAFC",
    border:`2px solid ${error ? "#FECACA" : "#E2E8F0"}`,
    borderRadius:12, outline:"none", boxSizing:"border-box",
    transition:"border-color .2s",
  };
  return (
    <div style={{ marginBottom:14 }}>
      <label style={{ display:"block", fontFamily:"var(--font-body)", fontSize:12,
        fontWeight:700, color: error ? "#B91C1C" : "#64748B", marginBottom:7,
        letterSpacing:".06em", textTransform:"uppercase" }}>{label}</label>
      {rows
        ? <textarea value={value} onChange={e => onChange(e.target.value)}
            placeholder={placeholder} rows={rows}
            style={{ ...common, resize:"vertical", minHeight:90 }} />
        : <input value={value} type={type} onChange={e => onChange(e.target.value)}
            placeholder={placeholder} style={{ ...common, height:"clamp(50px,5.5vw,56px)" }} />
      }
      {error && <p style={{ color:"#B91C1C", fontSize:12, marginTop:4 }}>{error}</p>}
    </div>
  );
}

function ErrBox({ msg }) {
  if (!msg) return null;
  return (
    <div style={{ background:"#FEF2F2", border:"1.5px solid #FECACA", borderRadius:12,
      padding:"12px 16px", color:"#B91C1C", fontSize:"clamp(12px,1.3vw,14px)",
      fontFamily:"var(--font-body)", marginBottom:16, display:"flex", gap:10, alignItems:"flex-start" }}>
      <Ic p="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"
        s={18} c="#B91C1C" />
      <span>{msg}</span>
    </div>
  );
}

const PRIORITY_COLORS = {
  CRITICAL: { bg:"#FEF2F2", bd:"#FECACA", c:"#DC2626", label:"Critical — Immediate Response" },
  HIGH:     { bg:"#FFF7ED", bd:"#FED7AA", c:"#EA580C", label:"High Priority" },
  MEDIUM:   { bg:"#FFFBEB", bd:"#FDE68A", c:"#D97706", label:"Medium Priority" },
  LOW:      { bg:"#F0FDF4", bd:"#BBF7D0", c:"#16A34A", label:"Standard" },
};

function PriorityBadge({ priority }) {
  const s = PRIORITY_COLORS[priority] || PRIORITY_COLORS.MEDIUM;
  return (
    <div style={{ background:s.bg, border:`1.5px solid ${s.bd}`, borderRadius:8,
      padding:"6px 12px", display:"inline-flex", alignItems:"center", gap:6 }}>
      <div style={{ width:8, height:8, borderRadius:"50%", background:s.c }} />
      <span style={{ fontFamily:"var(--font-body)", fontSize:13, fontWeight:700, color:s.c }}>
        {s.label}
      </span>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export function GasComplaint({ t, setScreen }) {
  const [step,      setStep]     = useState(1);
  const [selType,   setSelType]  = useState(null);   // selected COMPLAINT_TYPES item
  const [form,      setForm]     = useState({ name:"", mobile:"", consumerNo:"", desc:"" });
  const [errs,      setErrs]     = useState({});
  const [apiError,  setApiError] = useState("");
  const [loading,   setLoading]  = useState(false);
  const [result,    setResult]   = useState(null);
  const [tracking,  setTracking] = useState(null);   // for track-ticket mini flow
  const [trackId,   setTrackId]  = useState("");
  const [showTrack, setShowTrack]= useState(false);

  const f = (k) => (v) => { setForm(p => ({ ...p, [k]: v })); setErrs(e => ({ ...e, [k]:"" })); setApiError(""); };

  // Validate step 2 fields
  const validate = () => {
    const e = {};
    if (!form.name.trim() || form.name.trim().length < 2) e.name = "Enter your full name";
    if (!/^[6-9]\d{9}$/.test(form.mobile.replace(/\s/g,""))) e.mobile = "Enter valid 10-digit mobile number";
    if (!form.desc.trim() || form.desc.trim().length < 10)   e.desc  = "Please describe your issue (min 10 characters)";
    setErrs(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    setLoading(true); setApiError("");
    try {
      const res = await api.submitComplaint({
        name:           form.name.trim(),
        mobile:         form.mobile.replace(/\s/g,""),
        dept:           "gas",
        type:           selType.label,
        description:    form.desc.trim(),
        consumerNumber: form.consumerNo.trim() || undefined,
      });
      setResult(res);
      setStep(4);
    } catch (e) {
      setApiError(e.message);
    } finally { setLoading(false); }
  };

  const handleTrack = async () => {
    if (!trackId.trim()) return;
    setLoading(true); setApiError("");
    try {
      const res = await api.trackComplaint(trackId.trim().toUpperCase());
      setTracking(res.complaint);
    } catch (e) {
      setApiError(e.message);
    } finally { setLoading(false); }
  };

  const isCritical = selType?.priority === "CRITICAL";

  return (
    <div style={{ flex:1, display:"flex", flexDirection:"column", background:"#F0F4F8" }}>

      {/* Header */}
      <div style={{ background:"white", borderBottom:"3px solid #E2E8F0",
        padding:"clamp(14px,1.8vw,20px) clamp(16px,2.5vw,40px)" }}>
        <button onClick={() => step > 1 && step < 4 ? setStep(s => s-1) : setScreen("dept")}
          style={{ background:"none", border:"none", cursor:"pointer",
            display:"flex", alignItems:"center", gap:6, color:"#64748B",
            fontFamily:"var(--font-body)", fontSize:"clamp(13px,1.4vw,15px)",
            fontWeight:600, marginBottom:12, padding:"4px 0" }}>
          <Ic p="M20 11H7.83L13.42 5.41L12 4L4 12L12 20L13.41 18.59L7.83 13H20V11Z" s={16} c="#64748B" />
          Back
        </button>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:12 }}>
          <h2 style={{ fontFamily:"var(--font-head)", fontSize:"clamp(16px,2vw,24px)",
            fontWeight:700, color:"#0A2342", margin:0 }}>Gas Complaint</h2>
          {/* Track ticket button */}
          <button onClick={() => setShowTrack(v => !v)} style={{
            background:"none", border:`1.5px solid ${C}`, borderRadius:10,
            padding:"6px 14px", color:C, fontFamily:"var(--font-body)",
            fontSize:"clamp(12px,1.3vw,14px)", fontWeight:700, cursor:"pointer",
            display:"flex", alignItems:"center", gap:6,
          }}>
            <Ic p="M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2zm3 18H5V8h14v11z" s={16} c={C} />
            Track Ticket
          </button>
        </div>
      </div>

      {/* Track ticket panel */}
      {showTrack && (
        <div style={{ background:"#FFF7ED", borderBottom:"2px solid #FED7AA",
          padding:"clamp(12px,1.5vw,18px) clamp(16px,2.5vw,40px)" }}>
          <p style={{ fontFamily:"var(--font-body)", fontSize:13, fontWeight:700,
            color:"#92400E", marginBottom:10, textTransform:"uppercase", letterSpacing:".06em" }}>
            Track Existing Complaint
          </p>
          <div style={{ display:"flex", gap:10 }}>
            <input value={trackId} onChange={e => setTrackId(e.target.value.toUpperCase())}
              placeholder="Enter Ticket ID (e.g. CMP-1234567-ABCD)"
              style={{ flex:1, height:"clamp(44px,5vw,52px)", padding:"0 14px",
                fontFamily:"var(--font-body)", fontSize:"clamp(13px,1.5vw,15px)",
                color:"#0A2342", background:"white",
                border:"2px solid #FED7AA", borderRadius:10, outline:"none" }} />
            <button onClick={handleTrack} disabled={!trackId.trim() || loading}
              style={{ height:"clamp(44px,5vw,52px)", padding:"0 20px",
                background: C, border:"none", borderRadius:10, color:"white",
                fontFamily:"var(--font-body)", fontSize:"clamp(13px,1.5vw,15px)",
                fontWeight:700, cursor:"pointer", whiteSpace:"nowrap",
                opacity: !trackId.trim() ? 0.5 : 1 }}>
              {loading ? "…" : "Track"}
            </button>
          </div>
          {apiError && <p style={{ color:"#B91C1C", fontSize:13, marginTop:8 }}>{apiError}</p>}
          {tracking && (
            <div style={{ background:"white", border:"1.5px solid #FED7AA", borderRadius:12,
              padding:"14px 16px", marginTop:12 }}>
              <RowItem label="Ticket ID"  val={tracking.ticketId} hi hc={C} />
              <RowItem label="Type"       val={tracking.type} />
              <RowItem label="Status"     val={tracking.status}
                hi hc={tracking.status === "Resolved" ? "#16A34A" : "#D97706"} />
              <RowItem label="Priority"   val={tracking.priority} />
              <RowItem label="Registered" val={new Date(tracking.createdAt).toLocaleDateString("en-IN")} />
              {tracking.resolvedAt &&
                <RowItem label="Resolved" val={new Date(tracking.resolvedAt).toLocaleDateString("en-IN")} />}
            </div>
          )}
        </div>
      )}

      <StepBar cur={step} />

      <div style={{ flex:1, overflowY:"auto" }}>
        <div style={{ maxWidth:720, margin:"0 auto",
          padding:"clamp(20px,2.5vw,32px) clamp(16px,2.5vw,40px) 48px" }}>

          {/* ── STEP 1: Select Issue Type ── */}
          {step === 1 && (
            <>
              {/* Gas Leak redirect banner */}
              <div style={{ background:"#FEF2F2", border:"2px solid #DC2626", borderRadius:14,
                padding:"clamp(14px,1.8vw,20px)", marginBottom:20,
                display:"flex", gap:14, alignItems:"center" }}>
                <div style={{ width:48, height:48, borderRadius:"50%", background:"#DC2626",
                  display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                  <Ic p="M12 2L1 21H23L12 2ZM11 10V14H13V10H11ZM11 16V18H13V16H11Z" s={24} c="white" />
                </div>
                <div>
                  <p style={{ fontFamily:"var(--font-body)", fontSize:"clamp(13px,1.5vw,15px)",
                    fontWeight:800, color:"#DC2626", marginBottom:4 }}>Gas Leak? Call 1906 IMMEDIATELY</p>
                  <p style={{ fontFamily:"var(--font-body)", fontSize:"clamp(12px,1.3vw,14px)",
                    color:"#7F1D1D", lineHeight:1.5 }}>
                    Do NOT use this kiosk for gas emergencies. Leave building, call 1906 from outside.
                  </p>
                </div>
              </div>

              <p style={{ fontFamily:"var(--font-body)", fontSize:11, fontWeight:700,
                letterSpacing:".08em", textTransform:"uppercase", color:"#94A3B8", marginBottom:12 }}>
                Select Your Issue
              </p>

              <div style={{ display:"grid", gap:8 }}>
                {COMPLAINT_TYPES.map(ct => {
                  const active = selType?.id === ct.id;
                  const pStyle = PRIORITY_COLORS[ct.priority];
                  return (
                    <button key={ct.id} onClick={() => setSelType(ct)} style={{
                      display:"flex", alignItems:"center", justifyContent:"space-between",
                      padding:"clamp(14px,1.6vw,18px) clamp(16px,1.8vw,20px)",
                      border:`2px solid ${active ? C : "#E2E8F0"}`,
                      borderLeft:`5px solid ${active ? C : pStyle.c}`,
                      borderRadius:14,
                      background: active ? `${C}10` : "white",
                      cursor:"pointer", textAlign:"left",
                      transition:"border-color .15s, background .15s",
                    }}>
                      <span style={{ fontFamily:"var(--font-body)",
                        fontSize:"clamp(14px,1.6vw,16px)",
                        fontWeight: active ? 700 : 500,
                        color: active ? C : "#374151" }}>{ct.label}</span>
                      <div style={{ display:"flex", alignItems:"center", gap:8, flexShrink:0 }}>
                        <span style={{ fontSize:12, color: pStyle.c, fontWeight:600,
                          background: pStyle.bg, padding:"2px 8px", borderRadius:20,
                          border:`1px solid ${pStyle.bd}` }}>
                          {ct.eta}
                        </span>
                        {active && <Ic p="M9 16.17L4.83 12L3.41 13.41L9 19L21 7L19.59 5.59L9 16.17Z"
                          s={20} c={C} />}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div style={{ height:16 }} />
              <Btn onClick={() => setStep(2)} disabled={!selType}>
                Continue →
              </Btn>
            </>
          )}

          {/* ── STEP 2: Your Details ── */}
          {step === 2 && (
            <>
              {/* Critical warning */}
              {isCritical && (
                <div style={{ background:"#FEF2F2", border:"2px solid #DC2626", borderRadius:12,
                  padding:"12px 16px", marginBottom:16, display:"flex", gap:10 }}>
                  <Ic p="M12 2L1 21H23L12 2ZM12 6L19.53 19H4.47L12 6ZM11 10V14H13V10H11ZM11 16V18H13V16H11Z"
                    s={20} c="#DC2626" />
                  <div>
                    <p style={{ fontFamily:"var(--font-body)", fontSize:14, fontWeight:800,
                      color:"#DC2626", marginBottom:3 }}>Critical Issue — Priority Response</p>
                    <p style={{ fontFamily:"var(--font-body)", fontSize:13, color:"#7F1D1D" }}>
                      Our team will respond within 2–4 hours. You'll receive an SMS update.
                    </p>
                  </div>
                </div>
              )}

              {/* Selected issue reminder */}
              <div style={{ background:`${C}10`, border:`1.5px solid ${C}30`, borderRadius:12,
                padding:"10px 14px", marginBottom:16, display:"flex",
                alignItems:"center", justifyContent:"space-between" }}>
                <span style={{ fontFamily:"var(--font-body)", fontSize:"clamp(13px,1.5vw,15px)",
                  fontWeight:700, color:C }}>{selType?.label}</span>
                <PriorityBadge priority={selType?.priority} />
              </div>

              <ErrBox msg={apiError} />

              <Fld label="Full Name" value={form.name} onChange={f("name")}
                placeholder="Your full name" error={errs.name} />
              <Fld label="Mobile Number" value={form.mobile} onChange={f("mobile")}
                placeholder="10-digit mobile number" type="tel" error={errs.mobile} />
              <Fld label="Consumer / Account Number (optional)" value={form.consumerNo}
                onChange={f("consumerNo")} placeholder="e.g. G001 (from your gas bill)" />
              <Fld label="Describe Your Issue" value={form.desc} onChange={f("desc")}
                placeholder="Please describe your issue in detail — when did it start, what happened…"
                rows={4} error={errs.desc} />

              <Btn onClick={() => { if (validate()) setStep(3); }}>
                Review & Submit →
              </Btn>
            </>
          )}

          {/* ── STEP 3: Review ── */}
          {step === 3 && (
            <>
              <ErrBox msg={apiError} />

              <Card>
                <p style={{ fontFamily:"var(--font-body)", fontSize:11, fontWeight:700,
                  letterSpacing:".08em", textTransform:"uppercase", color:"#94A3B8", marginBottom:12 }}>
                  Review Your Complaint
                </p>
                <RowItem label="Issue Type"   val={selType?.label} />
                <RowItem label="Priority"     val={PRIORITY_COLORS[selType?.priority]?.label}
                  hi hc={PRIORITY_COLORS[selType?.priority]?.c} />
                <RowItem label="Est. Response" val={selType?.eta} />
                <RowItem label="Name"         val={form.name} />
                <RowItem label="Mobile"       val={form.mobile} />
                {form.consumerNo &&
                  <RowItem label="Consumer No." val={form.consumerNo} />}
              </Card>

              <div style={{ background:"white", border:"1.5px solid #E2E8F0", borderRadius:12,
                padding:"clamp(12px,1.5vw,16px)", marginBottom:16 }}>
                <p style={{ fontFamily:"var(--font-body)", fontSize:11, fontWeight:700,
                  letterSpacing:".08em", textTransform:"uppercase", color:"#94A3B8", marginBottom:8 }}>
                  Your Description
                </p>
                <p style={{ fontFamily:"var(--font-body)", fontSize:"clamp(13px,1.5vw,15px)",
                  color:"#374151", lineHeight:1.6 }}>{form.desc}</p>
              </div>

              <Btn onClick={handleSubmit} disabled={loading}>
                {loading ? "Submitting…" : "Confirm & Submit Complaint"}
              </Btn>
              <div style={{ height:10 }} />
              <Btn ghost onClick={() => setStep(2)}>← Edit Details</Btn>
            </>
          )}

          {/* ── STEP 4: Success ── */}
          {step === 4 && result && (
            <div style={{ textAlign:"center" }}>
              <div style={{ width:88, height:88, borderRadius:"50%",
                background:"#DCFCE7", border:"3px solid #86EFAC",
                display:"flex", alignItems:"center", justifyContent:"center",
                margin:"0 auto clamp(16px,2vw,24px)" }}>
                <Ic p="M9 16.17L4.83 12L3.41 13.41L9 19L21 7L19.59 5.59L9 16.17Z" s={44} c="#16A34A" />
              </div>
              <h3 style={{ fontFamily:"var(--font-head)", fontSize:"clamp(20px,2.8vw,30px)",
                fontWeight:800, color:"#0A2342", marginBottom:6 }}>Complaint Registered!</h3>
              <p style={{ fontFamily:"var(--font-body)", fontSize:"clamp(13px,1.4vw,15px)",
                color:"#64748B", marginBottom:24 }}>
                Your complaint has been registered. You'll receive an SMS update on your mobile.
              </p>

              <Card style={{ textAlign:"left" }}>
                <RowItem label="Ticket ID"     val={result.ticketId}  hi hc={C} />
                <RowItem label="Issue Type"    val={selType?.label} />
                <RowItem label="Name"          val={form.name} />
                <RowItem label="Mobile"        val={form.mobile} />
                <RowItem label="Priority"
                  val={PRIORITY_COLORS[result.priority]?.label}
                  hi hc={PRIORITY_COLORS[result.priority]?.c} />
                <RowItem label="Est. Response" val={result.eta} />
                <RowItem label="Status"        val="Registered" hi hc="#D97706" />
                <RowItem label="Date"
                  val={new Date().toLocaleString("en-IN")} />
              </Card>

              <div style={{ background:"#EFF6FF", border:"1.5px solid #BFDBFE", borderRadius:12,
                padding:"12px 16px", marginBottom:16, textAlign:"left" }}>
                <p style={{ fontFamily:"var(--font-body)", fontSize:"clamp(12px,1.3vw,14px)",
                  color:"#1D4ED8", lineHeight:1.6 }}>
                  📋 Save your Ticket ID: <strong>{result.ticketId}</strong><br />
                  You can use it to track your complaint status here or call <strong>1906</strong> for gas helpline.
                </p>
              </div>

              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                <Btn onClick={() => window.print()} color="#16A34A">
                  <Ic p="M19 8H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3zm-3 11H8v-5h8v5zm3-7c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-1-9H6v4h12V3z"
                    s={18} c="white" />
                  Print Receipt
                </Btn>
                <Btn ghost onClick={() => setScreen("home")}>Return to Home</Btn>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}