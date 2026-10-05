import { useEffect, useState } from "react";
import { apiUrl } from "./api";

// Website ke pages admin panel ka data yahan se lete hain: GET /api/site/<name> (public, login nahi chahiye)
//   home  -> Home page,   about -> About page
// Pehli baar data aane tak loader dikhta hai; baad mein purana data foran dikhta hai aur peeche naya check hota hai.
const cache = {};

export function loadSite(name) {
  return fetch(apiUrl(`/api/site/${name}`), { headers: { Accept: "application/json" } })
    .then((r) => {
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return r.json();
    })
    .then((d) => (cache[name] = d));
}

// -> { data, loading, error }.  error true ho (server band) to components apna purana (static) content dikhate hain.
export function useSiteData(name) {
  const [state, setState] = useState({ data: cache[name] ?? null, loading: !cache[name], error: false });
  useEffect(() => {
    let alive = true;
    loadSite(name)
      .then((data) => alive && setState({ data, loading: false, error: false }))
      .catch(() => alive && setState((s) => ({ ...s, loading: false, error: true })));
    return () => { alive = false; };
  }, [name]);
  return state;
}

export const loadHome = () => loadSite("home");
export const useHomeData = () => useSiteData("home");

// Admin ka khali field => default value
export const val = (obj, key, fallback = "") => {
  const v = obj?.[key];
  return typeof v === "string" && v.trim() ? v.trim() : fallback;
};

// Strict version: admin ne field khali chhoda (save hua "") to khali hi rahe (section/label hide ho sake);
// sirf jab key kabhi save hi nahi hui (undefined) tab default aaye.
export const field = (obj, key, fallback = "") => {
  const v = obj?.[key];
  return typeof v === "string" ? v.trim() : fallback;
};

// Rich editor ka khali HTML (<p><br></p> wagaira) pehchanne ke liye
export const richEmpty = (html = "") => !String(html).replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim();

// Admin ke "Page" dropdown ki values -> website ke asli routes
const ROUTES = { "/medicines": "/herbal-medicines", "/blog": "/health-articles" };
export const pageHref = (v, fallback = "/") => {
  const p = typeof v === "string" && v.startsWith("/") ? v : fallback;
  return ROUTES[p] || p;
};

export const ytThumb = (id) => `https://img.youtube.com/vi/${id}/hqdefault.jpg`;

// Home ke SEO fields (tab title, description, keywords)
export function applySeo(page) {
  const prevTitle = document.title;
  const set = (name, content) => {
    if (!content) return () => {};
    let el = document.head.querySelector(`meta[name="${name}"]`);
    const existed = !!el;
    const prev = el?.getAttribute("content");
    if (!el) { el = document.createElement("meta"); el.setAttribute("name", name); document.head.appendChild(el); }
    el.setAttribute("content", content);
    return () => (existed ? el.setAttribute("content", prev ?? "") : el.remove());
  };
  if (val(page, "seoTitle")) document.title = val(page, "seoTitle");
  const undo = [set("description", val(page, "seoDesc")), set("keywords", val(page, "seoKeywords"))];
  return () => { document.title = prevTitle; undo.forEach((f) => f()); };
}
