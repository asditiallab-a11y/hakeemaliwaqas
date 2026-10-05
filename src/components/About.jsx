import React from "react";
import { Link } from "react-router-dom";
import { val, pageHref } from "../lib/siteApi";

// Admin > Pages > Home > "Home Page Buttons" (text + page)
const DEFAULTS = [
  ["Treatments", "/treatments"],
  ["Products", "/medicines"],
  ["Profile", "/about"],
];

const About = ({ page }) => {
  const buttons = DEFAULTS.map(([text, link], i) => ({
    label: val(page, `b${i + 1}Text`, text),
    href: pageHref(page?.[`b${i + 1}Page`], link),
    active: i === 0,
  }));

  return (
    <section className="hero-btns-section">
      <div className="container">
        <div className="row g-4 justify-content-center">
          {buttons.map((btn, i) => (
            <div className="col-12 col-md-4" key={i}>
              <Link to={btn.href} className={`hero-btn ${btn.active ? "active" : ""}`}>
                {btn.label}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default About;
