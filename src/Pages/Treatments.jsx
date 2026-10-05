import { useEffect, useMemo, useState } from "react";
import HeroSection from "../components/site/HeroSection";
import SectionHeading from "../components/site/SectionHeading";
import TreatmentCard from "../components/site/TreatmentCard";
import TreatmentModal from "../components/site/TreatmentModal";
import FeaturedProducts from "../components/site/FeaturedProducts";
import LeafLoader from "../../adminPanel/components/LeafLoader.jsx";
import { categories as staticCats, treatments as staticTreatments } from "../data/treatments";
import { useSiteData, applySeo, val, field } from "../lib/siteApi";

const GOLD = "#d4a017";

// Treatments page admin panel ke mutabiq chalta hai:
//   Admin > Pages > Treatments  -> SEO, hero (label/title/image/video), section heading, "All" pill ka naam
//   Admin > Treatments          -> cards (live wale), categories (filter pills), Urdu text, image, video
// Server band ho to purana static content (data/treatments.js) dikhta hai.
const fromStatic = () => ({
  categories: staticCats.filter((c) => c !== "All Treatments"),
  items: staticTreatments.map((t) => ({
    id: String(t.id), title: t.title, titleUr: "", categories: [t.filter], tag: t.tag,
    description: t.description, html: "", htmlUr: "", image: t.image, videoUrl: "", youtubeId: "",
  })),
});

export default function Treatments() {
  const { data, loading, error } = useSiteData("treatments");
  const live = !!data && !error;
  const page = live ? data.page : undefined;
  const allLabel = field(page, "allLabel", "All Treatments") || "All Treatments";

  const [active, setActive] = useState(null); // null => All
  const [open, setOpen] = useState(null);

  useEffect(() => (page ? applySeo(page) : undefined), [page]);

  const { cats, items } = useMemo(() => {
    const src = live ? data : fromStatic();
    return {
      cats: src.categories,
      items: src.items.map((t) => ({ ...t, tag: t.tag ?? t.categories[0] ?? "" })),
    };
  }, [live, data]);

  if (loading && !data) return (<><LeafLoader /><div style={{ minHeight: "100vh" }} /></>);

  const list = active ? items.filter((t) => t.categories.some((c) => c.toLowerCase() === active.toLowerCase())) : items;
  const pills = [null, ...cats];

  return (
    <>
      <HeroSection
        image={val(page, "heroImage", "/images/treatments-bg.png")}
        video={val(page, "heroVideo")}
        label={val(page, "heroLabel", "OUR SERVICES")}
        title={val(page, "heroTitle", "Natural Treatments")}
        height="620px"
      />

      <section className="bg-white py-5">
        <div className="container py-3">
          <SectionHeading
            label={field(page, "secLabel", "Healing Naturally")}
            title={field(page, "secHeading", "Our Treatments")}
            subtitle={field(page, "secDesc", "We offer a comprehensive range of natural treatments rooted in traditional Hikmat wisdom")}
          />

          {/* Filter pills (categories Admin > Treatments se) */}
          {cats.length > 0 && (
            <div className="d-flex flex-wrap justify-content-center gap-2 mx-auto mb-5" style={{ maxWidth: 1000 }}>
              {pills.map((c) => {
                const isActive = c === active;
                return (
                  <button
                    key={c ?? "__all"}
                    type="button"
                    onClick={() => setActive(c)}
                    className="btn rounded-pill"
                    style={{
                      fontFamily: "Inter, sans-serif",
                      fontSize: 13,
                      padding: "6px 18px",
                      background: isActive ? GOLD : "#fff",
                      color: isActive ? "#fff" : "#4a4f57",
                      border: `1px solid ${isActive ? GOLD : "#dcdad4"}`,
                    }}
                  >
                    {c ?? allLabel}
                  </button>
                );
              })}
            </div>
          )}

          {/* Grid */}
          <div className="row g-4">
            {list.map((t) => (
              <div key={t.id} className="col-12 col-md-6 col-lg-4">
                <TreatmentCard treatment={t} onOpen={live ? setOpen : undefined} />
              </div>
            ))}
            {list.length === 0 && (
              <p className="text-center text-secondary">
                {items.length === 0 ? "Treatments jald hi add ki jayengi." : "Is category mein abhi koi treatment nahi hai."}
              </p>
            )}
          </div>
        </div>
      </section>

      <TreatmentModal treatment={open} onClose={() => setOpen(null)} />
      <FeaturedProducts />
    </>
  );
}
