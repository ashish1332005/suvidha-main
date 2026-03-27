// /**
//  * kiosk-backend/routes/admin.js
//  *
//  * SUVIDHA KIOSK — ADMIN PANEL API
//  * ================================
//  * All endpoints require admin token header: x-admin-token
//  * Set ADMIN_TOKEN in .env
//  *
//  * Mount in server.js (AFTER all mongoose models are defined):
//  *   const adminRoutes = require('./routes/admin');
//  *   app.use('/api/admin', adminRoutes);
//  */

// require("dotenv").config();
// const express  = require("express");
// const mongoose = require("mongoose");
// const router   = express.Router();

// // ─── Admin Auth ───────────────────────────────────────────────────────────────
// const ADMIN_TOKEN = process.env.ADMIN_TOKEN || "suvidha-admin-2025";

// function adminAuth(req, res, next) {
//   const token = req.headers["x-admin-token"] || req.query.token;
//   if (!token || token !== ADMIN_TOKEN) {
//     return res.status(401).json({ success:false, message:"Unauthorized. Invalid admin token." });
//   }
//   next();
// }
// router.use(adminAuth);

// // ─── Model getter — safe reference after server.js registers them ─────────────
// const getModel = (name) => {
//   try { return mongoose.model(name); }
//   catch { return null; }
// };

// // ─── Alert store (in-memory; swap to MongoDB AlertSchema for persistence) ─────
// let KIOSK_ALERTS = [
//   { id:"al1", type:"warn",  hi:"वार्ड 12–15: आज शाम 4–7 बजे बिजली रखरखाव कार्य",  en:"Ward 12–15: Power maintenance 4–7 PM today",  active:true,  createdAt:new Date().toISOString() },
//   { id:"al2", type:"warn",  hi:"जल आपूर्ति कल सुबह 6–9 बजे बंद रहेगी — Zone B",    en:"Water supply off tomorrow 6–9 AM — Zone B",   active:true,  createdAt:new Date().toISOString() },
//   { id:"al3", type:"green", hi:"माधोगंज: बिजली आपूर्ति दोपहर 2:30 बजे बहाल हुई",  en:"Madhoganj: Power restored at 2:30 PM today",  active:true,  createdAt:new Date().toISOString() },
//   { id:"al4", type:"info",  hi:"नगर पालिका कार्यालय: शनिवार को बंद रहेगा",          en:"Municipal office closed this Saturday",        active:true,  createdAt:new Date().toISOString() },
// ];

// // ─── Session log (in-memory rolling window) ───────────────────────────────────
// const SESSION_LOG = [];

// // ─── Helpers ──────────────────────────────────────────────────────────────────
// const wrap = (fn) => (req, res, next) =>
//   Promise.resolve(fn(req, res, next)).catch(next);

// // ✅ FIX: paginate was receiving unused `query` arg and calculating skip wrong
// function paginate(page, limit) {
//   const p = Math.max(1, parseInt(page)  || 1);
//   const l = Math.min(100, Math.max(1, parseInt(limit) || 20));
//   return { skip: (p - 1) * l, limit: l, page: p };
// }

// // ─── DASHBOARD ────────────────────────────────────────────────────────────────
// router.get("/dashboard", wrap(async (_req, res) => {
//   const Payment          = getModel("Payment");
//   const Complaint        = getModel("Complaint");
//   const Connection       = getModel("Connection");
//   const Outage           = getModel("Outage");
//   const Consumer         = getModel("Consumer");
//   const VoterApplication = getModel("VoterApplication");
//   const SchemeInterest   = getModel("SchemeInterest");

//   const today = new Date(); today.setHours(0, 0, 0, 0);

//   const [
//     totalPayments, successPayments, failedPayments, todayPayments, totalRevenue, todayRevenue,
//     totalComplaints, openComplaints, resolvedComplaints, criticalComplaints, todayComplaints,
//     totalConnections, pendingConnections,
//     totalOutages, activeOutages,
//     totalConsumers,
//     totalVoter, pendingVoter,
//     totalSchemes,
//     deptRevenue,
//     recentPayments, recentComplaints,
//   ] = await Promise.all([
//     Payment?.countDocuments()                                               ?? 0,
//     Payment?.countDocuments({ status:"Success" })                           ?? 0,
//     Payment?.countDocuments({ status:"Failed" })                            ?? 0,
//     Payment?.countDocuments({ createdAt:{ $gte:today } })                   ?? 0,
//     Payment?.aggregate([{ $match:{ status:"Success" } }, { $group:{ _id:null, total:{ $sum:"$amount" } } }]).then(r => r[0]?.total ?? 0),
//     Payment?.aggregate([{ $match:{ status:"Success", createdAt:{ $gte:today } } }, { $group:{ _id:null, total:{ $sum:"$amount" } } }]).then(r => r[0]?.total ?? 0),
//     Complaint?.countDocuments()                                             ?? 0,
//     Complaint?.countDocuments({ status:{ $in:["Registered","InProgress"] } }) ?? 0,
//     Complaint?.countDocuments({ status:"Resolved" })                        ?? 0,
//     Complaint?.countDocuments({ priority:"CRITICAL" })                      ?? 0,
//     Complaint?.countDocuments({ createdAt:{ $gte:today } })                 ?? 0,
//     Connection?.countDocuments()                                            ?? 0,
//     Connection?.countDocuments({ status:"Submitted" })                      ?? 0,
//     Outage?.countDocuments()                                                ?? 0,
//     Outage?.countDocuments({ status:{ $in:["Reported","Acknowledged","InProgress"] } }) ?? 0,
//     Consumer?.countDocuments()                                              ?? 0,
//     VoterApplication?.countDocuments()                                      ?? 0,
//     VoterApplication?.countDocuments({ status:"submitted" })                ?? 0,
//     SchemeInterest?.countDocuments()                                        ?? 0,
//     Payment?.aggregate([{ $match:{ status:"Success" } }, { $group:{ _id:"$dept", total:{ $sum:"$amount" }, count:{ $sum:1 } } }, { $sort:{ total:-1 } }]) ?? [],
//     Payment?.find().sort({ createdAt:-1 }).limit(5).lean()                  ?? [],
//     Complaint?.find().sort({ createdAt:-1 }).limit(5).lean()                ?? [],
//   ]);

//   res.json({
//     success: true,
//     stats: {
//       payments:    { total:totalPayments,    success:successPayments,   failed:failedPayments,  todayCount:todayPayments },
//       revenue:     { total:totalRevenue,     today:todayRevenue,         byDept:deptRevenue },
//       complaints:  { total:totalComplaints,  open:openComplaints,        resolved:resolvedComplaints, critical:criticalComplaints, todayCount:todayComplaints },
//       connections: { total:totalConnections, pending:pendingConnections },
//       outages:     { total:totalOutages,     active:activeOutages },
//       consumers:   { total:totalConsumers },
//       voter:       { total:totalVoter,       pending:pendingVoter },
//       schemes:     { total:totalSchemes },
//       sessions:    { total:SESSION_LOG.length, today:SESSION_LOG.filter(s => new Date(s.createdAt) >= today).length },
//       alerts:      { total:KIOSK_ALERTS.length, active:KIOSK_ALERTS.filter(a => a.active).length },
//     },
//     recentPayments:   recentPayments.map(p  => ({ ref:p.referenceNo, amount:p.amount, dept:p.dept, method:p.paymentMethod, status:p.status, at:p.createdAt })),
//     recentComplaints: recentComplaints.map(c => ({ id:c.ticketId,     dept:c.dept,    type:c.type, priority:c.priority,    status:c.status, at:c.createdAt })),
//   });
// }));

// // ─── PAYMENTS ─────────────────────────────────────────────────────────────────
// router.get("/payments", wrap(async (req, res) => {
//   const Payment = getModel("Payment");
//   const { page=1, limit=20, dept, status, method, from, to } = req.query;
//   const filter = {};
//   if (dept)   filter.dept          = dept;
//   if (status) filter.status        = status;
//   if (method) filter.paymentMethod = method;
//   if (from || to) {
//     filter.createdAt = {};
//     if (from) filter.createdAt.$gte = new Date(from);
//     if (to)   filter.createdAt.$lte = new Date(to);
//   }
//   const { skip, limit:lim, page:pg } = paginate(page, limit);
//   const [payments, total] = await Promise.all([
//     Payment?.find(filter).sort({ createdAt:-1 }).skip(skip).limit(lim).lean() ?? [],
//     Payment?.countDocuments(filter) ?? 0,
//   ]);
//   res.json({ success:true, total, page:pg, pages:Math.ceil(total/lim), payments });
// }));

// router.patch("/payments/:ref", wrap(async (req, res) => {
//   const Payment = getModel("Payment");
//   const { status, remarks } = req.body;
//   const p = await Payment?.findOneAndUpdate(
//     { referenceNo:req.params.ref },
//     { status, ...(remarks ? { gatewayResponse:{ adminRemarks:remarks } } : {}) },
//     { new:true }
//   );
//   if (!p) return res.status(404).json({ success:false, message:"Payment not found" });
//   res.json({ success:true, payment:p });
// }));

// // ─── COMPLAINTS ───────────────────────────────────────────────────────────────
// router.get("/complaints", wrap(async (req, res) => {
//   const Complaint = getModel("Complaint");
//   const { page=1, limit=20, dept, status, priority } = req.query;
//   const filter = {};
//   if (dept)     filter.dept     = dept;
//   if (status)   filter.status   = status;
//   if (priority) filter.priority = priority;
//   const { skip, limit:lim, page:pg } = paginate(page, limit);
//   const [complaints, total] = await Promise.all([
//     Complaint?.find(filter).sort({ createdAt:-1 }).skip(skip).limit(lim).lean() ?? [],
//     Complaint?.countDocuments(filter) ?? 0,
//   ]);
//   res.json({ success:true, total, page:pg, pages:Math.ceil(total/lim), complaints });
// }));

// router.patch("/complaints/:id", wrap(async (req, res) => {
//   const Complaint = getModel("Complaint");
//   const { status, remarks, priority } = req.body;
//   const update = {};
//   if (status)   { update.status   = status;   if (status === "Resolved") update.resolvedAt = new Date(); }
//   if (remarks)  update.remarks  = remarks;
//   if (priority) update.priority = priority;
//   const c = await Complaint?.findOneAndUpdate({ ticketId:req.params.id }, update, { new:true });
//   if (!c) return res.status(404).json({ success:false, message:"Complaint not found" });
//   res.json({ success:true, complaint:c });
// }));

// // ─── CONNECTIONS ──────────────────────────────────────────────────────────────
// router.get("/connections", wrap(async (req, res) => {
//   const Connection = getModel("Connection");
//   const { page=1, limit=20, dept, status } = req.query;
//   const filter = {};
//   if (dept)   filter.dept   = dept;
//   if (status) filter.status = status;
//   const { skip, limit:lim, page:pg } = paginate(page, limit);
//   const [connections, total] = await Promise.all([
//     Connection?.find(filter).sort({ createdAt:-1 }).skip(skip).limit(lim).lean() ?? [],
//     Connection?.countDocuments(filter) ?? 0,
//   ]);
//   res.json({ success:true, total, page:pg, pages:Math.ceil(total/lim), connections });
// }));

// router.patch("/connections/:app", wrap(async (req, res) => {
//   const Connection = getModel("Connection");
//   const { status, remarks } = req.body;
//   const allowed = ["Submitted","UnderReview","Approved","Rejected","Connected"];
//   if (!allowed.includes(status)) return res.status(400).json({ success:false, message:"Invalid status" });
//   const c = await Connection?.findOneAndUpdate(
//     { applicationNo:req.params.app },
//     { status, ...(remarks ? { remarks } : {}) },
//     { new:true }
//   );
//   if (!c) return res.status(404).json({ success:false, message:"Application not found" });
//   res.json({ success:true, connection:c });
// }));

// // ─── OUTAGES ──────────────────────────────────────────────────────────────────
// router.get("/outages", wrap(async (req, res) => {
//   const Outage = getModel("Outage");
//   const { page=1, limit=20, status } = req.query;
//   const filter = status ? { status } : {};
//   const { skip, limit:lim, page:pg } = paginate(page, limit);
//   const [outages, total] = await Promise.all([
//     Outage?.find(filter).sort({ createdAt:-1 }).skip(skip).limit(lim).lean() ?? [],
//     Outage?.countDocuments(filter) ?? 0,
//   ]);
//   res.json({ success:true, total, page:pg, pages:Math.ceil(total/lim), outages });
// }));

// router.patch("/outages/:id", wrap(async (req, res) => {
//   const Outage = getModel("Outage");
//   const { status, eta } = req.body;
//   const update = { status };
//   if (eta)                   update.eta        = eta;
//   if (status === "Restored") update.restoredAt = new Date();
//   const o = await Outage?.findOneAndUpdate({ reportId:req.params.id }, update, { new:true });
//   if (!o) return res.status(404).json({ success:false, message:"Outage report not found" });
//   res.json({ success:true, outage:o });
// }));

// // ─── VOTER APPLICATIONS ───────────────────────────────────────────────────────
// // ✅ FIX: Reads directly from MongoDB VoterApplication model (not in-memory Map)
// router.get("/voter/apps", wrap(async (req, res) => {
//   const VoterApplication = getModel("VoterApplication");
//   if (!VoterApplication) return res.json({ success:true, total:0, applications:[] });

//   const { page=1, limit=20, status, serviceType } = req.query;
//   const filter = {};
//   if (status)      filter.status      = status;
//   if (serviceType) filter.serviceType = serviceType;

//   const { skip, limit:lim, page:pg } = paginate(page, limit);
//   const [docs, total] = await Promise.all([
//     VoterApplication.find(filter).sort({ createdAt:-1 }).skip(skip).limit(lim).lean(),
//     VoterApplication.countDocuments(filter),
//   ]);

//   res.json({
//     success:true, total, page:pg, pages:Math.ceil(total/lim),
//     applications: docs.map(a => ({
//       referenceNo:   a.referenceNo,
//       serviceType:   a.serviceType,
//       formNo:        a.formNo,
//       applicantName: a.applicantName,
//       // Mask mobile for privacy (show last 5 digits only)
//       mobile:        a.mobile ? `XXXXX${String(a.mobile).slice(-5)}` : "—",
//       epicNo:        a.epicNo || "—",
//       status:        a.status,
//       note:          a.note || null,
//       submittedAt:   a.submittedAt || a.createdAt,
//       updatedAt:     a.updatedAt,
//     })),
//   });
// }));

// router.patch("/voter/apps/:ref", wrap(async (req, res) => {
//   const VoterApplication = getModel("VoterApplication");
//   if (!VoterApplication) return res.status(503).json({ success:false, message:"VoterApplication model not available" });

//   const STATUS_LABELS = {
//     submitted:"Submitted", blo_pending:"Awaiting BLO", blo_done:"BLO Verified",
//     eci_review:"ECI Review", approved:"Approved", rejected:"Rejected",
//     card_printed:"Card Printed", dispatched:"Dispatched", delivered:"Delivered",
//   };

//   const { status, note } = req.body;
//   if (!STATUS_LABELS[status]) return res.status(400).json({ success:false, message:"Invalid status" });

//   const timelineEntry = { status, label:STATUS_LABELS[status], date:new Date().toISOString(), updatedBy:"admin" };

//   const doc = await VoterApplication.findOneAndUpdate(
//     { referenceNo:req.params.ref.toUpperCase() },
//     {
//       status,
//       ...(note ? { note } : {}),
//       $push:{ timeline:timelineEntry },
//     },
//     { new:true }
//   );
//   if (!doc) return res.status(404).json({ success:false, message:"Application not found" });
//   res.json({ success:true, referenceNo:doc.referenceNo, status:doc.status });
// }));

// // ─── SCHEME INTEREST ──────────────────────────────────────────────────────────
// router.get("/schemes", wrap(async (req, res) => {
//   const SchemeInterest = getModel("SchemeInterest");
//   const { page=1, limit=20, status, scheme } = req.query;
//   const filter = {};
//   if (status) filter.status = status;
//   if (scheme) filter.scheme = new RegExp(scheme, "i");
//   const { skip, limit:lim, page:pg } = paginate(page, limit);
//   const [items, total] = await Promise.all([
//     SchemeInterest?.find(filter).sort({ createdAt:-1 }).skip(skip).limit(lim).lean() ?? [],
//     SchemeInterest?.countDocuments(filter) ?? 0,
//   ]);
//   res.json({ success:true, total, page:pg, pages:Math.ceil(total/lim), items });
// }));

// router.patch("/schemes/:id", wrap(async (req, res) => {
//   const SchemeInterest = getModel("SchemeInterest");
//   const { status, remarks } = req.body;
//   const r = await SchemeInterest?.findOneAndUpdate(
//     { requestId:req.params.id },
//     { status, ...(remarks ? { remarks } : {}) },
//     { new:true }
//   );
//   if (!r) return res.status(404).json({ success:false, message:"Scheme request not found" });
//   res.json({ success:true, item:r });
// }));

// // ─── CONSUMERS ────────────────────────────────────────────────────────────────
// router.get("/consumers", wrap(async (req, res) => {
//   const Consumer = getModel("Consumer");
//   const { page=1, limit=20, dept, status, q } = req.query;
//   const filter = {};
//   if (dept)   filter.dept             = dept;
//   if (status) filter.connectionStatus = status;
//   if (q)      filter.$or = [
//     { consumerNumber: new RegExp(q, "i") },
//     { name:           new RegExp(q, "i") },
//   ];
//   const { skip, limit:lim, page:pg } = paginate(page, limit);
//   const [consumers, total] = await Promise.all([
//     Consumer?.find(filter).sort({ createdAt:-1 }).skip(skip).limit(lim).lean() ?? [],
//     Consumer?.countDocuments(filter) ?? 0,
//   ]);
//   res.json({ success:true, total, page:pg, pages:Math.ceil(total/lim), consumers });
// }));

// router.patch("/consumers/:num", wrap(async (req, res) => {
//   const Consumer = getModel("Consumer");
//   const { connectionStatus, category, sanctionedLoad, address } = req.body;
//   const update = {};
//   if (connectionStatus) update.connectionStatus = connectionStatus;
//   if (category)         update.category         = category;
//   if (sanctionedLoad)   update.sanctionedLoad   = Number(sanctionedLoad);
//   if (address)          update.address          = address;
//   const c = await Consumer?.findOneAndUpdate({ consumerNumber:req.params.num }, update, { new:true });
//   if (!c) return res.status(404).json({ success:false, message:"Consumer not found" });
//   res.json({ success:true, consumer:c });
// }));

// // ─── ALERTS ───────────────────────────────────────────────────────────────────
// router.get("/alerts", (_req, res) => {
//   res.json({ success:true, alerts:KIOSK_ALERTS });
// });

// router.post("/alerts", (req, res) => {
//   const { type="info", hi, en } = req.body;
//   if (!hi || !en) return res.status(400).json({ success:false, message:"hi and en text required" });
//   const alert = {
//     id:        `al${Date.now()}`,
//     type:      ["warn","green","info"].includes(type) ? type : "info",
//     hi, en,
//     active:    true,
//     createdAt: new Date().toISOString(),
//   };
//   KIOSK_ALERTS.push(alert);
//   res.status(201).json({ success:true, alert });
// });

// router.patch("/alerts/:id", (req, res) => {
//   const al = KIOSK_ALERTS.find(a => a.id === req.params.id);
//   if (!al) return res.status(404).json({ success:false, message:"Alert not found" });
//   const { hi, en, type, active } = req.body;
//   if (hi     !== undefined) al.hi     = hi;
//   if (en     !== undefined) al.en     = en;
//   if (type   !== undefined) al.type   = type;
//   if (active !== undefined) al.active = active;
//   res.json({ success:true, alert:al });
// });

// router.delete("/alerts/:id", (req, res) => {
//   const idx = KIOSK_ALERTS.findIndex(a => a.id === req.params.id);
//   if (idx === -1) return res.status(404).json({ success:false, message:"Alert not found" });
//   KIOSK_ALERTS.splice(idx, 1);
//   res.json({ success:true, message:"Alert deleted" });
// });

// // ─── ANALYTICS CHART DATA ─────────────────────────────────────────────────────
// router.get("/analytics/chart", wrap(async (req, res) => {
//   const Payment   = getModel("Payment");
//   const Complaint = getModel("Complaint");
//   const { days=7 } = req.query;
//   const N    = Math.min(30, Math.max(3, parseInt(days)));
//   const from = new Date(); from.setDate(from.getDate() - N + 1); from.setHours(0,0,0,0);

//   const [revByDay, cmpByDay, payByMethod] = await Promise.all([
//     Payment?.aggregate([
//       { $match:{ status:"Success", createdAt:{ $gte:from } } },
//       { $group:{ _id:{ $dateToString:{ format:"%Y-%m-%d", date:"$createdAt" } }, revenue:{ $sum:"$amount" }, count:{ $sum:1 } } },
//       { $sort:{ _id:1 } },
//     ]) ?? [],
//     Complaint?.aggregate([
//       { $match:{ createdAt:{ $gte:from } } },
//       { $group:{ _id:{ $dateToString:{ format:"%Y-%m-%d", date:"$createdAt" } }, count:{ $sum:1 } } },
//       { $sort:{ _id:1 } },
//     ]) ?? [],
//     Payment?.aggregate([
//       { $match:{ status:"Success" } },
//       { $group:{ _id:"$paymentMethod", total:{ $sum:"$amount" }, count:{ $sum:1 } } },
//     ]) ?? [],
//   ]);

//   const labels = [], revenueData = [], paymentsData = [], complaintsData = [];
//   for (let i = 0; i < N; i++) {
//     const d   = new Date(from); d.setDate(d.getDate() + i);
//     const key = d.toISOString().slice(0,10);
//     const rv  = revByDay.find(r => r._id === key);
//     const cm  = cmpByDay.find(r => r._id === key);
//     labels.push(key.slice(5));
//     revenueData.push(rv?.revenue  ?? 0);
//     paymentsData.push(rv?.count   ?? 0);
//     complaintsData.push(cm?.count ?? 0);
//   }

//   res.json({ success:true, chart:{ labels, revenueData, paymentsData, complaintsData, payByMethod } });
// }));

// // ─── SESSIONS ─────────────────────────────────────────────────────────────────
// router.get("/sessions", (req, res) => {
//   const { limit=50 } = req.query;
//   const sessions = SESSION_LOG.slice(-Math.min(200, parseInt(limit))).reverse();
//   res.json({ success:true, total:SESSION_LOG.length, sessions });
// });

// router.post("/sessions", (req, res) => {
//   const { lang, screen, duration, dept, flow } = req.body;
//   SESSION_LOG.push({ lang, screen, dept, flow, duration, createdAt:new Date().toISOString() });
//   if (SESSION_LOG.length > 1000) SESSION_LOG.splice(0, 200);
//   res.json({ success:true });
// });

// // ─── EXPORT ───────────────────────────────────────────────────────────────────
// router.get("/export/:type", wrap(async (req, res) => {
//   const { type } = req.params;
//   const modelMap = {
//     payments:"Payment", complaints:"Complaint", connections:"Connection",
//     outages:"Outage", consumers:"Consumer", schemes:"SchemeInterest",
//     voter:"VoterApplication",
//   };
//   if (!modelMap[type]) return res.status(400).json({ success:false, message:"Invalid export type" });
//   const Model = getModel(modelMap[type]);
//   const data  = await Model?.find({}).lean() ?? [];
//   res.json({ success:true, type, count:data.length, exportedAt:new Date().toISOString(), data });
// }));

// // ─── Error handler ────────────────────────────────────────────────────────────
// router.use((err, _req, res, _next) => {
//   console.error("[ADMIN]", err.message);
//   res.status(500).json({ success:false, message:"Admin API error: " + err.message });
// });

// module.exports = router;