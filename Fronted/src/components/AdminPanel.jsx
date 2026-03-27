/**
 * AdminPanel.jsx — SUVIDHA Kiosk Admin Control Panel
 *
 * Professional Government Kiosk Aesthetic
 * ─────────────────────────────────────────
 * Light white background · Blue gradient accents
 * DM Sans + DM Mono fonts · SVG icons only
 * Zero emojis · Zero hover transforms
 * BillPay.jsx design language
 * Fully responsive with clamp()
 */

import { useState, useEffect, useCallback } from "react";

// ─── CONFIG ──────────────────────────────────────────────────────
const API = process.env.REACT_APP_API_BASE || "http://localhost:5000";
const TOKEN_KEY = "suvidha_admin_token";

// ─── DESIGN TOKENS ───────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800&family=DM+Mono:wght@400;500;600;700&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  /* Surfaces */
  --bg:      #F0F4F9;
  --surf:    #FFFFFF;
  --surf2:   #F7FAFD;

  /* Borders */
  --bd:      #D4E0EC;
  --bd2:     #C2D4E8;

  /* Blue accent */
  --blue:    #1558A0;
  --blueD:   #0E4080;
  --blueMid: #1E7AD4;
  --blueLt:  #EBF4FF;
  --blueBd:  #BFDBF7;
  --blueGrd: linear-gradient(135deg, #1254A0, #1E7AD4);

  /* Navy (sidebar / topbar) */
  --navy:    #0A2342;
  --navyM:   #0F3060;

  /* Semantic */
  --green:   #15803D;
  --greenBg: #F0FDF4;
  --greenBd: #86EFAC;
  --red:     #DC2626;
  --redBg:   #FEF2F2;
  --redBd:   #FCA5A5;
  --amber:   #B45309;
  --amberBg: #FFFBEB;
  --amberBd: #FCD34D;
  --purp:    #7C3AED;
  --purpBg:  #F5F3FF;
  --purpBd:  #DDD6FE;
  --teal:    #0E7490;
  --tealBg:  #ECFEFF;
  --tealBd:  #A5F3FC;

  /* Text */
  --t1: #0A1828;
  --t2: #2C4A62;
  --t3: #64869E;
  --t4: #A0BBCC;

  /* Typography */
  --dm:   'DM Sans', 'Segoe UI', system-ui, sans-serif;
  --mono: 'DM Mono', 'Courier New', monospace;

  /* Radii */
  --r4:4px; --r6:6px; --r8:8px; --r10:10px; --r12:12px; --r14:14px;

  /* Shadows */
  --sh1: 0 1px 4px rgba(10,35,66,.07);
  --sh2: 0 2px 12px rgba(10,35,66,.10);
  --sh3: 0 4px 20px rgba(10,35,66,.14);
}

html, body {
  background: var(--bg);
  color: var(--t1);
  font-family: var(--dm);
}

/* ── Keyframes ── */
@keyframes ap-up   { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
@keyframes ap-fade { from{opacity:0} to{opacity:1} }
@keyframes ap-spin { to{transform:rotate(360deg)} }
@keyframes ap-dot  { 0%,100%{opacity:1} 50%{opacity:.25} }
@keyframes ap-bar  { from{width:0} to{width:var(--target)} }

.anim-up   { animation: ap-up   .28s ease both; }
.anim-fade { animation: ap-fade .18s ease both; }

/* ── Scrollbar ── */
::-webkit-scrollbar       { width: 4px; height: 4px; }
::-webkit-scrollbar-track { background: var(--bg); }
::-webkit-scrollbar-thumb { background: var(--bd2); border-radius: 99px; }

/* ── Table ── */
.tbl { width:100%; border-collapse:collapse; }
.tbl th {
  background: var(--surf2);
  color: var(--t3);
  font-family: var(--dm);
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .06em;
  padding: 10px 14px;
  text-align: left;
  border-bottom: 1px solid var(--bd);
  white-space: nowrap;
}
.tbl td {
  padding: 10px 14px;
  border-bottom: 1px solid var(--bd);
  font-size: 13px;
  color: var(--t1);
  vertical-align: middle;
  font-family: var(--dm);
}
.tbl tr:last-child td { border-bottom: none; }
.tbl .mc { font-family: var(--mono); font-size: 12px; color: var(--blue); }

/* ── Badges ── */
.bdg {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 9px;
  border-radius: 5px;
  font-size: 11px;
  font-weight: 700;
  font-family: var(--dm);
  letter-spacing: .03em;
  white-space: nowrap;
}
.bdg-green { background:var(--greenBg); color:var(--green); border:1px solid var(--greenBd); }
.bdg-red   { background:var(--redBg);   color:var(--red);   border:1px solid var(--redBd);   }
.bdg-amber { background:var(--amberBg); color:var(--amber); border:1px solid var(--amberBd); }
.bdg-blue  { background:var(--blueLt);  color:var(--blue);  border:1px solid var(--blueBd);  }
.bdg-purp  { background:var(--purpBg);  color:var(--purp);  border:1px solid var(--purpBd);  }
.bdg-ghost { background:var(--surf2);   color:var(--t3);    border:1px solid var(--bd);       }

/* ── Inputs ── */
.inp {
  background: var(--surf2);
  border: 1.5px solid var(--bd2);
  color: var(--t1);
  font-family: var(--dm);
  font-size: 13px;
  border-radius: var(--r8);
  padding: 9px 13px;
  outline: none;
  width: 100%;
  transition: border-color .15s, box-shadow .15s;
}
.inp:focus {
  border-color: var(--blue);
  box-shadow: 0 0 0 3px rgba(21,88,160,.1);
}
.sel {
  background: var(--surf2);
  border: 1.5px solid var(--bd2);
  color: var(--t1);
  font-family: var(--dm);
  font-size: 13px;
  border-radius: var(--r8);
  padding: 8px 13px;
  outline: none;
  cursor: pointer;
  transition: border-color .15s;
}
.sel:focus { border-color: var(--blue); }

/* ── Buttons ── */
.btn {
  font-family: var(--dm);
  font-size: 13px;
  font-weight: 600;
  border: none;
  border-radius: var(--r8);
  padding: 9px 16px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
}
.btn:active { opacity: .88; }
.btn-primary { background: var(--blueGrd); color: white; box-shadow: 0 2px 8px rgba(21,88,160,.28); }
.btn-green   { background: var(--green);   color: white; }
.btn-red     { background: var(--red);     color: white; }
.btn-ghost   { background: var(--surf);    color: var(--t2); border: 1px solid var(--bd); }
.btn-sm { font-size: 11px; padding: 5px 11px; border-radius: var(--r6); gap: 5px; }

/* ── Cards ── */
.card {
  background: var(--surf);
  border: 1px solid var(--bd);
  border-radius: var(--r12);
  box-shadow: var(--sh1);
}

/* ── Nav active ── */
.nav-act {
  background: var(--blueLt) !important;
  border-left-color: var(--blue) !important;
}
.nav-act span { color: var(--blue) !important; font-weight: 700 !important; }

/* ── Progress bar animation ── */
.pbar { animation: ap-bar .9s cubic-bezier(.22,1,.36,1) both; }
`;

// ─── SVG ICON RENDERER ───────────────────────────────────────────
function Ic({ d, size = 16, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}
      aria-hidden="true" style={{ flexShrink: 0, display: "block" }}>
      <path d={d} />
    </svg>
  );
}

// ─── ICON PATHS ──────────────────────────────────────────────────
const IC = {
  // Navigation
  dashboard: "M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z",
  payments:  "M20 4H4c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z",
  complaint: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z",
  conn:      "M4 1v2H1v2h3v2h2V5h3V3H6V1H4zm14 0v2h-3v2h3v2h2V5h3V3h-3V1h-2zM3 9l-2 6h2v6h4v-6h2L7 9H3zm14 0l-2 6h2v6h4v-6h2l-2-6h-4z",
  outage:    "M7 2v11h3v9l7-12h-4l4-8z",
  voter:     "M18 4H6c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-4 10h-4v-2h4v2zm2-4H8V8h8v2z",
  scheme:    "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
  consumer:  "M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z",
  alerts:    "M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z",
  sessions:  "M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2zm3 18H5V8h14v11z",
  logout:    "M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z",
  // UI
  shield:    "M12 1L3 5V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V5L12 1Z",
  lock:      "M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z",
  check:     "M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z",
  close:     "M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z",
  edit:      "M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z",
  trash:     "M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z",
  plus:      "M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z",
  search:    "M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z",
  eye:       "M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z",
  refresh:   "M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z",
  back:      "M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z",
  rupee:     "M11 2H7v2H5v2h2v1H5v2h2.22L11 14h1l-3.78 5H11l3-4 3 4h2.78L16 14h1l3.78-5H18.78L22 4h-2V2h-2v2H11zm0 2h8l-1 1h-6l-1-1zm4 5H9.22L8 7h10l-3 2zm-2 2l2-1.33L17 11h-4z",
  bar:       "M3.5 18.49l6-6.01 4 4L22 6.92l-1.41-1.41-7.09 7.97-4-4L2 16.99z",
  warn:      "M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z",
  info:      "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z",
};

// ─── API HELPER ──────────────────────────────────────────────────
function useApi(token) {
  return useCallback(async (method, path, body) => {
    const res = await fetch(`${API}/api/admin${path}`, {
      method,
      headers: { "Content-Type": "application/json", "x-admin-token": token },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || "Request failed");
    return data;
  }, [token]);
}

// ─── STATUS BADGE ────────────────────────────────────────────────
const STATUS_MAP = {
  Success:"green", Paid:"green", Resolved:"green", Approved:"green",
  Connected:"green", Restored:"green", Delivered:"green", Active:"green", Enrolled:"green",
  Failed:"red", Rejected:"red", CRITICAL:"red", Overdue:"red",
  Pending:"amber", Registered:"amber", Submitted:"amber", Reported:"amber", HIGH:"amber",
  Processing:"amber", Disconnected:"amber",
  UnderReview:"blue", Acknowledged:"blue", blo_pending:"blue", eci_review:"blue",
  Contacted:"blue", InProgress:"blue", MEDIUM:"blue",
  closed:"ghost", Closed:"ghost", LOW:"ghost",
};
function SBadge({ status }) {
  const c = STATUS_MAP[status] || "ghost";
  return <span className={`bdg bdg-${c}`}>{status}</span>;
}

// ─── SHARED: ACCENT BAR ──────────────────────────────────────────
function AccentBar({ top, bottom, left, right, h = 3 }) {
  return (
    <div style={{
      position: "absolute",
      top, bottom, left, right,
      height: h,
      background: "linear-gradient(90deg, #1254A0, #1E7AD4)",
      borderRadius: top !== undefined ? "var(--r12) var(--r12) 0 0" : "0 0 var(--r12) var(--r12)",
    }} />
  );
}

// ─── STAT CARD ───────────────────────────────────────────────────
function StatCard({ icon, label, value, sub, accent = "var(--blue)", trend }) {
  return (
    <div className="card anim-up" style={{ padding: "clamp(14px,1.8vw,20px)", display: "flex", flexDirection: "column", gap: 14, position: "relative", overflow: "hidden" }}>
      {/* Top accent line */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: `${accent}`, opacity: .7, borderRadius: "var(--r12) var(--r12) 0 0" }} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginTop: 4 }}>
        <div style={{
          width: 36, height: 36, borderRadius: "var(--r8)",
          background: `${accent}14`, border: `1px solid ${accent}28`,
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        }}>
          <Ic d={icon} size={17} color={accent} />
        </div>
        {trend !== undefined && (
          <span style={{
            fontFamily: "var(--mono)", fontSize: 11, fontWeight: 700,
            color: trend >= 0 ? "var(--green)" : "var(--red)",
            background: trend >= 0 ? "var(--greenBg)" : "var(--redBg)",
            border: `1px solid ${trend >= 0 ? "var(--greenBd)" : "var(--redBd)"}`,
            padding: "2px 8px", borderRadius: 4,
          }}>{trend >= 0 ? "+" : ""}{trend}%</span>
        )}
      </div>
      <div>
        <div style={{ fontFamily: "var(--mono)", fontSize: "clamp(20px,2.2vw,26px)", fontWeight: 700, color: "var(--t1)", lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: 12, color: "var(--t2)", marginTop: 6, fontWeight: 600 }}>{label}</div>
        {sub && <div style={{ fontSize: 11, color: "var(--t3)", marginTop: 2 }}>{sub}</div>}
      </div>
    </div>
  );
}

// ─── SECTION HEADER ──────────────────────────────────────────────
function SecHead({ icon, title, sub, accent = "var(--blue)", children }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, flexWrap: "wrap", gap: 10 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {/* Vertical accent bar — matches BillPay.jsx style */}
        <div style={{ width: 3, height: 34, borderRadius: 2, background: "linear-gradient(180deg,#1254A0,#1E7AD4)", flexShrink: 0 }} />
        <div style={{
          width: 34, height: 34, borderRadius: "var(--r8)",
          background: "var(--blueLt)", border: "1px solid var(--blueBd)",
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        }}>
          <Ic d={icon} size={16} color="var(--blue)" />
        </div>
        <div>
          <div style={{ fontFamily: "var(--dm)", fontSize: "clamp(14px,1.6vw,16px)", fontWeight: 700, color: "var(--t1)" }}>{title}</div>
          {sub && <div style={{ fontSize: 11, color: "var(--t3)", marginTop: 1, fontFamily: "var(--dm)" }}>{sub}</div>}
        </div>
      </div>
      {children && <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>{children}</div>}
    </div>
  );
}

// ─── TABLE WRAP ──────────────────────────────────────────────────
function TableWrap({ children, loading }) {
  return (
    <div style={{ overflowX: "auto", borderRadius: "var(--r10)", border: "1px solid var(--bd)", background: "var(--surf)" }}>
      {loading
        ? <LoadingBox />
        : children}
    </div>
  );
}

// ─── MODAL ───────────────────────────────────────────────────────
function Modal({ title, onClose, children }) {
  return (
    <div
      onClick={e => e.target === e.currentTarget && onClose()}
      style={{ position: "fixed", inset: 0, background: "rgba(10,35,66,.32)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
    >
      <div className="card anim-fade" style={{ width: "100%", maxWidth: 520, maxHeight: "88vh", overflowY: "auto", padding: "clamp(20px,2.5vw,28px)", position: "relative" }}>
        <AccentBar top={0} left={0} right={0} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, paddingBottom: 14, borderBottom: "1px solid var(--bd)", marginTop: 8 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: "var(--t1)", fontFamily: "var(--dm)" }}>{title}</div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", padding: 4, borderRadius: 6, display: "flex" }}>
            <Ic d={IC.close} size={18} color="var(--t3)" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ─── KV ROW (for modals) ─────────────────────────────────────────
function KV({ label, val, mono }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "9px 0", borderBottom: "1px solid var(--bd)", gap: 12 }}>
      <span style={{ fontSize: 12, color: "var(--t3)", fontWeight: 500, whiteSpace: "nowrap", flexShrink: 0 }}>{label}</span>
      <span style={{ fontFamily: mono ? "var(--mono)" : "var(--dm)", fontSize: 12, color: mono ? "var(--blue)" : "var(--t1)", fontWeight: 600, textAlign: "right", wordBreak: "break-all" }}>{val ?? "—"}</span>
    </div>
  );
}

// ─── LABEL ───────────────────────────────────────────────────────
function Lbl({ children }) {
  return <label style={{ fontSize: 12, color: "var(--t3)", display: "block", marginBottom: 5, fontWeight: 600, fontFamily: "var(--dm)" }}>{children}</label>;
}

// ─── LOADING / ERROR ─────────────────────────────────────────────
function LoadingBox() {
  return (
    <div style={{ padding: 56, textAlign: "center" }}>
      <div style={{ width: 24, height: 24, border: "2.5px solid var(--bd)", borderTopColor: "var(--blue)", borderRadius: "50%", animation: "ap-spin .75s linear infinite", margin: "0 auto 12px" }} />
      <div style={{ fontSize: 12, color: "var(--t3)", fontFamily: "var(--dm)", fontWeight: 600 }}>Loading data…</div>
    </div>
  );
}
function Spinner() { return <div style={{ padding: 60 }}><LoadingBox /></div>; }
function ErrBox({ children }) {
  return (
    <div style={{ padding: 48, textAlign: "center" }}>
      <div style={{ width: 40, height: 40, borderRadius: "var(--r10)", background: "var(--redBg)", border: "1px solid var(--redBd)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
        <Ic d={IC.warn} size={20} color="var(--red)" />
      </div>
      <div style={{ fontSize: 13, color: "var(--red)", fontWeight: 600, fontFamily: "var(--dm)" }}>{children}</div>
    </div>
  );
}
function EmptyRow({ cols }) {
  return <tr><td colSpan={cols} style={{ textAlign: "center", color: "var(--t3)", padding: 40, fontFamily: "var(--dm)", fontSize: 13 }}>No records found</td></tr>;
}

// ─── MINI BAR CHART (CSS-only) ───────────────────────────────────
function MiniBar({ data, labels, color = "var(--blue)", h = 110 }) {
  const max = Math.max(...data, 1);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 5, height: h, paddingBottom: 22 }}>
      {data.map((v, i) => {
        const pct = (v / max) * 100;
        return (
          <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", height: "100%", gap: 5 }}>
            <div style={{ width: "100%", background: `${color}18`, borderRadius: "3px 3px 0 0", height: `${pct}%`, minHeight: v > 0 ? 3 : 0, position: "relative", overflow: "hidden", border: `1px solid ${color}20`, borderBottom: "none" }}>
              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "100%", background: color, opacity: .65 }} />
            </div>
            <div style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--t3)", textAlign: "center", whiteSpace: "nowrap" }}>{labels[i]}</div>
          </div>
        );
      })}
    </div>
  );
}

// ─── STATUS UPDATE FORM ──────────────────────────────────────────
function StatusForm({ current, statuses, noteDefault = "", onSave, onClose }) {
  const [st, setSt] = useState(current);
  const [note, setNote] = useState(noteDefault);
  return (
    <div>
      <div style={{ marginBottom: 14 }}>
        <Lbl>New Status</Lbl>
        <select className="sel" style={{ width: "100%" }} value={st} onChange={e => setSt(e.target.value)}>
          {statuses.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      <div style={{ marginBottom: 20 }}>
        <Lbl>Note / Remark</Lbl>
        <textarea className="inp" rows={3} value={note} onChange={e => setNote(e.target.value)} style={{ resize: "vertical" }} />
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <button className="btn btn-primary" onClick={() => onSave(st, note)}>
          <Ic d={IC.check} size={13} color="white" />Save Changes
        </button>
        <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
//  SECTION: DASHBOARD
// ══════════════════════════════════════════════════════════════════
function Dashboard({ call }) {
  const [data, setData]   = useState(null);
  const [chart, setChart] = useState(null);
  const [load, setLoad]   = useState(true);

  const load_ = useCallback(async () => {
    setLoad(true);
    try {
      const [d, c] = await Promise.all([
        call("GET", "/dashboard"),
        call("GET", "/analytics/chart?days=7"),
      ]);
      setData(d); setChart(c);
    } catch { /* silently */ }
    setLoad(false);
  }, [call]);

  useEffect(() => { load_(); }, [load_]);

  if (load) return <Spinner />;
  if (!data) return <ErrBox>Could not load dashboard. Check backend.</ErrBox>;

  const s = data.stats;
  const fmt = n => n >= 100000 ? `₹${(n / 100000).toFixed(1)}L` : n >= 1000 ? `₹${(n / 1000).toFixed(1)}K` : `₹${n}`;

  const STATS = [
    { icon: IC.rupee,     label: "Total Revenue",    value: fmt(s.revenue.total),    sub: `Today ${fmt(s.revenue.today)}`,               accent: "var(--blue)"  },
    { icon: IC.payments,  label: "Transactions",      value: s.payments.total,         sub: `${s.payments.success} success`,               accent: "var(--green)" },
    { icon: IC.complaint, label: "Complaints",        value: s.complaints.total,       sub: `${s.complaints.open} open · ${s.complaints.critical} critical`, accent: "var(--red)"   },
    { icon: IC.conn,      label: "New Connections",   value: s.connections.total,      sub: `${s.connections.pending} pending`,             accent: "#C95A00"      },
    { icon: IC.outage,    label: "Outage Reports",    value: s.outages.total,          sub: `${s.outages.active} active`,                  accent: "var(--purp)"  },
    { icon: IC.consumer,  label: "Consumers",         value: s.consumers.total,        sub: "Registered",                                  accent: "var(--teal)"  },
    { icon: IC.sessions,  label: "Kiosk Sessions",    value: s.sessions.total,         sub: `${s.sessions.today} today`,                   accent: "var(--blue)"  },
    { icon: IC.alerts,    label: "Active Alerts",     value: s.alerts.active,          sub: `${s.alerts.total} total configured`,           accent: "var(--red)"   },
  ];

  return (
    <div className="anim-up">
      {/* Stat grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(clamp(150px,16vw,190px), 1fr))", gap: 10, marginBottom: 18 }}>
        {STATS.map(st => <StatCard key={st.label} {...st} />)}
      </div>

      {/* Charts row */}
      {chart && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
          {[
            { title: "Revenue — Last 7 Days",   data: chart.chart.revenueData,    color: "var(--blue)" },
            { title: "Complaints — Last 7 Days", data: chart.chart.complaintsData, color: "var(--red)"  },
          ].map(ch => (
            <div key={ch.title} className="card" style={{ padding: 18 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 12 }}>
                <Ic d={IC.bar} size={13} color={ch.color} />
                <span style={{ fontSize: 12, fontWeight: 700, color: "var(--t2)", fontFamily: "var(--dm)" }}>{ch.title}</span>
              </div>
              <MiniBar data={ch.data} labels={chart.chart.labels} color={ch.color} />
            </div>
          ))}
        </div>
      )}

      {/* Revenue by department */}
      {s.revenue.byDept?.length > 0 && (
        <div className="card" style={{ padding: 18, marginBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 14 }}>
            <Ic d={IC.rupee} size={13} color="var(--blue)" />
            <span style={{ fontSize: 12, fontWeight: 700, color: "var(--t2)", fontFamily: "var(--dm)" }}>Revenue by Department</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {s.revenue.byDept.map(d => {
              const pct = Math.round((d.total / s.revenue.total) * 100);
              const DEPT_COLORS = { electricity: "var(--blue)", gas: "#C95A00", municipal: "var(--green)", water: "var(--teal)" };
              const c = DEPT_COLORS[d._id] || "var(--purp)";
              return (
                <div key={d._id}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ fontSize: 12, color: "var(--t2)", textTransform: "capitalize", fontWeight: 600, fontFamily: "var(--dm)" }}>{d._id}</span>
                    <span style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--t1)", fontWeight: 600 }}>₹{d.total.toLocaleString()} · {d.count} txns</span>
                  </div>
                  <div style={{ height: 7, background: "var(--bg)", borderRadius: 99, overflow: "hidden", border: "1px solid var(--bd)" }}>
                    <div style={{ height: "100%", width: `${pct}%`, background: c, borderRadius: 99, transition: "width .9s ease" }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent activity */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
        {/* Recent Payments */}
        <div className="card" style={{ padding: 18 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "var(--t2)", marginBottom: 12, fontFamily: "var(--dm)", display: "flex", alignItems: "center", gap: 6 }}>
            <Ic d={IC.payments} size={13} color="var(--blue)" />Recent Payments
          </div>
          {data.recentPayments?.map((p, i, arr) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", borderBottom: i < arr.length - 1 ? "1px solid var(--bd)" : "none", gap: 10 }}>
              <div>
                <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--blue)" }}>{p.ref}</div>
                <div style={{ fontSize: 11, color: "var(--t3)", marginTop: 1 }}>{p.dept} · {p.method}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontFamily: "var(--mono)", fontSize: 13, fontWeight: 700 }}>₹{p.amount}</div>
                <SBadge status={p.status} />
              </div>
            </div>
          ))}
        </div>
        {/* Recent Complaints */}
        <div className="card" style={{ padding: 18 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "var(--t2)", marginBottom: 12, fontFamily: "var(--dm)", display: "flex", alignItems: "center", gap: 6 }}>
            <Ic d={IC.complaint} size={13} color="var(--red)" />Recent Complaints
          </div>
          {data.recentComplaints?.map((c, i, arr) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", borderBottom: i < arr.length - 1 ? "1px solid var(--bd)" : "none", gap: 10 }}>
              <div>
                <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--blue)" }}>{c.id}</div>
                <div style={{ fontSize: 11, color: "var(--t3)", marginTop: 1 }}>{c.dept} · {(c.type || "").slice(0, 26)}</div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 3 }}>
                <SBadge status={c.priority} />
                <SBadge status={c.status} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ textAlign: "right" }}>
        <button className="btn btn-ghost btn-sm" onClick={load_}>
          <Ic d={IC.refresh} size={13} color="var(--blue)" />Refresh Dashboard
        </button>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
//  SECTION: PAYMENTS
// ══════════════════════════════════════════════════════════════════
function Payments({ call }) {
  const [rows, setRows]     = useState([]);
  const [total, setTotal]   = useState(0);
  const [load, setLoad]     = useState(true);
  const [dept, setDept]     = useState("");
  const [status, setStatus] = useState("");
  const [method, setMethod] = useState("");
  const [modal, setModal]   = useState(null);

  const fetch_ = useCallback(async () => {
    setLoad(true);
    try {
      const q = [dept && `dept=${dept}`, status && `status=${status}`, method && `method=${method}`].filter(Boolean).join("&");
      const d = await call("GET", `/payments?limit=50&${q}`);
      setRows(d.payments); setTotal(d.total);
    } catch { setRows([]); }
    setLoad(false);
  }, [call, dept, status, method]);

  useEffect(() => { fetch_(); }, [fetch_]);

  const updateStatus = async (ref, st) => {
    try { await call("PATCH", `/payments/${ref}`, { status: st }); fetch_(); setModal(null); }
    catch (e) { alert(e.message); }
  };

  return (
    <div className="anim-up">
      <SecHead icon={IC.payments} title="Payments" sub={`${total} total transactions`}>
        {[
          { val: dept,   set: setDept,   opts: ["", "electricity", "gas", "municipal", "water"],         ph: "All Depts"   },
          { val: status, set: setStatus, opts: ["", "Initiated", "Processing", "Success", "Failed"],     ph: "All Status"  },
          { val: method, set: setMethod, opts: ["", "UPI", "CARD", "NETBANKING", "CASH"],                ph: "All Methods" },
        ].map((f, i) => (
          <select key={i} className="sel" value={f.val} onChange={e => f.set(e.target.value)}>
            {f.opts.map(o => <option key={o} value={o}>{o || f.ph}</option>)}
          </select>
        ))}
      </SecHead>
      <TableWrap loading={load}>
        <table className="tbl">
          <thead><tr><th>Reference</th><th>Consumer No.</th><th>Dept</th><th>Amount</th><th>Method</th><th>Status</th><th>Date</th><th>Action</th></tr></thead>
          <tbody>
            {rows.map(p => (
              <tr key={p.referenceNo}>
                <td className="mc">{p.referenceNo}</td>
                <td className="mc">{p.consumerNumber}</td>
                <td style={{ textTransform: "capitalize" }}>{p.dept}</td>
                <td style={{ fontFamily: "var(--mono)", fontWeight: 700, color: "var(--blue)" }}>₹{p.amount?.toLocaleString()}</td>
                <td>{p.paymentMethod}</td>
                <td><SBadge status={p.status} /></td>
                <td style={{ fontSize: 11, color: "var(--t3)" }}>{new Date(p.createdAt).toLocaleString("en-IN")}</td>
                <td>
                  <button className="btn btn-ghost btn-sm" onClick={() => setModal(p)}>
                    <Ic d={IC.eye} size={12} color="var(--blue)" />View
                  </button>
                </td>
              </tr>
            ))}
            {!rows.length && !load && <EmptyRow cols={8} />}
          </tbody>
        </table>
      </TableWrap>

      {modal && (
        <Modal title={`Payment — ${modal.referenceNo}`} onClose={() => setModal(null)}>
          {[
            ["Reference No.", modal.referenceNo, true],
            ["Consumer No.",  modal.consumerNumber, true],
            ["Bill ID",       modal.billId, true],
            ["Department",    modal.dept],
            ["Amount",        `₹${modal.amount?.toLocaleString()}`, true],
            ["Method",        modal.paymentMethod],
            ["Status",        modal.status],
            ["Transaction ID",modal.transactionId, true],
            ["Paid At",       modal.paidAt ? new Date(modal.paidAt).toLocaleString("en-IN") : null],
          ].map(([l, v, m]) => <KV key={l} label={l} val={v} mono={m} />)}
          <div style={{ display: "flex", gap: 8, marginTop: 18 }}>
            <button className="btn btn-green btn-sm" onClick={() => updateStatus(modal.referenceNo, "Success")}>
              <Ic d={IC.check} size={12} color="white" />Mark Success
            </button>
            <button className="btn btn-red btn-sm" onClick={() => updateStatus(modal.referenceNo, "Failed")}>
              <Ic d={IC.close} size={12} color="white" />Mark Failed
            </button>
            <button className="btn btn-ghost btn-sm" onClick={() => setModal(null)}>Close</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── COMPLAINT FORM ──────────────────────────────────────────────
function ComplaintForm({ complaint: c, onSave, onClose }) {
  const [status,   setStatus]   = useState(c.status);
  const [priority, setPriority] = useState(c.priority);
  const [remarks,  setRemarks]  = useState(c.remarks || "");
  return (
    <div>
      {[["Ticket ID", c.ticketId, true], ["Mobile", c.mobile, true], ["Description", c.description]].map(([l, v, m]) => (
        <KV key={l} label={l} val={v} mono={m} />
      ))}
      <div style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: 12 }}>
        <div>
          <Lbl>Status</Lbl>
          <select className="sel" style={{ width: "100%" }} value={status} onChange={e => setStatus(e.target.value)}>
            {["Registered","InProgress","Resolved","Closed"].map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>
        <div>
          <Lbl>Priority</Lbl>
          <select className="sel" style={{ width: "100%" }} value={priority} onChange={e => setPriority(e.target.value)}>
            {["LOW","MEDIUM","HIGH","CRITICAL"].map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>
        <div>
          <Lbl>Remarks</Lbl>
          <textarea className="inp" rows={3} value={remarks} onChange={e => setRemarks(e.target.value)} style={{ resize: "vertical" }} />
        </div>
      </div>
      <div style={{ display: "flex", gap: 8, marginTop: 18 }}>
        <button className="btn btn-primary btn-sm" onClick={() => onSave({ status, priority, remarks })}>
          <Ic d={IC.check} size={13} color="white" />Save Changes
        </button>
        <button className="btn btn-ghost btn-sm" onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
//  SECTION: COMPLAINTS
// ══════════════════════════════════════════════════════════════════
function Complaints({ call }) {
  const [rows, setRows]     = useState([]);
  const [total, setTotal]   = useState(0);
  const [load, setLoad]     = useState(true);
  const [dept, setDept]     = useState("");
  const [status, setStatus] = useState("");
  const [prio, setPrio]     = useState("");
  const [modal, setModal]   = useState(null);

  const fetch_ = useCallback(async () => {
    setLoad(true);
    try {
      const q = [dept && `dept=${dept}`, status && `status=${status}`, prio && `priority=${prio}`].filter(Boolean).join("&");
      const d = await call("GET", `/complaints?limit=50&${q}`);
      setRows(d.complaints); setTotal(d.total);
    } catch { setRows([]); }
    setLoad(false);
  }, [call, dept, status, prio]);

  useEffect(() => { fetch_(); }, [fetch_]);

  const update = async (id, body) => {
    try { await call("PATCH", `/complaints/${id}`, body); fetch_(); setModal(null); }
    catch (e) { alert(e.message); }
  };

  return (
    <div className="anim-up">
      <SecHead icon={IC.complaint} title="Complaints" sub={`${total} total`}>
        {[
          { val: dept,   set: setDept,   opts: ["","electricity","gas","municipal","water"],        ph:"All Depts"   },
          { val: status, set: setStatus, opts: ["","Registered","InProgress","Resolved","Closed"], ph:"All Status"  },
          { val: prio,   set: setPrio,   opts: ["","LOW","MEDIUM","HIGH","CRITICAL"],               ph:"All Priority"},
        ].map((f, i) => (
          <select key={i} className="sel" value={f.val} onChange={e => f.set(e.target.value)}>
            {f.opts.map(o => <option key={o} value={o}>{o || f.ph}</option>)}
          </select>
        ))}
      </SecHead>
      <TableWrap loading={load}>
        <table className="tbl">
          <thead><tr><th>Ticket ID</th><th>Dept</th><th>Name</th><th>Type</th><th>Priority</th><th>Status</th><th>Date</th><th>Action</th></tr></thead>
          <tbody>
            {rows.map(c => (
              <tr key={c.ticketId}>
                <td className="mc">{c.ticketId}</td>
                <td style={{ textTransform: "capitalize" }}>{c.dept}</td>
                <td>{c.name}</td>
                <td style={{ maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.type}</td>
                <td><SBadge status={c.priority} /></td>
                <td><SBadge status={c.status} /></td>
                <td style={{ fontSize: 11, color: "var(--t3)" }}>{new Date(c.createdAt).toLocaleString("en-IN")}</td>
                <td>
                  <button className="btn btn-ghost btn-sm" onClick={() => setModal(c)}>
                    <Ic d={IC.edit} size={12} color="var(--blue)" />Manage
                  </button>
                </td>
              </tr>
            ))}
            {!rows.length && !load && <EmptyRow cols={8} />}
          </tbody>
        </table>
      </TableWrap>

      {modal && (
        <Modal title={`Complaint — ${modal.ticketId}`} onClose={() => setModal(null)}>
          <ComplaintForm complaint={modal} onSave={body => update(modal.ticketId, body)} onClose={() => setModal(null)} />
        </Modal>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
//  SECTION: VOTER APPLICATIONS
// ══════════════════════════════════════════════════════════════════
function VoterApps({ call }) {
  const [rows, setRows]   = useState([]);
  const [total, setTotal] = useState(0);
  const [load, setLoad]   = useState(true);
  const [svc, setSvc]     = useState("");
  const [st, setSt]       = useState("");
  const [modal, setModal] = useState(null);
  const VSTATUS = ["submitted","blo_pending","blo_done","eci_review","approved","rejected","card_printed","dispatched","delivered"];

  const fetch_ = useCallback(async () => {
    setLoad(true);
    try {
      const q = [svc && `serviceType=${svc}`, st && `status=${st}`].filter(Boolean).join("&");
      const d = await call("GET", `/voter/apps?${q}`);
      setRows(d.applications); setTotal(d.total);
    } catch { setRows([]); }
    setLoad(false);
  }, [call, svc, st]);

  useEffect(() => { fetch_(); }, [fetch_]);

  const update = async (ref, body) => {
    try { await call("PATCH", `/voter/apps/${ref}`, body); fetch_(); setModal(null); }
    catch (e) { alert(e.message); }
  };

  return (
    <div className="anim-up">
      <SecHead icon={IC.voter} title="Voter ID Applications" sub={`${total} applications`}>
        <select className="sel" value={svc} onChange={e => setSvc(e.target.value)}>
          <option value="">All Services</option>
          <option value="new">New Registration</option>
          <option value="correction">Correction</option>
        </select>
        <select className="sel" value={st} onChange={e => setSt(e.target.value)}>
          <option value="">All Status</option>
          {VSTATUS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </SecHead>
      <TableWrap loading={load}>
        <table className="tbl">
          <thead><tr><th>Reference</th><th>Type</th><th>Applicant</th><th>Mobile</th><th>Status</th><th>Submitted</th><th>Action</th></tr></thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.referenceNo}>
                <td className="mc">{r.referenceNo}</td>
                <td>{r.serviceType === "new" ? "New Reg." : "Correction"}</td>
                <td>{r.applicantName}</td>
                <td className="mc">{r.mobile}</td>
                <td><SBadge status={r.status} /></td>
                <td style={{ fontSize: 11, color: "var(--t3)" }}>{new Date(r.submittedAt).toLocaleString("en-IN")}</td>
                <td>
                  <button className="btn btn-ghost btn-sm" onClick={() => setModal(r)}>
                    <Ic d={IC.edit} size={12} color="var(--blue)" />Update
                  </button>
                </td>
              </tr>
            ))}
            {!rows.length && !load && <EmptyRow cols={7} />}
          </tbody>
        </table>
      </TableWrap>
      {modal && (
        <Modal title={`Voter App — ${modal.referenceNo}`} onClose={() => setModal(null)}>
          <StatusForm current={modal.status} statuses={VSTATUS} noteDefault={modal.note || ""}
            onSave={(s, n) => update(modal.referenceNo, { status: s, note: n })} onClose={() => setModal(null)} />
        </Modal>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
//  SECTION: ALERTS MANAGER
// ══════════════════════════════════════════════════════════════════
function AlertsMgr({ call }) {
  const [rows, setRows]   = useState([]);
  const [load, setLoad]   = useState(true);
  const [form, setForm]   = useState({ hi: "", en: "", type: "warn" });
  const [open, setOpen]   = useState(false);

  const fetch_ = useCallback(async () => {
    setLoad(true);
    try { const d = await call("GET", "/alerts"); setRows(d.alerts); }
    catch { setRows([]); }
    setLoad(false);
  }, [call]);

  useEffect(() => { fetch_(); }, [fetch_]);

  const add = async () => {
    if (!form.hi || !form.en) { alert("Both Hindi and English text required"); return; }
    try { await call("POST", "/alerts", form); setForm({ hi: "", en: "", type: "warn" }); setOpen(false); fetch_(); }
    catch (e) { alert(e.message); }
  };

  const toggle = async al => {
    try { await call("PATCH", `/alerts/${al.id}`, { active: !al.active }); fetch_(); }
    catch (e) { alert(e.message); }
  };

  const del = async id => {
    if (!window.confirm("Delete this alert?")) return;
    try { await call("DELETE", `/alerts/${id}`); fetch_(); }
    catch (e) { alert(e.message); }
  };

  const TYPE_STYLE = {
    warn:  { bar: "var(--amber)", bg: "var(--amberBg)", bd: "var(--amberBd)", icon: IC.warn,  cls: "bdg-amber" },
    green: { bar: "var(--green)", bg: "var(--greenBg)", bd: "var(--greenBd)", icon: IC.check, cls: "bdg-green" },
    info:  { bar: "var(--blue)",  bg: "var(--blueLt)",  bd: "var(--blueBd)",  icon: IC.info,  cls: "bdg-blue"  },
  };

  return (
    <div className="anim-up">
      <SecHead icon={IC.alerts} title="Kiosk Alert Ticker" sub="Manage live alerts shown on all kiosk screens">
        <button className="btn btn-primary btn-sm" onClick={() => setOpen(o => !o)}>
          <Ic d={IC.plus} size={13} color="white" />Add Alert
        </button>
      </SecHead>

      {/* Add form */}
      {open && (
        <div className="card anim-fade" style={{ padding: 20, marginBottom: 14, position: "relative", overflow: "hidden" }}>
          <AccentBar top={0} left={0} right={0} />
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--t1)", marginBottom: 14, marginTop: 6 }}>New Alert</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
            <div>
              <Lbl>Hindi Text</Lbl>
              <input className="inp" placeholder="हिंदी में लिखें" value={form.hi} onChange={e => setForm(f => ({ ...f, hi: e.target.value }))} />
            </div>
            <div>
              <Lbl>English Text</Lbl>
              <input className="inp" placeholder="Write in English" value={form.en} onChange={e => setForm(f => ({ ...f, en: e.target.value }))} />
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <select className="sel" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
              <option value="warn">Warning / Alert</option>
              <option value="green">Success / Restored</option>
              <option value="info">Information / Notice</option>
            </select>
            <button className="btn btn-primary btn-sm" onClick={add}>
              <Ic d={IC.plus} size={13} color="white" />Add Alert
            </button>
            <button className="btn btn-ghost btn-sm" onClick={() => setOpen(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* Alert list */}
      {load ? <Spinner /> : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {rows.map(al => {
            const ts = TYPE_STYLE[al.type] || TYPE_STYLE.info;
            return (
              <div key={al.id} className="card" style={{ padding: "14px 18px", display: "flex", gap: 14, alignItems: "center", opacity: al.active ? 1 : .5 }}>
                {/* Type bar */}
                <div style={{ width: 3, height: 38, borderRadius: 2, background: ts.bar, flexShrink: 0 }} />
                {/* Icon box */}
                <div style={{ width: 30, height: 30, borderRadius: "var(--r8)", background: ts.bg, border: `1px solid ${ts.bd}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Ic d={ts.icon} size={14} color={ts.bar} />
                </div>
                {/* Text */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: "var(--dm)", fontSize: 13, fontWeight: 700, color: "var(--t1)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{al.hi}</div>
                  <div style={{ fontFamily: "var(--dm)", fontSize: 11, color: "var(--t3)", marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{al.en}</div>
                </div>
                {/* Controls */}
                <div style={{ display: "flex", gap: 7, flexShrink: 0, alignItems: "center" }}>
                  <span className={`bdg ${ts.cls}`}>{al.type}</span>
                  <button className={`btn btn-sm ${al.active ? "btn-ghost" : "btn-green"}`} onClick={() => toggle(al)}>
                    {al.active ? "Deactivate" : "Activate"}
                  </button>
                  <button className="btn btn-red btn-sm" onClick={() => del(al.id)}>
                    <Ic d={IC.trash} size={12} color="white" />
                  </button>
                </div>
              </div>
            );
          })}
          {!rows.length && (
            <div style={{ textAlign: "center", color: "var(--t3)", padding: 48, fontFamily: "var(--dm)", fontSize: 13 }}>
              No alerts configured. Add one above.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
//  SECTION: GENERIC LIST (Connections, Outages, Schemes)
// ══════════════════════════════════════════════════════════════════
function GenericList({ call, endpoint, title, icon, columns, statusField, statusOptions, filterKey, filterOptions }) {
  const [rows, setRows]   = useState([]);
  const [total, setTotal] = useState(0);
  const [load, setLoad]   = useState(true);
  const [filt, setFilt]   = useState("");
  const [modal, setModal] = useState(null);

  const fetch_ = useCallback(async () => {
    setLoad(true);
    try {
      const q = filt && filterKey ? `${filterKey}=${filt}` : "";
      const d = await call("GET", `/${endpoint}?limit=50&${q}`);
      setRows(d[endpoint] || d.items || d.connections || d.outages || []);
      setTotal(d.total || 0);
    } catch { setRows([]); }
    setLoad(false);
  }, [call, endpoint, filt, filterKey]);

  useEffect(() => { fetch_(); }, [fetch_]);

  const update = async (id, body) => {
    try { await call("PATCH", `/${endpoint}/${id}`, body); fetch_(); setModal(null); }
    catch (e) { alert(e.message); }
  };

  return (
    <div className="anim-up">
      <SecHead icon={icon} title={title} sub={`${total} total`}>
        {filterOptions && (
          <select className="sel" value={filt} onChange={e => setFilt(e.target.value)}>
            <option value="">All Status</option>
            {filterOptions.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        )}
      </SecHead>
      <TableWrap loading={load}>
        <table className="tbl">
          <thead><tr>{columns.map(c => <th key={c.key}>{c.label}</th>)}<th>Action</th></tr></thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i}>
                {columns.map(c => (
                  <td key={c.key} className={c.mono ? "mc" : ""} style={{ maxWidth: c.maxW || "none", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {c.key === statusField ? <SBadge status={row[c.key]} /> : (row[c.key] ?? "—")}
                  </td>
                ))}
                <td>
                  <button className="btn btn-ghost btn-sm" onClick={() => setModal(row)}>
                    <Ic d={IC.edit} size={12} color="var(--blue)" />Update
                  </button>
                </td>
              </tr>
            ))}
            {!rows.length && !load && <EmptyRow cols={columns.length + 1} />}
          </tbody>
        </table>
      </TableWrap>
      {modal && (
        <Modal title={`Update — ${modal[columns[0].key]}`} onClose={() => setModal(null)}>
          <StatusForm current={modal[statusField] || statusOptions[0]} statuses={statusOptions}
            noteDefault={modal.remarks || modal.note || modal.eta || ""}
            onSave={(s, n) => update(modal[columns[0].key], { status: s, ...(n ? { remarks: n, note: n, eta: n } : {}) })}
            onClose={() => setModal(null)} />
        </Modal>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
//  SECTION: CONSUMERS
// ══════════════════════════════════════════════════════════════════
function Consumers({ call }) {
  const [rows, setRows]   = useState([]);
  const [total, setTotal] = useState(0);
  const [load, setLoad]   = useState(true);
  const [q, setQ]         = useState("");
  const [modal, setModal] = useState(null);

  const fetch_ = useCallback(async (search = q) => {
    setLoad(true);
    try {
      const d = await call("GET", `/consumers?limit=50${search ? `&q=${search}` : ""}`);
      setRows(d.consumers); setTotal(d.total);
    } catch { setRows([]); }
    setLoad(false);
  }, [call, q]);

  useEffect(() => { fetch_(); }, [fetch_]);

  const update = async (num, body) => {
    try { await call("PATCH", `/consumers/${num}`, body); fetch_(); setModal(null); }
    catch (e) { alert(e.message); }
  };

  return (
    <div className="anim-up">
      <SecHead icon={IC.consumer} title="Consumer Database" sub={`${total} consumers registered`}>
        <div style={{ display: "flex", gap: 8 }}>
          <input className="inp" placeholder="Search name or number…" value={q} onChange={e => setQ(e.target.value)}
            onKeyDown={e => e.key === "Enter" && fetch_(q)} style={{ width: 220 }} />
          <button className="btn btn-primary btn-sm" onClick={() => fetch_(q)}>
            <Ic d={IC.search} size={13} color="white" />Search
          </button>
        </div>
      </SecHead>
      <TableWrap loading={load}>
        <table className="tbl">
          <thead><tr><th>Consumer No.</th><th>Name</th><th>Dept</th><th>Category</th><th>Load (kW)</th><th>Status</th><th>Provider</th><th>Action</th></tr></thead>
          <tbody>
            {rows.map(c => (
              <tr key={c.consumerNumber}>
                <td className="mc">{c.consumerNumber}</td>
                <td>{c.name}</td>
                <td style={{ textTransform: "capitalize" }}>{c.dept}</td>
                <td>{c.category}</td>
                <td style={{ fontFamily: "var(--mono)" }}>{c.sanctionedLoad ?? "—"}</td>
                <td><SBadge status={c.connectionStatus} /></td>
                <td style={{ fontSize: 11, color: "var(--t3)" }}>{c.provider}</td>
                <td>
                  <button className="btn btn-ghost btn-sm" onClick={() => setModal(c)}>
                    <Ic d={IC.edit} size={12} color="var(--blue)" />Edit
                  </button>
                </td>
              </tr>
            ))}
            {!rows.length && !load && <EmptyRow cols={8} />}
          </tbody>
        </table>
      </TableWrap>

      {modal && (
        <Modal title={`Consumer — ${modal.consumerNumber}`} onClose={() => setModal(null)}>
          {[["Consumer No.", modal.consumerNumber, true], ["Name", modal.name], ["Dept", modal.dept]].map(([l, v, m]) => <KV key={l} label={l} val={v} mono={m} />)}
          <ConsumerEditForm consumer={modal} onSave={body => update(modal.consumerNumber, body)} onClose={() => setModal(null)} />
        </Modal>
      )}
    </div>
  );
}

function ConsumerEditForm({ consumer: c, onSave, onClose }) {
  const [st, setSt]     = useState(c.connectionStatus);
  const [cat, setCat]   = useState(c.category);
  const [kw, setKw]     = useState(c.sanctionedLoad ?? "");
  const [addr, setAddr] = useState(c.address || "");
  return (
    <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 12 }}>
      {[
        { label: "Connection Status", val: st, set: setSt, opts: ["Active", "Disconnected", "Pending"] },
        { label: "Category",          val: cat, set: setCat, opts: ["Domestic", "Commercial", "Industrial"] },
      ].map(f => (
        <div key={f.label}>
          <Lbl>{f.label}</Lbl>
          <select className="sel" style={{ width: "100%" }} value={f.val} onChange={e => f.set(e.target.value)}>
            {f.opts.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>
      ))}
      <div><Lbl>Sanctioned Load (kW)</Lbl><input className="inp" type="number" value={kw} onChange={e => setKw(e.target.value)} /></div>
      <div><Lbl>Address</Lbl><textarea className="inp" rows={2} value={addr} onChange={e => setAddr(e.target.value)} style={{ resize: "vertical" }} /></div>
      <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
        <button className="btn btn-primary btn-sm" onClick={() => onSave({ connectionStatus: st, category: cat, sanctionedLoad: +kw, address: addr })}>
          <Ic d={IC.check} size={13} color="white" />Save
        </button>
        <button className="btn btn-ghost btn-sm" onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
//  SECTION: SESSIONS
// ══════════════════════════════════════════════════════════════════
function Sessions({ call }) {
  const [rows, setRows] = useState([]);
  const [load, setLoad] = useState(true);
  useEffect(() => {
    call("GET", "/sessions?limit=100").then(d => { setRows(d.sessions); setLoad(false); }).catch(() => setLoad(false));
  }, [call]);
  return (
    <div className="anim-up">
      <SecHead icon={IC.sessions} title="Kiosk Session Log" sub="Recent citizen sessions on this kiosk" />
      <TableWrap loading={load}>
        <table className="tbl">
          <thead><tr><th>Time</th><th>Language</th><th>Screen</th><th>Dept</th><th>Flow</th><th>Duration (s)</th></tr></thead>
          <tbody>
            {rows.map((s, i) => (
              <tr key={i}>
                <td style={{ fontFamily: "var(--mono)", fontSize: 11 }}>{new Date(s.createdAt).toLocaleString("en-IN")}</td>
                <td><span className={`bdg ${s.lang === "hi" ? "bdg-amber" : "bdg-blue"}`}>{s.lang?.toUpperCase()}</span></td>
                <td>{s.screen || "—"}</td>
                <td style={{ textTransform: "capitalize" }}>{s.dept || "—"}</td>
                <td style={{ fontFamily: "var(--mono)", fontSize: 11 }}>{s.flow || "—"}</td>
                <td style={{ fontFamily: "var(--mono)" }}>{s.duration ?? "—"}</td>
              </tr>
            ))}
            {!rows.length && !load && <EmptyRow cols={6} />}
          </tbody>
        </table>
      </TableWrap>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
//  ROOT: ADMIN PANEL
// ══════════════════════════════════════════════════════════════════
export default function AdminPanel({ onClose }) {
  const [token, setToken]     = useState(() => sessionStorage.getItem(TOKEN_KEY) || "");
  const [input, setInput]     = useState("");
  const [err, setErr]         = useState("");
  const [authed, setAuthed]   = useState(false);
  const [tab, setTab]         = useState("dashboard");
  const [clock, setClock]     = useState(new Date().toLocaleTimeString("en-IN"));

  // Clock tick
  useEffect(() => {
    const t = setInterval(() => setClock(new Date().toLocaleTimeString("en-IN")), 1000);
    return () => clearInterval(t);
  }, []);

  // Auto-verify stored token
  useEffect(() => {
    if (!token) return;
    fetch(`${API}/api/admin/dashboard`, { headers: { "x-admin-token": token } })
      .then(r => r.json())
      .then(d => { if (d.success) setAuthed(true); else { setToken(""); sessionStorage.removeItem(TOKEN_KEY); } })
      .catch(() => {});
  }, [token]);

  const login = async () => {
    setErr("");
    try {
      const r = await fetch(`${API}/api/admin/dashboard`, { headers: { "x-admin-token": input.trim() } });
      const d = await r.json();
      if (d.success) { setToken(input.trim()); sessionStorage.setItem(TOKEN_KEY, input.trim()); setAuthed(true); }
      else setErr("Invalid admin token. Check kiosk-backend/.env file.");
    } catch { setErr("Cannot connect to backend server. Is kiosk-backend running?"); }
  };

  const logout = () => { setToken(""); setAuthed(false); sessionStorage.removeItem(TOKEN_KEY); setInput(""); };
  const call   = useApi(token);

  const NAV = [
    { id: "dashboard",   label: "Dashboard",    icon: IC.dashboard },
    { id: "payments",    label: "Payments",      icon: IC.payments  },
    { id: "complaints",  label: "Complaints",    icon: IC.complaint },
    { id: "connections", label: "Connections",   icon: IC.conn      },
    { id: "outages",     label: "Outages",       icon: IC.outage    },
    { id: "voter",       label: "Voter Apps",    icon: IC.voter     },
    { id: "schemes",     label: "Schemes",       icon: IC.scheme    },
    { id: "consumers",   label: "Consumers",     icon: IC.consumer  },
    { id: "alerts",      label: "Alerts",        icon: IC.alerts    },
    { id: "sessions",    label: "Sessions",      icon: IC.sessions  },
  ];

  // ── LOGIN ────────────────────────────────────────────────────
  if (!authed) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--dm)", padding: 24, position: "relative" }}>
        <style>{CSS}</style>

        {/* Tricolor stripe */}
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, height: 4, background: "linear-gradient(90deg,#FF9933 33.33%,white 33.33%,white 66.66%,#138808 66.66%)", zIndex: 10 }} />

        {/* Subtle grid background */}
        <div style={{ position: "fixed", inset: 0, backgroundImage: "linear-gradient(var(--bd) 1px,transparent 1px),linear-gradient(90deg,var(--bd) 1px,transparent 1px)", backgroundSize: "40px 40px", opacity: .35, pointerEvents: "none" }} />

        <div className="card anim-up" style={{ width: "100%", maxWidth: 440, padding: "clamp(28px,4vw,40px)", position: "relative", overflow: "hidden" }}>
          <AccentBar top={0} left={0} right={0} />

          {/* Logo block */}
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 28, marginTop: 8 }}>
            {/* Shield logo */}
            <div style={{
              width: 52, height: 52, borderRadius: 14,
              background: "linear-gradient(135deg,#1254A0,#1E7AD4)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 4px 16px rgba(21,88,160,.3)", flexShrink: 0,
            }}>
              <Ic d={IC.shield} size={26} color="white" />
            </div>
            <div style={{ width: 3, height: 38, borderRadius: 2, background: "linear-gradient(180deg,#1254A0,#1E7AD4)", flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: "clamp(18px,2.2vw,22px)", fontWeight: 800, color: "var(--t1)", letterSpacing: ".05em", lineHeight: 1.1 }}>SUVIDHA</div>
              <div style={{ fontSize: 11, color: "var(--t3)", fontFamily: "var(--mono)", letterSpacing: ".05em", marginTop: 3, textTransform: "uppercase" }}>Admin Control Panel</div>
              <div style={{ fontSize: 10, color: "var(--t4)", marginTop: 2 }}>C-DAC · MeitY · Govt. of India</div>
            </div>
          </div>

          <div style={{ fontSize: 13, color: "var(--t3)", marginBottom: 22, lineHeight: 1.65 }}>
            Enter your administrator token to access the kiosk control panel.
          </div>

          <div style={{ marginBottom: 14 }}>
            <Lbl>Admin Token</Lbl>
            <input className="inp" type="password" placeholder="Enter token…"
              value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && login()}
              autoFocus style={{ height: 48, fontSize: 14 }} />
          </div>

          {err && (
            <div style={{ marginBottom: 14, padding: "10px 14px", background: "var(--redBg)", border: "1px solid var(--redBd)", borderRadius: "var(--r8)", display: "flex", gap: 8, alignItems: "flex-start" }}>
              <Ic d={IC.warn} size={15} color="var(--red)" />
              <span style={{ fontSize: 12, color: "var(--red)", fontWeight: 600 }}>{err}</span>
            </div>
          )}

          <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center", height: 48, fontSize: 14, borderRadius: "var(--r10)", marginBottom: 10 }} onClick={login}>
            <Ic d={IC.lock} size={16} color="white" />Access Admin Panel
          </button>

          {onClose && (
            <button className="btn btn-ghost" style={{ width: "100%", justifyContent: "center", height: 42, fontSize: 13 }} onClick={onClose}>
              <Ic d={IC.back} size={14} color="var(--t2)" />Back to Kiosk
            </button>
          )}

          {/* Dev hint */}
          <div style={{ marginTop: 22, padding: "12px 14px", background: "var(--surf2)", borderRadius: "var(--r8)", border: "1px solid var(--bd)" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--t2)", marginBottom: 3 }}>Default token (development only)</div>
            <div style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--blue)" }}>suvidha-admin-2025</div>
          </div>
        </div>
      </div>
    );
  }

  // ── MAIN PANEL ───────────────────────────────────────────────
  return (
    <div style={{ display: "flex", height: "100vh", background: "var(--bg)", fontFamily: "var(--dm)", overflow: "hidden" }}>
      <style>{CSS}</style>

      {/* ── SIDEBAR ────────────────────────────────────────── */}
      <div style={{ width: 222, background: "white", borderRight: "1px solid var(--bd)", display: "flex", flexDirection: "column", flexShrink: 0, boxShadow: "1px 0 5px rgba(10,35,66,.06)" }}>

        {/* Tricolor stripe */}
        <div style={{ height: 4, background: "linear-gradient(90deg,#FF9933 33.33%,white 33.33%,white 66.66%,#138808 66.66%)", flexShrink: 0 }} />

        {/* Brand */}
        <div style={{ padding: "16px 16px 14px", borderBottom: "1px solid var(--bd)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: "var(--r10)",
              background: "linear-gradient(135deg,#1254A0,#1E7AD4)",
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              boxShadow: "0 2px 10px rgba(21,88,160,.28)",
            }}>
              <Ic d={IC.shield} size={18} color="white" />
            </div>
            <div style={{ width: 3, height: 28, borderRadius: 2, background: "linear-gradient(180deg,#1254A0,#1E7AD4)", flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: 13, fontWeight: 800, color: "var(--navy)", letterSpacing: ".06em" }}>SUVIDHA</div>
              <div style={{ fontSize: 9, color: "var(--t3)", fontFamily: "var(--mono)", letterSpacing: ".08em", textTransform: "uppercase", marginTop: 1 }}>Admin Panel</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, overflowY: "auto", padding: "10px 8px" }}>
          {NAV.map(n => (
            <button
              key={n.id}
              onClick={() => setTab(n.id)}
              className={tab === n.id ? "nav-act" : ""}
              style={{
                width: "100%",
                display: "flex", alignItems: "center", gap: 9,
                padding: "9px 11px",
                borderRadius: "var(--r8)",
                border: "none",
                borderLeft: tab === n.id ? "3px solid var(--blue)" : "3px solid transparent",
                cursor: "pointer",
                textAlign: "left",
                marginBottom: 2,
                background: tab === n.id ? "var(--blueLt)" : "transparent",
              }}
            >
              <Ic d={n.icon} size={15} color={tab === n.id ? "var(--blue)" : "var(--t3)"} />
              <span style={{ fontSize: 13, fontWeight: tab === n.id ? 700 : 500, color: tab === n.id ? "var(--blue)" : "var(--t2)", fontFamily: "var(--dm)" }}>
                {n.label}
              </span>
            </button>
          ))}
        </nav>

        {/* Bottom */}
        <div style={{ padding: "10px 8px", borderTop: "1px solid var(--bd)" }}>
          {onClose && (
            <button className="btn btn-ghost btn-sm" style={{ width: "100%", justifyContent: "center", marginBottom: 6, fontSize: 12 }} onClick={onClose}>
              <Ic d={IC.back} size={13} color="var(--t2)" />Back to Kiosk
            </button>
          )}
          <button className="btn btn-ghost btn-sm" style={{ width: "100%", justifyContent: "center", fontSize: 12 }} onClick={logout}>
            <Ic d={IC.logout} size={13} color="var(--t2)" />Logout
          </button>
        </div>
      </div>

      {/* ── MAIN CONTENT ────────────────────────────────────── */}
      <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column" }}>

        {/* Top bar */}
        <div style={{ height: 52, background: "white", borderBottom: "1px solid var(--bd)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 clamp(16px,2.5vw,28px)", flexShrink: 0, boxShadow: "0 1px 4px rgba(10,35,66,.06)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 3, height: 22, borderRadius: 2, background: "linear-gradient(180deg,#1254A0,#1E7AD4)" }} />
            <span style={{ fontSize: 14, fontWeight: 700, color: "var(--t1)", fontFamily: "var(--dm)" }}>
              {NAV.find(n => n.id === tab)?.label || "Admin Panel"}
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            {/* Live dot */}
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--green)", boxShadow: "0 0 0 2px var(--greenBg)", animation: "ap-dot 2s infinite" }} />
              <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--t3)" }}>Backend · Live</span>
            </div>
            <div style={{ width: 1, height: 16, background: "var(--bd)" }} />
            <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--t3)" }}>{clock}</span>
          </div>
        </div>

        {/* Content area */}
        <div style={{ flex: 1, padding: "clamp(14px,2vw,24px)" }}>
          {tab === "dashboard"   && <Dashboard  call={call} />}
          {tab === "payments"    && <Payments   call={call} />}
          {tab === "complaints"  && <Complaints call={call} />}
          {tab === "connections" && (
            <GenericList call={call} endpoint="connections" title="New Connection Applications" icon={IC.conn}
              columns={[{ key:"applicationNo",label:"App No.",mono:true },{ key:"name",label:"Name" },{ key:"dept",label:"Dept" },{ key:"category",label:"Category" },{ key:"sanctionedLoad",label:"Load kW",mono:true },{ key:"status",label:"Status" },{ key:"createdAt",label:"Date" }]}
              statusField="status" statusOptions={["Submitted","UnderReview","Approved","Rejected","Connected"]}
              filterKey="status"   filterOptions={["Submitted","UnderReview","Approved","Rejected","Connected"]} />
          )}
          {tab === "outages"     && (
            <GenericList call={call} endpoint="outages" title="Outage Reports" icon={IC.outage}
              columns={[{ key:"reportId",label:"Report ID",mono:true },{ key:"name",label:"Name" },{ key:"area",label:"Area" },{ key:"ward",label:"Ward" },{ key:"priority",label:"Priority" },{ key:"status",label:"Status" },{ key:"eta",label:"ETA" },{ key:"createdAt",label:"Date" }]}
              statusField="status" statusOptions={["Reported","Acknowledged","InProgress","Restored"]}
              filterKey="status"   filterOptions={["Reported","Acknowledged","InProgress","Restored"]} />
          )}
          {tab === "voter"       && <VoterApps  call={call} />}
          {tab === "schemes"     && (
            <GenericList call={call} endpoint="schemes" title="Scheme Interest Registrations" icon={IC.scheme}
              columns={[{ key:"requestId",label:"Request ID",mono:true },{ key:"name",label:"Name" },{ key:"scheme",label:"Scheme",maxW:"160px" },{ key:"district",label:"District" },{ key:"mobile",label:"Mobile",mono:true },{ key:"status",label:"Status" },{ key:"createdAt",label:"Date" }]}
              statusField="status" statusOptions={["Submitted","Contacted","Enrolled","Rejected"]}
              filterKey="status"   filterOptions={["Submitted","Contacted","Enrolled","Rejected"]} />
          )}
          {tab === "consumers"   && <Consumers  call={call} />}
          {tab === "alerts"      && <AlertsMgr  call={call} />}
          {tab === "sessions"    && <Sessions   call={call} />}
        </div>
      </div>
    </div>
  );
}