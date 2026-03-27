/**
 * flows/municipal/TrackApplication.jsx
 *
 * Universal tracker — complaints (ticketId) + connections (applicationNo)
 * subType: "muni_track"
 *
 * API:
 *   GET /api/complaints/:ticketId    → complaint status
 *   GET /api/connections/:appNo      → connection status
 */

import { useState } from "react";
import api from "../../api/kioskApi";

const C = "#8B5CF6";
const L = "#F5F3FF";

// ── Status config ─────────────────────────────────────────────────────────────
const COMPLAINT_STATUS = {
  Registered:  { color:"#D97706", bg:"#FFFBEB", label:"Registered — Under Review" },
  InProgress:  { color:"#2563EB", bg:"#EFF6FF", label:"In Progress — Being Addressed" },
  Resolved:    { color:"#16A34A", bg:"#DCFCE7", label:"Resolved" },
  Closed:      { color:"#64748B", bg:"#F1F5F9", label:"Closed" },
};

const CONNECTION_STATUS = {
  Submitted:    { color:"#D97706", bg:"#FFFBEB", label:"Submitted — Awaiting Review" },
  UnderReview:  { color:"#2563EB", bg:"#EFF6FF", label:"Under Review" },
  Approved:     { color:"#16A34A", bg:"#DCFCE7", label:"Approved — Pending Connection" },
  Rejected:     { color:"#DC2626", bg:"#FEF2F2", label:"Rejected — Visit AMC Office" },
  Connected:    { color:"#16A34A", bg:"#DCFCE7", label:"Connection Done ✓" },
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
        fontWeight:500, flexShrink:0, minWidth:"38%" }}>{label}</span>
      <span style={{ fontSize:"clamp(13px,1.4vw,15px)", fontWeight:500,
        color:"#0A2342", textAlign:"right", wordBreak:"break-word",
        fontFamily:"var(--font-body)" }}>{val || "—"}</span>
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

// ── Main ──────────────────────────────────────────────────────────────────────
export function TrackApplication({ t, setScreen }) {
  const [refId,   setRefId]   = useState("");
  const [type,    setType]    = useState("complaint"); // "complaint" | "connection"
  const [result,  setResult]  = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  const handleTrack = async () => {
    const id = refId.trim().toUpperCase();
    if (!id) { setError("Please enter your Reference ID / Ticket ID."); return; }
    setError(""); setLoading(true); setResult(null);

    try {
      if (type === "complaint") {
        const r = await api.trackComplaint(id);
        setResult({ kind:"complaint", data:r.complaint });
      } else {
        const r = await api.trackConnection(id);
        setResult({ kind:"connection", data:r.application });
      }
    } catch (e) {
      setError(e.message || "Reference ID not found. Please check and try again.");
    } finally { setLoading(false); }
  };

  const statusConfig = result
    ? result.kind === "complaint"
      ? COMPLAINT_STATUS[result.data.status]
      : CONNECTION_STATUS[result.data.status]
    : null;

  return (
    <div style={{ flex:1, display:"flex", flexDirection:"column", background:"#F0F4F8" }}>

      {/* Header */}
      <div style={{ background:"white", borderBottom:`4px solid ${C}`,
        padding:"clamp(14px,1.8vw,20px) clamp(16px,2.5vw,40px)", flexShrink:0 }}>
        <button onClick={() => setScreen("dept")}
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
              <path d="M15.5 14H14.71L14.43 13.73C15.41 12.59 16 11.11 16 9.5C16 5.91 13.09 3 9.5 3C5.91 3 3 5.91 3 9.5C3 13.09 5.91 16 9.5 16C11.11 16 12.59 15.41 13.73 14.43L14 14.71V15.5L19 20.49L20.49 19L15.5 14ZM9.5 14C7.01 14 5 11.99 5 9.5C5 7.01 7.01 5 9.5 5C11.99 5 14 7.01 14 9.5C14 11.99 11.99 14 9.5 14Z"/>
            </svg>
          </div>
          <div>
            <h2 style={{ fontFamily:"var(--font-head)", fontSize:"clamp(16px,2vw,24px)",
              fontWeight:700, color:"#0A2342", margin:0 }}>Track Application</h2>
            <p style={{ fontFamily:"var(--font-body)", fontSize:12, color:"#94A3B8", marginTop:3 }}>
              Complaint status · Connection application status
            </p>
          </div>
        </div>
      </div>

      <div style={{ flex:1, overflowY:"auto" }}>
        <div style={{ maxWidth:680, margin:"0 auto",
          padding:"clamp(20px,2.5vw,32px) clamp(16px,2.5vw,40px) 60px" }}>

          {/* Type selector */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:20 }}>
            {[
              { k:"complaint",  l:"Complaint", sub:"CMP-XXXX Tracking ID" },
              { k:"connection", l:"Connection Application", sub:"CONN-XXXX Application No." },
            ].map(opt => (
              <button key={opt.k} onClick={() => { setType(opt.k); setResult(null); setError(""); }} style={{
                padding:"clamp(14px,1.6vw,18px)", textAlign:"left",
                border:`2px solid ${type === opt.k ? C : "#E2E8F0"}`,
                borderLeft:`5px solid ${type === opt.k ? C : "#E2E8F0"}`,
                borderRadius:14,
                background: type === opt.k ? L : "white", cursor:"pointer",
              }}>
                <div style={{ fontFamily:"var(--font-body)",
                  fontSize:"clamp(13px,1.5vw,15px)", fontWeight:700,
                  color: type === opt.k ? C : "#0A2342" }}>{opt.l}</div>
                <div style={{ fontSize:"clamp(10px,1.1vw,12px)",
                  color:"#94A3B8", marginTop:4 }}>{opt.sub}</div>
              </button>
            ))}
          </div>

          {/* Search input */}
          <div style={{ marginBottom:16 }}>
            <label style={{ display:"block", fontFamily:"var(--font-body)", fontSize:12,
              fontWeight:700, color:"#64748B", marginBottom:8,
              letterSpacing:".06em", textTransform:"uppercase" }}>
              {type === "complaint" ? "Complaint Tracking ID" : "Application Number"}
            </label>
            <input value={refId}
              onChange={e => { setRefId(e.target.value.toUpperCase()); setError(""); setResult(null); }}
              onKeyDown={e => e.key === "Enter" && handleTrack()}
              placeholder={type === "complaint" ? "e.g. CMP-1234567890-ABC" : "e.g. CONN-1234567890-ABC"}
              autoFocus
              style={{ width:"100%", height:"clamp(50px,5.5vw,58px)", padding:"0 16px",
                fontFamily:"var(--font-body)", fontSize:"clamp(15px,1.7vw,17px)",
                color:"#0A2342", background:"#F8FAFC",
                border:"2px solid #E2E8F0", borderRadius:12, outline:"none",
                boxSizing:"border-box" }} />
          </div>

          <ErrBox msg={error} />

          <Btn onClick={handleTrack} disabled={!refId.trim() || loading}>
            {loading ? "Searching…" : "Track Status →"}
          </Btn>

          {/* Result */}
          {result && statusConfig && (
            <div style={{ marginTop:24 }}>
              {/* Status badge */}
              <div style={{ background: statusConfig.bg,
                border:`1.5px solid ${statusConfig.color}30`,
                borderRadius:14, padding:"clamp(16px,2vw,24px)",
                marginBottom:16, textAlign:"center" }}>
                <div style={{ width:60, height:60, borderRadius:"50%",
                  background:"white", border:`3px solid ${statusConfig.color}`,
                  display:"flex", alignItems:"center", justifyContent:"center",
                  margin:"0 auto 14px" }}>
                  <svg width={28} height={28} viewBox="0 0 24 24" fill={statusConfig.color}>
                    {result.data.status === "Resolved" || result.data.status === "Connected"
                      ? <path d="M9 16.17L4.83 12L3.41 13.41L9 19L21 7L19.59 5.59L9 16.17Z"/>
                      : <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 17H11V15H13V17ZM13 13H11V7H13V13Z"/>
                    }
                  </svg>
                </div>
                <div style={{ fontFamily:"var(--font-head)",
                  fontSize:"clamp(16px,2vw,22px)", fontWeight:800,
                  color: statusConfig.color }}>
                  {statusConfig.label}
                </div>
              </div>

              {/* Details */}
              <Card>
                <p style={{ fontFamily:"var(--font-body)", fontSize:11, fontWeight:700,
                  letterSpacing:".08em", textTransform:"uppercase",
                  color:"#94A3B8", marginBottom:14 }}>
                  {result.kind === "complaint" ? "Complaint Details" : "Application Details"}
                </p>

                {result.kind === "complaint" ? (
                  <>
                    <Row label="Ticket ID"    val={result.data.ticketId} />
                    <Row label="Type"         val={result.data.type} />
                    <Row label="Department"   val={result.data.dept} />
                    <Row label="Priority"     val={result.data.priority} />
                    <Row label="Raised On"    val={result.data.createdAt ? new Date(result.data.createdAt).toLocaleDateString("en-IN") : "—"} />
                    <Row label="Resolved On"  val={result.data.resolvedAt ? new Date(result.data.resolvedAt).toLocaleDateString("en-IN") : "Pending"} />
                  </>
                ) : (
                  <>
                    <Row label="Application No." val={result.data.applicationNo} />
                    <Row label="Applicant"        val={result.data.name} />
                    <Row label="Department"       val={result.data.dept} />
                    <Row label="Category"         val={result.data.category} />
                    <Row label="Address"          val={result.data.address} />
                    <Row label="Submitted On"     val={result.data.createdAt ? new Date(result.data.createdAt).toLocaleDateString("en-IN") : "—"} />
                    {result.data.remarks && <Row label="Remarks" val={result.data.remarks} />}
                  </>
                )}
              </Card>

              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                <Btn onClick={() => { setRefId(""); setResult(null); setError(""); }}>
                  Track Another
                </Btn>
                <Btn ghost onClick={() => setScreen("home")}>Go to Home</Btn>
              </div>
            </div>
          )}

          {/* Help */}
          {!result && (
            <Card style={{ marginTop:20, background:"#FAFAFA" }}>
              <p style={{ fontFamily:"var(--font-body)", fontSize:12, fontWeight:700,
                letterSpacing:".07em", textTransform:"uppercase",
                color:"#94A3B8", marginBottom:12 }}>Where to find your ID?</p>
              {[
                ["Complaint Ticket", "Printed on your complaint acknowledgement slip"],
                ["Connection Application", "Printed on your application receipt"],
                ["SMS / Email", "Sent to your mobile when you submitted the request"],
                ["AMC Office", "Ask at the Municipal Ward office with your Aadhaar"],
              ].map(([title, desc]) => (
                <div key={title} style={{ display:"flex", gap:10, marginBottom:10, alignItems:"flex-start" }}>
                  <div style={{ width:8, height:8, borderRadius:"50%", background:C,
                    flexShrink:0, marginTop:5 }} />
                  <div>
                    <div style={{ fontFamily:"var(--font-body)",
                      fontSize:"clamp(13px,1.4vw,15px)", fontWeight:600, color:"#0A2342" }}>{title}</div>
                    <div style={{ fontSize:"clamp(11px,1.2vw,13px)", color:"#64748B", marginTop:2 }}>{desc}</div>
                  </div>
                </div>
              ))}
            </Card>
          )}

        </div>
      </div>
    </div>
  );
}