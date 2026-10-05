import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Stethoscope, Pill, BookOpen, MessageSquare, Calendar, Package, Activity } from "lucide-react";
import { apiFetch } from "../auth/api.js";
import LeafLoader from "../components/LeafLoader.jsx";

// Saare numbers/lists server se aate hain: GET /api/admin/dashboard (MongoDB)
const fmtDate = (iso) => new Date(iso).toLocaleDateString("en-GB");

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    apiFetch("/api/admin/dashboard")
      .then((d) => alive && setData(d))
      .catch((e) => alive && setError(e.message));
    return () => {
      alive = false;
    };
  }, []);

  const head = (
    <>
      <h1 className="page-title">Dashboard</h1>
      <p className="page-sub">Overview of your Prof Hakeem Ali Waqas website</p>
    </>
  );
  if (error) return <>{head}<p className="empty">{error}</p></>;
  if (!data) return <>{head}<LeafLoader /></>;

  const { stats: s, orders, recentOrders, pendingAppointments: pending } = data;
  const cards = [
    { label: "Treatments", value: s.treatments.total, note: `${s.treatments.live} live`, icon: Stethoscope, color: "#0f9d6b", bg: "#e6f6ef" },
    { label: "Medicines", value: s.medicines.total, note: `${s.medicines.live} live`, icon: Pill, color: "#3b6cf6", bg: "#e8eefe" },
    { label: "Articles", value: s.articles.total, note: `${s.articles.live} live`, icon: BookOpen, color: "#a21caf", bg: "#f5e8fb" },
    { label: "Testimonials", value: s.testimonials.total, note: `${s.testimonials.live} live`, icon: MessageSquare, color: "#ea580c", bg: "#fdeee3" },
    { label: "Appointments", value: s.appointments.total, note: `${s.appointments.pending} pending`, icon: Calendar, color: "#e11d63", bg: "#fde7ef" },
  ];
  const orderStats = [
    { label: "Total Orders", value: orders.total, color: "#16321f" },
    { label: "Today", value: orders.today, color: "#1f5a30" },
    { label: "This Week", value: orders.week, color: "#2563eb" },
    { label: "This Month", value: orders.month, color: "#7c3aed" },
  ];

  return (
    <>
      {head}

      <section className="stat-grid">
        {cards.map(({ label, value, note, icon: Icon, color, bg }) => (
          <div className="adm-card stat" key={label}>
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
          <div className="adm-card order-stat" key={o.label}>
            <div className="order-value" style={{ color: o.color }}>{o.value}</div>
            <div className="order-label">{o.label}</div>
          </div>
        ))}
      </section>

      <section className="adm-card recent">
        <div className="recent-head">
          <span className="recent-title">Recent Orders</span>
          <Link to="/admin/orders" className="link-blue">View All →</Link>
        </div>
        {recentOrders.length === 0 && <p className="empty">No orders yet</p>}
        {recentOrders.map((o) => (
          <div className="appt" key={o.id}>
            <div>
              <div className="appt-name">{o.customer}</div>
              <div className="appt-meta">{o.medicine} × {o.qty} · {fmtDate(o.createdAt)}</div>
            </div>
            <span className="pill" style={{ textTransform: "capitalize" }}>{o.status}</span>
          </div>
        ))}
      </section>

      <h2 className="section-title">
        <Activity size={16} color="#d4a017" /> Pending Appointments
        <span className="badge-count">{s.appointments.pending}</span>
      </h2>
      <section className="appt-list">
        {pending.length === 0 && <p className="empty">No pending appointments</p>}
        {pending.map((a) => (
          <div className="adm-card appt" key={a.id}>
            <div>
              <div className="appt-name">{a.name}</div>
              <div className="appt-meta">{a.date} · {a.phone}</div>
            </div>
            <span className="pill">Pending</span>
          </div>
        ))}
      </section>
      <div className="appt-actions">
        <Link to="/admin/appointments" className="adm-btn-dark">View</Link>
        <Link to="/admin/appointments" className="link-gold">View all appointments →</Link>
      </div>
    </>
  );
}
