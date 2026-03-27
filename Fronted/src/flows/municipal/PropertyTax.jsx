/**
 * flows/municipal/PropertyTax.jsx
 *
 * Dedicated Property Tax payment flow (separate from water bill).
 * Uses same BillPay api (api.lookupConsumer) via consumer number,
 * but also shows property details, arrears, and installment option.
 *
 * subType: "muni_proptax"
 *
 * API:
 *   GET  /api/consumers/:number   →  consumer + bill
 *   POST /api/payments/initiate   →  { referenceNo, upiString }
 *   GET  /api/payments/status/:ref
 *   GET  /api/payments/receipt/:ref
 */

import { useState, useEffect, useRef, useCallback } from "react";
import api from "../../api/kioskApi";

const C  = "#8B5CF6";
const L  = "#F5F3FF";

// ── Shared UI ─────────────────────────────────────────────────────────────────
function Btn({ children, onClick, disabled, ghost, color = C }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      width:"100%", minHeight:"clamp(52px,6vw,62px)",
      border: ghost ? `2px solid ${color}` : "none", borderRadius:14,
      background: ghost ? "white" : disabled ? "#E2E8F0" : color,
      color: ghost ? color : disabled ? "#94A3B8" : "white",
      fontFamily:"var(--font-body)", fontSize:"clamp(15px,1.8vw,18px)",
      fontWeight:700, cursor: disabled ? "not-allowed" : "pointer",
      display:"flex", alignItems:"center", justifyContent:"center", gap:8,
      opacity: disabled ? 0.6 : 1, transition:"opacity .2s",
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
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center",
      padding:"clamp(9px,1.1vw,13px) 0", borderBottom:"1px solid #F1F5F9", gap:12 }}>
      <span style={{ fontSize:"clamp(13px,1.4vw,15px)", color:"#64748B",
        fontWeight:500, flexShrink:0 }}>{label}</span>
      <span style={{ fontSize: hi?"clamp(14px,1.6vw,17px)":"clamp(13px,1.4vw,15px)",
        fontWeight: hi?700:500, color: hc||"#0A2342", textAlign:"right",
        fontFamily: hi?"var(--font-head)":"var(--font-body)" }}>{val}</span>
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
  const STEPS = ["Property", "Bill", "Pay", "Done"];
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

// Payment method picker
function PayPicker({ sel, onSel }) {
  const methods = [
    { k:"UPI",        name:"UPI — Scan & Pay",      sub:"GPay · PhonePe · Paytm · BHIM", rec:true },
    { k:"CARD",       name:"Debit / Credit Card",   sub:"Visa · Mastercard · RuPay" },
    { k:"NETBANKING", name:"Net Banking",            sub:"All major Indian banks" },
  ];
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
      {methods.map(m => {
        const active = sel === m.k;
        return (
          <button key={m.k} onClick={() => onSel(m.k)} style={{
            display:"flex", alignItems:"center", gap:16, position:"relative",
            minHeight:"clamp(64px,7vw,76px)", padding:"clamp(14px,1.6vw,18px)",
            border:`2px solid ${active ? C : "#E2E8F0"}`, borderRadius:14,
            background: active ? `${C}12` : "white", cursor:"pointer", textAlign:"left",
            transition:"border-color .2s, background .2s",
          }}>
            {m.rec && (
              <span style={{ position:"absolute", top:-1, right:14,
                background:C, color:"white", fontSize:9, fontWeight:700,
                padding:"2px 8px", borderRadius:"0 0 6px 6px", letterSpacing:".05em" }}>
                RECOMMENDED
              </span>
            )}
            <div style={{ flex:1 }}>
              <div style={{ fontFamily:"var(--font-body)",
                fontSize:"clamp(14px,1.6vw,16px)", fontWeight:700,
                color: active ? C : "#0A2342" }}>{m.name}</div>
              <div style={{ fontSize:"clamp(11px,1.2vw,13px)", color:"#94A3B8", marginTop:2 }}>{m.sub}</div>
            </div>
            <div style={{ width:22, height:22, borderRadius:"50%",
              border:`2.5px solid ${active ? C : "#CBD5E1"}`,
              background: active ? C : "transparent",
              display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
              {active && <div style={{ width:8, height:8, borderRadius:"50%", background:"white" }} />}
            </div>
          </button>
        );
      })}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export function PropertyTax({ t, flow, setScreen }) {
  const [step,      setStep]     = useState(1);
  const [num,       setNum]      = useState("");
  const [data,      setData]     = useState(null);   // { consumer, bill }
  const [pm,        setPm]       = useState("");
  const [payData,   setPayData]  = useState(null);
  const [receipt,   setReceipt]  = useState(null);
  const [loading,   setLoading]  = useState(false);
  const [error,     setError]    = useState("");
  const [payStatus, setPayStatus]= useState("waiting"); // waiting|success|failed

  // Barcode scanner support
  const bufRef = useRef("");
  const timerRef = useRef(null);
  useEffect(() => {
    const handleKey = (e) => {
      if (step !== 1) return;
      if (e.key === "Enter") {
        const buf = bufRef.current.trim();
        if (buf.length >= 3) { setNum(buf); handleLookup(buf); }
        bufRef.current = "";
        return;
      }
      if (e.key.length === 1) {
        bufRef.current += e.key;
        clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => { bufRef.current = ""; }, 100);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [step]); // eslint-disable-line

  const handleLookup = useCallback(async (n) => {
    const consNum = (n || num).trim().toUpperCase();
    if (!consNum) { setError("Please enter Property / Assessment number."); return; }
    setError(""); setLoading(true);
    try {
      const result = await api.lookupConsumer(consNum);
      if (!result.bill) {
        setError("No pending property tax due for this number.");
        return;
      }
      setData(result);
      setStep(2);
    } catch (e) {
      setError(e.message);
    } finally { setLoading(false); }
  }, [num]);

  const handleInitiate = async () => {
    if (!pm) return;
    setError(""); setLoading(true);
    try {
      const r = await api.initiatePayment({
        consumerNumber: data.consumer.consumerNumber,
        billId:         data.bill.billId,
        amount:         data.bill.totalAmount,
        dept:           "municipal",
        paymentMethod:  pm,
      });
      setPayData(r);
      setStep(4);
      pollPayment(r.referenceNo);
    } catch (e) {
      setError(e.message);
    } finally { setLoading(false); }
  };

  // Poll payment status every 3s
  const pollPayment = useCallback((referenceNo) => {
    const iv = setInterval(async () => {
      try {
        const r = await api.checkPaymentStatus(referenceNo);
        if (r.status === "Success") {
          clearInterval(iv);
          setPayStatus("success");
          const rec = await api.getReceipt(referenceNo);
          setReceipt(rec.receipt);
          setStep(5);
        } else if (r.status === "Failed") {
          clearInterval(iv);
          setPayStatus("failed");
        }
      } catch (_) {}
    }, 3000);
    setTimeout(() => clearInterval(iv), 300000); // 5 min timeout
  }, []);

  const qrUrl = payData
    ? `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
        pm === "UPI"
          ? (payData.upiString || `upi://pay?pa=amc-kiosk@sbi&am=${data?.bill?.totalAmount}&tn=PropertyTax`)
          : (payData.paymentLink || `https://pay.amc.gov.in/pay?ref=${payData.referenceNo}`)
      )}&qzone=2&format=png`
    : "";

  return (
    <div style={{ flex:1, display:"flex", flexDirection:"column", background:"#F0F4F8" }}>

      {/* Header */}
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
            border:`1.5px solid #DDD6FE`, display:"flex", alignItems:"center",
            justifyContent:"center", flexShrink:0 }}>
            <svg width={22} height={22} viewBox="0 0 24 24" fill={C}>
              <path d="M3 13H1V11H3V13ZM3 19H1V17H3V19ZM3 7H1V5H3V7ZM7 13H21V11H7V13ZM7 19H21V17H7V19ZM7 5V7H21V5H7Z"/>
            </svg>
          </div>
          <div>
            <h2 style={{ fontFamily:"var(--font-head)", fontSize:"clamp(16px,2vw,24px)",
              fontWeight:700, color:"#0A2342", margin:0 }}>Property Tax Payment</h2>
            <p style={{ fontFamily:"var(--font-body)", fontSize:12, color:"#94A3B8", marginTop:3 }}>
              Ajmer Municipal Corporation · AMC
            </p>
          </div>
        </div>
      </div>

      <StepBar step={step} />

      {/* Content */}
      <div style={{ flex:1, overflowY:"auto" }}>
        <div style={{ maxWidth:680, margin:"0 auto",
          padding:"clamp(20px,2.5vw,32px) clamp(16px,2.5vw,40px) 60px" }}>

          {/* ── Step 1: Property number ── */}
          {step === 1 && (
            <>
              <div style={{ background:"#EFF6FF", border:"1.5px solid #BFDBFE", borderRadius:12,
                padding:"clamp(12px,1.4vw,16px)", color:"#1E40AF",
                fontSize:"clamp(12px,1.3vw,14px)", fontFamily:"var(--font-body)",
                lineHeight:1.6, marginBottom:16 }}>
                Enter your <strong>Property Assessment Number</strong> (found on your previous tax receipt or AMC allotment letter).<br/>
                Demo: Try <strong>M001</strong>
              </div>

              <ErrBox msg={error} />

              <div style={{ marginBottom:16 }}>
                <label style={{ display:"block", fontFamily:"var(--font-body)", fontSize:12,
                  fontWeight:700, color:"#64748B", marginBottom:8,
                  letterSpacing:".06em", textTransform:"uppercase" }}>
                  Property / Assessment Number
                </label>
                <input value={num}
                  onChange={e => { setNum(e.target.value.toUpperCase()); setError(""); }}
                  onKeyDown={e => e.key === "Enter" && handleLookup()}
                  placeholder="e.g. M001" autoFocus
                  style={{ width:"100%", height:"clamp(50px,5.5vw,58px)", padding:"0 16px",
                    fontFamily:"var(--font-body)", fontSize:"clamp(15px,1.7vw,17px)",
                    color:"#0A2342", background:"#F8FAFC",
                    border:`2px solid ${error ? "#FECACA" : "#E2E8F0"}`,
                    borderRadius:12, outline:"none", boxSizing:"border-box" }} />
              </div>
              <Btn onClick={() => handleLookup()} disabled={!num.trim() || loading}>
                {loading ? "Fetching details…" : "Fetch Property Details →"}
              </Btn>

              {/* Help section */}
              <Card style={{ marginTop:16, background:"#FAFAFA" }}>
                <p style={{ fontFamily:"var(--font-body)", fontSize:12, fontWeight:700,
                  letterSpacing:".07em", textTransform:"uppercase", color:"#94A3B8", marginBottom:12 }}>
                  Where to find your Assessment Number?
                </p>
                {[
                  ["Previous Tax Receipt", "Printed at the top as 'Property No.' or 'Assess. No.'"],
                  ["AMC Allotment Letter", "Sent when property was registered with AMC"],
                  ["AMC Office", "Visit Ward office with property documents"],
                ].map(([title, desc]) => (
                  <div key={title} style={{ display:"flex", gap:10, marginBottom:10, alignItems:"flex-start" }}>
                    <div style={{ width:8, height:8, borderRadius:"50%", background:C,
                      flexShrink:0, marginTop:5 }} />
                    <div>
                      <div style={{ fontFamily:"var(--font-body)", fontSize:"clamp(13px,1.4vw,15px)",
                        fontWeight:600, color:"#0A2342" }}>{title}</div>
                      <div style={{ fontSize:"clamp(11px,1.2vw,13px)", color:"#64748B", marginTop:2 }}>{desc}</div>
                    </div>
                  </div>
                ))}
              </Card>
            </>
          )}

          {/* ── Step 2: Property + Bill details ── */}
          {step === 2 && data && (
            <>
              {data.bill.isOverdue && (
                <div style={{ background:"#FEF2F2", border:"1.5px solid #FECACA",
                  borderRadius:12, padding:"12px 16px", color:"#B91C1C",
                  fontFamily:"var(--font-body)", fontSize:14, marginBottom:16, fontWeight:600 }}>
                  ⚠️ This property tax is <strong>OVERDUE</strong>. A late penalty may apply.
                </div>
              )}

              <Card>
                <p style={{ fontFamily:"var(--font-body)", fontSize:11, fontWeight:700,
                  letterSpacing:".08em", textTransform:"uppercase",
                  color:"#94A3B8", marginBottom:12 }}>Property Details</p>
                <Row label="Owner Name"       val={data.consumer.name} />
                <Row label="Assessment No."   val={data.consumer.consumerNumber} />
                <Row label="Property Address" val={data.consumer.address} />
                <Row label="Category"         val={data.consumer.category || "Domestic"} />
                {data.consumer.provider && <Row label="AMC Ward" val={data.consumer.provider} />}
              </Card>

              <Card>
                <p style={{ fontFamily:"var(--font-body)", fontSize:11, fontWeight:700,
                  letterSpacing:".08em", textTransform:"uppercase",
                  color:"#94A3B8", marginBottom:12 }}>Tax Assessment — {data.bill.billMonth}</p>
                <Row label="Base Tax Amount"  val={`₹${data.bill.amount?.toLocaleString("en-IN")}`} />
                <Row label="Surcharge / Fees" val={`₹${data.bill.taxes?.toLocaleString("en-IN")}`} />
                <Row label="Due Date"         val={data.bill.dueDate} />
                <Row label="Status"           val={data.bill.status}
                  hi hc={data.bill.isOverdue ? "#DC2626" : "#D97706"} />
              </Card>

              {/* Total */}
              <div style={{ background:L, border:`1.5px solid #DDD6FE`,
                borderRadius:14, padding:"16px 20px",
                display:"flex", justifyContent:"space-between",
                alignItems:"center", marginBottom:16 }}>
                <span style={{ fontFamily:"var(--font-body)", fontSize:15,
                  color:"#64748B", fontWeight:600 }}>Total Tax Due</span>
                <span style={{ fontFamily:"var(--font-head)",
                  fontSize:"clamp(28px,3.5vw,40px)", fontWeight:800, color:C }}>
                  ₹{data.bill.totalAmount?.toLocaleString("en-IN")}
                </span>
              </div>

              <Btn onClick={() => setStep(3)}>Select Payment Method →</Btn>
            </>
          )}

          {/* ── Step 3: Payment method ── */}
          {step === 3 && (
            <>
              <ErrBox msg={error} />
              <p style={{ fontFamily:"var(--font-body)", fontSize:11, fontWeight:700,
                letterSpacing:".08em", textTransform:"uppercase",
                color:"#94A3B8", marginBottom:14 }}>Choose Payment Method</p>
              <PayPicker sel={pm} onSel={setPm} />
              {pm && (
                <>
                  <div style={{ height:14 }} />
                  <div style={{ background:"#F0FDF4", border:"1.5px solid #BBF7D0",
                    borderRadius:12, padding:"12px 16px", marginBottom:16,
                    fontFamily:"var(--font-body)", fontSize:13, color:"#166534" }}>
                    ✅ A <strong>QR Code</strong> will appear — scan with your phone to pay
                    ₹{data?.bill?.totalAmount?.toLocaleString("en-IN")}
                  </div>
                  <Btn onClick={handleInitiate} disabled={loading}>
                    {loading ? "Generating QR Code…" : `Generate QR — ₹${data?.bill?.totalAmount?.toLocaleString("en-IN")}`}
                  </Btn>
                </>
              )}
            </>
          )}

          {/* ── Step 4: QR Payment ── */}
          {step === 4 && payData && (
            <div>
              {/* Amount row */}
              <div style={{ background:L, border:`1.5px solid #DDD6FE`, borderRadius:14,
                padding:"14px 20px", display:"flex", justifyContent:"space-between",
                alignItems:"center", marginBottom:20 }}>
                <div>
                  <div style={{ fontFamily:"var(--font-body)", fontSize:12,
                    color:"#64748B", fontWeight:600 }}>Total Amount</div>
                  <div style={{ fontFamily:"var(--font-head)",
                    fontSize:"clamp(28px,3.5vw,40px)", fontWeight:800, color:C }}>
                    ₹{data.bill.totalAmount?.toLocaleString("en-IN")}
                  </div>
                  <div style={{ fontSize:12, color:"#94A3B8", marginTop:3 }}>
                    {data.consumer.name} · Property Tax
                  </div>
                </div>
                {/* Simple 5-min countdown */}
                <div style={{ textAlign:"center", background:"white", borderRadius:12,
                  padding:"12px 16px", border:"1.5px solid #E2E8F0" }}>
                  <div style={{ fontFamily:"var(--font-body)", fontSize:11,
                    color:"#94A3B8", fontWeight:600, marginBottom:4 }}>EXPIRES IN</div>
                  <div style={{ fontFamily:"var(--font-head)", fontSize:20,
                    fontWeight:800, color:C }}>5:00</div>
                </div>
              </div>

              {/* QR Card */}
              <Card style={{ textAlign:"center", padding:"clamp(20px,2.5vw,32px)" }}>
                <p style={{ fontFamily:"var(--font-head)", fontSize:"clamp(15px,1.8vw,19px)",
                  fontWeight:800, color:"#0A2342", marginBottom:6 }}>
                  {pm === "UPI" ? "Scan UPI QR Code" : "Scan to Pay"}
                </p>
                <p style={{ fontFamily:"var(--font-body)", fontSize:"clamp(12px,1.3vw,14px)",
                  color:"#64748B", marginBottom:20, lineHeight:1.5 }}>
                  {pm === "UPI"
                    ? "Open GPay / PhonePe / Paytm / BHIM → Scan QR → Pay"
                    : "Scan QR → Payment page opens → Complete payment"}
                </p>

                <div style={{ display:"inline-block", border:`5px solid ${C}`, borderRadius:16, padding:10,
                  boxShadow:`0 0 0 3px white, 0 0 0 5px ${C}25` }}>
                  <img src={qrUrl} alt="Payment QR" width={220} height={220}
                    style={{ borderRadius:8, display:"block" }} />
                </div>

                {/* Live waiting indicator */}
                <div style={{ marginTop:20, display:"inline-flex", alignItems:"center", gap:10,
                  background:"#F0FDF4", border:"1px solid #BBF7D0", borderRadius:999, padding:"8px 18px" }}>
                  <div style={{ width:9, height:9, borderRadius:"50%", background:"#16A34A",
                    animation:"propTaxPulse 1.4s ease-in-out infinite" }} />
                  <span style={{ fontFamily:"var(--font-body)", fontSize:13,
                    fontWeight:600, color:"#166534" }}>Waiting for payment confirmation…</span>
                </div>
              </Card>

              {/* Steps */}
              <Card style={{ marginBottom:12 }}>
                <p style={{ fontFamily:"var(--font-body)", fontSize:11, fontWeight:700,
                  letterSpacing:".08em", textTransform:"uppercase", color:"#94A3B8", marginBottom:14 }}>
                  How to Pay
                </p>
                {(pm === "UPI"
                  ? ["Open UPI app (GPay / PhonePe / Paytm / BHIM)",
                     "Tap 'Scan QR' and scan the code above",
                     `Enter ₹${data?.bill?.totalAmount?.toLocaleString("en-IN")} and confirm`,
                     "Receipt will appear here automatically ✓"]
                  : ["Scan the QR code with your phone camera",
                     "Payment page will open in your browser",
                     "Enter card / bank details and complete payment",
                     "Receipt will appear here automatically ✓"]
                ).map((text, i) => (
                  <div key={i} style={{ display:"flex", gap:12, alignItems:"flex-start", marginBottom:10 }}>
                    <div style={{ width:22, height:22, borderRadius:"50%",
                      background:`${C}18`, border:`1.5px solid ${C}40`,
                      display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                      <span style={{ fontSize:11, fontWeight:800, color:C }}>{i + 1}</span>
                    </div>
                    <span style={{ fontFamily:"var(--font-body)", fontSize:"clamp(12px,1.4vw,14px)",
                      color:"#374151", lineHeight:1.5 }}>{text}</span>
                  </div>
                ))}
              </Card>

              <Btn ghost onClick={() => setStep(3)} color="#94A3B8">← Back / Change Method</Btn>
            </div>
          )}

          {/* ── Step 5: Receipt ── */}
          {step === 5 && (
            <div style={{ textAlign:"center" }}>
              <div style={{ width:"clamp(72px,9vw,96px)", height:"clamp(72px,9vw,96px)",
                borderRadius:"50%", background:"#DCFCE7", border:"3px solid #86EFAC",
                display:"flex", alignItems:"center", justifyContent:"center",
                margin:"0 auto clamp(16px,2vw,24px)", animation:"propTaxPop .5s ease" }}>
                <svg width={44} height={44} viewBox="0 0 24 24" fill="#16A34A">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                </svg>
              </div>

              <h3 style={{ fontFamily:"var(--font-head)",
                fontSize:"clamp(20px,2.8vw,30px)", fontWeight:800,
                color:"#0A2342", marginBottom:6 }}>Tax Paid Successfully! 🎉</h3>
              <p style={{ fontFamily:"var(--font-body)", fontSize:14, color:"#64748B", marginBottom:24 }}>
                Property tax payment confirmed by AMC
              </p>

              <Card style={{ textAlign:"left" }}>
                <p style={{ fontFamily:"var(--font-body)", fontSize:11, fontWeight:700,
                  letterSpacing:".08em", textTransform:"uppercase", color:"#94A3B8", marginBottom:12 }}>
                  Payment Receipt
                </p>
                <Row label="Reference No."    val={receipt?.referenceNo || payData?.referenceNo} hi hc={C} />
                <Row label="Property Owner"   val={receipt?.consumerName || data?.consumer?.name} />
                <Row label="Assessment No."   val={data?.consumer?.consumerNumber} />
                <Row label="Tax Period"       val={receipt?.billMonth || data?.bill?.billMonth} />
                <Row label="Amount Paid"      val={`₹${(receipt?.amount || data?.bill?.totalAmount)?.toLocaleString("en-IN")}`} hi hc="#0A2342" />
                <Row label="Payment Method"   val={receipt?.paymentMethod || pm} />
                <Row label="Date & Time"      val={receipt?.paidAt ? new Date(receipt.paidAt).toLocaleString("en-IN") : new Date().toLocaleString("en-IN")} />
                <Row label="Status"           val="PAID"  hi hc="#16A34A" />
              </Card>

              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                <Btn color="#16A34A" onClick={() => window.print()}>🖨 Print Receipt</Btn>
                <Btn ghost onClick={() => setScreen("home")}>Go to Home</Btn>
              </div>
            </div>
          )}

        </div>
      </div>

      <style>{`
        @keyframes propTaxPop { 0%{transform:scale(.4);opacity:0} 70%{transform:scale(1.1)} 100%{transform:scale(1);opacity:1} }
        @keyframes propTaxPulse { 0%,100%{box-shadow:0 0 0 0 rgba(22,163,74,.6)} 70%{box-shadow:0 0 0 8px rgba(22,163,74,0)} }
      `}</style>
    </div>
  );
}