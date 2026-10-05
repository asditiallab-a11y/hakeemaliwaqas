import { useEffect, useState } from "react";
import { Save, Check } from "lucide-react";
import { TABS, buildDefaults } from "./pagesConfig.jsx";
import { Badge, ImageField, VideoField, RichEditor } from "../components/PageFields.jsx";

function Field({ f, value, onChange }) {
  const id = `pg-${f.k}`;
  const label = (
    <label className="pg-label" htmlFor={f.type === "image" || f.type === "video" || f.type === "rich" ? undefined : id}>
      {f.label}
      {f.type === "image" && <Badge>{f.size}</Badge>}
      {f.type === "video" && <Badge>{f.badge}</Badge>}
      {f.type !== "video" && f.badge && <Badge>{f.badge}</Badge>}
    </label>
  );

  let control;
  switch (f.type) {
    case "textarea":
      control = <textarea id={id} className="pg-input" rows={f.rows ?? 4} maxLength={f.max} value={value} onChange={(e) => onChange(e.target.value)} />;
      break;
    case "select":
      control = (
        <select id={id} className="pg-input" value={value} onChange={(e) => onChange(e.target.value)}>
          {f.placeholder && <option value="">{f.placeholder}</option>}
          {f.options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      );
      break;
    case "image": control = <ImageField value={value} onChange={onChange} size={f.size} />; break;
    case "video": control = <VideoField value={value} onChange={onChange} />; break;
    case "rich": control = <RichEditor value={value} onChange={onChange} minHeight={f.minHeight} />; break;
    default:
      control = <input id={id} className="pg-input" type="text" placeholder={f.placeholder} value={value} onChange={(e) => onChange(e.target.value)} />;
  }

  return (
    <div className={`pg-field ${f.w === "half" ? "half" : ""}`}>
      {label}
      {control}
      {f.max && <span className="pg-count">{value.length}/{f.max}</span>}
    </div>
  );
}

function Section({ s, data, set, onAction }) {
  if (!s.fields) {
    return (
      <div className="pg-note">
        <div className="pg-note-title">{s.note.title}</div>
        <div className="pg-note-body">{s.note.body}</div>
      </div>
    );
  }
  return (
    <section className="pg-sec">
      <h3 className="pg-sec-head">{s.title}</h3>
      <div className="pg-sec-body">
        {s.fields.map((f, i) =>
          f.note ? (
            <div key={i} className="pg-inline-note">{f.note}</div>
          ) : (
            <Field key={f.k} f={f} value={data[f.k] ?? ""} onChange={(v) => set(f.k, v)} />
          )
        )}
        {s.action && (
          <button type="button" className="pg-action" onClick={() => onAction(s.action.message)}>{s.action.label}</button>
        )}
      </div>
    </section>
  );
}

export default function Pages() {
  const [tab, setTab] = useState(TABS[0].key);
  const [data, setData] = useState(buildDefaults);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 2500);
    return () => clearTimeout(t);
  }, [toast]);

  const current = TABS.find((t) => t.key === tab);
  const set = (k, v) => setData((d) => ({ ...d, [tab]: { ...d[tab], [k]: v } }));

  // TODO: API call yahan lagao — data[tab] (ya poora `data`) server par bhejo
  const save = async (message = "Changes saved") => {
    setSaving(true);
    try {
      console.log("Save pages:", data);
      await new Promise((r) => setTimeout(r, 300));
      setToast(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="list-head">
        <div>
          <h1 className="page-title">Pages</h1>
          <p className="page-sub" style={{ margin: "4px 0 0" }}>Edit content and images for each page of your website</p>
        </div>
        <button type="button" className="btn-gold pg-save" disabled={saving} onClick={() => save()}>
          <Save size={16} /> {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      <div className="pg-tabs" role="tablist">
        {TABS.map((t) => (
          <button
            key={t.key}
            role="tab"
            aria-selected={tab === t.key}
            className={`pg-tab ${tab === t.key ? "on" : ""}`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="pg-stack" key={tab}>
        {current.sections.map((s, i) => (
          <Section key={i} s={s} data={data[tab]} set={set} onAction={save} />
        ))}
      </div>

      {toast && <div className="pg-toast" role="status"><Check size={14} /> {toast}</div>}
    </>
  );
}
