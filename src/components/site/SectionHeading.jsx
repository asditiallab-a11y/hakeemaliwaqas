export default function SectionHeading({ label, title, subtitle }) {
  return (
    <div className="text-center mx-auto mb-5" style={{ maxWidth: 680 }}>
      <p
        className="text-uppercase small mb-2"
        style={{ color: "#d4a017", letterSpacing: "4px", fontFamily: "Jost, sans-serif" }}
      >
        {label}
      </p>
      <h2
        className="fw-bold display-5 mb-3"
        style={{ fontFamily: "'Playfair Display', serif", color: "#1f2a24" }}
      >
        {title}
      </h2>
      {subtitle && (
        <p className="text-secondary mb-3" style={{ fontFamily: "Inter, sans-serif" }}>
          {subtitle}
        </p>
      )}
      <div className="mx-auto" style={{ width: 60, height: 2, background: "#d4a017" }} />
    </div>
  );
}
