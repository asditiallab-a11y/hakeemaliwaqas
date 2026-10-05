import { useRef, useState } from "react";
import { X, Video as VideoIcon } from "lucide-react";
import { apiFetch } from "../auth/api.js";
import { Badge, ImageField, RichEditor } from "./PageFields.jsx";

/* Treatments / Medicines / Articles / Testimonials ka Add/Edit modal.
   Fields ek config se aati hain (fields: [...]), Urdu wale fields `ur` key se jurte hain.            */

export const YT_RE = /^https?:\/\/(www\.|m\.)?(youtube\.com|youtu\.be)\/.+/i;

// rich editor ka khali HTML ("<p><br></p>") bhi khali maana jaye
export const isEmptyHtml = (h) => !String(h || "").replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim() && !/<hr/i.test(h || "");

const DEFAULTS = { text: "", textarea: "", rich: "", image: "", video: "", rating: 5, categories: [] };

// record mein jitni uploaded files (URL) hain
const urlsOf = (r) => (r ? [r.image, r.brochure, ...(r.gallery || [])].filter(Boolean) : []);

export default function ItemModal({ config, singular, cats, item, onSave, saveSection, onClose }) {
  // categories block ki key hamesha "categories" hai (config mein likhne ki zaroorat nahi)
  const fields = config.fields.map((f) => (f.type === "categories" ? { key: "categories", ...f } : f));
  const bilingual = fields.some((f) => f.ur);
  const edit = !!item?.id;
  const Singular = singular.charAt(0).toUpperCase() + singular.slice(1);

  const [m, setM] = useState(() => {
    const base = { live: true, home: false };
    for (const f of fields) {
      base[f.key] = DEFAULTS[f.type] ?? "";
      if (f.ur) base[f.ur] = "";
    }
    return { ...base, ...(item || {}) };
  });
  const [lang, setLang] = useState("en");
  const [errors, setErrors] = useState({});
  const [formErr, setFormErr] = useState("");
  const [busy, setBusy] = useState(false);

  // Is session mein upload hui files + record ka maujooda (saved) hissa: band karte waqt jo file kisi record mein nahi, wo server se saaf
  const uploads = useRef(new Set());
  const persisted = useRef(item || null);
  const track = (url) => { if (url) uploads.current.add(url); return url; };
  const finish = () => {
    const keep = new Set(urlsOf(persisted.current));
    const stale = [...uploads.current].filter((u) => !keep.has(u));
    if (stale.length) apiFetch("/api/admin/media/prune", { method: "POST", body: { urls: stale } }).catch(() => {});
    onClose();
  };

  const set = (key, v) => {
    setM((x) => ({ ...x, [key]: v }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: "" }));
  };

  const validate = () => {
    const e = {};
    for (const f of fields) {
      const v = m[f.key];
      if (f.required && (f.type === "rich" ? isEmptyHtml(v) : !String(v ?? "").trim())) e[f.key] = `${f.label.replace(/\*$/, "")} zaroori hai`;
      if (f.type === "video" && String(v ?? "").trim() && !YT_RE.test(String(v).trim())) e[f.key] = "Sahi YouTube link daalo (youtube.com ya youtu.be)";
    }
    setErrors(e);
    if (Object.keys(e).length) { setLang("en"); return false; } // zaroori fields English tab par hain
    return true;
  };

  const submit = async (ev) => {
    ev.preventDefault();
    setFormErr("");
    if (!validate()) return;
    const body = { live: m.live, home: m.home };
    for (const f of fields) {
      body[f.key] = typeof m[f.key] === "string" ? m[f.key].trim() : m[f.key];
      if (f.ur) body[f.ur] = m[f.ur];
    }
    setBusy(true);
    const { saved, error } = await onSave(m.id, body);
    setBusy(false);
    if (error) return setFormErr(error);
    persisted.current = saved;
    finish();
  };

  /* ---------- field renderers ---------- */
  const textLike = (f, ur) => {
    const key = ur ? f.ur : f.key;
    const label = ur ? f.labelUr : f.label;
    const ph = ur ? f.placeholderUr : f.placeholder;
    const id = `im-${key}`;
    return (
      <div className={`im-field ${ur ? "rtl" : ""}`} key={key}>
        <label htmlFor={id}>{label}{!ur && f.required ? " *" : ""}</label>
        {f.type === "rich" ? (
          <>
            <RichEditor value={m[key] || ""} onChange={(v) => set(key, v)} minHeight={f.minHeight || 130} dir={ur ? "rtl" : undefined} placeholder={ph} />
            {ur && f.hintUr && <span className="im-hint" dir="rtl">{f.hintUr}</span>}
          </>
        ) : f.type === "textarea" ? (
          <textarea id={id} rows={3} dir={ur ? "rtl" : undefined} placeholder={ph} value={m[key] || ""} maxLength={f.max} onChange={(e) => set(key, e.target.value)} />
        ) : (
          <input id={id} autoFocus={!ur && f === fields[0]} dir={ur ? "rtl" : undefined} placeholder={ph} value={m[key] || ""} maxLength={f.max || 300} onChange={(e) => set(key, e.target.value)} />
        )}
        {errors[key] && <span className="im-err">{errors[key]}</span>}
      </div>
    );
  };

  const other = (f) => {
    switch (f.type) {
      case "categories":
        return (
          <div className="im-field" key="categories">
            <span className="im-label">Categories <small>(select one or more)</small></span>
            <div className="im-cats">
              {cats.map((c) => {
                const on = (m.categories || []).includes(c.name);
                return (
                  <button type="button" key={c.id} className={`im-cat ${on ? "on" : ""}`} aria-pressed={on}
                    onClick={() => set("categories", on ? m.categories.filter((n) => n !== c.name) : [...(m.categories || []), c.name])}>
                    {on && "✓ "}{c.name}
                  </button>
                );
              })}
            </div>
            {!m.categories?.length && <span className="im-hint">No category selected — {singular} will appear under "All"</span>}
          </div>
        );
      case "image":
        return (
          <div className="im-field" key={f.key}>
            <span className="im-label">{f.label} {f.size && <Badge>{f.size.replace("px", "") + "px"}</Badge>}</span>
            <ImageField value={m[f.key]} onChange={(u) => set(f.key, track(u))} size={f.size || "800×600px"} />
          </div>
        );
      case "video":
        return (
          <div className="im-field" key={f.key}>
            <label htmlFor={`im-${f.key}`} className="im-label"><VideoIcon size={13} color="#d4a017" /> Video URL (YouTube)</label>
            <input id={`im-${f.key}`} placeholder="https://youtube.com/watch?v=..." value={m[f.key] || ""} onChange={(e) => set(f.key, e.target.value)} />
            <span className="im-hint">Video will be embedded at the bottom of the {singular} detail page.</span>
            {errors[f.key] && <span className="im-err">{errors[f.key]}</span>}
          </div>
        );
      case "rating":
        return (
          <div className="im-field" key={f.key}>
            <label htmlFor="im-rating">Rating</label>
            <select id="im-rating" value={m[f.key]} onChange={(e) => set(f.key, Number(e.target.value))}>
              {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{"★".repeat(n)}{"☆".repeat(5 - n)} ({n})</option>)}
            </select>
          </div>
        );
      default:
        return null;
    }
  };

  const isPrimary = (f) => ["text", "textarea", "rich"].includes(f.type);
  const primary = fields.filter(isPrimary);
  const secondary = fields.filter((f) => !isPrimary(f));
  const Extras = edit ? config.extras : null;
  const submitLabel = edit ? "Update" : `Add ${Singular}`;

  const toggle = (key, title, desc) => (
    <div className="im-toggle">
      <div><b>{title}</b><span className="d">{desc}</span></div>
      <button type="button" role="switch" aria-checked={!!m[key]} aria-label={title} className={`switch ${m[key] ? "on" : ""}`} onClick={() => setM((x) => ({ ...x, [key]: !x[key] }))}><span /></button>
    </div>
  );

  return (
    <div className="modal-bg" onClick={() => !busy && finish()}>
      <div className="adm-modal im" role="dialog" aria-modal="true" aria-label={`${edit ? "Edit" : "Add"} ${singular}`} onClick={(e) => e.stopPropagation()}>
        <div className="im-head">
          <h2>{edit ? "Edit" : "Add"} {Singular}</h2>
          <button type="button" className="im-x" aria-label="Close" onClick={finish}><X size={16} /></button>
        </div>

        {bilingual && (
          <div className="im-tabs" role="tablist">
            <button type="button" role="tab" aria-selected={lang === "en"} className={`im-tab ${lang === "en" ? "on" : ""}`} onClick={() => setLang("en")}>English</button>
            <button type="button" role="tab" aria-selected={lang === "ur"} className={`im-tab ${lang === "ur" ? "on" : ""}`} onClick={() => setLang("ur")}>اردو</button>
          </div>
        )}

        <form id="im-form" noValidate onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {lang === "en" || !bilingual ? primary.map((f) => textLike(f, false)) : primary.filter((f) => f.ur).map((f) => textLike(f, true))}
          {secondary.map(other)}
          {toggle("home", "Show on Home Page", `Feature this item on the website homepage`)}
          {toggle("live", "Show on Website", "Toggle to publish or hide this item")}
          {formErr && <p className="im-err" role="alert">{formErr}</p>}
          <div className="im-actions">
            <button className="btn-gold" disabled={busy}>{busy ? "Saving..." : submitLabel}</button>
            <button type="button" className="btn-outline" onClick={finish}>Cancel</button>
          </div>
        </form>

        {Extras && (
          <>
            <Extras item={persisted.current} saveSection={async (patch) => {
              const r = await saveSection(item.id, patch);
              if (r.saved) persisted.current = r.saved;
              return r;
            }} track={track} />
            <div className="im-actions">
              <button type="submit" form="im-form" className="btn-dark" disabled={busy}>{busy ? "Saving..." : `Update ${Singular}`}</button>
              <button type="button" className="btn-outline" onClick={finish}>Cancel</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
