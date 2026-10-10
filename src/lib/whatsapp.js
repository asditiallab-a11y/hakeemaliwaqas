// Hakeem saab ka WhatsApp number (Buy Now buttons + floating WhatsApp button).
// Format: country code + number, leading 0 ke baghair (92 3444282008). Number badalna ho to sirf yahan badlen.
export const DEFAULT_WHATSAPP = "923444282008";

// Kisi bhi format ka number (+92 0344..., 0344..., 9203444...) -> wa.me wala sahi number
export function normalizeWhatsapp(raw) {
  let d = String(raw || "").replace(/\D/g, "");
  if (!d) return "";
  if (d.startsWith("00")) d = d.slice(2);
  if (d.startsWith("920")) d = "92" + d.slice(3); // 92 ke baad extra 0
  else if (d.startsWith("0")) d = "92" + d.slice(1); // local 03xx... number
  return d;
}

// Admin > Settings mein number ho to wo, warna Hakeem saab ka default number
export const waNumber = (adminNumber) => normalizeWhatsapp(adminNumber) || DEFAULT_WHATSAPP;

const rs = (n) => `Rs. ${Number(n).toLocaleString("en-PK")}`;

// Auto-generated order message: product ka naam (+ price, quantity)
export function buyMessage({ name, price, qty } = {}) {
  const lines = ["Assalam o Alaikum! I want to order this product:", "", `Product: ${name}`];
  if (price != null && price !== "") lines.push(`Price: ${rs(price)}`);
  if (qty) lines.push(`Quantity: ${qty}`);
  lines.push("", "Please confirm availability and delivery details.");
  return lines.join("\n");
}

export const buyUrl = (adminNumber, product) =>
  `https://wa.me/${waNumber(adminNumber)}?text=${encodeURIComponent(buyMessage(product))}`;
