/**
 * Bootstrap based Hero Section
 * Props:
 *  - image:   background image (URL ya /images/xyz.jpg)  <-- yahan se image change karo
 *  - label:   chota gold text (uppercase)
 *  - title:   bara white heading
 *  - height:  hero ki height (default 620px, mobile par khud chhoti ho jati hai)
 *  - overlay: dark overlay 0 se 1 (default 0.6)
 *  - video:   optional background video (MP4/WebM); image uska poster ban jati hai
 */
export default function HeroSection({
  image = "/images/hero-bg.jpg",
  label = "HIKMAT VIDEO LIBRARY",
  title = "Videos",
  height = "620px",
  overlay = 0.6,
  video = "",
}) {
  return (
    <section
      className="hero-banner position-relative d-flex align-items-center justify-content-center text-center overflow-hidden border-top border-3"
      style={{
        "--hero-h": height,
        backgroundColor: "#0d1410",
        backgroundImage: image ? `url(${image})` : "none",
        backgroundSize: "cover",
        backgroundPosition: "center",
        borderColor: "#b8892b",
      }}
    >
      {video && (
        <video
          key={video}
          className="position-absolute top-0 start-0 w-100 h-100"
          style={{ objectFit: "cover" }}
          autoPlay loop muted playsInline poster={image || undefined}
        >
          <source src={video} type={video.endsWith(".webm") ? "video/webm" : "video/mp4"} />
        </video>
      )}

      {/* Dark overlay */}
      <div
        className="position-absolute top-0 start-0 w-100 h-100"
        style={{ background: `rgba(0,0,0,${overlay})` }}
      />

      {/* Content */}
      <div className="position-relative px-3 py-5">
        <p
          className="text-uppercase fw-medium small mb-2"
          style={{ color: "#d9a21b", letterSpacing: "3px", fontFamily: "Jost, sans-serif" }}
        >
          {label}
        </p>
        <h1
          className="text-white fw-bold display-3 mb-0"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          {title}
        </h1>
      </div>
    </section>
  );
}
