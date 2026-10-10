import { useEffect } from "react";
import HeroSection from "../components/site/HeroSection";
import VideoCollection from "../components/site/VideoCollection";
import FeaturedProducts from "../components/site/FeaturedProducts";
import LeafLoader from "../../adminPanel/components/LeafLoader.jsx";
import { useSiteData, applySeo, val, field } from "../lib/siteApi";

// Videos page admin panel ke mutabiq chalta hai:
//   Admin > Pages > Videos -> SEO, hero, heading, access (locked/open), subscribe notice, default tab
//   Admin > Videos         -> published long + short videos (title, YouTube link, description, order)
// Server band ho to purana static content (data/videos.js) dikhta hai.
export default function Videos() {
  const { data, loading, error } = useSiteData("videos");
  const live = !!data && !error;
  const page = live ? data.page : undefined;

  useEffect(() => (page ? applySeo(page) : undefined), [page]);

  if (loading && !data) return (<><LeafLoader /><div style={{ minHeight: "100vh" }} /></>);

  return (
    <>
      <HeroSection
        image={val(page, "heroImage", "/images/s2.jpg")}
        video={val(page, "heroVideo")}
        label={val(page, "heroLabel", "HIKMAT VIDEO LIBRARY")}
        title={val(page, "heroTitle", "Videos")}
      />

      <VideoCollection
        {...(live ? { long: data.long, short: data.short } : {})}
        head={{
          label: field(page, "secLabel", "Watch & Learn"),
          title: field(page, "secHeading", "Video Collection"),
          desc: field(page, "secDesc", "Educational videos on Hikmat, herbal remedies, and natural healing — in both long-form and short formats"),
        }}
        notice={{
          text: field(page, "noticeText", "Videos صرف Subscribers کے لیے ہیں"),
          btn: field(page, "noticeBtn", "Subscribe"),
          link: val(page, "subscribeLink"),
        }}
        isSubscriber={val(page, "videoLock", "on") === "off"}
        defaultTab="long"
        lockTitle={field(page, "lockTitle", "Subscribe to Watch")}
        lockSub={field(page, "lockSub", "یہ ویڈیو دیکھنے کے لیے Subscribe کریں")}
      />

      <FeaturedProducts />
    </>
  );
}
