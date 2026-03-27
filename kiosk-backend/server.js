/**
 * kiosk-backend/server.js
 * ========================
 * SUVIDHA Kiosk — Complete Backend
 * All routes in one file — no separate admin.js import needed
 *
 * .env variables:
 *   MONGODB_URI=mongodb://127.0.0.1:27017/kiosk_db
 *   PORT=5000
 *   FRONTEND_URL=http://localhost:3000
 *   AADHAAR_SALT=change-me-in-production
 *   ADMIN_TOKEN=suvidha-admin-2025
 *   NODE_ENV=development
 */

require("dotenv").config();
const express   = require("express");
const mongoose  = require("mongoose");
const cors      = require("cors");
const helmet    = require("helmet");
const rateLimit = require("express-rate-limit");
const { body, param, validationResult } = require("express-validator");
const crypto    = require("crypto");

const app = express();

// ─── Middleware ────────────────────────────────────────────────────────────────
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  methods: ["GET", "POST", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "x-admin-token"],
}));
app.use(express.json({ limit: "5mb" }));
app.use(rateLimit({
  windowMs: 15 * 60 * 1000, max: 500,
  message: { success: false, message: "Too many requests." }
}));

// ─── MongoDB ───────────────────────────────────────────────────────────────────
mongoose.connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/kiosk_db")
  .then(() => console.log("✅  MongoDB connected →", mongoose.connection.name))
  .catch(err => { console.error("❌  MongoDB:", err.message); process.exit(1); });

// ─── Helpers ───────────────────────────────────────────────────────────────────
const genRef = (prefix) =>
  `${prefix}-${Date.now()}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;

const hashAadhaar = (raw) =>
  crypto.createHmac("sha256", process.env.AADHAAR_SALT || "kiosk-salt")
    .update(raw.replace(/\s/g, "")).digest("hex");

const isValidMobile  = v => /^[6-9]\d{9}$/.test(v.replace(/\s/g, ""));
const isValidAadhaar = v => /^\d{12}$/.test(v.replace(/\s/g, ""));
const validate       = (req, res) => {
  const err = validationResult(req);
  if (!err.isEmpty()) { res.status(422).json({ success: false, errors: err.array() }); return true; }
  return false;
};
const wrap = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

function paginate(page, limit) {
  const p = Math.max(1, parseInt(page) || 1);
  const l = Math.min(100, Math.max(1, parseInt(limit) || 20));
  return { skip: (p - 1) * l, limit: l, page: p };
}

// ─── Schemas & Models ─────────────────────────────────────────────────────────

const ConsumerSchema = new mongoose.Schema({
  consumerNumber:   { type: String, unique: true, required: true, index: true },
  dept:             { type: String, enum: ["electricity","gas","municipal","water"], required: true },
  name:             { type: String, required: true },
  address:          { type: String, required: true },
  category:         { type: String, enum: ["Domestic","Commercial","Industrial"], default: "Domestic" },
  connectionStatus: { type: String, enum: ["Active","Disconnected","Pending"], default: "Active" },
  meterNumber:      String,
  sanctionedLoad:   Number,
  provider:         { type: String, default: "AVVNL" },
}, { timestamps: true });
const Consumer = mongoose.model("Consumer", ConsumerSchema);

const BillSchema = new mongoose.Schema({
  billId:         { type: String, unique: true, required: true },
  consumerNumber: { type: String, required: true, index: true },
  dept:           { type: String, required: true },
  billMonth:      String,
  units:          Number,
  amount:         { type: Number, required: true },
  taxes:          { type: Number, default: 0 },
  totalAmount:    { type: Number, required: true },
  dueDate:        { type: Date, required: true },
  status:         { type: String, enum: ["Pending","Paid","Overdue"], default: "Pending" },
}, { timestamps: true });
const Bill = mongoose.model("Bill", BillSchema);

const PaymentSchema = new mongoose.Schema({
  referenceNo:     { type: String, unique: true, required: true },
  consumerNumber:  { type: String, required: true, index: true },
  billId:          { type: String, required: true },
  dept:            String,
  amount:          { type: Number, required: true },
  paymentMethod:   { type: String, enum: ["UPI","CARD","NETBANKING","CASH"] },
  status:          { type: String, enum: ["Initiated","Processing","Success","Failed"], default: "Initiated" },
  transactionId:   String,
  gatewayResponse: mongoose.Schema.Types.Mixed,
  ipAddress:       String,
  paidAt:          Date,
}, { timestamps: true });
const Payment = mongoose.model("Payment", PaymentSchema);

const ComplaintSchema = new mongoose.Schema({
  ticketId:       { type: String, unique: true, required: true },
  consumerNumber: String,
  dept:           { type: String, required: true },
  name:           { type: String, required: true },
  mobile:         { type: String, required: true },
  type:           { type: String, required: true },
  description:    { type: String, required: true },
  status:         { type: String, enum: ["Registered","InProgress","Resolved","Closed"], default: "Registered" },
  priority:       { type: String, enum: ["LOW","MEDIUM","HIGH","CRITICAL"], default: "MEDIUM" },
  resolvedAt:     Date,
  remarks:        String,
}, { timestamps: true });
const Complaint = mongoose.model("Complaint", ComplaintSchema);

const OutageSchema = new mongoose.Schema({
  reportId:   { type: String, unique: true, required: true },
  dept:       { type: String, default: "electricity" },
  name:       { type: String, required: true },
  mobile:     { type: String, required: true },
  area:       { type: String, required: true },
  ward:       String,
  since:      String,
  status:     { type: String, enum: ["Reported","Acknowledged","InProgress","Restored"], default: "Reported" },
  priority:   { type: String, default: "HIGH" },
  eta:        { type: String, default: "4–6 hours" },
  restoredAt: Date,
}, { timestamps: true });
const Outage = mongoose.model("Outage", OutageSchema);

const ConnectionSchema = new mongoose.Schema({
  applicationNo:  { type: String, unique: true, required: true },
  dept:           { type: String, required: true },
  name:           { type: String, required: true },
  mobile:         { type: String, required: true },
  aadhaarHash:    { type: String, required: true },
  address:        { type: String, required: true },
  sanctionedLoad: Number,
  category:       { type: String, default: "Domestic" },
  status:         { type: String, enum: ["Submitted","UnderReview","Approved","Rejected","Connected"], default: "Submitted" },
  fee:            { type: Number, default: 350 },
  feePaid:        { type: Boolean, default: false },
  remarks:        String,
}, { timestamps: true });
const Connection = mongoose.model("Connection", ConnectionSchema);

const ServiceSchema = new mongoose.Schema({
  requestId:    { type: String, unique: true, required: true },
  dept:         { type: String, required: true },
  serviceLabel: { type: String, required: true },
  name:         { type: String, required: true },
  mobile:       { type: String, required: true },
  description:  String,
  status:       { type: String, enum: ["Submitted","UnderReview","InProgress","Completed"], default: "Submitted" },
}, { timestamps: true });
const ServiceRequest = mongoose.model("ServiceRequest", ServiceSchema);

const SchemeInterestSchema = new mongoose.Schema({
  requestId: { type: String, unique: true, required: true },
  scheme:    { type: String, required: true },
  name:      { type: String, required: true },
  mobile:    { type: String, required: true },
  district:  { type: String, required: true },
  village:   String,
  status:    { type: String, enum: ["Submitted","Contacted","Enrolled","Rejected"], default: "Submitted" },
  remarks:   String,
}, { timestamps: true });
const SchemeInterest = mongoose.model("SchemeInterest", SchemeInterestSchema);

const VoterApplicationSchema = new mongoose.Schema({
  referenceNo:   { type: String, unique: true, required: true, index: true },
  serviceType:   { type: String, enum: ["new_voter","correction","duplicate","address_change"], required: true },
  formNo:        String,
  applicantName: { type: String, required: true },
  mobile:        { type: String, required: true },
  aadhaarHash:   String,
  epicNo:        String,
  address:       String,
  description:   String,
  status: {
    type: String,
    enum: ["submitted","blo_pending","blo_done","eci_review","approved","rejected","card_printed","dispatched","delivered"],
    default: "submitted",
  },
  timeline: [{ status: String, label: String, date: String, updatedBy: { type: String, default: "system" } }],
  note:        String,
  submittedAt: String,
}, { timestamps: true });
const VoterApplication = mongoose.model("VoterApplication", VoterApplicationSchema);

// ═══════════════════════════════════════════════════════════════════════════════
//  HEALTH
// ═══════════════════════════════════════════════════════════════════════════════
app.get("/api/health", (_req, res) =>
  res.json({ ok: true, db: mongoose.connection.readyState === 1 ? "connected" : "disconnected", dbName: mongoose.connection.name })
);

// ═══════════════════════════════════════════════════════════════════════════════
//  CITIZEN ROUTES
// ═══════════════════════════════════════════════════════════════════════════════

// Consumer lookup
app.get("/api/consumers/:number", param("number").notEmpty().trim(), wrap(async (req, res) => {
  if (validate(req, res)) return;
  const consumer = await Consumer.findOne({ consumerNumber: req.params.number.trim() });
  if (!consumer) return res.status(404).json({ success: false, message: "Consumer number not found." });
  if (consumer.connectionStatus !== "Active")
    return res.status(403).json({ success: false, message: `Connection is ${consumer.connectionStatus}.` });

  const bill = await Bill.findOne({
    consumerNumber: consumer.consumerNumber, status: { $in: ["Pending","Overdue"] }
  }).sort({ dueDate: 1 });

  res.json({
    success: true,
    consumer: { consumerNumber: consumer.consumerNumber, name: consumer.name, address: consumer.address, dept: consumer.dept, category: consumer.category, provider: consumer.provider, meterNumber: consumer.meterNumber },
    bill: bill ? { billId: bill.billId, billMonth: bill.billMonth, units: bill.units, amount: bill.amount, taxes: bill.taxes, totalAmount: bill.totalAmount, dueDate: bill.dueDate.toLocaleDateString("en-IN"), status: bill.status, isOverdue: bill.status === "Overdue" } : null,
  });
}));

// Payment initiate
const payLimiter = rateLimit({ windowMs: 60*60*1000, max: 10 });
app.post("/api/payments/initiate", payLimiter,
  body("consumerNumber").notEmpty(), body("billId").notEmpty(), body("amount").isFloat({ min: 1, max: 500000 }),
  body("dept").notEmpty(), body("paymentMethod").isIn(["UPI","CARD","NETBANKING","CASH"]),
  wrap(async (req, res) => {
    if (validate(req, res)) return;
    const { consumerNumber, billId, amount, dept, paymentMethod } = req.body;
    const bill = await Bill.findOne({ billId, consumerNumber, status: { $in: ["Pending","Overdue"] } });
    if (!bill) return res.status(400).json({ success: false, message: "Bill not found or already paid." });
    if (Math.abs(bill.totalAmount - amount) > 1) return res.status(400).json({ success: false, message: "Amount mismatch." });
    const referenceNo = genRef("PAY");
    await Payment.create({ referenceNo, consumerNumber, billId, dept, amount, paymentMethod, status: "Processing", ipAddress: req.ip });
    res.json({ success: true, referenceNo });
  })
);

// Payment confirm
app.post("/api/payments/confirm", body("referenceNo").notEmpty(), body("status").isIn(["Success","Failed"]),
  wrap(async (req, res) => {
    if (validate(req, res)) return;
    const { referenceNo, transactionId, status, gatewayResponse } = req.body;
    const payment = await Payment.findOne({ referenceNo });
    if (!payment) return res.status(404).json({ success: false, message: "Payment not found." });
    if (payment.status === "Success") return res.status(409).json({ success: false, message: "Already confirmed." });
    payment.status = status; payment.transactionId = transactionId || genRef("TXN");
    payment.gatewayResponse = gatewayResponse || {}; payment.paidAt = new Date();
    await payment.save();
    if (status === "Success") await Bill.findOneAndUpdate({ billId: payment.billId }, { status: "Paid" });
    res.json({ success: true, referenceNo, status, paidAt: payment.paidAt });
  })
);

// Payment receipt
app.get("/api/payments/receipt/:ref", wrap(async (req, res) => {
  const p = await Payment.findOne({ referenceNo: req.params.ref });
  if (!p) return res.status(404).json({ success: false, message: "Receipt not found." });
  const [c, b] = await Promise.all([Consumer.findOne({ consumerNumber: p.consumerNumber }), Bill.findOne({ billId: p.billId })]);
  res.json({ success: true, receipt: { referenceNo: p.referenceNo, consumerNumber: p.consumerNumber, consumerName: c?.name, address: c?.address, billMonth: b?.billMonth, units: b?.units, amount: p.amount, paymentMethod: p.paymentMethod, transactionId: p.transactionId, status: p.status, paidAt: p.paidAt, dept: p.dept } });
}));

// Complaint submit
app.post("/api/complaints",
  body("name").notEmpty().trim(), body("mobile").custom(v => { if (!isValidMobile(v)) throw new Error("Invalid mobile"); return true; }),
  body("dept").notEmpty(), body("type").notEmpty(), body("description").notEmpty().isLength({ min: 10 }),
  wrap(async (req, res) => {
    if (validate(req, res)) return;
    const { name, mobile, dept, type, description, consumerNumber } = req.body;
    const txt = (description + type).toLowerCase();
    let priority = "MEDIUM";
    if (txt.includes("hazard") || txt.includes("fire") || txt.includes("shock")) priority = "CRITICAL";
    else if (txt.includes("outage") || txt.includes("no supply") || txt.includes("sparking")) priority = "HIGH";
    else if (txt.includes("billing") || txt.includes("excess bill")) priority = "LOW";
    const c = await Complaint.create({ ticketId: genRef("CMP"), consumerNumber, dept, name, mobile, type, description, priority });
    const eta = priority === "CRITICAL" ? "2–4 hours" : priority === "HIGH" ? "4–8 hours" : "24–48 hours";
    res.status(201).json({ success: true, ticketId: c.ticketId, priority, eta });
  })
);

app.get("/api/complaints/:ticketId", wrap(async (req, res) => {
  const c = await Complaint.findOne({ ticketId: req.params.ticketId });
  if (!c) return res.status(404).json({ success: false, message: "Ticket not found." });
  res.json({ success: true, complaint: { ticketId: c.ticketId, type: c.type, dept: c.dept, status: c.status, priority: c.priority, createdAt: c.createdAt, resolvedAt: c.resolvedAt } });
}));

// Outage report
app.post("/api/outages",
  body("name").notEmpty(), body("mobile").custom(v => { if (!isValidMobile(v)) throw new Error("Invalid mobile"); return true; }),
  body("area").notEmpty().isLength({ min: 3 }),
  wrap(async (req, res) => {
    if (validate(req, res)) return;
    const { name, mobile, area, ward, since, dept = "electricity" } = req.body;
    const existing = await Outage.countDocuments({ area: new RegExp(area.slice(0, 10), "i"), status: { $in: ["Reported","Acknowledged","InProgress"] } });
    const o = await Outage.create({ reportId: genRef("OUT"), dept, name, mobile, area, ward, since, priority: existing >= 3 ? "CRITICAL" : "HIGH", eta: existing >= 3 ? "2–3 hours" : "4–6 hours" });
    res.status(201).json({ success: true, reportId: o.reportId, priority: o.priority, eta: o.eta });
  })
);

// New connection
app.post("/api/connections",
  body("name").notEmpty(), body("mobile").custom(v => { if (!isValidMobile(v)) throw new Error("Invalid mobile"); return true; }),
  body("aadhaar").custom(v => { if (!isValidAadhaar(v)) throw new Error("Invalid aadhaar"); return true; }),
  body("address").notEmpty().isLength({ min: 10 }), body("dept").notEmpty(), body("sanctionedLoad").isFloat({ min: 0.5 }),
  wrap(async (req, res) => {
    if (validate(req, res)) return;
    const { name, mobile, aadhaar, address, dept, sanctionedLoad, category = "Domestic" } = req.body;
    const aHash = hashAadhaar(aadhaar);
    const dup = await Connection.findOne({ aadhaarHash: aHash, dept, status: { $nin: ["Rejected"] } });
    if (dup) return res.status(409).json({ success: false, message: "Application with this Aadhaar already exists." });
    const c = await Connection.create({ applicationNo: genRef("CONN"), dept, name, mobile, aadhaarHash: aHash, address, sanctionedLoad, category });
    res.status(201).json({ success: true, applicationNo: c.applicationNo, status: c.status });
  })
);

app.get("/api/connections/:appNo", wrap(async (req, res) => {
  const c = await Connection.findOne({ applicationNo: req.params.appNo });
  if (!c) return res.status(404).json({ success: false, message: "Application not found." });
  res.json({ success: true, application: { applicationNo: c.applicationNo, dept: c.dept, name: c.name, address: c.address, category: c.category, sanctionedLoad: c.sanctionedLoad, status: c.status, remarks: c.remarks, createdAt: c.createdAt } });
}));

// Generic service
app.post("/api/services",
  body("name").notEmpty(), body("mobile").custom(v => { if (!isValidMobile(v)) throw new Error("Invalid mobile"); return true; }),
  body("dept").notEmpty(), body("serviceLabel").notEmpty(),
  wrap(async (req, res) => {
    if (validate(req, res)) return;
    const { name, mobile, dept, serviceLabel, description } = req.body;
    const s = await ServiceRequest.create({ requestId: genRef("SVC"), dept, serviceLabel, name, mobile, description });
    res.status(201).json({ success: true, requestId: s.requestId, status: s.status });
  })
);

// Usage history
app.get("/api/consumers/:number/history", wrap(async (req, res) => {
  const bills = await Bill.find({ consumerNumber: req.params.number }).sort({ createdAt: -1 }).limit(12).select("billMonth units amount totalAmount status dueDate");
  res.json({ success: true, history: bills });
}));

// Scheme interest
app.post("/api/schemes/interest",
  body("name").notEmpty(), body("mobile").custom(v => { if (!isValidMobile(v)) throw new Error("Invalid mobile"); return true; }),
  body("scheme").notEmpty(), body("district").notEmpty(),
  wrap(async (req, res) => {
    if (validate(req, res)) return;
    const { name, mobile, scheme, district, village } = req.body;
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const dup = await SchemeInterest.findOne({ mobile: mobile.replace(/\s/g, ""), scheme, createdAt: { $gte: sevenDaysAgo } });
    if (dup) return res.status(409).json({ success: false, message: "Already registered recently." });
    const r = await SchemeInterest.create({ requestId: genRef("SCH"), scheme, name, mobile: mobile.replace(/\s/g, ""), district, village });
    res.status(201).json({ success: true, requestId: r.requestId, status: r.status });
  })
);

app.get("/api/schemes/interest/:requestId", wrap(async (req, res) => {
  const r = await SchemeInterest.findOne({ requestId: req.params.requestId });
  if (!r) return res.status(404).json({ success: false, message: "Request not found." });
  res.json({ success: true, interest: { requestId: r.requestId, scheme: r.scheme, district: r.district, status: r.status, createdAt: r.createdAt, remarks: r.remarks } });
}));

// Voter ID apply
const VOTER_FORM_MAP = { new_voter: "Form 6", correction: "Form 8", duplicate: "Form 002", address_change: "Form 8A" };
app.post("/api/voter/apply", wrap(async (req, res) => {
  const { serviceType, name, mobile, aadhaar, epicNo, address, description } = req.body;
  if (!serviceType || !name || !mobile) return res.status(422).json({ success: false, message: "serviceType, name, mobile required." });
  const VALID = ["new_voter","correction","duplicate","address_change"];
  if (!VALID.includes(serviceType)) return res.status(422).json({ success: false, message: "Invalid serviceType." });
  const cleanMobile = mobile.replace(/\s/g, "");
  if (!/^[6-9]\d{9}$/.test(cleanMobile)) return res.status(422).json({ success: false, message: "Invalid mobile." });
  const referenceNo = genRef("VOTER");
  const now = new Date().toISOString();
  await VoterApplication.create({ referenceNo, serviceType, formNo: VOTER_FORM_MAP[serviceType], applicantName: name.trim(), mobile: cleanMobile, aadhaarHash: aadhaar ? hashAadhaar(aadhaar) : null, epicNo: epicNo?.trim().toUpperCase() || null, address: address?.trim() || null, description: description?.trim() || null, status: "submitted", submittedAt: now, timeline: [{ status: "submitted", label: "Application Submitted", date: now, updatedBy: "citizen" }] });
  res.status(201).json({ success: true, referenceNo, requestId: referenceNo, status: "submitted", formNo: VOTER_FORM_MAP[serviceType], processing: "30–45 Working Days", helpline: "1950" });
}));

app.get("/api/voter/status/:ref", wrap(async (req, res) => {
  const app = await VoterApplication.findOne({ referenceNo: req.params.ref.toUpperCase() }).lean();
  if (!app) return res.status(404).json({ success: false, message: "Application not found." });
  res.json({ success: true, referenceNo: app.referenceNo, serviceType: app.serviceType, formNo: app.formNo, applicantName: app.applicantName, status: app.status, submittedAt: app.submittedAt || app.createdAt, timeline: app.timeline || [] });
}));

// ─── SEED (dev only) ──────────────────────────────────────────────────────────
if (process.env.NODE_ENV !== "production") {
  app.post("/api/seed", wrap(async (_req, res) => {
    await Consumer.deleteMany({}); await Bill.deleteMany({});
    const dueDate = new Date(); dueDate.setDate(dueDate.getDate() + 10);
    const overDue = new Date(); overDue.setDate(overDue.getDate() - 5);
    await Consumer.insertMany([
      { consumerNumber: "1001", dept: "electricity", name: "Ramesh Kumar Sharma", address: "12-A, Pushkar Road, Ajmer", provider: "AVVNL", meterNumber: "MTR-AJ-10234", sanctionedLoad: 5, category: "Domestic", connectionStatus: "Active" },
      { consumerNumber: "1002", dept: "electricity", name: "Priya Verma", address: "44, Civil Lines, Ajmer", provider: "AVVNL", meterNumber: "MTR-AJ-10235", sanctionedLoad: 3, category: "Domestic", connectionStatus: "Active" },
      { consumerNumber: "1003", dept: "electricity", name: "Suresh Trading Co.", address: "Shop 7, Main Market, Ajmer", provider: "AVVNL", meterNumber: "MTR-AJ-10236", sanctionedLoad: 15, category: "Commercial", connectionStatus: "Active" },
      { consumerNumber: "G001", dept: "gas", name: "Asha Devi", address: "Sector 4, Vaishali Nagar, Ajmer", provider: "AVVNL Gas", category: "Domestic", connectionStatus: "Active" },
      { consumerNumber: "M001", dept: "municipal", name: "Mohan Lal Joshi", address: "Ward 12, Madar Gate, Ajmer", provider: "AMC", category: "Domestic", connectionStatus: "Active" },
    ]);
    await Bill.insertMany([
      { billId: "BILL-1001-FEB26", consumerNumber: "1001", dept: "electricity", billMonth: "February 2026", units: 210, amount: 847, taxes: 42, totalAmount: 889, dueDate, status: "Pending" },
      { billId: "BILL-1002-FEB26", consumerNumber: "1002", dept: "electricity", billMonth: "February 2026", units: 145, amount: 583, taxes: 29, totalAmount: 612, dueDate, status: "Pending" },
      { billId: "BILL-1003-FEB26", consumerNumber: "1003", dept: "electricity", billMonth: "February 2026", units: 890, amount: 3560, taxes: 178, totalAmount: 3738, dueDate: overDue, status: "Overdue" },
      { billId: "BILL-G001-FEB26", consumerNumber: "G001", dept: "gas", billMonth: "February 2026", units: 0, amount: 320, taxes: 16, totalAmount: 336, dueDate, status: "Pending" },
      { billId: "BILL-M001-FEB26", consumerNumber: "M001", dept: "municipal", billMonth: "February 2026", units: 0, amount: 120, taxes: 6, totalAmount: 126, dueDate, status: "Pending" },
    ]);
    res.json({ success: true, message: "Demo data seeded ✓" });
  }));
}

// ═══════════════════════════════════════════════════════════════════════════════
//  ADMIN ROUTES — /api/admin/*
// ═══════════════════════════════════════════════════════════════════════════════
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || "suvidha-admin-2025";

function adminAuth(req, res, next) {
  const token = req.headers["x-admin-token"] || req.query.token;
  if (!token || token !== ADMIN_TOKEN)
    return res.status(401).json({ success: false, message: "Unauthorized." });
  next();
}

// In-memory stores (alerts + sessions)
let KIOSK_ALERTS = [
  { id: "al1", type: "warn",  hi: "वार्ड 12–15: आज शाम 4–7 बजे बिजली रखरखाव कार्य", en: "Ward 12–15: Power maintenance 4–7 PM today", active: true, createdAt: new Date().toISOString() },
  { id: "al2", type: "warn",  hi: "जल आपूर्ति कल सुबह 6–9 बजे बंद रहेगी — Zone B",   en: "Water supply off tomorrow 6–9 AM — Zone B",  active: true, createdAt: new Date().toISOString() },
  { id: "al3", type: "green", hi: "माधोगंज: बिजली आपूर्ति दोपहर 2:30 बजे बहाल हुई", en: "Madhoganj: Power restored at 2:30 PM today",  active: true, createdAt: new Date().toISOString() },
  { id: "al4", type: "info",  hi: "नगर पालिका कार्यालय: शनिवार को बंद रहेगा",         en: "Municipal office closed this Saturday",       active: true, createdAt: new Date().toISOString() },
];
const SESSION_LOG = [];

// Dashboard
app.get("/api/admin/dashboard", adminAuth, wrap(async (_req, res) => {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const [
    totalPayments, successPayments, failedPayments, todayPayments, totalRevenue, todayRevenue, deptRevenue,
    totalComplaints, openComplaints, resolvedComplaints, criticalComplaints, todayComplaints,
    totalConnections, pendingConnections,
    totalOutages, activeOutages,
    totalConsumers,
    totalVoter, pendingVoter,
    totalSchemes,
    recentPayments, recentComplaints,
  ] = await Promise.all([
    Payment.countDocuments(),
    Payment.countDocuments({ status: "Success" }),
    Payment.countDocuments({ status: "Failed" }),
    Payment.countDocuments({ createdAt: { $gte: today } }),
    Payment.aggregate([{ $match: { status: "Success" } }, { $group: { _id: null, total: { $sum: "$amount" } } }]).then(r => r[0]?.total ?? 0),
    Payment.aggregate([{ $match: { status: "Success", createdAt: { $gte: today } } }, { $group: { _id: null, total: { $sum: "$amount" } } }]).then(r => r[0]?.total ?? 0),
    Payment.aggregate([{ $match: { status: "Success" } }, { $group: { _id: "$dept", total: { $sum: "$amount" }, count: { $sum: 1 } } }, { $sort: { total: -1 } }]),
    Complaint.countDocuments(),
    Complaint.countDocuments({ status: { $in: ["Registered","InProgress"] } }),
    Complaint.countDocuments({ status: "Resolved" }),
    Complaint.countDocuments({ priority: "CRITICAL" }),
    Complaint.countDocuments({ createdAt: { $gte: today } }),
    Connection.countDocuments(),
    Connection.countDocuments({ status: "Submitted" }),
    Outage.countDocuments(),
    Outage.countDocuments({ status: { $in: ["Reported","Acknowledged","InProgress"] } }),
    Consumer.countDocuments(),
    VoterApplication.countDocuments(),
    VoterApplication.countDocuments({ status: "submitted" }),
    SchemeInterest.countDocuments(),
    Payment.find().sort({ createdAt: -1 }).limit(5).lean(),
    Complaint.find().sort({ createdAt: -1 }).limit(5).lean(),
  ]);
  res.json({
    success: true,
    stats: {
      payments:    { total: totalPayments,   success: successPayments,  failed: failedPayments,  todayCount: todayPayments },
      revenue:     { total: totalRevenue,    today: todayRevenue,        byDept: deptRevenue },
      complaints:  { total: totalComplaints, open: openComplaints,       resolved: resolvedComplaints, critical: criticalComplaints, todayCount: todayComplaints },
      connections: { total: totalConnections, pending: pendingConnections },
      outages:     { total: totalOutages,    active: activeOutages },
      consumers:   { total: totalConsumers },
      voter:       { total: totalVoter,      pending: pendingVoter },
      schemes:     { total: totalSchemes },
      sessions:    { total: SESSION_LOG.length, today: SESSION_LOG.filter(s => new Date(s.createdAt) >= today).length },
      alerts:      { total: KIOSK_ALERTS.length, active: KIOSK_ALERTS.filter(a => a.active).length },
    },
    recentPayments:   recentPayments.map(p  => ({ ref: p.referenceNo, amount: p.amount, dept: p.dept, method: p.paymentMethod, status: p.status, at: p.createdAt })),
    recentComplaints: recentComplaints.map(c => ({ id: c.ticketId, dept: c.dept, type: c.type, priority: c.priority, status: c.status, at: c.createdAt })),
  });
}));

// Payments
app.get("/api/admin/payments", adminAuth, wrap(async (req, res) => {
  const { page=1, limit=20, dept, status, method } = req.query;
  const filter = {};
  if (dept)   filter.dept          = dept;
  if (status) filter.status        = status;
  if (method) filter.paymentMethod = method;
  const { skip, limit: lim, page: pg } = paginate(page, limit);
  const [payments, total] = await Promise.all([Payment.find(filter).sort({ createdAt: -1 }).skip(skip).limit(lim).lean(), Payment.countDocuments(filter)]);
  res.json({ success: true, total, page: pg, pages: Math.ceil(total / lim), payments });
}));

app.patch("/api/admin/payments/:ref", adminAuth, wrap(async (req, res) => {
  const { status, remarks } = req.body;
  const p = await Payment.findOneAndUpdate({ referenceNo: req.params.ref }, { status, ...(remarks ? { gatewayResponse: { adminRemarks: remarks } } : {}) }, { new: true });
  if (!p) return res.status(404).json({ success: false, message: "Payment not found" });
  res.json({ success: true, payment: p });
}));

// Complaints
app.get("/api/admin/complaints", adminAuth, wrap(async (req, res) => {
  const { page=1, limit=20, dept, status, priority } = req.query;
  const filter = {};
  if (dept)     filter.dept     = dept;
  if (status)   filter.status   = status;
  if (priority) filter.priority = priority;
  const { skip, limit: lim, page: pg } = paginate(page, limit);
  const [complaints, total] = await Promise.all([Complaint.find(filter).sort({ createdAt: -1 }).skip(skip).limit(lim).lean(), Complaint.countDocuments(filter)]);
  console.log(`[admin] complaints query:`, filter, `→ found ${complaints.length}/${total}`);
  res.json({ success: true, total, page: pg, pages: Math.ceil(total / lim), complaints });
}));

app.patch("/api/admin/complaints/:id", adminAuth, wrap(async (req, res) => {
  const { status, remarks, priority } = req.body;
  const update = {};
  if (status)   { update.status = status; if (status === "Resolved") update.resolvedAt = new Date(); }
  if (remarks)  update.remarks  = remarks;
  if (priority) update.priority = priority;
  const c = await Complaint.findOneAndUpdate({ ticketId: req.params.id }, update, { new: true });
  if (!c) return res.status(404).json({ success: false, message: "Complaint not found" });
  res.json({ success: true, complaint: c });
}));

// Connections
app.get("/api/admin/connections", adminAuth, wrap(async (req, res) => {
  const { page=1, limit=20, dept, status } = req.query;
  const filter = {};
  if (dept)   filter.dept   = dept;
  if (status) filter.status = status;
  const { skip, limit: lim, page: pg } = paginate(page, limit);
  const [connections, total] = await Promise.all([Connection.find(filter).sort({ createdAt: -1 }).skip(skip).limit(lim).lean(), Connection.countDocuments(filter)]);
  res.json({ success: true, total, page: pg, pages: Math.ceil(total / lim), connections });
}));

app.patch("/api/admin/connections/:app", adminAuth, wrap(async (req, res) => {
  const { status, remarks } = req.body;
  const allowed = ["Submitted","UnderReview","Approved","Rejected","Connected"];
  if (!allowed.includes(status)) return res.status(400).json({ success: false, message: "Invalid status" });
  const c = await Connection.findOneAndUpdate({ applicationNo: req.params.app }, { status, ...(remarks ? { remarks } : {}) }, { new: true });
  if (!c) return res.status(404).json({ success: false, message: "Application not found" });
  res.json({ success: true, connection: c });
}));

// Outages
app.get("/api/admin/outages", adminAuth, wrap(async (req, res) => {
  const { page=1, limit=20, status } = req.query;
  const filter = status ? { status } : {};
  const { skip, limit: lim, page: pg } = paginate(page, limit);
  const [outages, total] = await Promise.all([Outage.find(filter).sort({ createdAt: -1 }).skip(skip).limit(lim).lean(), Outage.countDocuments(filter)]);
  res.json({ success: true, total, page: pg, pages: Math.ceil(total / lim), outages });
}));

app.patch("/api/admin/outages/:id", adminAuth, wrap(async (req, res) => {
  const { status, eta } = req.body;
  const update = { status };
  if (eta) update.eta = eta;
  if (status === "Restored") update.restoredAt = new Date();
  const o = await Outage.findOneAndUpdate({ reportId: req.params.id }, update, { new: true });
  if (!o) return res.status(404).json({ success: false, message: "Outage not found" });
  res.json({ success: true, outage: o });
}));

// Voter Apps
app.get("/api/admin/voter/apps", adminAuth, wrap(async (req, res) => {
  const { page=1, limit=20, status, serviceType } = req.query;
  const filter = {};
  if (status)      filter.status      = status;
  if (serviceType) filter.serviceType = serviceType;
  const { skip, limit: lim, page: pg } = paginate(page, limit);
  const [docs, total] = await Promise.all([VoterApplication.find(filter).sort({ createdAt: -1 }).skip(skip).limit(lim).lean(), VoterApplication.countDocuments(filter)]);
  res.json({
    success: true, total, page: pg, pages: Math.ceil(total / lim),
    applications: docs.map(a => ({ referenceNo: a.referenceNo, serviceType: a.serviceType, formNo: a.formNo, applicantName: a.applicantName, mobile: a.mobile ? `XXXXX${String(a.mobile).slice(-5)}` : "—", epicNo: a.epicNo || "—", status: a.status, note: a.note || null, submittedAt: a.submittedAt || a.createdAt, updatedAt: a.updatedAt })),
  });
}));

app.patch("/api/admin/voter/apps/:ref", adminAuth, wrap(async (req, res) => {
  const STATUS_LABELS = { submitted:"Submitted", blo_pending:"Awaiting BLO", blo_done:"BLO Verified", eci_review:"ECI Review", approved:"Approved", rejected:"Rejected", card_printed:"Card Printed", dispatched:"Dispatched", delivered:"Delivered" };
  const { status, note } = req.body;
  if (!STATUS_LABELS[status]) return res.status(400).json({ success: false, message: "Invalid status" });
  const doc = await VoterApplication.findOneAndUpdate({ referenceNo: req.params.ref.toUpperCase() }, { status, ...(note ? { note } : {}), $push: { timeline: { status, label: STATUS_LABELS[status], date: new Date().toISOString(), updatedBy: "admin" } } }, { new: true });
  if (!doc) return res.status(404).json({ success: false, message: "Application not found" });
  res.json({ success: true, referenceNo: doc.referenceNo, status: doc.status });
}));

// Schemes
app.get("/api/admin/schemes", adminAuth, wrap(async (req, res) => {
  const { page=1, limit=20, status, scheme } = req.query;
  const filter = {};
  if (status) filter.status = status;
  if (scheme) filter.scheme = new RegExp(scheme, "i");
  const { skip, limit: lim, page: pg } = paginate(page, limit);
  const [items, total] = await Promise.all([SchemeInterest.find(filter).sort({ createdAt: -1 }).skip(skip).limit(lim).lean(), SchemeInterest.countDocuments(filter)]);
  res.json({ success: true, total, page: pg, pages: Math.ceil(total / lim), items });
}));

app.patch("/api/admin/schemes/:id", adminAuth, wrap(async (req, res) => {
  const { status, remarks } = req.body;
  const r = await SchemeInterest.findOneAndUpdate({ requestId: req.params.id }, { status, ...(remarks ? { remarks } : {}) }, { new: true });
  if (!r) return res.status(404).json({ success: false, message: "Scheme request not found" });
  res.json({ success: true, item: r });
}));

// Consumers (admin)
app.get("/api/admin/consumers", adminAuth, wrap(async (req, res) => {
  const { page=1, limit=20, dept, status, q } = req.query;
  const filter = {};
  if (dept)   filter.dept             = dept;
  if (status) filter.connectionStatus = status;
  if (q)      filter.$or = [{ consumerNumber: new RegExp(q, "i") }, { name: new RegExp(q, "i") }];
  const { skip, limit: lim, page: pg } = paginate(page, limit);
  const [consumers, total] = await Promise.all([Consumer.find(filter).sort({ createdAt: -1 }).skip(skip).limit(lim).lean(), Consumer.countDocuments(filter)]);
  res.json({ success: true, total, page: pg, pages: Math.ceil(total / lim), consumers });
}));

app.patch("/api/admin/consumers/:num", adminAuth, wrap(async (req, res) => {
  const { connectionStatus, category, sanctionedLoad, address } = req.body;
  const update = {};
  if (connectionStatus) update.connectionStatus = connectionStatus;
  if (category)         update.category         = category;
  if (sanctionedLoad)   update.sanctionedLoad   = Number(sanctionedLoad);
  if (address)          update.address          = address;
  const c = await Consumer.findOneAndUpdate({ consumerNumber: req.params.num }, update, { new: true });
  if (!c) return res.status(404).json({ success: false, message: "Consumer not found" });
  res.json({ success: true, consumer: c });
}));

// Alerts
app.get("/api/admin/alerts", adminAuth, (_req, res) => res.json({ success: true, alerts: KIOSK_ALERTS }));

app.post("/api/admin/alerts", adminAuth, (req, res) => {
  const { type = "info", hi, en } = req.body;
  if (!hi || !en) return res.status(400).json({ success: false, message: "hi and en text required" });
  const alert = { id: `al${Date.now()}`, type: ["warn","green","info"].includes(type) ? type : "info", hi, en, active: true, createdAt: new Date().toISOString() };
  KIOSK_ALERTS.push(alert);
  res.status(201).json({ success: true, alert });
});

app.patch("/api/admin/alerts/:id", adminAuth, (req, res) => {
  const al = KIOSK_ALERTS.find(a => a.id === req.params.id);
  if (!al) return res.status(404).json({ success: false, message: "Alert not found" });
  const { hi, en, type, active } = req.body;
  if (hi     !== undefined) al.hi     = hi;
  if (en     !== undefined) al.en     = en;
  if (type   !== undefined) al.type   = type;
  if (active !== undefined) al.active = active;
  res.json({ success: true, alert: al });
});

app.delete("/api/admin/alerts/:id", adminAuth, (req, res) => {
  const idx = KIOSK_ALERTS.findIndex(a => a.id === req.params.id);
  if (idx === -1) return res.status(404).json({ success: false, message: "Alert not found" });
  KIOSK_ALERTS.splice(idx, 1);
  res.json({ success: true });
});

// Analytics chart
app.get("/api/admin/analytics/chart", adminAuth, wrap(async (req, res) => {
  const { days = 7 } = req.query;
  const N    = Math.min(30, Math.max(3, parseInt(days)));
  const from = new Date(); from.setDate(from.getDate() - N + 1); from.setHours(0, 0, 0, 0);
  const [revByDay, cmpByDay, payByMethod] = await Promise.all([
    Payment.aggregate([{ $match: { status: "Success", createdAt: { $gte: from } } }, { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, revenue: { $sum: "$amount" }, count: { $sum: 1 } } }, { $sort: { _id: 1 } }]),
    Complaint.aggregate([{ $match: { createdAt: { $gte: from } } }, { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, count: { $sum: 1 } } }, { $sort: { _id: 1 } }]),
    Payment.aggregate([{ $match: { status: "Success" } }, { $group: { _id: "$paymentMethod", total: { $sum: "$amount" }, count: { $sum: 1 } } }]),
  ]);
  const labels = [], revenueData = [], paymentsData = [], complaintsData = [];
  for (let i = 0; i < N; i++) {
    const d = new Date(from); d.setDate(d.getDate() + i);
    const key = d.toISOString().slice(0, 10);
    const rv  = revByDay.find(r => r._id === key);
    const cm  = cmpByDay.find(r => r._id === key);
    labels.push(key.slice(5));
    revenueData.push(rv?.revenue ?? 0);
    paymentsData.push(rv?.count ?? 0);
    complaintsData.push(cm?.count ?? 0);
  }
  res.json({ success: true, chart: { labels, revenueData, paymentsData, complaintsData, payByMethod } });
}));

// Sessions
app.get("/api/admin/sessions", adminAuth, (req, res) => {
  const { limit = 50 } = req.query;
  res.json({ success: true, total: SESSION_LOG.length, sessions: SESSION_LOG.slice(-Math.min(200, parseInt(limit))).reverse() });
});

app.post("/api/admin/sessions", adminAuth, (req, res) => {
  const { lang, screen, duration, dept, flow } = req.body;
  SESSION_LOG.push({ lang, screen, dept, flow, duration, createdAt: new Date().toISOString() });
  if (SESSION_LOG.length > 1000) SESSION_LOG.splice(0, 200);
  res.json({ success: true });
});

// Export
app.get("/api/admin/export/:type", adminAuth, wrap(async (req, res) => {
  const modelMap = { payments: Payment, complaints: Complaint, connections: Connection, outages: Outage, consumers: Consumer, schemes: SchemeInterest, voter: VoterApplication };
  const Model = modelMap[req.params.type];
  if (!Model) return res.status(400).json({ success: false, message: "Invalid export type" });
  const data = await Model.find({}).lean();
  res.json({ success: true, type: req.params.type, count: data.length, exportedAt: new Date().toISOString(), data });
}));

// ─── Global error handler ─────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error("❌ SERVER ERROR:", err.message);
  res.status(500).json({ success: false, message: "Server error: " + err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀  Kiosk backend → http://localhost:${PORT}`);
  console.log(`🔐  Admin panel  → http://localhost:${PORT}/api/admin/dashboard`);
  console.log(`🔑  Admin token  → ${ADMIN_TOKEN}`);
});