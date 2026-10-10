import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import ArticleCard from "../components/site/ArticleCard";
import FeaturedProducts from "../components/site/FeaturedProducts";
import LeafLoader from "../../adminPanel/components/LeafLoader.jsx";
import { useSiteData, loadSite, applySeo } from "../lib/siteApi";
import { fmtDate } from "../lib/dates";
import "./ArticleDetail.css";

const GOLD = "#d4a017";
const DARK = "#1f2a24";
const heading = { fontFamily: "'Playfair Display', serif", color: DARK };

// Banner: article ki apni image (Admin > Articles mein add ki hui) poori chaudai mein, neeche gradient;
// date (calendar icon ke saath) left par aur title beech mein, article ke column ki chaudai (820px) mein.
function ArticleHero({ image, date, title }) {
  const bg = image ? `url("${String(image).replace(/"/g, "%22")}")` : "none"; // quotes: naam mein space/bracket ho tab bhi image aaye
  return (
    <section
      className="position-relative d-flex align-items-end overflow-hidden border-top border-3"
      style={{ minHeight: "min(520px, 75vh)", backgroundColor: "#0d1410", backgroundImage: bg, backgroundSize: "cover", backgroundPosition: "center", borderColor: "#b8892b" }}
    >
      <div
        className="position-absolute top-0 start-0 w-100 h-100"
        style={{ background: "linear-gradient(to top, rgba(0,0,0,.78) 0%, rgba(0,0,0,.45) 45%, rgba(0,0,0,.25) 100%)" }}
      />
      <div className="container position-relative" style={{ padding: "120px 12px 56px" }}>
        <div className="mx-auto" style={{ maxWidth: 820 }}>
          {date && (
            <div className="d-flex align-items-center gap-2 mb-2" style={{ color: "#d9a21b", fontFamily: "Inter, sans-serif", fontSize: 14, fontWeight: 500 }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
              </svg>
              {date}
            </div>
          )}
          <h1 className="text-white fw-bold text-center mb-0" style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(30px, 5vw, 52px)", lineHeight: 1.25, textShadow: "0 2px 12px rgba(0,0,0,.45)" }}>
            {title}
          </h1>
        </div>
      </div>
    </section>
  );
}

// /health-articles/:id -> Admin > Articles ke record ka poora content (English / اردو)
export default function ArticleDetail() {
  const { id } = useParams();
  const { data, loading, error } = useSiteData(`articles/${id}`);
  const a = data?.article;
  const [lang, setLang] = useState("en");
  const [auto, setAuto] = useState(null); // auto-translated Urdu { titleUr, excerptUr, htmlUr }
  const [autoErr, setAutoErr] = useState(false);

  useEffect(() => { setLang("en"); setAuto(null); setAutoErr(false); }, [id]);

  // Admin ne Urdu nahi likha: "اردو" tab khulne par server se English -> Urdu auto-translation mangwao
  const needAuto = lang === "ur" && !!a?.autoUrdu && !auto && !autoErr;
  useEffect(() => {
    if (!needAuto) return undefined;
    let alive = true;
    loadSite(`articles/${id}/urdu`).then((d) => alive && setAuto(d)).catch(() => alive && setAutoErr(true));
    return () => { alive = false; };
  }, [needAuto, id]);
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
  const canAuto = !hasUr && !!a.autoUrdu;
  const ur = lang === "ur" && (hasUr || canAuto);
  const waitingUr = ur && canAuto && !auto && !autoErr; // translation aa rahi hai
  const failedUr = ur && canAuto && autoErr;
  const urTitle = hasUr ? a.titleUr : auto?.titleUr;
  const urExcerpt = hasUr ? a.excerptUr : auto?.excerptUr;
  const body = ur ? (hasUr ? a.htmlUr || a.html : auto?.htmlUr || "") : a.html;
  const excerpt = (ur ? urExcerpt : a.excerpt) || "";
  // Excerpt quote tab dikhao jab content ki shuruaat mein wohi text pehle se na ho (dobara na dikhe)
  const plain = (h = "") => h.replace(/<[^>]*>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
  const showExcerpt = excerpt && !plain(body).startsWith(plain(excerpt).slice(0, 40));

  return (
    <>
      <ArticleHero image={a.image || "/images/s3.jpg"} date={fmtDate(a.date)} title={a.title} />

      <section className="bg-white pt-5 pb-5">
        <div className="container pt-3">
          <article className="mx-auto" style={{ maxWidth: 820 }}>
            <Link to="/health-articles" className="ad-back">← Back to Health Articles</Link>

            {(hasUr || canAuto) && (
              <div>
                <div className="ad-lang" role="group" aria-label="Language">
                  <button type="button" className={lang === "en" ? "on" : ""} onClick={() => setLang("en")}><i>EN</i> Read in English</button>
                  <button type="button" className={lang === "ur" ? "on" : ""} onClick={() => setLang("ur")}><i>UR</i> اردو میں پڑھیں</button>
                </div>
              </div>
            )}

            {ur && urTitle && (
              <h2 className="fw-bold mt-4 mb-0" dir="rtl" style={{ ...heading, fontFamily: "'Noto Nastaliq Urdu', serif", fontSize: 30, lineHeight: 1.9 }}>{urTitle}</h2>
            )}

            {waitingUr && (
              <p className="mt-4 mb-0 d-flex align-items-center gap-2 text-secondary" dir="rtl" style={{ fontFamily: "'Noto Nastaliq Urdu', serif", fontSize: 14 }}>
                <span className="spinner-border spinner-border-sm" aria-hidden="true" /> اردو ترجمہ تیار ہو رہا ہے، چند لمحے انتظار کریں…
              </p>
            )}
            {failedUr && (
              <p className="mt-4 mb-0 text-secondary" dir="rtl" style={{ fontFamily: "'Noto Nastaliq Urdu', serif", fontSize: 14 }}>
                ترجمہ دستیاب نہیں ہو سکا۔ <button type="button" className="btn btn-link p-0 align-baseline" style={{ color: GOLD }} onClick={() => setAutoErr(false)}>دوبارہ کوشش کریں</button>
              </p>
            )}

            {showExcerpt && <blockquote className="ad-quote" dir="auto">{excerpt}</blockquote>}

            {!waitingUr && !failedUr && (
              <div className="ad-rich mt-3" dir="auto" dangerouslySetInnerHTML={{ __html: body || (excerpt ? `<p>${excerpt}</p>` : "") }} />
            )}

            {ur && !hasUr && auto && (
              <p className="mt-4 mb-0 text-secondary" dir="rtl" style={{ fontFamily: "'Noto Nastaliq Urdu', serif", fontSize: 12 }}>
                یہ اردو ترجمہ خودکار طریقے سے کیا گیا ہے۔
              </p>
            )}
          </article>
        </div>
      </section>

      {data.related.length > 0 && (
        <section className="bg-white py-5" style={{ borderTop: "1px solid #e4e1da" }}>
          <div className="container">
            <h2 className="fw-bold mb-4" style={{ ...heading, fontSize: 22 }}>Related Articles</h2>
            <div className="row g-4">
              {data.related.map((r) => (
                <div key={r.id} className="col-12 col-md-6 col-lg-4">
                  <ArticleCard article={{ ...r, link: `/health-articles/${r.id}` }} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <FeaturedProducts />
    </>
  );
}
