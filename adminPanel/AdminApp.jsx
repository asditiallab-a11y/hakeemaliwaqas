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
import Login from "./pages/Login.jsx";
import { AuthProvider, RequireAuth } from "./auth/AuthContext.jsx";
import "./index.css";

// Admin panel website ke andar /admin par chalta hai (same project, same node_modules).
// Ye component App.jsx mein /admin/* route par lazy-load hota hai, isliye normal visitors
// ko admin ka code download nahi karna parta.
// Naya page banane ke liye: pages/ mein file banao aur neeche Route add kar do
// (aur sidebar link ke liye components/navItems.js mein entry).
export default function AdminApp() {
  return (
    <AuthProvider>
    <Routes>
      <Route path="login" element={<Login />} />
      {/* Is ke andar ke sab pages bina login ke nahi khulte */}
      <Route element={<RequireAuth><Layout /></RequireAuth>}>
        <Route index element={<Dashboard />} />
        <Route path="treatments" element={<Treatments />} />
        <Route path="medicines" element={<Medicines />} />
        <Route path="articles" element={<Articles />} />
        <Route path="testimonials" element={<Testimonials />} />
        <Route path="appointments" element={<Appointments />} />
        <Route path="consultation-form" element={<Consultation />} />
        <Route path="orders" element={<Orders />} />
        <Route path="review-videos" element={<ReviewVideos />} />
        <Route path="videos" element={<Videos />} />
        <Route path="pages" element={<Pages />} />
        <Route path="settings" element={<Settings />} />
        <Route path="*" element={<Dashboard />} />
      </Route>
    </Routes>
    </AuthProvider>
  );
}
