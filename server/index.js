import "dotenv/config";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";
import multer from "multer";
import { connectWithRetry, mongoose } from "./db.js";
import Consultation from "./models/Consultation.js";
import { adminStore } from "./adminStore.js";
import { createAuth, ensureAdmin } from "./auth.js";
import adminRoutes from "./routes/admin.js";
import publicRoutes from "./routes/public.js";
import { Appointment, Medicine, Order, ReviewVideo, Setting } from "./models/content.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = process.env.DATA_DIR || __dirname; // Railway par Volume ka mount path (media + uploads yahin rahengi)
const UPLOAD_DIR = path.join(DATA_DIR, "uploads");
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const isProd = process.env.NODE_ENV === "production";
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  console.error("\n[server] JWT_SECRET .env mein set nahi (kam az kam 32 characters). Admin login iske baghair nahi chal sakta.\n");
  process.exit(1);
}

const app = express();
app.disable("x-powered-by");
if (isProd) app.set("trust proxy", 1); // nginx/host ke peeche ho to asli IP mile
app.use(express.json({ limit: "1mb" }));

// ---- CORS: frontend (Hostinger) alag domain par ho to sirf CLIENT_ORIGIN wali sites API use kar sakti hain ----
// CLIENT_ORIGIN=https://tumharidomain.com,https://www.tumharidomain.com  (comma se alag, aakhir mein "/" nahi)
const ALLOWED_ORIGINS = (process.env.CLIENT_ORIGIN || "").split(",").map((s) => s.trim().replace(/\/+$/, "")).filter(Boolean);
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    res.setHeader("Vary", "Origin");
    if (req.method === "OPTIONS") return res.sendStatus(204);
  }
  next();
});

// ---- admin login (cookie-based, httpOnly) ----
const { router: authRouter, requireAuth } = createAuth(adminStore, {
  jwtSecret: process.env.JWT_SECRET,
  isProd,
  clientOrigin: process.env.CLIENT_ORIGIN || "",
  isReady: () => mongoose.connection.readyState === 1,
});
app.use("/api/auth", authRouter);
// Website ke liye public read-only data (Home page wagaira) - login nahi chahiye
app.use("/api/site", publicRoutes);
// Admin ke data wale routes (sab login ke peeche)
app.use("/api/admin", requireAuth, adminRoutes);
// Pages ki uploaded images/videos website par bhi dikhni hain, is liye ye folder public hai (naam random hota hai)
app.use("/api/media", express.static(path.join(DATA_DIR, "media"), {
  index: false, maxAge: "7d", setHeaders: (res) => res.setHeader("X-Content-Type-Options", "nosniff"),
}));

// ---- website ka "Book an Appointment" form (public, sirf save karta hai) ----
const apptHits = new Map(); // IP -> { count, reset }  (spam rokne ke liye: 1 ghante mein 5)
app.post("/api/appointments", async (req, res) => {
  try {
    const now = Date.now();
    const rec = apptHits.get(req.ip);
    if (rec && rec.reset > now && rec.count >= 5) return res.status(429).json({ error: "Too many requests. Please try later." });
    if (!rec || rec.reset <= now) apptHits.set(req.ip, { count: 1, reset: now + 60 * 60 * 1000 });
    else rec.count += 1;

    const { name, email, phone, date, message } = req.body ?? {};
    const doc = await Appointment.create({
      name: String(name ?? ""), email: String(email ?? ""), phone: String(phone ?? ""),
      date: /^\d{4}-\d{2}-\d{2}$/.test(String(date ?? "")) ? String(date) : undefined,
      message: String(message ?? "").slice(0, 2000),
    });
    res.status(201).json({ ok: true, id: doc._id });
  } catch (err) {
    if (err.name === "ValidationError") return res.status(400).json({ error: "Validation failed", fields: Object.keys(err.errors) });
    console.error("[appointments] save failed:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// ---- medicine detail page ka "Add to Cart" / order request (public, sirf save karta hai) ----
// Admin > Orders mein dikhta hai. Medicine ka naam server DB se leta hai (client ka bheja naam qabool nahi).
const orderHits = new Map(); // IP -> { count, reset }  (spam rokne ke liye: 1 ghante mein 10)
app.post("/api/orders", async (req, res) => {
  try {
    const now = Date.now();
    const rec = orderHits.get(req.ip);
    if (rec && rec.reset > now && rec.count >= 10) return res.status(429).json({ error: "Too many requests. Please try later." });
    if (!rec || rec.reset <= now) orderHits.set(req.ip, { count: 1, reset: now + 60 * 60 * 1000 });
    else rec.count += 1;

    const { medicineId, customer, phone, city, qty } = req.body ?? {};
    const name = String(customer ?? "").trim();
    const ph = String(phone ?? "").trim();
    if (!mongoose.isValidObjectId(medicineId)) return res.status(400).json({ error: "Medicine galat hai" });
    if (!name || name.length > 120) return res.status(400).json({ error: "Naam likhein" });
    if (!/^[+\d\s()-]{7,30}$/.test(ph)) return res.status(400).json({ error: "Phone number sahi likhein" });
    const n = Math.floor(Number(qty));
    if (!Number.isFinite(n) || n < 1 || n > 99) return res.status(400).json({ error: "Quantity galat hai" });

    const med = await Medicine.findOne({ _id: medicineId, live: { $ne: false } }).select("title");
    if (!med) return res.status(404).json({ error: "Medicine nahi mili" });

    const doc = await Order.create({ medicine: med.title, customer: name, phone: ph, city: String(city ?? "").trim().slice(0, 80), qty: n });
    res.status(201).json({ ok: true, orderNo: doc.orderNo });
  } catch (err) {
    if (err.name === "ValidationError") return res.status(400).json({ error: "Validation failed" });
    console.error("[orders] save failed:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// ---- PDF upload (max 20MB, sirf PDF) ----
const upload = multer({
  storage: multer.diskStorage({
    destination: UPLOAD_DIR,
    filename: (_req, _file, cb) => cb(null, `${Date.now()}-${crypto.randomBytes(6).toString("hex")}.pdf`),
  }),
  limits: { fileSize: 20 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, cb) => {
    const ok = file.mimetype === "application/pdf" || file.originalname.toLowerCase().endsWith(".pdf");
    cb(ok ? null : new Error("ONLY_PDF"), ok);
  },
});

// ---- health check: browser mein /api/health kholkar connection dekh sakte ho ----
app.get("/api/health", (_req, res) => {
  const states = ["disconnected", "connected", "connecting", "disconnecting"];
  res.json({ ok: mongoose.connection.readyState === 1, mongodb: states[mongoose.connection.readyState] });
});

// ---- consultation form submit ----
// NOTE: abhi sirf SAVE karne wala route hai. Data parhne wala route (admin ke liye) login/auth
// banne ke baad lagana hai, warna patients ka data bina password ke khula hota.
app.post("/api/consultations", upload.single("report"), async (req, res) => {
  try {
    let payload;
    try {
      payload = JSON.parse(req.body.data || "{}");
    } catch {
      return res.status(400).json({ error: "Invalid data" });
    }

    const { patientType, fullName, fatherName, age, phone, email, city, country, address, budget, language, ...rest } = payload;
    const doc = await Consultation.create({
      patientType,
      fullName,
      fatherName,
      age,
      phone,
      email: email || undefined,
      city,
      country,
      address,
      medicineBudget: budget,
      language: language === "ur" ? "ur" : "en",
      answers: rest,
      report: req.file
        ? { originalName: req.file.originalname, storedName: req.file.filename, size: req.file.size }
        : undefined,
    });
    res.status(201).json({ ok: true, id: doc._id });
  } catch (err) {
    if (req.file) fs.unlink(req.file.path, () => {});
    if (err.name === "ValidationError") {
      return res.status(400).json({ error: "Validation failed", fields: Object.keys(err.errors) });
    }
    console.error("[consultations] save failed:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});
// ---- frontend (Vite build) serve karo ----
const DIST_DIR = path.join(__dirname, "..", "dist");
if (fs.existsSync(DIST_DIR)) {
  app.use(express.static(DIST_DIR, { index: false, maxAge: "1h" }));
  // React Router ke pages (refresh par bhi chalein): /api ke ilawa har GET par index.html
  app.use((req, res, next) => {
    if (req.method !== "GET" || req.path.startsWith("/api")) return next();
    res.sendFile(path.join(DIST_DIR, "index.html"));
  });
} else {
  console.warn("[server] dist/ folder nahi mila. Build chala hi nahi (npm run build).");
}
// ---- errors (multer wagaira) ----
app.use((err, _req, res, _next) => {
  if (err.message === "ONLY_PDF") return res.status(400).json({ error: "Only PDF files are allowed" });
  if (err.code === "LIMIT_FILE_SIZE") return res.status(413).json({ error: "File larger than 20MB" });
  console.error("[server] error:", err);
  // development mein asli wajah browser mein bhi dikhao (production mein nahi)
  res.status(500).json({ error: isProd ? "Server error" : `Server error: ${err.message}` });
});

const PORT = Number(process.env.PORT) || 5000;
app.listen(PORT, () => console.log(`[server] http://localhost:${PORT}`));

// Server pehle start ho jata hai; DB connect hone mein waqt lage ya fail ho to saaf message dikhe
async function start() {
  const connected = await connectWithRetry();
  if (!connected) return;
  try {
    const r = await ensureAdmin(adminStore, { username: process.env.ADMIN_USERNAME, password: process.env.ADMIN_PASSWORD });
    if (r === "created") console.log(`[admin] pehla admin "${process.env.ADMIN_USERNAME}" ban gaya`);
    if (r === "missing-env") console.warn("[admin] Koi admin nahi hai. .env mein ADMIN_USERNAME aur ADMIN_PASSWORD likho.");
  } catch (err) {
    console.error("[admin] admin banane mein masla:", err.message);
  }
  try {
    await seedReviewVideosOnce();
  } catch (err) {
    console.error("[review-videos] starter videos daalne mein masla:", err.message);
  }
}

// Home page ka "Video Reviews" slider Admin > Review Videos se chalta hai. Naye/khali database mein slider khali
// na dikhe, is liye pehli baar sirf 5 starter videos daal di jati hain. Uske baad admin jo karega wahi chalega:
// saari videos delete bhi kar do to dobara wapas nahi aayengi (marker "seed.reviewVideos" save ho jata hai).
const STARTER_REVIEW_VIDEOS = [
  ["M Hafeez", "https://youtube.com/shorts/53rV7CXvzeE?feature=share", "Stomach Ulcer Treatment ! معدے کے السر کا علاج"],
  ["Female Patient From Narang Mandi", "https://youtube.com/shorts/u8VM7xsPUOA", ""],
  ["Malik Sultan Car Driver", "https://youtube.com/shorts/ZyF62IIjqr8?feature=share", ""],
  ["Arif From Feroze Wattwan", "https://youtube.com/shorts/UH8fAj8ZdgA?feature=share", ""],
  ["Attique Ahmad", "https://youtube.com/shorts/znjIplqox98", ""],
];
async function seedReviewVideosOnce() {
  if (await Setting.findOne({ key: "seed.reviewVideos" })) return;
  if ((await ReviewVideo.countDocuments()) === 0) {
    await ReviewVideo.insertMany(STARTER_REVIEW_VIDEOS.map(([name, url, title], i) => ({ name, url, title, sortOrder: i })));
    console.log("[review-videos] 5 starter videos add ho gayi (Admin > Review Videos se badal sakte ho)");
  }
  await Setting.create({ key: "seed.reviewVideos", value: true });
}
start();
