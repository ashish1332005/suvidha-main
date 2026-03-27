/**
 * flows/municipal/Certificate.jsx
 *
 * Supports 6 certificate types:
 *   birth · death · marriage · trade · building · park
 *
 * FLOW:
 *   Step 1 → Info (desc, fee, time, docs checklist)
 *   Step 2 → Application Form (dynamic fields per cert type)
 *   Step 3 → Review & Confirm
 *   Step 4 → API submit  →  POST /api/services
 *   Step 5 → Success screen + Application No.
 *
 * API: api.submitService({ name, mobile, dept:"municipal", serviceLabel, description })
 *      → { requestId, status }
 *
 * flow.cert = "birth" | "death" | "marriage" | "trade" | "building" | "park"
 */

import { useState } from "react";
import api from "../../api/kioskApi";

// ── Theme ─────────────────────────────────────────────────────────────────────
const C  = "#8B5CF6";  // Municipal purple
const L  = "#F5F3FF";
const BD = "#DDD6FE";

// ── All Certificate Configurations (self-contained) ───────────────────────────
const CERT_CONFIGS = {
  birth: {
    title:   "Birth Certificate",
    titleHi: "जन्म प्रमाण पत्र",
    desc:    "Official birth certificate issued by the Ajmer Municipal Corporation (AMC). Required for school admission, Aadhaar enrollment, passport application, and availing government benefits.",
    fee:     "₹50",
    time:    "7–10 Working Days",
    docs: [
      "Hospital discharge slip or birth record (original)",
      "Parents' Aadhaar Card — both (original + photocopy)",
      "Parents' Marriage Certificate",
      "Latest address proof — utility bill or rent agreement",
    ],
    fields: [
      { k:"childName",  l:"Child's Full Name",          p:"As it should appear on certificate",  t:"text",  req:true  },
      { k:"dob",        l:"Date of Birth",               p:"",                                    t:"date",  req:true  },
      { k:"gender",     l:"Gender",                      p:"Male / Female / Other",               t:"text",  req:true  },
      { k:"birthPlace", l:"Place of Birth",              p:"Hospital name or home address",       t:"text",  req:true  },
      { k:"fatherName", l:"Father's Full Name",          p:"As per Aadhaar",                      t:"text",  req:true  },
      { k:"motherName", l:"Mother's Full Name",          p:"As per Aadhaar",                      t:"text",  req:true  },
      { k:"address",    l:"Permanent Address",           p:"Full address with PIN code",          t:"text",  req:true  },
      { k:"mobile",     l:"Mobile Number",               p:"10-digit mobile for updates",         t:"tel",   req:true  },
    ],
  },

  death: {
    title:   "Death Certificate",
    titleHi: "मृत्यु प्रमाण पत्र",
    desc:    "Official death certificate from AMC. Required for insurance claims, property transfer, bank account closure, and pension. Apply within 21 days to avoid late fee of ₹150.",
    fee:     "₹50 (within 21 days) · ₹200 (after 21 days)",
    time:    "3–5 Working Days",
    docs: [
      "Hospital death record or doctor's death certificate",
      "Deceased's Aadhaar Card (original + photocopy)",
      "Applicant's Aadhaar Card",
      "Relationship proof — ration card or family register",
      "Address proof of the deceased",
    ],
    fields: [
      { k:"deceasedName",  l:"Deceased's Full Name",       p:"As per Aadhaar",                      t:"text",  req:true  },
      { k:"dod",           l:"Date of Death",               p:"",                                    t:"date",  req:true  },
      { k:"gender",        l:"Gender",                      p:"Male / Female",                       t:"text",  req:true  },
      { k:"deathPlace",    l:"Place of Death",              p:"Hospital name or home address",       t:"text",  req:true  },
      { k:"causeOfDeath",  l:"Cause of Death",              p:"As per hospital or doctor record",    t:"text",  req:true  },
      { k:"applicantName", l:"Applicant's Name",            p:"Person applying for certificate",     t:"text",  req:true  },
      { k:"relation",      l:"Relation to Deceased",        p:"Son / Daughter / Spouse / Other",     t:"text",  req:true  },
      { k:"address",       l:"Applicant's Address",         p:"Full residential address with PIN",   t:"text",  req:true  },
      { k:"mobile",        l:"Mobile Number",               p:"10-digit mobile for updates",         t:"tel",   req:true  },
    ],
  },

  marriage: {
    title:   "Marriage Certificate",
    titleHi: "विवाह प्रमाण पत्र",
    desc:    "Official marriage registration under Hindu Marriage Act or Special Marriage Act. Required for name change, joint bank accounts, visa applications, and insurance claims.",
    fee:     "₹100",
    time:    "15–21 Working Days",
    docs: [
      "Bride & Groom Aadhaar Cards (originals + photocopies)",
      "Bride & Groom Passport Photos — 2 each, white background",
      "Age proof — Birth Certificate or 10th Marksheet",
      "Address proof of both parties",
      "Marriage invitation card or wedding photos",
      "2 Witnesses with Aadhaar (must be present in person at AMC)",
    ],
    fields: [
      { k:"groomName",     l:"Groom's Full Name",           p:"As per Aadhaar",                      t:"text",  req:true  },
      { k:"groomDob",      l:"Groom's Date of Birth",       p:"",                                    t:"date",  req:true  },
      { k:"brideName",     l:"Bride's Full Name",           p:"As per Aadhaar",                      t:"text",  req:true  },
      { k:"brideDob",      l:"Bride's Date of Birth",       p:"",                                    t:"date",  req:true  },
      { k:"marriageDate",  l:"Date of Marriage",            p:"",                                    t:"date",  req:true  },
      { k:"marriagePlace", l:"Place of Marriage",           p:"Venue name and address",              t:"text",  req:true  },
      { k:"groomAddress",  l:"Groom's Permanent Address",   p:"Full address with PIN",               t:"text",  req:true  },
      { k:"brideAddress",  l:"Bride's Permanent Address",   p:"Full address with PIN",               t:"text",  req:true  },
      { k:"mobile",        l:"Contact Mobile Number",       p:"10-digit mobile for updates",         t:"tel",   req:true  },
    ],
  },

  trade: {
    title:   "Trade License",
    titleHi: "व्यापार लाइसेंस",
    desc:    "Mandatory municipal trade license to legally operate a business within Ajmer city limits. Renewed annually. Required for GST registration, bank loans, and shop establishment.",
    fee:     "₹500 – ₹5,000 (based on business category)",
    time:    "15–30 Working Days",
    docs: [
      "Owner's Aadhaar Card",
      "Business address proof — rent agreement or ownership deed",
      "Latest property tax receipt for the premises",
      "Passport photo of owner (2 copies)",
      "NOC from building owner (if rented premises)",
      "Partnership deed or company registration (if applicable)",
    ],
    fields: [
      { k:"ownerName",    l:"Business Owner's Name",        p:"As per Aadhaar",                      t:"text",  req:true  },
      { k:"businessName", l:"Name of Business / Shop",      p:"Trade name as on signboard",          t:"text",  req:true  },
      { k:"businessType", l:"Type of Business",             p:"e.g. Grocery, Pharmacy, Garments",    t:"text",  req:true  },
      { k:"shopAddress",  l:"Business / Shop Address",      p:"Complete address with ward and PIN",  t:"text",  req:true  },
      { k:"shopArea",     l:"Shop Area (sq. ft.)",          p:"Approximate built-up area",           t:"text",  req:true  },
      { k:"employees",    l:"Number of Employees",          p:"Including owner",                     t:"text",  req:true  },
      { k:"mobile",       l:"Owner's Mobile Number",        p:"10-digit mobile for updates",         t:"tel",   req:true  },
      { k:"email",        l:"Email Address (optional)",     p:"For digital certificate delivery",    t:"email", req:false },
    ],
  },

  building: {
    title:   "Building Plan Approval",
    titleHi: "बिल्डिंग प्लान अनुमोदन",
    desc:    "Mandatory building plan sanction from AMC before starting any new construction, extension, or major renovation. Required for electricity connection, bank loans, and occupancy certificate.",
    fee:     "₹2,000 – ₹20,000 (based on plot area)",
    time:    "30–60 Working Days",
    docs: [
      "Land ownership document (registered sale deed)",
      "Approved site plan prepared by a licensed architect",
      "Encumbrance certificate (recent — within 6 months)",
      "Property tax receipt (latest)",
      "Owner's Aadhaar Card",
      "NOC from adjacent property owners (if boundary affected)",
    ],
    fields: [
      { k:"ownerName",     l:"Owner's Full Name",              p:"As per land document",              t:"text",  req:true  },
      { k:"plotNo",        l:"Plot / Survey Number",           p:"As per land records",               t:"text",  req:true  },
      { k:"plotAddress",   l:"Plot Location / Address",        p:"Complete address with ward",        t:"text",  req:true  },
      { k:"plotArea",      l:"Total Plot Area (sq. yards)",    p:"As per land document",              t:"text",  req:true  },
      { k:"builtUpArea",   l:"Proposed Built-Up Area (sq. ft.)", p:"Total floor area planned",        t:"text",  req:true  },
      { k:"floors",        l:"Number of Floors",               p:"Including ground floor",            t:"text",  req:true  },
      { k:"purpose",       l:"Purpose of Construction",        p:"Residential / Commercial / Mixed",  t:"text",  req:true  },
      { k:"architectName", l:"Architect's Name & License No.", p:"Licensed architect details",        t:"text",  req:true  },
      { k:"mobile",        l:"Owner's Mobile Number",          p:"10-digit mobile for updates",       t:"tel",   req:true  },
    ],
  },

  park: {
    title:   "Park / Ground Booking",
    titleHi: "पार्क बुकिंग",
    desc:    "Book AMC-managed parks and grounds for weddings, cultural events, private gatherings, or community programs. Booking must be submitted at least 7 working days in advance.",
    fee:     "₹500 – ₹5,000 per day (park and time-slot dependent)",
    time:    "3–5 Working Days (minimum 7 days advance booking required)",
    docs: [
      "Applicant's Aadhaar Card",
      "Event details in writing — type, date, expected attendance",
      "Security deposit (refundable) as prescribed by AMC",
      "NOC from Police for public events with 200+ attendees",
    ],
    fields: [
      { k:"applicantName", l:"Applicant's Full Name",        p:"Person responsible for event",       t:"text",  req:true  },
      { k:"parkName",      l:"Park / Ground Name",           p:"Name of the venue required",         t:"text",  req:true  },
      { k:"eventDate",     l:"Event Date",                   p:"Minimum 7 working days from today",  t:"date",  req:true  },
      { k:"eventEndDate",  l:"End Date (multi-day events)",  p:"Leave blank for single day",         t:"date",  req:false },
      { k:"eventType",     l:"Type of Event",                p:"Wedding / Birthday / Meeting / Other", t:"text", req:true  },
      { k:"attendees",     l:"Expected Attendees",           p:"Approximate headcount",              t:"text",  req:true  },
      { k:"address",       l:"Applicant's Address",          p:"Full residential address",           t:"text",  req:true  },
      { k:"mobile",        l:"Mobile Number",                p:"10-digit mobile for updates",        t:"tel",   req:true  },
    ],
  },
};

// ── Shared UI Primitives (local — no _shared import needed) ──────────────────
function Btn({ children, onClick, disabled, ghost, green }) {
  const bg = green ? "#16A34A" : ghost ? "white" : disabled ? "#E2E8F0" : C;
  return (
    <button onClick={onClick} disabled={disabled} style={{
      width:"100%", minHeight:"clamp(52px,6vw,62px)",
      border: ghost ? `2px solid ${C}` : "none", borderRadius:14,
      background: bg,
      color: ghost ? C : (disabled ? "#94A3B8" : "white"),
      fontFamily:"var(--font-body)", fontSize:"clamp(15px,1.8vw,18px)",
      fontWeight:700, cursor: disabled ? "not-allowed" : "pointer",
      display:"flex", alignItems:"center", justifyContent:"center", gap:8,
      opacity: disabled ? 0.6 : 1, transition:"opacity .2s",
    }}>{children}</button>
  );
}

function Card({ children, style = {} }) {
  return (
    <div style={{
      background:"white", border:"1.5px solid #E2E8F0", borderRadius:16,
      padding:"clamp(16px,2vw,24px)",
      boxShadow:"0 1px 4px rgba(10,35,66,.07)", marginBottom:16, ...style,
    }}>{children}</div>
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
        textAlign:"right", wordBreak:"break-word", maxWidth:"60%",
        fontFamily: hi?"var(--font-head)":"var(--font-body)" }}>{val}</span>
    </div>
  );
}

function Fld({ label, value, onChange, placeholder, type = "text", required = false }) {
  return (
    <div style={{ marginBottom:14 }}>
      <label style={{ display:"block", fontFamily:"var(--font-body)", fontSize:12,
        fontWeight:700, color:"#64748B", marginBottom:7,
        letterSpacing:".06em", textTransform:"uppercase" }}>
        {label}
        {required && <span style={{ color:"#DC2626", marginLeft:3 }}>*</span>}
      </label>
      <input value={value} type={type} onChange={e => onChange(e.target.value)}
        placeholder={placeholder} style={{
          width:"100%", height:"clamp(50px,5.5vw,56px)", padding:"0 16px",
          fontFamily:"var(--font-body)", fontSize:"clamp(14px,1.6vw,16px)",
          color:"#0A2342", background:"#F8FAFC",
          border:"2px solid #E2E8F0", borderRadius:12, outline:"none",
          boxSizing:"border-box",
        }} />
    </div>
  );
}

function ErrBox({ msg }) {
  if (!msg) return null;
  return (
    <div style={{ background:"#FEF2F2", border:"1.5px solid #FECACA", borderRadius:12,
      padding:"12px 16px", color:"#B91C1C", fontSize:"clamp(13px,1.4vw,15px)",
      fontFamily:"var(--font-body)", marginBottom:16, lineHeight:1.5 }}>
      ⚠ {msg}
    </div>
  );
}

function StepBar({ step }) {
  const STEPS = ["Info", "Form", "Review", "Done"];
  return (
    <div style={{ display:"flex", gap:6, padding:"12px clamp(16px,2.5vw,40px)",
      background:"white", borderBottom:"1px solid #E2E8F0", flexShrink:0 }}>
      {STEPS.map((s, i) => (
        <div key={s} style={{ flex:1 }}>
          <div style={{ height:5, borderRadius:3,
            background: i < step ? C : "#E2E8F0", transition:"background .4s" }} />
          <span style={{ display:"block", textAlign:"center", marginTop:4,
            fontSize:10, fontWeight:600, letterSpacing:".05em",
            color: i < step ? C : "#94A3B8", textTransform:"uppercase" }}>{s}</span>
        </div>
      ))}
    </div>
  );
}

// ── Validation ────────────────────────────────────────────────────────────────
function validateForm(fields, form) {
  for (const f of fields) {
    if (!f.req) continue;
    const val = (form[f.k] || "").trim();
    if (!val) return `"${f.l}" is required.`;
    if (f.t === "tel" && !/^[6-9]\d{9}$/.test(val.replace(/\s/g, "")))
      return "Please enter a valid 10-digit mobile number.";
    if (f.t === "date" && isNaN(new Date(val)))
      return `"${f.l}" — please enter a valid date.`;
  }
  return null;
}

// Build description string for API
function buildDescription(fields, form) {
  return fields
    .filter(f => form[f.k])
    .map(f => `${f.l}: ${form[f.k]}`)
    .join(" | ");
}

// Get applicant name from form intelligently
function getApplicantName(fields, form) {
  // Priority: applicantName → ownerName → groomName → childName → deceasedName → first text field
  const priority = ["applicantName", "ownerName", "groomName", "childName", "applicantName"];
  for (const k of priority) {
    if (form[k]) return form[k];
  }
  const firstTextField = fields.find(f => f.t === "text" && form[f.k]);
  return firstTextField ? form[firstTextField.k] : "Applicant";
}

// ── Main Component ────────────────────────────────────────────────────────────
export function MuniCertificate({ t, flow, setScreen }) {
  const certKey = flow?.cert || "birth";
  const cf = CERT_CONFIGS[certKey] || CERT_CONFIGS.birth;

  const [step,    setStep]    = useState(1);
  const [form,    setForm]    = useState({});
  const [result,  setResult]  = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  const setF = (k) => (v) => { setForm(p => ({ ...p, [k]: v })); setError(""); };

  // ── API Submit ──────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    const err = validateForm(cf.fields, form);
    if (err) { setError(err); return; }

    const applicantName = getApplicantName(cf.fields, form);
    const mobile = (form.mobile || "").replace(/\s/g, "");

    setLoading(true); setError("");
    try {
      const r = await api.submitService({
        name:         applicantName.trim(),
        mobile:       mobile,
        dept:         "municipal",
        serviceLabel: cf.title,
        description:  buildDescription(cf.fields, form),
      });
      setResult(r);
      setStep(4);
    } catch (e) {
      setError(e.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleReview = () => {
    const err = validateForm(cf.fields, form);
    if (err) { setError(err); return; }
    setError("");
    setStep(3);
  };

  return (
    <div style={{ flex:1, display:"flex", flexDirection:"column", background:"#F0F4F8" }}>

      {/* ── Header ── */}
      <div style={{ background:"white", borderBottom:`4px solid ${C}`,
        padding:"clamp(14px,1.8vw,20px) clamp(16px,2.5vw,40px)", flexShrink:0 }}>
        <button
          onClick={() => step > 1 && step < 4 ? setStep(s => s - 1) : setScreen("dept")}
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
            {/* Document icon */}
            <svg width={22} height={22} viewBox="0 0 24 24" fill={C}>
              <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2ZM18 20H6V4H13V9H18V20ZM8 15H16V17H8V15ZM8 11H16V13H8V11Z"/>
            </svg>
          </div>
          <div>
            <h2 style={{ fontFamily:"var(--font-head)", fontSize:"clamp(16px,2vw,24px)",
              fontWeight:700, color:"#0A2342", margin:0 }}>{cf.title}</h2>
            <p style={{ fontFamily:"var(--font-body)", fontSize:12,
              color:"#94A3B8", marginTop:3 }}>Municipal Corporation · AMC, Ajmer</p>
          </div>
        </div>
      </div>

      <StepBar step={step} />

      {/* ── Content ── */}
      <div style={{ flex:1, overflowY:"auto" }}>
        <div style={{ maxWidth:760, margin:"0 auto",
          padding:"clamp(20px,2.5vw,32px) clamp(16px,2.5vw,40px) 60px" }}>

          {/* ─────────────────── STEP 1: Info ─────────────────── */}
          {step === 1 && (
            <>
              {/* Description */}
              <Card style={{ background:L, border:`1.5px solid ${BD}`, marginBottom:14 }}>
                <p style={{ fontFamily:"var(--font-body)",
                  fontSize:"clamp(13px,1.4vw,15px)", color:"#374151", lineHeight:1.7 }}>
                  {cf.desc}
                </p>
              </Card>

              {/* Fee + Time */}
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:14 }}>
                {[["Application Fee", cf.fee], ["Processing Time", cf.time]].map(([label, val]) => (
                  <Card key={label} style={{ textAlign:"center", padding:16, marginBottom:0 }}>
                    <p style={{ fontFamily:"var(--font-body)", fontSize:11, fontWeight:700,
                      letterSpacing:".06em", textTransform:"uppercase",
                      color:"#94A3B8", marginBottom:8 }}>{label}</p>
                    <p style={{ fontFamily:"var(--font-head)",
                      fontSize:"clamp(13px,1.7vw,19px)", fontWeight:800,
                      color:C, lineHeight:1.3 }}>{val}</p>
                  </Card>
                ))}
              </div>

              {/* Documents */}
              <Card style={{ marginBottom:16 }}>
                <p style={{ fontFamily:"var(--font-body)", fontSize:11, fontWeight:700,
                  letterSpacing:".08em", textTransform:"uppercase",
                  color:"#94A3B8", marginBottom:16 }}>Documents Required</p>
                {cf.docs.map((doc, i) => (
                  <div key={i} style={{ display:"flex", gap:12, alignItems:"flex-start",
                    marginBottom: i < cf.docs.length - 1 ? 14 : 0 }}>
                    <div style={{ width:26, height:26, borderRadius:"50%",
                      background:L, border:`1.5px solid ${BD}`,
                      display:"flex", alignItems:"center", justifyContent:"center",
                      flexShrink:0, marginTop:1 }}>
                      <span style={{ fontFamily:"var(--font-head)",
                        fontSize:11, fontWeight:800, color:C }}>{i + 1}</span>
                    </div>
                    <span style={{ fontFamily:"var(--font-body)",
                      fontSize:"clamp(13px,1.5vw,15px)", color:"#374151",
                      lineHeight:1.6 }}>{doc}</span>
                  </div>
                ))}
              </Card>

              {/* Important note */}
              <div style={{ background:"#FFFBEB", border:"1.5px solid #FDE68A",
                borderRadius:12, padding:"clamp(12px,1.4vw,16px)", marginBottom:20,
                fontFamily:"var(--font-body)", fontSize:"clamp(12px,1.3vw,14px)",
                color:"#78350F", lineHeight:1.6 }}>
                📌 <strong>Important:</strong> This kiosk submits your application digitally.
                You must bring <strong>original documents</strong> to the AMC office for
                verification when your certificate is ready for collection.
              </div>

              <Btn onClick={() => setStep(2)}>
                I Have All Documents — Fill Application →
              </Btn>
            </>
          )}

          {/* ─────────────────── STEP 2: Form ─────────────────── */}
          {step === 2 && (
            <>
              {/* Cert type badge */}
              <div style={{ background:`${C}0D`, border:`1.5px solid ${C}25`,
                borderRadius:12, padding:"12px 16px", marginBottom:20,
                fontFamily:"var(--font-body)", fontSize:13, color:"#374151",
                display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                <span>Application for: <strong style={{ color:C }}>{cf.title}</strong></span>
                <span style={{ fontSize:11, color:"#94A3B8" }}>
                  <span style={{ color:"#DC2626" }}>*</span> = required
                </span>
              </div>

              <ErrBox msg={error} />

              {cf.fields.map(f => (
                <Fld key={f.k} label={f.l} value={form[f.k] || ""}
                  onChange={setF(f.k)} placeholder={f.p}
                  type={f.t} required={f.req} />
              ))}

              <div style={{ height:8 }} />
              <Btn onClick={handleReview}>Review Application →</Btn>
            </>
          )}

          {/* ─────────────────── STEP 3: Review ─────────────────── */}
          {step === 3 && (
            <>
              <Card style={{ marginBottom:14 }}>
                <p style={{ fontFamily:"var(--font-body)", fontSize:11, fontWeight:700,
                  letterSpacing:".08em", textTransform:"uppercase",
                  color:"#94A3B8", marginBottom:14 }}>Review Your Application</p>
                {cf.fields
                  .filter(f => form[f.k])
                  .map(f => <Row key={f.k} label={f.l} val={form[f.k]} />)
                }
                <Row label="Application Fee" val={cf.fee} hi hc={C} />
                <Row label="Processing Time" val={cf.time} />
              </Card>

              <div style={{ background:"#FFFBEB", border:"1.5px solid #FDE68A",
                borderRadius:12, padding:"clamp(12px,1.4vw,16px)", marginBottom:16,
                fontFamily:"var(--font-body)", fontSize:"clamp(12px,1.3vw,14px)",
                color:"#78350F", lineHeight:1.5 }}>
                ⚠️ Please verify all details. Once submitted, corrections require a new application.
              </div>

              <ErrBox msg={error} />

              <Btn onClick={handleSubmit} disabled={loading}>
                {loading ? "Submitting Application…" : "Confirm & Submit Application"}
              </Btn>
              <div style={{ height:10 }} />
              <Btn ghost onClick={() => setStep(2)}>✎ Edit Details</Btn>
            </>
          )}

          {/* ─────────────────── STEP 4: Success ─────────────────── */}
          {step === 4 && result && (
            <div style={{ textAlign:"center" }}>
              {/* Animated checkmark */}
              <div style={{ width:"clamp(72px,9vw,96px)", height:"clamp(72px,9vw,96px)",
                borderRadius:"50%", background:"#DCFCE7", border:"3px solid #86EFAC",
                display:"flex", alignItems:"center", justifyContent:"center",
                margin:"0 auto clamp(16px,2vw,24px)", animation:"muniPop .5s ease" }}>
                <svg width={42} height={42} viewBox="0 0 24 24" fill="#16A34A">
                  <path d="M9 16.17L4.83 12L3.41 13.41L9 19L21 7L19.59 5.59L9 16.17Z"/>
                </svg>
              </div>

              <h3 style={{ fontFamily:"var(--font-head)",
                fontSize:"clamp(20px,2.8vw,30px)", fontWeight:800,
                color:"#0A2342", marginBottom:6 }}>Application Submitted! 🎉</h3>
              <p style={{ fontFamily:"var(--font-body)", fontSize:"clamp(13px,1.4vw,15px)",
                color:"#64748B", marginBottom:24 }}>
                Your <strong>{cf.title}</strong> application has been received by AMC
              </p>

              {/* Receipt card */}
              <Card style={{ textAlign:"left", marginBottom:12 }}>
                <p style={{ fontFamily:"var(--font-body)", fontSize:11, fontWeight:700,
                  letterSpacing:".08em", textTransform:"uppercase",
                  color:"#94A3B8", marginBottom:14 }}>Application Summary</p>
                <Row label="Application No."  val={result.requestId}                                           hi hc={C} />
                <Row label="Service"          val={cf.title} />
                <Row label="Submitted on"     val={new Date().toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" })} />
                <Row label="Processing Time"  val={cf.time} />
                <Row label="Fee Payable"      val={cf.fee} />
                <Row label="Status"           val={result.status || "Under Review"}                            hi hc="#D97706" />
              </Card>

              {/* Info note */}
              <div style={{ background:"#EFF6FF", border:"1.5px solid #BFDBFE",
                borderRadius:12, padding:"clamp(12px,1.4vw,16px)", marginBottom:20,
                fontFamily:"var(--font-body)", fontSize:"clamp(12px,1.3vw,14px)",
                color:"#1E40AF", lineHeight:1.7, textAlign:"left" }}>
                📋 <strong>Your Application No.:</strong>{" "}
                <strong style={{ fontFamily:"var(--font-head)", color:C }}>
                  {result.requestId}
                </strong>
                <br />
                Please note this number to track your application status at the AMC office.
                <br />
                📱 SMS updates will be sent to your registered mobile number.
              </div>

              {/* Action buttons */}
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                <Btn green onClick={() => window.print()}>
                  🖨 Print Acknowledgement
                </Btn>
                <Btn ghost onClick={() => setScreen("home")}>
                  Return to Home
                </Btn>
              </div>
            </div>
          )}

        </div>
      </div>

      <style>{`
        @keyframes muniPop {
          0%   { transform:scale(.4); opacity:0; }
          70%  { transform:scale(1.1); }
          100% { transform:scale(1); opacity:1; }
        }
      `}</style>
    </div>
  );
}