import { useEffect, useState } from "react";
import "../../Pages/About.css";

const GOLD = "#d4a017";
const DARK = "#1f2a24";

// "View Details" popup: poori description (English / اردو), image aur YouTube video (agar admin ne di ho)
export default function TreatmentModal({ treatment, onClose }) {
  const [lang, setLang] = useState("en");
  const t = treatment;

  useEffect(() => {
    if (!t) return undefined;
    setLang("en");
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [t, onClose]);

  if (!t) return null;
  const hasUr = !!(t.titleUr || t.htmlUr);
  const ur = lang === "ur" && hasUr;
  const body = ur ? t.htmlUr : t.html;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t.title}
      onClick={onClose}
      style={{ position: "fixed", inset: 0, zIndex: 2000, background: "rgba(0,0,0,.6)", overflowY: "auto", padding: "40px 12px" }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="mx-auto bg-white rounded-4 overflow-hidden position-relative"
        style={{ maxWidth: 760, boxShadow: "0 12px 40px rgba(0,0,0,.35)" }}
      >
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="btn position-absolute border-0 rounded-circle d-flex align-items-center justify-content-center p-0"
          style={{ top: 12, right: 12, width: 36, height: 36, background: "rgba(255,255,255,.95)", zIndex: 2, fontSize: 20, lineHeight: 1 }}
        >
          ×
        </button>

        {t.image && (
          <div style={{ height: 280, background: "#e9e4d8" }}>
            <img src={t.image} alt={t.title} className="w-100 h-100" style={{ objectFit: "cover" }} />
          </div>
        )}

        <div className="p-4 p-md-5">
          <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
            {t.categories.map((c) => (
              <span key={c} className="text-uppercase" style={{ color: GOLD, fontSize: 11, letterSpacing: "1px", fontFamily: "Jost, sans-serif" }}>
                {c}
              </span>
            ))}
            {hasUr && (
              <div className="ms-auto btn-group btn-group-sm" role="group" aria-label="Language">
                <button type="button" className={`btn ${lang === "en" ? "btn-dark" : "btn-outline-dark"}`} onClick={() => setLang("en")}>English</button>
                <button type="button" className={`btn ${lang === "ur" ? "btn-dark" : "btn-outline-dark"}`} onClick={() => setLang("ur")}>اردو</button>
              </div>
            )}
          </div>

          <h2
            className="fw-bold mb-3"
            dir={ur ? "rtl" : "ltr"}
            style={{ fontFamily: ur ? "'Noto Nastaliq Urdu', serif" : "'Playfair Display', serif", fontSize: 28, color: DARK }}
          >
            {ur && t.titleUr ? t.titleUr : t.title}
          </h2>

          <div className="about-rich" dir="auto" dangerouslySetInnerHTML={{ __html: body || `<p>${t.description}</p>` }} />

          {t.youtubeId ? (
            <div className="ratio ratio-16x9 mt-4 rounded-3 overflow-hidden">
              <iframe
                title={t.title}
                src={`https://www.youtube.com/embed/${t.youtubeId}`}
                allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                loading="lazy"
              />
            </div>
          ) : (
            t.videoUrl && (
              <a href={t.videoUrl} target="_blank" rel="noreferrer" className="d-inline-block mt-4 text-decoration-none" style={{ color: GOLD }}>
                Watch video →
              </a>
            )
          )}
        </div>
      </div>
    </div>
  );
}
