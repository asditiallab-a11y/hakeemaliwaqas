import mongoose from "mongoose";

// Admin panel ke content collections (treatments, medicines, articles, testimonials) + appointments + orders.
// Dashboard inhi collections se counts nikalta hai.
const make = (name, fields) => {
  const schema = new mongoose.Schema(
    {
      title: { type: String, required: true, trim: true, maxlength: 300 },
      live: { type: Boolean, default: true, index: true },
      home: { type: Boolean, default: false },
      sortOrder: { type: Number, default: 0 },
      ...fields,
    },
    { timestamps: true }
  );
  return mongoose.models[name] || mongoose.model(name, schema);
};

// Treatments / Medicines / Articles / Testimonials. Description, benefits wagaira rich editor ka HTML hain (save se pehle server sanitize karta hai).
// `category` purane records ke liye hai; naye records `categories` (multiple) use karte hain.
const specRow = new mongoose.Schema({ k: { type: String, trim: true, maxlength: 200 }, v: { type: String, trim: true, maxlength: 400 } }, { _id: false });

export const Treatment = make("Treatment", {
  category: { type: String, trim: true },
  categories: { type: [String], default: [] },
  titleUr: { type: String, trim: true, maxlength: 300 },
  description: { type: String, maxlength: 100000 },
  descriptionUr: { type: String, maxlength: 100000 },
  image: { type: String, maxlength: 300 },
  videoUrl: { type: String, trim: true, maxlength: 300 },
});

export const Medicine = make("Medicine", {
  category: { type: String, trim: true },
  categories: { type: [String], default: [] },
  titleUr: { type: String, trim: true, maxlength: 300 },
  description: { type: String, maxlength: 100000 },
  descriptionUr: { type: String, maxlength: 100000 },
  benefits: { type: String, maxlength: 50000 },
  benefitsUr: { type: String, maxlength: 50000 },
  usage: { type: String, maxlength: 50000 },
  usageUr: { type: String, maxlength: 50000 },
  image: { type: String, maxlength: 300 },
  videoUrl: { type: String, trim: true, maxlength: 300 },
  brochure: { type: String, maxlength: 300 }, // PDF
  specs: { type: [specRow], default: [] },
  specsUr: { type: [specRow], default: [] },
  specsHero: { type: [specRow], default: [] },
  price: { type: Number, min: 0, max: 10000000 },
  oldPrice: { type: Number, min: 0, max: 10000000 }, // purani (cut) price, sirf price se bari ho to strikethrough dikhti hai
  gallery: { type: [String], default: [] }, // max 5 images
});

export const Article = make("Article", {
  date: { type: String, match: /^\d{4}-\d{2}-\d{2}$/, default: () => new Date().toISOString().slice(0, 10) }, // YYYY-MM-DD
  titleUr: { type: String, trim: true, maxlength: 300 },
  excerpt: { type: String, trim: true, maxlength: 600 },
  excerptUr: { type: String, trim: true, maxlength: 600 },
  content: { type: String, maxlength: 150000 },
  contentUr: { type: String, maxlength: 150000 },
  image: { type: String, maxlength: 300 },
});

export const Testimonial = make("Testimonial", {
  rating: { type: Number, min: 1, max: 5, default: 5 },
  text: { type: String, trim: true, maxlength: 6000 }, // rich editor ka HTML (ya purana plain text)
});

const appointmentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 160 },
    phone: { type: String, required: true, trim: true, maxlength: 30 },
    date: { type: String, trim: true, maxlength: 10 }, // YYYY-MM-DD (patient ki pasandeeda date)
    message: { type: String, trim: true, maxlength: 2000 },
    status: { type: String, enum: ["pending", "confirmed", "completed", "cancelled"], default: "pending", index: true },
  },
  { timestamps: true }
);
export const Appointment = mongoose.models.Appointment || mongoose.model("Appointment", appointmentSchema);

const orderSchema = new mongoose.Schema(
  {
    medicine: { type: String, required: true, trim: true, maxlength: 200 },
    customer: { type: String, required: true, trim: true, maxlength: 120 },
    phone: { type: String, required: true, trim: true, maxlength: 30 },
    city: { type: String, trim: true, maxlength: 80 },
    qty: { type: Number, min: 1, default: 1 },
    orderNo: { type: Number, index: true }, // admin panel ka "#" (1, 2, 3...)
    status: { type: String, enum: ["pending", "confirmed", "shipped", "delivered", "cancelled"], default: "pending", index: true },
  },
  { timestamps: true }
);
// naye order ko agla number mil jata hai
orderSchema.pre("validate", async function () {
  if (this.isNew && this.orderNo == null) {
    const last = await this.constructor.findOne({ orderNo: { $ne: null } }).sort({ orderNo: -1 }).select("orderNo");
    this.orderNo = (last?.orderNo ?? 0) + 1;
  }
});
export const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);

// Review Videos page (patient ke YouTube review videos). Title optional hai, is liye `make()` use nahi kiya.
const reviewVideoSchema = new mongoose.Schema(
  {
    url: { type: String, required: true, trim: true, maxlength: 500 },
    name: { type: String, trim: true, maxlength: 200 },
    title: { type: String, trim: true, maxlength: 300 },
    live: { type: Boolean, default: true, index: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);
export const ReviewVideo = mongoose.models.ReviewVideo || mongoose.model("ReviewVideo", reviewVideoSchema);

// Videos page: long + short YouTube videos
const videoSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ["long", "short"], required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 400 },
    url: { type: String, trim: true, maxlength: 500, default: "" }, // purani videos ka link khali ho sakta hai, admin Edit se daalta hai
    description: { type: String, trim: true, maxlength: 2000, default: "" },
    published: { type: Boolean, default: true, index: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);
export const Video = mongoose.models.Video || mongoose.model("Video", videoSchema);

// Chhoti site settings (key -> value). Abhi: videoSliderHome. Settings page isi ko use kar sakta hai.
const settingSchema = new mongoose.Schema({ key: { type: String, required: true, unique: true }, value: mongoose.Schema.Types.Mixed });
export const Setting = mongoose.models.Setting || mongoose.model("Setting", settingSchema);

// Pages screen (Home, About, Treatments, Medicines, Blog): har tab ek document, data = { fieldKey: "value" }
const pageSchema = new mongoose.Schema(
  { key: { type: String, required: true, unique: true }, data: { type: mongoose.Schema.Types.Mixed, default: {} } },
  { timestamps: true, minimize: false }
);
export const PageContent = mongoose.models.PageContent || mongoose.model("PageContent", pageSchema);
