import { useEffect, useRef, useState } from "react";
import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import { Leaf, FileText, Home, Settings, LogOut, Users, Menu } from "lucide-react";
import { navItems } from "./navItems.js";
import { useAuth } from "../auth/AuthContext.jsx";

const SITE_URL = "/"; // apni website ka link yahan lagao

const SCROLLBAR_HIDE_MS = 700; // scroll rukne ke itne ms baad scrollbar ghaib

export default function Layout() {
  const [open, setOpen] = useState(false);
  // Sidebar ka scrollbar sirf scroll karte waqt dikhta hai (re-render ke baghair, seedha class se)
  const sidebarRef = useRef(null);
  const hideTimer = useRef(0);
  const holding = useRef(false); // scrollbar ko mouse se pakda hua ho to chhupna nahi
  const scheduleHide = () => {
    clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => {
      if (!holding.current) sidebarRef.current?.classList.remove("is-scrolling");
    }, SCROLLBAR_HIDE_MS);
  };
  const showScrollbar = () => {
    sidebarRef.current?.classList.add("is-scrolling");
    scheduleHide();
  };
  const holdScrollbar = () => {
    holding.current = true;
    showScrollbar();
  };
  useEffect(() => {
    const release = () => {
      if (!holding.current) return;
      holding.current = false;
      scheduleHide();
    };
    window.addEventListener("pointerup", release);
    window.addEventListener("pointercancel", release);
    return () => {
      window.removeEventListener("pointerup", release);
      window.removeEventListener("pointercancel", release);
      clearTimeout(hideTimer.current);
    };
  }, []);
  const navigate = useNavigate();
  const { user, logout: doLogout } = useAuth();
  const { pathname } = useLocation();
  const extra = { "/admin/pages": "Pages", "/admin/settings": "Settings" };
  const title = navItems.find((i) => i.to === pathname)?.label ?? extra[pathname] ?? "Dashboard";

  const logout = async () => {
    await doLogout();
    navigate("/admin/login", { replace: true });
  };

  return (
    <div className="admin-root">
    <div className="shell">
      <aside
        ref={sidebarRef}
        className={`sidebar ${open ? "open" : ""}`}
        onScroll={showScrollbar}
        onPointerDown={holdScrollbar}
      >
        <div className="brand">
          <div className="brand-logo"><Leaf size={18} /></div>
          <div>
            <div className="brand-name">Prof Hakeem Ali Waqas</div>
            <div className="brand-sub">Admin CMS</div>
          </div>
        </div>

        <div className="nav-label">Navigation</div>
        <nav className="adm-nav">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/admin"}
              onClick={() => setOpen(false)}
              className={({ isActive }) => `adm-nav-link ${isActive ? "active" : ""}`}
            >
              <Icon size={16} /> {label}
            </NavLink>
          ))}
        </nav>

        <div className="nav-bottom">
          <NavLink to="/admin/pages" className="adm-nav-link"><FileText size={16} /> Pages</NavLink>
          <a href={SITE_URL} target="_blank" rel="noreferrer" className="adm-nav-link"><Home size={16} /> View Website</a>
          <NavLink to="/admin/settings" className="adm-nav-link"><Settings size={16} /> Settings</NavLink>
          <button className="adm-nav-link" onClick={logout}><LogOut size={16} /> Logout</button>
        </div>
      </aside>

      {open && <div className="scrim" onClick={() => setOpen(false)} />}

      <div className="main">
        <header className="topbar">
          <button className="menu-btn" onClick={() => setOpen(true)} aria-label="Open menu"><Menu size={20} /></button>
          <span className="topbar-title">
            {["/admin/consultation-form", "/admin/orders"].includes(pathname) && <span className="crumb">Admin CMS <i>›</i></span>}
            {title}
          </span>
          <div className="user"><span className="avatar"><Users size={14} /></span>{user?.username}</div>
        </header>
        <main className="content"><Outlet /></main>
      </div>
    </div>
    </div>
  );
}
