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

// "/..." wala link ho to Link (bina reload), warna normal <a>
function ViewAll({ href, children, ...rest }) {
  return href.startsWith("/") ? (
    <Link to={href} {...rest}>{children}</Link>
  ) : (
    <a href={href} {...rest}>{children}</a>
  );
}

// head: optional heading { label, title, desc }.  viewAllLink khali ya "#" ho to button hide.
export default function VideoTestimonials({ items = videoTestimonials, viewAllLink = "#", viewAllText = "View All Reviews →", head }) {
  if (!items.length) return null;

  return (
    <section className="bg-white pt-4 pb-5">
      <div className="container">
        {head && (head.label || head.title) && (
          <SectionHeading label={head.label} title={head.title} subtitle={head.desc} />
        )}
        <div className="d-flex flex-wrap justify-content-center gap-3">
          {items.map((v, i) => {
            // youtubeId ho to YouTube ki asli thumbnail, warna apni thumb image
            const thumb = v.youtubeId
              ? `https://img.youtube.com/vi/${v.youtubeId}/hqdefault.jpg`
              : v.thumb || "";
            return (
              <a
                key={v.id}
                href={v.link}
                target="_blank"
                rel="noreferrer"
                className="text-decoration-none text-center"
                style={{ width: 160 }}
              >
                <div
                  className="position-relative rounded-3 overflow-hidden mb-2"
                  style={{
                    aspectRatio: "9 / 16",
                    background: FALLBACKS[i % FALLBACKS.length],
                    boxShadow: "0 2px 8px rgba(0,0,0,.2)",
                  }}
                >
                  {thumb && (
                    <img src={thumb} alt={v.name} className="w-100 h-100" style={{ objectFit: "cover" }} />
                  )}
                  <PlayButton />
                </div>
                <div
                  className="fw-medium text-truncate small"
                  style={{ color: "#1f2a24", fontFamily: "Inter, sans-serif" }}
                >
                  {v.name}
                </div>
                <div
                  className="text-truncate"
                  style={{ fontSize: 11, color: "#8a8a8a", fontFamily: "'Playfair Display', serif" }}
                >
                  {v.subtitle}
                </div>
              </a>
            );
          })}
        </div>

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
