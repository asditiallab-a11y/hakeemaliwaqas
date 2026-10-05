// Consultation form ka poora structure + English/Urdu text yahin hai.
// Naya sawal add karna ho to bas neeche field add kar do - UI khud ban jati hai.
//
// Field types: select | text | textarea | tel | email | date | number | chips | multi
//  - chips  : ek option select hota hai (dobara click = unselect)
//  - multi  : kai options select ho sakte hain ("none" exclusive hai)
//  - other:true : neeche "Other, please specify" box aata hai (data[name + "_other"])

const o = (value, en, ur) => ({ value, en, ur });

const YES_NO = [o("yes", "Yes", "جی ہاں"), o("no", "No", "نہیں")];
const YES_NO_SOME = [...YES_NO, o("sometimes", "Sometimes", "کبھی کبھی")];
const GOOD_AVG_POOR = [o("good", "Good", "اچھا"), o("average", "Average", "درمیانہ"), o("poor", "Poor", "کمزور")];
const NONE = o("none", "None", "کوئی نہیں");

const chips = (name, en, ur, options, extra = {}) => ({ name, type: "chips", label: { en, ur }, options, other: true, ...extra });
const multi = (name, en, ur, options, extra = {}) => ({ name, type: "multi", label: { en, ur }, options, other: true, ...extra });
const select = (name, en, ur, options, extra = {}) => ({ name, type: "select", label: { en, ur }, options, ...extra });
const input = (name, type, en, ur, extra = {}) => ({ name, type, label: { en, ur }, ...extra });

// ---------- Step 1 : Basic Info ----------
export const PATIENT_TYPES = [o("men", "Men", "مرد"), o("women", "Women", "خواتین"), o("children", "Children", "بچے")];

const basicFields = [
  select("patientType", "Patient Type", "مریض کی قسم", PATIENT_TYPES, { required: true }),
  input("fullName", "text", "Full Name", "پورا نام", { required: true, placeholder: { en: "Enter your full name", ur: "اپنا پورا نام لکھیں" } }),
  input("fatherName", "text", "Father's Name", "والد کا نام", { placeholder: { en: "Enter father's name", ur: "والد کا نام لکھیں" } }),
  input("age", "number", "Age (Years)", "عمر (سال)", { required: true, placeholder: { en: "In years", ur: "سال میں" }, min: 0, max: 120 }),
  input("phone", "tel", "Phone Number", "فون نمبر", { required: true, placeholder: { en: "03XXXXXXXXX", ur: "03XXXXXXXXX" } }),
  input("email", "email", "Email", "ای میل", { placeholder: { en: "example@email.com", ur: "example@email.com" } }),
  input("city", "text", "City", "شہر", { placeholder: { en: "Enter city name", ur: "شہر کا نام لکھیں" } }),
  input("country", "text", "Country", "ملک", { placeholder: { en: "Enter country", ur: "ملک کا نام لکھیں" } }),
  input("occupation", "text", "Occupation", "پیشہ", { placeholder: { en: "Enter occupation", ur: "اپنا پیشہ لکھیں" } }),
  input("date", "date", "Date", "تاریخ"),
];

// ---------- Step 2 : Health Overview ----------
const healthOverview = {
  icon: "🩺",
  title: { en: "Health Overview", ur: "صحت کا جائزہ" },
  fields: [
    chips("bodyType", "Body Type", "جسمانی ساخت", [o("thin", "Thin", "دبلا"), o("average", "Average", "درمیانہ"), o("overweight", "Overweight", "موٹاپا")]),
    chips("height", "Height", "قد", [o("short", "Short", "چھوٹا"), o("normal", "Normal", "درمیانہ"), o("tall", "Tall", "لمبا")]),
    chips("workType", "Work Type", "کام کی نوعیت", [o("physical", "Physical", "جسمانی"), o("mental", "Mental", "ذہنی")]),
    multi("commonIssues", "Common Issues", "عام مسائل", [
      o("cold", "Common Cold", "نزلہ زکام"), o("cough", "Cough", "کھانسی"), o("headache", "Headache", "سر درد"),
      o("weakness", "Weakness/Fatigue", "کمزوری/تھکاوٹ"), o("diabetes", "Diabetes", "شوگر"),
      o("cholesterol", "High Cholesterol", "کولیسٹرول"), o("uric", "Uric Acid", "یورک ایسڈ"), NONE,
    ]),
    chips("sleepHours", "Sleep Hours", "نیند کے گھنٹے", [o("4-6", "4-6 Hours", "4-6 گھنٹے"), o("6-8", "6-8 Hours", "6-8 گھنٹے"), o("8-10", "8-10 Hours", "8-10 گھنٹے")]),
    multi("habits", "Habits", "عادات", [o("tea", "Tea", "چائے"), o("coffee", "Coffee", "کافی"), o("cigarette", "Cigarette", "سگریٹ"), o("naswar", "Naswar", "نسوار"), o("all", "All", "سب"), NONE]),
    chips("appetite", "Appetite", "بھوک", YES_NO),
    chips("acidity", "Acidity", "تیزابیت", YES_NO_SOME),
    chips("fastFood", "Fast Food", "فاسٹ فوڈ", [o("often", "Yes, Often", "جی، اکثر"), o("no", "No", "نہیں"), o("sometimes", "Sometimes", "کبھی کبھی")]),
    chips("mentalStress", "Mental Stress", "ذہنی دباؤ", [o("yes", "Yes", "جی ہاں"), o("no", "No", "نہیں"), o("somewhat", "Somewhat", "کچھ حد تک")]),
    chips("fainting", "Fainting or Dizziness", "چکر یا بے ہوشی", YES_NO),
    chips("irregularHeartbeat", "Irregular Heartbeat", "دل کی بے قاعدہ دھڑکن", YES_NO),
    chips("breathingIssues", "Breathing Issues", "سانس کے مسائل", YES_NO),
    chips("burpingIssues", "Burping Issues", "ڈکار کے مسائل", YES_NO),
  ],
};

const mentalPhysical = {
  icon: "🧠",
  title: { en: "Mental & Physical", ur: "ذہنی اور جسمانی" },
  fields: [
    select("memory", "Memory", "یادداشت", GOOD_AVG_POOR),
    select("eyesight", "Eyesight", "بینائی", GOOD_AVG_POOR),
    select("sleepQuality", "Sleep Quality", "نیند کا معیار", GOOD_AVG_POOR),
    select("bloodPressure", "Blood Pressure", "بلڈ پریشر", [o("normal", "Normal", "نارمل"), o("high", "High", "ہائی"), o("low", "Low", "لو")]),
    select("temperament", "Temperament", "مزاج", [o("cold", "Cold", "سرد"), o("warm", "Warm", "گرم"), o("phlegmatic", "Phlegmatic", "بلغمی"), o("bilious", "Bilious", "صفراوی"), o("unknown", "Unknown", "معلوم نہیں")]),
  ],
};

// ---------- Step 3 : Detailed Info (patient type ke hisaab se) ----------
const familyHistory = multi("familyHistory", "Family history", "خاندانی تاریخ", [
  o("urinary", "Urinary issues", "پیشاب کے مسائل"), o("surgery", "Surgery", "آپریشن"), o("hereditary", "Hereditary disease", "موروثی بیماری"), NONE,
]);

const menDetails = {
  icon: "♂️",
  title: { en: "Men's Details", ur: "مردانہ تفصیلات" },
  fields: [
    chips("marriedLife", "Satisfied with married life", "ازدواجی زندگی سے مطمئن", [o("yes", "Yes", "جی ہاں"), o("no", "No", "نہیں"), o("somewhat", "Somewhat", "کچھ حد تک")]),
    input("marriageDuration", "text", "Duration of marriage", "شادی کی مدت", { placeholder: { en: "e.g. 5 years", ur: "مثلاً 5 سال" } }),
    multi("organIssues", "Male organ issues", "مردانہ عضو کے مسائل", [o("curvature", "Curvature", "ٹیڑھا پن"), o("small", "Small size", "چھوٹا سائز"), o("weakness", "Weakness", "کمزوری"), NONE]),
    chips("strengthQuality", "Sexual strength quality", "جنسی طاقت کا معیار", [o("very_good", "Very Good", "بہت اچھی"), o("good", "Good", "اچھی"), o("average", "Average", "درمیانی"), o("poor", "Poor", "کمزور"), o("none", "None at all", "بالکل نہیں")]),
    chips("coldWaterShrink", "Shrinking in cold water", "ٹھنڈے پانی میں سکڑنا", YES_NO),
    select("semenQuality", "Semen quality", "مادہ منویہ کا معیار", [o("thick", "Thick", "گاڑھا"), o("normal", "Normal", "نارمل"), o("watery", "Watery", "پتلا")]),
    multi("maleComplaints", "Male complaints", "مردانہ شکایات", [o("wet_dreams", "Wet dreams", "احتلام"), o("frigidity", "Sexual frigidity", "جنسی سردمہری"), NONE]),
    chips("musclePain", "Organ/muscle pain", "عضو/پٹھوں کا درد", YES_NO_SOME),
    chips("backPain", "Back pain", "کمر درد", YES_NO_SOME),
    chips("prematureEjac", "Premature ejaculation", "سرعتِ انزال", YES_NO_SOME),
    input("wetDreamFreq", "text", "Wet dream frequency", "احتلام کی تعداد", { placeholder: { en: "Describe in detail", ur: "تفصیل سے بتائیں" } }),
    multi("dropsAfterUrine", "Drops after urination", "پیشاب کے بعد قطرے", [o("semen", "Semen drops", "منی کے قطرے"), o("pre", "Pre-ejaculate drops", "مذی کے قطرے"), o("urine", "Urine drops", "پیشاب کے قطرے"), NONE]),
    chips("discharge", "Discharge from organ", "عضو سے رطوبت", YES_NO),
    chips("continuousWetDreams", "Continuous wet dreams", "مسلسل احتلام", YES_NO),
    chips("masturbation", "Masturbation habit", "مشت زنی کی عادت", YES_NO),
    chips("syphilis", "Syphilis", "آتشک", YES_NO),
    chips("gonorrhea", "Gonorrhea", "سوزاک", YES_NO),
    input("urinationFreq", "text", "Urination frequency", "پیشاب کی تعداد", { placeholder: { en: "Describe in detail", ur: "تفصیل سے بتائیں" } }),
    input("urinationAmount", "text", "Urination amount", "پیشاب کی مقدار", { placeholder: { en: "Describe in detail", ur: "تفصیل سے بتائیں" } }),
    familyHistory,
  ],
};

// NOTE: video mein sirf Men wala step dikh raha tha. Women/Children ke sawal yahan apni taraf se
// rakhe hain - Hakeem sahab ke hisaab se add/remove kar lena.
const womenDetails = {
  icon: "♀️",
  title: { en: "Women's Details", ur: "خواتین کی تفصیلات" },
  fields: [
    chips("married", "Married", "شادی شدہ", YES_NO),
    input("childrenCount", "text", "Number of children", "بچوں کی تعداد", { placeholder: { en: "e.g. 2", ur: "مثلاً 2" } }),
    chips("menstrualCycle", "Menstrual cycle", "ماہواری", [o("regular", "Regular", "باقاعدہ"), o("irregular", "Irregular", "بے قاعدہ")]),
    chips("periodPain", "Pain during periods", "ماہواری کے دوران درد", YES_NO_SOME),
    chips("whiteDischarge", "White discharge", "لیکوریا / سفید پانی", YES_NO_SOME),
    chips("backPain", "Back pain", "کمر درد", YES_NO_SOME),
    chips("pregnancy", "Currently pregnant / nursing", "حمل / دودھ پلانا", YES_NO),
    input("urinationFreq", "text", "Urination frequency", "پیشاب کی تعداد", { placeholder: { en: "Describe in detail", ur: "تفصیل سے بتائیں" } }),
    familyHistory,
  ],
};

const childrenDetails = {
  icon: "🧒",
  title: { en: "Children's Details", ur: "بچوں کی تفصیلات" },
  fields: [
    chips("weightGain", "Weight gain / growth", "وزن / نشوونما", GOOD_AVG_POOR),
    chips("bedWetting", "Bed wetting", "بستر گیلا کرنا", YES_NO_SOME),
    chips("frequentIllness", "Frequent illness", "بار بار بیمار ہونا", YES_NO_SOME),
    chips("vaccination", "Vaccination", "حفاظتی ٹیکے", [o("complete", "Complete", "مکمل"), o("partial", "Partial", "جزوی"), o("none", "None", "نہیں لگے")]),
    chips("stomachIssues", "Stomach issues / worms", "پیٹ کے مسائل / کیڑے", YES_NO_SOME),
    familyHistory,
  ],
};

export const DETAIL_SECTIONS = { men: menDetails, women: womenDetails, children: childrenDetails };

// ---------- Step 4 : Review & Submit ----------
export const SUMMARY_FIELDS = ["patientType", "fullName", "fatherName", "age", "phone", "city"];

export const STEPS = [
  { key: "basic", title: { en: "Basic Info", ur: "بنیادی معلومات" } },
  { key: "health", title: { en: "Health Overview", ur: "صحت کا جائزہ" } },
  { key: "detail", title: { en: "Detailed Info", ur: "تفصیلی معلومات" } },
  { key: "review", title: { en: "Review & Submit", ur: "جائزہ اور جمع کرائیں" } },
];

export function sectionsForStep(stepIndex, patientType) {
  if (stepIndex === 1) return [healthOverview, mentalPhysical];
  if (stepIndex === 2) return [DETAIL_SECTIONS[patientType] || menDetails];
  return [];
}

export { basicFields };

// ---------- UI text ----------
export const UI = {
  title: { en: "Consultation Form", ur: "مشاورتی فارم" },
  chooseLang: { en: "Choose Your Language", ur: "اپنی زبان منتخب کریں" },
  chooseLangSub: { en: "اپنی زبان منتخب کریں", ur: "Choose your language" },
  fillEnglish: { en: "Fill in English", ur: "Fill in English" },
  fillUrdu: { en: "اردو میں پُر کریں", ur: "اردو میں پُر کریں" },
  next: { en: "Next →", ur: "← آگے" },
  back: { en: "Back", ur: "پیچھے" },
  submit: { en: "Submit", ur: "جمع کرائیں" },
  submitting: { en: "Submitting…", ur: "جمع ہو رہا ہے…" },
  other: { en: "Other, please specify... (optional)", ur: "دیگر، براہ کرم لکھیں... (اختیاری)" },
  choose: { en: "—", ur: "—" },
  required: { en: "This field is required", ur: "یہ خانہ ضروری ہے" },
  badPhone: { en: "Enter a valid phone number", ur: "درست فون نمبر لکھیں" },
  badAge: { en: "Enter a valid age (0 - 120)", ur: "درست عمر لکھیں (0 تا 120)" },
  badField: { en: "Please check this field", ur: "براہ کرم اس خانے کو چیک کریں" },
  badEmail: { en: "Enter a valid email", ur: "درست ای میل لکھیں" },
  summary: { en: "Summary of Your Information", ur: "آپ کی معلومات کا خلاصہ" },
  address: { en: "Full Address", ur: "مکمل پتہ" },
  addressPh: { en: "Enter your full address", ur: "اپنا مکمل پتہ لکھیں" },
  budget: { en: "Medicine Budget", ur: "دوا کا بجٹ" },
  budgetPh: { en: "Enter amount", ur: "رقم لکھیں" },
  report: { en: "Attach Medical Report", ur: "میڈیکل رپورٹ منسلک کریں" },
  reportOpt: { en: "(optional, PDF)", ur: "(اختیاری، PDF)" },
  chooseFile: { en: "Choose PDF File", ur: "PDF فائل منتخب کریں" },
  maxSize: { en: "Max 20MB", ur: "زیادہ سے زیادہ 20MB" },
  fileTooBig: { en: "File is larger than 20MB", ur: "فائل 20MB سے بڑی ہے" },
  filePdfOnly: { en: "Only PDF files are allowed", ur: "صرف PDF فائل منظور ہے" },
  remove: { en: "Remove", ur: "ہٹائیں" },
  consent: {
    en: "I confirm that the above information is correct and I agree to the terms of Hikmat Health consultation.",
    ur: "میں تصدیق کرتا/کرتی ہوں کہ اوپر دی گئی معلومات درست ہیں اور حکمت ہیلتھ مشاورت کی شرائط سے متفق ہوں۔",
  },
  consentRequired: { en: "Please accept to continue", ur: "جاری رکھنے کے لیے منظور کریں" },
  years: { en: "years", ur: "سال" },
  saved: { en: "Draft saved automatically", ur: "مسودہ خود بخود محفوظ ہے" },
  restored: { en: "Your previous answers were restored.", ur: "آپ کے پچھلے جوابات بحال کر دیے گئے ہیں۔" },
  startOver: { en: "Start over", ur: "نئے سرے سے شروع کریں" },
  confirmStartOver: { en: "Clear all answers and start over?", ur: "تمام جوابات مٹا کر نئے سرے سے شروع کریں؟" },
  copyLink: { en: "Copy form link", ur: "فارم کا لنک کاپی کریں" },
  copied: { en: "Link copied!", ur: "لنک کاپی ہو گیا!" },
  close: { en: "Close", ur: "بند کریں" },
  langSwitch: { en: "اردو", ur: "English" },
  successTitle: { en: "Thank you!", ur: "شکریہ!" },
  successText: {
    en: "Your consultation form has been submitted. Hakeem sahab's team will contact you soon.",
    ur: "آپ کا مشاورتی فارم جمع ہو گیا ہے۔ حکیم صاحب کی ٹیم جلد آپ سے رابطہ کرے گی۔",
  },
  submitError: { en: "Could not submit the form. Your answers are saved - please try again.", ur: "فارم جمع نہیں ہو سکا۔ آپ کے جوابات محفوظ ہیں - دوبارہ کوشش کریں۔" },
  newForm: { en: "Fill another form", ur: "نیا فارم بھریں" },
};

export const t = (obj, lang) => (obj && (obj[lang] ?? obj.en)) ?? "";
export const optionLabel = (options, value, lang) => {
  const opt = options?.find((x) => x.value === value);
  return opt ? opt[lang] ?? opt.en : value;
};
