import { lazy, Suspense, useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import SocialSidebar from "./components/SocialSidebar";
import Home from "./Pages/Home";
import About from "./Pages/About";
import Treatments from "./Pages/Treatments";
import HerbalMedicines from "./Pages/HerbalMedicines";
import MedicineDetail from "./Pages/MedicineDetail";
import Videos from "./Pages/Videos";
import Articles from "./Pages/Articles";
import ArticleDetail from "./Pages/ArticleDetail";
import Testimonials from "./Pages/Testimonials";
import Contact from "./Pages/Contact";
import NotFound from "./Pages/NotFound";
import ConsultationPage from "./Pages/ConsultationPage";
import PrivacyPolicy from "./Pages/PrivacyPolicy";
import TermsOfService from "./Pages/TermsOfService";
import ScrollReveal from "./scrollReveal/ScrollReveal";
import LeafLoader from "../adminPanel/components/LeafLoader.jsx";
import ConsultationModal from "./components/consultation/ConsultationModal";
import { ConsultationProvider } from "./components/consultation/ConsultationContext";

// Admin panel alag chunk mein load hota hai - normal visitors ke liye extra code download nahi hota
const AdminApp = lazy(() => import("../adminPanel/AdminApp.jsx"));

// Page badalne par upar scroll kare
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

// Website ke har page par leaf loader (admin wala hi):
//  * site pehli baar khulne par  -> saaf background par leaf draw hota hai
//  * har page badalne par        -> peeche ka page blur, beech mein leaf draw hota hai
// Leaf kam az kam ek baar poora draw hota hai (MIN_VISIBLE_MS, adminPanel/components/LeafLoader.jsx),
// phir loader fade ho kar hat jata hai.
const FIRST_LOAD_MAX_MS = 3000; // pehli load par images/video ka itna hi intezar (usse zyada nahi)

function RouteLoader() {
  const { pathname } = useLocation();
  const [first, setFirst] = useState(true);
  const [busy, setBusy] = useState(true);

  useEffect(() => {
    setBusy(true);
    let timer;
    let onLoad;
    if (first && document.readyState !== "complete") {
      // pehli baar: browser ki load complete hone tak (ya max time tak) ruko
      onLoad = () => { clearTimeout(timer); setBusy(false); setFirst(false); };
      window.addEventListener("load", onLoad, { once: true });
      timer = setTimeout(onLoad, FIRST_LOAD_MAX_MS);
    } else {
      // page badalne par: naya page render ho chuka, loader ko apna min time poora karne do
      timer = setTimeout(() => { setBusy(false); setFirst(false); }, 120);
    }
    return () => {
      clearTimeout(timer);
      if (onLoad) window.removeEventListener("load", onLoad);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return busy ? <LeafLoader fullscreen={first} /> : null;
}

// Website ke pages (header/footer ke saath)
function SiteRoutes() {
  return (
    <>
      <RouteLoader />
      <Header />
      <SocialSidebar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/treatments" element={<Treatments />} />
        <Route path="/herbal-medicines" element={<HerbalMedicines />} />
        <Route path="/herbal-medicines/:id" element={<MedicineDetail />} />
        <Route path="/videos" element={<Videos />} />
        <Route path="/health-articles" element={<Articles />} />
        <Route path="/health-articles/:id" element={<ArticleDetail />} />
        <Route path="/articles" element={<Navigate to="/health-articles" replace />} />
        <Route path="/testimonials" element={<Testimonials />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/consultation" element={<ConsultationPage />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-of-service" element={<TermsOfService />} />
        <Route path="*" element={<NotFound />} />
      </Routes>

      <Footer />
      <ConsultationModal />
    </>
  );
}

function App() {
  const { pathname } = useLocation();
  const isAdmin = pathname === "/admin" || pathname.startsWith("/admin/");

  // Folder ke naam (/adminPanel) se kholne par bhi admin khul jaye
  if (pathname === "/adminPanel" || pathname.startsWith("/adminPanel/")) {
    return <Navigate to={pathname.replace(/^\/adminPanel/, "/admin") || "/admin"} replace />;
  }

  return (
    <ConsultationProvider>
      <ScrollToTop />
      <ScrollReveal />
      {isAdmin ? (
        // Admin par website ka header/footer nahi dikhta
        <Suspense fallback={<LeafLoader fullscreen />}>
          <Routes>
            <Route path="/admin/*" element={<AdminApp />} />
          </Routes>
        </Suspense>
      ) : (
        <SiteRoutes />
      )}
    </ConsultationProvider>
  );
}

// useLocation ke liye Router upar hona chahiye
export default function Root() {
  return (
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
}
