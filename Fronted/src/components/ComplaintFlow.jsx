// import { useState } from "react";
// import { DC, COMPLAINT_TYPES } from "../data/constants";

// export function ComplaintFlow({ t, flow, setScreen }) {
//   const c = DC[flow.dept];
//   const [step, setStep] = useState(1);
//   const [form, setForm] = useState({ name: "", mobile: "", type: "", desc: "" });
//   const tid = "CMP" + Date.now().toString().slice(-7);

//   return (
//     <div className="kfa" style={{ flex: 1, background: "#F8FAFC" }}>
//       {/* Header */}
//       <div className="sect-hdr" style={{ "--acc": c.color }}>
//         <button onClick={() => step > 1 ? setStep(1) : setScreen("dept")}
//           style={{ background: "none", border: "none", color: "#64748B", cursor: "pointer", fontSize: 13, display: "flex", alignItems: "center", gap: 6, marginBottom: 10, fontFamily: "DM Sans", fontWeight: 500 }}>
//           ← {t.back}
//         </button>
//         <h3 style={{ fontFamily: "Space Grotesk", fontSize: "clamp(15px,2vw,20px)", fontWeight: 700, color: "#0F172A" }}>{flow.label}</h3>
//       </div>

//       <div className="wrap">
//         {/* Step 1 — Select type */}
//         {step === 1 && (
//           <div className="kfa">
//             <p className="lbl" style={{ marginBottom: 12 }}>{t.complaintType}</p>
//             <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 8 }}>
//               {(COMPLAINT_TYPES[flow.dept] || COMPLAINT_TYPES.electricity).map(x => (
//                 <button key={x} className="cb"
//                   style={{ borderColor: form.type === x ? c.color : "#E2E8F0", background: form.type === x ? c.light : "#FFF", color: form.type === x ? c.color : "#374151", fontWeight: form.type === x ? 600 : 400 }}
//                   onClick={() => setForm(f => ({ ...f, type: x }))}>
//                   {form.type === x ? "✓ " : ""}{x}
//                 </button>
//               ))}
//             </div>
//             {form.type && (
//               <button className="btn" style={{ background: c.color, color: "white", marginTop: 14 }} onClick={() => setStep(2)}>
//                 {t.proceed} →
//               </button>
//             )}
//           </div>
//         )}

//         {/* Step 2 — Fill form */}
//         {step === 2 && (
//           <div className="kfa">
//             {[
//               { k: "name",   l: t.yourName, p: "Enter your full name",   tp: "text" },
//               { k: "mobile", l: t.mobile,   p: "10-digit mobile number", tp: "tel"  },
//             ].map(f => (
//               <div className="fgrp" key={f.k}>
//                 <label className="fl">{f.l}</label>
//                 <input className="inp" type={f.tp} value={form[f.k]}
//                   onChange={e => setForm(p => ({ ...p, [f.k]: e.target.value }))}
//                   placeholder={f.p} />
//               </div>
//             ))}
//             <div className="fgrp">
//               <label className="fl">{t.description}</label>
//               <textarea className="inp" value={form.desc}
//                 onChange={e => setForm(f => ({ ...f, desc: e.target.value }))}
//                 placeholder="Describe your issue…" rows={4} style={{ resize: "none" }} />
//             </div>
//             <button className="btn" style={{ background: c.color, color: "white" }} onClick={() => setStep(3)}>
//               {t.submitComplaint}
//             </button>
//           </div>
//         )}

//         {/* Step 3 — Success */}
//         {step === 3 && (
//           <div className="kfa" style={{ textAlign: "center" }}>
//             <div className="sico" style={{ background: "#ECFDF5", border: "2px solid #A7F3D0" }}>
//               <span style={{ fontSize: "clamp(28px,4vw,42px)" }}>✅</span>
//             </div>
//             <h3 style={{ fontFamily: "Space Grotesk", fontSize: "clamp(18px,2.5vw,26px)", fontWeight: 700, color: "#0F172A", marginBottom: 4 }}>{t.complaintSubmitted}</h3>
//             <p className="cap" style={{ marginBottom: 20 }}>Your complaint has been registered</p>
//             <div className="card" style={{ marginBottom: 16, textAlign: "left" }}>
//               {[
//                 [t.trackId,      tid,                    "a"],
//                 [t.complaintType, form.type,             ""],
//                 [t.dept,          flow.dept.toUpperCase(), ""],
//                 ["Priority",      "MEDIUM",              "w"],
//                 [t.estTime,       "24–48 hours",         ""],
//                 ["Mobile",        form.mobile || "N/A",  ""],
//               ].map(([k, v, h]) => (
//                 <div className="rrow" key={k}>
//                   <span className="cap">{k}</span>
//                   <span style={{ fontSize: "clamp(12px,1.4vw,15px)", fontWeight: h ? "600" : "400", color: h === "w" ? "#D97706" : h === "a" ? c.color : "#0F172A", fontFamily: h === "a" ? "Space Grotesk" : undefined }}>{v}</span>
//                 </div>
//               ))}
//             </div>
//             <button className="btn" style={{ background: c.color, color: "white" }} onClick={() => setScreen("home")}>
//               Return to Home
//             </button>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }