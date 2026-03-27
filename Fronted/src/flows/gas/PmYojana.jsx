/**
 * flows/gas/PmYojana.jsx
 *
 * Government Schemes — Info + Eligibility + Apply
 *
 * Covers: PM Awas · PM Kisan · Ayushman Bharat · PM Ujjwala
 *
 * FLOW:
 *   list → Select scheme
 *   detail → View tabs (Overview / Eligibility / Documents / Steps)
 *   apply → Register interest form
 *   success → Confirmation
 *
 * API: api.registerSchemeInterest({ name, mobile, scheme, district, village })
 *      → { requestId, status, message }
 *
 * subType: "info_scheme" | "pm_yojana" | "schemes"
 */

import { useState } from "react";
import api from "../../api/kioskApi";

const C_SCHEME = "#7C3AED";  // scheme violet

// ── All Scheme Data ───────────────────────────────────────────────────────────
const SCHEMES = [
  {
    id:        "pm_awas",
    name:      "PM Awas Yojana",
    fullName:  "Pradhan Mantri Awas Yojana (Urban + Gramin)",
    color:     "#7C3AED",
    light:     "#F5F3FF",
    icon:      "M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z",
    tagline:   "Affordable Housing for All",
    benefit:   "₹1.2 – ₹2.5 Lakh subsidy for house construction / renovation",
    ministry:  "Ministry of Housing & Urban Affairs",
    helpline:  "1800-11-3377",
    website:   "pmaymis.gov.in",
    eligibility: [
      "Annual household income below ₹18 Lakh",
      "No pucca house anywhere in India",
      "First-time home buyer — no previous govt housing benefit",
      "Must be an Indian citizen with valid Aadhaar",
    ],
    documents: [
      "Aadhaar Card (all adult family members)",
      "Income Certificate from Tehsildar",
      "Caste Certificate — SC/ST/OBC if applicable",
      "Land or property documents / rental agreement",
      "Bank Passbook (account linked to Aadhaar)",
      "Passport size photographs",
    ],
    steps: [
      "Check eligibility at pmaymis.gov.in or nearest CSC",
      "Collect all required documents",
      "Submit application at CSC or online at pmaymis.gov.in",
      "Application verified by Urban Local Body",
      "Subsidy credited directly to bank account",
    ],
  },
  {
    id:        "pm_kisan",
    name:      "PM Kisan Samman Nidhi",
    fullName:  "Pradhan Mantri Kisan Samman Nidhi",
    color:     "#16A34A",
    light:     "#F0FDF4",
    icon:      "M12 3L2 12h3v9h6v-5h2v5h6v-9h3L12 3z",
    tagline:   "Income Support for Farmers",
    benefit:   "₹6,000/year in 3 installments of ₹2,000 directly to bank",
    ministry:  "Ministry of Agriculture & Farmers' Welfare",
    helpline:  "155261",
    website:   "pmkisan.gov.in",
    eligibility: [
      "Small and marginal farmer with cultivable land",
      "Land holding records in farmer's name (or spouse / minor child)",
      "Aadhaar-linked bank account mandatory",
      "NOT eligible: Government employees, income taxpayers, pensioners above ₹10,000/month",
    ],
    documents: [
      "Aadhaar Card",
      "Land ownership records — Khasra / Khatauni",
      "Bank Passbook (Aadhaar-linked)",
      "Mobile number linked to Aadhaar",
    ],
    steps: [
      "Register at pmkisan.gov.in or nearest CSC",
      "Verify land records through Patwari",
      "Complete mandatory eKYC at CSC or via OTP on pmkisan.gov.in",
      "Installments credited every 4 months (April · August · December)",
    ],
  },
  {
    id:        "ayushman",
    name:      "Ayushman Bharat",
    fullName:  "PM Jan Arogya Yojana (PM-JAY)",
    color:     "#0284C7",
    light:     "#EFF8FF",
    icon:      "M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm7 13H5v-.23c0-.62.28-1.2.76-1.58C7.47 15.82 9.64 15 12 15s4.53.82 6.24 2.19c.48.38.76.97.76 1.58V19z",
    tagline:   "₹5 Lakh Free Health Insurance",
    benefit:   "₹5 Lakh free cashless health coverage per family per year",
    ministry:  "Ministry of Health & Family Welfare",
    helpline:  "14555",
    website:   "pmjay.gov.in",
    eligibility: [
      "Families listed in SECC-2011 (Socio-Economic Caste Census) database",
      "BPL card holders",
      "Check eligibility at pmjay.gov.in or by calling 14555",
    ],
    documents: [
      "Aadhaar Card or any govt ID — Voter ID, Ration Card, PAN",
      "Ration Card",
      "Family details for Ayushman card generation",
    ],
    steps: [
      "Check eligibility at pmjay.gov.in using name / Aadhaar / ration card",
      "Visit nearest Ayushman Bharat empanelled hospital or CSC",
      "Get Ayushman card generated on the spot",
      "Show Ayushman card for cashless treatment at empanelled hospitals",
    ],
  },
  {
    id:        "ujjwala",
    name:      "PM Ujjwala Yojana",
    fullName:  "Pradhan Mantri Ujjwala Yojana 2.0",
    color:     "#F97316",
    light:     "#FFF7ED",
    icon:      "M17.66 11.2c-.23-.3-.51-.56-.77-.82-.67-.6-1.43-1.03-2.07-1.66C13.33 7.26 13 4.85 13.95 3c-.95.23-1.78.75-2.49 1.32-2.59 2.08-3.61 5.75-2.39 8.9.04.1.08.2.08.33 0 .22-.15.42-.35.5-.23.1-.47.04-.66-.12a.58.58 0 01-.14-.17c-1.13-1.43-1.31-3.48-.55-5.12C5.78 10 4.87 12.3 5 14.47c.06.5.12 1 .29 1.5.14.6.41 1.2.71 1.73 1.08 1.73 2.95 2.97 5 3.2 2.2.27 4.52-.17 6.01-1.87 1.58-1.8 2.13-4.31 1.34-6.62l-.04-.1c-.22-.61-.5-1.2-.9-1.71l.25.7z",
    tagline:   "Free LPG Connection for BPL Women",
    benefit:   "Free LPG connection + deposit waiver + first refill subsidy",
    ministry:  "Ministry of Petroleum & Natural Gas",
    helpline:  "1800-233-3555",
    website:   "pmuy.gov.in",
    eligibility: [
      "Woman aged 18 years or above from BPL household",
      "Name in SECC-2011 or beneficiary of SC/ST/PM Awas/AAY/Forest dwellers schemes",
      "No existing LPG connection in the household",
      "Aadhaar-linked bank account",
    ],
    documents: [
      "Aadhaar Card",
      "BPL Card / Ration Card",
      "Bank Passbook (for subsidy transfer)",
      "Address Proof",
      "Passport size photograph",
    ],
    steps: [
      "Visit nearest LPG distributor with all documents",
      "Fill Form KYC-5 at the distributor",
      "Subsidy and deposit waiver applied automatically",
      "Connection activated within 7–10 working days",
    ],
  },
];

const TABS = ["overview", "eligibility", "documents", "steps"];

// ── Shared UI ─────────────────────────────────────────────────────────────────
function Btn({ children, onClick, ghost, disabled, color = C_SCHEME, small }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      width:"100%", minHeight: small ? 42 : "clamp(52px,6vw,62px)",
      border: ghost ? `2px solid ${color}` : "none", borderRadius:14,
      background: ghost ? "white" : disabled ? "#E2E8F0" : color,
      color: ghost ? color : disabled ? "#94A3B8" : "white",
      fontFamily:"var(--font-body)", fontSize: small ? "clamp(12px,1.4vw,14px)" : "clamp(15px,1.8vw,18px)",
      fontWeight:700, cursor: disabled ? "not-allowed" : "pointer",
      display:"flex", alignItems:"center", justifyContent:"center", gap:8,
      opacity: disabled ? 0.6 : 1,
    }}>{children}</button>
  );
}

function Fld({ label, value, onChange, placeholder, type = "text", error, required }) {
  return (
    <div style={{ marginBottom:14 }}>
      <label style={{ display:"block", fontFamily:"var(--font-body)", fontSize:12,
        fontWeight:700, color: error ? "#B91C1C" : "#64748B", marginBottom:7,
        letterSpacing:".06em", textTransform:"uppercase" }}>
        {label}{required && <span style={{ color:"#DC2626", marginLeft:3 }}>*</span>}
      </label>
      <input value={value} type={type} onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{ width:"100%", height:"clamp(50px,5.5vw,56px)", padding:"0 16px",
          fontFamily:"var(--font-body)", fontSize:"clamp(14px,1.6vw,16px)",
          color:"#0A2342", background:"#F8FAFC",
          border:`2px solid ${error ? "#FECACA" : "#E2E8F0"}`,
          borderRadius:12, outline:"none", boxSizing:"border-box" }} />
      {error && <p style={{ color:"#B91C1C", fontSize:12, marginTop:4 }}>{error}</p>}
    </div>
  );
}

function ErrBox({ msg }) {
  if (!msg) return null;
  return (
    <div style={{ background:"#FEF2F2", border:"1.5px solid #FECACA", borderRadius:12,
      padding:"12px 16px", color:"#B91C1C", fontSize:14,
      fontFamily:"var(--font-body)", marginBottom:16, lineHeight:1.5 }}>
      ⚠ {msg}
    </div>
  );
}

function Ic({ p, s = 20, c = "currentColor" }) {
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill={c} style={{ flexShrink:0 }}>
      <path d={p} />
    </svg>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export function PmYojana({ t, setScreen }) {
  const [sel,      setSel]      = useState(null);
  const [view,     setView]     = useState("list"); // list | detail | apply | success
  const [tab,      setTab]      = useState("overview");
  const [form,     setForm]     = useState({ name:"", mobile:"", district:"", village:"" });
  const [errs,     setErrs]     = useState({});
  const [apiError, setApiError] = useState("");
  const [loading,  setLoading]  = useState(false);
  const [result,   setResult]   = useState(null);

  const f = (k) => (v) => { setForm(p => ({ ...p, [k]: v })); setErrs(e => ({ ...e, [k]:"" })); setApiError(""); };

  const validate = () => {
    const e = {};
    if (!form.name.trim() || form.name.trim().length < 2)
      e.name = "Enter your full name";
    if (!/^[6-9]\d{9}$/.test(form.mobile.replace(/\s/g,"")))
      e.mobile = "Enter a valid 10-digit mobile number";
    if (!form.district.trim())
      e.district = "Enter your district";
    setErrs(e);
    return Object.keys(e).length === 0;
  };

  // ── Use correct API: api.registerSchemeInterest ──
  const handleApply = async () => {
    if (!validate()) return;
    setLoading(true); setApiError("");
    try {
      const res = await api.registerSchemeInterest({
        name:     form.name.trim(),
        mobile:   form.mobile.replace(/\s/g,""),
        scheme:   sel.name,
        district: form.district.trim(),
        village:  form.village.trim() || undefined,
      });
      setResult(res);
      setView("success");
    } catch (e) {
      setApiError(e.message || "Something went wrong. Please try again.");
    } finally { setLoading(false); }
  };

  const goBack = () => {
    if (view === "list")    setScreen("home");
    else if (view === "apply") setView("detail");
    else { setView("list"); setSel(null); setTab("overview"); }
  };

  const title = view === "list"    ? "Government Schemes"
              : view === "apply"   ? `Apply — ${sel?.name}`
              : view === "success" ? "Interest Registered"
              : sel?.name;

  return (
    <div style={{ flex:1, display:"flex", flexDirection:"column", background:"#F0F4F8" }}>

      {/* Header */}
      <div style={{ background:"white", borderBottom:`4px solid ${C_SCHEME}`,
        padding:"clamp(14px,1.8vw,20px) clamp(16px,2.5vw,40px)", flexShrink:0 }}>
        <button onClick={goBack}
          style={{ background:"none", border:"none", cursor:"pointer",
            display:"flex", alignItems:"center", gap:6, color:"#64748B",
            fontFamily:"var(--font-body)", fontSize:"clamp(13px,1.4vw,15px)",
            fontWeight:600, marginBottom:12, padding:"4px 0" }}>
          <Ic p="M20 11H7.83L13.42 5.41L12 4L4 12L12 20L13.41 18.59L7.83 13H20V11Z" s={16} c="#64748B" />
          {t?.back || "Back"}
        </button>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          {sel && view !== "list" && (
            <div style={{ width:46, height:46, borderRadius:12, background:sel.light,
              border:`1.5px solid ${sel.color}30`, display:"flex", alignItems:"center",
              justifyContent:"center", flexShrink:0 }}>
              <Ic p={sel.icon} s={22} c={sel.color} />
            </div>
          )}
          <h2 style={{ fontFamily:"var(--font-head)", fontSize:"clamp(16px,2vw,24px)",
            fontWeight:700, color:"#0A2342", margin:0 }}>{title}</h2>
        </div>
      </div>

      <div style={{ flex:1, overflowY:"auto" }}>
        <div style={{ maxWidth:780, margin:"0 auto",
          padding:"clamp(20px,2.5vw,32px) clamp(16px,2.5vw,40px) 60px" }}>

          {/* ─────────────────── LIST ─────────────────── */}
          {view === "list" && (
            <>
              <p style={{ fontFamily:"var(--font-body)", fontSize:"clamp(13px,1.4vw,15px)",
                color:"#64748B", marginBottom:20, lineHeight:1.6 }}>
                Select a scheme to view eligibility, required documents, and register your interest.
              </p>
              <div style={{ display:"grid", gap:14 }}>
                {SCHEMES.map(sc => (
                  <button key={sc.id}
                    onClick={() => { setSel(sc); setView("detail"); setTab("overview"); }}
                    style={{ display:"flex", gap:16, alignItems:"flex-start",
                      padding:"clamp(16px,2vw,22px)",
                      border:"1.5px solid #E2E8F0", borderLeft:`5px solid ${sc.color}`,
                      borderRadius:16, background:"white", cursor:"pointer", textAlign:"left",
                      boxShadow:"0 1px 4px rgba(10,35,66,.06)",
                      transition:"box-shadow .15s, border-color .15s" }}>
                    <div style={{ width:54, height:54, borderRadius:14, background:sc.light,
                      border:`1.5px solid ${sc.color}30`,
                      display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                      <Ic p={sc.icon} s={26} c={sc.color} />
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ display:"flex", alignItems:"center",
                        justifyContent:"space-between", gap:8, marginBottom:4 }}>
                        <span style={{ fontFamily:"var(--font-head)",
                          fontSize:"clamp(15px,1.8vw,19px)", fontWeight:700, color:"#0A2342" }}>
                          {sc.name}
                        </span>
                        <Ic p="M10 6L8.59 7.41L13.17 12L8.59 16.59L10 18L16 12L10 6Z" s={18} c="#94A3B8" />
                      </div>
                      <p style={{ fontFamily:"var(--font-body)",
                        fontSize:"clamp(12px,1.3vw,14px)", color:"#64748B",
                        marginBottom:8, lineHeight:1.4 }}>{sc.tagline}</p>
                      <div style={{ background:sc.light, border:`1px solid ${sc.color}25`,
                        borderRadius:8, padding:"5px 10px", display:"inline-block" }}>
                        <span style={{ fontFamily:"var(--font-body)",
                          fontSize:"clamp(11px,1.3vw,14px)", fontWeight:700, color:sc.color }}>
                          {sc.benefit}
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}

          {/* ─────────────────── DETAIL ─────────────────── */}
          {view === "detail" && sel && (
            <>
              {/* Scheme banner */}
              <div style={{ background:sel.light, border:`2px solid ${sel.color}25`,
                borderRadius:16, padding:"clamp(18px,2.2vw,28px)", marginBottom:20,
                display:"flex", gap:16, alignItems:"flex-start" }}>
                <div style={{ width:68, height:68, borderRadius:16, background:"white",
                  border:`2px solid ${sel.color}25`,
                  display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                  <Ic p={sel.icon} s={34} c={sel.color} />
                </div>
                <div>
                  <p style={{ fontFamily:"var(--font-body)", fontSize:11, fontWeight:700,
                    color:sel.color, letterSpacing:".08em", textTransform:"uppercase", marginBottom:4 }}>
                    {sel.ministry}
                  </p>
                  <h3 style={{ fontFamily:"var(--font-head)", fontSize:"clamp(15px,2vw,22px)",
                    fontWeight:800, color:"#0A2342", marginBottom:8 }}>{sel.fullName}</h3>
                  <p style={{ fontFamily:"var(--font-body)", fontSize:"clamp(13px,1.5vw,16px)",
                    color:"#374151", fontWeight:600, marginBottom:6 }}>{sel.benefit}</p>
                  <div style={{ display:"flex", gap:12, flexWrap:"wrap" }}>
                    <span style={{ fontFamily:"var(--font-body)", fontSize:"clamp(11px,1.2vw,13px)",
                      color:"#64748B" }}>
                      🌐 {sel.website}
                    </span>
                    <span style={{ fontFamily:"var(--font-body)", fontSize:"clamp(11px,1.2vw,13px)",
                      color:"#64748B" }}>
                      📞 Helpline: <strong>{sel.helpline}</strong>
                    </span>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div style={{ display:"flex", gap:4, background:"#F1F5F9", borderRadius:12,
                padding:4, marginBottom:20 }}>
                {TABS.map(tb => (
                  <button key={tb} onClick={() => setTab(tb)} style={{
                    flex:1, padding:"clamp(8px,1vw,11px) 4px",
                    background: tab === tb ? "white" : "transparent",
                    border:"none", borderRadius:9,
                    fontFamily:"var(--font-body)", fontSize:"clamp(11px,1.2vw,13px)",
                    fontWeight: tab === tb ? 700 : 500,
                    color: tab === tb ? sel.color : "#64748B",
                    cursor:"pointer", textTransform:"capitalize",
                    boxShadow: tab === tb ? "0 1px 4px rgba(0,0,0,.1)" : "none",
                    transition:"all .15s",
                  }}>{tb}</button>
                ))}
              </div>

              {/* Tab content */}
              <div style={{ background:"white", border:"1.5px solid #E2E8F0",
                borderRadius:16, padding:"clamp(16px,2vw,24px)", marginBottom:16 }}>

                {tab === "overview" && (
                  <p style={{ fontFamily:"var(--font-body)",
                    fontSize:"clamp(14px,1.6vw,16px)", color:"#374151", lineHeight:1.8 }}>
                    <strong>{sel.fullName}</strong> is a flagship scheme by the Government of India.
                    It provides <strong>{sel.benefit}</strong>.
                    Managed by the <em>{sel.ministry}</em>.
                    <br/><br/>
                    For queries, call the dedicated helpline:{" "}
                    <strong style={{ color:sel.color }}>{sel.helpline}</strong> (toll-free · 24×7).
                    Or visit the official website: <strong style={{ color:sel.color }}>{sel.website}</strong>
                  </p>
                )}

                {tab === "eligibility" && (
                  <>
                    <p style={{ fontFamily:"var(--font-body)", fontSize:11, fontWeight:700,
                      letterSpacing:".08em", textTransform:"uppercase",
                      color:"#94A3B8", marginBottom:16 }}>Eligibility Criteria</p>
                    {sel.eligibility.map((item, i) => (
                      <div key={i} style={{ display:"flex", gap:12, alignItems:"flex-start",
                        marginBottom: i < sel.eligibility.length-1 ? 14 : 0 }}>
                        <div style={{ width:28, height:28, borderRadius:"50%",
                          background:`${sel.color}18`, border:`1.5px solid ${sel.color}40`,
                          display:"flex", alignItems:"center", justifyContent:"center",
                          flexShrink:0, marginTop:1 }}>
                          <Ic p="M9 16.17L4.83 12L3.41 13.41L9 19L21 7L19.59 5.59L9 16.17Z"
                            s={14} c={sel.color} />
                        </div>
                        <span style={{ fontFamily:"var(--font-body)",
                          fontSize:"clamp(13px,1.5vw,15px)", color:"#374151", lineHeight:1.6 }}>
                          {item}
                        </span>
                      </div>
                    ))}
                  </>
                )}

                {tab === "documents" && (
                  <>
                    <p style={{ fontFamily:"var(--font-body)", fontSize:11, fontWeight:700,
                      letterSpacing:".08em", textTransform:"uppercase",
                      color:"#94A3B8", marginBottom:16 }}>Required Documents</p>
                    {sel.documents.map((doc, i) => (
                      <div key={i} style={{ display:"flex", gap:12, alignItems:"flex-start",
                        marginBottom: i < sel.documents.length-1 ? 12 : 0 }}>
                        <div style={{ width:28, height:28, borderRadius:8,
                          background:`${sel.color}18`,
                          display:"flex", alignItems:"center", justifyContent:"center",
                          flexShrink:0, marginTop:1 }}>
                          <Ic p="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm4 18H6V4h7v5h5v11z"
                            s={14} c={sel.color} />
                        </div>
                        <span style={{ fontFamily:"var(--font-body)",
                          fontSize:"clamp(13px,1.5vw,15px)", color:"#374151", lineHeight:1.6 }}>
                          {doc}
                        </span>
                      </div>
                    ))}
                  </>
                )}

                {tab === "steps" && (
                  <>
                    <p style={{ fontFamily:"var(--font-body)", fontSize:11, fontWeight:700,
                      letterSpacing:".08em", textTransform:"uppercase",
                      color:"#94A3B8", marginBottom:16 }}>How to Apply</p>
                    {sel.steps.map((step, i) => (
                      <div key={i} style={{ display:"flex", gap:14, alignItems:"flex-start",
                        marginBottom: i < sel.steps.length-1 ? 18 : 0 }}>
                        <div style={{ width:34, height:34, borderRadius:"50%",
                          background:sel.color, display:"flex",
                          alignItems:"center", justifyContent:"center", flexShrink:0, marginTop:1 }}>
                          <span style={{ fontFamily:"var(--font-head)", fontSize:14,
                            fontWeight:800, color:"white" }}>{i+1}</span>
                        </div>
                        <span style={{ fontFamily:"var(--font-body)",
                          fontSize:"clamp(13px,1.5vw,15px)", color:"#374151",
                          lineHeight:1.6, paddingTop:6 }}>{step}</span>
                      </div>
                    ))}
                  </>
                )}
              </div>

              {/* Action buttons */}
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                <Btn color={sel.color} onClick={() => { setForm({ name:"", mobile:"", district:"", village:"" }); setView("apply"); }}>
                  Register Interest →
                </Btn>
                <a href={`tel:${sel.helpline}`} style={{ textDecoration:"none" }}>
                  <Btn ghost color={sel.color}>
                    📞 Call {sel.helpline}
                  </Btn>
                </a>
              </div>
            </>
          )}

          {/* ─────────────────── APPLY ─────────────────── */}
          {view === "apply" && sel && (
            <>
              {/* Scheme reminder */}
              <div style={{ background:sel.light, border:`1.5px solid ${sel.color}30`,
                borderRadius:12, padding:"12px 16px", marginBottom:20,
                display:"flex", alignItems:"center", gap:12 }}>
                <Ic p={sel.icon} s={22} c={sel.color} />
                <div>
                  <div style={{ fontFamily:"var(--font-body)", fontSize:13,
                    fontWeight:700, color:sel.color }}>{sel.name}</div>
                  <div style={{ fontFamily:"var(--font-body)", fontSize:12,
                    color:"#64748B", marginTop:2 }}>{sel.benefit}</div>
                </div>
              </div>

              <div style={{ background:"#FFFBEB", border:"1.5px solid #FDE68A",
                borderRadius:12, padding:"clamp(12px,1.4vw,16px)", marginBottom:20,
                fontFamily:"var(--font-body)", fontSize:"clamp(12px,1.3vw,14px)",
                color:"#92400E", lineHeight:1.6 }}>
                ℹ️ This registers your interest with the scheme team. A government representative
                will contact you with detailed guidance. For immediate help call{" "}
                <strong>{sel.helpline}</strong>.
              </div>

              <ErrBox msg={apiError} />

              <Fld label="Full Name" value={form.name} onChange={f("name")}
                placeholder="As per Aadhaar Card" error={errs.name} required />
              <Fld label="Mobile Number" value={form.mobile} onChange={f("mobile")}
                placeholder="10-digit mobile number" type="tel" error={errs.mobile} required />
              <Fld label="District" value={form.district} onChange={f("district")}
                placeholder="e.g. Ajmer" error={errs.district} required />
              <Fld label="Village / Ward / Area (optional)" value={form.village}
                onChange={f("village")} placeholder="e.g. Pushkar Road, Ward 12" />

              <div style={{ height:4 }} />
              <Btn color={sel.color} onClick={handleApply} disabled={loading}>
                {loading ? "Registering…" : "Register My Interest →"}
              </Btn>
              <div style={{ height:10 }} />
              <Btn ghost color={sel.color} onClick={() => setView("detail")}>
                ← Back to Scheme Details
              </Btn>
            </>
          )}

          {/* ─────────────────── SUCCESS ─────────────────── */}
          {view === "success" && result && sel && (
            <div style={{ textAlign:"center" }}>
              <div style={{ width:"clamp(72px,9vw,96px)", height:"clamp(72px,9vw,96px)",
                borderRadius:"50%", background:"#DCFCE7", border:"3px solid #86EFAC",
                display:"flex", alignItems:"center", justifyContent:"center",
                margin:"0 auto clamp(16px,2vw,24px)", animation:"pmYojanaPop .5s ease" }}>
                <svg width={44} height={44} viewBox="0 0 24 24" fill="#16A34A">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                </svg>
              </div>

              <h3 style={{ fontFamily:"var(--font-head)",
                fontSize:"clamp(20px,2.8vw,30px)", fontWeight:800, color:"#0A2342", marginBottom:6 }}>
                Interest Registered! 🎉
              </h3>
              <p style={{ fontFamily:"var(--font-body)", fontSize:"clamp(13px,1.4vw,15px)",
                color:"#64748B", marginBottom:24 }}>
                {result.message || "A representative will contact you with application guidance."}
              </p>

              {/* Receipt card */}
              <div style={{ background:"white", border:"1.5px solid #E2E8F0", borderRadius:16,
                padding:"clamp(16px,2vw,24px)", marginBottom:16, textAlign:"left" }}>
                <p style={{ fontFamily:"var(--font-body)", fontSize:11, fontWeight:700,
                  letterSpacing:".08em", textTransform:"uppercase",
                  color:"#94A3B8", marginBottom:14 }}>Confirmation Details</p>
                {[
                  ["Request ID",  result.requestId,                     C_SCHEME],
                  ["Scheme",      sel.name,                             null],
                  ["Name",        form.name,                            null],
                  ["Mobile",      form.mobile,                          null],
                  ["District",    form.district,                        null],
                  ["Status",      result.status || "Submitted",         "#D97706"],
                  ["Callback By", "Within 2 working days",              null],
                  ["Helpline",    sel.helpline,                         null],
                ].map(([l, v, hc]) => (
                  <div key={l} style={{ display:"flex", justifyContent:"space-between",
                    padding:"clamp(9px,1.1vw,12px) 0",
                    borderBottom:"1px solid #F1F5F9", gap:12 }}>
                    <span style={{ fontSize:"clamp(13px,1.4vw,15px)", color:"#64748B",
                      fontWeight:500, flexShrink:0 }}>{l}</span>
                    <span style={{ fontSize:"clamp(13px,1.4vw,15px)", fontWeight: hc ? 700 : 500,
                      color: hc || "#0A2342", textAlign:"right",
                      fontFamily: hc ? "var(--font-head)" : "var(--font-body)",
                      wordBreak:"break-word" }}>{v}</span>
                  </div>
                ))}
              </div>

              {/* Info note */}
              <div style={{ background:sel.light, border:`1.5px solid ${sel.color}25`,
                borderRadius:12, padding:"clamp(12px,1.4vw,16px)", marginBottom:20,
                fontFamily:"var(--font-body)", fontSize:"clamp(12px,1.3vw,14px)",
                color:"#374151", lineHeight:1.7, textAlign:"left" }}>
                📋 <strong>Request ID:</strong>{" "}
                <strong style={{ fontFamily:"var(--font-head)", color:sel.color }}>{result.requestId}</strong>
                <br/>
                Keep this for follow-up. For immediate scheme guidance call{" "}
                <strong>{sel.helpline}</strong> (toll-free · 24×7).
              </div>

              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                <Btn color="#16A34A" onClick={() => window.print()}>🖨 Print</Btn>
                <Btn ghost color={C_SCHEME} onClick={() => { setView("list"); setSel(null); }}>
                  View More Schemes
                </Btn>
              </div>
              <div style={{ height:10 }} />
              <Btn ghost color="#64748B" onClick={() => setScreen("home")}>Return to Home</Btn>
            </div>
          )}

        </div>
      </div>
      <style>{`@keyframes pmYojanaPop{0%{transform:scale(.4);opacity:0}70%{transform:scale(1.1)}100%{transform:scale(1);opacity:1}}`}</style>
    </div>
  );
}