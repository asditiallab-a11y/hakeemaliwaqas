import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { videoTestimonials } from "../../data/testimonials";
import SectionHeading from "./SectionHeading";

const GOLD = "#d4a017";
const FALLBACKS = [
  "linear-gradient(160deg,#7b5a2a,#2a1d17)",
  "linear-gradient(160deg,#8a2b6a,#2a1420)",
  "linear-gradient(160deg,#c9b21f,#3b3510)",
  "linear-gradient(160deg,#1f6f3b,#0f2a18)",
  "linear-gradient(160deg,#8a6a2b,#2a1d17)",
];

function PlayButton() {
  return (
    <div
      className="position-absolute top-50 start-50 translate-middle d-flex align-items-center justify-content-center"
      style={{ width: 62, height: 44, background: "#f00", borderRadius: 12 }}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="#fff"><path d="M6 4l14 8-14 8z" /></svg>
    </div>
  );
}

function getPerView() {
  if (typeof window === "undefined") return 100 / 15;
  const w = window.innerWidth;
  if (w >= 1200) return 100 / 15; // 15% per card
  if (w >= 992) return 4;
  if (w >= 768) return 3;
  return 2;
}

function Arrow({ dir }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d={dir === "left" ? "M19 12H5M12 19l-7-7 7-7" : "M5 12h14M12 5l7 7-7 7"} />
    </svg>
  );
}

// "/..." wala link ho to Link (bina reload), warna normal <a>
function ViewAll({ href, children, ...rest }) {
  return href.startsWith("/") ? (
    <Link to={href} {...rest}>{children}</Link>
  ) : (
    <a href={href} {...rest}>{children}</a>
  );
}

// head: optional heading { label, title, desc }.  viewAllLink khali ya "#" ho to button hide.
// slider=true => Home page: videos slider (arrows + dots + auto-slide). false => saari videos grid mein (Testimonials page).
export default function VideoTestimonials({ items = videoTestimonials, viewAllLink = "#", viewAllText = "View All Reviews →", head, slider = false }) {
  const [perView, setPerView] = useState(getPerView());
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [playingId, setPlayingId] = useState(null); // jis card ki video chal rahi hai

  useEffect(() => {
    const onResize = () => { setPerView(getPerView()); setIndex(0); };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const maxIndex = Math.max(Math.ceil(items.length - perView), 0);
  const sliding = slider && maxIndex > 0;

  // Auto-slide: har 3 second mein ek card aage, aakhir par wapas shuru; hover ya video chalne par ruk jata hai
  useEffect(() => {
    if (!sliding || paused || playingId) return undefined;
    const t = setInterval(() => setIndex((i) => (i >= maxIndex ? 0 : i + 1)), 3000);
    return () => clearInterval(t);
  }, [sliding, paused, playingId, maxIndex]);

  if (!items.length) return null;

  const prev = () => setIndex((i) => Math.max(i - 1, 0));
  const next = () => setIndex((i) => Math.min(i + 1, maxIndex));
  const arrowBtn = (disabled, side) => ({
    width: 40, height: 40, background: "#fff", color: "#1f2a24",
    border: `1px solid ${disabled ? "#e0e0e0" : "#1f2a24"}`, opacity: disabled ? 0.5 : 1,
    position: "absolute", top: "38%", [side]: -6, zIndex: 2,
  });

  const renderCard = (v, i) => {
    // youtubeId ho to YouTube ki asli thumbnail, warna apni thumb image
    const thumb = v.youtubeId ? `https://img.youtube.com/vi/${v.youtubeId}/hqdefault.jpg` : v.thumb || "";
    const isPlaying = playingId === v.id && !!v.youtubeId;

    const handleClick = (e) => {
      if (!v.youtubeId) return; // youtubeId nahi hai to normal link hi khulega
      e.preventDefault();
      setPlayingId(v.id);
    };

    const boxStyle = {
      aspectRatio: "9 / 16",
      background: FALLBACKS[i % FALLBACKS.length],
      boxShadow: "0 2px 8px rgba(0,0,0,.2)",
    };

    return (
      <div
        key={v.id}
        className="text-center d-block "
        style={{ width: 160, maxWidth: "100%" }}
      >
        {isPlaying ? (
          <div className="position-relative rounded-3 overflow-hidden mb-2" style={boxStyle}>
            <iframe
              className="position-absolute top-0 start-0 w-100 h-100 border-0"
              src={`https://www.youtube.com/embed/${v.youtubeId}?autoplay=1&rel=0&playsinline=1`}
              title={v.name}
              allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
              allowFullScreen
            />
          </div>
        ) : (
          <a
            href={v.link}
            target="_blank"
            rel="noreferrer"
            onClick={handleClick}
            className="text-decoration-none d-block"
          >
            <div className="position-relative rounded-3 overflow-hidden mb-2" style={boxStyle}>
              {thumb && <img src={thumb} alt={v.name} className="w-100 h-100" style={{ objectFit: "cover" }} />}
              <PlayButton />
            </div>
          </a>
        )}
        <div className="fw-medium text-truncate small" style={{ color: "#1f2a24", fontFamily: "Inter, sans-serif" }}>
          {v.name}
        </div>
        <div className="text-truncate" style={{ fontSize: 11, color: "#8a8a8a", fontFamily: "'Playfair Display', serif" }}>
          {v.subtitle}
        </div>
      </div>
    );
  };

  return (
    <section className="bg-white pt-4 pb-5">
      <div className="container">
        {head && (head.label || head.title) && (
          <SectionHeading label={head.label} title={head.title} subtitle={head.desc} />
        )}
        {slider ? (
          <div
            className="position-relative"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
          >
            {sliding && (
              <>
                <button type="button" aria-label="Previous" onClick={prev} disabled={index === 0}
                  className="btn rounded-circle d-flex align-items-center justify-content-center p-0" style={arrowBtn(index === 0, "left")}>
                  <Arrow dir="left" />
                </button>
                <button type="button" aria-label="Next" onClick={next} disabled={index >= maxIndex}
                  className="btn rounded-circle d-flex align-items-center justify-content-center p-0" style={arrowBtn(index >= maxIndex, "right")}>
                  <Arrow dir="right" />
                </button>
              </>
            )}
            <div className="overflow-hidden px-4">
              <div
                className="d-flex"
                style={{
                  // slides kam hon to beech mein rahen, zyada hon to slider
                  justifyContent: sliding ? "flex-start" : "center",
                  transform: sliding ? `translateX(-${(index * 100) / perView}%)` : undefined,
                  transition: "transform .5s ease",
                }}
              >
                {items.map((v, i) => (
                  <div
                    key={v.id}
                    className="px-2"
                    style={{ flex: `0 0 ${100 / perView}%`, maxWidth: `${100 / perView}%` }}
                  >
                    {renderCard(v, i)}
                  </div>
                ))}
              </div>
            </div>
            {sliding && (
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
        ) : (
          <div className="d-flex flex-wrap justify-content-center gap-3">
            {items.map(renderCard)}
          </div>
        )}

        {viewAllLink && viewAllLink !== "#" && viewAllText && (
          <div className="text-center mt-4">
            <ViewAll
              href={viewAllLink}
              className="btn text-uppercase px-4 py-2"
              style={{
                border: `1px solid ${GOLD}`,
                color: GOLD,
                fontSize: 13,
                letterSpacing: ".5px",
                fontFamily: "Inter, sans-serif",
                borderRadius: 4,
              }}
            >
              {viewAllText}
            </ViewAll>
          </div>
        )}
      </div>
    </section>
  );
}