import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Treatments from "./pages/Treatments.jsx";
import Medicines from "./pages/Medicines.jsx";
import Articles from "./pages/Articles.jsx";
import Testimonials from "./pages/Testimonials.jsx";
import Appointments from "./pages/Appointments.jsx";
import Consultation from "./pages/Consultation.jsx";
import Orders from "./pages/Orders.jsx";
import ReviewVideos from "./pages/ReviewVideos.jsx";
import Videos from "./pages/Videos.jsx";
import Pages from "./pages/Pages.jsx";
import Settings from "./pages/Settings.jsx";
import { navItems } from "./components/navItems.js";

// Naya page banane par bas us route ka element yahan replace kar do
const Placeholder = ({ title }) => (
  <>
    <h1 className="page-title">{title}</h1>
    <p className="page-sub">Ye page abhi banna baaki hai.</p>
  </>
);

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/treatments" element={<Treatments />} />
        <Route path="/medicines" element={<Medicines />} />
        <Route path="/articles" element={<Articles />} />
        <Route path="/testimonials" element={<Testimonials />} />
        <Route path="/appointments" element={<Appointments />} />
        <Route path="/consultation-form" element={<Consultation />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/review-videos" element={<ReviewVideos />} />
        <Route path="/videos" element={<Videos />} />
        {navItems
          .filter((i) => !["/", "/treatments", "/medicines", "/articles", "/testimonials", "/appointments", "/consultation-form", "/orders", "/review-videos", "/videos"].includes(i.to))
          .map((i) => (
            <Route key={i.to} path={i.to} element={<Placeholder title={i.label} />} />
          ))}
        <Route path="/pages" element={<Pages />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}
