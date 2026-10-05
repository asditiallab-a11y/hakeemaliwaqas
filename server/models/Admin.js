import mongoose from "mongoose";

// Admin panel ke login users. Password kabhi plain save nahi hota - sirf scrypt hash.
const adminSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, lowercase: true, trim: true, minlength: 3, maxlength: 40 },
    passwordHash: { type: String, required: true },
    // password badalne par +1 hota hai -> purane saare login (har device) khud invalid ho jate hain
    tokenVersion: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.models.Admin || mongoose.model("Admin", adminSchema);
