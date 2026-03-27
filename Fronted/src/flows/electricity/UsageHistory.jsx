/**
 * flows/electricity/UsageHistory.jsx
 *
 * ✅ Production-grade Government Kiosk UI (no emojis)
 * ✅ Fetches real history via API (MongoDB backend)
 * ✅ Step 1: Consumer input → Step 2: Results (summary + chart + list)
 * ✅ Works for multiple departments by dept prop
 *
 * API expected:
 *   api.getHistory(consumerNo)
 *   -> { history: [{ billMonth, units, totalAmount, status, _id }, ...] }
 *
 * Notes:
 * - history assumed latest-first (history[0] = latest). If your API returns oldest-first,
 *   just reverse it once after fetch.
 */

import { useMemo, useState } from "react";
import api from "../../api/kioskApi";

// ── Theme ─────────────────────────────────────────────────────────────────────
const DEPT_THEME = {
  electricity: { C: "#0EA5E9", L: "#E0F2FE", BD: "#BAE6FD", unit: "kWh", title: "Usage History" },
  gas: { C: "#F97316", L: "#FFF7ED", BD: "#FED7AA", unit: "m³", title: "Usage History" },
  water: { C: "#06B6D4", L: "#ECFEFF", BD: "#A5F3FC", unit: "KL", title: "Usage History" },
  municipal: { C: "#8B5CF6", L: "#F5F3FF", BD: "#DDD6FE", unit: "", title: "Payment History" },
};

const FONT_BODY = "var(--font-body, 'DM Sans','Noto Sans Devanagari','Segoe UI',system-ui,sans-serif)";
const FONT_HEAD = "var(--font-head, 'DM Sans','Noto Sans Devanagari','Segoe UI',system-ui,sans-serif)";
const FONT_MONO = "var(--font-mono, 'DM Mono','Courier New',monospace)";

// ── SVG icons (no emojis) ─────────────────────────────────────────────────────
const PATH = {
  back: "M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z",
  search:
    "M15.5 14h-.79l-.28-.27A6.47 6.47 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79L20 21.5 21.5 20 15.5 14zM9.5 14C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z",
  warn: "M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2V7h2v7z",
  chart:
    "M5 9.2h2v9.8H5V9.2zm6-4.2h2V19h-2V5zm6 7h2v7h-2v-7z",
  list:
    "M4 6h16v2H4V6zm0 5h16v2H4v-2zm0 5h16v2H4v-2z",
  rupee:
    "M13 3H7v2h5a2 2 0 010 4H7v2h4.3L7 21h2.2l4.1-8H17v-2h-3.4a3.96 3.96 0 00.4-2H17V7h-3.1A4 4 0 0013 3z",
  bolt:
    "M11 21h-1l1-7H7.5c-.83 0-1.3-.95-.8-1.62L13 3h1l-1 7h3.5c.83 0 1.3.95.8 1.62L11 21z",
  drop:
    "M12 2.69l5.66 5.66C19.45 10.14 20 11.51 20 13a8 8 0 01-16 0c0-1.49.55-2.86 2.34-4.65L12 2.69z",
  flame:
    "M17.66 11.2c-.23-.3-.51-.56-.77-.82-.67-.6-1.43-1.03-2.07-1.66C13.33 7.26 13 4.85 13.95 3c-.95.23-1.78.75-2.49 1.32-2.59 2.08-3.61 5.75-2.39 8.9.04.1.08.2.08.33 0 .22-.15.42-.35.5-.23.1-.47.04-.66-.12a.58.58 0 01-.14-.17c-1.13-1.43-1.31-3.48-.55-5.12C5.78 10 4.87 12.3 5 14.47c.06.5.12 1 .29 1.5.14.6.41 1.2.71 1.73 1.08 1.73 2.95 2.97 5 3.2 2.2.27 4.52-.17 6.01-1.87 1.58-1.8 2.13-4.31 1.34-6.62l-.04-.1c-.22-.61-.5-1.2-.9-1.71l.25.7z",
};

function Icon({ d, size = 18, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} aria-hidden="true" style={{ flexShrink: 0, display: "block" }}>
      <path d={d} />
    </svg>
  );
}

function Card({ children, style = {} }) {
  return (
    <div
      style={{
        background: "white",
        border: "1.5px solid #E2E8F0",
        borderRadius: 16,
        padding: "clamp(16px,2vw,24px)",
        boxShadow: "0 1px 6px rgba(10,35,66,.06)",
        marginBottom: 16,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function ErrBox({ msg }) {
  if (!msg) return null;
  return (
    <div
      style={{
        background: "#FEF2F2",
        border: "1.5px solid #FECACA",
        borderRadius: 12,
        padding: "12px 16px",
        color: "#B91C1C",
        fontSize: "clamp(13px,1.4vw,15px)",
        fontFamily: FONT_BODY,
        marginBottom: 16,
        display: "flex",
        gap: 10,
        alignItems: "flex-start",
      }}
    >
      <Icon d={PATH.warn} size={18} color="#B91C1C" />
      <span style={{ fontWeight: 900, lineHeight: 1.5 }}>{msg}</span>
    </div>
  );
}

function onlyDigits(s) {
  return (s || "").replace(/\D/g, "");
}

function DeptMark({ dept, color }) {
  const d = dept === "gas" ? PATH.flame : dept === "water" ? PATH.drop : PATH.bolt;
  return (
    <div
      style={{
        width: 46,
        height: 46,
        borderRadius: 12,
        background: "rgba(255,255,255,.6)",
        border: "1.5px solid rgba(0,0,0,.06)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <Icon d={d} size={22} color={color} />
    </div>
  );
}

function SmallStat({ label, value, color }) {
  return (
    <Card style={{ textAlign: "center", padding: "clamp(12px,1.4vw,18px) 10px", marginBottom: 0 }}>
      <div style={{ fontFamily: FONT_HEAD, color, fontWeight: 950, fontSize: "clamp(14px,1.8vw,20px)", lineHeight: 1.2 }}>{value}</div>
      <div style={{ fontFamily: FONT_BODY, fontSize: 10, color: "#94A3B8", marginTop: 6, textTransform: "uppercase", letterSpacing: ".10em", fontWeight: 900 }}>
        {label}
      </div>
    </Card>
  );
}

function Badge({ text, paid }) {
  return (
    <span
      style={{
        background: paid ? "#DCFCE7" : "#FFF7ED",
        color: paid ? "#16A34A" : "#D97706",
        fontSize: 10,
        fontWeight: 950,
        padding: "3px 10px",
        borderRadius: 999,
        letterSpacing: ".08em",
        textTransform: "uppercase",
        fontFamily: FONT_BODY,
        border: `1px solid ${paid ? "#BBF7D0" : "#FED7AA"}`,
      }}
    >
      {text}
    </span>
  );
}

function Chart({ data, unit, color }) {
  if (!data?.length) return null;

  const values = data.map((b) => (unit ? Number(b.units || 0) : Number(b.totalAmount || 0)));
  const mx = Math.max(...values, 1);

  return (
    <Card>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(0,0,0,.03)", border: "1px solid rgba(0,0,0,.06)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon d={PATH.chart} size={18} color={color} />
          </div>
          <div>
            <div style={{ fontFamily: FONT_BODY, fontSize: 11, fontWeight: 950, letterSpacing: ".10em", textTransform: "uppercase", color: "#94A3B8" }}>
              Monthly {unit ? `Consumption (${unit})` : "Bill Amount"}
            </div>
            <div style={{ fontFamily: FONT_HEAD, fontSize: 14, fontWeight: 950, color: "#0A2342" }}>Last {data.length} Months</div>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "flex-end", gap: "clamp(6px,1vw,14px)", height: "clamp(110px,14vw,170px)" }}>
        {data.map((b, i) => {
          const val = unit ? Number(b.units || 0) : Number(b.totalAmount || 0);
          const pct = mx > 0 ? (val / mx) * 85 : 0;
          const isLast = i === data.length - 1;

          const month =
            (b.billMonth || "")
              .toString()
              .split(" ")[0]
              ?.slice(0, 3) || "—";

          return (
            <div key={b._id || i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
              <span style={{ color: "#94A3B8", fontSize: "clamp(9px,1vw,11px)", fontWeight: 950, fontFamily: FONT_MONO }}>
                {unit ? val : `₹${(val / 1000).toFixed(1)}k`}
              </span>

              <div
                style={{
                  width: "100%",
                  background: isLast ? color : `${color}55`,
                  borderRadius: "6px 6px 0 0",
                  height: `${pct}%`,
                  minHeight: 6,
                  transition: "height .35s ease",
                }}
              />

              <span style={{ color: "#64748B", fontSize: "clamp(9px,1vw,11px)", fontWeight: 900, fontFamily: FONT_BODY, letterSpacing: ".06em" }}>{month}</span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

export function UsageHistory({ dept = "electricity", t, setScreen, lang = "en" }) {
  const theme = DEPT_THEME[dept] || DEPT_THEME.electricity;
  const { C, L, BD, unit, title } = theme;

  const copy = useMemo(() => {
    const isHi = lang === "hi";
    return {
      back: t?.back || (isHi ? "वापस" : "Back"),
      heading: title,
      enter: isHi ? "उपभोक्ता संख्या दर्ज करें" : "Enter Consumer Number",
      placeholder: isHi ? "उदा. 1001" : "e.g. 1001",
      view: isHi ? "हिस्ट्री देखें" : "View History",
      fetching: isHi ? "लोड हो रहा है…" : "Fetching…",
      another: isHi ? "दूसरा उपभोक्ता खोजें" : "Search Another Consumer",
      none: isHi ? "इस उपभोक्ता के लिए कोई बिलिंग हिस्ट्री नहीं मिली।" : "No billing history found for this consumer.",
      latest: isHi ? "नवीनतम बिल" : "Latest Bill",
      avg: isHi ? "औसत मासिक" : "Avg Monthly",
      trend: isHi ? "ट्रेंड" : "Trend",
      recent: isHi ? "हाल के बिल" : "Recent Bills",
      required: isHi ? "कृपया उपभोक्ता संख्या दर्ज करें।" : "Enter your consumer number",
    };
  }, [lang, t, title]);

  const [consNum, setConsNum] = useState("");
  const [history, setHistory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fetched, setFetched] = useState(false);

  const fetchHistory = async (n) => {
    const num = (n || consNum).trim().toUpperCase();
    if (!num) {
      setError(copy.required);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const r = await api.getHistory(num);
      const list = Array.isArray(r?.history) ? r.history : [];
      // Expect latest-first. If your backend returns oldest-first, uncomment next line:
      // list.reverse();
      setHistory(list);
      setFetched(true);
    } catch (e) {
      setError(e?.message || "Unable to fetch history.");
      setHistory([]);
      setFetched(true);
    } finally {
      setLoading(false);
    }
  };

  const chartData = (history || []).slice(0, 6).reverse();

  const avg = history?.length
    ? Math.round(history.reduce((s, b) => s + Number(b.totalAmount || 0), 0) / history.length)
    : 0;

  const trend = history?.length >= 2 && Number(history[1]?.totalAmount || 0) > 0
    ? (((Number(history[0].totalAmount || 0) - Number(history[1].totalAmount || 0)) / Number(history[1].totalAmount || 1)) * 100).toFixed(1)
    : null;

  const latestAmount = Number(history?.[0]?.totalAmount || 0);

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "#F0F4F8" }}>
      {/* Header */}
      <div style={{ background: "white", borderBottom: `4px solid ${C}`, padding: "clamp(14px,1.8vw,20px) clamp(16px,2.5vw,40px)" }}>
        <button
          type="button"
          onClick={() => setScreen("dept")}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 8,
            color: "#64748B",
            fontFamily: FONT_BODY,
            fontSize: 14,
            fontWeight: 900,
            marginBottom: 12,
            padding: "4px 0",
          }}
        >
          <Icon d={PATH.back} size={16} color="#64748B" />
          {copy.back}
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <DeptMark dept={dept} color={C} />
          <div>
            <h2 style={{ fontFamily: FONT_HEAD, fontSize: "clamp(16px,2vw,24px)", fontWeight: 950, color: "#0A2342", margin: 0 }}>{copy.heading}</h2>
            <p style={{ fontFamily: FONT_BODY, fontSize: 12, color: "#94A3B8", marginTop: 4, fontWeight: 900 }}>
              {dept === "gas" ? "AVVNL Gas" : dept === "water" ? "Water Supply" : "AVVNL Electricity"} · Rajasthan
            </p>
          </div>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto" }}>
        <div style={{ maxWidth: 720, margin: "0 auto", padding: "clamp(20px,2.5vw,32px) clamp(16px,2.5vw,40px) 48px" }}>
          {/* Input */}
          {!fetched && (
            <Card>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: L, border: `1.5px solid ${BD}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon d={PATH.search} size={18} color={C} />
                </div>
                <p style={{ fontFamily: FONT_BODY, fontSize: 11, fontWeight: 950, letterSpacing: ".10em", textTransform: "uppercase", color: "#94A3B8", margin: 0 }}>
                  {copy.enter}
                </p>
              </div>

              <ErrBox msg={error} />

              <div style={{ display: "flex", gap: 10 }}>
                <input
                  value={consNum}
                  onChange={(e) => {
                    setConsNum(e.target.value.toUpperCase());
                    setError("");
                  }}
                  onKeyDown={(e) => e.key === "Enter" && fetchHistory()}
                  placeholder={copy.placeholder}
                  style={{
                    flex: 1,
                    height: 52,
                    padding: "0 16px",
                    fontFamily: FONT_BODY,
                    fontSize: 16,
                    fontWeight: 900,
                    color: "#0A2342",
                    background: "#F8FAFC",
                    border: "2px solid #E2E8F0",
                    borderRadius: 12,
                    outline: "none",
                  }}
                />

                <button
                  type="button"
                  onClick={() => fetchHistory()}
                  disabled={!consNum.trim() || loading}
                  style={{
                    padding: "0 22px",
                    height: 52,
                    border: "none",
                    borderRadius: 12,
                    background: !consNum.trim() || loading ? "#E2E8F0" : C,
                    color: !consNum.trim() || loading ? "#94A3B8" : "white",
                    fontFamily: FONT_BODY,
                    fontSize: 15,
                    fontWeight: 950,
                    cursor: !consNum.trim() || loading ? "not-allowed" : "pointer",
                    whiteSpace: "nowrap",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <Icon d={PATH.search} size={18} color={!consNum.trim() || loading ? "#94A3B8" : "white"} />
                  {loading ? copy.fetching : copy.view}
                </button>
              </div>
            </Card>
          )}

          {/* Results */}
          {fetched && history && (
            <>
              <button
                type="button"
                onClick={() => {
                  setFetched(false);
                  setHistory(null);
                  setConsNum("");
                  setError("");
                }}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#64748B",
                  fontFamily: FONT_BODY,
                  fontSize: 13,
                  fontWeight: 950,
                  marginBottom: 16,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: 0,
                }}
              >
                <Icon d={PATH.back} size={16} color="#64748B" />
                {copy.another}
              </button>

              {history.length === 0 ? (
                <Card>
                  <p style={{ fontFamily: FONT_BODY, fontSize: 15, color: "#64748B", textAlign: "center", padding: "26px 0", fontWeight: 900 }}>{copy.none}</p>
                </Card>
              ) : (
                <>
                  {/* Summary */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "clamp(8px,1.2vw,14px)", marginBottom: 16 }}>
                    <SmallStat
                      label={copy.latest}
                      value={`₹${latestAmount.toLocaleString("en-IN")}`}
                      color={C}
                    />
                    <SmallStat label={copy.avg} value={`₹${avg.toLocaleString("en-IN")}`} color={C} />
                    <SmallStat
                      label={copy.trend}
                      value={
                        trend !== null
                          ? `${Number(trend) > 0 ? "UP" : "DOWN"} ${Math.abs(Number(trend)).toFixed(1)}%`
                          : "—"
                      }
                      color={trend === null ? C : Number(trend) > 0 ? "#DC2626" : "#16A34A"}
                    />
                  </div>

                  {/* Chart */}
                  <Chart data={chartData} unit={unit} color={C} />

                  {/* Bills list */}
                  <Card>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(0,0,0,.03)", border: "1px solid rgba(0,0,0,.06)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Icon d={PATH.list} size={18} color={C} />
                      </div>
                      <p style={{ fontFamily: FONT_BODY, fontSize: 11, fontWeight: 950, letterSpacing: ".10em", textTransform: "uppercase", color: "#94A3B8", margin: 0 }}>
                        {copy.recent}
                      </p>
                    </div>

                    {history.map((b, i) => {
                      const amt = Number(b.totalAmount || 0);
                      const u = Number(b.units || 0);
                      const status = (b.status || "").toString();
                      const paid = status.toLowerCase() === "paid";

                      return (
                        <div
                          key={b._id || i}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            padding: "14px 0",
                            borderBottom: i < history.length - 1 ? "1px solid #F1F5F9" : "none",
                            gap: 12,
                          }}
                        >
                          <div style={{ minWidth: 0 }}>
                            <p style={{ fontFamily: FONT_BODY, fontSize: "clamp(13px,1.5vw,15px)", fontWeight: 950, color: "#0A2342", margin: 0 }}>
                              {b.billMonth || "—"}
                            </p>
                            {u > 0 && unit ? (
                              <p style={{ fontFamily: FONT_BODY, fontSize: "clamp(11px,1.2vw,13px)", color: "#94A3B8", margin: "4px 0 0", fontWeight: 900 }}>
                                {u} {unit}
                              </p>
                            ) : null}
                          </div>

                          <div style={{ textAlign: "right", flexShrink: 0 }}>
                            <p style={{ fontFamily: FONT_HEAD, fontSize: "clamp(14px,1.6vw,18px)", fontWeight: 950, color: C, margin: 0 }}>
                              ₹{amt.toLocaleString("en-IN")}
                            </p>
                            <div style={{ marginTop: 6, display: "flex", justifyContent: "flex-end" }}>
                              <Badge text={status || "Pending"} paid={paid} />
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    <div style={{ marginTop: 14, fontFamily: FONT_BODY, fontSize: 12, color: "#94A3B8", fontWeight: 900, display: "flex", alignItems: "center", gap: 8 }}>
                      <Icon d={PATH.rupee} size={16} color="#94A3B8" />
                      <span>
                        Consumer: <span style={{ fontFamily: FONT_MONO, color: "#0A2342" }}>{consNum}</span>
                      </span>
                    </div>
                  </Card>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Exports used in your App router ───────────────────────────────────────────
export const ElecHistory = (p) => <UsageHistory {...p} dept="electricity" />;
export const GasHistory = (p) => <UsageHistory {...p} dept="gas" />;
export const WaterHistory = (p) => <UsageHistory {...p} dept="water" />;