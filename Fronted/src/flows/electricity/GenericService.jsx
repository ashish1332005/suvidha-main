/**
 * flows/electricity/GenericService.jsx
 *
 * ✅ Production-grade Government Kiosk UI (no emojis)
 * ✅ Handles multiple ELECTRICITY service subTypes via flow.subType
 * ✅ Step 1 → Form → Step 2 → Review → API → Step 3 → Success
 * ✅ Real API: api.submitService({ name, mobile, dept:"electricity", serviceLabel, description })
 * ✅ Optional: api.applyConnection(...) style can be added later (kept simple for electricity)
 *
 * Supported electricity subTypes (example mapping):
 *   elec_theft       — Power Theft / Unauthorized Use
 *   elec_load        — Load Enhancement / Reduction
 *   elec_namechange  — Name Change / Ownership Transfer
 *   default          — Generic Electricity Request
 *
 * NOTE:
 * - This file replaces your current ElecGeneric/GenericService implementation.
 * - Import/export names stay compatible with your App router:
 *     export const ElecGeneric = (p) => <GenericService {...p} dept="electricity" />;
 */

import { useMemo, useState } from "react";
import api from "../../api/kioskApi";

// ── Theme ─────────────────────────────────────────────────────────────────────
const C = "#0EA5E9"; // Electricity blue
const L = "#E0F2FE";
const BD = "#BAE6FD";

const FONT_BODY = "var(--font-body, 'DM Sans','Noto Sans Devanagari','Segoe UI',system-ui,sans-serif)";
const FONT_HEAD = "var(--font-head, 'DM Sans','Noto Sans Devanagari','Segoe UI',system-ui,sans-serif)";
const FONT_MONO = "var(--font-mono, 'DM Mono','Courier New',monospace)";

// ── No-emoji SVG paths ───────────────────────────────────────────────────────
const PATH = {
  back: "M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z",
  bolt:
    "M11 21h-1l1-7H7.5c-.83 0-1.3-.95-.8-1.62L13 3h1l-1 7h3.5c.83 0 1.3.95.8 1.62L11 21z",
  check: "M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z",
  warn: "M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z",
  doc:
    "M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm1 7V3.5L18.5 9H15z",
  print:
    "M19 8H5c-1.66 0-3 1.34-3 3v4h4v4h12v-4h4v-4c0-1.66-1.34-3-3-3zm-3 11H8v-5h8v5zm3-7H5v-1c0-.55.45-1 1-1h12c.55 0 1 .45 1 1v1zM17 3H7v4h10V3z",
  home: "M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z",
  phone:
    "M6.62 10.79C8.06 13.62 10.38 15.93 13.21 17.38L15.41 15.18C15.68 14.91 16.08 14.82 16.43 14.94C17.55 15.31 18.76 15.51 20 15.51C20.55 15.51 21 15.96 21 16.51V20C21 20.55 20.55 21 20 21C10.61 21 3 13.39 3 4C3 3.45 3.45 3 4 3H7.5C8.05 3 8.5 3.45 8.5 4C8.5 5.25 8.7 6.45 9.07 7.57C9.18 7.92 9.1 8.31 8.82 8.59L6.62 10.79Z",
};

// ── Service configs (Electricity) ─────────────────────────────────────────────
// You can edit copy + fields easily here.
const SERVICE_CONFIGS = {
  elec_theft: {
    title: "Power Theft / Unauthorized Use",
    titleHi: "बिजली चोरी / अनधिकृत उपयोग",
    desc:
      "Report suspected power theft, illegal connections, meter bypass, or unauthorized load use. Your identity can be kept confidential as per policy.",
    fee: "Free",
    time: "7–15 Working Days",
    eta: "Inspection: 3–7 days",
    docs: ["Nearest pole number (if visible)", "Address landmark / street details", "Any photo evidence (optional)"],
    fields: [
      { k: "name", l: "Your Full Name", p: "Full name", t: "text", req: true },
      { k: "mobile", l: "Mobile Number", p: "10-digit mobile number", t: "tel", req: true },
      { k: "area", l: "Location / Area", p: "Street, ward, landmark", t: "text", req: true },
      { k: "landmark", l: "Landmark (optional)", p: "Near school / temple / shop", t: "text", req: false },
      { k: "details", l: "Details", p: "Describe what you observed…", t: "textarea", req: true },
    ],
  },

  elec_load: {
    title: "Load Enhancement / Reduction",
    titleHi: "लोड बढ़ाना / घटाना",
    desc:
      "Apply for sanctioned load change for your electricity connection. A technical feasibility check may be required before approval.",
    fee: "₹100 – ₹500 (varies)",
    time: "10–20 Working Days",
    eta: "Feasibility check: 5–7 days",
    docs: ["Latest electricity bill", "Aadhaar / ID proof", "Wiring test report (if asked)"],
    fields: [
      { k: "name", l: "Consumer Name", p: "As per bill", t: "text", req: true },
      { k: "mobile", l: "Mobile Number", p: "10-digit mobile number", t: "tel", req: true },
      { k: "kno", l: "K. No. / Consumer No.", p: "From electricity bill", t: "text", req: true },
      { k: "currentLoad", l: "Current Load (kW)", p: "e.g. 2", t: "text", req: false },
      { k: "requestedLoad", l: "Requested Load (kW)", p: "e.g. 5", t: "text", req: true },
      { k: "reason", l: "Reason", p: "New appliance / business / other…", t: "textarea", req: false },
    ],
  },

  elec_namechange: {
    title: "Name Change / Ownership Transfer",
    titleHi: "नाम परिवर्तन / स्वामित्व ट्रांसफर",
    desc:
      "Apply for name change / transfer of electricity connection due to property sale, inheritance, or correction in consumer name.",
    fee: "₹100 – ₹300 (admin charges)",
    time: "10–15 Working Days",
    eta: "Document verification: 3–5 days",
    docs: ["Latest bill", "Aadhaar of new owner", "Sale deed / rent agreement / NOC (as applicable)"],
    fields: [
      { k: "name", l: "Applicant Name", p: "Person applying", t: "text", req: true },
      { k: "mobile", l: "Mobile Number", p: "10-digit mobile number", t: "tel", req: true },
      { k: "kno", l: "K. No. / Consumer No.", p: "From electricity bill", t: "text", req: true },
      { k: "newName", l: "New Name (as per ID)", p: "New consumer name", t: "text", req: true },
      { k: "reason", l: "Reason", p: "Sale / Inheritance / Correction", t: "text", req: true },
      { k: "address", l: "Service Address", p: "Connection address", t: "textarea", req: false },
    ],
  },

  default: {
    title: "Electricity Service Request",
    titleHi: "बिजली सेवा अनुरोध",
    desc: "Submit an electricity service request. Our team will review and contact you if needed.",
    fee: "Varies by service",
    time: "3–7 Working Days",
    eta: "Response within 3 working days",
    docs: ["Aadhaar Card", "Latest electricity bill (if applicable)"],
    fields: [
      { k: "name", l: "Your Full Name", p: "Full name", t: "text", req: true },
      { k: "mobile", l: "Mobile Number", p: "10-digit mobile", t: "tel", req: true },
      { k: "details", l: "Details / Request", p: "Describe your request in detail…", t: "textarea", req: true },
    ],
  },
};

// ── UI helpers ────────────────────────────────────────────────────────────────
function Icon({ d, size = 18, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} aria-hidden="true" style={{ flexShrink: 0, display: "block" }}>
      <path d={d} />
    </svg>
  );
}

function Card({ children, style = {} }) {
  return (
    <div
      style={{
        background: "white",
        border: "1.5px solid #E2E8F0",
        borderRadius: 16,
        padding: "clamp(16px,2vw,24px)",
        boxShadow: "0 1px 6px rgba(10,35,66,.06)",
        marginBottom: 16,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function StepBar({ step }) {
  const STEPS = ["Form", "Review", "Done"];
  return (
    <div style={{ display: "flex", gap: 6, padding: "12px clamp(16px,2.5vw,40px)", background: "white", borderBottom: "1px solid #E2E8F0" }}>
      {STEPS.map((s, i) => (
        <div key={s} style={{ flex: 1 }}>
          <div style={{ height: 5, borderRadius: 3, background: i < step ? C : "#E2E8F0" }} />
          <span
            style={{
              display: "block",
              textAlign: "center",
              marginTop: 4,
              fontSize: 10,
              fontWeight: 900,
              letterSpacing: ".08em",
              color: i < step ? C : "#94A3B8",
              textTransform: "uppercase",
              fontFamily: FONT_BODY,
            }}
          >
            {s}
          </span>
        </div>
      ))}
    </div>
  );
}

function ErrBox({ msg }) {
  if (!msg) return null;
  return (
    <div
      style={{
        background: "#FEF2F2",
        border: "1.5px solid #FECACA",
        borderRadius: 12,
        padding: "12px 16px",
        color: "#B91C1C",
        fontSize: "clamp(13px,1.4vw,15px)",
        fontFamily: FONT_BODY,
        marginBottom: 16,
        display: "flex",
        gap: 10,
        alignItems: "flex-start",
      }}
    >
      <Icon d={PATH.warn} size={18} color="#B91C1C" />
      <span style={{ fontWeight: 800, lineHeight: 1.5 }}>{msg}</span>
    </div>
  );
}

function Fld({ label, value, onChange, placeholder, type = "text", required = false, error }) {
  const isTextarea = type === "textarea";
  const base = {
    width: "100%",
    fontFamily: FONT_BODY,
    fontSize: "clamp(14px,1.6vw,16px)",
    color: "#0A2342",
    background: "#F8FAFC",
    border: `2px solid ${error ? "#FECACA" : "#E2E8F0"}`,
    borderRadius: 12,
    outline: "none",
    boxSizing: "border-box",
  };

  return (
    <div style={{ marginBottom: 14 }}>
      <label
        style={{
          display: "block",
          fontFamily: FONT_BODY,
          fontSize: 12,
          fontWeight: 900,
          color: error ? "#B91C1C" : "#64748B",
          marginBottom: 7,
          letterSpacing: ".10em",
          textTransform: "uppercase",
        }}
      >
        {label}
        {required && <span style={{ color: "#DC2626", marginLeft: 4 }}>*</span>}
      </label>

      {isTextarea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={4}
          style={{ ...base, padding: "14px 16px", resize: "vertical", lineHeight: 1.6, minHeight: 96 }}
        />
      ) : (
        <input
          value={value}
          type={type}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          style={{ ...base, height: "clamp(50px,5.5vw,56px)", padding: "0 16px" }}
        />
      )}

      {error ? <p style={{ color: "#B91C1C", fontSize: 12, marginTop: 6, fontFamily: FONT_BODY, fontWeight: 800 }}>{error}</p> : null}
    </div>
  );
}

function Row({ label, val, strong, accent }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "11px 0", borderBottom: "1px solid #F1F5F9", gap: 12 }}>
      <span style={{ fontSize: "clamp(13px,1.4vw,15px)", color: "#64748B", fontWeight: 800, flexShrink: 0, minWidth: "35%", fontFamily: FONT_BODY }}>
        {label}
      </span>
      <span
        style={{
          fontSize: "clamp(13px,1.4vw,15px)",
          fontWeight: strong ? 900 : 800,
          color: accent || "#0A2342",
          textAlign: "right",
          wordBreak: "break-word",
          fontFamily: strong ? FONT_HEAD : FONT_BODY,
        }}
      >
        {val || "—"}
      </span>
    </div>
  );
}

function Btn({ children, onClick, disabled, ghost, green }) {
  const bg = green ? "#16A34A" : ghost ? "white" : disabled ? "#E2E8F0" : C;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        width: "100%",
        minHeight: "clamp(52px,6vw,62px)",
        border: ghost ? `2px solid ${C}` : "none",
        borderRadius: 14,
        background: bg,
        color: ghost ? C : disabled ? "#94A3B8" : "white",
        fontFamily: FONT_BODY,
        fontSize: "clamp(15px,1.8vw,18px)",
        fontWeight: 900,
        cursor: disabled ? "not-allowed" : "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        opacity: disabled ? 0.7 : 1,
      }}
    >
      {children}
    </button>
  );
}

// ── Validation + description builder ─────────────────────────────────────────
function onlyDigits(s) {
  return (s || "").replace(/\D/g, "");
}

function validateFields(fields, form) {
  for (const f of fields) {
    if (!f.req) continue;
    const v = (form[f.k] || "").trim();
    if (!v) return `"${f.l}" is required.`;
    if (f.t === "tel" && !/^[6-9]\d{9}$/.test(onlyDigits(v))) return "Please enter a valid 10-digit mobile number.";
  }
  return null;
}

function buildDescription(fields, form) {
  // Build a structured description for backend CRM/ticketing.
  return fields
    .filter((f) => (form[f.k] || "").toString().trim())
    .map((f) => `${f.l}: ${form[f.k]}`.replace(/\s+/g, " ").trim())
    .join(" | ");
}

// ── Main Component ────────────────────────────────────────────────────────────
export function GenericService({ dept = "electricity", flow, t, setScreen, lang = "en" }) {
  const subType = flow?.subType || "default";
  const cfg = SERVICE_CONFIGS[subType] || SERVICE_CONFIGS.default;

  const serviceLabel = flow?.label || cfg.title;

  const copy = useMemo(() => {
    const isHi = lang === "hi";
    return {
      back: t?.back || (isHi ? "वापस" : "Back"),
      review: isHi ? "समीक्षा करें" : "Review Application",
      submit: isHi ? "कन्फर्म और सबमिट" : "Confirm & Submit",
      submitting: isHi ? "सबमिट हो रहा है…" : "Submitting…",
      edit: isHi ? "विवरण बदलें" : "Edit Details",
      done: isHi ? "अनुरोध दर्ज" : "Request Submitted",
      home: isHi ? "होम" : "Return Home",
      print: isHi ? "प्रिंट" : "Print",
      summary: isHi ? "अनुरोध सारांश" : "Request Summary",
      helpline: isHi ? "हेल्पलाइन" : "Helpline",
      helpNo: "1912",
      processed: isHi ? "आपका अनुरोध समीक्षा में है।" : "Your request is under review.",
      warn: isHi ? "कृपया सबमिट करने से पहले सभी विवरण जांचें।" : "Please verify all details before submitting.",
    };
  }, [lang, t]);

  const [step, setStep] = useState(1);
  const [form, setForm] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const setF = (k) => (v) => {
    setForm((p) => ({ ...p, [k]: v }));
    setError("");
  };

  const handleReview = () => {
    const err = validateFields(cfg.fields, form);
    if (err) {
      setError(err);
      return;
    }
    setError("");
    setStep(2);
  };

  const handleSubmit = async () => {
    const err = validateFields(cfg.fields, form);
    if (err) {
      setError(err);
      return;
    }

    const name = (form.name || "Applicant").trim();
    const mobile = onlyDigits(form.mobile || "");

    setLoading(true);
    setError("");
    try {
      const r = await api.submitService({
        name,
        mobile,
        dept: "electricity",
        serviceLabel,
        description: buildDescription(cfg.fields, form),
      });
      setResult(r);
      setStep(3);
    } catch (e) {
      setError(e?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    if (step === 1) setScreen("dept");
    else if (step === 2) setStep(1);
    else setScreen("home");
  };

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "#F0F4F8" }}>
      {/* Header */}
      <div style={{ background: "white", borderBottom: `4px solid ${C}`, padding: "clamp(14px,1.8vw,20px) clamp(16px,2.5vw,40px)", flexShrink: 0 }}>
        <button
          type="button"
          onClick={goBack}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 8,
            color: "#64748B",
            fontFamily: FONT_BODY,
            fontSize: "clamp(13px,1.4vw,15px)",
            fontWeight: 900,
            marginBottom: 12,
            padding: "4px 0",
          }}
        >
          <Icon d={PATH.back} size={16} color="#64748B" />
          {copy.back}
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 46,
              height: 46,
              borderRadius: 12,
              background: L,
              border: `1.5px solid ${BD}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Icon d={PATH.bolt} size={22} color={C} />
          </div>
          <div style={{ minWidth: 0 }}>
            <h2 style={{ fontFamily: FONT_HEAD, fontSize: "clamp(16px,2vw,24px)", fontWeight: 900, color: "#0A2342", margin: 0 }}>
              {cfg.title}
            </h2>
            <p style={{ fontFamily: FONT_BODY, fontSize: 12, color: "#94A3B8", marginTop: 4, fontWeight: 800 }}>
              AVVNL Electricity · Rajasthan
            </p>
          </div>
        </div>
      </div>

      <StepBar step={step} />

      {/* Content */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        <div style={{ maxWidth: 720, margin: "0 auto", padding: "clamp(20px,2.5vw,32px) clamp(16px,2.5vw,40px) 60px" }}>
          {/* STEP 1: Form */}
          {step === 1 && (
            <>
              <Card style={{ background: L, border: `1.5px solid ${BD}`, marginBottom: 14 }}>
                <p style={{ fontFamily: FONT_BODY, fontSize: "clamp(13px,1.4vw,15px)", color: "#0A2342", lineHeight: 1.7, fontWeight: 800 }}>
                  {cfg.desc}
                </p>
              </Card>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
                {[["Service Fee", cfg.fee], ["Processing Time", cfg.time]].map(([l, v]) => (
                  <Card key={l} style={{ textAlign: "center", padding: 16, marginBottom: 0 }}>
                    <p style={{ fontFamily: FONT_BODY, fontSize: 11, fontWeight: 900, letterSpacing: ".08em", textTransform: "uppercase", color: "#94A3B8", marginBottom: 8 }}>
                      {l}
                    </p>
                    <p style={{ fontFamily: FONT_HEAD, fontSize: "clamp(13px,1.7vw,18px)", fontWeight: 950, color: C, lineHeight: 1.3, margin: 0 }}>
                      {v}
                    </p>
                  </Card>
                ))}
              </div>

              {cfg.docs?.length ? (
                <Card style={{ marginBottom: 16 }}>
                  <p style={{ fontFamily: FONT_BODY, fontSize: 11, fontWeight: 900, letterSpacing: ".10em", textTransform: "uppercase", color: "#94A3B8", marginBottom: 14 }}>
                    Documents Required
                  </p>

                  {cfg.docs.map((doc, i) => (
                    <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: i < cfg.docs.length - 1 ? 12 : 0 }}>
                      <div
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: "50%",
                          background: L,
                          border: `1.5px solid ${BD}`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          marginTop: 1,
                        }}
                      >
                        <span style={{ fontFamily: FONT_HEAD, fontSize: 11, fontWeight: 950, color: C }}>{i + 1}</span>
                      </div>
                      <span style={{ fontFamily: FONT_BODY, fontSize: "clamp(13px,1.4vw,15px)", color: "#0A2342", lineHeight: 1.5, fontWeight: 800 }}>
                        {doc}
                      </span>
                    </div>
                  ))}
                </Card>
              ) : null}

              <Card style={{ background: "#F0FDF4", border: "1.5px solid #BBF7D0", marginBottom: 20 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 34, height: 34, borderRadius: 10, background: "white", border: "1px solid rgba(0,0,0,.06)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon d={PATH.doc} size={18} color="#166534" />
                  </div>
                  <div>
                    <div style={{ fontFamily: FONT_BODY, fontSize: 12, fontWeight: 900, letterSpacing: ".10em", textTransform: "uppercase", color: "#166534" }}>
                      Estimated next step
                    </div>
                    <div style={{ fontFamily: FONT_HEAD, fontSize: "clamp(13px,1.5vw,16px)", fontWeight: 950, color: "#166534" }}>
                      {cfg.eta}
                    </div>
                  </div>
                </div>
              </Card>

              <ErrBox msg={error} />

              {cfg.fields.map((f) => (
                <Fld
                  key={f.k}
                  label={f.l}
                  value={form[f.k] || ""}
                  onChange={setF(f.k)}
                  placeholder={f.p}
                  type={f.t === "textarea" ? "textarea" : f.t}
                  required={f.req}
                />
              ))}

              <Btn onClick={handleReview}>{copy.review} →</Btn>

              <div style={{ height: 10 }} />

              <div style={{ fontFamily: FONT_BODY, fontSize: 12, color: "#94A3B8", fontWeight: 800, textAlign: "center", lineHeight: 1.5 }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                  <Icon d={PATH.phone} size={16} color="#94A3B8" />
                  {copy.helpline}: <span style={{ fontFamily: FONT_MONO, color: "#0A2342" }}>{copy.helpNo}</span>
                </span>
              </div>
            </>
          )}

          {/* STEP 2: Review */}
          {step === 2 && (
            <>
              <Card>
                <p style={{ fontFamily: FONT_BODY, fontSize: 11, fontWeight: 900, letterSpacing: ".10em", textTransform: "uppercase", color: "#94A3B8", marginBottom: 14 }}>
                  {copy.summary}
                </p>

                {cfg.fields
                  .filter((f) => form[f.k])
                  .map((f) => (
                    <Row key={f.k} label={f.l} val={f.k === "mobile" ? onlyDigits(form[f.k]) : form[f.k]} />
                  ))}

                <Row label="Service Type" val={cfg.title} strong accent={C} />
                <Row label="Fee" val={cfg.fee} strong accent={C} />
              </Card>

              <Card style={{ background: "#FFFBEB", border: "1.5px solid #FDE68A" }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                  <Icon d={PATH.warn} size={18} color="#78350F" />
                  <div style={{ fontFamily: FONT_BODY, fontSize: "clamp(12px,1.3vw,14px)", color: "#78350F", fontWeight: 900, lineHeight: 1.5 }}>
                    {copy.warn}
                  </div>
                </div>
              </Card>

              <ErrBox msg={error} />

              <Btn onClick={handleSubmit} disabled={loading}>
                {loading ? copy.submitting : `${copy.submit} →`}
              </Btn>

              <div style={{ height: 10 }} />

              <Btn ghost onClick={() => setStep(1)}>
                {copy.edit}
              </Btn>
            </>
          )}

          {/* STEP 3: Success */}
          {step === 3 && result && (
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  width: "clamp(72px,9vw,96px)",
                  height: "clamp(72px,9vw,96px)",
                  borderRadius: "50%",
                  background: "#DCFCE7",
                  border: "3px solid #86EFAC",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto clamp(16px,2vw,24px)",
                  animation: "elecGenPop .5s ease",
                }}
              >
                <Icon d={PATH.check} size={44} color="#16A34A" />
              </div>

              <h3 style={{ fontFamily: FONT_HEAD, fontSize: "clamp(20px,2.8vw,30px)", fontWeight: 950, color: "#0A2342", marginBottom: 6 }}>
                {copy.done}
              </h3>

              <p style={{ fontFamily: FONT_BODY, fontSize: "clamp(13px,1.4vw,15px)", color: "#64748B", marginBottom: 22, fontWeight: 800 }}>
                {copy.processed}
              </p>

              <Card style={{ textAlign: "left", marginBottom: 12 }}>
                <p style={{ fontFamily: FONT_BODY, fontSize: 11, fontWeight: 900, letterSpacing: ".10em", textTransform: "uppercase", color: "#94A3B8", marginBottom: 14 }}>
                  Request Summary
                </p>

                <Row label="Request ID" val={result.requestId || result.id || "—"} strong accent={C} />
                <Row label="Service" val={cfg.title} />
                <Row label="Submitted on" val={new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })} />
                <Row label="Processing Time" val={cfg.time} />
                <Row label="ETA" val={cfg.eta} />
                <Row label="Status" val={result.status || "Under Review"} strong accent="#D97706" />
              </Card>

              <Card style={{ background: L, border: `1.5px solid ${BD}`, textAlign: "left" }}>
                <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <Icon d={PATH.doc} size={18} color={C} />
                  <div style={{ fontFamily: FONT_BODY, fontSize: "clamp(12px,1.3vw,14px)", color: "#0A2342", fontWeight: 900, lineHeight: 1.7 }}>
                    Reference ID:{" "}
                    <span style={{ fontFamily: FONT_HEAD, color: C }}>
                      {result.requestId || result.id || "—"}
                    </span>
                    <br />
                    Save this for follow-up. SMS updates sent to{" "}
                    <span style={{ fontFamily: FONT_MONO }}>{onlyDigits(form.mobile)}</span>.
                  </div>
                </div>
              </Card>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <Btn green onClick={() => window.print()}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                    <Icon d={PATH.print} size={18} color="white" />
                    {copy.print}
                  </span>
                </Btn>

                <Btn ghost onClick={() => setScreen("home")}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                    <Icon d={PATH.home} size={18} color={C} />
                    {copy.home}
                  </span>
                </Btn>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes elecGenPop {
          0% { transform: scale(.6); opacity: 0; }
          70% { transform: scale(1.05); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

// ── Exports compatible with your router ───────────────────────────────────────
export const ElecGeneric = (p) => <GenericService {...p} dept="electricity" />;