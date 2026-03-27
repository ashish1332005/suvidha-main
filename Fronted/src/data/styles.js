export const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;500;600;700&family=Noto+Sans+Devanagari:wght@400;500;600;700&family=Poppins:wght@600;700;800&display=swap');

/* ─── RESET ─────────────────────────────────────────────── */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { -webkit-text-size-adjust: 100%; font-size: 16px; }
body { background: #F0F4F8; font-family: 'Noto Sans', 'Noto Sans Devanagari', sans-serif; color: #0A2342; }
* { -webkit-tap-highlight-color: transparent; }

/* ─── TOKENS ─────────────────────────────────────────────── */
:root {
  --navy:      #0A2342;
  --navy-mid:  #123561;
  --blue:      #0EA5E9;
  --blue-dk:   #0284C7;
  --blue-lt:   #E0F2FE;
  --orange:    #F97316;
  --orange-dk: #EA6C08;
  --orange-lt: #FFF3E8;
  --green:     #16A34A;
  --green-lt:  #DCFCE7;
  --red:       #DC2626;
  --red-lt:    #FEE2E2;
  --amber:     #D97706;
  --purple:    #7C3AED;
  --purple-lt: #EDE9FE;
  --slate:     #64748B;
  --border:    #CBD5E1;
  --bg:        #F0F4F8;
  --surface:   #FFFFFF;
  --font-body: 'Noto Sans', 'Noto Sans Devanagari', sans-serif;
  --font-head: 'Poppins', 'Noto Sans Devanagari', sans-serif;
  --r:         12px;
  --r-lg:      18px;
  --r-xl:      24px;
  --shadow:    0 1px 4px rgba(10,35,66,.08), 0 4px 12px rgba(10,35,66,.06);
  --shadow-md: 0 2px 8px rgba(10,35,66,.10), 0 8px 24px rgba(10,35,66,.08);
}

/* ─── LAYOUT ─────────────────────────────────────────────── */
.shell { font-family: var(--font-body); background: var(--bg); min-height: 100vh; display: flex; flex-direction: column; }
.wrap  { width: 100%; padding: 24px 16px 48px; }
@media(min-width:600px)  { .wrap { padding: 28px 24px 56px; max-width: 720px; margin: 0 auto; } }
@media(min-width:1024px) { .wrap { max-width: 980px; padding: 32px 36px 64px; } }
@media(min-width:1280px) { .wrap { max-width: 1200px; padding: 36px 56px 72px; } }

/* ─── TOPBAR ─────────────────────────────────────────────── */
.topbar {
  background: var(--navy);
  height: clamp(60px, 7vw, 76px);
  padding: 0 clamp(16px,2.5vw,40px);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-shrink: 0;
  border-bottom: 4px solid var(--orange);
}
.topbar-brand { display: flex; align-items: center; gap: 12px; }
.topbar-logo-box {
  background: var(--orange);
  border-radius: 8px;
  height: 40px;
  padding: 0 14px;
  display: flex;
  align-items: center;
  gap: 8px;
}
.topbar-logo-text {
  font-family: var(--font-head);
  font-size: clamp(16px,2vw,22px);
  font-weight: 800;
  color: white;
  letter-spacing: .06em;
}
.topbar-org { color: #5E81A8; font-size: clamp(10px,1.1vw,12px); font-weight: 500; letter-spacing: .03em; }
.topbar-actions { display: flex; gap: clamp(6px,1vw,10px); align-items: center; }

/* ─── TOP BUTTONS ────────────────────────────────────────── */
.tbtn {
  height: clamp(40px,4.8vw,48px);
  padding: 0 clamp(12px,1.5vw,18px);
  border-radius: var(--r);
  border: 1.5px solid rgba(255,255,255,.15);
  background: rgba(255,255,255,.08);
  color: rgba(255,255,255,.9);
  font-family: var(--font-body);
  font-size: clamp(13px,1.4vw,15px);
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 7px;
  white-space: nowrap;
  flex-shrink: 0;
}
.tbtn:active { background: rgba(255,255,255,.18); }
.tbtn.senior-active { background: var(--orange); border-color: var(--orange); color: white; }
.tbtn.lang { background: white; color: var(--navy); border-color: white; font-weight: 800; font-size: clamp(13px,1.5vw,16px); }
.tbtn.lang:active { background: #EFF6FF; }
.tbtn.home-btn { background: rgba(14,165,233,.2); border-color: var(--blue); color: #7DD3FC; }
.tbtn.home-btn:active { background: rgba(14,165,233,.35); }

/* ─── TICKER ─────────────────────────────────────────────── */
.ticker {
  background: #071729;
  height: 36px;
  padding: 0 clamp(16px,2.5vw,40px);
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
  overflow: hidden;
}
.ticker-live {
  background: var(--red);
  color: white;
  font-family: var(--font-head);
  font-size: 10px;
  font-weight: 700;
  letter-spacing: .12em;
  padding: 2px 8px;
  border-radius: 4px;
  flex-shrink: 0;
}
.ticker-text { color: #F59E0B; font-size: clamp(12px,1.3vw,13px); font-weight: 500; white-space: nowrap; }

/* ─── IDLE WARNING ───────────────────────────────────────── */
.idle-warn {
  background: #FFFBEB;
  border-bottom: 3px solid var(--amber);
  padding: 10px clamp(16px,2.5vw,40px);
  font-size: clamp(13px,1.5vw,15px);
  color: #78350F;
  font-weight: 600;
  text-align: center;
  flex-shrink: 0;
}

/* ─── SECTION HEADER ─────────────────────────────────────── */
.sect-hdr {
  background: var(--surface);
  border-bottom: 4px solid var(--acc, var(--blue));
  padding: clamp(16px,2vw,24px) clamp(16px,2.5vw,40px);
  flex-shrink: 0;
}
.back-btn {
  background: none;
  border: none;
  color: var(--slate);
  cursor: pointer;
  font-family: var(--font-body);
  font-size: clamp(14px,1.5vw,16px);
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 14px;
  padding: 6px 0;
}
.back-btn:active { color: var(--navy); }
.sect-title {
  display: flex;
  align-items: center;
  gap: 14px;
}
.sect-icon {
  width: clamp(44px,5vw,56px);
  height: clamp(44px,5vw,56px);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.sect-name {
  font-family: var(--font-head);
  font-size: clamp(18px,2.2vw,26px);
  font-weight: 700;
  color: var(--navy);
  line-height: 1.2;
}

/* ─── STEP PROGRESS ──────────────────────────────────────── */
.step-bar { display: flex; gap: 6px; margin-top: 16px; }
.step-seg { flex: 1; height: 5px; border-radius: 3px; background: var(--border); transition: background .3s; }
.step-seg.on { background: var(--acc, var(--blue)); }

/* ─── BUTTONS ────────────────────────────────────────────── */
.btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 100%;
  min-height: clamp(56px,6.5vw,66px);
  padding: 0 28px;
  border: none;
  border-radius: var(--r);
  cursor: pointer;
  font-family: var(--font-body);
  font-size: clamp(16px,1.9vw,19px);
  font-weight: 700;
  letter-spacing: .01em;
}
.btn:active { transform: scale(.985); opacity: .9; }
.btn-primary { background: var(--acc, var(--blue)); color: white; box-shadow: var(--shadow); }
.btn-success { background: var(--green); color: white; box-shadow: var(--shadow); }
.btn-danger  { background: var(--red);   color: white; box-shadow: var(--shadow); }
.btn-ghost   { background: var(--surface); color: var(--navy); border: 2px solid var(--border); box-shadow: var(--shadow); }
.btn-ghost:active { background: #F8FAFC; }
.btn-outline-orange { background: transparent; color: var(--orange); border: 2px solid var(--orange); }

/* ─── INPUT ──────────────────────────────────────────────── */
.inp {
  width: 100%;
  min-height: clamp(54px,6vw,62px);
  padding: 0 18px;
  border: 2px solid var(--border);
  border-radius: var(--r);
  font-family: var(--font-body);
  font-size: clamp(16px,1.8vw,18px);
  color: var(--navy);
  background: var(--surface);
  outline: none;
  transition: border-color .15s, box-shadow .15s;
  -webkit-appearance: none;
}
.inp:focus { border-color: var(--blue); box-shadow: 0 0 0 4px rgba(14,165,233,.15); background: white; }
.inp::placeholder { color: #94A3B8; }
textarea.inp { min-height: 110px; padding: 16px 18px; resize: none; line-height: 1.65; }

/* ─── FORM GROUP ─────────────────────────────────────────── */
.fgrp { margin-bottom: clamp(16px,2vw,22px); }
.fl {
  display: block;
  font-size: clamp(12px,1.3vw,14px);
  font-weight: 700;
  color: var(--slate);
  margin-bottom: 8px;
  letter-spacing: .06em;
  text-transform: uppercase;
}

/* ─── CARD ───────────────────────────────────────────────── */
.card {
  background: var(--surface);
  border: 1.5px solid var(--border);
  border-radius: var(--r-lg);
  padding: clamp(16px,2vw,24px);
  box-shadow: var(--shadow);
}
.rrow {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: clamp(10px,1.3vw,14px) 0;
  border-bottom: 1px solid #F1F5F9;
  gap: 12px;
}
.rrow:last-child { border-bottom: none; }
.rrow-label { font-size: clamp(13px,1.4vw,15px); color: var(--slate); font-weight: 500; flex-shrink: 0; }
.rrow-value { font-size: clamp(14px,1.5vw,16px); color: var(--navy); font-weight: 600; text-align: right; }

/* ─── TYPOGRAPHY ─────────────────────────────────────────── */
.lbl {
  font-size: clamp(11px,1.1vw,12px);
  font-weight: 700;
  letter-spacing: .09em;
  text-transform: uppercase;
  color: var(--slate);
}
.cap { font-size: clamp(13px,1.4vw,15px); color: var(--slate); }
.amount-display {
  font-family: var(--font-head);
  font-size: clamp(30px,4.5vw,48px);
  font-weight: 800;
  letter-spacing: -.02em;
  line-height: 1;
}
.page-heading {
  font-family: var(--font-head);
  font-size: clamp(20px,2.8vw,32px);
  font-weight: 700;
  color: var(--navy);
  letter-spacing: -.01em;
  line-height: 1.2;
}
.page-sub { font-size: clamp(14px,1.5vw,16px); color: var(--slate); line-height: 1.5; margin-top: 6px; }

/* ─── DEPT GRID ──────────────────────────────────────────── */
.dept-grid { display: grid; grid-template-columns: 1fr 1fr; gap: clamp(12px,1.8vw,20px); }
@media(min-width:1024px) { .dept-grid { grid-template-columns: repeat(4,1fr); } }

/* ─── DEPT CARD ──────────────────────────────────────────── */
.dept-card {
  background: var(--surface);
  border: 2px solid var(--border);
  border-radius: var(--r-xl);
  padding: clamp(20px,2.8vw,36px) clamp(16px,2vw,24px);
  cursor: pointer;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: clamp(12px,1.4vw,18px);
  box-shadow: var(--shadow);
  transition: box-shadow .12s, border-color .12s;
  position: relative;
  overflow: hidden;
}
.dept-card:active { box-shadow: var(--shadow-md); transform: scale(.98); }
.dept-card-top-bar {
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 5px;
}
.dept-icon-box {
  width: clamp(60px,7.5vw,84px);
  height: clamp(60px,7.5vw,84px);
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.dept-card-name {
  font-family: var(--font-head);
  font-size: clamp(15px,1.9vw,22px);
  font-weight: 700;
  color: var(--navy);
  line-height: 1.2;
}
.dept-card-sub { font-size: clamp(11px,1.1vw,13px); color: var(--slate); line-height: 1.5; }

/* ─── MENU GRID ──────────────────────────────────────────── */
.menu-grid { display: grid; grid-template-columns: 1fr; gap: 10px; }
@media(min-width:600px)  { .menu-grid { grid-template-columns: 1fr 1fr; } }
@media(min-width:1024px) { .menu-grid { grid-template-columns: 1fr 1fr 1fr; } }

/* ─── MENU ITEM ──────────────────────────────────────────── */
.mi {
  display: flex;
  align-items: center;
  gap: 14px;
  min-height: clamp(68px,7.5vw,82px);
  padding: clamp(14px,1.8vw,20px) clamp(16px,1.8vw,22px);
  border: 2px solid var(--border);
  border-radius: var(--r-lg);
  background: var(--surface);
  cursor: pointer;
  text-align: left;
  font-family: var(--font-body);
  box-shadow: var(--shadow);
  transition: box-shadow .1s;
  position: relative;
}
.mi:active { box-shadow: var(--shadow-md); transform: scale(.99); }
.mi.em { background: #FFF5F5; border-color: #FCA5A5; border-left: 5px solid var(--red); }
.mi-icon-box {
  width: clamp(44px,5vw,54px);
  height: clamp(44px,5vw,54px);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.mi-label { font-size: clamp(15px,1.7vw,18px); font-weight: 600; color: var(--navy); flex: 1; line-height: 1.3; }
.mi.em .mi-label { color: var(--red); font-weight: 700; }
.mi-chevron { color: var(--border); flex-shrink: 0; }

/* ─── PAYMENT OPTION ─────────────────────────────────────── */
.po {
  display: flex;
  align-items: center;
  gap: 16px;
  min-height: clamp(68px,7.5vw,80px);
  padding: clamp(14px,1.8vw,20px);
  border: 2.5px solid var(--border);
  border-radius: var(--r-lg);
  background: var(--surface);
  cursor: pointer;
  margin-bottom: 12px;
  box-shadow: var(--shadow);
}
.po.selected { border-color: var(--acc, var(--blue)); background: var(--blue-lt); }
.po:active { transform: scale(.99); }
.po-icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.po-name { font-size: clamp(15px,1.7vw,18px); font-weight: 700; color: var(--navy); }
.po-sub  { font-size: clamp(12px,1.3vw,14px); color: var(--slate); margin-top: 2px; }
.radio-circle { width: 24px; height: 24px; border-radius: 50%; border: 2.5px solid var(--border); display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-left: auto; }
.radio-circle.on { border-color: var(--acc, var(--blue)); background: var(--acc, var(--blue)); }
.radio-dot { width: 10px; height: 10px; border-radius: 50%; background: white; }

/* ─── COMPLAINT TYPE BUTTON ──────────────────────────────── */
.cb {
  width: 100%;
  min-height: clamp(56px,6vw,66px);
  padding: 0 18px;
  border: 2px solid var(--border);
  border-radius: var(--r);
  background: var(--surface);
  font-family: var(--font-body);
  font-size: clamp(15px,1.7vw,17px);
  color: var(--navy);
  cursor: pointer;
  text-align: left;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: var(--shadow);
}
.cb.selected { border-color: var(--acc, var(--blue)); background: var(--blue-lt); color: var(--blue-dk); font-weight: 700; }
.cb:active { transform: scale(.99); }
.cb-check {
  width: 22px; height: 22px; border-radius: 50%;
  border: 2px solid var(--border);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.cb.selected .cb-check { background: var(--acc, var(--blue)); border-color: var(--acc, var(--blue)); }

/* ─── STATUS ICON ────────────────────────────────────────── */
.sico {
  width: clamp(72px,9vw,100px);
  height: clamp(72px,9vw,100px);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto clamp(16px,2vw,24px);
}

/* ─── SPINNER ────────────────────────────────────────────── */
.spin {
  width: clamp(48px,6vw,64px);
  height: clamp(48px,6vw,64px);
  border: 4px solid var(--border);
  border-top-color: var(--acc, var(--blue));
  border-radius: 50%;
  animation: kspin .8s linear infinite;
  margin: 0 auto 24px;
}

/* ─── LANGUAGE SCREEN ────────────────────────────────────── */
.lang-screen {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: var(--navy);
  padding: 32px 20px;
  position: relative;
  overflow: hidden;
}
.lang-screen::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 6px;
  background: linear-gradient(90deg, #FF9933 33.33%, white 33.33%, white 66.66%, #138808 66.66%);
}
.lang-screen::after {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse 80% 60% at 50% 30%, rgba(14,165,233,.12) 0%, transparent 70%);
  pointer-events: none;
}
.lang-card {
  background: rgba(255,255,255,.06);
  border: 2px solid rgba(255,255,255,.14);
  border-radius: 20px;
  padding: clamp(28px,4vw,48px) clamp(40px,6vw,72px);
  cursor: pointer;
  text-align: center;
  min-width: clamp(160px,22vw,240px);
  transition: background .12s, border-color .12s;
  position: relative;
  z-index: 1;
}
.lang-card:active { background: rgba(14,165,233,.2); border-color: var(--blue); transform: scale(.98); }
.lang-flag { font-size: clamp(32px,5vw,48px); display: block; margin-bottom: 14px; }
.lang-name { font-family: var(--font-head); font-size: clamp(20px,2.8vw,30px); font-weight: 700; color: white; }
.lang-hint { font-size: clamp(12px,1.3vw,14px); color: #94A3B8; margin-top: 6px; }
.lang-divider { width: 2px; height: clamp(60px,8vw,100px); background: rgba(255,255,255,.1); border-radius: 1px; }

/* ─── HELPLINE PILL ──────────────────────────────────────── */
.h-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: clamp(7px,1vw,10px) clamp(14px,1.6vw,20px);
  border-radius: 50px;
  font-size: clamp(12px,1.3vw,14px);
  font-weight: 700;
  white-space: nowrap;
  letter-spacing: .02em;
}

/* ─── NOTICE BOX ─────────────────────────────────────────── */
.notice {
  border-radius: var(--r);
  padding: clamp(12px,1.5vw,16px) clamp(14px,1.8vw,18px);
  font-size: clamp(13px,1.4vw,15px);
  display: flex;
  align-items: flex-start;
  gap: 10px;
  line-height: 1.55;
}
.notice-warn  { background: #FFFBEB; border: 1.5px solid #FDE68A; color: #78350F; }
.notice-info  { background: #EFF6FF; border: 1.5px solid #BFDBFE; color: #1E40AF; }
.notice-emg   { background: var(--red-lt); border: 1.5px solid #FCA5A5; color: #7F1D1D; }

/* ─── CHATBOT ─────────────────────────────────────────────── */
.chat-shell {
  display: flex; flex-direction: column;
  height: 100%;
  background: #F7F9FC;
  font-family: var(--font-body);
  border-radius: 20px 20px 0 0;
  overflow: hidden;
}
.chat-hdr {
  background: var(--navy);
  padding: 14px 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
  border-bottom: 4px solid var(--orange);
}
.chat-agent-av {
  width: 42px; height: 42px;
  border-radius: 12px;
  background: var(--orange);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.chat-agent-name { font-family: var(--font-head); font-size: clamp(15px,1.8vw,18px); font-weight: 700; color: white; }
.chat-status { font-size: 12px; color: #7FBCD2; display: flex; align-items: center; gap: 5px; margin-top: 3px; }
.online-dot { width: 7px; height: 7px; border-radius: 50%; background: #22C55E; flex-shrink: 0; animation: blink 2s infinite; }
@keyframes blink { 0%,100%{opacity:1;}50%{opacity:.4;} }

.chat-hdr-btns { display: flex; gap: 6px; }
.chat-hdr-btn {
  height: 36px; padding: 0 12px;
  border-radius: 8px;
  border: 1.5px solid rgba(255,255,255,.15);
  background: rgba(255,255,255,.08);
  color: rgba(255,255,255,.85);
  font-family: var(--font-body);
  font-size: 13px; font-weight: 600;
  cursor: pointer; display: flex; align-items: center; gap: 6px;
}
.chat-hdr-btn:active { background: rgba(255,255,255,.18); }
.chat-hdr-btn.lang { background: white; color: var(--navy); border-color: white; font-weight: 800; }

.chat-msgs {
  flex: 1; overflow-y: auto;
  padding: 16px; display: flex; flex-direction: column; gap: 12px;
  background: #F0F4F8;
}
.chat-msgs::-webkit-scrollbar { width: 4px; }
.chat-msgs::-webkit-scrollbar-thumb { background: var(--border); border-radius: 4px; }

.cmsg-row { display: flex; gap: 10px; align-items: flex-end; }
.cmsg-row.user { flex-direction: row-reverse; }

.cav {
  width: clamp(34px,4vw,42px); height: clamp(34px,4vw,42px);
  border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.cav-bot { background: var(--orange); }
.cav-user { background: var(--navy-mid); }

.cbub {
  max-width: 76%;
  padding: clamp(12px,1.5vw,16px) clamp(14px,1.7vw,18px);
  border-radius: 18px;
  font-size: clamp(14px,1.6vw,16px);
  line-height: 1.65;
  word-break: break-word;
}
.cbub.bot {
  background: white;
  color: var(--navy);
  border-bottom-left-radius: 4px;
  border: 1.5px solid var(--border);
  box-shadow: var(--shadow);
}
.cbub.user {
  background: var(--navy);
  color: white;
  border-bottom-right-radius: 4px;
  box-shadow: var(--shadow);
}
.cbub.emg { background: #FFF5F5; border: 2px solid #FCA5A5; color: #7F1D1D; }
.cbub strong { color: var(--blue-dk); font-weight: 700; }
.cbub.user strong { color: #93C5FD; }
.cbub.emg strong { color: var(--red); }

.ctime { font-size: 11px; color: #94A3B8; margin-top: 4px; }
.cmsg-row.user .ctime { text-align: right; }

.tdot { width: 8px; height: 8px; border-radius: 50%; background: #94A3B8; animation: tbounce 1.2s infinite; }
.tdot:nth-child(2){animation-delay:.2s;}
.tdot:nth-child(3){animation-delay:.4s;}
@keyframes tbounce{0%,80%,100%{transform:translateY(0);}40%{transform:translateY(-8px);}}

.emg-strip {
  background: #FFF5F5; border-top: 3px solid var(--red);
  padding: 10px 16px; display: flex; justify-content: space-around;
  flex-shrink: 0; gap: 8px;
}
.emg-card { text-align: center; padding: 6px 12px; background: white; border-radius: 10px; border: 1.5px solid #FCA5A5; flex: 1; }
.emg-label { font-size: 10px; font-weight: 700; color: var(--red); text-transform: uppercase; letter-spacing: .06em; margin-bottom: 2px; }
.emg-num   { font-family: var(--font-head); font-size: clamp(18px,2.2vw,24px); font-weight: 800; color: var(--red); line-height: 1; }

.chip-row { padding: 10px 14px; display: flex; gap: 7px; overflow-x: auto; background: white; border-top: 1.5px solid var(--border); flex-shrink: 0; }
.chip-row::-webkit-scrollbar { display: none; }
.chip { background: #EFF6FF; border: 1.5px solid #BFDBFE; color: var(--blue-dk); padding: 8px 14px; border-radius: 50px; font-size: clamp(12px,1.3vw,14px); font-weight: 600; cursor: pointer; white-space: nowrap; font-family: var(--font-body); flex-shrink: 0; }
.chip:active { background: #BFDBFE; }

.cinput-row { background: white; border-top: 2px solid var(--border); padding: 12px 14px; display: flex; gap: 8px; align-items: flex-end; flex-shrink: 0; }
.cta { flex: 1; background: #F0F4F8; border: 2px solid var(--border); border-radius: var(--r); padding: 12px 16px; color: var(--navy); font-family: var(--font-body); font-size: clamp(14px,1.6vw,16px); resize: none; outline: none; min-height: 50px; max-height: 110px; transition: border-color .15s; line-height: 1.5; }
.cta:focus { border-color: var(--blue); background: white; }
.cta::placeholder { color: #94A3B8; }
.cibtn { width: clamp(46px,5.5vw,54px); height: clamp(46px,5.5vw,54px); border-radius: var(--r); border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.cibtn:active { transform: scale(.93); }
.csend { background: var(--navy); box-shadow: var(--shadow); }
.csend:disabled { background: var(--border); box-shadow: none; cursor: not-allowed; }
.cmic { background: #F0F4F8; border: 2px solid var(--border); }
.cmic.listening { background: var(--red-lt); border-color: var(--red); animation: micP 1s infinite; }
@keyframes micP{0%,100%{box-shadow:0 0 0 0 rgba(220,38,38,.3);}50%{box-shadow:0 0 0 8px rgba(220,38,38,0);}}

.spk-bar { background: #EFF6FF; border-top: 2px solid #BFDBFE; padding: 8px 18px; display: flex; align-items: center; gap: 10px; font-size: 13px; color: var(--blue-dk); font-weight: 600; flex-shrink: 0; }
.wave-bar { display: inline-block; width: 3px; border-radius: 2px; background: var(--blue); margin: 0 1px; animation: wv 1s ease-in-out infinite; }
.wave-bar:nth-child(1){height:8px;animation-delay:0s;}
.wave-bar:nth-child(2){height:16px;animation-delay:.1s;}
.wave-bar:nth-child(3){height:12px;animation-delay:.2s;}
.wave-bar:nth-child(4){height:20px;animation-delay:.3s;}
.wave-bar:nth-child(5){height:10px;animation-delay:.4s;}
@keyframes wv{0%,100%{transform:scaleY(1);}50%{transform:scaleY(.35);}}

/* ─── AI FAB BUTTON ──────────────────────────────────────── */
.ai-fab {
  position: fixed;
  bottom: clamp(20px,3vw,32px);
  right: clamp(20px,3vw,32px);
  background: var(--orange);
  border: none;
  border-radius: 18px;
  height: clamp(56px,6.5vw,68px);
  padding: 0 clamp(16px,2vw,24px);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  box-shadow: 0 4px 20px rgba(249,115,22,.4), 0 8px 32px rgba(249,115,22,.2);
  z-index: 1000;
}
.ai-fab:active { transform: scale(.96); box-shadow: 0 2px 10px rgba(249,115,22,.4); }
.ai-fab-text { font-family: var(--font-head); font-size: clamp(13px,1.5vw,15px); font-weight: 700; color: white; letter-spacing: .02em; white-space: nowrap; }

/* ─── ANIMATIONS ─────────────────────────────────────────── */
.kfa { animation: kfadeUp .22s ease forwards; }
@keyframes kfadeUp { from{opacity:0;transform:translateY(10px);}to{opacity:1;transform:translateY(0);} }
@keyframes kspin { from{transform:rotate(0deg);}to{transform:rotate(360deg);} }

/* ─── SCROLLBAR ──────────────────────────────────────────── */
::-webkit-scrollbar { width: 4px; }
::-webkit-scrollbar-thumb { background: var(--border); border-radius: 4px; }

/* ─── SENIOR MODE ────────────────────────────────────────── */
.senior-mode .dept-card-name,
.senior-mode .mi-label,
.senior-mode .btn,
.senior-mode .inp,
.senior-mode .cbub,
.senior-mode .page-heading { font-size: 120% !important; }

/* ─── HELPLINE SCREEN ROW ────────────────────────────────── */
.h-row {
  background: var(--surface);
  border: 2px solid var(--border);
  border-radius: var(--r-lg);
  padding: clamp(14px,1.8vw,20px) clamp(16px,2vw,24px);
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: var(--shadow);
}
.h-dept { font-size: clamp(14px,1.6vw,17px); color: var(--navy); font-weight: 600; }
.h-num  { font-family: var(--font-head); font-size: clamp(20px,2.4vw,28px); font-weight: 800; letter-spacing: .02em; }
`;