import sanitizeHtml from "sanitize-html";

// Admin forms ke liye chhote validators. Galat data par HttpError(400, message) phenkte hain.
export class HttpError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.status = status;
    this.expose = true;
  }
}

export const text = (v, max, label, { required = false } = {}) => {
  if (v === null || v === undefined) v = "";
  if (typeof v !== "string") throw new HttpError(`${label} galat hai`);
  const t = v.trim();
  if (required && !t) throw new HttpError(`${label} zaroori hai`);
  if (t.length > max) throw new HttpError(`${label} bohat lamba hai (max ${max} characters)`);
  return t;
};

// Rich editor ka HTML: sirf editor ke toolbar wale tags rakhte hain, baqi sab (script, onclick, style...) hata dete hain.
const HTML_OPTS = {
  allowedTags: ["h1", "h2", "h3", "h4", "p", "br", "hr", "b", "strong", "i", "em", "u", "s", "strike", "del", "ul", "ol", "li", "blockquote", "a", "div", "span", "font"],
  allowedAttributes: { a: ["href", "target", "rel"], "*": ["style", "dir", "align"] },
  allowedStyles: { "*": { "text-align": [/^(left|right|center|justify)$/] } },
  allowedSchemes: ["http", "https", "mailto", "tel"],
  allowProtocolRelative: false,
  transformTags: { a: (tag, attribs) => ({ tagName: "a", attribs: { ...attribs, rel: "noopener noreferrer nofollow" } }) },
};
export const cleanHtml = (v, max, label, { required = false } = {}) => {
  if (v === null || v === undefined) v = "";
  if (typeof v !== "string") throw new HttpError(`${label} galat hai`);
  if (v.length > max * 3) throw new HttpError(`${label} bohat lamba hai`); // sanitize se pehle hi bohat bade input ko roko
  const html = sanitizeHtml(v, HTML_OPTS).trim();
  const plain = sanitizeHtml(html, { allowedTags: [], allowedAttributes: {} }).replace(/&nbsp;/g, " ").trim();
  if (required && !plain && !/<hr/i.test(html)) throw new HttpError(`${label} zaroori hai`);
  if (html.length > max) throw new HttpError(`${label} bohat lamba hai (max ${max} characters)`);
  return plain || /<hr/i.test(html) ? html : "";
};

// Upload ki hui file ka URL: sirf hamare /api/media/ ka (image ya pdf), koi bahari link nahi
const IMG_URL = /^\/api\/media\/[\w-]+\.(?:jpg|png|gif|webp|avif)$/;
const PDF_URL = /^\/api\/media\/[\w-]+\.pdf$/;
export const mediaUrl = (v, kind, label) => {
  if (v === null || v === undefined || v === "") return "";
  if (typeof v !== "string" || !(kind === "pdf" ? PDF_URL : IMG_URL).test(v)) throw new HttpError(`${label} galat hai, dobara upload karein`);
  return v;
};

const YT = /^https?:\/\/(www\.|m\.)?(youtube\.com|youtu\.be)\/.+/i;
const YT_ID = /(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/|live\/))([\w-]{11})/i;
export const youtubeUrl = (v, label = "Video URL") => {
  const t = text(v, 300, label);
  if (t && !(YT.test(t) && YT_ID.test(t))) throw new HttpError(`${label}: sahi YouTube link daalo`);
  return t;
};

export const bool = (v, label) => {
  if (typeof v !== "boolean") throw new HttpError(`${label} galat hai`);
  return v;
};

// specifications: [{ k, v }]
export const specRows = (v, max, label) => {
  if (!Array.isArray(v) || v.length > max) throw new HttpError(`${label}: max ${max} rows allowed hain`);
  return v
    .map((r) => ({ k: text(r?.k, 200, `${label} (naam)`), v: text(r?.v, 400, `${label} (value)`) }))
    .filter((r) => r.k || r.v);
};
