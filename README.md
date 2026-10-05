# Hikmat Site - Setup (zaroor parho)

1. Zip ko **nayi khali folder** mein extract karo (purane folder ke upar nahi).
2. Project ke **root folder** (jahan `package.json` hai) mein terminal kholo.
3. `npm install`   <- sirf yahin se. `public/` ya `adminPanel/` ke andar kabhi nahi.
4. `npm run dev`   -> website http://localhost:5173 , backend http://localhost:5000

- Images/favicon ab `site-public/` folder mein hain (vite.config.js: `publicDir`). Naya image yahin rakho,
  aur URL `/images/xyz.jpg` hi rahega.
- Purane `public/node_modules` ya `adminPanel/node_modules` bache hon to delete kar do.

---

# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.

## Backend + MongoDB
- `server/` mein Express backend hai (isi project ke root `node_modules` se chalta hai).
- `.env` mein `MONGODB_URI` hai (secret - GitHub par push nahi karna). Naya setup: `.env.example` copy karo.
- `npm run dev` website (5173) aur backend (5000) dono ek saath chalata hai.
- Check: `http://localhost:5000/api/health` -> `{"ok":true,"mongodb":"connected"}`
- Consultation form submit -> `POST /api/consultations` -> MongoDB `hikmat.consultations`

## Admin login
- `/admin` (aur `/adminPanel`) bina login ke nahi khulta -> `/admin/login` par bhej deta hai.
- Pehla admin `.env` ke `ADMIN_USERNAME` / `ADMIN_PASSWORD` se server start par khud ban jata hai (sirf tab jab koi admin na ho). Banne ke baad `ADMIN_PASSWORD` `.env` se hata do.
- Password bhool gaye: `.env` mein naya `ADMIN_PASSWORD` likho aur `npm run reset-admin` chalao.
- Username/password Settings > Security se badal sakte ho (password badalne par har device logout).
- Login cookie httpOnly hai, 5 galat koshish par 15 min ka lock lagta hai.
- Naye admin API routes `requireAuth` ke peeche lagao (server/index.js mein comment dekho).

## About page (dynamic)
- About admin ke data se chalta hai: `GET /api/site/about` (public, read-only, `server/routes/public.js`). Client: `src/Pages/About.jsx`.
- Admin > Pages > About: SEO, hero (label/title/image/video), Section 1-3 (label, heading, rich content, image), Established text (Section 1 ki image par), Values (4 cards), Journey header, Milestones (4).
- Khali chhoda hua field website par bhi khali (label/heading/section hide). Values section tabhi dikhta hai jab koi card bhara ho.
- Rich content server par sanitize hota hai (sirf safe tags). Server band ho to About apna purana default content (`src/data/about.js`) dikhata hai.

## Home page (dynamic)
- Home admin ke data se chalta hai: `GET /api/site/home` (public, read-only, `server/routes/public.js`). Client side: `src/lib/siteApi.js`.
- Admin > Pages > Home: hero image/video, 3 buttons, About preview, stats, section headings, experience panels, CTA, SEO.
- Admin > Settings > Website: hero heading/subtitle, WhatsApp (Buy Now button).
- Treatments / Medicines / Testimonials: sirf wohi jin par "Show on Home Page" on hai. Videos: published long videos (+ home slider switch). Review Videos: live wale.
- Server band ho to Home apna purana default content dikhata hai.
