import { Star } from "lucide-react";
import CategoryList from "../components/CategoryList.jsx";

// TODO: baad me API se replace karenge (sample text placeholder hai)
const items = [
  ["Amna Bibi — Karachi", 5, true, "میرے بچے کو بار بار سانس کی تکلیف اور کھانسی ہوتی تھی، ہم نے حکیم صاحب سے علاج شروع کیا اور اب بہت افاقہ ہے۔"],
  ["Asif Mehmood — Hyderabad", 5, false, "My son had recurrent tonsillitis — 5 to 6 episodes per year. After the treatment he has had none for months."],
  ["Dr. Imran Qureshi — Peshawar", 5, true, "As a medical doctor myself, I was initially sceptical. But the results spoke for themselves."],
  ["Farhan Siddiqui — Islamabad", 5, true, "I came with severe joint pain in both knees — osteoarthritis. Within weeks I could walk comfortably again."],
  ["Hina Perveen — Quetta", 5, true, "میں بہت تھکی رہتی تھی، بال جھڑتے تھے اور سردیوں میں سستی بہت رہتی تھی۔ اب طبیعت بہتر ہے۔"],
  ["Kamran Bashir — Gujranwala", 5, false, "Chronic constipation for 15 years. Tried every laxative. Hakeem sahib's treatment finally worked."],
  ["Muhammad Tariq — Lahore", 5, true, "I had been diabetic for 9 years and was on two medications. My sugar levels are now well controlled."],
  ["Nadia Hussain — Sialkot", 5, false, "ایگزیما کی وجہ سے میرے ہاتھ ہمیشہ سرخ اور کھردرے رہتے تھے۔ اب جلد صاف ہو گئی ہے۔"],
  ["Rashid Ali — Multan", 5, false, "Very professional and caring. The herbal treatment improved my digestion a lot."],
  ["Sana Malik — Faisalabad", 5, false, "I was struggling with skin problems for years. Thankful for the guidance and the medicines."],
  ["Tahir Mehmood — Rawalpindi", 5, false, "Excellent consultation and follow-up. My blood pressure is now normal without side effects."],
  ["Zainab Fatima — Lahore", 5, false, "Highly recommended. Simple diet advice and medicines that really work."],
].map(([title, rating, home, text], i) => ({ id: i + 1, title, rating, text, live: true, home }));

const Stars = ({ n }) => (
  <span className="stars" aria-label={`${n} stars`}>
    {[1, 2, 3, 4, 5].map((i) => (
      <Star key={i} size={14} color="#e0a915" fill={i <= n ? "#f5b301" : "none"} />
    ))}
  </span>
);

const renderSub = (t) => (
  <span className="sub-line">
    <Stars n={t.rating} />
    <span className="sub-quote" dir="auto">· “{t.text}”</span>
  </span>
);

const renderFields = (m, set) => (
  <>
    <label className="field">Rating
      <select value={m.rating} onChange={(e) => set({ ...m, rating: Number(e.target.value) })}>
        {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} stars</option>)}
      </select>
    </label>
    <label className="field">Testimonial
      <textarea dir="auto" rows={4} value={m.text} onChange={(e) => set({ ...m, text: e.target.value })} required />
    </label>
  </>
);

export default function Testimonials() {
  return (
    <CategoryList
      heading="Testimonials"
      singular="testimonial"
      nameLabel="Name"
      titleLabel="Name — City"
      items={items}
      renderSub={renderSub}
      renderFields={renderFields}
      newItem={{ rating: 5, text: "" }}
    />
  );
}
