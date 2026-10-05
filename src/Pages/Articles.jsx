import { useEffect, useMemo } from "react";
import HeroSection from "../components/site/HeroSection";
import LatestArticles from "../components/site/LatestArticles";
import FeaturedProducts from "../components/site/FeaturedProducts";
import LeafLoader from "../../adminPanel/components/LeafLoader.jsx";
import { useSiteData, applySeo, val, field } from "../lib/siteApi";

// Health Articles page admin panel ke mutabiq chalta hai:
//   Admin > Pages > Blog  -> SEO, hero, heading, order (newest/manual), per-page, button texts
//   Admin > Articles      -> live articles (title, excerpt, image, date, content, Urdu)
// Server band ho to purana static content (data/articles.js) dikhta hai.
export default function Articles() {
  const { data, loading, error } = useSiteData("articles");
  const live = !!data && !error;
  const page = live ? data.page : undefined;

  useEffect(() => (page ? applySeo(page) : undefined), [page]);

  const items = useMemo(
    () => (live ? data.items.map((a) => ({ ...a, link: `/health-articles/${a.id}` })) : undefined),
    [live, data]
  );

  if (loading && !data) return (<><LeafLoader /><div style={{ minHeight: "100vh" }} /></>);

  const perPage = Math.max(1, parseInt(val(page, "perPage", "9"), 10) || 9);

  return (
    <>
      <HeroSection
        image={val(page, "heroImage", "/images/s3.jpg")}
        video={val(page, "heroVideo")}
        label={val(page, "heroLabel", "KNOWLEDGE HUB")}
        title={val(page, "heroTitle", "Health Articles")}
      />

      <LatestArticles
        {...(items ? { articles: items } : {})}
        head={{
          label: field(page, "secLabel", "Health Education"),
          title: field(page, "secHeading", "Latest Articles"),
          desc: field(page, "secDesc", "Stay informed with our latest health articles, tips, and insights on natural healing"),
        }}
        perPage={perPage}
        loadMore={field(page, "loadMoreBtn", "Load More Articles") || "Load More Articles"}
        readMore={field(page, "readMoreText", "Read More →") || "Read More →"}
      />

      <FeaturedProducts />
    </>
  );
}
