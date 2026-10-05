import CategoryList from "../components/CategoryList.jsx";

// TODO: baad me API se replace karenge
const categories = [
  "Seeds & Grains", "Roots & Bark", "Leaves & Herbs", "Fruits & Berries",
  "Oils & Extracts", "Compound Formulas", "Kushta jaat", "Courses",
].map((name, i) => ({ id: i + 1, name }));

const items = [
  ["Giloy (Guduchi)", "Leaves & Herbs", false],
  ["Haldi (Turmeric)", "Leaves & Herbs", true],
  ["Kalonji (Black Seed)", "Seeds & Grains", true],
  ["Kushta Sona", "Kushta jaat", true],
  ["Majoon Shadi Course", "Courses", true],
  ["Neem (Indian Lilac)", "Leaves & Herbs", false],
  ["Retha", "Leaves & Herbs", false],
  ["Sada Jawaan Course", "Seeds & Grains", true],
  ["Shilajit Extract", "Oils & Extracts", false],
  ["Tulsi (Holy Basil)", "Leaves & Herbs", false],
].map(([title, category, home], i) => ({ id: i + 1, title, category, live: true, home }));

export default function Medicines() {
  // TODO: Gallery page/modal baad me banayenge
  const openGallery = (medicine) => console.log("Gallery:", medicine.title);

  return (
    <CategoryList
      heading="Herbal Medicines"
      singular="medicine"
      nameLabel="Name"
      catPlaceholder="New category name (e.g. Digestive Tonics)..."
      categories={categories}
      items={items}
      gallery={openGallery}
    />
  );
}
