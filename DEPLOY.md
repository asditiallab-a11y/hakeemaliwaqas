# Deploy guide: Frontend = Hostinger, Server = Railway

Domain ki jagah apna asli domain likhna (neeche `tumharidomain.com` example hai).

## 1. MongoDB Atlas
Network Access -> Add IP Address -> `0.0.0.0/0` (Railway ka IP badalta rehta hai).

## 2. Railway (server)
1. Poora project GitHub par push karo (`.env`, `node_modules`, `dist` push nahi hote, .gitignore mein hain).
2. Railway -> New Project -> Deploy from GitHub repo.
3. Service -> Settings:
   - Start Command: `npm start`
   - (Build command default chhod do)
4. Service -> **Volumes** -> New Volume -> Mount path: `/data`
5. Service -> **Variables** (`.env.example` dekho):
   `NODE_ENV=production`, `MONGODB_URI`, `MONGODB_DB`, `JWT_SECRET`, `ADMIN_USERNAME`, `ADMIN_PASSWORD`,
   `DATA_DIR=/data`,
   `CLIENT_ORIGIN=https://tumharidomain.com,https://www.tumharidomain.com`,
   `PUBLIC_API_URL=https://api.tumharidomain.com`
6. Service -> Settings -> Networking -> **Custom Domain** -> `api.tumharidomain.com`.
   Railway jo CNAME record dega wo Hostinger ke DNS mein add karo (hPanel -> Domains -> DNS / Nameservers -> DNS Zone).
7. Check: `https://api.tumharidomain.com/api/health` kholo -> `{"ok":true,"mongodb":"connected"}`.
8. Pehli baar admin ban jaye to Railway Variables se `ADMIN_PASSWORD` hata do.

Agar custom domain nahi lagana (sirf `xxx.up.railway.app` use karna ho) to Variables mein `COOKIE_SAMESITE=none` bhi daalo
(aur `PUBLIC_API_URL` mein wahi railway address likho). Custom subdomain behtar hai, kyunke kuch browsers cross-site cookies block karte hain.

## 3. Frontend build (apne computer par)
Project root mein `.env.production` naam ki file banao:
```
VITE_API_URL=https://api.tumharidomain.com
```
Phir:
```
npm install
npm run build
```
`dist/` folder ban jayega (website + admin dono, aur `.htaccess` bhi andar hoga).

## 4. Hostinger (frontend)
hPanel -> Files -> File Manager -> jis domain/subdomain par site lagani hai uska `public_html`:
purani files delete karo, phir `dist/` ke **andar ki saari files** (`index.html`, `assets/`, `images/`, `.htaccess` ...) upload karo.
(`dist` folder khud nahi, uska content.) `.htaccess` hidden hoti hai, File Manager mein "Show hidden files" on rakho.

## 5. Test
- `https://tumharidomain.com` -> data/images aane chahiye
- `https://tumharidomain.com/privacy-policy` aur `/terms-of-service` -> refresh par bhi khulne chahiye
- `https://tumharidomain.com/admin` -> login, image upload, save
- Contact form / consultation / order submit

## Zaroori batein
- Railway ka Volume na ho to admin se upload ki hui images redeploy par ghayab ho jati hain.
- Admin ka backup (Settings -> Backup) waqtan fawaqtan download kar lo.
- Code badalne par: Railway khud redeploy karta hai (GitHub push par). Frontend badalne par dobara `npm run build` karke `dist` upload karo.
