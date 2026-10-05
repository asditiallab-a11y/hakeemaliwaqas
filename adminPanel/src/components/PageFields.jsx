import { useEffect, useRef, useState } from "react";
import {
  Upload, X, Video, Image as ImageIcon, Undo2, Redo2, Bold, Italic, Underline, Strikethrough,
  List, ListOrdered, Quote, Minus, AlignLeft, AlignCenter, AlignRight,
} from "lucide-react";

const MAX_VIDEO_SEC = 30;

export const Badge = ({ children }) => <span className="pg-badge">{children}</span>;

/* ---------- Image ---------- */
export function ImageField({ value, onChange, size }) {
  const inputRef = useRef(null);

  const pick = (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) return window.alert("Sirf image file select karein.");
    // TODO: yahan API par upload karke URL save karna hai
    const reader = new FileReader();
    reader.onload = () => onChange(reader.result);
    reader.readAsDataURL(file);
  };

  return (
    <div>
      {value ? (
        <div className="pg-media">
          <img src={value} alt="" />
          <button type="button" className="pg-media-x" onClick={() => onChange("")} aria-label="Remove image"><X size={12} /></button>
        </div>
      ) : (
        <div className="pg-media-empty"><ImageIcon size={18} /><span>No image — {size}</span></div>
      )}
      <div className="pg-media-actions">
        <button type="button" className="btn-outline pg-btn" onClick={() => inputRef.current?.click()}>
          <Upload size={14} /> {value ? "Change Image" : "Upload Image"}
        </button>
        {value && (
          <button type="button" className="btn-outline pg-btn pg-btn-sq" onClick={() => onChange("")} aria-label="Remove image"><X size={14} /></button>
        )}
        <input ref={inputRef} type="file" accept="image/*" hidden onChange={pick} />
      </div>
      <p className="pg-hint">Any size accepted — auto-cropped to {size}</p>
    </div>
  );
}

/* ---------- Video (max 30s, MP4 / WebM) ---------- */
export function VideoField({ value, onChange }) {
  const inputRef = useRef(null);
  const [error, setError] = useState("");

  const pick = (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setError("");
    if (!["video/mp4", "video/webm"].includes(file.type)) return setError("Sirf MP4 ya WebM video allowed hai.");
    const url = URL.createObjectURL(file);
    const probe = document.createElement("video");
    probe.preload = "metadata";
    probe.onloadedmetadata = () => {
      if (probe.duration > MAX_VIDEO_SEC + 0.5) {
        URL.revokeObjectURL(url);
        setError(`Video ${MAX_VIDEO_SEC} seconds se zyada hai (${Math.round(probe.duration)}s).`);
      } else {
        onChange(url); // TODO: API par upload karke URL save karna hai
      }
    };
    probe.onerror = () => { URL.revokeObjectURL(url); setError("Video read nahi ho saki."); };
    probe.src = url;
  };

  return (
    <div>
      {value ? (
        <div className="pg-media pg-media-video">
          <video src={value} muted loop autoPlay playsInline />
          <button type="button" className="pg-media-x dark" onClick={() => onChange("")} aria-label="Remove video"><X size={12} /></button>
        </div>
      ) : (
        <div className="pg-media-empty dashed"><Video size={18} /><span>No video — max 30 seconds</span></div>
      )}
      <div className="pg-media-actions">
        <button type="button" className="btn-outline pg-btn" onClick={() => inputRef.current?.click()}>
          <Upload size={14} /> {value ? "Change Video" : "Upload Video"}
        </button>
        {value && (
          <button type="button" className="btn-outline pg-btn pg-btn-sq" onClick={() => onChange("")} aria-label="Remove video"><X size={14} /></button>
        )}
        <input ref={inputRef} type="file" accept="video/mp4,video/webm" hidden onChange={pick} />
      </div>
      <p className="pg-hint">MP4 / WebM — max 30 seconds</p>
      {error && <p className="pg-error">{error}</p>}
    </div>
  );
}

/* ---------- Rich text editor (no extra dependency) ---------- */
const TOOLS = [
  { cmd: "undo", icon: Undo2, label: "Undo" },
  { cmd: "redo", icon: Redo2, label: "Redo" },
  "|",
  { cmd: "formatBlock", arg: "H2", text: "H2", label: "Heading 2", block: "h2" },
  { cmd: "formatBlock", arg: "H3", text: "H3", label: "Heading 3", block: "h3" },
  "|",
  { cmd: "bold", icon: Bold, label: "Bold", state: true },
  { cmd: "italic", icon: Italic, label: "Italic", state: true },
  { cmd: "underline", icon: Underline, label: "Underline", state: true },
  { cmd: "strikeThrough", icon: Strikethrough, label: "Strikethrough", state: true },
  "|",
  { cmd: "insertUnorderedList", icon: List, label: "Bullet list", state: true },
  { cmd: "insertOrderedList", icon: ListOrdered, label: "Numbered list", state: true },
  { cmd: "formatBlock", arg: "BLOCKQUOTE", icon: Quote, label: "Quote", block: "blockquote" },
  { cmd: "insertHorizontalRule", icon: Minus, label: "Divider" },
  "|",
  { cmd: "justifyLeft", icon: AlignLeft, label: "Align left" },
  { cmd: "justifyCenter", icon: AlignCenter, label: "Align center" },
  { cmd: "justifyRight", icon: AlignRight, label: "Align right" },
];

export function RichEditor({ value, onChange, minHeight = 200 }) {
  const ref = useRef(null);
  const [active, setActive] = useState({});

  // sirf pehli baar (aur bahar se value badalne par) HTML set karte hain, warna caret jump karta hai
  useEffect(() => {
    if (ref.current && ref.current.innerHTML !== value) ref.current.innerHTML = value || "";
  }, [value]);

  const refreshState = () => {
    const sel = window.getSelection();
    if (!ref.current || !sel?.anchorNode || !ref.current.contains(sel.anchorNode)) return;
    const next = {};
    TOOLS.forEach((t) => {
      if (typeof t === "string") return;
      if (t.state) next[t.cmd] = document.queryCommandState(t.cmd);
      if (t.block) {
        const el = sel.anchorNode.nodeType === 1 ? sel.anchorNode : sel.anchorNode.parentElement;
        next[t.block] = !!el?.closest(t.block) && ref.current.contains(el.closest(t.block));
      }
    });
    setActive(next);
  };

  useEffect(() => {
    document.addEventListener("selectionchange", refreshState);
    return () => document.removeEventListener("selectionchange", refreshState);
  }, []);

  const run = (t) => {
    ref.current?.focus();
    // heading dobara click karne par normal paragraph
    const arg = t.block && active[t.block] ? "P" : t.arg;
    document.execCommand(t.cmd, false, arg);
    onChange(ref.current.innerHTML);
    refreshState();
  };

  return (
    <div className="pg-rte">
      <div className="pg-rte-bar" role="toolbar" aria-label="Formatting">
        {TOOLS.map((t, i) => {
          if (t === "|") return <span key={i} className="pg-rte-sep" />;
          const on = t.state ? active[t.cmd] : t.block ? active[t.block] : false;
          const Icon = t.icon;
          return (
            <button
              key={i}
              type="button"
              className={`pg-rte-btn ${on ? "on" : ""}`}
              title={t.label}
              aria-label={t.label}
              aria-pressed={!!on}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => run(t)}
            >
              {Icon ? <Icon size={14} /> : <span className="pg-rte-text">{t.text[0]}<sub>{t.text[1]}</sub></span>}
            </button>
          );
        })}
      </div>
      <div
        ref={ref}
        className="pg-rte-body"
        style={{ minHeight }}
        contentEditable
        suppressContentEditableWarning
        onInput={(e) => onChange(e.currentTarget.innerHTML)}
        onKeyUp={refreshState}
        onMouseUp={refreshState}
      />
    </div>
  );
}
