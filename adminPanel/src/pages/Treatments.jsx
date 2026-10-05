import CategoryList from "../components/CategoryList.jsx";

// TODO: baad me API se replace karenge
const initialCategories = [
  "Digestive Health", "Diabetes & Blood Sugar", "Blood Pressure & Heart", "Skin Diseases",
  "Joint & Bone Pain", "Respiratory Health", "Weight Management", "Men's Health",
  "Women's Health", "Liver & Kidney",
].map((name, i) => ({ id: i + 1, name }));

const initialItems = [
  ["Diabetes & Blood Sugar Control", "Diabetes & Blood Sugar", true],
  ["Digestive Disorders, IBS & Acidity", "Digestive Health", true],
  ["High Blood Pressure & Heart Health", "Blood Pressure & Heart", true],
  ["Joint Pain, Arthritis & Gout", "Joint & Bone Pain", true],
  ["Liver Detox & Hepatic Repair", "Liver & Kidney", false],
  ["Men's Health & Vitality", "Men's Health", true],
  ["Respiratory Diseases — Asthma & Chronic Cough", "Respiratory Health", false],
  ["Skin Diseases — Eczema, Psoriasis & Acne", "Skin Diseases", false],
  ["Weight Management & Metabolism", "Weight Management", false],
  ["Women's Health & Hormonal Balance", "Women's Health", true],
].map(([title, category, home], i) => ({ id: i + 1, title, category, live: true, home }));

export default function Treatments() {
  return (
    <CategoryList
      heading="Treatments"
      singular="treatment"
      nameLabel="Title"
      catPlaceholder="New category name (e.g. Digestive Health)..."
      categories={initialCategories}
      items={initialItems}
    />
  );
}
