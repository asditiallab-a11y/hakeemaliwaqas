import React, { useEffect, useRef, useState } from "react";
import { FaVolumeMute, FaVolumeUp, FaChevronDown } from "react-icons/fa";
import { val } from "../lib/siteApi";

// Admin > Pages > Home: Hero Background Image / Hero Video.  Admin > Settings: Hero Heading / Subtitle.
//  - video upload hai  -> video chalta hai (image uska poster banti hai)
//  - sirf image hai    -> sirf image
//  - kuch bhi nahi     -> purani default video
const DEFAULT_VIDEO = "/images/herovideo.mp4";

// Fixed/sticky header ki height (scroll karte waqt next section uske neeche na chhup jaye)
const HEADER_OFFSET = 64;

const Hero = ({ page, settings }) => {
  const image = val(page, "heroImage");
  const uploaded = val(page, "heroVideo");
  const video = uploaded || (image ? "" : DEFAULT_VIDEO);
  const title = val(settings, "heroHeading", "Ali Dawakhana");
  const subtitle = val(settings, "heroSubtitle");

  const sectionRef = useRef(null);
  const videoRef = useRef(null);
  // Browser autoplay sirf muted video allow karta hai, isliye shuru mein muted
  const [muted, setMuted] = useState(true);

  // Video badalne par dobara muted
  useEffect(() => setMuted(true), [video]);

  // Volume on/off
  const toggleSound = () => {
    const v = videoRef.current;
    if (!v) return;
    const next = !muted;
    v.muted = next;
    if (!next) v.play().catch(() => {});
    setMuted(next);
  };

  // Hero ke next section par smooth scroll
  const scrollToNext = () => {
    const el = sectionRef.current;
    if (!el) return;
    const next = el.nextElementSibling;
    const top = next
      ? next.getBoundingClientRect().top + window.scrollY
      : el.getBoundingClientRect().bottom + window.scrollY;
    window.scrollTo({ top: top - HEADER_OFFSET, behavior: "smooth" });
  };

  return (
    <section
      ref={sectionRef}
      className="hero-section"
      style={image ? { backgroundImage: `url(${image})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}
    >
      {/* Background Video */}
      {video && (
        <video
          key={video}
          ref={videoRef}
          className="hero-video"
          autoPlay
          loop
          muted
          playsInline
          poster={image || undefined}
        >
          <source src={video} type={video.endsWith(".webm") ? "video/webm" : "video/mp4"} />
        </video>
      )}

      {/* Dark Overlay */}
      <div className="hero-overlay"></div>

      {/* Content */}
      <div className="hero-content">
        <div className="hero-subtitle">
          <span className="hero-line"></span>
          <span>HAKEEM ALI WAQAS</span>
          <span className="hero-line"></span>
        </div>
        <h1 className="hero-title">{title}</h1>
        {subtitle && <p className="hero-desc">{subtitle}</p>}
      </div>

      {/* Controls: volume + scroll down */}
      <div className="hero-controls">
        {video && (
          <button
            type="button"
            className="hero-ctrl-btn"
            onClick={toggleSound}
            aria-label={muted ? "Unmute video" : "Mute video"}
            aria-pressed={!muted}
          >
            {muted ? <FaVolumeMute /> : <FaVolumeUp />}
          </button>
        )}
        <button
          type="button"
          className="hero-ctrl-btn hero-scroll-btn"
          onClick={scrollToNext}
          aria-label="Scroll down"
        >
          <FaChevronDown className="hero-scroll-icon" />
        </button>
      </div>
    </section>
  );
};

export default Hero;
