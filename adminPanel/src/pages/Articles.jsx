import CategoryList from "../components/CategoryList.jsx";

// TODO: baad me API se replace karenge
const items = [
  ["7 Proven Health Benefits of Kalonji (Black Seed)", "2026-04-10", true],
  ["Amazing Benefits of Ashwagandha in Unani Medicine", "2026-05-10", true],
  ["Can't Sleep? 6 Natural Herbal Remedies That Actually Work", "2026-04-30", false],
  ["Clear Skin Naturally: Unani Approach to Skin Health", "2026-05-10", false],
  ["Colon Cleansing the Unani Way", "2026-05-10", false],
  ["Giloy: The Herb That Boosts Immunity", "2026-05-10", false],
  ["Golden Milk: The Ancient Healing Drink Backed by Science", "2026-04-15", true],
  ["Honey in Unani Medicine: Liquid Gold for Health", "2026-05-10", false],
  ["Ispaghol: Natural Fiber for Better Digestion", "2026-05-08", false],
  ["Natural Ways to Manage High Blood Pressure", "2026-05-06", false],
  ["Shilajit: Nature's Energy Booster", "2026-05-04", false],
  ["Tulsi: The Queen of Herbs", "2026-05-02", false],
  ["Turmeric vs Curcumin: What You Should Know", "2026-04-28", false],
].map(([title, date, home], i) => ({ id: i + 1, title, date, live: true, home }));

export default function Articles() {
  return <CategoryList heading="Health Articles" singular="article" nameLabel="Title" items={items} />;
}
