import { useEffect, useMemo, useState } from "react";
import HeroSection from "../components/site/HeroSection";
import SectionHeading from "../components/site/SectionHeading";
import MedicineCard from "../components/site/MedicineCard";
import LeafLoader from "../../adminPanel/components/LeafLoader.jsx";
import { categories as staticCats, medicines as staticMedicines } from "../data/medicines";
import { useSiteData, applySeo, val, field } from "../lib/siteApi";

const GOLD = "#d4a017";

// Herbal Medicines page admin panel ke mutabiq chalta hai:
//   Admin > Pages > Medicines -> SEO, hero (label/title/image/video), section heading, "All" pill ka naam
//   Admin > Medicines         -> cards (live wale), categories (filter pills), price, image
//   Admin > Settings          -> WhatsApp number (Buy Now)
// Server band ho to purana static content (data/medicines.js) dikhta hai.
const fromStatic = () => ({
  whatsapp: "",
  categories: staticCats.filter((c) => c !== "All Medicines"),
  items: staticMedicines.map((m) => ({
    id: String(m.id), name: m.name, categories: [m.category], description: m.description,
    image: m.image, link: m.link, price: null,
  })),
});

export default function HerbalMedicines() {
  const { data, loading, error } = useSiteData("medicines");
  const live = !!data && !error;
  const page = live ? data.page : undefined;
  const allLabel = field(page, "allLabel", "All Medicines") || "All Medicines";
  const [active, setActive] = useState(null); // null => All

  useEffect(() => (page ? applySeo(page) : undefined), [page]);

  const { cats, items, whatsapp } = useMemo(() => {
    const src = live ? data : fromStatic();
    return {
      cats: src.categories,
      whatsapp: src.whatsapp,
      items: src.items.map((m) => ({
        ...m,
        name: m.name ?? m.title,
        link: m.link ?? `/herbal-medicines/${m.id}`,
      })),
    };
  }, [live, data]);

  if (loading && !data) return (<><LeafLoader /><div style={{ minHeight: "100vh" }} /></>);

  const list = active ? items.filter((m) => m.categories.some((c) => c.toLowerCase() === active.toLowerCase())) : items;
  const pills = [null, ...cats];

  return (
    <>
      <HeroSection
        image={val(page, "heroImage", "/images/s1.jpg")}
        video={val(page, "heroVideo")}
        label={val(page, "heroLabel", "NATURAL REMEDIES")}
        title={val(page, "heroTitle", "Herbal Medicines")}
        height="620px"
      />

      <section className="bg-white py-5">
        <div className="container py-3">
          <SectionHeading
            label={field(page, "secLabel", "Our Formulations")}
            title={field(page, "secHeading", "Herbal Medicine Collection")}
            subtitle={field(page, "secDesc", "Each medicine is carefully crafted using traditional recipes and the finest natural ingredients")}
          />

          {/* Category filter (categories Admin > Medicines se) */}
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
            {list.map((m) => (
              <div key={m.id} className="col-12 col-md-6 col-lg-4">
                <MedicineCard medicine={m} whatsappNumber={whatsapp} />
              </div>
            ))}
            {list.length === 0 && (
              <p className="text-center text-secondary">
                {items.length === 0 ? "Medicines jald hi add ki jayengi." : "Is category mein abhi koi medicine nahi hai."}
              </p>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
