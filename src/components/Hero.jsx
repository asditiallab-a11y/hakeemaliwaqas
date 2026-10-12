import React, { useEffect, useRef, useState } from "react";
import { val } from "../lib/siteApi";

// Admin > Pages > Home: Hero Background Image / Hero Video. Admin > Settings: Hero Heading / Subtitle.
// - video upload hai -> video chalta hai (image uska poster banti hai)
// - sirf image hai -> sirf image
// - kuch bhi nahi -> purani default video
const DEFAULT_VIDEO = "/images/herovideo.mp4";

const Hero = ({ page, settings }) => {
  const sectionRef = useRef(null);
  const videoRef = useRef(null);
  const [muted, setMuted] = useState(true); // autoplay k liye shuru me mute

  const image = val(page, "heroImage");
  const uploaded = val(page, "heroVideo");
  const video = uploaded || (image ? "" : DEFAULT_VIDEO);
  const title = val(settings, "heroHeading", "Ali Dawakhana");
  const subtitle = val(settings, "heroSubtitle");

  // video change ho to dobara mute se shuru
  useEffect(() => {
    setMuted(true);
  }, [video]);

  // state ko actual video element se sync karo
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = muted;
      if (!muted) videoRef.current.volume = 1;
    }
  }, [muted, video]);

  const toggleSound = () => {
    const v = videoRef.current;
    if (!v) return;
    const next = !muted;
    v.muted = next; // click user gesture hai, isliye browser sound allow karta hai
    if (!next) v.play().catch(() => {});
    setMuted(next);
  };

  const scrollToNext = () => {
    const sec = sectionRef.current;
    if (!sec) return;
    const next = sec.nextElementSibling;
    if (next) {
      next.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      window.scrollTo({ top: sec.offsetHeight, behavior: "smooth" });
    }
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
          ref={videoRef}
          key={video}
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
            title={muted ? "Sound on" : "Sound off"}
          >
            {muted ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor" />
                <line x1="23" y1="9" x2="17" y2="15" />
                <line x1="17" y1="9" x2="23" y2="15" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor" />
                <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
              </svg>
            )}
          </button>
        )}

        <button
          type="button"
          className="hero-ctrl-btn hero-scroll-btn"
          onClick={scrollToNext}
          aria-label="Scroll down"
          title="Scroll down"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
      </div>
    </section>
  );
};

export default Hero;
