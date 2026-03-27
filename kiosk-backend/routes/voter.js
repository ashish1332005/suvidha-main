/**
 * kiosk-backend/routes/voter.js
 *
 * VOTER ID SERVICES — BACKEND API
 * ================================
 * In-memory data store (swap with MongoDB easily — each store is one collection)
 *
 * Endpoints:
 *  POST   /api/voter/otp/send          — Send OTP to mobile
 *  POST   /api/voter/otp/verify        — Verify OTP
 *  GET    /api/voter/search            — Search voter by EPIC / name / DOB
 *  GET    /api/voter/epic/:epicNo      — Get voter by EPIC number
 *  POST   /api/voter/apply             — Submit new registration (Form 6)
 *  POST   /api/voter/correction        — Submit correction (Form 8)
 *  GET    /api/voter/status/:refNo     — Track application status
 *  GET    /api/voter/download/:epicNo  — Verify & prepare e-EPIC download
 *  GET    /api/voter/analytics         — Admin: submission stats
 *
 * Mount in server.js:
 *   const voterRoutes = require('./routes/voter');
 *   app.use('/api/voter', voterRoutes);
 */

const express    = require('express');
const router     = express.Router();
const { v4: uuid } = require('uuid');  // npm install uuid

// ─────────────────────────────────────────────────────────────────
//  IN-MEMORY DATA STORE
//  (Replace with mongoose models when moving to MongoDB)
// ─────────────────────────────────────────────────────────────────

/**
 * VOTERS STORE — existing registered voters (seed data)
 * Schema: { epicNo, name, fatherName, dob, gender, address, booth, assembly, mobile, state, district }
 */
const VOTERS_DB = new Map([
  ['RJ/01/123/001001', {
    epicNo: 'RJ/01/123/001001', name: 'Ramesh Kumar Sharma', fatherName: 'Suresh Kumar Sharma',
    dob: '1985-06-15', gender: 'M', mobile: '9876543210',
    address: 'House No. 42, Gandhi Nagar, Near SBI Bank', city: 'Ajmer',
    district: 'Ajmer', state: 'Rajasthan', pincode: '305001',
    booth: 'Booth 14 — Gandhi Primary School', assembly: 'Ajmer North (08)',
    photo: null, status: 'active',
  }],
  ['RJ/01/123/001002', {
    epicNo: 'RJ/01/123/001002', name: 'Sunita Devi Verma', fatherName: 'Manoj Kumar Verma',
    dob: '1990-03-22', gender: 'F', mobile: '9123456789',
    address: 'B-204, Pushkar Road Colony', city: 'Ajmer',
    district: 'Ajmer', state: 'Rajasthan', pincode: '305004',
    booth: 'Booth 27 — Pushkar Road Govt School', assembly: 'Ajmer South (09)',
    photo: null, status: 'active',
  }],
  ['RJ/01/123/001003', {
    epicNo: 'RJ/01/123/001003', name: 'Mohammad Arif Khan', fatherName: 'Hamid Khan',
    dob: '1978-11-08', gender: 'M', mobile: '9988776655',
    address: '15, Dargah Road, Nala Bazaar', city: 'Ajmer',
    district: 'Ajmer', state: 'Rajasthan', pincode: '305001',
    booth: 'Booth 5 — Dargah Road Primary School', assembly: 'Ajmer Central (07)',
    photo: null, status: 'active',
  }],
  ['RJ/01/123/001004', {
    epicNo: 'RJ/01/123/001004', name: 'Priya Singh Rathore', fatherName: 'Vikram Singh Rathore',
    dob: '1995-08-30', gender: 'F', mobile: '9765432109',
    address: '7, Civil Lines, Near Collectorate', city: 'Ajmer',
    district: 'Ajmer', state: 'Rajasthan', pincode: '305001',
    booth: 'Booth 2 — Civil Lines Govt School', assembly: 'Ajmer North (08)',
    photo: null, status: 'active',
  }],
  ['RJ/01/123/001005', {
    epicNo: 'RJ/01/123/001005', name: 'Gopal Lal Meena', fatherName: 'Bhura Lal Meena',
    dob: '1970-01-14', gender: 'M', mobile: '9654321098',
    address: 'Village Kacheri, Post Kishangarh', city: 'Kishangarh',
    district: 'Ajmer', state: 'Rajasthan', pincode: '305801',
    booth: 'Booth 31 — Kishangarh Govt School', assembly: 'Kishangarh (05)',
    photo: null, status: 'active',
  }],
]);

/**
 * APPLICATIONS_DB — new registrations & corrections pending/processed
 * Key: referenceNo
 * Schema: { referenceNo, serviceType, formData, status, submittedAt, updatedAt, mobile, applicantName }
 */
const APPLICATIONS_DB = new Map();

/**
 * OTP_STORE — temporary OTPs (TTL: 10 minutes)
 * Key: mobile
 * Value: { otp, expiresAt, attempts }
 */
const OTP_STORE = new Map();

// ─────────────────────────────────────────────────────────────────
//  HELPERS
// ─────────────────────────────────────────────────────────────────

/** Generate 6-digit OTP */
const genOtp = () => String(Math.floor(100000 + Math.random() * 900000));

/** Generate reference number: VTR-YYYYMMDD-XXXXXX */
const genRefNo = (type = 'VTR') => {
  const d    = new Date();
  const date = `${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}`;
  const rand = Math.random().toString(36).toUpperCase().slice(2, 8);
  return `${type}-${date}-${rand}`;
};

/** Normalise EPIC number: remove spaces, uppercase */
const normaliseEpic = e => e ? e.toUpperCase().replace(/\s+/g, '') : '';

/** Search helper: returns voters matching query */
const searchVoters = ({ epic, name, dob }) => {
  const results = [];
  for (const v of VOTERS_DB.values()) {
    let match = false;
    if (epic && normaliseEpic(v.epicNo) === normaliseEpic(epic)) match = true;
    if (!match && name && name.trim().length >= 3) {
      if (v.name.toLowerCase().includes(name.trim().toLowerCase())) match = true;
    }
    if (match && dob && v.dob !== dob) match = false; // refine if DOB given
    if (match) results.push(v);
    if (results.length >= 10) break; // cap results
  }
  return results;
};

/** Clean voter object for public response */
const publicVoter = v => ({
  epicNo:       v.epicNo,
  name:         v.name,
  fatherName:   v.fatherName,
  dob:          v.dob,
  gender:       v.gender === 'M' ? 'Male / पुरुष' : v.gender === 'F' ? 'Female / महिला' : 'Other / अन्य',
  address:      `${v.address}, ${v.city}`,
  district:     v.district,
  state:        v.state,
  pincode:      v.pincode,
  booth:        v.booth,
  assembly:     v.assembly,
  status:       v.status,
});

/** Application status pipeline with Hindi+English labels */
const STATUS_LABELS = {
  submitted:   { hi: 'जमा हुआ',               en: 'Submitted',            color: '#1558A0' },
  blo_pending: { hi: 'BLO सत्यापन प्रतीक्षा', en: 'Awaiting BLO Visit',  color: '#B45309' },
  blo_done:    { hi: 'BLO सत्यापित',           en: 'BLO Verified',         color: '#0B7A45' },
  eci_review:  { hi: 'ECI समीक्षाधीन',         en: 'Under ECI Review',     color: '#7C3AED' },
  approved:    { hi: 'स्वीकृत',                en: 'Approved',             color: '#0B7A45' },
  rejected:    { hi: 'अस्वीकृत',              en: 'Rejected',             color: '#C0222A' },
  card_printed:{ hi: 'कार्ड मुद्रित',          en: 'Card Printed',         color: '#0B7A45' },
  dispatched:  { hi: 'डाक से भेजा गया',       en: 'Dispatched by Post',   color: '#0B7A45' },
  delivered:   { hi: 'वितरित',                 en: 'Delivered',            color: '#0B7A45' },
};

/** Format application for response */
const publicApp = a => {
  const sl = STATUS_LABELS[a.status] || STATUS_LABELS.submitted;
  return {
    referenceNo:   a.referenceNo,
    serviceType:   a.serviceType,
    serviceLabel:  a.serviceType === 'new'
                    ? 'New Registration / नया पंजीकरण'
                    : a.serviceType === 'correction'
                    ? 'Correction / सुधार'
                    : a.serviceType,
    applicantName: a.applicantName,
    mobile:        a.mobile ? `XXXXX${a.mobile.slice(-5)}` : '—',
    submittedAt:   a.submittedAt,
    updatedAt:     a.updatedAt,
    status:        a.status,
    statusHi:      sl.hi,
    statusEn:      sl.en,
    statusColor:   sl.color,
    eta:           a.eta || '30–45 कार्य दिवस / working days',
    note:          a.note || 'आपका आवेदन प्रक्रिया में है। / Your application is being processed.',
    timeline:      a.timeline || [],
  };
};

// ─────────────────────────────────────────────────────────────────
//  MIDDLEWARE
// ─────────────────────────────────────────────────────────────────
const validateMobile = (req, res, next) => {
  const mobile = req.body?.mobile || req.query?.mobile;
  if (!mobile || !/^\d{10}$/.test(mobile.replace(/\s/g, ''))) {
    return res.status(400).json({ success: false, message: 'Invalid mobile number / अमान्य मोबाइल नंबर' });
  }
  next();
};

// ─────────────────────────────────────────────────────────────────
//  ROUTES
// ─────────────────────────────────────────────────────────────────

/**
 * POST /api/voter/otp/send
 * Body: { mobile }
 * Sends (or simulates sending) OTP. In production: integrate SMS gateway.
 */
router.post('/otp/send', validateMobile, (req, res) => {
  const mobile  = req.body.mobile.replace(/\s/g, '');
  const otp     = genOtp();
  const expires = Date.now() + 10 * 60 * 1000; // 10 min TTL

  OTP_STORE.set(mobile, { otp, expiresAt: expires, attempts: 0 });

  // ── Production: replace with SMS gateway call ──────────────────
  // await smsGateway.send({ to: `+91${mobile}`, message: `Your SUVIDHA Voter OTP is ${otp}. Valid for 10 minutes. — ECI` });
  console.log(`[OTP] Mobile: ${mobile}  OTP: ${otp}`);  // remove in prod

  return res.json({
    success:  true,
    message:  'OTP sent successfully / OTP सफलतापूर्वक भेजा गया',
    // In production NEVER send otp in response. This is for kiosk demo only:
    _devOtp:  process.env.NODE_ENV !== 'production' ? otp : undefined,
    expiresIn: 600, // seconds
  });
});

/**
 * POST /api/voter/otp/verify
 * Body: { mobile, otp }
 */
router.post('/otp/verify', validateMobile, (req, res) => {
  const mobile = req.body.mobile.replace(/\s/g, '');
  const otp    = String(req.body.otp || '').trim();

  const record = OTP_STORE.get(mobile);
  if (!record) return res.status(400).json({ success: false, message: 'OTP not found or expired / OTP नहीं मिला या समय सीमा पार' });

  if (Date.now() > record.expiresAt) {
    OTP_STORE.delete(mobile);
    return res.status(400).json({ success: false, message: 'OTP expired / OTP की समय सीमा समाप्त हो गई' });
  }

  record.attempts += 1;
  if (record.attempts > 5) {
    OTP_STORE.delete(mobile);
    return res.status(429).json({ success: false, message: 'Too many attempts. Please request a new OTP / बहुत अधिक प्रयास। नया OTP मंगाएं' });
  }

  if (record.otp !== otp) {
    return res.status(400).json({ success: false, message: `Incorrect OTP / गलत OTP (attempt ${record.attempts}/5)` });
  }

  OTP_STORE.delete(mobile); // consume OTP
  const token = uuid(); // session token for this verified mobile
  return res.json({ success: true, message: 'OTP verified / OTP सत्यापित', token });
});

/**
 * GET /api/voter/search?epic=RJ/01/...&name=Ramesh&dob=1985-06-15
 */
router.get('/search', (req, res) => {
  const { epic, name, dob } = req.query;

  if (!epic && (!name || name.trim().length < 3)) {
    return res.status(400).json({
      success: false,
      message: 'Provide EPIC number or name (min 3 chars) / EPIC नंबर या नाम (कम से कम 3 अक्षर) दें',
    });
  }

  const results = searchVoters({ epic, name, dob });
  return res.json({
    success: true,
    total:   results.length,
    voters:  results.map(publicVoter),
    message: results.length === 0
      ? 'No voter found. Check details and try again. / कोई मतदाता नहीं मिला।'
      : `${results.length} voter(s) found / ${results.length} मतदाता मिले`,
  });
});

/**
 * GET /api/voter/epic/:epicNo
 */
router.get('/epic/:epicNo', (req, res) => {
  const key    = normaliseEpic(req.params.epicNo);
  const voter  = VOTERS_DB.get(key);
  if (!voter) {
    return res.status(404).json({ success: false, message: 'Voter not found / मतदाता नहीं मिला' });
  }
  return res.json({ success: true, voter: publicVoter(voter) });
});

/**
 * POST /api/voter/apply
 * Body: { formData: { firstName, lastName, dob, gender, mobile, email, flatNo,
 *                     street, landmark, city, district, state, pincode,
 *                     relationType, relationName },
 *         lang: 'hi'|'en' }
 * Validates, creates application, returns receipt.
 */
router.post('/apply', (req, res) => {
  const { formData, lang } = req.body;

  // Required field validation
  const required = ['firstName','lastName','dob','gender','mobile','flatNo','street','city','district','state','pincode','relationType','relationName'];
  const missing  = required.filter(k => !formData?.[k]?.trim());
  if (missing.length > 0) {
    return res.status(400).json({
      success: false,
      message: `Missing required fields: ${missing.join(', ')}`,
      fields:  missing,
    });
  }

  // Mobile validation
  if (!/^\d{10}$/.test(formData.mobile.replace(/\s/g,''))) {
    return res.status(400).json({ success: false, message: 'Invalid mobile number' });
  }

  // Age validation (must be 18+)
  const dob        = new Date(formData.dob);
  const age        = Math.floor((Date.now() - dob.getTime()) / (365.25 * 24 * 3600 * 1000));
  if (age < 18) {
    return res.status(400).json({
      success: false,
      message: 'Applicant must be 18 years or older / आवेदक की आयु 18 वर्ष या अधिक होनी चाहिए',
    });
  }

  const referenceNo = genRefNo('VTR');
  const now         = new Date().toISOString();

  const application = {
    referenceNo,
    serviceType:   'new',
    formData:      { ...formData, mobile: formData.mobile.replace(/\s/g,'') },
    applicantName: `${formData.firstName} ${formData.lastName}`.trim(),
    mobile:        formData.mobile.replace(/\s/g,''),
    status:        'submitted',
    submittedAt:   now,
    updatedAt:     now,
    lang:          lang || 'en',
    eta:           '30–45 working days / कार्य दिवस',
    note:          'Application received. BLO will visit for verification. / आवेदन प्राप्त हुआ। BLO सत्यापन के लिए आएंगे।',
    timeline: [
      { status: 'submitted', label: 'Application Submitted / आवेदन जमा', date: now },
    ],
  };

  APPLICATIONS_DB.set(referenceNo, application);
  console.log(`[VOTER] New application: ${referenceNo} — ${application.applicantName}`);

  return res.status(201).json({
    success:       true,
    message:       'Application submitted successfully / आवेदन सफलतापूर्वक जमा हो गया',
    referenceNo,
    applicantName: application.applicantName,
    mobile:        `XXXXX${formData.mobile.slice(-5)}`,
    serviceLabel:  'New Voter Registration / नया मतदाता पंजीकरण',
    submittedAt:   now,
    eta:           application.eta,
    nextStep:      'BLO will visit your address within 7 days / BLO 7 दिनों में आपके पते पर आएंगे',
  });
});

/**
 * POST /api/voter/correction
 * Body: { formData: { epic, correctionType, currentValue, correctedValue, mobile }, lang }
 */
router.post('/correction', (req, res) => {
  const { formData, lang } = req.body;

  const required = ['epic','correctionType','correctedValue','mobile'];
  const missing  = required.filter(k => !formData?.[k]?.trim());
  if (missing.length > 0) {
    return res.status(400).json({ success: false, message: `Missing fields: ${missing.join(', ')}`, fields: missing });
  }

  const epicKey = normaliseEpic(formData.epic);
  const voter   = VOTERS_DB.get(epicKey);
  if (!voter) {
    return res.status(404).json({ success: false, message: 'EPIC number not found in database / EPIC नंबर डेटाबेस में नहीं मिला' });
  }

  const referenceNo = genRefNo('COR');
  const now         = new Date().toISOString();

  const application = {
    referenceNo,
    serviceType:   'correction',
    formData:      { ...formData, mobile: formData.mobile.replace(/\s/g,'') },
    applicantName: voter.name,
    mobile:        formData.mobile.replace(/\s/g,''),
    epicNo:        epicKey,
    status:        'submitted',
    submittedAt:   now,
    updatedAt:     now,
    lang:          lang || 'en',
    eta:           '15–21 working days / कार्य दिवस',
    note:          `Correction request for: ${formData.correctionType} / ${formData.correctionType} सुधार अनुरोध`,
    timeline: [
      { status: 'submitted', label: 'Correction Request Submitted / सुधार अनुरोध जमा', date: now },
    ],
  };

  APPLICATIONS_DB.set(referenceNo, application);
  console.log(`[VOTER] Correction: ${referenceNo} — EPIC: ${epicKey} — Type: ${formData.correctionType}`);

  return res.status(201).json({
    success:       true,
    message:       'Correction request submitted / सुधार अनुरोध सफलतापूर्वक जमा हो गया',
    referenceNo,
    applicantName: voter.name,
    epicNo:        epicKey,
    serviceLabel:  'Voter Details Correction / मतदाता विवरण सुधार',
    submittedAt:   now,
    eta:           application.eta,
  });
});

/**
 * GET /api/voter/status/:refNo
 */
router.get('/status/:refNo', (req, res) => {
  const refNo = req.params.refNo.trim().toUpperCase();
  const app   = APPLICATIONS_DB.get(refNo);

  if (!app) {
    // Also check if it looks like an EPIC and search by that
    return res.status(404).json({
      success: false,
      message: 'Application not found. Please check reference number. / आवेदन नहीं मिला। Reference नंबर जांचें।',
    });
  }

  return res.json({ success: true, application: publicApp(app) });
});

/**
 * GET /api/voter/download/:epicNo?dob=YYYY-MM-DD
 * Verifies identity before allowing e-EPIC download
 */
router.get('/download/:epicNo', (req, res) => {
  const epicKey = normaliseEpic(req.params.epicNo);
  const { dob } = req.query;

  if (!dob) return res.status(400).json({ success: false, message: 'Date of birth required / जन्म तिथि आवश्यक है' });

  const voter = VOTERS_DB.get(epicKey);
  if (!voter) return res.status(404).json({ success: false, message: 'Voter not found / मतदाता नहीं मिला' });
  if (voter.dob !== dob) return res.status(401).json({ success: false, message: 'Date of birth does not match / जन्म तिथि मेल नहीं खाती' });

  // In production: generate actual PDF or return presigned S3 URL
  const downloadToken = uuid();
  const downloadUrl   = `/api/voter/epdf/${downloadToken}`;

  console.log(`[VOTER] e-EPIC download: ${epicKey} — Token: ${downloadToken}`);

  return res.json({
    success:     true,
    message:     'Identity verified. e-EPIC ready. / पहचान सत्यापित। ई-EPIC तैयार है।',
    voter:       publicVoter(voter),
    downloadUrl,      // In prod: real signed PDF URL
    expiresIn:   300, // 5 min
    filename:    `eEPIC_${epicKey.replace(/\//g,'_')}.pdf`,
  });
});

/**
 * GET /api/voter/analytics
 * Admin endpoint — submission summary
 */
router.get('/analytics', (req, res) => {
  const apps      = [...APPLICATIONS_DB.values()];
  const byType    = apps.reduce((acc, a) => { acc[a.serviceType] = (acc[a.serviceType]||0)+1; return acc; }, {});
  const byStatus  = apps.reduce((acc, a) => { acc[a.status] = (acc[a.status]||0)+1; return acc; }, {});

  return res.json({
    success:         true,
    totalVoters:     VOTERS_DB.size,
    totalApps:       apps.length,
    byType,
    byStatus,
    recentApps:      apps.slice(-5).reverse().map(a => ({
      ref: a.referenceNo, name: a.applicantName, type: a.serviceType, status: a.status, at: a.submittedAt,
    })),
  });
});

// ─────────────────────────────────────────────────────────────────
//  ADMIN: status update (for BLO / ECI officer panel)
//  PATCH /api/voter/admin/status
//  Body: { refNo, status, note }
// ─────────────────────────────────────────────────────────────────
router.patch('/admin/status', (req, res) => {
  const { refNo, status, note } = req.body;
  const app = APPLICATIONS_DB.get((refNo||'').toUpperCase());
  if (!app) return res.status(404).json({ success: false, message: 'Application not found' });
  if (!STATUS_LABELS[status]) return res.status(400).json({ success: false, message: 'Invalid status value' });

  app.status    = status;
  app.updatedAt = new Date().toISOString();
  if (note) app.note = note;
  app.timeline.push({ status, label: `${STATUS_LABELS[status].en} / ${STATUS_LABELS[status].hi}`, date: app.updatedAt });

  return res.json({ success: true, message: 'Status updated', application: publicApp(app) });
});

module.exports = router;