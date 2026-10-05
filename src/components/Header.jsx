import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "./Header.css";
import { FaUserFriends, FaSearch, FaBars, FaTimes } from "react-icons/fa";
import SearchModal from "./SearchModal";
import { useConsultation } from "./consultation/ConsultationContext";
import "./consultation/consultation.css";

const links = [
  { to: "/", label: "HOME" },
  { to: "/about", label: "ABOUT" },
  { to: "/treatments", label: "TREATMENTS" },
  { to: "/herbal-medicines", label: "HERBAL MEDICINES" },
  { to: "/videos", label: "VIDEOS" },
  { to: "/health-articles", label: "HEALTH ARTICLES" },
  { to: "/testimonials", label: "TESTIMONIALS" },
  { to: "/contact", label: "CONTACT" },
];

// Is width se chhoti screen par compact bar hamesha dikhega (CSS ke 991px se match)
const MOBILE_QUERY = "(max-width: 991px)";

function Header() {
  const { pathname } = useLocation();
  const { openModal } = useConsultation();
  // /consultation page par form pehle se khula hai, to popup ki zaroorat nahi
  const openForm = () => { if (pathname !== "/consultation") openModal(); };
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== "undefined" && window.matchMedia(MOBILE_QUERY).matches
  );

  // Mobile / desktop track karo
  useEffect(() => {
    const mq = window.matchMedia(MOBILE_QUERY);
    const onChange = (e) => setIsMobile(e.matches);
    setIsMobile(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  // Scroll par compact sticky navbar dikhao (200px se neeche jaye to show)
  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        setScrolled(window.scrollY > 200);
        ticking = false;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Page badalne par mobile menu band
  useEffect(() => setMenuOpen(false), [pathname]);

  // Desktop par jaane se menu band
  useEffect(() => { if (!isMobile && !scrolled) setMenuOpen(false); }, [isMobile, scrolled]);

  // Ctrl+K (ya Cmd+K) se search khule
  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Mobile par bar hamesha visible, desktop par sirf scroll ke baad
  const barVisible = scrolled || isMobile;

  return (
    <header className="site-header">
      {/* Top Bar */}
      <div className="top-bar">
        <div className="top-bar-inner">
          {/* Left - Consultation Button */}
          <div className="top-left">
            <button className="consultation-btn" onClick={openForm}>
              <FaUserFriends className="me-2" />
              CONSULTATION FORM
            </button>
          </div>

          {/* Center - Logo & Title */}
          <div className="top-center logo-section">
            <div className="logo-row">
              <img src="/images/leaf.svg" alt="Leaf Icon" className="leaf-icon" />
              <h1 className="site-title mb-0">Prof Hakeem Ali Waqas</h1>
            </div>
            <p className="tagline mb-0">
              <span className="diamond">✦</span> Ancient Wisdom, Modern Healing{" "}
              <span className="diamond">✦</span>
            </p>
          </div>

          {/* Right - Search Icon */}
          <div className="top-right">
            <button className="search-btn" onClick={() => setSearchOpen(true)} aria-label="Search">
              <FaSearch />
            </button>
          </div>
        </div>
      </div>

      {/* Navbar */}
      <nav className="navbar navbar-expand-lg nav-bar">
        <div className="container-fluid justify-content-center">
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navMenu"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="navMenu">
            <ul className="navbar-nav nav-menu">
              {links.map((l) => (
                <li key={l.to} className={`nav-item ${(pathname === l.to || (l.to !== "/" && pathname.startsWith(l.to + "/"))) ? "active" : ""}`}>
                  <Link className="nav-link" to={l.to}>{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </nav>

      {/* Compact sticky navbar - desktop par scroll ke baad, mobile par hamesha */}
      <div className={`sticky-nav ${barVisible ? "show" : ""}`} aria-hidden={!barVisible}>
        <div className="sticky-inner">
          <Link to="/" className="sticky-logo" tabIndex={barVisible ? 0 : -1}>
            <img src="/images/leaf.svg" alt="" />
            <span>
              <strong>Prof Hakeem Ali Waqas</strong>
              <small>ANCIENT WISDOM, MODERN HEALING</small>
            </span>
          </Link>

          <ul className={`sticky-menu ${menuOpen ? "open" : ""}`}>
            {links.map((l) => (
              <li key={l.to} className={(pathname === l.to || (l.to !== "/" && pathname.startsWith(l.to + "/"))) ? "active" : ""}>
                <Link to={l.to} tabIndex={barVisible ? 0 : -1}>{l.label}</Link>
              </li>
            ))}
            {/* Mobile menu ke andar Consultation button (desktop par CSS se hidden) */}
            <li className="sticky-cta">
              <button
                type="button"
                tabIndex={barVisible ? 0 : -1}
                onClick={() => { setMenuOpen(false); openForm(); }}
              >
                <FaUserFriends /> CONSULTATION FORM
              </button>
            </li>
          </ul>

          <div className="sticky-actions">
            <button
              className="sticky-icon-btn"
              onClick={() => setSearchOpen(true)}
              aria-label="Search"
              tabIndex={barVisible ? 0 : -1}
            >
              <FaSearch />
            </button>
            <button
              className="sticky-icon-btn sticky-burger"
              onClick={() => setMenuOpen((o) => !o)}
              aria-label="Menu"
              aria-expanded={menuOpen}
              tabIndex={barVisible ? 0 : -1}
            >
              {menuOpen ? <FaTimes /> : <FaBars />}
            </button>
          </div>
        </div>
      </div>

      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </header>
  );
}

export default Header;
