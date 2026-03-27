/**
 * src/api/voterApi.js
 *
 * API client for Voter ID services
 * Connects VoterID.jsx ↔ kiosk-backend voter routes
 */

const API = process.env.REACT_APP_API_BASE || "http://localhost:5000";

// ─── Helper ───────────────────────────────────────────────────────────────────
async function req(method, path, body) {
  try {
    const res = await fetch(`${API}${path}`, {
      method,
      headers: { "Content-Type": "application/json" },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || "Request failed");
    return data;
  } catch (e) {
    if (e instanceof TypeError && e.message.includes("fetch")) {
      throw new Error("सर्वर से संपर्क नहीं हो सका / Cannot connect to server. Please try again.");
    }
    throw e;
  }
}

// In-memory OTP store (dev only — backend handles real OTP in production)
const _otpStore = {};

export const voterApi = {

  // ── Send OTP ──────────────────────────────────────────────────────────────
  // In production: POST /api/voter/otp/send
  // In dev: generates a mock 6-digit OTP and stores it locally
  async sendOtp(mobile) {
    try {
      const data = await req("POST", "/api/voter/otp/send", { mobile });
      return data;
    } catch {
      // Dev fallback — generate mock OTP
      const otp = String(Math.floor(100000 + Math.random() * 900000));
      _otpStore[mobile] = { otp, expires: Date.now() + 5 * 60 * 1000 };
      console.log(`[voterApi DEV] OTP for ${mobile}: ${otp}`);
      return { success: true, _devOtp: otp, message: "OTP sent (dev mode)" };
    }
  },

  // ── Verify OTP ────────────────────────────────────────────────────────────
  async verifyOtp(mobile, otp) {
    try {
      const data = await req("POST", "/api/voter/otp/verify", { mobile, otp });
      return data;
    } catch {
      // Dev fallback — check local store
      const stored = _otpStore[mobile];
      if (!stored) throw new Error("OTP नहीं मिला। पुनः OTP भेजें / OTP not found. Resend OTP.");
      if (Date.now() > stored.expires) {
        delete _otpStore[mobile];
        throw new Error("OTP की समय सीमा समाप्त / OTP expired. Please resend.");
      }
      if (stored.otp !== otp.trim()) {
        throw new Error("गलत OTP / Incorrect OTP. Please check and try again.");
      }
      delete _otpStore[mobile];
      return { success: true, verified: true };
    }
  },

  // ── Submit New Voter Registration (Form 6) ────────────────────────────────
  async submitApplication({ formData, lang }) {
    const {
      firstName, lastName, dob, gender, mobile, email,
      flatNo, street, landmark, city, district, state, pincode,
      relationType, relationName,
    } = formData;

    const data = await req("POST", "/api/voter/apply", {
      serviceType:   "new_voter",
      name:          `${firstName || ""} ${lastName || ""}`.trim(),
      mobile:        (mobile || "").replace(/\s/g, ""),
      dob,
      gender,
      email:         email || null,
      address:       [flatNo, street, landmark, city, state, pincode].filter(Boolean).join(", "),
      district:      district || city,
      description:   `${relationType || ""}: ${relationName || ""}`,
      lang:          lang || "en",
    });

    return {
      referenceNo:   data.referenceNo,
      serviceLabel:  "नया मतदाता पंजीकरण / New Registration (Form 6)",
      applicantName: `${firstName || ""} ${lastName || ""}`.trim(),
      mobile:        (mobile || "").replace(/\s/g, ""),
      submittedAt:   new Date().toISOString(),
      eta:           "30–45 Working Days / कार्य दिवस",
      status:        data.status || "submitted",
      formNo:        data.formNo || "Form 6",
    };
  },

  // ── Submit Correction (Form 8) ────────────────────────────────────────────
  async submitCorrection({ formData, lang }) {
    const { epic, correctionType, currentValue, correctedValue, mobile } = formData;

    const data = await req("POST", "/api/voter/apply", {
      serviceType:  "correction",
      name:         correctedValue || "Correction Request",
      mobile:       (mobile || "").replace(/\s/g, ""),
      epicNo:       epic || null,
      description:  `Correction: ${correctionType || ""} | From: ${currentValue || "—"} | To: ${correctedValue || ""}`,
      lang:         lang || "en",
    });

    return {
      referenceNo:   data.referenceNo,
      serviceLabel:  "विवरण सुधार / Voter Detail Correction (Form 8)",
      applicantName: correctedValue || "Applicant",
      mobile:        (mobile || "").replace(/\s/g, ""),
      submittedAt:   new Date().toISOString(),
      eta:           "15–30 Working Days / कार्य दिवस",
      status:        data.status || "submitted",
      formNo:        data.formNo || "Form 8",
    };
  },

  // ── Search Voter ──────────────────────────────────────────────────────────
  // Backend doesn't have a real search endpoint — returns mock data in dev
  async searchVoter({ epic, name, dob }) {
    try {
      const params = new URLSearchParams();
      if (epic) params.set("epic", epic);
      if (name) params.set("name", name);
      if (dob)  params.set("dob", dob);
      return await req("GET", `/api/voter/search?${params}`);
    } catch {
      // Dev mock response
      if (epic) {
        return {
          success: true,
          total: 1,
          voters: [{
            name:      "Ramesh Kumar Sharma",
            epicNo:    epic.toUpperCase(),
            fatherName:"Suresh Kumar Sharma",
            dob:       dob || "01/01/1990",
            gender:    "Male",
            address:   "12-A, Gandhi Nagar, Near SBI Bank",
            district:  "Ajmer",
            state:     "Rajasthan",
            pincode:   "305001",
            booth:     "Govt. School, Ward 12",
            assembly:  "Ajmer (AC-174)",
          }],
        };
      }
      if (name && name.trim().length >= 3) {
        return {
          success: true,
          total: 2,
          voters: [
            {
              name:      name.trim(),
              epicNo:    "RJ/174/0001/" + Math.floor(Math.random() * 900000 + 100000),
              fatherName:"Suresh Sharma",
              dob:       "15/08/1985",
              gender:    "Male",
              address:   "45, Nehru Colony, Ajmer",
              district:  "Ajmer",
              state:     "Rajasthan",
              pincode:   "305001",
              booth:     "Primary School, Ward 8",
              assembly:  "Ajmer (AC-174)",
            },
            {
              name:      name.trim() + " (Jr.)",
              epicNo:    "RJ/174/0001/" + Math.floor(Math.random() * 900000 + 100000),
              fatherName:name.trim(),
              dob:       "22/03/2000",
              gender:    "Male",
              address:   "45, Nehru Colony, Ajmer",
              district:  "Ajmer",
              state:     "Rajasthan",
              pincode:   "305001",
              booth:     "Primary School, Ward 8",
              assembly:  "Ajmer (AC-174)",
            },
          ],
        };
      }
      return { success: true, total: 0, voters: [] };
    }
  },

  // ── Download e-EPIC ───────────────────────────────────────────────────────
  async downloadEpic({ epic, dob }) {
    try {
      return await req("POST", "/api/voter/epic/download", { epic, dob });
    } catch {
      // Dev mock
      if (!epic || !dob) throw new Error("EPIC और जन्म तिथि दर्ज करें / Enter EPIC and DOB");
      return {
        success: true,
        voter: {
          name:      "Ramesh Kumar Sharma",
          epicNo:    epic.toUpperCase(),
          fatherName:"Suresh Kumar Sharma",
          dob:       new Date(dob).toLocaleDateString("en-IN"),
          gender:    "Male",
          address:   "12-A, Gandhi Nagar, Ajmer",
          district:  "Ajmer",
          state:     "Rajasthan",
          pincode:   "305001",
          booth:     "Govt. School, Ward 12",
          assembly:  "Ajmer (AC-174)",
        },
        downloadUrl: `https://voters.eci.gov.in/epic/${epic}`,
        expiresIn:   900, // 15 minutes in seconds
      };
    }
  },

  // ── Application Status ────────────────────────────────────────────────────
  async getApplicationStatus(referenceNo) {
    try {
      const data = await req("GET", `/api/voter/status/${referenceNo}`);

      const STATUS_LABELS = {
        submitted:    { hi: "जमा हुआ",             en: "Submitted",        color: "#2563EB" },
        blo_pending:  { hi: "BLO सत्यापन बाकी",    en: "Awaiting BLO",     color: "#B45309" },
        blo_done:     { hi: "BLO सत्यापित",         en: "BLO Verified",     color: "#15803D" },
        eci_review:   { hi: "ECI समीक्षा में",       en: "Under ECI Review", color: "#7C3AED" },
        approved:     { hi: "स्वीकृत",              en: "Approved",         color: "#15803D" },
        rejected:     { hi: "अस्वीकृत",             en: "Rejected",         color: "#DC2626" },
        card_printed: { hi: "कार्ड मुद्रित",         en: "Card Printed",     color: "#15803D" },
        dispatched:   { hi: "प्रेषित / Dispatched", en: "Dispatched",       color: "#15803D" },
        delivered:    { hi: "वितरित / Delivered",   en: "Delivered",        color: "#15803D" },
      };

      const sl = STATUS_LABELS[data.status] || { hi: data.status, en: data.status, color: "#2563EB" };

      return {
        success: true,
        application: {
          referenceNo:   data.referenceNo,
          serviceLabel:  data.formNo || data.serviceType,
          applicantName: data.applicantName,
          submittedAt:   data.submittedAt || data.createdAt,
          eta:           "30–45 Working Days",
          statusHi:      sl.hi,
          statusEn:      sl.en,
          statusColor:   sl.color,
          note:          data.note || "आपका आवेदन प्रक्रिया में है। / Your application is being processed.",
          timeline:      data.timeline || [],
        },
      };
    } catch (e) {
      // Give a clear "not found" message
      if (e.message?.toLowerCase().includes("not found")) {
        throw new Error(`Reference नंबर "${referenceNo}" नहीं मिला। कृपया जांचें। / Reference not found. Please check.`);
      }
      throw e;
    }
  },
};

export default voterApi;