import { useState, useEffect } from "react";
import { apiFetch } from "../auth/api.js";
import { Plus } from "lucide-react";
import LeafLoader from "../components/LeafLoader.jsx";

// Data MongoDB se aata hai (server/routes/admin.js -> /api/admin/review-videos)
const API = "/api/admin/review-videos";
const isYoutube = (u) => /^https?:\/\/(www\.|m\.)?(youtube\.com|youtu\.be)\//i.test(u.trim());

const empty = { url: "", name: "", title: "" };

export default function ReviewVideos() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [form, setForm] = useState(null); // null = band, { id?, url, name, title }
  const [touched, setTouched] = useState(false);

  const urlBad = form && touched && form.url.trim() && !isYoutube(form.url);
  const canSave = form && form.url.trim() && isYoutube(form.url);

  const open = (data = empty) => { setForm({ ...data }); setTouched(false); };
  const close = () => setForm(null);

  useEffect(() => {
    let alive = true;
    apiFetch(API)
      .then((d) => alive && setItems(d.items))
      .catch((e) => alive && setErr(e.message))
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, []);

  const save = async (e) => {
    e.preventDefault();
    setTouched(true);
    if (!canSave) return;
    setErr("");
    const { id, url, name, title } = form;
    const body = { url: url.trim(), name: name.trim(), title: title.trim() };
    try {
      const saved = await apiFetch(id ? `${API}/${id}` : API, { method: id ? "PUT" : "POST", body });
      setItems((its) => (id ? its.map((v) => (v.id === id ? saved : v)) : [...its, saved]));
      close();
    } catch (e2) {
      setErr(e2.message);
    }
  };

  const remove = async (v) => {
    if (!window.confirm(`"${v.name || v.url}" delete karni hai?`)) return;
    setErr("");
    try {
      await apiFetch(`${API}/${v.id}`, { method: "DELETE" });
    } catch (e) {
      setErr(e.message);
      return;
    }
    setItems((its) => its.filter((x) => x.id !== v.id));
    if (form?.id === v.id) close();
  };

  // Live/Hidden pehle screen par badalta hai, server fail ho to wapas purana ho jata hai
  const toggleLive = async (id) => {
    const prev = items;
    const live = !items.find((v) => v.id === id).live;
    setErr("");
    setItems(items.map((v) => (v.id === id ? { ...v, live } : v)));
    try {
      await apiFetch(`${API}/${id}`, { method: "PUT", body: { live } });
    } catch (e) {
      setItems(prev);
      setErr(e.message);
    }
  };

  if (loading) return <LeafLoader />;

  return (
    <>
      {err && <p className="empty" style={{ color: "#c0392b", padding: "0 0 12px" }}>{err}</p>}
      <div className="rv-head">
        <h1 className="rv-title">Review Videos ({items.length})</h1>
        <button className="btn-gold" onClick={() => open()}><Plus size={14} /> Add Video</button>
      </div>

      {form && (
        <form className="adm-card rv-form" onSubmit={save}>
          <label className="rv-field">YouTube URL *
            <input
              autoFocus
              value={form.url}
              onChange={(e) => setForm({ ...form, url: e.target.value })}
              onBlur={() => setTouched(true)}
              placeholder="https://youtube.com/shorts/..."
              aria-invalid={!!urlBad}
            />
            {urlBad && <span className="rv-err">Sahi YouTube link daalo (youtube.com ya youtu.be).</span>}
          </label>
          <div className="rv-two">
            <label className="rv-field">Patient Name
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Ali Khan" />
            </label>
            <label className="rv-field">Title (optional)
              <input dir="auto" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Video title" />
            </label>
          </div>
          <div className="rv-actions">
            <button className="btn-gold" disabled={!canSave}>{form.id ? "Update" : "Add"}</button>
            <button type="button" className="btn-mini" onClick={close}>Cancel</button>
          </div>
        </form>
      )}

      <div className="rv-list">
        {items.map((v) => (
          <div className="adm-card rv-row" key={v.id}>
            <div className="rv-info">
              <div className="rv-name">{v.name || v.title || "Untitled"}</div>
              <a className="rv-url" href={v.url} target="_blank" rel="noreferrer">{v.url}</a>
            </div>
            <button
              className={`rv-live ${v.live ? "" : "off"}`}
              onClick={() => toggleLive(v.id)}
              title="Website par dikhana / chhupana"
            >
              {v.live ? "Live" : "Hidden"}
            </button>
            <button className="btn-mini" onClick={() => open(v)}>Edit</button>
            <button className="btn-mini danger" onClick={() => remove(v)}>Del</button>
          </div>
        ))}
        {items.length === 0 && <p className="empty">Abhi koi review video nahi hai. Add Video se pehli daal do.</p>}
      </div>
    </>
  );
}
