import { useEffect, useState } from "react";
import { apiUrl } from "../lib/api";
import HeroSection from "../components/site/HeroSection";
import FeaturedProducts from "../components/site/FeaturedProducts";
import ClinicLocations from "../components/site/ClinicLocations";
import LeafLoader from "../../adminPanel/components/LeafLoader.jsx";
import { useSiteData, applySeo, val, field } from "../lib/siteApi";

const GOLD = "#d4a017";
const DARK = "#1f2a24";
const CARD_BG = "#f5f4f1";
const CARD_BORDER = "#e4e1da";

// ====== FALLBACK DATA ======
// Normal tor par ye sab Admin se aata hai:
//   Admin > Pages > Contact          -> SEO, hero, "Contact Information" label/heading
//   Admin > Settings > Contact Info  -> phones, email, address, hours
// Ye purana static data sirf tab dikhta hai jab server band ho ya Settings kabhi save na hui hon.
const contactInfo = {
  phones: ["03015959598", "03111033392", "03224564546", "03174958791", "03444282008"],
  email: "hakeemaliwaqas1@gmail.com",
  addresses: [
    { title: "Branch 1:", text: "Ravi Toll Plaza Shahdara, Lahore, Pakistan" },
    { title: "Branch 2:", text: "Main Bazar Petrol Pump Gt Road Ferozewala Shahdara , Lahore" },
  ],
  hours: "Mon-Sat: 9AM - 7PM",
};

// ====== ICONS ======
const Svg = ({ children, size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{children}</svg>
);
const PhoneIcon = () => (
  <Svg><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z" /></Svg>
);
const MailIcon = () => (
  <Svg><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-10 6L2 7" /></Svg>
);
const PinIcon = ({ size }) => (
  <Svg size={size}><path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0z" /><circle cx="12" cy="10" r="3" /></Svg>
);
const ClockIcon = ({ size }) => (
  <Svg size={size}><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></Svg>
);

// ====== Left side info item ======
function InfoItem({ icon, label, children }) {
  return (
    <div className="d-flex gap-3 mb-4">
      <div
        className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
        style={{ width: 40, height: 40, background: "#f6ecd0", color: GOLD }}
      >
        {icon}
      </div>
      <div style={{ fontFamily: "Inter, sans-serif", fontSize: 14, color: DARK }}>
        <div className="text-uppercase text-secondary mb-1" style={{ fontSize: 11, letterSpacing: ".5px" }}>
          {label}
        </div>
        {children}
      </div>
    </div>
  );
}

// ====== Appointment form ======
function makeCaptcha() {
  return { a: Math.ceil(Math.random() * 9), b: Math.ceil(Math.random() * 9) };
}

function AppointmentForm() {
  const empty = { name: "", email: "", phone: "", date: "", message: "" };
  const [form, setForm] = useState(empty);
  const [captcha, setCaptcha] = useState(makeCaptcha());
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (Number(answer) !== captcha.a + captcha.b) {
      setError("Jawab ghalat hai, dobara try karo.");
      return;
    }
    setError("");
    try {
      const res = await fetch(apiUrl("/api/appointments"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
    } catch {
      setError("Request nahi bhej saka. Thori der baad dobara try karo.");
      return;
    }
    alert("Appointment request bhej di gayi!");
    setForm(empty);
    setAnswer("");
    setCaptcha(makeCaptcha());
  };

  const label = { fontFamily: "Inter, sans-serif", fontSize: 13, fontWeight: 500, color: DARK };
  const input = { background: "#faf9f7", border: `1px solid ${CARD_BORDER}`, fontSize: 13, fontFamily: "'Playfair Display', serif", borderRadius: 4 };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-4 rounded-3 h-100"
      style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}`, boxShadow: "0 2px 6px rgba(0,0,0,.08)" }}
    >
      <h3 className="fw-bold mb-1" style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, color: DARK }}>
        Book an Appointment
      </h3>
      <p className="text-secondary mb-4" style={{ fontFamily: "Inter, sans-serif", fontSize: 13 }}>
        Fill out the form below and we will get back to you as soon as possible.
      </p>

      {/* Security check */}
      <div className="p-3 mb-4 rounded-2" style={{ background: "#ebeae7", border: `1px solid ${CARD_BORDER}` }}>
        <div className="text-uppercase fw-semibold mb-2" style={{ fontFamily: "Inter, sans-serif", fontSize: 11, letterSpacing: "1px", color: DARK }}>
          Security Check
        </div>
        <div className="d-flex align-items-center gap-3 mb-2">
          <span className="fw-bold" style={{ fontFamily: "Inter, sans-serif", fontSize: 14 }}>
            {captcha.a} + {captcha.b} = ?
          </span>
          <input
            type="number"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Answer"
            required
            className="form-control"
            style={{ ...input, width: 80, fontFamily: "Inter, sans-serif" }}
          />
        </div>
        <small className="text-secondary" style={{ fontFamily: "Inter, sans-serif", fontSize: 11 }}>
          Solve the simple math question to verify you're human.
        </small>
        {error && <div className="text-danger mt-1" style={{ fontSize: 12 }}>{error}</div>}
      </div>

      <div className="row g-3">
        <div className="col-md-6">
          <label className="mb-1" style={label}>Full Name</label>
          <input className="form-control" style={input} name="name" placeholder="Your name" value={form.name} onChange={handleChange} required />
        </div>
        <div className="col-md-6">
          <label className="mb-1" style={label}>Email</label>
          <input className="form-control" style={input} type="email" name="email" placeholder="your@email.com" value={form.email} onChange={handleChange} required />
        </div>
        <div className="col-md-6">
          <label className="mb-1" style={label}>Phone Number</label>
          <input className="form-control" style={input} type="tel" name="phone" placeholder="+92 XXX XXXXXXX" value={form.phone} onChange={handleChange} required />
        </div>
        <div className="col-md-6">
          <label className="mb-1" style={label}>Preferred Date</label>
          <input className="form-control" style={input} type="date" name="date" value={form.date} onChange={handleChange} />
        </div>
        <div className="col-12">
          <label className="mb-1" style={label}>Message (Optional)</label>
          <textarea className="form-control" style={input} rows="4" name="message" placeholder="Describe your health concern..." value={form.message} onChange={handleChange} />
        </div>
      </div>

      <button
        type="submit"
        className="btn text-uppercase fw-semibold mt-4 px-4"
        style={{ background: GOLD, color: "#fff", fontSize: 13, letterSpacing: ".5px", fontFamily: "Inter, sans-serif", borderRadius: 4 }}
      >
        Request Appointment
      </button>
    </form>
  );
}

// Admin ka address (multi-line text) -> alag alag lines
const toLines = (t) => String(t).split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

export default function Contact() {
  const { data, loading, error } = useSiteData("contact");
  const live = !!data && !error;
  const page = live ? data.page : undefined;
  const c = live ? data.contact ?? {} : {};

  useEffect(() => (page ? applySeo(page) : undefined), [page]);

  if (loading && !data) return (<><LeafLoader /><div style={{ minHeight: "100vh" }} /></>);

  // Settings mein jo saved hai wahi dikhao (khali = row hide); key kabhi save na hui ho to purana default
  const phones = Array.isArray(c.phones) ? c.phones : contactInfo.phones;
  const email = typeof c.email === "string" ? c.email : contactInfo.email;
  const hours = typeof c.hours === "string" ? c.hours : contactInfo.hours;
  const addressLines =
    typeof c.address === "string"
      ? toLines(c.address)
      : contactInfo.addresses.flatMap((a) => [a.title, a.text]);

  return (
    <>
      <HeroSection
        image={val(page, "heroImage", "/images/treatments-bg.png")}
        video={val(page, "heroVideo")}
        label={val(page, "heroLabel", "GET IN TOUCH")}
        title={val(page, "heroTitle", "Contact Us")}
        height="620px"
      />

      {/* Contact info + form */}
      <section className="bg-white py-5">
        <div className="container py-3">
          <div className="row g-5">
            <div className="col-lg-4">
              <p className="text-uppercase small mb-2" style={{ color: GOLD, letterSpacing: "4px", fontFamily: "Jost, sans-serif" }}>
                {field(page, "ciLabel", "Contact Information")}
              </p>
              <h2 className="fw-bold mb-4" style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, color: DARK }}>
                {field(page, "ciHeading", "Visit Our Clinic")}
              </h2>

              {phones.length > 0 && (
                <InfoItem icon={<PhoneIcon />} label="Phone Numbers">
                  {phones.map((p, i) => (
                    <div key={`${p}-${i}`}>{p}</div>
                  ))}
                </InfoItem>
              )}

              {email && (
                <InfoItem icon={<MailIcon />} label="Email">
                  {email}
                </InfoItem>
              )}

              {addressLines.length > 0 && (
                <InfoItem icon={<PinIcon />} label="Address">
                  {addressLines.map((l, i) => (
                    <div key={i}>{l}</div>
                  ))}
                </InfoItem>
              )}

              {hours && (
                <InfoItem icon={<ClockIcon />} label="Hours">
                  {hours}
                </InfoItem>
              )}
            </div>

            <div className="col-lg-8">
              <AppointmentForm />
            </div>
          </div>
        </div>
      </section>

      {/* Featured products */}
      <FeaturedProducts />

      {/* Clinic locations */}
      <ClinicLocations />
    </>
  );
}
