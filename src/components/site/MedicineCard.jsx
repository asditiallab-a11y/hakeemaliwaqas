import { Link } from "react-router-dom";
const GOLD = "#d4a017";

function CartIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6" />
    </svg>
  );
}

export default function MedicineCard({ medicine, whatsappNumber = "" }) {
  const buyLink = whatsappNumber
    ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`I want to buy ${medicine.name}`)}`
    : "";
  const buyStyle = {
    background: "linear-gradient(90deg, #25d366, #128c7e)",
    fontSize: 13,
    padding: "9px 0",
    fontFamily: "Inter, sans-serif",
    borderRadius: 6,
  };
  const buyClass = "btn w-100 d-flex align-items-center justify-content-center gap-2 text-white fw-semibold mt-auto";
  const internal = String(medicine.link || "").startsWith("/");

  return (
    <div
      className="h-100 rounded-3 overflow-hidden d-flex flex-column"
      style={{ background: "#f5f4f1", border: "1px solid #e4e1da", boxShadow: "0 2px 6px rgba(0,0,0,.1)" }}
    >
      {/* Image */}
      <div style={{ height: 210, background: "#e9e4d8" }}>
        {medicine.image && (
          <img src={medicine.image} alt={medicine.name} className="w-100 h-100" style={{ objectFit: "cover" }} />
        )}
      </div>

      {/* Body */}
      <div className="p-4 d-flex flex-column flex-grow-1">
        <h3
          className="fw-bold mb-2"
          style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, color: "#1f2a24" }}
        >
          {medicine.name}
        </h3>

        <p
          className="text-secondary mb-3"
          style={{
            fontFamily: "Inter, sans-serif",
            fontSize: 13,
            lineHeight: 1.5,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {medicine.description}
        </p>

        {medicine.price != null && (
          <div className="mb-3 fw-bold" style={{ color: GOLD, fontFamily: "Inter, sans-serif", fontSize: 15 }}>
            {medicine.oldPrice != null && medicine.oldPrice > medicine.price && (
              <s className="me-2" style={{ color: "#c0392b", fontSize: 12, fontWeight: 400 }}>
                Rs. {Number(medicine.oldPrice).toLocaleString("en-PK")}
              </s>
            )}
            Rs. {Number(medicine.price).toLocaleString("en-PK")}
          </div>
        )}

        {buyLink ? (
          <a href={buyLink} target="_blank" rel="noreferrer" className={buyClass} style={buyStyle}>
            <CartIcon /> Buy Now
          </a>
        ) : (
          <Link to="/contact" className={buyClass} style={buyStyle}>
            <CartIcon /> Buy Now
          </Link>
        )}

        {internal ? (
          <Link
            to={medicine.link}
            className="text-center text-decoration-none mt-3"
            style={{ color: GOLD, fontSize: 12, fontWeight: 500, fontFamily: "Inter, sans-serif" }}
          >
            View Full Details →
          </Link>
        ) : (
          <a
            href={medicine.link}
            className="text-center text-decoration-none mt-3"
            style={{ color: GOLD, fontSize: 12, fontWeight: 500, fontFamily: "Inter, sans-serif" }}
          >
            View Full Details →
          </a>
        )}
      </div>
    </div>
  );
}
