import mongoose from "mongoose";

// Form ke sawal badalte rehte hain (schema.js), isliye jawab flexible `answers` object mein save hote hain.
// Jo cheezein dhoondne/dikhane ke liye aksar chahiye wo alag fields mein bhi rakhi hain.
const consultationSchema = new mongoose.Schema(
  {
    patientType: { type: String, enum: ["men", "women", "children"], required: true, index: true },
    fullName: { type: String, required: true, trim: true, maxlength: 120 },
    fatherName: { type: String, trim: true, maxlength: 120 },
    age: { type: Number, required: true, min: 0, max: 120 },
    phone: { type: String, required: true, trim: true, maxlength: 30 },
    email: { type: String, trim: true, lowercase: true, maxlength: 160 },
    city: { type: String, trim: true, maxlength: 80 },
    country: { type: String, trim: true, maxlength: 80 },
    address: { type: String, trim: true, maxlength: 500 },
    medicineBudget: { type: String, trim: true, maxlength: 40 },
    language: { type: String, enum: ["en", "ur"], default: "en" },
    answers: { type: mongoose.Schema.Types.Mixed, default: {} }, // poora form (health/detail sawal)
    report: {
      originalName: String,
      storedName: String, // server/uploads/ mein file ka naam
      size: Number,
    },
    // admin panel: new / in_progress / completed  (contacted, closed purani values hain, API unhein in_progress / completed dikhati hai)
    status: { type: String, enum: ["new", "in_progress", "completed", "contacted", "closed"], default: "new", index: true },
  },
  { timestamps: true }
);

export default mongoose.models.Consultation || mongoose.model("Consultation", consultationSchema);
