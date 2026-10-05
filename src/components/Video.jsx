import React, { useCallback, useEffect, useState } from "react";
import { ytThumb } from "../lib/siteApi";


const CHANNEL_URL =
  "https://www.youtube.com/@hakeemaliwaqas3335?sub_confirmation=1";
const STORAGE_KEY = "hikmat_videos_unlocked";

// Replace thumbnails / titles / youtube links with your real data.
const defaultVideos = Array.from({ length: 11 }, (_, i) => ({
  id: i + 1,
  tag: "Hikmat Video",
  title: "Mashoor-e-Zamana Khandani Hakeem Prof. Hakeem Ali Waqas",
  thumb: "/images/testimonial.jpg",
  url: "https://www.youtube.com/@hakeemaliwaqas3335",
}));

const getPerView = () => {
  if (typeof window === "undefined") return 4;
  if (window.matchMedia("(min-width: 992px)").matches) return 4;
  if (window.matchMedia("(min-width: 768px)").matches) return 2;
  return 1;
};

/* ---------- small inline icons ---------- */
const LockIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="4" y="11" width="16" height="10" rx="2" />
    <path d="M8 11V7a4 4 0 0 1 8 0v4" />
  </svg>
);

const PlayIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M8 5v14l11-7z" />
  </svg>
);

const YoutubeIcon = ({ size = 32 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="2.5" y="5" width="19" height="14" rx="4" />
    <path d="M10 9.5v5l4.5-2.5z" fill="currentColor" stroke="none" />
  </svg>
);

const CheckCircleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="9" />
    <path d="m8 12.5 2.8 2.8L16 10" />
  </svg>
);

const ArrowIcon = ({ dir = "right" }) => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {dir === "right" ? (
      <>
        <path d="M2 8h11" />
        <path d="M9 3.5 13.5 8 9 12.5" />
      </>
    ) : (
      <>
        <path d="M14 8H3" />
        <path d="M7 3.5 2.5 8 7 12.5" />
      </>
    )}
  </svg>
);

// Admin > Videos: Published "long" videos + "show on home page" switch.  (videos undefined => purana default)
const VideoLibrary = ({ videos: live }) => {
  const videos = live
    ? live.map((v) => ({ id: v.id, tag: "Hikmat Video", title: v.title, thumb: ytThumb(v.youtubeId), url: v.url }))
    : defaultVideos;
  const [perView, setPerView] = useState(getPerView);
  const [index, setIndex] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [step, setStep] = useState(1); // 1 = subscribe, 2 = unlock
  const [unlocked, setUnlocked] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === "1";
    } catch (e) {
      return false;
    }
  });

  const maxIndex = Math.max(0, videos.length - perView);

  /* responsive slides per view */
  useEffect(() => {
    const onResize = () => setPerView(getPerView());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    setIndex((i) => Math.min(i, maxIndex));
  }, [maxIndex]);

  /* lock page scroll + Esc key while popup is open */
  const closeModal = useCallback(() => setModalOpen(false), []);
  useEffect(() => {
    if (!modalOpen) return undefined;
    const onKey = (e) => e.key === "Escape" && closeModal();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [modalOpen, closeModal]);

  const prev = () => setIndex((i) => (i <= 0 ? maxIndex : i - 1));
  const next = () => setIndex((i) => (i >= maxIndex ? 0 : i + 1));

  const handleCardClick = (video) => {
    if (unlocked) {
      window.open(video.url, "_blank", "noopener,noreferrer");
      return;
    }
    setStep(1);
    setModalOpen(true);
  };

  const handleSubscribe = () => {
    window.open(
      CHANNEL_URL,
      "ytSubscribe",
      "width=520,height=700,left=200,top=60,noopener"
    );
    setStep(2);
  };

  const handleUnlock = () => {
    setUnlocked(true);
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch (e) {
      /* ignore */
    }
    setModalOpen(false);
  };

  if (!videos.length) return null;

  return (
    <section className="vl-section" id="videos">
      <div className="container vl-container">
        {/* Header */}
        <div className="row align-items-center vl-head">
          <div className="col-8 col-md-9">
            <span className="vl-label">Video Library</span>
            <h2 className="vl-heading">Watch &amp; Learn</h2>
          </div>
          <div className="col-4 col-md-3 text-end">
            <div className="vl-arrows">
              <button type="button" className="vl-arrow" onClick={prev} aria-label="Previous videos">
                <ArrowIcon dir="left" />
              </button>
              <button type="button" className="vl-arrow" onClick={next} aria-label="Next videos">
                <ArrowIcon dir="right" />
              </button>
            </div>
          </div>
        </div>

        {/* Carousel */}
        <div className="vl-viewport">
          <div
            className="row flex-nowrap vl-track"
            style={{ transform: `translateX(-${(index * 100) / perView}%)` }}
          >
            {videos.map((video) => (
              <div className="col-12 col-md-6 col-lg-3 vl-col" key={video.id}>
                <div
                  className="vl-card"
                  role="button"
                  tabIndex={0}
                  onClick={() => handleCardClick(video)}
                  onKeyDown={(e) =>
                    (e.key === "Enter" || e.key === " ") && handleCardClick(video)
                  }
                >
                  <div className="vl-thumb">
                    <img src={video.thumb} alt={video.title} className="vl-thumb-img" loading="lazy" />
                    <span className="vl-tag">{video.tag}</span>
                    <div className="vl-overlay">
                      <span className="vl-lock">
                        {unlocked ? <PlayIcon /> : <LockIcon />}
                      </span>
                      <span className="vl-lock-text">
                        {unlocked ? "Watch Now" : "Subscribe to Watch"}
                      </span>
                    </div>
                  </div>
                  <div className="vl-card-body">
                    <h3 className="vl-card-title">{video.title}</h3>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dots */}
        <div className="vl-dots" role="tablist" aria-label="Video slides">
          {Array.from({ length: maxIndex + 1 }, (_, i) => (
            <button
              type="button"
              key={i}
              className={`vl-dot${i === index ? " active" : ""}`}
              onClick={() => setIndex(i)}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>

        {/* Button */}
        <div className="text-center">
          <a href="/videos" className="vl-btn">
            <span>View All Videos</span>
            <ArrowIcon dir="right" />
          </a>
        </div>
      </div>

      {/* Popup */}
      {modalOpen && (
        <div className="vl-modal-backdrop" onClick={closeModal}>
          <div
            className="vl-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="vl-modal-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="vl-modal-head">
              <button type="button" className="vl-modal-close" onClick={closeModal} aria-label="Close">
                &times;
              </button>
              <span className="vl-modal-icon">
                <YoutubeIcon />
              </span>
              <h3 id="vl-modal-title" className="vl-modal-title">Subscribe to Watch</h3>
              <p className="vl-modal-sub">Prof Hakeem Ali Waqas — Ancient Wisdom, Modern Healing</p>
            </div>

            <div className="vl-modal-body">
              <p className="vl-urdu vl-modal-msg" dir="rtl">
                یہ ویڈیوز صرف <span dir="ltr">Subscribers</span> کے لیے ہیں۔{" "}
                <span dir="ltr">Subscribe</span> کریں اور تمام ویڈیوز مفت دیکھیں۔
              </p>

              <button
                type="button"
                className={`vl-sub-btn${step === 2 ? " done" : ""}`}
                onClick={handleSubscribe}
              >
                <YoutubeIcon size={18} />
                <span>
                  YouTube Channel Subscribe <span className="vl-urdu">کریں</span>
                </span>
              </button>

              {step === 1 ? (
                <p className="vl-urdu vl-modal-note" dir="rtl">
                  پہلے <span dir="ltr">YouTube</span> <span dir="ltr">Subscribe</span> کریں — پھر{" "}
                  <span dir="ltr">Unlock</span> بٹن ظاہر ہوگا۔
                </p>
              ) : (
                <>
                  <p className="vl-urdu vl-divider" dir="rtl">
                    <span dir="ltr">Subscribe</span> کے بعد
                  </p>
                  <button type="button" className="vl-unlock-btn" onClick={handleUnlock}>
                    <CheckCircleIcon />
                    <span className="vl-urdu" dir="rtl">
                      میں نے <span dir="ltr">Subscribe</span> کر لیا — <span dir="ltr">Videos Unlock</span> کریں
                    </span>
                  </button>
                  <p className="vl-urdu vl-modal-note" dir="rtl">
                    <span dir="ltr">YouTube</span> پر <span dir="ltr">Subscribe</span> کرنے کے بعد اوپر سبز بٹن دبائیں۔
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default VideoLibrary;
