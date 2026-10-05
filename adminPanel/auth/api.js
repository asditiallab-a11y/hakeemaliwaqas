// Admin ke saare server calls yahin se jayen. 401 (login khatam / logout) aaye to poora admin
// khud login page par chala jata hai.
import { apiUrl, FETCH_CREDENTIALS } from "../../src/lib/api";

export async function apiFetch(path, { method = "GET", body } = {}) {
  let res;
  try {
    res = await fetch(apiUrl(path), {
      method,
      credentials: FETCH_CREDENTIALS,
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    const err = new Error("Server se connection nahi ho raha. Backend chal raha hai? (npm run dev)");
    err.status = 0;
    throw err;
  }
  let data = {};
  try {
    data = await res.json();
  } catch {
    /* khali jawab */
  }
  if (!res.ok) {
    if (res.status === 401 && !path.startsWith("/api/auth/login")) window.dispatchEvent(new Event("admin-unauthorized"));
    const err = new Error(data.error || `Request failed (${res.status})`);
    err.status = res.status;
    throw err;
  }
  return data;
}

// Image/video upload (multipart). Server public URL wapas deta hai, jo page ke field mein save hota hai.
export async function uploadFile(file) {
  const fd = new FormData();
  fd.append("file", file);
  let res;
  try {
    res = await fetch(apiUrl("/api/admin/pages/upload"), { method: "POST", credentials: FETCH_CREDENTIALS, body: fd });
  } catch {
    throw new Error("Server se connection nahi ho raha. Backend chal raha hai? (npm run dev)");
  }
  let data = {};
  try { data = await res.json(); } catch { /* khali jawab */ }
  if (!res.ok) {
    if (res.status === 401) window.dispatchEvent(new Event("admin-unauthorized"));
    throw new Error(data.error || `Upload fail (${res.status})`);
  }
  return data.url;
}
