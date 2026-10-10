import { useEffect, useState } from "react";
import VideoCard from "./VideoCard";
import LockIcon from "./LockIcon";
import { longVideos as staticLong, shortVideos as staticShort } from "../../data/videos";

const GOLD = "#d4a017";

const DEFAULT_HEAD = {
  label: "Watch & Learn",
  title: "Video Collection",
  desc: "Educational videos on Hikmat, herbal remedies, and natural healing — in both long-form and short formats",
};
const DEFAULT_CHANNEL = "https://www.youtube.com/@hakeemaliwaqas3335?sub_confirmation=1";
const DEFAULT_NOTICE = { text: "Videos صرف Subscribers کے لیے ہیں", btn: "Subscribe", link: "" };

// Popup player (sirf jab videos unlocked hon)
function Player({ video, isShort, onClose }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={video.title}
      onClick={onClose}
      style={{ position: "fixed", inset: 0, zIndex: 2000, background: "rgba(0,0,0,.8)", display: "flex", alignItems: "center", justifyContent: "center", padding: 12 }}
    >
      <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: isShort ? 380 : 960 }}>
        <div className="d-flex justify-content-between align-items-center mb-2 text-white">
          <span className="fw-semibold small pe-3" dir="auto" style={{ fontFamily: "Inter, sans-serif" }}>{video.title}</span>
          <button type="button" aria-label="Close" onClick={onClose} className="btn btn-sm text-white border-0" style={{ fontSize: 26, lineHeight: 1 }}>×</button>
        </div>
        <div className={`ratio ${isShort ? "ratio-9x16" : "ratio-16x9"} bg-black rounded-3 overflow-hidden`}>
          <iframe
            title={video.title}
            src={`https://www.youtube.com/embed/${video.youtubeId}?autoplay=1&rel=0`}
            allow="autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
    </div>
  );
}

// Subscribe popup (locked video card par click karne se khulta hai): laal header + cream body
const POPUP_TEXT = {
  sub: "Prof Hakeem Ali Waqas — Ancient Wisdom, Modern Healing",
  body: "یہ ویڈیوز صرف Subscribers کے لیے ہیں۔ Subscribe کریں اور تمام ویڈیوز مفت دیکھیں۔",
  btn: "YouTube Channel Subscribe کریں",
  foot: "پہلے YouTube Subscribe کریں — پھر Unlock کا بٹن ظاہر ہوگا۔",
};

function YtIcon({ size = 20, strokeWidth = 2 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="5" width="20" height="14" rx="4" />
      <path d="M10 9.5v5l4.5-2.5z" fill="currentColor" />
    </svg>
  );
}

function SubscribePopup({ title, link, onClose }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 2000, padding: 16,
        background: "rgba(0,0,0,.65)", backdropFilter: "blur(4px)", WebkitBackdropFilter: "blur(4px)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="position-relative overflow-hidden"
        style={{ width: "100%", maxWidth: 448, borderRadius: 20, boxShadow: "0 20px 60px rgba(0,0,0,.5)" }}
      >
        {/* Laal header */}
        <div className="text-center text-white" style={{ background: "#f00", padding: "32px 24px 24px" }}>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="border-0 text-white d-flex align-items-center justify-content-center position-absolute"
            style={{ top: 12, right: 12, width: 44, height: 44, borderRadius: "50%", background: "rgba(0,0,0,.25)", fontSize: 22, lineHeight: 1 }}
          >
            ✕
          </button>
          <div
            className="d-flex align-items-center justify-content-center mx-auto mb-3"
            style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(255,255,255,.2)" }}
          >
            <YtIcon size={30} />
          </div>
          <h3 className="fw-bold mb-2" style={{ fontFamily: "'Playfair Display', serif", fontSize: 22 }}>{title}</h3>
          <div style={{ fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: 14 }}>{POPUP_TEXT.sub}</div>
        </div>

        {/* Cream body */}
        <div className="text-center" style={{ background: "#f5f3ee", padding: "28px 24px 24px" }}>
          <p dir="rtl" className="mb-4" style={{ fontFamily: "'Noto Nastaliq Urdu', serif", color: "#4a4a4a", fontSize: 14, lineHeight: 2.1 }}>
            {POPUP_TEXT.body}
          </p>
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onClose}
            className="d-flex align-items-center justify-content-center gap-2 text-white text-decoration-none"
            style={{ background: "#f00", borderRadius: 12, height: 48, fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: 15 }}
          >
            <YtIcon size={20} /> {POPUP_TEXT.btn}
          </a>
          <p dir="rtl" className="mb-0 mt-3" style={{ fontFamily: "'Noto Nastaliq Urdu', serif", color: "#6c6c6c", fontSize: 12, lineHeight: 2 }}>
            {POPUP_TEXT.foot}
          </p>
        </div>
      </div>
    </div>
  );
}

// Props server (/api/site/videos) se aate hain; na milen to purana static content dikhta hai.
export default function VideoCollection({
  long = staticLong,
  short = staticShort,
  head = DEFAULT_HEAD,
  notice = DEFAULT_NOTICE,
  isSubscriber = false, // true => videos unlock (play hoti hain)
  defaultTab = "long",
  lockTitle,
  lockSub,
}) {
  const first = defaultTab === "long" ? (long.length ? "long" : "short") : short.length ? "short" : "long";
  const [tab, setTab] = useState(first);
  const [playing, setPlaying] = useState(null);
  const [showSub, setShowSub] = useState(false);
  const isShort = tab === "short";
  const videos = isShort ? short : long;

  const tabs = [
    { key: "long", label: "Long Videos", count: long.length },
    { key: "short", label: "Short Videos", count: short.length },
  ];

  return (
    <section className="bg-white py-5">
      <div className="container">
        {/* Heading */}
        <div className="text-center mx-auto" style={{ maxWidth: 680 }}>
          {head.label && (
            <p className="text-uppercase small mb-2" style={{ color: GOLD, letterSpacing: "4px", fontFamily: "Jost, sans-serif" }}>
              {head.label}
            </p>
          )}
          {head.title && (
            <h2 className="fw-bold display-5 mb-3" style={{ fontFamily: "'Playfair Display', serif", color: "#1f2a24" }}>
              {head.title}
            </h2>
          )}
          {head.desc && (
            <p className="text-secondary mb-3" style={{ fontFamily: "Inter, sans-serif" }}>{head.desc}</p>
          )}
          <div className="mx-auto" style={{ width: 60, height: 2, background: GOLD }} />
        </div>

        {/* Subscribers notice */}
        {!isSubscriber && notice.text && (
          <div
            className="d-flex align-items-center justify-content-center gap-2 mx-auto mt-4 px-3 py-2 rounded-2 small"
            style={{ maxWidth: 580, background: "#fdf8e6", border: "1px solid #eadfae", color: "#8a5a10", fontFamily: "Inter, sans-serif" }}
          >
            <LockIcon size={15} />
            <span dir="auto">
              {notice.text}
              {notice.btn && (
                <>
                  {" — "}
                  {notice.link ? (
                    <a href={notice.link} className="fw-bold" style={{ color: "#8a5a10" }}>{notice.btn}</a>
                  ) : (
                    <strong>{notice.btn}</strong>
                  )}
                </>
              )}
            </span>
          </div>
        )}

        {/* Tabs */}
        <div className="d-flex justify-content-center gap-2 my-4">
          {tabs.map((t) => {
            const active = tab === t.key;
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => setTab(t.key)}
                className="btn rounded-pill px-4 py-2 d-flex align-items-center gap-2 small"
                style={{
                  fontFamily: "Inter, sans-serif",
                  background: active ? GOLD : "#fff",
                  color: active ? "#fff" : "#6c757d",
                  border: `1px solid ${active ? GOLD : "#dcdcdc"}`,
                  boxShadow: active ? "0 2px 6px rgba(212,160,23,.4)" : "none",
                }}
              >
                {t.label}
                <span
                  className="rounded-pill px-2"
                  style={{ fontSize: 11, background: active ? "rgba(255,255,255,.3)" : "#ececec", color: active ? "#fff" : "#6c757d" }}
                >
                  {t.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Grid */}
        <div className="row g-3">
          {videos.map((v, i) => (
            <div key={v.id} className="col-12 col-md-6 col-lg-4">
              <VideoCard
                video={v}
                isShort={isShort}
                locked={!isSubscriber}
                index={i}
                lockTitle={lockTitle}
                lockSub={lockSub}
                onPlay={v.youtubeId ? setPlaying : undefined}
                onLockedClick={() => setShowSub(true)}
              />
            </div>
          ))}
          {videos.length === 0 && (
            <p className="text-center text-secondary">
              {isShort ? "Short" : "Long"} videos jald hi add ki jayengi.
            </p>
          )}
        </div>
      </div>

      {showSub && (
        <SubscribePopup
          title={lockTitle || "Subscribe to Watch"}
          link={notice.link || DEFAULT_CHANNEL}
          onClose={() => setShowSub(false)}
        />
      )}
      {playing && <Player video={playing} isShort={isShort} onClose={() => setPlaying(null)} />}
    </section>
  );
}
