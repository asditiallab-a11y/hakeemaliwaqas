import { useEffect, useState } from "react";
import { buyUrl } from "../lib/whatsapp";
import { Link, useParams } from "react-router-dom";
import SectionHeading from "../components/site/SectionHeading";
import FeaturedProducts from "../components/site/FeaturedProducts";
import OrderModal from "../components/site/OrderModal";
import LeafLoader from "../../adminPanel/components/LeafLoader.jsx";
import { useSiteData, applySeo, val, field } from "../lib/siteApi";
import "./MedicineDetail.css";

const GOLD = "#d4a017";
const heading = { fontFamily: "'Playfair Display', serif", color: "#1f2a24" };

const Svg = ({ children, size = 15 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{children}</svg>
);
const CartIcon = () => (<Svg><circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6" /></Svg>);
// Asli WhatsApp logo (filled)
const WaIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" style={{ flex: "none" }}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);
const TruckIcon = () => (<Svg><rect x="1" y="3" width="15" height="13" /><path d="M16 8h4l3 3v5h-7z" /><circle cx="5.5" cy="18.5" r="2" /><circle cx="18.5" cy="18.5" r="2" /></Svg>);
const CheckIcon = () => (<Svg size={14}><circle cx="12" cy="12" r="10" /><path d="m8 12 3 3 5-6" /></Svg>);
const StarIcon = () => (<Svg><path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z" /></Svg>);
const ClockIcon = () => (<Svg><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></Svg>);
const PlayIcon = () => (<Svg><circle cx="12" cy="12" r="10" /><path d="m10 8 6 4-6 4z" /></Svg>);
const DiamondIcon = () => (<Svg size={11}><path d="M12 2 22 12 12 22 2 12z" /></Svg>);
const TagIcon = () => (<Svg size={11}><path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L2 12V2h10l8.6 8.6a2 2 0 0 1 0 2.8z" /><path d="M7 7h.01" /></Svg>);

const cellClass = (i, n) => {
  if (n === 1) return "full";
  if (i === 0 || n === 2) return "big";
  if (n === 3) return "wide";
  if (n === 4 && i === 1) return "wide";
  return "";
};

const rs = (n) => `Rs. ${Number(n).toLocaleString("en-PK")}`;

// Specifications ko groups mein todta hai (admin ki rows se):
//   - Key likho, Value KHALI chhodo        => naya group heading (e.g. "Accommodation")
//   - Key ki jagah "• Wifi" / "- Wifi", Value khali => neeche features list ka bullet
//   - Key khali, Value likho               => pichli row ki doosri line (e.g. "Twin (2)")
const groupSpecs = (rows) => {
  const groups = [];
  const feats = [];
  let cur = null;
  rows.forEach((r) => {
    const k = (r.k || "").trim();
    const v = (r.v || "").trim();
    if (!k && !v) return;
    if (!v && /^[•\-–]\s*\S/.test(k)) { feats.push(k.replace(/^[•\-–]\s*/, "")); return; }
    if (k && !v) { cur = { title: k, rows: [] }; groups.push(cur); return; }
    if (!cur) { cur = { title: "", rows: [] }; groups.push(cur); }
    cur.rows.push({ k, v });
  });
  return { groups, feats };
};

// /herbal-medicines/:id  -> poora page admin se chalta hai:
//   Admin > Medicines                      -> naam, categories, price / old price, packing (Hero specs), gallery, description, benefits, usage, specs, video, brochure
//   Admin > Pages > Medicines > Product Detail Page -> page ke labels / sidebar texts / button texts
//   Admin > Settings                       -> WhatsApp number (Buy Now)
//   Admin > Orders                         -> "Add to Cart" ki order requests
function MedicineDetailView({ id }) {
  const { data, error } = useSiteData(`medicines/${id}`);
  const m = data?.medicine?.id === id ? data.medicine : null;
  const page = m ? data.page : undefined;

  const [lang, setLang] = useState("en");
  const [qty, setQty] = useState(1);
  const [lb, setLb] = useState(-1); // lightbox image index
  const [ordering, setOrdering] = useState(false);
  const [galOpen, setGalOpen] = useState(false); // mobile: gallery mein baqi images kholna
  const [stuck, setStuck] = useState(false);     // hero se neeche scroll hone par tabs navbar dikhana
  const [active, setActive] = useState("");      // jis section pe user hai (tab highlight)

  useEffect(() => (m ? applySeo({ seoTitle: m.title, seoDesc: (m.description || "").slice(0, 160) }) : undefined), [m]);
  useEffect(() => {
    if (lb < 0) return undefined;
    const onKey = (e) => { if (e.key === "Escape") setLb(-1); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lb]);

  // Sticky tabs navbar: hero nikalte hi tabs top pe fix, aur jis section pe ho wo tab highlight
  useEffect(() => {
    if (!m) return undefined;
    const ids = ["description", "specifications", "how-to-use"];
    let raf = 0;
    const calc = () => {
      raf = 0;
      const hdr = window.innerWidth <= 991 ? 62 : 64; // site header ki height (CSS --md-hdr se match rakho)
      const hero = document.querySelector(".md-hero");
      setStuck(!!hero && hero.getBoundingClientRect().bottom <= hdr);
      let cur = "";
      let best = -Infinity;
      ids.forEach((id) => {
        const el = document.getElementById(id);
        if (!el) return;
        const top = el.getBoundingClientRect().top;
        if (top <= hdr + 110 && top > best) { best = top; cur = id; }
      });
      setActive(cur);
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(calc); };
    calc();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [m, lang]);

  if (!m && !error) return (<><LeafLoader /><div style={{ minHeight: "100vh" }} /></>);

  if (!m) {
    return (
      <section className="bg-white text-center" style={{ padding: "200px 12px 120px" }}>
        <h1 style={{ ...heading, fontSize: 32 }}>Medicine nahi mili</h1>
        <p className="text-secondary">Ye medicine ab available nahi hai ya link galat hai.</p>
        <Link to="/herbal-medicines" className="btn text-white mt-2" style={{ background: GOLD }}>← Saari medicines dekhein</Link>
      </section>
    );
  }

  const t = (k, d) => val(page, k, d);      // admin ne khali chhoda => default text
  const tf = (k, d) => field(page, k, d);   // admin ne khali chhoda => hide

  const hasUr = !!(m.titleUr || m.htmlUr || m.benefitsUr || m.usageUr || m.specsUr.length);
  const ur = lang === "ur" && hasUr;
  const dir = ur ? "rtl" : "ltr";
  const pick = (en, u) => (ur && u ? u : en);
  const html = pick(m.html, m.htmlUr);
  const benefits = pick(m.benefits, m.benefitsUr);
  const usage = pick(m.usage, m.usageUr);
  const specs = ur && m.specsUr.length ? m.specsUr : m.specs;
  const specGroups = specs.length > 0 ? groupSpecs(specs) : null;

  const images = [m.image, ...m.gallery].filter(Boolean).filter((u, i, a) => a.indexOf(u) === i).slice(0, 5);
  const showOld = m.price != null && m.oldPrice != null && m.oldPrice > m.price;

  const buyHref = buyUrl(data.whatsapp, { name: m.title, price: m.price, qty });
  const cartText = tf("dCart", "Add to Cart");
  const delivery = tf("dDelivery", "Delivered to your doorstep in 2–4 working days");
  const trust = ["dTrust1", "dTrust2", "dTrust3"]
    .map((k, i) => tf(k, ["100% Natural Ingredients", "Traditional Unnani Formula", "Prepared by Hakeem Ali Waqas"][i]))
    .filter(Boolean);

  const tabs = [
    ["description", t("dTabDesc", "Description"), !!html],
    ["specifications", t("dTabSpecs", "Specifications"), specs.length > 0],
    ["how-to-use", t("dTabUsage", "How to Use"), !!usage],
  ].filter((x) => x[2]);
  const go = (sec) => document.getElementById(sec)?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <>
      {/* Hero */}
      <section className="md-hero" style={{ backgroundImage: `url(${m.image || "/images/s1.jpg"})` }}>
        <div className="md-hero-in">
          <div className="md-hero-side">
            {m.categories[0] && <span className="md-hero-chip"><span className="ic-d"><DiamondIcon /></span><span className="ic-t"><TagIcon /></span> {m.categories[0]}</span>}
          </div>
          <div className="md-hero-mid">
            <h1 className="md-hero-title">{m.title}</h1>
            {tabs.length > 0 && (
              <div className="md-hero-tabs">
                {tabs.map(([sec, label]) => (
                  <button key={sec} type="button" onClick={() => go(sec)}>{label}</button>
                ))}
              </div>
            )}
          </div>
          <div className="md-hero-side r">
            {data.next && <Link to={`/herbal-medicines/${data.next.id}`} className="md-hero-next">{data.next.title} ›</Link>}
          </div>
        </div>
      </section>

      {/* Sticky tabs navbar: scroll karne par header ke neeche fix ho jata hai */}
      {tabs.length > 0 && (
        <nav className={`md-tabbar${stuck ? " on" : ""}`} aria-hidden={!stuck}>
          <div className="md-tabbar-in">
            {tabs.map(([sec, label]) => (
              <button key={sec} type="button" tabIndex={stuck ? 0 : -1} className={active === sec ? "on" : ""} onClick={() => go(sec)}>{label}</button>
            ))}
          </div>
        </nav>
      )}

      {/* Mobile: Add to Cart / Buy Now gallery se pehle (desktop pe hidden) */}
      <div className="md-mobile-cta">
        {cartText && (
          <button type="button" className="md-btn cart" onClick={() => setOrdering(true)}><CartIcon /> {cartText}</button>
        )}
        {buyHref ? (
          <a href={buyHref} target="_blank" rel="noreferrer" className="md-btn"><WaIcon /> {t("dBuy", "Buy Now")}</a>
        ) : (
          <Link to="/contact" className="md-btn"><WaIcon /> {t("dBuy", "Buy Now")}</Link>
        )}
      </div>

      {/* Gallery */}
      {images.length > 0 && (
        <section className="bg-white pt-5">
          <div className="container pt-3">
            <SectionHeading label={t("dGalLabel", "Our Gallery")} title={t("dGalHeading", "Image Gallery")} />
            <div className={`md-gal${!galOpen && images.length > 2 ? " collapsed" : ""}`}>
              {images.map((u, i) => (
                <div key={u} className={`md-gal-cell ${cellClass(i, images.length)}`}>
                  <button type="button" className="md-gal-btn" onClick={() => setLb(i)} aria-label={`Image ${i + 1}`}>
                    <img src={u} alt={i === 0 ? m.title : ""} loading={i === 0 ? "eager" : "lazy"} />
                  </button>
                  {/* Mobile: 2nd image ke upar center mein More button */}
                  {i === 1 && images.length > 2 && (
                    <button type="button" className="md-gal-more" onClick={() => setGalOpen(true)}>
                      +{images.length - 2} {t("dMore", "More")}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Details */}
      <section className="bg-white py-5">
        <div className="container py-3">
          <div className="row g-5">
            <div className="col-lg-8">
              <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
                <Link to="/herbal-medicines" className="md-back">← {t("dBack", "Back to Medicines")}</Link>
                {(
                  <div className="md-lang" role="group" aria-label="Language">
                    <button type="button" className={lang === "en" ? "on" : ""} onClick={() => setLang("en")}><i>EN</i> {t("dLangEn", "Read in English")}</button>
                    <button type="button" className={lang === "ur" ? "on" : ""} onClick={() => setLang("ur")}><i>UR</i> {t("dLangUr", "اردو میں پڑھیں")}</button>
                  </div>
                )}
              </div>

              <h2 className="md-title" dir={dir}>{pick(m.title, m.titleUr)}</h2>
              {lang === "ur" && !hasUr && (
                <p className="md-ur-note" dir="rtl">اس دوا کا اردو ترجمہ جلد شامل کیا جائے گا۔ فی الحال انگریزی تفصیل ملاحظہ کریں۔</p>
              )}

              {m.categories.length > 0 && (
                <div className="md-cat-row">
                  <span>Category:</span>
                  {m.categories.map((c) => <span key={c} className="md-cat">{c}</span>)}
                </div>
              )}

              {m.price != null && (
                <div className="md-price">
                  {showOld && <s>{rs(m.oldPrice)}</s>}
                  <b>{rs(m.price)}</b>
                  {qty > 1 && <span className="text-secondary small">× {qty} = <strong style={{ color: "#1f2a24" }}>{rs(m.price * qty)}</strong></span>}
                </div>
              )}

              <div className="md-qty">
                <span>{t("dQty", "Quantity")}</span>
                <div className="md-qty-box">
                  <button type="button" aria-label="Decrease quantity" onClick={() => setQty((q) => Math.max(1, q - 1))}>−</button>
                  <span aria-live="polite">{qty}</span>
                  <button type="button" aria-label="Increase quantity" onClick={() => setQty((q) => Math.min(99, q + 1))}>+</button>
                </div>
              </div>

              {m.specsHero.length > 0 && (
                <div className="md-hero-specs">
                  {m.specsHero.map((r, i) => (
                    <div key={i}>{r.k && <b>{r.k}:</b>} {r.v}</div>
                  ))}
                </div>
              )}

              {html && (
                <div id="description" className="md-sec" dir={dir}>
                  <div className="md-rich" dir="auto" dangerouslySetInnerHTML={{ __html: html }} />
                </div>
              )}

              {benefits && (
                <div id="benefits" className="md-box" dir={dir}>
                  <h3 className="md-box-title"><StarIcon /> {ur ? "فوائد" : t("dBenefits", "Key Benefits")}</h3>
                  <div className="md-rich" dir="auto" dangerouslySetInnerHTML={{ __html: benefits }} />
                </div>
              )}

            </div>

            {/* Sidebar */}
            <div className="col-lg-4">
              <aside className="md-side">
                {cartText && (
                  <button type="button" className="md-btn cart" onClick={() => setOrdering(true)}><CartIcon /> {cartText}</button>
                )}
                {buyHref ? (
                  <a href={buyHref} target="_blank" rel="noreferrer" className="md-btn"><WaIcon /> {t("dBuy", "Buy Now")}</a>
                ) : (
                  <Link to="/contact" className="md-btn"><WaIcon /> {t("dBuy", "Buy Now")}</Link>
                )}
                {m.brochure && (
                  <a href={m.brochure} target="_blank" rel="noreferrer" className="btn w-100 fw-semibold mb-2" style={{ border: `1px solid ${GOLD}`, color: GOLD, fontSize: 13, borderRadius: 6 }}>
                    {t("dBrochure", "Download Brochure")}
                  </a>
                )}
                {delivery && <div className="md-note"><TruckIcon /> <span>{delivery}</span></div>}
                {trust.length > 0 && (
                  <ul className="md-trust">
                    {trust.map((x) => <li key={x}><CheckIcon /> {x}</li>)}
                  </ul>
                )}
              </aside>
            </div>
          </div>
        </div>
      </section>

      {/* Specifications: full-width grey box, 2 column groups */}
      {specGroups && (
        <section id="specifications" className="md-sx-wrap bg-white pb-5">
          <div className="container">
            <div className="md-sx" dir={dir}>
              <h3 className="md-sx-title">{ur ? "تفصیلات" : t("dSpecs", "Specifications")}: {pick(m.title, m.titleUr)}</h3>
              <div className={`md-sx-grid${specGroups.groups.length === 1 ? " one" : ""}`}>
                {specGroups.groups.map((g, gi) => (
                  <div key={gi} className="md-sx-grp">
                    {g.title && <h4 className="md-sx-h">{g.title}</h4>}
                    <dl className="md-sx-list">
                      {g.rows.map((r, i) => (
                        <div key={i} className="md-sx-row"><dt>{r.k}</dt><dd>{r.v}</dd></div>
                      ))}
                    </dl>
                  </div>
                ))}
              </div>
              {specGroups.feats.length > 0 && (
                <ul className="md-sx-feats">
                  {specGroups.feats.map((f) => <li key={f}>{f}</li>)}
                </ul>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Video + How to Use: sab se end mein (Specifications ke baad) */}
      {(m.youtubeId || usage) && (
        <section className="bg-white pb-5">
          <div className="container">
            {m.youtubeId && (
              <div className="md-box">
                <h3 className="md-box-title"><PlayIcon /> {t("dWatch", "Watch Video")}</h3>
                <div className="ratio ratio-16x9 rounded-3 overflow-hidden">
                  <iframe title={m.title} src={`https://www.youtube.com/embed/${m.youtubeId}`} allowFullScreen loading="lazy" />
                </div>
              </div>
            )}

            {usage && (
              <div id="how-to-use" className="md-box" dir={dir}>
                <h3 className="md-box-title"><ClockIcon /> {ur ? "استعمال کا طریقہ / خوراک" : t("dUsage", "How to Use")}</h3>
                <div className="md-rich" dir="auto" dangerouslySetInnerHTML={{ __html: usage }} />
              </div>
            )}
          </div>
        </section>
      )}

      <FeaturedProducts />

      {/* Lightbox */}
      {lb >= 0 && images[lb] && (
        <div className="md-lightbox" role="dialog" aria-modal="true" onClick={() => setLb(-1)}>
          <img src={images[lb]} alt="" onClick={(e) => e.stopPropagation()} />
          <button type="button" className="x" aria-label="Close" onClick={() => setLb(-1)}>×</button>
          {images.length > 1 && (
            <>
              <button type="button" className="l" aria-label="Previous" onClick={(e) => { e.stopPropagation(); setLb((lb - 1 + images.length) % images.length); }}>‹</button>
              <button type="button" className="r" aria-label="Next" onClick={(e) => { e.stopPropagation(); setLb((lb + 1) % images.length); }}>›</button>
            </>
          )}
        </div>
      )}

      {ordering && <OrderModal medicine={m} qty={qty} page={page} onClose={() => setOrdering(false)} />}
    </>
  );
}

// key={id}: dusri medicine kholne par language / quantity / lightbox khud reset ho jate hain
export default function MedicineDetail() {
  const { id } = useParams();
  return <MedicineDetailView key={id} id={id} />;
}