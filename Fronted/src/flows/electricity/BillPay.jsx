/**
 * flows/BillPay.jsx
 *
 * SUVIDHA Kiosk — Bill Payment Flow
 * ════════════════════════════════════
 * Design Language: DeptScreen.jsx
 * ✅ Professional Govt. UI — light bg, blue gradient, authoritative
 * ✅ Bilingual Hindi / English (Hindi primary)
 * ✅ SVG icons only — zero emojis
 * ✅ Responsive: Kiosk 1280px · Laptop 1024px · Mobile 360px
 * ✅ Elder/Senior mode support
 * ✅ Staggered entry animations
 * ✅ Mock API fallback built-in
 * ✅ All 5 steps: Account → Bill → Payment → Scan → Done
 */

import { useState, useRef, useEffect, useCallback } from "react";

// ─── Safe API import ──────────────────────────────────────────────
let _api;
try { _api = require("../../api/kioskApi").default; } catch (_) { _api = null; }

const MOCK = {
  "1001": { consumer:{ consumerNumber:"1001", name:"Ramesh Kumar Sharma",  address:"B-12, Shastri Nagar, Jaipur 302016",  meterNumber:"MTR-884532", provider:"AVVNL" }, bill:{ billId:"B1001", billMonth:"March 2025", units:312, amount:2340, taxes:234, totalAmount:2574, dueDate:"31 Mar 2025", isOverdue:true  } },
  "1002": { consumer:{ consumerNumber:"1002", name:"Sunita Devi Gupta",   address:"45, Vaishali Nagar, Jaipur 302021",    meterNumber:"MTR-221984", provider:"AVVNL" }, bill:{ billId:"B1002", billMonth:"March 2025", units:189, amount:1420, taxes:142, totalAmount:1562, dueDate:"31 Mar 2025", isOverdue:false } },
  "1003": { consumer:{ consumerNumber:"1003", name:"Mohammad Aslam Khan", address:"C-7, Malviya Nagar, Jaipur 302017",    meterNumber:"MTR-556123", provider:"AVVNL" }, bill:{ billId:"B1003", billMonth:"March 2025", units:445, amount:3340, taxes:334, totalAmount:3674, dueDate:"28 Mar 2025", isOverdue:true  } },
};
async function apiLookup(n) {
  if (_api?.lookupConsumer) return _api.lookupConsumer(n);
  await new Promise(r => setTimeout(r, 700));
  const d = MOCK[n];
  if (!d) throw new Error(`Consumer "${n}" not found. Try: 1001, 1002, 1003`);
  return d;
}
async function apiInitiate(p) {
  if (_api?.initiatePayment) return _api.initiatePayment(p);
  await new Promise(r => setTimeout(r, 900));
  return { referenceNo: "PAY-" + Date.now(), upiString: `upi://pay?pa=avvnl-kiosk@axisbank&pn=AVVNL&am=${p.amount}&cu=INR`, paymentLink: `https://pay.avvnl.gov.in/pay?ref=REF${Date.now()}` };
}
async function apiStatus(ref) { if (_api?.checkPaymentStatus) return _api.checkPaymentStatus(ref); return { status: "Pending" }; }
async function apiReceipt(ref) { if (_api?.getReceipt) return _api.getReceipt(ref); return { receipt: null }; }

// ─── Global CSS ───────────────────────────────────────────────────
const BP_CSS = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700;9..40,800;9..40,900&family=DM+Mono:wght@500;600;700&family=Noto+Sans+Devanagari:wght@400;500;600;700;800&display=swap');

:root {
  --bp-sans: 'DM Sans','Noto Sans Devanagari','Segoe UI',system-ui,sans-serif;
  --bp-mono: 'DM Mono','Courier New',monospace;
}

@keyframes bp-fade-up  { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
@keyframes bp-fade-in  { from{opacity:0} to{opacity:1} }
@keyframes bp-scale-in { from{opacity:0;transform:scale(.92)} to{opacity:1;transform:scale(1)} }
@keyframes bp-spin     { to{transform:rotate(360deg)} }
@keyframes bp-scan     { 0%{top:4px;opacity:1} 44%{top:calc(100% - 4px);opacity:.5} 50%{opacity:0} 55%{top:4px;opacity:0} 60%{opacity:1} 100%{top:calc(100% - 4px);opacity:.5} }
@keyframes bp-dot-beat { 0%,100%{box-shadow:0 0 0 0 rgba(22,163,74,.4)} 50%{box-shadow:0 0 0 7px rgba(22,163,74,0)} }
@keyframes bp-pulse    { 0%,100%{opacity:1} 50%{opacity:.35} }
@keyframes bp-check-in { 0%{transform:scale(.3);opacity:0} 60%{transform:scale(1.1)} 100%{transform:scale(1);opacity:1} }

.bp-root { font-family: var(--bp-sans); }
.bp-root *, .bp-root *::before, .bp-root *::after { box-sizing: border-box; }
.bp-root button, .bp-root input, .bp-root label, .bp-root select, .bp-root textarea { font-family: var(--bp-sans) !important; }

.bp-fade-up  { animation: bp-fade-up  .36s ease both; }
.bp-fade-in  { animation: bp-fade-in  .22s ease both; }
.bp-scale-in { animation: bp-scale-in .38s cubic-bezier(.34,1.56,.64,1) both; }
.bp-check-in { animation: bp-check-in .44s cubic-bezier(.34,1.56,.64,1) both; }

.bp-scr::-webkit-scrollbar       { width: 4px; }
.bp-scr::-webkit-scrollbar-track { background: #F0F4F9; }
.bp-scr::-webkit-scrollbar-thumb { background: #C8D8E8; border-radius: 99px; }

/* Card */
.bp-card {
  background: white;
  border: 1.5px solid #DDE6F0;
  border-radius: 14px;
  padding: clamp(14px,1.8vw,22px);
  box-shadow: 0 1px 4px rgba(7,24,56,.05), 0 4px 16px rgba(7,24,56,.03);
  margin-bottom: 12px;
}

/* Service card style input focus */
.bp-input-focus:focus {
  outline: none;
  border-color: var(--bp-accent, #1558A0) !important;
  box-shadow: 0 0 0 3px rgba(21,88,160,.10);
}

/* Stagger delays */
.bp-s1 { animation-delay: .05s }
.bp-s2 { animation-delay: .10s }
.bp-s3 { animation-delay: .15s }
.bp-s4 { animation-delay: .20s }
.bp-s5 { animation-delay: .25s }

/* Section label — matches DeptScreen */
.bp-sec-label {
  font-family: var(--bp-sans);
  font-size: clamp(9px,.9vw,11px);
  font-weight: 800;
  letter-spacing: .1em;
  text-transform: uppercase;
  color: #94A3B8;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
}
.bp-sec-label::after {
  content: '';
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, #E2E8F0 0%, transparent 100%);
}

/* Method card hover */
.bp-method-card {
  display: flex;
  align-items: center;
  gap: clamp(11px,1.6vw,16px);
  min-height: clamp(64px,7.5vw,80px);
  padding: clamp(12px,1.7vw,17px) clamp(14px,2vw,20px);
  border-radius: 12px;
  cursor: pointer;
  text-align: left;
  position: relative;
  transition: border-color .18s, background .18s, box-shadow .18s;
  width: 100%;
  border: 1.5px solid #DDE6F0;
  background: white;
  margin-bottom: 9px;
}

/* Breadcrumb */
.bp-breadcrumb {
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: var(--bp-sans);
  font-size: clamp(10px,1vw,12px);
  color: #7A96B0;
  font-weight: 500;
}
.bp-breadcrumb-sep {
  width: 4px; height: 4px;
  border-radius: 50%;
  background: #CBD5E1;
  flex-shrink: 0;
}

/* Focus ring */
.bp-root *:focus-visible {
  outline: 2.5px solid #1558A0;
  outline-offset: 3px;
  border-radius: 4px;
}
`;

// ─── SVG ICONS ────────────────────────────────────────────────────
function Ic({ path, size = 20, color = "currentColor", style: s }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}
      aria-hidden="true" style={{ flexShrink: 0, display: "block", ...s }}>
      <path d={path} />
    </svg>
  );
}

const P = {
  back:    "M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z",
  check:   "M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z",
  warn:    "M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z",
  refresh: "M17.65 6.35A7.96 7.96 0 0012 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0112 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z",
  home:    "M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z",
  print:   "M19 8H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3zm-3 11H8v-5h8v5zm3-7c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-1-9H6v4h12V3z",
  elec:    "M7 2v11h3v9l7-12h-4l4-8z",
  gas:     "M13.5.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5.67zM11.71 19c-1.78 0-3.22-1.4-3.22-3.14 0-1.62 1.05-2.76 2.81-3.12 1.77-.36 3.6-1.21 4.62-2.58.39 1.29.59 2.65.59 4.04 0 2.65-2.15 4.8-4.8 4.8z",
  muni:    "M12 3L2 12h3v9h6v-5h2v5h6v-9h3L12 3z",
  water:   "M12 2c-5.33 4.55-8 8.48-8 11.8 0 4.98 3.8 8.2 8 8.2s8-3.22 8-8.2c0-3.32-2.67-7.25-8-11.8z",
  card:    "M20 4H4c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z",
  bank:    "M2 10v3h.5v7h3v-7H8v7h3v-7h2.5v7h3v-7H19V13H22v-3L12 2 2 10zm10 10h-1v-7h1v7z",
  scan:    "M9.5 6.5v3h-3v-3h3M11 5H5v6h6V5zm-1.5 9.5v3h-3v-3h3M11 13H5v6h6v-6zm6.5-6.5v3h-3v-3h3M19 5h-6v6h6V5zm-6 8h1.5v1.5H13V13zm1.5 1.5H16V16h-1.5v-1.5zM16 13h1.5v1.5H16V13zm-3 3h1.5v1.5H13V16zm1.5 1.5H16V19h-1.5v-1.5zM16 16h1.5v1.5H16V16zm1.5-1.5H19V16h-1.5v-1.5zm0 3H19V19h-1.5v-1.5z",
  shield:  "M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z",
  person:  "M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z",
  rupee:   "M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16C9.06 5.58 7.5 6.84 7.5 8.77c0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-3-2.1H7.32c.14 2.19 1.78 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z",
  clock:   "M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z",
  chevR:   "M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z",
  infoI:   "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z",
  upiLogo: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z",
};

// ─── DEPT THEME MAP ───────────────────────────────────────────────
const DEPT = {
  electricity: { accent:"#1558A0", accentD:"#0E4080", grad:"linear-gradient(135deg,#1254A0,#1E7AD4)", light:"#EBF4FF", lb:"#BFDBF7", icon:P.elec,  label:"Electricity", labelHi:"बिजली",       provider:"AVVNL" },
  gas:         { accent:"#B84A0A", accentD:"#8C360A", grad:"linear-gradient(135deg,#A03D08,#CF540F)", light:"#FFF4ED", lb:"#F5C6A0", icon:P.gas,   label:"Gas",         labelHi:"गैस",         provider:"AVVNL Gas" },
  municipal:   { accent:"#5B1A9C", accentD:"#4A1580", grad:"linear-gradient(135deg,#4A1580,#7B3EC8)", light:"#F5F0FF", lb:"#D4C0F5", icon:P.muni,  label:"Municipal",   labelHi:"नगर पालिका",  provider:"AMC" },
  water:       { accent:"#0C6E82", accentD:"#0A5C6E", grad:"linear-gradient(135deg,#0A5C6E,#0E8EA6)", light:"#E8FAFB", lb:"#9FD9E0", icon:P.water, label:"Water",       labelHi:"पानी",        provider:"PHED" },
};

const STEP_NAMES = {
  en: ["Account", "Bill Details", "Payment", "Scan & Pay", "Done"],
  hi: ["खाता", "बिल", "भुगतान", "स्कैन", "पूर्ण"],
};

// ─── BILINGUAL STRINGS ────────────────────────────────────────────
const S = {
  en: {
    title:"Bill Payment", titleHi:"बिल भुगतान",
    breadHome:"Home", breadDept:"Department",
    step1Head:"Enter Consumer Number",
    step1Info:"Enter the Consumer / Account Number printed on your electricity bill.",
    step1Demo:"Demo accounts: 1001, 1002, or 1003",
    inputLabel:"Consumer / Account Number", inputPH:"e.g.  1001",
    scanHint:"Barcode scanner supported — scan bill directly",
    searchBtn:"View Bill Details", searching:"Fetching...",
    secInfo:"Consumer Details", billInfo:"Bill Details",
    totalPayable:"Total Payable",
    overdueTitle:"Bill Overdue", overdueDesc:"Pay immediately to avoid disconnection.",
    proceedBtn:"Choose Payment Method",
    chooseMethod:"Select Payment Method",
    methodNote:"A QR code will be generated on the next screen.",
    genQR:"Generate QR Code", genQRing:"Generating...",
    recUPI:"Recommended",
    methUPI:"UPI — Scan & Pay", methUPIsub:"GPay · PhonePe · Paytm · BHIM",
    methCARD:"Debit / Credit Card", methCARDsub:"Visa · Mastercard · RuPay",
    methNB:"Net Banking", methNBsub:"All Indian Banks",
    qrHead:"Scan to Pay",
    qrSubUPI:"Open your UPI app and scan the QR code below",
    qrSubOther:"Scan with your phone to open the payment page",
    timeLeft:"Time Left",
    waitPay:"Awaiting payment",
    howToPay:"How to Pay",
    stepsList:{
      UPI:["Open GPay / PhonePe / Paytm / BHIM","Select 'Scan QR Code'","Scan the QR code shown above","Confirm amount and tap Pay","Receipt will appear automatically"],
      CARD:["Scan the QR code with your phone","Payment page opens on your phone","Enter your card details and OTP","Confirm and complete the payment","Receipt will appear automatically"],
      NETBANKING:["Scan the QR code with your phone","Payment page opens on your phone","Select your bank and log in","Complete the payment online","Receipt will appear automatically"],
    },
    cancelBtn:"Back",
    payOK:"Payment Successful", payOKsub:"Generating your receipt...",
    payFail:"Payment Failed", payFailSub:"Please try again or choose another method.",
    tryAgain:"Try Again",
    expired:"QR Code Expired", expiredSub:"5-minute limit reached. Please generate a new QR code.",
    newQR:"Generate New QR",
    recHead:"Bill Paid Successfully", recSub:"Your payment has been confirmed.",
    receipt:"Payment Receipt",
    refNo:"Reference No.", conNo:"Consumer No.", conName:"Consumer Name",
    billMonth:"Bill Period", units:"Units Consumed",
    billAmt:"Bill Amount", taxes:"Taxes & Charges",
    totalAmt:"Total Paid", payMethod:"Payment Method",
    dueDate:"Due Date", dateTime:"Date & Time", statusLbl:"Status",
    provider:"Service Provider", address:"Address", meter:"Meter No.",
    printBtn:"Print Receipt", homeBtn:"Go to Home", newBillBtn:"Pay Another Bill",
    errEmpty:"Please enter a consumer number.", errGeneral:"Something went wrong. Please try again.",
    secure:"Secure · Encrypted · Government Portal",
    stepLbl:"Step", ofLbl:"of",
    upiId:"UPI ID",
  },
  hi: {
    title:"बिल भुगतान", titleHi:"Bill Payment",
    breadHome:"होम", breadDept:"विभाग",
    step1Head:"Consumer Number दर्ज करें",
    step1Info:"बिजली बिल पर लिखा Consumer / Account Number यहाँ दर्ज करें।",
    step1Demo:"Demo: 1001, 1002, या 1003 आज़माएं",
    inputLabel:"Consumer / Account Number", inputPH:"जैसे:  1001",
    scanHint:"Barcode scanner से बिल सीधे scan करें",
    searchBtn:"बिल देखें", searching:"जानकारी मिल रही है...",
    secInfo:"ग्राहक की जानकारी", billInfo:"बिल की जानकारी",
    totalPayable:"कुल जमा राशि",
    overdueTitle:"बिल बकाया है", overdueDesc:"कनेक्शन कटने से बचने के लिए तुरंत भुगतान करें।",
    proceedBtn:"भुगतान का तरीका चुनें",
    chooseMethod:"भुगतान का तरीका चुनें",
    methodNote:"अगली स्क्रीन पर QR कोड दिखाया जाएगा।",
    genQR:"QR कोड बनाएं", genQRing:"QR बन रहा है...",
    recUPI:"सबसे आसान",
    methUPI:"UPI — स्कैन करके पेमेंट", methUPIsub:"GPay · PhonePe · Paytm · BHIM",
    methCARD:"डेबिट / क्रेडिट कार्ड", methCARDsub:"Visa · Mastercard · RuPay",
    methNB:"नेट बैंकिंग", methNBsub:"सभी भारतीय बैंक",
    qrHead:"QR कोड स्कैन करें",
    qrSubUPI:"UPI app से QR स्कैन करें और भुगतान करें",
    qrSubOther:"फोन से QR स्कैन करें — पेमेंट पेज खुलेगा",
    timeLeft:"बचा समय",
    waitPay:"पेमेंट का इंतजार",
    howToPay:"पेमेंट कैसे करें",
    stepsList:{
      UPI:["GPay / PhonePe / Paytm / BHIM खोलें","QR Scan का option चुनें","ऊपर दिखा QR कोड स्कैन करें","राशि confirm करें और Pay करें","रसीद यहाँ अपने आप आ जाएगी"],
      CARD:["फोन से QR कोड स्कैन करें","Payment page फोन पर खुलेगा","Card details और OTP दर्ज करें","पेमेंट पूरा करें","रसीद यहाँ अपने आप आ जाएगी"],
      NETBANKING:["फोन से QR कोड स्कैन करें","Payment page फोन पर खुलेगा","Bank चुनें और login करें","पेमेंट पूरा करें","रसीद यहाँ अपने आप आ जाएगी"],
    },
    cancelBtn:"वापस जाएं",
    payOK:"पेमेंट सफल", payOKsub:"रसीद तैयार हो रही है...",
    payFail:"पेमेंट नहीं हुआ", payFailSub:"कृपया दोबारा कोशिश करें।",
    tryAgain:"दोबारा कोशिश करें",
    expired:"QR कोड Expire हो गया", expiredSub:"5 मिनट का समय खत्म। नया QR कोड बनाएं।",
    newQR:"नया QR बनाएं",
    recHead:"बिल जमा हो गया", recSub:"आपका भुगतान सफलतापूर्वक पूरा हुआ।",
    receipt:"भुगतान रसीद",
    refNo:"Reference No.", conNo:"खाता नंबर", conName:"नाम",
    billMonth:"बिल माह", units:"Units",
    billAmt:"बिल राशि", taxes:"टैक्स",
    totalAmt:"कुल जमा", payMethod:"पेमेंट तरीका",
    dueDate:"अंतिम तारीख", dateTime:"दिनांक व समय", statusLbl:"स्थिति",
    provider:"कंपनी", address:"पता", meter:"मीटर नं.",
    printBtn:"रसीद Print करें", homeBtn:"होम पेज", newBillBtn:"नया बिल भरें",
    errEmpty:"Consumer number दर्ज करें।", errGeneral:"कुछ गड़बड़ हुई। फिर से कोशिश करें।",
    secure:"सुरक्षित · एन्क्रिप्टेड · सरकारी पोर्टल",
    stepLbl:"चरण", ofLbl:"/",
    upiId:"UPI ID",
  },
};

// ─── INJECT CSS ───────────────────────────────────────────────────
function injectCSS() {
  if (document.getElementById("bp-v2-css")) return;
  const el = document.createElement("style");
  el.id = "bp-v2-css"; el.textContent = BP_CSS;
  document.head.appendChild(el);
}

// ═══════════════════════════════════════════════════════════════
//  ATOMS
// ═══════════════════════════════════════════════════════════════

// ── Card ─────────────────────────────────────────────────────────
function Card({ children, style = {} }) {
  return (
    <div className="bp-card" style={style}>{children}</div>
  );
}

// ── Section label (matches DeptScreen) ───────────────────────────
function SectionLabel({ children, accent }) {
  return (
    <div className="bp-sec-label" style={accent ? { color: accent } : {}}>
      {children}
    </div>
  );
}

// ── Data row ─────────────────────────────────────────────────────
function DataRow({ label, val, bold, accent = "#1558A0", last }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "clamp(9px,1.1vw,12px) 0", borderBottom: last ? "none" : "1px solid #EDF2F7", gap: 14 }}>
      <span style={{ fontFamily: "var(--bp-sans)", fontSize: "clamp(12px,1.2vw,14px)", color: "#4A6070", fontWeight: 500, flexShrink: 0 }}>{label}</span>
      <span style={{ fontFamily: bold ? "var(--bp-mono)" : "var(--bp-sans)", fontSize: bold ? "clamp(14px,1.7vw,19px)" : "clamp(12px,1.3vw,14px)", fontWeight: bold ? 700 : 500, color: bold ? accent : "#18283A", textAlign: "right", letterSpacing: bold ? "-.01em" : "normal", wordBreak: "break-word" }}>{val}</span>
    </div>
  );
}

// ── Error banner ─────────────────────────────────────────────────
function ErrBanner({ msg }) {
  if (!msg) return null;
  return (
    <div className="bp-fade-in" style={{ background: "#FEF2F2", border: "1.5px solid #FCA5A5", borderRadius: 10, padding: "clamp(11px,1.4vw,15px) clamp(13px,1.7vw,17px)", marginBottom: 13, display: "flex", gap: 11, alignItems: "flex-start" }}>
      <Ic path={P.warn} size={18} color="#DC2626" />
      <div>
        <div style={{ fontWeight: 700, color: "#991B1B", fontSize: "clamp(12px,1.2vw,14px)", fontFamily: "var(--bp-sans)" }}>Error</div>
        <div style={{ color: "#B91C1C", fontSize: "clamp(11px,1.1vw,13px)", marginTop: 2, fontFamily: "var(--bp-sans)" }}>{msg}</div>
      </div>
    </div>
  );
}

// ── Primary button ───────────────────────────────────────────────
function PBtn({ children, onClick, disabled, grad, accent, size = "lg", outline, danger, success }) {
  const heights = { lg: "clamp(52px,5.8vw,64px)", md: "clamp(44px,5vw,54px)", sm: "clamp(38px,4.3vw,46px)" };
  const fSizes  = { lg: "clamp(13px,1.5vw,16px)", md: "clamp(12px,1.4vw,15px)", sm: "clamp(11px,1.2vw,13px)" };
  let bg   = disabled ? "#E4EEF5" : grad;
  let clr  = disabled ? "#8AA0B4" : "white";
  let brd  = "none";
  let sh   = disabled ? "none" : `0 2px 12px ${accent}30`;
  if (outline) { bg = "white"; clr = disabled ? "#8AA0B4" : accent; brd = `1.5px solid ${disabled ? "#C8D8E8" : accent}`; sh = "none"; }
  if (danger)  { bg = "linear-gradient(135deg,#C81E1E,#DC2626)"; sh = "0 2px 10px rgba(220,38,38,.3)"; clr = "white"; brd = "none"; }
  if (success) { bg = "linear-gradient(135deg,#145A28,#16A34A)"; sh = "0 2px 10px rgba(22,163,74,.3)"; clr = "white"; brd = "none"; }
  return (
    <button onClick={onClick} disabled={disabled} style={{ width: "100%", minHeight: heights[size], border: brd, borderRadius: 10, background: bg, color: clr, fontSize: fSizes[size], fontFamily: "var(--bp-sans)", fontWeight: 700, cursor: disabled ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: sh, letterSpacing: ".01em", transition: "opacity .15s" }}>
      {children}
    </button>
  );
}

// ── Spinner ───────────────────────────────────────────────────────
function Spin({ color = "white" }) {
  return <div style={{ width: 17, height: 17, border: `2.5px solid ${color}40`, borderTopColor: color, borderRadius: "50%", animation: "bp-spin .85s linear infinite", flexShrink: 0 }} />;
}

// ── QR image ─────────────────────────────────────────────────────
function QRImg({ data, size = 220, accent = "#1558A0" }) {
  const hex = accent.replace("#", "");
  return (
    <img
      src={`https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(data)}&qzone=1&format=png&color=${hex}`}
      alt="Payment QR Code" width={size} height={size}
      style={{ display: "block", borderRadius: 6 }}
    />
  );
}

// ── Countdown ring ────────────────────────────────────────────────
function CountdownRing({ secs, total = 300, accent, label }) {
  const r = 26, circ = 2 * Math.PI * r;
  const offset = circ - (secs / total) * circ;
  const urgent = secs <= 60;
  return (
    <svg width={70} height={70} viewBox="0 0 70 70" style={{ flexShrink: 0 }}>
      <circle cx={35} cy={35} r={r} fill="white" />
      <circle cx={35} cy={35} r={r} fill="none" stroke="#E4EEF5" strokeWidth={5} />
      <circle cx={35} cy={35} r={r} fill="none" stroke={urgent ? "#DC2626" : accent} strokeWidth={5}
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round" transform="rotate(-90 35 35)"
        style={{ transition: "stroke-dashoffset 1s linear, stroke .3s" }}
      />
      <text x={35} y={31} textAnchor="middle" fontSize={12} fontWeight={700} fill={urgent ? "#DC2626" : "#18283A"} fontFamily="'DM Mono','Courier New',monospace">
        {Math.floor(secs / 60)}:{String(secs % 60).padStart(2, "0")}
      </text>
      <text x={35} y={46} textAnchor="middle" fontSize={8} fontWeight={600} fill="#7A96B0" fontFamily="'DM Sans','Segoe UI',sans-serif">{label}</text>
    </svg>
  );
}

// ═══════════════════════════════════════════════════════════════
//  STEP BAR — matches DeptScreen header style
// ═══════════════════════════════════════════════════════════════
function StepBar({ cur, accent, grad, lang }) {
  const steps = STEP_NAMES[lang] || STEP_NAMES.en;
  const pct   = ((cur - 1) / (steps.length - 1)) * 100;
  return (
    <div style={{ background: "white", borderBottom: "1px solid #DAE6F0", padding: "clamp(10px,1.4vw,15px) clamp(16px,3vw,44px)" }}>
      <div style={{ position: "relative", paddingBottom: "clamp(28px,3.5vw,38px)" }}>
        {/* Track */}
        <div style={{ position: "absolute", bottom: 0, left: 14, right: 14, height: 3, background: "#E4EEF5", borderRadius: 99 }}>
          <div style={{ height: "100%", borderRadius: 99, background: grad, width: `${pct}%`, transition: "width .45s ease" }} />
        </div>
        {/* Nodes */}
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          {steps.map((s, i) => {
            const done   = cur > i + 1;
            const active = cur === i + 1;
            return (
              <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
                <div style={{ width: "clamp(28px,3.2vw,38px)", height: "clamp(28px,3.2vw,38px)", borderRadius: "50%", background: done ? grad : active ? "white" : "#F0F5FA", border: done ? "none" : active ? `2.5px solid ${accent}` : "1.5px solid #C8D8E8", display: "flex", alignItems: "center", justifyContent: "center", transition: "all .3s", boxShadow: active ? `0 0 0 4px ${accent}15` : done ? "0 1px 5px rgba(0,0,0,.08)" : "none" }}>
                  {done
                    ? <Ic path={P.check} size={13} color="white" />
                    : <span style={{ fontSize: "clamp(9px,1vw,12px)", fontWeight: 700, color: active ? accent : "#94A3B8" }}>{i + 1}</span>
                  }
                </div>
                <span style={{ fontSize: "clamp(8px,.85vw,10px)", fontWeight: 600, color: active ? accent : done ? "#4A6070" : "#94A3B8", transition: "color .3s", lineHeight: 1, textAlign: "center", maxWidth: 50 }}>{s}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  PAYMENT METHOD PICKER
// ═══════════════════════════════════════════════════════════════
function MethodPicker({ sel, onSel, accent, grad, light, lb, s }) {
  const METHODS = [
    { k: "UPI",        icon: P.scan,  title: s.methUPI,  sub: s.methUPIsub,  rec: true  },
    { k: "CARD",       icon: P.card,  title: s.methCARD, sub: s.methCARDsub, rec: false },
    { k: "NETBANKING", icon: P.bank,  title: s.methNB,   sub: s.methNBsub,   rec: false },
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
      {METHODS.map((m, idx) => {
        const active = sel === m.k;
        return (
          <button
            key={m.k}
            className="bp-method-card bp-fade-up"
            style={{
              animationDelay: `${.06 + idx * .05}s`,
              border: `1.5px solid ${active ? accent : "#DDE6F0"}`,
              background: active ? light : "white",
              boxShadow: active ? `0 2px 14px ${accent}18` : "none",
            }}
            onClick={() => onSel(m.k)}
          >
            {/* Recommended badge */}
            {m.rec && (
              <span style={{ position: "absolute", top: 0, right: 12, background: grad, color: "white", fontSize: "clamp(8px,.75vw,9px)", fontWeight: 800, padding: "3px 10px", borderRadius: "0 0 7px 7px", letterSpacing: ".07em", textTransform: "uppercase" }}>
                {s.recUPI}
              </span>
            )}

            {/* Left accent bar (active only) */}
            {active && (
              <div style={{ position: "absolute", left: 0, top: 10, bottom: 10, width: 3, background: grad, borderRadius: "0 2px 2px 0" }} />
            )}

            {/* Icon box */}
            <div style={{ width: "clamp(42px,5vw,52px)", height: "clamp(42px,5vw,52px)", borderRadius: 11, background: active ? accent : "#F0F5FA", border: `1.5px solid ${active ? accent : "#DDE6F0"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all .18s" }}>
              <Ic path={m.icon} size={20} color={active ? "white" : "#5A7896"} />
            </div>

            {/* Text */}
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "var(--bp-sans)", fontSize: "clamp(13px,1.5vw,16px)", fontWeight: 700, color: active ? accent : "#18283A", transition: "color .18s" }}>{m.title}</div>
              <div style={{ fontFamily: "var(--bp-sans)", fontSize: "clamp(10px,1.1vw,12px)", color: "#6A8498", marginTop: 2 }}>{m.sub}</div>
            </div>

            {/* Radio dot */}
            <div style={{ width: "clamp(18px,2vw,22px)", height: "clamp(18px,2vw,22px)", borderRadius: "50%", border: `2px solid ${active ? accent : "#B0C8D8"}`, background: active ? accent : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all .18s" }}>
              {active && <div style={{ width: 7, height: 7, borderRadius: "50%", background: "white" }} />}
            </div>
          </button>
        );
      })}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  QR SCREEN (Step 4)
// ═══════════════════════════════════════════════════════════════
function QRScreen({ bill, consumer, referenceNo, qrData, method, onSuccess, onFail, onCancel, accent, grad, light, lb, s }) {
  const [secs,   setSecs]   = useState(300);
  const [status, setStatus] = useState("waiting"); // waiting | success | failed | expired
  const [dots,   setDots]   = useState("");
  const [tapCnt, setTapCnt] = useState(0);
  const pollRef = useRef(null);

  // Dots animation
  useEffect(() => {
    const i = setInterval(() => setDots(d => d.length >= 3 ? "" : d + "."), 700);
    return () => clearInterval(i);
  }, []);

  // Countdown
  useEffect(() => {
    const i = setInterval(() => setSecs(s => {
      if (s <= 1) { setStatus("expired"); return 0; }
      return s - 1;
    }), 1000);
    return () => clearInterval(i);
  }, []);

  // Poll payment
  useEffect(() => {
    if (status !== "waiting") return;
    pollRef.current = setInterval(async () => {
      try {
        const r = await apiStatus(referenceNo);
        if (r.status === "Success")  { clearInterval(pollRef.current); setStatus("success"); setTimeout(() => onSuccess(referenceNo), 1100); }
        else if (r.status === "Failed") { clearInterval(pollRef.current); setStatus("failed"); }
      } catch (_) {}
    }, 3000);
    return () => clearInterval(pollRef.current);
  }, [status, referenceNo, onSuccess]);

  // Demo tap: 3 taps = simulate success
  const handleTap = () => setTapCnt(c => { const n = c + 1; if (n >= 3) { setStatus("success"); setTimeout(() => onSuccess(referenceNo), 1100); } return n; });

  // ── Success / Failed / Expired states ────────────────────────
  if (status === "success") return (
    <div className="bp-fade-up" style={{ textAlign: "center", padding: "clamp(32px,6vw,64px) 20px" }}>
      <div className="bp-check-in" style={{ width: "clamp(80px,10vw,104px)", height: "clamp(80px,10vw,104px)", borderRadius: "50%", background: "#DCFCE7", border: "2.5px solid #6EE7A0", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto clamp(16px,2vw,22px)" }}>
        <Ic path={P.check} size={42} color="#15803D" />
      </div>
      <h3 style={{ fontFamily: "var(--bp-sans)", fontSize: "clamp(20px,2.6vw,28px)", fontWeight: 800, color: "#14532D" }}>{s.payOK}</h3>
      <p style={{ fontFamily: "var(--bp-sans)", color: "#5A7A6A", fontSize: "clamp(12px,1.3vw,14px)", marginTop: 8 }}>{s.payOKsub}</p>
    </div>
  );

  if (status === "failed") return (
    <div className="bp-fade-up" style={{ textAlign: "center", padding: "clamp(32px,6vw,64px) 20px" }}>
      <div style={{ width: "clamp(80px,10vw,104px)", height: "clamp(80px,10vw,104px)", borderRadius: "50%", background: "#FEE2E2", border: "2.5px solid #FCA5A5", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px" }}>
        <Ic path={P.warn} size={42} color="#DC2626" />
      </div>
      <h3 style={{ fontFamily: "var(--bp-sans)", fontSize: "clamp(18px,2.3vw,26px)", fontWeight: 800, color: "#991B1B" }}>{s.payFail}</h3>
      <p style={{ fontFamily: "var(--bp-sans)", color: "#6A4A4A", fontSize: "clamp(12px,1.3vw,14px)", margin: "10px 0 24px" }}>{s.payFailSub}</p>
      <PBtn onClick={onFail} danger accent={accent} grad={grad}><Ic path={P.refresh} size={16} color="white" /> {s.tryAgain}</PBtn>
    </div>
  );

  if (status === "expired") return (
    <div className="bp-fade-up" style={{ textAlign: "center", padding: "clamp(32px,6vw,64px) 20px" }}>
      <div style={{ width: "clamp(80px,10vw,104px)", height: "clamp(80px,10vw,104px)", borderRadius: "50%", background: "#FEF3C7", border: "2.5px solid #FCD34D", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px" }}>
        <Ic path={P.clock} size={42} color="#B45309" />
      </div>
      <h3 style={{ fontFamily: "var(--bp-sans)", fontSize: "clamp(18px,2.3vw,26px)", fontWeight: 800, color: "#92400E" }}>{s.expired}</h3>
      <p style={{ fontFamily: "var(--bp-sans)", color: "#6A5A3A", fontSize: "clamp(12px,1.3vw,14px)", margin: "10px 0 24px" }}>{s.expiredSub}</p>
      <PBtn onClick={onFail} accent={accent} grad={grad}><Ic path={P.refresh} size={16} color="white" /> {s.newQR}</PBtn>
    </div>
  );

  const isUPI    = method === "UPI";
  const howSteps = s.stepsList[method] || s.stepsList.UPI;

  return (
    <div className="bp-fade-up">
      {/* ── Amount + Timer banner ── */}
      <div style={{ background: grad, borderRadius: 14, padding: "clamp(14px,1.9vw,20px) clamp(16px,2.2vw,24px)", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, boxShadow: `0 4px 20px ${accent}30`, position: "relative", overflow: "hidden" }}>
        {/* Dot grid overlay */}
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", opacity: .06, backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "22px 22px" }} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ fontFamily: "var(--bp-sans)", fontSize: "clamp(9px,.95vw,11px)", color: "rgba(255,255,255,.7)", fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", marginBottom: 4 }}>{s.totalPayable}</div>
          <div style={{ fontFamily: "var(--bp-mono)", fontSize: "clamp(28px,4.2vw,46px)", fontWeight: 700, color: "white", lineHeight: 1, letterSpacing: "-.03em" }}>₹{bill.totalAmount.toLocaleString("en-IN")}</div>
          <div style={{ fontFamily: "var(--bp-sans)", fontSize: "clamp(10px,1.1vw,12px)", color: "rgba(255,255,255,.58)", marginTop: 5 }}>{consumer.name} · {bill.billMonth}</div>
        </div>
        <CountdownRing secs={secs} total={300} accent={accent} label={s.timeLeft} />
      </div>

      {/* ── QR Card ── */}
      <Card>
        <div style={{ textAlign: "center" }}>
          {/* Head */}
          <div style={{ fontFamily: "var(--bp-sans)", fontSize: "clamp(15px,1.8vw,20px)", fontWeight: 800, color: "#0A1828", marginBottom: 4 }}>{s.qrHead}</div>
          <p style={{ fontFamily: "var(--bp-sans)", fontSize: "clamp(11px,1.2vw,13px)", color: "#5A7090", marginBottom: 14, lineHeight: 1.6 }}>{isUPI ? s.qrSubUPI : s.qrSubOther}</p>

          {/* UPI app chips */}
          {isUPI && (
            <div style={{ display: "flex", gap: 5, marginBottom: 14, flexWrap: "wrap", justifyContent: "center" }}>
              {["GPay", "PhonePe", "Paytm", "BHIM", "Amazon Pay"].map(a => (
                <span key={a} style={{ background: "#F0F5FA", border: "1px solid #D0DEEC", borderRadius: 5, padding: "3px 10px", fontSize: "clamp(10px,.95vw,11px)", fontWeight: 600, color: "#3A5070", fontFamily: "var(--bp-sans)" }}>{a}</span>
              ))}
            </div>
          )}

          {/* QR code with corner markers + scan line */}
          <div onClick={handleTap} style={{ position: "relative", display: "inline-block", cursor: "default" }}>
            {/* Outer glow frame */}
            <div style={{ border: `4px solid ${accent}`, borderRadius: 14, padding: 8, background: "white", boxShadow: `0 0 0 2px white, 0 0 0 4px ${accent}18, 0 6px 28px ${accent}18` }}>
              <QRImg data={qrData} size={220} accent={accent} />
            </div>
            {/* Corner markers */}
            {[{ t: -3, l: -3 }, { t: -3, r: -3 }, { b: -3, l: -3 }, { b: -3, r: -3 }].map((p, i) => (
              <div key={i} style={{ position: "absolute", width: 22, height: 22, top: p.t, bottom: p.b, left: p.l, right: p.r, borderTop: p.t !== undefined ? `3px solid ${accent}` : "none", borderBottom: p.b !== undefined ? `3px solid ${accent}` : "none", borderLeft: p.l !== undefined ? `3px solid ${accent}` : "none", borderRight: p.r !== undefined ? `3px solid ${accent}` : "none" }} />
            ))}
            {/* Scan line */}
            <div style={{ position: "absolute", top: 8, left: 8, right: 8, height: 220, overflow: "hidden", borderRadius: 8, pointerEvents: "none" }}>
              <div style={{ position: "absolute", left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, ${accent}, transparent)`, boxShadow: `0 0 8px ${accent}`, animation: "bp-scan 2.6s ease-in-out infinite" }} />
            </div>
          </div>

          {/* Demo hint */}
          {tapCnt > 0 && tapCnt < 3 && (
            <p style={{ fontFamily: "var(--bp-sans)", fontSize: 10, color: "#8098B0", marginTop: 8 }}>Demo: tap {3 - tapCnt} more time{3 - tapCnt !== 1 ? "s" : ""} to simulate payment</p>
          )}

          {/* UPI ID */}
          {isUPI && (
            <div style={{ marginTop: 14, background: "#F5F9FE", border: "1px solid #D0E0F0", borderRadius: 8, padding: "7px 20px", display: "inline-block" }}>
              <div style={{ fontFamily: "var(--bp-sans)", fontSize: 9, color: "#7A96B0", fontWeight: 700, letterSpacing: ".09em", textTransform: "uppercase", marginBottom: 2 }}>{s.upiId}</div>
              <div style={{ fontFamily: "var(--bp-mono)", fontSize: "clamp(12px,1.3vw,14px)", color: "#18283A", fontWeight: 600 }}>avvnl-kiosk@axisbank</div>
            </div>
          )}

          {/* Waiting pill */}
          <div style={{ marginTop: 14, display: "inline-flex", alignItems: "center", gap: 8, background: "#F0FDF4", border: "1px solid #86EFAC", borderRadius: 999, padding: "7px 18px" }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#16A34A", animation: "bp-dot-beat 1.5s ease-in-out infinite" }} />
            <span style={{ fontFamily: "var(--bp-sans)", fontSize: "clamp(11px,1.2vw,13px)", fontWeight: 700, color: "#166534" }}>{s.waitPay}{dots}</span>
          </div>
        </div>
      </Card>

      {/* ── How to pay ── */}
      <Card>
        <SectionLabel>{s.howToPay}</SectionLabel>
        {howSteps.map((txt, i) => (
          <div key={i} className={`bp-fade-up bp-s${Math.min(i + 1, 5)}`} style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 10 }}>
            {/* Step number box — matches DeptScreen icon box style */}
            <div style={{ width: "clamp(30px,3.4vw,38px)", height: "clamp(30px,3.4vw,38px)", borderRadius: 9, background: light, border: `1.5px solid ${lb}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <span style={{ fontFamily: "var(--bp-sans)", fontSize: "clamp(11px,1.2vw,13px)", fontWeight: 800, color: accent }}>{i + 1}</span>
            </div>
            <span style={{ fontFamily: "var(--bp-sans)", fontSize: "clamp(12px,1.3vw,14px)", color: "#3A5070", fontWeight: 500, lineHeight: 1.6, paddingTop: "clamp(3px,.5vw,5px)" }}>{txt}</span>
          </div>
        ))}
      </Card>

      <PBtn onClick={onCancel} outline accent={accent} grad={grad} size="md">
        <Ic path={P.back} size={15} color={accent} /> {s.cancelBtn}
      </PBtn>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════
export function BillPay({ dept = "electricity", t, setScreen, lang = "en", senior }) {
  const th = DEPT[dept] || DEPT.electricity;
  const { accent, accentD, grad, light, lb, icon, label, labelHi, provider } = th;
  const s = S[lang] || S.en;
  const deptName = lang === "hi" ? labelHi : label;

  const [step,    setStep]    = useState(1);
  const [num,     setNum]     = useState("");
  const [data,    setData]    = useState(null);
  const [pm,      setPm]      = useState("");
  const [payData, setPayData] = useState(null);
  const [receipt, setReceipt] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  useEffect(() => { injectCSS(); }, []);

  // Barcode scanner listener
  const bufRef = useRef(""), timerRef = useRef(null);
  useEffect(() => {
    const fn = (e) => {
      if (step !== 1) return;
      if (e.key === "Enter") { const b = bufRef.current.trim(); if (b.length >= 3) { setNum(b); doLookup(b); } bufRef.current = ""; }
      else if (e.key.length === 1) { bufRef.current += e.key; clearTimeout(timerRef.current); timerRef.current = setTimeout(() => { bufRef.current = ""; }, 100); }
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [step]); // eslint-disable-line

  const doLookup = useCallback(async (n) => {
    const cn = (n || num).trim().toUpperCase();
    if (!cn) { setError(s.errEmpty); return; }
    setError(""); setLoading(true);
    try {
      const r = await apiLookup(cn);
      if (!r?.bill) { setError(s.errGeneral); return; }
      setData(r); setNum(cn); setStep(2);
    } catch (e) { setError(e.message || s.errGeneral); }
    finally { setLoading(false); }
  }, [num, s]);

  const doInitiate = async () => {
    if (!pm) return;
    setError(""); setLoading(true);
    try {
      const r = await apiInitiate({ consumerNumber: data.consumer.consumerNumber, billId: data.bill.billId, amount: data.bill.totalAmount, dept, paymentMethod: pm });
      setPayData(r); setStep(4);
    } catch (e) { setError(e.message || s.errGeneral); }
    finally { setLoading(false); }
  };

  const onSuccess = useCallback(async (ref) => {
    let rec = null;
    try { const r = await apiReceipt(ref); rec = r?.receipt || null; } catch (_) {}
    setReceipt(rec || { referenceNo: ref, consumerName: data?.consumer?.name, billMonth: data?.bill?.billMonth, amount: data?.bill?.totalAmount, paymentMethod: pm, paidAt: new Date().toISOString() });
    setStep(5);
  }, [data, pm]);

  const resetStep3 = () => { setPayData(null); setStep(3); };
  const qrData     = payData ? (pm === "UPI" ? payData.upiString : (payData.paymentLink || `https://pay.avvnl.gov.in/pay?ref=${payData.referenceNo}`)) : "";

  const handleBack = () => {
    if (step === 4) return;
    if (step > 1) { setStep(ss => ss - 1); setError(""); }
    else setScreen("dept");
  };

  // ── Render ────────────────────────────────────────────────
  return (
    <div className="bp-root" style={{ flex: 1, display: "flex", flexDirection: "column", background: "#EEF2F7", minHeight: 0, overflow: "hidden" }}>

      {/* ══════════════════════════════════════════════
          HEADER — matches DeptScreen header style
      ══════════════════════════════════════════════ */}
      <div style={{ background: "white", borderBottom: "1px solid #D0DEEC", padding: "clamp(8px,1.2vw,14px) clamp(14px,2.5vw,40px)", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 1px 4px rgba(0,0,0,.04)", gap: 10, flexShrink: 0 }}>

        <div style={{ display: "flex", alignItems: "center", gap: "clamp(10px,1.4vw,16px)" }}>
          {/* Back button — matches DeptScreen back btn */}
          <button onClick={handleBack} disabled={step === 4} style={{ background: step === 4 ? "#F5F9FE" : "#F0F5FA", border: "1px solid #C8D8E8", borderRadius: 8, width: "clamp(36px,4.2vw,46px)", height: "clamp(36px,4.2vw,46px)", display: "flex", alignItems: "center", justifyContent: "center", cursor: step === 4 ? "not-allowed" : "pointer", opacity: step === 4 ? .35 : 1, flexShrink: 0 }}>
            <Ic path={P.back} size={18} color="#3A5070" />
          </button>

          {/* Vertical gradient bar — signature DeptScreen element */}
          <div style={{ width: 4, height: "clamp(34px,4vw,44px)", borderRadius: 2, background: grad, flexShrink: 0 }} />

          <div>
            {/* Breadcrumb */}
            <div className="bp-breadcrumb" style={{ marginBottom: 3 }}>
              <span>{s.breadHome}</span>
              <div className="bp-breadcrumb-sep" />
              <span>{deptName}</span>
              <div className="bp-breadcrumb-sep" />
              <span style={{ color: accent, fontWeight: 700 }}>{s.title}</span>
            </div>
            {/* Title with dept icon */}
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Ic path={icon} size={senior ? 18 : 16} color={accent} />
              <h2 style={{ fontFamily: "var(--bp-sans)", fontSize: "clamp(14px,1.8vw,21px)", fontWeight: 800, color: "#0A1828", margin: 0, lineHeight: 1.2, letterSpacing: "-.01em" }}>
                {deptName} {lang === "hi" ? "बिल भुगतान" : "Bill Payment"}
              </h2>
            </div>
            <div style={{ fontFamily: "var(--bp-sans)", fontSize: "clamp(9px,.9vw,11px)", color: "#7A96B0", marginTop: 2 }}>
              {provider} · {label}
            </div>
          </div>
        </div>

        {/* Step indicator pill */}
        <div style={{ background: light, border: `1.5px solid ${lb}`, borderRadius: 7, padding: "4px 12px", flexShrink: 0 }}>
          <div style={{ fontFamily: "var(--bp-sans)", fontSize: "clamp(9px,.9vw,11px)", color: accent, fontWeight: 800, letterSpacing: ".07em", textTransform: "uppercase", textAlign: "center" }}>{s.stepLbl}</div>
          <div style={{ fontFamily: "var(--bp-mono)", fontSize: "clamp(14px,1.6vw,18px)", fontWeight: 700, color: accent, lineHeight: 1, textAlign: "center" }}>{step} <span style={{ fontFamily: "var(--bp-sans)", fontSize: "clamp(9px,.9vw,11px)", color: `${accent}88` }}>{s.ofLbl} 5</span></div>
        </div>
      </div>

      {/* STEP BAR */}
      <StepBar cur={step} accent={accent} grad={grad} lang={lang} />

      {/* ══════════════════════════════════════════════
          SCROLLABLE CONTENT
      ══════════════════════════════════════════════ */}
      <div className="bp-scr" style={{ flex: 1, overflowY: "auto", overflowX: "hidden" }}>
        <div style={{ maxWidth: 660, margin: "0 auto", padding: "clamp(16px,2.2vw,28px) clamp(14px,2.5vw,40px) 52px" }}>

          {/* ────────────────────────────────────────────
              STEP 1 — Consumer Number
          ──────────────────────────────────────────── */}
          {step === 1 && (
            <div className="bp-fade-up">
              {/* Info banner — matches DeptScreen style */}
              <div className="bp-fade-up bp-s1" style={{ background: light, border: `1.5px solid ${lb}`, borderRadius: 12, padding: "clamp(12px,1.6vw,16px) clamp(14px,1.8vw,18px)", marginBottom: 14, display: "flex", gap: 12, alignItems: "flex-start" }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: `${accent}14`, border: `1.5px solid ${accent}22`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Ic path={icon} size={18} color={accent} />
                </div>
                <div>
                  <div style={{ fontFamily: "var(--bp-sans)", fontWeight: 700, color: accent, fontSize: "clamp(12px,1.3vw,15px)", marginBottom: 4 }}>{s.step1Head}</div>
                  <div style={{ fontFamily: "var(--bp-sans)", color: "#4A6070", fontSize: "clamp(11px,1.2vw,13px)", lineHeight: 1.65 }}>
                    {s.step1Info}
                    <br />
                    <span style={{ color: "#8098B0", fontSize: "clamp(10px,1vw,11px)" }}>{s.step1Demo}</span>
                  </div>
                </div>
              </div>

              <ErrBanner msg={error} />

              <Card style={{ animationDelay: ".08s" }}>
                <SectionLabel>{s.inputLabel}</SectionLabel>
                <input
                  value={num}
                  onChange={e => { setNum(e.target.value.toUpperCase()); setError(""); }}
                  onKeyDown={e => e.key === "Enter" && doLookup()}
                  placeholder={s.inputPH}
                  autoFocus
                  className="bp-input-focus"
                  style={{
                    width: "100%",
                    height: senior ? "clamp(58px,6.5vw,72px)" : "clamp(50px,5.6vw,62px)",
                    padding: "0 clamp(12px,1.8vw,18px)",
                    fontFamily: "var(--bp-mono)",
                    fontSize: senior ? "clamp(18px,2.2vw,24px)" : "clamp(15px,1.9vw,20px)",
                    fontWeight: 700,
                    color: "#0A1828",
                    background: "#F5F9FE",
                    border: `2px solid ${error ? "#FCA5A5" : num ? accent : "#C8D8E8"}`,
                    borderRadius: 10,
                    outline: "none",
                    letterSpacing: ".08em",
                    transition: "border-color .18s",
                    "--bp-accent": accent,
                  }}
                />
                {/* Quick-fill demo chips */}
                <div style={{ display: "flex", gap: 7, marginTop: 10, flexWrap: "wrap", alignItems: "center" }}>
                  <span style={{ fontFamily: "var(--bp-sans)", fontSize: "clamp(10px,.95vw,11px)", color: "#8098B0", fontWeight: 600 }}>Demo:</span>
                  {["1001", "1002", "1003"].map(d => (
                    <button key={d} onClick={() => { setNum(d); setError(""); }} style={{ background: "#F0F5FA", border: `1px solid ${lb}`, borderRadius: 6, padding: "4px 12px", fontSize: "clamp(11px,1vw,13px)", fontWeight: 700, color: accent, cursor: "pointer", fontFamily: "var(--bp-mono)" }}>{d}</button>
                  ))}
                </div>
              </Card>

              <div className="bp-fade-up bp-s3">
                <PBtn onClick={() => doLookup()} disabled={!num.trim() || loading} accent={accent} grad={grad}>
                  {loading ? <><Spin />&nbsp;{s.searching}</> : <><Ic path={P.scan} size={16} color="white" /> {s.searchBtn}</>}
                </PBtn>
              </div>

              <p className="bp-fade-up bp-s4" style={{ fontFamily: "var(--bp-sans)", textAlign: "center", marginTop: 12, color: "#8098B0", fontSize: "clamp(10px,.95vw,12px)", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                <Ic path={P.scan} size={13} color="#B0C8D8" /> {s.scanHint}
              </p>
            </div>
          )}

          {/* ────────────────────────────────────────────
              STEP 2 — Bill Details
          ──────────────────────────────────────────── */}
          {step === 2 && data && (
            <div className="bp-fade-up">
              {/* Overdue banner */}
              {data.bill.isOverdue && (
                <div className="bp-fade-up bp-s1" style={{ background: "#FEF2F2", border: "1.5px solid #FCA5A5", borderRadius: 12, padding: "clamp(12px,1.5vw,16px) clamp(14px,1.8vw,18px)", marginBottom: 14, display: "flex", gap: 12, alignItems: "center" }}>
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: "#FEE2E2", border: "1.5px solid #FCA5A5", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Ic path={P.warn} size={18} color="#DC2626" />
                  </div>
                  <div>
                    <div style={{ fontFamily: "var(--bp-sans)", fontWeight: 800, color: "#991B1B", fontSize: "clamp(13px,1.4vw,15px)" }}>{s.overdueTitle}</div>
                    <div style={{ fontFamily: "var(--bp-sans)", color: "#B91C1C", fontSize: "clamp(11px,1.2vw,13px)", marginTop: 2 }}>{s.overdueDesc}</div>
                  </div>
                </div>
              )}

              {/* Consumer info card */}
              <Card style={{ animationDelay: ".06s" }} className="bp-fade-up bp-s1">
                <SectionLabel>{s.secInfo}</SectionLabel>
                <DataRow label={s.conNo}    val={data.consumer.consumerNumber} />
                <DataRow label={s.conName}  val={data.consumer.name} />
                <DataRow label={s.address}  val={data.consumer.address} />
                {data.consumer.meterNumber && <DataRow label={s.meter} val={data.consumer.meterNumber} />}
                <DataRow label={s.provider} val={data.consumer.provider} last />
              </Card>

              {/* Bill info card */}
              <Card style={{ animationDelay: ".10s" }} className="bp-fade-up bp-s2">
                <SectionLabel>{s.billInfo} — {data.bill.billMonth}</SectionLabel>
                {data.bill.units > 0 && <DataRow label={s.units} val={`${data.bill.units} kWh`} />}
                <DataRow label={s.billAmt} val={`₹${data.bill.amount?.toLocaleString("en-IN")}`} />
                <DataRow label={s.taxes}   val={`₹${data.bill.taxes?.toLocaleString("en-IN")}`} />
                <DataRow label={s.dueDate} val={data.bill.dueDate} last />
              </Card>

              {/* Total payable — gradient card */}
              <div className="bp-fade-up bp-s3" style={{ background: grad, borderRadius: 14, padding: "clamp(14px,1.9vw,20px) clamp(16px,2.2vw,24px)", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, boxShadow: `0 4px 20px ${accent}28`, position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", inset: 0, pointerEvents: "none", opacity: .06, backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "22px 22px" }} />
                <div style={{ position: "relative", zIndex: 1 }}>
                  <div style={{ fontFamily: "var(--bp-sans)", fontSize: "clamp(9px,.95vw,11px)", color: "rgba(255,255,255,.7)", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 4 }}>{s.totalPayable}</div>
                  <div style={{ fontFamily: "var(--bp-mono)", fontSize: "clamp(26px,4vw,44px)", fontWeight: 700, color: "white", letterSpacing: "-.03em", lineHeight: 1 }}>₹{data.bill.totalAmount?.toLocaleString("en-IN")}</div>
                  <div style={{ fontFamily: "var(--bp-sans)", fontSize: "clamp(10px,1.1vw,12px)", color: "rgba(255,255,255,.55)", marginTop: 4 }}>{data.consumer.name} · {data.bill.billMonth}</div>
                </div>
                <div style={{ position: "relative", zIndex: 1, opacity: .25 }}>
                  <Ic path={icon} size={52} color="white" />
                </div>
              </div>

              <div className="bp-fade-up bp-s4">
                <PBtn onClick={() => setStep(3)} accent={accent} grad={grad}>
                  <Ic path={P.card} size={16} color="white" /> {s.proceedBtn}
                  <Ic path={P.chevR} size={16} color="rgba(255,255,255,.7)" />
                </PBtn>
              </div>
            </div>
          )}

          {/* ────────────────────────────────────────────
              STEP 3 — Choose Payment Method
          ──────────────────────────────────────────── */}
          {step === 3 && (
            <div className="bp-fade-up">
              <ErrBanner msg={error} />

              <Card>
                <SectionLabel>{s.chooseMethod}</SectionLabel>
                <MethodPicker sel={pm} onSel={setPm} accent={accent} grad={grad} light={light} lb={lb} s={s} />
              </Card>

              {pm && (
                <div className="bp-fade-up" style={{ marginTop: 4 }}>
                  {/* Notice */}
                  <div style={{ background: "#F0FDF4", border: "1px solid #86EFAC", borderRadius: 10, padding: "clamp(10px,1.4vw,13px) clamp(12px,1.6vw,16px)", marginBottom: 12, display: "flex", gap: 10, alignItems: "center" }}>
                    <Ic path={P.check} size={16} color="#16A34A" />
                    <span style={{ fontFamily: "var(--bp-sans)", color: "#14532D", fontSize: "clamp(11px,1.2vw,13px)", fontWeight: 600 }}>{s.methodNote}</span>
                  </div>
                  <PBtn onClick={doInitiate} disabled={loading} accent={accent} grad={grad}>
                    {loading
                      ? <><Spin /> {s.genQRing}</>
                      : <><Ic path={P.scan} size={16} color="white" /> {s.genQR} — ₹{data?.bill?.totalAmount?.toLocaleString("en-IN")}</>
                    }
                  </PBtn>
                </div>
              )}
            </div>
          )}

          {/* ────────────────────────────────────────────
              STEP 4 — QR / Scan & Pay
          ──────────────────────────────────────────── */}
          {step === 4 && payData && (
            <QRScreen
              bill={data.bill} consumer={data.consumer}
              referenceNo={payData.referenceNo} qrData={qrData} method={pm}
              onSuccess={onSuccess} onFail={resetStep3} onCancel={resetStep3}
              accent={accent} grad={grad} light={light} lb={lb} s={s}
            />
          )}

          {/* ────────────────────────────────────────────
              STEP 5 — Receipt
          ──────────────────────────────────────────── */}
          {step === 5 && (
            <div className="bp-fade-up" style={{ textAlign: "center" }}>
              {/* Success icon */}
              <div className="bp-check-in" style={{ width: "clamp(80px,10vw,104px)", height: "clamp(80px,10vw,104px)", borderRadius: "50%", background: "#DCFCE7", border: "2.5px solid #6EE7A0", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto clamp(14px,1.9vw,20px)" }}>
                <Ic path={P.check} size={42} color="#15803D" />
              </div>
              <h3 style={{ fontFamily: "var(--bp-sans)", fontSize: "clamp(20px,2.6vw,29px)", fontWeight: 800, color: "#0A1828", marginBottom: 6 }}>{s.recHead}</h3>
              <p style={{ fontFamily: "var(--bp-sans)", color: "#5A7080", fontSize: "clamp(12px,1.3vw,14px)", marginBottom: 22 }}>{s.recSub}</p>

              {/* Receipt card */}
              <Card style={{ textAlign: "left", border: `1.5px solid ${lb}` }}>
                {/* Receipt header */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, paddingBottom: 12, borderBottom: `1px solid ${lb}` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 4, height: 32, borderRadius: 2, background: grad, flexShrink: 0 }} />
                    <div>
                      <div style={{ fontFamily: "var(--bp-sans)", fontSize: "clamp(12px,1.3vw,15px)", fontWeight: 800, color: "#0A1828" }}>{s.receipt}</div>
                      <div style={{ fontFamily: "var(--bp-sans)", fontSize: "clamp(9px,.9vw,11px)", color: "#7A96B0", marginTop: 1 }}>{provider} · SUVIDHA Kiosk</div>
                    </div>
                  </div>
                  <span style={{ background: "#DCFCE7", border: "1.5px solid #6EE7A0", borderRadius: 6, padding: "3px 12px", fontFamily: "var(--bp-sans)", fontSize: "clamp(9px,.9vw,11px)", fontWeight: 800, color: "#15803D", letterSpacing: ".06em" }}>PAID</span>
                </div>

                <DataRow label={s.refNo}      val={receipt?.referenceNo || payData?.referenceNo} bold accent={accent} />
                <DataRow label={s.conName}    val={receipt?.consumerName || data?.consumer?.name} />
                <DataRow label={s.billMonth}  val={receipt?.billMonth || data?.bill?.billMonth} />
                <DataRow label={s.totalAmt}   val={`₹${(receipt?.amount || data?.bill?.totalAmount)?.toLocaleString("en-IN")}`} bold accent="#15803D" />
                <DataRow label={s.payMethod}  val={receipt?.paymentMethod || pm} />
                <DataRow label={s.dateTime}   val={receipt?.paidAt ? new Date(receipt.paidAt).toLocaleString("en-IN") : new Date().toLocaleString("en-IN")} />
                <DataRow label={s.statusLbl}  val="SUCCESS" bold accent="#15803D" last />
              </Card>

              {/* Action buttons */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10, marginTop: 4 }}>
                <PBtn onClick={() => window.print()} success accent={accent} grad={grad} size="md">
                  <Ic path={P.print} size={15} color="white" /> {s.printBtn}
                </PBtn>
                <PBtn onClick={() => setScreen("home")} outline accent={accent} grad={grad} size="md">
                  <Ic path={P.home} size={15} color={accent} /> {s.homeBtn}
                </PBtn>
              </div>
              <PBtn onClick={() => { setStep(1); setNum(""); setData(null); setPm(""); setPayData(null); setReceipt(null); setError(""); }} outline accent={accent} grad={grad} size="sm">
                <Ic path={P.refresh} size={14} color={accent} /> {s.newBillBtn}
              </PBtn>
            </div>
          )}

        </div>
      </div>

      {/* ══════════════════════════════════════════════
          FOOTER — security strip
      ══════════════════════════════════════════════ */}
      <div style={{ background: "white", borderTop: "1px solid #D0DEEC", padding: "clamp(6px,.9vw,10px) clamp(14px,2.5vw,40px)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 6, flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Ic path={P.shield} size={13} color="#16A34A" />
          <span style={{ fontFamily: "var(--bp-sans)", fontSize: "clamp(9px,.95vw,11px)", color: "#5A7080", fontWeight: 600 }}>{s.secure}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#16A34A", animation: "bp-pulse 2s infinite" }} />
          <span style={{ fontFamily: "var(--bp-sans)", fontSize: "clamp(9px,.9vw,10px)", color: "#8098B0" }}>{provider} · 24×7</span>
        </div>
      </div>

    </div>
  );
}

// ─── Named exports ────────────────────────────────────────────────
export const ElecBillPay      = (p) => <BillPay {...p} dept="electricity" />;
export const GasBillPay       = (p) => <BillPay {...p} dept="gas"         />;
export const MunicipalBillPay = (p) => <BillPay {...p} dept="municipal"   />;
export const MuniBillPay      = (p) => <BillPay {...p} dept="municipal"   />;
export const WaterBillPay     = (p) => <BillPay {...p} dept="water"       />;