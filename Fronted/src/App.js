import { useState, useEffect, useRef } from "react";
import { CSS } from "./data/styles";
import { T } from "./data/translations";
import { TopBar, Ticker } from "./components/TopBar";
import { LanguageScreen, HomeScreen } from "./components/HomeScreen";
import { DeptScreen } from "./components/DeptScreen";
import AdminPanel from "./components/AdminPanel";

// ── Electricity flows ───────────────────────────────────────────
import { ElecBillPay }       from "./flows/electricity/BillPay";
import { ElecNewConnection } from "./flows/electricity/NewConnection";
import { ElecComplaint }     from "./flows/electricity/Complaint";
import { ElecOutage }        from "./flows/electricity/OutageReport";
import { ElecHistory }       from "./flows/electricity/UsageHistory";
import { ElecGeneric }       from "./flows/electricity/GenericService";

// ── Gas flows ───────────────────────────────────────────────────
import { GasBillPay }       from "./flows/gas/BillPay";
import { GasLeakEmergency } from "./flows/gas/GasLeak";
import { GasComplaint }     from "./flows/gas/GasComplaint";
import { GasGeneric }       from "./flows/gas/GenericService";
import { PmYojana }         from "./flows/gas/PmYojana";

// ── Municipal flows ─────────────────────────────────────────────
import { MuniBillPay }        from "./flows/municipal/BillPay";
import { PropertyTax }        from "./flows/municipal/PropertyTax";
import { MuniCertificate }    from "./flows/municipal/Certificate";
import { MunicipalComplaint } from "./flows/municipal/Complaint";
import { WaterConnection }    from "./flows/municipal/WaterConnection";
import { TrackApplication }   from "./flows/municipal/TrackApplication";
import { MuniGeneric }        from "./flows/municipal/MuniGeneric";

// ── Info flows ──────────────────────────────────────────────────
import { HelplineScreen } from "./flows/info/Helplines";
import { VoterID }           from "./flows/info/VoterID";
import { AadhaarServices }   from "./flows/info/AadhaarServices";

// ── Chatbot ─────────────────────────────────────────────────────
import { SUVIDHAChatbot } from "./components/Chatbot";

// ─────────────────────────────────────────────────────────────────────────────
// AdminTrigger — 5 taps on top-left corner within 3s → opens admin
// ─────────────────────────────────────────────────────────────────────────────
function AdminTrigger({ onOpen }) {
  const [clicks, setClicks] = useState(0);
  const timerRef = useRef(null);

  const handleClick = () => {
    setClicks(prev => {
      const next = prev + 1;
      if (next >= 5) {
        clearTimeout(timerRef.current);
        onOpen();
        return 0;
      }
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setClicks(0), 3000);
      return next;
    });
  };

  return (
    <div
      onClick={handleClick}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: 90,
        height: 72,
        zIndex: 500,
        cursor: "default",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        paddingBottom: 6,
        gap: 3,
      }}
      title=""
    >
      {clicks > 0 && Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          style={{
            width: 5,
            height: 5,
            borderRadius: "50%",
            background: i < clicks ? "#F59E0B" : "rgba(255,255,255,0.3)",
            transition: "background .15s",
          }}
        />
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main App
// ─────────────────────────────────────────────────────────────────────────────
export default function App() {
  const [lang,      setLang]      = useState("en");
  const [screen,    setScreen]    = useState("language");
  const [dept,      setDept]      = useState("electricity");
  const [flow,      setFlow]      = useState(null);
  const [senior,    setSenior]    = useState(false);
  const [idle,      setIdle]      = useState(0);
  const [chatOpen,  setChatOpen]  = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);

  // ── Idle timer + URL ?admin=1 shortcut ─────────────────────────────────────
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("admin") === "1") {
      setAdminOpen(true);
    }

    const reset = () => setIdle(0);
    const events = ["click", "keydown", "touchstart", "mousemove"];
    events.forEach(e => window.addEventListener(e, reset, { passive: true }));
    const iv = setInterval(() => setIdle(i => i + 1), 1000);

    return () => {
      events.forEach(e => window.removeEventListener(e, reset));
      clearInterval(iv);
    };
  }, []);

  useEffect(() => {
    if (idle >= 90 && screen !== "language") {
      setScreen("language");
      setIdle(0);
      setChatOpen(false);
    }
  }, [idle, screen]);

  const t = T[lang];

  // ── Flow router ────────────────────────────────────────────────────────────
  const renderFlow = () => {
    if (!flow) return null;
    const p = { t, flow, setScreen, senior };

    switch (flow.subType) {

      // ── Electricity ────────────────────────────────────────────────────────
      case "elec_bill":       return <ElecBillPay {...p} />;
      case "elec_newconn":    return <ElecNewConnection {...p} />;
      case "elec_complaint":  return <ElecComplaint {...p} />;
      case "elec_outage":     return <ElecOutage {...p} />;
      case "elec_history":    return <ElecHistory {...p} />;
      case "elec_theft":
      case "elec_load":
      case "elec_namechange": return <ElecGeneric {...p} />;

      // ── Gas ────────────────────────────────────────────────────────────────
      case "gas_bill":        return <GasBillPay {...p} />;
      case "gas_leak":        return <GasLeakEmergency {...p} />;
      case "gas_complaint":   return <GasComplaint {...p} />;
      case "gas_newconn":
      case "gas_transfer":
      case "gas_meter":
      case "gas_scheme":
      case "gas_subsidy":     return <GasGeneric {...p} />;

      // ── Municipal ──────────────────────────────────────────────────────────
      case "muni_water":      return <MuniBillPay {...p} />;
      case "muni_proptax":    return <PropertyTax {...p} />;
      case "muni_certificate":return <MuniCertificate {...p} />;
      case "muni_complaint":  return <MunicipalComplaint {...p} />;
      case "muni_newwater":   return <WaterConnection {...p} />;
      case "muni_track":      return <TrackApplication {...p} />;
      case "muni_sanitation":
      case "muni_streetlight":
      case "muni_noc":
      case "muni_waterlog":
      case "muni_building":
      case "muni_park":       return <MuniGeneric {...p} />;

      // ── Info & Schemes ─────────────────────────────────────────────────────
      case "info_scheme":
      case "pm_yojana":
      case "schemes":         return <PmYojana {...p} />;

      case "info_helpline":   return <HelplineScreen {...p} />;

      case "info_voter":
        return <VoterID lang={lang} setScreen={setScreen} />;

      // ── Fallback ───────────────────────────────────────────────────────────
      default:
        return (
          <div style={{
            flex: 1, display: "flex", alignItems: "center",
            justifyContent: "center", background: "#F0F4F8",
          }}>
            <div style={{ textAlign: "center", padding: 40 }}>
              <p style={{
                fontFamily: "var(--font-body)", color: "#64748B", fontSize: 16,
              }}>
                Screen not found: <strong>{flow.subType}</strong>
              </p>
              <button
                onClick={() => setScreen("dept")}
                style={{
                  marginTop: 16, padding: "12px 24px", background: "#0EA5E9",
                  color: "white", border: "none", borderRadius: 12, cursor: "pointer",
                  fontFamily: "var(--font-body)", fontSize: 15, fontWeight: 700,
                }}
              >
                Go Back
              </button>
            </div>
          </div>
        );
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{CSS}</style>
      <div className={`shell ${senior ? "senior-mode" : ""}`}>

        {/* ── Header (all screens except language) ─────────────────────────── */}
        {screen !== "language" && (
          <>
            <TopBar
              t={t} lang={lang} setLang={setLang}
              senior={senior} setSenior={setSenior}
              screen={screen} setScreen={setScreen}
            />

            <AdminTrigger onOpen={() => setAdminOpen(true)} />

            <Ticker />

            {/* Idle warning bar */}
            {idle >= 75 && idle < 90 && (
              <div style={{
                background: "#FEF3C7", borderBottom: "2px solid #F59E0B",
                padding: "8px clamp(16px,2.5vw,40px)",
                fontFamily: "var(--font-body)", fontSize: "clamp(12px,1.3vw,14px)",
                color: "#78350F", fontWeight: 600,
                display: "flex", alignItems: "center", gap: 8,
              }}>
                <svg width={16} height={16} viewBox="0 0 24 24" fill="#D97706">
                  <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 17H11V15H13V17ZM13 13H11V7H13V13Z"/>
                </svg>
                Session resets in {90 - idle}s due to inactivity. Touch screen to continue.
              </div>
            )}
          </>
        )}

        {/* ── Screens ──────────────────────────────────────────────────────── */}
        {screen === "language" && (
          <LanguageScreen setLang={setLang} setScreen={setScreen} />
        )}

        {screen === "home" && (
          <HomeScreen
            t={t}
            setScreen={setScreen}
            setDept={setDept}
            setFlow={setFlow}      // ✅ FIX: pass setFlow so quick services work
            senior={senior}
          />
        )}

        {screen === "dept" && (
          <DeptScreen
            t={t} dept={dept}
            setScreen={setScreen} setFlow={setFlow}
            senior={senior}
          />
        )}

        {screen === "flow" && renderFlow()}

        {/* ✅ FIX: voter screen — direct route from HomeScreen quick services */}
        {screen === "voter" && (
          <VoterID lang={lang} setScreen={setScreen} />
        )}

        {/* ✅ Aadhaar screen — direct route from HomeScreen quick services */}
        {screen === "aadhaar" && (
          <AadhaarServices lang={lang} setScreen={setScreen} />
        )}

        {/* ── Admin Panel overlay ───────────────────────────────────────────── */}
        {adminOpen && (
          <div style={{ position: "fixed", inset: 0, zIndex: 9999 }}>
            <AdminPanel onClose={() => setAdminOpen(false)} />
          </div>
        )}

        {/* ── Chatbot FAB ──────────────────────────────────────────────────── */}
        {screen !== "language" && !chatOpen && !adminOpen && (
          <button
            onClick={() => setChatOpen(true)}
            style={{
              position: "fixed",
              bottom: "clamp(16px,2.5vw,28px)",
              right: "clamp(16px,2.5vw,28px)",
              width: "clamp(52px,6vw,68px)",
              height: "clamp(52px,6vw,68px)",
              borderRadius: "50%",
              background: "linear-gradient(135deg,#0EA5E9,#7C3AED)",
              border: "none", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 4px 20px rgba(14,165,233,0.5)",
              zIndex: 1000,
              animation: "chatPulse 2.5s ease-in-out infinite",
            }}
            title="AI Assistant"
          >
            <svg width={28} height={28} viewBox="0 0 24 24" fill="white">
              <path d="M20 9V7C20 5.9 19.1 5 18 5H15C15 3.34 13.66 2 12 2C10.34 2 9 3.34 9 5H6C4.9 5 4 5.9 4 7V9C2.34 9 1 10.34 1 12C1 13.66 2.34 15 4 15V19C4 20.1 4.9 21 6 21H18C19.1 21 20 20.1 20 19V15C21.66 15 23 13.66 23 12C23 10.34 21.66 9 20 9ZM18 19H6V7H18V19ZM9 13C8.45 13 8 12.1 8 11C8 9.9 8.45 9 9 9C9.55 9 10 9.9 10 11C10 12.1 9.55 13 9 13ZM15 13C14.45 13 14 12.1 14 11C14 9.9 14.45 9 15 9C15.55 9 16 9.9 16 11C16 12.1 15.55 13 15 13ZM12 17.5C10.57 17.5 9.32 16.78 8.56 15.68L9.85 14.64C10.36 15.19 11.14 15.5 12 15.5C12.86 15.5 13.64 15.19 14.15 14.64L15.44 15.68C14.68 16.78 13.43 17.5 12 17.5Z"/>
            </svg>
          </button>
        )}

        {/* ── Chatbot modal ─────────────────────────────────────────────────── */}
        {chatOpen && (
          <div
            onClick={e => { if (e.target === e.currentTarget) setChatOpen(false); }}
            style={{
              position: "fixed", inset: 0,
              background: "rgba(0,0,0,0.55)",
              zIndex: 1000,
              display: "flex", alignItems: "flex-end", justifyContent: "center",
            }}
          >
            <div style={{
              width: "100%",
              maxWidth: "clamp(340px,55vw,640px)",
              height: "clamp(500px,82vh,800px)",
              borderRadius: "20px 20px 0 0",
              overflow: "hidden",
              boxShadow: "0 -8px 40px rgba(0,0,0,0.3)",
              display: "flex", flexDirection: "column",
            }}>
              <SUVIDHAChatbot lang={lang} onClose={() => setChatOpen(false)} />
            </div>
          </div>
        )}

      </div>
    </>
  );
}