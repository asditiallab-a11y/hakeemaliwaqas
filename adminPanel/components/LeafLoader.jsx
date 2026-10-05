import { useEffect } from "react";
import "./leafLoader.css";

// ================== Leaf loader ==================
// Istemal (pehle jaisa hi):
//     {loading ? <LeafLoader /> : <List ... />}
//     <LeafLoader fullscreen />   -> jab peeche dikhane ko kuch na ho (blur ke bajaye saaf background)
//     <LeafLoader size={160} />   -> leaf ka size (default 120)
//
// Kaise kaam karta hai:
//  * Poori screen par ek hi loader hota hai, aur leaf screen ke bilkul beech mein aata hai.
//  * Peeche ka page blur ho jata hai.
//  * Data pehle aa jaye tab bhi leaf kam az kam ek baar POORA draw hota hai (MIN_VISIBLE_MS),
//    phir loader aaram se fade ho kar hat jata hai.
//  * Ek page ke baad doosra loader aaye (jaise login check ke baad dashboard) to animation beech mein
//    toot kar dobara shuru nahi hoti - wahi leaf chalta rehta hai.

// Leaf ke body aur dandi dono poori draw hone mein ~1.25s lagte hain (leafLoader.css: 2.6s cycle).
// Ye time kam/zyada karna ho to yahan badlo (0 = bina intezar ke).
const MIN_VISIBLE_MS = 1300;
const FADE_MS = 300;
const HIDE_GRACE_MS = 80; // agle loader ko foran aane ka mauqa (transition ke waqt)

const LEAF_BODY = "M11 20a10 10 0 0010-10 25.9 25.9 0 00-1.04-7.281 1 1 0 00-1.755-.325C15.833 5.5 13 5.5 9.8 6.1A7 7 0 0011 20";
const LEAF_STEM = "M2 21a5 5 0 012.911-4.544C7.613 15.212 8.351 15.24 11 13";

const reducedMotion = () => typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

let overlay = null;
let startedAt = 0;
let hideTimer = null;
let removeTimer = null;
const requests = new Set(); // abhi kitne LeafLoader mount hain

function render() {
  // index.html mein pehle se ek boot loader hota hai (JS load hone se pehle leaf dikhane ke liye).
  // Naya na bana kar wahi use karte hain, taake leaf ki animation beech mein toot kar dobara shuru na ho.
  const boot = document.getElementById("lf-boot");
  if (boot) {
    boot.removeAttribute("id");
    startedAt = window.__lfBootAt ?? performance.now();
    return boot;
  }
  const el = document.createElement("div");
  el.className = "lf-overlay";
  el.setAttribute("role", "status");
  el.setAttribute("aria-live", "polite");
  el.setAttribute("aria-label", "Loading");
  el.innerHTML =
    `<svg class="lf-svg" viewBox="0 0 24 24" aria-hidden="true">` +
    `<path class="lf-path" pathLength="1" d="${LEAF_BODY}"></path>` +
    `<path class="lf-path lf-path-stem" pathLength="1" d="${LEAF_STEM}"></path>` +
    `</svg>`;
  document.body.appendChild(el);
  startedAt = performance.now();
  return el;
}

function sync() {
  if (!overlay) return;
  const all = [...requests];
  overlay.classList.toggle("lf-solid", all.some((r) => r.fullscreen));
  const size = all.map((r) => r.size).find(Boolean);
  if (size) overlay.style.setProperty("--lf-size", `${size}px`);
  else overlay.style.removeProperty("--lf-size");
}

function acquire(req) {
  clearTimeout(hideTimer);
  clearTimeout(removeTimer);
  requests.add(req);
  if (!overlay) overlay = render();
  overlay.classList.remove("lf-out"); // fade ho raha tha to wapas dikha do (leaf ki animation wahin se jari)
  sync();
}

function release(req) {
  requests.delete(req);
  if (requests.size > 0) return sync();
  const elapsed = performance.now() - startedAt;
  const wait = reducedMotion() ? HIDE_GRACE_MS : Math.max(MIN_VISIBLE_MS - elapsed, HIDE_GRACE_MS);
  hideTimer = setTimeout(() => {
    if (!overlay) return;
    overlay.classList.add("lf-out");
    removeTimer = setTimeout(() => {
      overlay?.remove();
      overlay = null;
    }, FADE_MS);
  }, wait);
}

export default function LeafLoader({ size, fullscreen = false }) {
  useEffect(() => {
    const req = { size, fullscreen };
    acquire(req);
    return () => release(req);
  }, [size, fullscreen]);
  return null; // asli loader document.body mein ek hi baar draw hota hai (upar dekho)
}
