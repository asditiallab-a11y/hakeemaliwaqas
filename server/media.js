import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Treatment, Medicine, Article, PageContent } from "./models/content.js";

// Pages, Treatments, Medicines, Articles ki uploaded images / PDF / videos yahan rehti hain (/api/media/...)
// DATA_DIR (Railway Volume ka mount path) set ho to media/uploads wahin save hote hain, warna server/ ke andar.
export const DATA_DIR = process.env.DATA_DIR || path.join(path.dirname(fileURLToPath(import.meta.url)));
export const MEDIA_DIR = path.join(DATA_DIR, "media");
fs.mkdirSync(MEDIA_DIR, { recursive: true });
export const MEDIA_URL_RE = /^\/api\/media\/([\w-]+\.(?:jpg|png|gif|webp|avif|mp4|webm|pdf))$/;

const isReferenced = async (url) => {
  const [t, m, a, pages] = await Promise.all([
    Treatment.exists({ image: url }),
    Medicine.exists({ $or: [{ image: url }, { brochure: url }, { gallery: url }] }),
    Article.exists({ image: url }),
    PageContent.find().select("data").lean(),
  ]);
  return !!(t || m || a || pages.some((p) => Object.values(p.data || {}).includes(url)));
};

// Jo files ab kisi record mein use nahi ho rahi unhein disk se hata deta hai (use hoti hon to chhoti nahi jati)
export async function pruneMedia(urls) {
  for (const url of new Set((urls || []).filter((u) => typeof u === "string"))) {
    const m = MEDIA_URL_RE.exec(url);
    if (!m) continue;
    try {
      if (!(await isReferenced(url))) await fs.promises.unlink(path.join(MEDIA_DIR, m[1])).catch(() => {});
    } catch { /* cleanup best-effort hai */ }
  }
}

export const rmMedia = (url) => {
  const m = MEDIA_URL_RE.exec(url || "");
  if (m) fs.unlink(path.join(MEDIA_DIR, m[1]), () => {});
};
