import { useState } from "react";
import { Plus } from "lucide-react";

let uid = 100;
const isYoutube = (u) => /^https?:\/\/(www\.|m\.)?(youtube\.com|youtu\.be)\//i.test(u.trim());

// TODO: baad me API se replace karenge
const initial = [
  ["M Hafeez", "https://youtube.com/shorts/53rV7CXvzeE?feature=share", "Stomach Ulcer Treatment ! معدے کے السر کا علاج"],
  ["Female Patient From Narang Mandi", "https://youtube.com/shorts/u8VM7xsPUOA", ""],
  ["Malik Sultan Car Driver", "https://youtube.com/shorts/ZyF62IIjqr8?feature=share", ""],
  ["Arif From Feroze Wattwan", "https://youtube.com/shorts/UH8fAj8ZdgA?feature=share", ""],
  ["Attique Ahmad", "https://youtube.com/shorts/znjIplqox98", ""],
].map(([name, url, title], i) => ({ id: i + 1, name, url, title, live: true }));

const empty = { url: "", name: "", title: "" };

export default function ReviewVideos() {
  const [items, setItems] = useState(initial);
  const [form, setForm] = useState(null); // null = band, { id?, url, name, title }
  const [touched, setTouched] = useState(false);

  const urlBad = form && touched && form.url.trim() && !isYoutube(form.url);
  const canSave = form && form.url.trim() && isYoutube(form.url);

  const open = (data = empty) => { setForm({ ...data }); setTouched(false); };
  const close = () => setForm(null);

  const save = (e) => {
    e.preventDefault();
    setTouched(true);
    if (!canSave) return;
    const data = { ...form, url: form.url.trim(), name: form.name.trim(), title: form.title.trim() };
    setItems(data.id ? items.map((v) => (v.id === data.id ? { ...v, ...data } : v)) : [...items, { ...data, id: ++uid, live: true }]);
    close();
  };

  const remove = (v) => {
    if (!window.confirm(`"${v.name || v.url}" delete karni hai?`)) return;
    setItems(items.filter((x) => x.id !== v.id));
    if (form?.id === v.id) close();
  };
  const toggleLive = (id) => setItems(items.map((v) => (v.id === id ? { ...v, live: !v.live } : v)));

  return (
    <>
      <div className="rv-head">
        <h1 className="rv-title">Review Videos ({items.length})</h1>
        <button className="btn-gold" onClick={() => open()}><Plus size={14} /> Add Video</button>
      </div>

      {form && (
        <form className="card rv-form" onSubmit={save}>
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
          <div className="card rv-row" key={v.id}>
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
