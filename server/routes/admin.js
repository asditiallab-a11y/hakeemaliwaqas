import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import crypto from "node:crypto";
import express from "express";
import multer from "multer";
import mongoose from "mongoose";
import Consultation from "../models/Consultation.js";
import { crudRouter } from "./crud.js";
import { HttpError, text, cleanHtml, mediaUrl, youtubeUrl, bool, specRows } from "../validate.js";
import { MEDIA_DIR, pruneMedia, rmMedia } from "../media.js";
import settingsRoutes from "./settings.js";
import { Treatment, Medicine, Article, Testimonial, Appointment, Order, ReviewVideo, Video, Setting, PageContent } from "../models/content.js";

const router = express.Router();

// ---- Treatments / Medicines / Articles / Testimonials: validation (har field server par bhi check hoti hai) ----
// spec = { field: (value, ctx) => saaf value }.  required = create ke waqt zaroori fields.
const makeClean = (spec, required = {}) => async (data, ctx) => {
  const out = {};
  for (const [k, v] of Object.entries(data)) out[k] = await spec[k](v, ctx);
  if (ctx.create) for (const [k, label] of Object.entries(required)) if (!(k in out)) throw new HttpError(`${label} zaroori hai`);
  return out;
};
const categoriesField = async (v, ctx) => {
  if (!Array.isArray(v) || v.length > 30) throw new HttpError("Categories galat hain");
  const names = new Set(await ctx.catNames());
  const out = [];
  for (const n of v) {
    const t = text(n, 80, "Category");
    if (!names.has(t)) throw new HttpError(`Category "${t}" maujood nahi, page refresh karke dobara try karein`);
    if (!out.includes(t)) out.push(t);
  }
  return out;
};
const common = {
  title: (v) => text(v, 300, "Title", { required: true }),
  titleUr: (v) => text(v, 300, "Urdu title"),
  image: (v) => mediaUrl(v, "img", "Image"),
  videoUrl: (v) => youtubeUrl(v, "Video URL"),
  live: (v) => bool(v, "Show on Website"),
  home: (v) => bool(v, "Show on Home Page"),
  categories: categoriesField,
};
const price = (v) => {
  if (v === "" || v === null) return null;
  const n = Number(v);
  if (!Number.isFinite(n) || n < 0 || n > 10_000_000) throw new HttpError("Price galat hai");
  return Math.round(n * 100) / 100;
};
const gallery = (v) => {
  if (!Array.isArray(v) || v.length > 5) throw new HttpError("Gallery mein max 5 images ho sakti hain");
  return [...new Set(v.map((u) => mediaUrl(u, "img", "Gallery image")).filter(Boolean))];
};

const treatmentSpec = {
  ...common,
  description: (v) => cleanHtml(v, 100000, "Description", { required: true }),
  descriptionUr: (v) => cleanHtml(v, 100000, "Urdu description"),
};
const medicineSpec = {
  ...common,
  description: (v) => cleanHtml(v, 100000, "Description", { required: true }),
  descriptionUr: (v) => cleanHtml(v, 100000, "Urdu description"),
  benefits: (v) => cleanHtml(v, 50000, "Benefits", { required: true }),
  benefitsUr: (v) => cleanHtml(v, 50000, "Urdu benefits"),
  usage: (v) => cleanHtml(v, 50000, "Usage / Dosage", { required: true }),
  usageUr: (v) => cleanHtml(v, 50000, "Urdu usage"),
  brochure: (v) => mediaUrl(v, "pdf", "Brochure"),
  specs: (v) => specRows(v, 20, "Specifications"),
  specsUr: (v) => specRows(v, 20, "Specifications (Urdu)"),
  specsHero: (v) => specRows(v, 6, "Specifications (Hero)"),
  price,
  oldPrice: price,
  gallery,
};
const articleSpec = {
  title: common.title, titleUr: common.titleUr, image: common.image, live: common.live, home: common.home,
  excerpt: (v) => text(v, 600, "Excerpt", { required: true }),
  excerptUr: (v) => text(v, 600, "Urdu excerpt"),
  content: (v) => cleanHtml(v, 150000, "Content", { required: true }),
  contentUr: (v) => cleanHtml(v, 150000, "Urdu content"),
  date: (v) => {
    const t = text(v, 10, "Date");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(t)) throw new HttpError("Date galat hai");
    return t;
  },
};
const testimonialSpec = {
  title: (v) => text(v, 300, "Patient name", { required: true }),
  text: (v) => cleanHtml(v, 5000, "Testimonial", { required: true }),
  rating: (v) => {
    const n = Number(v);
    if (!Number.isInteger(n) || n < 1 || n > 5) throw new HttpError("Rating 1 se 5 ke beech honi chahiye");
    return n;
  },
  live: common.live, home: common.home,
};

// Treatments page: /api/admin/treatments (list, add, edit, delete, reorder + categories)
router.use("/treatments", crudRouter({
  Item: Treatment, categoryType: "treatment", multiCat: true, mediaFields: ["image"],
  fields: Object.keys(treatmentSpec),
  clean: makeClean(treatmentSpec, { title: "Title", description: "Description" }),
}));

// Medicines page: /api/admin/medicines (same tareeqa + gallery, brochure, specifications, price)
router.use("/medicines", crudRouter({
  Item: Medicine, categoryType: "medicine", multiCat: true, mediaFields: ["image", "brochure", "gallery"],
  fields: Object.keys(medicineSpec),
  clean: makeClean(medicineSpec, { title: "Name", description: "Description", benefits: "Benefits", usage: "Usage / Dosage" }),
}));

// Testimonials page: /api/admin/testimonials (categories nahi hoti)
router.use("/testimonials", crudRouter({
  Item: Testimonial, fields: Object.keys(testimonialSpec),
  clean: makeClean(testimonialSpec, { title: "Patient name", text: "Testimonial" }),
}));

// Articles page: /api/admin/articles
router.use("/articles", crudRouter({
  Item: Article, mediaFields: ["image"], fields: Object.keys(articleSpec),
  clean: makeClean(articleSpec, { title: "Title", excerpt: "Excerpt", content: "Content" }),
}));

// Appointments page: /api/admin/appointments
// (nayi appointment website ka public form banata hai: POST /api/appointments in index.js; yahan sirf dekhna/status/delete)
export { MEDIA_DIR };
const validId = (id) => mongoose.isValidObjectId(id);
const APPT_STATUS = ["pending", "confirmed", "completed", "cancelled"];
const outAppt = (a) => ({
  id: String(a._id), name: a.name, email: a.email, phone: a.phone,
  date: a.date || a.createdAt.toISOString().slice(0, 10), message: a.message || "", status: a.status,
});

router.get("/appointments", async (_req, res, next) => {
  try {
    const list = await Appointment.find().sort({ createdAt: -1 });
    res.json({ items: list.map(outAppt) });
  } catch (err) { next(err); }
});

router.post("/appointments/bulk-delete", async (req, res, next) => {
  try {
    const ids = Array.isArray(req.body?.ids) ? req.body.ids.filter(validId).slice(0, 500) : [];
    if (!ids.length) return res.status(400).json({ error: "Invalid request" });
    await Appointment.deleteMany({ _id: { $in: ids } });
    res.json({ ok: true });
  } catch (err) { next(err); }
});

router.put("/appointments/:id", async (req, res, next) => {
  try {
    const status = req.body?.status;
    if (!validId(req.params.id)) return res.status(404).json({ error: "Not found" });
    if (!APPT_STATUS.includes(status)) return res.status(400).json({ error: "Invalid status" });
    const doc = await Appointment.findByIdAndUpdate(req.params.id, { $set: { status } }, { returnDocument: "after" });
    if (!doc) return res.status(404).json({ error: "Not found" });
    res.json(outAppt(doc));
  } catch (err) { next(err); }
});

router.delete("/appointments/:id", async (req, res, next) => {
  try {
    if (!validId(req.params.id)) return res.status(404).json({ error: "Not found" });
    await Appointment.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (err) { next(err); }
});

// Consultation Form page: /api/admin/consultations (form ka POST public hai: /api/consultations in index.js)
const UPLOAD_DIR = path.join(process.env.DATA_DIR || path.join(path.dirname(fileURLToPath(import.meta.url)), ".."), "uploads");
const CONS_STATUS = ["new", "in_progress", "completed"];
const LEGACY = { contacted: "in_progress", closed: "completed" };
const outCons = (c) => ({
  id: String(c._id), name: c.fullName, fatherName: c.fatherName || "", age: c.age, city: c.city || "", country: c.country || "",
  email: c.email || "", address: c.address || "", budget: c.medicineBudget || "", phone: c.phone,
  category: c.patientType, status: LEGACY[c.status] || c.status, date: c.createdAt.toISOString().slice(0, 10),
  hasReport: !!c.report?.storedName,
});

router.get("/consultations", async (_req, res, next) => {
  try {
    const list = await Consultation.find().select("-answers").sort({ createdAt: -1 });
    res.json({ items: list.map(outCons) });
  } catch (err) { next(err); }
});

router.post("/consultations/bulk-delete", async (req, res, next) => {
  try {
    const ids = Array.isArray(req.body?.ids) ? req.body.ids.filter(validId).slice(0, 500) : [];
    if (!ids.length) return res.status(400).json({ error: "Invalid request" });
    const docs = await Consultation.find({ _id: { $in: ids } }).select("report");
    await Consultation.deleteMany({ _id: { $in: ids } });
    // upload hui PDF report bhi disk se hata do (path ../ wagaira se bachne ke liye basename)
    for (const d of docs) if (d.report?.storedName) fs.unlink(path.join(UPLOAD_DIR, path.basename(d.report.storedName)), () => {});
    res.json({ ok: true });
  } catch (err) { next(err); }
});

router.put("/consultations/:id", async (req, res, next) => {
  try {
    const status = req.body?.status;
    if (!validId(req.params.id)) return res.status(404).json({ error: "Not found" });
    if (!CONS_STATUS.includes(status)) return res.status(400).json({ error: "Invalid status" });
    const doc = await Consultation.findByIdAndUpdate(req.params.id, { $set: { status } }, { returnDocument: "after" }).select("-answers");
    if (!doc) return res.status(404).json({ error: "Not found" });
    res.json(outCons(doc));
  } catch (err) { next(err); }
});

// Orders page: /api/admin/orders
const ORDER_STATUS = ["pending", "confirmed", "shipped", "delivered", "cancelled"];
const outOrder = (o) => ({
  id: String(o._id), no: o.orderNo, medicine: o.medicine, customer: o.customer, phone: o.phone,
  city: o.city || "", qty: o.qty, status: o.status, createdAt: o.createdAt,
});

router.get("/orders", async (_req, res, next) => {
  try {
    // purane orders jinke paas number nahi, unhein banne ki tarteeb se number de do (sirf ek dafa)
    const missing = await Order.find({ orderNo: null }).sort({ createdAt: 1 }).select("_id");
    if (missing.length) {
      let n = (await Order.findOne({ orderNo: { $ne: null } }).sort({ orderNo: -1 }).select("orderNo"))?.orderNo ?? 0;
      await Order.bulkWrite(missing.map((d) => ({ updateOne: { filter: { _id: d._id }, update: { $set: { orderNo: ++n } } } })));
    }
    const list = await Order.find().sort({ createdAt: -1 });
    res.json({ items: list.map(outOrder) });
  } catch (err) { next(err); }
});

router.post("/orders/bulk-delete", async (req, res, next) => {
  try {
    const ids = Array.isArray(req.body?.ids) ? req.body.ids.filter(validId).slice(0, 500) : [];
    if (!ids.length) return res.status(400).json({ error: "Invalid request" });
    await Order.deleteMany({ _id: { $in: ids } });
    res.json({ ok: true });
  } catch (err) { next(err); }
});

router.put("/orders/:id", async (req, res, next) => {
  try {
    const status = req.body?.status;
    if (!validId(req.params.id)) return res.status(404).json({ error: "Not found" });
    if (!ORDER_STATUS.includes(status)) return res.status(400).json({ error: "Invalid status" });
    const doc = await Order.findByIdAndUpdate(req.params.id, { $set: { status } }, { returnDocument: "after" });
    if (!doc) return res.status(404).json({ error: "Not found" });
    res.json(outOrder(doc));
  } catch (err) { next(err); }
});

// Review Videos page: /api/admin/review-videos
const YT_RE = /^https?:\/\/(www\.|m\.)?(youtube\.com|youtu\.be)\//i;
const outRv = (v) => ({ id: String(v._id), url: v.url, name: v.name || "", title: v.title || "", live: v.live });
// client se sirf ye fields qabool hoti hain; url ho to YouTube ka hona zaroori hai
const rvPick = (b = {}) => {
  const out = {};
  for (const k of ["url", "name", "title"]) if (typeof b[k] === "string") out[k] = b[k].trim();
  if (typeof b.live === "boolean") out.live = b.live;
  return out;
};

router.get("/review-videos", async (_req, res, next) => {
  try {
    const list = await ReviewVideo.find().sort({ sortOrder: 1, createdAt: 1 });
    res.json({ items: list.map(outRv) });
  } catch (err) { next(err); }
});

router.post("/review-videos", async (req, res, next) => {
  try {
    const data = rvPick(req.body);
    if (!data.url || !YT_RE.test(data.url)) return res.status(400).json({ error: "Sahi YouTube link daalo (youtube.com ya youtu.be)." });
    const last = await ReviewVideo.findOne().sort({ sortOrder: -1 }).select("sortOrder");
    const doc = await ReviewVideo.create({ ...data, sortOrder: (last?.sortOrder ?? -1) + 1 });
    res.status(201).json(outRv(doc));
  } catch (err) { next(err); }
});

router.put("/review-videos/:id", async (req, res, next) => {
  try {
    if (!validId(req.params.id)) return res.status(404).json({ error: "Not found" });
    const data = rvPick(req.body);
    if ("url" in data && !YT_RE.test(data.url)) return res.status(400).json({ error: "Sahi YouTube link daalo (youtube.com ya youtu.be)." });
    const doc = await ReviewVideo.findByIdAndUpdate(req.params.id, { $set: data }, { returnDocument: "after", runValidators: true });
    if (!doc) return res.status(404).json({ error: "Not found" });
    res.json(outRv(doc));
  } catch (err) { next(err); }
});

router.delete("/review-videos/:id", async (req, res, next) => {
  try {
    if (!validId(req.params.id)) return res.status(404).json({ error: "Not found" });
    await ReviewVideo.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (err) { next(err); }
});

// Videos page: /api/admin/videos (+ home slider on/off: /api/admin/video-settings)
const ytId = (u = "") => /(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/|live\/))([\w-]{11})/i.test(u.trim());
const outVideo = (v) => ({ id: String(v._id), type: v.type, title: v.title, url: v.url, description: v.description || "", published: v.published });
const videoPick = (b = {}) => {
  const out = {};
  for (const k of ["title", "url", "description"]) if (typeof b[k] === "string") out[k] = b[k].trim();
  if (b.type === "long" || b.type === "short") out.type = b.type;
  if (typeof b.published === "boolean") out.published = b.published;
  return out;
};
const VIDEO_SLIDER_KEY = "videoSliderHome";

router.get("/videos", async (_req, res, next) => {
  try {
    const [list, setting] = await Promise.all([Video.find().sort({ sortOrder: 1, createdAt: 1 }), Setting.findOne({ key: VIDEO_SLIDER_KEY })]);
    res.json({ items: list.map(outVideo), homeSlider: setting ? !!setting.value : true });
  } catch (err) { next(err); }
});

router.put("/video-settings", async (req, res, next) => {
  try {
    if (typeof req.body?.homeSlider !== "boolean") return res.status(400).json({ error: "Invalid request" });
    await Setting.findOneAndUpdate({ key: VIDEO_SLIDER_KEY }, { $set: { value: req.body.homeSlider } }, { upsert: true });
    res.json({ homeSlider: req.body.homeSlider });
  } catch (err) { next(err); }
});

// ek tab (long/short) ki videos ka nayi tarteeb: { type, ids: [...] }
router.post("/videos/reorder", async (req, res, next) => {
  try {
    const { type } = req.body || {};
    const ids = Array.isArray(req.body?.ids) ? req.body.ids.filter(validId).slice(0, 500) : [];
    if (!["long", "short"].includes(type) || !ids.length) return res.status(400).json({ error: "Invalid request" });
    await Video.bulkWrite(ids.map((id, i) => ({ updateOne: { filter: { _id: id, type }, update: { $set: { sortOrder: i } } } })));
    res.json({ ok: true });
  } catch (err) { next(err); }
});

router.post("/videos", async (req, res, next) => {
  try {
    const data = videoPick(req.body);
    if (!data.type || !data.title) return res.status(400).json({ error: "Title zaroori hai" });
    if (!data.url || !ytId(data.url)) return res.status(400).json({ error: "Sahi YouTube link daalo." });
    const last = await Video.findOne({ type: data.type }).sort({ sortOrder: -1 }).select("sortOrder");
    const doc = await Video.create({ ...data, sortOrder: (last?.sortOrder ?? -1) + 1 });
    res.status(201).json(outVideo(doc));
  } catch (err) { next(err); }
});

router.put("/videos/:id", async (req, res, next) => {
  try {
    if (!validId(req.params.id)) return res.status(404).json({ error: "Not found" });
    const data = videoPick(req.body);
    delete data.type; // type (long/short) edit mein nahi badalta
    if ("title" in data && !data.title) return res.status(400).json({ error: "Title zaroori hai" });
    if ("url" in data && !ytId(data.url)) return res.status(400).json({ error: "Sahi YouTube link daalo." });
    const doc = await Video.findByIdAndUpdate(req.params.id, { $set: data }, { returnDocument: "after", runValidators: true });
    if (!doc) return res.status(404).json({ error: "Not found" });
    res.json(outVideo(doc));
  } catch (err) { next(err); }
});

router.delete("/videos/:id", async (req, res, next) => {
  try {
    if (!validId(req.params.id)) return res.status(404).json({ error: "Not found" });
    await Video.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (err) { next(err); }
});

// Pages screen: /api/admin/pages (saare 11 tabs) + image/video upload
const PAGE_KEYS = ["home", "about", "treatments", "medicines", "blog", "testimonials", "videos", "contact", "footer", "privacy", "terms"];
const MEDIA_TYPES = {
  "image/jpeg": "jpg", "image/png": "png", "image/gif": "gif", "image/webp": "webp", "image/avif": "avif",
  "video/mp4": "mp4", "video/webm": "webm", "application/pdf": "pdf",
};
// file ke shuru ke bytes dekh kar asli type pehchante hain (sirf mimetype par bharosa nahi)
const sniffOk = (buf, mime) => {
  const hex = buf.subarray(0, 12).toString("hex");
  const txt = buf.subarray(0, 12).toString("latin1");
  switch (mime) {
    case "image/jpeg": return hex.startsWith("ffd8ff");
    case "image/png": return hex.startsWith("89504e47");
    case "image/gif": return txt.startsWith("GIF8");
    case "image/webp": return txt.startsWith("RIFF") && txt.slice(8, 12) === "WEBP";
    case "image/avif": case "video/mp4": return txt.slice(4, 8) === "ftyp";
    case "video/webm": return hex.startsWith("1a45dfa3");
    case "application/pdf": return txt.startsWith("%PDF");
    default: return false;
  }
};
const mediaUpload = multer({
  storage: multer.diskStorage({
    destination: MEDIA_DIR,
    filename: (_req, file, cb) => cb(null, `${Date.now()}-${crypto.randomBytes(6).toString("hex")}.${MEDIA_TYPES[file.mimetype]}`),
  }),
  limits: { fileSize: 40 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, cb) => cb(MEDIA_TYPES[file.mimetype] ? null : new Error("BAD_MEDIA_TYPE"), !!MEDIA_TYPES[file.mimetype]),
});
router.post("/pages/upload", (req, res) => {
  mediaUpload.single("file")(req, res, async (err) => {
    if (err) {
      const msg = err.message === "BAD_MEDIA_TYPE" ? "Sirf JPG, PNG, WebP, GIF, AVIF image, MP4/WebM video ya PDF allowed hai."
        : err.code === "LIMIT_FILE_SIZE" ? "File 40MB se badi hai." : "Upload nahi ho saka.";
      return res.status(400).json({ error: msg });
    }
    const f = req.file;
    if (!f) return res.status(400).json({ error: "File nahi mili." });
    try {
      const fd = await fs.promises.open(f.path, "r");
      const buf = Buffer.alloc(12);
      await fd.read(buf, 0, 12, 0);
      await fd.close();
      if (!sniffOk(buf, f.mimetype)) { rmMedia(`/api/media/${f.filename}`); return res.status(400).json({ error: "File ka type sahi nahi lag raha." }); }
      if (f.mimetype === "application/pdf" && f.size > 20 * 1024 * 1024) { rmMedia(`/api/media/${f.filename}`); return res.status(413).json({ error: "PDF 20MB se badi hai." }); }
      if (f.mimetype.startsWith("image/") && f.size > 8 * 1024 * 1024) { rmMedia(`/api/media/${f.filename}`); return res.status(413).json({ error: "Image 8MB se badi hai." }); }
      res.status(201).json({ url: `/api/media/${f.filename}` });
    } catch {
      res.status(500).json({ error: "Upload nahi ho saka." });
    }
  });
});

// Modal band karne par jo files upload ho chuki thin magar kisi record mein save nahi hui, unhein saaf karta hai
router.post("/media/prune", async (req, res, next) => {
  try {
    const urls = Array.isArray(req.body?.urls) ? req.body.urls.filter((u) => typeof u === "string").slice(0, 30) : [];
    await pruneMedia(urls);
    res.json({ ok: true });
  } catch (err) { next(err); }
});

router.get("/pages", async (_req, res, next) => {
  try {
    const docs = await PageContent.find({ key: { $in: PAGE_KEYS } });
    res.json({ pages: Object.fromEntries(docs.map((d) => [d.key, d.data || {}])) });
  } catch (err) { next(err); }
});

router.put("/pages/:key", async (req, res, next) => {
  try {
    const { key } = req.params;
    if (!PAGE_KEYS.includes(key)) return res.status(404).json({ error: "Not found" });
    const input = req.body?.data;
    if (!input || typeof input !== "object" || Array.isArray(input)) return res.status(400).json({ error: "Invalid data" });
    const entries = Object.entries(input);
    if (entries.length > 400) return res.status(400).json({ error: "Bohat zyada fields" });
    const data = {};
    for (const [k, v] of entries) {
      if (!/^[A-Za-z][A-Za-z0-9]{0,40}$/.test(k) || typeof v !== "string") return res.status(400).json({ error: `Invalid field: ${k}` });
      if (v.length > 200000) return res.status(400).json({ error: `"${k}" bohat lamba hai` });
      if (v.startsWith("data:") || v.startsWith("blob:")) return res.status(400).json({ error: `"${k}": image/video pehle upload hona chahiye` });
      data[k] = v;
    }
    const old = await PageContent.findOne({ key });
    await PageContent.findOneAndUpdate({ key }, { $set: { data } }, { upsert: true });
    // jo purani image/video/PDF ab kisi page ya record mein use nahi, wo disk se hata do
    const now = new Set(Object.values(data));
    pruneMedia(Object.values(old?.data || {}).filter((v) => typeof v === "string" && !now.has(v)));
    res.json({ ok: true });
  } catch (err) { next(err); }
});

// Settings (4 tabs) + Backup & Restore: server/routes/settings.js
router.use(settingsRoutes);

// Dashboard ke saare numbers DB se: GET /api/admin/dashboard  (index.js mein requireAuth ke peeche lagta hai)
router.get("/dashboard", async (_req, res, next) => {
  try {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(startOfDay);
    startOfWeek.setDate(startOfDay.getDate() - ((startOfDay.getDay() + 6) % 7)); // hafte ki shuruaat = Monday
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const counts = (M) => Promise.all([M.countDocuments(), M.countDocuments({ live: true })]);
    const since = (d) => Order.countDocuments({ createdAt: { $gte: d } });

    const [
      [treatments, treatmentsLive],
      [medicines, medicinesLive],
      [articles, articlesLive],
      [testimonials, testimonialsLive],
      appointments,
      pendingTotal,
      pendingList,
      ordersTotal,
      ordersToday,
      ordersWeek,
      ordersMonth,
      recentOrders,
    ] = await Promise.all([
      counts(Treatment),
      counts(Medicine),
      counts(Article),
      counts(Testimonial),
      Appointment.countDocuments(),
      Appointment.countDocuments({ status: "pending" }),
      Appointment.find({ status: "pending" }).sort({ createdAt: -1 }).limit(10).lean(),
      Order.countDocuments(),
      since(startOfDay),
      since(startOfWeek),
      since(startOfMonth),
      Order.find().sort({ createdAt: -1 }).limit(5).lean(),
    ]);

    res.json({
      stats: {
        treatments: { total: treatments, live: treatmentsLive },
        medicines: { total: medicines, live: medicinesLive },
        articles: { total: articles, live: articlesLive },
        testimonials: { total: testimonials, live: testimonialsLive },
        appointments: { total: appointments, pending: pendingTotal },
      },
      orders: { total: ordersTotal, today: ordersToday, week: ordersWeek, month: ordersMonth },
      recentOrders: recentOrders.map((o) => ({
        id: String(o._id), medicine: o.medicine, customer: o.customer, qty: o.qty, status: o.status, createdAt: o.createdAt,
      })),
      pendingAppointments: pendingList.map((a) => ({
        id: String(a._id), name: a.name, phone: a.phone, date: a.date || a.createdAt.toISOString().slice(0, 10),
      })),
    });
  } catch (err) {
    next(err);
  }
});

export default router;
