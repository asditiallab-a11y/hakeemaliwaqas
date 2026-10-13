import { useState } from "react";
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

// Home page par ek row mein itne cards dikhte hain (baqi "View All Reviews" se).
const HOME_LIMIT = 5;
const CARD_WIDTH = 172; // har card ki width (px)
const CARD_GAP = 18; // cards ke darmiyan space (px)

const ROW_CSS = `
.vt-row { display: flex; flex-wrap: wrap; justify-content: center; gap: ${CARD_GAP}px; }
.vt-slot { flex: 0 0 calc(50% - ${CARD_GAP / 2}px); max-width: calc(50% - ${CARD_GAP / 2}px); }
@media (min-width: 768px) {
  .vt-row { flex-wrap: nowrap; gap: clamp(8px, 1.6vw, ${CARD_GAP}px); }
  .vt-slot { flex: 1 1 0; min-width: 0; max-width: ${CARD_WIDTH}px; }
}
`;

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

// "/..." wala link ho to Link (bina reload), warna normal <a>
function ViewAll({ href, children, ...rest }) {
  return href.startsWith("/") ? (
    <Link to={href} {...rest}>{children}</Link>
  ) : (
    <a href={href} {...rest}>{children}</a>
  );
}

// head: optional heading { label, title, desc }.  viewAllLink khali ya "#" ho to button hide.
// slider=true => Home page: sirf pehle HOME_LIMIT cards ek row mein (carousel nahi). false => saari videos grid mein (Testimonials page).
export default function VideoTestimonials({ items = videoTestimonials, viewAllLink = "#", viewAllText = "View All Reviews →", head, slider = false }) {
  const [playingId, setPlayingId] = useState(null); // jis card ki video chal rahi hai

  if (!items.length) return null;

  const list = slider ? items.slice(0, HOME_LIMIT) : items;

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
        className="text-center d-block mx-auto"
        style={{ width: CARD_WIDTH, maxWidth: "100%" }}
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
          <>
            <style>{ROW_CSS}</style>
            <div className="vt-row">
              {list.map((v, i) => (
                <div key={v.id} className="vt-slot">
                  {renderCard(v, i)}
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="d-flex flex-wrap justify-content-center gap-3">
            {list.map(renderCard)}
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
