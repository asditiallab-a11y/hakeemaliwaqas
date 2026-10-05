import mongoose from "mongoose";

// Treatments / Medicines wagaira ki categories (ek hi collection, `type` se alag)
const categorySchema = new mongoose.Schema(
  {
    type: { type: String, enum: ["treatment", "medicine"], required: true },
    name: { type: String, required: true, trim: true, maxlength: 80 },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);
// ek type mein same naam dobara nahi (capital/small ka farq nahi)
categorySchema.index({ type: 1, name: 1 }, { unique: true, collation: { locale: "en", strength: 2 } });

export default mongoose.models.Category || mongoose.model("Category", categorySchema);
