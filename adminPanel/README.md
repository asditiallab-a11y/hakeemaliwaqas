# Admin Panel (design only)

Ye website ke project ka hi hissa hai - alag npm install ki zaroorat nahi.
Website chalao (`npm run dev`) aur `http://localhost:5173/admin` kholo.

- Entry: `AdminApp.jsx` (App.jsx mein `/admin/*` par lazy-load hota hai)
- Styles: `index.css` - sab kuch `.admin-root` ke andar scoped hai taake website ke CSS se na takraye
- Naya page: `pages/` mein file banao -> `AdminApp.jsx` mein Route -> `components/navItems.js` mein sidebar link
