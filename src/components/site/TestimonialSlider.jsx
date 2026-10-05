import { useEffect, useState } from "react";
import SectionHeading from "./SectionHeading";
import TestimonialCard from "./TestimonialCard";
import { textTestimonials } from "../../data/testimonials";

const GOLD = "#d4a017";

function getPerView() {
  if (typeof window === "undefined") return 3;
  const w = window.innerWidth;
  if (w >= 992) return 3;
  if (w >= 768) return 2;
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

export default function TestimonialSlider({
  items = textTestimonials,
  label = "Success Stories",
  title = "What Our Patients Say",
  subtitle = "Real experiences from people who have found natural healing through our treatments",
  layout = "slider", // "grid" => saare cards ek saath (Testimonials page, admin se)
}) {
  const [perView, setPerView] = useState(getPerView());
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const onResize = () => {
      setPerView(getPerView());
      setIndex(0);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // ek ek card aage/peeche jata hai
  const maxIndex = Math.max(items.length - perView, 0);
  const prev = () => setIndex((i) => Math.max(i - 1, 0));
  const next = () => setIndex((i) => Math.min(i + 1, maxIndex));

  const arrowBtn = (disabled) => ({
    width: 42,
    height: 42,
    background: "#fff",
    color: "#1f2a24",
    border: `1px solid ${disabled ? "#e0e0e0" : "#1f2a24"}`,
    opacity: disabled ? 0.5 : 1,
  });

  if (!items.length) return null;

  if (layout === "grid") {
    return (
      <section className="bg-white py-5">
        <div className="container">
          <SectionHeading label={label} title={title} subtitle={subtitle} />
          <div className="row g-4">
            {items.map((t) => (
              <div key={t.id} className="col-12 col-md-6 col-lg-4">
                <TestimonialCard item={t} />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-white py-5">
      <div className="container">
        <SectionHeading label={label} title={title} subtitle={subtitle} />

        {/* Arrows (top right) */}
        <div className="d-flex justify-content-end gap-2 mb-3">
          <button
            type="button" aria-label="Previous" onClick={prev} disabled={index === 0}
            className="btn rounded-circle d-flex align-items-center justify-content-center p-0"
            style={arrowBtn(index === 0)}
          >
            <Arrow dir="left" />
          </button>
          <button
            type="button" aria-label="Next" onClick={next} disabled={index >= maxIndex}
            className="btn rounded-circle d-flex align-items-center justify-content-center p-0"
            style={arrowBtn(index >= maxIndex)}
          >
            <Arrow dir="right" />
          </button>
        </div>

        {/* Slider */}
        <div className="overflow-hidden" style={{ margin: "0 -12px" }}>
          <div
            className="d-flex"
            style={{
              transform: `translateX(-${(index * 100) / perView}%)`,
              transition: "transform .5s ease",
            }}
          >
            {items.map((t) => (
              <div
                key={t.id}
                className="px-3 pb-2"
                style={{ flex: `0 0 ${100 / perView}%`, maxWidth: `${100 / perView}%` }}
              >
                <TestimonialCard item={t} />
              </div>
            ))}
          </div>
        </div>

        {/* Dots */}
        {maxIndex > 0 && (
          <div className="d-flex justify-content-center gap-2 mt-4">
            {Array.from({ length: maxIndex + 1 }).map((_, i) => (
              <button
                key={i} type="button" aria-label={`Slide ${i + 1}`} onClick={() => setIndex(i)}
                className="border-0 rounded-circle p-0"
                style={{ width: 11, height: 11, background: i === index ? GOLD : "#d5d7de" }}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
