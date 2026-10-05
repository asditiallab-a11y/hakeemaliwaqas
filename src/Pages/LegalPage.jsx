import { useEffect } from "react";
import { Link } from "react-router-dom";
import { FaArrowRight } from "react-icons/fa";
import HeroSection from "../components/site/HeroSection";
import FeaturedProducts from "../components/site/FeaturedProducts";
import LeafLoader from "../../adminPanel/components/LeafLoader.jsx";
import { useSiteData, applySeo, val, field, richEmpty } from "../lib/siteApi";
import "./Legal.css";

// Privacy Policy / Terms of Service ka common layout. Data: GET /api/site/<apiName>
//   Admin > Pages > Privacy Policy / Terms of Service:
//   SEO, Hero Banner (label/title/image), Intro Card (heading, last updated, description, side image),
//   Main Content (rich editor), Bottom CTA (heading, description, button text).
// Khali field => wahi dikhta hai (section hide). Key kabhi save hi na hui ho ya server band ho => defaults (src/data/legal.js).
//   imageSide: "right" => text left, image right | "left" => image left, text right
export default function LegalPage({ apiName, defaults, icon: Icon, imageSide = "right", heroFallback = "/images/about-bg.jpg" }) {
  const { data, loading } = useSiteData(apiName);
  const page = data?.page;

  useEffect(() => (page ? applySeo(page) : undefined), [page]);

  if (loading) return (<><LeafLoader /><div style={{ minHeight: "100vh" }} /></>);

  const f = (k) => field(page, k, defaults[k]);
  const rawContent = page?.content;
  const content = typeof rawContent === "string" ? (richEmpty(rawContent) ? "" : rawContent) : defaults.content;

  const introHeading = f("introHeading");
  const introUpdated = f("introUpdated");
  const introDesc = f("introDesc");
  const introImage = val(page, "introImage");
  const hasIntro = introHeading || introUpdated || introDesc || introImage;

  const ctaHeading = f("ctaHeading");
  const ctaDesc = f("ctaDesc");
  const ctaButton = f("ctaButton");
  const hasCta = ctaHeading || ctaDesc || ctaButton;

  const introText = (
    <div className={introImage ? "col-lg-6" : "col-lg-8 text-center"}>
      <div className={`legal-intro-text ${introImage ? "" : "is-centered"}`}>
        {introUpdated && (
          <div className="legal-updated">
            {Icon && <span className="legal-updated-icon"><Icon /></span>}
            <span>{introUpdated}</span>
          </div>
        )}
        {introHeading && <h2 className="legal-intro-heading">{introHeading}</h2>}
        {introDesc && <p className="legal-intro-desc" dir="auto">{introDesc}</p>}
      </div>
    </div>
  );

  const introPic = introImage && (
    <div className="col-lg-6">
      <div className="legal-intro-img">
        <img src={introImage} alt={introHeading || f("heroTitle")} loading="lazy" />
      </div>
    </div>
  );

  return (
    <>
      <HeroSection
        image={val(page, "heroImage", heroFallback)}
        label={f("heroLabel")}
        title={f("heroTitle")}
        height="420px"
      />

      {hasIntro && (
        <section className="legal-intro bg-white">
          <div className="container">
            <div className="row g-5 align-items-center justify-content-center">
              {imageSide === "left" ? <>{introPic}{introText}</> : <>{introText}{introPic}</>}
            </div>
          </div>
        </section>
      )}

      {content && (
        <section className="legal-body bg-white">
          <div className="container">
            <div className="legal-card">
              {/* server (sanitize-html) se saaf hokar aata hai */}
              <div className="legal-rich" dir="auto" dangerouslySetInnerHTML={{ __html: content }} />
            </div>
          </div>
        </section>
      )}

      {hasCta && (
        <section className="legal-cta-wrap bg-white">
          <div className="container">
            <div className="legal-cta">
              {ctaHeading && <h3>{ctaHeading}</h3>}
              {ctaDesc && <p dir="auto">{ctaDesc}</p>}
              {ctaButton && (
                <Link to="/contact" className="legal-cta-btn">
                  {ctaButton} <FaArrowRight size={11} />
                </Link>
              )}
            </div>
          </div>
        </section>
      )}

      <FeaturedProducts />
    </>
  );
}
