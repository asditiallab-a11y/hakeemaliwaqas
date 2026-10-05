import crypto from "node:crypto";
import { promisify } from "node:util";
import express from "express";
import jwt from "jsonwebtoken";

const scrypt = promisify(crypto.scrypt);

export const COOKIE_NAME = "hikmat_admin";
const SESSION_MS = 24 * 60 * 60 * 1000; // 1 din
const USERNAME_RE = /^[a-zA-Z0-9._-]{3,40}$/;

// ---------- password hashing (scrypt, Node ke andar hi - koi extra package nahi) ----------
export async function hashPassword(password) {
  const salt = crypto.randomBytes(16);
  const key = await scrypt(password, salt, 64);
  return `scrypt$${salt.toString("hex")}$${key.toString("hex")}`;
}

export async function verifyPassword(password, stored) {
  const [alg, saltHex, keyHex] = String(stored).split("$");
  if (alg !== "scrypt" || !saltHex || !keyHex) return false;
  const expected = Buffer.from(keyHex, "hex");
  const actual = await scrypt(password, Buffer.from(saltHex, "hex"), expected.length);
  return crypto.timingSafeEqual(actual, expected);
}

// ---------- chhote helpers ----------
function readCookie(req, name) {
  const header = req.headers.cookie;
  if (!header) return null;
  for (const part of header.split(";")) {
    const i = part.indexOf("=");
    if (i > 0 && part.slice(0, i).trim() === name) return decodeURIComponent(part.slice(i + 1).trim());
  }
  return null;
}

// Login attempts rokne ke liye (brute force): ek (IP + username) se 15 minute mein 5 galat koshish
function createLimiter({ max, windowMs }) {
  const hits = new Map();
  return {
    check(key) {
      const now = Date.now();
      const rec = hits.get(key);
      if (!rec || rec.reset < now) return 0;
      return rec.count >= max ? Math.ceil((rec.reset - now) / 1000) : 0; // 0 = allowed, warna kitne second ruko
    },
    fail(key) {
      const now = Date.now();
      const rec = hits.get(key);
      if (!rec || rec.reset < now) hits.set(key, { count: 1, reset: now + windowMs });
      else rec.count += 1;
      if (hits.size > 5000) for (const [k, v] of hits) if (v.reset < now) hits.delete(k);
    },
    clear: (key) => hits.delete(key),
  };
}

export function createAuth(store, { jwtSecret, isProd = false, clientOrigin = "", isReady = () => true } = {}) {
  if (!jwtSecret || jwtSecret.length < 32) throw new Error("JWT_SECRET kam az kam 32 characters ka hona chahiye");

  const limiter = createLimiter({ max: 5, windowMs: 15 * 60 * 1000 });
  // username na milne par bhi utna hi waqt lage jitna sahi username par (timing se pata na chale)
  const dummyHash = hashPassword(crypto.randomBytes(8).toString("hex"));

  // API subdomain (api.tumharidomain.com) same-site hai, is liye "lax" kaafi hai. Railway ka default domain (*.up.railway.app)
  // use karo to .env mein COOKIE_SAMESITE=none likho (secure cookie, sirf HTTPS par).
  const sameSite = ["lax", "strict", "none"].includes(process.env.COOKIE_SAMESITE) ? process.env.COOKIE_SAMESITE : "lax";
  const cookieOpts = { httpOnly: true, sameSite, secure: isProd || sameSite === "none", path: "/" };
  const setSession = (res, admin) => {
    const token = jwt.sign({ sub: admin.id, v: admin.tokenVersion }, jwtSecret, { algorithm: "HS256", expiresIn: SESSION_MS / 1000 });
    res.cookie(COOKIE_NAME, token, { ...cookieOpts, maxAge: SESSION_MS });
  };
  const clearSession = (res) => res.clearCookie(COOKIE_NAME, cookieOpts);

  async function adminFromRequest(req) {
    const token = readCookie(req, COOKIE_NAME);
    if (!token) return null;
    let payload;
    try {
      payload = jwt.verify(token, jwtSecret, { algorithms: ["HS256"] });
    } catch {
      return null;
    }
    const admin = await store.findById(payload.sub);
    if (!admin || admin.tokenVersion !== payload.v) return null; // password badal chuka / user delete
    return admin;
  }

  // Admin ke API routes par ye lagao:  app.use("/api/admin", requireAuth, ...)
  async function requireAuth(req, res, next) {
    try {
      const admin = await adminFromRequest(req);
      if (!admin) return res.status(401).json({ error: "Login required" });
      req.admin = admin;
      next();
    } catch (err) {
      next(err);
    }
  }

  // CSRF se bachao: browser ka Origin header apni hi site ka hona chahiye
  function sameOrigin(req, res, next) {
    const origin = req.headers.origin;
    if (!origin) return next();
    try {
      const host = new URL(origin).host;
      const mine = [req.headers.host, req.headers["x-forwarded-host"]].filter(Boolean);
      const allowedOrigins = String(clientOrigin || "").split(",").map((s) => s.trim().replace(/\/+$/, "")).filter(Boolean);
      if (mine.includes(host) || allowedOrigins.includes(origin)) return next();
      // development mein Vite proxy Host header badal deta hai, isliye local origins allow
      if (!isProd && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) return next();
    } catch {
      /* neeche 403 */
    }
    res.status(403).json({ error: "Forbidden" });
  }

  const router = express.Router();
  router.use(sameOrigin);
  // Database jud nahi paya to 10 second latka kar 500 dene ke bajaye foran saaf wajah batao
  router.use((req, res, next) => {
    if (req.path === "/logout" || isReady()) return next();
    res.status(503).json({ error: "Database se connection nahi hai. Server ka terminal dekho (MongoDB Atlas IP / internet)." });
  });

  router.post("/login", async (req, res, next) => {
    try {
      const username = String(req.body?.username ?? "").trim().toLowerCase();
      const password = String(req.body?.password ?? "");
      if (!username || !password || password.length > 200) return res.status(400).json({ error: "Username and password required" });

      const key = `${req.ip}|${username}`;
      const wait = limiter.check(key);
      if (wait) {
        res.set("Retry-After", String(wait));
        return res.status(429).json({ error: `Too many attempts. Try again in ${Math.ceil(wait / 60)} minute(s).` });
      }

      const admin = await store.findByUsername(username);
      const ok = await verifyPassword(password, admin ? admin.passwordHash : await dummyHash);
      if (!admin || !ok) {
        limiter.fail(key);
        return res.status(401).json({ error: "Invalid username or password" });
      }
      limiter.clear(key);
      setSession(res, admin);
      res.json({ ok: true, user: { username: admin.username } });
    } catch (err) {
      next(err);
    }
  });

  router.post("/logout", (_req, res) => {
    clearSession(res);
    res.json({ ok: true });
  });

  router.get("/me", async (req, res, next) => {
    try {
      const admin = await adminFromRequest(req);
      if (!admin) return res.status(401).json({ error: "Not logged in" });
      res.json({ user: { username: admin.username } });
    } catch (err) {
      next(err);
    }
  });

  router.post("/change-password", requireAuth, async (req, res, next) => {
    try {
      const { currentPassword, newPassword } = req.body ?? {};
      if (typeof currentPassword !== "string" || typeof newPassword !== "string") return res.status(400).json({ error: "Invalid request" });
      if (newPassword.length < 8 || newPassword.length > 200) return res.status(400).json({ error: "New password must be 8+ characters" });
      if (!(await verifyPassword(currentPassword, req.admin.passwordHash))) return res.status(403).json({ error: "Current password is wrong" });
      await store.update(req.admin.id, { passwordHash: await hashPassword(newPassword), bumpTokenVersion: true });
      clearSession(res); // har device se logout (tokenVersion badh gaya)
      res.json({ ok: true });
    } catch (err) {
      next(err);
    }
  });

  router.post("/change-username", requireAuth, async (req, res, next) => {
    try {
      const { newUsername, currentPassword } = req.body ?? {};
      const name = String(newUsername ?? "").trim().toLowerCase();
      if (!USERNAME_RE.test(name)) return res.status(400).json({ error: "Username 3-40 characters (letters, numbers, . _ -)" });
      if (typeof currentPassword !== "string" || !(await verifyPassword(currentPassword, req.admin.passwordHash))) {
        return res.status(403).json({ error: "Current password is wrong" });
      }
      if (name === req.admin.username) return res.status(400).json({ error: "Same username" });
      const taken = await store.findByUsername(name);
      if (taken) return res.status(409).json({ error: "Username already taken" });
      const updated = await store.update(req.admin.id, { username: name });
      res.json({ ok: true, user: { username: updated.username } });
    } catch (err) {
      next(err);
    }
  });

  return { router, requireAuth };
}

// Pehli dafa admin banane ke liye (server start par): .env ke ADMIN_USERNAME / ADMIN_PASSWORD se
export async function ensureAdmin(store, { username, password }) {
  if ((await store.count()) > 0) return "exists";
  if (!username || !password) return "missing-env";
  if (!USERNAME_RE.test(username) || password.length < 8) throw new Error("ADMIN_USERNAME (3+ chars) ya ADMIN_PASSWORD (8+ chars) theek nahi");
  await store.create({ username: username.toLowerCase(), passwordHash: await hashPassword(password) });
  return "created";
}
