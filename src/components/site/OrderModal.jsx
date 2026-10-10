import { useEffect, useRef, useState } from "react";
import { val } from "../../lib/siteApi";
import { apiUrl } from "../../lib/api";
import "./OrderModal.css";

const rs = (n) => `Rs. ${Number(n).toLocaleString("en-PK")}`;

// "Add to Cart" ka order request -> POST /api/orders (Admin > Orders mein aata hai)
async function submitOrder(payload) {
  const res = await fetch(apiUrl("/api/orders"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const j = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(j.error || "Request nahi bhej saka. Thori der baad dobara try karo.");
  return j;
}

// 03001234567 / +923001234567 / 0300-1234567 / +44 7700 900123 (10-15 digits)
const phoneOk = (v) => /^\+?\d{10,15}$/.test(v.replace(/[\s\-()]/g, ""));

// Props: medicine (zaroori), qty (detail page ki quantity), page (admin labels), onClose
// Labels admin se badal sakte hain: Admin > Pages > Medicines > Product Detail Page
//   oTitle, oReadOnly, oSection, oName, oNamePh, oPhone, oPhonePh, oCity, oCityPh,
//   oQty, oAddr, oAddrPh, oNotes, oNotesPh, oConfirm, oSending, oDone, oDoneMsg
export default function OrderModal({ medicine: m, qty: initialQty = 1, page, onClose }) {
  const t = (k, d) => val(page, k, d);

  const [form, setForm] = useState({ name: "", phone: "", city: "", address: "", notes: "" });
  const [qty, setQty] = useState(Math.max(1, Number(initialQty) || 1));
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState("");
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(null);
  const firstRef = useRef(null);

  const hasPrice = m.price != null && !Number.isNaN(Number(m.price));
  const total = hasPrice ? m.price * qty : null;

  // Esc se band + background scroll lock + pehla field focus
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape" && !sending) onClose(); };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    firstRef.current?.focus();
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose, sending]);

  const set = (k) => (e) => {
    const v = e.target.value;
    setForm((f) => ({ ...f, [k]: v }));
    if (errors[k]) setErrors((x) => ({ ...x, [k]: undefined }));
    if (toast) setToast("");
  };

  const validate = () => {
    const e = {};
    if (form.name.trim().length < 2) e.name = "Apna poora naam likhein";
    if (!phoneOk(form.phone)) e.phone = "Sahi phone number likhein (e.g. 03001234567)";
    if (!form.city.trim()) e.city = "City likhein";
    if (form.address.trim().length < 8) e.address = "Poora delivery address likhein";
    return e;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (sending) return;
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) {
      setToast("Please fill all required fields correctly");
      return;
    }
    setSending(true);
    setToast("");
    try {
      const res = await submitOrder({
        medicineId: m.id,
        qty,
        customer: form.name.trim(),
        phone: form.phone.replace(/[\s\-()]/g, ""),
        city: form.city.trim(),
        address: form.address.trim(),
        notes: form.notes.trim(),
      });
      setDone(res || true);
    } catch (err) {
      setToast(err?.message || "Order submit nahi ho saka, dobara koshish karein");
    } finally {
      setSending(false);
    }
  };

  const cls = (k) => `om-input${errors[k] ? " bad" : ""}`;

  return (
    <div className="om-bg" onMouseDown={(e) => { if (e.target === e.currentTarget && !sending) onClose(); }}>
      <div className="om-modal" role="dialog" aria-modal="true" aria-label={t("oTitle", "Place Your Order")}>
        <div className="om-head">
          <h3>{t("oTitle", "Place Your Order")}</h3>
          <button type="button" className="om-x" aria-label="Close" onClick={onClose} disabled={sending}>×</button>
        </div>

        {done ? (
          <div className="om-body om-done">
            <div className="om-done-ic">✓</div>
            <h4>{t("oDone", "Order Placed!")}</h4>
            <p>{t("oDoneMsg", "Shukriya! Hamari team jald aap se rabta karegi.")}</p>
            <div className="om-card">
              <b>{m.title}</b>
              <span>{hasPrice ? `${rs(m.price)} × ${qty} = ${rs(total)}` : `Quantity: ${qty}`}</span>
            </div>
            <button type="button" className="om-confirm" onClick={onClose}>Close</button>
          </div>
        ) : (
          <form className="om-body" onSubmit={handleSubmit} noValidate>
            {/* Product summary (read-only, qty ke saath live update) */}
            <div className="om-card">
              <b>{m.title}</b>
              {hasPrice && (
                <span className="om-price">{qty > 1 ? `${rs(m.price)} × ${qty} = ${rs(total)}` : rs(m.price)}</span>
              )}
              <i>{t("oReadOnly", "Product details (read-only)")}</i>
            </div>

            <div className="om-section">{t("oSection", "Your information")}</div>

            <label className="om-f">
              <span>{t("oName", "Full Name")} <em>*</em></span>
              <input ref={firstRef} className={cls("name")} value={form.name} onChange={set("name")} placeholder={t("oNamePh", "Enter your name")} autoComplete="name" />
              {errors.name && <small>{errors.name}</small>}
            </label>

            <label className="om-f">
              <span>{t("oPhone", "Phone Number")} <em>*</em></span>
              <input className={cls("phone")} value={form.phone} onChange={set("phone")} placeholder={t("oPhonePh", "e.g. 03001234567")} type="tel" inputMode="tel" autoComplete="tel" />
              {errors.phone && <small>{errors.phone}</small>}
            </label>

            <div className="om-row">
              <label className="om-f">
                <span>{t("oCity", "City")} <em>*</em></span>
                <input className={cls("city")} value={form.city} onChange={set("city")} placeholder={t("oCityPh", "Your city")} autoComplete="address-level2" />
                {errors.city && <small>{errors.city}</small>}
              </label>

              <div className="om-f om-qty">
                <span>{t("oQty", "Quantity")} <em>*</em></span>
                <div className="om-qty-box">
                  <button type="button" aria-label="Decrease quantity" onClick={() => setQty((q) => Math.max(1, q - 1))}>−</button>
                  <b aria-live="polite">{qty}</b>
                  <button type="button" aria-label="Increase quantity" onClick={() => setQty((q) => Math.min(99, q + 1))}>+</button>
                </div>
              </div>
            </div>

            <label className="om-f">
              <span>{t("oAddr", "Delivery Address")} <em>*</em></span>
              <input className={cls("address")} value={form.address} onChange={set("address")} placeholder={t("oAddrPh", "Street, area, full address")} autoComplete="street-address" />
              {errors.address && <small>{errors.address}</small>}
            </label>

            <label className="om-f">
              <span>{t("oNotes", "Notes (optional)")}</span>
              <input className="om-input" value={form.notes} onChange={set("notes")} placeholder={t("oNotesPh", "Any special instructions...")} />
            </label>

            {toast && (
              <div className="om-toast" role="alert">
                <span>{toast}</span>
                <button type="button" aria-label="Dismiss" onClick={() => setToast("")}>×</button>
              </div>
            )}

            <button type="submit" className="om-confirm" disabled={sending}>
              {sending ? t("oSending", "Sending...") : t("oConfirm", "Confirm Order")}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}