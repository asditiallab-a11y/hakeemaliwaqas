import { Link } from "react-router-dom";

/**
 * Parallax CTA banner (scroll par background image fix rehti hai)
 * Props: image, title, text, buttonText, buttonLink, overlay (0-1)
 */
export default function CtaBanner({
  image = "/images/treatments-bg.png",
  title = "Begin Your Healing Journey",
  text = "Take the first step towards natural wellness. Book a consultation with Hakeem Ali Waqas and discover the power of herbal medicine.",
  buttonText = "Book Appointment",
  buttonLink = "/contact",
  overlay = 0.82,
}) {
  return (
    <section
      className="cta-parallax position-relative text-center text-white"
      style={{ backgroundImage: `url(${image})` }}
    >
      <div
        className="position-absolute top-0 start-0 w-100 h-100"
        style={{ background: `rgba(0,0,0,${overlay})` }}
      />
      <div className="container position-relative py-5" style={{ maxWidth: 680 }}>
        <div className="py-4">
          <h2
            className="fw-bold mb-3"
            style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(28px, 4vw, 38px)" }}
          >
            {title}
          </h2>
          <p
            className="mb-4"
            style={{ fontFamily: "Inter, sans-serif", fontSize: 15, lineHeight: 1.7, color: "rgba(255,255,255,.85)" }}
          >
            {text}
          </p>
          <Link
            to={buttonLink}
            className="btn text-uppercase fw-medium px-4 py-2"
            style={{
              background: "#d4a017",
              color: "#1a1a1a",
              fontSize: 13,
              letterSpacing: "1.5px",
              fontFamily: "Inter, sans-serif",
              borderRadius: 4,
            }}
          >
            {buttonText}
          </Link>
        </div>
      </div>
    </section>
  );
}
