import React from "react";
import { Link } from "react-router-dom";
import { val } from "../lib/siteApi";


const herbalImg = "/images/treatment.jpg";

const defaultTreatments = [
  {
    id: 1,
    category: "Metabolic",
    title: "Diabetes & Blood Sugar Control",
    description:
      "Hakeem Ali Waqas offers a time-tested herbal protocol for managing Type 2 diabetes. Treatment includes Karela (bitter melon), Methi (fenugreek), ...",
    image: herbalImg,
    link: "/treatments/diabetes-blood-sugar-control",
  },
  {
    id: 2,
    category: "Andrology",
    title: "Men's Health & Vitality",
    description:
      "Hakeem Ali Waqas offers confidential herbal treatment using Ashwagandha, Shilajit, Safed Musli, Kaunj Beej, and Gokshura — all time-tested ...",
    image: herbalImg,
    link: "/treatments/mens-health-vitality",
  },
  {
    id: 3,
    category: "Digestive",
    title: "Digestive Disorders, IBS & Acidity",
    description:
      "Hakeem Ali Waqas prescribes personalised formulas using Ajwain, Licorice root (Mulethi), Triphala, Isabgol, and Pudina to calm inflammation ...",
    image: herbalImg,
    link: "/treatments/digestive-ibs-acidity",
  },
];

// Admin > Pages > Home > "Treatments Section Header"; cards = Treatments jin par "Show on Home Page" on hai
const FeaturedTreatments = ({ page, treatments: live }) => {
  const treatments = live
    ? live.map((t) => ({ id: t.id, category: t.category, title: t.title, description: t.description, image: t.image || herbalImg, link: "/treatments" }))
    : defaultTreatments;
  if (!treatments.length) return null;
  return (
    <section className="ft-section" id="treatments">
      <div className="container ft-container">
        {/* Heading */}
        <div className="row justify-content-center">
          <div className="col-12 col-lg-8 col-xl-7 text-center">
            <span className="ft-label">{val(page, "trLabel", "Our Services")}</span>
            <h2 className="ft-heading">{val(page, "trHeading", "Featured Treatments")}</h2>
            <p className="ft-subheading">
              {val(page, "trDesc", "Discover our range of natural healing treatments designed to restore balance and promote wellness")}
            </p>
            <span className="ft-divider" aria-hidden="true" />
          </div>
        </div>

        {/* Cards */}
        <div className="row ft-cards-row">
          {treatments.map((item) => (
            <div className="col-12 col-md-6 col-lg-4 ft-col" key={item.id}>
              <Link to={item.link} className="ft-card">
                <div className="ft-card-img-wrap">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="ft-card-img"
                    loading="lazy"
                  />
                  {item.category && <span className="ft-tag">{item.category}</span>}
                </div>
                <div className="ft-card-body">
                  <h3 className="ft-card-title">{item.title}</h3>
                  <p className="ft-card-text">{item.description}</p>
                </div>
              </Link>
            </div>
          ))}
        </div>

        {/* Button */}
        <div className="row">
          <div className="col-12 text-center">
            <Link to="/treatments" className="ft-btn">
              <span>View All Treatments</span>
              <svg
                className="ft-btn-arrow"
                width="14"
                height="14"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M2 8h11" />
                <path d="M9 3.5 13.5 8 9 12.5" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedTreatments;
