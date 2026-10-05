const GOLD = "#d4a017";

function QuoteIcon() {
  return (
    <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke={GOLD}
      strokeWidth="1.6" strokeLinejoin="round" opacity=".35">
      <path d="M3 21c3 0 6-2 6-6V9H3v6h3M15 21c3 0 6-2 6-6V9h-6v6h3" transform="rotate(180 12 12)" />
    </svg>
  );
}

function Star() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill={GOLD}>
      <path d="M12 2l3.1 6.3 6.9 1-5 4.9 1.2 6.9L12 17.8 5.8 21.1 7 14.2 2 9.3l6.9-1z" />
    </svg>
  );
}

export default function TestimonialCard({ item }) {
  return (
    <div
      className="h-100 d-flex flex-column rounded-3 p-4"
      style={{
        background: "#f5f4f1",
        border: "1px solid #e4e1da",
        boxShadow: "0 2px 6px rgba(0,0,0,.08)",
      }}
    >
      <QuoteIcon />

      <div className="d-flex gap-1 my-2">
        {Array.from({ length: item.rating }).map((_, i) => <Star key={i} />)}
      </div>

      {/* item.html: admin ke rich editor ka (server par saaf kiya hua) HTML */}
      {(() => {
        const Tag = item.html ? "div" : "p";
        const body = item.html ? { dangerouslySetInnerHTML: { __html: item.text } } : { children: <>“{item.text}”</> };
        return (
      <Tag
        className="flex-grow-1 mb-4"
        dir={item.rtl ? "rtl" : "ltr"}
        {...body}
        style={{
          fontStyle: item.rtl ? "normal" : "italic",
          fontSize: item.rtl ? 14 : 13.5,
          lineHeight: item.rtl ? 2.2 : 1.85,
          color: "#555",
          fontFamily: item.rtl ? "'Noto Nastaliq Urdu', serif" : "Inter, sans-serif",
        }}
      />
        );
      })()}

      <div className="d-flex align-items-center gap-3 pt-3" style={{ borderTop: "1px solid #e4e1da" }}>
        <div
          className="rounded-circle d-flex align-items-center justify-content-center fw-bold"
          style={{
            width: 38, height: 38, background: "#f0e6c8", color: GOLD,
            fontFamily: "'Playfair Display', serif", fontSize: 14,
          }}
        >
          {item.name.charAt(0)}
        </div>
        <div className="fw-medium small" style={{ color: "#1f2a24", fontFamily: "Inter, sans-serif" }}>
          {item.city ? `${item.name} — ${item.city}` : item.name}
        </div>
      </div>
    </div>
  );
}
