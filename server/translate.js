import crypto from "node:crypto";

// English -> Urdu auto-translation (Anthropic API). .env mein ANTHROPIC_API_KEY ho tabhi on hota hai,
// key na ho to feature band rehta hai aur website pehle jaisi chalti hai.
//   ANTHROPIC_API_KEY=sk-ant-...        (console.anthropic.com se)
//   TRANSLATE_MODEL=claude-sonnet-5-5   (optional)
const API_KEY = String(process.env.ANTHROPIC_API_KEY || "").trim();
const MODEL = String(process.env.TRANSLATE_MODEL || "claude-sonnet-5-5").trim();

export const translateEnabled = !!API_KEY;

export const sourceHash = (...parts) =>
  crypto.createHash("sha1").update(parts.map((p) => String(p || "")).join("\u0001")).digest("hex");

const SYSTEM = `You are a professional English-to-Urdu translator for a Unani herbal medicine clinic's health articles.
Translate into natural, easy Urdu that a general reader in Pakistan understands, in Urdu script.
Rules:
- The "content" is HTML. Keep every HTML tag, structure and attribute exactly as is; translate only the visible text.
- Keep herb/medicine names recognisable: write the Urdu name where one is commonly used, and keep the English name in brackets when it helps (e.g. کلونجی (Black Seed)).
- Keep numbers, units, brand and people names (e.g. Hakeem Ali Waqas -> حکیم علی وقاص) sensible; do not add, remove or explain anything.
- If a field is empty, return an empty string for it.
Reply with ONLY a JSON object: {"title": "...", "excerpt": "...", "content": "..."} and nothing else.`;

async function callApi(payload) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 120000);
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      signal: ctrl.signal,
      headers: { "content-type": "application/json", "x-api-key": API_KEY, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 16000,
        system: SYSTEM,
        messages: [{ role: "user", content: JSON.stringify(payload) }],
      }),
    });
    const j = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(j?.error?.message || `Translation API ${res.status}`);
    return (j.content || []).filter((b) => b.type === "text").map((b) => b.text).join("");
  } finally {
    clearTimeout(timer);
  }
}

// { title, excerpt, content } (English) -> { titleUr, excerptUr, contentUr }
export async function translateArticleToUrdu({ title = "", excerpt = "", content = "" }) {
  if (!translateEnabled) throw new Error("Translation off (ANTHROPIC_API_KEY set nahi)");
  const text = await callApi({ title, excerpt, content });
  const m = text.match(/\{[\s\S]*\}/); // agar model ne ```json fence lagaya ho
  if (!m) throw new Error("Translation reply samajh nahi aaya");
  const o = JSON.parse(m[0]);
  const str = (v) => (typeof v === "string" ? v.trim() : "");
  return { titleUr: str(o.title), excerptUr: str(o.excerpt), contentUr: str(o.content) };
}
