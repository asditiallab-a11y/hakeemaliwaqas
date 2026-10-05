import { useState } from "react";
import { ArrowUpDown, Trash2, ChevronLeft, ChevronRight } from "lucide-react";

const PAGE_SIZE = 10;
const STATUSES = ["pending", "confirmed", "completed", "cancelled"];

// TODO: baad me API se replace karenge
const initial = [
  { id: 1, name: "Ata ur Rehman", email: "atatepu31@gmail.com", phone: "+923004968276", date: "2026-06-02", status: "pending",
    message: "Hakeem sahib hmein bhi time dan plz, Bohat preshani bni hui hai" },
  { id: 2, name: "Muhammad Usama", email: "musama996758@gmail.com", phone: "03266607428", date: "2026-07-17", status: "pending",
    message: "Hakeem sab qatro or kasrt e ehtlam or erectile dysfunction mardana kamzori nafs ma dhelapan ka masla ha har jaga se medicine ly chuka lekin koi far..." },
];

const cap = (s) => s[0].toUpperCase() + s.slice(1);

export default function Appointments() {
  const [items, setItems] = useState(initial);
  const [sortDir, setSortDir] = useState("asc");
  const [selected, setSelected] = useState(new Set());
  const [page, setPage] = useState(1);
  const [viewId, setViewId] = useState(null);

  const view = [...items].sort((a, b) => a.name.localeCompare(b.name) * (sortDir === "asc" ? 1 : -1));
  const pages = Math.max(1, Math.ceil(view.length / PAGE_SIZE));
  const cur = Math.min(page, pages);
  const rows = view.slice((cur - 1) * PAGE_SIZE, cur * PAGE_SIZE);
  const open = items.find((a) => a.id === viewId);

  const setStatus = (id, status) => setItems(items.map((a) => (a.id === id ? { ...a, status } : a)));
  const remove = (ids, msg) => {
    if (!window.confirm(msg)) return;
    setItems(items.filter((a) => !ids.includes(a.id)));
    setSelected(new Set());
    setViewId(null);
  };
  const toggleOne = (id) => {
    const s = new Set(selected);
    s.has(id) ? s.delete(id) : s.add(id);
    setSelected(s);
  };
  const allSelected = items.length > 0 && selected.size === items.length;

  return (
    <>
      <div className="list-head">
        <div>
          <h1 className="page-title">Appointments</h1>
          <p className="page-sub" style={{ marginBottom: 0 }}>{items.length} records total</p>
        </div>
        <div className="head-actions">
          <button className="btn-soft" onClick={() => setSortDir(sortDir === "asc" ? "desc" : "asc")}>
            <ArrowUpDown size={13} color="#d4a017" /> Name: {sortDir === "asc" ? "A → Z" : "Z → A"}
          </button>
        </div>
      </div>

      <div className="select-bar">
        <label>
          <input type="checkbox" checked={allSelected} onChange={() => setSelected(allSelected ? new Set() : new Set(items.map((a) => a.id)))} /> Select All
        </label>
        {selected.size > 0 && (
          <button className="bulk-del" onClick={() => remove([...selected], `${selected.size} appointments delete karni hain?`)}>
            <Trash2 size={13} /> Delete {selected.size} selected
          </button>
        )}
      </div>

      <div className="rows">
        {rows.map((a) => (
          <div className="card row appt-row" key={a.id}>
            <input type="checkbox" checked={selected.has(a.id)} onChange={() => toggleOne(a.id)} aria-label={`Select ${a.name}`} />
            <div className="row-main">
              <div className="row-title">
                {a.name}
                <span className={`st st-${a.status}`}>{a.status}</span>
              </div>
              <div className="row-meta">{a.email} · {a.phone} · {a.date}</div>
              <div className="row-msg">{a.message}</div>
            </div>
            <select className="status-select" value={a.status} onChange={(e) => setStatus(a.id, e.target.value)} aria-label="Status">
              {STATUSES.map((s) => <option key={s} value={s}>{cap(s)}</option>)}
            </select>
            <button className="btn-view" onClick={() => setViewId(a.id)}>View</button>
            <button className="icon-btn del" aria-label="Delete" onClick={() => remove([a.id], `"${a.name}" ki appointment delete karni hai?`)}><Trash2 size={16} /></button>
          </div>
        ))}
        {rows.length === 0 && <p className="empty">Abhi koi appointment nahi aayi.</p>}
      </div>

      {pages > 1 && (
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
      )}

      {open && (
        <div className="modal-bg" onClick={() => setViewId(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>{open.name} <span className={`st st-${open.status}`}>{open.status}</span></h2>
            <dl className="detail">
              <dt>Email</dt><dd>{open.email}</dd>
              <dt>Phone</dt><dd>{open.phone}</dd>
              <dt>Date</dt><dd>{open.date}</dd>
              <dt>Message</dt><dd dir="auto">{open.message}</dd>
            </dl>
            <label className="field">Status
              <select value={open.status} onChange={(e) => setStatus(open.id, e.target.value)}>
                {STATUSES.map((s) => <option key={s} value={s}>{cap(s)}</option>)}
              </select>
            </label>
            <div className="modal-actions">
              <button className="btn-outline" onClick={() => remove([open.id], `"${open.name}" ki appointment delete karni hai?`)}>Delete</button>
              <button className="btn-gold" onClick={() => setViewId(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
