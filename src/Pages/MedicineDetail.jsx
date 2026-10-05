import { useEffect, useState } from "react";
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
const WaIcon = () => (<Svg><path d="M21 11.5a8.4 8.4 0 0 1-12.4 7.4L3 20.5l1.7-5.4A8.4 8.4 0 1 1 21 11.5z" /></Svg>);
const TruckIcon = () => (<Svg><rect x="1" y="3" width="15" height="13" /><path d="M16 8h4l3 3v5h-7z" /><circle cx="5.5" cy="18.5" r="2" /><circle cx="18.5" cy="18.5" r="2" /></Svg>);
const CheckIcon = () => (<Svg size={14}><circle cx="12" cy="12" r="10" /><path d="m8 12 3 3 5-6" /></Svg>);
const StarIcon = () => (<Svg><path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z" /></Svg>);
const ClockIcon = () => (<Svg><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></Svg>);
const PlayIcon = () => (<Svg><circle cx="12" cy="12" r="10" /><path d="m10 8 6 4-6 4z" /></Svg>);
const DiamondIcon = () => (<Svg size={11}><path d="M12 2 22 12 12 22 2 12z" /></Svg>);

const cellClass = (i, n) => {
  if (n === 1) return "full";
  if (i === 0 || n === 2) return "big";
  if (n === 3) return "wide";
  if (n === 4 && i === 1) return "wide";
  return "";
};

const rs = (n) => `Rs. ${Number(n).toLocaleString("en-PK")}`;

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

  useEffect(() => (m ? applySeo({ seoTitle: m.title, seoDesc: (m.description || "").slice(0, 160) }) : undefined), [m]);
  useEffect(() => {
    if (lb < 0) return undefined;
    const onKey = (e) => { if (e.key === "Escape") setLb(-1); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lb]);

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

  const images = [m.image, ...m.gallery].filter(Boolean).filter((u, i, a) => a.indexOf(u) === i).slice(0, 5);
  const showOld = m.price != null && m.oldPrice != null && m.oldPrice > m.price;

  const buyHref = data.whatsapp
    ? `https://wa.me/${data.whatsapp}?text=${encodeURIComponent(`I want to buy ${m.title} (Qty: ${qty})`)}`
    : "";
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
            {m.categories[0] && <span className="md-hero-chip"><DiamondIcon /> {m.categories[0]}</span>}
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

      {/* Gallery */}
      {images.length > 0 && (
        <section className="bg-white pt-5">
          <div className="container pt-3">
            <SectionHeading label={t("dGalLabel", "Our Gallery")} title={t("dGalHeading", "Image Gallery")} />
            <div className="md-gal">
              {images.map((u, i) => (
                <button key={u} type="button" className={cellClass(i, images.length)} onClick={() => setLb(i)} aria-label={`Image ${i + 1}`}>
                  <img src={u} alt={i === 0 ? m.title : ""} loading={i === 0 ? "eager" : "lazy"} />
                </button>
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
                {hasUr && (
                  <div className="md-lang" role="group" aria-label="Language">
                    <button type="button" className={lang === "en" ? "on" : ""} onClick={() => setLang("en")}>{t("dLangEn", "Read in English")}</button>
                    <button type="button" className={lang === "ur" ? "on" : ""} onClick={() => setLang("ur")}>{t("dLangUr", "اردو میں پڑھیں")}</button>
                  </div>
                )}
              </div>

              <h2 className="md-title" dir={dir}>{pick(m.title, m.titleUr)}</h2>

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

              {specs.length > 0 && (
                <div id="specifications" className="md-sec" dir={dir}>
                  <h3 className="md-sec-title">{ur ? "تفصیلات" : t("dSpecs", "Specifications")}</h3>
                  <div className="table-responsive">
                    <table className="table md-specs" style={{ fontFamily: "Inter, sans-serif", fontSize: 14 }}>
                      <tbody>
                        {specs.map((r, i) => (
                          <tr key={i}><th scope="row">{r.k}</th><td>{r.v}</td></tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {benefits && (
                <div id="benefits" className="md-box" dir={dir}>
                  <h3 className="md-box-title"><StarIcon /> {ur ? "فوائد" : t("dBenefits", "Key Benefits")}</h3>
                  <div className="md-rich" dir="auto" dangerouslySetInnerHTML={{ __html: benefits }} />
                </div>
              )}

              {usage && (
                <div id="how-to-use" className="md-box" dir={dir}>
                  <h3 className="md-box-title"><ClockIcon /> {ur ? "استعمال کا طریقہ / خوراک" : t("dUsage", "How to Use")}</h3>
                  <div className="md-rich" dir="auto" dangerouslySetInnerHTML={{ __html: usage }} />
                </div>
              )}

              {m.youtubeId && (
                <div className="md-box">
                  <h3 className="md-box-title"><PlayIcon /> {t("dWatch", "Watch Video")}</h3>
                  <div className="ratio ratio-16x9 rounded-3 overflow-hidden">
                    <iframe title={m.title} src={`https://www.youtube.com/embed/${m.youtubeId}`} allowFullScreen loading="lazy" />
                  </div>
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

      {ordering && <OrderModal medicine={m} qty={qty} onClose={() => setOrdering(false)} />}
    </>
  );
}

// key={id}: dusri medicine kholne par language / quantity / lightbox khud reset ho jate hain
export default function MedicineDetail() {
  const { id } = useParams();
  return <MedicineDetailView key={id} id={id} />;
}
