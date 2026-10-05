// Text testimonials (slider)
// rtl: true karo agar review Urdu mein hai
export const textTestimonials = [
  {
    id: 1, name: "Muhammad Tariq", city: "Lahore", rating: 5, rtl: false,
    text: "I had been diabetic for 9 years and was on two medications. After 3 months of treatment with Hakeem Ali Waqas, my HbA1c came down from 9.1 to 6.8. I have now halved my medication dose under my doctor's supervision. The herbal protocol is detailed, personalised, and it actually works. Highly recommended.",
  },
  {
    id: 2, name: "Amna Bibi", city: "Karachi", rating: 5, rtl: true,
    text: "میرے بچے کو بار بار سانس کی تکلیف اور کھانسی رہتی تھی۔ ہم نے ہر جگہ علاج کروایا مگر آرام نہیں آیا۔ حکیم علی وقاص صاحب کا علاج شروع کیا تو دو ماہ میں میرے بچے کو بہت آرام آیا۔ الحمدللہ آج وہ بالکل ٹھیک ہے۔ شکریہ حکیم صاحب۔",
  },
  {
    id: 3, name: "Farhan Siddiqui", city: "Islamabad", rating: 5, rtl: false,
    text: "I came with severe joint pain in both knees — osteoarthritis diagnosed at age 52. I was told I needed knee replacement surgery. After 8 weeks of Hakeem Sahib's treatment with Shallaki, Ashwagandha and Guggul, I am walking without pain for the first time in years. Surgery postponed indefinitely.",
  },
  // Neeche placeholders hain - inko apne asli reviews se replace karo
  ...Array.from({ length: 7 }, (_, i) => ({
    id: 4 + i, name: "Patient Name", city: "City", rating: 5, rtl: false,
    text: "Yahan patient ka review likho.",
  })),
];

// Video testimonials
// youtubeId: YouTube video ID -> thumbnail automatic aa jayegi
// thumb:     ya apni image do
export const videoTestimonials = [
  { id: 1, name: "M Hafeez", subtitle: "Stomach Ulcer Treatment !...", youtubeId: "", thumb: "/images/testimonial.jpg", link: "#" },
  { id: 2, name: "Female Patient From Narowal", subtitle: "Aurton Ke Banjhpan Ka Ilaj !...", youtubeId: "", thumb: "/images/testimonial.jpg", link: "#" },
  { id: 3, name: "Malik Sultan Car Driver", subtitle: "Joint Pain Relief ! جوڑوں کے درد...", youtubeId: "", thumb: "/images/testimonial.jpg", link: "#" },
  { id: 4, name: "Arif From Feroze Wattwan", subtitle: "Majoon Shadi Course ! معجون...", youtubeId: "", thumb: "/images/testimonial.jpg", link: "#" },
  { id: 5, name: "Attique Ahmad", subtitle: "Male infertility Treatment !...", youtubeId: "", thumb: "/images/testimonial.jpg", link: "#" },
];
