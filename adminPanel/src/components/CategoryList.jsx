import { useState } from "react";
import {
  Tag, SquarePen, X, Plus, ArrowUpDown, ArrowDownUp, Trash2, Eye, Star,
  ChevronLeft, ChevronRight, ChevronUp, ChevronDown,
} from "lucide-react";

const PAGE_SIZE = 8;
let uid = 1000;
const fmt = (d) => (d ? d.split("-").reverse().join("/") : ""); // 2026-04-10 -> 10/04/2026

export default function CategoryList({ heading, singular, nameLabel, catPlaceholder, gallery, categories, items: startItems, titleLabel, renderSub, renderFields, newItem = {} }) {
  const hasCats = !!categories; // categories na do to category box/field hide ho jate hain, date dikhti hai
  const [cats, setCats] = useState(categories || []);
  const [newCat, setNewCat] = useState("");
  const [editCat, setEditCat] = useState(null); // { id, value }
  const [items, setItems] = useState(startItems);
  const [sortDir, setSortDir] = useState("asc"); // "asc" | "desc" | null
  const [reorder, setReorder] = useState(false);
  const [selected, setSelected] = useState(new Set());
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState(null); // { id?, title, category, live, home }

  /* ---------- Categories ---------- */
  const addCat = (e) => {
    e.preventDefault();
    const name = newCat.trim();
    if (!name || cats.some((c) => c.name.toLowerCase() === name.toLowerCase())) return;
    setCats([...cats, { id: ++uid, name }]);
    setNewCat("");
  };
  const saveCat = () => {
    const name = editCat.value.trim();
    const old = cats.find((c) => c.id === editCat.id);
    if (name && name !== old.name) {
      setCats(cats.map((c) => (c.id === old.id ? { ...c, name } : c)));
      setItems(items.map((t) => (t.category === old.name ? { ...t, category: name } : t)));
    }
    setEditCat(null);
  };
  const removeCat = (c) => {
    if (window.confirm(`"${c.name}" category delete karni hai?`)) setCats(cats.filter((x) => x.id !== c.id));
  };

  /* ---------- List ---------- */
  const view = sortDir
    ? [...items].sort((a, b) => a.title.localeCompare(b.title) * (sortDir === "asc" ? 1 : -1))
    : items;
  const pages = Math.max(1, Math.ceil(view.length / PAGE_SIZE));
  const cur = Math.min(page, pages);
  const rows = view.slice((cur - 1) * PAGE_SIZE, cur * PAGE_SIZE);

  const toggleSort = () => setSortDir(sortDir === "asc" ? "desc" : "asc");
  const toggleReorder = () => {
    if (!reorder) setItems(view); // current order ko manual order bana do
    if (!reorder) setSortDir(null);
    setReorder(!reorder);
  };
  const move = (id, dir) => {
    const i = items.findIndex((t) => t.id === id);
    const j = i + dir;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[i], next[j]] = [next[j], next[i]];
    setItems(next);
  };

  const toggleOne = (id) => {
    const s = new Set(selected);
    s.has(id) ? s.delete(id) : s.add(id);
    setSelected(s);
  };
  const allSelected = items.length > 0 && selected.size === items.length;
  const toggleAll = () => setSelected(allSelected ? new Set() : new Set(items.map((t) => t.id)));

  const remove = (ids, msg) => {
    if (!window.confirm(msg)) return;
    setItems(items.filter((t) => !ids.includes(t.id)));
    setSelected(new Set());
  };

  const openAdd = () => setModal({ title: "", category: cats[0]?.name || "", date: new Date().toISOString().slice(0, 10), live: true, home: false, ...newItem });
  const saveModal = (e) => {
    e.preventDefault();
    if (!modal.title.trim()) return;
    const data = { ...modal, title: modal.title.trim() };
    setItems(data.id ? items.map((t) => (t.id === data.id ? data : t)) : [...items, { ...data, id: ++uid }]);
    setModal(null);
  };

  return (
    <>
      {hasCats && (
      <section className="card cat-box">
        <div className="cat-head">
          <Tag size={15} color="#d4a017" />
          <span className="cat-title">Manage Categories</span>
          <span className="muted">({cats.length} total)</span>
        </div>
        <div className="chips">
          {cats.map((c) =>
            editCat?.id === c.id ? (
              <span className="chip editing" key={c.id}>
                <input
                  autoFocus
                  value={editCat.value}
                  onChange={(e) => setEditCat({ ...editCat, value: e.target.value })}
                  onKeyDown={(e) => (e.key === "Enter" ? saveCat() : e.key === "Escape" && setEditCat(null))}
                  onBlur={saveCat}
                />
              </span>
            ) : (
              <span className="chip" key={c.id}>
                {c.name}
                <button aria-label={`Edit ${c.name}`} onClick={() => setEditCat({ id: c.id, value: c.name })}><SquarePen size={12} /></button>
                <button aria-label={`Delete ${c.name}`} onClick={() => removeCat(c)}><X size={12} /></button>
              </span>
            )
          )}
        </div>
        <form className="cat-form" onSubmit={addCat}>
          <input value={newCat} onChange={(e) => setNewCat(e.target.value)} placeholder={catPlaceholder} />
          <button className="btn-gold" disabled={!newCat.trim()}><Plus size={14} /> Add</button>
        </form>
      </section>
      )}

      {/* Header */}
      <div className="list-head">
        <div>
          <h1 className="page-title">{heading}</h1>
          <p className="page-sub" style={{ marginBottom: 0 }}>{items.length} records total</p>
        </div>
        <div className="head-actions">
          <button className="btn-soft" onClick={toggleSort} disabled={reorder}>
            <ArrowUpDown size={13} color="#d4a017" /> {nameLabel}: {sortDir === "desc" ? "Z → A" : "A → Z"}
          </button>
          <button className="btn-outline" onClick={toggleReorder}>
            <ArrowDownUp size={14} /> {reorder ? "Done" : "Reorder"}
          </button>
          <button className="btn-gold" onClick={openAdd}><Plus size={14} /> Add</button>
        </div>
      </div>

      {/* Select all / bulk */}
      <div className="select-bar">
        <label>
          <input type="checkbox" checked={allSelected} onChange={toggleAll} /> Select All
        </label>
        {selected.size > 0 && (
          <button className="bulk-del" onClick={() => remove([...selected], `${selected.size} records delete karne hain?`)}>
            <Trash2 size={13} /> Delete {selected.size} selected
          </button>
        )}
      </div>

      {/* Rows */}
      <div className="rows">
        {rows.map((t) => (
          <div className="card row" key={t.id}>
            <input type="checkbox" checked={selected.has(t.id)} onChange={() => toggleOne(t.id)} aria-label={`Select ${t.title}`} />
            <div className="row-main">
              <div className="row-title">
                {t.title}
                {t.live && <span className="tag tag-live"><Eye size={10} /> Live</span>}
                {t.home && <span className="tag tag-home"><Star size={10} fill="currentColor" /> Home</span>}
              </div>
              <div className="row-cat">{renderSub ? renderSub(t) : hasCats ? t.category : fmt(t.date)}</div>
            </div>
            {reorder && (
              <div className="reorder">
                <button onClick={() => move(t.id, -1)} aria-label="Move up"><ChevronUp size={16} /></button>
                <button onClick={() => move(t.id, 1)} aria-label="Move down"><ChevronDown size={16} /></button>
              </div>
            )}
            <button className="icon-btn edit" aria-label="Edit" onClick={() => setModal({ ...t })}><SquarePen size={16} /></button>
            {gallery && <button className="btn-gallery" onClick={() => gallery(t)}>Gallery</button>}
            <button className="icon-btn del" aria-label="Delete" onClick={() => remove([t.id], `"${t.title}" delete karna hai?`)}><Trash2 size={16} /></button>
          </div>
        ))}
        {rows.length === 0 && <p className="empty">Koi {singular} nahi hai. Add button se naya banao.</p>}
      </div>

      {/* Pagination */}
      <div className="pager">
        <span className="muted">Page {cur} of {pages}</span>
        <div className="pager-btns">
          <button disabled={cur === 1} onClick={() => setPage(cur - 1)} aria-label="Previous page"><ChevronLeft size={15} /></button>
          {Array.from({ length: pages }, (_, i) => (
            <button key={i} className={cur === i + 1 ? "on" : ""} onClick={() => setPage(i + 1)}>{i + 1}</button>
          ))}
          <button disabled={cur === pages} onClick={() => setPage(cur + 1)} aria-label="Next page"><ChevronRight size={15} /></button>
        </div>
      </div>

      {/* Add / Edit modal */}
      {modal && (
        <div className="modal-bg" onClick={() => setModal(null)}>
          <form className="modal" onClick={(e) => e.stopPropagation()} onSubmit={saveModal}>
            <h2>{modal.id ? `Edit ${singular}` : `Add ${singular}`}</h2>
            <label className="field">{titleLabel || nameLabel}
              <input autoFocus value={modal.title} onChange={(e) => setModal({ ...modal, title: e.target.value })} required />
            </label>
            {renderFields ? renderFields(modal, setModal) : hasCats ? (
              <label className="field">Category
                <select value={modal.category} onChange={(e) => setModal({ ...modal, category: e.target.value })}>
                  {cats.map((c) => <option key={c.id}>{c.name}</option>)}
                </select>
              </label>
            ) : (
              <label className="field">Date
                <input type="date" value={modal.date} onChange={(e) => setModal({ ...modal, date: e.target.value })} required />
              </label>
            )}
            <label className="check"><input type="checkbox" checked={modal.live} onChange={(e) => setModal({ ...modal, live: e.target.checked })} /> Live on website</label>
            <label className="check"><input type="checkbox" checked={modal.home} onChange={(e) => setModal({ ...modal, home: e.target.checked })} /> Show on home page</label>
            <div className="modal-actions">
              <button type="button" className="btn-outline" onClick={() => setModal(null)}>Cancel</button>
              <button className="btn-gold">Save changes</button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
