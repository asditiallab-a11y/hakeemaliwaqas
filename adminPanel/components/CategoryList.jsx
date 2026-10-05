import { useState, useEffect } from "react";
import { apiFetch } from "../auth/api.js";
import {
  Tag, SquarePen, X, Plus, ArrowUpDown, ArrowDownUp, Trash2, Eye, Star,
  ChevronLeft, ChevronRight, ChevronUp, ChevronDown,
} from "lucide-react";
import LeafLoader from "./LeafLoader.jsx";
import ItemModal from "./ItemModal.jsx";
import GalleryModal from "./GalleryModal.jsx";

const PAGE_SIZE = 8;
let uid = 1000;
const fmt = (d) => (d ? d.split("-").reverse().join("/") : ""); // 2026-04-10 -> 10/04/2026

// form: Add/Edit modal ki config (fields, extras) -> ItemModal.jsx. gallery: true ho to har row par Gallery button aata hai.
export default function CategoryList({ resource, heading, singular, nameLabel, catPlaceholder, gallery, categories, items: startItems, renderSub, form }) {
  const hasCats = !!categories; // categories na do to category box/field hide ho jate hain, date dikhti hai
  const api = resource ? `/api/admin/${resource}` : null; // resource do to data DB se aata/jata hai, warna sirf local state
  const [loading, setLoading] = useState(!!api);
  const [err, setErr] = useState("");
  const [cats, setCats] = useState(categories || []);
  const [newCat, setNewCat] = useState("");
  const [editCat, setEditCat] = useState(null); // { id, value }
  const [items, setItems] = useState(startItems || []);
  const [sortDir, setSortDir] = useState("asc"); // "asc" | "desc" | null
  const [reorder, setReorder] = useState(false);
  const [selected, setSelected] = useState(new Set());
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState(null); // { item } (item null = naya record)
  const [galleryItem, setGalleryItem] = useState(null);

  /* ---------- Server (sirf jab resource diya ho) ---------- */
  useEffect(() => {
    if (!api) return;
    let alive = true;
    apiFetch(api)
      .then((d) => {
        if (!alive) return;
        setItems(d.items);
        setCats(d.categories);
      })
      .catch((e) => alive && setErr(e.message))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [api]);

  // server call; fail ho to error dikhata hai aur null deta hai (state tab hi badalti hai jab DB mein save ho jaye)
  const call = async (path, opts) => {
    setErr("");
    try {
      return await apiFetch(api + path, opts);
    } catch (e) {
      setErr(e.message);
      return null;
    }
  };

  /* ---------- Categories ---------- */
  const addCat = async (e) => {
    e.preventDefault();
    const name = newCat.trim();
    if (!name || cats.some((c) => c.name.toLowerCase() === name.toLowerCase())) return;
    if (api) {
      const c = await call("/categories", { method: "POST", body: { name } });
      if (!c) return;
      setCats([...cats, c]);
    } else {
      setCats([...cats, { id: ++uid, name }]);
    }
    setNewCat("");
  };
  const saveCat = async () => {
    if (!editCat) return;
    const name = editCat.value.trim();
    const old = cats.find((c) => c.id === editCat.id);
    setEditCat(null);
    if (!old || !name || name === old.name) return;
    if (api && !(await call(`/categories/${old.id}`, { method: "PUT", body: { name } }))) return;
    setCats((cs) => cs.map((c) => (c.id === old.id ? { ...c, name } : c)));
    setItems((its) => its.map((t) => (t.categories?.includes(old.name) ? { ...t, categories: t.categories.map((n) => (n === old.name ? name : n)) } : t)));
  };
  const removeCat = async (c) => {
    if (!window.confirm(`"${c.name}" category delete karni hai?`)) return;
    if (api && !(await call(`/categories/${c.id}`, { method: "DELETE" }))) return;
    setCats((cs) => cs.filter((x) => x.id !== c.id));
    setItems((its) => its.map((t) => (t.categories?.includes(c.name) ? { ...t, categories: t.categories.filter((n) => n !== c.name) } : t)));
  };

  /* ---------- List ---------- */
  const view = sortDir
    ? [...items].sort((a, b) => a.title.localeCompare(b.title) * (sortDir === "asc" ? 1 : -1))
    : items;
  const pages = Math.max(1, Math.ceil(view.length / PAGE_SIZE));
  const cur = Math.min(page, pages);
  const rows = view.slice((cur - 1) * PAGE_SIZE, cur * PAGE_SIZE);

  const toggleSort = () => setSortDir(sortDir === "asc" ? "desc" : "asc");
  const toggleReorder = async () => {
    if (!reorder) {
      setItems(view); // current order ko manual order bana do
      setSortDir(null);
      setReorder(true);
      return;
    }
    if (api) await call("/order", { method: "PUT", body: { ids: items.map((t) => t.id) } }); // "Done" par order DB mein save
    setReorder(false);
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

  const remove = async (ids, msg) => {
    if (!window.confirm(msg)) return;
    if (api && !(await call("/bulk-delete", { method: "POST", body: { ids } }))) return;
    setItems((its) => its.filter((t) => !ids.includes(t.id)));
    setSelected(new Set());
  };

  const openAdd = () => setModal({ item: null });
  // Add/Edit modal aur Medicine ke alag sections (price, specs...) yahi se save hote hain. Jawab: { saved } ya { error }
  const saveItem = async (id, body) => {
    try {
      const saved = await apiFetch(api + (id ? `/${id}` : ""), { method: id ? "PUT" : "POST", body });
      setItems((its) => (its.some((t) => t.id === saved.id) ? its.map((t) => (t.id === saved.id ? saved : t)) : [...its, saved]));
      return { saved };
    } catch (e) {
      return { error: e.message };
    }
  };

  if (loading) return <LeafLoader />;

  return (
    <>
      {err && <p className="empty" style={{ color: "#c0392b", padding: "0 0 12px" }}>{err}</p>}
      {hasCats && (
      <section className="adm-card cat-box">
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
          <div className="adm-card adm-row" key={t.id}>
            <input type="checkbox" checked={selected.has(t.id)} onChange={() => toggleOne(t.id)} aria-label={`Select ${t.title}`} />
            <div className="row-main">
              <div className="row-title">
                {t.title}
                {t.live && <span className="tag tag-live"><Eye size={10} /> Live</span>}
                {t.home && <span className="tag tag-home"><Star size={10} fill="currentColor" /> Home</span>}
              </div>
              <div className="row-cat">{renderSub ? renderSub(t) : hasCats ? (t.categories?.length ? t.categories.join(", ") : "All") : fmt(t.date)}</div>
            </div>
            {reorder && (
              <div className="reorder">
                <button onClick={() => move(t.id, -1)} aria-label="Move up"><ChevronUp size={16} /></button>
                <button onClick={() => move(t.id, 1)} aria-label="Move down"><ChevronDown size={16} /></button>
              </div>
            )}
            <button className="icon-btn edit" aria-label="Edit" onClick={() => setModal({ item: t })}><SquarePen size={16} /></button>
            {gallery && <button className="btn-gallery" onClick={() => setGalleryItem(t)}>Gallery</button>}
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
      {modal && form && (
        <ItemModal config={form} singular={singular} cats={cats} item={modal.item} onSave={saveItem} saveSection={saveItem} onClose={() => setModal(null)} />
      )}

      {/* Gallery modal (sirf Medicines) */}
      {galleryItem && <GalleryModal item={galleryItem} onSave={saveItem} onClose={() => setGalleryItem(null)} />}
    </>
  );
}
