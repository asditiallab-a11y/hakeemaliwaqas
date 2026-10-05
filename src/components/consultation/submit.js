// Form backend ko bhejne ka ek hi jagah.
// Default: /api/consultations  -> server/index.js -> MongoDB mein save.
// Alag server par ho to .env mein:  VITE_CONSULTATION_ENDPOINT=https://your-api.com/consultations
// Request: multipart/form-data  ->  "data" (JSON string) + "report" (PDF, optional)
import { apiUrl } from "../../lib/api";

export async function submitConsultation({ data, file, lang }) {
  const endpoint = import.meta.env.VITE_CONSULTATION_ENDPOINT || apiUrl("/api/consultations");

  const payload = { ...data, language: lang, submittedAt: new Date().toISOString() };

  const body = new FormData();
  body.append("data", JSON.stringify(payload));
  if (file) body.append("report", file, file.name);

  const res = await fetch(endpoint, { method: "POST", body });
  if (!res.ok) {
    // server ne kaun se fields galat bataye (400) - form unhein dikha sake
    let fields = [];
    try {
      fields = (await res.json()).fields || [];
    } catch {
      /* json nahi tha */
    }
    const err = new Error(`Submit failed (${res.status})`);
    err.status = res.status;
    err.fields = fields;
    throw err;
  }
  return { ok: true };
}
