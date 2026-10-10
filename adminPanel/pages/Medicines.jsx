import CategoryList from "../components/CategoryList.jsx";
import MedicineExtras from "../components/MedicineExtras.jsx";

// Add/Edit form. Edit mein neeche Brochure PDF, Specifications (English/Urdu/Hero) aur Price ke alag save buttons aate hain.
const form = {
  fields: [
    { type: "text", key: "title", ur: "titleUr", label: "Name", labelUr: "نام (اردو)", required: true, placeholderUr: "یہاں اردو نام لکھیں..." },
    { type: "rich", key: "description", ur: "descriptionUr", label: "Description", labelUr: "تفصیل (اردو)", required: true,
      placeholder: "Describe this medicine...", placeholderUr: "اردو میں تفصیل لکھیں..." },
    { type: "rich", key: "benefits", ur: "benefitsUr", label: "Benefits", labelUr: "فوائد (اردو)", required: true,
      placeholder: "List the benefits...", placeholderUr: "فوائد لکھیں..." },
    { type: "rich", key: "usage", ur: "usageUr", label: "Usage / Dosage", labelUr: "استعمال (اردو)", required: true,
      placeholder: "How to use, dosage...", placeholderUr: "استعمال کا طریقہ لکھیں...", hintUr: "اردو متن دائیں سے بائیں لکھا جائے گا۔" },
    { type: "categories" },
    { type: "image", key: "image", label: "Medicine Image", size: "1920×1080px recommended" },
    { type: "video", key: "videoUrl" },
  ],
  extras: MedicineExtras,
};

// Data MongoDB se aata hai (server/routes/admin.js -> /api/admin/medicines)
export default function Medicines() {
  return (
    <CategoryList
      resource="medicines"
      heading="Herbal Medicines"
      singular="medicine"
      nameLabel="Name"
      catPlaceholder="New category name (e.g. Digestive Tonics)..."
      categories={[]}
      gallery
      form={form}
    />
  );
}