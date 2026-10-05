import CategoryList from "../components/CategoryList.jsx";

// Add/Edit form: English + Urdu tab, excerpt, rich content, image, Home/Website toggles
const form = {
  fields: [
    { type: "text", key: "title", ur: "titleUr", label: "Title", labelUr: "عنوان (اردو)", required: true, placeholderUr: "یہاں اردو عنوان لکھیں..." },
    { type: "textarea", key: "excerpt", ur: "excerptUr", label: "Excerpt", labelUr: "خلاصہ (اردو)", required: true, max: 600, placeholderUr: "مختصر خلاصہ لکھیں..." },
    { type: "rich", key: "content", ur: "contentUr", label: "Content", labelUr: "مضمون (اردو)", required: true, minHeight: 220,
      placeholder: "Write the article content here...", placeholderUr: "اردو میں مضمون لکھیں...", hintUr: "اردو متن دائیں سے بائیں لکھا جائے گا۔" },
    { type: "image", key: "image", label: "Article Image", size: "800×600px recommended" },
  ],
};

// Data MongoDB se aata hai (server/routes/admin.js -> /api/admin/articles)
export default function Articles() {
  return <CategoryList resource="articles" heading="Health Articles" singular="article" nameLabel="Title" form={form} />;
}
