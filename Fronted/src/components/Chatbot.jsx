import { useState, useEffect, useRef } from "react";
import { getAIResponse, isEmergency, SUGGESTIONS } from "../data/aiBrain";
import { cleanForSpeech, pickVoice } from "../data/speechUtils";

const getTime = () =>
  new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

// ─── SVG ICONS ────────────────────────────────────────────────────
const Icon = ({ d, size = 18, color = "currentColor", style = {} }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}
    aria-hidden="true" style={{ display: "block", flexShrink: 0, ...style }}>
    <path d={d} />
  </svg>
);

const PATHS = {
  bot:     "M20 9V7C20 5.9 19.1 5 18 5H15C15 3.34 13.66 2 12 2C10.34 2 9 3.34 9 5H6C4.9 5 4 5.9 4 7V9C2.34 9 1 10.34 1 12C1 13.66 2.34 15 4 15V19C4 20.1 4.9 21 6 21H18C19.1 21 20 20.1 20 19V15C21.66 15 23 13.66 23 12C23 10.34 21.66 9 20 9ZM9 13C8.45 13 8 12.1 8 11C8 9.9 8.45 9 9 9C9.55 9 10 9.9 10 11C10 12.1 9.55 13 9 13ZM15 13C14.45 13 14 12.1 14 11C14 9.9 14.45 9 15 9C15.55 9 16 9.9 16 11C16 12.1 15.55 13 15 13ZM12 17.5C10.57 17.5 9.32 16.78 8.56 15.68L9.85 14.64C10.36 15.19 11.14 15.5 12 15.5C12.86 15.5 13.64 15.19 14.15 14.64L15.44 15.68C14.68 16.78 13.43 17.5 12 17.5Z",
  user:    "M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z",
  mic:     "M12 14C13.66 14 15 12.66 15 11V5C15 3.34 13.66 2 12 2C10.34 2 9 3.34 9 5V11C9 12.66 10.34 14 12 14ZM17.3 11C17.3 14 14.76 16.1 12 16.1C9.24 16.1 6.7 14 6.7 11H5C5 14.41 7.72 17.23 11 17.72V21H13V17.72C16.28 17.23 19 14.41 19 11H17.3Z",
  send:    "M2.01 21L23 12L2.01 3L2 10L17 12L2 14L2.01 21Z",
  speaker: "M3 9V15H7L12 20V4L7 9H3ZM16.5 12C16.5 10.23 15.48 8.71 14 7.97V16.02C15.48 15.29 16.5 13.77 16.5 12ZM14 3.23V5.29C16.89 6.15 19 8.83 19 12C19 15.17 16.89 17.85 14 18.71V20.77C18.01 19.86 21 16.28 21 12C21 7.72 18.01 4.14 14 3.23Z",
  stop:    "M6 6H18V18H6V6Z",
  trash:   "M6 19C6 20.1 6.9 21 8 21H16C17.1 21 18 20.1 18 19V7H6V19ZM19 4H15.5L14.5 3H9.5L8.5 4H5V6H19V4Z",
  close:   "M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z",
  globe:   "M11.99 2C6.47 2 2 6.48 2 12C2 17.52 6.47 22 11.99 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 11.99 2ZM12 4.04C12.83 5.24 13.48 6.57 13.91 8H10.09C10.52 6.57 11.17 5.24 12 4.04ZM4.26 14C4.1 13.36 4 12.69 4 12C4 11.31 4.1 10.64 4.26 10H7.64C7.56 10.66 7.5 11.32 7.5 12C7.5 12.68 7.56 13.34 7.64 14H4.26ZM5.08 16H8.03C8.35 17.25 8.81 18.45 9.41 19.56C7.57 18.93 6.04 17.66 5.08 16ZM8.03 8H5.08C6.04 6.34 7.57 5.07 9.41 4.44C8.81 5.55 8.35 6.75 8.03 8ZM12 19.96C11.17 18.76 10.52 17.43 10.09 16H13.91C13.48 17.43 12.83 18.76 12 19.96ZM14.34 14H9.66C9.57 13.34 9.5 12.68 9.5 12C9.5 11.32 9.57 10.65 9.66 10H14.34C14.43 10.65 14.5 11.32 14.5 12C14.5 12.68 14.43 13.34 14.34 14ZM14.59 19.56C15.19 18.45 15.65 17.25 15.97 16H18.92C17.96 17.65 16.43 18.93 14.59 19.56ZM16.36 14C16.44 13.34 16.5 12.68 16.5 12C16.5 11.32 16.44 10.66 16.36 10H19.74C19.9 10.64 20 11.31 20 12C20 12.69 19.9 13.36 19.74 14H16.36Z",
  alert:   "M12 2L1 21H23L12 2ZM12 6L19.53 19H4.47L12 6ZM11 10V14H13V10H11ZM11 16V18H13V16H11Z",
  phone:   "M6.62 10.79C8.06 13.62 10.38 15.93 13.21 17.38L15.41 15.18C15.68 14.91 16.08 14.82 16.43 14.94C17.55 15.31 18.76 15.51 20 15.51C20.55 15.51 21 15.96 21 16.51V20C21 20.55 20.55 21 20 21C10.61 21 3 13.39 3 4C3 3.45 3.45 3 4 3H7.5C8.05 3 8.5 3.45 8.5 4C8.5 5.25 8.7 6.45 9.07 7.57C9.18 7.92 9.1 8.31 8.82 8.59L6.62 10.79Z",
};

const CHAT_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Mukta:wght@400;500;600;700;800&display=swap');

.cv2-shell{display:flex;flex-direction:column;height:100%;background:#FAFBFC;font-family:'Mukta',sans-serif;border-radius:20px 20px 0 0;overflow:hidden;}
.cv2-hdr{background:#0A2342;padding:0 clamp(14px,2vw,22px);height:clamp(64px,7.5vw,76px);display:flex;align-items:center;justify-content:space-between;flex-shrink:0;border-bottom:3px solid #F97316;gap:12px;}
.cv2-hdr-left{display:flex;align-items:center;gap:12px;flex:1;min-width:0;}
.cv2-avatar{width:clamp(40px,4.5vw,48px);height:clamp(40px,4.5vw,48px);border-radius:12px;background:#F97316;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
.cv2-agent-name{font-size:clamp(14px,1.7vw,17px);font-weight:800;color:#fff;display:flex;align-items:center;gap:8px;}
.cv2-status{font-size:clamp(10px,1.1vw,12px);color:#7FBCD2;display:flex;align-items:center;gap:5px;margin-top:2px;font-weight:600;}
.cv2-online-dot{width:7px;height:7px;border-radius:50%;background:#22C55E;animation:cv2blink 2s infinite;}
@keyframes cv2blink{0%,100%{opacity:1;}50%{opacity:.35;}}
.cv2-wave{display:flex;align-items:flex-end;gap:2px;height:16px;margin-left:4px;}
.cv2-bar{width:3px;border-radius:2px;background:#F97316;animation:cv2wave 1s ease-in-out infinite;}
.cv2-bar:nth-child(1){height:5px;animation-delay:0s;}.cv2-bar:nth-child(2){height:12px;animation-delay:.1s;}.cv2-bar:nth-child(3){height:8px;animation-delay:.2s;}.cv2-bar:nth-child(4){height:16px;animation-delay:.3s;}.cv2-bar:nth-child(5){height:6px;animation-delay:.4s;}
@keyframes cv2wave{0%,100%{transform:scaleY(1);}50%{transform:scaleY(.3);}}
.cv2-hdr-btns{display:flex;gap:6px;align-items:center;flex-shrink:0;}
.cv2-hbtn{height:clamp(34px,4vw,40px);padding:0 clamp(10px,1.2vw,14px);border-radius:8px;border:1.5px solid rgba(255,255,255,.15);background:rgba(255,255,255,.08);color:rgba(255,255,255,.85);font-size:clamp(12px,1.3vw,13px);font-weight:700;cursor:pointer;display:flex;align-items:center;gap:6px;font-family:'Mukta',sans-serif;}
.cv2-hbtn:active{background:rgba(255,255,255,.22);}
.cv2-hbtn.lang-active{background:#fff;color:#0A2342;border-color:#fff;}
.cv2-spkbar{background:#EFF6FF;border-bottom:2px solid #BFDBFE;padding:8px clamp(14px,2vw,22px);display:flex;align-items:center;gap:10px;flex-shrink:0;font-size:clamp(12px,1.3vw,13px);font-weight:700;color:#0284C7;letter-spacing:.02em;text-transform:uppercase;}
.cv2-spk-stop{margin-left:auto;height:28px;padding:0 10px;border:1.5px solid #FECACA;border-radius:6px;background:#FEE2E2;color:#DC2626;font-size:11px;font-weight:800;cursor:pointer;display:flex;align-items:center;gap:5px;text-transform:uppercase;font-family:'Mukta',sans-serif;}
.cv2-msgs{flex:1;overflow-y:auto;padding:clamp(14px,1.8vw,20px);display:flex;flex-direction:column;gap:14px;background:#F0F4F8;}
.cv2-msgs::-webkit-scrollbar{width:4px;}.cv2-msgs::-webkit-scrollbar-thumb{background:#CBD5E1;border-radius:4px;}
.cv2-row{display:flex;gap:10px;align-items:flex-end;}
.cv2-row.user{flex-direction:row-reverse;}
.cv2-av{width:clamp(34px,3.8vw,42px);height:clamp(34px,3.8vw,42px);border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
.cv2-av.bot-av{background:#0A2342;}.cv2-av.usr-av{background:#123561;}
.cv2-bubble-wrap{display:flex;flex-direction:column;max-width:76%;}
.cv2-row.user .cv2-bubble-wrap{align-items:flex-end;}
.cv2-bub{padding:clamp(12px,1.4vw,16px) clamp(14px,1.6vw,18px);border-radius:18px;font-size:clamp(14px,1.55vw,16px);line-height:1.7;word-break:break-word;}
.cv2-bub.bot{background:#fff;color:#0A2342;border:1.5px solid #E2E8F0;border-bottom-left-radius:4px;box-shadow:0 2px 8px rgba(10,35,66,.07);}
.cv2-bub.user{background:#0A2342;color:#fff;border-bottom-right-radius:4px;}
.cv2-bub.emg{background:#FFF5F5;border:2px solid #FECACA;color:#7F1D1D;}
.cv2-emg-banner{background:#FEE2E2;border:1.5px solid #FECACA;border-radius:10px;padding:10px 12px;margin-bottom:12px;}
.cv2-emg-title{font-size:clamp(12px,1.3vw,14px);font-weight:800;color:#DC2626;letter-spacing:.06em;text-transform:uppercase;display:flex;align-items:center;gap:7px;margin-bottom:8px;}
.cv2-emg-nums{display:flex;gap:6px;flex-wrap:wrap;}
.cv2-emg-num{background:#DC2626;color:white;border-radius:6px;padding:4px 10px;font-size:clamp(12px,1.3vw,13px);font-weight:800;display:flex;align-items:center;gap:5px;}
.cv2-listen-btn{background:none;border:none;cursor:pointer;display:flex;align-items:center;gap:5px;margin-top:8px;color:#64748B;font-size:clamp(11px,1.1vw,12px);font-weight:700;text-transform:uppercase;padding:4px 0;font-family:'Mukta',sans-serif;}
.cv2-ts{font-size:11px;color:#94A3B8;margin-top:4px;font-weight:500;}
.cv2-row.user .cv2-ts{text-align:right;}
.cv2-typing{display:flex;gap:5px;align-items:center;padding:14px 18px;}
.cv2-dot{width:8px;height:8px;border-radius:50%;background:#CBD5E1;animation:cv2bounce 1.3s infinite;}
.cv2-dot:nth-child(2){animation-delay:.2s;}.cv2-dot:nth-child(3){animation-delay:.4s;}
@keyframes cv2bounce{0%,80%,100%{transform:translateY(0);}40%{transform:translateY(-8px);}}
.cv2-quick-hd{font-size:clamp(11px,1.2vw,12px);font-weight:700;color:#64748B;letter-spacing:.08em;text-transform:uppercase;margin-bottom:10px;}
.cv2-quick-grid{display:flex;flex-direction:column;gap:7px;}
.cv2-qbtn{background:#fff;border:1.5px solid #E2E8F0;border-left:3px solid #0A2342;border-radius:8px;padding:clamp(10px,1.2vw,13px) clamp(12px,1.5vw,16px);font-size:clamp(13px,1.4vw,15px);font-weight:600;color:#0A2342;cursor:pointer;text-align:left;display:flex;align-items:center;justify-content:space-between;gap:8px;font-family:'Mukta',sans-serif;}
.cv2-qbtn:active{transform:scale(.99);}
.cv2-emg-strip{background:#FEF2F2;border-top:3px solid #DC2626;padding:10px clamp(14px,2vw,22px);display:flex;gap:8px;flex-shrink:0;align-items:center;overflow-x:auto;}
.cv2-emg-strip::-webkit-scrollbar{display:none;}
.cv2-ecrd{display:flex;flex-direction:column;align-items:center;background:white;border:1.5px solid #FECACA;border-radius:10px;padding:6px 14px;flex-shrink:0;min-width:72px;}
.cv2-elbl{font-size:9px;font-weight:800;color:#DC2626;text-transform:uppercase;letter-spacing:.08em;}
.cv2-enum{font-size:clamp(17px,2vw,22px);font-weight:800;color:#DC2626;line-height:1.1;}
.cv2-chips{padding:10px clamp(14px,2vw,22px);display:flex;gap:7px;overflow-x:auto;background:#fff;border-top:1.5px solid #E2E8F0;flex-shrink:0;}
.cv2-chips::-webkit-scrollbar{display:none;}
.cv2-chip{background:#F0F4F8;border:1.5px solid #E2E8F0;color:#334155;padding:7px 13px;border-radius:50px;font-size:clamp(11px,1.2vw,13px);font-weight:600;cursor:pointer;white-space:nowrap;flex-shrink:0;font-family:'Mukta',sans-serif;}
.cv2-chip:active{background:#E0F2FE;}
.cv2-input-row{background:#fff;border-top:2px solid #E2E8F0;padding:clamp(10px,1.3vw,14px) clamp(14px,2vw,22px);display:flex;gap:8px;align-items:flex-end;flex-shrink:0;}
.cv2-ta{flex:1;background:#F0F4F8;border:2px solid #E2E8F0;border-radius:12px;padding:clamp(11px,1.3vw,14px) clamp(14px,1.6vw,16px);color:#0A2342;font-size:clamp(14px,1.55vw,16px);resize:none;outline:none;min-height:clamp(46px,5.5vw,54px);max-height:110px;line-height:1.55;font-weight:500;font-family:'Mukta',sans-serif;transition:border-color .15s;}
.cv2-ta:focus{border-color:#0EA5E9;background:#fff;box-shadow:0 0 0 3px rgba(14,165,233,.12);}
.cv2-ta::placeholder{color:#94A3B8;}
.cv2-ibtn{width:clamp(46px,5.2vw,54px);height:clamp(46px,5.2vw,54px);border-radius:12px;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:opacity .12s;}
.cv2-ibtn:active{transform:scale(.93);}
.cv2-send-btn{background:#0A2342;box-shadow:0 2px 8px rgba(10,35,66,.25);}
.cv2-send-btn:disabled{background:#CBD5E1;box-shadow:none;cursor:not-allowed;}
.cv2-mic-btn{background:#F0F4F8;border:2px solid #E2E8F0;}
.cv2-mic-btn.listening{background:#FEE2E2;border-color:#DC2626;animation:cv2mic 1s infinite;}
@keyframes cv2mic{0%,100%{box-shadow:0 0 0 0 rgba(220,38,38,.3);}50%{box-shadow:0 0 0 8px rgba(220,38,38,0);}}
.cv2-fadein{animation:cv2fade .2s ease forwards;}
@keyframes cv2fade{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:translateY(0);}}

/* Voice warning banner */
.cv2-novoice{background:#FFFBEB;border-bottom:2px solid #FCD34D;padding:8px 16px;font-size:12px;font-weight:600;color:#78350F;flex-shrink:0;display:flex;align-items:center;gap:8px;}
`;

// ── Load voices with retry (Chrome loads them async) ─────────────
function loadVoicesWithRetry(synth, maxWait = 2000) {
  return new Promise((resolve) => {
    if (!synth) return resolve([]);
    const voices = synth.getVoices();
    if (voices && voices.length > 0) return resolve(voices);

    let resolved = false;
    const done = () => {
      if (resolved) return;
      resolved = true;
      resolve(synth.getVoices() || []);
    };

    synth.addEventListener("voiceschanged", done, { once: true });
    setTimeout(done, maxWait);
  });
}

// ── Main Component ────────────────────────────────────────────────
export function SUVIDHAChatbot({ lang = "en", onClose }) {
  const makeInitMsg = (l) => ({
    role: "bot",
    text:
      l === "hi"
        ? "नमस्ते! मैं SUVIDHA AI हूँ।\nबिजली, गैस, नगर पालिका सेवाओं या सरकारी योजनाओं के बारे में पूछें।\nमैं हिंदी और English दोनों में सहायता करता हूँ।"
        : "Hello! I'm SUVIDHA AI — your civic services assistant.\nAsk me about electricity, gas, municipal services, or government schemes.\nI support both Hindi and English.",
    ts: getTime(),
  });

  const [msgs,        setMsgs]        = useState([makeInitMsg(lang)]);
  const [input,       setInput]       = useState("");
  const [loading,     setLoading]     = useState(false);
  const [listening,   setListening]   = useState(false);
  const [speaking,    setSpeaking]    = useState(false);
  const [showEmg,     setShowEmg]     = useState(false);
  const [curLang,     setCurLang]     = useState(lang);
  const [noHiVoice,   setNoHiVoice]  = useState(false); // warn if no Hindi voice

  const bottomRef  = useRef(null);
  const taRef      = useRef(null);
  const recogRef   = useRef(null);
  const synthRef   = useRef(typeof window !== "undefined" ? window.speechSynthesis : null);
  const voicesRef  = useRef([]);
  const voicesLoadedRef = useRef(false);

  // ── Load voices ONCE on mount ──────────────────────────────────
  useEffect(() => {
    const synth = synthRef.current;
    if (!synth) return;

    loadVoicesWithRetry(synth).then((v) => {
      voicesRef.current = v;
      voicesLoadedRef.current = true;

      // Check if any Hindi voice exists
      const hasHi = v.some(
        (x) =>
          x.lang?.toLowerCase().startsWith("hi") ||
          /hindi/i.test(x.name)
      );
      if (!hasHi) setNoHiVoice(true);
    });

    return () => {
      synth.cancel();
      recogRef.current?.stop?.();
    };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, loading]);

  // ── Language switch ────────────────────────────────────────────
  const switchLang = () => {
    synthRef.current?.cancel();
    setSpeaking(false);
    recogRef.current?.stop?.();
    setListening(false);
    const newL = curLang === "en" ? "hi" : "en";
    setCurLang(newL);
    setShowEmg(false);
    setMsgs([makeInitMsg(newL)]);
    setInput("");
  };

  // ── TTS — the FIXED version ────────────────────────────────────
  const speakText = async (text, langOverride) => {
    const synth = synthRef.current;
    if (!synth) return;

    const tLang = langOverride || curLang;
    synth.cancel();

    // Clean text using your speechUtils
    const clean = cleanForSpeech(text, tLang);
    if (!clean || clean.trim().length === 0) return;

    // Make sure voices are loaded
    if (!voicesLoadedRef.current || voicesRef.current.length === 0) {
      voicesRef.current = await loadVoicesWithRetry(synth);
      voicesLoadedRef.current = true;
    }

    const utt = new SpeechSynthesisUtterance(clean);

    // ── CRITICAL: voice selection ──────────────────────────────
    const voice = pickVoice(voicesRef.current, tLang);

    if (voice) {
      utt.voice = voice;
      utt.lang  = voice.lang; // always match lang to chosen voice
    } else {
      // No voice at all — let browser decide
      utt.lang = tLang === "hi" ? "hi-IN" : "en-IN";
    }

    utt.rate   = tLang === "hi" ? 0.82 : 0.90;
    utt.pitch  = 1.0;
    utt.volume = 1.0;

    utt.onstart = () => setSpeaking(true);
    utt.onend   = () => setSpeaking(false);
    utt.onerror = (e) => {
      setSpeaking(false);
      // "interrupted" is normal (user clicked stop), ignore it
      if (e.error !== "interrupted") {
        console.warn("TTS error:", e.error, "| lang:", tLang, "| voice:", voice?.name);
      }
    };

    // Small delay — needed on some browsers to avoid race condition
    setTimeout(() => synth.speak(utt), 80);
  };

  const stopSpeak = () => {
    synthRef.current?.cancel();
    setSpeaking(false);
  };

  // ── Send message ───────────────────────────────────────────────
  const sendMsg = (text) => {
    if (!text.trim() || loading) return;
    const clean = text.trim();
    if (isEmergency(clean)) setShowEmg(true);
    setMsgs((m) => [...m, { role: "user", text: clean, ts: getTime() }]);
    setInput("");
    setLoading(true);
    if (taRef.current) taRef.current.style.height = "auto";

    setTimeout(() => {
      const reply = getAIResponse(clean, curLang);
      const emg   = isEmergency(clean);
      setMsgs((m) => [...m, { role: "bot", text: reply, ts: getTime(), emg }]);
      setLoading(false);
      speakText(reply, curLang);
    }, 450 + Math.random() * 250);
  };

  // ── Mic ────────────────────────────────────────────────────────
  const toggleMic = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      alert("Voice input requires Chrome or Edge browser.");
      return;
    }
    if (listening) {
      recogRef.current?.stop?.();
      setListening(false);
      return;
    }
    const r = new SR();
    r.lang            = curLang === "hi" ? "hi-IN" : "en-IN";
    r.interimResults  = false;
    r.continuous      = false;
    r.onstart  = () => setListening(true);
    r.onend    = () => setListening(false);
    r.onerror  = () => setListening(false);
    r.onresult = (e) => {
      const t = e.results?.[0]?.[0]?.transcript || "";
      setInput(t);
      setTimeout(() => sendMsg(t), 150);
    };
    recogRef.current = r;
    r.start();
  };

  const clearChat = () => {
    synthRef.current?.cancel();
    setSpeaking(false);
    setShowEmg(false);
    setMsgs([makeInitMsg(curLang)]);
    setInput("");
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMsg(input);
    }
  };

  const renderText = (text) =>
    (text || "").split("\n").map((line, i) => {
      if (!line.trim()) return <br key={i} />;
      const parts = line.split(/(\*\*[^*]+\*\*)/g);
      return (
        <div key={i} style={{ marginBottom: 3 }}>
          {parts.map((p, j) =>
            p.startsWith("**") && p.endsWith("**") ? (
              <strong key={j}>{p.slice(2, -2)}</strong>
            ) : (
              <span key={j}>{p}</span>
            )
          )}
        </div>
      );
    });

  const sugs = SUGGESTIONS[curLang] || SUGGESTIONS.en;
  const isHi = curLang === "hi";

  const emergencyNums = [
    { label: isHi ? "राष्ट्रीय" : "Emergency",  num: "112"  },
    { label: isHi ? "बिजली"     : "Electricity", num: "1912" },
    { label: isHi ? "गैस लीक"   : "Gas Leak",    num: "1906" },
  ];

  return (
    <>
      <style>{CHAT_CSS}</style>
      <div className="cv2-shell">

        {/* HEADER */}
        <div className="cv2-hdr">
          <div className="cv2-hdr-left">
            <div className="cv2-avatar">
              <Icon d={PATHS.bot} size={24} color="white" />
            </div>
            <div>
              <div className="cv2-agent-name">
                SUVIDHA AI
                {speaking && (
                  <div className="cv2-wave">
                    {[1,2,3,4,5].map(i => <div key={i} className="cv2-bar" />)}
                  </div>
                )}
              </div>
              <div className="cv2-status">
                <span className="cv2-online-dot" />
                {isHi ? "सक्रिय · हिंदी" : "Active · English"}
              </div>
            </div>
          </div>
          <div className="cv2-hdr-btns">
            <button className="cv2-hbtn lang-active" onClick={switchLang}>
              <Icon d={PATHS.globe} size={14} color="#0A2342" />
              {isHi ? "EN" : "हिं"}
            </button>
            <button className="cv2-hbtn" onClick={clearChat}>
              <Icon d={PATHS.trash} size={15} color="rgba(255,255,255,.7)" />
            </button>
            <button className="cv2-hbtn" onClick={onClose}>
              <Icon d={PATHS.close} size={15} color="rgba(255,255,255,.7)" />
            </button>
          </div>
        </div>

        {/* Speaking bar */}
        {speaking && (
          <div className="cv2-spkbar">
            <div className="cv2-wave" style={{ height: 14 }}>
              {[1,2,3,4,5].map(i => (
                <div key={i} className="cv2-bar" style={{ background: "#0284C7" }} />
              ))}
            </div>
            <span>{isHi ? "बोल रहा है..." : "Speaking..."}</span>
            <button className="cv2-spk-stop" onClick={stopSpeak}>
              <Icon d={PATHS.stop} size={10} color="#DC2626" />
              {isHi ? "रोकें" : "Stop"}
            </button>
          </div>
        )}

        {/* No Hindi voice warning */}
        {noHiVoice && isHi && (
          <div className="cv2-novoice">
            <Icon d={PATHS.alert} size={14} color="#B45309" />
            Hindi voice nahi mili. Chrome Settings &rarr; Languages &rarr; Hindi add karein.
          </div>
        )}

        {/* MESSAGES */}
        <div className="cv2-msgs">
          {msgs.map((m, i) => (
            <div key={i} className={`cv2-row ${m.role} cv2-fadein`}>
              <div className={`cv2-av ${m.role === "bot" ? "bot-av" : "usr-av"}`}>
                <Icon d={m.role === "bot" ? PATHS.bot : PATHS.user} size={18} color="white" />
              </div>
              <div className="cv2-bubble-wrap">
                <div className={`cv2-bub ${m.role} ${m.emg ? "emg" : ""}`}>
                  {m.emg && (
                    <div className="cv2-emg-banner">
                      <div className="cv2-emg-title">
                        <Icon d={PATHS.alert} size={14} color="#DC2626" />
                        {isHi ? "आपातकालीन नंबर" : "Emergency Numbers"}
                      </div>
                      <div className="cv2-emg-nums">
                        {[
                          { l: isHi ? "गैस"       : "Gas",      n: "1906" },
                          { l: isHi ? "बिजली"     : "Elec",     n: "1912" },
                          { l: isHi ? "राष्ट्रीय" : "National", n: "112"  },
                        ].map(e => (
                          <div key={e.n} className="cv2-emg-num">
                            <Icon d={PATHS.phone} size={11} color="white" />
                            {e.l}: {e.n}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {renderText(m.text)}
                  {m.role === "bot" && (
                    <button
                      className="cv2-listen-btn"
                      onClick={() => speakText(m.text, curLang)}
                    >
                      <Icon d={PATHS.speaker} size={13} color="currentColor" />
                      {isHi ? "सुनें" : "Listen"}
                    </button>
                  )}
                </div>
                <div className="cv2-ts">{m.ts}</div>
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {loading && (
            <div className="cv2-row cv2-fadein">
              <div className="cv2-av bot-av">
                <Icon d={PATHS.bot} size={18} color="white" />
              </div>
              <div className="cv2-bubble-wrap">
                <div className="cv2-bub bot">
                  <div className="cv2-typing">
                    <div className="cv2-dot" />
                    <div className="cv2-dot" />
                    <div className="cv2-dot" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Quick suggestions */}
          {msgs.length <= 1 && !loading && (
            <div className="cv2-fadein" style={{ marginTop: 6 }}>
              <div className="cv2-quick-hd">
                {isHi ? "त्वरित प्रश्न" : "Quick Questions"}
              </div>
              <div className="cv2-quick-grid">
                {sugs.map(s => (
                  <button key={s} className="cv2-qbtn" onClick={() => sendMsg(s)}>
                    <span>{s}</span>
                    <Icon
                      d="M10 6L8.59 7.41L13.17 12L8.59 16.59L10 18L16 12L10 6Z"
                      size={14} color="#94A3B8"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Emergency strip */}
        {showEmg && (
          <div className="cv2-emg-strip">
            <Icon d={PATHS.alert} size={18} color="#DC2626" style={{ flexShrink: 0 }} />
            {emergencyNums.map(e => (
              <div key={e.num} className="cv2-ecrd">
                <div className="cv2-elbl">{e.label}</div>
                <div className="cv2-enum">{e.num}</div>
              </div>
            ))}
          </div>
        )}

        {/* Chips */}
        <div className="cv2-chips">
          {sugs.slice(0, 5).map(s => (
            <button key={s} className="cv2-chip" onClick={() => sendMsg(s)}>{s}</button>
          ))}
        </div>

        {/* Input row */}
        <div className="cv2-input-row">
          <textarea
            ref={taRef}
            className="cv2-ta"
            value={input}
            rows={1}
            onChange={e => {
              setInput(e.target.value);
              e.target.style.height = "auto";
              e.target.style.height = Math.min(e.target.scrollHeight, 110) + "px";
            }}
            onKeyDown={handleKey}
            placeholder={
              isHi
                ? "हिंदी या English में प्रश्न लिखें..."
                : "Type your question in Hindi or English..."
            }
          />
          <button
            className={`cv2-ibtn cv2-mic-btn ${listening ? "listening" : ""}`}
            onClick={toggleMic}
            title={listening ? (isHi ? "सुन रहा है..." : "Listening...") : (isHi ? "आवाज़ से पूछें" : "Voice input")}
          >
            <Icon d={PATHS.mic} size={20} color={listening ? "#DC2626" : "#64748B"} />
          </button>
          <button
            className="cv2-ibtn cv2-send-btn"
            onClick={() => sendMsg(input)}
            disabled={!input.trim() || loading}
            title={isHi ? "भेजें" : "Send"}
          >
            {loading ? (
              <div style={{ width: 18, height: 18, border: "2.5px solid rgba(255,255,255,.3)", borderTopColor: "white", borderRadius: "50%", animation: "cv2bounce 0.8s linear infinite" }} />
            ) : (
              <Icon d={PATHS.send} size={18} color="white" />
            )}
          </button>
        </div>

      </div>
    </>
  );
}