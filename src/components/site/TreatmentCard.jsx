const GOLD = "#d4a017";

// onOpen diya ho to "View Details" modal kholta hai, warna treatment.link par jata hai
export default function TreatmentCard({ treatment, onOpen }) {
  return (
    <div
      className="h-100 rounded-3 overflow-hidden d-flex flex-column"
      style={{ background: "#f5f4f1", border: "1px solid #e4e1da", boxShadow: "0 2px 6px rgba(0,0,0,.1)" }}
    >
      {/* Image + tag */}
      <div className="position-relative" style={{ height: 200, background: "#e9e4d8" }}>
        {treatment.image && (
          <img src={treatment.image} alt={treatment.title} className="w-100 h-100" style={{ objectFit: "cover" }} />
        )}
        {treatment.tag && (
        <span
          className="position-absolute start-0 bottom-0 text-uppercase"
          style={{
            color: GOLD,
            background: "rgba(0,0,0,.55)",
            fontSize: 11,
            letterSpacing: "1px",
            padding: "4px 12px",
            fontFamily: "Jost, sans-serif",
          }}
        >
          {treatment.tag}
        </span>
        )}
      </div>

      {/* Body */}
      <div className="p-4 d-flex flex-column flex-grow-1">
        <h3
          className="fw-bold mb-2"
          style={{ fontFamily: "'Playfair Display', serif", fontSize: 17, lineHeight: 1.3, color: "#1f2a24" }}
        >
          {treatment.title}
        </h3>
        <p
          className="text-secondary mb-3"
          style={{
            fontFamily: "Inter, sans-serif",
            fontSize: 12.5,
            lineHeight: 1.6,
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {treatment.description}
        </p>
        {onOpen ? (
          <button
            type="button"
            onClick={() => onOpen(treatment)}
            className="mt-auto btn btn-link p-0 text-start text-decoration-none"
            style={{ color: GOLD, fontSize: 12, fontWeight: 500, fontFamily: "Inter, sans-serif" }}
          >
            View Details →
          </button>
        ) : (
          <a
            href={treatment.link || "#"}
            className="mt-auto text-decoration-none"
            style={{ color: GOLD, fontSize: 12, fontWeight: 500, fontFamily: "Inter, sans-serif" }}
          >
            View Details →
          </a>
        )}
      </div>
    </div>
  );
}
