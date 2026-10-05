import { useState } from "react";
import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import { Leaf, FileText, Home, Settings, LogOut, Users, Menu } from "lucide-react";
import { navItems } from "./navItems.js";

const SITE_URL = "/"; // apni website ka link yahan lagao

export default function Layout() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const extra = { "/pages": "Pages", "/settings": "Settings" };
  const title = navItems.find((i) => i.to === pathname)?.label ?? extra[pathname] ?? "Dashboard";

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/"); // TODO: login page banne par "/login" karna
  };

  return (
    <div className="shell">
      <aside className={`sidebar ${open ? "open" : ""}`}>
        <div className="brand">
          <div className="brand-logo"><Leaf size={18} /></div>
          <div>
            <div className="brand-name">Prof Hakeem Ali Waqas</div>
            <div className="brand-sub">Admin CMS</div>
          </div>
        </div>

        <div className="nav-label">Navigation</div>
        <nav className="nav">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              onClick={() => setOpen(false)}
              className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
            >
              <Icon size={16} /> {label}
            </NavLink>
          ))}
        </nav>

        <div className="nav-bottom">
          <NavLink to="/pages" className="nav-link"><FileText size={16} /> Pages</NavLink>
          <a href={SITE_URL} target="_blank" rel="noreferrer" className="nav-link"><Home size={16} /> View Website</a>
          <NavLink to="/settings" className="nav-link"><Settings size={16} /> Settings</NavLink>
          <button className="nav-link" onClick={logout}><LogOut size={16} /> Logout</button>
        </div>
      </aside>

      {open && <div className="scrim" onClick={() => setOpen(false)} />}

      <div className="main">
        <header className="topbar">
          <button className="menu-btn" onClick={() => setOpen(true)} aria-label="Open menu"><Menu size={20} /></button>
          <span className="topbar-title">
            {["/consultation-form", "/orders"].includes(pathname) && <span className="crumb">Admin CMS <i>›</i></span>}
            {title}
          </span>
          <div className="user"><span className="avatar"><Users size={14} /></span>admin</div>
        </header>
        <main className="content"><Outlet /></main>
      </div>
    </div>
  );
}
