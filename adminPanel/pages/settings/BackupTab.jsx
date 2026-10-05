import { useCallback, useEffect, useRef, useState } from "react";
import { apiFetch } from "../../auth/api.js";
import { apiUrl, FETCH_CREDENTIALS } from "../../../src/lib/api";
import {
  Database, FileText, Image as ImageIcon, HardDrive, RotateCcw, Download, Upload, FileArchive, AlertTriangle,
  UserCog, Tag, Stethoscope, Pill, BookOpen, MessageSquare, Calendar, Settings as Cog, Video,
} from "lucide-react";

// Server ke table keys -> icon
const ICONS = {
  admins: UserCog, categories: Tag, treatments: Stethoscope, medicines: Pill, articles: BookOpen, testimonials: MessageSquare,
  appointments: Calendar, orders: Database, consultations: FileText, reviewVideos: Video, videos: Video, settings: Cog, pages: FileText,
};
const fmtBytes = (n) => (n >= 1073741824 ? `${(n / 1073741824).toFixed(1)} GB` : n >= 1048576 ? `${(n / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`);

export default function BackupTab({ notify }) {
  const fileRef = useRef(null);
  const [file, setFile] = useState(null);
  const [incMedia, setIncMedia] = useState(true);
  const [incUsers, setIncUsers] = useState(true);
  const [replace, setReplace] = useState(true);
  const [resMedia, setResMedia] = useState(true);
  const [resUsers, setResUsers] = useState(false);
  const [stats, setStats] = useState(null); // { tables, files, bytes }
  const [busy, setBusy] = useState(""); // "", "download", "restore"

  const loadStats = useCallback(async () => {
    try {
      setStats(await apiFetch("/api/admin/backup/stats"));
    } catch (e) {
      notify(e.message, "error");
    }
  }, [notify]);
  useEffect(() => { loadStats(); }, [loadStats]);

  const TABLES = stats?.tables ?? [];
  const total = TABLES.reduce((n, t) => n + t.count, 0);
  const STORAGE = stats ? fmtBytes(stats.bytes) : "…";
  const cards = [
    ["Total Records", stats ? total : "…", Database], ["Tables", stats ? TABLES.length : "…", FileText],
    ["Uploaded Files", stats ? stats.files : "…", ImageIcon], ["Storage Used", STORAGE, HardDrive],
  ];

  // zip blob download: fetch se laate hain taake error aaye to admin panel se bahar na jayen
  const download = async () => {
    setBusy("download");
    try {
      const res = await fetch(apiUrl(`/api/admin/backup?media=${incMedia ? 1 : 0}&users=${incUsers ? 1 : 0}`), { credentials: FETCH_CREDENTIALS });
      if (!res.ok) {
        if (res.status === 401) window.dispatchEvent(new Event("admin-unauthorized"));
        let msg = `Backup nahi ban saka (${res.status})`;
        try { msg = (await res.json()).error || msg; } catch { /* json nahi tha */ }
        throw new Error(msg);
      }
      const blob = await res.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `hikmat-backup-${new Date().toISOString().slice(0, 10)}.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 10000);
      notify("Backup download ho gaya");
    } catch (e) {
      notify(e.message, "error");
    } finally {
      setBusy("");
    }
  };

  const pick = (e) => {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    if (!f.name.toLowerCase().endsWith(".zip")) return notify("Sirf .zip backup file select karein", "error");
    setFile(f);
  };

  const restore = async () => {
    if (!file) return;
    if (!window.confirm("Restore se live website ka data badal sakta hai. Kya aap sure hain?")) return;
    if (resUsers && !window.confirm("Admin users bhi restore honge. Is se aap ka login badal sakta hai. Phir bhi continue?")) return;
    setBusy("restore");
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("replace", replace ? "1" : "0");
      fd.append("media", resMedia ? "1" : "0");
      fd.append("users", resUsers ? "1" : "0");
      const res = await fetch(apiUrl("/api/admin/backup/restore"), { method: "POST", credentials: FETCH_CREDENTIALS, body: fd });
      let data = {};
      try { data = await res.json(); } catch { /* khali jawab */ }
      if (!res.ok) {
        if (res.status === 401) window.dispatchEvent(new Event("admin-unauthorized"));
        throw new Error(data.error || `Restore fail (${res.status})`);
      }
      const n = Object.values(data.restored || {}).reduce((a, b) => a + b, 0);
      notify(`Restore ho gaya: ${n} records, ${data.files} files`);
      setFile(null);
      loadStats();
    } catch (e) {
      notify(e.message, "error");
    } finally {
      setBusy("");
    }
  };

  return (
    <>
      <h2 className="st-bk-title">Backup &amp; Restore</h2>
      <p className="st-bk-sub">Download a complete snapshot of your website (database + images) or restore from a previous backup file.</p>

      <div className="st-stats">
        {cards.map(([label, value, Icon]) => (
          <div key={label} className="st-stat">
            <div className="st-stat-label"><Icon size={13} /> {label}</div>
            <div className="st-stat-value">{value}</div>
          </div>
        ))}
      </div>

      <section className="st-panel">
        <div className="st-panel-head">
          <div className="st-panel-title"><Database size={16} /> Database Contents</div>
          <button type="button" className="st-refresh" onClick={loadStats}><RotateCcw size={12} /> Refresh</button>
        </div>
        <div className="st-tables">
          {TABLES.map(({ key, label, count }) => {
            const Icon = ICONS[key] ?? Database;
            return <div key={key} className="st-table-item"><span><Icon size={14} /> {label}</span><b>{count}</b></div>;
          })}
        </div>
      </section>

      <section className="st-panel">
        <div className="st-action-head">
          <span className="st-action-icon green"><Download size={18} /></span>
          <div>
            <div className="st-action-title">Create Backup</div>
            <div className="st-action-sub">Download a ZIP file containing all your website data and uploaded media.</div>
          </div>
        </div>
        <label className="check"><input type="checkbox" checked={incMedia} onChange={(e) => setIncMedia(e.target.checked)} /> Include uploaded images, videos &amp; patient report PDFs <span className="st-dim">({STORAGE})</span></label>
        <label className="check"><input type="checkbox" checked={incUsers} onChange={(e) => setIncUsers(e.target.checked)} /> Include admin user accounts <span className="st-dim">(passwords are hashed)</span></label>
        <button type="button" className="st-green" disabled={busy !== ""} onClick={download}><Download size={16} /> {busy === "download" ? "Preparing backup..." : "Download Backup (.zip)"}</button>
      </section>

      <section className="st-panel">
        <div className="st-action-head">
          <span className="st-action-icon orange"><Upload size={18} /></span>
          <div>
            <div className="st-action-title">Restore from Backup</div>
            <div className="st-action-sub">Upload a previously downloaded backup ZIP to restore your website.</div>
          </div>
        </div>
        <button type="button" className="st-drop" onClick={() => fileRef.current?.click()}>
          <FileArchive size={38} strokeWidth={1.3} />
          <span className="st-drop-main">{file ? file.name : "Click to select backup file"}</span>
          <span className="st-drop-sub">{file ? `${(file.size / 1048576).toFixed(1)} MB` : ".zip files only"}</span>
        </button>
        <input ref={fileRef} type="file" accept=".zip" hidden onChange={pick} />

        <label className="check"><input type="checkbox" checked={replace} onChange={(e) => setReplace(e.target.checked)} /> <span><b>Replace</b> existing data (uncheck to merge)</span></label>
        <label className="check"><input type="checkbox" checked={resMedia} onChange={(e) => setResMedia(e.target.checked)} /> Restore uploaded images, videos &amp; report PDFs</label>
        <label className="check"><input type="checkbox" checked={resUsers} onChange={(e) => setResUsers(e.target.checked)} /> Restore admin users <span className="st-orange">(may overwrite your login)</span></label>

        <div className="st-caution"><AlertTriangle size={14} /> Restoring will modify your live website. We strongly recommend downloading a fresh backup first.</div>
        <button type="button" className="st-red" disabled={!file || busy !== ""} onClick={restore}><Upload size={16} /> {busy === "restore" ? "Restoring..." : "Restore from File"}</button>
      </section>
    </>
  );
}
