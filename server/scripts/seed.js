// Pehli dafa admin panel ka maujooda (static) data DB mein daalta hai:  npm run seed
// Sirf unhi collections mein daalta hai jo abhi khali hon, isliye dobara chalane se duplicate nahi banta.
import "dotenv/config";
import { connectDB, mongoose } from "../db.js";
import Category from "../models/Category.js";
import { Treatment, Medicine, Article, Testimonial, Appointment, ReviewVideo, Video } from "../models/content.js";

const treatments = [
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
].map(([title, category, home], i) => ({ title, category, home, sortOrder: i }));

const medicines = [
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
].map(([title, category, home], i) => ({ title, category, home, sortOrder: i }));

const articles = [
  ["7 Proven Health Benefits of Kalonji (Black Seed)", "2026-04-10", true],
  ["Amazing Benefits of Ashwagandha in Unani Medicine", "2026-05-10", true],
  ["Can't Sleep? 6 Natural Herbal Remedies That Actually Work", "2026-04-30", false],
  ["Clear Skin Naturally: Unani Approach to Skin Health", "2026-05-10", false],
  ["Colon Cleansing the Unani Way", "2026-05-10", false],
  ["Giloy: The Herb That Boosts Immunity", "2026-05-10", false],
  ["Golden Milk: The Ancient Healing Drink Backed by Science", "2026-04-15", true],
  ["Honey in Unani Medicine: Liquid Gold for Health", "2026-05-10", false],
  ["Ispaghol: Natural Fiber for Better Digestion", "2026-05-08", false],
  ["Natural Ways to Manage High Blood Pressure", "2026-05-06", false],
  ["Shilajit: Nature's Energy Booster", "2026-05-04", false],
  ["Tulsi: The Queen of Herbs", "2026-05-02", false],
  ["Turmeric vs Curcumin: What You Should Know", "2026-04-28", false],
].map(([title, date, home], i) => ({ title, date, home, sortOrder: i }));

const testimonials = [
  ["Amna Bibi — Karachi", true, "میرے بچے کو بار بار سانس کی تکلیف اور کھانسی ہوتی تھی، ہم نے حکیم صاحب سے علاج شروع کیا اور اب بہت افاقہ ہے۔"],
  ["Asif Mehmood — Hyderabad", false, "My son had recurrent tonsillitis — 5 to 6 episodes per year. After the treatment he has had none for months."],
  ["Dr. Imran Qureshi — Peshawar", true, "As a medical doctor myself, I was initially sceptical. But the results spoke for themselves."],
  ["Farhan Siddiqui — Islamabad", true, "I came with severe joint pain in both knees — osteoarthritis. Within weeks I could walk comfortably again."],
  ["Hina Perveen — Quetta", true, "میں بہت تھکی رہتی تھی، بال جھڑتے تھے اور سردیوں میں سستی بہت رہتی تھی۔ اب طبیعت بہتر ہے۔"],
  ["Kamran Bashir — Gujranwala", false, "Chronic constipation for 15 years. Tried every laxative. Hakeem sahib's treatment finally worked."],
  ["Muhammad Tariq — Lahore", true, "I had been diabetic for 9 years and was on two medications. My sugar levels are now well controlled."],
  ["Nadia Hussain — Sialkot", false, "ایگزیما کی وجہ سے میرے ہاتھ ہمیشہ سرخ اور کھردرے رہتے تھے۔ اب جلد صاف ہو گئی ہے۔"],
  ["Rashid Ali — Multan", false, "Very professional and caring. The herbal treatment improved my digestion a lot."],
  ["Sana Malik — Faisalabad", false, "I was struggling with skin problems for years. Thankful for the guidance and the medicines."],
  ["Tahir Mehmood — Rawalpindi", false, "Excellent consultation and follow-up. My blood pressure is now normal without side effects."],
  ["Zainab Fatima — Lahore", false, "Highly recommended. Simple diet advice and medicines that really work."],
].map(([title, home, text], i) => ({ title, home, text, rating: 5, sortOrder: i }));

const appointments = [
  { name: "Ata ur Rehman", email: "atatepu31@gmail.com", phone: "+923004968276", date: "2026-06-02", status: "pending",
    message: "Hakeem sahib hmein bhi time dan plz, Bohat preshani bni hui hai" },
  { name: "Muhammad Usama", email: "musama996758@gmail.com", phone: "03266607428", date: "2026-07-17", status: "pending",
    message: "Hakeem sab qatro or kasrt e ehtlam or erectile dysfunction mardana kamzori nafs ma dhelapan ka masla ha har jaga se medicine ly chuka lekin koi far..." },
];

const D = "Prof. Hakeem Ali Waqas | پروفیسر حکیم علی وقاص خاندانی سنیاسی | Desi Shadi Course | 00923015959598 | 00923111033392";
const mkVideos = (type, rows) =>
  rows.map(([title, description = D, url = ""]) => ({ type, title, description, url, published: true }));

// Sirf pehli video ka link maloom tha, baaki ke links admin panel se Edit karke daal dena.
const videos = [
  ...mkVideos("long", [
    ["Complete Maha Ras (Hera,Paara,Sona) Ke Sanyasi Kakh | مہارس(ہیرے،پارے،سونے) کے سنیاسی ککھ Guide to Diabetes Treatment with Herbal Medicine | Hakeem Ali Waqas",
      "Complete Maha Ras (Hera,Paara,Sona) Ke Sanyasi Kakh | مہارس(ہیرے،پارے،سونے) کے سنیاسی ککھ Guide to Diabetes Treatment with Herbal Medicine | Hakeem Ali Waqas | 00923111033392 |",
      "https://youtu.be/ibwS6ucuAV0"],
    ["Mashoor-e-Zamana Khandani Hakeem Prof. Hakeem Ali Waqas", "Hikmat ke Badshah | | 00923015959598 پروفیسر حکیم علی وقاص خاندانی سنیاسی 00923111033392"],
    ["Sanyasi Ras, Kushta Jaat, Tilla & Special Shadi Course"],
    ["Emotional Interview with Anchor and Hakeem Sahab! Heartfelt Reactions from Patients"],
    ["Zinda Sheron Walay Hakeem ka Interview | Lahore Me Aisa Hakeem Jo Sher Ki Charbi Se Ilaj Karta Hai"],
    ["Majoon Shadi Course | معجون شادی کورس"],
    ["How to Prepare Kam Dev Ras | کام دیو رس بنانے کا طریقہ", "Kam Dev Ras Banane ka Tariqa | کام دیو رس بنانے کا طریقہ | काम देव रस तैयारी की विधि | 00923111033392 | 00923015959598"],
    ["Chandaroday Ras Kastori Heeray Wala - Live Banta Dekhain - چندراودے رس کستوری ہیرے والا", "Chandaroday Ras Kastori Heeray Wala | | چندراودے رس کستوری ہیرے والا | 00923015959598 | 00923111033392"],
  ]),
  ...mkVideos("short", [
    ["Marz Ki Tashkhees 9 | Professor Hakeem Ali Waqas"],
    ["Kam Dev Ras | Heray Ke Kakh | Professor Hakeem Ali Waqas"],
    ["Enlarge Prostate Free Medicine 3 | Professor Hakeem Ali Waqas"],
    ["Jalaq ke Nuqsan 4 | Professor Hakeem Ali Waqas"],
    ["Marz Ki Tashkhees 8 | Professor Hakeem Ali Waqas"],
    ["Heray Or Sone ke kakh | Professor Hakeem Ali Waqas"],
    ["Majoon Shadi course | Professor Hakeem Ali Waqas"],
    ["Majoon Shadi course | Professor Hakeem Ali Waqas"],
  ]),
];
videos.forEach((v, i) => (v.sortOrder = i));

const reviewVideos = [
  ["M Hafeez", "https://youtube.com/shorts/53rV7CXvzeE?feature=share", "Stomach Ulcer Treatment ! معدے کے السر کا علاج"],
  ["Female Patient From Narang Mandi", "https://youtube.com/shorts/u8VM7xsPUOA", ""],
  ["Malik Sultan Car Driver", "https://youtube.com/shorts/ZyF62IIjqr8?feature=share", ""],
  ["Arif From Feroze Wattwan", "https://youtube.com/shorts/UH8fAj8ZdgA?feature=share", ""],
  ["Attique Ahmad", "https://youtube.com/shorts/znjIplqox98", ""],
].map(([name, url, title], i) => ({ name, url, title, sortOrder: i }));

await connectDB();
for (const [M, docs] of [[Treatment, treatments], [Medicine, medicines], [Article, articles], [Testimonial, testimonials], [Appointment, appointments], [ReviewVideo, reviewVideos], [Video, videos]]) {
  if ((await M.countDocuments()) > 0) {
    console.log(`[seed] ${M.modelName}: pehle se data hai, chhor diya`);
    continue;
  }
  await M.insertMany(docs);
  console.log(`[seed] ${M.modelName}: ${docs.length} records daale`);
}
const categories = {
  treatment: ["Digestive Health", "Diabetes & Blood Sugar", "Blood Pressure & Heart", "Skin Diseases", "Joint & Bone Pain",
    "Respiratory Health", "Weight Management", "Men's Health", "Women's Health", "Liver & Kidney"],
  medicine: ["Seeds & Grains", "Roots & Bark", "Leaves & Herbs", "Fruits & Berries", "Oils & Extracts", "Compound Formulas", "Kushta jaat", "Courses"],
};
for (const [type, names] of Object.entries(categories)) {
  if ((await Category.countDocuments({ type })) > 0) {
    console.log(`[seed] Category (${type}): pehle se data hai, chhor diya`);
    continue;
  }
  await Category.insertMany(names.map((name, i) => ({ type, name, sortOrder: i })));
  console.log(`[seed] Category (${type}): ${names.length} records daale`);
}
await mongoose.disconnect();
