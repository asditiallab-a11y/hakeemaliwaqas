import React from "react";
import { val } from "../lib/siteApi";

const defaultStats = [
  { id: 1, number: "23+", label: "Years Experience" },
  { id: 2, number: "105K+", label: "Patients Treated" },
  { id: 3, number: "200+", label: "Herbal Formulas" },
  { id: 4, number: "150+", label: "Treatments" },
];

const paragraph =
  "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.";

// Admin > Pages > Home > "About Preview Section" + "Stats (4 Boxes)"
const AboutSection = ({ page }) => {
  const stats = defaultStats.map((d) => ({
    id: d.id,
    number: val(page, `s${d.id}v`, d.number),
    label: val(page, `s${d.id}l`, d.label),
  }));
  const bg = val(page, "aboutBg");

  return (
    <section
      className="ab-section"
      id="about"
      style={bg ? { backgroundImage: `linear-gradient(rgba(10, 6, 2, 0.72), rgba(10, 6, 2, 0.72)), url(${bg})` } : undefined}
    >
      <div className="container ab-container">
        <div className="row align-items-center ab-row">
          {/* Left content */}
          <div className="col-12 col-lg-6 ab-left">
            <span className="ab-label">{val(page, "aboutLabel", "About Hakeem Ali Waqas")}</span>
            <h2 className="ab-heading">{val(page, "aboutHeading", "A Legacy of Natural Healing")}</h2>
            <p className="ab-text">{val(page, "aboutP1", paragraph)}</p>
            <p className="ab-text">{val(page, "aboutP2", paragraph)}</p>

            <a href="/about" className="ab-btn">
              <span>Learn More</span>
              <svg
                className="ab-btn-arrow"
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
            </a>
          </div>

          {/* Right stats */}
          <div className="col-12 col-lg-6 ab-right">
            <div className="row ab-stats-row">
              {stats.map((item) => (
                <div className="col-6 ab-stat-col" key={item.id}>
                  <div className="ab-stat">
                    <h3 className="ab-stat-number">{item.number}</h3>
                    <p className="ab-stat-label">{item.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
