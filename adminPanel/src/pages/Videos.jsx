import { useEffect, useState } from "react";
import { ArrowDownUp, Plus, SquarePen, Eye, EyeOff, Trash2, X, ChevronLeft, ChevronRight } from "lucide-react";

let uid = 1000;

// YouTube link se video ID nikalta hai (youtu.be, watch?v=, shorts/, embed/, live/)
const ytId = (u = "") => {
  const m = u.trim().match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/|live\/))([\w-]{11})/i);
  return m ? m[1] : null;
};

const D = "Prof. Hakeem Ali Waqas | پروفیسر حکیم علی وقاص خاندانی سنیاسی | Desi Shadi Course | 00923015959598 | 00923111033392";
const mk = (type, rows) =>
  rows.map(([title, description = D, url = ""]) => ({ id: ++uid, type, title, description, url, published: true }));

// TODO: API se aayega. Sirf pehli video ka link maloom tha, baaki ke links `url` me daal dena.
const initial = [
  ...mk("long", [
    ["Complete Maha Ras (Hera,Paara,Sona) Ke Sanyasi Kakh | مہارس(ہیرے،پارے،سونے) کے سنیاسی ککھ Guide to Diabetes Treatment with Herbal Medicine | Hakeem Ali Waqas",
      "Complete Maha Ras (Hera,Paara,Sona) Ke Sanyasi Kakh | مہارس(ہیرے،پارے،سونے) کے سنیاسی ککھ Guide to Diabetes Treatment with Herbal Medicine | Hakeem Ali Waqas | 00923111033392 |",
      "https://youtu.be/ibwS6ucuAV0"],
    ["Mashoor-e-Zamana Khandani Hakeem Prof. Hakeem Ali Waqas", "Hikmat ke Badshah | | 00923015959598 پروفیسر حکیم علی وقاص خاندانی سنیاسی 00923111033392"],
    ["Sanyasi Ras, Kushta Jaat, Tilla & Special Shadi Course"],
    ["Emotional Interview with Anchor and Hakeem Sahab! Heartfelt Reactions from Patients"],
    ["Zinda Sheron Walay Hakeem ka Interview | Lahore Me Aisa Hakeem Jo Sher Ki Charbi Se Ilaj Karta Hai"],
    ["Majoon Shadi Course | معجون شادی کورس"],
    ["How to Prepare Kam Dev Ras | کام دیو رس بنانے کا طریقہ", "Kam Dev Ras Banane ka Tariqa | کام دیو رس بنانے کا طریقہ | काम देव रस तैयारी की विधि | 00923111033392 | 00923015959598"],
    ["Chandaroday Ras Kastori Heeray Wala - Live Banta Dekhain - چندراودے رس کستوری ہیرے والا", "Chandaroday Ras Kastori Heeray Wala | | چندراودے رس کستوری ہیرے والا | 00923015959598 | 00923111033392"],
  ]),
  ...mk("short", [
    ["Marz Ki Tashkhees 9 | Professor Hakeem Ali Waqas"],
    ["Kam Dev Ras | Heray Ke Kakh | Professor Hakeem Ali Waqas"],
    ["Enlarge Prostate Free Medicine 3 | Professor Hakeem Ali Waqas"],
    ["Jalaq ke Nuqsan 4 | Professor Hakeem Ali Waqas"],
    ["Marz Ki Tashkhees 8 | Professor Hakeem Ali Waqas"],
    ["Heray Or Sone ke kakh | Professor Hakeem Ali Waqas"],
    ["Majoon Shadi course | Professor Hakeem Ali Waqas"],
    ["Majoon Shadi course | Professor Hakeem Ali Waqas"],
  ]),
];

const PlayBtn = () => (
  <span className="yt-play" aria-hidden="true">
    <svg width="20" height="20" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" fill="#fff" /></svg>
  </span>
);

function Thumb({ v }) {
  const id = ytId(v.url);
  const inner = (
    <>
      {id && (
        <img
          src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`}
          alt=""
          loading="lazy"
          onError={(e) => (e.currentTarget.style.display = "none")}
        />
      )}
      <PlayBtn />
    </>
  );
  const cls = `vid-thumb ${v.type}`;
  return id ? (
    <a className={cls} href={`https://youtu.be/${id}`} target="_blank" rel="noreferrer" aria-label={`Watch ${v.title}`}>{inner}</a>
  ) : (
    <div className={cls}>{inner}</div>
  );
}

export default function Videos() {
  const [items, setItems] = useState(initial);
  const [tab, setTab] = useState("long");
  const [homeSlider, setHomeSlider] = useState(true);
  const [reorder, setReorder] = useState(false);
  const [form, setForm] = useState(null); // { id?, type, title, url, description, published }
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (!form) return;
    const onKey = (e) => e.key === "Escape" && setForm(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [form]);

  const counts = { long: items.filter((v) => v.type === "long").length, short: items.filter((v) => v.type === "short").length };
  const published = items.filter((v) => v.published).length;
  const list = items.filter((v) => v.type === tab);

  const formId = form ? ytId(form.url) : null;
  const canSave = form && form.title.trim() && formId;
  const urlBad = form && touched && form.url.trim() && !formId;

  const openAdd = () => { setForm({ type: tab, title: "", url: "", description: "", published: true }); setTouched(false); };
  const openEdit = (v) => { setForm({ ...v }); setTouched(false); };

  const save = (e) => {
    e.preventDefault();
    setTouched(true);
    if (!canSave) return;
    const data = { ...form, title: form.title.trim(), url: form.url.trim(), description: form.description.trim() };
    setItems(data.id ? items.map((v) => (v.id === data.id ? data : v)) : [...items, { ...data, id: ++uid }]);
    setForm(null);
  };

  const remove = (v) => {
    if (window.confirm(`"${v.title}" delete karni hai?`)) setItems(items.filter((x) => x.id !== v.id));
  };
  const togglePublished = (id) => setItems(items.map((v) => (v.id === id ? { ...v, published: !v.published } : v)));

  // reorder sirf usi tab ki videos ke andar hota hai
  const move = (id, dir) => {
    const idxs = items.map((v, i) => (v.type === tab ? i : -1)).filter((i) => i >= 0);
    const pos = idxs.findIndex((i) => items[i].id === id);
    const target = idxs[pos + dir];
    if (target === undefined) return;
    const next = [...items];
    [next[idxs[pos]], next[target]] = [next[target], next[idxs[pos]]];
    setItems(next);
  };

  return (
    <>
      <div className="list-head">
        <div>
          <h1 className="page-title">Videos</h1>
          <p className="page-sub" style={{ marginBottom: 0 }}>{items.length} total • {published} published</p>
        </div>
        <div className="head-actions">
          <button className="btn-outline" onClick={() => setReorder(!reorder)}><ArrowDownUp size={14} /> {reorder ? "Done" : "Reorder"}</button>
          <button className="btn-gold" onClick={openAdd}><Plus size={14} /> Add Video</button>
        </div>
      </div>

      <section className="card vid-setting">
        <div>
          <div className="vid-setting-title">Show Video Slider on Home Page</div>
          <div className="vid-setting-sub">
            {homeSlider ? "Videos section is currently visible on the home page" : "Videos section is currently hidden from the home page"}
          </div>
        </div>
        <button role="switch" aria-checked={homeSlider} aria-label="Show video slider on home page" className={`switch ${homeSlider ? "on" : ""}`} onClick={() => setHomeSlider(!homeSlider)}>
          <span />
        </button>
      </section>

      <div className="tabs" role="tablist">
        {[["long", "Long Videos"], ["short", "Short Videos"]].map(([k, label]) => (
          <button key={k} role="tab" aria-selected={tab === k} className={`tab ${tab === k ? "on" : ""}`} onClick={() => setTab(k)}>
            {label} <span className="tab-count">{counts[k]}</span>
          </button>
        ))}
      </div>

      <div className="vid-grid">
        {list.map((v, i) => (
          <article className="card vid-card" key={v.id}>
            <Thumb v={v} />
            {reorder && (
              <div className="vid-move">
                <button onClick={() => move(v.id, -1)} disabled={i === 0} aria-label="Pehle laao"><ChevronLeft size={16} /></button>
                <button onClick={() => move(v.id, 1)} disabled={i === list.length - 1} aria-label="Baad me bhejo"><ChevronRight size={16} /></button>
              </div>
            )}
            <div className="vid-body">
              <div className="vid-title-row">
                <h3 dir="auto">{v.title}</h3>
                <span className={`vid-badge ${v.published ? "" : "off"}`}>{v.published ? "Live" : "Hidden"}</span>
              </div>
              <p className="vid-desc" dir="auto">{v.description}</p>
              <div className="vid-actions">
                <button className="vid-edit" onClick={() => openEdit(v)}><SquarePen size={14} /> Edit</button>
                <button className="vid-sq" onClick={() => togglePublished(v.id)} aria-label={v.published ? "Hide video" : "Show video"} title={v.published ? "Hide" : "Show"}>
                  {v.published ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
                <button className="vid-sq del" onClick={() => remove(v)} aria-label="Delete video"><Trash2 size={16} /></button>
              </div>
            </div>
          </article>
        ))}
        {list.length === 0 && <p className="empty">Is tab me abhi koi video nahi hai.</p>}
      </div>

      {form && (
        <div className="modal-bg" onClick={() => setForm(null)}>
          <form className="modal vmodal" onClick={(e) => e.stopPropagation()} onSubmit={save}>
            <div className="vmodal-head">
              <h2>{form.id ? "Edit Video" : `Add ${form.type === "long" ? "Long" : "Short"} Video`}</h2>
              <button type="button" className="vmodal-x" onClick={() => setForm(null)} aria-label="Close"><X size={18} /></button>
            </div>

            <label className="vfield">Title *
              <input autoFocus dir="auto" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Video title" />
            </label>
            <label className="vfield">YouTube URL *
              <input
                value={form.url}
                onChange={(e) => setForm({ ...form, url: e.target.value })}
                onBlur={() => setTouched(true)}
                placeholder="https://www.youtube.com/watch?v=... or youtu.be/..."
                aria-invalid={!!urlBad}
              />
              {formId && <span className="vhint">Embed: https://www.youtube.com/embed/{formId}</span>}
              {urlBad && <span className="rv-err">Sahi YouTube link daalo.</span>}
            </label>
            <label className="vfield">Description (optional)
              <textarea dir="auto" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Brief description..." />
            </label>
            <label className="check">
              <input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} /> Published (visible on website)
            </label>

            <div className="vmodal-actions">
              <button className="btn-gold grow" disabled={!canSave}>{form.id ? "Update" : "Add Video"}</button>
              <button type="button" className="btn-outline" onClick={() => setForm(null)}>Cancel</button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
