import { useCallback, useEffect, useState } from "react";
import {
  Globe, Share2, Activity, Palette, UserCog, Database, Phone, Clock, Save, Check, AlertCircle, X,
  TrendingUp,
} from "lucide-react";
// lucide ke naye version mein brand icons nahi hain, isliye react-icons (website mein pehle se hai)
import { FaFacebook as Facebook, FaInstagram as Instagram, FaTwitter as Twitter, FaYoutube as Youtube } from "react-icons/fa";
import { apiFetch } from "../auth/api.js";
import ThemeTab, { THEME_DEFAULTS, isHex } from "./settings/ThemeTab.jsx";
import SecurityTab from "./settings/SecurityTab.jsx";
import BackupTab from "./settings/BackupTab.jsx";
import LeafLoader from "../components/LeafLoader.jsx";

const LOREM = "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.";

// Ye sirf shuruati (default) values hain. Jo DB mein save ho chuka hota hai wo inke upar lag jata hai.
const initialWebsite = {
  name: "Prof Hakeem Ali Waqas",
  tagline: "Ancient Wisdom, Modern Healing",
  heroHeading: "Ali Dawakhana",
  heroSubtitle: "",
  phones: ["03015959598", "03111033392", "03224564546", "03174958791", "03444282008"],
  whatsapp: "+92-0344-4282008",
  email: "hakeemaliwaqas1@gmail.com",
  address: "Branch 1:\nRavi Toll Plaza Shahdara, Lahore, Pakistan\nBranch 2:\nG T Road Ferozewala Shahdara Lahore Pakistan",
  hours: "Mon-Sat: 9AM - 7PM",
  footerText: LOREM,
};
const initialSocial = {
  facebook: "https://web.facebook.com/HakeemAliWaqasss/",
  instagram: "https://www.instagram.com/professorhakeemaliwaqas/",
  twitter: "",
  youtube: "https://www.youtube.com/@hakeemaliwaqas3335",
};
const initialAnalytics = { ga: "", fb: "", tiktok: "" };

const TABS = [
  { key: "website", label: "Website Settings", icon: Globe },
  { key: "social", label: "Social Media", icon: Share2 },
  { key: "analytics", label: "Analytics & Tracking", icon: Activity },
  { key: "theme", label: "Theme & Colors", icon: Palette },
  { key: "security", label: "Profile & Security", icon: UserCog },
  { key: "backup", label: "Backup & Restore", icon: Database },
];
const SAVABLE = ["website", "social", "analytics", "theme"];

const Heading = ({ icon: Icon = Globe, children }) => (
  <h2 className="st-h"><Icon size={16} /> {children}</h2>
);

function Field({ label, icon: Icon, color, hint, hintTop, wide, children }) {
  return (
    <div className={`st-field ${wide ? "wide" : ""}`}>
      <label className="pg-label">{Icon && <Icon size={13} color={color} />}{label}</label>
      {hint && hintTop && <p className="st-hint st-hint-top">{hint}</p>}
      {children}
      {hint && !hintTop && <p className="st-hint">{hint}</p>}
    </div>
  );
}

export default function Settings() {
  const [tab, setTab] = useState("website");
  const [website, setWebsite] = useState(initialWebsite);
  const [social, setSocial] = useState(initialSocial);
  const [analytics, setAnalytics] = useState(initialAnalytics);
  const [colors, setColors] = useState(THEME_DEFAULTS);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadErr, setLoadErr] = useState("");

  // useCallback: BackupTab apne useEffect mein notify par depend karta hai, har render par naya function bana to loop banta
  const notify = useCallback((msg, type = "ok") => setToast({ msg, type }), []);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(t);
  }, [toast]);

  // DB se saved settings laao aur defaults ke upar lagao
  useEffect(() => {
    let alive = true;
    apiFetch("/api/admin/settings")
      .then((d) => {
        if (!alive) return;
        if (d.website) setWebsite((x) => ({ ...x, ...d.website }));
        if (d.social) setSocial((x) => ({ ...x, ...d.social }));
        if (d.analytics) setAnalytics((x) => ({ ...x, ...d.analytics }));
        if (d.theme) setColors((x) => ({ ...x, ...d.theme }));
      })
      .catch((e) => alive && setLoadErr(e.message))
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, []);

  const w = (k) => (e) => setWebsite((s) => ({ ...s, [k]: e.target.value }));
  const so = (k) => (e) => setSocial((s) => ({ ...s, [k]: e.target.value }));
  const an = (k) => (e) => setAnalytics((s) => ({ ...s, [k]: e.target.value }));

  const setPhone = (i, v) => setWebsite((s) => ({ ...s, phones: s.phones.map((p, x) => (x === i ? v : p)) }));
  const delPhone = (i) => setWebsite((s) => ({ ...s, phones: s.phones.filter((_, x) => x !== i) }));
  const addPhone = () => setWebsite((s) => ({ ...s, phones: [...s.phones, ""] }));

  const savePhones = async () => {
    const phones = website.phones.map((p) => p.trim()).filter(Boolean);
    try {
      const { value } = await apiFetch("/api/admin/settings/website", { method: "PUT", body: { phones } });
      setWebsite((s) => ({ ...s, phones: value.phones }));
      notify("Phone numbers saved");
    } catch (e) {
      notify(e.message, "error");
    }
  };

  const saveAll = async () => {
    if (tab === "website" && !website.name.trim()) return notify("Website Name zaroori hai", "error");
    if (tab === "theme" && Object.values(colors).some((c) => !isHex(c))) return notify("Kisi color ka hex code galat hai (e.g. #DBA921)", "error");
    // sirf wohi tab bhejte hain jo khula hai
    const body = { website, social, analytics, theme: colors }[tab];
    setSaving(true);
    try {
      const { value } = await apiFetch(`/api/admin/settings/${tab}`, { method: "PUT", body });
      // server ne jo saaf karke save kiya (trim, khali phones hata kar) wahi screen par dikhao
      if (tab === "website") setWebsite((s) => ({ ...s, ...value }));
      if (tab === "social") setSocial((s) => ({ ...s, ...value }));
      if (tab === "analytics") setAnalytics((s) => ({ ...s, ...value }));
      if (tab === "theme") setColors((s) => ({ ...s, ...value }));
      notify("Settings saved");
    } catch (e) {
      notify(e.message, "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LeafLoader />;

  return (
    <>
      {loadErr && <p className="empty" style={{ color: "#c0392b", padding: "0 0 12px" }}>{loadErr}</p>}
      <div className="pg-tabs st-tabs" role="tablist">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button key={key} role="tab" aria-selected={tab === key} className={`pg-tab st-tab ${tab === key ? "on" : ""}`} onClick={() => setTab(key)}>
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>

      <div key={tab} className="st-body">
        {tab === "website" && (
          <>
            <Heading>General</Heading>
            <div className="st-grid">
              <Field label="Website Name *"><input className="pg-input" value={website.name} onChange={w("name")} aria-invalid={!website.name.trim()} /></Field>
              <Field label="Tagline / Slogan"><input className="pg-input" value={website.tagline} onChange={w("tagline")} /></Field>
            </div>

            <Heading>Hero Section</Heading>
            <div className="st-grid">
              <Field wide label="Hero Heading"><input className="pg-input" value={website.heroHeading} onChange={w("heroHeading")} /></Field>
              <Field wide label="Hero Subtitle"><textarea className="pg-input" rows={3} placeholder="Subtitle text below the heading" value={website.heroSubtitle} onChange={w("heroSubtitle")} /></Field>
            </div>

            <Heading icon={Phone}>Contact Information</Heading>
            <div className="st-grid">
              <Field wide hintTop label="Phone Numbers" hint="First number shows in footer. All numbers show on contact page.">
                <div className="st-phones">
                  {website.phones.map((p, i) => (
                    <div key={i} className="st-phone-row">
                      <input className="pg-input" inputMode="tel" aria-label={`Phone ${i + 1}`} value={p} onChange={(e) => setPhone(i, e.target.value)} />
                      <button type="button" className="st-x" onClick={() => delPhone(i)} aria-label={`Remove phone ${i + 1}`}><X size={16} strokeWidth={3} /></button>
                    </div>
                  ))}
                </div>
                <div className="st-phone-actions">
                  <button type="button" className="st-add" onClick={addPhone}>+ Add Number</button>
                  <button type="button" className="st-link-dark" onClick={savePhones}>Save Phone Numbers</button>
                </div>
              </Field>
              <Field label="WhatsApp Number"><input className="pg-input" value={website.whatsapp} onChange={w("whatsapp")} /></Field>
              <Field label="Email Address"><input className="pg-input" type="email" value={website.email} onChange={w("email")} /></Field>
              <Field wide label="Physical Address"><textarea className="pg-input" rows={4} value={website.address} onChange={w("address")} /></Field>
              <Field wide label="Clinic Hours" icon={Clock} color="#d4a017"><input className="pg-input" value={website.hours} onChange={w("hours")} /></Field>
            </div>

            <Heading>Footer</Heading>
            <div className="st-grid">
              <Field wide label="Footer Text"><textarea className="pg-input" rows={3} value={website.footerText} onChange={w("footerText")} /></Field>
            </div>
          </>
        )}

        {tab === "social" && (
          <>
            <Heading>Social Media Links</Heading>
            <div className="st-grid">
              <Field label="Facebook" icon={Facebook} color="#1877f2"><input className="pg-input" value={social.facebook} onChange={so("facebook")} placeholder="https://facebook.com/..." /></Field>
              <Field label="Instagram" icon={Instagram} color="#e1306c"><input className="pg-input" value={social.instagram} onChange={so("instagram")} placeholder="https://instagram.com/..." /></Field>
              <Field label="Twitter / X" icon={Twitter} color="#1d9bf0"><input className="pg-input" value={social.twitter} onChange={so("twitter")} placeholder="https://twitter.com/..." /></Field>
              <Field label="YouTube Channel URL" icon={Youtube} color="#e62117" hint="This URL is used in the footer and the floating Subscribe button.">
                <input className="pg-input" value={social.youtube} onChange={so("youtube")} placeholder="https://youtube.com/@..." />
              </Field>
            </div>
          </>
        )}

        {tab === "analytics" && (
          <>
            <Heading icon={Activity}>Analytics &amp; Tracking</Heading>
            <div className="pg-inline-note st-note">Enter your tracking IDs below. Scripts will be automatically injected into the website when an ID is provided.</div>
            <div className="st-grid">
              <Field label="Google Analytics ID" icon={TrendingUp} color="#f57c00"><input className="pg-input" value={analytics.ga} onChange={an("ga")} placeholder="G-XXXXXXXXXX or UA-XXXXXXX-X" /></Field>
              <Field label="Facebook Pixel ID" icon={Facebook} color="#1877f2"><input className="pg-input" value={analytics.fb} onChange={an("fb")} placeholder="123456789012345" /></Field>
              <Field label="TikTok Pixel ID" icon={Activity} color="#e11d74"><input className="pg-input" value={analytics.tiktok} onChange={an("tiktok")} placeholder="C4XXXXXXXXXXXXXXXXXX" /></Field>
            </div>
          </>
        )}

        {tab === "theme" && <ThemeTab colors={colors} setColors={setColors} />}
        {tab === "security" && <SecurityTab notify={notify} />}
        {tab === "backup" && <BackupTab notify={notify} />}

        {SAVABLE.includes(tab) && (
          <button type="button" className="st-save" disabled={saving} onClick={saveAll}>
            <Save size={16} /> {saving ? "Saving..." : "Save Settings"}
          </button>
        )}
      </div>

      {toast && (
        <div className={`pg-toast ${toast.type === "error" ? "err" : ""}`} role="status">
          {toast.type === "error" ? <AlertCircle size={14} /> : <Check size={14} />} {toast.msg}
        </div>
      )}
    </>
  );
}
