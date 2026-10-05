import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserCog, KeyRound, ShieldCheck } from "lucide-react";

export default function SecurityTab({ notify }) {
  const navigate = useNavigate();
  const [current, setCurrent] = useState("admin");
  const [uName, setUName] = useState("admin");
  const [uPass, setUPass] = useState("");
  const [cur, setCur] = useState("");
  const [np, setNp] = useState("");
  const [cp, setCp] = useState("");

  const canUser = uName.trim() && uPass;
  const mismatch = cp && np !== cp;
  const canPass = cur && np.length >= 6 && np === cp;

  const updateUsername = (e) => {
    e.preventDefault();
    if (!canUser) return;
    if (uName.trim() === current) return notify("Ye username pehle se wahi hai", "error");
    // TODO: API — { newUsername: uName.trim(), currentPassword: uPass }
    setCurrent(uName.trim());
    setUPass("");
    notify("Username updated");
  };

  const changePassword = (e) => {
    e.preventDefault();
    if (!canPass) return;
    if (!window.confirm("Password change karne par har device se logout ho jayega. Continue?")) return;
    // TODO: API — { currentPassword: cur, newPassword: np }; server sab sessions invalidate kare
    localStorage.removeItem("token");
    notify("Password changed — logged out");
    navigate("/"); // TODO: login page banne par "/login"
  };

  return (
    <>
      <div className="st-whoami">
        <span className="st-whoami-icon"><UserCog size={20} /></span>
        <div>
          <div className="st-whoami-sub">Currently logged in as</div>
          <div className="st-whoami-name">{current}</div>
        </div>
      </div>

      <div className="st-two">
        <form className="st-card" onSubmit={updateUsername}>
          <div className="st-card-head"><UserCog size={16} /> Change Username</div>
          <div className="st-card-body">
            <label className="st-cap" htmlFor="new-user">New Username *</label>
            <input id="new-user" className="pg-input" autoComplete="username" value={uName} onChange={(e) => setUName(e.target.value)} />
            <label className="st-cap" htmlFor="user-pass">Current Password (to confirm) *</label>
            <input id="user-pass" className="pg-input" type="password" autoComplete="current-password" value={uPass} onChange={(e) => setUPass(e.target.value)} />
            <button type="submit" className="st-wide gold" disabled={!canUser}><UserCog size={16} /> Update Username</button>
          </div>
        </form>

        <form className="st-card" onSubmit={changePassword}>
          <div className="st-card-head"><KeyRound size={16} /> Change Password</div>
          <div className="st-card-body">
            <label className="st-cap" htmlFor="cur-pass">Current Password *</label>
            <input id="cur-pass" className="pg-input" type="password" autoComplete="current-password" placeholder="Enter current password" value={cur} onChange={(e) => setCur(e.target.value)} />
            <label className="st-cap" htmlFor="new-pass">New Password * (min 6 characters)</label>
            <input id="new-pass" className="pg-input" type="password" autoComplete="new-password" placeholder="Enter new password" value={np} onChange={(e) => setNp(e.target.value)} />
            <label className="st-cap" htmlFor="conf-pass">Confirm New Password *</label>
            <input id="conf-pass" className="pg-input" type="password" autoComplete="new-password" placeholder="Re-enter new password" value={cp} aria-invalid={!!mismatch} onChange={(e) => setCp(e.target.value)} />
            {mismatch && <p className="pg-error">Passwords match nahi karte.</p>}
            <div className="st-warn"><ShieldCheck size={14} /> <span>Changing your password will <b>log out all active sessions</b> on every device and browser. You will need to log in again.</span></div>
            <button type="submit" className="st-wide red" disabled={!canPass}><KeyRound size={16} /> Change Password &amp; Logout All Sessions</button>
          </div>
        </form>
      </div>

      <div className="st-secure">
        <ShieldCheck size={16} />
        <div>
          <div className="st-secure-title">Security Note</div>
          <div>Admin panel access requires a valid username and password. All API endpoints are protected — no data can be accessed without a valid session token.</div>
        </div>
      </div>
    </>
  );
}
