import { useState } from "react";
import { ChevronLeft, ChevronRight, Download, Trash2 } from "lucide-react";

const STATUS = {
  pending: "Pending",
  confirmed: "Confirmed",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

// TODO: baad me API se data aayega. Abhi koi order nahi hai (screenshot jesa).
// Test ke liye aise objects daal sakte ho:
// { id: 1, medicine: "Kalonji", customer: "Ali", phone: "0300...", city: "Lahore", qty: 2, status: "pending", date: "2026-09-26" }
const initial = [];

const fmt = (d) => d.split("-").reverse().join("/");

export default function Orders() {
  const [orders, setOrders] = useState(initial);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [dateDir, setDateDir] = useState("desc");
  const [pageSize, setPageSize] = useState(25);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(new Set());

  const f = (setter) => (v) => { setter(v); setPage(1); };

  const filtered = orders
    .filter((o) => {
      const t = q.trim().toLowerCase();
      return (
        (!t || o.customer.toLowerCase().includes(t) || o.phone.includes(t) || String(o.id) === t.replace("#", "")) &&
        (!status || o.status === status) &&
        (!from || o.date >= from) &&
        (!to || o.date <= to)
      );
    })
    .sort((a, b) => a.date.localeCompare(b.date) * (dateDir === "asc" ? 1 : -1));

  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const cur = Math.min(page, pages);
  const rows = filtered.slice((cur - 1) * pageSize, cur * pageSize);

  const reset = () => { setQ(""); setStatus(""); setFrom(""); setTo(""); setPage(1); };
  const allSelected = rows.length > 0 && rows.every((o) => selected.has(o.id));
  const toggleOne = (id) => {
    const s = new Set(selected);
    s.has(id) ? s.delete(id) : s.add(id);
    setSelected(s);
  };
  const toggleAll = () => {
    const s = new Set(selected);
    rows.forEach((o) => (allSelected ? s.delete(o.id) : s.add(o.id)));
    setSelected(s);
  };
  const setRowStatus = (id, st) => setOrders(orders.map((o) => (o.id === id ? { ...o, status: st } : o)));
  const removeSelected = () => {
    if (!window.confirm(`${selected.size} orders delete karne hain?`)) return;
    setOrders(orders.filter((o) => !selected.has(o.id)));
    setSelected(new Set());
  };

  const exportAll = () => {
    const head = ["#", "Medicine", "Customer", "Phone", "City", "Qty", "Status", "Date"];
    const lines = orders.map((o) => [o.id, o.medicine, o.customer, o.phone, o.city, o.qty, STATUS[o.status], fmt(o.date)]);
    const csv = [head, ...lines].map((l) => l.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" }));
    a.download = "orders.csv";
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <>
      <h1 className="page-title sans">Orders</h1>
      <p className="page-sub sans-sub">Manage and track all customer orders</p>

      <section className="filters">
        <div className="search wide">
          <input value={q} onChange={(e) => f(setQ)(e.target.value)} placeholder="Search name / phone / ID..." />
        </div>
        <select className="status-select" value={status} onChange={(e) => f(setStatus)(e.target.value)} aria-label="Status">
          <option value="">All Statuses</option>
          {Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <input type="date" className="date-input" value={from} max={to || undefined} onChange={(e) => f(setFrom)(e.target.value)} aria-label="From date" />
        <input type="date" className="date-input" value={to} min={from || undefined} onChange={(e) => f(setTo)(e.target.value)} aria-label="To date" />
        <button className="btn-outline" onClick={reset}>Reset</button>
        <button className="btn-blue" onClick={exportAll}><Download size={13} /> Export All</button>
      </section>

      <section className="table-card">
        <div className="table-wrap">
          <table className="tbl tbl-orders">
            <thead>
              <tr>
                <th style={{ width: 40 }}><input type="checkbox" checked={allSelected} onChange={toggleAll} aria-label="Select all" /></th>
                <th>#</th><th>Medicine</th><th>Customer</th><th>City</th><th>Qty</th><th>Status</th><th>Change</th>
                <th>
                  <button className="th-sort" onClick={() => setDateDir(dateDir === "desc" ? "asc" : "desc")}>
                    Date {dateDir === "desc" ? "↓" : "↑"}
                  </button>
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((o) => (
                <tr key={o.id}>
                  <td><input type="checkbox" checked={selected.has(o.id)} onChange={() => toggleOne(o.id)} aria-label={`Select order ${o.id}`} /></td>
                  <td className="p-phone">{o.id}</td>
                  <td>{o.medicine}</td>
                  <td><div className="p-name">{o.customer}</div><div className="p-city">{o.phone}</div></td>
                  <td>{o.city}</td>
                  <td>{o.qty}</td>
                  <td><span className={`os os-${o.status}`}>{STATUS[o.status]}</span></td>
                  <td>
                    <select className="status-select" value={o.status} onChange={(e) => setRowStatus(o.id, e.target.value)} aria-label="Change status">
                      {Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                    </select>
                  </td>
                  <td className="p-date">{fmt(o.date)}</td>
                </tr>
              ))}
              {rows.length === 0 && <tr><td colSpan={9} className="empty">Abhi koi order nahi aaya.</td></tr>}
            </tbody>
          </table>
        </div>

        <div className="orders-foot">
          <span className="muted">
            {filtered.length} orders total
            {selected.size > 0 && (
              <button className="bulk-del" style={{ marginLeft: 12 }} onClick={removeSelected}>
                <Trash2 size={13} /> Delete {selected.size} selected
              </button>
            )}
          </span>
          <div className="pager-btns green">
            <button disabled={cur === 1} onClick={() => setPage(cur - 1)} aria-label="Previous page"><ChevronLeft size={14} /></button>
            {Array.from({ length: pages }, (_, i) => (
              <button key={i} className={cur === i + 1 ? "on" : ""} onClick={() => setPage(i + 1)}>{i + 1}</button>
            ))}
            <button disabled={cur === pages} onClick={() => setPage(cur + 1)} aria-label="Next page"><ChevronRight size={14} /></button>
          </div>
          <select className="status-select" value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }} aria-label="Per page">
            {[25, 50, 100].map((n) => <option key={n} value={n}>{n} / page</option>)}
          </select>
        </div>
      </section>
    </>
  );
}
