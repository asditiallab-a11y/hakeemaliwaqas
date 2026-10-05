import { Link } from "react-router-dom";
import {
  FaFacebookF,
  FaInstagram,
  FaYoutube,
  FaPhoneAlt,
  FaEnvelope,
  FaMapMarkerAlt,
  FaClock,
  FaChevronRight,
  FaArrowRight,
} from "react-icons/fa";
import "./Footer.css";

// ====== DATA (yahan se change karo) ======
const about =
  "Prof Hakeem Ali Waqas — traditional Hikmat and herbal medicine rooted in the Greco-Arabic tradition, offering personalised natural treatments for over 25 years.";

const quickLinks = [
  { label: "About Us", to: "/about" },
  { label: "Treatments", to: "/treatments" },
  { label: "Herbal Medicines", to: "/herbal-medicines" },
  { label: "Videos", to: "/videos" },
  { label: "Health Articles", to: "/health-articles" },
  { label: "Testimonials", to: "/testimonials" },
  { label: "Contact", to: "/contact" },
];

const products = [
  "Kushta Sona",
  "Majoon Shadi Course",
  "Sada Jawaan Course",
  "Haldi (Turmeric)",
  "Shilajit (Mineral Pitch)",
  "Kalonji (Black Seed)",
];

const contact = [
  { icon: <FaPhoneAlt />, label: "Phone", value: "03015959598" },
  { icon: <FaEnvelope />, label: "Email", value: "hakeemaliwaqas1@gmail.com" },
  {
    icon: <FaMapMarkerAlt />,
    label: "Address",
    value:
      "Branch 1: Ravi Toll Plaza Shahdara, Lahore, Pakistan Branch 2: Main Bazar Petrol Pump Gt Road Ferozewala Shahdara , Lahore",
  },
  { icon: <FaClock />, label: "Clinic Hours", value: "Mon-Sat: 9AM - 7PM" },
];

const socials = [
  { icon: <FaFacebookF />, href: "#", label: "Facebook" },
  { icon: <FaInstagram />, href: "#", label: "Instagram" },
  { icon: <FaYoutube />, href: "#", label: "YouTube", red: true },
];

function ColTitle({ children }) {
  return (
    <div className="ft-col-title">
      <h4>{children}</h4>
      <span className="ft-underline" />
    </div>
  );
}

function Footer() {
  return (
    <footer className="site-footer">
      <div className="ft-container">
        {/* Newsletter / CTA card */}
        <div className="ft-cta">
          <div className="ft-cta-text">
            <span className="ft-cta-label">FREE CONSULTATION</span>
            <h3>Begin Your Healing Journey</h3>
            <p>Take the first step towards natural wellness with a personalized consultation.</p>
          </div>
          <Link to="/contact" className="ft-cta-btn">
            BOOK APPOINTMENT <FaArrowRight />
          </Link>
        </div>

        <div className="ft-grid">
          {/* Brand */}
          <div className="ft-brand">
            <Link to="/" className="ft-logo">
              <span className="ft-logo-box">
                <img src="/images/leaf.svg" alt="" />
              </span>
              <span>
                <strong>Prof Hakeem Ali Waqas</strong>
                <small>ANCIENT WISDOM, MODERN HEALING</small>
              </span>
            </Link>
            <p className="ft-about">{about}</p>

            <div className="ft-follow">FOLLOW US</div>
            <div className="ft-socials">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  target="_blank"
                  rel="noreferrer"
                  className={s.red ? "red" : ""}
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Quick links */}
          <div>
            <ColTitle>Quick Links</ColTitle>
            <ul className="ft-links">
              {quickLinks.map((l) => (
                <li key={l.to}>
                  <Link to={l.to}>
                    <FaChevronRight className="ft-chev" />
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Products */}
          <div>
            <ColTitle>Our Products</ColTitle>
            <ul className="ft-links">
              {products.map((p) => (
                <li key={p}>
                  <Link to="/herbal-medicines">
                    <FaChevronRight className="ft-chev" />
                    {p}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <ColTitle>Get In Touch</ColTitle>
            <ul className="ft-contact">
              {contact.map((c) => (
                <li key={c.label}>
                  <span className="ft-ico">{c.icon}</span>
                  <div>
                    <small>{c.label}</small>
                    <p>{c.value}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="ft-bottom">
          <span>© {new Date().getFullYear()} Prof Hakeem Ali Waqas. All rights reserved.</span>
          <div className="ft-bottom-links">
            <Link to="/privacy-policy">Privacy Policy</Link>
            <Link to="/terms-of-service">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
