// import { useState } from "react";
// import { DC, CERTIFICATE_CONFIGS, SCHEME_DATA, HELPLINES } from "../data/constants";

// // ── CERTIFICATE FLOW ─────────────────────────────────────────────────────────
// export function CertificateFlow({ t, flow, setScreen }) {
//   const c = DC[flow.dept];
//   const [step, setStep] = useState(1);
//   const [done, setDone] = useState(false);
//   const [form, setForm] = useState({});
//   const appNo = "APP" + Date.now().toString().slice(-8);
//   const cf = CERTIFICATE_CONFIGS[flow.cert] || CERTIFICATE_CONFIGS.birth;

//   return (
//     <div className="kfa" style={{ flex: 1, background: "#F8FAFC" }}>
//       <div className="sect-hdr" style={{ "--acc": c.color }}>
//         <button onClick={() => done ? setScreen("home") : step > 1 ? setStep(s => s - 1) : setScreen("dept")}
//           style={{ background: "none", border: "none", color: "#64748B", cursor: "pointer", fontSize: 13, display: "flex", alignItems: "center", gap: 6, marginBottom: 10, fontFamily: "DM Sans", fontWeight: 500 }}>
//           ← {t.back}
//         </button>
//         <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: done ? 0 : 14 }}>
//           <span style={{ fontSize: "clamp(20px,2.5vw,28px)" }}>{cf.emoji}</span>
//           <span style={{ fontFamily: "Space Grotesk", fontSize: "clamp(15px,2vw,22px)", fontWeight: 700, color: "#0F172A" }}>{cf.title}</span>
//         </div>
//         {!done && (
//           <div className="step-bar" style={{ "--acc": c.color }}>
//             {["Info", "Form", "Review"].map((s, i) => <div key={s} className={`step-seg ${step > i ? "on" : ""}`} />)}
//           </div>
//         )}
//       </div>

//       <div className="wrap">
//         {/* Step 1 — Info */}
//         {step === 1 && !done && (
//           <div className="kfa">
//             <div className="card" style={{ marginBottom: 14, background: c.light, border: `1.5px solid ${c.border}` }}>
//               <p style={{ fontSize: "clamp(12px,1.4vw,15px)", color: "#374151", lineHeight: 1.6 }}>{cf.desc}</p>
//             </div>
//             <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
//               <div className="card">
//                 <p className="lbl" style={{ marginBottom: 6 }}>Application Fee</p>
//                 <p style={{ fontFamily: "Space Grotesk", fontSize: "clamp(16px,2.2vw,24px)", fontWeight: 700, color: c.color }}>{cf.fee}</p>
//               </div>
//               <div className="card">
//                 <p className="lbl" style={{ marginBottom: 6 }}>Processing Time</p>
//                 <p style={{ fontSize: "clamp(13px,1.5vw,16px)", fontWeight: 600, color: "#0F172A" }}>{cf.time}</p>
//               </div>
//             </div>
//             <div className="card" style={{ marginBottom: 20 }}>
//               <p className="lbl" style={{ marginBottom: 12 }}>Documents Required</p>
//               {cf.docs.map((d, i) => (
//                 <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: i < cf.docs.length - 1 ? 10 : 0 }}>
//                   <div style={{ width: 22, height: 22, background: c.light, border: `1px solid ${c.border}`, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
//                     <span style={{ fontSize: 10, color: c.color, fontWeight: 700 }}>{i + 1}</span>
//                   </div>
//                   <span style={{ fontSize: "clamp(12px,1.4vw,15px)", color: "#374151", lineHeight: 1.4 }}>{d}</span>
//                 </div>
//               ))}
//             </div>
//             <button className="btn" style={{ background: c.color, color: "white" }} onClick={() => setStep(2)}>
//               Proceed to Fill Form →
//             </button>
//           </div>
//         )}

//         {/* Step 2 — Fill form */}
//         {step === 2 && !done && (
//           <div className="kfa">
//             <p className="lbl" style={{ marginBottom: 14 }}>Fill Application Details</p>
//             {cf.fields.map(f => (
//               <div className="fgrp" key={f.k}>
//                 <label className="fl">{f.l}</label>
//                 <input className="inp" type={f.t || "text"} value={form[f.k] || ""}
//                   onChange={e => setForm(p => ({ ...p, [f.k]: e.target.value }))}
//                   placeholder={f.p} />
//               </div>
//             ))}
//             <button className="btn" style={{ background: c.color, color: "white", marginTop: 8 }} onClick={() => setStep(3)}>
//               Review Application →
//             </button>
//           </div>
//         )}

//         {/* Step 3 — Review */}
//         {step === 3 && !done && (
//           <div className="kfa">
//             <p className="lbl" style={{ marginBottom: 12 }}>Review & Submit</p>
//             <div className="card" style={{ marginBottom: 14 }}>
//               {cf.fields.map(f => (
//                 <div className="rrow" key={f.k}>
//                   <span className="cap">{f.l}</span>
//                   <span style={{ fontSize: "clamp(12px,1.4vw,15px)", color: "#0F172A", fontWeight: 500, textAlign: "right", maxWidth: "55%" }}>{form[f.k] || "—"}</span>
//                 </div>
//               ))}
//               <div className="rrow">
//                 <span className="cap">Fee</span>
//                 <span style={{ fontSize: "clamp(13px,1.6vw,17px)", fontWeight: 700, color: c.color }}>{cf.fee}</span>
//               </div>
//             </div>
//             <div style={{ background: "#FFFBEB", border: "1.5px solid #FDE68A", borderRadius: 12, padding: "12px 14px", marginBottom: 14, fontSize: "clamp(11px,1.2vw,13px)", color: "#92400E" }}>
//               ⚠️ Bring original documents when collecting from the Municipal office.
//             </div>
//             <button className="btn" style={{ background: c.color, color: "white", marginBottom: 10 }} onClick={() => setDone(true)}>
//               Submit Application
//             </button>
//             <button className="btn btn-g" style={{ width: "100%", justifyContent: "center" }} onClick={() => setStep(2)}>
//               Edit Details
//             </button>
//           </div>
//         )}

//         {/* Done */}
//         {done && (
//           <div className="kfa" style={{ textAlign: "center" }}>
//             <div className="sico" style={{ background: "#ECFDF5", border: "2px solid #A7F3D0" }}>
//               <span style={{ fontSize: "clamp(28px,4vw,42px)" }}>✅</span>
//             </div>
//             <h3 style={{ fontFamily: "Space Grotesk", fontSize: "clamp(18px,2.5vw,26px)", fontWeight: 700, color: "#0F172A", marginBottom: 4 }}>Application Submitted!</h3>
//             <p className="cap" style={{ marginBottom: 20 }}>Your application has been received</p>
//             <div className="card" style={{ marginBottom: 14, textAlign: "left" }}>
//               {[
//                 ["Application No.", appNo, "a"],
//                 ["Service", cf.title, ""],
//                 ["Submitted", new Date().toLocaleDateString("en-IN"), ""],
//                 ["Processing", cf.time, ""],
//                 ["Status", "Under Review", "w"],
//               ].map(([k, v, h]) => (
//                 <div className="rrow" key={k}>
//                   <span className="cap">{k}</span>
//                   <span style={{ fontSize: "clamp(12px,1.4vw,15px)", fontWeight: h ? "600" : "400", color: h === "w" ? "#D97706" : h === "a" ? c.color : "#0F172A", fontFamily: h === "a" ? "Space Grotesk" : undefined }}>{v}</span>
//                 </div>
//               ))}
//             </div>
//             <div style={{ background: "#EFF6FF", border: "1.5px solid #BFDBFE", borderRadius: 12, padding: "12px 14px", marginBottom: 16, fontSize: "clamp(11px,1.2vw,13px)", color: "#1E40AF", textAlign: "left" }}>
//               📋 Save Application No. <strong>{appNo}</strong> to track your status.
//             </div>
//             <button className="btn" style={{ background: "#059669", color: "white", marginBottom: 10 }}>🖨️ Print Acknowledgement</button>
//             <button className="btn btn-g" style={{ width: "100%", justifyContent: "center" }} onClick={() => setScreen("home")}>Return to Home</button>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// // ── SCHEME FLOW ───────────────────────────────────────────────────────────────
// export function SchemeFlow({ t, flow, setScreen }) {
//   const c = DC[flow.dept];
//   const s = SCHEME_DATA[flow.label] || SCHEME_DATA["PM Awas Yojana"];
//   return (
//     <div className="kfa" style={{ flex: 1, background: "#F8FAFC" }}>
//       <div className="sect-hdr" style={{ "--acc": c.color }}>
//         <button onClick={() => setScreen("dept")}
//           style={{ background: "none", border: "none", color: "#64748B", cursor: "pointer", fontSize: 13, display: "flex", alignItems: "center", gap: 6, marginBottom: 10, fontFamily: "DM Sans", fontWeight: 500 }}>
//           ← {t.back}
//         </button>
//         <h3 style={{ fontFamily: "Space Grotesk", fontSize: "clamp(15px,2vw,22px)", fontWeight: 700, color: "#0F172A" }}>{flow.label}</h3>
//       </div>
//       <div className="wrap">
//         <div className="card" style={{ marginBottom: 14, background: c.light, border: `1.5px solid ${c.border}` }}>
//           <p style={{ fontSize: "clamp(12px,1.4vw,15px)", color: "#374151", lineHeight: 1.65 }}>{s.desc}</p>
//         </div>
//         {[["Benefit / Support", s.benefit], ["Eligibility", s.elig], ["Documents Required", s.docs]].map(([k, v]) => (
//           <div className="card" style={{ marginBottom: 12 }} key={k}>
//             <p className="lbl" style={{ marginBottom: 6 }}>{k}</p>
//             <p style={{ fontSize: "clamp(13px,1.5vw,16px)", color: "#0F172A", fontWeight: 500 }}>{v}</p>
//           </div>
//         ))}
//         <button className="btn" style={{ background: c.color, color: "white", marginBottom: 10 }}>Apply Online</button>
//         <button className="btn btn-g" style={{ width: "100%", justifyContent: "center" }} onClick={() => setScreen("home")}>{t.home}</button>
//       </div>
//     </div>
//   );
// }

// // ── HELPLINE FLOW ─────────────────────────────────────────────────────────────
// export function HelplineFlow({ t, setScreen }) {
//   return (
//     <div className="kfa" style={{ flex: 1, background: "#F8FAFC" }}>
//       <div className="sect-hdr" style={{ "--acc": "#2563EB" }}>
//         <button onClick={() => setScreen("dept")}
//           style={{ background: "none", border: "none", color: "#64748B", cursor: "pointer", fontSize: 13, display: "flex", alignItems: "center", gap: 6, marginBottom: 10, fontFamily: "DM Sans", fontWeight: 500 }}>
//           ← {t.back}
//         </button>
//         <h3 style={{ fontFamily: "Space Grotesk", fontSize: "clamp(15px,2vw,22px)", fontWeight: 700, color: "#0F172A" }}>📞 Helpline Numbers</h3>
//       </div>
//       <div className="wrap">
//         <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 8 }}>
//           {HELPLINES.map(l => (
//             <div key={l.d} style={{ background: l.b, border: `1.5px solid ${l.c}22`, borderRadius: 12, padding: "clamp(11px,1.4vw,16px) clamp(14px,1.8vw,20px)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
//               <span style={{ fontSize: "clamp(12px,1.4vw,16px)", color: "#374151", fontWeight: 500 }}>{l.d}</span>
//               <span style={{ fontFamily: "Space Grotesk", color: l.c, fontWeight: 700, fontSize: "clamp(16px,2vw,22px)" }}>{l.n}</span>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }

// // ── HISTORY FLOW ──────────────────────────────────────────────────────────────
// export function HistoryFlow({ t, flow, setScreen }) {
//   const c = DC[flow.dept];
//   const months = ["Aug", "Sep", "Oct", "Nov", "Dec", "Jan"];
//   const data = [180, 210, 195, 240, 220, 210];
//   const mx = Math.max(...data);
//   return (
//     <div className="kfa" style={{ flex: 1, background: "#F8FAFC" }}>
//       <div className="sect-hdr" style={{ "--acc": c.color }}>
//         <button onClick={() => setScreen("dept")}
//           style={{ background: "none", border: "none", color: "#64748B", cursor: "pointer", fontSize: 13, display: "flex", alignItems: "center", gap: 6, marginBottom: 10, fontFamily: "DM Sans", fontWeight: 500 }}>
//           ← {t.back}
//         </button>
//         <h3 style={{ fontFamily: "Space Grotesk", fontSize: "clamp(15px,2vw,22px)", fontWeight: 700, color: "#0F172A" }}>📊 Usage History</h3>
//       </div>
//       <div className="wrap">
//         <div className="card" style={{ marginBottom: 16 }}>
//           <p className="lbl" style={{ marginBottom: 14 }}>Monthly Consumption (kWh) — Last 6 Months</p>
//           <div style={{ display: "flex", alignItems: "flex-end", gap: "clamp(6px,1vw,12px)", height: "clamp(100px,14vw,160px)" }}>
//             {months.map((m, i) => (
//               <div key={m} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
//                 <span style={{ color: "#94A3B8", fontSize: "clamp(9px,1vw,11px)", fontWeight: 600 }}>{data[i]}</span>
//                 <div style={{ width: "100%", background: i === months.length - 1 ? c.color : `${c.color}55`, borderRadius: "4px 4px 0 0", height: `${(data[i] / mx) * 85}%` }} />
//                 <span style={{ color: "#64748B", fontSize: "clamp(9px,1vw,11px)", fontWeight: 500 }}>{m}</span>
//               </div>
//             ))}
//           </div>
//         </div>
//         <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "clamp(8px,1.2vw,14px)", marginBottom: 16 }}>
//           {[["Avg Monthly", "209 kWh"], ["This Month", "210 kWh"], ["Trend", "↓ 4.5%"]].map(([k, v]) => (
//             <div key={k} className="card" style={{ textAlign: "center", padding: "clamp(12px,1.4vw,18px) 10px" }}>
//               <div style={{ fontFamily: "Space Grotesk", color: c.color, fontWeight: 700, fontSize: "clamp(14px,1.8vw,20px)" }}>{v}</div>
//               <div className="cap" style={{ marginTop: 4 }}>{k}</div>
//             </div>
//           ))}
//         </div>
//         <button className="btn btn-g" style={{ width: "100%", justifyContent: "center" }} onClick={() => setScreen("home")}>{t.home}</button>
//       </div>
//     </div>
//   );
// }