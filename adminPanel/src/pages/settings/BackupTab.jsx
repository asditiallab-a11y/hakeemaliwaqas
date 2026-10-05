import { useRef, useState } from "react";
import {
  Database, FileText, Image as ImageIcon, HardDrive, RotateCcw, Download, Upload, FileArchive, AlertTriangle,
  UserCog, Tag, Stethoscope, Pill, BookOpen, MessageSquare, Calendar, Settings as Cog, Video,
} from "lucide-react";

// TODO: API se aayega (GET /backup/stats)
const TABLES = [
  ["Admin Users", 1, UserCog], ["Treatment Categories", 10, Tag], ["Treatments", 10, Stethoscope], ["Treatment Mapping", 12, Tag],
  ["Medicine Categories", 8, Tag], ["Herbal Medicines", 10, Pill], ["Medicine Mapping", 11, Tag], ["Articles", 13, BookOpen],
  ["Testimonials", 12, MessageSquare], ["Appointments", 2, Calendar], ["Site Settings", 1, Cog], ["Page Content", 182, FileText],
  ["Videos", 16, Video],
];
const FILES = 151;
const STORAGE = "127 MB";

export default function BackupTab({ notify }) {
  const fileRef = useRef(null);
  const [file, setFile] = useState(null);
  const [incMedia, setIncMedia] = useState(true);
  const [incUsers, setIncUsers] = useState(true);
  const [replace, setReplace] = useState(true);
  const [resMedia, setResMedia] = useState(true);
  const [resUsers, setResUsers] = useState(false);

  const total = TABLES.reduce((n, [, c]) => n + c, 0);
  const stats = [
    ["Total Records", total, Database], ["Tables", TABLES.length, FileText],
    ["Uploaded Files", FILES, ImageIcon], ["Storage Used", STORAGE, HardDrive],
  ];

  const download = () => {
    // TODO: API — GET /backup?media=${incMedia}&users=${incUsers} se zip blob download karna
    console.log("Backup:", { includeMedia: incMedia, includeUsers: incUsers });
    notify("Backup request ready — API connect karna baaki hai");
  };

  const pick = (e) => {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    if (!f.name.toLowerCase().endsWith(".zip")) return notify("Sirf .zip backup file select karein", "error");
    setFile(f);
  };

  const restore = () => {
    if (!file) return;
    if (!window.confirm("Restore se live website ka data badal sakta hai. Kya aap sure hain?")) return;
    // TODO: API — FormData { file, replace, media: resMedia, users: resUsers }
    console.log("Restore:", { name: file.name, replace, resMedia, resUsers });
    notify("Restore request ready — API connect karna baaki hai");
  };

  return (
    <>
      <h2 className="st-bk-title">Backup &amp; Restore</h2>
      <p className="st-bk-sub">Download a complete snapshot of your website (database + images) or restore from a previous backup file.</p>

      <div className="st-stats">
        {stats.map(([label, value, Icon]) => (
          <div key={label} className="st-stat">
            <div className="st-stat-label"><Icon size={13} /> {label}</div>
            <div className="st-stat-value">{value}</div>
          </div>
        ))}
      </div>

      <section className="st-panel">
        <div className="st-panel-head">
          <div className="st-panel-title"><Database size={16} /> Database Contents</div>
          <button type="button" className="st-refresh" onClick={() => notify("Refreshed")}><RotateCcw size={12} /> Refresh</button>
        </div>
        <div className="st-tables">
          {TABLES.map(([label, count, Icon]) => (
            <div key={label} className="st-table-item"><span><Icon size={14} /> {label}</span><b>{count}</b></div>
          ))}
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
        <label className="check"><input type="checkbox" checked={incMedia} onChange={(e) => setIncMedia(e.target.checked)} /> Include uploaded images &amp; videos <span className="st-dim">({STORAGE})</span></label>
        <label className="check"><input type="checkbox" checked={incUsers} onChange={(e) => setIncUsers(e.target.checked)} /> Include admin user accounts <span className="st-dim">(passwords are hashed)</span></label>
        <button type="button" className="st-green" onClick={download}><Download size={16} /> Download Backup (.zip)</button>
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
        <label className="check"><input type="checkbox" checked={resMedia} onChange={(e) => setResMedia(e.target.checked)} /> Restore uploaded images &amp; videos</label>
        <label className="check"><input type="checkbox" checked={resUsers} onChange={(e) => setResUsers(e.target.checked)} /> Restore admin users <span className="st-orange">(may overwrite your login)</span></label>

        <div className="st-caution"><AlertTriangle size={14} /> Restoring will modify your live website. We strongly recommend downloading a fresh backup first.</div>
        <button type="button" className="st-red" disabled={!file} onClick={restore}><Upload size={16} /> Restore from File</button>
      </section>
    </>
  );
}
