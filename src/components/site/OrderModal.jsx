import { useState } from "react";
import { apiUrl } from "../../lib/api";

// "Add to Cart" ka order request form -> POST /api/orders (Admin > Orders mein aata hai)
export default function OrderModal({ medicine, qty, onClose }) {
  const [form, setForm] = useState({ customer: "", phone: "", city: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const res = await fetch(apiUrl("/api/orders"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ medicineId: medicine.id, qty, ...form }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(j.error || "Request nahi bhej saka. Thori der baad dobara try karo.");
      setDone(true);
    } catch (err) {
      setError(err.message || "Request nahi bhej saka. Thori der baad dobara try karo.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="md-modal-bg" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="md-modal" onClick={(e) => e.stopPropagation()}>
        {done ? (
          <>
            <h3>Order request mil gayi</h3>
            <p className="sub">Hamari team jald aap se rabta karegi.</p>
            <div className="row"><button type="button" className="go" onClick={onClose}>Close</button></div>
          </>
        ) : (
          <form onSubmit={submit}>
            <h3>{medicine.title}</h3>
            <p className="sub">Quantity: {qty}. Apni details likhein, hum aap se rabta karenge.</p>
            <label htmlFor="o-name">Full Name</label>
            <input id="o-name" value={form.customer} onChange={set("customer")} maxLength={120} required />
            <label htmlFor="o-phone">Phone Number</label>
            <input id="o-phone" type="tel" value={form.phone} onChange={set("phone")} placeholder="+92 XXX XXXXXXX" maxLength={30} required />
            <label htmlFor="o-city">City (optional)</label>
            <input id="o-city" value={form.city} onChange={set("city")} maxLength={80} />
            {error && <div className="err" role="alert">{error}</div>}
            <div className="row">
              <button type="button" onClick={onClose}>Cancel</button>
              <button type="submit" className="go" disabled={busy}>{busy ? "Sending..." : "Send Request"}</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
