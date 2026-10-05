import { Link } from "react-router-dom";
import { fmtDate } from "../../lib/dates";
const GOLD = "#d4a017";

function CalendarIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={GOLD}
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  );
}

export default function ArticleCard({ article, readMore = "Read More →" }) {
  return (
    <article
      className="h-100 d-flex flex-column rounded-3 overflow-hidden"
      style={{
        background: "#f5f4f1",
        border: "1px solid #e4e1da",
        boxShadow: "0 2px 6px rgba(0,0,0,.08)",
      }}
    >
      {/* Image */}
      <div style={{ aspectRatio: "11 / 6", background: "linear-gradient(135deg,#3f5a34,#8aa05a)" }}>
        {article.image && (
          <img src={article.image} alt={article.title} className="w-100 h-100" style={{ objectFit: "cover" }} />
        )}
      </div>

      {/* Body */}
      <div className="p-4 d-flex flex-column flex-grow-1">
        <div
          className="d-flex align-items-center gap-2 mb-2"
          style={{ fontSize: 11, color: "#7a7a7a", fontFamily: "Inter, sans-serif" }}
        >
          <CalendarIcon /> {fmtDate(article.date)}
        </div>

        <h3
          className="fw-bold mb-2"
          style={{ fontFamily: "'Playfair Display', serif", fontSize: 17, lineHeight: 1.35, color: "#1f2a24" }}
        >
          {article.title}
        </h3>

        <p
          className="mb-3"
          style={{
            fontSize: 12.5,
            lineHeight: 1.6,
            color: "#6b6b6b",
            fontFamily: "Inter, sans-serif",
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {article.excerpt}
        </p>

        {String(article.link || "").startsWith("/") ? (
          <Link to={article.link} className="mt-auto text-decoration-none" style={{ fontSize: 12, color: GOLD, fontFamily: "Inter, sans-serif" }}>
            {readMore}
          </Link>
        ) : (
          <a href={article.link || "#"} className="mt-auto text-decoration-none" style={{ fontSize: 12, color: GOLD, fontFamily: "Inter, sans-serif" }}>
            {readMore}
          </a>
        )}
      </div>
    </article>
  );
}
