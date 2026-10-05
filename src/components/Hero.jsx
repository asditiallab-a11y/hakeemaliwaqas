import React from "react";
import { val } from "../lib/siteApi";

// Admin > Pages > Home: Hero Background Image / Hero Video.  Admin > Settings: Hero Heading / Subtitle.
//  - video upload hai  -> video chalta hai (image uska poster banti hai)
//  - sirf image hai    -> sirf image
//  - kuch bhi nahi     -> purani default video
const DEFAULT_VIDEO = "/images/herovideo.mp4";

const Hero = ({ page, settings }) => {
  const image = val(page, "heroImage");
  const uploaded = val(page, "heroVideo");
  const video = uploaded || (image ? "" : DEFAULT_VIDEO);
  const title = val(settings, "heroHeading", "Ali Dawakhana");
  const subtitle = val(settings, "heroSubtitle");

  return (
    <section
      className="hero-section"
      style={image ? { backgroundImage: `url(${image})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}
    >
      {/* Background Video */}
      {video && (
        <video key={video} className="hero-video" autoPlay loop muted playsInline poster={image || undefined}>
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
    </section>
  );
};

export default Hero;
