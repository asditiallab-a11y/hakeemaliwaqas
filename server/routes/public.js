import express from "express";
import mongoose from "mongoose";
import sanitizeHtml from "sanitize-html";
import Category from "../models/Category.js";
import { translateEnabled, translateArticleToUrdu, sourceHash } from "../translate.js";
import { Article, Treatment, Medicine, Testimonial, Video, ReviewVideo, Setting, PageContent } from "../models/content.js";

// Website (visitors) ke liye PUBLIC read-only routes - login nahi chahiye.
// Sirf wohi data jata hai jo admin ne "Live" / "Show on Home Page" / "Published" rakha hai.
// Koi write route yahan nahi hai.
const router = express.Router();

const VIDEO_SLIDER_KEY = "videoSliderHome";
const SAFE_HTML = {
  allowedTags: ["p", "br", "b", "strong", "i", "em", "u", "s", "ul", "ol", "li", "blockquote", "span", "div"],
  allowedAttributes: { "*": ["dir"] },
};
const ENTITIES = { "&amp;": "&", "&lt;": "<", "&gt;": ">", "&quot;": '"', "&#39;": "'", "&nbsp;": " " };

const toPlain = (html = "") =>
  sanitizeHtml(String(html), { allowedTags: [], allowedAttributes: {} })
    .replace(/&(amp|lt|gt|quot|#39|nbsp);/g, (m) => ENTITIES[m])
    .replace(/\s+/g, " ")
    .trim();
const excerpt = (html, max = 170) => {
  const t = toPlain(html);
  if (t.length <= max) return t;
  return t.slice(0, max).replace(/\s+\S*$/, "") + "…";
};
const isRtl = (t) => /[\u0600-\u06FF]/.test(t);
const YT = /(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/|live\/))([\w-]{11})/i;
const ytId = (u = "") => u.match(YT)?.[1] || "";


// Rich editor (admin) ka HTML: sirf safe formatting tags + text-align style allowed hai
const RICH_HTML = {
  allowedTags: ["p", "br", "hr", "b", "strong", "i", "em", "u", "s", "strike", "ul", "ol", "li", "blockquote", "h2", "h3", "h4", "span", "div"],
  allowedAttributes: { "*": ["dir", "style", "align"] },
  allowedStyles: { "*": { "text-align": [/^(left|right|center|justify)$/] } },
};
// Image / video / media fields: sirf apni site ka path (/api/media/..) ya http(s) link
// PUBLIC_API_URL (jaise https://api.tumharidomain.com) set ho to uploaded media ("/api/media/..") ke links poore address ke saath jate hain,
// kyunke website (Hostinger) aur API (Railway) alag domains par hoti hain. Khali ho to purane relative links.
const PUBLIC_API_URL = String(process.env.PUBLIC_API_URL || "").trim().replace(/\/+$/, "");
const safeUrl = (u) => {
  if (!/^(\/(?!\/)|https?:\/\/)/i.test(u)) return "";
  return PUBLIC_API_URL && u.startsWith("/api/media/") ? PUBLIC_API_URL + u : u;
};
const MEDIA_KEY = /(Image|Video|Bg)$/;
const RICH_KEY = /[Cc]ontent$/; // s1Content, s2Content ... aur legal pages ka "content"

// Admin > Pages ke kisi tab ka data website ke liye saaf karke bhejta hai
const cleanPage = (data) => {
  const out = {};
  for (const [k, v] of Object.entries(data || {})) {
    if (typeof v !== "string") continue;
    if (RICH_KEY.test(k)) out[k] = sanitizeHtml(v, RICH_HTML);
    else if (MEDIA_KEY.test(k)) out[k] = safeUrl(v.trim());
    else out[k] = v;
  }
  return out;
};

const liveHome = { live: { $ne: false }, home: true };
const order = { sortOrder: 1, createdAt: 1 };

router.get("/home", async (_req, res, next) => {
  try {
    const [page, website, sliderSetting, treatments, medicines, testimonials, videos, reviews] = await Promise.all([
      PageContent.findOne({ key: "home" }),
      Setting.findOne({ key: "settings.website" }),
      Setting.findOne({ key: VIDEO_SLIDER_KEY }),
      Treatment.find(liveHome).sort(order).limit(12),
      Medicine.find(liveHome).sort(order).limit(12),
      Testimonial.find(liveHome).sort(order).limit(30),
      Video.find({ type: "long", published: true }).sort(order).limit(24),
      ReviewVideo.find({ live: { $ne: false } }).sort(order).limit(12),
    ]);

    const w = website?.value && typeof website.value === "object" ? website.value : {};
    res.set("Cache-Control", "no-cache"); // admin ne kuch badla ho to refresh par foran dikhe
    res.json({
      page: page?.data || {},
      settings: {
        name: w.name || "", tagline: w.tagline || "", heroHeading: w.heroHeading || "",
        heroSubtitle: w.heroSubtitle || "", whatsapp: w.whatsapp || "",
      },
      treatments: treatments.map((t) => ({
        id: String(t._id), title: t.title,
        category: t.categories?.[0] || t.category || "",
        description: excerpt(t.description), image: safeUrl(t.image || ""),
      })),
      medicines: medicines.map((m) => ({
        id: String(m._id), title: m.title, description: excerpt(m.description), image: safeUrl(m.image || ""),
      })),
      testimonials: testimonials.map((t) => {
        const plain = toPlain(t.text);
        return { id: String(t._id), name: t.title, rating: t.rating || 5, text: sanitizeHtml(t.text || "", SAFE_HTML), rtl: isRtl(plain), html: true };
      }).filter((t) => t.text),
      videoSlider: sliderSetting ? !!sliderSetting.value : true,
      videos: videos.filter((v) => ytId(v.url)).map((v) => ({ id: String(v._id), title: v.title, url: v.url, youtubeId: ytId(v.url) })),
      reviewVideos: reviews.filter((v) => ytId(v.url)).map((v) => ({
        id: String(v._id), name: v.name || v.title || "Patient", subtitle: v.name ? v.title || "" : "", link: v.url, youtubeId: ytId(v.url),
      })),
    });
  } catch (err) { next(err); }
});

// About page: Admin > Pages > About tab ka data (SEO, hero, 3 sections, values, milestones)
router.get("/about", async (_req, res, next) => {
  try {
    const page = await PageContent.findOne({ key: "about" });
    res.set("Cache-Control", "no-cache");
    res.json({ page: cleanPage(page?.data) });
  } catch (err) { next(err); }
});

// Privacy Policy + Terms of Service: Admin > Pages > Privacy Policy / Terms of Service tab
// (SEO, hero, intro card, rich content, bottom CTA). Content cleanPage() se sanitize hokar jata hai.
for (const [route, key] of [["privacy", "privacy"], ["terms", "terms"]]) {
  router.get(`/${route}`, async (_req, res, next) => {
    try {
      const page = await PageContent.findOne({ key });
      res.set("Cache-Control", "no-cache");
      res.json({ page: cleanPage(page?.data) });
    } catch (err) { next(err); }
  });
}

// Treatments page: Admin > Pages > Treatments (SEO, hero, heading) + Admin > Treatments (cards + categories)
// Sirf wohi treatments jo "live" hain. Filter pills = Admin ki categories (jin mein kam az kam 1 live treatment ho).
router.get("/treatments", async (_req, res, next) => {
  try {
    const [page, items, cats] = await Promise.all([
      PageContent.findOne({ key: "treatments" }),
      Treatment.find({ live: { $ne: false } }).sort(order).limit(300),
      Category.find({ type: "treatment" }).sort(order),
    ]);
    const list = items.map((t) => {
      const categories = t.categories?.length ? t.categories : t.category ? [t.category] : [];
      return {
        id: String(t._id),
        title: t.title,
        titleUr: t.titleUr || "",
        categories,
        description: excerpt(t.description, 220),
        html: sanitizeHtml(t.description || "", RICH_HTML),
        htmlUr: sanitizeHtml(t.descriptionUr || "", RICH_HTML),
        image: safeUrl(t.image || ""),
        videoUrl: safeUrl((t.videoUrl || "").trim()),
        youtubeId: ytId(t.videoUrl || ""),
      };
    });
    const used = new Set(list.flatMap((t) => t.categories.map((c) => c.toLowerCase())));
    res.set("Cache-Control", "no-cache");
    res.json({
      page: cleanPage(page?.data),
      categories: cats.map((c) => c.name).filter((n) => used.has(n.toLowerCase())),
      items: list,
    });
  } catch (err) { next(err); }
});

// ---- Herbal Medicines page + detail page ----
//   List:   Admin > Pages > Medicines (SEO, hero, heading) + Admin > Medicines (live cards + categories)
//   Detail: /api/site/medicines/:id -> description, benefits, usage, specs, gallery, brochure, price, video (+ Urdu)
const specRows = (a) =>
  (Array.isArray(a) ? a : [])
    .map((r) => ({ k: String(r?.k || "").trim(), v: String(r?.v || "").trim() }))
    .filter((r) => r.k || r.v);
const catsOf = (m) => (m.categories?.length ? m.categories : m.category ? [m.category] : []);
const medCard = (m) => ({
  id: String(m._id), title: m.title, categories: catsOf(m),
  description: excerpt(m.description, 160), image: safeUrl(m.image || ""),
  price: typeof m.price === "number" ? m.price : null,
  oldPrice: typeof m.oldPrice === "number" ? m.oldPrice : null,
});
const liveMed = { live: { $ne: false } };

router.get("/medicines", async (_req, res, next) => {
  try {
    const [page, website, items, cats] = await Promise.all([
      PageContent.findOne({ key: "medicines" }),
      Setting.findOne({ key: "settings.website" }),
      Medicine.find(liveMed).sort(order).limit(300),
      Category.find({ type: "medicine" }).sort(order),
    ]);
    const w = website?.value && typeof website.value === "object" ? website.value : {};
    const list = items.map(medCard);
    const used = new Set(list.flatMap((m) => m.categories.map((c) => c.toLowerCase())));
    res.set("Cache-Control", "no-cache");
    res.json({
      page: cleanPage(page?.data),
      whatsapp: String(w.whatsapp || "").replace(/\D/g, ""),
      categories: cats.map((c) => c.name).filter((n) => used.has(n.toLowerCase())),
      items: list,
    });
  } catch (err) { next(err); }
});

// Detail page: Admin > Medicines (record) + Admin > Pages > Medicines > "Product Detail Page" (labels / texts)
router.get("/medicines/:id", async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ error: "Not found" });
    const [m, website, page] = await Promise.all([
      Medicine.findOne({ _id: req.params.id, ...liveMed }),
      Setting.findOne({ key: "settings.website" }),
      PageContent.findOne({ key: "medicines" }),
    ]);
    if (!m) return res.status(404).json({ error: "Not found" });

    // "Next" link: admin ke order mein agli live medicine (aakhri ho to pehli)
    const all = await Medicine.find(liveMed).sort(order).select("_id title").limit(300);
    const at = all.findIndex((x) => String(x._id) === String(m._id));
    const nx = all.length > 1 && at >= 0 ? all[(at + 1) % all.length] : null;

    const w = website?.value && typeof website.value === "object" ? website.value : {};
    const h = (v) => sanitizeHtml(v || "", RICH_HTML);
    res.set("Cache-Control", "no-cache");
    res.json({
      whatsapp: String(w.whatsapp || "").replace(/\D/g, ""),
      page: cleanPage(page?.data),
      next: nx ? { id: String(nx._id), title: nx.title } : null,
      medicine: {
        ...medCard(m),
        titleUr: m.titleUr || "",
        html: h(m.description), htmlUr: h(m.descriptionUr),
        benefits: h(m.benefits), benefitsUr: h(m.benefitsUr),
        usage: h(m.usage), usageUr: h(m.usageUr),
        specs: specRows(m.specs), specsUr: specRows(m.specsUr), specsHero: specRows(m.specsHero),
        gallery: (m.gallery || []).map(safeUrl).filter(Boolean),
        brochure: safeUrl(m.brochure || ""),
        videoUrl: safeUrl((m.videoUrl || "").trim()), youtubeId: ytId(m.videoUrl || ""),
      },
    });
  } catch (err) { next(err); }
});

// ---- Videos page ----
//   Admin > Pages > Videos (SEO, hero, heading, lock/subscribe texts) + Admin > Videos (published long/short videos)
router.get("/videos", async (_req, res, next) => {
  try {
    const [page, vids] = await Promise.all([
      PageContent.findOne({ key: "videos" }),
      Video.find({ published: { $ne: false } }).sort(order).limit(500),
    ]);
    const items = vids.map((v) => {
      const id = ytId(v.url);
      return {
        id: String(v._id), type: v.type, title: v.title,
        description: String(v.description || "").slice(0, 300),
        youtubeId: id, link: id ? `https://youtu.be/${id}` : safeUrl((v.url || "").trim()),
      };
    });
    const p = cleanPage(page?.data);
    if (p.subscribeLink) p.subscribeLink = safeUrl(p.subscribeLink.trim());
    res.set("Cache-Control", "no-cache");
    res.json({ page: p, long: items.filter((v) => v.type === "long"), short: items.filter((v) => v.type === "short") });
  } catch (err) { next(err); }
});

// ---- Health Articles page + detail page ----
//   List:   Admin > Pages > Blog (SEO, hero, heading, sort/page-size) + Admin > Articles (live articles)
//   Detail: /api/site/articles/:id -> poora content (English + Urdu) + related articles
// Article ke content mein links (a) aur h1 allowed hain (admin editor ke toolbar jaisa), baqi sab sanitize.
const ARTICLE_HTML = {
  ...RICH_HTML,
  allowedTags: [...RICH_HTML.allowedTags, "a", "h1", "del"],
  allowedAttributes: { ...RICH_HTML.allowedAttributes, a: ["href", "target", "rel"] },
  allowedSchemes: ["http", "https", "mailto", "tel"],
  allowProtocolRelative: false,
  transformTags: { a: (_t, attribs) => ({ tagName: "a", attribs: { ...attribs, target: "_blank", rel: "noopener noreferrer nofollow" } }) },
};
const liveArt = { live: { $ne: false } };
const artCard = (a) => ({
  id: String(a._id), title: a.title, titleUr: a.titleUr || "",
  excerpt: a.excerpt || excerpt(a.content, 180), excerptUr: a.excerptUr || "",
  date: a.date || "", image: safeUrl(a.image || ""),
});

router.get("/articles", async (_req, res, next) => {
  try {
    const page = await PageContent.findOne({ key: "blog" });
    const p = cleanPage(page?.data);
    const sort = p.sortMode === "manual" ? order : { date: -1, ...order };
    const items = await Article.find(liveArt).sort(sort).limit(500);
    res.set("Cache-Control", "no-cache");
    res.json({ page: p, items: items.map(artCard) });
  } catch (err) { next(err); }
});

router.get("/articles/:id", async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ error: "Not found" });
    const a = await Article.findOne({ _id: req.params.id, ...liveArt });
    if (!a) return res.status(404).json({ error: "Not found" });
    const related = await Article.find({ ...liveArt, _id: { $ne: a._id } }).sort({ date: -1, ...order }).limit(3);
    res.set("Cache-Control", "no-cache");
    res.json({
      article: {
        ...artCard(a),
        html: sanitizeHtml(a.content || "", ARTICLE_HTML),
        htmlUr: sanitizeHtml(a.contentUr || "", ARTICLE_HTML),
        // Admin ne Urdu nahi likha aur translation on hai => website "اردو" tab par auto-translation la sakti hai
        autoUrdu: translateEnabled && !(a.titleUr || a.excerptUr || a.contentUr) && !!(a.title || a.content),
      },
      related: related.map(artCard),
    });
  } catch (err) { next(err); }
});

// Urdu tab ke liye auto-translation: sirf tab jab admin ne Urdu nahi likha. Pehli dafa API se translate hoti hai,
// phir database mein cache (English badle to hash badalta hai aur dobara translate hoti hai).
const urInflight = new Map(); // articleId -> Promise (ek hi article ki double calls na hon)
const urCooldown = new Map(); // articleId -> time (fail hone par 60s tak dobara API call nahi)
router.get("/articles/:id/urdu", async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ error: "Not found" });
    const a = await Article.findOne({ _id: req.params.id, ...liveArt });
    if (!a) return res.status(404).json({ error: "Not found" });
    if (a.titleUr || a.excerptUr || a.contentUr) return res.status(409).json({ error: "Urdu already provided" });
    if (!translateEnabled) return res.status(503).json({ error: "Auto-translation on nahi hai" });

    const hash = sourceHash(a.title, a.excerpt, a.content);
    let tr = a.autoUr?.hash === hash ? a.autoUr : null;
    if (!tr) {
      const id = String(a._id);
      if ((urCooldown.get(id) || 0) > Date.now()) return res.status(503).json({ error: "Thori der baad dobara koshish karein" });
      let job = urInflight.get(id);
      if (!job) {
        job = translateArticleToUrdu({ title: a.title, excerpt: a.excerpt, content: a.content })
          .then(async (t) => {
            const saved = { hash, ...t };
            await Article.updateOne({ _id: a._id }, { $set: { autoUr: saved } }, { timestamps: false });
            return saved;
          })
          .finally(() => urInflight.delete(id));
        urInflight.set(id, job);
      }
      try {
        tr = await job;
      } catch (err) {
        urCooldown.set(id, Date.now() + 60000);
        console.error("[translate] article", id, err.message);
        return res.status(502).json({ error: "Translation nahi ho saki" });
      }
    }
    res.set("Cache-Control", "no-cache");
    res.json({
      titleUr: tr.titleUr || "",
      excerptUr: tr.excerptUr || "",
      htmlUr: sanitizeHtml(tr.contentUr || "", ARTICLE_HTML),
    });
  } catch (err) { next(err); }
});

// ---- Testimonials page ----
//   Admin > Pages > Testimonials (SEO, hero, heading, layout, video-review header) +
//   Admin > Testimonials (SAARE live testimonials - "Show on Home Page" zaroori nahi) + Admin > Review Videos (live videos)
router.get("/testimonials", async (_req, res, next) => {
  try {
    const [page, items, reviews] = await Promise.all([
      PageContent.findOne({ key: "testimonials" }),
      Testimonial.find({ live: { $ne: false } }).sort(order).limit(300),
      ReviewVideo.find({ live: { $ne: false } }).sort(order).limit(100),
    ]);
    const p = cleanPage(page?.data);
    if (p.reviewsLink) p.reviewsLink = safeUrl(p.reviewsLink.trim());
    res.set("Cache-Control", "no-cache");
    res.json({
      page: p,
      testimonials: items.map((t) => {
        const plain = toPlain(t.text);
        return { id: String(t._id), name: t.title, rating: t.rating || 5, text: sanitizeHtml(t.text || "", SAFE_HTML), rtl: isRtl(plain), html: true };
      }).filter((t) => t.text),
      reviewVideos: reviews.filter((v) => ytId(v.url)).map((v) => ({
        id: String(v._id), name: v.name || v.title || "Patient", subtitle: v.name ? v.title || "" : "",
        link: `https://youtu.be/${ytId(v.url)}`, youtubeId: ytId(v.url),
      })),
    });
  } catch (err) { next(err); }
});

// ---- Contact page ----
//   Admin > Pages > Contact (SEO, hero, "Contact Information" label/heading) +
//   Admin > Settings > Contact Information (phones, email, address, hours)
//   Clinic Locations + Featured Products neeche wale /shared route se aate hain.
// Settings kabhi save na hui ho to "contact" ke andar wo key hoti hi nahi => website purane static default dikhati hai.
router.get("/contact", async (_req, res, next) => {
  try {
    const [page, website] = await Promise.all([
      PageContent.findOne({ key: "contact" }),
      Setting.findOne({ key: "settings.website" }),
    ]);
    const w = website?.value && typeof website.value === "object" ? website.value : {};
    const contact = {};
    if (Array.isArray(w.phones)) contact.phones = w.phones.filter((p) => typeof p === "string" && p.trim()).map((p) => p.trim());
    for (const k of ["email", "address", "hours"]) if (typeof w[k] === "string") contact[k] = w[k].trim();

    res.set("Cache-Control", "no-cache");
    res.json({ page: cleanPage(page?.data), contact });
  } catch (err) { next(err); }
});

// ---- Shared sections: Featured Products + Clinic Locations ----
// Ye 2 sections kai pages par aate hain (About, Contact, Treatments, Videos, Articles, Testimonials).
//   Featured Products -> Admin > Medicines (jin par "Show on Home Page" on hai; koi na ho to latest live medicines)
//                        heading: Admin > Pages > About > "Featured Products Section"
//   Clinic Locations  -> Admin > Pages > Contact > "Clinic Locations" (max 4 clinics) + "Clinic Locations Header"
const MAX_CLINICS = 4;
const DEFAULT_CLINICS = [
  { name: "Ali Dawakhana(Branch No 1)", addr: "Ravi Toll Plaza Shahdara Lahore Pakistan", phone: "+92-301-5959598", hours: "Mon-Sat: 9AM - 7PM" },
  { name: "Ali Dawakhana(Branch No 2)", addr: "G T Road Ferozewala Shahdara Lahore Pakistan", phone: "+92-311-1033392", hours: "Mon-Sat: 10AM - 7PM" },
];
const str = (obj, key, fallback = "") => (typeof obj?.[key] === "string" ? obj[key].trim() : fallback);

// Admin ne iframe code paste kiya ho ya sirf link - dono chalte hain. Sirf Google Maps ka embed allowed hai.
const mapSrc = (raw, addr, name) => {
  const m = String(raw || "").match(/https?:\/\/[^\s"'<>]+/i);
  if (m) {
    try {
      const u = new URL(m[0].replace(/&amp;/g, "&"));
      const host = u.hostname.replace(/^www\./, "");
      if ((host === "google.com" || host === "maps.google.com") && u.pathname.startsWith("/maps")) {
        if (u.pathname.startsWith("/maps/embed") || u.searchParams.get("output") === "embed") return u.toString();
      }
    } catch { /* neeche address se map banega */ }
  }
  const q = addr || name;
  return q ? `https://www.google.com/maps?q=${encodeURIComponent(q)}&output=embed` : "";
};

router.get("/shared", async (_req, res, next) => {
  try {
    const [about, contact, website, flagged] = await Promise.all([
      PageContent.findOne({ key: "about" }),
      PageContent.findOne({ key: "contact" }),
      Setting.findOne({ key: "settings.website" }),
      Medicine.find(liveHome).sort(order).limit(12),
    ]);
    const meds = flagged.length ? flagged : await Medicine.find({ live: { $ne: false } }).sort(order).limit(12);

    const a = about?.data || {};
    const c = contact?.data || null; // null => contact tab kabhi save nahi hua => default clinics
    const w = website?.value && typeof website.value === "object" ? website.value : {};

    const clinicsSaved = c && Array.from({ length: MAX_CLINICS }, (_, i) => `c${i + 1}Name`).some((k) => typeof c[k] === "string");
    const rows = clinicsSaved
      ? Array.from({ length: MAX_CLINICS }, (_, i) => {
          const n = i + 1;
          return { name: str(c, `c${n}Name`), addr: str(c, `c${n}Addr`), phone: str(c, `c${n}Phone`), hours: str(c, `c${n}Hours`), map: str(c, `c${n}Map`) };
        })
      : DEFAULT_CLINICS;

    res.set("Cache-Control", "no-cache");
    res.json({
      whatsapp: String(w.whatsapp || "").replace(/\D/g, ""),
      featured: {
        label: str(a, "fpLabel", "Herbal Medicines"),
        heading: str(a, "fpHeading", "Featured Products"),
        desc: str(a, "fpDesc", "Premium herbal medicines crafted with the finest natural ingredients"),
        items: meds.map((m) => ({ id: String(m._id), name: m.title, image: safeUrl(m.image || ""), link: `/herbal-medicines/${m._id}` })),
      },
      locations: {
        label: str(c, "locLabel", "Find Us"),
        heading: str(c, "locHeading", "Our Clinic Locations"),
        desc: str(c, "locDesc", "Visit us at our clinic for a personalised consultation"),
        items: rows
          .filter((r) => r.name || r.addr)
          .map((r, i) => ({
            id: i + 1, name: r.name, address: r.addr, phone: r.phone, hours: r.hours,
            mapSrc: mapSrc(r.map, r.addr, r.name),
          })),
      },
    });
  } catch (err) { next(err); }
});

export default router;
