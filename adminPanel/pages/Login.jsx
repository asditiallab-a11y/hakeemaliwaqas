import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { Leaf, Lock, User, Eye, EyeOff, LogIn } from "lucide-react";
import { useAuth } from "../auth/AuthContext.jsx";

export default function Login() {
  const { user, loading, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const target = location.state?.from && location.state.from.startsWith("/admin") ? location.state.from : "/admin";
  if (!loading && user) return <Navigate to={target} replace />;

  const submit = async (e) => {
    e.preventDefault();
    if (busy) return;
    setError("");
    setBusy(true);
    try {
      await login(username.trim(), password);
      navigate(target, { replace: true });
    } catch (err) {
      setError(err.message);
      setPassword("");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="admin-root">
      <div className="lg-wrap">
        <form className="lg-card" onSubmit={submit} noValidate>
          <div className="lg-brand">
            <span className="lg-logo"><Leaf size={22} /></span>
            <div className="lg-title">Prof Hakeem Ali Waqas</div>
            <div className="lg-sub">Admin CMS &mdash; Sign in</div>
          </div>

          <label className="lg-label" htmlFor="lg-user">Username</label>
          <div className="lg-field">
            <User size={16} />
            <input id="lg-user" autoComplete="username" autoFocus value={username} onChange={(e) => setUsername(e.target.value)} />
          </div>

          <label className="lg-label" htmlFor="lg-pass">Password</label>
          <div className="lg-field">
            <Lock size={16} />
            <input id="lg-pass" type={show ? "text" : "password"} autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
            <button type="button" className="lg-eye" onClick={() => setShow((s) => !s)} aria-label={show ? "Hide password" : "Show password"}>
              {show ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {error && <div className="lg-error" role="alert">{error}</div>}

          <button type="submit" className="lg-btn" disabled={busy || !username.trim() || !password}>
            <LogIn size={16} /> {busy ? "Signing in…" : "Sign in"}
          </button>
          <a className="lg-back" href="/">← Back to website</a>
        </form>
      </div>
    </div>
  );
}
