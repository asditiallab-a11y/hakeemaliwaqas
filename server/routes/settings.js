import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { pipeline } from "node:stream/promises";
import { Transform } from "node:stream";
import { fileURLToPath } from "node:url";
import { ZipArchive } from "archiver";
import express from "express";
import mongoose from "mongoose";
import multer from "multer";
import yauzl from "yauzl";
import Admin from "../models/Admin.js";
import Category from "../models/Category.js";
import Consultation from "../models/Consultation.js";
import {
  Treatment, Medicine, Article, Testimonial, Appointment, Order, ReviewVideo, Video, Setting, PageContent,
} from "../models/content.js";

const router = express.Router();
const { EJSON } = mongoose.mongo.BSON;
const SERVER_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const DATA_DIR = process.env.DATA_DIR || SERVER_DIR; // Railway Volume
const MEDIA_DIR = path.join(DATA_DIR, "media"); // Pages ki images/videos
const UPLOAD_DIR = path.join(DATA_DIR, "uploads"); // consultation ki PDF reports
fs.mkdirSync(MEDIA_DIR, { recursive: true });
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

class BadInput extends Error {}

/* =====================================================================
   SETTINGS: /api/admin/settings  (website, social, analytics, theme)
   Har group "Setting" collection mein ek document: key = "settings.<group>"
   ===================================================================== */
const text = (v, max, label, { required = false } = {}) => {
  if (typeof v !== "string") throw new BadInput(`${label} galat hai`);
  const t = v.trim();
  if (required && !t) throw new BadInput(`${label} zaroori hai`);
  if (t.length > max) throw new BadInput(`${label} bohat lamba hai (max ${max})`);
  return t;
};
const PHONE_RE = /^[+\d\s()-]{0,30}$/;
const phone = (v, label) => {
  const t = text(v, 30, label);
  if (!PHONE_RE.test(t)) throw new BadInput(`${label} mein sirf number, +, -, ( ) aur space allowed hain`);
  return t;
};
const url = (v, label) => {
  const t = text(v, 300, label);
  if (!t) return "";
  let u;
  try { u = new URL(t); } catch { throw new BadInput(`${label}: sahi link daalo (https://...)`); }
  if (!["http:", "https:"].includes(u.protocol)) throw new BadInput(`${label}: sirf http/https link allowed hai`);
  return t;
};
const pattern = (v, re, label, example) => {
  const t = text(v, 40, label);
  if (t && !re.test(t)) throw new BadInput(`${label} sahi nahi lag raha (misal: ${example})`);
  return t;
};
const isHex = (v) => typeof v === "string" && /^#[0-9a-fA-F]{6}$/.test(v);

// Har group: { field: validator }. Sirf wohi fields qabool hoti hain jo yahan likhi hain.
const GROUPS = {
  website: {
    name: (v) => text(v, 120, "Website Name", { required: true }),
    tagline: (v) => text(v, 200, "Tagline"),
    heroHeading: (v) => text(v, 200, "Hero Heading"),
    heroSubtitle: (v) => text(v, 1000, "Hero Subtitle"),
    phones: (v) => {
      if (!Array.isArray(v) || v.length > 20) throw new BadInput("Phone numbers galat hain (max 20)");
      return v.map((p, i) => phone(p, `Phone ${i + 1}`)).filter(Boolean);
    },
    whatsapp: (v) => phone(v, "WhatsApp Number"),
    email: (v) => {
      const t = text(v, 160, "Email");
      if (t && !/^[^\s@]{1,64}@[^\s@]{1,100}\.[^\s@]{2,}$/.test(t)) throw new BadInput("Email sahi nahi hai");
      return t;
    },
    address: (v) => text(v, 1000, "Address"),
    hours: (v) => text(v, 200, "Clinic Hours"),
    footerText: (v) => text(v, 3000, "Footer Text"),
  },
  social: {
    facebook: (v) => url(v, "Facebook"),
    instagram: (v) => url(v, "Instagram"),
    twitter: (v) => url(v, "Twitter / X"),
    youtube: (v) => url(v, "YouTube"),
  },
  // Ye IDs website par script mein jaati hain, is liye sakht format check (koi code/quote andar nahi ja sakta)
  analytics: {
    ga: (v) => pattern(v, /^(G|UA|AW|GT)-[A-Za-z0-9-]{4,20}$/, "Google Analytics ID", "G-XXXXXXXXXX"),
    fb: (v) => pattern(v, /^\d{5,20}$/, "Facebook Pixel ID", "123456789012345"),
    tiktok: (v) => pattern(v, /^[A-Za-z0-9]{8,30}$/, "TikTok Pixel ID", "C4XXXXXXXXXXXXXXXXXX"),
  },
};

const settingKey = (g) => `settings.${g}`;

router.get("/settings", async (_req, res, next) => {
  try {
    const docs = await Setting.find({ key: { $in: ["website", "social", "analytics", "theme"].map(settingKey) } });
    const out = { website: null, social: null, analytics: null, theme: null };
    for (const d of docs) out[d.key.slice("settings.".length)] = d.value ?? null;
    res.json(out);
  } catch (err) { next(err); }
});

router.put("/settings/:group", async (req, res, next) => {
  try {
    const { group } = req.params;
    const body = req.body;
    if (!body || typeof body !== "object" || Array.isArray(body)) return res.status(400).json({ error: "Invalid data" });

    let clean = {};
    if (group === "theme") {
      const entries = Object.entries(body);
      if (!entries.length || entries.length > 60) return res.status(400).json({ error: "Invalid data" });
      for (const [k, v] of entries) {
        if (!/^[A-Za-z]{1,30}$/.test(k)) return res.status(400).json({ error: `Invalid color key: ${k}` });
        if (!isHex(v)) return res.status(400).json({ error: `"${k}" ka hex code galat hai (e.g. #DBA921)` });
        clean[k] = v.toUpperCase();
      }
    } else if (GROUPS[group]) {
      for (const [k, validate] of Object.entries(GROUPS[group])) if (k in body) clean[k] = validate(body[k]);
      if (!Object.keys(clean).length) return res.status(400).json({ error: "Invalid data" });
    } else {
      return res.status(404).json({ error: "Not found" });
    }

    // purane saved fields ke upar naye fields merge (taake sirf phones bhejne se baqi na mitein)
    const key = settingKey(group);
    const old = await Setting.findOne({ key });
    const value = { ...(old?.value && typeof old.value === "object" ? old.value : {}), ...clean };
    await Setting.findOneAndUpdate({ key }, { $set: { value } }, { upsert: true });
    res.json({ ok: true, value });
  } catch (err) {
    if (err instanceof BadInput) return res.status(400).json({ error: err.message });
    next(err);
  }
});

/* =====================================================================
   BACKUP & RESTORE: /api/admin/backup...
   Zip ke andar: manifest.json, data/<collection>.json (EJSON), media/<file>, uploads/<file>
   ===================================================================== */
// uniqueBy: merge mode mein record kis field se pehchana jaye (default _id)
const COLLECTIONS = [
  { key: "admins", label: "Admin Users", model: Admin, users: true },
  { key: "categories", label: "Categories (Treatments & Medicines)", model: Category },
  { key: "treatments", label: "Treatments", model: Treatment },
  { key: "medicines", label: "Herbal Medicines", model: Medicine },
  { key: "articles", label: "Articles", model: Article },
  { key: "testimonials", label: "Testimonials", model: Testimonial },
  { key: "appointments", label: "Appointments", model: Appointment },
  { key: "orders", label: "Orders", model: Order },
  { key: "consultations", label: "Consultation Forms", model: Consultation },
  { key: "reviewVideos", label: "Review Videos", model: ReviewVideo },
  { key: "videos", label: "Videos", model: Video },
  { key: "settings", label: "Site Settings", model: Setting, uniqueBy: "key" },
  { key: "pages", label: "Page Content", model: PageContent, uniqueBy: "key" },
];
const MEDIA_NAME_RE = /^[\w-]{1,100}\.(?:jpg|png|gif|webp|avif|mp4|webm|pdf)$/;
const PDF_NAME_RE = /^[\w-]{1,100}\.pdf$/;
const SCRYPT_RE = /^scrypt\$[0-9a-f]{32}\$[0-9a-f]{128}$/;
const MAX_DATA_FILE = 100 * 1024 * 1024; // ek json file ka uncompressed max
const MAX_MEDIA_FILE = 100 * 1024 * 1024;
const MAX_ENTRIES = 20000;
const MANIFEST_APP = "hikmat-admin-backup";

const listFiles = async (dir, re) => {
  const names = (await fs.promises.readdir(dir)).filter((n) => re.test(n));
  const sizes = await Promise.all(names.map((n) => fs.promises.stat(path.join(dir, n)).then((s) => s.size).catch(() => 0)));
  return names.map((name, i) => ({ name, size: sizes[i] }));
};

router.get("/backup/stats", async (_req, res, next) => {
  try {
    const [counts, media, pdfs] = await Promise.all([
      Promise.all(COLLECTIONS.map((c) => c.model.countDocuments())),
      listFiles(MEDIA_DIR, MEDIA_NAME_RE),
      listFiles(UPLOAD_DIR, PDF_NAME_RE),
    ]);
    const files = [...media, ...pdfs];
    res.json({
      tables: COLLECTIONS.map((c, i) => ({ key: c.key, label: c.label, count: counts[i] })),
      files: files.length,
      bytes: files.reduce((n, f) => n + f.size, 0),
    });
  } catch (err) { next(err); }
});

router.get("/backup", async (req, res, next) => {
  try {
    const withMedia = req.query.media !== "0";
    const withUsers = req.query.users !== "0";
    const cols = COLLECTIONS.filter((c) => withUsers || !c.users);
    const date = new Date().toISOString().slice(0, 10);

    res.set({
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="hikmat-backup-${date}.zip"`,
      "Cache-Control": "no-store",
    });
    const zip = new ZipArchive({ zlib: { level: 6 } });
    zip.on("error", (err) => { console.error("[backup] zip error:", err.message); res.destroy(err); });
    zip.on("warning", (err) => console.warn("[backup] warning:", err.message));
    res.on("close", () => { if (!res.writableFinished) zip.abort(); });
    zip.pipe(res);

    const counts = {};
    for (const c of cols) {
      const docs = await c.model.find().lean();
      counts[c.key] = docs.length;
      zip.append(EJSON.stringify(docs, { relaxed: false }), { name: `data/${c.key}.json` });
    }
    let files = 0;
    if (withMedia) {
      for (const { name } of await listFiles(MEDIA_DIR, MEDIA_NAME_RE)) { zip.file(path.join(MEDIA_DIR, name), { name: `media/${name}` }); files++; }
      for (const { name } of await listFiles(UPLOAD_DIR, PDF_NAME_RE)) { zip.file(path.join(UPLOAD_DIR, name), { name: `uploads/${name}` }); files++; }
    }
    zip.append(JSON.stringify({ app: MANIFEST_APP, version: 1, createdAt: new Date().toISOString(), includesMedia: withMedia, includesUsers: withUsers, counts, files }, null, 2), { name: "manifest.json" });
    await zip.finalize();
  } catch (err) {
    if (res.headersSent) return res.destroy(err);
    next(err);
  }
});

// ---- restore ----
const restoreUpload = multer({
  storage: multer.diskStorage({
    destination: os.tmpdir(),
    filename: (_req, _file, cb) => cb(null, `hikmat-restore-${Date.now()}-${crypto.randomBytes(6).toString("hex")}.zip`),
  }),
  limits: { fileSize: 500 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, cb) => cb(file.originalname.toLowerCase().endsWith(".zip") ? null : new Error("ONLY_ZIP"), file.originalname.toLowerCase().endsWith(".zip")),
});

const openZip = (file) => new Promise((resolve, reject) => {
  yauzl.open(file, { lazyEntries: true, autoClose: true, validateEntrySizes: true }, (err, zf) => (err ? reject(new BadInput("Zip file kharab hai.")) : resolve(zf)));
});
const readEntry = (zf, entry) => new Promise((resolve, reject) => {
  zf.openReadStream(entry, (err, stream) => {
    if (err) return reject(err);
    const chunks = [];
    stream.on("data", (c) => chunks.push(c));
    stream.on("error", reject);
    stream.on("end", () => resolve(Buffer.concat(chunks)));
  });
});
// zip ke entries ek ek karke chalao. handler true de to aage nahi parhte.
const eachEntry = (zf, handler) => new Promise((resolve, reject) => {
  let n = 0;
  zf.on("error", () => reject(new BadInput("Backup zip kharab hai ya us mein ghair-mehfooz file naam hain.")));
  zf.on("end", resolve);
  zf.on("entry", async (entry) => {
    try {
      if (++n > MAX_ENTRIES) throw new BadInput("Backup file mein bohat zyada entries hain");
      await handler(entry);
      zf.readEntry();
    } catch (err) { zf.close(); reject(err); }
  });
  zf.readEntry();
});


// manifest.json aur data/*.json ko memory mein parhta hai (har file ka size limit ke saath)
async function readData(file, onFile) {
  const zf = await openZip(file);
  await eachEntry(zf, async (entry) => {
    const name = entry.fileName;
    if (name !== "manifest.json" && !/^data\/[A-Za-z]+\.json$/.test(name)) return;
    if (entry.uncompressedSize > MAX_DATA_FILE) throw new BadInput(`${name} bohat bari hai`);
    onFile(name, await readEntry(zf, entry));
  });
}

// media/ aur uploads/ ki files disk par likhta hai. Naam sakht regex se check hota hai (zip-slip mumkin nahi).
async function extractMedia(file) {
  const zf = await openZip(file);
  let n = 0;
  await eachEntry(zf, async (entry) => {
    const m = /^(media|uploads)\/([^/\\]+)$/.exec(entry.fileName);
    if (!m) return;
    const [, dirName, name] = m;
    const ok = dirName === "media" ? MEDIA_NAME_RE.test(name) : PDF_NAME_RE.test(name);
    if (!ok || entry.uncompressedSize > MAX_MEDIA_FILE) return;
    const dest = path.join(dirName === "media" ? MEDIA_DIR : UPLOAD_DIR, name);
    const part = `${dest}.part`;
    const stream = await new Promise((resolve, reject) => zf.openReadStream(entry, (e, s2) => (e ? reject(e) : resolve(s2))));
    let size = 0;
    const limit = new Transform({
      transform(chunk, _enc, cb) {
        size += chunk.length;
        cb(size > MAX_MEDIA_FILE ? new BadInput("File bohat bari hai") : null, chunk);
      },
    });
    try {
      await pipeline(stream, limit, fs.createWriteStream(part));
      await fs.promises.rename(part, dest);
      n++;
    } catch (err) {
      fs.unlink(part, () => {});
      throw err;
    }
  });
  return n;
}

const looksLikeZip = async (file) => {
  const fd = await fs.promises.open(file, "r");
  try {
    const b = Buffer.alloc(4);
    await fd.read(b, 0, 4, 0);
    return b[0] === 0x50 && b[1] === 0x4b;
  } finally { await fd.close(); }
};

// Backup ke documents ko schema se guzaar kar saaf karta hai. Galat ho to BadInput.
function prepare(c, rawDocs) {
  if (!Array.isArray(rawDocs)) throw new BadInput(`${c.label}: data galat hai`);
  const seen = new Set();
  return rawDocs.map((raw, i) => {
    if (!raw || typeof raw !== "object" || Array.isArray(raw) || raw._id?._bsontype !== "ObjectId") throw new BadInput(`${c.label} #${i + 1}: record galat hai`);
    const id = String(raw._id);
    if (seen.has(id)) throw new BadInput(`${c.label}: duplicate record`);
    seen.add(id);
    const doc = new c.model(raw);
    const err = doc.validateSync();
    if (err) throw new BadInput(`${c.label} #${i + 1}: ${Object.values(err.errors).map((e) => e.message)[0] ?? "invalid"}`);
    if (c.key === "admins" && !SCRYPT_RE.test(raw.passwordHash)) throw new BadInput("Admin users: password hash galat hai");
    if (c.key === "pages") {
      const d = raw.data;
      if (!d || typeof d !== "object" || Object.entries(d).some(([k, v]) => !/^[A-Za-z][A-Za-z0-9]{0,40}$/.test(k) || typeof v !== "string")) throw new BadInput("Page Content: data galat hai");
    }
    return doc.toObject({ versionKey: true });
  });
}

async function applyCollection(c, docs, replace) {
  const col = c.model.collection;
  if (replace) {
    await col.deleteMany({});
    if (docs.length) await col.insertMany(docs, { ordered: false });
  } else if (docs.length) {
    const by = c.uniqueBy || "_id";
    await col.bulkWrite(docs.map((d) => ({ replaceOne: { filter: { [by]: d[by] }, replacement: d, upsert: true } })), { ordered: false });
  }
}

router.post("/backup/restore", (req, res) => {
  restoreUpload.single("file")(req, res, async (upErr) => {
    const tmp = req.file?.path;
    const cleanup = () => tmp && fs.unlink(tmp, () => {});
    try {
      if (upErr) {
        const msg = upErr.message === "ONLY_ZIP" ? "Sirf .zip backup file allowed hai." : upErr.code === "LIMIT_FILE_SIZE" ? "Backup file 500MB se badi hai." : "Upload nahi ho saka.";
        return res.status(400).json({ error: msg });
      }
      if (!tmp) return res.status(400).json({ error: "Backup file nahi mili." });
      if (!(await looksLikeZip(tmp))) return res.status(400).json({ error: "Ye valid zip file nahi hai." });

      const opt = (k, def) => (req.body?.[k] === undefined ? def : req.body[k] === "1" || req.body[k] === "true");
      const replace = opt("replace", true);
      const withMedia = opt("media", true);
      const withUsers = opt("users", false);

      // ---- pass 1: manifest + data files padho ----
      let manifest = null;
      const raw = {};
      await readData(tmp, (name, buf) => {
        if (name === "manifest.json") {
          try { manifest = JSON.parse(buf.toString("utf8")); } catch { throw new BadInput("manifest.json kharab hai"); }
        } else raw[name.slice(5, -5)] = buf.toString("utf8");
      });
      if (!manifest || manifest.app !== MANIFEST_APP) return res.status(400).json({ error: "Ye Hikmat admin ka backup nahi lagta." });

      // ---- sab kuch pehle validate karo; kuch bhi galat ho to database ko haath nahi lagta ----
      const plan = [];
      for (const c of COLLECTIONS) {
        if (c.users && !withUsers) continue;
        if (raw[c.key] === undefined) continue;
        let parsed;
        try { parsed = EJSON.parse(raw[c.key], { relaxed: false }); } catch { throw new BadInput(`${c.label}: file kharab hai`); }
        const docs = prepare(c, parsed);
        if (c.users && !docs.length) throw new BadInput("Backup mein koi admin user nahi hai, restore se login band ho sakta hai.");
        plan.push([c, docs]);
      }
      if (!plan.length && !withMedia) return res.status(400).json({ error: "Backup mein restore karne ko kuch nahi mila." });

      // ---- apply ----
      const restored = {};
      for (const [c, docs] of plan) {
        await applyCollection(c, docs, replace);
        restored[c.key] = docs.length;
      }

      // ---- pass 2: media/PDF files ----
      let files = 0;
      if (withMedia) files = await extractMedia(tmp);
      res.json({ ok: true, restored, files });
    } catch (err) {
      if (err instanceof BadInput) return res.status(400).json({ error: err.message });
      console.error("[restore] failed:", err);
      res.status(500).json({ error: "Restore fail ho gaya. Server ka terminal dekho." });
    } finally {
      cleanup();
    }
  });
});

export default router;
