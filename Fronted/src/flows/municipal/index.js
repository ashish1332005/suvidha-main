/**
 * flows/municipal/index.js
 * Clean exports for all municipal flows.
 * Import from here in App.js:
 *   import { MuniBillPay, MuniCertificate, MuniComplaint, ... } from "./flows/municipal";
 */

// ── Bill Payment (Property Tax + Water Bill) ──────────────────────────────────
// Uses same BillPay.jsx with dept="municipal"
export { MuniBillPay, MunicipalBillPay, WaterBillPay } from "./BillPay";

// ── Dedicated Property Tax Flow (with installment / arrears UI) ───────────────
export { PropertyTax } from "./PropertyTax";

// ── Certificates (Birth, Death, Marriage, Trade License, Building Plan, Park) ─
export { MuniCertificate } from "./Certificate";

// ── Complaints ────────────────────────────────────────────────────────────────
export { Complaint as MuniComplaintFlow, MunicipalComplaint } from "./Complaint";

// ── New Water Connection ──────────────────────────────────────────────────────
export { WaterConnection } from "./WaterConnection";

// ── Track Application / Complaint Status ─────────────────────────────────────
export { TrackApplication } from "./TrackApplication";

// ── Generic Service (Sanitation, Street Light, NOC, Waterlogging, etc.) ───────
export { MuniGeneric } from "./MuniGeneric";