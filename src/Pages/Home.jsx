import { useEffect } from "react";
import Hero from "../components/Hero";
import About from "../components/About";
import Feature from "../components/Feature";
import Experience from "../components/Experience";
import Services from "../components/Services";
import Natural from "../components/Natural";
import Video from "../components/Video";
import TestimonialSlider from "../components/site/TestimonialSlider";
import VideoTestimonials from "../components/site/VideoTestimonials";
import CtaBanner from "../components/site/CtaBanner";
import LeafLoader from "../../adminPanel/components/LeafLoader.jsx";
import { useHomeData, applySeo } from "../lib/siteApi";
import "../components/components.css";

// Home page admin panel ke mutabiq chalta hai:
//   Admin > Pages > Home            -> hero image/video, buttons, About, stats, section headings, panels, CTA, SEO
//   Admin > Settings > Website      -> hero heading / subtitle, WhatsApp number
//   Admin > Treatments/Medicines/Testimonials -> jin par "Show on Home Page" on hai wohi yahan aate hain
//   Admin > Videos / Review Videos  -> video slider aur patient reviews
// Server band ho (data na aaye) to har section apna purana default content dikhata hai.
const Home = () => {
  const { data, loading, error } = useHomeData();
  const page = data?.page;
  const live = !!data && !error; // true => admin ka data aaya hai (khali list ka matlab sach mein khali)

  useEffect(() => (page ? applySeo(page) : undefined), [page]);

  if (loading) return (<><LeafLoader /><div style={{ minHeight: "100vh" }} /></>);

  return (
    <div>
      <Hero page={page} settings={data?.settings} />
      <About page={page} />
      <Feature page={page} medicines={live ? data.medicines : undefined} whatsapp={data?.settings?.whatsapp} />
      <Experience page={page} />
      <Services page={page} treatments={live ? data.treatments : undefined} />
      <Natural page={page} />
      <Video videos={live ? (data.videoSlider ? data.videos : []) : undefined} />
      <TestimonialSlider
        items={live ? data.testimonials : undefined}
        label={page && (page.teLabel || undefined)}
        title={page && (page.teHeading || undefined)}
        subtitle={page && (page.teDesc || undefined)}
      />
      <VideoTestimonials slider viewAllLink="/testimonials" items={live ? data.reviewVideos : undefined} />
      <CtaBanner
        title={page?.ctaHeading || undefined}
        text={page?.ctaText || undefined}
        image={page?.ctaBg || undefined}
      />
    </div>
  );
};

export default Home;
