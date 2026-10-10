import { Fragment, useEffect, useState } from "react";
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

const isActive = (pathname, to) =>
  pathname === to || (to !== "/" && pathname.startsWith(to + "/"));

function Header() {
  const { pathname } = useLocation();
  const { openModal } = useConsultation();
  // /consultation page par form pehle se khula hai, to popup ki zaroorat nahi
  const openForm = () => { if (pathname !== "/consultation") openModal(); };
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false); // desktop compact sticky navbar (200px)
  const [stuck, setStuck] = useState(false);       // mobile header white ho jaye (40px)
  const [menuOpen, setMenuOpen] = useState(false);

  // Medicine detail page par mobile header banner ke upar overlay hota hai
  const overlay = pathname.startsWith("/herbal-medicines/") && pathname.length > "/herbal-medicines/".length;
  // Overlay pages par top pe transparent, baqi pages / scroll / menu open par white
  const light = !overlay || stuck || menuOpen;

  // Scroll par: desktop compact navbar + mobile header ka white background
  useEffect(() => {
    let ticking = false;
    const update = () => {
      setScrolled(window.scrollY > 200);
      setStuck(window.scrollY > 40);
    };
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        update();
        ticking = false;
      });
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [pathname]);

  // Page badalne par mobile menu band
  useEffect(() => setMenuOpen(false), [pathname]);

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

  return (
    <header className={`site-header ${overlay ? "overlay" : ""}`}>
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
              {links.map((l, i) => (
                <Fragment key={l.to}>
                  {/* Links ke beech chhota "+" separator (CSS: .nav-separator) */}
                  {i > 0 && <li className="nav-separator" aria-hidden="true" />}
                  <li className={`nav-item ${isActive(pathname, l.to) ? "active" : ""}`}>
                    <Link className="nav-link" to={l.to}>{l.label}</Link>
                  </li>
                </Fragment>
              ))}
            </ul>
          </div>
        </div>
      </nav>

      {/* Compact sticky navbar (desktop) - scroll karne par smoothly neeche aata hai */}
      <div className={`sticky-nav ${scrolled ? "show" : ""}`} aria-hidden={!scrolled}>
        <div className="sticky-inner">
          <Link to="/" className="sticky-logo" tabIndex={scrolled ? 0 : -1}>
            <img src="/images/leaf.svg" alt="" />
            <span>
              <strong>Prof Hakeem Ali Waqas</strong>
              <small>ANCIENT WISDOM, MODERN HEALING</small>
            </span>
          </Link>

          <ul className={`sticky-menu ${menuOpen ? "open" : ""}`}>
            {links.map((l) => (
              <li key={l.to} className={isActive(pathname, l.to) ? "active" : ""}>
                <Link to={l.to} tabIndex={scrolled ? 0 : -1}>{l.label}</Link>
              </li>
            ))}
          </ul>

          <div className="sticky-actions">
            <button
              className="sticky-icon-btn"
              onClick={() => setSearchOpen(true)}
              aria-label="Search"
              tabIndex={scrolled ? 0 : -1}
            >
              <FaSearch />
            </button>
            <button
              className="sticky-icon-btn sticky-burger"
              onClick={() => setMenuOpen((o) => !o)}
              aria-label="Menu"
              tabIndex={scrolled ? 0 : -1}
            >
              {menuOpen ? <FaTimes /> : <FaBars />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile header (<= 991px): logo + search + burger. Detail page par banner ke upar transparent */}
      <div className={`m-header ${light ? "light" : ""}`}>
        <Link to="/" className="m-logo">
          <img src="/images/leaf.svg" alt="" />
          <span>
            <strong>Prof Hakeem Ali Waqas</strong>
            <small>ANCIENT WISDOM, MODERN HEALING</small>
          </span>
        </Link>

        <div className="m-actions">
          <button className="m-icon-btn" onClick={() => setSearchOpen(true)} aria-label="Search">
            <FaSearch />
          </button>
          <button
            className="m-burger"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Menu"
            aria-expanded={menuOpen}
          >
            {menuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>

        <ul className={`m-menu ${menuOpen ? "open" : ""}`}>
          {links.map((l) => (
            <li key={l.to} className={isActive(pathname, l.to) ? "active" : ""}>
              <Link to={l.to}>{l.label}</Link>
            </li>
          ))}
          <li className="m-consult">
            <button className="consultation-btn" onClick={() => { setMenuOpen(false); openForm(); }}>
              <FaUserFriends className="me-2" />
              CONSULTATION FORM
            </button>
          </li>
        </ul>
      </div>

      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </header>
  );
}

export default Header;