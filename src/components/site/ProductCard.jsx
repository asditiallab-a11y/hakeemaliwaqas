import { buyUrl } from "../../lib/whatsapp";
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

export default function ProductCard({ product, whatsappNumber }) {
  const buyLink = buyUrl(whatsappNumber, { name: product.name, price: product.price });

  return (
    <div
      className="h-100 rounded-3 overflow-hidden"
      style={{ background: "#f5f4f1", border: "1px solid #e4e1da" }}
    >
      {/* Image */}
      <div style={{ height: 170, background: "#e9e4d8" }}>
        {product.image && (
          <img
            src={product.image}
            alt={product.name}
            className="w-100 h-100"
            style={{ objectFit: "cover" }}
          />
        )}
      </div>

      {/* Body */}
      <div className="p-3">
        <h3
          className="fw-bold mb-2"
          style={{ fontFamily: "'Playfair Display', serif", fontSize: 15, color: "#1f2a24" }}
        >
          {product.name}
        </h3>

        {String(product.link || "").startsWith("/") ? (
          <Link
            to={product.link}
            className="d-inline-block mb-3 text-decoration-none small"
            style={{ color: GOLD, fontFamily: "Inter, sans-serif" }}
          >
            View Details →
          </Link>
        ) : (
          <a
            href={product.link}
            className="d-inline-block mb-3 text-decoration-none small"
            style={{ color: GOLD, fontFamily: "Inter, sans-serif" }}
          >
            View Details →
          </a>
        )}

        <a
          href={buyLink}
          target="_blank"
          rel="noreferrer"
          className="btn w-100 d-flex align-items-center justify-content-center gap-2 text-white fw-bold text-uppercase"
          style={{
            background: "#25d366",
            fontSize: 12,
            letterSpacing: ".5px",
            padding: "7px 0",
            fontFamily: "Inter, sans-serif",
          }}
        >
          <CartIcon /> Buy Now
        </a>
      </div>
    </div>
  );
}
