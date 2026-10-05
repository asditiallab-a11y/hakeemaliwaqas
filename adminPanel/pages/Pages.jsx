import { useEffect, useMemo, useState } from "react";
import { Save, Check } from "lucide-react";
import { apiFetch } from "../auth/api.js";
import { TABS, buildDefaults } from "./pagesConfig.jsx";
import { Badge, ImageField, VideoField, RichEditor } from "../components/PageFields.jsx";
import LeafLoader from "../components/LeafLoader.jsx";

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

// Saare tabs DB se load/save hote hain (/api/admin/pages). Footer ke product dropdowns Medicines se aate hain.
const MEDICINES_API = "/api/admin/medicines";

export default function Pages() {
  const [tab, setTab] = useState(TABS[0].key);
  const [data, setData] = useState(buildDefaults);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [medicines, setMedicines] = useState([]); // footer ke "Featured Products" dropdowns ke liye

  // DB mein jo saved hai wo defaults ke upar laga do (sirf wahi keys jo config mein hain)
  useEffect(() => {
    let alive = true;
    Promise.all([apiFetch("/api/admin/pages"), apiFetch(MEDICINES_API)])
      .then(([{ pages }, med]) => {
        if (!alive) return;
        setMedicines(med.items.map((m) => m.title));
        setData((d) => {
          const next = { ...d };
          for (const t of TABS) {
            const saved = pages[t.key] || {};
            next[t.key] = Object.fromEntries(Object.entries(d[t.key]).map(([k, v]) => [k, typeof saved[k] === "string" ? saved[k] : v]));
          }
          return next;
        });
      })
      .catch((e) => alive && setErr(e.message))
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 2500);
    return () => clearTimeout(t);
  }, [toast]);

  // Footer ke product dropdowns: options Medicines tab se; jo value pehle save hai wo list mein na ho (medicine delete/rename) to bhi dikhti rahe
  const current = useMemo(() => {
    const t = TABS.find((x) => x.key === tab);
    if (tab !== "footer") return t;
    return {
      ...t,
      sections: t.sections.map((s) => ({
        ...s,
        fields: s.fields?.map((f) => {
          if (!/^prod\d+$/.test(f.k ?? "")) return f;
          const cur = data.footer?.[f.k];
          const names = cur && !medicines.includes(cur) ? [...medicines, cur] : medicines;
          return { ...f, options: names.map((n) => [n, n]) };
        }),
      })),
    };
  }, [tab, medicines, data.footer]);
  const set = (k, v) => setData((d) => ({ ...d, [tab]: { ...d[tab], [k]: v } }));

  // Sirf current tab save hota hai
  const save = async (message = "Changes saved") => {
    setErr("");
    setSaving(true);
    try {
      await apiFetch(`/api/admin/pages/${tab}`, { method: "PUT", body: { data: data[tab] } });
      setToast(message);
    } catch (e) {
      setErr(e.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LeafLoader />;

  return (
    <>
      {err && <p className="empty" style={{ color: "#c0392b", padding: "0 0 12px" }}>{err}</p>}
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
