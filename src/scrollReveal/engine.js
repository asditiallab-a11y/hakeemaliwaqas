// Scroll-reveal engine: website aur admin ke SAB pages par khud kaam karta hai.
// Kisi component mein kuch likhna nahi padta - ye DOM scan karke headings, paragraphs, images,
// cards, buttons waghera ko dhoond leta hai aur jab wo screen par aate hain to fade-up animation chalata hai.
//
// Kisi element par animation band karni ho:   <div data-no-reveal> ... </div>
// Delay/stagger badalna ho: neeche STAGGER_MS aur MAX_STAGGER dekho. Speed/distance: scrollReveal.css

const STAGGER_MS = 90;   // ek saath aane wale elements ke beech gap
const MAX_STAGGER = 6;   // itne se zyada elements ko extra delay nahi

// In jagahon ke andar kabhi animation nahi (header, sidebars, fixed cheezein, hero, modals)
const EXCLUDE = [
  "[data-no-reveal]", "header", "nav", ".site-header", ".sticky-nav", ".top-bar",
  ".social-icons-fixed", '[class*="hero"]', '[role="dialog"]', '[aria-modal="true"]',
  // admin: sidebar/topbar/popup
  ".sidebar", ".topbar", ".scrim", ".modal-bg", ".pg-toast",
].join(",");

const BLOCK_TAGS = new Set([
  "H1", "H2", "H3", "H4", "H5", "H6", "P", "IMG", "PICTURE", "VIDEO", "IFRAME", "FIGURE",
  "TABLE", "FORM", "BLOCKQUOTE", "UL", "OL", "SELECT", "TEXTAREA",
]);
// class ke naam mein card / stat / panel / box / tile / item hone par poora block ek unit ban jata hai
const CARD_TOKEN = /(^|[-_])(card|stat|panel|box|tile|item|slide|swiper|banner)($|[-_])/i;
const BTN_TOKEN = /(^|[-_])(btn|button|cta)($|[-_])/i;
const SKIP_CARD_TOKEN = /^(nav-item|list-group-item|carousel-item|swiper-slide|swiper-wrapper)$/;

const registered = new WeakSet();
const fixedCache = new WeakMap();

function hasClassMatch(el, re, skip) {
  const cls = el.classList;
  for (let i = 0; i < cls.length; i++) {
    if (skip && skip.test(cls[i])) continue;
    if (re.test(cls[i])) return true;
  }
  return false;
}

function isFixedLike(el) {
  if (fixedCache.has(el)) return fixedCache.get(el);
  const p = getComputedStyle(el).position;
  const v = p === "fixed" || p === "sticky";
  fixedCache.set(el, v);
  return v;
}

function isUnit(el) {
  if (BLOCK_TAGS.has(el.tagName)) return true;
  if (hasClassMatch(el, CARD_TOKEN, SKIP_CARD_TOKEN)) return true;
  if ((el.tagName === "A" || el.tagName === "BUTTON") && hasClassMatch(el, BTN_TOKEN)) return true;
  // text wala chhota element (label, span, div with text, link) jiske andar koi aur element nahi
  if (el.children.length === 0 && el.textContent.trim() !== "") return true;
  return false;
}

// Aise elements jo pehle se apni animation / opacity chala rahe hon unhein na chhedo
function hasOwnMotion(el) {
  const cs = getComputedStyle(el);
  return (cs.animationName && cs.animationName !== "none") || parseFloat(cs.opacity) < 1 || cs.display === "contents";
}

// Slider / horizontal scroller (andar ka track scroll ya transform se hilta hai):
// iske andar ke items alag alag animate nahi hote, poora slider ek saath fade-up hota hai.
function isHorizontalScroller(el) {
  const cs = getComputedStyle(el);
  const ox = cs.overflowX;
  if (ox !== "hidden" && ox !== "auto" && ox !== "scroll") return false;
  return el.scrollWidth > el.clientWidth + 2 && el.clientWidth > 0;
}

function collect(el, out) {
  if (el.nodeType !== 1) return;
  const tag = el.tagName;
  if (tag === "SCRIPT" || tag === "STYLE" || tag === "SVG" || tag === "svg" || tag === "NOSCRIPT" || tag === "PATH") return;
  if (el.matches(EXCLUDE)) return;
  if (registered.has(el)) return;
  if (isFixedLike(el)) return;
  if (isUnit(el) || isHorizontalScroller(el)) {
    if (!hasOwnMotion(el)) out.push(el);
    return;
  }
  for (const child of el.children) collect(child, out);
}

export function startScrollReveal(rootSelector = "#root") {
  if (typeof window === "undefined" || !("IntersectionObserver" in window)) return () => {};
  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return () => {};

  const root = document.querySelector(rootSelector);
  if (!root) return () => {};

  let flushTimer = null;
  const observed = new Set();

  const reveal = (el, delay) => {
    el.style.animationDelay = delay ? `${delay}ms` : "";
    el.classList.add("rv-in");
    const done = () => {
      el.classList.remove("rv", "rv-in");
      el.style.animationDelay = "";
      el.removeEventListener("animationend", done);
    };
    el.addEventListener("animationend", done);
    // safety: kisi wajah se animationend na aaye to bhi element hamesha visible ho jaye
    setTimeout(done, 2500 + delay);
  };

  const io = new IntersectionObserver(
    (entries) => {
      const visible = [];
      for (const e of entries) {
        if (!e.isIntersecting) {
          // pehle se scroll ho chuke (upar nikal gaye) elements ko bina animation seedha dikha do
          if (e.boundingClientRect.bottom < 0) {
            e.target.classList.remove("rv");
            io.unobserve(e.target);
            observed.delete(e.target);
          }
          continue;
        }
        io.unobserve(e.target);
        observed.delete(e.target);
        visible.push(e);
      }
      // upar se neeche, left se right order mein stagger
      visible.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top || a.boundingClientRect.left - b.boundingClientRect.left);
      visible.forEach((e, i) => reveal(e.target, Math.min(i, MAX_STAGGER) * STAGGER_MS));
    },
    { threshold: 0.08, rootMargin: "0px 0px -6% 0px" }
  );

  const scan = () => {
    flushTimer = null;
    const found = [];
    collect(root, found);
    for (const el of found) {
      registered.add(el);
      observed.add(el);
      el.classList.add("rv");
      io.observe(el);
    }
  };

  // Page ke bilkul neeche wale elements (footer bar waghera) observer ke -6% margin ki wajah se
  // kabhi trigger nahi hote, isliye page ke end par screen mein nazar aane wale sab reveal kar do.
  let raf = 0;
  const onScroll = () => {
    if (raf) return;
    raf = requestAnimationFrame(() => {
      raf = 0;
      const nearBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
      if (!nearBottom) return;
      const list = [];
      for (const el of observed) {
        const r = el.getBoundingClientRect();
        if (r.width > 0 && r.height > 0 && r.top < window.innerHeight && r.bottom > 0) list.push(el);
      }
      list.sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top);
      list.forEach((el, i) => {
        io.unobserve(el);
        observed.delete(el);
        reveal(el, Math.min(i, MAX_STAGGER) * STAGGER_MS);
      });
    });
  };
  window.addEventListener("scroll", onScroll, { passive: true });

  const schedule = () => {
    if (flushTimer) return;
    flushTimer = setTimeout(scan, 60);
  };

  // React naya content daale (route change, list update) to dobara scan
  const mo = new MutationObserver(schedule);
  mo.observe(root, { childList: true, subtree: true });
  schedule();

  return () => {
    mo.disconnect();
    io.disconnect();
    window.removeEventListener("scroll", onScroll);
    if (raf) cancelAnimationFrame(raf);
    if (flushTimer) clearTimeout(flushTimer);
  };
}
