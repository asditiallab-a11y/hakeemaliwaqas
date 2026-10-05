import LockIcon from "./LockIcon";

// Default blurred colors (thumbnail na ho to)
const PALETTES = [
  ["#c9622b", "#f0c14b", "#2a1d17", "#141210"],
  ["#1f6f8b", "#4fd1c5", "#0f1f26", "#0b1418"],
  ["#d98a3d", "#f4e3c1", "#2b1c14", "#15100c"],
  ["#8a2b2b", "#e4a05a", "#1e1414", "#100c0c"],
];

const PlayIcon = () => (
  <span
    className="rounded-circle d-flex align-items-center justify-content-center"
    style={{ width: 56, height: 56, background: "rgba(229,9,20,.92)", boxShadow: "0 2px 10px rgba(0,0,0,.4)" }}
    aria-hidden="true"
  >
    <svg width="24" height="24" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" fill="#fff" /></svg>
  </span>
);

// locked=true  -> "Subscribe to Watch" overlay.   locked=false -> poori thumbnail + play button (onPlay se player khulta hai)
export default function VideoCard({
  video, isShort, locked = true, index = 0, onPlay,
  lockTitle = "Subscribe to Watch", lockSub = "یہ ویڈیو دیکھنے کے لیے Subscribe کریں",
}) {
  const p1 = PALETTES[index % PALETTES.length];
  // thumb: apni image, ya youtubeId se automatic YouTube thumbnail
  const thumb =
    video.thumb ||
    (video.youtubeId ? `https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg` : "");
  const canPlay = !locked && (video.youtubeId || video.link);

  return (
    <div
      className="h-100 rounded-2 overflow-hidden"
      style={{ background: "#f5f4f1", border: "1px solid #e4e1da" }}
    >
      {/* Video area */}
      <div className={`ratio ${isShort ? "ratio-9x16" : "ratio-16x9"} bg-black`}>
        <div>
          {!locked && thumb ? (
            <img src={thumb} alt="" className="position-absolute top-0 start-0 w-100 h-100" style={{ objectFit: "cover" }} loading="lazy" />
          ) : (
            /* Blurred thumbnail (upar ka hissa, neeche fade hokar black) */
            <div
              className="position-absolute top-0 start-0 w-100"
              style={{
                height: "36%",
                overflow: "hidden",
                background: "#141414",
                WebkitMaskImage: "linear-gradient(to bottom, #000 55%, transparent)",
                maskImage: "linear-gradient(to bottom, #000 55%, transparent)",
              }}
            >
              {thumb ? (
                <img
                  src={thumb}
                  alt=""
                  className="w-100 h-100"
                  style={{ objectFit: "cover", filter: "blur(10px) brightness(.55)", transform: "scale(1.2)" }}
                />
              ) : (
                /* Thumbnail na ho to ye default blurred design dikhega */
                <div className="w-100 h-100 position-relative" style={{ filter: "blur(12px)", transform: "scale(1.2)" }}>
                  <div
                    className="position-absolute top-0 start-0 w-100 h-100"
                    style={{ background: `linear-gradient(90deg, ${p1[2]}, ${p1[3]} 50%, ${p1[2]})` }}
                  />
                  <div
                    className="position-absolute top-0 h-100"
                    style={{
                      left: "33%",
                      width: "34%",
                      background: `linear-gradient(160deg, ${p1[0]}, ${p1[1]})`,
                      opacity: 0.85,
                    }}
                  />
                </div>
              )}
            </div>
          )}

          {locked ? (
            <div className="position-absolute top-0 start-0 w-100 h-100 d-flex flex-column align-items-center justify-content-center text-center text-white px-2">
              <div
                className="rounded-circle d-flex align-items-center justify-content-center mb-3"
                style={{ width: 56, height: 56, background: "#e50914" }}
              >
                <LockIcon size={24} color="#fff" />
              </div>
              {lockTitle && (
                <div className="fw-semibold" style={{ fontFamily: "Inter, sans-serif", fontSize: 15 }}>
                  {lockTitle}
                </div>
              )}
              {lockSub && (
                <div
                  className="mt-1"
                  style={{ fontSize: 12, color: "rgba(255,255,255,.65)", fontFamily: "'Noto Nastaliq Urdu', serif" }}
                >
                  {lockSub}
                </div>
              )}
            </div>
          ) : canPlay ? (
            <button
              type="button"
              onClick={() => (onPlay ? onPlay(video) : window.open(video.link, "_blank", "noopener"))}
              aria-label={`Play ${video.title}`}
              className="position-absolute top-0 start-0 w-100 h-100 border-0 p-0 d-flex align-items-center justify-content-center"
              style={{ background: "rgba(0,0,0,.18)", cursor: "pointer" }}
            >
              <PlayIcon />
            </button>
          ) : null}
        </div>
      </div>

      {/* Title */}
      <div className="px-3 py-2" style={{ minHeight: 52 }}>
        <div className="fw-bold" dir="auto" style={{ fontFamily: "'Playfair Display', serif", fontSize: 14, color: "#1f2a24" }}>
          {video.title}
        </div>
        {video.description && (
          <div
            className="text-secondary mt-1"
            dir="auto"
            style={{
              fontFamily: "Inter, sans-serif", fontSize: 12, lineHeight: 1.5,
              display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
            }}
          >
            {video.description}
          </div>
        )}
      </div>
    </div>
  );
}
