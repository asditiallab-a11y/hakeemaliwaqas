import { useEffect, useState } from "react";
import { apiFetch } from "../auth/api.js";
import { ArrowDownUp, Plus, SquarePen, Eye, EyeOff, Trash2, X, ChevronLeft, ChevronRight } from "lucide-react";
import LeafLoader from "../components/LeafLoader.jsx";

// Data MongoDB se aata hai (server/routes/admin.js -> /api/admin/videos)
const API = "/api/admin/videos";

// YouTube link se video ID nikalta hai (youtu.be, watch?v=, shorts/, embed/, live/)
const ytId = (u = "") => {
  const m = u.trim().match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/|live\/))([\w-]{11})/i);
  return m ? m[1] : null;
};

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
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
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

  useEffect(() => {
    let alive = true;
    apiFetch(API)
      .then((d) => { if (alive) { setItems(d.items); setHomeSlider(d.homeSlider); } })
      .catch((e) => alive && setErr(e.message))
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, []);

  const save = async (e) => {
    e.preventDefault();
    setTouched(true);
    if (!canSave) return;
    setErr("");
    const { id, type, title, url, description, published } = form;
    const body = { type, title: title.trim(), url: url.trim(), description: description.trim(), published };
    try {
      const saved = await apiFetch(id ? `${API}/${id}` : API, { method: id ? "PUT" : "POST", body });
      setItems((its) => (id ? its.map((v) => (v.id === id ? saved : v)) : [...its, saved]));
      setForm(null);
    } catch (e2) {
      setErr(e2.message);
    }
  };

  const remove = async (v) => {
    if (!window.confirm(`"${v.title}" delete karni hai?`)) return;
    setErr("");
    try {
      await apiFetch(`${API}/${v.id}`, { method: "DELETE" });
    } catch (e) {
      setErr(e.message);
      return;
    }
    setItems((its) => its.filter((x) => x.id !== v.id));
  };

  // Live/Hidden aur home slider switch pehle screen par badalte hain, server fail ho to wapas purana ho jata hai
  const togglePublished = async (id) => {
    const prev = items;
    const published = !items.find((v) => v.id === id).published;
    setErr("");
    setItems(items.map((v) => (v.id === id ? { ...v, published } : v)));
    try {
      await apiFetch(`${API}/${id}`, { method: "PUT", body: { published } });
    } catch (e) {
      setItems(prev);
      setErr(e.message);
    }
  };
  const toggleHomeSlider = async () => {
    const next = !homeSlider;
    setErr("");
    setHomeSlider(next);
    try {
      await apiFetch("/api/admin/video-settings", { method: "PUT", body: { homeSlider: next } });
    } catch (e) {
      setHomeSlider(!next);
      setErr(e.message);
    }
  };

  // reorder sirf usi tab ki videos ke andar hota hai
  const move = async (id, dir) => {
    const idxs = items.map((v, i) => (v.type === tab ? i : -1)).filter((i) => i >= 0);
    const pos = idxs.findIndex((i) => items[i].id === id);
    const target = idxs[pos + dir];
    if (target === undefined) return;
    const prev = items;
    const next = [...items];
    [next[idxs[pos]], next[target]] = [next[target], next[idxs[pos]]];
    setItems(next);
    setErr("");
    try {
      await apiFetch(`${API}/reorder`, { method: "POST", body: { type: tab, ids: next.filter((v) => v.type === tab).map((v) => v.id) } });
    } catch (e) {
      setItems(prev);
      setErr(e.message);
    }
  };

  if (loading) return <LeafLoader />;

  return (
    <>
      {err && <p className="empty" style={{ color: "#c0392b", padding: "0 0 12px" }}>{err}</p>}
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

      <section className="adm-card vid-setting">
        <div>
          <div className="vid-setting-title">Show Video Slider on Home Page</div>
          <div className="vid-setting-sub">
            {homeSlider ? "Videos section is currently visible on the home page" : "Videos section is currently hidden from the home page"}
          </div>
        </div>
        <button role="switch" aria-checked={homeSlider} aria-label="Show video slider on home page" className={`switch ${homeSlider ? "on" : ""}`} onClick={toggleHomeSlider}>
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
          <article className="adm-card vid-card" key={v.id}>
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
          <form className="adm-modal vmodal" onClick={(e) => e.stopPropagation()} onSubmit={save}>
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
