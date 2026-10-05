import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

// Form ka saara state (answers, step, language, file) yahan rehta hai - modal ke BAHAR.
// Is liye modal band ho ya side par click ho jaye, data kahin nahi jata.
// Saath hi localStorage mein draft save hota hai taake page refresh / browser band hone par bhi bacha rahe.

const STORAGE_KEY = "hikmat_consultation_draft_v1";
const MAX_AGE_MS = 1000 * 60 * 60 * 24 * 30; // 30 din baad purana draft khud hat jaye

const ConsultationContext = createContext(null);

function loadDraft() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const draft = JSON.parse(raw);
    if (!draft || Date.now() - (draft.savedAt || 0) > MAX_AGE_MS) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return draft;
  } catch {
    return null;
  }
}

export function ConsultationProvider({ children }) {
  // Draft sirf ek baar (pehle render par) parha jata hai
  const [draft] = useState(loadDraft);

  const [lang, setLang] = useState(draft?.lang ?? null); // null = abhi language nahi chuni
  const [step, setStep] = useState(draft?.step ?? 0);
  const [data, setData] = useState(draft?.data ?? {});
  const [file, setFile] = useState(null); // File object localStorage mein save nahi ho sakta
  const [submitted, setSubmitted] = useState(false);
  const [restored, setRestored] = useState(() => {
    const d = draft?.data;
    return !!d && Object.keys(d).length > 0;
  });
  const [modalOpen, setModalOpen] = useState(false);

  // Har change ke baad thora ruk kar save (typing par baar baar write na ho)
  useEffect(() => {
    if (submitted) return;
    const id = setTimeout(() => {
      try {
        const hasData = Object.keys(data).length > 0;
        if (!hasData && lang === null && step === 0) {
          localStorage.removeItem(STORAGE_KEY);
          return;
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ lang, step, data, savedAt: Date.now() }));
      } catch {
        /* storage full / private mode - ignore */
      }
    }, 250);
    return () => clearTimeout(id);
  }, [lang, step, data, submitted]);

  // Tab band hone se bilkul pehle bhi flush kar do
  const latest = useRef({ lang, step, data, submitted });
  useEffect(() => {
    latest.current = { lang, step, data, submitted };
  }, [lang, step, data, submitted]);
  useEffect(() => {
    const flush = () => {
      const s = latest.current;
      if (s.submitted) return;
      try {
        if (Object.keys(s.data).length || s.lang) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify({ lang: s.lang, step: s.step, data: s.data, savedAt: Date.now() }));
        }
      } catch {
        /* ignore */
      }
    };
    const onVisibility = () => document.visibilityState === "hidden" && flush();
    window.addEventListener("pagehide", flush);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("pagehide", flush);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  const setField = useCallback((name, value) => {
    setData((d) => ({ ...d, [name]: value }));
  }, []);

  const clearDraft = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }, []);

  const reset = useCallback(() => {
    clearDraft();
    setData({});
    setFile(null);
    setStep(0);
    setLang(null);
    setSubmitted(false);
    setRestored(false);
  }, [clearDraft]);

  const markSubmitted = useCallback(() => {
    clearDraft(); // submit ho gaya to draft ki zaroorat nahi
    setSubmitted(true);
  }, [clearDraft]);

  const value = useMemo(
    () => ({
      lang, setLang, step, setStep, data, setField, file, setFile,
      submitted, markSubmitted, restored, dismissRestored: () => setRestored(false),
      reset, modalOpen,
      openModal: () => setModalOpen(true),
      // close sirf window band karta hai - data nahi mitata
      closeModal: () => setModalOpen(false),
    }),
    [lang, step, data, setField, file, submitted, markSubmitted, restored, reset, modalOpen]
  );

  return <ConsultationContext.Provider value={value}>{children}</ConsultationContext.Provider>;
}

export function useConsultation() {
  const ctx = useContext(ConsultationContext);
  if (!ctx) throw new Error("useConsultation must be used inside <ConsultationProvider>");
  return ctx;
}
