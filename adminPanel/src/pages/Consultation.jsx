import { useState } from "react";
import { Search, Download, Printer, Trash2 } from "lucide-react";

const CATS = {
  male: { icon: "👨", label: "مرد" },
  female: { icon: "👩", label: "عورت" },
  child: { icon: "🧒", label: "بچہ" },
};
const STATUS = { new: "New", in_progress: "In Progress", completed: "Completed" };

// TODO: baad me API se replace karenge
const initial = [
  ["Raza khan", "Luton", "00447494861797", "new", "2026-09-26"],
  ["Shahid", "Cartersville", "6787939135", "in_progress", "2026-09-21"],
  ["Shahid", "Cartersville", "6787939135", "in_progress", "2026-09-21"],
  ["saudi arabia", "gujranwala", "+966504195534", "in_progress", "2026-09-07"],
  ["muhammad abdullah", "Hotat Bani Tamim", "12345676543", "in_progress", "2026-09-05"],
  ["Zafar ali", "Gilgit", "03480270886", "in_progress", "2026-08-25"],
  ["Muhammad imran anjum", "Paris", "0033769361492", "in_progress", "2026-08-18"],
  ["ali waqas khan", "karachi", "03214303326", "in_progress", "2026-08-17"],
  ["Khalid", "Glasgow", "07886356626", "in_progress", "2026-08-16"],
  ["m anwar", "sialkot", "+41767187494", "in_progress", "2026-08-12"],
].map(([name, city, phone, status, date], i) => ({ id: i + 1, name, city, phone, status, date, category: "male" }));

const fmt = (d) => d.split("-").reverse().join("/");
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export default function Consultation() {
  const [items, setItems] = useState(initial);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("");
  const [status, setStatus] = useState("");
  const [selected, setSelected] = useState(new Set());

  const rows = items
    .filter((r) => {
      const t = q.trim().toLowerCase();
      return (
        (!t || r.name.toLowerCase().includes(t) || r.phone.includes(t)) &&
        (!cat || r.category === cat) &&
        (!status || r.status === status)
      );
    })
    .sort((a, b) => b.date.localeCompare(a.date));

  const allSelected = rows.length > 0 && rows.every((r) => selected.has(r.id));
  const toggleOne = (id) => {
    const s = new Set(selected);
    s.has(id) ? s.delete(id) : s.add(id);
    setSelected(s);
  };
  const toggleAll = () => setSelected(allSelected ? new Set() : new Set(rows.map((r) => r.id)));
  const setRowStatus = (id, st) => setItems(items.map((r) => (r.id === id ? { ...r, status: st } : r)));
  const remove = (ids, msg) => {
    if (!window.confirm(msg)) return;
    setItems(items.filter((r) => !ids.includes(r.id)));
    setSelected(new Set());
  };

  const exportCsv = () => {
    const head = ["Patient", "City", "Category", "Phone", "Status", "Date"];
    const lines = rows.map((r) => [r.name, r.city, CATS[r.category].label, r.phone, STATUS[r.status], fmt(r.date)]);
    const csv = [head, ...lines].map((l) => l.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" }));
    a.download = "consultations.csv";
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const printOne = (r) => {
    const w = window.open("", "_blank", "width=600,height=600");
    if (!w) return;
    w.document.write(
      `<html><head><title>Consultation</title><style>body{font-family:sans-serif;padding:24px}td{padding:6px 16px 6px 0}</style></head><body>
      <h2>Consultation: ${esc(r.name)}</h2><table>
      <tr><td>City</td><td>${esc(r.city)}</td></tr>
      <tr><td>Category</td><td>${esc(CATS[r.category].label)}</td></tr>
      <tr><td>Phone</td><td>${esc(r.phone)}</td></tr>
      <tr><td>Status</td><td>${esc(STATUS[r.status])}</td></tr>
      <tr><td>Date</td><td>${fmt(r.date)}</td></tr></table></body></html>`
    );
    w.document.close();
    w.focus();
    w.print();
  };

  return (
    <>
      <div className="list-head">
        <div>
          <h1 className="page-title sans">Consultation Form</h1>
          <p className="page-sub sans-sub">Review and manage patient consultation submissions</p>
        </div>
        <button className="btn-outline" onClick={exportCsv}><Download size={14} /> Export CSV</button>
      </div>

      <section className="filters">
        <div className="search">
          <Search size={15} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name / phone..." />
        </div>
        <select className="status-select" value={cat} onChange={(e) => setCat(e.target.value)} aria-label="Category">
          <option value="">All Categories</option>
          {Object.entries(CATS).map(([k, c]) => <option key={k} value={k}>{c.icon} {c.label}</option>)}
        </select>
        <select className="status-select" value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Status">
          <option value="">All Status</option>
          {Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </section>

      <section className="table-card">
        <div className="table-wrap">
          <table className="tbl">
            <thead>
              <tr>
                <th style={{ width: 40 }}><input type="checkbox" checked={allSelected} onChange={toggleAll} aria-label="Select all" /></th>
                <th>Patient</th><th>Category</th><th>Phone</th><th>Status</th><th>Date</th><th>Change</th><th />
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td><input type="checkbox" checked={selected.has(r.id)} onChange={() => toggleOne(r.id)} aria-label={`Select ${r.name}`} /></td>
                  <td><div className="p-name">{r.name}</div><div className="p-city">{r.city}</div></td>
                  <td dir="auto">{CATS[r.category].icon} {CATS[r.category].label}</td>
                  <td className="p-phone">{r.phone}</td>
                  <td><span className={`cs cs-${r.status}`}>{STATUS[r.status]}</span></td>
                  <td className="p-date">{fmt(r.date)}</td>
                  <td>
                    <select className="status-select" value={r.status} onChange={(e) => setRowStatus(r.id, e.target.value)} aria-label="Change status">
                      {Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                    </select>
                  </td>
                  <td className="p-actions">
                    <button className="icon-btn" aria-label="Print" onClick={() => printOne(r)}><Printer size={15} /></button>
                    <button className="icon-btn del" aria-label="Delete" onClick={() => remove([r.id], `"${r.name}" ki consultation delete karni hai?`)}><Trash2 size={15} /></button>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && <tr><td colSpan={8} className="empty">Koi consultation nahi mili.</td></tr>}
            </tbody>
          </table>
        </div>
        <div className="tbl-foot">
          <span className="muted">{rows.length} consultations</span>
          {selected.size > 0 && (
            <button className="bulk-del" onClick={() => remove([...selected], `${selected.size} consultations delete karni hain?`)}>
              <Trash2 size={13} /> Delete {selected.size} selected
            </button>
          )}
        </div>
      </section>
    </>
  );
}
