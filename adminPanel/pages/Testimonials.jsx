import { Star } from "lucide-react";
import CategoryList from "../components/CategoryList.jsx";

// Data MongoDB se aata hai (server/routes/admin.js -> /api/admin/testimonials)

const Stars = ({ n }) => (
  <span className="stars" aria-label={`${n} stars`}>
    {[1, 2, 3, 4, 5].map((i) => (
      <Star key={i} size={14} color="#e0a915" fill={i <= n ? "#f5b301" : "none"} />
    ))}
  </span>
);

// rich editor ka HTML list mein sirf text ki shakal mein dikhao (DOMParser script chalata nahi)
const plain = (html) => (new DOMParser().parseFromString(html || "", "text/html").body.textContent || "").trim();

const renderSub = (t) => (
  <span className="sub-line">
    <Stars n={t.rating} />
    <span className="sub-quote" dir="auto">· “{plain(t.text)}”</span>
  </span>
);

// Add/Edit form: Patient name, rich testimonial, rating (stars), Home/Website toggles
const form = {
  fields: [
    { type: "text", key: "title", label: "Patient Name", required: true, placeholder: "e.g. Amna Bibi — Karachi" },
    { type: "rich", key: "text", label: "Testimonial", required: true, minHeight: 110, placeholder: "What did the patient say?" },
    { type: "rating", key: "rating" },
  ],
};

export default function Testimonials() {
  return <CategoryList resource="testimonials" heading="Testimonials" singular="testimonial" nameLabel="Name" renderSub={renderSub} form={form} />;
}
