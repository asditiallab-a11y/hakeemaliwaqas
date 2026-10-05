import CategoryList from "../components/CategoryList.jsx";

// Add/Edit form: English + Urdu tab, rich description, categories (kai), image, YouTube video, Home/Website toggles
const form = {
  fields: [
    { type: "text", key: "title", ur: "titleUr", label: "Title", labelUr: "عنوان (اردو)", required: true, placeholderUr: "یہاں اردو عنوان لکھیں..." },
    { type: "rich", key: "description", ur: "descriptionUr", label: "Description", labelUr: "تفصیل (اردو)", required: true,
      placeholder: "Describe this treatment in detail...", placeholderUr: "اردو میں تفصیل لکھیں...", hintUr: "اردو متن دائیں سے بائیں لکھا جائے گا۔" },
    { type: "categories" },
    { type: "image", key: "image", label: "Treatment Image", size: "800×600px recommended" },
    { type: "video", key: "videoUrl" },
  ],
};

// Data MongoDB se aata hai (server/routes/admin.js -> /api/admin/treatments)
export default function Treatments() {
  return (
    <CategoryList
      resource="treatments"
      heading="Treatments"
      singular="treatment"
      nameLabel="Title"
      catPlaceholder="New category name (e.g. Digestive Health)..."
      categories={[]}
      form={form}
    />
  );
}
