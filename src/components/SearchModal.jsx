import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { FaSearch, FaTimes, FaLeaf, FaArrowRight } from "react-icons/fa";
import { treatments } from "../data/treatments";
import { medicines } from "../data/medicines";
import { articles } from "../data/articles";
import "./SearchModal.css";

// Roman Urdu shabd -> English keywords (data English mein hai, isliye "dard" likhne par bhi result aaye)
const SYNONYMS = {
  dard: ["pain", "joint", "bone", "arthritis"],
  bukhar: ["fever", "flu", "cold", "immunity"],
  jild: ["skin"],
  jigar: ["liver"],
  gurda: ["kidney"],
  sugar: ["diabetes", "blood sugar"],
  shugar: ["diabetes", "blood sugar"],
  moti: ["weight", "obesity"],
  meda: ["digestive", "acidity", "stomach"],
  dil: ["heart"],
  saans: ["respiratory", "asthma"],
};

const POPULAR = ["dard", "bukhar", "herbal", "joint", "skin", "liver"];

// Teeno data files ko ek searchable list mein jorta hai
const INDEX = [
  ...treatments.map((t) => ({
    type: "Treatment",
    title: t.title,
    sub: t.filter,
    to: "/treatments",
    text: `${t.title} ${t.filter} ${t.tag} ${t.description}`.toLowerCase(),
  })),
  ...medicines.map((m) => ({
    type: "Herbal Medicine",
    title: m.name,
    sub: m.category,
    to: "/herbal-medicines",
    text: `${m.name} ${m.category} ${m.description}`.toLowerCase(),
  })),
  ...articles.map((a) => ({
    type: "Article",
    title: a.title,
    sub: a.date,
    to: "/health-articles",
    text: `${a.title} ${a.excerpt}`.toLowerCase(),
  })),
];

function runSearch(query) {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const terms = [q, ...(SYNONYMS[q] || [])];
  return INDEX.map((item) => {
    let score = 0;
    terms.forEach((t) => {
      if (item.title.toLowerCase().includes(t)) score += 3;
      else if (item.text.includes(t)) score += 1;
    });
    return { ...item, score };
  })
    .filter((i) => i.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 8);
}

export default function SearchModal({ open, onClose }) {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  const results = useMemo(() => runSearch(query), [query]);

  // Open hone par focus + body scroll lock; close par reset
  useEffect(() => {
    if (!open) return;
    setQuery("");
    setActive(0);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const t = setTimeout(() => inputRef.current?.focus(), 30);
    return () => {
      clearTimeout(t);
      document.body.style.overflow = prev;
    };
  }, [open]);

  const go = (item) => {
    onClose();
    navigate(item.to);
  };

  const onKeyDown = (e) => {
    if (e.key === "Escape") return onClose();
    if (!results.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => (a + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => (a - 1 + results.length) % results.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      go(results[active]);
    }
  };

  if (!open) return null;

  return createPortal(
    <div className="sm-backdrop" onMouseDown={onClose}>
      <div
        className="sm-box"
        role="dialog"
        aria-modal="true"
        aria-label="Search"
        onMouseDown={(e) => e.stopPropagation()}
        onKeyDown={onKeyDown}
      >
        {/* Input row */}
        <div className="sm-head">
          <span className="sm-head-ico"><FaSearch /></span>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
            }}
            placeholder="Treatments, medicines ya articles search karein..."
            className="sm-input"
          />
          <button className="sm-close" onClick={onClose} aria-label="Close search">
            <FaTimes />
          </button>
        </div>

        {/* Body */}
        <div className="sm-body">
          {!query.trim() && (
            <div className="sm-empty">
              <div className="sm-empty-ico"><FaSearch /></div>
              <h4>Kuch bhi dhundein</h4>
              <p>Treatments, herbal medicines aur health articles — sab ek jagah</p>
              <div className="sm-popular-title">MASHOOR SEARCHES</div>
              <div className="sm-chips">
                {POPULAR.map((w) => (
                  <button key={w} onClick={() => { setQuery(w); setActive(0); inputRef.current?.focus(); }}>
                    {w}
                  </button>
                ))}
              </div>
            </div>
          )}

          {query.trim() && results.length === 0 && (
            <div className="sm-empty">
              <div className="sm-empty-ico"><FaSearch /></div>
              <h4>Koi result nahi mila</h4>
              <p>"{query}" ke liye kuch nahi mila. Doosra lafz try karein.</p>
            </div>
          )}

          {results.length > 0 && (
            <ul className="sm-results">
              {results.map((r, i) => (
                <li key={`${r.type}-${r.title}`}>
                  <button
                    className={i === active ? "active" : ""}
                    onMouseEnter={() => setActive(i)}
                    onClick={() => go(r)}
                  >
                    <span className="sm-type">{r.type}</span>
                    <span className="sm-title">
                      {r.title}
                      {r.sub && <small>{r.sub}</small>}
                    </span>
                    <FaArrowRight className="sm-arrow" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer hints */}
        <div className="sm-foot">
          <div className="sm-keys">
            <span><kbd>↵</kbd> select</span>
            <span><kbd>↑</kbd><kbd>↓</kbd> navigate</span>
            <span><kbd>Esc</kbd> close</span>
          </div>
          <span className="sm-tip"><FaLeaf /> Ctrl+K se bhi search karein</span>
        </div>
      </div>
    </div>,
    document.body
  );
}
