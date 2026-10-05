// Pages screen ka poora config: har tab -> sections -> fields.
// Field types: text (default) | textarea | rich | image | video | select | note
// w: "half" => 2 column grid me aadhi width. d => default value. TODO: defaults API se aayenge.

const LOREM =
  "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.";

export const PAGE_LINKS = [
  ["/", "Home"],
  ["/about", "About / Profile"],
  ["/treatments", "Treatments"],
  ["/medicines", "Products / Medicines"],
  ["/blog", "Blog / Articles"],
  ["/testimonials", "Testimonials"],
  ["/videos", "Videos"],
  ["/contact", "Contact"],
];

// TODO: Medicines API se aayega
export const FOOTER_PRODUCTS = [
  "Giloy (Guduchi)", "Haldi (Turmeric)", "Kalonji (Black Seed)", "Kushta Sona", "Majoon Shadi Course",
  "Neem (Indian Lilac)", "Retha", "Sada Jawaan Course", "Shilajit Extract", "Tulsi (Holy Basil)",
];

const seo = (name, o = {}) => ({
  title: `SEO Settings — ${name}`,
  fields: [
    { k: "seoTitle", label: o.titleLabel ?? "Page Title (Browser Tab & Google)", d: o.title ?? "" },
    { k: "seoDesc", label: o.descLabel ?? "Meta Description (Google Snippet — max 160 characters)", type: "textarea", max: 160, d: o.desc ?? "" },
    { k: "seoKeywords", label: o.kwLabel ?? "Keywords (comma separated)", d: o.kw ?? "" },
  ],
});

const hero = (labelEg, label, title, { video = true, extra } = {}) => ({
  title: "Hero Banner",
  fields: [
    { k: "heroLabel", label: `Label (e.g. ${labelEg})`, w: "half", d: label },
    { k: "heroTitle", label: "Page Title", w: "half", d: title },
    { k: "heroImage", label: "Hero Banner Image", type: "image", size: "1920×1080px", d: "" },
    ...(video ? [{ k: "heroVideo", label: "Hero Video (max 30 seconds)", type: "video", badge: "max 30s · MP4/WebM", d: "" }] : []),
    ...(extra ?? []),
  ],
});

const header3 = (title, d) => ({
  title,
  fields: [
    { k: "secLabel", label: "Section Label", w: "half", d: d[0] },
    { k: "secHeading", label: "Section Heading", w: "half", d: d[1] },
    { k: "secDesc", label: "Section Description", type: "textarea", rows: 2, d: d[2] },
  ],
});

const note = (title, body) => ({ note: { title, body } });

const legal = (name, s) => ({
  sections: [
    seo(name, { title: s.seoTitle, desc: s.seoDesc, kw: s.seoKw, descLabel: "Meta Description (max 160 characters)", titleLabel: "Page Title (Browser Tab & Google)", kwLabel: "Keywords (comma separated)" }),
    {
      title: "Hero Banner",
      fields: [
        { k: "heroLabel", label: "Label (e.g. Legal)", w: "half", d: "Legal" },
        { k: "heroTitle", label: "Page Title", w: "half", d: name },
        { k: "heroImage", label: "Hero Banner Image", type: "image", size: "1920×1080px", d: "" },
      ],
    },
    {
      title: "Intro Card (Above Content)",
      fields: [
        { k: "introHeading", label: "Intro Heading", w: "half", d: s.introHeading },
        { k: "introUpdated", label: "Last Updated Date Text", w: "half", d: "Last updated: April 2026" },
        { k: "introDesc", label: "Intro Description", type: "textarea", rows: 3, d: s.introDesc },
        { k: "introImage", label: "Intro Side Image (shown next to text)", type: "image", size: "800×600px", d: "" },
      ],
    },
    {
      title: "Main Content (Rich Editor)",
      fields: [{ k: "content", label: `${name} Content — full formatting, headings, lists, bold etc.`, type: "rich", minHeight: 260, d: s.content }],
    },
    {
      title: "Bottom CTA Card",
      fields: [
        { k: "ctaHeading", label: "CTA Heading", w: "half", d: s.ctaHeading },
        { k: "ctaButton", label: "CTA Button Text", w: "half", d: "Contact Us" },
        { k: "ctaDesc", label: "CTA Description", type: "textarea", rows: 3, d: s.ctaDesc },
      ],
    },
  ],
});

const PRIVACY_HTML = `<h2>Information We Collect</h2><p>We may collect personal information such as your <strong>name, email address, phone number</strong>, and any health-related information you voluntarily provide when booking a consultation, contacting us, or subscribing to our updates.</p><h2>How We Use Your Information</h2><ul><li>Provide consultations and personalized treatment recommendations</li><li>Respond to your inquiries and appointment requests</li><li>Send you relevant health information and updates (only if you opt in)</li><li>Improve our website and services</li></ul><h2>Information Sharing</h2><p>We do <strong>not</strong> sell, trade, or rent your personal information to third parties. Your health information remains strictly confidential between you and Hakeem Ali Waqas, in accordance with traditional medical ethics.</p><h2>Data Security</h2><p>We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet is 100% secure.</p><h2>Cookies &amp; Tracking</h2><p>Our website uses cookies and analytics tools (such as Google Analytics, Facebook Pixel, and TikTok Pixel) to improve user experience and understand visitor behavior. You can disable cookies in your browser settings.</p><h2>Your Rights</h2><p>You have the right to <em>access, correct, or delete</em> your personal information at any time. To exercise these rights, please contact us through our Contact page.</p><h2>Changes to This Policy</h2><p>We may update this Privacy Policy from time to time. The latest version will always be available on this page.</p>`;

const TERMS_HTML = `<h2>Acceptance of Terms</h2><p>By using this website, booking a consultation, or contacting us, you agree to comply with and be legally bound by these terms. If you do not agree, please do not use our services.</p><h2>Medical Disclaimer</h2><p>The information provided on this website is for <strong>educational and informational purposes only</strong>. It is not a substitute for professional medical advice, diagnosis, or treatment from a qualified healthcare provider. Always consult with a qualified Hakeem or physician before starting any new treatment.</p><h2>Nature of Services</h2><p>Hakeem Ali Waqas provides traditional Unani and herbal medicine consultations. Results may vary from person to person. We do not guarantee specific outcomes, and natural healing is a gradual process that requires patience and consistency.</p><h2>Consultations &amp; Appointments</h2><ul><li>All consultations are scheduled by mutual agreement</li><li>Patients are expected to provide accurate information about their health condition</li><li>Cancellations should be made at least 24 hours in advance whenever possible</li></ul><h2>Use of Website</h2><p>You agree to use this website only for lawful purposes. You may not use the website in any way that could damage, disable, overburden, or impair our services.</p><h2>Intellectual Property</h2><p>All content on this website — including text, images, logos, articles, videos, and herbal formulations — is the property of Hakeem Ali Waqas / Hikmat Health unless otherwise stated. You may not reproduce, distribute, or use any content without written permission.</p><h2>Limitation of Liability</h2><p>Hikmat Health and Hakeem Ali Waqas shall <em>not be liable</em> for any direct, indirect, incidental, or consequential damages arising from the use of our website, services, or products.</p><h2>Governing Law</h2><p>These terms are governed by the laws of Pakistan. Any disputes arising shall be resolved in the courts of Pakistan.</p>`;

const aboutSection = (n, label, heading, text) => ({
  title: `Section ${n}`,
  fields: [
    { k: `s${n}Label`, label: "Section Label", w: "half", d: label },
    { k: `s${n}Heading`, label: "Section Heading", w: "half", d: heading },
    { k: `s${n}Content`, label: "Content", type: "rich", minHeight: 200, d: `<p>${text}</p>` },
    { k: `s${n}Image`, label: "Section Image", type: "image", size: "800×600px", d: "" },
  ],
});

const pairs = (prefix, count, aLabel, bLabel, defaults) =>
  Array.from({ length: count }, (_, i) => [
    { k: `${prefix}${i + 1}A`, label: aLabel(i + 1), w: "half", d: defaults[i]?.[0] ?? "" },
    { k: `${prefix}${i + 1}B`, label: bLabel(i + 1), w: "half", d: defaults[i]?.[1] ?? "" },
  ]).flat();

export const TABS = [
  {
    key: "home", label: "Home",
    sections: [
      seo("Home Page", {
        titleLabel: "Page Title (Browser Tab & Google — e.g. Prof Hakeem Ali Waqas | Natural Healing, lahore)",
        kwLabel: "Keywords (comma separated — e.g. hakeem, unani medicine, herbal treatment, lahore)",
      }),
      {
        title: "Hero Section (Fullscreen Banner)",
        fields: [
          { note: <>Hero Title &amp; Subtitle are managed in the <b>Settings</b> tab. Upload a hero video (max 30s) below, or leave empty to show the image only.</>, inline: true },
          { k: "heroImage", label: "Hero Background Image", type: "image", size: "1920×1080px", d: "" },
          { k: "heroVideo", label: "Hero Video (Upload MP4 / WebM — max 30 seconds)", type: "video", badge: "max 30s · MP4/WebM", d: "" },
        ],
      },
      {
        title: "Home Page Buttons",
        fields: [
          { note: "Hero banner ke neeche 3 buttons. Har button ka text aur page select karein.", inline: true },
          { k: "b1Text", label: "Button 1 — Text", w: "half", d: "Treatments" },
          { k: "b1Page", label: "Button 1 — Page", w: "half", type: "select", options: PAGE_LINKS, d: "/treatments" },
          { k: "b2Text", label: "Button 2 — Text", w: "half", d: "Products" },
          { k: "b2Page", label: "Button 2 — Page", w: "half", type: "select", options: PAGE_LINKS, d: "/medicines" },
          { k: "b3Text", label: "Button 3 — Text", w: "half", d: "Profile" },
          { k: "b3Page", label: "Button 3 — Page", w: "half", type: "select", options: PAGE_LINKS, d: "/about" },
        ],
      },
      {
        title: "About Preview Section",
        fields: [
          { k: "aboutLabel", label: "Section Label", w: "half", d: "About Hakeem Ali Waqas" },
          { k: "aboutHeading", label: "Section Heading", w: "half", d: "A Legacy of Natural Healing" },
          { k: "aboutP1", label: "Paragraph 1", type: "textarea", rows: 3, d: LOREM },
          { k: "aboutP2", label: "Paragraph 2", type: "textarea", rows: 3, d: LOREM },
          { k: "aboutBg", label: "Background Image", type: "image", size: "1280×720px", d: "" },
        ],
      },
      {
        title: "Stats (4 Boxes)",
        fields: [
          { k: "s1v", label: "Stat 1 — Value (e.g. 25+)", w: "half", d: "23+" },
          { k: "s1l", label: "Stat 1 — Label (e.g. Years Experience)", w: "half", d: "Years Experience" },
          { k: "s2v", label: "Stat 2 — Value", w: "half", d: "105K+" },
          { k: "s2l", label: "Stat 2 — Label", w: "half", d: "Patients Treated" },
          { k: "s3v", label: "Stat 3 — Value", w: "half", d: "200+" },
          { k: "s3l", label: "Stat 3 — Label", w: "half", d: "Herbal Formulas" },
          { k: "s4v", label: "Stat 4 — Value", w: "half", d: "150+" },
          { k: "s4l", label: "Stat 4 — Label", w: "half", d: "Treatments" },
        ],
      },
      {
        title: "Feature Cards (3 Cards)",
        fields: [
          { k: "f1t", label: "Card 1 — Title", w: "half", d: "100% Natural" },
          { k: "f1d", label: "Card 1 — Description", w: "half", d: "All our medicines are derived from pure natural herbs and plants" },
          { k: "f2t", label: "Card 2 — Title", w: "half", d: "Holistic Healing" },
          { k: "f2d", label: "Card 2 — Description", w: "half", d: "We treat the whole person, not just the symptoms" },
          { k: "f3t", label: "Card 3 — Title", w: "half", d: "Time-Tested" },
          { k: "f3d", label: "Card 3 — Description", w: "half", d: "Centuries of proven traditional Hikmat knowledge" },
        ],
      },
      {
        title: "Products Section Header",
        fields: [
          { k: "prodLabel", label: "Section Label", w: "half", d: "Our Products" },
          { k: "prodHeading", label: "Section Heading", w: "half", d: "Featured Products" },
          { k: "prodDesc", label: "Section Description", d: "Explore our collection" },
          { k: "prodBadge", label: "Product Badge Text (e.g. 100% Natural)", w: "half", d: "100% Natural" },
        ],
      },
      {
        title: "Treatments Section Header",
        fields: [
          { k: "trLabel", label: "Section Label", w: "half", d: "Our Services" },
          { k: "trHeading", label: "Section Heading", w: "half", d: "Featured Treatments" },
          { k: "trDesc", label: "Section Description", d: "Discover our range of natural healing treatments designed to restore balance and promote wellness" },
        ],
      },
      {
        title: "Testimonials Section Header",
        fields: [
          { k: "teLabel", label: "Section Label", w: "half", d: "Testimonials" },
          { k: "teHeading", label: "Section Heading", w: "half", d: "What Our Patients Say" },
          { k: "teDesc", label: "Section Description", d: "Read about the experiences of those who have benefited from our natural healing approach" },
        ],
      },
      {
        title: "Experience Slider Section",
        fields: [
          { k: "expLabel", label: "Label (small text above)", w: "half", d: "Discover Our Craft" },
          { k: "expHeading", label: "Main Heading", w: "half", d: "Experience the Art of Natural Healing" },
          ...[
            ["OUR TREATMENTS", "/treatments"],
            ["HERBAL MEDICINES", "/medicines"],
            ["BOOK CONSULTATION", "/contact"],
          ].flatMap(([label, link], i) => [
            { k: `p${i + 1}Label`, label: `Panel ${i + 1} — Label`, w: "half", d: label },
            { k: `p${i + 1}Link`, label: `Panel ${i + 1} — Link Page`, badge: "Page Link", w: "half", type: "select", options: PAGE_LINKS, d: link },
            { k: `p${i + 1}Image`, label: `Panel ${i + 1} — Image`, type: "image", size: "600×900px", d: "" },
          ]),
        ],
      },
      {
        title: "CTA (Call To Action) Section",
        fields: [
          { k: "ctaHeading", label: "CTA Heading", w: "half", d: "Begin Your Healing Journey" },
          { k: "ctaText", label: "CTA Text", type: "textarea", rows: 3, d: "Take the first step towards natural wellness. Book a consultation with Hakeem Ali Waqas and discover the power of herbal medicine." },
          { k: "ctaBg", label: "CTA Background Image", type: "image", size: "1920×800px", d: "" },
        ],
      },
    ],
  },
  {
    key: "about", label: "About",
    sections: [
      seo("About Page"),
      hero("Our Story", "Our Story", "About Hakeem Ali Waqas"),
      aboutSection(1, "Who We Are", "A Tradition of Healing Excellence", "Hakeem Ali Waqas is a renowned practitioner of Hikmat, the ancient system of herbal medicine rooted in Greco-Arabic medical tradition. With over 25 years of dedicated practice, he has earned a reputation for providing effective natural treatments."),
      aboutSection(2, "Our Approach", "The Science of Natural Healing", "Hakeem Ali Waqas combines centuries of Unani wisdom with a deep understanding of human physiology. Every treatment is individually tailored, addressing the root cause rather than just the symptoms."),
      aboutSection(3, "Our Vision", "Healing Rooted in Tradition", "We believe in making natural healing accessible to everyone. Our clinic provides a welcoming space where patients can seek guidance, ask questions, and receive personalised care in a comfortable environment."),
      { title: "Established Text (Image Overlay)", fields: [{ k: "established", label: "Established Text", w: "half", d: "Established 1998" }] },
      header3("Values Section Header", ["", "", ""]),
      {
        title: "Values (4 Cards)",
        fields: pairs("val", 4, (n) => `Value ${n} — Title`, (n) => `Value ${n} — Description`, []),
      },
      header3("Journey Section Header", ["Our Journey", "Milestones", "Key moments in our journey of natural healing"]),
      {
        title: "Milestones (4 Timeline Entries)",
        fields: [
          ["1998", "Began Practice", "Started practicing Hikmat after completing traditional training under renowned masters"],
          ["2005", "Clinic Established", "Opened the first dedicated Hikmat clinic in Lahore"],
          ["2012", "Research Initiative", "Launched research into combining traditional Hikmat with modern botanical science"],
          ["2020", "Digital Outreach", "Expanded reach through online consultations and health education programs"],
        ].flatMap(([y, t, d], i) => [
          { k: `m${i + 1}Year`, label: `Milestone ${i + 1} — Year`, w: "half", d: y },
          { k: `m${i + 1}Title`, label: `Milestone ${i + 1} — Title`, w: "half", d: t },
          { k: `m${i + 1}Desc`, label: `Milestone ${i + 1} — Description`, d },
        ]),
      },
    ],
  },
  {
    key: "treatments", label: "Treatments",
    sections: [
      seo("Treatments Page"),
      hero("Our Services", "Our Services", "Natural Treatments"),
      header3("Treatments List Section", ["Healing Naturally", "Our Treatments", "We offer a comprehensive range of natural treatments rooted in traditional Hikmat wisdom"]),
      note("Treatment Cards", <>Individual treatment cards (title, description, image, category) are managed in the <b>Treatments</b> tab.</>),
    ],
  },
  {
    key: "medicines", label: "Medicines",
    sections: [
      seo("Medicines Page"),
      hero("Natural Remedies", "Natural Remedies", "Herbal Medicines"),
      header3("Medicines List Section", ["Our Formulations", "Herbal Medicine Collection", "Each medicine is carefully crafted using traditional recipes and the finest natural ingredients"]),
      note("Medicine Cards", <>Individual medicine cards (name, description, benefits, usage, image) are managed in the <b>Medicines</b> tab.</>),
    ],
  },
  {
    key: "blog", label: "Blog",
    sections: [
      seo("Health Articles Page"),
      hero("Knowledge Hub", "Knowledge Hub", "Health Articles"),
      header3("Articles List Section", ["Health Education", "Latest Articles", "Stay informed with our latest health articles, tips, and insights on natural healing"]),
      note("Blog Articles", <>Individual articles (title, content, excerpt, image) are managed in the <b>Blog / Articles</b> tab.</>),
    ],
  },
  {
    // Testimonials tab ka screenshot nahi mila tha -> Treatments/Medicines wale same pattern par banaya
    key: "testimonials", label: "Testimonials",
    sections: [
      seo("Testimonials Page"),
      hero("Patient Stories", "Patient Stories", "Testimonials"),
      header3("Testimonials List Section", ["Testimonials", "What Our Patients Say", "Read about the experiences of those who have benefited from our natural healing approach"]),
      note("Testimonial Cards", <>Individual testimonials (name, message, rating) are managed in the <b>Testimonials</b> tab.</>),
    ],
  },
  {
    key: "videos", label: "Videos",
    sections: [
      seo("Videos Page"),
      note("Video Content", <>Individual videos (title, YouTube URL, type) are managed in the <b>Videos</b> tab.</>),
    ],
  },
  {
    key: "contact", label: "Contact",
    sections: [
      seo("Contact Page"),
      hero("Get In Touch", "Get In Touch", "Contact Us"),
      {
        title: "Contact Info Section Labels",
        fields: [
          { k: "ciLabel", label: "Section Label", w: "half", d: "Contact Information" },
          { k: "ciHeading", label: "Section Heading", w: "half", d: "Visit Our Clinic" },
        ],
      },
      note("Contact Details (Phone, Email, Address, Hours)", <>These are managed in the <b>Settings</b> tab under "Contact Information". Changes there reflect automatically on the Contact page.</>),
      {
        title: "Clinic Locations (Map Embeds)",
        action: { label: "Save Clinic Locations", message: "Clinic locations saved" },
        fields: [
          ["Ali Dawakhana(Branch No 1)", "Ravi Toll Plaza Shahdara Lahore Pakistan", "+92-301-5959598", "Mon-Sat: 9AM - 7PM"],
          ["Ali Dawakhana(Branch No 2)", "G T Road Ferozewala Shahdara Lahore Pakistan", "+92-311-1033392", "Mon-Sat: 10AM - 7PM"],
        ].flatMap(([name, addr, phone, hours], i) => [
          { k: `c${i + 1}Name`, label: `Clinic ${i + 1} — Name`, w: "half", d: name },
          { k: `c${i + 1}Addr`, label: `Clinic ${i + 1} — Address`, w: "half", d: addr },
          { k: `c${i + 1}Phone`, label: `Clinic ${i + 1} — Phone`, w: "half", d: phone },
          { k: `c${i + 1}Hours`, label: `Clinic ${i + 1} — Opening Hours`, w: "half", d: hours },
          { k: `c${i + 1}Map`, label: `Clinic ${i + 1} — Google Maps Embed URL`, placeholder: "https://www.google.com/maps/embed?pb=...", d: "" },
        ]),
      },
    ],
  },
  {
    key: "footer", label: "Footer",
    sections: [
      {
        title: "Footer CTA Section",
        fields: [
          { k: "ctaHeading", label: "CTA Heading", w: "half", d: "Begin Your Healing Journey" },
          { k: "ctaDesc", label: "CTA Description", type: "textarea", rows: 3, d: "Take the first step towards natural wellness with a personalized consultation." },
        ],
      },
      {
        title: "Featured Products (Shown in Footer)",
        fields: Array.from({ length: 7 }, (_, i) => ({
          k: `prod${i + 1}`, label: `Product ${i + 1}`, badge: "dropdown", type: "select", placeholder: "— Select product —",
          options: FOOTER_PRODUCTS.map((p) => [p, p]), d: "",
        })),
      },
      note("Brand Name, Tagline, Description & Contact Info", <>The footer brand name, tagline, description text, phone, email, address, and social media links are managed in the <b>Settings</b> tab.</>),
    ],
  },
  {
    key: "privacy", label: "Privacy Policy",
    ...legal("Privacy Policy", {
      seoTitle: "Privacy Policy — Hikmat Health",
      seoDesc: "Learn how Hikmat Health collects, uses, and protects your personal information.",
      seoKw: "privacy policy, hikmat health privacy, data protection",
      introHeading: "Your Privacy Matters",
      introDesc: "At Hikmat Health, we are deeply committed to protecting your personal information. This Privacy Policy explains what we collect, how we use it, and the choices you have.",
      content: PRIVACY_HTML,
      ctaHeading: "Have Questions About Your Data?",
      ctaDesc: "If you have any questions about this Privacy Policy or how we handle your information, please reach out to us.",
    }),
  },
  {
    key: "terms", label: "Terms of Service",
    ...legal("Terms of Service", {
      seoTitle: "Terms of Service — Hikmat Health",
      seoDesc: "Read the terms and conditions for using Hikmat Health website and services.",
      seoKw: "terms of service, terms and conditions, hikmat health terms",
      introHeading: "Terms & Conditions",
      introDesc: "By accessing or using our website and services, you agree to be bound by these Terms of Service. Please read them carefully before proceeding.",
      content: TERMS_HTML,
      ctaHeading: "Need Clarification?",
      ctaDesc: "If you have any questions about these terms, please contact us before using our services.",
    }),
  },
];

// Har tab ki default values ek object me: { home: { heroImage: "", ... }, about: {...} }
export const buildDefaults = () =>
  Object.fromEntries(
    TABS.map((t) => [
      t.key,
      Object.fromEntries(
        t.sections.flatMap((s) => (s.fields ?? []).filter((f) => f.k).map((f) => [f.k, f.d ?? ""]))
      ),
    ])
  );
