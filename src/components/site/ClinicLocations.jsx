import SectionHeading from "./SectionHeading";
import { useSiteData } from "../../lib/siteApi";

const GOLD = "#d4a017";
const DARK = "#1f2a24";

// Server band ho to ye purana static data dikhta hai (normal tor par data Admin > Pages > Contact se aata hai)
export const branches = [
  {
    id: 1,
    name: "Ali Dawakhana(Branch No 1)",
    address: "Ravi Toll Plaza Shahdara Lahore Pakistan",
    phone: "+92-301-5959598",
    hours: "Mon-Sat: 9AM - 7PM",
    mapQuery: "Hakeem Ali Waqas Ravi Toll Plaza Shahdara Lahore",
  },
  {
    id: 2,
    name: "Ali Dawakhana(Branch No 2)",
    address: "G T Road Ferozewala Shahdara Lahore Pakistan",
    phone: "+92-311-1033392",
    hours: "Mon-Sat: 10AM - 7PM",
    mapQuery: "G T Road Ferozewala Shahdara Lahore Pakistan",
  },
];

const Svg = ({ children, size = 15 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{children}</svg>
);

function BranchCard({ b }) {
  const mapSrc = b.mapSrc || `https://www.google.com/maps?q=${encodeURIComponent(b.mapQuery || b.address)}&output=embed`;
  return (
    <div
      className="rounded-3 overflow-hidden h-100"
      style={{ background: "#f5f4f1", border: "1px solid #e4e1da", boxShadow: "0 2px 6px rgba(0,0,0,.08)" }}
    >
      {mapSrc && (
        <iframe
          title={b.name}
          src={mapSrc}
          width="100%"
          height="290"
          style={{ border: 0, display: "block" }}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
      )}
      <div className="p-4" style={{ fontFamily: "Inter, sans-serif", fontSize: 14 }}>
        <h4 className="fw-bold mb-3" style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, color: DARK }}>
          {b.name}
        </h4>
        {b.address && (
          <div className="d-flex align-items-center gap-2 mb-2 text-secondary">
            <span style={{ color: "#d33" }}>
              <Svg><path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0z" /><circle cx="12" cy="10" r="3" /></Svg>
            </span>
            {b.address}
          </div>
        )}
        {b.phone && (
          <a href={`tel:${b.phone.replace(/[^+\d]/g, "")}`} className="d-block mb-2 text-decoration-none" style={{ color: GOLD }}>
            {b.phone}
          </a>
        )}
        {b.hours && (
          <div className="d-flex align-items-center gap-2 text-secondary" style={{ fontSize: 13 }}>
            <Svg size={14}><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></Svg> {b.hours}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ClinicLocations() {
  const { data, loading, error } = useSiteData("shared");
  const live = !!data && !error;
  if (loading && !data) return null;
  const items = live ? data.locations.items : branches;
  const head = live
    ? data.locations
    : { label: "Find Us", heading: "Our Clinic Locations", desc: "Visit us at our clinic for a personalised consultation" };
  if (!items.length) return null; // admin ne saari clinics khali kar di => section hide

  return (
    <section className="bg-white py-5">
      <div className="container">
        <SectionHeading
          label={head.label}
          title={head.heading}
          subtitle={head.desc}
        />
        <div className="row g-4">
          {items.map((b) => (
            <div key={b.id} className={items.length === 1 ? "col-md-8 mx-auto" : items.length === 3 ? "col-md-6 col-lg-4" : "col-md-6"}>
              <BranchCard b={b} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
