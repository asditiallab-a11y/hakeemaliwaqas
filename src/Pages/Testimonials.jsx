import { useEffect } from "react";
import HeroSection from "../components/site/HeroSection";
import TestimonialSlider from "../components/site/TestimonialSlider";
import VideoTestimonials from "../components/site/VideoTestimonials";
import FeaturedProducts from "../components/site/FeaturedProducts";
import LeafLoader from "../../adminPanel/components/LeafLoader.jsx";
import { useSiteData, applySeo, val } from "../lib/siteApi";

// Testimonials page admin panel ke mutabiq chalta hai:
//   Admin > Pages > Testimonials -> SEO, hero, heading, layout (slider/grid), video-reviews heading + button
//   Admin > Testimonials         -> saare live text testimonials
//   Admin > Review Videos        -> live video reviews
// Server band ho to purana static content (data/testimonials.js) dikhta hai.
export default function Testimonials() {
  const { data, loading, error } = useSiteData("testimonials");
  const live = !!data && !error;
  const page = live ? data.page : undefined;

  // admin ne field save ki ho (khali bhi) to wahi, warna component ka default
  const opt = (k) => (typeof page?.[k] === "string" ? page[k].trim() : undefined);

  useEffect(() => (page ? applySeo(page) : undefined), [page]);

  if (loading && !data) return (<><LeafLoader /><div style={{ minHeight: "100vh" }} /></>);

  return (
    <>
      <HeroSection
        image={val(page, "heroImage", "/images/hero-3.png")}
        video={val(page, "heroVideo")}
        label={val(page, "heroLabel", "PATIENT STORIES")}
        title={val(page, "heroTitle", "Testimonials")}
      />

      <TestimonialSlider
        items={live ? data.testimonials : undefined}
        label={opt("secLabel")}
        title={opt("secHeading")}
        subtitle={opt("secDesc")}
        layout={val(page, "layout", "slider")}
      />

      <VideoTestimonials
        items={live ? data.reviewVideos : undefined}
        head={{ label: opt("rvLabel"), title: opt("rvHeading"), desc: opt("rvDesc") }}
        viewAllLink={live ? val(page, "reviewsLink") : "#"}
        viewAllText={opt("reviewsBtn") || "View All Reviews →"}
      />

      <FeaturedProducts />
    </>
  );
}
