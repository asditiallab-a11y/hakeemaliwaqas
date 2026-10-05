import { useEffect, useState } from "react";
import SectionHeading from "./SectionHeading";
import ProductCard from "./ProductCard";
import { featuredProducts } from "../../data/products";
import { useSiteData } from "../../lib/siteApi";

const GOLD = "#d4a017";

// Screen ke hisaab se kitne cards dikhane hain
function getPerView() {
  if (typeof window === "undefined") return 4;
  const w = window.innerWidth;
  if (w >= 992) return 4;
  if (w >= 576) return 2;
  return 1;
}

function Arrow({ dir }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d={dir === "left" ? "M19 12H5M12 19l-7-7 7-7" : "M5 12h14M12 5l7 7-7 7"} />
    </svg>
  );
}

// Data: GET /api/site/shared -> Admin > Medicines (cards) + Admin > Pages > About > "Featured Products Section" (heading).
// `products` prop do to wahi dikhega. Server band ho to purana static data (data/products.js) dikhta hai.
export default function FeaturedProducts({ products: productsProp, whatsappNumber = "" }) {
  const { data, loading, error } = useSiteData("shared");
  const live = !!data && !error;
  const products = productsProp ?? (live ? data.featured.items : featuredProducts);
  const whatsapp = whatsappNumber || (live ? data.whatsapp : "");
  const head = live
    ? data.featured
    : { label: "Herbal Medicines", heading: "Featured Products", desc: "Premium herbal medicines crafted with the finest natural ingredients" };
  const [perView, setPerView] = useState(getPerView());
  const [page, setPage] = useState(0);

  useEffect(() => {
    const onResize = () => {
      setPerView(getPerView());
      setPage(0);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  if (loading && !data) return null;
  if (!products.length) return null; // admin ne koi medicine live nahi rakhi => section hide

  const pages = Math.ceil(products.length / perView);
  // last page par khali jagah na bache
  const startIndex = Math.min(page * perView, Math.max(products.length - perView, 0));

  const prev = () => setPage((p) => Math.max(p - 1, 0));
  const next = () => setPage((p) => Math.min(p + 1, pages - 1));

  const arrowStyle = (disabled) => ({
    position: "absolute",
    top: 173,
    transform: "translateY(-50%)",
    width: 42,
    height: 42,
    zIndex: 2,
    background: "#fff",
    color: "#1f2a24",
    boxShadow: "0 2px 8px rgba(0,0,0,.2)",
    opacity: disabled ? 0.55 : 1,
    cursor: disabled ? "default" : "pointer",
  });

  return (
    <section className="bg-white py-5">
      <div className="container">
        <SectionHeading
          label={head.label}
          title={head.heading}
          subtitle={head.desc}
        />

        <div className="position-relative">
          {/* Arrows */}
          <button
            type="button"
            aria-label="Previous"
            onClick={prev}
            disabled={page === 0}
            className="btn rounded-circle border-0 d-flex align-items-center justify-content-center p-0"
            style={{ ...arrowStyle(page === 0), left: 12 }}
          >
            <Arrow dir="left" />
          </button>
          <button
            type="button"
            aria-label="Next"
            onClick={next}
            disabled={page >= pages - 1}
            className="btn rounded-circle border-0 d-flex align-items-center justify-content-center p-0"
            style={{ ...arrowStyle(page >= pages - 1), right: 12 }}
          >
            <Arrow dir="right" />
          </button>

          {/* Slider */}
          <div className="overflow-hidden" style={{ margin: "0 -8px" }}>
            <div
              className="d-flex"
              style={{
                transform: `translateX(-${(startIndex * 100) / perView}%)`,
                transition: "transform .5s ease",
              }}
            >
              {products.map((p) => (
                <div
                  key={p.id}
                  className="px-2 pb-1"
                  style={{ flex: `0 0 ${100 / perView}%`, maxWidth: `${100 / perView}%` }}
                >
                  <ProductCard product={p} whatsappNumber={whatsapp} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Dots */}
        <div className="d-flex justify-content-center gap-2 mt-4">
          {Array.from({ length: pages }).map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Page ${i + 1}`}
              onClick={() => setPage(i)}
              className="border-0 rounded-circle p-0"
              style={{ width: 11, height: 11, background: i === page ? GOLD : "#d5d7de" }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
