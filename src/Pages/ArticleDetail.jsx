import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import HeroSection from "../components/site/HeroSection";
import ArticleCard from "../components/site/ArticleCard";
import LeafLoader from "../../adminPanel/components/LeafLoader.jsx";
import { useSiteData, applySeo } from "../lib/siteApi";
import { fmtDate } from "../lib/dates";
import "./About.css";

const GOLD = "#d4a017";
const DARK = "#1f2a24";
const heading = { fontFamily: "'Playfair Display', serif", color: DARK };

// /health-articles/:id -> Admin > Articles ke record ka poora content (English / اردو)
export default function ArticleDetail() {
  const { id } = useParams();
  const { data, loading, error } = useSiteData(`articles/${id}`);
  const a = data?.article;
  const [lang, setLang] = useState("en");

  useEffect(() => setLang("en"), [id]);
  useEffect(() => (a ? applySeo({ seoTitle: a.title, seoDesc: (a.excerpt || "").slice(0, 160) }) : undefined), [a]);

  if (loading && !data) return (<><LeafLoader /><div style={{ minHeight: "100vh" }} /></>);

  if (!a) {
    return (
      <section className="bg-white text-center" style={{ padding: "200px 12px 120px" }}>
        <h1 style={{ ...heading, fontSize: 32 }}>{error ? "Article nahi mila" : "Loading..."}</h1>
        <p className="text-secondary">Ye article ab available nahi hai ya link galat hai.</p>
        <Link to="/health-articles" className="btn text-white mt-2" style={{ background: GOLD }}>← Saare articles dekhein</Link>
      </section>
    );
  }

  const hasUr = !!(a.titleUr || a.htmlUr);
  const ur = lang === "ur" && hasUr;
  const body = ur && a.htmlUr ? a.htmlUr : a.html;
  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const share = `https://wa.me/?text=${encodeURIComponent(`${a.title} ${shareUrl}`)}`;

  return (
    <>
      <HeroSection
        image={a.image || "/images/s3.jpg"}
        label={fmtDate(a.date) || "HEALTH ARTICLE"}
        title={a.title}
        height="420px"
      />

      <section className="bg-white py-5">
        <div className="container py-3">
          <article className="mx-auto" style={{ maxWidth: 820 }}>
            <div className="d-flex flex-wrap align-items-center gap-3 mb-4">
              <Link to="/health-articles" className="text-decoration-none small" style={{ color: GOLD, fontFamily: "Inter, sans-serif" }}>
                ← Health Articles
              </Link>
              {hasUr && (
                <div className="ms-auto btn-group btn-group-sm" role="group" aria-label="Language">
                  <button type="button" className={`btn ${lang === "en" ? "btn-dark" : "btn-outline-dark"}`} onClick={() => setLang("en")}>English</button>
                  <button type="button" className={`btn ${lang === "ur" ? "btn-dark" : "btn-outline-dark"}`} onClick={() => setLang("ur")}>اردو</button>
                </div>
              )}
            </div>

            {ur && a.titleUr && (
              <h2 className="fw-bold mb-3" dir="rtl" style={{ ...heading, fontFamily: "'Noto Nastaliq Urdu', serif", fontSize: 30 }}>{a.titleUr}</h2>
            )}

            <div className="about-rich" dir="auto" style={{ fontSize: 16 }} dangerouslySetInnerHTML={{ __html: body || `<p>${a.excerpt}</p>` }} />

            <div className="mt-5 pt-3" style={{ borderTop: "1px solid #e4e1da" }}>
              <a href={share} target="_blank" rel="noreferrer" className="btn text-white fw-semibold btn-sm" style={{ background: "#25d366", fontFamily: "Inter, sans-serif", padding: "8px 18px" }}>
                Share on WhatsApp
              </a>
            </div>
          </article>

          {data.related.length > 0 && (
            <div className="mt-5 pt-4">
              <h2 className="fw-bold text-center mb-4" style={{ ...heading, fontSize: 28 }}>More Articles</h2>
              <div className="row g-4">
                {data.related.map((r) => (
                  <div key={r.id} className="col-12 col-md-6 col-lg-4">
                    <ArticleCard article={{ ...r, link: `/health-articles/${r.id}` }} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
