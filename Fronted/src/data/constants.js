// ─────────────────────────────────────────────────────────────────
//  SUVIDHA · constants.js
//  Colors aligned with design tokens in styles.js
//  No emojis — SVG icon components used throughout
// ─────────────────────────────────────────────────────────────────

// ── MOCK BILLS ───────────────────────────────────────────────────
export const MOCK_BILLS = {
  "1001": { name: "Ramesh Kumar",    address: "12, Gandhi Nagar, Bhilwara",   amount: 847,  units: 210, dueDate: "05 Mar 2026", dept: "AVVNL" },
  "1002": { name: "Sunita Sharma",   address: "45, Azad Colony, Ajmer",       amount: 1240, units: 310, dueDate: "05 Mar 2026", dept: "AVVNL" },
  "2001": { name: "Mohan Lal Verma", address: "78, Shastri Nagar, Bhilwara",  amount: 620,  units: 0,   dueDate: "10 Mar 2026", dept: "IGL"   },
};

// ── TICKER ALERTS ────────────────────────────────────────────────
export const ALERTS = [
  "Planned maintenance: Zone B power outage 2–4 PM today",
  "Water supply disruption: Ward 12 — tomorrow 8 AM to 12 PM",
  "Last date for property tax: 31 March 2026",
  "PM Ujjwala 2.0 — Apply at Gas department or online portal",
  "Aadhaar update camp: Municipal office this week",
];

// ── DEPARTMENT CONFIG ────────────────────────────────────────────
// Colors aligned with CSS design tokens.
// icon: SVG path string (24×24 viewBox) — rendered by <Icon /> component.
export const DC = {
  electricity: {
    color:    "#0EA5E9",   // --blue
    colorDk:  "#0284C7",   // --blue-dk
    light:    "#E0F2FE",   // --blue-lt
    border:   "#BAE6FD",
    topBar:   "#0EA5E9",
    // Lightning bolt
    icon: "M13 2L4.5 13.5H11L10 22L19.5 10.5H13L13 2Z",
  },
  gas: {
    color:    "#F97316",   // --orange
    colorDk:  "#EA6C08",   // --orange-dk
    light:    "#FFF3E8",   // --orange-lt
    border:   "#FED7AA",
    topBar:   "#F97316",
    // Flame
    icon: "M12 2C12 2 9 7 9 11C9 11 7 9.5 7 7.5C5 10 4 13 4 15C4 19.42 7.58 23 12 23C16.42 23 20 19.42 20 15C20 10 12 2 12 2ZM12 21C8.69 21 6 18.31 6 15C6 13.5 6.5 12 7.5 10.5C7.5 12 9 13 9 13C9 10 11 7.5 12 5C13 7.5 15 10 15 13C15 13 16.5 12 16.5 10.5C17.5 12 18 13.5 18 15C18 18.31 15.31 21 12 21Z",
  },
  municipal: {
    color:    "#16A34A",   // --green
    colorDk:  "#15803D",
    light:    "#DCFCE7",   // --green-lt
    border:   "#BBF7D0",
    topBar:   "#16A34A",
    // Building / columns
    icon: "M2 20V8L12 2L22 8V20H16V14H8V20H2ZM4 18H6V12H18V18H20V9L12 4.5L4 9V18ZM8 20V16H16V20H8Z",
  },
  info: {
    color:    "#7C3AED",   // --purple
    colorDk:  "#6D28D9",
    light:    "#EDE9FE",   // --purple-lt
    border:   "#DDD6FE",
    topBar:   "#7C3AED",
    // Info circle
    icon: "M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 17H11V11H13V17ZM13 9H11V7H13V9Z",
  },
};

// ── COMPLAINT TYPES ──────────────────────────────────────────────
export const COMPLAINT_TYPES = {
  electricity: [
    "No Power Supply",
    "Voltage Fluctuation",
    "Meter Fault",
    "Street Light Issue",
    "Electrical Hazard",
    "Bill Dispute",
  ],
  gas: [
    "Gas Leak",
    "No Supply",
    "Meter Issue",
    "Bill Dispute",
    "Connection Issue",
    "Safety Concern",
  ],
  municipal: [
    "Garbage Not Collected",
    "Water Contamination",
    "Road Damage",
    "Sewage Overflow",
    "Stray Animals",
    "Illegal Construction",
  ],
  info: [
    "Wrong Information",
    "Service Unavailable",
    "App Issue",
    "Other",
  ],
};

// ── SCHEME DATA ──────────────────────────────────────────────────
export const SCHEME_DATA = {
  "PM Awas Yojana": {
    desc:    "Financial assistance for construction or purchase of houses for EWS and LIG sections under Pradhan Mantri Awas Yojana.",
    benefit: "₹1.2 – 2.5 Lakh",
    elig:    "Annual household income below ₹18 lakh; no pucca house in family",
    docs:    "Aadhaar Card, Income Certificate, Land / Property Documents",
    // House icon path
    icon:    "M10 20V14H14V20H19V12H22L12 3L2 12H5V20H10Z",
    color:   "#0EA5E9",
  },
  "PM Kisan Samman": {
    desc:    "Direct income support of ₹6,000 per year to small and marginal farmers, disbursed in three equal installments.",
    benefit: "₹6,000 / year",
    elig:    "Any farmer with cultivable land in their name",
    docs:    "Aadhaar Card, Land Records (Khasra/Khatauni), Bank Passbook",
    // Leaf / crop icon path
    icon:    "M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22L6.66 19.7C7.14 19.87 7.64 20 8 20C19 20 22 3 22 3C21 5 14 5.25 9 6.25C4 7.25 2 11.5 2 13.5C2 15.5 3.75 17.25 3.75 17.25C7 8 17 8 17 8Z",
    color:   "#16A34A",
  },
  "Ayushman Bharat": {
    desc:    "Comprehensive health insurance for hospitalization expenses up to ₹5 lakh per family per year under PM Jan Arogya Yojana.",
    benefit: "₹5 Lakh health cover",
    elig:    "As per SECC 2011 database; covers secondary and tertiary care",
    docs:    "Aadhaar Card, Ration Card",
    // Heart / health icon path
    icon:    "M12 21.35L10.55 20.03C5.4 15.36 2 12.27 2 8.5C2 5.41 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.08C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.41 22 8.5C22 12.27 18.6 15.36 13.45 20.03L12 21.35Z",
    color:   "#DC2626",
  },
  "PM Ujjwala Yojana": {
    desc:    "Free LPG gas connections to women from Below Poverty Line households to promote clean cooking fuel.",
    benefit: "Free LPG connection + first cylinder free",
    elig:    "BPL household; woman applicant aged 18 or above",
    docs:    "BPL Ration Card, Aadhaar Card, Bank Account details",
    // Flame icon path
    icon:    "M12 2C12 2 9 7 9 11C9 11 7 9.5 7 7.5C5 10 4 13 4 15C4 19.42 7.58 23 12 23C16.42 23 20 19.42 20 15C20 10 12 2 12 2Z",
    color:   "#F97316",
  },
  "Scholarships": {
    desc:    "Central and State scholarship programs for SC/ST/OBC categories and academically meritorious students.",
    benefit: "₹1,000 – ₹15,000 / year",
    elig:    "Students meeting category or merit criteria as per scheme guidelines",
    docs:    "Latest Marksheet, Income Certificate, Caste Certificate (if applicable)",
    // Graduation cap icon path
    icon:    "M12 3L1 9L12 15L21 10.09V17H23V9L12 3ZM5 13.18V17.18L12 21L19 17.18V13.18L12 17L5 13.18Z",
    color:   "#7C3AED",
  },
};

// ── CERTIFICATE CONFIGS ──────────────────────────────────────────
export const CERTIFICATE_CONFIGS = {
  birth: {
    title:   "Birth Certificate",
    // Baby / person icon
    iconPath: "M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z",
    iconColor: "#0EA5E9",
    desc:    "Apply for an official birth certificate issued by the Municipal Corporation.",
    fields: [
      { k: "childName",  l: "Child's Full Name",    p: "As on certificate",        t: "text" },
      { k: "dob",        l: "Date of Birth",        p: "DD/MM/YYYY",               t: "date" },
      { k: "fatherName", l: "Father's Name",        p: "Full name",                t: "text" },
      { k: "motherName", l: "Mother's Name",        p: "Full name",                t: "text" },
      { k: "birthPlace", l: "Place of Birth",       p: "Hospital / Home address",  t: "text" },
      { k: "mobile",     l: "Contact Mobile",       p: "10-digit number",          t: "tel"  },
      { k: "aadhaar",    l: "Parent Aadhaar No.",   p: "12-digit Aadhaar number",  t: "text" },
    ],
    docs:    ["Hospital Birth Record / Discharge Summary", "Both Parents' Aadhaar Card", "Parents' Marriage Certificate"],
    fee:     "₹50",
    time:    "7–10 working days",
  },
  death: {
    title:   "Death Certificate",
    iconPath: "M14 6L13 4H5V21H7V14H12L13 16H20V6H14ZM18 14H14L13 12H7V6H12L13 8H18V14Z",
    iconColor: "#64748B",
    desc:    "Apply for an official death certificate from the Municipal Corporation.",
    fields: [
      { k: "name",       l: "Deceased Name",        p: "Full name",                t: "text" },
      { k: "dod",        l: "Date of Death",        p: "DD/MM/YYYY",               t: "date" },
      { k: "age",        l: "Age at Death",         p: "In years",                 t: "text" },
      { k: "place",      l: "Place of Death",       p: "Hospital / Address",       t: "text" },
      { k: "applicant",  l: "Applicant Name",       p: "Your full name",           t: "text" },
      { k: "relation",   l: "Relation to Deceased", p: "Son / Daughter / Spouse",  t: "text" },
      { k: "mobile",     l: "Mobile",               p: "10-digit number",          t: "tel"  },
    ],
    docs:    ["Hospital Death Record", "Applicant's Aadhaar Card", "Proof of Relationship with Deceased"],
    fee:     "₹50",
    time:    "7–10 working days",
  },
  trade: {
    title:   "Trade License",
    iconPath: "M20 4H4C2.9 4 2 4.9 2 6V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4ZM20 18H4V8H20V18ZM6 10H8V12H6V10ZM6 14H8V16H6V14ZM10 10H18V12H10V10ZM10 14H16V16H10V14Z",
    iconColor: "#16A34A",
    desc:    "Apply for a new trade or business license from the Municipal Corporation.",
    fields: [
      { k: "bizName",  l: "Business Name",         p: "Enter business name",       t: "text" },
      { k: "owner",    l: "Owner's Full Name",      p: "Full name",                 t: "text" },
      { k: "bizType",  l: "Type of Business",       p: "Retail / Restaurant / Services", t: "text" },
      { k: "address",  l: "Business Address",       p: "Full address with ward no.", t: "text" },
      { k: "mobile",   l: "Mobile",                 p: "10-digit number",           t: "tel"  },
      { k: "aadhaar",  l: "Owner Aadhaar No.",      p: "12-digit Aadhaar number",   t: "text" },
    ],
    docs:    ["Owner's Aadhaar Card", "Property / Rental Agreement", "Passport Size Photo"],
    fee:     "₹200 – ₹1,000",
    time:    "15–20 working days",
  },
  building: {
    title:   "Building Plan Approval",
    iconPath: "M3 13H5V11H3V13ZM3 17H5V15H3V17ZM3 9H5V7H3V9ZM7 13H21V11H7V13ZM7 17H21V15H7V17ZM7 7V9H21V7H7Z",
    iconColor: "#7C3AED",
    desc:    "Submit your building plan to the Municipal Corporation for official approval.",
    fields: [
      { k: "owner",   l: "Owner's Full Name",      p: "Full name",               t: "text" },
      { k: "plot",    l: "Plot / Survey Number",   p: "Enter number",            t: "text" },
      { k: "area",    l: "Built-up Area (sq ft)",  p: "Enter area",              t: "text" },
      { k: "address", l: "Property Address",        p: "Full address",            t: "text" },
      { k: "mobile",  l: "Mobile",                  p: "10-digit number",         t: "tel"  },
      { k: "arch",    l: "Architect & License No.", p: "Name + License number",   t: "text" },
    ],
    docs:    ["Property Documents", "Architect's Approved Plan", "NOC from Relevant Departments", "Aadhaar Card"],
    fee:     "₹500 – ₹5,000",
    time:    "21–30 working days",
  },
  park: {
    title:   "Park / Ground Booking",
    iconPath: "M17 12H7V14H17V12ZM19 3H18V1H16V3H8V1H6V3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM19 19H5V8H19V19Z",
    iconColor: "#16A34A",
    desc:    "Book a municipal park or ground for a wedding, cultural event, or sports activity.",
    fields: [
      { k: "name",     l: "Applicant Name",     p: "Full name",                   t: "text" },
      { k: "mobile",   l: "Mobile",             p: "10-digit number",             t: "tel"  },
      { k: "purpose",  l: "Purpose of Booking", p: "Wedding / Cultural / Sports", t: "text" },
      { k: "date",     l: "Event Date",         p: "DD/MM/YYYY",                  t: "date" },
      { k: "duration", l: "Duration (hours)",   p: "e.g. 4",                      t: "text" },
      { k: "people",   l: "Expected Attendees", p: "Approximate number",          t: "text" },
    ],
    docs:    ["Applicant's Aadhaar Card", "Application Fee Receipt"],
    fee:     "₹500 – ₹2,000",
    time:    "3–5 working days",
  },
};

// ── HELPLINES ────────────────────────────────────────────────────
// Colors updated to match design tokens.
// iconPath: SVG path for 24×24 icon beside each helpline entry.
export const HELPLINES = [
  {
    d: "National Emergency",
    n: "112",
    c: "#DC2626",   // red
    bg: "#FEE2E2",
    // Shield icon
    icon: "M12 1L3 5V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V5L12 1Z",
  },
  {
    d: "Electricity Fault",
    n: "1912",
    c: "#0EA5E9",   // blue
    bg: "#E0F2FE",
    // Lightning bolt
    icon: "M13 2L4.5 13.5H11L10 22L19.5 10.5H13L13 2Z",
  },
  {
    d: "Gas Emergency",
    n: "1906",
    c: "#F97316",   // orange
    bg: "#FFF3E8",
    // Flame
    icon: "M12 2C12 2 9 7 9 11C9 11 7 9.5 7 7.5C5 10 4 13 4 15C4 19.42 7.58 23 12 23C16.42 23 20 19.42 20 15C20 10 12 2 12 2Z",
  },
  {
    d: "Police",
    n: "100",
    c: "#1D4ED8",
    bg: "#EFF6FF",
    // Badge / star
    icon: "M12 1L15.09 7.26L22 8.27L17 13.14L18.18 20.02L12 16.77L5.82 20.02L7 13.14L2 8.27L8.91 7.26L12 1Z",
  },
  {
    d: "Fire Brigade",
    n: "101",
    c: "#DC2626",
    bg: "#FEE2E2",
    // Fire extinguisher (simplified triangle / alert)
    icon: "M12 2L1 21H23L12 2ZM12 6L19.53 19H4.47L12 6ZM11 10V14H13V10H11ZM11 16V18H13V16H11Z",
  },
  {
    d: "Ambulance",
    n: "108",
    c: "#16A34A",
    bg: "#DCFCE7",
    // Cross / medical
    icon: "M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM17 13H13V17H11V13H7V11H11V7H13V11H17V13Z",
  },
  {
    d: "Women Helpline",
    n: "1091",
    c: "#DB2777",
    bg: "#FCE7F3",
    // Person / female
    icon: "M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z",
  },
  {
    d: "Child Helpline",
    n: "1098",
    c: "#D97706",
    bg: "#FEF3C7",
    // Star / protection
    icon: "M12 17.27L18.18 21L16.54 13.97L22 9.24L14.81 8.62L12 2L9.19 8.62L2 9.24L7.45 13.97L5.82 21L12 17.27Z",
  },
  {
    d: "Municipal Helpdesk",
    n: "1800-180-6127",
    c: "#16A34A",
    bg: "#DCFCE7",
    // Building
    icon: "M2 20V8L12 2L22 8V20H16V14H8V20H2Z",
  },
  {
    d: "SUVIDHA Support",
    n: "1800-XXX-XXXX",
    c: "#7C3AED",
    bg: "#EDE9FE",
    // Headphones
    icon: "M12 1C7.03 1 3 5.03 3 10V17C3 18.1 3.9 19 5 19H6C7.1 19 8 18.1 8 17V13C8 11.9 7.1 11 6 11H5V10C5 6.13 8.13 3 12 3C15.87 3 19 6.13 19 10V11H18C16.9 11 16 11.9 16 13V17C16 18.1 16.9 19 18 19H19C20.1 19 21 18.1 21 17V10C21 5.03 16.97 1 12 1Z",
  },
];

// ── SVG ICON RENDERER ────────────────────────────────────────────
// Usage: <Icon path={DC.electricity.icon} size={24} color="#0EA5E9" />
// This is a tiny helper — import it wherever icons are needed.
export function Icon({ path, size = 24, color = "currentColor", style = {} }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={color}
      xmlns="http://www.w3.org/2000/svg"
      style={{ flexShrink: 0, ...style }}
      aria-hidden="true"
    >
      <path d={path} />
    </svg>
  );
}

// ── COMMON ICON PATHS ────────────────────────────────────────────
// Shared across multiple components — import as needed.
export const ICONS = {
  // Navigation
  arrowLeft:   "M20 11H7.83L13.42 5.41L12 4L4 12L12 20L13.41 18.59L7.83 13H20V11Z",
  arrowRight:  "M10 6L8.59 7.41L13.17 12L8.59 16.59L10 18L16 12L10 6Z",
  chevronRight:"M9.29 6.71A.996.996 0 000 7.41L13.17 12L8.59 16.59A.996.996 0 1010 18L16 12L10 6A.996.996 0 009.29 6.71Z",
  home:        "M10 20V14H14V20H19V12H22L12 3L2 12H5V20H10Z",
  close:       "M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z",
  trash:       "M6 19C6 20.1 6.9 21 8 21H16C17.1 21 18 20.1 18 19V7H6V19ZM19 4H15.5L14.5 3H9.5L8.5 4H5V6H19V4Z",
  check:       "M9 16.17L4.83 12L3.41 13.41L9 19L21 7L19.59 5.59L9 16.17Z",
  // Communication
  mic:         "M12 14C13.66 14 15 12.66 15 11V5C15 3.34 13.66 2 12 2C10.34 2 9 3.34 9 5V11C9 12.66 10.34 14 12 14ZM17.3 11C17.3 14 14.76 16.1 12 16.1C9.24 16.1 6.7 14 6.7 11H5C5 14.41 7.72 17.23 11 17.72V21H13V17.72C16.28 17.23 19 14.41 19 11H17.3Z",
  send:        "M2.01 21L23 12L2.01 3L2 10L17 12L2 14L2.01 21Z",
  speaker:     "M3 9V15H7L12 20V4L7 9H3ZM16.5 12C16.5 10.23 15.48 8.71 14 7.97V16.02C15.48 15.29 16.5 13.77 16.5 12ZM14 3.23V5.29C16.89 6.15 19 8.83 19 12C19 15.17 16.89 17.85 14 18.71V20.77C18.01 19.86 21 16.28 21 12C21 7.72 18.01 4.14 14 3.23Z",
  // Status
  checkCircle: "M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z",
  alert:       "M12 2L1 21H23L12 2ZM12 6L19.53 19H4.47L12 6ZM11 10V14H13V10H11ZM11 16V18H13V16H11Z",
  info:        "M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 17H11V11H13V17ZM13 9H11V7H13V9Z",
  // UI
  print:       "M8 5V2H16V5H8ZM18 5H6C4.34 5 3 6.34 3 8V14H6V19H18V14H21V8C21 6.34 19.66 5 18 5ZM16 17H8V12H16V17ZM18 10C17.45 10 17 9.55 17 9C17 8.45 17.45 8 18 8C18.55 8 19 8.45 19 9C19 9.55 18.55 10 18 10Z",
  translate:   "M12.87 15.07L10.33 12.56L10.36 12.53C12.1 10.59 13.34 8.36 14.07 6H17V4H10V2H8V4H1V6H12.17C11.5 7.92 10.44 9.75 9 11.35C8.07 10.32 7.3 9.19 6.69 8H4.69C5.42 9.63 6.42 11.17 7.67 12.56L2.58 17.58L4 19L9 14L12.11 17.11L12.87 15.07ZM18.5 10H16.5L12 22H14L15.12 19H19.87L21 22H23L18.5 10ZM15.88 17L17.5 12.67L19.12 17H15.88Z",
  clock:       "M11.99 2C6.47 2 2 6.48 2 12C2 17.52 6.47 22 11.99 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 11.99 2ZM12 20C7.58 20 4 16.42 4 12C4 7.58 7.58 4 12 4C16.42 4 20 7.58 20 12C20 16.42 16.42 20 12 20ZM12.5 7H11V13L16.25 16.15L17 14.92L12.5 12.25V7Z",
  senior:      "M16 11C17.66 11 18.99 9.66 18.99 8C18.99 6.34 17.66 5 16 5C14.34 5 13 6.34 13 8C13 9.66 14.34 11 16 11ZM8 11C9.66 11 10.99 9.66 10.99 8C10.99 6.34 9.66 5 8 5C6.34 5 5 6.34 5 8C5 9.66 6.34 11 8 11ZM8 13C5.67 13 1 14.17 1 16.5V18H15V16.5C15 14.17 10.33 13 8 13ZM16 13C15.71 13 15.38 13.02 15.03 13.05C16.19 13.89 17 15.02 17 16.5V18H23V16.5C23 14.17 18.33 13 16 13Z",
  robot:       "M20 9V7C20 5.9 19.1 5 18 5H15C15 3.34 13.66 2 12 2C10.34 2 9 3.34 9 5H6C4.9 5 4 5.9 4 7V9C2.34 9 1 10.34 1 12C1 13.66 2.34 15 4 15V19C4 20.1 4.9 21 6 21H18C19.1 21 20 20.1 20 19V15C21.66 15 23 13.66 23 12C23 10.34 21.66 9 20 9ZM18 19H6V7H18V19ZM9 13C8.45 13 8 12.1 8 11C8 9.9 8.45 9 9 9C9.55 9 10 9.9 10 11C10 12.1 9.55 13 9 13ZM15 13C14.45 13 14 12.1 14 11C14 9.9 14.45 9 15 9C15.55 9 16 9.9 16 11C16 12.1 15.55 13 15 13ZM12 17.5C10.57 17.5 9.32 16.78 8.56 15.68L9.85 14.64C10.36 15.19 11.14 15.5 12 15.5C12.86 15.5 13.64 15.19 14.15 14.64L15.44 15.68C14.68 16.78 13.43 17.5 12 17.5Z",
};