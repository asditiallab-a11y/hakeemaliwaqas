// Backend (API) ka address.
//  * Local development: khali chhodo -> "/api/..." Vite proxy se server (port 5000) tak jata hai.
//  * Live (Hostinger frontend + Railway server): .env.production mein  VITE_API_URL=https://api.tumharidomain.com
// Website/admin ka har server call aur har uploaded image/video isi se guzarta hai.
export const API_BASE = String(import.meta.env.VITE_API_URL || "").trim().replace(/\/+$/, "");

// "/api/site/home" -> "https://api.tumharidomain.com/api/site/home"  (VITE_API_URL khali ho to jaisa tha waisa)
export const apiUrl = (path) => (/^https?:\/\//i.test(path) ? path : API_BASE + path);

// Admin mein dikhne wali uploaded media ("/api/media/xyz.jpg") ke liye. Doosre links (http..., data:, blob:) ko nahi chhedta.
export const mediaSrc = (u) => (typeof u === "string" && u.startsWith("/api/") ? API_BASE + u : u);

// API alag domain par ho to cookie bhejne ke liye "include" chahiye
export const FETCH_CREDENTIALS = API_BASE ? "include" : "same-origin";
