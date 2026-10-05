import { useEffect } from "react";
import HeroSection from "../components/site/HeroSection";
import SectionHeading from "../components/site/SectionHeading";
import FeaturedProducts from "../components/site/FeaturedProducts";
import ClinicLocations from "../components/site/ClinicLocations";
import LeafLoader from "../../adminPanel/components/LeafLoader.jsx";
import { aboutSections, milestones } from "../data/about";
import { useSiteData, applySeo, val, field, richEmpty } from "../lib/siteApi";
import "./About.css";

// About page admin panel ke mutabiq chalta hai: Admin > Pages > About
//   SEO, Hero Banner (label/title/image/video), Section 1-3 (label, heading, rich content, image),
//   Established text (Section 1 ki image par), Values (4 cards), Journey header + Milestones (4).
// Khali field => wahi dikhta hai (section/label hide). Key kabhi save hi na hui ho ya server band ho
// to purana default content (src/data/about.js) dikhta hai.
const GOLD = "#d4a017";
const DARK = "#1f2a24";

function AboutRow({ item, reverse }) {
  const image = (
    <div className="col-lg-6">
      <div
        className="position-relative rounded-4 overflow-hidden"
        style={{ height: 300, background: "#e9e4d8", boxShadow: "0 8px 24px rgba(0,0,0,.15)" }}
      >
        {item.image && (
          <img src={item.image} alt={item.title} className="w-100 h-100" style={{ objectFit: "cover" }} />
        )}
        {item.badge && (
          <span
            className="position-absolute start-0 bottom-0 text-uppercase"
            style={{ color: GOLD, fontSize: 11, letterSpacing: "1px", padding: "10px 16px", fontFamily: "Jost, sans-serif" }}
          >
            {item.badge}
          </span>
        )}
      </div>
    </div>
  );

  const text = (
    <div className="col-lg-6">
      <div className={reverse ? "pe-lg-4" : "ps-lg-4"}>
        {item.label && (
          <p className="text-uppercase small mb-2" style={{ color: GOLD, letterSpacing: "3px", fontFamily: "Jost, sans-serif" }}>
            {item.label}
          </p>
        )}
        {item.title && (
          <h2 className="fw-bold mb-3" style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, color: DARK }}>
            {item.title}
          </h2>
        )}
        {item.html ? (
          // server (sanitize-html) se saaf hokar aata hai
          <div className="about-rich" dir="auto" dangerouslySetInnerHTML={{ __html: item.html }} />
        ) : (
          item.text && (
            <p className="text-secondary mb-0" style={{ fontFamily: "Inter, sans-serif", fontSize: 14, lineHeight: 1.8 }}>
              {item.text}
            </p>
          )
        )}
      </div>
    </div>
  );

  return (
    <div className="row g-5 align-items-start mb-5 pb-lg-4">
      {reverse ? <>{text}{image}</> : <>{image}{text}</>}
    </div>
  );
}

// Admin ke 3 sections -> rows. Key save na hui ho to default (data/about.js) use hota hai.
function buildSections(page) {
  const badge = field(page, "established", "Established 1998");
  return aboutSections
    .map((d, i) => {
      const n = i + 1;
      const raw = page?.[`s${n}Content`];
      const html = typeof raw === "string" ? (richEmpty(raw) ? "" : raw) : "";
      return {
        id: d.id,
        label: field(page, `s${n}Label`, d.label),
        title: field(page, `s${n}Heading`, d.title),
        html,
        text: typeof raw === "string" ? "" : d.text, // content key nahi to purana plain text
        image: val(page, `s${n}Image`, d.image), // image khali ho to default image
        badge: n === 1 ? badge : "",
      };
    })
    .filter((s) => s.title || s.html || s.text); // sirf label (bina heading/content) wali row nahi dikhti
}

function buildMilestones(page) {
  return milestones
    .map((d, i) => ({
      year: field(page, `m${i + 1}Year`, d.year),
      title: field(page, `m${i + 1}Title`, d.title),
      text: field(page, `m${i + 1}Desc`, d.text),
    }))
    .filter((m) => m.year || m.title || m.text);
}

function buildValues(page) {
  return [1, 2, 3, 4]
    .map((n) => ({ title: field(page, `val${n}A`), text: field(page, `val${n}B`) }))
    .filter((v) => v.title || v.text);
}

export default function About() {
  const { data, loading } = useSiteData("about");
  const page = data?.page;

  useEffect(() => (page ? applySeo(page) : undefined), [page]);

  if (loading) return (<><LeafLoader /><div style={{ minHeight: "100vh" }} /></>);

  const sections = buildSections(page);
  const values = buildValues(page);
  const steps = buildMilestones(page);

  return (
    <>
      <HeroSection
        image={val(page, "heroImage", "/images/wedding.jpg")}
        video={val(page, "heroVideo")}
        label={val(page, "heroLabel", "OUR STORY")}
        title={val(page, "heroTitle", "About Hakeem Ali Waqas")}
        height="620px"
      />

      {/* Story rows */}
      {sections.length > 0 && (
        <section className="bg-white py-5">
          <div className="container py-3">
            {sections.map((item, i) => (
              <AboutRow key={item.id} item={item} reverse={i % 2 === 1} />
            ))}
          </div>
        </section>
      )}

      {/* Values (admin ne cards bhare ho tabhi dikhta hai) */}
      {values.length > 0 && (
        <section className="about-values py-5">
          <div className="container py-3">
            <SectionHeading
              label={field(page, "valLabel", "What We Believe")}
              title={field(page, "valHeading", "Our Values")}
              subtitle={field(page, "valDesc", "The principles behind every treatment")}
            />
            <div className="row g-4 justify-content-center">
              {values.map((v, i) => (
                <div key={i} className="col-12 col-sm-6 col-lg-3">
                  <div className="about-value" dir="auto">
                    {v.title && <h3>{v.title}</h3>}
                    {v.text && <p>{v.text}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Milestones */}
      {steps.length > 0 && (
        <section className={`bg-white pb-4 ${values.length > 0 ? "pt-5" : ""}`}>
          <div className="container">
            <SectionHeading
              label={field(page, "secLabel", "Our Journey")}
              title={field(page, "secHeading", "Milestones")}
              subtitle={field(page, "secDesc", "Key moments in our journey of natural healing")}
            />
            <div className="tl">
              {steps.map((m, i) => (
                <div key={i} className={`tl-item ${i % 2 === 1 ? "right" : ""}`}>
                  {m.year && <div style={{ color: GOLD, fontSize: 12, fontFamily: "Jost, sans-serif", letterSpacing: "1px" }}>{m.year}</div>}
                  {m.title && (
                    <h3 className="fw-bold my-1" style={{ fontFamily: "'Playfair Display', serif", fontSize: 17, color: DARK }}>
                      {m.title}
                    </h3>
                  )}
                  {m.text && <p className="text-secondary mb-0" style={{ fontFamily: "Inter, sans-serif", fontSize: 12.5 }}>{m.text}</p>}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <FeaturedProducts />
      <ClinicLocations />
    </>
  );
}
