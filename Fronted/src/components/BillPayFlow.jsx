// import { useState } from "react";
// import { DC, MOCK_BILLS } from "../data/constants";

// export function BillPayFlow({ t, flow, setScreen }) {
//   const c = DC[flow.dept];
//   const [step, setStep] = useState(1);
//   const [num, setNum] = useState("");
//   const [bill, setBill] = useState(null);
//   const [pm, setPm] = useState("");
//   const ref = "SVDH" + Date.now().toString().slice(-8);

//   const lookup = () => {
//     setBill(MOCK_BILLS[num] || {
//       name: "Citizen User",
//       address: "Your Address, Rajasthan",
//       amount: Math.floor(Math.random() * 900) + 300,
//       units: Math.floor(Math.random() * 200) + 100,
//       dueDate: "05 Mar 2026",
//       dept: flow.dept.toUpperCase()
//     });
//     setStep(2);
//   };

//   return (
//     <div className="kfa" style={{ flex: 1, background: "#F8FAFC" }}>
//       {/* Header */}
//       <div className="sect-hdr" style={{ "--acc": c.color }}>
//         <button onClick={() => step > 1 ? setStep(s => s - 1) : setScreen("dept")}
//           style={{ background: "none", border: "none", color: "#64748B", cursor: "pointer", fontSize: 13, display: "flex", alignItems: "center", gap: 6, marginBottom: 12, fontFamily: "DM Sans", fontWeight: 500 }}>
//           ← {t.back}
//         </button>
//         <h3 style={{ fontFamily: "Space Grotesk", fontSize: "clamp(15px,2vw,20px)", fontWeight: 700, color: "#0F172A", marginBottom: 14 }}>{flow.label}</h3>
//         <div className="step-bar" style={{ "--acc": c.color }}>
//           {["ID", "Bill", "Pay", "Done"].map((s, i) => <div key={s} className={`step-seg ${step > i ? "on" : ""}`} />)}
//         </div>
//       </div>

//       <div className="wrap">
//         {/* Step 1 — Enter consumer number */}
//         {step === 1 && (
//           <div className="kfa">
//             <p className="lbl" style={{ marginBottom: 10 }}>{t.consumerNo}</p>
//             <input className="inp" value={num} onChange={e => setNum(e.target.value)}
//               placeholder="Try: 1001, 1002 or 2001" style={{ marginBottom: 16 }} />
//             <button className="btn" style={{ background: c.color, color: "white" }} onClick={lookup}>
//               {t.proceed} →
//             </button>
//           </div>
//         )}

//         {/* Step 2 — Bill details */}
//         {step === 2 && bill && (
//           <div className="kfa">
//             <div className="card" style={{ marginBottom: 16 }}>
//               <p className="lbl" style={{ marginBottom: 12 }}>Bill Summary</p>
//               {[
//                 [t.name, bill.name],
//                 [t.address, bill.address],
//                 ...(bill.units > 0 ? [[t.units, `${bill.units} kWh`]] : []),
//                 [t.dueDate, bill.dueDate],
//                 ["Provider", bill.dept]
//               ].map(([k, v]) => (
//                 <div className="rrow" key={k}>
//                   <span className="cap">{k}</span>
//                   <span style={{ fontSize: "clamp(12px,1.4vw,15px)", color: "#0F172A", fontWeight: 500, textAlign: "right", maxWidth: "57%" }}>{v}</span>
//                 </div>
//               ))}
//               <div style={{ background: c.light, border: `1px solid ${c.border}`, borderRadius: 12, padding: "14px 16px", marginTop: 14, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
//                 <span className="cap" style={{ fontWeight: 500 }}>{t.amount}</span>
//                 <span className="am" style={{ color: c.color }}>₹{bill.amount}</span>
//               </div>
//             </div>
//             <button className="btn" style={{ background: c.color, color: "white" }} onClick={() => setStep(3)}>
//               {t.payNow} — ₹{bill.amount}
//             </button>
//           </div>
//         )}

//         {/* Step 3 — Payment method */}
//         {step === 3 && (
//           <div className="kfa">
//             <p className="lbl" style={{ marginBottom: 12 }}>{t.selectPayment}</p>
//             {[
//               { k: "upi", i: "📱", l: t.upi, s: "Google Pay · PhonePe · BHIM" },
//               { k: "card", i: "💳", l: t.card, s: "Visa · Mastercard · RuPay" },
//               { k: "netbanking", i: "🏦", l: t.netbanking, s: "All major Indian banks" }
//             ].map(p => (
//               <div key={p.k} className="po"
//                 style={{ borderColor: pm === p.k ? c.color : "#E2E8F0", background: pm === p.k ? c.light : "#FFF", marginBottom: 10 }}
//                 onClick={() => setPm(p.k)}>
//                 <span style={{ fontSize: "clamp(22px,2.8vw,32px)" }}>{p.i}</span>
//                 <div style={{ flex: 1 }}>
//                   <div style={{ fontSize: "clamp(13px,1.5vw,16px)", fontWeight: 600, color: "#0F172A" }}>{p.l}</div>
//                   <div className="cap" style={{ marginTop: 2 }}>{p.s}</div>
//                 </div>
//                 <div style={{ width: 20, height: 20, borderRadius: "50%", border: `2px solid ${pm === p.k ? c.color : "#CBD5E1"}`, background: pm === p.k ? c.color : "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>
//                   {pm === p.k && <div style={{ width: 8, height: 8, borderRadius: "50%", background: "white" }} />}
//                 </div>
//               </div>
//             ))}
//             {pm && (
//               <button className="btn" style={{ background: c.color, color: "white", marginTop: 6 }}
//                 onClick={() => { setStep(4); setTimeout(() => setStep(5), 2400); }}>
//                 Confirm & Pay ₹{bill?.amount}
//               </button>
//             )}
//           </div>
//         )}

//         {/* Step 4 — Processing */}
//         {step === 4 && (
//           <div className="kfa" style={{ textAlign: "center", paddingTop: 60 }}>
//             <div className="spin" style={{ "--acc": c.color }} />
//             <p className="cap" style={{ fontSize: "clamp(13px,1.5vw,16px)" }}>{t.processing}</p>
//           </div>
//         )}

//         {/* Step 5 — Success */}
//         {step === 5 && (
//           <div className="kfa" style={{ textAlign: "center" }}>
//             <div className="sico" style={{ background: "#ECFDF5", border: "2px solid #A7F3D0" }}>
//               <span style={{ fontSize: "clamp(28px,4vw,42px)" }}>✅</span>
//             </div>
//             <h3 style={{ fontFamily: "Space Grotesk", fontSize: "clamp(18px,2.5vw,26px)", fontWeight: 700, color: "#059669", marginBottom: 4 }}>{t.paymentSuccess}</h3>
//             <p className="cap" style={{ marginBottom: 20 }}>Transaction completed successfully</p>
//             <div className="card" style={{ marginBottom: 16, textAlign: "left" }}>
//               {[
//                 [t.refNo, ref, "a"],
//                 [t.name, bill?.name, ""],
//                 [t.amount, `₹${bill?.amount}`, ""],
//                 ["Date", new Date().toLocaleDateString("en-IN"), ""],
//                 ["Payment", pm?.toUpperCase(), ""],
//                 ["Status", "SUCCESS", "s"]
//               ].map(([k, v, h]) => (
//                 <div className="rrow" key={k}>
//                   <span className="cap">{k}</span>
//                   <span style={{ fontSize: "clamp(12px,1.4vw,15px)", fontWeight: h ? "600" : "400", color: h === "s" ? "#059669" : h === "a" ? c.color : "#0F172A", fontFamily: h === "a" ? "Space Grotesk" : undefined }}>{v}</span>
//                 </div>
//               ))}
//             </div>
//             <button className="btn" style={{ background: "#059669", color: "white", marginBottom: 10 }}>🖨️ {t.downloadReceipt}</button>
//             <button className="btn btn-g" style={{ width: "100%", justifyContent: "center" }} onClick={() => setScreen("home")}>{t.newTransaction}</button>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }