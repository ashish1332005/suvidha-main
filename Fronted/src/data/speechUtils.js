// ────────────────────────────────────────────────────────────────
// speechUtils.js — Hindi-aware TTS cleaner + voice picker
// FIX: cleanForHindiSpeech no longer deletes all content
// ────────────────────────────────────────────────────────────────

const HINDI_DIGIT_MAP = {
  "0": "शून्य", "1": "एक", "2": "दो", "3": "तीन", "4": "चार",
  "5": "पाँच", "6": "छह", "7": "सात", "8": "आठ", "9": "नौ",
};

function digitsToHindi(numStr) {
  return numStr.split("").map(d => HINDI_DIGIT_MAP[d] || d).join(" ");
}

const HELPLINE_REPLACEMENTS = {
  "1912": "एक नौ एक दो",
  "1906": "एक नौ शून्य छह",
  "112":  "एक एक दो",
  "100":  "एक शून्य शून्य",
  "101":  "एक शून्य एक",
  "108":  "एक शून्य आठ",
  "1091": "एक शून्य नौ एक",
  "1098": "एक शून्य नौ आठ",
  "14555": "एक चार पाँच पाँच पाँच",
  "1800-233-3555": "एक आठ शून्य शून्य दो तीन तीन तीन पाँच पाँच पाँच",
  "1800-180-6127": "एक आठ शून्य शून्य एक आठ शून्य छह एक दो सात",
};

export function cleanForHindiSpeech(text) {
  let s = text || "";

  // Step 1: Replace known helpline numbers with Hindi words FIRST
  for (const [num, word] of Object.entries(HELPLINE_REPLACEMENTS)) {
    s = s.replace(new RegExp(num.replace(/-/g, "-?"), "g"), word);
  }

  // Step 2: Common replacements
  s = s.replace(/24[\s]?[x×][\s]?7/gi, "चौबीस घंटे सातों दिन");
  s = s.replace(/Rs\.?\s*/gi, "रुपए ");

  // Step 3: Remove markdown
  s = s.replace(/\*\*([^*]+)\*\*/g, "$1");
  s = s.replace(/[#*_`~>]/g, "");

  // Step 4: Remove known English abbreviations that hi-IN voice reads badly
  // IMPORTANT: only remove these specific words, NOT all English text
  s = s.replace(/\b(UPI|LPG|OTP|KIOSK|BPL|SMS|ATM|PIN|QR|URL|APP|ID)\b/gi, "");

  // Step 5: Convert step numbers to Hindi words
  const stepWords = ["पहला", "दूसरा", "तीसरा", "चौथा", "पाँचवाँ", "छठा", "सातवाँ"];
  s = s.replace(/\b([1-7])\.\s*/g, (_, n) => (stepWords[parseInt(n) - 1] || n) + " ");

  // Step 6: Convert remaining standalone digits to Hindi
  s = s.replace(/\b(\d+)\b/g, (_, num) => digitsToHindi(num));

  // Step 7: Remove emojis
  s = s.replace(/[\u{1F000}-\u{1FFFF}]/gu, "");
  s = s.replace(/[\u{2600}-\u{27BF}]/gu, "");

  // Step 8: Remove special chars but KEEP Hindi (Devanagari) AND English letters
  // ← KEY FIX: do NOT do s.replace(/[a-zA-Z]/g, " ") anymore
  // English words left over will be read as-is by hi-IN voice (acceptable)
  s = s.replace(/[\/\\|<>{}[\]()@#$%^&+=~]/g, " ");

  // Step 9: Collapse whitespace
  s = s.replace(/\s{2,}/g, " ").trim();

  return s;
}

export function cleanForEnglishSpeech(text) {
  return (text || "")
    .replace(/\*\*/g, "")
    .replace(/[#*_`]/g, "")
    .replace(/[\u{1F000}-\u{1FFFF}]/gu, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function cleanForSpeech(text, lang) {
  if (lang === "hi") return cleanForHindiSpeech(text);
  return cleanForEnglishSpeech(text);
}

/**
 * Pick the best available voice.
 * For Hindi: tries hi-IN first, falls back to any voice (never returns null for Hindi).
 */
export function pickVoice(voices, lang) {
  if (!voices || !voices.length) return null;

  if (lang === "hi") {
    return (
      voices.find(v => v.lang === "hi-IN") ||
      voices.find(v => v.lang?.toLowerCase().startsWith("hi")) ||
      voices.find(v => /hindi/i.test(v.name)) ||
      voices.find(v => v.lang === "en-IN") ||
      voices.find(v => v.lang?.toLowerCase().startsWith("en")) ||
      voices[0] ||
      null
    );
  }

  return (
    voices.find(v => v.lang === "en-IN") ||
    voices.find(v => v.lang?.toLowerCase().startsWith("en")) ||
    voices[0] ||
    null
  );
}