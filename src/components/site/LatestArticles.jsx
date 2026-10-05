import { useState } from "react";
import SectionHeading from "./SectionHeading";
import ArticleCard from "./ArticleCard";
import { articles as defaultArticles } from "../../data/articles";

const GOLD = "#d4a017";

// Cards + heading Articles page se aate hain (server band ho to purana static data). "Load More" se agle articles aate hain.
export default function LatestArticles({
  articles = defaultArticles,
  head = { label: "Health Education", title: "Latest Articles", desc: "Stay informed with our latest health articles, tips, and insights on natural healing" },
  perPage = 9,
  loadMore = "Load More Articles",
  readMore = "Read More →",
}) {
  const [shown, setShown] = useState(perPage);
  const list = articles.slice(0, shown);

  return (
    <section className="bg-white py-5">
      <div className="container">
        <SectionHeading label={head.label} title={head.title} subtitle={head.desc} />

        <div className="row g-4">
          {list.map((a) => (
            <div key={a.id} className="col-12 col-md-6 col-lg-4">
              <ArticleCard article={a} readMore={readMore} />
            </div>
          ))}
          {articles.length === 0 && (
            <p className="text-center text-secondary">Articles jald hi add kiye jayenge.</p>
          )}
        </div>

        {shown < articles.length && (
          <div className="text-center mt-5">
            <button
              type="button"
              onClick={() => setShown((n) => n + perPage)}
              className="btn rounded-pill px-4 py-2"
              style={{ border: `1px solid ${GOLD}`, color: GOLD, fontFamily: "Inter, sans-serif", fontSize: 14 }}
            >
              {loadMore}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
