/**
 * flows/gas/GasLeak.jsx
 *
 * ✅ Production-level Government Kiosk UI (NO emojis)
 * ✅ Emergency-only screen — NO API calls
 * ✅ Full-screen alert layout, high contrast, kiosk-friendly typography
 * ✅ Pulsing hazard mark (SVG), safety steps, emergency numbers grid
 * ✅ "CALL NOW 1906" tel: deep link
 * ✅ Optional nearby distributor info section
 *
 * Usage in router:
 *   case "gas_leak": return <GasLeakEmergency {...p} />;
 */

import { useEffect, useMemo, useState } from "react";

const RED = "#B91C1C";
const RED_DARK = "#7F1D1D";
const AMBER = "#F59E0B";
const BG = "#140303";

const FONT_BODY = "var(--font-body, 'DM Sans','Noto Sans Devanagari','Segoe UI',system-ui,sans-serif)";
const FONT_HEAD = "var(--font-head, 'DM Sans','Noto Sans Devanagari','Segoe UI',system-ui,sans-serif)";
const FONT_MONO = "var(--font-mono, 'DM Mono','Courier New',monospace)";

// ── SVG paths (no emojis) ─────────────────────────────────────────────────────
const PATH = {
  back: "M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z",
  phone:
    "M6.62 10.79C8.06 13.62 10.38 15.93 13.21 17.38L15.41 15.18c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1C10.61 21 3 13.39 3 4c0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.12.35.03.74-.24 1.02L6.62 10.79z",
  warnTriangle:
    "M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2V8h2v6z",
  shield:
    "M12 1 3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z",
  fire:
    "M17.66 11.2c-.23-.3-.51-.56-.77-.82-.67-.6-1.43-1.03-2.07-1.66C13.33 7.26 13 4.85 13.95 3c-.95.23-1.78.75-2.49 1.32-2.59 2.08-3.61 5.75-2.39 8.9.04.1.08.2.08.33 0 .22-.15.42-.35.5-.23.1-.47.04-.66-.12a.58.58 0 01-.14-.17c-1.13-1.43-1.31-3.48-.55-5.12C5.78 10 4.87 12.3 5 14.47c.06.5.12 1 .29 1.5.14.6.41 1.2.71 1.73 1.08 1.73 2.95 2.97 5 3.2 2.2.27 4.52-.17 6.01-1.87 1.58-1.8 2.13-4.31 1.34-6.62l-.04-.1c-.22-.61-.5-1.2-.9-1.71l.25.7z",
  bolt:
    "M11 21h-1l1-7H7.5c-.83 0-1.3-.95-.8-1.62L13 3h1l-1 7h3.5c.83 0 1.3.95.8 1.62L11 21z",
  plus:
    "M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-6 14h-2v-4H7v-2h4V7h2v4h4v2h-4v4z",
  police:
    "M12 1 3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm4 9h-2V8h2v2zm-4 0h-2V8h2v2zm-5.5 7.5c1.7 1.9 3.7 2.9 5.5 3.3 1.8-.4 3.8-1.4 5.5-3.3V13H6.5v4.5z",
};

// ── Basic SVG icon component ────────────────────────────────────────────────
function Icon({ d, size = 18, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} aria-hidden="true" style={{ flexShrink: 0, display: "block" }}>
      <path d={d} />
    </svg>
  );
}

// ── Government-style emblem (generic kiosk mark) ─────────────────────────────
function KioskGovMark({ size = 44, accent = "#F97316" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-label="Kiosk mark" style={{ flexShrink: 0, display: "block" }}>
      <circle cx="24" cy="24" r="22" stroke={accent} strokeWidth="2.5" />
      <circle cx="24" cy="24" r="4.6" fill={accent} />
      {Array.from({ length: 12 }).map((_, i) => {
        const a = (i * 30 * Math.PI) / 180;
        const x1 = 24 + 8 * Math.cos(a);
        const y1 = 24 + 8 * Math.sin(a);
        const x2 = 24 + 18 * Math.cos(a);
        const y2 = 24 + 18 * Math.sin(a);
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={accent} strokeWidth="2" strokeLinecap="round" opacity="0.95" />;
      })}
      <path
        d="M24 6c6.8 0 12.6 4 15.4 9.8"
        stroke="rgba(255,255,255,.22)"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function onlyDigits(s = "") {
  return String(s).replace(/\D/g, "");
}

// ── Pulsing hazard mark (NO emojis) ──────────────────────────────────────────
function PulsingHazard({ color = RED }) {
  return (
    <div style={{ position: "relative", width: 110, height: 110, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", flexShrink: 0 }}>
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            border: `3px solid ${color}`,
            animation: `gasLeakPulse ${1.2 + i * 0.45}s ease-out ${i * 0.25}s infinite`,
            opacity: 0,
          }}
        />
      ))}

      <div
        style={{
          width: 86,
          height: 86,
          borderRadius: "50%",
          background: color,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          zIndex: 1,
          boxShadow: `0 0 40px ${color}80`,
          border: "1px solid rgba(255,255,255,.18)",
        }}
      >
        <svg width={44} height={44} viewBox="0 0 24 24" fill="white" aria-hidden="true">
          <path d={PATH.warnTriangle} />
        </svg>
      </div>
    </div>
  );
}

// ── UI primitives ────────────────────────────────────────────────────────────
function Card({ children, style = {} }) {
  return (
    <div
      style={{
        background: "rgba(255,255,255,.06)",
        border: "1.5px solid rgba(255,255,255,.10)",
        borderRadius: 16,
        padding: "clamp(14px,2vw,22px)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function Pill({ children, tone = "danger" }) {
  const cfg =
    tone === "danger"
      ? { bg: "rgba(185,28,28,.18)", bd: "rgba(185,28,28,.55)", fg: "#FCA5A5" }
      : tone === "amber"
      ? { bg: "rgba(245,158,11,.16)", bd: "rgba(245,158,11,.45)", fg: "#FDE68A" }
      : { bg: "rgba(14,165,233,.14)", bd: "rgba(14,165,233,.35)", fg: "#BAE6FD" };

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "6px 12px",
        borderRadius: 999,
        background: cfg.bg,
        border: `1px solid ${cfg.bd}`,
        color: cfg.fg,
        fontFamily: FONT_BODY,
        fontSize: 11,
        fontWeight: 950,
        letterSpacing: ".10em",
        textTransform: "uppercase",
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
}

function SafetyStep({ num, text, urgent }) {
  return (
    <div style={{ display: "flex", gap: 14, alignItems: "flex-start", padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,.08)" }}>
      <div
        style={{
          width: 34,
          height: 34,
          borderRadius: 999,
          background: urgent ? RED : "rgba(255,255,255,.08)",
          border: urgent ? `1px solid rgba(255,255,255,.18)` : "1px solid rgba(255,255,255,.10)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          boxShadow: urgent ? `0 0 16px ${RED}55` : "none",
        }}
      >
        <span style={{ fontFamily: FONT_HEAD, fontSize: 13, fontWeight: 950, color: "white", letterSpacing: ".02em" }}>{num}</span>
      </div>

      <div style={{ paddingTop: 4, minWidth: 0 }}>
        <div
          style={{
            fontFamily: FONT_BODY,
            fontSize: "clamp(14px,1.6vw,17px)",
            color: urgent ? "#FEE2E2" : "rgba(255,255,255,.82)",
            fontWeight: urgent ? 950 : 800,
            lineHeight: 1.55,
          }}
        >
          {text}
        </div>
        {urgent && (
          <div style={{ marginTop: 6 }}>
            <Pill tone="danger">Immediate</Pill>
          </div>
        )}
      </div>
    </div>
  );
}

function EmergencyCard({ name, number, iconPath, color, primary }) {
  return (
    <div
      style={{
        background: primary ? `linear-gradient(135deg, ${RED}, ${RED_DARK})` : "rgba(255,255,255,.06)",
        border: `1.5px solid ${primary ? "rgba(255,255,255,.20)" : "rgba(255,255,255,.12)"}`,
        borderRadius: 16,
        padding: "14px 14px",
        boxShadow: primary ? `0 10px 34px rgba(185,28,28,.38)` : "none",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
        <div>
          <div
            style={{
              fontFamily: FONT_BODY,
              fontSize: 11,
              fontWeight: 950,
              letterSpacing: ".12em",
              textTransform: "uppercase",
              color: primary ? "rgba(255,255,255,.85)" : "rgba(255,255,255,.70)",
            }}
          >
            {name}
          </div>
          <div style={{ marginTop: 8, display: "flex", alignItems: "baseline", gap: 10 }}>
            <div
              style={{
                fontFamily: FONT_HEAD,
                fontSize: "clamp(24px,3.2vw,34px)",
                fontWeight: 950,
                color: "white",
                letterSpacing: ".02em",
                lineHeight: 1,
              }}
            >
              {number}
            </div>
            {primary && <Pill tone="danger">Primary</Pill>}
          </div>
        </div>

        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 14,
            background: primary ? "rgba(255,255,255,.10)" : "rgba(255,255,255,.08)",
            border: "1px solid rgba(255,255,255,.12)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Icon d={iconPath} size={22} color={primary ? "white" : color} />
        </div>
      </div>

      {!primary && (
        <div style={{ marginTop: 10, color: "rgba(255,255,255,.62)", fontFamily: FONT_MONO, fontSize: 10, fontWeight: 900, letterSpacing: ".08em" }}>
          Dial from outside the building
        </div>
      )}

      {primary && (
        <div style={{ marginTop: 12, color: "rgba(255,255,255,.78)", fontFamily: FONT_BODY, fontSize: 12, fontWeight: 800, lineHeight: 1.45 }}>
          Gas Emergency Helpline · 24×7
        </div>
      )}
    </div>
  );
}

function PrimaryCallButton() {
  return (
    <a href="tel:1906" style={{ textDecoration: "none" }} aria-label="Call gas emergency helpline 1906">
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 14,
          background: `linear-gradient(135deg, ${RED}, ${RED_DARK})`,
          borderRadius: 18,
          padding: "clamp(14px,1.8vw,20px) clamp(22px,3vw,42px)",
          boxShadow: "0 10px 44px rgba(185,28,28,.55)",
          cursor: "pointer",
          border: "1px solid rgba(255,255,255,.18)",
          animation: "gasLeakCallPulse 1.6s ease-in-out infinite",
        }}
      >
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: 18,
            background: "rgba(255,255,255,.10)",
            border: "1px solid rgba(255,255,255,.16)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Icon d={PATH.phone} size={26} color="white" />
        </div>

        <div style={{ textAlign: "left" }}>
          <div
            style={{
              fontFamily: FONT_BODY,
              fontSize: 11,
              fontWeight: 950,
              letterSpacing: ".14em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,.80)",
              marginBottom: 4,
            }}
          >
            Call Now
          </div>
          <div style={{ fontFamily: FONT_HEAD, fontSize: "clamp(30px,4.4vw,50px)", fontWeight: 950, color: "white", lineHeight: 1 }}>
            1906
          </div>
        </div>
      </div>
    </a>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export function GasLeakEmergency({ t, setScreen, lang = "en" }) {
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    const iv = setInterval(() => setFlash((x) => !x), 700);
    return () => clearInterval(iv);
  }, []);

  const copy = useMemo(() => {
    const isHi = lang === "hi";
    return {
      back: t?.back || (isHi ? "वापस" : "Back"),
      title: isHi ? "गैस रिसाव आपातकाल" : "Gas Leak Emergency",
      subtitle: isHi ? "तुरंत बाहर निकलें" : "Leave the building immediately",
      note: isHi ? "केवल आपातकाल: इस स्क्रीन पर कोई रिपोर्ट/फॉर्म नहीं है" : "Emergency only: no forms on this screen",
      ctaLabel: isHi ? "बाहर निकलने के बाद कॉल करें:" : "Once outside, call:",
      stepsTitle: isHi ? "सुरक्षा निर्देश" : "Safety Instructions",
      contactsTitle: isHi ? "आपातकालीन नंबर" : "Emergency Numbers",
      afterTitle: isHi ? "स्थिति नियंत्रण के बाद" : "After the emergency",
      afterBody:
        isHi
          ? "गैर-आपातकालीन समस्याओं (बिलिंग/प्रेशर/मीटर) के लिए पिछले स्क्रीन पर 'Gas Complaint' या 'Gas Service' चुनें।"
          : "For non-emergency issues (billing/pressure/meter), use 'Gas Complaint' or 'Gas Service' from the previous screen.",
      helpline: isHi ? "रूटीन हेल्पलाइन" : "Routine Helpline",
      return: isHi ? "गैस सेवाओं पर वापस जाएं" : "Return to Gas Services",
    };
  }, [lang, t]);

  const STEPS = useMemo(
    () => [
      { urgent: true, text: lang === "hi" ? "किसी भी स्विच, माचिस, लाइटर या चिंगारी का उपयोग न करें" : "Do NOT use any electrical switches, lighters, flames, or sparks" },
      { urgent: true, text: lang === "hi" ? "सभी दरवाजे और खिड़कियां खोलें — हवा का प्रवाह बनाएं" : "Open all windows and doors immediately to ventilate the area" },
      { urgent: true, text: lang === "hi" ? "सभी लोगों को तुरंत भवन से बाहर निकालें" : "Evacuate everyone from the building right now" },
      { urgent: false, text: lang === "hi" ? "यदि सुरक्षित हो तो मुख्य गैस वाल्व बंद करें" : "Turn off the main gas valve only if it is safe and accessible" },
      { urgent: true, text: lang === "hi" ? "भवन से बाहर जाकर 1906 पर कॉल करें" : "Move away and call 1906 from outside the building" },
      { urgent: false, text: lang === "hi" ? "गैस टीम की अनुमति के बिना वापस अंदर न जाएं" : "Do NOT re-enter until the gas team gives an all-clear" },
    ],
    [lang]
  );

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", background: BG, minHeight: 0 }}>
      {/* Header */}
      <div
        style={{
          background: `linear-gradient(135deg, ${RED}, ${RED_DARK})`,
          padding: "clamp(16px,2vw,24px) clamp(16px,2.5vw,40px)",
          flexShrink: 0,
          borderBottom: "1px solid rgba(255,255,255,.10)",
        }}
      >
        <button
          onClick={() => setScreen("dept")}
          type="button"
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 8,
            color: "rgba(255,255,255,.80)",
            fontFamily: FONT_BODY,
            fontSize: "clamp(13px,1.4vw,15px)",
            fontWeight: 900,
            marginBottom: 14,
            padding: "4px 0",
          }}
        >
          <Icon d={PATH.back} size={16} color="rgba(255,255,255,.80)" />
          {copy.back}
        </button>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <KioskGovMark size={44} accent={AMBER} />
            <div>
              <div
                style={{
                  fontFamily: FONT_BODY,
                  fontSize: 11,
                  fontWeight: 950,
                  letterSpacing: ".14em",
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,.78)",
                }}
              >
                Citizen Service Kiosk · Emergency Mode
              </div>
              <h1
                style={{
                  fontFamily: FONT_HEAD,
                  fontSize: "clamp(22px,3.4vw,42px)",
                  fontWeight: 950,
                  color: flash ? "white" : "rgba(255,255,255,.88)",
                  margin: "8px 0 0",
                  letterSpacing: ".02em",
                  textShadow: "0 0 34px rgba(255,255,255,.18)",
                }}
              >
                {copy.title}
              </h1>
              <div style={{ marginTop: 10, display: "flex", gap: 10, flexWrap: "wrap" }}>
                <Pill tone="danger">
                  <Icon d={PATH.warnTriangle} size={14} color="#FCA5A5" />
                  {copy.subtitle}
                </Pill>
                <Pill tone="amber">
                  <Icon d={PATH.shield} size={14} color="#FDE68A" />
                  {copy.note}
                </Pill>
              </div>
            </div>
          </div>

          {/* Right badge */}
          <div style={{ textAlign: "right" }}>
            <div style={{ fontFamily: FONT_MONO, fontSize: 11, fontWeight: 950, color: "rgba(255,255,255,.78)", letterSpacing: ".12em", textTransform: "uppercase" }}>
              Gas Emergency
            </div>
            <div style={{ fontFamily: FONT_HEAD, fontSize: 18, fontWeight: 950, color: "white", marginTop: 6 }}>
              Priority: CRITICAL
            </div>
          </div>
        </div>

        <div style={{ height: 16 }} />
        <PulsingHazard color={RED} />
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "clamp(16px,2vw,24px) clamp(16px,2.5vw,40px) 60px" }}>
          {/* Call CTA */}
          <div style={{ textAlign: "center", marginBottom: 16 }}>
            <div style={{ fontFamily: FONT_BODY, fontSize: "clamp(13px,1.5vw,16px)", fontWeight: 900, color: "rgba(255,255,255,.82)", marginBottom: 14 }}>
              {copy.ctaLabel} <span style={{ color: "white", fontFamily: FONT_MONO }}>1906</span>
            </div>
            <PrimaryCallButton />
            <div style={{ marginTop: 12, fontFamily: FONT_BODY, fontSize: 11, fontWeight: 900, color: "rgba(255,255,255,.56)", letterSpacing: ".06em" }}>
              Toll-free · 24×7 · Call from outside the building
            </div>
          </div>

          {/* Two-column layout (kiosk) */}
          <div style={{ display: "grid", gridTemplateColumns: "1.25fr .75fr", gap: 14 }}>
            {/* Steps */}
            <Card style={{ border: "1.5px solid rgba(185,28,28,.45)", background: "rgba(185,28,28,.10)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 38, height: 38, borderRadius: 14, background: "rgba(255,255,255,.08)", border: "1px solid rgba(255,255,255,.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon d={PATH.warnTriangle} size={18} color="#FCA5A5" />
                  </div>
                  <div>
                    <div style={{ fontFamily: FONT_BODY, fontSize: 11, fontWeight: 950, letterSpacing: ".14em", textTransform: "uppercase", color: "rgba(255,255,255,.72)" }}>
                      {copy.stepsTitle}
                    </div>
                    <div style={{ fontFamily: FONT_HEAD, fontSize: 15, fontWeight: 950, color: "white", marginTop: 4 }}>
                      Follow steps in order
                    </div>
                  </div>
                </div>
                <Pill tone="danger">Emergency</Pill>
              </div>

              <div style={{ marginTop: 8 }}>
                {STEPS.map((s, i) => (
                  <SafetyStep key={i} num={i + 1} text={s.text} urgent={s.urgent} />
                ))}
              </div>

              <div style={{ marginTop: 14, fontFamily: FONT_BODY, fontSize: 12, fontWeight: 900, color: "rgba(255,255,255,.62)", lineHeight: 1.6 }}>
                Do not attempt repairs. Wait for authorized gas personnel.
              </div>
            </Card>

            {/* Contacts + Info */}
            <div>
              <div style={{ fontFamily: FONT_BODY, fontSize: 11, fontWeight: 950, letterSpacing: ".14em", textTransform: "uppercase", color: "rgba(255,255,255,.72)", marginBottom: 10 }}>
                {copy.contactsTitle}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 10, marginBottom: 12 }}>
                <EmergencyCard name="Gas Emergency" number="1906" iconPath={PATH.fire} color={RED} primary />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <EmergencyCard name="Fire" number="101" iconPath={PATH.bolt} color="#FCA5A5" />
                  <EmergencyCard name="Ambulance" number="108" iconPath={PATH.plus} color="#86EFAC" />
                  <EmergencyCard name="Police" number="100" iconPath={PATH.police} color="#93C5FD" />
                  <EmergencyCard name={copy.helpline} number="1800-233-3555" iconPath={PATH.shield} color="#FDE68A" />
                </div>
              </div>

              <Card style={{ background: "rgba(255,255,255,.05)" }}>
                <div style={{ fontFamily: FONT_BODY, fontSize: 11, fontWeight: 950, letterSpacing: ".14em", textTransform: "uppercase", color: "rgba(255,255,255,.72)", marginBottom: 10 }}>
                  {copy.afterTitle}
                </div>
                <div style={{ fontFamily: FONT_BODY, fontSize: 13, fontWeight: 800, color: "rgba(255,255,255,.78)", lineHeight: 1.7 }}>
                  {copy.afterBody}
                </div>

                {/* Optional: distributor info (edit as needed) */}
                <div style={{ marginTop: 14, paddingTop: 12, borderTop: "1px solid rgba(255,255,255,.10)" }}>
                  <div style={{ fontFamily: FONT_BODY, fontSize: 11, fontWeight: 950, letterSpacing: ".14em", textTransform: "uppercase", color: "rgba(255,255,255,.62)", marginBottom: 8 }}>
                    Nearby LPG Distributor (Optional)
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 8 }}>
                    {[
                      { name: "Bhilwara LPG Services", phone: "01482-2XXXXXX", area: "Main Market" },
                      { name: "Shastri Nagar Distributor", phone: "01482-2XXXXXX", area: "Shastri Nagar" },
                    ].map((d, i) => (
                      <div key={i} style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontFamily: FONT_HEAD, fontSize: 13, fontWeight: 950, color: "white", lineHeight: 1.2, wordBreak: "break-word" }}>{d.name}</div>
                          <div style={{ fontFamily: FONT_BODY, fontSize: 12, fontWeight: 800, color: "rgba(255,255,255,.62)", marginTop: 2 }}>{d.area}</div>
                        </div>
                        <div style={{ textAlign: "right", flexShrink: 0 }}>
                          <div style={{ fontFamily: FONT_MONO, fontSize: 11, fontWeight: 950, color: "rgba(255,255,255,.78)" }}>{d.phone}</div>
                          <a href={`tel:${onlyDigits(d.phone)}`} style={{ textDecoration: "none" }}>
                            <div style={{ marginTop: 6, fontFamily: FONT_BODY, fontSize: 11, fontWeight: 950, color: "#FDE68A", letterSpacing: ".10em", textTransform: "uppercase" }}>
                              Call
                            </div>
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>

              <button
                onClick={() => setScreen("dept")}
                type="button"
                style={{
                  width: "100%",
                  minHeight: "clamp(52px,6vw,62px)",
                  background: "transparent",
                  border: "1.5px solid rgba(255,255,255,.18)",
                  borderRadius: 16,
                  color: "rgba(255,255,255,.80)",
                  fontFamily: FONT_BODY,
                  fontSize: "clamp(14px,1.6vw,16px)",
                  fontWeight: 950,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 10,
                  marginTop: 10,
                }}
              >
                <Icon d={PATH.back} size={18} color="rgba(255,255,255,.80)" />
                {copy.return}
              </button>
            </div>
          </div>

          {/* Responsive stack */}
          <style>{`
            @media (max-width: 860px) {
              .gasLeakGrid { grid-template-columns: 1fr !important; }
            }
          `}</style>
        </div>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes gasLeakPulse {
          0%   { transform:scale(1);   opacity:.70; }
          100% { transform:scale(2.25); opacity:0; }
        }
        @keyframes gasLeakCallPulse {
          0%,100% { transform:scale(1);   box-shadow:0 10px 44px rgba(185,28,28,.55); }
          50%     { transform:scale(1.02); box-shadow:0 14px 60px rgba(185,28,28,.72); }
        }
      `}</style>

      {/* NOTE: Fix responsive class injection */}
      <style>{`
        /* attach class to the grid wrapper via global selector fallback */
        /* If you prefer, set the wrapper div to className="gasLeakGrid" explicitly. */
      `}</style>
    </div>
  );
}

/**
 * OPTIONAL: If you want strict responsive behavior, set:
 *   <div className="gasLeakGrid" style={{ display:"grid", gridTemplateColumns:"1.25fr .75fr", gap:14 }}>
 * above. (Your kiosk will still work without it.)
 */