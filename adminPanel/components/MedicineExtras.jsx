import { useRef, useState } from "react";
import { Plus, X } from "lucide-react";
import { uploadFile } from "../auth/api.js";
import { mediaSrc } from "../../src/lib/api";

/* Medicine edit modal ke neeche ke hisse: Brochure PDF, Specifications (English / Urdu / Hero), Price.
   Har hissa apna alag "Save" button rakhta hai aur turant us record par save hota hai.                  */

// section ka chhota status ("Saved" / error)
function useStatus() {
  const [s, setS] = useState({ ok: "", err: "" });
  const timer = useRef(null);
  const show = (ok, err = "") => {
    setS({ ok, err });
    clearTimeout(timer.current);
    if (ok) timer.current = setTimeout(() => setS({ ok: "", err: "" }), 2500);
  };
  return [s, show];
}
const Status = ({ s }) => (s.err ? <span className="im-err" role="alert">{s.err}</span> : s.ok ? <span className="im-ok" role="status">{s.ok}</span> : null);

function Brochure({ item, saveSection, track }) {
  const input = useRef(null);
  const [busy, setBusy] = useState(false);
  const [st, show] = useStatus();
  const url = item?.brochure || "";

  const pick = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (file.type !== "application/pdf") return show("", "Sirf PDF file select karein.");
    if (file.size > 20 * 1024 * 1024) return show("", "PDF 20MB se badi hai.");
    setBusy(true);
    try {
      const u = track(await uploadFile(file));
      const r = await saveSection({ brochure: u });
      show(r.error ? "" : "Brochure saved", r.error || "");
    } catch (err) {
      show("", err.message);
    } finally {
      setBusy(false);
    }
  };
  const remove = async () => {
    setBusy(true);
    const r = await saveSection({ brochure: "" });
    setBusy(false);
    show(r.error ? "" : "Brochure removed", r.error || "");
  };

  return (
    <div className="im-sec">
      <h4>Brochure PDF</h4>
      <div className="im-file">
        <button type="button" className="btn-dark" disabled={busy} onClick={() => input.current?.click()}>{busy ? "Uploading..." : url ? "Change PDF" : "+ PDF Upload"}</button>
        {url && (
          <>
            <a href={mediaSrc(url)} target="_blank" rel="noreferrer">View brochure</a>
            <button type="button" className="btn-outline" disabled={busy} onClick={remove}>Remove</button>
          </>
        )}
        <input ref={input} type="file" accept="application/pdf" hidden onChange={pick} />
        <Status s={st} />
      </div>
    </div>
  );
}

function SpecSection({ title, field, max, item, saveSection, rtl, saveLabel }) {
  const [rows, setRows] = useState(() => (item?.[field] || []).map((r) => ({ k: r.k || "", v: r.v || "" })));
  const [busy, setBusy] = useState(false);
  const [st, show] = useStatus();
  const upd = (i, key, v) => setRows((rs) => rs.map((r, j) => (j === i ? { ...r, [key]: v } : r)));

  const save = async () => {
    setBusy(true);
    const clean = rows.filter((r) => r.k.trim() || r.v.trim());
    const r = await saveSection({ [field]: clean });
    setBusy(false);
    if (!r.error) setRows(clean);
    show(r.error ? "" : "Saved", r.error || "");
  };

  return (
    <div className="im-sec">
      <h4>{title} <small>({rows.length} / {max})</small></h4>
      {rows.map((r, i) => (
        <div className={`im-row ${rtl ? "rtl" : ""}`} key={i}>
          <input dir={rtl ? "rtl" : undefined} aria-label={`${title} naam ${i + 1}`} value={r.k} maxLength={200} onChange={(e) => upd(i, "k", e.target.value)} />
          <input dir={rtl ? "rtl" : undefined} aria-label={`${title} value ${i + 1}`} value={r.v} maxLength={400} onChange={(e) => upd(i, "v", e.target.value)} />
          <button type="button" className="rm" aria-label="Row hatao" onClick={() => setRows((rs) => rs.filter((_, j) => j !== i))}><X size={13} /></button>
        </div>
      ))}
      <div className="im-sec-actions">
        <button type="button" className="btn-outline" disabled={rows.length >= max} onClick={() => setRows((rs) => [...rs, { k: "", v: "" }])}><Plus size={13} /> Row Add</button>
        <button type="button" className="btn-dark" disabled={busy} onClick={save}>{busy ? "Saving..." : saveLabel}</button>
        <Status s={st} />
      </div>
    </div>
  );
}

function Price({ item, saveSection }) {
  const [price, setPrice] = useState(item?.price ?? "");
  const [oldPrice, setOldPrice] = useState(item?.oldPrice ?? "");
  const [busy, setBusy] = useState(false);
  const [st, show] = useStatus();
  const save = async () => {
    setBusy(true);
    const r = await saveSection({
      price: price === "" ? null : Number(price),
      oldPrice: oldPrice === "" ? null : Number(oldPrice),
    });
    setBusy(false);
    show(r.error ? "" : "Price saved", r.error || "");
  };
  return (
    <div className="im-sec">
      <h4>Price</h4>
      <div className="im-price">
        <input type="number" min="0" step="any" inputMode="decimal" aria-label="Price" placeholder="Price e.g. 1200" value={price} onChange={(e) => setPrice(e.target.value)} />
        <input type="number" min="0" step="any" inputMode="decimal" aria-label="Old price" placeholder="Old price (cut) e.g. 2200" value={oldPrice} onChange={(e) => setOldPrice(e.target.value)} />
        <button type="button" className="btn-dark" disabled={busy} onClick={save}>{busy ? "Saving..." : "Save Price"}</button>
      </div>
      <small style={{ display: "block", marginTop: 6, color: "#7a8079" }}>Old price sirf tab website par cut ke saath dikhti hai jab wo Price se zyada ho. Khali chhodein to nahi dikhegi.</small>
      <Status s={st} />
    </div>
  );
}

export default function MedicineExtras({ item, saveSection, track }) {
  return (
    <>
      <Brochure item={item} saveSection={saveSection} track={track} />
      <SpecSection title="Specifications" field="specs" max={20} item={item} saveSection={saveSection} saveLabel="Specs Save" />
      <SpecSection title="Specifications (Urdu)" field="specsUr" max={20} item={item} saveSection={saveSection} rtl saveLabel="Urdu Save" />
      <SpecSection title="Specifications (Hero)" field="specsHero" max={6} item={item} saveSection={saveSection} saveLabel="Hero Save" />
      <Price item={item} saveSection={saveSection} />
    </>
  );
}
