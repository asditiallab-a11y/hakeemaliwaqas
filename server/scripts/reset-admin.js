// Password bhool gaye? .env mein ADMIN_USERNAME / ADMIN_PASSWORD naya likho aur chalao:  npm run reset-admin
import "dotenv/config";
import { connectDB, mongoose } from "../db.js";
import Admin from "../models/Admin.js";
import { hashPassword } from "../auth.js";

const username = (process.env.ADMIN_USERNAME || "").toLowerCase().trim();
const password = process.env.ADMIN_PASSWORD || "";
if (!/^[a-zA-Z0-9._-]{3,40}$/.test(username) || password.length < 8) {
  console.error("ADMIN_USERNAME (3+ chars) aur ADMIN_PASSWORD (8+ chars) .env mein set karo");
  process.exit(1);
}
await connectDB();
const passwordHash = await hashPassword(password);
// Purane saare admin hata kar yehi ek admin rakhta hai, aur purane logins invalid ho jate hain
await Admin.deleteMany({ username: { $ne: username } });
await Admin.findOneAndUpdate({ username }, { $set: { passwordHash }, $inc: { tokenVersion: 1 } }, { upsert: true });
console.log(`[admin] "${username}" ka password set ho gaya. Ab .env se ADMIN_PASSWORD hata sakte ho.`);
await mongoose.disconnect();
