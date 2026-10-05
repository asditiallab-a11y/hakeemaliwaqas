import { Palette, RotateCcw, Lightbulb } from "lucide-react";

export const isHex = (v) => /^#[0-9a-fA-F]{6}$/.test(v);

// [key, label, default, hint]
export const THEME_GROUPS = [
  { title: "Brand & Accent", sub: "Primary brand colors used for buttons, highlights, and accents across the site", items: [
    ["accent", "Accent (Gold)", "#DBA921", "Primary highlight color — buttons, hover, gold gradients"],
    ["accentText", "Accent Text", "#2B1F06", "Text on top of accent color"],
    ["primary", "Primary (Green)", "#1D723F", "Secondary brand color — primary buttons"],
    ["primaryText", "Primary Text", "#F6FDF9", "Text on top of primary color"],
    ["focus", "Focus Ring", "#1D723F", "Border color when an input is focused"],
  ] },
  { title: "Surfaces & Backgrounds", sub: "Page backgrounds, cards, and content surfaces", items: [
    ["pageBg", "Page Background", "#FBFAF6", "Main page background color"],
    ["bodyText", "Body Text", "#1C2421", "Default text color across the site"],
    ["cardBg", "Card Background", "#F7F5EF", "Background for product/article/treatment cards"],
    ["cardText", "Card Text", "#1C2421", "Text inside cards"],
    ["mutedBg", "Muted Background", "#EBE9E0", "Subtle gray sections, hover states"],
    ["mutedText", "Muted Text", "#616A66", "Secondary/helper text"],
    ["border", "Borders", "#E3E0D8", "Lines, card borders, dividers"],
    ["inputBorder", "Input Border", "#CDC9BC", "Border on form input fields"],
  ] },
  { title: "Sidebar & Navigation", sub: "Footer dark sidebar / mobile menu colors", items: [
    ["sideBg", "Sidebar Background", "#1A2520", "Dark sidebar / mobile nav background"],
    ["sideText", "Sidebar Text", "#F4F1E8", "Text on sidebar"],
    ["sideBorder", "Sidebar Border", "#2A3530", "Borders inside sidebar"],
    ["sideHighlight", "Sidebar Highlight", "#DBA921", "Active link / accent on sidebar"],
    ["sideHover", "Sidebar Hover", "#2A3530", "Hover background in sidebar"],
  ] },
  { title: "Secondary & Status", sub: "Secondary surfaces and status colors", items: [
    ["secBg", "Secondary Background", "#E8E4D8", ""],
    ["secText", "Secondary Text", "#23291F", ""],
    ["danger", "Destructive (Red)", "#C4191B", "Delete buttons, errors"],
    ["dangerText", "Destructive Text", "#FFF5F5", ""],
  ] },
];

export const THEME_DEFAULTS = Object.fromEntries(THEME_GROUPS.flatMap((g) => g.items.map(([k, , d]) => [k, d])));

function ColorCard({ label, hint, value, def, onChange }) {
  const changed = value.toUpperCase() !== def;
  return (
    <div className="st-color">
      <div className="st-color-top">
        <label htmlFor={`c-${label}`}>{label}</label>
        {changed && <button type="button" className="st-reset" onClick={() => onChange(def)}>reset</button>}
      </div>
      <div className="st-color-row">
        <input
          type="color"
          className="st-swatch"
          value={isHex(value) ? value.toLowerCase() : "#000000"}
          onChange={(e) => onChange(e.target.value.toUpperCase())}
          aria-label={`${label} color picker`}
        />
        <input
          id={`c-${label}`}
          className="pg-input st-hex"
          value={value}
          maxLength={7}
          spellCheck={false}
          aria-invalid={!isHex(value)}
          onChange={(e) => {
            const v = e.target.value.replace(/[^#0-9a-fA-F]/g, "").replace(/#/g, "").toUpperCase();
            onChange("#" + v);
          }}
        />
      </div>
      {hint && <div className="st-hint">{hint}</div>}
    </div>
  );
}

export default function ThemeTab({ colors, setColors }) {
  const set = (k, v) => setColors((c) => ({ ...c, [k]: v }));
  return (
    <>
      <div className="st-theme-intro">
        <span className="st-theme-icon"><Palette size={20} /></span>
        <div className="st-theme-text">
          <div className="st-theme-title">Theme Customization</div>
          <div className="st-theme-sub">Live preview as you change colors. Click <b>Save Settings</b> to apply permanently.</div>
        </div>
        <button type="button" className="st-restore" onClick={() => setColors(THEME_DEFAULTS)}>
          <RotateCcw size={14} /> Restore All Defaults
        </button>
      </div>

      {THEME_GROUPS.map((g) => (
        <section key={g.title} className="st-group">
          <div className="st-group-head">
            <div className="st-group-title">{g.title}</div>
            <div className="st-group-sub">{g.sub}</div>
          </div>
          <div className="st-color-grid">
            {g.items.map(([k, label, def, hint]) => (
              <ColorCard key={k} label={label} hint={hint} def={def} value={colors[k]} onChange={(v) => set(k, v)} />
            ))}
          </div>
        </section>
      ))}

      <div className="st-tips">
        <div className="st-tips-title"><Lightbulb size={14} /> Tips:</div>
        <ul>
          <li>Changes are previewed <b>live</b> — refresh hone par bhi changes save honi chahiye, to "Save Settings" zaroor click karein.</li>
          <li>Each color has its own small <i>reset</i> link to revert just that one color.</li>
          <li>"Restore All Defaults" resets every color back to the original Hikmat Health theme.</li>
          <li>Use the hex code field to type or paste exact colors (e.g. <code>#dba921</code> ).</li>
        </ul>
      </div>
    </>
  );
}
