import { useRef, useState } from "react";
import { X } from "lucide-react";
import { apiFetch, uploadFile } from "../auth/api.js";
import { mediaSrc } from "../../src/lib/api";

const MAX = 5;

// Medicine ki gallery: max 5 images. Ek hi dafa mein kai images select ho sakti hain, "Save Gallery" par record mein save hoti hain.
export default function GalleryModal({ item, onSave, onClose }) {
  const original = item.gallery || [];
  const [urls, setUrls] = useState(original);
  const [uploading, setUploading] = useState(0); // kitni files abhi upload ho rahi hain
  const [err, setErr] = useState("");
  const [saving, setSaving] = useState(false);
  const input = useRef(null);
  const added = useRef(new Set()); // is session mein upload hui files

  const pick = async (e) => {
    const files = [...(e.target.files || [])];
    e.target.value = "";
    if (!files.length) return;
    setErr("");
    const room = MAX - urls.length - uploading;
    if (files.length > room) setErr(`Sirf ${Math.max(room, 0)} aur image add ho sakti hain (max ${MAX}).`);
    const batch = files.slice(0, Math.max(room, 0));
    setUploading((n) => n + batch.length);
    for (const f of batch) {
      try {
        if (!f.type.startsWith("image/")) throw new Error(`"${f.name}" image nahi hai.`);
        if (f.size > 8 * 1024 * 1024) throw new Error(`"${f.name}" 8MB se badi hai.`);
        const u = await uploadFile(f);
        added.current.add(u);
        setUrls((x) => [...x, u]);
      } catch (ex) {
        setErr(ex.message);
      } finally {
        setUploading((n) => n - 1);
      }
    }
  };

  // band karte waqt jo upload hui files save nahi hui, server unhein saaf kar deta hai
  const finish = (saved) => {
    const keep = new Set(saved || original);
    const stale = [...added.current].filter((u) => !keep.has(u));
    if (stale.length) apiFetch("/api/admin/media/prune", { method: "POST", body: { urls: stale } }).catch(() => {});
    onClose();
  };

  const save = async () => {
    setSaving(true);
    setErr("");
    const { error } = await onSave(item.id, { gallery: urls });
    setSaving(false);
    if (error) return setErr(error);
    finish(urls);
  };

  const slots = Array.from({ length: MAX }, (_, i) => urls[i] || null);
  return (
    <div className="modal-bg" onClick={() => !saving && finish()}>
      <div className="adm-modal gal" role="dialog" aria-modal="true" aria-label={`Gallery ${item.title}`} onClick={(e) => e.stopPropagation()}>
        <div className="im-head">
          <h2>Gallery — {item.title}</h2>
          <button type="button" className="im-x" aria-label="Close" onClick={() => finish()}><X size={16} /></button>
        </div>
        <p className="im-hint"><b style={{ color: "#c26a00" }}>Maximum {MAX} images</b> — ek hi baar mein kai images select kar sakte hain.</p>
        <div className="gal-grid">
          {slots.map((u, i) =>
            u ? (
              <div className="gal-slot filled" key={u}>
                <img src={mediaSrc(u)} alt={`Gallery ${i + 1}`} />
                <button type="button" className="gal-x" aria-label={`Image ${i + 1} hatao`} onClick={() => setUrls((x) => x.filter((y) => y !== u))}><X size={11} /></button>
              </div>
            ) : (
              <button type="button" key={`e${i}`} className="gal-slot" disabled={saving || uploading > 0} onClick={() => input.current?.click()}>
                <span>{i - urls.length < uploading ? "Uploading..." : <><b>+</b>Image Upload</>}</span>
              </button>
            )
          )}
        </div>
        <input ref={input} type="file" accept="image/*" multiple hidden onChange={pick} />
        {err && <p className="im-err" role="alert">{err}</p>}
        <div className="gal-foot">
          <span className="im-hint">{urls.length} / {MAX} images</span>
          <button type="button" className="btn-green" disabled={saving || uploading > 0} onClick={save}>{saving ? "Saving..." : "Save Gallery"}</button>
        </div>
      </div>
    </div>
  );
}
