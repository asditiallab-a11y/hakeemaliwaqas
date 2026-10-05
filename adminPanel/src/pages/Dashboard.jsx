import { Link } from "react-router-dom";
import { Stethoscope, Pill, BookOpen, MessageSquare, Calendar, Package, Activity } from "lucide-react";

// TODO: ye static data hai, baad me API se replace karenge
const stats = [
  { label: "Treatments", value: 10, note: "10 live", icon: Stethoscope, color: "#0f9d6b", bg: "#e6f6ef" },
  { label: "Medicines", value: 10, note: "10 live", icon: Pill, color: "#3b6cf6", bg: "#e8eefe" },
  { label: "Articles", value: 13, note: "13 live", icon: BookOpen, color: "#a21caf", bg: "#f5e8fb" },
  { label: "Testimonials", value: 12, note: "12 live", icon: MessageSquare, color: "#ea580c", bg: "#fdeee3" },
  { label: "Appointments", value: 2, note: "2 pending", icon: Calendar, color: "#e11d63", bg: "#fde7ef" },
];
const orderStats = [
  { label: "Total Orders", value: 0, color: "#16321f" },
  { label: "Today", value: 0, color: "#1f5a30" },
  { label: "This Week", value: 0, color: "#2563eb" },
  { label: "This Month", value: 0, color: "#7c3aed" },
];
const recentOrders = [];
const pending = [
  { id: 1, name: "Ata ur Rehman", date: "2020-06-02", phone: "+923004968276" },
  { id: 2, name: "Muhammad Usama", date: "2026-07-17", phone: "03266607428" },
];

export default function Dashboard() {
  return (
    <>
      <h1 className="page-title">Dashboard</h1>
      <p className="page-sub">Overview of your Prof Hakeem Ali Waqas website</p>

      <section className="stat-grid">
        {stats.map(({ label, value, note, icon: Icon, color, bg }) => (
          <div className="card stat" key={label}>
            <span className="stat-icon" style={{ background: bg, color }}><Icon size={16} /></span>
            <div className="stat-value">{value}</div>
            <div className="stat-label">{label}</div>
            <div className="stat-note">{note}</div>
          </div>
        ))}
      </section>

      <h2 className="section-title"><Package size={18} /> Orders Overview</h2>
      <section className="order-grid">
        {orderStats.map((o) => (
          <div className="card order-stat" key={o.label}>
            <div className="order-value" style={{ color: o.color }}>{o.value}</div>
            <div className="order-label">{o.label}</div>
          </div>
        ))}
      </section>

      <section className="card recent">
        <div className="recent-head">
          <span className="recent-title">Recent Orders</span>
          <Link to="/orders" className="link-blue">View All →</Link>
        </div>
        {recentOrders.length === 0 && <p className="empty">No orders yet</p>}
      </section>

      <h2 className="section-title">
        <Activity size={16} color="#d4a017" /> Pending Appointments
        <span className="badge-count">{pending.length}</span>
      </h2>
      <section className="appt-list">
        {pending.map((a) => (
          <div className="card appt" key={a.id}>
            <div>
              <div className="appt-name">{a.name}</div>
              <div className="appt-meta">{a.date} · {a.phone}</div>
            </div>
            <span className="pill">Pending</span>
          </div>
        ))}
      </section>
      <div className="appt-actions">
        <Link to="/appointments" className="btn-dark">View</Link>
        <Link to="/appointments" className="link-gold">View all appointments →</Link>
      </div>
    </>
  );
}
